$.ajaxSetup({
    cache: false,
    async: true
});

var securityManager = {}

jQuery(document).ready(function() {
	securityManager.init();
});

securityManager.token = null;

securityManager.init = function() {
	securityManager.token = $('#token').val();
}

securityManager.ajax = function(params) {
    // We need to add our security token to any requests
    if(params.type === 'GET' || params.type === 'DELETE') {
        if(params.url.indexOf('?') >= 0) {
            params.url += '&token='+securityManager.token;
        } else {
            params.url += '?token='+securityManager.token;
        }
    } else {
        if(params.data === undefined || params.data === null) {
            params.data = {};
        }
        params.data['token'] = securityManager.token;
    }
	return $.ajax(params);
}

securityManager.fileUpload = function(params) {
    // We need to add our security token to any requests
    if(params.url.indexOf('?') >= 0) {
        params.url += '&token='+securityManager.token;
    } else {
        params.url += '?token='+securityManager.token;
    }
    return $.ajax(params);
}

securityManager.load = function(elementId, url, success) {
    if(url.indexOf('?') >= 0) {
        url += '&token='+securityManager.token;
    } else {
        url += '?token='+securityManager.token;
    }
    $('#' + elementId).load(url, function() {
        success();
    });
}

securityManager.setSrc = function(elementId, url) {
    if(url.indexOf('?') >= 0) {
        url += '&token='+securityManager.token;
    } else {
        url += '?token='+securityManager.token;
    }
    $('#' + elementId).attr('src', url);
}

securityManager.getSrc = function(url) {
    if(url.indexOf('?') >= 0) {
        url += '&token='+securityManager.token;
    } else {
        url += '?token='+securityManager.token;
    }
    return url;
}

securityManager.setHref = function(elementId, url) {
    if(url.indexOf('?') >= 0) {
        url += '&token='+securityManager.token;
    } else {
        url += '?token='+securityManager.token;
    }
    $('#' + elementId).attr('href', url);
}