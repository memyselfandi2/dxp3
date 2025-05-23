const { spawn } = require('child_process');

const options = {
        detached: true
}

// start a gateway
let gateway = spawn('node', ['/usr/local/bin/dxp3/dxp3-delivery-gateway/index.js', '-loglevel', 'info'],options);
gateway.stdout.on('data',function(data) {
        console.log('stdout:' + data);
});
gateway.stderr.on('data',function(data) {
        console.log('stderr:' + data);
});
gateway.on('exit',function(code) {
        console.log('exit:' + code);
});
gateway.on('error',function(code) {
        console.log('error:' + code);
});
let ui = spawn('node', ['/usr/local/bin/dxp3/dxp3-delivery-ui/index.js', '-loglevel', 'info'],options);
ui.stdout.on('data',function(data) {
        console.log('stdout:' + data);
});
ui.stderr.on('data',function(data) {
        console.log('stderr:' + data);
});
ui.on('exit',function(code) {
        console.log('exit:' + code);
});
ui.on('error',function(code) {
        console.log('error:' + code);
});
let api = spawn('node', ['/usr/local/bin/dxp3/dxp3-delivery-api/index.js', '-loglevel', 'info'],options);
api.stdout.on('data',function(data) {
        console.log('stdout:' + data);
});
api.stderr.on('data',function(data) {
        console.log('stderr:' + data);
});
api.on('exit',function(code) {
        console.log('exit:' + code);
});
api.on('error',function(code) {
        console.log('error:' + code);
});
let dao = spawn('node', ['/usr/local/bin/dxp3/dxp3-delivery-dao/index.js', '-loglevel', 'info','-implementation','mock'],options);
dao.stdout.on('data',function(data) {
        console.log('stdout:' + data);
});
dao.stderr.on('data',function(data) {
        console.log('stderr:' + data);
});
dao.on('exit',function(code) {
        console.log('exit:' + code);
});
dao.on('error',function(code) {
        console.log('error:' + code);
});