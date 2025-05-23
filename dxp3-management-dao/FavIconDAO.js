const packageName = 'dxp3-management-dao';
const moduleName = 'FavIconDAO';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const microservice = require('dxp3-microservice');
const DAOArguments = require('./DAOArguments');
const DAOError = require('./DAOError');
/**
 * @class
 */
class FavIconDAO {
	/**
	 * @constructor
	 */
	constructor() {
        this.daoSubject = packageName + '-' + moduleName;
        this.daoServer = new microservice.RestServer(moduleName, this.daoSubject);
	}

	init(implementation) {
        let self = this;
        self.daoImpl = require('./' + implementation + '/FavIconDAOImpl');
        /**********************************
		 * CREATE / CONSTRUCTORS
		 *********************************/
		self.daoServer.on('create', function(accountUuid, loggedInUserUuid, applicationUuid, callback) {
		    self.daoImpl.create(accountUuid, loggedInUserUuid, applicationUuid, callback);
		});
		/**********************************
		 * READ / GETTERS
		 *********************************/
		self.daoServer.on('get', function(accountUuid, loggedInUserUuid, favIconUuid, callback) {
		    self.daoImpl.get(accountUuid, loggedInUserUuid, favIconUuid, callback);
		});
		self.daoServer.on('getByApplicationUuid', function(accountUuid, loggedInUserUuid, applicationUuid, callback) {
		    self.daoImpl.getByApplicationUuid(accountUuid, loggedInUserUuid, applicationUuid, callback);
		});
		/**********************************
		 * UPDATE / SETTERS
		 *********************************/
		self.daoServer.on('update', function(accountUuid, loggedInUserUuid, favIconUuid, callback) {
		    self.daoImpl.update(accountUuid, loggedInUserUuid, favIconUuid, callback);
		});
		self.daoServer.on('updateByApplicationUuid', function(accountUuid, loggedInUserUuid, applicationUuid, callback) {
		    self.daoImpl.updateByApplicationUuid(accountUuid, loggedInUserUuid, applicationUuid, callback);
		});
		/**********************************
		 * DELETE
		 *********************************/
		self.daoServer.on('delete', function(accountUuid, loggedInUserUuid, favIconUuid, callback) {
		    self.daoImpl.delete(accountUuid, loggedInUserUuid, favIconUuid, callback);
		});
		self.daoServer.on('deleteByApplicationUuid', function(accountUuid, loggedInUserUuid, applicationUuid, callback) {
		    self.daoImpl.deleteByApplicationUuid(accountUuid, loggedInUserUuid, applicationUuid, callback);
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
            FavIconDAO.help();
        } else {
            let favIconDAO = new FavIconDAO();
            favIconDAO.init(daoArguments.implementation);
            favIconDAO.start();
        }
    }

    static help() {
        console.log('DESCRIPTION');
        console.log('An FavIconDAO microservice.');
        console.log('When executed on the command line you will need to specify the implementation to use.');
        console.log('One of: filesystem, mock or mongodb.');
        console.log('');
        console.log('EXAMPLE');
        console.log('node FavIconDAO.js -loglevel info -implementation mock');
        console.log('node FavIconDAO.js -loglevel warn -implementation filesystem');
    }
}

FavIconDAO.main();