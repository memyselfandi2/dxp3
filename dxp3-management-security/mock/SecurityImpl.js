const path = require('path');
const packageName = 'dxp3-management-security' + path.sep + 'mock';
const moduleName = 'SecurityImpl';
const canonicalName = packageName + path.sep + moduleName;

const crypto = require('crypto');
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const uuid = require('dxp3-uuid');
const SecurityError = require('../SecurityError');

class SecurityImpl {

    constructor(args) {
        this.accounts = new Map();
        this.usergroups = new Map();
        this.registrations = new Map();
        this.emailAddresses = new Map();
        this.emailAddressesByName = new Map();
        this.users = new Map();
        this.userProfiles = new Map();
        this.passwords = new Map();
        this.tokens = new Map();
    }

    registration(_emailAddress, _code, callback) {
        let user = {};
        let registration = {};
        let emailAddress = this.emailAddressesByName.get(_emailAddress);
        if(emailAddress === undefined || emailAddress === null) {
            // Create an email address.
            emailAddress = {};
            emailAddress.uuid = uuid.v4();
            emailAddress.name = _emailAddress;
            emailAddress.isActive = false;
            this.emailAddresses.set(emailAddress.uuid, emailAddress);
            this.emailAddressesByName.set(emailAddress.name, emailAddress);

            // Create a registration.
            registration.uuid = uuid.v4();
            registration.emailAddress = _emailAddress;
            registration.isActive = false;
            this.registrations.set(registration.uuid, registration);

            // Create an user.
            user.uuid = uuid.v4();
            user.isActive = false;
            this.users.set(user.uuid, user);

            // Create an user profile.
            let userProfile = {};
            userProfile.uuid = uuid.v4();
            userProfile.firstName = '';
            userProfile.lastName = '';
            userProfile.interrupt = true;
            this.userProfiles.set(userProfile.uuid, userProfile);

            // Create linkages
            userProfile.userUUID = user.uuid;
            user.userProfileUUID = userProfile.uuid;
            user.registrationUUID = registration.uuid;
            user['emailAddressUUIDs'] = [emailAddress.uuid];
            user['emailAddresses'] = [emailAddress.name];
            registration.userUUID = user.uuid;
            registration.userProfileUUID = userProfile.uuid;
            registration.emailAddressUUID = emailAddress.uuid;
            emailAddress.userUUID = user.uuid;
            emailAddress.userProfileUUID = userProfile.uuid;
            emailAddress.registrationUUID = registration.uuid;
        } else {
            registration = this.registrations.get(emailAddress.registrationUUID);
            user = this.users.get(emailAddress.userUUID);
        }
        registration.code = _code;

        logger.info('Created registration for \'' + _emailAddress + '\'. Code is \'' + _code + '\'');
    	callback(null, registration);
    }

    createAccount(loggedInUserUUID, accountName, description, callback) {
        let account = {};
        account.uuid = uuid.v4();
        account.name = accountName;
        account.description = description;
        this.accounts.set(account.uuid, account);
        callback(null, account);
    }

    createUsergroup(accountUUID, loggedInUserUUID, applicationUUID, parentUUIDs, usergroupName, description, callback) {
        let usergroup = {};
        usergroup.uuid = uuid.v4();
        usergroup.accountUUID = accountUUID;
        usergroup.createdBy = loggedInUserUUID;
        usergroup.name = usergroupName;
        usergroup.description = description;
        this.usergroups.set(usergroup.uuid, usergroup);
        callback(null, usergroup);
    }

    addUserToUsergroup(accountUUID, loggedInUserUUID, usergroupUUID, userUUID, callback) {
        let usergroup = this.usergroups.get(usergroupUUID);
        let users = usergroup.users;
        if(users === undefined || users === null) {
            users = [];
            usergroup.users = users;
        }
        if(users.indexOf(userUUID) < 0) {
            users.push(userUUID);
        }
        callback(null, usergroup);
    }

    addAccountToUser(accountUUID, loggedInUserUUID, userUUID, toBeAddedAccountUUID, callback) {
        let user = this.users.get(userUUID);
        let accounts = user.accounts;
        if(accounts === undefined || accounts === null) {
            accounts = [];
            user.accounts = accounts;
        }
        if(accounts.indexOf(toBeAddedAccountUUID) < 0) {
            accounts.push(toBeAddedAccountUUID);
        }
        callback(null, user);
    }

    activation(_registrationUUID, _code, response) {
        logger.info('Activation for registration \'' + _registrationUUID + '\'');

    	let registration = this.registrations.get(_registrationUUID);
        if(registration === undefined || registration === null) {
            logger.warn('Registration not found \'' + _registrationUUID + '\'');
            return response.sendError(SecurityError.UNAUTHORIZED.code);
        }
    	if(registration.code != _code) {
    	    logger.warn('Wrong code \'' + _code + '\' for registration \'' + _registrationUUID + '\'');
    		return response.sendError(SecurityError.UNAUTHORIZED.code);
    	} else {
            registration.isActive = true;
            let user = this.users.get(registration.userUUID);
            user.isActive = true;
            let emailAddress = this.emailAddresses.get(registration.emailAddressUUID);
            emailAddress.isActive = true;
    	    logger.info('Successful activation of registration \'' + _registrationUUID + '\'. User UUID: ' + registration.userUUID);
    		let token = this._createToken(registration.userUUID);
    		return response.send(null, token);
    	}
    }

