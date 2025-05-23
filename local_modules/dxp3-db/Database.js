/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * Database
 */
const packageName = 'dxp3-db';
const moduleName = 'Database';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-db/Database
 */
const BooleanColumn = require('./BooleanColumn');
const BooleanArrayColumn = require('./BooleanArrayColumn');
const Column = require('./Column');
const ColumnType = require('./ColumnType');
const DateColumn = require('./DateColumn');
const DateArrayColumn = require('./DateArrayColumn');
const DoubleColumn = require('./DoubleColumn');
const DoubleArrayColumn = require('./DoubleArrayColumn');
const FloatColumn = require('./FloatColumn');
const FloatArrayColumn = require('./FloatArrayColumn');
const DatabaseError = require('./DatabaseError');
const FileSystemDatabase = require('./filesystem/FileSystemDatabase');
const InMemoryDatabase = require('./inmemory/InMemoryDatabase');
const IntegerColumn = require('./IntegerColumn');
const IntegerArrayColumn = require('./IntegerArrayColumn');
const StringColumn = require('./StringColumn');
const StringArrayColumn = require('./StringArrayColumn');
const logging = require('dxp3-logging');
const sql = require('dxp3-lang-sql');
const util = require('dxp3-util');
const UUID = require('dxp3-uuid');

const Assert = util.Assert;
const logger = logging.getLogger(canonicalName);

