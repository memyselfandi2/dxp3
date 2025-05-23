class LocaleManager {
	static init() {
		let applicationLocale = '';
		let element = document.getElementById('application-locale');
		if((element !== undefined) && (element !== null)) {
			applicationLocale = element.value;
		}
	    applicationLocale = applicationLocale.trim().toLowerCase();
    	LocaleManager.currentLocale = applicationLocale;
	}

	static setLocale(locale, callback) {
    	LocaleManager.translate(locale, callback);
	}

	static selectLocale(locale, callback) {
    	LocaleManager.translate(locale, callback);
	}

	static translate(locale, callback) {
		if(locale === undefined || locale === null) {
			locale = '';
		}
		locale = locale.trim().toLowerCase();
	    LocaleManager.currentLocale = locale;
	}
}
LocaleManager.currentLocale = '';