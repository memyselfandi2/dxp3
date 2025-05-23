const UUID = require('dxp3-uuid');

class EntityFactory {

	static create(accountUUID, loggedInUserUUID, applicationUUID, name, description, parentUUIDs) {
        let result = {};
        let entityUUID = UUID.v4();
        result['uuid'] = entityUUID;
		if(name === undefined || name === null) {
			name = '';
		}
        let entityID = name.replace(/\s+/g, '-').toLowerCase();
        result['id'] = entityID;
        result['name'] = name;
		if(accountUUID === undefined || accountUUID === null) {
			accountUUID = '';
		}
		accountUUID = accountUUID.trim();
		if(accountUUID.length > 0) {
	        result['accountUUID'] = accountUUID;
		}
		if(loggedInUserUUID === undefined || loggedInUserUUID === null) {
			loggedInUserUUID = '';
		}
        result['createdBy'] = loggedInUserUUID;
		if(applicationUUID === undefined || applicationUUID === null) {
			applicationUUID = '';
		}
		applicationUUID = applicationUUID.trim();
		if(applicationUUID.length > 0) {
	        result['applicationUUID'] = applicationUUID;
	    }
		if(description === undefined || description === null) {
			description = '';
		}
        result['description'] = description;
		if(parentUUIDs === undefined || parentUUIDs === null) {
			parentUUIDs = [];
		}
		if(typeof parentUUIDs === 'string') {
			parentUUIDs = parentUUIDs.trim();
			parentUUIDs = parentUUIDs.split(',');
		}
		if(Array.isArray(parentUUIDs)) {
			let tmpParentUUIDs = [];
			for(let i=0;i < parentUUIDs.length;i++) {
				let parentUUID = parentUUIDs[i];
				if(parentUUID === undefined || parentUUID === null) {
					continue;
				}
				parentUUID = parentUUID.trim();
				if(parentUUID.length <= 0) {
					continue;
				}
				if(parentUUID.toLowerCase() === 'null') {
					continue;
				}
				if(parentUUID.toLowerCase() === 'undefined') {
					continue;
				}
				tmpParentUUIDs.push(parentUUID);
			}
			parentUUIDs = tmpParentUUIDs;
		}
		if(parentUUIDs.length > 0) {
	        result['parentUUIDs'] = parentUUIDs;
	    }
        let currentTime = Date.now();
        result['creationDate'] = currentTime;
        let version = {};
        version['versionCreationDate'] = currentTime;
        version['version'] = 1;
        let versionList = [];
        versionList.push(version);
        result['versions'] = versionList;
        result['currentVersion'] = 1;
        return result;
	}

	static update(accountUUID, loggedInUserUUID, entity, applicationUUID, name, description, parentUUIDs) {
		// Defensive programming...check and sanitize input...
		if(accountUUID === undefined || accountUUID === null) {
			accountUUID = '';
		}
		if(loggedInUserUUID === undefined || loggedInUserUUID === null) {
			loggedInUserUUID = '';
		}
		if(entity === undefined || entity === null) {
			entity = {};
		}
		if(applicationUUID === undefined || applicationUUID === null) {
			applicationUUID = '';
		}
		if(parentUUIDs != undefined && parentUUIDs != null) {
			if(typeof parentUUIDs === 'string') {
				parentUUIDs = parentUUIDs.trim();
				parentUUIDs = parentUUIDs.split(',');
			}
			if(Array.isArray(parentUUIDs)) {
				let tmpParentUUIDs = [];
				for(let i=0;i < parentUUIDs.length;i++) {
					let parentUUID = parentUUIDs[i];
					if(parentUUID === undefined || parentUUID === null) {
						continue;
					}
					parentUUID = parentUUID.trim();
					if(parentUUID.length <= 0) {
						continue;
					}
					if(parentUUID.toLowerCase() === 'null') {
						continue;
					}
					if(parentUUID.toLowerCase() === 'undefined') {
						continue;
					}
					tmpParentUUIDs.push(parentUUID);
				}
				parentUUIDs = tmpParentUUIDs;
			}
            entity['parentUUIDs'] = parentUUIDs;
		}
		if(name != undefined && name != null) {
			name = name.trim();
			if(name.length > 0) {
		        let entityID = name.replace(/\s+/g, '-').toLowerCase();
		        entity['id'] = entityID;
	    	    entity['name'] = name;
		    }
    	}
    	if(description != undefined && description != null) {
	        entity['description'] = description;
	    }
        let currentTime = Date.now();
        entity['lastUpdateDate'] = currentTime;
        let currentVersion = entity['currentVersion'];
        var newVersion = parseInt(currentVersion) + 1;
        let version = {};
        version['versionCreationDate'] = currentTime;
        version['version'] = newVersion;
        let versionList = entity['versions'];
        if(versionList === undefined || versionList === null) {
            versionList = [];
        }
        versionList.push(version);
        entity['versions'] = versionList;
        entity['currentVersion'] = newVersion;
        return entity;
	}

