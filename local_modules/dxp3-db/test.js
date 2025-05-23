const Database = require('./Database');
const DatabaseError = require('./DatabaseError');
const sql = require('dxp3-lang-sql');
const ColumnType = require('./ColumnType');
const BooleanColumn = require('./BooleanColumn');
const IntegerColumn = require('./IntegerColumn');
const StringColumn = require('./StringColumn');
const UUID = require('dxp3-uuid');

const logging = require('dxp3-logging');

const logger = logging.getLogger('test');

let start = async function() {
	// logging.setLogLevel(logging.Level.TRACE);
	logging.setLogLevel(logging.Level.WARN);

	// This will create an inmemory database.
	// let database = new Database("TEST");

	// This will create a filesystem database
	let database = new Database("Henkie", "C:\\temp\\");
	// // delete any sequences we want to create later.
	// try {
	// 	await database.deleteSequence('ids');
	// } catch(_exception) {
	// }
	// try {
	// 	// Returns a boolean
	// 	let result = await database.createSequence('ids');
	// 	console.log('Created \'ids\' sequence.');
	// } catch(_exception) {
	// }
	// try {
	// result = await database.desc('ids');
	// console.log('Describe \'ids\' sequence:');
	// console.log(result);
	// } catch(_exception) {
	// }
	// try {
	// 	await database.deleteTable('users');
	// } catch(_exception) {
	// }
	// try {
	// 	await database.createTable('users');
	// 	console.log('Created \'users\' table.');
	// } catch(_exception) {

	// }
	// try {
	// 	result = await database.desc('users');
	// 	console.log('Describe \'users\' table:');
	// 	console.log(result);
	// } catch(_exception) {
	// }

	// try {
	// 	await database.deleteTable('cars');
	// } catch(_exception) {
	// }
	// try {
	// 	let columns = [];
	// 	columns.push({name: 'brand',dataType:'String',length:64});
	// 	columns.push({name: 'color',dataType:'String', length:16});
	// 	columns.push({name: 'sedan', dataType:'Boolean'});
	// 	columns.push({name: 'topSpeed', dataType:'Integer'});
	// 	await database.createTable('cars', columns);
	// } catch(_exception) {

	// }
	// try{
	// 	result = await database.desc('cars');
	// 	console.log('Describe \'cars\' table:');
	// 	console.log(result);
	// } catch(_exception) {
	// }

	try {
		// console.log("Creating index.")
		// await database.createIndex('cars', 'brand');
		// console.log("Finished index.")
		// await database.insert('cars', {brand: 'Mazda',year: 2024});

		for(let i=0;i < 4000;i++) {
			let name = 'John_' + i;
			let car = {
				owner: name,
				make: 'VW',
				year: 1959,
				model: 'Beetle',
				isSedan:false
			}
			await database.insert('cars', car);
			if(i%1000 === 0) {
				console.log('created: ' + i);
			}
		}
// 		for(let i=0;i < 5000;i++) {
// 			let name = 'John_' + i;
// 			let car = {
// 				owner: name,
// 				brand: 'Ford'
// 			}
// 			await database.insert('cars', car);
// 			// if(i%1000 === 0) {
// 			// 	console.log('created: ' + i);
// 			// }
// 		}
// 		await database.insert('cars', {sedan:true,owner:'PeeWee',brand:'Mazda',model:'323F', year:2012})
// 		await database.insert('cars', {sedan:true,owner:'Myself',brand:'Ford',model:'Focus', year:2002})

// 	// logging.setLogLevel(logging.Level.TRACE);
// 	// 	await database.createIndex('brand_index', 'cars', 'brand');
// 	// 	await database.createIndex('year_index', 'cars', 'year');
// // 		await database.createIndex('sedan_index', 'cars', 'sedan');

// // 		// // the owner column is not part of the structured schema of the cars table
// // 		// // If we want to create an index we need to at least mention the data type.
// // 		// await database.createIndex('cars', 'owner', ColumnType.STRING);

// // 		let numberOfCars = await database.count('cars');
// // 		console.log('number of cars: ' + numberOfCars);
// // 		numberOfCars = await database.count('cars','brand="Mazda"');
// // 		console.log('number of Mazda\'s: ' + numberOfCars);
// // 		numberOfCars = await database.count('cars','brand="Ford"');
// // 		console.log('number of Ford\'s: ' + numberOfCars);
// // 		numberOfCars = await database.count('cars','sedan=true');
// // 		console.log('number of sedans: ' + numberOfCars);
// // 		result = await database.query('select * from cars where owner in ("Henk_12","Henk_45","Henk_98")');
// // 		console.log('Selected car: ' + JSON.stringify(result));
// // 		result = await database.execute('insert into users (firstName, lastName) values ("Blaat", "Prut");');
// // 		console.log('inserted: ' + result.ids);

// // 		result = await database.insert('users', {firstName:'Henk', lastName:'Smith', age: 10,weight:150});
// // 		console.log('inserted: ' + result.ids);

// // 		result = await database.insert('users', {firstName:'David', lastName:'Smith', age:16}, {firstName:'Sarah', lastName:'Bright', age: 32});
// // 		console.log('inserted: ' + result.ids);

// // 		result = await database.insert('users', [
// // 				{firstName:'Henk', lastName:'Smart'},
// // 				{firstName:'Jacqueline', lastName:'Goliath',age:10,weight:140},
// // 				{firstName:'John', lastName:'Main',age:10, weight:150}
// // 			]
// // 		);
// // 		console.log('inserted: ' + result.ids);

// // 		result = await database.insert('users', [
// // 				{firstName:'Wendy', lastName:'Schuurman'},
// // 				{firstName:'Lindy', lastName:'van Dijk'}
// // 			],
// // 			{firstName:'David', lastName:'van Dijk', age:12},
// // 			{firstName:'David', lastName:'Older', age:61},
// // 			{firstName:'Danny', lastName:'LaTour'},
// // 			{firstName:'Diana', lastName:'Valianth'}
// // 		);
// // 		console.log('inserted: ' + result.ids);

// // 		// result = await database.select('id,firstName,weight,age', 'users', 'age<20 and weight>140 and firstName like "%enk"');
// // 		result = await database.select('id,firstName as [voor naam],weight,age as leeftijd', 'users', 'age<20 and weight>140');
// // 		for(let i=0;i < result.length;i++) {
// // 			console.log('' + i + ': ' + JSON.stringify(result[i]));
// // 		}

// // 		result = await database.query('select firstName as first,age from users where (age<=16 and (firstName = "Henk" or firstName = "David")) or age>60');
// // // 		result = await database.query('select firstName,age from users where (firstName = "Henk") or age = 10');
// // 		for(let i=0;i < result.length;i++) {
// // 			console.log('' + i + ': ' + JSON.stringify(result[i]));
// // 		}

// // 		result = await database.delete('cars', 'brand="Ford"');
// // 		console.log('Deleted ' + result.nRemoved + ' Ford cars.');
// // 		numberOfCars = await database.count('cars','brand="Ford"');
// // 		console.log('number of Ford\'s: ' + numberOfCars);

// // 		await database.execute('update cars set sedan=false where brand="Mazda"');

// // 		for(let i=0;i < 10;i++) {
// // 			result = await database.nextValue('ids');
// // 			console.log('Next id is: ' + result);
// // 		}

// // 		result = await database.listSequences();
// // 		console.log('Known sequences: ' + result);

// // 		result = await database.listTables();
// // 		console.log('Known tables: ' + result);

// // 		result = await database.deleteSequence('ids');
// // 		console.log('Deleted ids sequence result: ' + result);

// // 		result = await database.deleteTable('users');
// // 		console.log('Deleted users table result: ' + result);

// // 		result = await database.listSequences();
// // 		console.log('Known sequences: ' + result);

// // 		result = await database.listTables();
// // 		console.log('Known tables: ' + result);

// 		result = await database.insert('cars', {brand:'BMW',model:'i3'});
// 		console.log('inserted: ' + JSON.stringify(result));


// // 		await database.deleteIndex('brand_index', 'cars');
// // 		await database.deleteIndex('sedan_index', 'cars');

// 		// lets create some indices
// 		let startTime = new Date();

// 		// Code to measure
// 		// logging.setLogLevel(logging.Level.TRACE);
// 		// result = await database.query('select * from cars where brand = "BMW"');
// 		// console.log(result);

// 		// let endTime = new Date();

// 		// let elapsedMilliseconds = endTime - startTime;
// 		// let elapsedSeconds = elapsedMilliseconds / 1000;

// 		// console.log(`Elapsed Time: ${elapsedMilliseconds} ms`);
// 		// console.log(`Elapsed Time: ${elapsedSeconds} s`);

// 		// console.log("Creating index.")
// 		// await database.createIndex('cars', 'brand');
// 		// console.log("Finished index.")

// 		startTime = new Date();

// 		// Code to measure
// 		result = await database.query('select * from cars where brand = "BMW"');
// 		// result = await database.query('select * from cars where year < 2020');
// 		console.log(result);

// 		endTime = new Date();

// 		elapsedMilliseconds = endTime - startTime;
// 		elapsedSeconds = elapsedMilliseconds / 1000;

// 		console.log(`Elapsed Time: ${elapsedMilliseconds} ms`);
// 		console.log(`Elapsed Time: ${elapsedSeconds} s`);

// 		await database.setName("TEST2");
// 		console.log('database new name: ' + database.getName());
	} catch(exception) {
		console.log('Exception: ' + exception.toString());
	}
}
start();