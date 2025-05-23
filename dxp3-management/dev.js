const { exec } = require('child_process');

// start a gateway
exec('start cmd.exe /k node ../dxp3-management-gateway/index.js -loglevel * info -secure false');
// start a ui
exec('start cmd.exe /k node ../dxp3-management-ui/index.js -loglevel * info -secure false');
// start an api
exec('start cmd.exe /k node ../dxp3-management-api/index.js -loglevel * info -secure false');
// start a security service
exec('start cmd.exe /k node ../dxp3-management-security/index.js -loglevel * info -implementation filesystem -source C:\\temp\\dxp3\\');
// start a compiler service
exec('start cmd.exe /k node ../dxp3-management-compiler/index.js -loglevel * info -implementation mock');
// start all the mock dao services
exec('start cmd.exe /k node ../dxp3-management-dao/index.js -loglevel * info -implementation filesystem');
// start the email service
exec('start cmd.exe /k node ../dxp3-email/index.js -loglevel * info');