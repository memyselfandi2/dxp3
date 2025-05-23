/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-management-api/routes/secure/restricted
 *
 * NAME
 * pageRoute
 */
const path = require('path');
const packageName = 'dxp3-management-api' + path.sep + 'routes' + path.sep + 'secure' + path.sep + 'restricted';
const moduleName = 'pageRoute';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const configuration = require('dxp3-configuration');
const ApplicationKeys = require('../../../ApplicationKeys');
const RouteUtil = require('../../RouteUtil');

module.exports = function(webServer) {
    let compilerClient = configuration.Manager.get(ApplicationKeys.COMPILER_CLIENT);
    let controllerDAO = configuration.Manager.get(ApplicationKeys.CONTROLLER_DAO);
    let layoutDAO = configuration.Manager.get(ApplicationKeys.LAYOUT_DAO);
    let pageDAO = configuration.Manager.get(ApplicationKeys.PAGE_DAO);
    let styleDAO = configuration.Manager.get(ApplicationKeys.STYLE_DAO);
    /**************************************************
     * CREATE / CONSTRUCTORS
    **************************************************/
    webServer.post('/page/', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached create page route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageName = RouteUtil.sanitizeStringParameter(req.body.name);
            if(pageName.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let applicationUUID = RouteUtil.sanitizeStringParameter(req.body.applicationUUID);
            if(applicationUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let description = RouteUtil.sanitizeStringParameter(req.body.description);
            let isTemplate = RouteUtil.sanitizeBooleanParameter(req.body.isTemplate);
            let title = RouteUtil.sanitizeStringParameter(req.body.title);
            let urlPath = RouteUtil.sanitizeStringParameter(req.body.urlPath);
            let parentUUIDs = RouteUtil.sanitizeArrayParameter(req.body.parentUUIDs);
            pageDAO.execute('create',
                accountUUID,
                loggedInUserUUID,
                applicationUUID,
                pageName,
                description,
                parentUUIDs,
                isTemplate,
                title,
                urlPath,
                function(err, page) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);
                    }
                    if(page === undefined || page === null) {
                        // No error, but no freshly created page either...
                        // This is very strange...
                        logger.warn('The pageDAO did not return a page.');
                        // INTERNAL SERVER ERROR = 500
                        return res.status(500).send('');
                    }
                    return res.send(page);
                }
            );
        });
    });
    webServer.post('/page/:pageUUID/controller/', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached create page controller route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let controllerName = req.body.name;
            if(controllerName === undefined || controllerName === null) {
                controllerName = '';
            }
            controllerName = controllerName.trim();
            let code = req.body.code;
            if(code === undefined || code === null) {
                code = '';
            }
            let description = req.body.description;
            if(description === undefined || description === null) {
                description = '';
            }
            description = description.trim();
            controllerDAO.execute('create', accountUUID, loggedInUserUUID, pageUUID, controllerName, description, code, function(err, controller) {
                if((err != undefined) && (err != null)) {
                    return RouteUtil.sendDAOError(res, err);
                }
                compilerClient.execute('compilePage', accountUUID, loggedInUserUUID, pageUUID);
                // lets strip the code
                delete controller.code;
                return res.status(200).send(controller);
            });
        });
    });
    webServer.post('/page/:pageUUID/layout/', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached create page layout route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let layoutName = req.body.name;
            if(layoutName === undefined || layoutName === null) {
                layoutName = '';
            }
            layoutName = layoutName.trim();
            let code = req.body.code;
            if(code === undefined || code === null) {
                code = '';
            }
            let description = req.body.description;
            if(description === undefined || description === null) {
                description = '';
            }
            description = description.trim();
            layoutDAO.execute('create', accountUUID, loggedInUserUUID, pageUUID, layoutName, description, code, function(err, layout) {
                if((err != undefined) && (err != null)) {
                    return RouteUtil.sendDAOError(res, err);
                }
                compilerClient.execute('compilePage', accountUUID, loggedInUserUUID, pageUUID);
                // lets strip the code
                delete layout.code; 
                return res.status(200).send(layout);
            });
        });
    });
    webServer.post('/page/:pageUUID/style/', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached create page style route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let styleName = req.body.name;
            if(styleName === undefined || styleName === null) {
                styleName = '';
            }
            styleName = styleName.trim();
            let code = req.body.code;
            if(code === undefined || code === null) {
                code = '';
            }
            let description = req.body.description;
            if(description === undefined || description === null) {
                description = '';
            }
            description = description.trim();
            styleDAO.execute('create', accountUUID, loggedInUserUUID, pageUUID, styleName, description, code, function(err, style) {
                if((err != undefined) && (err != null)) {
                    return RouteUtil.sendDAOError(res, err);
                }
                compilerClient.execute('compilePage', accountUUID, loggedInUserUUID, pageUUID);
                // lets strip the code
                delete style.code; 
                return res.status(200).send(style);
            });
        });
    });
    /**************************************************
     * READ
    **************************************************/
    webServer.get('/page/', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached list page route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let applicationUUID = RouteUtil.sanitizeStringParameter(req.query.applicationUUID);
            let parentUUID = RouteUtil.sanitizeStringParameter(req.query.parentUUID);
            if((applicationUUID.length <= 0) && (parentUUID.length <= 0)) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let listParameters = RouteUtil.parseListParameters(req);
            pageDAO.execute('list',
                accountUUID,
                loggedInUserUUID,
                applicationUUID,
                parentUUID,
                listParameters.startIndex,
                listParameters.maximumNumberOfResults,
                listParameters.categorizedAs,
                listParameters.filterBy,
                listParameters.sortBy,
                function(err, list) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);
                    }
                    if(list === undefined || list === null) {
                        // No error, but no list either...
                        // This is very strange...
                        logger.warn('The pageDAO did not return a filtered and sorted list.');
                        // INTERNAL SERVER ERROR = 500
                        return res.status(500).send('');
                    }
                    return res.send(list);
                }
            );
        });
    });
    webServer.get('/page/:pageUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached get page route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            pageDAO.execute('get',
                accountUUID,
                loggedInUserUUID,
                pageUUID,
                function(err, page) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);
                    }
                    if(page === undefined || page === null) {
                        // No error, but no page either...
                        // This is very strange...
                        logger.warn('The pageDAO did not return an page.');
                        // INTERNAL SERVER ERROR = 500
                        return res.status(500).send('');
                    }
                    return res.send(page);
                }
            );
        });
    });
    webServer.get('/page/:pageUUID/compiledcontroller/:instanceId', function(req, res) {
console.log('received getCompiledController request');
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached get page compiled controller route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let instanceId = RouteUtil.sanitizeStringParameter(req.params.instanceId);
            if(instanceId.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            compilerClient.execute('getCompiledController', accountUUID, loggedInUserUUID, pageUUID, instanceId,
                function(err, compiledController) {
console.log('call compiler client.getCompiledController returned: ' + compiledController);
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);
                    }
                    res.type('application/javascript').send(compiledController);
                }
            );
        });
    });
    webServer.get('/page/:pageUUID/controller/', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached list page controllers route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let listParameters = RouteUtil.parseListParameters(req);
            controllerDAO.execute('list',
                accountUUID,
                loggedInUserUUID,
                pageUUID,
                listParameters.startIndex,
                listParameters.maximumNumberOfResults,
                listParameters.categorizedAs,
                listParameters.filterBy,
                listParameters.sortBy,
                function(err, list) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);
                    }
                    res.send(list);
                }
            );
        });
    });
    webServer.get('/page/:pageUUID/controller/:controllerUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached get page controller route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let controllerUUID = RouteUtil.sanitizeStringParameter(req.params.controllerUUID);
            if(controllerUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            controllerDAO.execute('get', accountUUID, loggedInUserUUID, pageUUID, controllerUUID,
                function(err, controller) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);
                    }
                    res.send(controller);
                }
            );
        });
    });
    webServer.get('/page/:pageUUID/compiledlayout/:instanceId', function(req, res) {
console.log('received getCompiledLayout request');
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached get page compiled layout route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let instanceId = RouteUtil.sanitizeStringParameter(req.params.instanceId);
            if(instanceId.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
console.log('call compiler client.getCompiledLayout');
            compilerClient.execute('getCompiledLayout', accountUUID, loggedInUserUUID, pageUUID, instanceId,
                function(err, compiledLayout) {
console.log('call compiler client.getCompiledLayout returned: ' + compiledLayout);
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);
                    }
                    res.type('text/html').send(compiledLayout);
                }
            );
        });
    });
    webServer.get('/page/:pageUUID/layout/', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached list page layouts route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let listParameters = RouteUtil.parseListParameters(req);
            layoutDAO.execute('list',
                accountUUID,
                loggedInUserUUID,
                pageUUID,
                listParameters.startIndex,
                listParameters.maximumNumberOfResults,
                listParameters.categorizedAs,
                listParameters.filterBy,
                listParameters.sortBy,
                function(err, list) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);
                    }
                    res.send(list);
                }
            );
        });
    });
    webServer.get('/page/:pageUUID/layout/:layoutUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached get page layout route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let layoutUUID = RouteUtil.sanitizeStringParameter(req.params.layoutUUID);
            if(layoutUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            layoutDAO.execute('get', accountUUID, loggedInUserUUID, pageUUID, layoutUUID,
                function(err, layout) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);
                    }
                    res.send(layout);
                }
            );
        });
    });
    webServer.get('/page/:pageUUID/compiledstyle/:instanceId', function(req, res) {
        console.log('COMPILED STYLE!!!!');
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached get page compiled style route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let instanceId = RouteUtil.sanitizeStringParameter(req.params.instanceId);
            if(instanceId.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            compilerClient.execute('getCompiledStyle', accountUUID, loggedInUserUUID, pageUUID, instanceId,
                function(err, compiledStyle) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);
                    }
                    res.type('text/css').send(compiledStyle);
                }
            );
        });
    });
    webServer.get('/page/:pageUUID/style/', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached list page styles route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let listParameters = RouteUtil.parseListParameters(req);
            styleDAO.execute('list',
                accountUUID,
                loggedInUserUUID,
                pageUUID,
                listParameters.startIndex,
                listParameters.maximumNumberOfResults,
                listParameters.categorizedAs,
                listParameters.filterBy,
                listParameters.sortBy,
                function(err, list) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);
                    }
                    res.send(list);
                }
            );
        });
    });
    webServer.get('/page/:pageUUID/style/:styleUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached get page style route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let styleUUID = RouteUtil.sanitizeStringParameter(req.params.styleUUID);
            if(styleUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            styleDAO.execute('get', accountUUID, loggedInUserUUID, pageUUID, styleUUID,
                function(err, style) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);
                    }
                    res.send(style);
                }
            );
        });
    });
    /**************************************************
     * UPDATE
     **************************************************/
    webServer.put('/page/:pageUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached update page route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let pageName = null;
            if(req.body.name != undefined) { 
                pageName = RouteUtil.sanitizeStringParameter(req.body.name);
            }
            let parentUUIDs = null;
            if(req.body.parentUUIDs != undefined) {
                parentUUIDs = RouteUtil.sanitizeArrayParameter(req.body.parentUUIDs);
            }
            let isTemplate = null;
            if(req.body.isTemplate != undefined) {
                isTemplate = RouteUtil.sanitizeBooleanParameter(req.body.isTemplate);
            }
            let title = null;
            if(req.body.title != undefined) {
                title = RouteUtil.sanitizeStringParameter(req.body.title);
            }
            let urlPath = null;
            if(req.body.urlPath != undefined) {
                urlPath = RouteUtil.sanitizeStringParameter(req.body.urlPath);
            }
            let description = null;
            if(req.body.description != undefined) {
                description = RouteUtil.sanitizeStringParameter(req.body.description);
            }
            pageDAO.execute('update', accountUUID, loggedInUserUUID, pageUUID, pageName, description, parentUUIDs, isTemplate, title, urlPath, function(err, result) {
                if((err != undefined) && (err != null)) {
                    return RouteUtil.sendDAOError(res, err);
                }
                compilerClient.execute('compilePage', accountUUID, loggedInUserUUID, pageUUID);
                res.send(result);
            });
        });
    });
    webServer.put('/page/:pageUUID/controller/:controllerUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached update page controller route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let controllerUUID = RouteUtil.sanitizeStringParameter(req.params.controllerUUID);
            if(controllerUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let name = null;
            if(req.body.name != undefined && req.body.name != null) {
                name = req.body.name;
                name = name.trim();
            }
            let description = null;
            if(req.body.description != undefined && req.body.description != null) {
                description = req.body.description;
                description = description.trim();
            }
            let code = null;
            if(req.body.code != undefined && req.body.code != null) {
                code = req.body.code;
            }
            controllerDAO.execute('update', accountUUID, loggedInUserUUID, pageUUID, controllerUUID, name, description, code, function(err, controller) {
                if((err != undefined) && (err != null)) {
                    return RouteUtil.sendDAOError(res, err);
                }
                compilerClient.execute('compilePage', accountUUID, loggedInUserUUID, pageUUID);
                // lets strip the code
                delete controller.code; 
                return res.status(200).send(controller);
            });
        });
    });
    webServer.put('/page/:pageUUID/layout/:layoutUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached update page layout route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let layoutUUID = RouteUtil.sanitizeStringParameter(req.params.layoutUUID);
            if(layoutUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let name = null;
            if(req.body.name != undefined && req.body.name != null) {
                name = req.body.name;
                name = name.trim();
            }
            let description = null;
            if(req.body.description != undefined && req.body.description != null) {
                description = req.body.description;
                description = description.trim();
            }
            let code = null;
            if(req.body.code != undefined && req.body.code != null) {
                code = req.body.code;
            }
            layoutDAO.execute('update', accountUUID, loggedInUserUUID, pageUUID, layoutUUID, name, description, code, function(err, layout) {
                if((err != undefined) && (err != null)) {
                    return RouteUtil.sendDAOError(res, err);
                }
                compilerClient.execute('compilePage', accountUUID, loggedInUserUUID, pageUUID);
                // lets strip the code
                delete layout.code; 
                return res.status(200).send(layout);
            });
        });
    });
    webServer.put('/page/:pageUUID/style/:styleUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached update page style route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let styleUUID = RouteUtil.sanitizeStringParameter(req.params.styleUUID);
            if(styleUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let name = null;
            if(req.body.name != undefined && req.body.name != null) {
                name = req.body.name;
                name = name.trim();
            }
            let description = null;
            if(req.body.description != undefined && req.body.description != null) {
                description = req.body.description;
                description = description.trim();
            }
            let code = null;
            if(req.body.code != undefined && req.body.code != null) {
                code = req.body.code;
            }
            styleDAO.execute('update', accountUUID, loggedInUserUUID, pageUUID, styleUUID, name, description, code, function(err, style) {
                if((err != undefined) && (err != null)) {
                    return RouteUtil.sendDAOError(res, err);
                }
                compilerClient.execute('compilePage', accountUUID, loggedInUserUUID, pageUUID);
                // lets strip the code
                delete style.code; 
                return res.status(200).send(style);
            });
        });
    });
    /**************************************************
     * DELETE
    **************************************************/
    webServer.delete('/page/:pageUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached delete page route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            pageDAO.execute('delete', accountUUID, loggedInUserUUID, pageUUID, function(err, page) {
                if((err != undefined) && (err != null)) {
                    return RouteUtil.sendDAOError(res, err);
                }
                if(page === undefined || page === null) {
                    // No error, but no page either...that is weird...
                    // Lets log this occurence yet still assume it was a successfull deletion.
                    // Return success = 200
                    logger.warn('Delete page seems to be successful, but our DAO implementation returned an empty object.');
                    return res.status(200).send();
                }
                // Return the definition of the deleted page.
                res.status(200).send(page);
            });
        });
    });
    webServer.delete('/page/:pageUUID/controller/:controllerUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached delete page controller route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let controllerUUID = RouteUtil.sanitizeStringParameter(req.params.controllerUUID);
            if(controllerUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            controllerDAO.execute('delete', accountUUID, loggedInUserUUID, pageUUID, controllerUUID, function(err,controller) {
                if((err != undefined) && (err != null)) {
                    return RouteUtil.sendDAOError(res, err);
                }
                compilerClient.execute('compilePage', accountUUID, loggedInUserUUID, pageUUID);
                return res.send(controller);
            });
        });
    });
    webServer.delete('/page/:pageUUID/layout/:layoutUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached delete page layout route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let layoutUUID = RouteUtil.sanitizeStringParameter(req.params.layoutUUID);
            if(layoutUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            layoutDAO.execute('delete', accountUUID, loggedInUserUUID, pageUUID, layoutUUID, function(err,layout) {
                if((err != undefined) && (err != null)) {
                    return RouteUtil.sendDAOError(res, err);
                }
                compilerClient.execute('compilePage', accountUUID, loggedInUserUUID, pageUUID);
                return res.send(layout);
            });
        });
    });
    webServer.delete('/page/:pageUUID/style/:styleUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached delete page style route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let styleUUID = RouteUtil.sanitizeStringParameter(req.params.styleUUID);
            if(styleUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            styleDAO.execute('delete', accountUUID, loggedInUserUUID, pageUUID, styleUUID, function(err,style) {
                if((err != undefined) && (err != null)) {
                    return RouteUtil.sendDAOError(res, err);
                }
                compilerClient.execute('compilePage', accountUUID, loggedInUserUUID, pageUUID);
                return res.send(style);
            });
        });
    });
}