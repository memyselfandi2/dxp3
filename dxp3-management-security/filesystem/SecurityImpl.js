/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-management-security/filesystem
 *
 * NAME
 * SecurityImpl
 */
const path = require('path');
const packageName = 'dxp3-management-security' + path.sep + 'filesystem';
const moduleName = 'SecurityImpl';
const canonicalName = packageName + path.sep + moduleName;

const crypto = require('crypto');
//const database = require('dxp3-database');
const FileSystemUtil = require('./FileSystemUtil');
const fs = require('fs');
const logging = require('dxp3-logging');
const SecurityError = require('../SecurityError');
const SecurityUtil = require('../SecurityUtil');

const logger = logging.getLogger(canonicalName);

class SecurityImpl {

	constructor(args) {
        if(args === undefined || args === null) {
            logger.error('Missing constructor arguments.');
            throw SecurityError.BAD_REQUEST;
        }
        let sourceFolder = args.sourceFolder;
        if(sourceFolder === undefined || sourceFolder === null) {
            logger.error('sourcefolder is undefined or null.');
            throw SecurityError.BAD_REQUEST;
        }
        sourceFolder = sourceFolder.trim();
        if(sourceFolder.length <= 0) {
            logger.error('sourcefolder is empty.');
            throw SecurityError.BAD_REQUEST;
        }
        if(!sourceFolder.endsWith(path.sep)) {
            sourceFolder += path.sep;
        }
        this.sourceFolder = sourceFolder;
        // Make sure the source folder exists.
        if(!fs.existsSync(this.sourceFolder)) {
	        logger.warn('Source folder does NOT exist: ' + this.sourceFolder);
	        logger.info('Creating source folder: ' + this.sourceFolder);
            fs.mkdirSync(this.sourceFolder);
        }
        // Next check if a database already exists
        let databaseName = 'dxp3-management-security';
        console.log('checking db exists.');
        // if(!database.DBAdmin.exists(databaseName, this.sourceFolder)) {
        //     logger.warn('Database does NOT exist: ' + databaseName);
        //     logger.info('Creating database: ' + databaseName);
        //     database.DBAdmin.create(databaseName);
        // }
        logger.info('Source folder: ' + this.sourceFolder);
        // Create a location to store accounts.
        // These are unique across the system.
        this.accountsFolder = this.sourceFolder + 'accounts' + path.sep + 'uuids' + path.sep;
        this.accountsIDsFolder = this.sourceFolder + 'accounts' + path.sep + 'ids' + path.sep;
        fs.mkdirSync(this.accountsFolder, {recursive: true}, function(err) {
        });
        fs.mkdirSync(this.accountsIDsFolder, {recursive: true}, function(err) {
        });
	    // Create a location to store email addresses.
	    // email address id's are the actual email addresses.
	    // These are unique across the system.
	    this.emailAddressesFolder = this.sourceFolder + 'emailaddresses' + path.sep + 'uuids' + path.sep;
	    this.emailAddressesIDsFolder = this.sourceFolder + 'emailaddresses' + path.sep + 'ids' + path.sep;
	    fs.mkdirSync(this.emailAddressesFolder, {recursive: true}, function(err) {
	    });
	    fs.mkdirSync(this.emailAddressesIDsFolder, {recursive: true}, function(err) {
	    });
	    // Create a location to store registrations.
	    // Registrations use the email address as an id.
	    // These are unique across the system.
	    this.registrationsFolder = this.sourceFolder + 'registrations' + path.sep + 'uuids' + path.sep;
	    this.registrationsIDsFolder = this.sourceFolder + 'registrations' + path.sep + 'ids' + path.sep;
	    fs.mkdirSync(this.registrationsFolder, {recursive: true}, function(err) {
	    });
	    fs.mkdirSync(this.registrationsIDsFolder, {recursive: true}, function(err) {
	    });
	    // Create a location to store tokens.
	    // Tokens have no id. They only have an uuid.
	    this.tokensFolder = this.sourceFolder + 'tokens' + path.sep;
	    fs.mkdirSync(this.tokensFolder, {recursive: true}, function(err) {
	    });
	    // Create a location to store users.
	    // Users can have multiple email addresses and an user name per account.
	    // Therefor there is no id folder.
	    this.usersFolder = this.sourceFolder + 'users' + path.sep + 'uuids' + path.sep;
	    fs.mkdirSync(this.usersFolder, {recursive: true}, function(err) {
	    });
	    this.userProfilesFolder = this.sourceFolder + 'userprofiles' + path.sep + 'uuids' + path.sep;
	    this.userProfilesIDsFolder = this.sourceFolder + 'userprofiles' + path.sep + 'ids' + path.sep;
	    fs.mkdirSync(this.userProfilesFolder, {recursive: true}, function(err) {
	    });
	    fs.mkdirSync(this.userProfilesIDsFolder, {recursive: true}, function(err) {
	    });
	    this.passwordsFolder = this.sourceFolder + 'passwords' + path.sep + 'uuids' + path.sep;
	    this.passwordsIDsFolder = this.sourceFolder + 'passwords' + path.sep + 'ids' + path.sep;
	    fs.mkdirSync(this.passwordsFolder, {recursive: true}, function(err) {
	    });
	    fs.mkdirSync(this.passwordsIDsFolder, {recursive: true}, function(err) {
	    });
	}

