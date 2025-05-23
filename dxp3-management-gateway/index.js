/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-management-gateway
 *
 * NAME
 * index
 */
const packageName = 'dxp3-management-gateway';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * <p>This is the gateway of our management platform.<br/>
 * It forwards requests to the API and UI backends. It uses the URL path to decide which requests go where.<br/>
 * It reads options from the command line and/or from the environment.</p>
 *
 * <p>Please refer to {@link module:dxp3-management-gateway/ApplicationOptions} for available options.</p>
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
 * Here is an example of how to filter specific logging:
 * node index.js -log * off -log *UDPServer* info -log *Scout* debug -port 81
 *
 * @module dxp3-management-gateway
 */
const Application = require('./Application');

Application.main();