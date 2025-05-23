// const http = require('dxp3-net-http');
const http = require('../index');
// followRedirects, timeout and useragent can be provided in the constructor.
let httpClient = new http.HTTPClient({followRedirects: true,timeout:10000});
// Alternatively each can be set using their respective set method.
httpClient.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.54 Safari/537.36');
let url = 'google.com';
console.log('Attempting to get \'' + url + '\'.');
httpClient.get(url, (_error, _response, _url) => {
    if(_error) {
        console.log('There was an error retrieving \'' + url + '\': ' + _error.toString());
        return;
    }
    let statusCode = _response.statusCode;
    let contentType = _response.headers['content-type'];
    if(contentType === undefined || contentType === null) {
        console.log(_url + ': ' + this.statusCode);
        return;
    }
    console.log(_url + ': ' + statusCode + ': ' + contentType);
});