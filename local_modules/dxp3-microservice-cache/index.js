/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-cache
 *
 * NAME
 * index
 */
const packageName = 'dxp3-microservice-cache';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-microservice-cache
 */
const cache = {};

/** @member {module:dxp3-microservice-cache/CacheClient} CacheClient */
cache.CacheClient = require('./CacheClient');
/** @member {module:dxp3-microservice-cache/CacheClientOptions} CacheClientOptions */
cache.CacheClientOptions = require('./CacheClientOptions');
/** @member {module:dxp3-microservice-cache/CacheServer} CacheServer */
cache.CacheServer = require('./CacheServer');

module.exports = cache;