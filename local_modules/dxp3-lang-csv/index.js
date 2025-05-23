/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-csv
 *
 * NAME
 * index
 */
const packageName = 'dxp3-lang-csv';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-csv
 */
const util = require('dxp3-util');

const csv = {};

csv.CSVDocument = require('./CSVDocument');
csv.CSVParser = require('./CSVParser');
csv.CSVReader = require('./CSVReader');

// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print();
   return;
}
module.exports = csv;