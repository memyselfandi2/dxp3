class DomainDAOImpl {
	constructor() {
	}

	get(domain, response) {
		let data = {
			applicationUUID:'123',
			pageUUID:'abc'
		};
        response.send(null, data);
	}
}

module.exports = DomainDAOImpl;