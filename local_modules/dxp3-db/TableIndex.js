/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * TableIndex
 */
const packageName = 'dxp3-db';
const moduleName = 'TableIndex';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-db/TableIndex
 */
const logging = require('dxp3-logging');
const sql = require('dxp3-lang-sql');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

/**
 * Represents an index on a table column for efficient data retrieval.
 * This is typically an abstract base class, with specific implementations
 * provided by subclasses for different database types (e.g., in-memory, filesystem).
 * @extends {module:dxp3-lang-sql.SQLTableIndex}
 */
class TableIndex extends sql.SQLTableIndex {

	/**
	* Creates an instance of TableIndex.
	* @param {String} _uuid - The unique identifier of this index.
	* @param {String} _name - The name of this index.
	* @param {String} _tableUUID - The UUID of the table this index belongs to.
	* @param {String} _columnUUID - The UUID of the column this index is built on.
	* @param {string} _type - Optional type of index. Used for persistence and factory creation of subclasses.
	*/
	constructor(_uuid, _name, _tableUUID, _columnUUID, _type) {
		super();
		this._uuid = _uuid;
		this._name = _name;
		this._tableUUID = _tableUUID;
		this._columnUUID = _columnUUID;
		this._type = _type;
	}

	/**
	 * Initializes the table index. This might involve loading data or setting up resources.
	 * @async
	 * @throws {module:dxp3-lang-sql.SQLError.NOT_IMPLEMENTED} This method must be implemented by subclasses.
	 */
	async init() {
		logger.trace('init(...): start.');
		logger.trace('init(...): end.');
		throw sql.SQLError.NOT_IMPLEMENTED;
	}

	/**
	 * Closes the table index, releasing any resources it holds.
	 * @async
	 * @throws {module:dxp3-lang-sql.SQLError.NOT_IMPLEMENTED} This method must be implemented by subclasses.
	 */
	async close() {
		logger.trace('close(...): start.');
		logger.trace('close(...): end.');
		throw sql.SQLError.NOT_IMPLEMENTED;
	}

	/**
	 * Finds document IDs where the indexed column value is between _value1 and _value2 (inclusive).
	 * @async
	 * @param {*} _value1 - The lower bound of the range.
	 * @param {*} _value2 - The upper bound of the range.
	 * @returns {Promise<Array<String>>} A promise that resolves to an array of document IDs.
	 * @throws {module:dxp3-lang-sql.SQLError.NOT_IMPLEMENTED} This method must be implemented by subclasses.
	 */
	async between(_value1, _value2) {
    	throw sql.SQLError.NOT_IMPLEMENTED;
	}

	/**
	 * Finds document IDs where the indexed column value is equal to _value.
	 * @async
	 * @param {*} _value - The value to compare against.
	 * @returns {Promise<Array<String>>} A promise that resolves to an array of document IDs.
	 * @throws {module:dxp3-lang-sql.SQLError.NOT_IMPLEMENTED} This method must be implemented by subclasses.
	 */
	async equal(_value) {
		throw sql.SQLError.NOT_IMPLEMENTED;
	}

	/**
	 * Finds document IDs where the indexed column value is equal to the value in another column.
	 * @async
	 * @param {String} _columnName - The name of the other column to compare against.
	 * @returns {Promise<Array<String>>} A promise that resolves to an array of document IDs.
	 * @throws {module:dxp3-lang-sql.SQLError.NOT_IMPLEMENTED} This method must be implemented by subclasses.
	 */
	async equalColumn(_columnName) {
		throw sql.SQLError.NOT_IMPLEMENTED;
	}

	/**
	 * Finds document IDs where the indexed column value is greater than _value.
	 * @async
	 * @param {*} _value - The value to compare against.
	 * @returns {Promise<Array<String>>} A promise that resolves to an array of document IDs.
	 * @throws {module:dxp3-lang-sql.SQLError.NOT_IMPLEMENTED} This method must be implemented by subclasses.
	 */
	async greater(_value) {
		throw sql.SQLError.NOT_IMPLEMENTED;
	}

