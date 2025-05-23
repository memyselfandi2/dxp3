****************************************
* DXP3 - Digital Experience Platform 3 *
*                                      *
* MODULE: dxp3-logging                 *
****************************************
The dxp3-logging module allows objects to log trace, debug, info, warning, error and
fatal messages. It is to be used as a library as it does not contain any executable class.
Make sure this local module is defined as a dependency in your package.json.
Typically the dependency is defined by a file reference using a relative path.
Obviously that relative path may be different for different modules.
Here is an example of such a dependency in a package.json:
"dependencies": {
  "dxp3-logging": "file:../../../local_modules/dxp3-logging"
}

****************************************
* CODE EXAMPLES                        *
****************************************

// Get a reference to our logging module.
const logging = require('dxp3-logging');
// There are effectively 6 different log levels:
// Level.TRACE, Level.DEBUG, Level.INFO, Level.WARN, Level.ERROR, Level.FATAL
// There are also several convenient aliases in case you'd like to use different terms:
// Level.INFORMATION (same as INFO), Level.WARNING (same as WARN),
// Level.ERR (same as ERROR) and Level.EXCEPTION (same as ERROR).
// If you do not want any logging simply set the level to Level.OFF.
const Level = logging.Level;
// You can either use the Level class, a String or an integer to set the level.
logging.setLevel(Level.WARN);
// Loggers are identified by name.
// Here is an example of how to create loggers for different
// parts of the application:
const loggerAPI = logging.getLogger('logger API');
const loggerUI = logging.getLogger('logger UI')
const logger = logging.getLogger('MAIN LOGGER');
logger.trace('this is a trace test.');
logger.debug('this is a debug test.');
logger.info('this is an info test.');
logger.warn('this is a warn test.');
logger.error('this is an error test.');
logger.fatal('this is a fatal test.');
// Each logger has its own log level.
// Set the level for the loggerAPI:
loggerAPI.setLevel(logging.Level.INFO);
// Alternatively you can use the logging class to accomplish the same task:
logging.setLevel('logger API', logging.Level.INFO);
// Set the level for the loggerUI:
loggerUI.setLevel(logging.Level.WARN);
// Alternatively we could have set all loggers to a certain level. Like so:
logging.setLevel(logging.Level.DEBUG);
// Or we can use wildcards. Like so:
logging.setLevel('*API,*UI', [Level.INFO, Level.WARN]);
// Or alternatively:
logging.setLevel('*API,*UI', 'info,warn');
loggerAPI.info('Started');
// For example this is how to turn off low level UDP logging:
logging.setLevel('*UDP*', Level.OFF);
// How to log a warning message:
loggerUI.warn('Unable to read configuration. Using defaults.');