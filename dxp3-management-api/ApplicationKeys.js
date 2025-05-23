/**
 * DXP3 - Digital Experience Platform 3<br/>
 * <br/>
 * PACKAGE<br/>
 * dxp3-management-api<br/>
 * <br/>
 * NAME<br/>
 * ApplicationKeys<br/>
 * <br/>
 * DESCRIPTION<br/>
 * Helper class to define the UI's configuration keys.
 */
const packageName = 'dxp3-management-api';
const moduleName = 'ApplicationKeys';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @enum {String}
 * @readonly
 */
const ApplicationKeys = {
	CACHE: 'CACHE',
	CATEGORY: 'dxp3-management-api',
	/** Typically used to set the log level, which is highly likely set to 'error' in production.*/
	LOG_LEVEL: 'LOG_LEVEL',
	/** Typically used to define the protocol, which is highly likely one of http or https.*/
	PROTOCOL: 'PROTOCOL',
	/** Used to retrieve a reference to a security client microservice.RestClient */
	SECURITY_CLIENT: 'SECURITY_CLIENT',
	/** Typically used to specify which port the application listens on.*/
	SERVER_PORT: 'SERVER_PORT',
	APPLICATION_DAO: 'APPLICATION_DAO',
	CONTROLLER_DAO: 'CONTROLLER_DAO',
	IMAGE_DAO: 'IMAGE_DAO',
	LAYOUT_DAO: 'LAYOUT_DAO',
	PAGE_DAO: 'PAGE_DAO',
	STYLE_DAO: 'STYLE_DAO'
}

module.exports = ApplicationKeys;