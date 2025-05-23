const util = require('dxp3-util');

class DAOImplOptions extends util.Options {

	constructor() {
		super();
		this.sourceFolder = null;
		super.setAliases('dir,directory,folder,source', 'sourceFolder');
	}

	static parseCommandLine() {
		let result = new DAOImplOptions();
		let commandLineOptions = new util.CommandLineOptions();
		let commandLineOption = commandLineOptions.createString('sourcefolder',
															'dir,directory,folder,source',
															'sourceFolder');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}

module.exports = DAOImplOptions;