/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-email
 *
 * NAME
 * Application
 */
const packageName = 'dxp3-email';
const moduleName = 'Application';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-email/Application
 */
const ApplicationOptions = require('./ApplicationOptions');
const cleanup = require('dxp3-cleanup');
const EmailError = require('./EmailError');
const logging = require('dxp3-logging');
const nodemailer = require('nodemailer');
const rest = require('dxp3-microservice-rest');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class Application {

    constructor(args) {
        let self = this;
        // Make sure we gracefully shutdown when asked to do so.
        // We can register our own clean up function with the cleanupManager (configured in the package.json)
        cleanup.Manager.init();
        cleanup.Manager.addKillListener(self.cleanup);
        args = ApplicationOptions.parse(args);
        self.smtpHost = args.smtpHost;
        self.smtpPort = args.smtpPort;
        self.userName = 'versteegpatrick@gmail.com';
        self.password = 'arpfdpzmrltqjagy';

        console.log('host: ' + self.smtpHost + ' port:' + self.smtpPort);
        let emailServerArguments = {
            name: canonicalName,
            produces: 'dxp3-email'
        }
        self.emailServer = new rest.RestServer(emailServerArguments);
        self.emailServer.addMethod('void send(String from, String to, String subject, String text, String html)', async function(from, to, subject, text, html, response) {
        	try {
	        	await self._send(from, to, subject, text, html);
        	} catch(_exception) {
        		logger.error('send(...): ' + _exception);
        	}
        });
	}

	async _send(_from, _to, _subject, _text, _html) {
		let self = this;
		// Defensive programming...check input...
		if(_from === undefined || _from === null) {
			logger.warn('_send(...): from is undefined or null.');
			throw EmailError.BAD_REQUEST;
		}
		_from = _from.trim();
		if(_from.length <= 0) {
			logger.warn('_send(...): from is empty.');
			throw EmailError.BAD_REQUEST;
		}
		if(_to === undefined || _to === null) {
			logger.warn('_send(...): to is undefined or null.');
			throw EmailError.BAD_REQUEST;
		}
		_to = _to.trim();
		if(_to.length <= 0) {
			logger.warn('_send(...): to is empty.');
			throw EmailError.BAD_REQUEST;
		}
		if(_subject === undefined || _subject === null) {
			logger.warn('_send(...): subject is undefined or null.');
			_subject = '';
		}
		_subject = _subject.trim();
		if(_text === undefined || _text === null) {
			logger.warn('_send(...): text is undefined or null.');
			_text = '';
		}
		if(_html === undefined || _html === null) {
			logger.warn('_send(...): html is undefined or null.');
			_html = '';
		}
        console.log('host: ' + self.smtpHost + ' port:' + self.smtpPort);
		let transport = nodemailer.createTransport({
			host: self.smtpHost,
			port: self.smtpPort,
			auth: {
				user: self.userName,
				pass: self.password
			}
		});
		let content = {};
		content.from = _from;
		content.to = _to;
		content.subject = _subject;
		content.text = _text;
		content.html = _html;

		try {
			let info = await transport.sendMail(content)
			transport.close();
		} catch(_exception) {
			logger.error('send(...): Error \'' + _exception + '\' while sending \'' + _subject + '\' email to \'' + _to + '\'.');
			throw EmailError.INTERNAL_SERVER_ERROR;
		}
	}

    cleanup() {
        // Currently no cleanup required.
        // If cleanup is required in the future do it here.
        logger.info('cleanup finished.');
    }

    start() {
        let self = this;
        self.emailServer.start();
    }

	static main() {
		try {
            let applicationOptions = ApplicationOptions.parseCommandLine();
            logging.setLevel(applicationOptions.logLevel);
            if(applicationOptions.help) {
                util.Help.print(this);
                return;
            }
            let application = new Application(applicationOptions);
            application.emailServer.on(rest.RestServerEvent.RUNNING, function() {
                console.log('To get help include the -help option:');
                console.log('node ./Application -help');
                console.log('');
                console.log(canonicalName + ' running at port ' + application.emailServer.port);
            });
            application.start();
		} catch(exception) {
			console.log('');
			console.log('EXCEPTION:' + exception.message);
			console.log('');
			util.Help.print();
			process.exit();
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    Application.main();
}

module.exports = Application;