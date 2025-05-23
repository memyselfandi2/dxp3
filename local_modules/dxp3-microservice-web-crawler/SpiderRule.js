class SpiderRule {

	constructor() {
		// We can limit a spider to only visit certain hosts/domains.
		this.hostNames = new Set();
	}

	addHost(_hostName) {
		if(_hostName === undefined || _hostName === null) {
			return;
		}
		_hostName = _hostName.trim().toLowerCase();
		if(_hostName.length <= 0) {
			return;
		}
		this.hostNames.add(_hostName);
	}

	match(_urlString) {
		if(this.hostNames.size <= 0) {
			return true;
		}
		let url = new URL(_urlString);
		let _hostName = url.hostname;
		_hostName = _hostName.trim().toLowerCase();
		for(let hostName of this.hostNames) {
			if(_hostName.endsWith(hostName)) {
				return true;
			}
		}
		return false;
	}

	getHosts() {
		return Array.from(this.hostNames);
	}
}

module.exports = SpiderRule;