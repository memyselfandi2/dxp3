/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-uuid
 *
 * NAME
 * index
 */
const packageName = 'dxp3-uuid';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * <p>The dxp3-uuid module contains all the necessary functionality to
 * create UUID's. It is to be used as a library as it does not contain
 * any executable class.
 * Make sure this local module is defined as a dependency in your package.json.
 * Typically the dependency is defined by a file reference using a relative path.
 * Obviously that relative path may be different for different modules.
 * Here is an example of such a dependency in a package.json:<br/>
 * <br/>
 * "dependencies": {<br/>
 * "dxp3-uuid": "file:../../../local_modules/dxp3-uuid"<br/>
 * }<br/>
 * </p>
 * 
 * @example
 * // Get a reference to our uuid code.
 * const UUID = require('dxp3-uuid');
 * // Create a new identifier.
 * let id = UUID.v4();
 * console.log('New UUID: ' + id);
 * // For convenience the library contains
 * // alias methods for the v4 method.
 * id = UUID.create();
 * id = UUID.new();
 * id = UUID.newInstance();
 * id = UUID.next();
 * id = UUID.version4();
 *
 * @module dxp3-uuid
 */
// We use the crypto module to get a set of random bytes.
const crypto = require('crypto');
// We use the util.Assert class to assert this is the file to execute.
// If that is the case we'll print out a fresh new UUID to the console.
// Additionally we use the util.Help class to print out help information.
const util = require('dxp3-util');
/**
 * An UUID class has one important static method: v4().
 * Additionally it has multiple convenience alias methods all of which call the v4() method.
 */
class UUID {
	/**
	 * As all methods are static, we don't really need a constructor.
	 */
	constructor() {
	}
	/**
     * Alias of {@link UUID.v4}.
	 * @return {String}
	 */
	static create() {
		return UUID.v4();
	}
	/**
     * Alias of {@link UUID.v4}.
	 * @return {String}
	 */
	static new() {
		return UUID.v4();
	}
	/**
     * Alias of {@link UUID.v4}.
	 * @return {String}
	 */
	static newInstance() {
		return UUID.v4();
	}
	/**
     * Alias of {@link UUID.v4}.
	 * @return {String}
	 */
	static next() {
		return UUID.v4();
	}
	/**
	 * This method implements an algorithm for creating a UUID from truly random or pseudo-random numbers.<br/>
	 * The algorithm is as follows:<br/>
	 * <ul>
	 * <li>Set the two most significant bits (bits 6 and 7) of the clock_seq_hi_and_reserved to zero and one, respectively.</li>
	 * <li>Set the four most significant bits (bits 12 through 15) of the time_hi_and_version field to the 4-bit version number.
	 *   The version number is in the most significant 4 bits of the time stamp (bits 4 through 7 of the time_hi_and_version field).</li>
	 * <li>Set all the other bits to randomly (or pseudo-randomly) chosen values.</li>
	 * </ul>
	 *
	 * @return {String}
	 */
	static v4() {
		let randomBytes = crypto.randomBytes(16);
		// Per 4.4, set bits for version and clock_seq_hi_and_reserved
		randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40;
		randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80;
		return (
		    UUID.byteToHex[randomBytes[0]] +
		    UUID.byteToHex[randomBytes[1]] +
		    UUID.byteToHex[randomBytes[2]] +
		    UUID.byteToHex[randomBytes[3]] +
		    '-' +
		    UUID.byteToHex[randomBytes[4]] +
		    UUID.byteToHex[randomBytes[5]] +
		    '-' +
		    UUID.byteToHex[randomBytes[6]] +
		    UUID.byteToHex[randomBytes[7]] +
		    '-' +
		    UUID.byteToHex[randomBytes[8]] +
		    UUID.byteToHex[randomBytes[9]] +
		    '-' +
		    UUID.byteToHex[randomBytes[10]] +
		    UUID.byteToHex[randomBytes[11]] +
		    UUID.byteToHex[randomBytes[12]] +
		    UUID.byteToHex[randomBytes[13]] +
		    UUID.byteToHex[randomBytes[14]] +
		    UUID.byteToHex[randomBytes[15]]
	  	).toLowerCase();
	}
	/**
   * Alias of {@link UUID.v4}.
	 * @return {String}
	 */
	static version4() {
		return UUID.v4();
	}
	/**
	 * Prints a new UUID to the console or the help information.
	 */
	static main() {
		// Check if the user is asking for help.
		let commandLineOptions = new util.CommandLineOptions();
		let commandLineOption = commandLineOptions.createFlag('help','faq,info,information','help');
		commandLineOptions.add(commandLineOption);
		let UUIDOptions = commandLineOptions.parse();
		if(UUIDOptions.help) {
			util.Help.print(UUID);
			return;
		}
		// If we arrive here it means the user is not asking for help, but rather is asking
		// for a new UUID. Let's give them a fresh one.
		console.clear();
		console.log(UUID.v4());
	}
}
// Static properties
UUID.byteToHex = [];
for(let i = 0; i < 256; ++i) {
  UUID.byteToHex.push((i + 0x100).toString(16).substr(1));
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	UUID.main();
	return;
}
module.exports = UUID;