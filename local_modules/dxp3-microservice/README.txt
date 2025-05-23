****************************************
* DXP3 - Digital Experience Platform 3 *
*                                      *
* MODULE: dxp3-microservice            *
****************************************
Microservices - also known as the microservice architecture - is an architectural style that
structures an application as a collection of services that are:
- highly maintainable and testable,
- loosely coupled,
- independently deployable,
- organized around business capabilities,
- owned by a small team.

The microservice architecture enables the rapid, frequent and reliable delivery of large,
complex applications. It also enables an organization to evolve its technology stack.

****************************************
* EXAMPLES                             *
****************************************

let microservice = require('dxp3-microservice');
let apiWebServer = new microservice.WebServer({name:"example.com API server",root:"/var/www/example.com/",produces: "API servers"});
apiWebServer.start();
let uiWebServer = new microservice.WebServer({name:"example.com UI server",root:"/var/www/example.com/",produces: "UI servers"});
uiWebServer.start();

let myGateway = new microservice.WebGateway({name:"API and UI gateway", port: 80, upstream:"UI servers,API servers"});
// Send API calls to the API servers.
// Everything else will by default go to the first defined upstream subject. In this case: UI servers.
myGateway.addRule('/api/*', 'API servers');
myGateway.on(microservice.MicroServiceEvent.RUNNING, function() {
   console.log('Gateway is running.');
}
myGateway.start();