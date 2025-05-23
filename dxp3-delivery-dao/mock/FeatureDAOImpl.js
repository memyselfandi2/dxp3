class FeatureDAOImpl {
	constructor(args) {
	}

	get(domain, featureUUID, callback) {
	}

	getController(domain, featureUUID, instanceID, locale, callback) {
		callback(null, "alert('hello');");
	}

	getImage(domain, featureUUID, name, locale, callback) {
		callback(404);
	}

	getLayout(domain, featureUUID, instanceID, locale, callback) {
		callback(null, "<div>hello <p>paragraph</p>.</div>");
	}

	getStyle(domain, featureUUID, instanceID, locale, callback) {
		callback(null, "p {border:1px solid blue;}");
	}

	getStyleImage(domain, featureUUID, name, locale, callback) {
		callback(404);
	}
}

module.exports = FeatureDAOImpl;