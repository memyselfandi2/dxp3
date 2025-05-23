/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-cleanup
 *
 * NAME
 * index
 */
const packageName = 'dxp3-cleanup';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @file
 * <p>The dxp3-cleanup module allows objects to register and get notified when
 * the application/process exits. Typically there are three ways an application is
 * stopped: 1) It finishes normally, 2) It is interrupted, or 3) it is killed.<br/>
 * This module is to be used as a library as it does not contain any executable class.</p>
 * @example
 * // Get a reference to our cleanup code.
 * const cleanup = require('dxp3-cleanup');
 * // Make sure to initialize our cleanup manager.
 * // We may opt to omit this call, because the first function that registers will
 * // automatically initialize our cleanup manager. 
 * cleanup.Manager.init();
 * // Next we are ready to register cleanup functions.
 * cleanup.Manager.addFinishListener(()) => {
 *   // listener code here...
 *   // This listener is executed when the exit code of the process exit event is 0.
 *   // It indicates a normal termination. The program has reached its end.
 *   console.log('The application has finished.');
 *   console.log('Maybe there is some cleanup to do before we completely exit.');
 * });
 * cleanup.Manager.addInterruptListener(() => {
 *     // listener code here...
 *     console.log('The application has been interrupted.');
 *     console.log('Lets do some cleanup before we completely exit.');
 *     // One could choose to kill the process when interrupted.
 *     process.exit(10);
 * });
 * cleanup.Manager.addKillListener(() => {
 *     // kill code here...
 *     console.log('The application has been killed.');
 *     console.log('Lets attempt to do some cleanup before we completely exit.');
 * });
 * @author Patrick Versteeg
 */

/**
 * <p>The dxp3-cleanup module allows objects to register and get notified when
 * the application/process exits. It is to be used as a library as it does not
 * contain any executable class.
 * Make sure this local module is defined as a dependency in your package.json.
 * Typically the dependency is defined by a file reference using a relative path.
 * Obviously that relative path may be different for different modules.<br/>
 * Here is an example of such a dependency in a package.json:<br/>
 * "dependencies": {<br/>
 *     "dxp3-cleanup": "file:../../../local_modules/dxp3-cleanup"<br/>
 * }<br/>
 * </p>
 * @example
 * // Get a reference to our cleanup code.
 * const cleanup = require('dxp3-cleanup');
 * // Make sure to initialize our cleanup manager.
 * // We may opt to omit this call, because the first function that registers will
 * // automatically initialize our cleanup manager. 
 * cleanup.Manager.init();
 * // Next we are ready to register cleanup functions.
 * cleanup.Manager.addFinishListener(()) => {
 *   // listener code here...
 *   // This listener is executed when the exit code of the process exit event is 0.
 *   // It indicates a normal termination. The program has reached its end.
 *   console.log('The application has finished.');
 *   console.log('Maybe there is some cleanup to do before we completely exit.');
 * });
 * cleanup.Manager.addInterruptListener(() => {
 *     // listener code here...
 *     console.log('The application has been interrupted.');
 *     console.log('Lets do some cleanup before we completely exit.');
 *     // One could choose to kill the process when interrupted.
 *     process.exit(10);
 * });
 * cleanup.Manager.addKillListener(() => {
 *     // kill code here...
 *     console.log('The application has been killed.');
 *     console.log('Lets attempt to do some cleanup before we completely exit.');
 * });
 *
 * @module dxp3-cleanup
 */
const util = require('dxp3-util');

const cleanup = {};

cleanup.Manager = require('./Manager');

// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print();
   return;
}
module.exports = cleanup;