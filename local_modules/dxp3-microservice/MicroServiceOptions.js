/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * MicroServiceOptions
 */
const packageName = 'dxp3-microservice';
const moduleName = 'MicroServiceOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-net-tcp/MicroServiceOptions
 */
const MicroServiceDefaults = require('./MicroServiceDefaults');
/**
 * A MicroServiceOptions instance will attempt to parse and interpret the options supplied to
 * a MicroService constructor. Additionally it will provide defaults for missing options.
 *
 * @example
 * const microservice = require('dxp3-microservice');
 * let myWebServer = new microservice.WebServer({name: 'myWebServer', produces: 'main website', serverport: 80});
 * myWebServer.start();
 *
 * @extends dxp3-util/Options
 * @see module:dxp3-microservice/MicroServiceDefaults
 */
class MicroServiceOptions extends util.Options {
	/**
	 * @property {Array} consumes
	 * A set of subjects this micro services consumes.
	 * Alias properties: client(s), consumption(s), destination(s),
	 * forward(s), forwardto, proxy, proxies, upstream(s).
	 *
     * @property {Boolean} help
     * Alias properties: faq,info,information.
     *
	 * @property {module:dxp3-logging/Level} logLevel
	 * Alias properties: log, logging, logger, loglevel.
	 *
	 * @property {String} name
	 * Alias properties: microservicename, servicename.
	 *
	 * @property {Number} port
	 * Alias properties: listenon, microserviceport, serverport, serviceport.
	 *
	 * @property {Array} produces
	 * A set of subjects this micro services produces.
	 * Alias properties: production(s), product(s), serves.
	 * 
	 * @property {Object} settings
	 */
	constructor() {
		super();
		this.consumes = [];
		super.addAliases('client,clients,consumption,consumptions', 'consumes');
		super.addAliases('destination,destinations', 'consumes');
		super.addAliases('forward,forwards,forwardto,forwardsto', 'consumes');
		super.addAliases('proxy,proxies', 'consumes');
		super.addAliases('upstream,upstreams','consumes');
		// An user may ask for help. By default we assume everything is clear and no help is required.
		this.help = false;
		super.addAliases('faq,info,information', 'help');
		this.logLevel = [{regexp:"*",level:MicroServiceDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.name = null;
		super.addAliases('microservicename,servicename', 'name');
		this.port = MicroServiceDefaults.DEFAULT_PORT;
		super.addAliases('listenon', 'port');
		super.addAliases('microserviceport,serverport,serviceport', 'port');
		// A microservice may serve 0 or more subjects.
		this.produces = [];
		super.addAliases('production,productions,product,products,serves', 'produces');
		this.settings = {};
	}
}

module.exports = MicroServiceOptions;