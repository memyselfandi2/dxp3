/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-util
 *
 * NAME
 * Help
 */
const packageName = 'dxp3-util';
const moduleName = 'Help';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * We simply read our README.txt file and print its contents to the screen.
 *
 * @module dxp3-util/Help
 */
// We need the Assert module to know if this is the file to execute.
const Assert = require('./Assert');
// We need the core fs module to read files.
const fs = require('fs');

const DEFAULT_READ_ME_FILE_NAME = 'README.txt';
/**
 * <p>A singleton Help class allows one to print a brief help to the console.<br/>
 * The contents come from the README.txt file found in the same directory.<br/>
 * Alternatively one can specify a Class or its name and the contents of the .txt file<br/>
 * with that name will be printed. If no such .txt file exists, the default README.txt file<br/>
 * will be tried instead.</p>
 *
 * @example
 * node Help.js
 *
 * Or you can use the npm command as this help file is referenced in the package.json:
 *
 * npm run help
 */
class Help {
	/**
	 * As all methods are static, we don't really need a constructor.
	 */
	 constructor() {
	 }
	/**
	 * Attempt to read the README.txt file and print its contents to the console.
	 * @param {Class|String} _aClass
	 */
	static print(_aClass) {
		if(_aClass === undefined || _aClass === null) {
			Help.printReadMe(DEFAULT_READ_ME_FILE_NAME);
			return;
		}
		let classReadMe = '';
		if(typeof _aClass === 'string') {
			_aClass = _aClass.trim();
			classReadMe = _aClass + '.txt';			
		} else if((_aClass.name != undefined) && (_aClass.name != null)) {
			classReadMe = _aClass.name + '.txt';
		} else {
			Help.printReadMe(DEFAULT_READ_ME_FILE_NAME);
			return;
		}
		if(fs.existsSync('.' + path.sep + classReadMe)) {
			Help.printReadMe(classReadMe);
		} else {
			Help.printReadMe(DEFAULT_READ_ME_FILE_NAME);
		}
	}

	/**
	 * Attempt to read a text file at a specific location and print its contents to the console.
	 * @param {String} _filePath
	 */
	static printReadMe(_filePath) {
		try {
			const readme = fs.readFileSync('.' + path.sep + _filePath, 'utf8');
			console.clear();
			console.log(readme);
		} catch(exception) {
			console.log(canonicalName + ':ERROR: Unable to read the ' + _filePath + ' file.');
		}
	}
}
// Check if someone tried to run/execute this file.
if(Assert.isFileToExecute(canonicalName)) {
	Help.print();
	return;
}
module.exports = Help;