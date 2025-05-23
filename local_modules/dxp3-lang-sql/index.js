/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * index
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-lang-sql
 */
const sql = {};

/** @member {module:dxp3-lang-sql/SQLAggregateFunction} SQLAggregateFunction */
sql.SQLAggregateFunction = require('./SQLAggregateFunction');
/** @member {module:dxp3-lang-sql/SQLColumn} SQLColumn */
sql.SQLColumn = require('./SQLColumn');
/** @member {module:dxp3-lang-sql/SQLCondition} SQLCondition */
sql.SQLCondition = require('./SQLCondition');
/** @member {module:dxp3-lang-sql/SQLConditionParser} SQLConditionParser */
sql.SQLConditionParser = require('./SQLConditionParser');
/** @member {module:dxp3-lang-sql/SQLConnection} SQLConnection */
sql.SQLConnection = require('./SQLConnection');
/** @member {module:dxp3-lang-sql/SQLError} SQLError */
sql.SQLError = require('./SQLError');
/** @member {module:dxp3-lang-sql/SQLFunction} SQLFunction */
sql.SQLFunction = require('./SQLFunction');
/** @member {module:dxp3-lang-sql/SQLQuery} SQLQuery */
sql.SQLQuery = require('./SQLQuery');
/** @member {module:dxp3-lang-sql/SQLQueryParser} SQLQueryParser */
sql.SQLQueryParser = require('./SQLQueryParser');
/** @member {module:dxp3-lang-sql/SQLResultSet} SQLResultSet */
sql.SQLResultSet = require('./SQLResultSet');
/** @member {module:dxp3-lang-sql/SQLRow} SQLRow */
sql.SQLRow = require('./SQLRow');
/** @member {module:dxp3-lang-sql/SQLSelectExpressionParser} SQLSelectExpressionParser */
sql.SQLSelectExpressionParser = require('./SQLSelectExpressionParser');
/** @member {module:dxp3-lang-sql/SQLTable} SQLTable */
sql.SQLTable = require('./SQLTable');
/** @member {module:dxp3-lang-sql/SQLTableIndex} SQLTableIndex */
sql.SQLTableIndex = require('./SQLTableIndex');

module.exports = sql;