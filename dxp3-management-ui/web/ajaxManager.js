$.ajaxSetup({
    cache: false,
    async: true
});

var ajaxManager = {}

jQuery(document).ready(function() {
	ajaxManager.init();
});

/*
 * AJAX MANAGER
 * Allow requests to be queued
 */
ajaxManager.requests = [];
ajaxManager.lastRequestQueued = new Date();
ajaxManager.lastRequestSend = new Date();
ajaxManager.currentRequest = null;
ajaxManager.currentRequestParams = null;

// On initialization we start processing the queue
// This starts a 'check for requests, sleep' cycle.
ajaxManager.init = function() {
    ajaxManager.run();
}

// Queue an ajax request for processing
ajaxManager.queue = function(params) {
    ajaxManager.lastRequestQueued = new Date();
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
    ajaxManager.requests.push(params);
}

// Remove an ajax request from the queue
ajaxManager.dequeue = function(params) {
    if ($.inArray(params, ajaxManager.requests) > -1) {
        ajaxManager.requests.splice($.inArray(params, ajaxManager.requests), 1);
        // Maybe this request is in flight...if so we need to abort
        if(ajaxManager.currentRequestParams == params) {
            ajaxManager.currentRequest.abort();
            ajaxManager.currentRequestParams = null;
            ajaxManager.currentRequest = null;
            console.info('aborting request');
        }
    }
}

ajaxManager.run = function() {
    var self = this, oriSuc;
    // If there are requests
    if (ajaxManager.requests.length) {
        oriSuc = ajaxManager.requests[0].complete;
        ajaxManager.requests[0].complete = function() {
            // current request is complete, so reset...
            ajaxManager.currentRequestParams = null;
            ajaxManager.currentRequest = null;
            if (typeof oriSuc === 'function') {
                oriSuc();
            }
            ajaxManager.requests.shift();
            self.run.apply(self, []);
        };
        ajaxManager.lastRequestSend = new Date();
        ajaxManager.currentRequestParams = ajaxManager.requests[0];
        ajaxManager.currentRequest = $.ajax(ajaxManager.requests[0]);
    } else {
        // There were no requests to send.
        // Lets go to sleep for a brief period
        self.tid = setTimeout(function() {
            self.run.apply(self, []);
        }, 300);
    }
}