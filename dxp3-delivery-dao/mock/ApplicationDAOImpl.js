class ApplicationDAOImpl {
	constructor(args) {
	}

	get(domain, applicationUUID, callback) {
	}

	getController(domain, applicationUUID, locale, callback) {
		callback(null, "alert('hello');");
	}

	getImage(domain, applicationUUID, name, locale, callback) {
		callback(404);
	}

	getStyle(domain, applicationUUID, locale, callback) {
		callback(null, "p {border:1px solid blue;}");
	}

	getStyleImage(domain, applicationUUID, name, locale, callback) {
		callback(404);
	}
}

module.exports = ApplicationDAOImpl;