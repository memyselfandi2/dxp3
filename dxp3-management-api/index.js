/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-management-api
 *
 * NAME
 * index
 */
const packageName = 'dxp3-management-api';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * <p>This is the entry point to get the application programming interface up and running.
 * It reads options from the command line and/or from the environment.</p>
 *
 * <p>Please refer to {@link module:dxp3-management-api/ApplicationOptions} for available options.</p>
 *
 * @example
 * Standard execution with all default settings:
 * node index.js
 *
 * To get help type the following from the command line:
 * node index.js -help
 *
 * Alternatively to get help you can use the npm run command as the help option has been added to the package.json:
 * npm run help
 *
 * To filter specific logging:
 * node index.js -log * off -log *UDPServer* info -log *Scout* debug -port 5000
 *
 * @module dxp3-management-api
 */
const Application = require('./Application');

Application.main();