/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPFormArguments
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPFormArguments';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(process.argv[1].indexOf(canonicalName) >= 0) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-net-http/HTTPFormArguments
 */
const logging = require('dxp3-logging');
const os = require('os');

const logger = logging.getLogger(canonicalName);

class HTTPFormArguments extends util.ConstructorArguments {

	constructor() {
		super();
		this.encoding = 'utf8';
		this.uploadDir = os.tmpdir();
		super.addAlias('dir,directory', 'uploadDir');
		super.addAlias('folder', 'uploadDir');
		super.addAlias('tempdir,tempdirectory,tempfolder', 'uploadDir');
		super.addAlias('tmpdir,tmpdirectory,tmpfolder', 'uploadDir');
		super.addAlias('uploaddirectory', 'uploadDir');
		super.addAlias('uploadfolder', 'uploadDir');
	}
}

module.exports = HTTPFormArguments;