	/**
	 * Finds document IDs where the indexed column value is greater than the value in another column.
	 * @async
	 * @param {String} _columnName - The name of the other column to compare against.
	 * @returns {Promise<Array<String>>} A promise that resolves to an array of document IDs.
	 * @throws {module:dxp3-lang-sql.SQLError.NOT_IMPLEMENTED} This method must be implemented by subclasses.
	 */
	async greaterColumn(_columnName) {
		throw sql.SQLError.NOT_IMPLEMENTED;
	}

	/**
	 * Finds document IDs where the indexed column value is greater than or equal to _value.
	 * @async
	 * @param {*} _value - The value to compare against.
	 * @returns {Promise<Array<String>>} A promise that resolves to an array of document IDs.
	 * @throws {module:dxp3-lang-sql.SQLError.NOT_IMPLEMENTED} This method must be implemented by subclasses.
	 */
	async greaterOrEqual(_value) {
		throw sql.SQLError.NOT_IMPLEMENTED;
	}

	/**
	 * Finds document IDs where the indexed column value is greater than or equal to the value in another column.
	 * @async
	 * @param {String} _columnName - The name of the other column to compare against.
	 * @returns {Promise<Array<String>>} A promise that resolves to an array of document IDs.
	 * @throws {module:dxp3-lang-sql.SQLError.NOT_IMPLEMENTED} This method must be implemented by subclasses.
	 */
	async greaterOrEqualColumn(_columnName) {
		throw sql.SQLError.NOT_IMPLEMENTED;
	}

	/**
	 * Finds document IDs where the indexed column value is present in the provided array _values.
	 * @async
	 * @param {Array<*>} _values - An array of values to check against.
	 * @returns {Promise<Array<String>>} A promise that resolves to an array of document IDs.
	 * @throws {module:dxp3-lang-sql.SQLError.NOT_IMPLEMENTED} This method must be implemented by subclasses.
	 */
	async in(_values) {
		throw sql.SQLError.NOT_IMPLEMENTED;
	}

	/**
	 * Finds document IDs where the indexed column value (typically an array) includes _value.
	 * @async
	 * @param {*} _value - The value to check for inclusion.
	 * @returns {Promise<Array<String>>} A promise that resolves to an array of document IDs.
	 * @throws {module:dxp3-lang-sql.SQLError.NOT_IMPLEMENTED} This method must be implemented by subclasses.
	 */
	async includes(_value) {
		throw sql.SQLError.NOT_IMPLEMENTED;
	}

	/**
	 * Finds document IDs where the indexed column value is less than _value.
	 * @async
	 * @param {*} _value - The value to compare against.
	 * @returns {Promise<Array<String>>} A promise that resolves to an array of document IDs.
	 * @throws {module:dxp3-lang-sql.SQLError.NOT_IMPLEMENTED} This method must be implemented by subclasses.
	 */
	async less(_value) {
		throw sql.SQLError.NOT_IMPLEMENTED;
	}

	/**
	 * Finds document IDs where the indexed column value is less than the value in another column.
	 * @async
	 * @param {String} _columnName - The name of the other column to compare against.
	 * @returns {Promise<Array<String>>} A promise that resolves to an array of document IDs.
	 * @throws {module:dxp3-lang-sql.SQLError.NOT_IMPLEMENTED} This method must be implemented by subclasses.
	 */
	async lessColumn(_columnName) {
		throw sql.SQLError.NOT_IMPLEMENTED;
	}

	/**
	 * Finds document IDs where the indexed column value is less than or equal to _value.
	 * @async
	 * @param {*} _value - The value to compare against.
	 * @returns {Promise<Array<String>>} A promise that resolves to an array of document IDs.
	 * @throws {module:dxp3-lang-sql.SQLError.NOT_IMPLEMENTED} This method must be implemented by subclasses.
	 */
	async lessOrEqual(_value) {
		throw sql.SQLError.NOT_IMPLEMENTED;
	}

	/**
	 * Finds document IDs where the indexed column value is less than or equal to the value in another column.
	 * @async
	 * @param {String} _columnName - The name of the other column to compare against.
	 * @returns {Promise<Array<String>>} A promise that resolves to an array of document IDs.
	 * @throws {module:dxp3-lang-sql.SQLError.NOT_IMPLEMENTED} This method must be implemented by subclasses.
	 */
	async lessOrEqualColumn(_columnName) {
		throw sql.SQLError.NOT_IMPLEMENTED;
	}

