const packageName = 'dxp3-net-http';
const moduleName = 'HTTPFormState';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}

const HTTPFormState = {
	INITIALIZED: 0,
	PARSE_BOUNDARY: 10,
	PARSE_BOUNDARY_CARRIAGE_RETURN: 20,
	PARSE_BOUNDARY_LINE_FEED: 30,
	PARSE_BOUNDARY_HYPHEN: 40,
	PARSE_HEADER: 50,
	PARSE_HEADER_LINE_FEED: 60,
	PARSE_HEADER_NAME: 70,
	PARSE_HEADER_VALUE: 80,
	PARSE_HEADERS: 90,
	PARSE_HEADERS_LINE_FEED: 100,
	PARSE_PAYLOAD: 110,
	PARSE_POTENTIAL_BOUNDARY: 120,
	PARSE_END: 999,
	DRAIN: 666
}

module.exports = HTTPFormState;