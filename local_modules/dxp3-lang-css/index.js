const packageName = 'dxp3-lang-css';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
const util = require('dxp3-util');

const css = {};

css.CSSReader = require('./CSSReader');
css.SelectorTokenizer = require('./SelectorTokenizer');

// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
module.exports = css;