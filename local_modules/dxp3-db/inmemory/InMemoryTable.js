/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db/filesystem
 *
 * NAME
 * InMemoryTable
 */
const packageName = 'dxp3-db/inmemory';
const moduleName = 'InMemoryTable';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;

const DatabaseError = require('../DatabaseError');
const InMemoryTableIndex = require('./InMemoryTableIndex');
const ResultSet = require('../ResultSet');
const sql = require('dxp3-lang-sql');
const Table = require('../Table');
const logging = require('dxp3-logging');
const UUID = require('dxp3-uuid');
const util = require('dxp3-util');

const Assert = util.Assert;
const logger = logging.getLogger(canonicalName);

class InMemoryTable extends Table {

	constructor(_uuid, _name, _columns) {
		super(_uuid, _name, _columns);
		this._rows = new Map();
		this._sqlTableIndices = new Map();		
	}

	async init() {
	}

    async _createIndexWithColumnUUID(_uuid, _indexName, _columnUUID) {
		let tableIndex = new InMemoryTableIndex(_uuid, _indexName, this, _columnUUID);
		await tableIndex.init();
		return tableIndex;
	}

    _getDefaultTableIndex(_columnName) {
		let columnUUID = this._columnNameToUUID.get(_columnName);
		return new InMemoryTableIndex(UUID.newInstance(), "index_" + columnUUID, this, columnUUID, _columnName);
    }

    setSQLTableIndex(_columnName, _sqlTableIndex) {
    	this._sqlTableIndices.set(_columnName, _sqlTableIndex);
    }

	async close() {
	}

	async count(_sqlCondition) {
		if(_sqlCondition === undefined || _sqlCondition === null) {
			return this._rows.size;
		}
		let result = await _sqlCondition.evaluateWhere(this);
		return result.length;
	}

	async deleteFrom(_sqlCondition) {
		logger.trace('deleteFrom(...): start.');
		let result = {
			nRemoved: 0
		}
		if(_sqlCondition === undefined || _sqlCondition === null) {
			result.nRemoved = this._rows.size;
			this._rows = new Map();
		} else {
			let resultSet = await _sqlCondition.evaluateWhere(this);
			for(let i=0;i < resultSet.length;i++) {
				this._rows.delete(resultSet[i]._uuid);
			}
			result.nRemoved = resultSet.length;
		}
		logger.trace('deleteFrom(...): end.');
		return result;
	}

	async desc() {
        let result = '--- ' + this._name + ' ---\n';
        for(let i = 0; i < this._columns.length; i++) {
            let column = this._columns[i];
            result += column.toString() + '\n';
        }
        return result;
	}

	async _dropColumns(_columnNames) {
		this._rows.forEach((uuid,record) => {
			for(let i=0;i < _columnNames.length;i++) {
				delete record[_columnNames[i]];
			}			
			this._rows.set(uuid, record);
		});
	}

	async _renameColumns(_from, _to) {
		this._rows.forEach((uuid,record) => {
			for(let j=0;j < _from.length;j++) {
				let value = record[_from[j]];
				if(value != undefined) {
					record[_to[j]] = value;
					delete record[_from[j]];
				}
			}
			this._rows.set(uuid, record);
		});
	}

	async _insertMany(_array) {
		let ids = [];
		let nInserted = 0;
		for(let i=0;i < _array.length;i++) {
			let object = _array[i];
			if(object === undefined || object === null) {
				continue;
			}
			this._rows.set(object._uuid,object);
			ids.push(object._uuid);
			nInserted++;
		}
		let result = {
			ids: ids,
			nInserted: nInserted
		}
		return result;
	}

	async _insertOne(_object) {
		this._rows.set(_object._uuid, _object);
		let result = {
			ids: [_object._uuid],
			nInserted: 1
		};
		return result;
	}

	async _selectAll(_orderBy) {
		let result = Array.from(this._rows.values());
		if(_orderBy != null) {
			result.sort((a,b) => {
				return _orderBy.sort(a,b);
			})
		}
		return new ResultSet(result);
	}

