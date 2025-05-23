****************************************
* DXP3 - Digital Experience Platform 3 *
*                                      *
* MODULE: dxp3-db                      *
****************************************

This module contains everything one needs to interact with and/or run a Database.
Make sure this local module is defined as a dependency in your package.json.
Typically the dependency is defined by a file reference using a relative path.
Obviously that relative path may be different for different modules.
Here is an example of such a dependency in a package.json:
"dependencies": {
    "dxp3-db": "file:../../../local_modules/dxp3-db"
}

There are essentially two types of databases:
1) In-memory
2) Filesystem

An in-memory database is not persisted to any storage. When the database program terminates the data
is lost. These types of databases are useful for session tracking, caching etc.
A filesystem database is backed by a data file persisted on local storage. When the database program
terminates the data is retained.

****************************************
* CODE EXAMPLES                        *
****************************************

const Database = require('./Database');
const sql = require('dxp3-lang-sql');
const BooleanColumn = require('./BooleanColumn');
const IntegerColumn = require('./IntegerColumn');
const StringColumn = require('./StringColumn');
// Lets create an in-memory database
let database = new Database("SESSION_STORE");
// Lets create session ids
let result = await database.createSequence('session_ids');
// Lets create a session table
let columns = [];
columns.push(new StringColumn('firstName',64));
columns.push(new StringColumn('middleName',16));
columns.push(new StringColumn('lastName',64));
columns.push(new BooleanColumn('isActive'));
columns.push(new IntegerColumn('numberOfHits'));
await database.createTable('sessions',columns);
// Lets insert a new session
await database.insert('sessions', {firstName: 'John',lastName: 'Smith', isActive: true, numberOfHits: 1});
// How to count the number of rows in a table:
let numberOfSessions = await database.count('sessions');
// How to get the next value of a sequence:
result = await database.nextValue('ids');
// How to list all sequences and tables:
result = await database.listSequences();
console.log('Known sequences: ' + result);
result = await database.listTables();
console.log('Known tables: ' + result);
// How to delete a sequence or a table:
result = await database.deleteSequence('ids');
result = await database.deleteTable('sessions');