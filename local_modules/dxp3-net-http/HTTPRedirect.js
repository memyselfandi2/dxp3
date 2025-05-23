class HTTPRedirect {
	constructor(_regexp, _location) {
		this._regexp = _regexp;
		this._location = _location;
		let variableRegexp = /(?<=\{)(.*?)(?=\})/g;
		this._variables = [];
		let match = this._location.match(variableRegexp);
		if(match) {
			for(let i=0;i < match.length;i++) {
				let variable = match[i];
				if(variable.startsWith('request.')) {
					continue;
				}
				this._variables.push(variable);
			}
		}
	}

	handle(_request, _response) {
		let location = this._location;
		for(let i=0;i < this._variables.length;i++) {
			let variable = this._variables[i];
			let value = _request.params[variable];
			console.log(variable + ' = ' + value);
			location = location.replace('{' + variable + '}', value);
		}
		location = location.replace(/{request.host}/, _request.host);
		location = location.replace(/{request.path}/, _request.URL.path);
		location = location.replace(/{request.search}/, _request.URL.search);
		_response.redirect(location);
	}

	get regexp() {
		return this.getRegexp();
	}

	getRegexp() {
		return this._regexp;
	}

	get location() {
		return this.getLocation();
	}

	getLocation() {
		return this._location;
	}
}

module.exports=HTTPRedirect;