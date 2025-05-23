const packageName = 'dxp3-management-dao';
const moduleName = 'FeatureDAO';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const microservice = require('dxp3-microservice');

let daoImpl = require('./mock/FeatureDAOImpl');
let daoSubject = packageName + '-' + moduleName;
let daoServer = new microservice.RestServer(moduleName, daoSubject);

/**********************************
 * CREATE / CONSTRUCTORS
 *********************************/

daoServer.on('create', function(accountUuid, loggedInUserUuid, applicationUuid, parentUuids, featureName, isTemplate, description, callback) {
    daoImpl.create(accountUuid, loggedInUserUuid, applicationUuid, parentUuids, featureName, isTemplate, description, callback);
});

/**********************************
 * READ / GETTERS
 *********************************/

daoServer.on('get', function(accountUuid, loggedInUserUuid, featureUuid, callback) {
    daoImpl.get(accountUuid, loggedInUserUuid, featureUuid, callback);
});

daoServer.on('getCompiledLayout', function(accountUuid, loggedInUserUuid, featureUuid, instanceId, language, callback) {
    daoImpl.getCompiledLayout(accountUuid, loggedInUserUuid, featureUuid, instanceId, language, callback);
});

daoServer.on('getCompiledController', function(accountUuid, loggedInUserUuid, featureUuid, instanceId, callback) {
    daoImpl.getCompiledController(accountUuid, loggedInUserUuid, featureUuid, instanceId, callback);
});

daoServer.on('getCompiledStyle', function(accountUuid, loggedInUserUuid, featureUuid, instanceId, callback) {
    daoImpl.getCompiledStyle(accountUuid, loggedInUserUuid, featureUuid, instanceId, callback);
});

daoServer.on('getController', function(accountUuid, loggedInUserUuid, featureUuid, controllerName, callback) {
    daoImpl.getController(accountUuid, loggedInUserUuid, featureUuid, controllerName, callback);
});

daoServer.on('getContext', function(accountUuid, loggedInUserUuid, featureUuid, name, callback) {
    daoImpl.getContext(accountUuid, loggedInUserUuid, featureUuid, name, callback);
});

daoServer.on('getEvents', function(accountUuid, loggedInUserUuid, featureUuid, name, callback) {
    daoImpl.getEvents(accountUuid, loggedInUserUuid, featureUuid, name, callback);
});

daoServer.on('getFont', function(accountUuid, loggedInUserUuid, featureUuid, fontName, callback) {
    daoImpl.getFont(accountUuid, loggedInUserUuid, featureUuid, fontName, callback);
});

daoServer.on('getImage', function(accountUuid, loggedInUserUuid, featureUuid, imageName, callback) {
    daoImpl.getImage(accountUuid, loggedInUserUuid, featureUuid, imageName, callback);
});

daoServer.on('getLayout', function(accountUuid, loggedInUserUuid, featureUuid, language, callback) {
    daoImpl.getLayout(accountUuid, loggedInUserUuid, featureUuid, language, callback);
});

daoServer.on('getLocale', function(accountUuid, loggedInUserUuid, featureUuid, localeName, callback) {
    daoImpl.getLocale(accountUuid, loggedInUserUuid, featureUuid, localeName, callback);
});

daoServer.on('getLocaleObject', function(accountUuid, loggedInUserUuid, featureUuid, name, callback, callback) {
    daoImpl.getLocaleObject(accountUuid, loggedInUserUuid, featureUuid, name, callback, callback);
});

daoServer.on('getStyle', function(accountUuid, loggedInUserUuid, featureUuid, name, callback) {
    daoImpl.getStyle(accountUuid, loggedInUserUuid, featureUuid, name, callback);
});

daoServer.on('getStyleImage', function(accountUuid, loggedInUserUuid, featureUuid, name, callback) {
    daoImpl.getStyleImage(accountUuid, loggedInUserUuid, featureUuid, name, callback);
});

daoServer.on('list', function(accountUuid, loggedInUserUuid, applicationUuid, parentUuid, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback) {
    daoImpl.list(accountUuid, loggedInUserUuid, applicationUuid, parentUuid, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback);
});

daoServer.on('listFonts', function(accountUuid, loggedInUserUuid, featureUuid, callback) {
    daoImpl.listFonts(accountUuid, loggedInUserUuid, featureUuid, callback);
});

daoServer.on('listImages', function(accountUuid, loggedInUserUuid, featureUuid, callback) {
    daoImpl.listImages(accountUuid, loggedInUserUuid, featureUuid, callback);
});

daoServer.on('listLocales', function(accountUuid, loggedInUserUuid, featureUuid, callback) {
    daoImpl.listLocales(accountUuid, loggedInUserUuid, featureUuid, callback);
});