    updateUserProfile(_tokenUUID, _userUUID, _firstName, _lastName, _description, response) {
        let self = this;
        FileSystemUtil.readEntityByID(this.userProfilesFolder, this.userProfilesIDsFolder, _userUUID,
            function(err, userProfile) {
                console.log('found user profile: ' + userProfile);
                userProfile.firstName = _firstName;
                userProfile.lastName = _lastName;
                userProfile.description = _description;
                userProfile.interrupt = 'no';
                FileSystemUtil.updateEntity(self.userProfilesFolder, userProfile, 
                    function(err, userProfile) {
                        console.log('err: ' + err);
                        console.log('and sending user profile back : ' + JSON.stringify(userProfile));
                        return response.send(userProfile);
                    }
                );
            }
        );
    }

    getUserProfile(tokenUUID, userUUID, response) {
        FileSystemUtil.readEntityByID(this.userProfilesFolder, this.userProfilesIDsFolder, userUUID,
            function(err, userProfile) {
                response.send(userProfile);
            }
        );
    }

    getUser(tokenUUID, userUUID, response) {
        FileSystemUtil.readEntityByUUID(this.usersFolder, userUUID,
            function(err, user) {
                response.send(user);
            }
        );
    }

    getAccount(tokenUUID, userUUID, accountUUID, response) {
        FileSystemUtil.readEntityByUUID(this.accountsFolder, accountUUID,
            function(err, account) {
                if(err) {
                    return response.sendError(err.code);
                }
                response.send(account);
            }
        );
    }

    clearInterrupt(_tokenUUID, _userUUID, response) {
        let self = this;
        FileSystemUtil.readEntityByUUID(this.tokensFolder, _tokenUUID,
            function(err, token) {
                if(err) {
                    return response.sendError(SecurityError.UNAUTHORIZED.code);
                }
                if(token === undefined || token === null) {
                    return response.sendError(SecurityError.UNAUTHORIZED.code);
                }
                if(token.userUUID != _userUUID) {
                    return response.send(SecurityError.UNAUTHORIZED.code);
                }
                FileSystemUtil.readEntityByID(self.userProfilesFolder, self.userProfilesIDsFolder, _userUUID,
                    function(err, userProfile) {
                        if(err) {
                            return response.sendError(err.code);
                        }
                        userProfile.interrupt = 'no';
                        FileSystemUtil.updateEntity(self.userProfilesFolder, userProfile, 
                            function(err, userProfile) {
                                return response.send(true);
                            }
                        );
                    }
                );
            }
        );
    }

    accountSelection(tokenUUID, userUUID, accountUUID, response) {
        let self = this;
        FileSystemUtil.readEntityByUUID(this.tokensFolder, tokenUUID,
            function(err, token) {
                if(err) {
                    return response.sendError(SecurityError.UNAUTHORIZED.code);
                }
                if(token.userUUID != userUUID) {
                    return response.sendError(SecurityError.UNAUTHORIZED.code);
                }
                FileSystemUtil.readEntityByUUID(self.usersFolder, userUUID,
                    function(err, user) {
                        if(err) {
                            return response.sendError(SecurityError.UNAUTHORIZED.code);
                        }
                        let accounts = user.accounts;
                        if(accounts.indexOf(accountUUID) < 0) {
                            return response.sendError(SecurityError.UNAUTHORIZED.code);
                        }
                        token.accountUUID = accountUUID;
                        response.send(token);
                    }
                );
            }
        );
    }

    isAuthorized(tokenUUID, userUUID, accountUUID, response) {
        response.send(null, true);
    }