class Database extends sql.SQLConnection {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	/**
	 * Constructor for the Database class.
	 * @param {string} _name - The name of the database.
	 * @param {string} _sourceFolder - The source folder for the database (optional).
	 */
	constructor(_name, _sourceFolder) {
		logger.trace('constructor(...): start.');
		super();
		// Defensive programming...check input..
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_name)) {
			logger.warn('constructor(...): _name is undefined, null, empty or not a string.');
			logger.trace('constructor(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		this._name = _name.trim();
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_sourceFolder)) {
			logger.debug('constructor(...): _sourceFolder is undefined, null, empty or not a string.');
			logger.info('Creating in-memory database named \'' + _name + '\'.');
			this._implementation = new InMemoryDatabase(_name);
		} else {
			logger.info('Creating file system database named \'' + _name + '\'.');
			this._implementation = new FileSystemDatabase(_name, _sourceFolder);
		}
		this._initialized = false;
		logger.info('Name         : \'' + this._name + '\'.');
		logger.trace('constructor(...): end.');
	}

    /*********************************************
     * PRIVATE METHODS
     ********************************************/
	
	_createColumn(_columnName, _dataType, _columnLength) {
		let column = null;
		let columnType = null;
		if(_dataType === undefined || _dataType === null) {
			logger.warn('_createColumn(...): Unable to add a column with an undefined data type.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		try {
			columnType = ColumnType.parse(_dataType);
		} catch(_exception) {
			logger.warn('_createColumn(...): Unable to create a column with an unknown data type \'' + _dataType + '\'.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		let columnUUID = UUID.new();
		if(columnType.equals(ColumnType.BOOLEAN)) {
			column = new BooleanColumn(columnUUID, _columnName);
		} else if(columnType.equals(ColumnType.BOOLEAN_ARRAY)) {
			column = new BooleanArrayColumn(columnUUID, _columnName);
		} else if(columnType.equals(ColumnType.DATE)) {
			column = new DateColumn(columnUUID, _columnName);
		} else if(columnType.equals(ColumnType.DATE_ARRAY)) {
			column = new DateArrayColumn(columnUUID, _columnName);
		} else if(columnType.equals(ColumnType.DOUBLE)) {
			column = new DoubleColumn(columnUUID, _columnName);
		} else if(columnType.equals(ColumnType.DOUBLE_ARRAY)) {
			column = new DoubleArrayColumn(columnUUID, _columnName);
		} else if(columnType.equals(ColumnType.FLOAT)) {
			column = new FloatColumn(columnUUID, _columnName);
		} else if(columnType.equals(ColumnType.FLOAT_ARRAY)) {
			column = new FloatArrayColumn(columnUUID, _columnName);
		} else if(columnType.equals(ColumnType.INTEGER)) {
			column = new IntegerColumn(columnUUID, _columnName);
		} else if(columnType.equals(ColumnType.INTEGER_ARRAY)) {
			column = new IntegerArrayColumn(columnUUID, _columnName);
		} else if(columnType.equals(ColumnType.STRING)) {
			// We need to check if the a string length was specified.
			if(_columnLength === undefined || _columnLength === null) {
				_columnLength = null;
			}
			column = new StringColumn(columnUUID, _columnName, _columnLength);
		} else if(columnType.equals(ColumnType.STRING_ARRAY)) {
			// We need to check if the a string length was specified.
			if(_columnLength === undefined || _columnLength === null) {
				_columnLength = null;
			}
			column = new StringArrayColumn(columnUUID, _columnName, _columnLength);
		}
		return column;
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	/**
	 * Alias for the createIndex() method.
	 * @param {string} _indexName - The name of the index.
	 * @param {string} _tableName - The name of the table.
	 * @param {string} _columnName - The name of the column.
	 * @param {string} _indexType - The type of index. One of hash or b+tree.
	 * 								default is b+tree.
	 * @returns {void}
	 */
	async addIndex(_indexName, _tableName, _columnName, _indexType) {
		this.createIndex(_indexName, _tableName, _columnName, _indexType);
	}

	/**
	 * Alias for the createSequence() method.
	 * @param {string} _sequenceName - The name of the sequence.
	 * @returns {void}
	 */
	async addSequence(_sequenceName) {
		this.createSequence(_sequenceName);
	}

	/**
	 * Alias for the createTable() method.
	 * The optional columns must be an array of objects.
	 * Each object should contain the following properties:
	 * - name: The name of the column.
	 * - dataType: The data type of the column (e.g., 'string', 'integer', 'boolean', etc.).
	 * - length: The length of the column (optional, only for string columns).
	 * 
	 * @param {string} _tableName - The name of the table.
	 * @param {Array<Object>} _columns - The columns of the table (optional).
	 * @returns {void}
	 */
	async addTable(_tableName, _columns) {
		this.createTable(_tableName, _columns);
	}

	/**
	 * Adds columns to an existing table.
	 * The columns can be passed as an array of objects or a single object.
	 * The object should contain the following properties:
	 * - name: The name of the column.
	 * - dataType: The data type of the column (e.g., 'string', 'integer', 'boolean', etc.).
	 * - length: The length of the column (optional, only for string columns).
	 * 
	 * @param {string} _tableName - The name of the table.
	 * @param {Object|Array<Object>} _columns - The column(s) to add.
	 * @throws {DatabaseError} - Throws an error if the table does not exist or if the columns are invalid.
	 * @returns {void}
	 */
	async alterTableAddColumns(_tableName, _columns) {
		logger.trace('alterTableAddColumns(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_tableName)) {
			logger.warn('alterTableAddColumns(...): _tableName is undefined, null, empty or not a string.');
			logger.trace('alterTableAddColumns(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(!this.isInitialized()) {
			logger.debug('alterTableAddColumns(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('alterTableAddColumns(...): ' + _exception);
				logger.trace('alterTableAddColumns(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		// Check if there are any columns to add.
		if(_columns === undefined || _columns === null) {
			logger.debug('alterTableAddColumns(...): _columns is undefined, or null.');
			logger.trace('alterTableAddColumns(...): end.');
			return;
		}
		if(!Array.isArray(_columns)) {
			// Maybe it is a single column.
			if(_columns instanceof Object) {
				_columns = [_columns];
			} else {
				logger.warn('alterTableAddColumns(...): _columns is not a single column, nor an array.');
				logger.trace('alterTableAddColumns(...): end.');
				throw DatabaseError.ILLEGAL_ARGUMENT;
			}
		}
		if(_columns.length <= 0) {
			logger.debug('alterTableAddColumns(...): _columns is an empty array.');
			logger.trace('alterTableAddColumns(...): end.');
			return;
		}
		// Translate columns to proper dxp3-db/Column objects.
		let columns = [];
		for(let i=0;i < _columns.length;i++) {
			let column = _columns[i];
			let columnName = column.name;
			if(columnName === undefined || columnName === null) {
				logger.warn('alterTableAddColumns(...): Unable to add a column with an undefined name.');
				continue;
			}
			columnName = columnName.trim();
			if(columnName.length <= 0) {
				logger.warn('alterTableAddColumns(...): Unable to add a column with an empty name.');
				continue;
			}
			let dataType = column.dataType;
			try {
				column = this._createColumn(columnName, dataType, column.length);
			} catch(_exception) {
				logger.warn('alterTableAddColumns(...): ' + _exception + '.');
				continue;
			}
			columns.push(column);
		}
		try {
			await this._implementation.alterTableAddColumns(_tableName, columns);
		} catch(_exception) {
			logger.error('alterTableAddColumns(...): ' + _exception);
			throw _exception;
		} finally {
			logger.trace('alterTableAddColumns(...): end.');
		}
	}

	/**
	 * Alters columns of an existing table.
	 * @param {string} _tableName - The name of the table.
	 * @param {Array} _columns - The columns to alter.
	 * @returns {void}
	 */
	async alterTableAlterColumns(_tableName, _columns) {
		logger.trace('alterTableAlterColumns(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_tableName)) {
			logger.warn('alterTableAlterColumns(...): _tableName is undefined, null, empty or not a string.');
			logger.trace('alterTableAlterColumns(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(!this.isInitialized()) {
			logger.debug('alterTableAlterColumns(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('alterTableAlterColumns(...): ' + _exception);
				logger.trace('alterTableAlterColumns(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		// Check if there are any columns to alter.
		if(_columns === undefined || _columns === null) {
			logger.debug('alterTableAlterColumns(...): _columns is undefined, or null.');
			logger.trace('alterTableAlterColumns(...): end.');
			return;
		}
		if(!Array.isArray(_columns)) {
			// Maybe it is a single column.
			if(_columns instanceof Object) {
				_columns = [_columns];
			} else {
				logger.warn('alterTableAlterColumns(...): _columns is not a single column, nor an array.');
				logger.trace('alterTableAlterColumns(...): end.');
				throw DatabaseError.ILLEGAL_ARGUMENT;
			}
		}
		if(_columns.length <= 0) {
			logger.debug('alterTableAlterColumns(...): _columns is an empty array.');
			logger.trace('alterTableAlterColumns(...): end.');
			return;
		}
		// Translate columns to proper columns
		let columns = [];
		for(let i=0;i < _columns.length;i++) {
			let column = _columns[i];
			let columnName = column.name;
			if(columnName === undefined || columnName === null) {
				logger.debug('alterTableAlterColumns(...): Unable to alter a column with an undefined name.');
				continue;
			}
			columnName = columnName.trim();
			if(columnName.length <= 0) {
				logger.debug('alterTableAlterColumns(...): Unable to alter a column with an empty name.');
				continue;
			}
			let dataType = column.dataType;
			try {
				column = this._createColumn(columnName, dataType, column.length);
			} catch(_exception) {
				logger.error('alterTableAlterColumns(...): Unknown data type \'' + dataType + '\'.');
				continue;
			}
			columns.push(column);
		}
		try {
			await this._implementation.alterTableAlterColumns(_tableName, columns);
		} catch(_exception) {
			logger.error('alterTableAlterColumns(...): ' + _exception);
			throw _exception;
		} finally {
			logger.trace('alterTableAlterColumns(...): end.');
		}
	}

	/**
	 * Drops columns from an existing table.
	 * @param {string} _tableName - The name of the table.
	 * @param {Array|String} _columnNames - The columns to drop. This can be an array or a comma separated string.
	 * @returns {void}
	 */
	async alterTableDropColumns(_tableName, _columnNames) {
		logger.trace('alterTableDropColumns(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_tableName)) {
			logger.warn('alterTableDropColumns(...): _tableName is undefined, null, empty or not a string.');
			logger.trace('alterTableDropColumns(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(!this.isInitialized()) {
			logger.debug('alterTableDropColumns(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('alterTableDropColumns(...): ' + _exception);
				logger.trace('alterTableDropColumns(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		// Check if there are any columns to drop.
		if(_columnNames === undefined || _columnNames === null) {
			logger.debug('alterTableDropColumns(...): _columnNames is undefined, or null.');
			logger.trace('alterTableDropColumns(...): end.');
			return;
		}
		if(!Array.isArray(_columnNames)) {
			// Maybe it is a single column.
			if(_columnNames instanceof Object) {
				_columnNames = [_columnNames];
			} else if(typeof _columnNames === 'string') {
				_columnNames = _columnNames.split(',');
			} else {
				logger.warn('alterTableDropColumns(...): _columnNames is not a single column, a string, nor an array.');
				logger.trace('alterTableDropColumns(...): end.');
				throw DatabaseError.ILLEGAL_ARGUMENT;
			}
		}
		if(_columnNames.length <= 0) {
			logger.debug('alterTableAlterColumns(...): _columns is an empty array.');
			logger.trace('alterTableAlterColumns(...): end.');
			return;
		}
		let columnNames = [];
		for(let i=0;i < _columnNames.length;i++) {
			let column = _columnNames[i];
			let columnName = null;
			if(typeof column === 'string') {
				columnName = column;
			} else if(column instanceof Object) {
				columnName = column.name;
			} else {
				continue;
			}
			if(columnName === undefined || columnName === null) {
				logger.debug('alterTableDropColumns(...): Unable to drop a column with an undefined name.');
				continue;
			}
			columnName = columnName.trim();
			if(columnName.length <= 0) {
				logger.debug('alterTableDropColumns(...): Unable to drop a column with an empty name.');
				continue;
			}
			columnNames.push(columnName);
		}
		try {
			await this._implementation.alterTableDropColumns(_tableName, columnNames);
		} catch(_exception) {
			logger.error('alterTableDropColumns(...): ' + _exception);
			throw _exception;
		} finally {
			logger.trace('alterTableDropColumns(...): end.');
		}
	}

	/**
	 * Renames columns of an existing table.
	 * @param {String} _tableName - The name of the table.
	 * @param {String|Array<String>} _from - The current name of the column(s).
	 * @param {String|Array<String>} _to - The new name of the column(s).
	 * @returns {void}
	 */
	async alterTableRenameColumns(_tableName, _from, _to) {
		logger.trace('alterTableRenameColumns(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_tableName)) {
			logger.warn('alterTableRenameColumns(...): _tableName is undefined, null, empty or not a string.');
			logger.trace('alterTableRenameColumns(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(!this.isInitialized()) {
			logger.debug('alterTableRenameColumns(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('alterTableRenameColumns(...): ' + _exception);
				logger.trace('alterTableRenameColumns(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		// Check if there are any columns to rename.
		if(_from === undefined || _from === null) {
			logger.debug('alterTableRenameColumns(...): _from is undefined, or null.');
			logger.trace('alterTableRenameColumns(...): end.');
			return;
		}
		if(_to === undefined || _to === null) {
			logger.debug('alterTableRenameColumns(...): _to is undefined, or null.');
			logger.trace('alterTableRenameColumns(...): end.');
			return;
		}
		if(!Array.isArray(_from)) {
			// Maybe it is a single column.
			if(_from instanceof Object) {
				_from = [_from];
			} else if(typeof _from === 'string') {
				_from = _from.split(',');
			} else {
				logger.warn('alterTableRenameColumns(...): _from is not a single column, a string, nor an array.');
				logger.trace('alterTableRenameColumns(...): end.');
				throw DatabaseError.ILLEGAL_ARGUMENT;
			}
		}
		if(!Array.isArray(_to)) {
			// Maybe it is a single column.
			if(_to instanceof Object) {
				_to = [_to];
			} else if(typeof _to === 'string') {
				_to = _to.split(',');
			} else {
				logger.warn('alterTableRenameColumns(...): _to is not a single column, a string, nor an array.');
				logger.trace('alterTableRenameColumns(...): end.');
				throw DatabaseError.ILLEGAL_ARGUMENT;
			}
		}
		if(_from.length <= 0) {
			logger.debug('alterTableRenameColumns(...): _from is an empty array.');
			logger.trace('alterTableRenameColumns(...): end.');
			return;
		}
		if(_to.length <= 0) {
			logger.debug('alterTableRenameColumns(...): _to is an empty array.');
			logger.trace('alterTableRenameColumns(...): end.');
			return;
		}
		let fromNames = [];
		let toNames = [];
		for(let i=0;i < _from.length;i++) {
			let fromName = _from[i];
			if(fromName instanceof sql.SQLColumn) {
				fromName = fromName.getName();
			} else if(fromName instanceof Object) {
				fromName = fromName.name;
			}
			if(fromName === undefined || fromName === null) {
				continue;
			}
			fromName = fromName.trim();
			if(fromName.length <= 0) {
				continue;
			}
			fromNames.push(fromName);
			let toName = _to[i];
			if(toName instanceof sql.SQLColumn) {
				toName = toName.getName();
			} else if(toName instanceof Object) {
				toName = toName.name;
			}
			if(toName === undefined || toName === null) {
				continue;
			}
			toName = toName.trim();
			if(toName.length <= 0) {
				continue;
			}
			toNames.push(toName);
		}
		if(fromNames.length != toNames.length) {
			logger.debug('alterTableRenameColumns(...): _from and _to are not the same length.');
			logger.trace('alterTableRenameColumns(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		try {
			await this._implementation.alterTableRenameColumns(_tableName, fromNames, toNames);
		} catch(_exception) {
			logger.error('alterTableRenameColumns(...): ' + _exception);
			throw _exception;
		} finally {
			logger.trace('alterTableRenameColumns(...): end.');
		}
	}

	/**
	 * Closes the database.
	 * @throws {DatabaseError} - Throws an error if the database could not be properly closed.
	 */
	async close() {
		logger.trace('close(): start.');
		try {
			await this._implementation.close();
			this._initialized = false;
		} catch(_exception) {
			logger.error('close(): ' + _exception);
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		} finally {
			logger.trace('close(): end.');
		}
	}

	/**
	 * Alias for the init() method.
	 * @returns {Promise<void>}
	 */
	async connect() {
		return this.init();
	}

	async count(_tableName, _sqlCondition) {
		logger.trace('count(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_tableName)) {
			logger.warn('count(...): _tableName is undefined, null, empty or not a string.');
			logger.trace('count(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(!this.isInitialized()) {
			logger.debug('count(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('count(...): ' + _exception);
				logger.trace('count(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		if(_sqlCondition != undefined && _sqlCondition != null) {
			if(typeof _sqlCondition === 'string') {
				let sqlConditionParser = new sql.SQLConditionParser(_sqlCondition);
				try {
					_sqlCondition = await sqlConditionParser.nextSQLCondition();
				} catch(_exception) {
					logger.error('count(...) unable to parse sql condition: ' + _exception);
					logger.trace('count(...): end.');
					throw DatabaseError.BAD_REQUEST;
				}
			}
		}
		let result = null;
		try {
			result = await this._implementation.count(_tableName, _sqlCondition);
		} catch(_exception) {	
			logger.error('count(...): ' + _exception);
		}
		logger.trace('count(...): end.');
		return result;
	}

	/**
	 * Alias for the close() method.
	 */
	async disconnect() {
		return this.close();
	}

	/**
	 * Initializes the database.
	 * Ideally this should be the first method called after creating
	 * the Database.
	 * Don't worry though our other methods call init() for you.
	 * @throws {DatabaseError} - Throws an error if the database cannot be initialized.
	 */
	async init() {
		logger.trace('init(): start.');
		// If the database has already been initialized, we don't need to do it again.
		if(this._initialized) {
			logger.trace('init(): end.');
			return;
		}
		try {
			await this._implementation.init();
			this._initialized = true;
		} catch(_exception) {
			logger.error('init(): ' + _exception);
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		} finally {
			logger.trace('init(): end.');
		}
	}

	/**
	 * Alias for the init() method.
	 */
	async initialize() {
		return this.init();
	}

	/**
	 * Alias for the init() method.
	 */
	async open() {
		return this.init();
	}

	/**
	 * An index can only be created on a known column.
	 * If the column has not yet been defined, one needs to call
	 * alterTableAddColumns(...) first.
	 * Note that the index name is optional. It will even be created
	 * if only the table name and column name are supplied.
	 * 
	 * @param {String} _indexName 
	 * @param {String} _tableName 
	 * @param {String} _columnName 
	 * @param {string} _indexType - One of b+tree or hash.
	 * 								Default is b+tree.
	 * @returns {void}
	 */
	async createIndex(_indexName, _tableName, _columnName, _indexType) {
		logger.trace('createIndex(...): start.');
		if(arguments.length === 2) {
			_indexName = '';
			_tableName = arguments[0];
			_columnName = arguments[1];
			_indexType = '';
		} else if(arguments.length === 3) {
			_indexName = arguments[0];
			_tableName = arguments[1];
			_columnName = arguments[2];
			_indexType = '';
		} else if(arguments.length === 4) {
			_indexName = arguments[0];
			_tableName = arguments[1];
			_columnName = arguments[2];
			_indexType = arguments[3];
		}
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_tableName)) {
			logger.warn('createIndex(...): _tableName is undefined, null, empty or not a string.');
			logger.trace('createIndex(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_columnName)) {
			logger.warn('createIndex(...): _columnName is undefined, null, empty or not a string.');
			logger.trace('createIndex(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_columnName = _columnName.trim();
		if(_indexName === undefined || _indexName === null) {
			_indexName = '';
		}
		_indexName = _indexName.trim();
		if(_indexName.length <= 0) {
			_indexName = 'index_' + _tableName + '_' + _columnName;
			_indexName = _indexName.replaceAll(' ', '_');
		}
		if(_indexType === undefined || _indexType === null) {
			_indexType = '';
		}
		_indexType = _indexType.trim();
		if(!this.isInitialized()) {
			logger.debug('createIndex(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('createIndex(...): ' + _exception);
				logger.trace('createIndex(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		try {
			await this._implementation.createIndex(_indexName, _tableName, _columnName, _indexType);
		} catch(_exception) {
			logger.error('createIndex(...): ' + _exception);
			throw _exception;
		} finally {
			logger.trace('createIndex(...): end.');
		}
	}

	async createSequence(_sequenceName) {
		logger.trace('createSequence(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_sequenceName)) {
			logger.warn('createSequence(...): _sequenceName is undefined, null, empty or not a string.');
			logger.trace('createSequence(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_sequenceName = _sequenceName.trim();
		if(!this.isInitialized()) {
			logger.debug('createSequence(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('createSequence(...): ' + _exception);
				logger.trace('createSequence(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		if(this.hasSequence(_sequenceName)) {
			logger.trace('createSequence(...): end.');
			throw DatabaseError.CONFLICT;			
		}
		try {
			await this._implementation.createSequence(_sequenceName);
		} catch(_exception) {
			logger.error('createSequence(...): ' + _exception);
			throw _exception;
		} finally {
			logger.trace('createSequence(...): end.');
		}
	}

	async createTable(_tableName, _columns) {
		logger.trace('createTable(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_tableName)) {
			logger.warn('createTable(...): _tableName is undefined, null, empty or not a string.');
			logger.trace('createTable(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(!this.isInitialized()) {
			logger.debug('createTable(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('createTable(...): ' + _exception);
				logger.trace('createTable(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		if(this.hasTable(_tableName)) {
			logger.trace('createTable(...): end.');
			throw DatabaseError.CONFLICT;
		}
		let columns = [];
        // Every table must have an _uuid column.
		let column = this._createColumn('_uuid', 'String', null);
        columns.push(column);
		if(_columns != undefined && _columns != null) {
			if(!Array.isArray(_columns)) {
				// Maybe it is a single column.
				if(_columns instanceof Object) {
					_columns = [_columns];
				} else {
					logger.warn('createTable(...): _columns is not a single column, nor an array.');
					logger.trace('createTable(...): end.');
					throw DatabaseError.ILLEGAL_ARGUMENT;
				}
			}
			for(let i=0;i < _columns.length;i++) {
				column = _columns[i];
				let columnName = column.name;
				if(columnName === undefined || columnName === null) {
					logger.warn('createTable(...): _columns contains an object without a name property.');
					continue;
				}
				// Ignore any _uuid columns. We've already added it as the first column.
				if(columnName === '_uuid') {
					continue;
				}
				let dataType = column.dataType;
				try {
					column = this._createColumn(columnName, dataType, column.length);
				} catch(_exception) {
					logger.warn('createTable(...): Unable to create a column with an unknown data type \'' + dataType + '\'.');
					continue;
				}
				columns.push(column);
			}
		}
		try {
			await this._implementation.createTable(_tableName, columns);
			// We create a hash index on the _uuid column.
			let indexName = 'index_' + _tableName + '_uuid';
			indexName = indexName.replaceAll(' ', '_');
			await this._implementation.createIndex(indexName, _tableName, '_uuid', 'hash index');
		} catch(_exception) {
			logger.error('createTable(...): ' + _exception);
			throw _exception;
		} finally {
			logger.trace('createTable(...): end.');
		}
	}

	// Alias of delete from
	async delete(_tableName, _sqlCondition) {
		return this.deleteFrom(_tableName, _sqlCondition);
	}

	async deleteFrom(_tableName, _sqlCondition) {
		logger.trace('deleteFrom(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_tableName)) {
			logger.warn('deleteFrom(...): _tableName is undefined, null, empty or not a string.');
			logger.trace('deleteFrom(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(!this.isInitialized()) {
			logger.debug('deleteFrom(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('deleteFrom(...): ' + _exception);
				logger.trace('deleteFrom(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		if(_sqlCondition != undefined && _sqlCondition != null) {
			if(typeof _sqlCondition === 'string') {
				let sqlConditionParser = new sql.SQLConditionParser(_sqlCondition);
				try {
					_sqlCondition = await sqlConditionParser.nextSQLCondition();
				} catch(_exception) {
					logger.error('deleteFrom(...) unable to parse sql condition: ' + _exception);
					logger.trace('deleteFrom(...): end.');
					throw DatabaseError.BAD_REQUEST;
				}
			}
		}
		let result = null;
		try {
			result = await this._implementation.deleteFrom(_tableName, _sqlCondition);
		} catch(_exception) {
			logger.error('deleteFrom(...): ' + _exception);
		}
		logger.trace('deleteFrom(...): end.');
		return result;
	}

	async deleteSequence(_sequenceName) {
		logger.trace('deleteSequence(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_sequenceName)) {
			logger.warn('deleteSequence(...): _sequenceName is undefined, null, empty or not a string.');
			logger.trace('deleteSequence(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_sequenceName = _sequenceName.trim();
		if(!this.isInitialized()) {
			logger.debug('deleteSequence(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('deleteSequence(...): ' + _exception);
				logger.trace('deleteSequence(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		try {
			await this._implementation.deleteSequence(_sequenceName);
		} catch(_exception) {
			// We will not throw an error if the sequence does not exist.
			if(_exception != DatabaseError.FILE_NOT_FOUND) {
				logger.error('deleteSequence(...): ' + _exception);
				throw _exception;
			}
		} finally {
			logger.trace('deleteSequence(...): end.');
		}
	}

	async deleteIndex(_indexName, _tableName) {
		logger.trace('deleteIndex(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_indexName)) {
			logger.warn('deleteIndex(...): _indexName is undefined, null, empty or not a string.');
			logger.trace('deleteIndex(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_indexName = _indexName.trim();
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_tableName)) {
			logger.warn('deleteIndex(...): _tableName is undefined, null, empty or not a string.');
			logger.trace('deleteIndex(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(!this.isInitialized()) {
			logger.debug('deleteIndex(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('deleteIndex(...): ' + _exception);
				logger.trace('deleteIndex(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		try {
			await this._implementation.deleteIndex(_indexName, _tableName);
		} catch(_exception) {
			// We will not throw an error if the index does not exist.
			if(_exception != DatabaseError.FILE_NOT_FOUND) {
				logger.error('deleteIndex(...): ' + _exception);
				throw _exception;
			}
		} finally {
			logger.trace('deleteIndex(...): end.');
		}
	}

	async deleteTable(_tableName) {
		logger.trace('deleteTable(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_tableName)) {
			logger.warn('deleteTable(...): _tableName is undefined, null, empty or not a string.');
			logger.trace('deleteTable(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(!this.isInitialized()) {
			logger.debug('deleteTable(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('deleteTable(...): ' + _exception);
				logger.trace('deleteTable(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		try {
			await this._implementation.deleteTable(_tableName);
		} catch(_exception) {
			// We will not throw an error if the table does not exist.
			if(_exception != DatabaseError.FILE_NOT_FOUND) {
				logger.error('deleteTable(...): ' + _exception);
				throw _exception;
			}
		} finally {
			logger.trace('deleteTable(...): end.');
		}
	}	

	// Alias of deleteIndex
	async deleteTableIndex(_indexName, _tableName) {
		return this.deleteIndex(_indexName, _tableName);
	}
	// Alias of deleteIndex
	async dropIndex(_indexName, _tableName) {
		return this.deleteIndex(_indexName, _tableName);
	}
	// Alias of deleteIndex
	async dropTableIndex(_indexName, _tableName) {
		return this.deleteIndex(_indexName, _tableName);
	}

	/**
	 * Return a string with the description of the table or sequence.
	 * If the table or sequence does not exist, an empty string is returned.
	 * The description is a string with the following format:
	 * --- <tableOrSequenceName> ---
	 * <columnName1> <columnType1>,
	 * <columnName2> <columnType2>,
	 * ...
	 * <columnNameN> <columnTypeN>
	 * 
	 * @param {String} _tableOrSequenceName 
	 * @returns 
	 */
	async desc(_tableOrSequenceName) {
		logger.trace('desc(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_tableOrSequenceName)) {
			logger.warn('desc(...): _tableOrSequenceName is undefined, null, empty or not a string.');
			logger.trace('desc(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_tableOrSequenceName = _tableOrSequenceName.trim();
		if(!this.isInitialized()) {
			logger.debug('desc(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('desc(...): ' + _exception);
				logger.trace('desc(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		let result = null;
		try {
			result = await this._implementation.desc(_tableOrSequenceName);
		} catch(_exception) {
			logger.error('desc(...): ' + _exception);
		}
		if(result === undefined || result === null) {
			result = '';
		}
		logger.trace('desc(...): end.');
		return result;
	}

	async execute(_sqlQuery) {
		logger.trace('execute(...): start.');
		// Defensive programming...check input...
		if(!this.isInitialized()) {
			logger.debug('execute(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('execute(...): ' + _exception);
				logger.trace('execute(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		if(typeof _sqlQuery === 'string') {
			let sqlQueryParser = new sql.SQLQueryParser(_sqlQuery);
			try {
				_sqlQuery = await sqlQueryParser.nextSQLQuery();
				logger.debug('execute(...): ' + _sqlQuery.toString());
			} catch(_exception) {
				logger.error('execute(...) unable to parse sql query: ' + _exception);
				logger.trace('execute(...): end.');
				throw DatabaseError.BAD_REQUEST;
			}
		}
		let sqlResult = null;
		try {
			sqlResult = await _sqlQuery.execute(this);
		} catch(_exception) {
			logger.error('execute(...): ' + _exception);
		}
		logger.trace('execute(...): end.');
		return sqlResult;
	}

	async insert(_tableName, ..._objects) {
		logger.trace('insert(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_tableName)) {
			logger.warn('insert(...): _tableName is undefined, null, empty or not a string.');
			logger.trace('insert(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(!this.isInitialized()) {
			logger.debug('insert(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('insert(...): ' + _exception);
				logger.trace('insert(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		let result = {
			ids: [],
			nInserted: 0
		};
		let numberOfObjects = _objects.length;
		// We loop through every object (or array of objects) passed
		// as a parameter.
		for(let i=0;i < numberOfObjects;i++) {
			let object = _objects[i];
			if(object === undefined || object === null) {
				// No point inserting an empty object.
				continue;
			}
			if(Array.isArray(object)) {
				// The supplied object is an array.
				// Lets attempt to add each item.
				let insertResult = await this.insertMany(_tableName, object);
				// Merge the result with the overall result.
				result.nInserted += insertResult.nInserted;
				result.ids = result.ids.concat(insertResult.ids);
			} else if(typeof object === 'object') {
				let insertResult = await this.insertOne(_tableName, object);
				result.nInserted += insertResult.nInserted;
				result.ids = result.ids.concat(insertResult.ids);
			}
		}
		logger.trace('insert(...): end.');
		return result;
	}

	async insertInto(_tableName, _columnNames, _values) {
		logger.trace('insertInto(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_tableName)) {
			logger.warn('insertInto(...): _tableName is undefined, null, empty or not a string.');
			logger.trace('insertInto(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(!this.isInitialized()) {
			logger.debug('insertInto(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('insertInto(...): ' + _exception);
				logger.trace('insertInto(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
console.log('columnnames: ' + _columnNames);
		let result = null;
		try {
			result = await this._implementation.insertInto(_tableName, _columnNames, _values);
		} catch(_exception) {
			logger.error('insertInto(...): ' + _exception);
		}
		logger.trace('insertInto(...): end.');
		return result;
	}

	async insertMany(_tableName, _array) {
		logger.trace('insertMany(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_tableName)) {
			logger.warn('insertMany(...): _tableName is undefined, null, empty or not a string.');
			logger.trace('insertMany(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(!this.isInitialized()) {
			logger.debug('insertMany(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('insertMany(...): ' + _exception);
				logger.trace('insertMany(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		let result = null;
		try {
			result = await this._implementation.insertMany(_tableName, _array);
		} catch(_exception) {
			logger.error('insertMany(...): ' + _exception);
		}
		logger.trace('insertMany(...): end.');
		return result;
	}

	async insertOne(_tableName, _object) {
		logger.trace('insertOne(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_tableName)) {
			logger.warn('insertOne(...): _tableName is undefined, null, empty or not a string.');
			logger.trace('insertOne(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(!this.isInitialized()) {
			logger.debug('insertOne(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('insertOne(...): ' + _exception);
				logger.trace('insertOne(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		let result = null;
		try {
			result = await this._implementation.insertOne(_tableName, _object);
		} catch(_exception) {
			logger.error('insertOne(...): ' + _exception);
		}
		logger.trace('insertOne(...): end.');
		return result;
	}

	async listIndices() {
		logger.trace('listIndices(): start.');
		if(!this.isInitialized()) {
			logger.debug('listIndices(): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('listIndices(): ' + _exception);
				logger.trace('listIndices(): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		let result = null;
		try {
			result = await this._implementation.listIndices();
		} catch(_exception) {
			logger.error('listIndices(): ' + _exception);
		}
		logger.trace('listIndices(): end.');
		return result;
	}

	async listSequences() {
		logger.trace('listSequences(): start.');
		if(!this.isInitialized()) {
			logger.debug('listSequences(): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('listSequences(): ' + _exception);
				logger.trace('listSequences(): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		let result = null;
		try {
			result = await this._implementation.listSequences();
		} catch(_exception) {
			logger.error('listSequences(): ' + _exception);
		}
		logger.trace('listSequences(): end.');
		return result;
	}

	async listTables() {
		logger.trace('listTables(): start.');
		if(!this.isInitialized()) {
			logger.debug('listTables(): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('listTables(): ' + _exception);
				logger.trace('listTables(): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		let result = null;
		try {
			result = await this._implementation.listTables();
		} catch(_exception) {
			logger.error('listTables(): ' + _exception);
		}
		logger.trace('listTables(): end.');
		return result;
	}

	async nextValue(_sequenceName) {
		logger.trace('nextValue(...): start.');
		// Defensive programming...check input...
		// ...
		// Actually to increase speed we will forgo some of
		// the defensive programming.
		// ...
		// Calling trim() on undefined or null will result in an error.
		_sequenceName = _sequenceName.trim();
		if(!this.isInitialized()) {
			logger.debug('nextValue(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('nextValue(...): ' + _exception);
				logger.trace('nextValue(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		let result = null;
		try {
			result = await this._implementation.nextValue(_sequenceName);
		} catch(_exception) {
			logger.error('nextValue(...): ' + _exception);
		}
		logger.trace('nextValue(...): end.');
		return result;
	}
	
	// Alias of execute
	async query(_sqlQuery) {
		return this.execute(_sqlQuery);
	}

	async renameSequence(_from, _to) {
		logger.trace('renameSequence(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_from)) {
			logger.warn('renameSequence(...): _from is undefined, null, empty or not a string.');
			logger.trace('renameSequence(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_to)) {
			logger.warn('renameSequence(...): _to is undefined, null, empty or not a string.');
			logger.trace('renameSequence(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_from = _from.trim().toLowerCase();
		_to = _to.trim().toLowerCase();
		if(_from === _to) {
			logger.debug('renameSequence(...): The name is unchanged.');
			logger.trace('renameSequence(...): end.');
			return true;
		}
		if(!this.isInitialized()) {
			logger.debug('renameSequence(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('renameSequence(...): ' + _exception);
				logger.trace('renameSequence(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		logger.debug('renameSequence(...): Attempting to rename a sequence from \'' + _from + '\' to \'' + _to + '\'.');
		try {
			await this._implementation.renameSequence(_from, _to);
		} catch(_exception) {
			logger.error('renameSequence(...): ' + _exception);
			throw _exception;
		} finally {
			logger.trace('renameSequence(...): end.');
		}
	}

	async renameIndex(_from, _to, _tableName) {
		logger.trace('renameIndex(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_from)) {
			logger.warn('renameIndex(...): _from is undefined, null, empty or not a string.');
			logger.trace('renameIndex(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_to)) {
			logger.warn('renameIndex(...): _to is undefined, null, empty or not a string.');
			logger.trace('renameIndex(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_from = _from.trim().toLowerCase();
		_to = _to.trim().toLowerCase();
		if(_from === _to) {
			logger.debug('renameIndex(...): The name is unchanged.');
			logger.trace('renameIndex(...): end.');
			return true;
		}
		if(!this.isInitialized()) {
			logger.debug('renameIndex(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('renameIndex(...): ' + _exception);
				logger.trace('renameIndex(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		logger.debug('renameIndex(...): Attempting to rename an index from \'' + _from + '\' to \'' + _to + '\'.');
		try {
			await this._implementation.renameIndex(_from, _to, _tableName);
		} catch(_exception) {
			logger.error('renameIndex(...): ' + _exception);
			throw _exception;
		} finally {
			logger.trace('renameIndex(...): end.');
		}
	}

	async renameTable(_from, _to) {
		logger.trace('renameTable(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_from)) {
			logger.warn('renameTable(...): _from is undefined, null, empty or not a string.');
			logger.trace('renameTable(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_to)) {
			logger.warn('renameTable(...): _to is undefined, null, empty or not a string.');
			logger.trace('renameTable(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_from = _from.trim().toLowerCase();
		_to = _to.trim().toLowerCase();
		if(_from === _to) {
			logger.debug('renameTable(...): The name is unchanged.');
			logger.trace('renameTable(...): end.');
			return true;
		}
		if(!this.isInitialized()) {
			logger.debug('renameTable(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('renameTable(...): ' + _exception);
				logger.trace('renameTable(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		logger.debug('renameTable(...): Attempting to rename a table from \'' + _from + '\' to \'' + _to + '\'.');
		try {
			await this._implementation.renameTable(_from, _to);
		} catch(_exception) {
			logger.error('renameTable(...): ' + _exception);
			throw _exception;
		} finally {
			logger.trace('renameTable(...): end.');
		}
	}

	/**
	* async select(<String> _tableName)
	* async select(<String> _tableName, <SQLCondition|String> _sqlCondition)
	* async select(<SQLSelectExpression[]> _sqlSelectExpressions, <String> _tableName)
	* async select(<SQLSelectExpression[]|String> _sqlSelectExpressions, <String> _tableName, <SQLCondition|String> _sqlCondition)
	*/
	async select(_sqlSelectExpressions, _tableName, _sqlCondition, _groupBy, _having, _orderBy) {
		logger.trace('select(...): start.');
		// Defensive programming...check input...
		if(arguments.length <= 0) {
			logger.trace('select(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		if(arguments.length === 1) {
			_tableName = arguments[0];
			_sqlSelectExpressions = null;
			_sqlCondition = null;
		} else if(arguments.length === 2) {
			if(Array.isArray(arguments[0])) {
				_sqlSelectExpressions = arguments[0];
				_tableName = arguments[1];
				_sqlCondition = null;
			} else {
				_tableName = arguments[0];
				_sqlSelectExpressions = null;
				_sqlCondition = arguments[1];
			}
		} else if(arguments.length === 3) {
			_sqlSelectExpressions = arguments[0];
			_tableName = arguments[1];
			_sqlCondition = arguments[2];
		}
		if(!this.isInitialized()) {
			logger.debug('select(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('select(...): ' + _exception);
				logger.trace('select(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		let result = null;
		if(_sqlSelectExpressions === undefined || _sqlSelectExpressions === null) {
			_sqlSelectExpressions = [];
		} else if(typeof _sqlSelectExpressions === 'string') {
			let sqlSelectExpressionParser = new sql.SQLSelectExpressionParser(_sqlSelectExpressions);
			_sqlSelectExpressions = [];
			let sqlSelectExpression = await sqlSelectExpressionParser.nextSQLSelectExpression();
			while(sqlSelectExpression != null) {
				_sqlSelectExpressions.push(sqlSelectExpression);
				sqlSelectExpression = await sqlSelectExpressionParser.nextSQLSelectExpression();
			}
		}
		if((_sqlCondition != undefined) && (_sqlCondition != null)) {
			if(typeof _sqlCondition === 'string') {
				let sqlConditionParser = new sql.SQLConditionParser(_sqlCondition);
				_sqlCondition = await sqlConditionParser.nextSQLCondition();
			}
		}
		if(_sqlSelectExpressions.length <= 0) { 
			if(_sqlCondition === undefined || _sqlCondition === null) {
				result = await this._implementation.selectAll(_tableName, _orderBy);
			} else {
				result = await this._implementation.selectSubset(_tableName, _sqlCondition, _orderBy);
			}
			logger.trace('select(...): end.');
			return result;
		}
		// Check if this is a SELECT * FROM expression.
		// That means there is only 1 sqlSelectExpression.
		if(_sqlSelectExpressions.length === 1) {
			let sqlSelectExpression = _sqlSelectExpressions[0];
			// It means the column name is * AND
			// It is not part of a SQLAggregateFunction like count, min, max, avg AND
			// It is not part of a SQLFunction like concat.
			if((sqlSelectExpression.getColumnName() === '*') &&
			   (!(sqlSelectExpression instanceof sql.SQLAggregateFunction)) &&
			   (!(sqlSelectExpression instanceof sql.SQLFunction))) {
			   	// If there is no SQLCondition we are selecting every single row.
				if(_sqlCondition === undefined || _sqlCondition === null) {
				   	// This is a SELECT * FROM <table_name>;
					result = await this._implementation.selectAll(_tableName, _orderBy);
				} else {
					// This is a SELECT * FROM <table_name> WHERE ...
					result = await this._implementation.selectSubset(_tableName, _sqlCondition, _orderBy);
				}
			} else {
				result = await this._implementation.selectSlice(_sqlSelectExpressions, _tableName, _sqlCondition, _groupBy, _having, _orderBy);
			}
		} else {
			result = await this._implementation.selectSlice(_sqlSelectExpressions, _tableName, _sqlCondition, _groupBy, _having, _orderBy);
		}
		logger.trace('select(...): end.');
		return result;
	}

	/**
	* async selectDistinct(<String> _tableName)
	* async selectDistinct(<String> _tableName, <SQLCondition|String> _sqlCondition)
	* async selectDistinct(<SQLSelectExpression[]> _sqlSelectExpressions, <String> _tableName)
	* async selectDistinct(<SQLSelectExpression[]|String> _sqlSelectExpressions, <String> _tableName, <SQLCondition|String> _sqlCondition)
	*/
	async selectDistinct(_sqlSelectExpressions, _tableName, _sqlCondition, _groupBy, _having, _orderBy) {
		logger.trace('selectDistinct(...): start.');
		// Defensive programming...check input...
		if(arguments.length <= 0) {
			logger.trace('selectDistinct(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		if(arguments.length === 1) {
			_tableName = arguments[0];
			_sqlSelectExpressions = null;
			_sqlCondition = null;
		} else if(arguments.length === 2) {
			if(Array.isArray(arguments[0])) {
				_sqlSelectExpressions = arguments[0];
				_tableName = arguments[1];
				_sqlCondition = null;
			} else {
				_tableName = arguments[0];
				_sqlSelectExpressions = null;
				_sqlCondition = arguments[1];
			}
		} else if(arguments.length === 3) {
			_sqlSelectExpressions = arguments[0];
			_tableName = arguments[1];
			_sqlCondition = arguments[2];
		}
		if(!this.isInitialized()) {
			logger.debug('selectDistinct(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('selectDistinct(...): ' + _exception);
				logger.trace('selectDistinct(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		let result = null;
		if(_sqlSelectExpressions === undefined || _sqlSelectExpressions === null) {
			_sqlSelectExpressions = [];
		} else if(Array.isArray(_sqlSelectExpressions)) {
			// Check if this is an array of strings.
			if(_sqlSelectExpressions.length > 0) {
				if(typeof _sqlSelectExpressions[0] === 'string') {
					_sqlSelectExpressions = _sqlSelectExpressions.join(',');
				}
			}
		}
		if(typeof _sqlSelectExpressions === 'string') {
			let sqlSelectExpressionParser = new sql.SQLSelectExpressionParser(_sqlSelectExpressions);
			_sqlSelectExpressions = [];
			let sqlSelectExpression = await sqlSelectExpressionParser.nextSQLSelectExpression();
			while(sqlSelectExpression != null) {
				_sqlSelectExpressions.push(sqlSelectExpression);
				sqlSelectExpression = await sqlSelectExpressionParser.nextSQLSelectExpression();
			}
		}
		if((_sqlCondition != undefined) && (_sqlCondition != null)) {
			if(typeof _sqlCondition === 'string') {
				let sqlConditionParser = new sql.SQLConditionParser(_sqlCondition);
				_sqlCondition = await sqlConditionParser.nextSQLCondition();
			}
		}
		if(_sqlSelectExpressions.length <= 0) { 
			if(_sqlCondition === undefined || _sqlCondition === null) {
				result = await this._implementation.selectDistinctAll(_tableName, _orderBy);
			} else {
				result = await this._implementation.selectDistinctSubset(_tableName, _sqlCondition, _orderBy);
			}
			logger.trace('selectDistinct(...): end.');
			return result;
		}
		if(_sqlSelectExpressions.length === 1) {
			let sqlSelectExpression = _sqlSelectExpressions[0];
			if(sqlSelectExpression.getColumnName() === '*') {
				if(_sqlCondition === undefined || _sqlCondition === null) {
					result = await this._implementation.selectDistinctAll(_tableName, _orderBy);
				} else {
					result = await this._implementation.selectDistinctSubset(_tableName, _sqlCondition, _orderBy);
				}
			} else {
				result = await this._implementation.selectDistinctSlice(_sqlSelectExpressions, _tableName, _sqlCondition, _groupBy, _having, _orderBy);
			}
		} else {
			result = await this._implementation.selectDistinctSlice(_sqlSelectExpressions, _tableName, _sqlCondition, _groupBy, _having, _orderBy);
		}
		logger.trace('selectDistinct(...): end.');
		return result;
	}

	async selectAll(_tableName, _orderBy) {
		logger.trace('selectAll(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_tableName)) {
			logger.warn('selectAll(...): _tableName is undefined, null, empty or not a string.');
			logger.trace('selectAll(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(!this.isInitialized()) {
			logger.debug('selectAll(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('selectAll(...): ' + _exception);
				logger.trace('selectAll(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		let result = null;
		try {
			result = await this._implementation.selectAll(_tableName, _orderBy);
		} catch(_exception) {
			logger.error('selectAll(...): ' + _exception);
		}
		logger.trace('selectAll(...): end.');
		return result;
	}

	/**
	* async selectSlice(<SQLSelectExpression[]> _sqlSelectExpressions, <String> _tableName)
	* async selectSlice(<SQLSelectExpression[]|String> _sqlSelectExpressions, <String> _tableName, <SQLCondition|String> _sqlCondition)
	*/
	async selectSlice(_sqlSelectExpressions, _tableName, _sqlCondition, _groupBy, _having, _orderBy) {
		logger.trace('selectSlice(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_tableName)) {
			logger.warn('selectSlice(...): _tableName is undefined, null, empty or not a string.');
			logger.trace('selectSlice(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(!this.isInitialized()) {
			logger.debug('selectSlice(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('selectSlice(...): ' + _exception);
				logger.trace('selectSlice(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		let result = null;
		if(_sqlSelectExpressions === undefined || _sqlSelectExpressions === null) {
			_sqlSelectExpressions = [];
		} else if(typeof _sqlSelectExpressions === 'string') {
			let sqlSelectExpressionParser = new sql.SQLSelectExpressionParser(_sqlSelectExpressions);
			_sqlSelectExpressions = [];
			let sqlSelectExpression = await sqlSelectExpressionParser.nextSQLSelectExpression();
			while(sqlSelectExpression != null) {
				_sqlSelectExpressions.push(sqlSelectExpression);
				sqlSelectExpression = await sqlSelectExpressionParser.nextSQLSelectExpression();
			}
		}
		if((_sqlCondition != undefined) && (_sqlCondition != null)) {
			if(typeof _sqlCondition === 'string') {
				let sqlConditionParser = new sql.SQLConditionParser(_sqlCondition);
				_sqlCondition = await sqlConditionParser.nextSQLCondition();
			}
		}
		if(_sqlSelectExpressions.length <= 0) { 
			if(_sqlCondition === undefined || _sqlCondition === null) {
				result = await this._implementation.selectAll(_tableName, _orderBy);
			} else {
				result = await this._implementation.selectSubset(_tableName, _sqlCondition, _orderBy);
			}
		} else {
			result = await this._implementation.selectSlice(_sqlSelectExpressions, _tableName, _sqlCondition, _groupBy, _having, _orderBy);
		}
		logger.trace('selectSlice(...): end.');
		return result;
	}

	async selectSubset(_tableName, _sqlCondition, _orderBy) {
		logger.trace('selectSubset(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_tableName)) {
			logger.warn('selectSubset(...): _tableName is undefined, null, empty or not a string.');
			logger.trace('selectSubset(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(!this.isInitialized()) {
			logger.debug('selectSubset(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('selectSubset(...): ' + _exception);
				logger.trace('selectSubset(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		let result = null;
		if(_sqlCondition === undefined || _sqlCondition === null) {
			result = await this._implementation.selectAll(_tableName, _orderBy);
		} else {
			if(typeof _sqlCondition === 'string') {
				let sqlConditionParser = new sql.SQLConditionParser(_sqlCondition);
				_sqlCondition = await sqlConditionParser.nextSQLCondition();
			}
			result = await this._implementation.selectSubset(_tableName, _sqlCondition, _orderBy);
		}
		logger.trace('selectSubset(...): end.');
		return result;
	}

	async update(_tableName, _columns, _values, _sqlCondition) {
		logger.trace('update(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_tableName)) {
			logger.warn('update(...): _tableName is undefined, null, empty or not a string.');
			logger.trace('update(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(!this.isInitialized()) {
			logger.debug('update(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('update(...): ' + _exception);
				logger.trace('update(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		if((_sqlCondition != undefined) && (_sqlCondition != null)) {
			if(typeof _sqlCondition === 'string') {
				let sqlConditionParser = new sql.SQLConditionParser(_sqlCondition);
				_sqlCondition = await sqlConditionParser.nextSQLCondition();
			}
		}
		let result = null;
		try {
			result = await this._implementation.update(_tableName, _columns, _values, _sqlCondition);
		} catch(_exception) {
			logger.error('update(...): ' + _exception);
		}
		logger.trace('update(...): end.');
		return result;
	}

	async updateByObject(_tableName, _object, _sqlCondition) {
		logger.trace('updateByObject(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_tableName)) {
			logger.warn('updateByObject(...): _tableName is undefined, null, empty or not a string.');
			logger.trace('updateByObject(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(!this.isInitialized()) {
			logger.debug('updateByObject(...): Database has not yet been initialized. Calling init() first.');
			try {
				await this.init();
			} catch(_exception) {
				logger.error('updateByObject(...): ' + _exception);
				logger.trace('updateByObject(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		}
		let result = null;
		try {
			result = await this._implementation.updateByObject(_tableName, _object, _sqlCondition);
		} catch(_exception) {
			logger.error('updateByObject(...): ' + _exception);
		}
		logger.trace('updateByObject(...): end.');
		return result;
	}

    /*********************************************
     * GETTERS
     ********************************************/

	hasSequence(_sequenceName) {
		logger.trace('hasSequence(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_sequenceName)) {
			logger.warn('hasSequence(...): _sequenceName is undefined, null, empty or not a string.');
			logger.trace('hasSequence(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_sequenceName = _sequenceName.trim();
		if(!this.isInitialized()) {
			logger.trace('hasSequence(...): end.');
			throw DatabaseError.ILLEGAL_STATE;
		}
		let result = false;
		try {
			result = this._implementation.hasSequence(_sequenceName);
		} catch(_exception) {
			logger.error('hasSequence(...): ' + _exception);
		}
		logger.trace('hasSequence(...): end.');
		return result;
	}

	hasTable(_tableName) {
		logger.trace('hasTable(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_tableName)) {
			logger.warn('hasTable(...): _tableName is undefined, null, empty or not a string.');
			logger.trace('hasTable(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(!this.isInitialized()) {
			logger.trace('hasTable(...): end.');
			throw DatabaseError.ILLEGAL_STATE;
		}
		let result = false;
		try {
			result = this._implementation.hasTable(_tableName);
		} catch(_exception) {
			logger.error('hasTable(...): ' + _exception);
		}
		logger.trace('hasTable(...): end.');
		return result;
	}

	get name() {
		return this.getName();
	}

	getName() {
		return this._implementation.getName();
	}

	isInitialized() {
		return this._initialized;
	}

    /*********************************************
     * SETTERS
     ********************************************/

	async rename(_name) {
		this.setName(_name);
	}

	async setName(_name) {
		logger.trace('setName(...): start.');
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_name)) {
			logger.warn('setName(...): _name is undefined, null, empty or not a string.');
			logger.trace('setName(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_name = _name.trim();
		try {
			await this._implementation.setName(_name);
		} catch(_exception) {
			logger.error('setName(...): ' + _exception);
		}
		logger.trace('setName(...): end.');
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print(Database);
   return;
}
module.exports = Database;