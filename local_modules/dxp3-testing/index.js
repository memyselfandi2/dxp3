/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-testing
 *
 * NAME
 * index
 */
const packageName = 'dxp3-testing';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;

const fs = require('fs');
const fsPromises = fs.promises;
const logging = require('dxp3-logging');
const util = require('dxp3-util');

class Testing {

	static clear() {
		Testing.testCount = 0;
		Testing.passCount = 0;
		Testing.failCount = 0;
		Testing._tests.clear();
	}

	static addSetup(_setup) {
		Testing.setup = _setup;
	}

	static addTeardown(_teardown) {
		Testing.teardown = _teardown;
	}

	static addTest(_testName, _test) {
		Testing._tests.set(_testName, _test);
	}

	static async run() {
	    for (const [testName, test] of Testing._tests) {
	        try {
	        	Testing._logTestStart(testName)
	            await Testing.setup();
	            await test();
	        } catch (error) {
	             if (!error.message.startsWith("Assertion failed:")) {
	                 // Log unexpected errors
	                 Testing.failCount++; // Count unexpected errors as failures
	                 console.error(`❌ UNEXPECTED ERROR in test ${testName}:`, error);
	             }
	             break;
	        } finally {
	            await Testing.teardown();
	        }
	    }
	}

	static _logTestStart(name) {
	    Testing.testCount++;
	    console.log(`\n--- Running test ${Testing.testCount}: ${name} ---`);
	}

	static logResult(passed, message = '', error = null) {
	    if (passed) {
	        Testing.passCount++;
	        console.log(`✅ PASSED: ${message}`);
	    } else {
	        Testing.failCount++;
	        console.error(`❌ FAILED: ${message}`);
	        if (error) {
	            console.error(error.stack || error);
	        }
	    }
	}

	static async assertEqual(actual, expected, message) {
	    const condition = actual === expected;
	    Testing.logResult(condition, `${message} (Expected: ${expected}, Actual: ${actual})`);
	    if (!condition) throw new Error(`Assertion failed: ${message}`); // Stop test on failure
	}

	static async assertNotEqual(actual, expected, message) {
	    const condition = actual !== expected;
	    Testing.logResult(condition, `${message} (Expected not: ${expected}, Actual: ${actual})`);
	     if (!condition) throw new Error(`Assertion failed: ${message}`);
	}

	static async assertDeepEqual(actual, expected, message) {
	    const actualJson = JSON.stringify(actual);
	    const expectedJson = JSON.stringify(expected);
	    const condition = actualJson === expectedJson;
	    Testing.logResult(condition, `${message} (Expected: ${expectedJson}, Actual: ${actualJson})`);
	     if (!condition) throw new Error(`Assertion failed: ${message}`);
	}

	static async assertTrue(value, message) {
	    const condition = value === true;
	    Testing.logResult(condition, `${message} (Expected: true, Actual: ${value})`);
	     if (!condition) throw new Error(`Assertion failed: ${message}`);
	}

	static async assertFalse(value, message) {
	    const condition = value === false;
	    Testing.logResult(condition, `${message} (Expected: false, Actual: ${value})`);
	     if (!condition) throw new Error(`Assertion failed: ${message}`);
	}

	static async assertNull(value, message) {
	    const condition = value === null;
	    Testing.logResult(condition, `${message} (Expected: null, Actual: ${value})`);
	     if (!condition) throw new Error(`Assertion failed: ${message}`);
	}

	static async assertEmptyArray(value, message) {
	    const condition = (Array.isArray(value) && (value.length <= 0));
	    Testing.logResult(condition, `${message} (Expected: empty array, Actual: ${JSON.stringify(value)})`);
	     if (!condition) throw new Error(`Assertion failed: ${message}`);
	}

	static async assertNotNull(value, message) {
	    const condition = value !== null;
	    Testing.logResult(condition, `${message} (Expected not null, Actual: ${value})`);
	     if (!condition) throw new Error(`Assertion failed: ${message}`);
	}

	static async assertUndefined(value, message) {
	    const condition = value === undefined;
	    Testing.logResult(condition, `${message} (Expected: undefined, Actual: ${value})`);
	     if (!condition) throw new Error(`Assertion failed: ${message}`);
	}

	static async assertNotUndefined(value, message) {
	    const condition = value !== undefined;
	    Testing.logResult(condition, `${message} (Expected not undefined, Actual: ${value})`);
	     if (!condition) throw new Error(`Assertion failed: ${message}`);
	}

	static async assertFileExists(filePath, message) {
	    let exists = false;
	    try {
	        await fsPromises.access(filePath, fs.constants.F_OK);
	        exists = true;
	    } catch (e) {
	        exists = false;
	    }
	    Testing.logResult(exists, `${message} (File: ${filePath})`);
	     if (!exists) throw new Error(`Assertion failed: ${message}`);
	}

	static async assertThrowsAsync(asyncFn, expectedErrorType, message) {
	    let thrownError = null;
	    try {
	        await asyncFn();
	    } catch (error) {
	        thrownError = error;
	    }
	    const condition = thrownError !== null && (expectedErrorType ? thrownError instanceof expectedErrorType : true);
	    Testing.logResult(condition, `${message} (Expected error: ${expectedErrorType ? expectedErrorType.name : 'any'}, Actual: ${thrownError ? thrownError.constructor.name : 'none'})`);
	     if (!condition) throw new Error(`Assertion failed: ${message}`);
	}

	static summary() {
		console.log("\n--- Test Summary ---");
		console.log(`Total tests: ${Testing.testCount}`);
		console.log(`✅ Passed: ${Testing.passCount}`);
		console.log(`❌ Failed: ${Testing.failCount}`);
		console.log("--------------------\n");
	}
}
Testing.testCount = 0;
Testing.passCount = 0;
Testing.failCount = 0;
Testing._tests = new Map();
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
module.exports = Testing;