/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPFormOptions
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPFormOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPFormOptions
 */
const logging = require('dxp3-logging');
const os = require('os');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class HTTPFormOptions extends util.Options {

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
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(HTTPFormOptions);
    return;
}
module.exports = HTTPFormOptions;