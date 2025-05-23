const logging = require('dxp3-logging');
logging.setLevel(logging.Level.TRACE);

// Get a reference to our configuration code.
const configuration = require('../index');
// It is suggested to use a separate object to define all possible configuration keys.
let categories = {
    MAIN_APPLICATION:'MAIN_APP'
}
let keys = {
    PORT: 'PORT',
    PROTOCOL: 'PROTOCOL'
}
let protocol = 'https';
console.log('set main application protocol: ' + protocol);
configuration.Manager.set(categories.MAIN_APPLICATION, keys.PROTOCOL, protocol);
let port = 1234;
console.log('set port: ' + port);
configuration.Manager.set(keys.PORT, port);
// To retrieve a value use the get method and supply an optional category and a required key.
protocol = configuration.Manager.get(categories.MAIN_APPLICATION, keys.PROTOCOL);
console.log('get main application protocol: ' + protocol);
port = configuration.Manager.get(keys.PORT);
console.log('get port: ' + port);