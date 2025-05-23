***************************************************************
* DXP3 - Digital Experience Platform 3                        *
*                                                             *
* MODULE: dxp3-uuid                                           *
***************************************************************

This library contains all the necessary functionality to create UUID's.
It is typically used as a library, but it's index.js can be executed using
the command line in case you need an one-off UUID.
Make sure this local module is defined as a dependency in your package.json.
Typically the dependency is defined by a file reference using a relative path.
Obviously that relative path may be different for different modules.
Here is an example of such a dependency in a package.json:
"dependencies": {
  "dxp3-uuid": "file:../../../local_modules/dxp3-uuid"
}

***************************************************************
* CODE EXAMPLES                                               *
***************************************************************

// Get a reference to our uuid code.
const UUID = require('dxp3-uuid');
// Create a new identifier.
let id = UUID.v4();
console.log('New UUID: ' + id);
// For convenience the library contains
// alias methods for the v4 method.
id = UUID.create();
id = UUID.new();
id = UUID.newInstance();
id = UUID.next();
id = UUID.version4();

***************************************************************
* COMMAND LINE OPTIONS                                        *
***************************************************************

node index -help

-help   Show this content.

***************************************************************
* COMMAND LINE EXAMPLES                                       *
***************************************************************

Create a new UUID and print it to the console.
> node index

Show this help file.
> node index -help