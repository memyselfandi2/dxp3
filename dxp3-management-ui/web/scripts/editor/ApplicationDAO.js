class ApplicationDAO {

	static create(applicationName, isTemplate, parentUUIDs, shortName, description, callback) {
		if(applicationName === undefined || applicationName === null) {
			applicationName = '';
		}
		applicationName = applicationName.trim();
		if(applicationName.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please provide a name for this application.";
				return callback(null, error);
			}
			return;
		}
		if(isTemplate === undefined || isTemplate === null) {
			isTemplate = false;
		}
		if(parentUUIDs === undefined || parentUUIDs === null) {
			parentUUIDs = [];
		}
		if(shortName === undefined || shortName === null) {
			shortName = '';
		}
		shortName = shortName.trim();
		if(description === undefined || description === null) {
			description = '';
		}
		description = description.trim();
	    Security.fetch('/application/', { 
	    	method: "POST",
	        body: {"name": applicationName,
	        	   "isTemplate": isTemplate,
	        	   "parentUUIDs": parentUUIDs,
	        	   "shortName": shortName,
	               "description": description},
	    	headers: {"Content-Type": "application/json"}
	    })
		.then(function(response) {
			if(response.status === 409) {
				if(callback) {
					let error = {};
					error.code = 409;
					error.message = "An application with the same name already exists. Please try a different name.";
					return callback(null, error);
				}
			} else if(response.status != 200) {
				if(callback) {
					let error = {};
					error.code = 500;
					error.message = "An unknown error occurred. Please try again later.";
					return callback(null, error);
				}
			} else {
				response.json().then(function(data) {
					ApplicationDAO.dispatchEvent('create', data.uuid);
					if(callback) {
						return callback(data.uuid);
					}
		        });
			}
		})
		.catch(function(exception) {
			if(callback) {
				let error = {};
				error.code = 500;
				error.message = "An unknown error occurred. Please try again later.";
				callback(null, error);
			}
		});
	}

	static readController(applicationUUID, controllerUUID, callback) {
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
		if(controllerUUID === undefined || controllerUUID === null) {
			controllerUUID = '';
		}
		controllerUUID = controllerUUID.trim();
		let fetchAbortController = new AbortController();
	    Security.fetch('/application/' + applicationUUID + /controller/ + controllerUUID, { 
	    	method: "GET",
	    	headers: {"Content-Type": "application/json"}
	    }, fetchAbortController)
		.then(function(response) {
			if(response.status === 404) {
				if(callback) {
					let error = {};
					error.code = 404;
					error.message = "Application not found.";
					return callback(error);
				}
			} else {
				if(controllerUUID.length <= 0) {
					response.json().then(function(data) {
						if(callback) {
							callback(null, data);
						}
					});
				} else {
					response.text().then(function(data) {
						if(callback) {
							callback(null, data);
						}
					});
				}
			}
		})
		.catch(function(err) {
			if(err.name === 'AbortError') {
				return;
			}
			if(callback) {
				let error = {};
				error.code = 500;
				error.message = "An unknown error occurred. Please try again later.";
				callback(error);
			}
		});
		return fetchAbortController;
	}

	static listImages(applicationUUID, callback) {
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

	static readStyle(applicationUUID, styleUUID, callback) {
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
		if(styleUUID === undefined || styleUUID === null) {
			styleUUID = '';
		}
		styleUUID = styleUUID.trim();
	    Security.fetch('/application/' + applicationUUID + /style/ + styleUUID, { 
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
				if(styleUUID.length <= 0) {
					response.json().then(function(data) {
						if(callback) {
							callback(null, data);
						}
					});
				} else {
					response.text().then(function(data) {
						if(callback) {
							callback(null, data);
						}
					});
				}
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

	static list(filterBy, sortBy, callback) {
		// if(checkedFilterType === 'templateonly') {
		// 	filterBy = 'filterBy[isTemplate]=true';
		// } else if(checkedFilterType === 'applicationonly') {
		// 	filterBy = 'filterBy[isTemplate]=false';
		// }
		// nameRegex = (nameRegex === undefined || nameRegex === null) ? '' : nameRegex;
		// nameRegex = nameRegex.trim();
		// if(nameRegex.length > 0) {
		// 	if(filterBy.length > 0) {
		// 		filterBy += '&';
		// 	}
		// 	filterBy += 'filterBy[name]=' + nameRegex;
		// }
		// var sortBy = 'sortBy=';
		// if(thisEditorElement.sortOrder === 'descending') {
		// 	sortBy += '-';
		// }
		// sortBy += thisEditorElement.sortColumn;
		// var filterByAndSortBy = '';
		// if(filterBy.length > 0) {
		// 	filterByAndSortBy = filterBy;
		// }
		// if(sortBy.length > 0) {
		// 	if(filterByAndSortBy.length > 0) {
		// 		filterByAndSortBy += '&';
		// 	}
		// 	filterByAndSortBy += sortBy;
		// }
		// var url = '/application/';
		// if(filterByAndSortBy.length > 0) {
		// 	url += '?' + filterByAndSortBy;
		// }
	 //    Security.fetch(url, { 
	 //    	method: "GET",
	 //    	headers: {"Content-Type": "application/json"}
	 //    })
	 //    .then(function(response) {
		// 	if(response.status === 404) {
		// 		if(callback) {
		// 			let error = {};
		// 			error.code = 404;
		// 			error.message = "No applications.";
		// 			return callback(error);
		// 		}
		// 	} else {
		// 		response.json().then(function(data) {
		// 			if(callback) {
		// 				callback(data);
		// 			}
		// 		});
		// 	}
		// })
		// .catch(function(exception) {
		// 	if(callback) {
		// 		let error = {};
		// 		error.code = 500;
		// 		error.message = "An unknown error occurred. Please try again later.";
		// 		callback(error);
		// 	}
		// });
	}

	static read(uuid, callback) {
		if(uuid === undefined || uuid === null) {
			uuid = '';
		}
		uuid = uuid.trim();
		if(uuid.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select an application to retrieve.";
				return callback(null, error);
			}
			return;
		}
	    Security.fetch('/application/' + uuid, { 
	    	method: "GET",
	    	headers: {"Content-Type": "application/json"}
	    })
		.then(function(response) {
			if(response.status === 404) {
				if(callback) {
					let error = {};
					error.code = 404;
					error.message = "Application not found.";
					return callback(null, error);
				}
			} else {
				response.json().then(function(data) {
					if(callback) {
						callback(data);
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

	static updateStyle(applicationUUID, styleUUID, name, description, code, callback) {
		// Defensive programming...check input...
		if(applicationUUID === undefined || applicationUUID === null) {
			applicationUUID = '';
		}
		applicationUUID = applicationUUID.trim();
		if(applicationUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select an application to update.";
				return callback(null, error);
			}
			return;
		}
		if(name === undefined || name === null) {
			name = '';
		}
		name = name.trim();
		Security.fetch('/application/' + applicationUUID + '/style/' + styleUUID, { 
			method: "PUT",
			body: {"name": name,
				   "code" : code},
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
			} else if(response.status != 200) {
				if(callback) {
					let error = {};
					error.code = 500;
					error.message = "An unknown error occurred. Please try again later.";
					return callback(error);
				}
			} else {
				response.json().then(function(data) {
					let event = {};
					event.uuid = data.uuid;
					event.name = data.name;
					ApplicationDAO.dispatchEvent('update-style', event);
					if(callback) {
						callback(null, data.uuid, data.name);
					}
				});
			}
		})
		.catch(function(error) {
			if(callback) {
				let error = {};
				error.code = 500;
				error.message = "An unknown error occurred. Please try again later.";
				callback(error);
			}
		});
	}

	static createStyle(applicationUUID, styleName, description, code, callback) {
		// Defensive programming...check input...
		if(applicationUUID === undefined || applicationUUID === null) {
			applicationUUID = '';
		}
		applicationUUID = applicationUUID.trim();
		if(applicationUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select an application to update.";
				return callback(null, error);
			}
			return;
		}
		if(styleName === undefined || styleName === null) {
			styleName = '';
		}
		styleName = styleName.trim();
		let body = {};
		body.name = styleName;
		if(description != null) {
			body.description = description;
		}
		if(code != null) {
			body.code = code;
		}
		Security.fetch('/application/' + applicationUUID + '/style/', { 
			method: "POST",
			body: body,
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
			} else if(response.status != 200) {
				if(callback) {
					let error = {};
					error.code = 500;
					error.message = "An unknown error occurred. Please try again later.";
					return callback(error);
				}
			} else {
				response.json().then(function(data) {
					let event = {};
					event.uuid = data.uuid;
					event.name = data.name;
					ApplicationDAO.dispatchEvent('create-style', event);
					if(callback) {
						callback(null, data.uuid, data.name);
					}
				});
			}
		})
		.catch(function(error) {
			if(callback) {
				let error = {};
				error.code = 500;
				error.message = "An unknown error occurred. Please try again later.";
				callback(error);
			}
		});
	}

	static createController(applicationUUID, controllerName, description, code, callback) {
		// Defensive programming...check input...
		if(applicationUUID === undefined || applicationUUID === null) {
			applicationUUID = '';
		}
		applicationUUID = applicationUUID.trim();
		if(applicationUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select an application to update.";
				return callback(null, error);
			}
			return;
		}
		if(controllerName === undefined || controllerName === null) {
			controllerName = '';
		}
		controllerName = controllerName.trim();
		let body = {};
		body.name = controllerName;
		if(description != null) {
			body.description = description;
		}
		if(code != null) {
			body.code = code;
		}
		Security.fetch('/application/' + applicationUUID + '/controller/', { 
			method: "POST",
			body: body,
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
			} else if(response.status != 200) {
				if(callback) {
					let error = {};
					error.code = 500;
					error.message = "An unknown error occurred. Please try again later.";
					return callback(error);
				}
			} else {
				response.json().then(function(data) {
					let event = {};
					event.uuid = data.uuid;
					event.name = data.name;
					ApplicationDAO.dispatchEvent('create-controller', event);
					if(callback) {
						callback(null, data.uuid, data.name);
					}
				});
			}
		})
		.catch(function(error) {
			if(callback) {
				let error = {};
				error.code = 500;
				error.message = "An unknown error occurred. Please try again later.";
				callback(error);
			}
		});
	}

	static updateControllerList(applicationUUID, controllerUUIDs, callback) {
		// Defensive programming...check input...
		if(applicationUUID === undefined || applicationUUID === null) {
			applicationUUID = '';
		}
		applicationUUID = applicationUUID.trim();
		if(applicationUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select an application to update.";
				return callback(null, error);
			}
			return;
		}
		Security.fetch('/application/' + applicationUUID + '/controller/', { 
			method: "PUT",
			body: {"controllerUUIDs": controllerUUIDs},
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
			} else if(response.status != 200) {
				if(callback) {
					let error = {};
					error.code = 500;
					error.message = "An unknown error occurred. Please try again later.";
					return callback(error);
				}
			} else {
				response.json().then(function(data) {
					let event = {};
					ApplicationDAO.dispatchEvent('update-controller-list', event);
					if(callback) {
						callback(null);
					}
				});
			}
		})
		.catch(function(error) {
			if(callback) {
				let error = {};
				error.code = 500;
				error.message = "An unknown error occurred. Please try again later.";
				callback(error);
			}
		});
	}

	static updateController(applicationUUID, controllerUUID, name, description, code, callback) {
		// Defensive programming...check input...
		if(applicationUUID === undefined || applicationUUID === null) {
			applicationUUID = '';
		}
		applicationUUID = applicationUUID.trim();
		if(applicationUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select an application to update.";
				return callback(null, error);
			}
			return;
		}
		if(name === undefined || name === null) {
			name = '';
		}
		name = name.trim();
		Security.fetch('/application/' + applicationUUID + '/controller/' + controllerUUID, { 
			method: "PUT",
			body: {"name": name,
				   "code" : code},
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
			} else if(response.status != 200) {
				if(callback) {
					let error = {};
					error.code = 500;
					error.message = "An unknown error occurred. Please try again later.";
					return callback(error);
				}
			} else {
				response.json().then(function(data) {
					let event = {};
					event.uuid = data.uuid;
					event.name = data.name;
					ApplicationDAO.dispatchEvent('update-controller', event);
					if(callback) {
						callback(null, data.uuid, data.name);
					}
				});
			}
		})
		.catch(function(error) {
			if(callback) {
				let error = {};
				error.code = 500;
				error.message = "An unknown error occurred. Please try again later.";
				callback(error);
			}
		});
	}

	static update(uuid, applicationName, isTemplate, parentUUIDs, shortName, homePageUUID, description, callback) {
		if(uuid === undefined || uuid === null) {
			uuid = '';
		}
		uuid = uuid.trim();
		if(uuid.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select an application to update.";
				return callback(null, error);
			}
			return;
		}
		if(applicationName === undefined || applicationName === null) {
			applicationName = '';
		}
		applicationName = applicationName.trim();
		if(applicationName.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please provide a name for this application.";
				return callback(null, error);
			}
			return;
		}
		if(isTemplate === undefined || isTemplate === null) {
			isTemplate = false;
		}
		if(parentUUIDs === undefined || parentUUIDs === null) {
			parentUUIDs = [];
		}
		if(shortName === undefined || shortName === null) {
			shortName = '';
		}
		shortName = shortName.trim();
		if(homePageUUID === undefined || homePageUUID === null) {
			homePageUUID = '';
		}
		homePageUUID = homePageUUID.trim();
		if(description === undefined || description === null) {
			description = '';
		}
		description = description.trim();
	    Security.fetch('/application/' + uuid, { 
	    	method: "PUT",
	    	body: {"name": applicationName,
	        	   "isTemplate": isTemplate,
	               "parentUUIDs": parentUUIDs,
	        	   "shortName": shortName,
	        	   "homePageUUID": homePageUUID,
	               "description": description},
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
			} else if(response.status === 409) {
				if(callback) {
					let error = {};
					error.code = 409;
					error.message = "An application with the same name already exists. Please try a different name.";
					return callback(error);
				}				
			} else {
				response.json().then(function(data) {
					ApplicationDAO.dispatchEvent('update', data.uuid);
					if(callback) {
						callback(null, data.uuid);
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

	static deleteStyle(uuid, name, callback) {
		if(uuid === undefined || uuid === null) {
			uuid = '';
		}
		uuid = uuid.trim();
		if(uuid.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select an application.";
				return callback(null, error);
			}
			return;
		}
		if(name === undefined || name === null) {
			name = '';
		}
		name = name.trim();
		if(name.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please provide the name of the style to delete.";
				return callback(null, error);
			}
			return;
		}
	    Security.fetch('/application/' + uuid + '/style/' + name, { 
	    	method: "DELETE",
	    	headers: {"Content-Type": "application/json"}
	    })
		.then(function(response) {
			if(response.status === 404) {
				if(callback) {
					let error = {};
					error.code = 404;
					error.message = "Application style not found.";
					return callback(error);
				}
				return;
			}
			if(response.status != 200) {
				if(callback) {
					let error = {};
					error.code = 500;
					error.message = "An unknown error occurred. Please try again later.";
					return callback(error);
				}
				return;
			}
			let event = {};
			event.uuid = uuid;
			event.styleName = name;
			ApplicationDAO.dispatchEvent('delete-style', event);
			if(callback) {
				callback(null, event);
			}
		})
		.catch(function(error) {
			if(callback) {
				let error = {};
				error.code = 500;
				error.message = "An unknown error occurred. Please try again later.";
				callback(error);
			}
		});
	}

	static deleteController(applicationUUID, controllerUUID, callback) {
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
		if(controllerUUID === undefined || controllerUUID === null) {
			controllerUUID = '';
		}
		controllerUUID = controllerUUID.trim();
		if(controllerUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please provide the controller to delete.";
				return callback(null, error);
			}
			return;
		}
	    Security.fetch('/application/' + applicationUUID + '/controller/' + controllerUUID, { 
	    	method: "DELETE",
	    	headers: {"Content-Type": "application/json"}
	    })
		.then(function(response) {
			if(response.status === 404) {
				if(callback) {
					let error = {};
					error.code = 404;
					error.message = "Application controller not found.";
					return callback(null, error);
				}
				return;
			}
			if(response.status != 200) {
				if(callback) {
					let error = {};
					error.code = 500;
					error.message = "An unknown error occurred. Please try again later.";
					return callback(null, error);
				}
				return;
			}
			let event = {};
			event.uuid = uuid;
			event.controllerName = name;
			ApplicationDAO.dispatchEvent('delete-controller', event);
			if(callback) {
				callback(event);
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

	static delete(uuid, callback) {
		if(uuid === undefined || uuid === null) {
			uuid = '';
		}
		uuid = uuid.trim();
		if(uuid.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select an application to delete.";
				return callback(null, error);
			}
			return;
		}
	    Security.fetch('/application/' + uuid, { 
	    	method: "DELETE",
	    	headers: {"Content-Type": "application/json"}
	    })
		.then(function(response) {
			if(response.status === 404) {
				if(callback) {
					let error = {};
					error.code = 404;
					error.message = "Application not found.";
					return callback(null, error);
				}
				return;
			}
			response.json().then(function(data) {
				ApplicationDAO.dispatchEvent('delete', data.uuid);
				if(callback) {
					callback(data.uuid);
				}
			});
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

	static addEventListener(eventType, eventListener) {
		if(eventType === undefined || eventType === null) {
			return;
		}
		if(eventListener === undefined || eventListener === null) {
			return;
		}
		let eventListeners = ApplicationDAO.eventListenersByEventType[eventType];
		if(eventListeners === undefined || eventListeners === null) {
			eventListeners = [];
			ApplicationDAO.eventListenersByEventType[eventType] = eventListeners;
		}
		console.log('adding event listener for "' + eventType + '"');
		eventListeners.push(eventListener);
	}

	static dispatchEvent(eventType, event) {
		if(eventType === undefined || eventType === null) {
			return;
		}
		console.log('checking for listeners for "' + eventType + '"');
		let eventListeners = ApplicationDAO.eventListenersByEventType[eventType];
		if(eventListeners === undefined || eventListeners === null) {
			return;
		}
		for(let i=0;i < eventListeners.length;i++) {
			console.log('dispatching event ' + eventType + ' to event listener ' + i);
			eventListeners[i](event);
		}
	}
}

ApplicationDAO.eventListenersByEventType = [];