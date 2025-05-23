const packageName = 'dxp3-management-dao';
const moduleName = 'UserDAO';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const microservice = require('dxp3-microservice');
const DAOArguments = require('./DAOArguments');

class UserDAO {
    /**
     * @constructor
     */
    constructor() {
        this.daoSubject = packageName + '-' + moduleName;
        this.daoServer = new microservice.RestServer(moduleName, this.daoSubject);
    }

    init(implementation) {
        let self = this;
        self.daoImpl = require('./' + implementation + '/UserDAOImpl');
		/**********************************
		 * CREATE / CONSTRUCTORS
		 *********************************/

		// No creation allowed. You'll need to go through the security system.

		/**********************************
		 * READ / GETTERS
		 *********************************/
        self.daoServer.on('list', function(accountUUID, loggedInUserUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback) {
            daoImpl.list(accountUUID, loggedInUserUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback);
        });
        self.daoServer.on('listAccounts', function(accountUUID, loggedInUserUUID, userUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback) {
            daoImpl.list(accountUUID, loggedInUserUUID, userUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback);
        });
		/**********************************
		 * UPDATE / SETTERS
		 *********************************/
        self.daoServer.on('addAccount', function(accountUUID, loggedInUserUUID, userUUID, accountUUID, callback) {
            self.daoImpl.addAccount(accountUUID, loggedInUserUUID, userUUID, accountUUID, callback);
        });
		self.daoServer.on('categorize', function(accountUUID, loggedInUserUUID, userUUID, categoryUUID, callback) {
		    daoImpl.categorize(accountUUID, loggedInUserUUID, userUUID, categoryUUID, callback);
		});
		self.daoServer.on('decategorize', function(accountUUID, loggedInUserUUID, userUUID, categoryUUID, callback) {
		    daoImpl.decategorize(accountUUID, loggedInUserUUID, userUUID, categoryUUID, callback);
		});
		/**********************************
		 * DELETE
		 *********************************/
		self.daoServer.on('delete', function(accountUUID, loggedInUserUUID, userUUID, callback) {
		    daoImpl.delete(accountUUID, loggedInUserUUID, userUUID, callback);
		});
	}

    start() {
        let self = this;
        self.daoServer.start();
    }

    static main() {
        let daoArguments = DAOArguments.parseCommandLine();
        logging.setLevel(daoArguments.logLevel);
        if(daoArguments.help) {
            UserDAO.help();
        } else {
            let userDAO = new UserDAO();
            userDAO.init(daoArguments.implementation);
            userDAO.start();
        }
    }

    static help() {
        console.log('DESCRIPTION');
        console.log('An UserDAO microservice.');
        console.log('When executed on the command line you will need to specify the implementation to use.');
        console.log('One of: filesystem, mock or mongodb.');
        console.log('');
        console.log('EXAMPLE');
        console.log('node UserDAO.js -loglevel info -implementation mock');
        console.log('node UserDAO.js -loglevel warn -implementation filesystem');
    }
}

UserDAO.main();