/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * MicroServiceType
 */
const packageName = 'dxp3-microservice';
const moduleName = 'MicroServiceType';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * <p>An enumeration to represent all the different micro services.</p>
 * At the time of writing these are:<br/>
 * <ul>
 * <li>AGENT: A platform agent.</li>
 * <li>MONITOR: An UDP server microservice.</li>
 * <li>PUBLISHER: A TCP/IP server microservice.</li>
 * <li>REST CLIENT: A JSON client microservice.</li>
 * <li>REST SERVER: A JSON server microservice.</li>
 * <li>SUBSCRIBER: A TCP/IP client microservice.</li>
 * <li>WEB CLIENT: An HTTP client microservice.</li>
 * <li>WEB GATEWAY: An HTTP reverse proxy microservice.</li>
 * <li>WEB SERVER: An HTTP server microservice.</li>
 * <li>SCOUT BRIDGE: An UDP server that forwards Scout multicast messages to another Scout Bridge (unicast).</li>
 * </ul>
 *
 * @module dxp3-microservice/MicroServiceType
 */
const MicroServiceError = require('./MicroServiceError');

const MicroServiceType = {
	// A cache client and server implement caching mechanisms. It allows clients to assign keys to
	// data to be cached and retrieve the data using the key.
	CACHE_CLIENT: "CACHE CLIENT",
	CACHE_SERVER: "CACHE SERVER",
	DATABASE_CLIENT: "DATABASE CLIENT",
	DATABASE_SERVER: "DATABASE SERVER",
	MONITOR: "MONITOR",
	PUBLISHER: "PUBLISHER",
	// A rest client and server implement a json request/json reply mechanism.
	// Internally they use a JSON client and JSON server.
	REST_CLIENT: "REST CLIENT",
	REST_SERVER: "REST SERVER",
	SCOUT_BRIDGE: "SCOUT BRIDGE",
	SUBSCRIBER: "SUBSCRIBER",
	WEB_CLIENT: "WEB CLIENT",
	WEB_GATEWAY: "WEB GATEWAY",
	WEB_SERVER: "WEB SERVER",
	UNKNOWN: "UNKNOWN",
	/**
	 * @function
	 * @param {String} microServiceTypeAsString - The microservice type given as a string to be transformed to a value of the MicroServiceType enumeration.
	 * @returns {MicroServiceType}
	 */
	parse: function(microServiceTypeAsString) {
		if(microServiceTypeAsString === undefined || microServiceTypeAsString === null) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		if(typeof microServiceTypeAsString != 'string') {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		microServiceTypeAsString = microServiceTypeAsString.trim();
		if(microServiceTypeAsString.length <= 0) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		microServiceTypeAsString = microServiceTypeAsString.toUpperCase();
		switch(microServiceTypeAsString) {
			case "CACHECLIENT":
			case "CACHE-CLIENT":
			case "CACHE_CLIENT":
			case "CACHE CLIENT":
				return MicroServiceType.CACHE_CLIENT;
			case "CACHESERVER":
			case "CACHE-SERVER":
			case "CACHE_SERVER":
			case "CACHE SERVER":
				return MicroServiceType.CACHE_SERVER;
			case "DATABASECLIENT":
			case "DATABASE-CLIENT":
			case "DATABASE_CLIENT":
			case "DATABASE CLIENT":
				return MicroServiceType.DATABASE_CLIENT;
			case "DATABASESERVER":
			case "DATABASE-SERVER":
			case "DATABASE_SERVER":
			case "DATABASE SERVER":
				return MicroServiceType.DATABASE_SERVER;
			case 'MONITOR':
				return MicroServiceType.MONITOR;
			case "PUB":
			case "PUBLISHER":
				return MicroServiceType.PUBLISHER;
			case "RESTCLIENT":
			case "REST-CLIENT":
			case "REST_CLIENT":
			case "REST CLIENT":
			case "JSONCLIENT":
			case "JSON-CLIENT":
			case "JSON_CLIENT":
			case "JSON CLIENT":
				return MicroServiceType.REST_CLIENT;
			case "RESTSERVER":
			case "REST-SERVER":
			case "REST_SERVER":
			case "REST SERVER":
			case "JSONSERVER":
			case "JSON-SERVER":
			case "JSON_SERVER":
			case "JSON SERVER":
				return MicroServiceType.REST_SERVER;
			case "SCOUTBRIDGE":
			case "SCOUT-BRIDGE":
			case "SCOUT_BRIDGE":
			case "SCOUT BRIDGE":
				return MicroServiceType.SCOUT_BRIDGE;
			case "SUB":
			case "SUBSCRIBER":
				return MicroServiceType.SUBSCRIBER;
			case "WEBCLIENT":
			case "WEB-CLIENT":
			case "WEB_CLIENT":
			case "WEB CLIENT":
			case "HTTPCLIENT":
			case "HTTP-CLIENT":
			case "HTTP_CLIENT":
			case "HTTP CLIENT":
				return MicroServiceType.WEB_CLIENT;
			case "WEBGATEWAY":
			case "WEB-GATEWAY":
			case "WEB_GATEWAY":
			case "WEB GATEWAY":
			case "GATEWAY":
			case "REVERSEPROXY":
			case "REVERSE-PROXY":
			case "REVERSE_PROXY":
			case "REVERSE PROXY":
			case "HTTPREVERSEPROXY":
			case "HTTPREVERSE-PROXY":
			case "HTTPREVERSE_PROXY":
			case "HTTPREVERSE PROXY":
			case "HTTP-REVERSEPROXY":
			case "HTTP-REVERSE-PROXY":
			case "HTTP-REVERSE_PROXY":
			case "HTTP-REVERSE PROXY":
			case "HTTP_REVERSEPROXY":
			case "HTTP_REVERSE-PROXY":
			case "HTTP_REVERSE_PROXY":
			case "HTTP_REVERSE PROXY":
			case "HTTP REVERSEPROXY":
			case "HTTP REVERSE-PROXY":
			case "HTTP REVERSE_PROXY":
			case "HTTP REVERSE PROXY":
			case "PROXY":
				return MicroServiceType.WEB_GATEWAY;
			case "WEBSERVER":
			case "WEB-SERVER":
			case "WEB_SERVER":
			case "WEB SERVER":
			case "HTTPSERVER":
			case "HTTP-SERVER":
			case "HTTP_SERVER":
			case "HTTP SERVER":
				return MicroServiceType.WEB_SERVER;
			default:
				throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
	}
};

module.exports = MicroServiceType;