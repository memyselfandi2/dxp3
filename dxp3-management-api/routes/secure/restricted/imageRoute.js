/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-management-api/routes/secure/restricted
 *
 * NAME
 * imageRoute
 */
const path = require('path');
const packageName = 'dxp3-management-api' + path.sep + 'routes' + path.sep + 'secure' + path.sep + 'restricted';
const moduleName = 'imageRoute';
const canonicalName = packageName + path.sep + moduleName;
const logging = require('dxp3-logging');
const configuration = require('dxp3-configuration');
const ApplicationKeys = require('../../../ApplicationKeys');
const RouteUtil = require('../../RouteUtil');

const web = require('dxp3-microservice-web');
const WebForm = web.WebForm;

const logger = logging.getLogger(canonicalName);

module.exports = function(webServer) {
    let imageDAO = configuration.Manager.get(ApplicationKeys.IMAGE_DAO);
    /**************************************************
     * CREATE / CONSTRUCTORS
    **************************************************/
    webServer.post('/image/', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached create image route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let form = new WebForm();
            form.parse(req, function(error, fields, files) {
                if(error) {
                    // INTERNAL SERVER ERROR = 500
                    return res.status(500).send('');
                }
                let name = fields.get('name');
                if(name === undefined || name === null) {
                    // BAD REQUEST = 400
                    return res.status(400).send('');
                }
                res.send('');
            });

//             form.on('close', function() {
//              console.log('Finished parsing the form.');
//              res.send('Success');
// //             ws.end();
//             });
//             form.on('error', function(error) {
//                 res.status(500).send('Something went wrong uploading the image.');
//             });
//             form.on('part', function(part) {
//              console.log('Form received a part: ' + part.length);
// //             ws.write(payload);
//             });
//             form.on('field', function(name, value) {
//              console.log('Form received a field: ' + name + '=' + value);
//             });

            // let fileName = RouteUtil.sanitizeStringParameter(req.body.fileName);
            // let description = RouteUtil.sanitizeStringParameter(req.body.description);
            // imageDAO.execute('create',
            //     accountUUID,
            //     loggedInUserUUID,
            //     name,
            //     fileName,
            //     description,
            //     function(err, image) {
            //         if((err != undefined) && (err != null)) {
            //             return RouteUtil.sendDAOError(res, err);
            //         }
            //         if(image === undefined || image === null) {
            //             // No error, but no freshly created image either...
            //             // This is very strange...
            //             logger.warn('The imageDAO did not return an image.');
            //             // INTERNAL SERVER ERROR = 500
            //             return res.status(500).send('');
            //         }
            //         return res.send(image);
            //     }
            // );
        });
    });
    /**************************************************
     * READ
    **************************************************/
    webServer.get('/image/', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached list image route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let listParameters = RouteUtil.parseListParameters(req);
            imageDAO.execute('list',
                accountUUID,
                loggedInUserUUID,
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
                        logger.warn('The imageDAO did not return a filtered and sorted list.');
                        // INTERNAL SERVER ERROR = 500
                        return res.status(500).send('');
                    }
                    return res.send(list);
                }
            );
        });
    });
    webServer.get('/image/:imageUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached get image route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let imageUUID = RouteUtil.sanitizeStringParameter(req.params.imageUUID);
            if(imageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            imageDAO.execute('get',
                accountUUID,
                loggedInUserUUID,
                imageUUID,
                function(err, image) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);
                    }
                    if(image === undefined || image === null) {
                        // No error, but no image either...
                        // This is very strange...
                        logger.warn('The imageDAO did not return an image.');
                        // INTERNAL SERVER ERROR = 500
                        return res.status(500).send('');
                    }
                    return res.send(image);
                }
            );
        });
    });
    webServer.get('/application/:applicationUUID/favicon/', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached get application favicon route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let applicationUUID = RouteUtil.sanitizeStringParameter(req.params.applicationUUID);
            if(applicationUUID.length <= 0) { 
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            favIconDAO.execute('get',
                accountUUID,
                loggedInUserUUID,
                applicationUUID,
                function(err, imagePath) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);
                    }
                    if(imagePath === undefined || imagePath === null) {
                        // No error, but no imagePath either...
                        // This is very strange...
                        logger.warn('The applicationDAO did not return an path to its favicon.');
                        // INTERNAL SERVER ERROR = 500
                        return res.status(500).send('');
                    }
                    res.sendFile(imagePath, function(err) {
                        if((err != undefined) && (err != null)) {
                            // FILE NOT FOUND = 404
                            return res.status(404).send('');
                        }
                    });
                }
            );
        });
    });
    webServer.get('/application/:applicationUUID/image/', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached list application images route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let applicationUUID = RouteUtil.sanitizeStringParameter(req.params.applicationUUID);
            if(applicationUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let listParameters = RouteUtil.parseListParameters(req);
            imageDAO.execute('list',
                accountUUID,
                loggedInUserUUID,
                applicationUUID,
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
    webServer.get('/application/:applicationUUID/image/:imageUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached get application image route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let applicationUUID = RouteUtil.sanitizeStringParameter(req.params.applicationUUID);
            if(applicationUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let imageUUID = RouteUtil.sanitizeStringParameter(req.params.imageUUID);
            if(imageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            imageDAO.execute('get', accountUUID, loggedInUserUUID, applicationUUID, imageUUID,
                function(err, imageStream) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);
                    }
                    // We need to retrieve some additional info before we can send on the binary stream.
                    // What type of image is this?
                    imageStream.readFileHeader().then(
                        (imageInformation) => {
                            if(imageInformation.error) {
                                return res.status(404).send('');
                            }
                            imageStream.pipe(res.response).then(
                                (numberOfBytesWritten) => {
                                    res.end();
                                },
                                (pipeError) => {
                                    return res.status(500).send('');
                                }
                            );
                        },
                        (readFileHeaderError) => {
                            return res.status(500).send('');
                        }
                    );
                }
            );
        });
    });
    webServer.get('/application/:uuid/style/image/', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached list application style images route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let uuid = req.params.uuid;
            if(uuid === undefined || uuid === null) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            uuid = uuid.trim();
            if(uuid.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            applicationDAO.execute('listStyleImages', accountUUID, loggedInUserUUID, uuid,
                function(err, result) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);
                    }
                    res.send(result);
                }
            );
        });
    });
    webServer.get('/application/:uuid/style/image/:imageName', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached get application style image route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let uuid = req.params.uuid;
            if(uuid === undefined || uuid === null) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            uuid = uuid.trim();
            if(uuid.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let imageName = req.params.imageName;
            if(imageName === undefined || imageName === null) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            imageName = imageName.trim();
            if(imageName.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            applicationDAO.execute('getStyleImage', accountUUID, loggedInUserUUID, uuid, imageName,
                function(err, imagePath) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);
                    }
                    res.sendFile(imagePath, function(err) {
                        if((err != undefined) && (err != null)) {
                            // FILE NOT FOUND = 404
                            return res.status(404).send('');
                        }
                    });
                }
            );
        });
    });
    webServer.get('/application/:applicationUUID/compiledcontroller/', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached get application compiled controller route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let applicationUUID = RouteUtil.sanitizeStringParameter(req.params.applicationUUID);
            if(applicationUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            compilerClient.execute('getCompiledController', accountUUID, loggedInUserUUID, applicationUUID, null,
                function(err, compiledController) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);
                    }
                    res.type('application/javascript').send(compiledController);
                }
            );
        });
    });
    webServer.get('/application/:applicationUUID/controller/', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached list application controllers route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let applicationUUID = RouteUtil.sanitizeStringParameter(req.params.applicationUUID);
            if(applicationUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let listParameters = RouteUtil.parseListParameters(req);
            controllerDAO.execute('list',
                accountUUID,
                loggedInUserUUID,
                applicationUUID,
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
    webServer.get('/application/:applicationUUID/controller/:controllerUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached get application controller route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let applicationUUID = RouteUtil.sanitizeStringParameter(req.params.applicationUUID);
            if(applicationUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let controllerUUID = RouteUtil.sanitizeStringParameter(req.params.controllerUUID);
            if(controllerUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            controllerDAO.execute('get', accountUUID, loggedInUserUUID, applicationUUID, controllerUUID,
                function(err, controller) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);
                    }
                    res.send(controller);
                }
            );
        });
    });
    webServer.get('/application/:applicationUUID/compiledstyle/', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached get application compiled style route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let applicationUUID = RouteUtil.sanitizeStringParameter(req.params.applicationUUID);
            if(applicationUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            compilerClient.execute('getCompiledStyle', accountUUID, loggedInUserUUID, applicationUUID, null,
                function(err, compiledStyle) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);
                    }
                    res.type('text/css').send(compiledStyle);
                }
            );
        });
    });
    webServer.get('/application/:applicationUUID/style/', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached list application styles route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let applicationUUID = RouteUtil.sanitizeStringParameter(req.params.applicationUUID);
            if(applicationUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let listParameters = RouteUtil.parseListParameters(req);
            styleDAO.execute('list',
                accountUUID,
                loggedInUserUUID,
                applicationUUID,
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
    webServer.get('/application/:applicationUUID/style/:styleUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached get application style route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let applicationUUID = RouteUtil.sanitizeStringParameter(req.params.applicationUUID);
            if(applicationUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let styleUUID = RouteUtil.sanitizeStringParameter(req.params.styleUUID);
            if(styleUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            styleDAO.execute('get', accountUUID, loggedInUserUUID, applicationUUID, styleUUID,
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
    webServer.put('/application/:applicationUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached update application route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let applicationUUID = RouteUtil.sanitizeStringParameter(req.params.applicationUUID);
            if(applicationUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let applicationName = null;
            if(req.body.name != undefined) { 
                applicationName = RouteUtil.sanitizeStringParameter(req.body.name);
            }
            let parentUUIDs = null;
            if(req.body.parentUUIDs != undefined) {
                parentUUIDs = RouteUtil.sanitizeArrayParameter(req.body.parentUUIDs);
            }
            let shortName = null;
            if(req.body.shortName != undefined) {
                shortName = RouteUtil.sanitizeStringParameter(req.body.shortName);
            }
            let isTemplate = null;
            if(req.body.isTemplate != undefined) {
                isTemplate = RouteUtil.sanitizeBooleanParameter(req.body.isTemplate);
            }
            let homePageUUID = null;
            if(req.body.homePageUUID != undefined) {
                homePageUUID = RouteUtil.sanitizeStringParameter(req.body.homePageUUID);
            }
            let description = null;
            if(req.body.description != undefined) {
                description = RouteUtil.sanitizeStringParameter(req.body.description);
            }
            applicationDAO.execute('updateAdvanced', accountUUID, loggedInUserUUID, applicationUUID, applicationName, description, parentUUIDs, shortName, isTemplate, homePageUUID, function(err, result) {
                if((err != undefined) && (err != null)) {
                    return RouteUtil.sendDAOError(res, err);
                }
                res.send(result);
            });
        });
    });
    webServer.put('/application/:applicationUUID/controller/:controllerUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached update application controller route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let applicationUUID = RouteUtil.sanitizeStringParameter(req.params.applicationUUID);
            if(applicationUUID.length <= 0) {
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
            controllerDAO.execute('update', accountUUID, loggedInUserUUID, applicationUUID, controllerUUID, name, description, code, function(err, controller) {
                if((err != undefined) && (err != null)) {
                    return RouteUtil.sendDAOError(res, err);
                }
                compilerClient.execute('compileApplication', accountUUID, loggedInUserUUID, applicationUUID);
                // lets strip the code
                delete controller.code; 
                return res.status(200).send(controller);
            });
        });
    });
    webServer.put('/application/:applicationUUID/style/:styleUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached update application style route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let applicationUUID = RouteUtil.sanitizeStringParameter(req.params.applicationUUID);
            if(applicationUUID.length <= 0) {
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
            styleDAO.execute('update', accountUUID, loggedInUserUUID, applicationUUID, styleUUID, name, description, code, function(err, style) {
                if((err != undefined) && (err != null)) {
                    return RouteUtil.sendDAOError(res, err);
                }
                compilerClient.execute('compileApplication', accountUUID, loggedInUserUUID, applicationUUID);
                // lets strip the code
                delete style.code; 
                return res.status(200).send(style);
            });
        });
    });

    /**************************************************
    * OVERVIEW
    *
    * method                : PUT
    * url                   : /application/<uuid>/font/
    *
    * URL PARAMETERS
    * 
    * NAME                    REQUIRED    TYPE        DESCRIPTION
    * uuid                  : required  : string    : The UUID of the application to add the font to.
    *
    * BODY PARAMETERS
    * 
    * NAME                    REQUIRED    TYPE        DESCRIPTION
    * name                  : required  : string    : The name of this new font.
    * source                : optional  : string    : The source URL of this font.
    * description           : optional  : string    : A brief paragraph describing this font.
    *
    * RETURN
    *
    * On success we return 200.
    * If the application can not be found we return 404.
    *
    * DESCRIPTION
    *
    * Upload a application font.
    *
    **************************************************/
    webServer.put('/application/:uuid/font/', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached upload application font route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let uuid = req.params.uuid;
            if(uuid === undefined || uuid === null) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            uuid = uuid.trim();
            if(uuid.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let name = req.body.name;
            if(name === undefined || name === null) {
                name = '';
            }
            name = name.trim();
            if(name.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let source = req.body.source;
            if(source === undefined || source === null) {
                source = '';
            }
            source = source.trim();
            let description = req.body.description;
            if(description === undefined || description === null) {
                description = '';
            }
            description = description.trim();
            applicationDAO.uploadFont(accountUUID, loggedInUserUUID, uuid, name, source, description,
                function(err, result) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);
                    }
                    res.status(200).send();
                }
            );
        });
    });

    /**************************************************
    * OVERVIEW
    *
    * method                : PUT
    * url                   : /application/<uuid>/favicon/
    *
    * URL PARAMETERS
    * 
    * NAME                    REQUIRED    TYPE        DESCRIPTION
    * uuid                  : required  : string    : The UUID of the application to update.
    *
    * DESCRIPTION
    *
    * Upload a favicon image.
    *
    **************************************************/
    webServer.put('/application/:uuid/favicon/', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached upload application favicon route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let uuid = req.params.uuid;
            if(uuid === undefined || uuid === null) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            uuid = uuid.trim();
            if(uuid.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            // Save the image from the request into a temporary location.
            RouteUtil.saveFileUpload(req, function(err, temporaryFilePath, fileName) {
                if((err != undefined) && (err != null)) {
                    // INTERNAL SERVER ERROR = 500
                    return res.status(500).send();
                }
                // Next move the favicon from the temporary location to the application.
                applicationDAO.uploadFavIcon(accountUUID, loggedInUserUUID, uuid, temporaryFilePath, fileName,
                    function(err, result) {
                        if((err != undefined) && (err != null)) {
                            return RouteUtil.sendDAOError(res, err);
                        }
                        res.status(200).send();
                    }
                );
            });
        });
    });

    /**************************************************
    * OVERVIEW
    *
    * method                : PUT
    * url                   : /application/<uuid>/image/
    *
    * URL PARAMETERS
    * 
    * NAME                    REQUIRED    TYPE        DESCRIPTION
    * uuid                  : required  : string    : The UUID of the application to update.
    *
    * DESCRIPTION
    *
    * Upload an application image.
    *
    **************************************************/
    webServer.put('/application/:uuid/image/', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached upload application image route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let uuid = req.params.uuid;
            if(uuid === undefined || uuid === null) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            uuid = uuid.trim();
            if(uuid.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            // Save the image from the request into a temporary location.
            RouteUtil.saveFileUpload(req, function(err, temporaryFilePath, fileName) {
                if((err != undefined) && (err != null)) {
                    // INTERNAL SERVER ERROR = 500
                    return res.status(500).send();
                }
                // Next move the image from the temporary location to the application.
                applicationDAO.uploadImage(accountUUID, loggedInUserUUID, uuid, temporaryFilePath, fileName,
                    function(err, result) {
                        if((err != undefined) && (err != null)) {
                            return RouteUtil.sendDAOError(res, err);
                        }
                        res.status(200).send();
                    }
                );
            });
        });
    });

    /**************************************************
    * OVERVIEW
    *
    * method                : PUT
    * url                   : /application/<uuid>/style/image/
    *
    * URL PARAMETERS
    * 
    * NAME                    REQUIRED    TYPE        DESCRIPTION
    * uuid                  : required  : string    : The UUID of the application to update.
    *
    * DESCRIPTION
    *
    * Upload an application style image.
    *
    **************************************************/
    webServer.put('/application/:uuid/style/image/', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached upload application style image route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let uuid = req.params.uuid;
            if(uuid === undefined || uuid === null) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            uuid = uuid.trim();
            if(uuid.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            // Save the image from the request into a temporary location.
            RouteUtil.saveFileUpload(req, function(err, temporaryFilePath, fileName) {
                if((err != undefined) && (err != null)) {
                    // INTERNAL SERVER ERROR = 500
                    return res.status(500).send();
                }
                // Next move the image from the temporary location to the application.
                applicationDAO.uploadStyleImage(accountUUID, loggedInUserUUID, uuid, temporaryFilePath, fileName,
                    function(err, result) {
                        if((err != undefined) && (err != null)) {
                            return RouteUtil.sendDAOError(res, err);
                        }
                        res.status(200).send();
                    }
                );
            });
        });
    });
    /**************************************************
     * DELETE
    **************************************************/
    webServer.delete('/application/:applicationUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached delete application route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let applicationUUID = RouteUtil.sanitizeStringParameter(req.params.applicationUUID);
            if(applicationUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            applicationDAO.execute('delete', accountUUID, loggedInUserUUID, applicationUUID, function(err, application) {
                if((err != undefined) && (err != null)) {
                    return RouteUtil.sendDAOError(res, err);
                }
                if(application === undefined || application === null) {
                    // No error, but no application either...that is weird...
                    // Lets log this occurence yet still assume it was a successfull deletion.
                    // Return success = 200
                    logger.warn('Delete application seems to be successful, but our DAO implementation returned an empty object.');
                    return res.status(200).send();
                }
                // Return the definition of the deleted application.
                res.status(200).send(application);
            });
        });
    });
    webServer.delete('/application/:applicationUUID/controller/:controllerUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached delete application controller route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let applicationUUID = RouteUtil.sanitizeStringParameter(req.params.applicationUUID);
            if(applicationUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let controllerUUID = RouteUtil.sanitizeStringParameter(req.params.controllerUUID);
            if(controllerUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            controllerDAO.execute('delete', accountUUID, loggedInUserUUID, applicationUUID, controllerUUID, function(err,controller) {
                if((err != undefined) && (err != null)) {
                    return RouteUtil.sendDAOError(res, err);
                }
                compilerClient.execute('compileApplication', accountUUID, loggedInUserUUID, applicationUUID);
                return res.send(controller);
            });
        });
    });
    webServer.delete('/application/:applicationUUID/style/:styleUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached delete application style route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let applicationUUID = RouteUtil.sanitizeStringParameter(req.params.applicationUUID);
            if(applicationUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let styleUUID = RouteUtil.sanitizeStringParameter(req.params.styleUUID);
            if(styleUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            styleDAO.execute('delete', accountUUID, loggedInUserUUID, applicationUUID, styleUUID, function(err,style) {
                if((err != undefined) && (err != null)) {
                    return RouteUtil.sendDAOError(res, err);
                }
                compilerClient.execute('compileApplication', accountUUID, loggedInUserUUID, applicationUUID);
                return res.send(style);
            });
        });
    });

    /**************************************************
    * OVERVIEW
    *
    * method                : DELETE
    * url                   : /application/<uuid>/font/<font name>
    *
    * URL PARAMETERS
    * 
    * NAME                    REQUIRED    TYPE        DESCRIPTION
    * uuid                  : required  : string    : The UUID of the application the to be deleted font belongs to.
    * image name            : required  : string    : The name of the font to delete
    *
    * DESCRIPTION
    *
    * Delete a font from an application.
    *
    **************************************************/
    webServer.delete('/application/:uuid/font/:fontName', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached delete application font route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let uuid = req.params.uuid;
            if(uuid === undefined || uuid === null) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            uuid = uuid.trim();
            if(uuid.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let fontName = req.params.fontName;
            if(fontName === undefined || fontName === null) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            fontName = fontName.trim();
            if(fontName.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            applicationDAO.deleteFont(accountUUID, loggedInUserUUID, uuid, fontName,
                function(err) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);                   
                    }
                    res.status(200).send();
                }
            );
        });
    });

    /**************************************************
    * OVERVIEW
    *
    * method                : DELETE
    * url                   : /application/<uuid>/image/<image name>
    *
    * URL PARAMETERS
    * 
    * NAME                    REQUIRED    TYPE        DESCRIPTION
    * uuid                  : required  : string    : The UUID of the application the to be deleted image belongs to.
    * image name            : required  : string    : The name of the image to delete
    *
    * DESCRIPTION
    *
    * Delete an image from an application.
    *
    **************************************************/
    webServer.delete('/application/:uuid/image/:imageName', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached delete application image route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let uuid = req.params.uuid;
            if(uuid === undefined || uuid === null) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            uuid = uuid.trim();
            if(uuid.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let imageName = req.params.imageName;
            if(imageName === undefined || imageName === null) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            imageName = imageName.trim();
            if(imageName.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            applicationDAO.deleteImage(accountUUID, loggedInUserUUID, uuid, imageName,
                function(err) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);                   
                    }
                    res.status(200).send();
                }
            );
        });
    });
    /**************************************************
    * OVERVIEW
    *
    * method                : DELETE
    * url                   : /application/<uuid>/style/image/<image name>
    *
    * URL PARAMETERS
    * 
    * NAME                    REQUIRED    TYPE        DESCRIPTION
    * uuid                  : required  : string    : The UUID of the application whose style image to delete.
    * image name            : required  : string    : The name of the style image to delete
    *
    * DESCRIPTION
    *
    * Delete a style image from an application.
    *
    **************************************************/
    webServer.delete('/application/:uuid/style/image/:imageName', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached delete application style image route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let uuid = req.params.uuid;
            if(uuid === undefined || uuid === null) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            uuid = uuid.trim();
            if(uuid.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let imageName = req.params.imageName;
            if(imageName === undefined || imageName === null) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            imageName = imageName.trim();
            if(imageName.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            applicationDAO.deleteStyleImage(accountUUID, loggedInUserUUID, uuid, imageName,
                function(err) {
                    if((err != undefined) && (err != null)) {
                        return RouteUtil.sendDAOError(res, err);                   
                    }
                    res.status(200).send();
                }
            );
        });
    });
}