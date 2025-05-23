const packageName = 'dxp3-management-dao';
const moduleName = 'StyleDAO';
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
class StyleDAO {

    constructor(args) {
        let self = this;
        args = DAOOptions.parse(args);
        let daoServerOptions = {
            name: canonicalName,
            port: args.port,
            produces: 'dxp3-management-dao-StyleDAO',
            timeout: args.timeout
        }
        self.daoServer = new rest.RestServer(daoServerOptions);
        let daoImplClass = require('./' + args.implementation + '/StyleDAOImpl');
        self.daoImpl = new daoImplClass(args.daoImplOptions);
		/**********************************
		 * CREATE / CONSTRUCTORS
		 *********************************/
		self.daoServer.addMethod('Object create(String accountUUID, String loggedInUserUUID, String ownerUUID, String styleName, String description, String code)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, styleName, description, code, response) {
			self.daoImpl.create(accountUUID, loggedInUserUUID, ownerUUID, styleName, description, code, response);
		});
		/**********************************
		 * READ / GETTERS
		 *********************************/
		self.daoServer.addMethod('Object get(String accountUUID, String loggedInUserUUID, String ownerUUID, String styleUUID)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, styleUUID, response) {
		    self.daoImpl.get(accountUUID, loggedInUserUUID, ownerUUID, styleUUID, response);
		});
		self.daoServer.addMethod('Object list(String accountUUID, String loggedInUserUUID, String ownerUUID, Number startIndex, Number maximumNumberOfResults, String categorizedAs, Object filterBy, Object sortBy)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, response) {
		    self.daoImpl.list(accountUUID, loggedInUserUUID, ownerUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, response);
		});
		/**********************************
		 * UPDATE / SETTERS
		 *********************************/
		self.daoServer.addMethod('Boolean categorize(String accountUUID, String loggedInUserUUID, String styleUUID, String categoryUUID)',
								 function(accountUUID, loggedInUserUUID, styleUUID, categoryUUID, response) {
		    self.daoImpl.categorize(accountUUID, loggedInUserUUID, styleUUID, categoryUUID, response);
		});
		self.daoServer.addMethod('Boolean decategorize(String accountUUID, String loggedInUserUUID, String styleUUID, String categoryUUID)',
								 function(accountUUID, loggedInUserUUID, styleUUID, categoryUUID, response) {
		    self.daoImpl.decategorize(accountUUID, loggedInUserUUID, styleUUID, categoryUUID, response);
		});
		self.daoServer.addMethod('Object update(String accountUUID, String loggedInUserUUID, String ownerUUID, String styleUUID, String styleName, String description, String code)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, styleUUID, styleName, description, code, response) {
		    self.daoImpl.update(accountUUID, loggedInUserUUID, ownerUUID, styleUUID, styleName, description, code, response);
		});
		/**********************************
		 * DELETE
		 *********************************/
		self.daoServer.addMethod('Object delete(String accountUUID, String loggedInUserUUID, String ownerUUID, String styleUUID)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, styleUUID, response) {
		    self.daoImpl.delete(accountUUID, loggedInUserUUID, ownerUUID, styleUUID, response);
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
        let styleDAO = new StyleDAO(daoOptions);
        styleDAO.start();
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    StyleDAO.main();
    return;
}

module.exports = StyleDAO;