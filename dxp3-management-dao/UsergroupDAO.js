const packageName = 'dxp3-management-dao';
const moduleName = 'UsergroupDAO';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const microservice = require('dxp3-microservice');
const DAOArguments = require('./DAOArguments');

class UsergroupDAO {
    /**
     * @constructor
     */
    constructor() {
        this.daoSubject = packageName + '-' + moduleName;
        this.daoServer = new microservice.RestServer(moduleName, this.daoSubject);
    }

    init(implementation) {
        let self = this;
        self.daoImpl = require('./' + implementation + '/UsergroupDAOImpl');
        /**********************************
         * CREATE / CONSTRUCTORS
         *********************************/
        self.daoServer.on('create', function(accountUUID, loggedInUserUUID, applicationUUID, parentUUIDs, usergroupName, description, callback) {
            self.daoImpl.create(accountUUID, loggedInUserUUID, applicationUUID, parentUUIDs, usergroupName, description, callback);
        });
        /**********************************
         * READ / GETTERS
         *********************************/
        self.daoServer.on('get', function(accountUUID, loggedInUserUUID, usergroupUUID, callback) {
            self.daoImpl.get(accountUUID, loggedInUserUUID, usergroupUUID, callback);
        });
        self.daoServer.on('list', function(accountUUID, loggedInUserUUID, applicationUUID, parentUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback) {
            self.daoImpl.list(accountUUID, loggedInUserUUID, applicationUUID, parentUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback);
        });
        self.daoServer.on('listUsers', function(accountUUID, loggedInUserUUID, usergroupUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback) {
            self.daoImpl.list(accountUUID, loggedInUserUUID, usergroupUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback);
        });
        /**********************************
         * UPDATE / SETTERS
         *********************************/
        self.daoServer.on('addUser', function(accountUUID, loggedInUserUUID, usergroupUUID, userUUID, callback) {
            self.daoImpl.addUser(accountUUID, loggedInUserUUID, usergroupUUID, userUUID, callback);
        });
        self.daoServer.on('categorize', function(accountUUID, loggedInUserUUID, usergroupUUID, categoryUUID, callback) {
            self.daoImpl.categorize(accountUUID, loggedInUserUUID, usergroupUUID, categoryUUID, callback);
        });
        self.daoServer.on('decategorize', function(accountUUID, loggedInUserUUID, usergroupUUID, categoryUUID, callback) {
            self.daoImpl.decategorize(accountUUID, loggedInUserUUID, usergroupUUID, categoryUUID, callback);
        });
        self.daoServer.on('deleteUser', function(accountUUID, loggedInUserUUID, usergroupUUID, userUUID, callback) {
            self.daoImpl.deleteUser(accountUUID, loggedInUserUUID, usergroupUUID, userUUID, callback);
        });
        self.daoServer.on('update', function(accountUUID, loggedInUserUUID, usergroupUUID, parentUUIDs, usergroupName, description, callback) {
            self.daoImpl.update(accountUUID, loggedInUserUUID, usergroupUUID, parentUUIDs, usergroupName, description, callback);
        });
        /**********************************
         * DELETE
         *********************************/
        self.daoServer.on('delete', function(accountUUID, loggedInUserUUID, usergroupUUID, callback) {
            self.daoImpl.delete(accountUUID, loggedInUserUUID, usergroupUUID, callback);
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
            UsergroupDAO.help();
        } else {
            let usergroupDAO = new UsergroupDAO();
            usergroupDAO.init(daoArguments.implementation);
            usergroupDAO.start();
        }
    }

    static help() {
        console.log('DESCRIPTION');
        console.log('An UsergroupDAO microservice.');
        console.log('When executed on the command line you will need to specify the implementation to use.');
        console.log('One of: filesystem, mock or mongodb.');
        console.log('');
        console.log('EXAMPLE');
        console.log('node UsergroupDAO.js -loglevel info -implementation mock');
        console.log('node UsergroupDAO.js -loglevel warn -implementation filesystem');
    }
}

UsergroupDAO.main();