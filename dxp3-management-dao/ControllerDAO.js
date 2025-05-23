const packageName = 'dxp3-management-dao';
const moduleName = 'ControllerDAO';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const rest = require('dxp3-microservice-rest');
const DAOOptions = require('./DAOOptions');
const DAOError = require('./DAOError');
const util = require('dxp3-util');

/**
 * @class
 */
class ControllerDAO {

    constructor(args) {
        let self = this;
        args = DAOOptions.parse(args);
        let daoServerOptions = {
            name: canonicalName,
            port: args.port,
            produces: 'dxp3-management-dao-ControllerDAO',
            timeout: args.timeout
        }
        self.daoServer = new rest.RestServer(daoServerOptions);
        let daoImplClass = require('./' + args.implementation + '/ControllerDAOImpl');
        self.daoImpl = new daoImplClass(args.daoImplOptions);
		/**********************************
		 * CREATE / CONSTRUCTORS
		 *********************************/
		self.daoServer.addMethod('Object create(String accountUUID, String loggedInUserUUID, String ownerUUID, String controllerName, String description, String code)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, controllerName, description, code, response) {
			self.daoImpl.create(accountUUID, loggedInUserUUID, ownerUUID, controllerName, description, code, response);
		});
		/**********************************
		 * READ / GETTERS
		 *********************************/
		self.daoServer.addMethod('Object get(String accountUUID, String loggedInUserUUID, String ownerUUID, String controllerUUID)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, controllerUUID, response) {
		    self.daoImpl.get(accountUUID, loggedInUserUUID, ownerUUID, controllerUUID, response);
		});
		self.daoServer.addMethod('Object list(String accountUUID, String loggedInUserUUID, String ownerUUID, Number startIndex, Number maximumNumberOfResults, Array<String> categorizedAs, Object filterBy, Object sortBy)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, response) {
		    self.daoImpl.list(accountUUID, loggedInUserUUID, ownerUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, response);
		});
		/**********************************
		 * UPDATE / SETTERS
		 *********************************/
		self.daoServer.addMethod('Boolean categorize(String accountUUID, String loggedInUserUUID, String controllerUUID, String categoryUUID)',
								 function(accountUUID, loggedInUserUUID, controllerUUID, categoryUUID, response) {
		    self.daoImpl.categorize(accountUUID, loggedInUserUUID, controllerUUID, categoryUUID, response);
		});
		self.daoServer.addMethod('Boolean decategorize(String accountUUID, String loggedInUserUUID, String controllerUUID, String categoryUUID)',
								 function(accountUUID, loggedInUserUUID, controllerUUID, categoryUUID, response) {
		    self.daoImpl.decategorize(accountUUID, loggedInUserUUID, controllerUUID, categoryUUID, response);
		});
		self.daoServer.addMethod('Object update(String accountUUID, String loggedInUserUUID, String ownerUUID, String controllerUUID, String controllerName, String description, String code)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, controllerUUID, controllerName, description, code, response) {
		    self.daoImpl.update(accountUUID, loggedInUserUUID, ownerUUID, controllerUUID, controllerName, description, code, response);
		});
		self.daoServer.addMethod('Object reorder(String accountUUID, String loggedInUserUUID, String ownerUUID, Array<String> controllerUUIDs)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, controllerUUIDs, response) {
	console.log('ControllerDAO: ' + controllerUUIDs);
	console.log('isArray: ' + Array.isArray(controllerUUIDs));
		    self.daoImpl.reorder(accountUUID, loggedInUserUUID, ownerUUID, controllerUUIDs, response);
		});
		self.daoServer.addMethod('Object moveUp(String accountUUID, String loggedInUserUUID, String ownerUUID, String controllerUUID)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, controllerUUIDs, response) {
		    self.daoImpl.moveUp(accountUUID, loggedInUserUUID, ownerUUID, controllerUUID, response);
		});
		self.daoServer.addMethod('Object moveDown(String accountUUID, String loggedInUserUUID, String ownerUUID, String controllerUUID)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, controllerUUID, response) {
		    self.daoImpl.moveDown(accountUUID, loggedInUserUUID, ownerUUID, controllerUUID, response);
		});
		/**********************************
		 * DELETE
		 *********************************/
		self.daoServer.addMethod('Object delete(String accountUUID, String loggedInUserUUID, String ownerUUID, String controllerUUID)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, controllerUUID, response) {
		    self.daoImpl.delete(accountUUID, loggedInUserUUID, ownerUUID, controllerUUID, response);
		});
	}

    start() {
        let self = this;
        self.daoServer.start();
    }

    static main() {
        let daoOptions = DAOOptions.parseCommandLine();
        logging.setLevel(daoOptions.logLevel);
        if(daoOptions.help) {
            util.Help.print();
            return;
        }
        let controllerDAO = new ControllerDAO(daoOptions);
        controllerDAO.start();
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    ControllerDAO.main();
    return;
}

module.exports = ControllerDAO;