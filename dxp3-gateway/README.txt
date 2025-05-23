****************************************
* DXP3 - Digital Experience Platform 3 *
*                                      *
* MODULE: dxp3-delivery-gateway        *
****************************************

This is the gateway of our delivery platform.
It forwards requests to the API and UI backends. It uses the URL path to decide which requests go where.
It reads arguments from the command line and/or from the environment.

****************************************
* COMMANDLINE OPTIONS                  *
****************************************

node index.js -help -loglevel <String> <String> -port <Number> -secure <Boolean> -certicatesFolder <String>

-help                                 - Show this README file.
                                        Aliases: faq, info, information.
-loglevel           <String> <String> - Set the log level for different parts of the application.
                                        The first parameter accepts wildcards. For example: *udp*.
                                        The second parameter is one of debug, info, warn, error, fatal, off.
                                        Aliases: log, logger, logging.
-port               <Number>          - The port the DXP3 delivery gateway will listen on.
                                        Aliases: applicationport, gatewayport, listenon, serverport, serviceport.
-secure             <Boolean>         - Indicates if we are secure (using HTTPS) or unsecure (using HTTP).
                                        If secure is true, we can also set the certificates folder.
-certificatesFolder <String>          - The location of our tls certificates. Only relevant when the secure parameter
                                        is set to true.

****************************************
* COMMANDLINE EXAMPLES                 *
****************************************

Standard execution with all default settings:
node index.js

To get help type the following from the command line:
node index.js -help

Alternatively to get help you can use the npm run command as the help option has been added to the package.json:
npm run help

To filter specific logging:
node index.js -log * off -log *UDPServer* info -log *Scout* debug -port 81

Run unsecure and in trace mode
node index.js -secure false -log * trace