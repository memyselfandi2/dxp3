const path = require('path');
const packageName = 'dxp3-db';
const moduleName = 'filesystem' + path.sep + 'FileSystemTable';
const canonicalName = packageName + path.sep + moduleName;

const Column = require('../Column');
const ColumnType = require('../ColumnType');
const StringColumn = require('../StringColumn');
const DatabaseError = require('../DatabaseError');
const DatabaseHash = require('../DatabaseHash');
const FileSystemArrayTableIndex = require('./FileSystemArrayTableIndex');
const FileSystemBPlusTreeTableIndex = require('./FileSystemBPlusTreeTableIndex');
const FileSystemDefaultIndex = require('./FileSystemDefaultIndex');
const FileSystemHashIndex = require('./FileSystemHashIndex');
const RecordFile = require('./RecordFile');
const ResultSet = require('../ResultSet');
const sql = require('dxp3-lang-sql');
const Table = require('../Table');
const UUID = require('dxp3-uuid');
const logging = require('dxp3-logging');
const util = require('dxp3-util');

const Assert = util.Assert;
const logger = logging.getLogger(canonicalName);

const NUMBER_OF_RECORDS = 1003;
const DATA_RECORD_LENGTH = 257;
const INDEX_RECORD_LENGTH = 257;

class FileSystemTable extends Table {
	constructor(_sourceFolder, _uuid, _name, _columns) {
		super(_uuid, _name, _columns);
		this._sourceFolder = _sourceFolder;
		this._dataFilePath = this._sourceFolder + this._uuid + '.def';
		this._dataFile = new RecordFile(this._dataFilePath, DATA_RECORD_LENGTH);
	}

	_getDefaultTableIndex(_columnName) {
		let columnUUID = this._columnNameToUUID.get(_columnName);
		return new FileSystemDefaultIndex(null, "index_" + _columnName, this._uuid, columnUUID, _columnName, this._dataFile);
	}

	async init() {
		logger.trace('init(): start.');
		await this._dataFile.open();
		logger.trace('init(): end.');
	}

	async close() {
		await this._dataFile.close();
	}

	async deleteFrom(_sqlCondition) {
		let result = {
			nRemoved: 0
		}
		let writeLock = null;
		try {
			if(_sqlCondition === undefined || _sqlCondition === null) {
				writeLock = await this._readWriteLock.writeLock(this._uuid);
				let numberOfRecords = await this._dataFile.getNumberOfRecords();
				await this._dataFile.clear();
				for (const [columnName, tableIndexUUID] of this._tableIndexUUIDByColumnName.entries()) {
					let tableIndex = this._tableIndices.get(tableIndexUUID);
					await tableIndex.clear();
				}
				result.nRemoved = numberOfRecords;
			} else {
				let readLock = null;
				let resultSet = [];
				try {
					readLock = await this._readWriteLock.readLock(this._uuid);
					resultSet = await _sqlCondition.evaluateWhere(this);
				} finally {
					if(readLock != null) {
						readLock.release();
					}
				}
				writeLock = await this._readWriteLock.writeLock(this._uuid);
				for(let i=0;i < resultSet.length;i++) {
					let record = resultSet[i];
					this._dataFile.deleteRecord(record._index);
					for (const [columnName, tableIndexUUID] of this._tableIndexUUIDByColumnName.entries()) {
						let tableIndex = this._tableIndices.get(tableIndexUUID);
						await tableIndex.delete(record[columnName], record._index);
					}
				}
				result.nRemoved = resultSet.length;
			}
		} catch(_exception) {
			logger.warn('deleteFrom(...): ' + _exception);
		} finally {
			if(writeLock != null) {
			writeLock.release();
			}
		}
		return result;
	}

