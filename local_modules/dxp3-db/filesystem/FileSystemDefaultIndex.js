const path = require('path');
const packageName = 'dxp3-db';
const moduleName = 'filesystem' + path.sep + 'FileSystemDefaultIndex';
const canonicalName = packageName + path.sep + moduleName;

const DatabaseError = require('../DatabaseError');
const RecordFile = require('./RecordFile');
const TableIndex = require('../TableIndex');
const sql = require('dxp3-lang-sql');
const logging = require('dxp3-logging');

const logger = logging.getLogger(canonicalName);

class FileSystemDefaultIndex extends TableIndex {

	constructor(_uuid, _name, _tableUUID, _columnUUID, _columnName, _dataFile) {
		super(_uuid, _name, _tableUUID, _columnUUID);
		this._columnName = _columnName;
        this._dataFile = _dataFile;
	}

	async between(_value1, _value2) {
		let result = [];
		let numberOfRecords = await this._dataFile.getNumberOfRecords();
		let numberOfDeletedRecords = await this._dataFile.getNumberOfDeletedRecords();
		let totalNumberOfRecords = numberOfRecords + numberOfDeletedRecords;
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let recordValue = record[this._columnName];
			if(_value1 <= recordValue <= _value2) {
				result.push(record);
			}
		}
		return result;
	}

	async equal(_value) {
		let result = [];
		let numberOfRecords = await this._dataFile.getNumberOfRecords();
		let numberOfDeletedRecords = await this._dataFile.getNumberOfDeletedRecords();
		let totalNumberOfRecords = numberOfRecords + numberOfDeletedRecords;
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let recordValue = record[this._columnName];
			if(recordValue === _value) {
				result.push(record);
			}
		}
		return result;
    }

	async equalColumn(_columnName) {
		let result = [];
		let numberOfRecords = await this._dataFile.getNumberOfRecords();
		let numberOfDeletedRecords = await this._dataFile.getNumberOfDeletedRecords();
		let totalNumberOfRecords = numberOfRecords + numberOfDeletedRecords;
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let recordValue = record[this._columnName];
			let otherRecordValue = record[_columnName];
			if(recordValue === otherRecordValue) {
				result.push(record);
			}
		}
		return result;
    }

	async greater(_value) {
		let result = [];
		let numberOfRecords = await this._dataFile.getNumberOfRecords();
		let numberOfDeletedRecords = await this._dataFile.getNumberOfDeletedRecords();
		let totalNumberOfRecords = numberOfRecords + numberOfDeletedRecords;
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let recordValue = record[this._columnName];
			if(recordValue === undefined || recordValue === null) {
				continue;
			}
			if(recordValue > _value) {
				result.push(record);
			}
		}
		return result;
    }

	async greaterColumn(_columnName) {
		let result = [];
		let numberOfRecords = await this._dataFile.getNumberOfRecords();
		let numberOfDeletedRecords = await this._dataFile.getNumberOfDeletedRecords();
		let totalNumberOfRecords = numberOfRecords + numberOfDeletedRecords;
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let recordValue = record[this._columnName];
			if(recordValue === undefined || recordValue === null) {
				continue;
			}
			let otherRecordValue = record[_columnName];
			if(otherRecordValue === undefined || otherRecordValue === null) {
				result.push(record);
				continue;
			}
			if(recordValue > otherRecordValue) {
				result.push(record);
			}
		}
		return result;
    }

	async greaterOrEqual(_value) {
		let result = [];
		let numberOfRecords = await this._dataFile.getNumberOfRecords();
		let numberOfDeletedRecords = await this._dataFile.getNumberOfDeletedRecords();
		let totalNumberOfRecords = numberOfRecords + numberOfDeletedRecords;
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let recordValue = record[this._columnName];
			if(recordValue === undefined || recordValue === null) {
				continue;
			}
			if(recordValue >= _value) {
				result.push(record);
			}
		}
		return result;
    }

	async greaterOrEqualColumn(_columnName) {
		let result = [];
		let numberOfRecords = await this._dataFile.getNumberOfRecords();
		let numberOfDeletedRecords = await this._dataFile.getNumberOfDeletedRecords();
		let totalNumberOfRecords = numberOfRecords + numberOfDeletedRecords;
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let recordValue = record[this._columnName];
			if(recordValue === undefined || recordValue === null) {
				continue;
			}
			let otherRecordValue = record[_columnName];
			if(otherRecordValue === undefined || otherRecordValue === null) {
				result.push(record);
				continue;
			}
			if(recordValue >= otherRecordValue) {
				result.push(record);
			}
		}
		return result;
    }

	async in(_values) {
		let result = [];
		let numberOfRecords = await this._dataFile.getNumberOfRecords();
		let numberOfDeletedRecords = await this._dataFile.getNumberOfDeletedRecords();
		let totalNumberOfRecords = numberOfRecords + numberOfDeletedRecords;
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let value = record[this._columnName];
			if(value === undefined || value === null) {
				continue;
			}
			if(_values.includes(value)) {
				result.push(record);
			}
		}
		return result;
    }

    async includes(_value) {
		let result = [];
		let numberOfRecords = await this._dataFile.getNumberOfRecords();
		let numberOfDeletedRecords = await this._dataFile.getNumberOfDeletedRecords();
		let totalNumberOfRecords = numberOfRecords + numberOfDeletedRecords;
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let values = record[this._columnName];
			if(values === undefined || values === null) {
				continue;
			}
			if(values.includes(_value)) {
				result.push(record);
			}
		}
		return result;
    }

	async init() {
	}

	async insert(id, dataFileRecordIndex) {
	}

	async delete(id) {
	}

	async clear() {
	}

	async less(_value) {
		let result = [];
		let numberOfRecords = await this._dataFile.getNumberOfRecords();
		let numberOfDeletedRecords = await this._dataFile.getNumberOfDeletedRecords();
		let totalNumberOfRecords = numberOfRecords + numberOfDeletedRecords;
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let recordValue = record[this._columnName];
			if(recordValue === undefined || recordValue === null) {
				continue;
			}
			if(recordValue < _value) {
				result.push(record);
			}
		}
		return result;
    }

	async lessColumn(_columnName) {
		let result = [];
		let numberOfRecords = await this._dataFile.getNumberOfRecords();
		let numberOfDeletedRecords = await this._dataFile.getNumberOfDeletedRecords();
		let totalNumberOfRecords = numberOfRecords + numberOfDeletedRecords;
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let recordValue = record[this._columnName];
			if(recordValue === undefined || recordValue === null) {
				continue;
			}
			let otherRecordValue = record[_columnName];
			if(otherRecordValue === undefined || otherRecordValue === null) {
				result.push(record);
				continue;
			}
			if(recordValue < otherRecordValue) {
				result.push(record);
			}
		}
		return result;
    }

	async lessOrEqual(_value) {
		let result = [];
		let numberOfRecords = await this._dataFile.getNumberOfRecords();
		let numberOfDeletedRecords = await this._dataFile.getNumberOfDeletedRecords();
		let totalNumberOfRecords = numberOfRecords + numberOfDeletedRecords;
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let recordValue = record[this._columnName];
			if(recordValue === undefined || recordValue === null) {
				continue;
			}
			if(recordValue <= _value) {
				result.push(record);
			}
		}
		return result;
    }

	async lessOrEqualColumn(_columnName) {
		let result = [];
		let numberOfRecords = await this._dataFile.getNumberOfRecords();
		let numberOfDeletedRecords = await this._dataFile.getNumberOfDeletedRecords();
		let totalNumberOfRecords = numberOfRecords + numberOfDeletedRecords;
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let recordValue = record[this._columnName];
			if(recordValue === undefined || recordValue === null) {
				continue;
			}
			let otherRecordValue = record[_columnName];
			if(otherRecordValue === undefined || otherRecordValue === null) {
				result.push(record);
				continue;
			}
			if(recordValue <= otherRecordValue) {
				result.push(record);
			}
		}
		return result;
    }

    async like(_value) {
    	let result = [];
    	_value = '^' + _value.replaceAll('%', '.*').replaceAll('_', '.') + '$';
		let numberOfRecords = await this._dataFile.getNumberOfRecords();
		let numberOfDeletedRecords = await this._dataFile.getNumberOfDeletedRecords();
		let totalNumberOfRecords = numberOfRecords + numberOfDeletedRecords;
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let recordValue = record[this._columnName];
			if(recordValue === undefined || recordValue === null) {
				continue;
			}
			if(recordValue.match(_value)) {
				result.push(record);
			}
		}
		return result;
    }

	async notBetween(_value1, _value2) {
		let result = [];
		let numberOfRecords = await this._dataFile.getNumberOfRecords();
		let numberOfDeletedRecords = await this._dataFile.getNumberOfDeletedRecords();
		let totalNumberOfRecords = numberOfRecords + numberOfDeletedRecords;
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let recordValue = record[this._columnName];
			if(recordValue < _value1 || _value2 < recordValue) {
				result.push(record);
			}
		}
		return result;
	}

	async notIn(_values) {
		let result = [];
		let numberOfRecords = await this._dataFile.getNumberOfRecords();
		let numberOfDeletedRecords = await this._dataFile.getNumberOfDeletedRecords();
		let totalNumberOfRecords = numberOfRecords + numberOfDeletedRecords;
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let value = record[this._columnName];
			if(value === undefined || value === null) {
				continue;
			}
			if(!_values.includes(value)) {
				result.push(record);
			}
		}
		return result;
    }

    async refresh() {
    }

	async unequal(_value) {
		let result = [];
		let numberOfRecords = await this._dataFile.getNumberOfRecords();
		let numberOfDeletedRecords = await this._dataFile.getNumberOfDeletedRecords();
		let totalNumberOfRecords = numberOfRecords + numberOfDeletedRecords;
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let recordValue = record[this._columnName];
			// Special consideration for comparing to undefined or null.
			// When we ask for rows that are != undefined we are asking for rows/objects
			// that have a value in the column. This value can be null.
			// When we ask for rows that are != null we are asking for rows/objects
			// that have a non null value in the column. The column/property must be present.
			// Unfortunately null != undefined returns false.
			if((_value === undefined) && (recordValue === undefined)) {
				continue;
			} else if((_value === null)  && ((recordValue === undefined) || (recordValue === null))) {
				continue;
			} else {
				if(recordValue === undefined) {
					continue;
				}
				if(recordValue === _value) {
					continue;
				}
			}
			result.push(record);
		}
		return result;
    }

	async unequalColumn(_columnName) {
		let result = [];
		let numberOfRecords = await this._dataFile.getNumberOfRecords();
		let numberOfDeletedRecords = await this._dataFile.getNumberOfDeletedRecords();
		let totalNumberOfRecords = numberOfRecords + numberOfDeletedRecords;
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let recordValue = record[this._columnName];
			let otherRecordValue = record[_columnName];
			// Special consideration for comparing to undefined or null.
			// When we ask for rows that are != undefined we are asking for rows/objects
			// that have a value in the column. This value can be null.
			// When we ask for rows that are != null we are asking for rows/objects
			// that have a non null value in the column. The column/property must be present.
			// Unfortunately null != undefined returns false.
			if((otherRecordValue === undefined) && (recordValue === undefined)) {
				continue;
			} else if((otherRecordValue === null)  && ((recordValue === undefined) || (recordValue === null))) {
				continue;
			} else if(recordValue === otherRecordValue) {
				continue;
			}
			result.push(record);
		}
		return result;
    }
}

module.exports = FileSystemDefaultIndex;