	/**
	 * Finds document IDs where the indexed column value matches a pattern (SQL LIKE syntax).
	 * @async
	 * @param {String} _value - The pattern to match (e.g., 'abc%', '%xyz', '%def%').
	 * @returns {Promise<Array<String>>} A promise that resolves to an array of document IDs.
	 * @throws {module:dxp3-lang-sql.SQLError.NOT_IMPLEMENTED} This method must be implemented by subclasses.
	 */
	async like(_value) {
		throw sql.SQLError.NOT_IMPLEMENTED;
	}

 	/**
	 * Finds document IDs where the indexed column value is not between _value1 and _value2 (inclusive).
	 * @async
	 * @param {*} _value1 - The lower bound of the range.
	 * @param {*} _value2 - The upper bound of the range.
	 * @returns {Promise<Array<String>>} A promise that resolves to an array of document IDs.
	 * @throws {module:dxp3-lang-sql.SQLError.NOT_IMPLEMENTED} This method must be implemented by subclasses.
	 */
	async notBetween(_value1, _value2) {
    	throw sql.SQLError.NOT_IMPLEMENTED;
    }

	/**
	 * Finds document IDs where the indexed column value is not present in the provided array _values.
	 * @async
	 * @param {Array<*>} _values - An array of values to check against.
	 * @returns {Promise<Array<String>>} A promise that resolves to an array of document IDs.
	 * @throws {module:dxp3-lang-sql.SQLError.NOT_IMPLEMENTED} This method must be implemented by subclasses.
	 */
	async notIn(_values) {
		throw sql.SQLError.NOT_IMPLEMENTED;
    }

	/**
	 * Refreshes the index, potentially rebuilding it based on the current table data.
	 * This is useful after significant data modifications or schema changes.
	 * @async
	 * @throws {module:dxp3-lang-sql.SQLError.NOT_IMPLEMENTED} This method must be implemented by subclasses.
	 */
	async refresh() {
		throw sql.SQLError.NOT_IMPLEMENTED;
	}

	/**
	 * Finds document IDs where the indexed column value is not equal to _value.
	 * @async
	 * @param {*} _value - The value to compare against.
	 * @returns {Promise<Array<String>>} A promise that resolves to an array of document IDs.
	 * @throws {module:dxp3-lang-sql.SQLError.NOT_IMPLEMENTED} This method must be implemented by subclasses.
	 */
	async unequal(_value) {
		throw sql.SQLError.NOT_IMPLEMENTED;
	}

	/**
	 * Finds document IDs where the indexed column value is not equal to the value in another column.
	 * @async
	 * @param {String} _columnName - The name of the other column to compare against.
	 * @returns {Promise<Array<String>>} A promise that resolves to an array of document IDs.
	 * @throws {module:dxp3-lang-sql.SQLError.NOT_IMPLEMENTED} This method must be implemented by subclasses.
	 */
	async unequalColumn(_columnName) {
		throw sql.SQLError.NOT_IMPLEMENTED;
	}

	/*********************************************
	* GETTERS
	********************************************/

	/**
	 * Gets the unique identifier (UUID) of this index.
	 * @returns {String} The UUID.
	 */
	getUUID() {
		return this._uuid;
	}

	/**
	 * Gets the name of this index.
	 * @returns {String} The index name.
	 */
	getName() {
		return this._name;
	}

	/**
	 * Gets the UUID of the table this index belongs to.
	 * @returns {String} The table UUID.
	 */
	getTableUUID() {
		return this._tableUUID;
	}
	
	/**
	 * Gets the UUID of the column this index is built on.
	 * @returns {String} The column UUID.
	 */
	getColumnUUID() {
		return this._columnUUID;
	}

	getType() {
		return this._type;
	}

	/*********************************************
	* SETTERS
	********************************************/

	/**
     * Sets the name of the index.
     * @param {String} _name - The new name for the index.
     */
	set name(_name) {
        this.setName(_name);
    }

	/**
     * Sets the name of the index.
     * @param {String} _name - The new name for the index.
     */
	setName(_name) {
        this._name = _name;
    }

    setType(_type) {
    	this._type = _type;
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print(TableIndex);
   return;
}
module.exports = TableIndex;