	async selectDistinctAll(_orderBy) {
		let result = [];
		try {
			let resultSet = new Set();
			for(const [key, row] of this._rows) {
				if(row === undefined || row === null) {
					continue;
				}
				const objectWithoutID = {...row, id:undefined, _uuid:undefined};
				const jsonWithoutID = JSON.stringify(objectWithoutID);
				if(!resultSet.has(jsonWithoutID)) {
					result.push(row);
					resultSet.add(jsonWithoutID);
				}
			}
			if(_orderBy != null) {
				result.sort((a,b) => {
					return _orderBy.sort(a,b);
				})
			}
		} catch(_exception) {

		}
		return new ResultSet(result);
	}

	async selectDistinctSlice(_sqlSelectExpressions, _sqlCondition, _groupBy, _having, _orderBy) {
		if(_sqlCondition === undefined || _sqlCondition === null) {
			return new ResultSet(this._cloneArray(Array.from(this._rows.values()), _sqlSelectExpressions));
		}
		let subset = await _sqlCondition.evaluateWhere(this);
		let slice = this._cloneArray(subset, _sqlSelectExpressions);
		if(_orderBy != null) {
			slice.sort((a,b) => {
				return _orderBy.sort(a,b);
			})
		}
		return new ResultSet(slice);
	}

	async selectSlice(_sqlSelectExpressions, _sqlCondition, _groupBy, _having, _orderBy) {
		if(_sqlCondition === undefined || _sqlCondition === null) {
			return new ResultSet(this._cloneArray(Array.from(this._rows.values()), _sqlSelectExpressions));
		}
		let subset = await _sqlCondition.evaluateWhere(this);
		let slice = this._cloneArray(subset, _sqlSelectExpressions);
		if(_orderBy != null) {
			slice.sort((a,b) => {
				return _orderBy.sort(a,b);
			})
		}
		return new ResultSet(slice);
	}

	async selectSubset(_sqlCondition, _orderBy) {
		if(_sqlCondition === undefined || _sqlCondition === null) {
			return this.selectAll();
		}
		let result = _sqlCondition.evaluateWhere(this);
		if(_orderBy != null) {
			result.sort((a,b) => {
				return _orderBy.sort(a,b);
			})
		}
		return new ResultSet(result);
	}

	async selectDistinctSubset(_sqlCondition, _orderBy) {
		if(_sqlCondition === undefined || _sqlCondition === null) {
			return this.selectAll();
		}
		let result = _sqlCondition.evaluateWhere(this);
		if(_orderBy != null) {
			result.sort((a,b) => {
				return _orderBy.sort(a,b);
			})
		}
		return new ResultSet(result);
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
		if(_sqlCondition === undefined || _sqlCondition === null) {
			for(const [recordUUID, record] of this._rows) {
				if(record === undefined || record === null) {
					continue;
				}
				let	updatedRecord = {
					...record,
					..._object
				}
				if(_referencedColumns != undefined && _referencedColumns != null && _referencedColumns.size > 0) {
					for(let [columnName, fromColumnName] of _referencedColumns) {
						updatedRecord[columnName] = record[fromColumnName];
					}
				}
				this._rows.set(recordUUID, updatedRecord);
				result.nUpdated++;
			}
			return result;
		}
		let resultSet = await _sqlCondition.evaluateWhere(this);
		if(resultSet.length <= 0) {
			return result;
		}
		for(let i=0;i < resultSet.length;i++) {
			let record = resultSet[i];
			if(record === undefined || record === null) {
				continue;
			}
			let	updatedRecord = {
				...record,
				..._object
			}
			if(_referencedColumns != undefined && _referencedColumns != null && _referencedColumns.size > 0) {
				for(let [columnName, fromColumnName] of _referencedColumns) {
					updatedRecord[columnName] = record[fromColumnName];
				}
			}
			this._rows.set(record._uuid, updatedRecord);
			result.nUpdated++;
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

module.exports = InMemoryTable;