    isAuthenticated(_tokenUUID, _userUUID, response) {
        _tokenUUID = SecurityUtil.sanitizeStringParameter(_tokenUUID);
        _userUUID = SecurityUtil.sanitizeStringParameter(_userUUID);
        console.log('token: ' + _tokenUUID);
        console.log('user : ' + _userUUID);
        if((_tokenUUID.length <= 0) ||
           (_userUUID.length <= 0)) {
            return response.sendError(SecurityError.BAD_REQUEST.code);
        }
        FileSystemUtil.readEntityByUUID(this.tokensFolder, _tokenUUID,
            function(err, token) {
                if(err) {
                    return response.sendError(SecurityError.UNAUTHORIZED.code);
                }
                if(token === undefined || token === null) {
                    return response.send(SecurityError.UNAUTHORIZED.code);
                }
                if(token.userUUID != _userUUID) {
                    return response.send(SecurityError.UNAUTHORIZED.code);
                }
                return response.send(null, token);
            }
        );
    }

    createAccount(loggedInUserUUID, accountName, description, callback) {
        let self = this;
        loggedInUserUUID = SecurityUtil.sanitizeStringParameter(loggedInUserUUID);
        accountName = SecurityUtil.sanitizeStringParameter(accountName);
        if(accountName.length <= 0) {
            return callback(SecurityError.BAD_REQUEST);
        }
        let account = {};
        account.createdBy = loggedInUserUUID;
        FileSystemUtil.createEntity(self.accountsFolder, self.accountsIDsFolder, null, account, accountName, description,
            function(err, account) {
                if(err) {
                    return callback(err, account);
                }
                // Create an archive...this is where all entities go to rest...
                fs.mkdir(self.accountsFolder + account.uuid + path.sep + 'archives' + path.sep, {recursive:true}, function(err) {});
                // Create applications folder
                fs.mkdir(self.accountsFolder + account.uuid + path.sep + 'applications' + path.sep + 'uuids' + path.sep, {recursive: true}, function(err) {});
                fs.mkdir(self.accountsFolder + account.uuid + path.sep + 'applications' + path.sep + 'ids' + path.sep, {recursive: true}, function(err) {});
                // Create categories folder
                fs.mkdir(self.accountsFolder + account.uuid + path.sep + 'categories' + path.sep + 'uuids' + path.sep, {recursive: true}, function(err) {});
                fs.mkdir(self.accountsFolder + account.uuid + path.sep + 'categories' + path.sep + 'ids' + path.sep, {recursive: true}, function(err) {});
                // Create destinations folder
                fs.mkdir(self.accountsFolder + account.uuid + path.sep + 'destinations' + path.sep + 'uuids' + path.sep, {recursive: true}, function(err) {});
                fs.mkdir(self.accountsFolder + account.uuid + path.sep + 'destinations' + path.sep + 'ids' + path.sep, {recursive: true}, function(err) {});
                // Create features folder
                fs.mkdir(self.accountsFolder + account.uuid + path.sep + 'features' + path.sep + 'uuids' + path.sep, {recursive: true}, function(err) {});
                fs.mkdir(self.accountsFolder + account.uuid + path.sep + 'features' + path.sep + 'ids' + path.sep, {recursive: true}, function(err) {});
                // Create pages folder
                fs.mkdir(self.accountsFolder + account.uuid + path.sep + 'pages' + path.sep + 'uuids' + path.sep, {recursive: true}, function(err) {});
                fs.mkdir(self.accountsFolder + account.uuid + path.sep + 'pages' + path.sep + 'ids' + path.sep, {recursive: true}, function(err) {});
                // Create servers folder
                fs.mkdir(self.accountsFolder + account.uuid + path.sep + 'servers' + path.sep + 'uuids' + path.sep, {recursive: true}, function(err) {});
                fs.mkdir(self.accountsFolder + account.uuid + path.sep + 'servers' + path.sep + 'ids' + path.sep, {recursive: true}, function(err) {});
                // Create users and usergroups folders.
                // These folders need to be created before we call the callback function because highly likely
                // the next step in the creation of the account is to add usergroups (owners and administrators) and users
                // (owners and administrators).
                fs.mkdir(self.accountsFolder + account.uuid + path.sep + 'users' + path.sep + 'uuids' + path.sep, {recursive:true},
                    function() {
                        fs.mkdir(self.accountsFolder + account.uuid + path.sep + 'users' + path.sep + 'ids' + path.sep, {recursive:true},
                            function() {
                                fs.mkdir(self.accountsFolder + account.uuid + path.sep + 'usergroups' + path.sep + 'uuids' + path.sep, {recursive:true},
                                    function() {
                                        fs.mkdir(self.accountsFolder + account.uuid + path.sep + 'usergroups' + path.sep + 'ids' + path.sep, {recursive:true},
                                            function() {
                                                return callback(null, account);
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    }

    createUsergroup(accountUUID, loggedInUserUUID, applicationUUID, parentUUIDs, usergroupName, description, callback) {
        let self = this;
        accountUUID = SecurityUtil.sanitizeStringParameter(accountUUID);
        loggedInUserUUID = SecurityUtil.sanitizeStringParameter(loggedInUserUUID);
        applicationUUID = SecurityUtil.sanitizeStringParameter(applicationUUID);
        let accountFolder = self.accountsFolder + accountUUID + path.sep;
        let usergroupsFolder = accountFolder + 'usergroups' + path.sep + 'uuids' + path.sep;
        let usergroupsIDsFolder = '';
        if(applicationUUID.length <= 0) {
            usergroupsIDsFolder = accountFolder + 'usergroups' + path.sep + 'ids' + path.sep;
        } else {
            let applicationFolder = accountFolder + 'applications' + path.sep + 'uuids' + path.sep + applicationUUID + path.sep;
            usergroupsIDsFolder = applicationFolder + 'usergroups' + path.sep + 'ids' + path.sep;
        }
        let usergroup = {};
        usergroup.accountUUID = accountUUID;
        usergroup.createdBy = loggedInUserUUID;
        FileSystemUtil.createEntity(usergroupsFolder, usergroupsIDsFolder, parentUUIDs, usergroup, usergroupName, description,
            function(err, usergroup) {
                callback(err, usergroup);
            }
        );
    }

    updatePassword(_tokenUUID, _userUUID, _password, response) {
        let self = this;
        FileSystemUtil.readEntityByUUID(this.tokensFolder, _tokenUUID,
            function(err, token) {
                if(err) {
                    return response.sendError(SecurityError.UNAUTHORIZED.code);
                }
                if(token === undefined || token === null) {
                    return response.sendError(SecurityError.UNAUTHORIZED.code);
                }
                if(token.userUUID != _userUUID) {
                    return response.send(SecurityError.UNAUTHORIZED.code);
                }
                FileSystemUtil.readEntityByUUID(self.usersFolder, _userUUID,
                    function(err, user) {
                        if(err) {
                            return response.sendError(SecurityError.UNAUTHORIZED.code);
                        }
                        if(user === undefined || user === null) {
                            return response.sendError(SecurityError.UNAUTHORIZED.code);
                        }
                        let salt = crypto.randomBytes(16).toString('hex');
                        let hash = crypto.pbkdf2Sync(_password, salt, 1000, 64, `sha512`).toString(`hex`);
                        user.salt = salt;
                        FileSystemUtil.updateEntity(self.usersFolder, user,
                            function(err, user) {
                                let password = {};
                                password.hash = hash;

                                console.log('salt: ' + user.salt);
                                console.log('hash: ' + password.hash);
                                console.log('password: ' + _password);
                                FileSystemUtil.createEntity(self.passwordsFolder, self.passwordsIDsFolder, null, password, _userUUID, null,
                                    function(err, password) {
                                        if(err) {
                                            if(err.code != SecurityError.CONFLICT.code) {
                                                return response.sendError(SecurityError.UNAUTHORIZED.code);
                                            }
                                            console.log('password already exists. Lets update instead.');
                                            password.hash = hash;
                                            FileSystemUtil.updateEntity(self.passwordsFolder, password,
                                                function(err, password) {
                                                    response.send(null, true);
                                                }
                                            );
                                            return;
                                        }
                                        response.send(null, true);
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    }

    authentication(_emailAddress, _password, response) {
        let self = this;
        FileSystemUtil.readEntityByID(self.emailAddressesFolder, self.emailAddressesIDsFolder, _emailAddress,
            function(err, emailAddress) {
                if(emailAddress === undefined || emailAddress === null) {
                    return response.sendError(SecurityError.UNAUTHORIZED.code);
                }
                FileSystemUtil.readEntityByUUID(self.usersFolder, emailAddress.userUUID,
                    function(err, user) {
                        if(user === undefined || user === null) {
                            return response.sendError(SecurityError.UNAUTHORIZED.code);
                        }
                        FileSystemUtil.readEntityByID(self.passwordsFolder, self.passwordsIDsFolder, emailAddress.userUUID,
                            function(err, password) {
                                console.log('salt: ' + user.salt);
                                if(password === undefined || password === null) {
                                    return response.sendError(SecurityError.UNAUTHORIZED.code);
                                }
                                console.log('hash: ' + password.hash);
                                let hashedPassword = password.hash;
                                if(hashedPassword === undefined || hashedPassword === null) {
                                    return response.sendError(SecurityError.UNAUTHORIZED.code);   
                                }
                                console.log('supplied password: ' + _password);
                                let hash = crypto.pbkdf2Sync(_password, user.salt, 1000, 64, `sha512`).toString(`hex`); 
                                console.log('calculated hash: ' + hash);
                                if(hashedPassword != hash) {
                                    return response.sendError(SecurityError.UNAUTHORIZED.code);
                                }
                                let token = self._createToken(emailAddress.userUUID);
                                FileSystemUtil.createEntity(self.tokensFolder, null, null, token, null, null, 
                                    function(err, token) {
                                        if(err) {
                                            return response.sendError(SecurityError.UNAUTHORIZED.code);
                                        }
                                        return response.send(null, token);
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    }

    signoff(tokenUUID, userUUID, response) {
        let self = this;
        tokenUUID = SecurityUtil.sanitizeStringParameter(tokenUUID);
        userUUID = SecurityUtil.sanitizeStringParameter(userUUID);
        FileSystemUtil.readEntityByUUID(this.tokensFolder, tokenUUID,
            function(err, token) {
                if(err) {
                    return response.sendError(SecurityError.UNAUTHORIZED.code);
                }
                if(token === undefined || token === null) {
                    return response.send(SecurityError.UNAUTHORIZED.code);
                }
                if(token.userUUID != userUUID) {
                    return response.send(SecurityError.UNAUTHORIZED.code);
                }
                FileSystemUtil.deleteEntityByUUID(self.tokensFolder, tokenUUID,
                    function(err, token) {
                        response.send(null, {result:true});
                    }
                );
            }
        );
    }

    addUserToUsergroup(accountUUID, loggedInUserUUID, usergroupUUID, userUUID, callback) {
        let self = this;
        accountUUID = SecurityUtil.sanitizeStringParameter(accountUUID);
        loggedInUserUUID = SecurityUtil.sanitizeStringParameter(loggedInUserUUID);
        usergroupUUID = SecurityUtil.sanitizeStringParameter(usergroupUUID);
        userUUID = SecurityUtil.sanitizeStringParameter(userUUID);
        let accountFolder = self.accountsFolder + accountUUID + path.sep;
        let usergroupsFolder = accountFolder + 'usergroups' + path.sep + 'uuids' + path.sep;
        FileSystemUtil.readEntityByUUID(usergroupsFolder, usergroupUUID,
            function(err, usergroup) {
                if(err) {
                    if(callback) {
                        return callback(err);
                    }
                    return;
                }
                let currentUsers = usergroup.users;
                let newUsers = [];
                if(currentUsers === undefined || currentUsers === null) {
                    currentUsers = [];
                }
                for(let i=0;i < currentUsers.length;i++) {
                    if(currentUsers[i] != userUUID) {
                        newUsers.push(currentUsers[i]);
                    } else {
                        if(callback) {
                            return callback(SecurityError.CONFLICT, usergroup);
                        }
                        return;
                    }
                }
                newUsers.push(userUUID);
                usergroup.users = newUsers;
                FileSystemUtil.updateEntity(usergroupsFolder, null, usergroup, usergroup.parentUUIDs, null, usergroup.description,
                    function(error, usergroup) {
                        if(error) {
                            if(callback) {
                                return callback(error);
                            }
                            return;
                        }
                        if(callback) {
                           return callback(null, usergroup);
                        }
                    }
                );
            }
        );
    }

    addAccountToUser(accountUUID, loggedInUserUUID, userUUID, toBeAddedAccountUUID, callback) {
        let self = this;
        accountUUID = SecurityUtil.sanitizeStringParameter(accountUUID);
        loggedInUserUUID = SecurityUtil.sanitizeStringParameter(loggedInUserUUID);
        userUUID = SecurityUtil.sanitizeStringParameter(userUUID);
        toBeAddedAccountUUID = SecurityUtil.sanitizeStringParameter(toBeAddedAccountUUID);
        FileSystemUtil.readEntityByUUID(self.usersFolder, userUUID, 
            function(err, user) {
                let accounts = user.accounts;
                if(accounts === undefined || accounts === null) {
                    accounts = [];
                    user.accounts = accounts;
                }
                if(accounts.indexOf(toBeAddedAccountUUID) < 0) {
                    accounts.push(toBeAddedAccountUUID);
                    FileSystemUtil.updateEntity(self.usersFolder, null, user, user.parentUUIDs, null, user.description,
                        function(err, user) {
                            if(callback) {
                                return callback(null, user);
                            }
                        })
                } else {
                    return callback(null, user);
                }
            }
        );
    }

    activation(_registrationUUID, _code, response) {
        let self = this;
        // Defensive programming...check input parameters...
        _registrationUUID = SecurityUtil.sanitizeStringParameter(_registrationUUID);
        _code = SecurityUtil.sanitizeStringParameter(_code);
        if((_registrationUUID.length <= 0) || 
           (_code.length <= 0)) {
            response.sendError(SecurityError.BAD_REQUEST.code);
            return;
        }
        FileSystemUtil.readEntityByUUID(self.registrationsFolder, _registrationUUID,
            function(err, registration) {
                if(err) {
                    return response.sendError(err.code);
                }
                if(registration.code != _code) {
                    logger.warn('Wrong code \'' + _code + '\' for registration \'' + _registrationUUID + '\'.');
                    return response.sendError(SecurityError.UNAUTHORIZED.code);
                }
                let currentDate = Date.now();
                if((currentDate - registration.codeValidUntil) > 0) {
                    logger.warn('Expired code \'' + _code + '\' for registration \'' + _registrationUUID + '\'.');
                    return response.sendError(SecurityError.UNAUTHORIZED.code);
                }
                if(registration.codeUsed) {
                    logger.warn('Used code \'' + _code + '\' for registration \'' + _registrationUUID + '\'.');
                    return response.sendError(SecurityError.UNAUTHORIZED.code);
                }
                // Make sure this registration has a corresponding user.
                FileSystemUtil.readEntityByUUID(self.usersFolder, registration.userUUID,
                    function(err, user) {
                        if(err) {
                            logger.warn('activation(...): Unable to retrieve the user with UUID \'' + registration.userUUID + '\' of the registration with UUID \'' + registration.uuid + '\'.');
                            return response.sendError(err.code);
                        }
                        if(!user.isActive) {
                            user.isActive = true;
                            FileSystemUtil.updateEntity(self.usersFolder, null, user, null, user.name, user.description,
                                function(err, user) {
                                    if(err) {
                                        logger.warn('activation(...): Unable to update the user with UUID \'' + user.uuid + '\'.');
                                    }
                                }
                            );
                        }
                        registration.codeUsed = true;
                        if(!registration.isActive) {
                            registration.isActive = true;
                            // If the registration was inactive, the corresponding email address would have been as well...
                            FileSystemUtil.readEntityByUUID(self.emailAddressesFolder, registration.emailAddressUUID,
                                function(err, emailAddress) {
                                    if(err) {
                                        logger.warn('activation(...): Unable to retrieve the email address with UUID \'' + registration.emailAddressUUID + '\'.');
                                        return;
                                    }
                                    emailAddress.isActive = true;
                                    FileSystemUtil.updateEntity(self.emailAddressesFolder, self.emailAddressesIDsFolder, emailAddress, null, emailAddress.name, emailAddress.description,
                                        function(err, emailAddress) {
                                            if(err) {
                                                logger.warn('activation(...): Unable to update the email address with UUID \'' + emailAddress.uuid + '\'.');
                                            }
                                        }
                                    );
                                }
                            );
                        }
                        FileSystemUtil.updateEntity(self.registrationsFolder, self.registrationsIDsFolder, registration, null, registration.name, registration.description,
                            function(err, registration) {
                                if(err) {
                                    logger.warn('activation(...): Unable to update the registration with UUID \'' + registration.uuid + '\'.');
                                    return response.sendError(err.code);
                                }
                                let token = self._createToken(user.uuid);
                                FileSystemUtil.createEntity(self.tokensFolder, null, null, token, null, null, 
                                    function(err, token) {
                                        if(err) {
                                            logger.warn('activation(...): Unable to create a new token for the user with UUID \'' + user.uuid + '\'.');
                                            return response.sendError(err.code);
                                        }
                                        return response.send(null, token);
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    }

	registration(_emailAddress, _code, callback) {
        // Defensive programming...check input parameters...
        _emailAddress = SecurityUtil.sanitizeStringParameter(_emailAddress);
	    if(_emailAddress.length <= 0) {
            return callback(SecurityError.BAD_REQUEST);
	    }
        _code = SecurityUtil.sanitizeStringParameter(_code);
	    if(_code.length <= 0) {
            return callback(SecurityError.BAD_REQUEST);
	    }
        let self = this;
	    // Create or update an existing registration.
	    self._createRegistration(_emailAddress, _code, function(err, registration) {
	        if(err) {
	        	return callback(err);
	        }
	        // Lets create a corresponding email address
	        self._createEmailAddress(_emailAddress, registration, function(err, emailAddress) {
	            if(err) {
                    return callback(err);
	            }
	            self._createUser(registration, emailAddress, function(err, user) {
	                if(err) {
                        return callback(err);
	                }
	                self._linkEmailAddress(emailAddress, registration, user, function(err, emailAddress) {
	                    if(err) {
                            return callback(err);
	                    }
	                    self._linkRegistration(registration, emailAddress, user, function(err, registration) {
	                        if(err) {
    	                        return callback(err);
                            }
	                        return callback(null, registration);
	                    });
	                });
	            });
	        });
	    });
	}

    _linkRegistration(registration, emailAddress, user, callback) {
        let needsUpdate = false;
        if(registration.userUUID != user.uuid) {
            registration.userUUID = user.uuid;
            needsUpdate = true;
        }
        if(registration.emailAddressUUID != emailAddress.uuid) {
            registration.emailAddressUUID = emailAddress.uuid;
            needsUpdate = true;
        }
        let self = this;
        if(needsUpdate) {
            FileSystemUtil.updateEntity(self.registrationsFolder, self.registrationsIDsFolder, registration, null, registration.name, registration.description,
                function(err, registration) {
                    if(err) {
                        logger.warn('_linkRegistration: ' + err.code + ': Unable to update registration with UUID \'' + registration.uuid + '\'.');
                        return callback(err);
                    }
                    return callback(null, registration);
                }
            );
        } else {
            return callback(null, registration);
        }
    }

    _linkEmailAddress(emailAddress, registration, user, callback) {
        let needsUpdate = false;
        if(emailAddress.registrationUUID != registration.uuid) {
            emailAddress.registrationUUID = registration.uuid;
            needsUpdate = true;
        }
        if(emailAddress.userUUID != user.uuid) {
            emailAddress.userUUID = user.uuid;
            needsUpdate = true;
        }
        let self = this;
        if(needsUpdate) {
            FileSystemUtil.updateEntity(self.emailAddressesFolder, self.emailAddressesIDsFolder, emailAddress, null, emailAddress.name, emailAddress.description,
                function(err, emailAddress) {
                    if(err) {
                        logger.warn('_linkEmailAddress(...): ' + err.code + ': Unable to update email address with UUID \'' + emailAddress.uuid + '\' and id \'' + emailAddress.name + '\'.');
                        return callback(err);
                    }
                    return callback(null, emailAddress);
                }
            );
        } else {
            return callback(null, emailAddress);
        }
    }

    _createRegistration(_emailAddress, _code, callback) {
        let self = this;
        let registration = {};
        registration.emailAddress = _emailAddress;
        registration.code = _code;
        // Code is valid for 1 minute.
        registration.codeValidUntil = Date.now() + (1*60*1000);
        registration.codeUsed = false;
        registration.isActive = false;
        // We use the email address as the ID.
        // A registration has no parents and no description.
        FileSystemUtil.createEntity(self.registrationsFolder, self.registrationsIDsFolder, null, registration, _emailAddress, null,
            function(err, registration) {
                if(err) {
	                // Potentially unhappy path. Something went wrong creating the registration.
                	if(err.code != SecurityError.CONFLICT.code) {
                		// Unhappy path. Apparently this was NOT a conflict.
		                // This is an unrecoverable error.
	                    logger.error('_createRegistration(...): ' + err.code + ': Unable to create registration entity with id \'' + _emailAddress + '\'.');
	                    return callback(err);
    	            }
    	            // Happy path. This registration already existed.
    	            // Not a problem. Users are allowed to reregister using the same email address.
    	            // Lets update the registration code.
                    registration.code = _code;
                    // Code is valid for 1 minute.
                    registration.codeValidUntil = Date.now() + (1*60*1000);
                    registration.codeUsed = false;
	                FileSystemUtil.updateEntity(self.registrationsFolder, self.registrationsIDsFolder, registration, null, registration.name, registration.description,
                        function(err, registration) {
                            if(err) {
	                            // Unhappy path. Something went wrong updating the registration.
	                            // This is an unrecoverable error.
                                return callback(err);
                            }
                            // Happy path. Successful update of existing registration.
                            return callback(null, registration);
                        }
                	);
                	return;
                }
                // Happy path. Successful creation of a new registration.
                return callback(null, registration);
            }
        );
    }

	_createEmailAddress(_emailAddress, registration, callback) {
        let self = this;
        let emailAddress = {};
        emailAddress.registrationUUID = registration.uuid;
        emailAddress.isActive = false;
        // We use the email address as the ID.
        // An email address has no parents and no description.
        FileSystemUtil.createEntity(self.emailAddressesFolder, self.emailAddressesIDsFolder, null, emailAddress, _emailAddress, null,
            function(err, emailAddress) {
                if(err) {
	                // Potentially unhappy path. Something went wrong creating the email address.
                	if(err.code != SecurityError.CONFLICT.code) {
                		// Unhappy path. Apparently this was NOT a conflict.
		                // This is an unrecoverable error.
	                    logger.error('_createEmailAddress(...): ' + err.code + ': Unable to create email address entity with id \'' + _emailAddress + '\'.');
	                    return callback(err);
	                }
    	            // Happy path. This email address already existed.
    	            // Not a problem. Users are allowed to reregister using the same email address.
                    if(emailAddress.registrationUUID != registration.uuid) {
                        // hmmm what happened here?
                        // Lets at least log this occurence and attempt to fix this inconsistency...
                        logger.warn('_createEmailAddress(...): Existing email address with UUID \'' + emailAddress.uuid + '\' linked to registration with UUID \'' + emailAddress.registrationUUUID + '\' instead of \'' + registration.uuid + '\'.');
                    }
	            }
                return callback(null, emailAddress);
            }
        );
    }

    _createUser(registration, emailAddress, callback) {
        let self = this;
        let userUUID = registration.userUUID;
        if(userUUID != undefined && userUUID != null) {
        	// If the registration already existed an user would already have been created.
        	// If that is the case userUUID would have a value.
            if(userUUID.length > 0) {
                FileSystemUtil.readEntityByUUID(self.usersFolder, userUUID,
                    function(err, user) {
                        if(err) {
                            logger.error('_createUser(...): ' + err.code + ': Unable to retrieve user with UUID \'' + userUUID + '\'.');
                            return callback(err);
                        }
                        return callback(null, user);
                    }
                );
                return;
            }
        }
        let user = {};
        user.registrationUUID = registration.uuid;
        user['emailAddressUUIDs'] = [emailAddress.uuid];
        user['emailAddresses'] = [emailAddress.name];
        user.isActive = false;
        // Users do not have parents nor an ID or description.
        FileSystemUtil.createEntity(self.usersFolder, null, null, user, null, null,
            function(err, user) {
                if(err) {
                    logger.warn('_createUser(...): ' + err.code + ': Unable to create a new user for registration with UUID \'' + registration.uuid + '\'.');
                    return callback(err);
                }
                let userProfile = {};
                userProfile.firstName = '';
                userProfile.lastName = '';
                userProfile.interrupt = 'yes';
                // User profiles have the UUID of the user as ID.
                FileSystemUtil.createEntity(self.userProfilesFolder, self.userProfilesIDsFolder, null, userProfile, user.uuid, null,
                    function(err, userProfile) {
                        if(err) {
                            logger.warn('_createUser(...): ' + err.code + ': Unable to create a new user profile for user with UUID \'' + user.uuid + '\'.');
                            return callback(err);
                        }
		                return callback(null, user);
                    }
                );
            }
        );
    }

    _createToken(_userUUID) {
        let currentDateTime = new Date();
        let currentYear = currentDateTime.getUTCFullYear();
        let currentMonth = currentDateTime.getUTCMonth() + 1;
        let currentDay = currentDateTime.getUTCDate(); 
        let currentHours = currentDateTime.getUTCHours();
        let currentMinutes = currentDateTime.getUTCMinutes();
        let currentSeconds = currentDateTime.getUTCSeconds();
        let creationDateTime = currentYear;
        creationDateTime += '-';
        creationDateTime += (currentMonth < 10) ? '0' + currentMonth : currentMonth;
        creationDateTime += '-';
        creationDateTime += (currentDay < 10) ? '0' + currentDay : currentDay;
        creationDateTime += ' ';
        creationDateTime += (currentHours < 10) ? '0' + currentHours : currentHours;
        creationDateTime += ':';
        creationDateTime += (currentMinutes < 10) ? '0' + currentMinutes : currentMinutes;
        creationDateTime += ':';
        creationDateTime += (currentSeconds < 10) ? '0' + currentSeconds : currentSeconds;
        let token = {
            creationDateTimeInUTC: creationDateTime,
            timeToLifeInSeconds: 1800,
            userUUID: _userUUID
        };
        return token;
    }

	_readEmailAddress(_emailAddress, callback) {
        let self = this;
		FileSystemUtil.readEntityByID(self.emailAddressesFolder, self.emailAddressesIDsFolder, _emailAddress,
			function(err, emailAddress) {
				callback(err, emailAddress);
			})
	}

}

module.exports = SecurityImpl;