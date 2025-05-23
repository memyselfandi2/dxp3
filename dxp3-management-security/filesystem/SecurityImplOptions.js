const util = require('dxp3-util');

class SecurityImplOptions extends util.Options {

	constructor() {
		super();
		this.sourceFolder = null;
		super.setAliases('dir,directory,folder,root,source', 'sourceFolder');
	}

	static parseCommandLine() {
		let result = new SecurityImplOptions();
		let commandLineOptions = new util.CommandLineOptions();
		let commandLineOption = commandLineOptions.createString('sourcefolder',
															'dir,directory,folder,root,source',
															'sourceFolder');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}

module.exports = SecurityImplOptions;