    updateUserProfile(_tokenUUID, _userUUID, _firstName, _lastName, _description, response) {
        let token = this.tokens.get(_tokenUUID);
        if(token.userUUID != _userUUID) {
            if(callback) {
                return response.sendError(SecurityError.UNAUTHORIZED.code);
            }
            return;
        }
        let user = this.users.get(_userUUID);
        let userProfile = this.userProfiles.get(user.userProfileUUID);
        userProfile.firstName = _firstName;
        userProfile.lastName = _lastName;
        userProfile.description = _description;
        response.send(null, userProfile);
    }

    clearInterrupt(_tokenUUID, _userUUID, response) {
        let token = this.tokens.get(_tokenUUID);
        if(token.userUUID != _userUUID) {
            if(callback) {
                return response.sendError(SecurityError.UNAUTHORIZED.code);
            }
            return;
        }
        let user = this.users.get(_userUUID);
        let userProfile = this.userProfiles.get(user.userProfileUUID);
        userProfile.interrupt = false;
        response.send(null, true);
    }

    updatePassword(_tokenUUID, _userUUID, _password, response) {
        let token = this.tokens.get(_tokenUUID);
        if(token.userUUID != _userUUID) {
            if(callback) {
                return response.sendError(SecurityError.UNAUTHORIZED.code);
            }
            return;
        }
        let salt = crypto.randomBytes(16).toString('hex'); 
        let user = this.users.get(_userUUID);
        user.salt = salt;
        // Hashing user's salt and password with 1000 iterations, 
        // 64 length and sha512 digest 
        let hash = crypto.pbkdf2Sync(_password, salt, 1000, 64, `sha512`).toString(`hex`); 
        let password = this.passwords.get(_userUUID);
        if(password === undefined || password === null) {
            password = {};
            this.passwords.set(_userUUID, password);
        }
        password.hash = hash;
        response.send(null, true);
    }

    authentication(_emailAddress, _password, response) {
        let emailAddress = this.emailAddressesByName.get(_emailAddress);
        if(emailAddress === undefined || emailAddress === null) {
            return response.sendError(SecurityError.UNAUTHORIZED.code);   
        }
        let user = this.users.get(emailAddress.userUUID);
        if(user === undefined || user === null) {
            return response.sendError(SecurityError.UNAUTHORIZED.code);   
        }
        let password = this.passwords.get(emailAddress.userUUID);
        if(password === undefined || password === null) {
            return response.sendError(SecurityError.UNAUTHORIZED.code);   
        }
        let hashedPassword = password.hash;
        if(hashedPassword === undefined || hashedPassword === null) {
            return response.sendError(SecurityError.UNAUTHORIZED.code);   
        }
        let hash = crypto.pbkdf2Sync(_password, user.salt, 1000, 64, `sha512`).toString(`hex`); 
        if(hashedPassword != hash) {
            return response.sendError(SecurityError.UNAUTHORIZED.code);   
        }
        let token = this._createToken(emailAddress.userUUID);
        return response.send(null, token);
    }

    getUserProfile(tokenUUID, userUUID, response) {
        // console.log('get user profile for: ' + userUUID);
        let user = this.users.get(userUUID);
        let userProfile = this.userProfiles.get(user.userProfileUUID);
        response.send(null, userProfile);
    }

    getUser(tokenUUID, userUUID, response) {
        // console.log('get user: ' + userUUID);
        let user = this.users.get(userUUID);
        response.send(null, user);
    }

    getAccount(tokenUUID, userUUID, accountUUID, response) {
        let account = this.accounts.get(accountUUID);
        response.send(null, account);
    }

    signoff(tokenUUID, userUUID, response) {
        let token = this.tokens.get(tokenUUID);
        if(token === undefined || token === null) {
            return response.sendError(SecurityError.UNAUTHORIZED.code);
        }
        if(token.userUUID != userUUID) {
            return response.sendError(SecurityError.UNAUTHORIZED.code);
        }
        this.tokens.delete(token.uuid);
    	response.send(null, {result:true});
    }

    isAuthenticated(_tokenUUID, _userUUID, response) {
        let token = this.tokens.get(_tokenUUID);
        // console.log('isAuthenticated: ' + _tokenUUID + ', ' + _userUUID);
        if(token === undefined || token === null) {
        // console.log('isAuthenticated token is null: ' + _tokenUUID + ', ' + _userUUID);
            return response.sendError(SecurityError.UNAUTHORIZED.code);
        }
        if(token.userUUID != _userUUID) {
        // console.log('isAuthenticated token user uuid is not user uuid: ' + _tokenUUID + ', ' + _userUUID);
            return response.sendError(SecurityError.UNAUTHORIZED.code);
        }
        // console.log('isAuthenticated sending token: ' + token);
        response.send(null, token);
    }

    isAuthorized(tokenUUID, userUUID, accountUUID, response) {
    	response.send(null, true);
    }

    accountSelection(tokenUUID, userUUID, accountUUID, response) {
        let token = this._createToken('abcdef');
        token.uuid = tokenUUID;
        token.accountUUID = accountUUID;
        response.send(null, token);
    }

    _createToken(_userUUID) {
        var currentDateTime = new Date();
        var currentYear = currentDateTime.getUTCFullYear();
        var currentMonth = currentDateTime.getUTCMonth() + 1;
        var currentDay = currentDateTime.getUTCDate(); 
        var currentHours = currentDateTime.getUTCHours();
        var currentMinutes = currentDateTime.getUTCMinutes();
        var currentSeconds = currentDateTime.getUTCSeconds();
        var creationDateTime = currentYear;
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
        let tokenUUID = uuid.v4();
        let token = {
            creationDateTimeInUTC: creationDateTime,
            timeToLifeInSeconds: 1800,
            userUUID: _userUUID,
            uuid:tokenUUID
        };
        this.tokens.set(token.uuid, token);
        return token;
    }
}

module.exports = SecurityImpl;