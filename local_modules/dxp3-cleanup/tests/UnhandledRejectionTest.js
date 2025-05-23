const logging = require('dxp3-logging');
logging.setLevel(logging.Level.TRACE);

const cleanup = require('../index');

cleanup.Manager.addFinishListener(() => {
	console.log('Apparently we have finished. This was a normal termination. Lets clean up.');
});

cleanup.Manager.addInterruptListener(() => {
	console.log('Apparently we have been interrupted. Should we clean up?');
	console.log('Lets kill this application.');
	process.exit(9);
});

cleanup.Manager.addKillListener((_exitCode) => {
	console.log('Apparently we are exiting. Cleaned up.');
	console.log('Exit code is: \'' + _exitCode + '\'.');
});

let numberOfMilliseconds = 5000;
let numberOfSeconds = numberOfMilliseconds/1000;
console.log('Waiting ' + numberOfSeconds + ' seconds before we exit.');

setTimeout(() => {
	console.log('5 seconds are up. Exiting...');
}, numberOfMilliseconds);

Promise.reject(new Error('Test Unhandled Rejection'));