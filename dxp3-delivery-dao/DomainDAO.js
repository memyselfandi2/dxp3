/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-delivery-dao
 *
 * NAME
 * DomainDAO
 */
const packageName = 'dxp3-delivery-dao';
const moduleName = 'DomainDAO';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-delivery-dao/DomainDAO
 */
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const rest = require('dxp3-microservice-rest');
const cache = require('dxp3-microservice-cache');
const DAOOptions = require('./DAOOptions');
const DAOError = require('./DAOError');
const util = require('dxp3-util');
/**
 * A DomainDAO.
 */
class DomainDAO {

    constructor(_options) {
        logger.trace('constructor(): start.');
        let self = this;
        _options = DAOOptions.parse(_options);
        self.daoServer = new rest.RestServer({name: canonicalName, produces: 'dxp3-delivery-dao-DomainDAO'});
        self.cacheClient = new cache.CacheClient({name: canonicalName, consumes: 'dxp3-cache'});
        let daoImplClass = require('./' + _options.implementation + '/DomainDAOImpl');
        self.daoImpl = new daoImplClass(_options.daoImplOptions);
        /**********************************
        * READ / GETTERS
        *********************************/
        self.daoServer.addMethod('Object get(String domain)', function(domain, response) {
            // All arguments are mandatory.
            if(arguments.length != 2) {
                // Last one will be the callback
                let response = arguments[arguments.length - 1];
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            self.daoImpl.get(domain, response);
        });
        logger.trace('constructor(): end.');
    }

    start() {
        logger.trace('start(): start.');
        this.cacheClient.start();
        this.daoServer.start();
        logger.trace('start(): end.');
    }

    static main() {
        let daoOptions = DAOOptions.parseCommandLine();
        logging.setLevel(daoOptions.logLevel);
        if(daoOptions.help) {
            util.Help.print(DomainDAO);
            return;
        }
        let domainDAO = new DomainDAO(daoOptions);
        domainDAO.start();
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    DomainDAO.main();
    return;
}
module.exports = DomainDAO;