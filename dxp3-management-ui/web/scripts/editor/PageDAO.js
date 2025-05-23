class PageDAO {

	static create(applicationUUID, name, isTemplate, parentUUIDs, description, callback) {
		// Defensive programming...check input...
		if(applicationUUID === undefined || applicationUUID === null) {
			applicationUUID = '';
		}
		applicationUUID = applicationUUID.trim();
		if(applicationUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please provide the application to create the page for.";
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
				error.message = "Please provide a name for this page.";
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
		if(description === undefined || description === null) {
			description = '';
		}
		description = description.trim();
	    Security.fetch('/page/', { 
	    	method: "POST",
	        body: {"applicationUUID": applicationUUID,
	        	   "name": name,
	        	   "isTemplate": isTemplate,
	        	   "parentUUIDs": parentUUIDs,
	               "description": description},
	    	headers: {"Content-Type": "application/json"}
	    })
		.then(function(response) {
			if(response.status === 409) {
				if(callback) {
					let error = {};
					error.code = 409;
					error.message = "An page with the same name already exists. Please try a different name.";
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
					event.applicationUUID = data.applicationUUID;
					event.uuid = data.uuid;
					PageDAO.dispatchEvent('create', event);
					if(callback) {
						return callback(null, event);
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

	static readLayout(pageUUID, layoutUUID, callback) {
		if(pageUUID === undefined || pageUUID === null) {
			pageUUID = '';
		}
		pageUUID = pageUUID.trim();
		if(pageUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select a page.";
				return callback(error);
			}
			return;
		}
		if(layoutUUID === undefined || layoutUUID === null) {
			layoutUUID = '';
		}
		layoutUUID = layoutUUID.trim();
	    Security.fetch('/page/' + pageUUID + /layout/ + layoutUUID, { 
	    	method: "GET",
	    	headers: {"Content-Type": "application/json"}
	    })
		.then(function(response) {
			if(response.status === 404) {
				if(callback) {
					let error = {};
					error.code = 404;
					error.message = "Page not found.";
					return callback(error);
				}
			} else {
				if(layoutUUID.length <= 0) {
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
				callback(error);
			}
		});
	}

	static readController(pageUUID, controllerUUID, callback) {
		if(pageUUID === undefined || pageUUID === null) {
			pageUUID = '';
		}
		pageUUID = pageUUID.trim();
		if(pageUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select a page.";
				return callback(error);
			}
			return;
		}
		if(controllerUUID === undefined || controllerUUID === null) {
			controllerUUID = '';
		}
		controllerUUID = controllerUUID.trim();
	    Security.fetch('/page/' + pageUUID + /controller/ + controllerUUID, { 
	    	method: "GET",
	    	headers: {"Content-Type": "application/json"}
	    })
		.then(function(response) {
			if(response.status === 404) {
				if(callback) {
					let error = {};
					error.code = 404;
					error.message = "Page not found.";
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
		.catch(function(error) {
			if(callback) {
				let error = {};
				error.code = 500;
				error.message = "An unknown error occurred. Please try again later.";
				callback(error);
			}
		});
	}

	static readStyle(pageUUID, styleUUID, callback) {
		if(pageUUID === undefined || pageUUID === null) {
			pageUUID = '';
		}
		pageUUID = pageUUID.trim();
		if(pageUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select a page.";
				return callback(error);
			}
			return;
		}
		if(styleUUID === undefined || styleUUID === null) {
			styleUUID = '';
		}
		styleUUID = styleUUID.trim();
	    Security.fetch('/page/' + pageUUID + /style/ + styleUUID, { 
	    	method: "GET",
	    	headers: {"Content-Type": "application/json"}
	    })
		.then(function(response) {
			if(response.status === 404) {
				if(callback) {
					let error = {};
					error.code = 404;
					error.message = "Page not found.";
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
				callback(error);
			}
		});
	}

	static read(pageUUID, callback) {
		if(pageUUID === undefined || pageUUID === null) {
			pageUUID = '';
		}
		pageUUID = pageUUID.trim();
		if(pageUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select a page to retrieve.";
				return callback(null, error);
			}
			return;
		}
	    Security.fetch('/page/' + pageUUID, { 
	    	method: "GET",
	    	headers: {"Content-Type": "application/json"}
	    })
		.then(function(response) {
			if(response.status === 404) {
				if(callback) {
					let error = {};
					error.code = 404;
					error.message = "Page not found.";
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

	static updateLayout(pageUUID, layoutUUID, name, description, code, callback) {
		// Defensive programming...check input...
		if(pageUUID === undefined || pageUUID === null) {
			pageUUID = '';
		}
		pageUUID = pageUUID.trim();
		if(pageUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select a page to update.";
				return callback(null, error);
			}
			return;
		}
		if(name === undefined || name === null) {
			name = '';
		}
		name = name.trim();
		Security.fetch('/page/' + pageUUID + '/layout/' + layoutUUID, { 
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
					event.ownerUUID = data.ownerUUID;
					event.uuid = data.uuid;
					event.name = data.name;
					PageDAO.dispatchEvent('update-layout', event);
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

	static updateStyle(pageUUID, styleUUID, name, description, code, callback) {
		// Defensive programming...check input...
		if(pageUUID === undefined || pageUUID === null) {
			pageUUID = '';
		}
		pageUUID = pageUUID.trim();
		if(pageUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select a page to update.";
				return callback(null, error);
			}
			return;
		}
		if(name === undefined || name === null) {
			name = '';
		}
		name = name.trim();
		Security.fetch('/page/' + pageUUID + '/style/' + styleUUID, { 
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
					event.ownerUUID = data.ownerUUID;
					event.uuid = data.uuid;
					event.name = data.name;
					PageDAO.dispatchEvent('update-style', event);
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

	static createStyle(pageUUID, styleName, description, code, callback) {
		// Defensive programming...check input...
		if(pageUUID === undefined || pageUUID === null) {
			pageUUID = '';
		}
		pageUUID = pageUUID.trim();
		if(pageUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select a page to update.";
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
		Security.fetch('/page/' + pageUUID + '/style/', { 
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
					event.ownerUUID = data.ownerUUID;
					event.uuid = data.uuid;
					event.name = data.name;
					PageDAO.dispatchEvent('create-style', event);
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

	static createLayout(pageUUID, layoutName, description, code, callback) {
		// Defensive programming...check input...
		if(pageUUID === undefined || pageUUID === null) {
			pageUUID = '';
		}
		pageUUID = pageUUID.trim();
		if(pageUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select a page to update.";
				return callback(null, error);
			}
			return;
		}
		if(layoutName === undefined || layoutName === null) {
			layoutName = '';
		}
		layoutName = layoutName.trim();
		let body = {};
		body.name = layoutName;
		if(description != null) {
			body.description = description;
		}
		if(code != null) {
			body.code = code;
		}
		Security.fetch('/page/' + pageUUID + '/layout/', { 
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
					event.ownerUUID = data.ownerUUID;
					event.uuid = data.uuid;
					event.name = data.name;
					PageDAO.dispatchEvent('create-layout', event);
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

	static createController(pageUUID, controllerName, description, code, callback) {
		// Defensive programming...check input...
		if(pageUUID === undefined || pageUUID === null) {
			pageUUID = '';
		}
		pageUUID = pageUUID.trim();
		if(pageUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select a page to update.";
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
		Security.fetch('/page/' + pageUUID + '/controller/', { 
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
					event.ownerUUID = data.ownerUUID;
					event.uuid = data.uuid;
					event.name = data.name;
					PageDAO.dispatchEvent('create-controller', event);
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

	static updateController(pageUUID, controllerUUID, name, description, code, callback) {
		// Defensive programming...check input...
		if(pageUUID === undefined || pageUUID === null) {
			pageUUID = '';
		}
		pageUUID = pageUUID.trim();
		if(pageUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select a page to update.";
				return callback(null, error);
			}
			return;
		}
		if(name === undefined || name === null) {
			name = '';
		}
		name = name.trim();
		Security.fetch('/page/' + pageUUID + '/controller/' + controllerUUID, { 
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
					event.ownerUUID = data.ownerUUID;
					event.uuid = data.uuid;
					event.name = data.name;
					PageDAO.dispatchEvent('update-controller', event);
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

	static update(pageUUID, applicationUUID, name, isTemplate, parentUUIDs, description, callback) {
		// Defensive programming...check input...
		if(applicationUUID === undefined || applicationUUID === null) {
			applicationUUID = '';
		}
		applicationUUID = applicationUUID.trim();
		if(applicationUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please provide the application this updated page belongs to.";
				return callback(null, error);
			}
			return;
		}
		if(pageUUID === undefined || pageUUID === null) {
			pageUUID = '';
		}
		pageUUID = pageUUID.trim();
		if(pageUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select a page to update.";
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
				error.message = "Please provide a name for this page.";
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
		if(description === undefined || description === null) {
			description = '';
		}
		description = description.trim();
	    Security.fetch('/page/' + pageUUID, { 
	    	method: "PUT",
	    	body: {"applicationUUID" : applicationUUID,
	    		   "name": name,
	        	   "isTemplate": isTemplate,
	               "parentUUIDs": parentUUIDs,
	               "description": description},
	    	headers: {"Content-Type": "application/json"}
	    })
		.then(function(response) {
			if(response.status === 404) {
				if(callback) {
					let error = {};
					error.code = 404;
					error.message = "Page not found.";
					return callback(null, error);
				}
			} else {
				response.json().then(function(data) {
					let event = {};
					event.applicationUUID = applicationUUID;
					event.uuid = data.uuid;
					PageDAO.dispatchEvent('update', event);
					if(callback) {
						callback(event);
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

	static deleteController(pageUUID, controllerUUID, callback) {
		if(pageUUID === undefined || pageUUID === null) {
			pageUUID = '';
		}
		pageUUID = pageUUID.trim();
		if(pageUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select a page.";
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
	    Security.fetch('/page/' + pageUUID + '/controller/' + controllerUUID, { 
	    	method: "DELETE",
	    	headers: {"Content-Type": "application/json"}
	    })
		.then(function(response) {
			if(response.status === 404) {
				if(callback) {
					let error = {};
					error.code = 404;
					error.message = "Page controller not found.";
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
			event.ownerUUID = pageUUID;
			event.uuid = controllerUUID;
			event.controllerName = name;
			PageDAO.dispatchEvent('delete-controller', event);
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

	static deleteStyle(pageUUID, styleUUID, callback) {
		if(pageUUID === undefined || pageUUID === null) {
			pageUUID = '';
		}
		pageUUID = pageUUID.trim();
		if(pageUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select a page.";
				return callback(null, error);
			}
			return;
		}
		if(styleUUID === undefined || styleUUID === null) {
			styleUUID = '';
		}
		styleUUID = styleUUID.trim();
		if(styleUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select the style to delete.";
				return callback(null, error);
			}
			return;
		}
	    Security.fetch('/page/' + pageUUID + '/style/' + styleUUID, { 
	    	method: "DELETE",
	    	headers: {"Content-Type": "application/json"}
	    })
		.then(function(response) {
			if(response.status === 404) {
				if(callback) {
					let error = {};
					error.code = 404;
					error.message = "Page style not found.";
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
			event.ownerUUID = pageUUID;
			event.uuid = styleUUID;
			PageDAO.dispatchEvent('delete-style', event);
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

	static deleteLayout(pageUUID, layoutUUID, callback) {
		if(pageUUID === undefined || pageUUID === null) {
			pageUUID = '';
		}
		pageUUID = pageUUID.trim();
		if(pageUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select a page.";
				return callback(null, error);
			}
			return;
		}
		if(layoutUUID === undefined || layoutUUID === null) {
			layoutUUID = '';
		}
		layoutUUID = layoutUUID.trim();
		if(layoutUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please provide the layout to delete.";
				return callback(null, error);
			}
			return;
		}
	    Security.fetch('/page/' + pageUUID + '/layout/' + layoutUUID, { 
	    	method: "DELETE",
	    	headers: {"Content-Type": "application/json"}
	    })
		.then(function(response) {
			if(response.status === 404) {
				if(callback) {
					let error = {};
					error.code = 404;
					error.message = "Page layout not found.";
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
			event.ownerUUID = pageUUID;
			event.uuid = layoutUUID;
			event.layoutName = name;
			PageDAO.dispatchEvent('delete-layout', event);
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

	static delete(pageUUID, callback) {
		if(pageUUID === undefined || pageUUID === null) {
			pageUUID = '';
		}
		pageUUID = pageUUID.trim();
		if(pageUUID.length <= 0) {
			if(callback) {
				let error = {};
				error.code = 400;
				error.message = "Please select a page to delete.";
				return callback(null, error);
			}
			return;
		}
	    Security.fetch('/page/' + pageUUID, { 
	    	method: "DELETE",
	    	headers: {"Content-Type": "application/json"}
	    })
		.then(function(response) {
			if(response.status === 404) {
				if(callback) {
					let error = {};
					error.code = 404;
					error.message = "Page not found.";
					return callback(null, error);
				}
				return;
			}
			response.json().then(function(data) {
				let event = {};
				event.uuid = pageUUID;
				PageDAO.dispatchEvent('delete', event);
				if(callback) {
					callback(event);
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
		let eventListeners = PageDAO.eventListenersByEventType[eventType];
		if(eventListeners === undefined || eventListeners === null) {
			eventListeners = [];
			PageDAO.eventListenersByEventType[eventType] = eventListeners;
		}
		eventListeners.push(eventListener);
	}

	static dispatchEvent(eventType, event) {
		if(eventType === undefined || eventType === null) {
			return;
		}
		let eventListeners = PageDAO.eventListenersByEventType[eventType];
		if(eventListeners === undefined || eventListeners === null) {
			return;
		}
		for(let i=0;i < eventListeners.length;i++) {
			eventListeners[i](event);
		}
	}
}

PageDAO.eventListenersByEventType = [];