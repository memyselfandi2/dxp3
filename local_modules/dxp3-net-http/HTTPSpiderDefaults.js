/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPSpiderDefaults
 */
const packageName = 'dxp3-net-HTTP';
const moduleName = 'HTTPSpiderDefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A constant representing all the default properties for a HTTPSpider.
 *
 * @module dxp3-net-http/HTTPSpiderDefaults
 */
// It's important to at least log warnings and errors.
const logging = require('dxp3-logging');
const os = require('os');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

const HTTPSpiderDefaults = {
	/**
	 * @member {String} DEFAULT_DOWNLOAD_FOLDER
	 * Default download directory is the operating systems' temporary directory.
	 */
	DEFAULT_DOWNLOAD_FOLDER: os.tmpdir(),
	/**
	 * @member {String} DEFAULT_FOLLOW_EXTERNAL_LINKS
	 * By default we only spider the current/start/root host.
	 */
	DEFAULT_FOLLOW_EXTERNAL_LINKS: false,
	/**
	 * @member {String} DEFAULT_FOLLOW_INTERNAL_LINKS
	 * By default we spider multiple pages of the
	 * current/start/root host.
	 */
	DEFAULT_FOLLOW_INTERNAL_LINKS: true,
	/**
	 * @member {String} DEFAULT_FOLLOW_REDIRECTS
	 * By default we follow redirects.
	 */
	DEFAULT_FOLLOW_REDIRECTS: true,
	/**
	 * @member {String} DEFAULT_LOG_LEVEL
	 * Default log level is dxp3-logging.Level.WARN.
	 * @see module:dxp3-logging/Level
	 */
	DEFAULT_LOG_LEVEL: logging.Level.WARN,
	/**
	 * @member {String} DEFAULT_RATE_LIMIT
	 * Default rate limit is 2 seconds.
	 */
	DEFAULT_RATE_LIMIT: 2000,
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
module.exports = HTTPSpiderDefaults;