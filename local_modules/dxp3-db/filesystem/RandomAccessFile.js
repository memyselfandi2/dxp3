/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db/filesystem
 *
 * NAME
 * RandomAccessFile
 */
const path = require('path');
const packageName = 'dxp3-db' + path.sep + 'filesystem';
const moduleName = 'RandomAccessFile';
const canonicalName = packageName + path.sep + moduleName;

const fs = require('fs'); 
const fsPromises = fs.promises;
const fsConstants = fs.constants;
const DatabaseError = require('../DatabaseError');
const logging = require('dxp3-logging');

const logger = logging.getLogger(canonicalName);

const BUFFER_HEADER_LENGTH = 4;

/**
 * @class RandomAccessFile
 * @description
 */
class RandomAccessFile {

	/**
	 * @param {String} _filePath 
	 * @throws {DatabaseError.ILLEGAL_ARGUMENT}
	 */
	constructor(_filePath) {
		// Defensive programming...check input...
		if(_filePath === undefined || _filePath === null) {
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_filePath = _filePath.trim();
		if(_filePath.length <= 0) {
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		this._filePath = _filePath;
		this._fileHandle = null;
	}

	/**
	 * @returns {boolean} true if the file exists, false otherwise.
	 */
	async exists() {
		let result = false;
		try {
			// If anything is wrong with the access an exception will be thrown.
			await fsPromises.access(this._filePath, fsConstants.F_OK);
			// If we arrive here it means the file exists.
			result = true;
		} catch(_exception) {
			// If we arrive here it means the file does not exist.
			// Default result was already false.
		} 
		return result;
	}

	/**
	 * Alias of clear().
	 * @throws {DatabaseError.FILE_NOT_FOUND}
	 */
	async empty() {
		await this.clear();
	}

	/**
	 * Empty the file.
	 * @throws {DatabaseError.FILE_NOT_FOUND}
	 */
	async clear() {
		logger.trace('clear(): start.');
		try {
			await this.truncate(0);
		} catch(_exception) {
			logger.error('clear(): ' + _exception);
			throw _exception;
		} finally {
			logger.trace('clear(): end.');
		}
	}

	/**
	 * @param {Number} _offset 
	 * @throws {DatabaseError.ILLEGAL_ARGUMENT} when _offset is undefined, null or negative.
	 * @throws {DatabaseError.FILE_NOT_FOUND} when the file has not yet been opened and does not exist.
	 * @throws {DatabaseError.INTERNAL_SERVER_ERROR} when the file cannot be opened.
	 */
	async truncate(_offset) {
		logger.trace('truncate(...): start.');
		// Defensive programming...check input...
		if(_offset === undefined || _offset === null || _offset < 0) {
			logger.trace('truncate(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		// Check if the file has not yet been opened.
		// If it has not been opened yet, we will:
		// 1) try to open it,
		// 2) truncate,
		// 3) close it
		let closeAfterTruncate = false;
		if(this._fileHandle === null) {
			closeAfterTruncate = true;
			// Check if the file exists.
			if(!(await this.exists())) {
				logger.warn('truncate(...): file does not exist.');
				logger.trace('truncate(...): end.');
				throw DatabaseError.FILE_NOT_FOUND;
			}
			// Try to open the file.
			try {
				await this.open();
			} catch(_exception) {
				logger.error('truncate(...): ' + _exception);
				logger.trace('truncate(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		try {
			// Truncate the file.	
			await this._fileHandle.truncate(_offset);
		} catch(_exception) {
			logger.error('truncate(...): ' + _exception);
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		} finally {
			if(closeAfterTruncate) {
				try {
					this._fileHandle.close();
				} catch(_exception) {
				} finally {
					this._fileHandle = null;
				}
			}
			logger.trace('truncate(...): end.');
		}
	}

	async close() {
		logger.trace('close(): start.');
		if(this._fileHandle === null) {
			logger.trace('close(): end.');
			return;
		}
		try {
			await this._fileHandle.close();
		} catch(_exception) {
			logger.error('close(): ' + _exception);
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		} finally {
			this._fileHandle = null;
			logger.trace('close(): end.');
		}
	}

	/**
	 * Alias of size().
	 */
	async length() {
		await this.size();
	}

	async size() {
		logger.trace('size(): start.');
		let stats = null;
		try {
			stats = await fsPromises.stat(this._filePath);
		} catch(_exception) {
			logger.warn('size(): ' + _exception);
			throw DatabaseError.FILE_NOT_FOUND;
		} finally {
			logger.trace('size(): end.');
		}
		return stats.size;
	}

	async open() {
		logger.trace('open(): start.');
		try {
			// Open the file for reading and writing.
			this._fileHandle = await fsPromises.open(this._filePath, 'r+');
		} catch(_exception) {
			// Check if the file does not exist.
			if(_exception.code === 'ENOENT') {
				try {
					// Create the file if it does not exist and open it for reading and writing.
					this._fileHandle = await fsPromises.open(this._filePath, 'w+', 0o666);
				} catch(_exception) {
					logger.error('open(): ' + _exception);
					throw DatabaseError.INTERNAL_SERVER_ERROR;
				}
			} else {
				logger.error('open(): ' + _exception);
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		} finally {
			logger.trace('open(): end.');
		}
	}

	async readBuffer(_offset) {
		// Defensive programming...check input...
		if(_offset === undefined || _offset === null || _offset < 0) {
			logger.warn('readBuffer(): offset is invalid.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		let bufferHeader = await this._read(_offset, BUFFER_HEADER_LENGTH);
		let bufferLength = bufferHeader.readUInt32LE(0);
		return this._read(_offset + BUFFER_HEADER_LENGTH, bufferLength);
	}

	async readNumbers(_offsets) {
		const readPromises = [];
		for (let i = 0; i < _offsets.length; i++) {
			readPromises.push(this.readNumber(_offsets[i]));
		}
		try {
			const results = await Promise.all(readPromises);
			return results;
		} catch (_exception) {
			logger.error(`readNumbers(): ${_exception}`);
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		}
	}
	
	async readNumber(_offset) {
		// The readBuffer(...) method will check the _offset argument.
		let buffer = await this.readBuffer(_offset);
		return buffer.readInt32LE(0);
	}

	async readObjects(_offsets) {
		const readPromises = [];
		for (let i = 0; i < _offsets.length; i++) {
			readPromises.push(this.readObject(_offsets[i]));
		}
		try {
			const results = await Promise.all(readPromises);
			return results;
		} catch (_exception) {
			logger.error(`readObjects(): ${_exception}`);
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		}
	}

	async readObject(_offset) {
		try {
			// The readString(...) method will check the _offset argument.
			let objectAsString = await this.readString(_offset);
			return JSON.parse(objectAsString);
		} catch(_exception) {
			logger.warn('readObject(): ' + _exception);
			throw _exception;
		}
	}

	async readString(_offset) {
		// The readBuffer(...) method will check the _offset argument.
		let buffer = await this.readBuffer(_offset);
		return buffer.toString('utf-8');
	}

	async writeBuffer(_offset, _buffer) {
		// Defensive programming...check input...
		if(_offset === undefined || _offset === null || _offset < 0) {
			logger.warn('writeBuffer(): offset is invalid.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		if(_buffer === undefined || _buffer === null) {
			logger.warn('writeBuffer(): buffer is invalid.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		let bufferHeader = Buffer.alloc(BUFFER_HEADER_LENGTH);
		bufferHeader.writeUInt32LE(_buffer.length, 0);
    	let totalBytesWritten = 0;
		let fileOffset = _offset;
		try {
			// --- Write header ---
			let headerBytesWritten = 0;
			let headerToBeWritten = BUFFER_HEADER_LENGTH;
			while (headerToBeWritten > 0) {
				const result = await this._fileHandle.write(bufferHeader, headerBytesWritten, headerToBeWritten, fileOffset);
				headerBytesWritten += result.bytesWritten;
				headerToBeWritten -= result.bytesWritten;
				fileOffset += result.bytesWritten;
				totalBytesWritten += result.bytesWritten;
			}
			// --- Write main buffer ---
			let bufferBytesWritten = 0;
			let bufferToBeWritten = _buffer.length;
			while (bufferToBeWritten > 0) {
				const result = await this._fileHandle.write(_buffer, bufferBytesWritten, bufferToBeWritten, fileOffset);
				bufferBytesWritten += result.bytesWritten;
				bufferToBeWritten -= result.bytesWritten;
				fileOffset += result.bytesWritten;
				totalBytesWritten += result.bytesWritten;
			}
		} catch(_exception) {
			logger.warn('writeBuffer(): ' + _exception);
			throw _exception;
		}
		let result = {
			position: _offset,
			bytesWritten: totalBytesWritten
		}
		return result;
	}

	async writeObjects(_offsets, _objectArray) {
		const writePromises = [];
		for (let i = 0; i < _offsets.length; i++) {
			writePromises.push(this.writeObject(_offsets[i], _objectArray[i]));
		}
		try {
			const results = await Promise.all(writePromises);
			return results;
		} catch (_exception) {
			logger.error(`writeObjects(): ${_exception}`);
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		}
	}	

	async writeObject(_offset, _object) {
		// Defensive programming...check input...
		if(_object === undefined || _object === null) {
			logger.warn('writeObject(): object is invalid.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		let objectAsString = JSON.stringify(_object);
		// The writeString(...) method will check the _offset argument.
		return this.writeString(_offset, objectAsString);
	}

	async writeNumbers(_offsets, _valueArray) {
		const writePromises = [];
		for (let i = 0; i < _offsets.length; i++) {
			writePromises.push(this.writeNumber(_offsets[i], _valueArray[i]));
		}
		try {
			const results = await Promise.all(writePromises);
			return results;
		} catch (_exception) {
			logger.error(`writeNumbers(): ${_exception}`);
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		}
	}	

	async writeNumber(_offset, _value) {
		// Defensive programming...check input...
		if(_value === undefined || _value === null) {
			logger.warn('writeNumber(): value is invalid.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		let buffer = Buffer.alloc(4);
		buffer.writeInt32LE(_value, 0);
		// The writeBuffer(...) method will check the _offset argument.
		return this.writeBuffer(_offset, buffer);
	}

	async writeString(_offset, _string) {
		// Defensive programming...check input...
		if(_string === undefined || _string === null) {
			logger.warn('writeString(): string is invalid.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		let buffer = Buffer.from(_string, 'utf-8');
		// The writeBuffer(...) method will check the _offset argument.
		return this.writeBuffer(_offset, buffer);
	}

	async _read(_offset, _size) {
		// Use alloc for safety - initializes buffer with zeros
		let buffer = Buffer.alloc(_size);
		let bufferOffset = 0;
		let toBeRead = _size;
		let fileOffset = _offset;
		try {
			while(toBeRead > 0) {
				let result = await this._fileHandle.read(buffer, bufferOffset, toBeRead, fileOffset);
				if(result.bytesRead <= 0) {
					// Handle case where read returns 0 or less before completion.
					logger.warn('_read(...): Reached end of file or read error at offset \'' + fileOffset + '\'.');
					throw DatabaseError.END_OF_FILE;
				} else {
					bufferOffset += result.bytesRead;
					toBeRead -= result.bytesRead;
					fileOffset += result.bytesRead;
				}
			}
			return buffer;
		} catch(_exception) {
			throw _exception;
		}
	}
}

module.exports = RandomAccessFile;