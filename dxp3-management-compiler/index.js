const packageName = 'dxp3-management-compiler';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;

const Application = require('./Application');

Application.main();