daoServer.on('listStyleImages', function(accountUuid, loggedInUserUuid, featureUuid, callback) {
    daoImpl.listStyleImages(accountUuid, loggedInUserUuid, featureUuid, callback);
});

daoServer.on('listStyles', function(accountUuid, loggedInUserUuid, featureUuid, callback) {
    daoImpl.listStyles(accountUuid, loggedInUserUuid, featureUuid, callback);
});

daoServer.on('listControllers', function(accountUuid, loggedInUserUuid, featureUuid, callback) {
    daoImpl.listControllers(accountUuid, loggedInUserUuid, featureUuid, callback);
});

/**********************************
 * UPDATE / SETTERS
 *********************************/

daoServer.on('update', function(accountUuid, loggedInUserUuid, featureUuid, applicationUuid, parentUuids, name, isTemplate, description, callback) {
    daoImpl.update(accountUuid, loggedInUserUuid, featureUuid, applicationUuid, parentUuids, name, isTemplate, description, callback);
};

daoServer.on('updateContext', function(accountUuid, loggedInUserUuid, featureUuid, name, code, callback) {
    daoImpl.updateContext(accountUuid, loggedInUserUuid, featureUuid, name, code, callback);
};

daoServer.on('updateController', function(accountUuid, loggedInUserUuid, featureUuid, name, code, callback) {
    daoImpl.updateController(accountUuid, loggedInUserUuid, featureUuid, name, code, callback);
};

daoServer.on('updateEvents', function(accountUuid, loggedInUserUuid, featureUuid, name, code, callback) {
    daoImpl.updateEvents(accountUuid, loggedInUserUuid, featureUuid, name, code, callback);
};

daoServer.on('updateLayout', function(accountUuid, loggedInUserUuid, featureUuid, code, callback) {
    daoImpl.updateLayout(accountUuid, loggedInUserUuid, featureUuid, code, callback);
};

daoServer.on('updateStyle', function(accountUuid, loggedInUserUuid, featureUuid, name, code, callback) {
    daoImpl.updateStyle(accountUuid, loggedInUserUuid, featureUuid, name, code, callback);
};

daoServer.on('uploadLocale', function(accountUuid, loggedInUserUuid, featureUuid, name, code, callback) {
    daoImpl.uploadLocale(accountUuid, loggedInUserUuid, featureUuid, name, code, callback);    
}

daoServer.on('uploadFont', function(accountUuid, loggedInUserUuid, featureUuid, name, source, description, callback) {
    daoImpl.uploadFont(accountUuid, loggedInUserUuid, featureUuid, name, source, description, callback);    
}

daoServer.on('uploadImage', function(accountUuid, loggedInUserUuid, featureUuid, callback) {
    daoImpl.uploadImage(accountUuid, loggedInUserUuid, featureUuid, callback);    
}

daoServer.on('uploadStyleImage', function(accountUuid, loggedInUserUuid, featureUuid, callback) {
    daoImpl.uploadStyleImage(accountUuid, loggedInUserUuid, featureUuid, callback);    
}

daoServer.on('categorize', function(accountUuid, loggedInUserUuid, featureUuid, categoryUuid, callback) {
    daoImpl.categorize(req,res, accountUuid, loggedInUserUuid, featureUuid, categoryUuid, callback);
}

/**********************************
 * DELETE
 *********************************/

 daoServer.on('decategorize', function(accountUuid, loggedInUserUuid, featureUuid, categoryUuid, callback) {
    daoImpl.decategorize(accountUuid, loggedInUserUuid, featureUuid, categoryUuid, callback);
}

daoServer.on('deleteController', function(accountUuid, loggedInUserUuid, featureUuid, name, callback) {
    daoImpl.deleteController(accountUuid, loggedInUserUuid, featureUuid, name, callback);
};

daoServer.on('deleteFont', function(accountUuid, loggedInUserUuid, featureUuid, name, callback) {
    daoImpl.deleteFont(accountUuid, loggedInUserUuid, featureUuid, name, callback);
};

daoServer.on('deleteImage', function(accountUuid, loggedInUserUuid, featureUuid, name, callback) {
    daoImpl.deleteImage(accountUuid, loggedInUserUuid, featureUuid, name, callback);
};

daoServer.on('deleteStyle', function(accountUuid, loggedInUserUuid, featureUuid, name, callback) {
    daoImpl.deleteStyle(accountUuid, loggedInUserUuid, featureUuid, name, callback);
};

daoServer.on('deleteStyleImage', function(accountUuid, loggedInUserUuid, featureUuid, styleImageName, callback) {
    daoImpl.deleteStyleImage(accountUuid, loggedInUserUuid, featureUuid, styleImageName, callback);
};

daoServer.on('delete', function(accountUuid, loggedInUserUuid, featureUuid, callback) {
    daoImpl.delete(accountUuid, loggedInUserUuid, featureUuid, callback);
};