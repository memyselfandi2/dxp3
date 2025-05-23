/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-util
 *
 * NAME
 * index
 */
const packageName = 'dxp3-util';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * <p>This library contains all kinds of utilities.
 * Most notably it has a Help class that can be used to read a README.txt
 * file and print its content to the console.
 * It also contains classes to read/parse and transform command line options.
 * Each of the util classes is accessible by requiring this index module.
 * 
 * It is to be used as a library as it does not contain any executable class.
 * Make sure this local module is defined as a dependency in your package.json.
 * Typically the dependency is defined by a file reference using a relative path.
 * Obviously that relative path may be different for different modules.<br/>
 * Here is an example of such a dependency in a package.json:<br/>
 * "dependencies": {<br/>
 *   "dxp3-util": "file:../../../local_modules/dxp3-util"<br/>
 * }<br/>
 * </p>
 *
 * @example
 * // Example 1: How to print out our help.
 * //
 * // Get a reference to our utilities.
 * const util = require('dxp3-util');
 * // Print out our README.txt
 * util.Help.print();
 * 
 * // Example 2: How to print out a specific class help file.
 * //
 * // Get a reference to our utilities.
 * const util = require('dxp3-util');
 * class MyClass {
 * }
 * // Print out the help file of the class.
 * util.Help.print(MyClass);
 * 
 * @module dxp3-util
 */
const util = {};
/** @member {module:dxp3-util/Assert} Assert */
util.Assert = require('./Assert');
/** @member {module:dxp3-util/CommandLineOptions} CommandLineOptions */
util.CommandLineOptions = require('./CommandLineOptions');
/** @member {module:dxp3-util/CommandLineOption} CommandLineOption */
util.CommandLineOption = require('./CommandLineOption');
/** @member {module:dxp3-util/Help} Help */
util.Help = require('./Help');
/** @member {module:dxp3-util/Options} Options */
util.Options = require('./Options');

// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print();
   return;
}
module.exports = util;