	async _createIndexWithColumnUUID(_uuid, _indexName, _columnUUID, _indexType) {
		logger.trace('_createIndexWithColumnUUID(...): start.');
		let tableIndex = null;
		// Which column are we indexing?
		let column = this.getColumnByUUID(_columnUUID);
		// Check if this is an array
		let columnType = column.getType();
		if(columnType.equals(ColumnType.BOOLEAN_ARRAY) ||
		   columnType.equals(ColumnType.DATE_ARRAY) ||
		   columnType.equals(ColumnType.DOUBLE_ARRAY) ||
		   columnType.equals(ColumnType.FLOAT_ARRAY) ||
		   columnType.equals(ColumnType.INTEGER_ARRAY) ||
		   columnType.equals(ColumnType.STRING_ARRAY)) {
			tableIndex = new FileSystemArrayTableIndex(this._sourceFolder, _uuid, _indexName, this, _columnUUID, this._dataFile);
		} else {
			if(_indexType === 'hash index') {
				tableIndex = new FileSystemHashIndex(this._sourceFolder, _uuid, _indexName, this, _columnUUID, this._dataFile);
			} else {
				tableIndex = new FileSystemBPlusTreeTableIndex(this._sourceFolder, _uuid, _indexName, this, _columnUUID, this._dataFile);
			}
		}
		await tableIndex.init();
		logger.trace('_createIndexWithColumnUUID(...): end.');
		return tableIndex;
	}

	async _alterColumn(_currentColumn, _newColumn) {
		let currentType = _currentColumn.getType();
		let newType = _newColumn.getType();
		let newTypeCode = newType.getCode();
		// From anything to String is pretty straightforward.
		if(newType.equals(ColumnType.STRING)) {
			await this._alterToString(_currentColumn.getName());
			return;
		}
		if(newType.equals(ColumnType.BOOLEAN_ARRAY)) {
			// This really only makes sense if the current data type is a boolean or a true/false string.
			await this._alterToBooleanArray(_currentColumn.getName());
			return;
		}
		if(newType.equals(ColumnType.DATE_ARRAY)) {
			// This really only makes sense if the current data type is a date or a date string.
		}
		if(newType.equals(ColumnType.DOUBLE_ARRAY)) {
			// This really only makes sense if the current data type is a double or a number string.
			await this._alterToFloatArray(_currentColumn.getName());
			return;
		}
		if(newType.equals(ColumnType.FLOAT_ARRAY)) {
			// This really only makes sense if the current data type is a float or a number string.
			await this._alterToFloatArray(_currentColumn.getName());
			return;
		}
		if(newType.equals(ColumnType.INTEGER_ARRAY)) {
			// This really only makes sense if the current data type is an integer or a number string.
			await this._alterToIntegerArray(_currentColumn.getName());
			return;
		}
		if(newType.equals(ColumnType.STRING_ARRAY)) {
			await this._alterToStringArray(_currentColumn.getName());
			return;
		}
		if(newType.equals(ColumnType.INTEGER)) {
			// This really only makes sense if the current data type is a number string.
			await this._alterToInteger(_currentColumn.getName());
			return;
		}		
		if(newType.equals(ColumnType.BOOLEAN)) {
			// This really only makes sense if the current data type is a boolean string.
			await this._alterToBoolean(_currentColumn.getName());
			return;
		}		
	}

