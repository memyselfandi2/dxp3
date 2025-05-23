const packageName = 'dxp3-management-dao';
const moduleName = 'PageDAO';
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
class PageDAO {

    constructor(args) {
        let self = this;
        args = DAOOptions.parse(args);
        let daoServerOptions = {
            name: canonicalName,
            port: args.port,
            produces: 'dxp3-management-dao-PageDAO',
            timeout: args.timeout
        }
        self.daoServer = new rest.RestServer(daoServerOptions);
        let daoImplClass = require('./' + args.implementation + '/PageDAOImpl');
        self.daoImpl = new daoImplClass(args.daoImplOptions);
        /**********************************
         * CREATE / CONSTRUCTORS
         *********************************/
        self.daoServer.addMethod('Object create(String accountUUID, String loggedInUserUUID, String applicationUUID, String pageName, String description, Array<String> parentUUIDs, Boolean isTemplate, String title, String url)',
                                 function(accountUUID, loggedInUserUUID, applicationUUID, pageName, description, parentUUIDs, isTemplate, title, url, response) {
            self.daoImpl.create(accountUUID, loggedInUserUUID, applicationUUID, pageName, description, parentUUIDs, isTemplate, title, url, response);
        });
        /**********************************
         * READ / GETTERS
         *********************************/
        self.daoServer.addMethod('Object get(String accountUUID, String loggedInUserUUID, String pageUUID)',
                                 function(accountUUID, loggedInUserUUID, pageUUID, response) {
            self.daoImpl.get(accountUUID, loggedInUserUUID, pageUUID, response);
        });
        self.daoServer.addMethod('Object list(String accountUUID, String loggedInUserUUID, String applicationUUID, String parentUUID, Number startIndex, Number maximumNumberOfResults, Object categorizedAs, Object filterBy, Object sortBy)',
                                 function(accountUUID, loggedInUserUUID, applicationUUID, parentUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, response) {
            self.daoImpl.list(accountUUID, loggedInUserUUID, applicationUUID, parentUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, response);
        });
        /**********************************
         * UPDATE / SETTERS
         *********************************/
        self.daoServer.addMethod('Boolean categorize(String accountUUID, String loggedInUserUUID, String applicationUUID, String categoryUUID)',
                                 function(accountUUID, loggedInUserUUID, pageUUID, categoryUUID, response) {
            self.daoImpl.categorize(accountUUID, loggedInUserUUID, applicationUUID, categoryUUID, response);
        });
        self.daoServer.addMethod('Boolean decategorize(String accountUUID, String loggedInUserUUID, String pageUUID, String categoryUUID)',
                                 function(accountUUID, loggedInUserUUID, pageUUID, categoryUUID, response) {
            self.daoImpl.decategorize(accountUUID, loggedInUserUUID, applicationUUID, categoryUUID, response);
        });
        self.daoServer.addMethod('Object update(String accountUUID, String loggedInUserUUID, String pageUUID, String pageName, String description, Array<String> parentUUIDs, Boolean isTemplate, String title, String url)',
                                 function(accountUUID, loggedInUserUUID, pageUUID, pageName, description, parentUUIDs, isTemplate, title, url, response) {
            self.daoImpl.update(accountUUID, loggedInUserUUID, pageUUID, pageName, description, parentUUIDs, isTemplate, title, url, response);
        });
        /**********************************
         * DELETE
         *********************************/
        self.daoServer.addMethod('Object delete(String accountUUID, String loggedInUserUUID, String pageUUID)',
                                 function(accountUUID, loggedInUserUUID, pageUUID, response) {
            self.daoImpl.delete(accountUUID, loggedInUserUUID, pageUUID, response);
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
        let pageDAO = new PageDAO(daoOptions);
        pageDAO.start();
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    PageDAO.main();
    return;
}

module.exports = PageDAO;