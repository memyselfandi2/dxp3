****************************************
* DXP3 - Digital Experience Platform 3 *
*                                      *
* MODULE: dxp3-delivery-api            *
****************************************
This is the entry point to get the application programming interface up and running.
It reads arguments from the command line and/or from the environment.

****************************************
* COMMANDLINE OPTIONS                  *
****************************************

node index -cache <Boolean> -help -loglevel <String> -port <Number> -protocol <String>

-cache    <Boolean>         - Turn caching on or off.
                              Aliases: caching, usecache.
-help                       - Show this README file.
                              Aliases: faq, info, information.
-loglevel <String> <String> - Set the log level for different parts of the application.
                              The first parameter accepts wildcards. For example: *udp*.
                              The second parameter is one of debug, info, warn, error, fatal.
                              Aliases: log, logger, logging.
-port     <Number>          - The port the DXP3 Delivery API server will listen on.
                              Aliases: applicationport, listenon, serverport, serviceport.
-protocol <String>          - The protocol to use. One of http, https.

****************************************
* COMMANDLINE EXAMPLES                 *
****************************************

From the command line:
node index.js

To get help type the following from the command line:
node index.js -help

or you can use the npm command as the help option is defined in the package.json:
npm run help