	async _alterToBooleanArray(_columnName) {
    	// We will have to loop through every record to update the property.
		let totalNumberOfRecords = await this._dataFile.getTotalNumberOfRecords();
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let value = record[_columnName];
			if(value != undefined) {
				record[_columnName] = [];
				if(Array.isArray(value)) {
					for(let i=0;i < value.length;i++) {
						if(typeof value[i] === 'string') {
							let tmpValue = value[i].toLowerCase().trim();
							if(tmpValue === 'true') {
								record[_columnName].push(true);
							} else if(tmpValue === 'false') {
								record[_columnName].push(false);
							} else {
								record[_columnName].push(null);
							}
						} else if(typeof value[i] === 'boolean') {
							record[_columnName].push(value[i]);
						} else {
							record[_columnName].push(null);
						}
					}
				} else if(typeof value === 'string') {
					value = value.toLowerCase().trim();
					if(value === 'true') {
						record[_columnName].push(true);
					} else if(value === 'false') {
						record[_columnName].push(false);
					} else {
						record[_columnName].push(null);
					}
				} else if(typeof value === 'boolean') {
					record[_columnName].push(value);
				} else {
					record[_columnName].push(null);
				}
				await this._dataFile.updateRecord(record._index, record);
			}
		}	    	
	}

	async _alterToBoolean(_columnName) {
    	// We will have to loop through every record to update the property.
		let totalNumberOfRecords = await this._dataFile.getTotalNumberOfRecords();
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let value = record[_columnName];
			if(value != undefined) {
				if(Array.isArray(value)) {
					if(value.length <= 0) {
						record[_columnName] = null;
					} else {
						value = value[0];
						if(typeof value === 'string') {
							value = value.toLowerCase().trim();
							if(value === 'true') {
								record[_columnName] = true;
							} else if(value === 'false') {
								record[_columnName] = false;
							} else {
								record[_columnName] = null;
							}
						} else if(typeof value === 'boolean') {
							record[_columnName] = value;
						} else {
							record[_columnName] = null;
						}
					}
				} else if(typeof value === 'string') {
					value = value.toLowerCase().trim();
					if(value === 'true') {
						record[_columnName] = true;
					} else if(value === 'false') {
						record[_columnName] = false;
					} else {
						record[_columnName] = null;
					}
				} else if(typeof value === 'boolean') {
					record[_columnName] = value;
				} else {
					record[_columnName] = null;
				}
				await this._dataFile.updateRecord(record._index, record);
			}
		}
	}

	async _alterToFloatArray(_columnName) {
    	// We will have to loop through every record to update the property.
		let totalNumberOfRecords = await this._dataFile.getTotalNumberOfRecords();
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let value = record[_columnName];
			if(value != undefined) {
				record[_columnName] = [];
				if(Array.isArray(value)) {
					for(let i=0;i < value.length;i++) {
						if(typeof value[i] === 'string') {
							record[_columnName].push(parseFloat(value[i]));
						} else if(typeof value[i] === 'number') {
							record[_columnName].push(value[i]);
						} else {
							record[_columnName].push(null);
						}
					}
				} else if(typeof value === 'string') {
					record[_columnName].push(parseFloat(value));
				} else if(typeof value === 'number') {
					record[_columnName].push(value);
				} else {
					record[_columnName].push(null);
				}
				await this._dataFile.updateRecord(record._index, record);
			}
		}	    	
	}

	async _alterToIntegerArray(_columnName) {
    	// We will have to loop through every record to update the property.
		let totalNumberOfRecords = await this._dataFile.getTotalNumberOfRecords();
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let value = record[_columnName];
			if(value != undefined) {
				record[_columnName] = [];
				if(Array.isArray(value)) {
					for(let i=0;i < value.length;i++) {
						if(typeof value[i] === 'string') {
							record[_columnName].push(parseInt(value[i]));
						} else if(typeof value[i] === 'number') {
							record[_columnName].push(value[i]);
						} else {
							record[_columnName].push(null);
						}
					}
				} else if(typeof value === 'string') {
					record[_columnName].push(parseInt(value));
				} else if(typeof value === 'number') {
					record[_columnName].push(value);
				} else {
					record[_columnName].push(null);
				}
				await this._dataFile.updateRecord(record._index, record);
			}
		}	    	
	}

	async _alterToStringArray(_columnName) {
    	// We will have to loop through every record to update the property.
		let totalNumberOfRecords = await this._dataFile.getTotalNumberOfRecords();
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let value = record[_columnName];
			if(value != undefined) {
				record[_columnName] = [];
				if(Array.isArray(value)) {
					for(let i=0;i < value.length;i++) {
						record[_columnName].push("" + value[i]);
					}
				} else {
					record[_columnName].push("" + value);
				}
				await this._dataFile.updateRecord(record._index, record);
			}
		}	    	
	}

	async _alterToInteger(_columnName) {
    	// We will have to loop through every record to update the property.
		let totalNumberOfRecords = await this._dataFile.getTotalNumberOfRecords();
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let value = record[_columnName];
			if(value != undefined) {
				if(Array.isArray(value)) {
					if(value.length <= 0) {
						record[_columnName] = null;
					} else {
						value = value[0];
						if(typeof value === 'string') {
							record[_columnName] = parseInt(value);
						} else if(typeof value === 'number') {
							record[_columnName] = value;
						} else {
							record[_columnName] = null;
						}
					}
				} else if(typeof value === 'string') {
					record[_columnName] = parseInt(value);
				} else if(typeof value === 'number') {
					record[_columnName] = value;
				} else {
					record[_columnName] = null;
				}
				await this._dataFile.updateRecord(record._index, record);
			}
		}
	}

	async _alterToString(_columnName) {
    	// We will have to loop through every record to update the property.
		let totalNumberOfRecords = await this._dataFile.getTotalNumberOfRecords();
		for(let i=0;i < totalNumberOfRecords;i++) {
			let record = await this._dataFile.readRecord(i);
			if(record === undefined || record === null) {
				continue;
			}
			if(record._uuid === undefined || record._uuid === null) {
				continue;
			}
			let value = record[_columnName];
			if(value != undefined) {
				if(Array.isArray(value)) {
					record[_columnName] = value.join();
				} else {
					record[_columnName] = "" + value;
				}
				await this._dataFile.updateRecord(record._index, record);
			}
		}	    	
	}

	async _alterColumns(_columns) {
		try {
	    	// Ok lets see...
	    	// Alter columns updates the data type of columns.
	    	// We should attempt to handle data conversions.
	    	// Lets get the current data type.
	        for(let i=0;i < _columns.length;i++) {
	            let newColumn = _columns[i];
	            for(let j=0;j < this._columns.length;j++) {
	                let currentColumn = this._columns[j];
	                if(currentColumn.getName() === newColumn.getName()) {
	                	let newType = newColumn.getType();
	                	await this._alterColumn(currentColumn, newColumn);
	                	break;
	                }
	            }
	        }
		} catch(_exception) {
            logger.warn('alterColumns(...): ' + _exception);
		}
	}

	async _dropColumns(_columnNames) {
		try {
	    	// We will have to loop through every record to delete the property.
			let totalNumberOfRecords = await this._dataFile.getTotalNumberOfRecords();
			for(let i=0;i < totalNumberOfRecords;i++) {
				let record = await this._dataFile.readRecord(i);
				if(record === undefined || record === null) {
					continue;
				}
				if(record._uuid === undefined || record._uuid === null) {
					continue;
				}
				for(let j=0;j < _columnNames.length;j++) {
					delete record[_columnNames[j]];
				}
				await this._dataFile.updateRecord(record._index, record);
			}	    	
		} catch(_exception) {
            logger.warn('_dropColumns(...): ' + _exception);
		}
	}

	async _renameColumns(_currentColumnNames, _newColumnNames) {
		try {
	    	// We will have to loop through every record to update the property.
			let totalNumberOfRecords = await this._dataFile.getTotalNumberOfRecords();
			for(let i=0;i < totalNumberOfRecords;i++) {
				let record = await this._dataFile.readRecord(i);
				if(record === undefined || record === null) {
					continue;
				}
				if(record._uuid === undefined || record._uuid === null) {
					continue;
				}
				for(let j=0;j < _currentColumnNames.length;j++) {
					let value = record[_currentColumnNames[j]];
					if(value != undefined) {
						record[_newColumnNames[j]] = value;
						delete record[_currentColumnNames[j]];
					}
				}
				await this._dataFile.updateRecord(record._index, record);
			}	    	
		} catch(_exception) {
            logger.warn('_renameColumns(...): ' + _exception);
		}
	}

	async desc() {
        let result = '--- ' + this._name + ' ---\n';
        for(let i = 0; i < this._columns.length; i++) {
            let column = this._columns[i];
            result += column.toString() + '\n';
        }
        return result;
	}

	async _insertMany(_array) {
		let result = {
			ids: [],
			nInserted: 0
		};
		try {
			// Our Table parent will have ensured each object in the array has an _uuid property.
			let dataFileRecordIndices = await this._dataFile.appendRecords(_array);
			for(let i=0;i < _array.length;i++) {
				let record = _array[i];
				let dataFileRecordIndex = dataFileRecordIndices[i];
		    	for (const [columnName, tableIndexUUID] of this._tableIndexUUIDByColumnName.entries()) {
		    		let tableIndex = this._tableIndices.get(tableIndexUUID);
					await tableIndex.insert(record[columnName], dataFileRecordIndex);
		    	}
				result.ids.push(record._uuid);
				result.nInserted++;
			}
		} catch(_exception) {
			logger.error('_insertMany(...): ' + _exception);
		} finally {
		}
		return result;
	}

	async _insertOne(_object) {
		let result = {
			ids: [],
			nInserted: 0
		};
		try {
			// Our Table parent will have ensured each _object has an _uuid property.
			let dataFileRecordIndex = await this._dataFile.appendRecord(_object);
			// Next we update our indices (if any).
	    	for (const [columnName, tableIndexUUID] of this._tableIndexUUIDByColumnName.entries()) {
	    		let tableIndex = this._tableIndices.get(tableIndexUUID);
				await tableIndex.insert(_object[columnName], dataFileRecordIndex);
	    	}
			result.ids.push(_object._uuid);
			result.nInserted++;
		} catch(_exception) {
            logger.warn('_insertOne(...): ' + _exception);
		} finally {
		}
		return result;
	}

	async count(_sqlCondition) {
		if(_sqlCondition === undefined || _sqlCondition === null) {
			let numberOfRecords = await this._dataFile.getNumberOfRecords();
			return numberOfRecords;
		}
		let result = await _sqlCondition.evaluateWhere(this);
		return result.length;
	}

	async _selectAll(_orderBy) {
		let resultArray = [];
		try {
			let totalNumberOfRecords = await this._dataFile.getTotalNumberOfRecords();
			for(let i=0;i < totalNumberOfRecords;i++) {
				let object = await this._dataFile.readRecord(i);
				if(object === undefined || object === null) {
					continue;
				}
				if(object._uuid === undefined || object._uuid === null) {
					continue;
				}
				delete object._index;
				resultArray.push(object);
			}
			if(_orderBy != null) {
				resultArray.sort((a,b) => {
					return _orderBy.sort(a,b);
				})
			}
		} catch(_exception) {
		}
		return new ResultSet(resultArray);
	}

	async selectDistinctAll(_orderBy) {
		let resultArray = [];
		try {
			let resultSet = new Set();
	    	let readLock = await this._readWriteLock.readLock(this._uuid);
			let totalNumberOfRecords = await this._dataFile.getTotalNumberOfRecords();
			for(let i=0;i < totalNumberOfRecords;i++) {
				let object = await this._dataFile.readRecord(i);
				if(object === undefined || object === null) {
					continue;
				}
				if(object._uuid === undefined || object._uuid === null) {
					continue;
				}
				delete object._index;
				const objectWithoutID = {...object, _uuid:undefined};
				const jsonWithoutID = JSON.stringify(objectWithoutID);
				if(!resultSet.has(jsonWithoutID)) {
					resultArray.push(object);
					resultSet.add(jsonWithoutID);
				}
			}
			readLock.release();
			if(_orderBy != null) {
				resultArray.sort((a,b) => {
					return _orderBy.sort(a,b);
				})
			}
		} catch(_exception) {
		}
		return new ResultSet(resultArray);
	}

	async selectDistinctSlice(_sqlSelectExpressions, _sqlCondition, _groupBy, _having, _orderBy) {
		if(_sqlSelectExpressions === undefined || _sqlSelectExpressions === null) {
			return selectDistinctSubset(_sqlCondition);
		}
		let resultArray = [];
		try {
			let resultSet = new Set();
			for(let i=0;i < _sqlSelectExpressions.length;i++) {
				_sqlSelectExpressions[i].start(resultArray);
			}
	    	let readLock = await this._readWriteLock.readLock(this._uuid);
			if(_sqlCondition === undefined || _sqlCondition === null) {
				let totalNumberOfRecords = await this._dataFile.getTotalNumberOfRecords();
				for(let i=0;i < totalNumberOfRecords;i++) {
					let object = await this._dataFile.readRecord(i);
					if(object === undefined || object === null) {
						continue;
					}
					if(object._uuid === undefined || object._uuid === null) {
						continue;
					}
					delete object._index;
					object = this._pick(object, _sqlSelectExpressions);
					const objectWithoutID = {...object, _uuid:undefined};
					const jsonWithoutID = JSON.stringify(objectWithoutID);
					if(!resultSet.has(jsonWithoutID)) {
						resultArray.push(object);
						resultSet.add(jsonWithoutID);
					}
				}
			} else {
				let subset = await _sqlCondition.evaluateWhere(this);
				subset = this._cloneArray(subset, _sqlSelectExpressions);
				let numberOfRecords = subset.length;
				for(let i=0;i < numberOfRecords;i++) {
					let object = subset[i];
					const objectWithoutID = {...object, _uuid:undefined};
					const jsonWithoutID = JSON.stringify(objectWithoutID);
					if(!resultSet.has(jsonWithoutID)) {
						delete object._index;
						resultArray.push(object);
						resultSet.add(jsonWithoutID);
					}
				}
			}
			readLock.release();
			for(let i=0;i < _sqlSelectExpressions.length;i++) {
				_sqlSelectExpressions[i].end(resultArray);
			}
			if(_having != null) {
				resultArray = await _having.evaluate(resultArray);
			}
			if(_orderBy != null) {
				resultArray.sort((a,b) => {
					return _orderBy.sort(a,b);
				})
			}
		} catch(_exception) {
		}
		return new ResultSet(resultArray);
	}

	async selectSlice(_sqlSelectExpressions, _sqlCondition, _groupBy, _having, _orderBy) {
		if(_sqlSelectExpressions === undefined || _sqlSelectExpressions === null) {
			return selectSubset(_sqlCondition, _orderBy);
		}
		let resultArray = [];
		try {
			let hasAggregateFunction = false;
			for(let i=0;i < _sqlSelectExpressions.length;i++) {
				let sqlSelectExpression = _sqlSelectExpressions[i];
				if(sqlSelectExpression instanceof sql.SQLAggregateFunction) {
					sqlSelectExpression.start(resultArray);
					hasAggregateFunction = true;
				}
			}
	    	let readLock = await this._readWriteLock.readLock(this._uuid);
			if(_sqlCondition === undefined || _sqlCondition === null) {
				let totalNumberOfRecords = await this._dataFile.getTotalNumberOfRecords();
				for(let i=0;i < totalNumberOfRecords;i++) {
					let object = await this._dataFile.readRecord(i);
					if(object === undefined || object === null) {
						continue;
					}
					if(object._uuid === undefined || object._uuid === null) {
						continue;
					}
					delete object._index;
					let newObject = this._pick(object, _sqlSelectExpressions);
					if(!hasAggregateFunction) {
						resultArray.push(newObject);
					}
				}
			} else {
				let subset = await _sqlCondition.evaluateWhere(this);
				let clonedArray = this._cloneArray(subset, _sqlSelectExpressions);
				if(!hasAggregateFunction) {
					let numberOfRecords = clonedArray.length;
					for(let i=0;i < numberOfRecords;i++) {
						let object = clonedArray[i];
						delete object._index;
						resultArray.push(object);
					}
				}
			}
			readLock.release();
			for(let i=0;i < _sqlSelectExpressions.length;i++) {
				_sqlSelectExpressions[i].end(resultArray);
			}
			if(_having != null) {
				resultArray = await _having.evaluate(resultArray);
			}
			if(_orderBy != null) {
				resultArray.sort((a,b) => {
					return _orderBy.sort(a,b);
				})
			}
		} catch(_exception) {
		}
		return new ResultSet(resultArray);
	}

	async selectDistinctSubset(_sqlCondition, _orderBy) {
		if(_sqlCondition === undefined || _sqlCondition === null) {
			return this.selectDistinctAll(_orderBy);
		}
		let resultArray = [];
		try {
	    	let readLock = await this._readWriteLock.readLock(this._uuid);
			let subset = await _sqlCondition.evaluateWhere(this);
			let numberOfRecords = subset.length;
			for(let i=0;i < numberOfRecords;i++) {
				let object = subset[i];
				const objectWithoutID = {...object, _uuid:undefined};
				const jsonWithoutID = JSON.stringify(objectWithoutID);
				if(!resultSet.has(jsonWithoutID)) {
					delete object._index;
					resultArray.push(object);
					resultSet.add(jsonWithoutID);
				}
			}
			readLock.release();
			if(_orderBy != null) {
				resultArray.sort((a,b) => {
					return _orderBy.sort(a,b);
				})
			}
		} catch(_exception) {
		}
		return new ResultSet(resultArray);
	}

	async selectSubset(_sqlCondition, _orderBy) {
		logger.trace('selectSubset(...): start.');
		let resultArray = [];
		if(_sqlCondition === undefined || _sqlCondition === null) {
			resultArray = this.selectAll(_orderBy);
			logger.trace('selectSubset(...): end.');
			return new ResultSet(resultArray);
		}
		try {
	    	let readLock = await this._readWriteLock.readLock(this._uuid);
			let subset = await _sqlCondition.evaluateWhere(this);
			let numberOfRecords = subset.length;
			for(let i=0;i < numberOfRecords;i++) {
				let object = subset[i];
				delete object._index;
				resultArray.push(object);
			}
			readLock.release();
			if(_orderBy != null) {
				resultArray.sort((a,b) => {
					return _orderBy.sort(a,b);
				})
			}
		} catch(_exception) {

		}
		logger.trace('selectSubset(...): end.');
		return new ResultSet(resultArray);
	}

	async update(_columns, _values, _sqlCondition) {
		if(_columns === undefined || _columns === null) {
			_columns = this._columns;
		}
		let object = {};
		let referencedColumns = new Map();
		for(let i=0;i < _columns.length;i++) {
			let column = _columns[i];
			let columnName = '';
			if(typeof column === 'string') {
				columnName = column;
			} else {
				columnName = column.getName();
			}
			let value = _values[i];
			if(value instanceof sql.SQLColumn) {
				referencedColumns.set(columnName, value.getName());
			} else {
				object[columnName] = value;
			}
		}
		return await this.updateByObject(object, _sqlCondition, referencedColumns);
	}

	async updateByObject(_object, _sqlCondition, _referencedColumns) {
		let result = {
			nUpdated: 0
		}
		let resultSet = [];
		let readLock = null;
		try {
	    	readLock = await this._readWriteLock.readLock(this._uuid);
			if(_sqlCondition === undefined || _sqlCondition === null) {
				let totalNumberOfRecords = await this._dataFile.getTotalNumberOfRecords();
				for(let i=0;i < totalNumberOfRecords;i++) {
					let record = await this._dataFile.readRecord(i);
					if(record === undefined || record === null) {
						continue;
					}
					if(record._uuid === undefined || record._uuid === null) {
						continue;
					}
					let	updatedRecord = {
						...record,
						..._object
					}
					if(_referencedColumns != undefined && _referencedColumns != null && _referencedColumns.size > 0) {
						for(let [key,value] of _referencedColumns) {
							updatedRecord[key] = record[value];
						}
					}
					let recordIndex = record._index;
					delete updatedRecord._index;
			    	let writeLock = null;
			    	try {
			    		writeLock = await this._readWriteLock.writeLock(record._uuid);
						await this._dataFile.updateRecord(recordIndex, updatedRecord);
				    	for (const [columnName, tableIndexUUID] of this._tableIndexUUIDByColumnName.entries()) {
				    		let tableIndex = this._tableIndices.get(tableIndexUUID);
				    		let previousValue = record[columnName];
				    		let updatedValue = updatedRecord[columnName];
				    		if(previousValue !== updatedValue) {
								await tableIndex.delete(previousValue, recordIndex);
								await tableIndex.insert(updatedValue, recordIndex);
							}
				    	}
				    } finally {
				    	if(writeLock != null) {
							writeLock.release();
						}
					}
				}
				result.nUpdated = numberOfRecords;
			} else {
				resultSet = await _sqlCondition.evaluateWhere(this);
				if(resultSet.length <= 0) {
					return result;
				}
				for(let i=0;i < resultSet.length;i++) {
					let record = resultSet[i];
					if(record === undefined || record === null) {
						continue;
					}
					if(record._uuid === undefined || record._uuid === null) {
						continue;
					}
					let updatedRecord = {
						...record,
						..._object
					}
					if(_referencedColumns != undefined && _referencedColumns != null && _referencedColumns.size > 0) {
						for(let [key,value] of _referencedColumns) {
							updatedRecord[key] = record[value];
						}
					}
					let recordIndex = record._index;
					delete updatedRecord._index;
			    	let writeLock = null;
			    	try {
			    		writeLock = await this._readWriteLock.writeLock(record._uuid);
						await this._dataFile.updateRecord(recordIndex, updatedRecord);
				    	for (const [columnName, tableIndexUUID] of this._tableIndexUUIDByColumnName.entries()) {
				    		let tableIndex = this._tableIndices.get(tableIndexUUID);
				    		let previousValue = record[columnName];
				    		let updatedValue = updatedRecord[columnName];
				    		if(previousValue !== updatedValue) {
								await tableIndex.delete(previousValue, recordIndex);
								await tableIndex.insert(updatedValue, recordIndex);
							}
				    	}
				    } finally {
				    	if(writeLock != null) {
							writeLock.release();
						}
					}
				}
				result.nUpdated = resultSet.length;
			}
		} catch(_exception) {
		} finally {
			if(readLock != null) {
				readLock.release();
			}
		}
		return result;
	}

	async updateOne(_object, _sqlCondition) {
		let result = {
			nUpdated: 0
		}
		let readLock = null;
		let writeLock = null;
		try {
			let record = null;
	    	readLock = await this._readWriteLock.readLock(this._uuid);
			if(_sqlCondition === undefined || _sqlCondition === null) {
				// Check if the object has an _uuid property
				let objectUUID = _object._uuid;
				if(objectUUID != undefined && objectUUID != null) {
					const _uuidIndex = this.getSQLTableIndex('_uuid');
					record = await this._uuidIndex.equal(objectUUID);
				}
			} else {
				let resultSet = await _sqlCondition.evaluateWhere(this);
				if(resultSet.length > 0) {
					record = resultSet[0];
				}
			}
			if(record === undefined || record === null) {
				readLock.release();
				return result;
			}
			let updatedRecord = {
				...record,
				..._object
			}
			let recordIndex = record._index;
			delete updatedRecord._index
	    	writeLock = await this._readWriteLock.writeLock(this._uuid);
			await this._dataFile.updateRecord(recordIndex, updatedRecord);
	    	for (const [columnName, tableIndexUUID] of this._tableIndexUUIDByColumnName.entries()) {
	    		let tableIndex = this._tableIndices.get(tableIndexUUID);
	    		let previousValue = record[columnName];
	    		let updatedValue = updatedRecord[columnName];
	    		if(previousValue !== updatedValue) {
					await tableIndex.delete(previousValue, recordIndex);
					await tableIndex.insert(updatedValue, recordIndex);
				}
	    	}
			result.nUpdated = 1;
		} catch(_exception) {
		} finally {
			if(writeLock != null) {
				writeLock.release();
			}
			if(readLock != null) {
				readLock.release();
			}
		}
		return result;
	}

	_cloneArray(_array, _sqlSelectExpressions) {
		let result =  _array.map((_object) => {
 			return this._pick(_object, _sqlSelectExpressions);
		});
		return result;
	}

	_pick(_object, _sqlSelectExpressions) {
		let result = {};
		for(let i=0;i < _sqlSelectExpressions.length;i++) {
			let sqlSelectExpression = _sqlSelectExpressions[i];
			result = sqlSelectExpression.process(_object, result);
		}
		return result;
	}
}

module.exports = FileSystemTable;