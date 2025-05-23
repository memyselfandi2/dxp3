***************************************************************
* DXP3 - Digital Experience Platform 3                        *
*                                                             *
* MODULE: dxp3-util                                           *
***************************************************************

This library contains all kinds of utilities.
Most notably it has a Help class that can be used to read a README.txt file
and print its content to the console. As a matter of fact this content you
are reading is in such a README.txt file.
It also contains classes to read/parse and transform command line options.
Each of the util classes is accessible by requiring the index.js module.

It is to be used as a library as it does not contain any executable class.
Make sure this local module is defined as a dependency in your package.json.
Typically the dependency is defined by a file reference using a relative path.
Obviously that relative path may be different for different modules.
Here is an example of such a dependency in a package.json:
"dependencies": {
  "dxp3-util": "file:../../../local_modules/dxp3-util"
}

***************************************************************
* CODE EXAMPLES                                               *
***************************************************************

// Example 1: How to print out our help.
//
// Get a reference to our utilities.
const util = require('dxp3-util');
// Print out our README.txt
util.Help.print();

// Example 2: How to print out a specific class help file.
//
// Get a reference to our utilities.
const util = require('dxp3-util');
class MyClass {
}
// Print out the help file of the class.
// This will print the contents of the .txt file with the
// same class name in the same folder/directory/location.
util.Help.print(MyClass);

// Example 3: How to use CommandLineOptions
//
// Start by creating a CommandLineOptions instance.
let commandLineOptions = new util.CommandLineOptions();
// Next we create a flag option.
// Most options have a name, one or more aliases and the
// property name holding the value of the parsed command line input.
let commandLineOption = commandLineOptions.createFlag('help',
                          'faq,info,information',
                          'help');
commandLineOptions.add(commandLineOption);
// Here is how you add a number option.
commandLineOption = commandLineOptions.createNumber('timeout',
                          null,
                          'timeout');
commandLineOptions.add(commandLineOption);
// It also supports complex objects. Here we create a loglevel option
// with two properties.
commandLineOption = commandLineOptions.createObjectArray('loglevel',
                          'log,logger,logging',
                          'logLevel');
commandLineOption.addStringProperty('regexp');
commandLineOption.addEnumerationProperty('level', logging.Level);
commandLineOptions.add(commandLineOption);

// The parse method will return an object with help, timeout and
// loglevel properties if any of them are supplied on the command line.
let result = commandLineOptions.parse();

// Example 4: How to use Assert to check if the current file is the
//            one to execute.
//
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPSpiderState';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}

***************************************************************
* COMMAND LINE OPTIONS                                        *
***************************************************************

N/A

***************************************************************
* COMMAND LINE EXAMPLES                                       *
***************************************************************

N/A