	static orderedList(entities, startIndex, maximumNumberOfResults, categorizedAs, filterBy, callback) {
        if(filterBy === undefined || filterBy === null) {
            filterBy = {};
        }
        let result = {};
        let resultArray = [];
        if(entities != undefined && entities != null) {
            for(let i=0;i < entities.length;i++) {
            	let entity = entities[i];
                let toBeIncluded = true;
                for(let filterName in filterBy) {
                    let mustHaveValue = filterBy[filterName];
                    let contentValue = entity[filterName];
                    if(contentValue === undefined) {
                        toBeIncluded = false;
                        break;
                    } else if(contentValue === null) {
                        toBeIncluded = false;
                        break;
                    }
                    if(typeof(contentValue) === 'boolean') {
                        contentValue = contentValue.toString();
                    }
                    if(contentValue.toLowerCase().indexOf(mustHaveValue.toLowerCase()) < 0) {
                        toBeIncluded = false;
                        break;
                    }
                }
                if(toBeIncluded) {
                    resultArray.push(entity);
                }
            }
        }
        result.totalNumberOfResults = resultArray.length;
        if(startIndex > 0) {
            resultArray.splice(0, startIndex);
        }
        if(maximumNumberOfResults >= 0) {
            if(maximumNumberOfResults < resultArray.length) {
                resultArray.splice(maximumNumberOfResults, resultArray.length - maximumNumberOfResults);
            }
        }
        result.numberOfResults = resultArray.length;
        result.list = resultArray;
        callback(null, result);
	}

    static list(entities, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback) {
        if(filterBy === undefined || filterBy === null) {
            filterBy = {};
        }
        if(sortBy === undefined || sortBy === null) {
            sortBy = {};
        }
        let result = {};
        let resultArray = [];
        if(entities != undefined && entities != null) {
            for(let [key, entity] of entities) {
                let toBeIncluded = true;
                for(let filterName in filterBy) {
                    let mustHaveValue = filterBy[filterName];
                    let contentValue = entity[filterName];
                    if(contentValue === undefined) {
                        toBeIncluded = false;
                        break;
                    } else if(contentValue === null) {
                        toBeIncluded = false;
                        break;
                    }
                    if(typeof(contentValue) === 'boolean') {
                        contentValue = contentValue.toString();
                    }
                    if(contentValue.toLowerCase().indexOf(mustHaveValue.toLowerCase()) < 0) {
                        toBeIncluded = false;
                        break;
                    }
                }
                if(toBeIncluded) {
                    resultArray.push(entity);
                }
            }
        }
        resultArray.sort(function(a, b) {
            for(var sortByProperty in sortBy) {
                var propertyA = a[sortByProperty];
                var propertyB = b[sortByProperty];
                if(typeof(propertyA) === 'string') {
                    propertyA = propertyA.toLowerCase();
                    propertyB = propertyB.toLowerCase();
                }
                var order = sortBy[sortByProperty];
                if(order === 'ascending') {
                    if(propertyA < propertyB) {
                        return -1;
                    }
                    if(propertyA > propertyB) {
                        return 1;
                    }
                } else {
                    if(propertyA < propertyB) {
                        return 1;
                    }
                    if(propertyA > propertyB) {
                        return -1;
                    }
                }
            }
            return 0;
        });
        result.totalNumberOfResults = resultArray.length;
        if(startIndex > 0) {
            resultArray.splice(0, startIndex);
        }
        if(maximumNumberOfResults >= 0) {
            if(maximumNumberOfResults < resultArray.length) {
                resultArray.splice(maximumNumberOfResults, resultArray.length - maximumNumberOfResults);
            }
        }
        result.numberOfResults = resultArray.length;
        result.list = resultArray;
        callback(null, result);
    }
}

module.exports = EntityFactory;