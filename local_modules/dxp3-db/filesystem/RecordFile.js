/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db/filesystem
 *
 * NAME
 * RecordFile
 */
const path = require('path');
const packageName = 'dxp3-db' + path.sep + 'filesystem';
const moduleName = 'RecordFile';
const canonicalName = packageName + path.sep + moduleName;

const DatabaseError = require('../DatabaseError');
const RandomAccessFile = require('./RandomAccessFile');
const logging = require('dxp3-logging');

const logger = logging.getLogger(canonicalName);

const RECORD_FILE_HEADER_LENGTH = 128;
const HEADER_VERSION = 1;

class RecordFile {

	/**
	 * @param {String} _filePath 
	 * @param {Number} _recordLength 
	 */
	constructor(_filePath, _recordLength) {
		// Defensive programming...check input...
		if(_filePath === undefined || _filePath === null) {
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		this._filePath = _filePath;
		this._randomAccessFile = null;
		try {
			this._randomAccessFile = new RandomAccessFile(this._filePath);
		} catch(_exception) {
			throw _exception;
		}
		this._headerVersion = HEADER_VERSION;
		this._recordLength = _recordLength;
		this._numberOfRecords = 0;
		this._numberOfDeletedRecords = 0;
		this._lastRecordIndex = 0;
		this._lastDeletedRecordIndex = -1;
	}

	async _readHeader() {
		try {
			let headerElements = await this._randomAccessFile.readNumbers([0,16,32,48,64,80]);
			let headerVersion = headerElements[0];
			let recordLength = headerElements[1];
			let numberOfRecords = headerElements[2];
			let numberOfDeletedRecords = headerElements[3];
			let lastRecordIndex = headerElements[4];
			let lastDeletedRecordIndex = headerElements[5];
			this._headerVersion = headerVersion;
			this._recordLength = recordLength;
			this._numberOfRecords = numberOfRecords;
			this._numberOfDeletedRecords = numberOfDeletedRecords;
			this._lastRecordIndex = lastRecordIndex;
			this._lastDeletedRecordIndex = lastDeletedRecordIndex;
		} catch(_exception) {	
			logger.error('readHeader(): error: ' + _exception);
		}
	}

	async _writeHeader() {
		await this._randomAccessFile.writeNumbers([0,16,32,48,64,80], [this._headerVersion,
																	  this._recordLength,
																	  this._numberOfRecords,
																	  this._numberOfDeletedRecords,
																	  this._lastRecordIndex,
																	  this._lastDeletedRecordIndex]);
	}

	async _writeHeaderNumberOfRecords() {
		await this._randomAccessFile.writeNumbers([32,64], [this._numberOfRecords,
														   this._lastRecordIndex]);
	}
	async _writeHeaderNumberOfDeletedRecords() {
		await this._randomAccessFile.writeNumbers([32,48,80], [this._numberOfRecords,
															  this._numberOfDeletedRecords,
															  this._lastDeletedRecordIndex]);
	}

	async exists() {
		return this._randomAccessFile.exists();
	}

	async getNumberOfRecords() {
		await this._readHeader();
		return this._numberOfRecords;
	}

	async getNumberOfDeletedRecords() {
		await this._readHeader();
		return this._numberOfDeletedRecords;
	}

	async getTotalNumberOfRecords() {
		await this._readHeader();
		return this._lastRecordIndex;
	}

	async appendRecords(_objectArray) {
		await this._readHeader();
		const objectArray = [];
		const offsets = [];
		const recordIndices = [];
		for(let i=0;i < _objectArray.length;i++) {
			// Check if there is a previously deleted record.
			if(this._lastDeletedRecordIndex >= 0) {
				// There is a previously deleted record.
				// We will overwrite the previously deleted record.
				let recordIndex = this._lastDeletedRecordIndex;
				let offset = recordIndex * this._recordLength + RECORD_FILE_HEADER_LENGTH;
				let deletedRecord = await this._randomAccessFile.readObject(offset);
				let previousDeletedRecordIndex = deletedRecord.previousDeletedRecordIndex;
				this._lastDeletedRecordIndex = previousDeletedRecordIndex;
				offsets.push(offset);
				objectArray.push(_objectArray[i]);
				recordIndices.push(recordIndex);
				this._numberOfDeletedRecords--;
				this._numberOfRecords++;
			} else {
				// No previously deleted record.
				// Append the record at the end of the file.
				let recordIndex = this._lastRecordIndex;
				let offset = recordIndex * this._recordLength + RECORD_FILE_HEADER_LENGTH;
				offsets.push(offset);
				objectArray.push(_objectArray[i]);
				recordIndices.push(recordIndex);
				this._lastRecordIndex++;
				this._numberOfRecords++;
			}
		}
		await this._randomAccessFile.writeObjects(offsets, objectArray);
		await this._writeHeader();
		return recordIndices;
	}

	async appendRecord(_object) {
		await this._readHeader();
		let recordIndex = -1;
		// Check if there is a previously deleted record.
		if(this._lastDeletedRecordIndex >= 0) {
			// There is a previously deleted record.
			// We will overwrite the previously deleted record.
			recordIndex = this._lastDeletedRecordIndex;
			let offset = this._lastDeletedRecordIndex * this._recordLength + RECORD_FILE_HEADER_LENGTH;
			let result = await this._randomAccessFile.readObject(offset);
			let previousDeletedRecordIndex = result.previousDeletedRecordIndex;
			this._lastDeletedRecordIndex = previousDeletedRecordIndex;
			await this._randomAccessFile.writeObject(offset, _object);
			this._numberOfDeletedRecords--;
			this._numberOfRecords++;
			await this._writeHeaderNumberOfDeletedRecords();
		} else {
			// No previously deleted record.
			// Append the record at the end of the file.
			recordIndex = this._lastRecordIndex;
			let offset = recordIndex * this._recordLength + RECORD_FILE_HEADER_LENGTH;
			await this._randomAccessFile.writeObject(offset, _object);
			this._lastRecordIndex++;
			this._numberOfRecords++;
			await this._writeHeaderNumberOfRecords();
		}
		return recordIndex;
	}

	async deleteRecords(_indices) {
		await this._readHeader();
		let objects = [];
		let offsets = [];
		for(let i=0;i < _indices.length;i++) {
			let index = _indices[i];
			let offset = index * this._recordLength + RECORD_FILE_HEADER_LENGTH;
			let object = {};
			if(this._lastDeletedRecordIndex >= 0) {
				object.previousDeletedRecordIndex = this._lastDeletedRecordIndex;
			} else {
				object.previousDeletedRecordIndex = -1;
			}
			this._lastDeletedRecordIndex = index;
			this._numberOfDeletedRecords++;
			this._numberOfRecords--;
			objects.push(object);
			offsets.push(offset);
		}
		let result = await this._randomAccessFile.writeObjects(offsets, objects);
		await this._writeHeaderNumberOfDeletedRecords();
		return result;
	}

	async deleteRecord(_index) {
		await this._readHeader();
		let offset = _index * this._recordLength + RECORD_FILE_HEADER_LENGTH;
		let object = {};
		if(this._lastDeletedRecordIndex >= 0) {
			object.previousDeletedRecordIndex = this._lastDeletedRecordIndex;
		} else {
			object.previousDeletedRecordIndex = -1;
		}
		this._lastDeletedRecordIndex = _index;
		let result = await this._randomAccessFile.writeObject(offset, object);
		this._numberOfDeletedRecords++;
		this._numberOfRecords--;
		await this._writeHeaderNumberOfDeletedRecords();
		return result;
	}

	async close() {
		try {
			await this._randomAccessFile.close();
		} catch(_exception) {
			throw _exception;
		}
	}

	async open() {
		logger.trace('open(): start.');
		// Try to open the file.
		// If the file does not exist it will be created.
		try {
			await this._randomAccessFile.open();
		} catch(_exception) {
			logger.error('open(): error: ' + _exception);
			logger.trace('open(): end.');
			throw _exception;
		}
		// Check if the file is empty.
		// If it is empty we write the number of records.
		try {
			let randomAccessFileSize = await this._randomAccessFile.size();
			if(randomAccessFileSize === 0) {
				await this._writeHeader();
			} else { // Read the header.
				await this._readHeader();
			}
		} catch(_exception) {
			logger.error('open(): error: ' + _exception);
			logger.trace('open(): end.');
			throw _exception;
		}
		logger.trace('open(): end.');
	}

	/**
	 * Read the record at a specific offset/index.
	 * If no record is found at that index we return null.
	 */
	async readRecord(_index) {
		// Defensive programming...check input...
		if(_index === undefined || _index === null || _index < 0) {
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		let offset = _index * this._recordLength + RECORD_FILE_HEADER_LENGTH;
		let record = null;
		try {
			record = await this._randomAccessFile.readObject(offset);
		} catch(_exception) {
			logger.error('readRecord(): ' + _exception);
		}
		if(record === undefined || record === null) {
			return null;
		}
		// Check if this is a deleted record.
		// If it is a deleted record we return null.
		if(record.previousDeletedRecordIndex != undefined && record.previousDeletedRecordIndex != null) {
			return null;
		}
		record._index = _index;
		return record;
	}

	/**
	 * Read records at specific offsets/indices.
	 * If no records are found at any of the indices we return an empty array.
	 */
	async readRecords(_indices) {
		// Defensive programming...check input...
		if(_indices === undefined || _indices === null || _indices.length < 0) {
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		let offsets = [];
		for(let i=0;i < _indices.length;i++) {
			let offset = _indices[i] * this._recordLength + RECORD_FILE_HEADER_LENGTH;
			offsets.push(offset);
		}
		let records = [];
		try {
			records = await this._randomAccessFile.readObjects(offsets);
			for(let i=0;i < records.length;i++) {
				let record = records[i];
				// Check if this is a deleted record.
				// If it is a deleted record we return null.
				if(record.previousDeletedRecordIndex != undefined && record.previousDeletedRecordIndex != null) {
					records[i] = null;
				}
				record._index = _indices[i];
			}
		} catch(_exception) {
			logger.error('readRecords(): ' + _exception);
		}
		return records;
	}

	async clear() {
		await this.truncate(0);
	}

	async empty() {
		await this.truncate(0);
	}

	async truncate(_index) {
		// Defensive programming...check input...
		if(_index === undefined || _index === null || _index < 0) {
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		// Reset all the counters.
		this._numberOfRecords = 0;
		this._numberOfDeletedRecords = 0;
		this._lastRecordIndex = 0;
		this._lastDeletedRecordIndex = -1;
		// If we completely empty the file it is a bit easier.
		if(_index === 0) {
			let offset = _index * this._recordLength + RECORD_FILE_HEADER_LENGTH;
			await this._randomAccessFile.truncate(offset);
		} else {
			// We need to truncate the file at a specific offset.
			let offset = _index * this._recordLength + RECORD_FILE_HEADER_LENGTH;
			await this._randomAccessFile.truncate(offset);
			// Next we need to recreate the header.
			// We have to loop through all the records.
			this._lastRecordIndex = _index + 1;
			for(let i = 0; i < _index; i++) {
				let record = await this.readRecord(i);
				// Check if this is a deleted record.
				// We need to recreate the deleted records loop, as it may have been severed due to the truncation.
				if(record.previousDeletedRecordIndex != undefined && record.previousDeletedRecordIndex != null) {
					if(this._lastDeletedRecordIndex >= 0) {
						record.previousDeletedRecordIndex = this._lastDeletedRecordIndex;
						await this.updateRecord(i, record);					
					}
					this._lastDeletedRecordIndex = i;
					this._numberOfDeletedRecords++;
				} else {
					this._numberOfRecords++;
				}
			}
		}
		await this._writeHeader();
	}

	async updateRecord(_index, _object) {
		// Defensive programming...check input...
		if(_index === undefined || _index === null || _index < 0) {
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		let offset = _index * this._recordLength + RECORD_FILE_HEADER_LENGTH;
		let result = await this._randomAccessFile.writeObject(offset, _object);
		return result;
	}
}

module.exports = RecordFile;