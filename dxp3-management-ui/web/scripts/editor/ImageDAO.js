class ImageDAO {

	// static createImage(name, description, files) {
	// 	let formData = new FormData();
	// 	for(let i = 0; i < files.length; i++) {
	// 		let file = files[i];
	// 		if (!file.type.match('image.*')) {
	// 			continue;
	// 		}
	// 		formData.append('thefile', file, file.name);
	// 	}
	//     Security.fetch('/application/' + applicationAdminPanel.currentApplicationUuid + '/style/image/', {
	//     	method: 'POST',
	//     	body: formData
	//     })
	//     .then() {

	//     }
	// }

	// static createImage(applicationUUID, styleName, description, code, callback) {
	// 	// Defensive programming...check input...
	// 	if(applicationUUID === undefined || applicationUUID === null) {
	// 		applicationUUID = '';
	// 	}
	// 	applicationUUID = applicationUUID.trim();
	// 	if(applicationUUID.length <= 0) {
	// 		if(callback) {
	// 			let error = {};
	// 			error.code = 400;
	// 			error.message = "Please select an application to update.";
	// 			return callback(null, error);
	// 		}
	// 		return;
	// 	}
	// 	if(styleName === undefined || styleName === null) {
	// 		styleName = '';
	// 	}
	// 	styleName = styleName.trim();
	// 	let body = {};
	// 	body.name = styleName;
	// 	if(description != null) {
	// 		body.description = description;
	// 	}
	// 	if(code != null) {
	// 		body.code = code;
	// 	}
	// 	Security.fetch('/application/' + applicationUUID + '/style/', { 
	// 		method: "POST",
	// 		body: body,
	// 		headers: {"Content-Type": "application/json"}
	// 	})
	// 	.then(function(response) {
	// 		if(response.status === 404) {
	// 			if(callback) {
	// 				let error = {};
	// 				error.code = 404;
	// 				error.message = "Application not found.";
	// 				return callback(error);
	// 			}
	// 		} else if(response.status != 200) {
	// 			if(callback) {
	// 				let error = {};
	// 				error.code = 500;
	// 				error.message = "An unknown error occurred. Please try again later.";
	// 				return callback(error);
	// 			}
	// 		} else {
	// 			response.json().then(function(data) {
	// 				let event = {};
	// 				event.uuid = data.uuid;
	// 				event.name = data.name;
	// 				ApplicationDAO.dispatchEvent('create-style', event);
	// 				if(callback) {
	// 					callback(null, data.uuid, data.name);
	// 				}
	// 			});
	// 		}
	// 	})
	// 	.catch(function(error) {
	// 		if(callback) {
	// 			let error = {};
	// 			error.code = 500;
	// 			error.message = "An unknown error occurred. Please try again later.";
	// 			callback(error);
	// 		}
	// 	});
	// }


	static list(applicationUUID, callback) {
		if(applicationUUID === undefined || applicationUUID === null) {
			applicationUUID = '';
		}
		applicationUUID = applicationUUID.trim();
		if(applicationUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select an application.";
				return callback(null, error);
			}
			return;
		}
	    Security.fetch('/application/' + applicationUUID + /image/, { 
	    	method: "GET",
	    	headers: {"Content-Type": "application/json"}
	    })
		.then(function(response) {
			if(response.status === 404) {
				if(callback) {
					let error = {};
					error.code = 404;
					error.message = "Application not found.";
					return callback(error);
				}
			} else {
				response.json().then(function(data) {
					if(callback) {
						callback(null, data);
					}
				});
			}
		})
		.catch(function(error) {
			if(callback) {
				let error = {};
				error.code = 500;
				error.message = "An unknown error occurred. Please try again later.";
				callback(null, error);
			}
		});
	}
}