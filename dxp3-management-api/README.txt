***************************************************************
* DXP3 - Digital Experience Platform 3                        *
*                                                             *
* MODULE: dxp3-management-api                                 *
***************************************************************

This module runs the DXP3 Management API.

The API has caching capabilities delegated to a caching service (highly likely a redis implementation).
Additionally it integrates with a security layer (microservice) and it has logging capabilities.

EXAMPLE
node index.js -loglevel * info -port 5000 -cache off
node index.js -loglevel * trace -port 5001 -cache true

-cache           : Use this to turn caching on or off.
                   The default is on. 
-help            : This help message.
-loglevel        : Set the amount of details logged. Allowed values are:
                   all, trace, debug, info, warn, error, fatal, mark, off.
                   The default level is error.
-port            : Set the port to listen on. The default port is 80.
                   If the specified port is occupied the application will try to find a free port.
-protocol        : Set the protocol the server uses. This should be one of http or https.
                   The default protocol is http.

If no cache, loglevel, port or protocol are supplied as arguments,
the application will attempt to search for them in the following environment variables:

CACHE            : Use this to turn caching on or off.
                   The default is on. 
LOGLEVEL         : Set the amount of details logged. Allowed values are:
                   all, trace, debug, info, warn, error, fatal, mark, off.
                   The default level is error.
PORT             : Set the port to listen on. The default port is 80.
                   If the specified port is occupied the application will try to find a free port.
PROTOCOL         : Set the protocol the server uses. This should be one of http or https.
                   The default protocol is http.