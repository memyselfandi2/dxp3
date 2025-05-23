const packageName = 'dxp3-management-dao';
const moduleName = 'FolderDAO';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const microservice = require('dxp3-microservice');
const DAOArguments = require('./DAOArguments');
const DAOError = require('./DAOError');

class FolderDAO {

	constructor() {
        this.daoSubject = packageName + '-' + moduleName;
        this.daoServer = new microservice.RestServer(moduleName, this.daoSubject);
	}

	init(implementation) {
        let self = this;
        self.daoImpl = require('./' + implementation + '/FolderDAOImpl');
        /**********************************
         * CREATE / CONSTRUCTORS
         *********************************/
        self.daoServer.on('create', function(accountUUID, loggedInUserUUID, applicationUUID, folderName, parentUUID, shortName, isTemplate, callback) {
            self.daoImpl.create(accountUUID, loggedInUserUUID, applicationName, description, parentUUIDs, shortName, isTemplate, callback);
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
            FolderDAO.help();
        } else {
            let folderDAO = new FolderDAO();
            folderDAO.init(daoArguments.implementation);
            folderDAO.start();
        }
    }

    static help() {
        console.log('DESCRIPTION');
        console.log('A FolderDAO microservice.');
        console.log('When executed on the command line you will need to specify the implementation to use.');
        console.log('One of: filesystem, mock or mongodb.');
        console.log('');
        console.log('EXAMPLE');
        console.log('node FolderDAO.js -loglevel info -implementation mock');
        console.log('node FolderDAO.js -loglevel warn -implementation filesystem');
    }
}

FolderDAO.main();