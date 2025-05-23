/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-platform
 *
 * NAME
 * Dashboard
 */
const packageName = 'dxp3-microservice-platform';
const moduleName = 'Dashboard';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-microservice-platform/Dashboard
 */
const cleanup = require('dxp3-cleanup');
const DashboardOptions = require('./DashboardOptions');
const logging = require('dxp3-logging');
const microservice = require('dxp3-microservice');
const util = require('dxp3-util');
const web = require('dxp3-microservice-web');

const logger = logging.getLogger(canonicalName);

class Dashboard {
	constructor() {
		this._webServer = new web.WebServer({name:"dashboard",domain:"*",port:8080,secure:false});
		this._services = new Map();
		this._scout = new microservice.Scout();
		this._scout.on(microservice.ScoutEvent.FOUND_SCOUT, (_scout) => {
			this._services.set(_scout.id, _scout);
		});
		this._scout.on(microservice.ScoutEvent.LOST_SCOUT, (_scout) => {
			this._services.delete(_scout.id);
		});
		this._webServer.get('/', (_request, _response) => {
			_response.sendFile('html/index.html', {root:__dirname});
		});
		this._webServer.get('/scripts/:scriptName', (_request, _response) => {
			_response.sendFile('scripts/' + _request.params.scriptName, {root:__dirname});
		});
		this._webServer.get('/assets/:assetName', (_request, _response) => {
			_response.sendFile('assets/' + _request.params.assetName, {root:__dirname});
		});
		this._webServer.get('/api/service/', (_request, _response) => {
			_response.send(Array.from(this._services.values()));
		});
		this._webServer.on(web.WebServerEvent.RUNNING, () => {
			console.log('Dashboard running at ' + this._webServer.address + ':' + this._webServer.port);
		});
	}

	start() {
		this._webServer.start();
		this._scout.start();
	}

	stop() {
		this._webServer.stop();
		this._scout.stop();
	}

	static main() {
		try {
	        let dashboardOptions = DashboardOptions.parseCommandLine();
	        logging.setLevel(dashboardOptions.logLevel);
	        if(dashboardOptions.help) {
	        	util.Help.print(Dashboard);
	        	return;
	        }
			let dashboard = new Dashboard();
			// Make sure we gracefully shutdown when asked to do so.
			// We can register our own interrupt listener with the cleanup.Manager.
			cleanup.Manager.init();
			cleanup.Manager.addInterruptListener(() => {
				logger.info('Process interrupt received. Will attempt to stop.');
				dashboard.stop();
			});
			// If the process is killed we have no time to gracefully shutdown.
			// We will at least attempt to log a warning.
			cleanup.Manager.addKillListener((_killCode) => {
				logger.warn('main(): Dashboard killed.');
			});
			dashboard.start();
		} catch(exception) {
			logger.fatal('main(): ' + exception.message);
			process.exit(99);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	Dashboard.main();
	return;
}
module.exports = Dashboard;