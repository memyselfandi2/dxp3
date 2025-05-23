/**
 * DXP3 - Digital Experience Platform 3<br/>
 * <br/>
 * PACKAGE<br/>
 * dxp3-management-api<br/>
 * <br/>
 * NAME<br/>
 * help<br/>
 * <br/>
 * DESCRIPTION<br/>
 * Print a brief help to the console.
 * The contents come from the README.txt file found in the same directory.
 *
 * @example
 * node help.js
 *
 * Or you can use the npm command as this help file is referenced in the package.json:
 *
 * npm run help
 * 
 * @module dxp3-management-api/help
 */
const packageName = 'dxp3-management-api';
const moduleName = 'help';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// We simply read our README.txt file and print its contents to the screen.
const DEFAULT_READ_ME_FILE_NAME = 'README.txt';
// We need the core fs module to read files.
const fs = require('fs');
try {
	const readme = fs.readFileSync(DEFAULT_READ_ME_FILE_NAME, 'utf8');
	console.log(readme);
} catch(exception) {
	console.log(canonicalName + ':ERROR: Unable to read the ' + DEFAULT_READ_ME_FILE_NAME + ' file.');
}