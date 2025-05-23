class Root {
	constructor() {
		this.httpReverseProxyDomain = null;
		this.childNodes = new Map();
		this.leafNodes = new Map();
	}

	delete(host) {
		if(host === '*') {
			if(this.httpReverseProxyDomain != null) {
				this.httpReverseProxyDomain = null;
				return true;
			}
			return false;
		}
		let leafNode = this.leafNodes.get(host);
		if(leafNode === undefined || leafNode === null) {
			return false;
		}
		this.leafNodes.delete(host);
		let childNode = leafNode;
		childNode.setHTTPReverseProxyDomain(null);
		while(!childNode.hasChildNodes() && (childNode.getHTTPReverseProxyDomain() === null)) {
			let parentNode = childNode.getParentNode();
			if(parentNode === undefined || parentNode === null) {
				break;
			}
			parentNode.deleteChildNode(childNode.name);
			childNode = parentNode;
		}
	}

	get(host) {
		let parts = host.split('.');
		let currentNode = this;
		// we start with the catch all domain
		let result = this.httpReverseProxyDomain;
		for(let i=parts.length - 1;i >= 0;i--) {
			let part = parts[i];
			let childNode = currentNode.getChildNode(part);
			if(childNode === undefined || childNode === null) {
				break;
			}
			let httpReverseProxyDomain = childNode.getHTTPReverseProxyDomain();
			if(httpReverseProxyDomain != null) {
				result = httpReverseProxyDomain;
			}
			currentNode = childNode;
		}		
		return result;
	}

	set(host, _httpReverseProxyDomain) {
		if(host === '*') {
			this.httpReverseProxyDomain = _httpReverseProxyDomain;
			return;
		}
		let parts = host.split('.');
		// *.admin.finance.corporate.com
		// *.corporate.com
		let currentNode = this;
		for(let i=parts.length - 1;i >= 1;i--) {
			let part = parts[i];
			let childNode = currentNode.getChildNode(part);
			if(childNode === undefined || childNode === null) {
				childNode = new Node(part);
				currentNode.addChildNode(part, childNode); 
			}
			currentNode = childNode;
		}
		currentNode.setHTTPReverseProxyDomain(_httpReverseProxyDomain);
		this.leafNodes.set(host, currentNode);
	}

	getChildNode(name) {
		return this.childNodes.get(name);
	}

	addChildNode(name, childNode) {
		this.childNodes.set(name, childNode);
	}

	deleteChildNode(_name) {
		let childNode = this.childNodes.get(_name);
		if(childNode === undefined || childNode === null) {
			return false;
		}
		childNode.setParentNode(null);
		return this.childNodes.delete(_name);
	}

	getHTTPReverseProxyDomain() {
		return this.httpReverseProxyDomain;
	}

	setHTTPReverseProxyDomain(_httpReverseProxyDomain) {
		this.httpReverseProxyDomain = _httpReverseProxyDomain;
	}

	toString() {
		let result = '';
		for(let [key, value] of this.leafNodes) {
			result += '*.' + value.toString() + '\n';
		}
		if(this.httpReverseProxyDomain != null) {
			result += '*' + '\n';
		}
		return result;
	}
}

class Node {
	constructor(_name) {
		this.name = _name;
		this.httpReverseProxyDomain = null;
		this.childNodes = new Map();
	}

	get parentNode() {
		return this.getParentNode();
	}

	getParentNode() {
		return this._parentNode;
	}

	set parentNode(_parentNode) {
		this.setParentNode(_parentNode);
	}

	setParentNode(_parentNode) {
		this._parentNode = _parentNode;
	}

	getChildNode(_name) {
		return this.childNodes.get(_name);
	}

	addChildNode(_name, _childNode) {
		_childNode.setParentNode(this);
		this.childNodes.set(_name, _childNode);
	}

	deleteChildNode(_name) {
		let childNode = this.childNodes.get(_name);
		if(childNode === undefined || childNode === null) {
			return false;
		}
		childNode.setParentNode(null);
		return this.childNodes.delete(_name);
	}

	getHTTPReverseProxyDomain() {
		return this.httpReverseProxyDomain;
	}

