/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-delivery
 *
 * NAME
 * index
 */
const packageName = 'dxp3-delivery';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * <p>This is the entry point to get the full suite of delivery services up and running.
 * It reads options from the command line and/or from the environment.</p>
 *
 * <p>Please refer to {@link module:dxp3-microservice-platform/ApplicationOptions} for available options.</p>
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
 * @module dxp3-delivery
 */
const platform = require('dxp3-microservice-platform');

platform.Application.main();