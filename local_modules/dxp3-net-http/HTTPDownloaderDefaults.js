/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPDownloaderDefaults
 */
const packageName = 'dxp3-net-HTTP';
const moduleName = 'HTTPDownloaderDefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A constant representing all the default properties for a HTTPDownloader.
 *
 * @module dxp3-net-http/HTTPDownloaderDefaults
 */
const logging = require('dxp3-logging');
const os = require('os');
const util = require('dxp3-util');

const HTTPDownloaderDefaults = {
	/**
	 * @member {String} DEFAULT_DOWNLOAD_FOLDER
	 * Default download directory is the operating systems' temporary directory.
	 */
	DEFAULT_DOWNLOAD_FOLDER: os.tmpdir(),
	/**
	 * @member {String} DEFAULT_LOG_LEVEL
	 * Default log level is dxp3-logging.Level.WARN.
	 * @see module:dxp3-logging/Level
	 */
	DEFAULT_LOG_LEVEL: logging.Level.WARN,
	/**
	 * @member {String} DEFAULT_TIMEOUT
	 * Default timeout is 60 seconds.
	 */
	DEFAULT_TIMEOUT: 60000,
	/**
	 * @member {String} DEFAULT_USERAGENT
	 * Default useragent is Mozilla.
	 */
	DEFAULT_USERAGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0'
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
module.exports = HTTPDownloaderDefaults;