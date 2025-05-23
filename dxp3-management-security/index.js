/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-management-security
 *
 * NAME
 * index
 */
const packageName = 'dxp3-management-security';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;

const Application = require('./Application');

Application.main();