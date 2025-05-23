const packageName = 'dxp3-management-dao';
const moduleName = 'ImageDAO';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
const logging = require('dxp3-logging');
const rest = require('dxp3-microservice-rest');
const DAOOptions = require('./DAOOptions');
const DAOError = require('./DAOError');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class ImageDAO {

    constructor(args) {
        let self = this;
        args = DAOOptions.parse(args);
        let daoServerOptions = {
            name: canonicalName,
            port: args.port,
            produces: 'dxp3-management-dao-ImageDAO',
            timeout: args.timeout
        }
        self.daoServer = new rest.RestServer(daoServerOptions);
        let daoImplClass = require('./' + args.implementation + '/ImageDAOImpl');
        self.daoImpl = new daoImplClass(args.daoImplOptions);
		/**********************************
		 * CREATE / CONSTRUCTORS
		 *********************************/
		self.daoServer.addMethod('Object create(String accountUUID, String loggedInUserUUID, String ownerUUID, String imageName, String fileName, String description, File imageStream)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, imageName, fileName, description, imageStream, response) {
			self.daoImpl.create(accountUUID, loggedInUserUUID, ownerUUID, imageName, fileName, description, imageStream, response);
		});
		/**********************************
		 * READ / GETTERS
		 *********************************/
		self.daoServer.addMethod('File get(String accountUUID, String loggedInUserUUID, String ownerUUID, String imageUUID)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, imageUUID, response) {
			self.daoImpl.get(accountUUID, loggedInUserUUID, ownerUUID, imageUUID, response);
		});

		self.daoServer.addMethod('Object list(String accountUUID, String loggedInUserUUID, String ownerUUID, Number startIndex, Number maximumNumberOfResults, String categorizedAs, Object filterBy, Object sortBy)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, response) {
		    self.daoImpl.list(accountUUID, loggedInUserUUID, ownerUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, response);
		});
		/**********************************
		 * UPDATE / SETTERS
		 *********************************/
		self.daoServer.addMethod('Boolean categorize(String accountUUID, String loggedInUserUUID, String imageUUID, String categoryUUID)',
								 function(accountUUID, loggedInUserUUID, imageUUID, categoryUUID, response) {
		    self.daoImpl.categorize(accountUUID, loggedInUserUUID, imageUUID, categoryUUID, response);
		});
		self.daoServer.addMethod('Boolean decategorize(String accountUUID, String loggedInUserUUID, String imageUUID, String categoryUUID)',
								 function(accountUUID, loggedInUserUUID, imageUUID, categoryUUID, response) {
		    self.daoImpl.decategorize(accountUUID, loggedInUserUUID, imageUUID, categoryUUID, response);
		});
		self.daoServer.addMethod('Object update(String accountUUID, String loggedInUserUUID, String ownerUUID, String imageUUID, String imageName, String description, File imageStream)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, imageUUID, imageName, description, imageStream, response) {
		    self.daoImpl.update(accountUUID, loggedInUserUUID, ownerUUID, imageUUID, imageName, description, imageStream, response);
		});
		/**********************************
		 * DELETE
		 *********************************/
		self.daoServer.addMethod('Object delete(String accountUUID, String loggedInUserUUID, String ownerUUID, String imageUUID)',
								 function(accountUUID, loggedInUserUUID, ownerUUID, imageUUID, response) {
		    self.daoImpl.delete(accountUUID, loggedInUserUUID, ownerUUID, imageUUID, response);
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
            util.Help.print(this);
            return;
        }
        let imageDAO = new ImageDAO(daoOptions);
        imageDAO.start();
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    ImageDAO.main();
    return;
}

module.exports = ImageDAO;