	setHTTPReverseProxyDomain(_httpReverseProxyDomain) {
		this.httpReverseProxyDomain = _httpReverseProxyDomain;
	}

	hasChildNodes() {
		return this.childNodes.size > 0;
	}

	toString() {
		let result = this.name;
		if(this._parentNode != null) {
			result += '.' + this._parentNode.toString();
		}
		return result;
	}
}

// * -> com
// * -> com -> genbytes -> *
// * -> net
// * -> org
// * -> localhost
// * -> localhost -> api
// * -> localhost -> ui
// * -> localhost -> *
class HTTPReverseProxyDomainMap {

	constructor() {
		this.runtimeDomains = new Map();
		this.domains = new Map();
		this.wildCardDomains = new Root();
		this.allDomains = new Map();
	}

	clear() {
		this.runtimeDomains = new Map();
		this.domains = new Map();
		this.wildCardDomains = new Root();
		this.allDomains = new Map();
	}

	delete(host) {
		if(host === undefined || host === null) {
			host = '*';
		}
		host = host.trim();
		if(host.length <= 0) {
			host = '*';
		}
		let result = this.allDomains.delete(host);
		if(host.startsWith('*')) {
			this.wildCardDomains.delete(host);
		} else {
			this.domains.delete(host);
		}
		this.runtimeDomains.clear();
		return result;
	}

	get(host) {
		let result = this.runtimeDomains.get(host);
		if(result === undefined || result === null) {
			result = this.domains.get(host);
			if(result === undefined || result === null) {
				result = this.wildCardDomains.get(host);
				if(result === undefined || result === null) {
					return null;
				}
			}
			this.runtimeDomains.set(host, result);
		}
		return result;
	}

	set(host, httpReverseProxyDomain) {
		if(host === undefined || host === null) {
			host = '*';
		}
		host = host.trim();
		if(host.length <= 0) {
			host = '*';
		}
		this.allDomains.set(host, httpReverseProxyDomain);
		if(host.startsWith('*')) {
			this.wildCardDomains.set(host, httpReverseProxyDomain);
		} else {
			this.domains.set(host, httpReverseProxyDomain);
		}
		this.runtimeDomains.clear();
	}

	toMap() {
		return this.allDomains;
	}

	toString() {
		let result = '';
		for(let [key, value] of this.allDomains) {
			result += key + '\n';
		}
		return result;
	}
}

// let blaat = new HTTPReverseProxyDomainMap();
// blaat.set('*', {name:'this is the catch all'});
// blaat.set('*.localhost', {name:'this is *.localhost'});
// blaat.set('*.admin.finance.corporate.com', {name:'this is subdomain of admin.finance.corporate.com'});
// blaat.set('*.corporate.com', {name:'this is subdomain of corporate.com'});
// blaat.set('corporate.com', {name: 'this is the absolute corporate.com'})
// let host = 'localhost';
// let domain = blaat.get(host);
// console.log(host + ' returned: ' + domain.name);
// host = 'api.localhost';
// domain = blaat.get(host);
// console.log(host + ' returned: ' + domain.name);
// host = '127.0.0.1';
// domain = blaat.get(host);
// console.log(host + ' returned: ' + domain.name);
// host = 'admin.distribution.corporate.com';
// domain = blaat.get(host);
// console.log(host + ' returned: ' + domain.name);
// host = 'it.admin.finance.corporate.com';
// domain = blaat.get(host);
// console.log(host + ' returned: ' + domain.name);
// host = 'corporate.com';
// domain = blaat.get(host);
// console.log(host + ' returned: ' + domain.name);
// host = 'api.corporate.com';
// domain = blaat.get(host);
// console.log(host + ' returned: ' + domain.name);

// console.log(blaat.toString());

// blaat.delete('*.localhost');
 
// console.log(blaat.toString());
// blaat.delete('*.corporate.com');
 
// console.log(blaat.toString());
// blaat.delete('*');
 
// console.log(blaat.toString());
// blaat.delete('corporate.com');
 
// console.log(blaat.toString());
// blaat.delete('*.admin.finance.corporate.com');
 
// console.log(blaat.toString());
module.exports = HTTPReverseProxyDomainMap;