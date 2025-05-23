const packageName = 'dxp3-management-dao';
const moduleName = 'WebsiteDAO';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const microservice = require('dxp3-microservice');
const DAOArguments = require('./DAOArguments');
const DAOError = require('./DAOError');

class WebsiteDAO {
    /**
     * @constructor
     */
    constructor() {
        this.daoSubject = packageName + '-' + moduleName;
        this.daoServer = new microservice.RestServer(moduleName, this.daoSubject);
    }

    init(implementation) {
        let self = this;
        self.daoImpl = require('./' + implementation + '/WebsiteDAOImpl');
        /**********************************
         * CREATE / CONSTRUCTORS
         *********************************/
        self.daoServer.on('create', function(accountUUID, loggedInUserUUID, websiteName, description, shortName, isTemplate, callback) {
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
            WebsiteDAO.help();
        } else {
            let websiteDAO = new WebsiteDAO();
            websiteDAO.init(daoArguments.implementation);
            websiteDAO.start();
        }
    }

    static help() {
        console.log('DESCRIPTION');
        console.log('An WebsiteDAO microservice.');
        console.log('When executed on the command line you will need to specify the implementation to use.');
        console.log('One of: filesystem, mock or mongodb.');
        console.log('');
        console.log('EXAMPLE');
        console.log('node WebsiteDAO.js -loglevel info -implementation mock');
        console.log('node WebsiteDAO.js -loglevel warn -implementation filesystem');
    }
}

WebsiteDAO.main();