const package = 'dxp3.management.ui.routes.public';
const moduleName = 'authenticationRoute';
const canonicalName = package + '.' + moduleName;

module.exports = function(webServer, securityClient) {
    
	webServer.post('/login/', function(req, res) {
        login(req, res);
	});
	webServer.post('/signin/', function(req, res) {
        login(req, res);
	});
	webServer.post('/authenticate/', function(req, res) {
        login(req, res);
	});
	webServer.delete('/logoff/', function(req, res) {
        logoff(req, res);
	});
	webServer.delete('/logout/', function(req, res) {
        logoff(req, res);
	});
	webServer.delete('/signoff/', function(req, res) {
        logoff(req, res);
	});
	webServer.delete('/signout/', function(req, res) {
        logoff(req, res);
	});

    var login = function(req, res) {
        // Defensive programming...check input parameters...
        var emailAddress = req.body.emailAddress;
        if(emailAddress === undefined || emailAddress === null) {
            res.status(400).send('');
            return;
        }
        emailAddress = emailAddress.trim();
        if(emailAddress.length <= 0) {
            res.status(400).send('');
            return;
        }
        var password = req.body.password;
        if(password === undefined || password === null) {
            res.status(400).send('');
            return;
        }
        password = password.trim();
        if(password.length <= 0) {
            res.status(400).send('');
            return;
        }
        securityClient.send('authentication', emailAddress, password, function(err, token) {
            if(err) {
                res.status(err).send('');
                return;
            }
            res.cookie('token', token.uuid);
            res.cookie('user', token.userUUID);
            res.status(200).type('application/json').send(JSON.stringify(token));
        });
    }

    var logoff = function(req, res) {
        // Defensive programming...check input parameters...
        let tokenUUID = req.cookies['token'];
        if(tokenUUID === undefined || tokenUUID === null) {
            tokenUUID = req.body.token;
            if(tokenUUID === undefined || tokenUUID === null) {
                tokenUUID = req.query.token;
                if(tokenUUID === undefined || tokenUUID === null) {
                	// BAD REQUEST = 400
                    res.status(400).send('');
                    return;
                }
            }
        }
        tokenUUID = tokenUUID.trim();
        if(tokenUUID.length <= 0) {
        	// BAD REQUEST = 400
            res.status(400).send('');
            return;
        }
        let userUUID = req.cookies['user'];
        if(userUUID === undefined || userUUID === null) {
            userUUID = req.body.user;
            if(userUUID === undefined || userUUIDuserUUID === null) {
                userUUID = req.query.user;
                if(userUUID === undefined || userUUID === null) {
                    // BAD REQUEST = 400
                    res.status(400).send('');
                    return;
                }
            }
        }
        userUUID = userUUID.trim();
        if(userUUID.length <= 0) {
            // BAD REQUEST = 400
            res.status(400).send('');
            return;
        }
        securityClient.send('signoff', tokenUUID, userUUID, function(err) {
            if((err != undefined) || (err != null)) {
                logger.warn('logoff(...): Error during logoff of token with UUID \'' + tokenUUID + '\'. Error code: \'' + err + '\'.');
            }
        });
        res.status(200).send('');
    }
}