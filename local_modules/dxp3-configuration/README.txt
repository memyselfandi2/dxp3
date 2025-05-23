****************************************
* DXP3 - Digital Experience Platform 3 *
*                                      *
* MODULE: dxp3-configuration           *
****************************************

This module provides methods to set and get common/global configuration properties.
It is to be used as a library as it does not contain any executable class.
Values can be grouped by category. This allows to easily set properties for different parts of your application.
Categories and keys are case sensitive and trimmed. This means for example 'MYKey' and 'mykey' are treated as 
different keys, but ' mykey  ' and 'mykey' are deemed equal.
Make sure this local module is defined as a dependency in your package.json.
Typically the dependency is defined by a file reference using a relative path. This may be different for different modules.
Here is an example of such a dependency in a package.json:
"dependencies": {
  "dxp3-configuration": "file:../../../local_modules/dxp3-configuration"
}

****************************************
* CODE EXAMPLES                        *
****************************************

// Get a reference to our configuration code.
const configuration = require('dxp3-configuration');
// It is suggested to use a separate object to define all possible
// configuration keys.
let categories = require('./ConfigurationCategories');
let keys = require('./ConfigurationKeys');
configuration.Manager.set(categories.MAIN_APP, keys.PROTOCOL, "some value");
configuration.Manager.set(keys.PORT, 1234);
// To retrieve a value use the get method and supply an optional category and
// a required key.
let protocol = configuration.Manager.get(categories.MAIN_APP, keys.PROTOCOL);
let port = configuration.Manager.get(keys.PORT);