const packageName = 'dxp3-management-dao';
const moduleName = 'LayoutDAO';
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
class LayoutDAO {

    constructor(args) {
        let self = this;
        args = DAOOptions.parse(args);
        let daoServerOptions = {
            name: canonicalName,
            port: args.port,
            produces: 'dxp3-management-dao-LayoutDAO',
            timeout: args.timeout
        }
        self.daoServer = new rest.RestServer(daoServerOptions);
        let daoImplClass = require('./' + args.implementation + '/LayoutDAOImpl');
        self.daoImpl = new daoImplClass(args.daoImplOptions);
		/**********************************
		 * CREATE / CONSTRUCTORS
		 *********************************/
		self.daoServer.addMethod('Object create(String accountUUID, String loggedInUserUUID, String ownerUUID, String layoutName, String description, String code)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, layoutName, description, code, response) {
			self.daoImpl.create(accountUUID, loggedInUserUUID, ownerUUID, layoutName, description, code, response);
		});
		/**********************************
		 * READ / GETTERS
		 *********************************/
		self.daoServer.addMethod('Object get(String accountUUID, String loggedInUserUUID, String ownerUUID, String layoutUUID)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, layoutUUID, response) {
		    self.daoImpl.get(accountUUID, loggedInUserUUID, ownerUUID, layoutUUID, response);
		});
		self.daoServer.addMethod('Object list(String accountUUID, String loggedInUserUUID, String ownerUUID, Number startIndex, Number maximumNumberOfResults, String categorizedAs, Object filterBy, Object sortBy)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, response) {
		    self.daoImpl.list(accountUUID, loggedInUserUUID, ownerUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, response);
		});
		/**********************************
		 * UPDATE / SETTERS
		 *********************************/
		self.daoServer.addMethod('Boolean categorize(String accountUUID, String loggedInUserUUID, String layoutUUID, String categoryUUID)',
								 function(accountUUID, loggedInUserUUID, layoutUUID, categoryUUID, response) {
		    self.daoImpl.categorize(accountUUID, loggedInUserUUID, layoutUUID, categoryUUID, response);
		});
		self.daoServer.addMethod('Boolean decategorize(String accountUUID, String loggedInUserUUID, String layoutUUID, String categoryUUID)',
								 function(accountUUID, loggedInUserUUID, layoutUUID, categoryUUID, response) {
		    self.daoImpl.decategorize(accountUUID, loggedInUserUUID, layoutUUID, categoryUUID, response);
		});
		self.daoServer.addMethod('Object update(String accountUUID, String loggedInUserUUID, String ownerUUID, String layoutUUID, String layoutName, String description, String code)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, layoutUUID, layoutName, description, code, response) {
		    self.daoImpl.update(accountUUID, loggedInUserUUID, ownerUUID, layoutUUID, layoutName, description, code, response);
		});
		/**********************************
		 * DELETE
		 *********************************/
		self.daoServer.addMethod('Object delete(String accountUUID, String loggedInUserUUID, String ownerUUID, String layoutUUID)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, layoutUUID, response) {
		    self.daoImpl.delete(accountUUID, loggedInUserUUID, ownerUUID, layoutUUID, response);
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
        let layoutDAO = new LayoutDAO(daoOptions);
        layoutDAO.start();
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    LayoutDAO.main();
    return;
}

module.exports = LayoutDAO;