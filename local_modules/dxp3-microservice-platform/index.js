/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-platform
 *
 * NAME
 * index
 */
const packageName = 'dxp3-microservice-platform';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-microservice-platform
 */
const util = require('dxp3-util');

const platform = {};

/** @member {module:dxp3-microservice-platform/Application} Application */
platform.Application = require('./Application');
/** @member {module:dxp3-microservice-platform/ApplicationOptions} ApplicationOptions */
platform.ApplicationOptions = require('./ApplicationOptions');
/** @member {module:dxp3-microservice-platform/ApplicationDefaults} ApplicationDefaults */
platform.ApplicationDefaults = require('./ApplicationDefaults');

// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
module.exports = platform;