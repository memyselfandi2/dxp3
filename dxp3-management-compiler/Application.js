const packageName = 'dxp3-management-compiler';
const moduleName = 'Application';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const rest = require('dxp3-microservice-rest');
const uuid = require('dxp3-uuid');
const util = require('dxp3-util');
const ApplicationOptions = require('./ApplicationOptions');
const Compiler = require('./Compiler');

const fileSystem = require('fs');
//const tmpFolder = 'C:\\temp\\';
const tmpFolder = path.sep + 'var' + path.sep + 'www' + path.sep;

class Application {

    constructor(args) {
        let self = this;
        self.compilerServer = new rest.RestServer({name: canonicalName, produces: 'dxp3-management-compiler'});
        self.compilerServer.addMethod('void compileApplication(String accountUUID, String loggedInUserUUID, String applicationUUID)',
                                      function(accountUUID, loggedInUserUUID, applicationUUID, response) {
            console.log('received compile application request: ' + applicationUUID);
            Compiler.compileControllers(accountUUID, loggedInUserUUID, applicationUUID);
            Compiler.compileStyles(accountUUID, loggedInUserUUID, applicationUUID);
            response.send('');
        });
        self.compilerServer.addMethod('void compileFeature(String accountUUID, String loggedInUserUUID, String featureUUID)',
                                      function(accountUUID, loggedInUserUUID, featureUUID, response) {
            console.log('received compile feature request: ' + featureUUID);
            Compiler.compileControllers(accountUUID, loggedInUserUUID, featureUUID);
            Compiler.compileLayouts(accountUUID, loggedInUserUUID, featureUUID);
            Compiler.compileStyles(accountUUID, loggedInUserUUID, featureUUID);
            response.send('');
        });
        self.compilerServer.addMethod('void compilePage(String accountUUID, String loggedInUserUUID, String pageUUID)',
                                      function(accountUUID, loggedInUserUUID, pageUUID, response) {
            console.log('received compile page request: ' + pageUUID);
            Compiler.compileControllers(accountUUID, loggedInUserUUID, pageUUID);
            Compiler.compileLayouts(accountUUID, loggedInUserUUID, pageUUID);
            Compiler.compileStyles(accountUUID, loggedInUserUUID, pageUUID);
            response.send('');
        });
        self.compilerServer.addMethod('String getCompiledController(String accountUUID, String loggedInUserUUID, String ownerUUID, String instanceID)',
                                      function(accountUUID, loggedInUserUUID, ownerUUID, instanceID, response) {
            let compiledFile = tmpFolder + ownerUUID + '_compiled.js';
console.log('received getCompiledController method call: ' + compiledFile);
            fileSystem.readFile(compiledFile, 'utf-8', function(err, data) {
                return response.send(data);
            });
        });
        self.compilerServer.addMethod('String getCompiledLayout(String accountUUID, String loggedInUserUUID, String ownerUUID, String instanceID)',
                                      function(accountUUID, loggedInUserUUID, ownerUUID, instanceID, response) {

            let compiledFile = tmpFolder + ownerUUID + '_compiled.html';
console.log('received getCompiledLayout method call: ' + compiledFile);
            fileSystem.readFile(compiledFile, 'utf-8', function(err, data) {
                return response.send(data);
            });
        });
        self.compilerServer.addMethod('String getCompiledStyle(String accountUUID, String loggedInUserUUID, String ownerUUID, String instanceID)',
                                      function(accountUUID, loggedInUserUUID, ownerUUID, instanceID, response) {
            let compiledFile = tmpFolder + ownerUUID + '_compiled.css';
            fileSystem.readFile(compiledFile, 'utf-8', function(err, data) {
                return response.send(data);
            });
        });
    }

    start() {
        let self = this;
        self.compilerServer.start();
    }

    static main() {
        let applicationOptions = ApplicationOptions.parseCommandLine();
        logging.setLevel(applicationOptions.logLevel);
        if(applicationOptions.help) {
            util.Help.print();
            return;
        }
        let application = new Application(applicationOptions);
        application.start();
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    ApplicationDAO.main();
    return;
}

module.exports = Application;