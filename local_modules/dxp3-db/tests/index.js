const Database = require('../Database');
const sql = require('dxp3-lang-sql');
const BooleanColumn = require('../BooleanColumn');
const IntegerColumn = require('../IntegerColumn');
const StringColumn = require('../StringColumn');
const logging = require('dxp3-logging');
logging.setLevel(logging.Level.OFF);

let start = async function() {
	let database = new Database("TEST");
	try {
		let result = await database.createSequence('ids');
		console.log('Created \'ids\' sequence.');

		console.log('Describe \'ids\' sequence:');
		result = await database.desc('ids');
		console.log(result);

		result = await database.createTable('users');
		console.log('Created \'users\' table.');

		console.log('Describe \'users\' table:');
		result = await database.desc('users');
		console.log(result);

		let columns = [];
		columns.push(new StringColumn('brand',64));
		columns.push(new StringColumn('color',16));
		columns.push(new BooleanColumn('sedan'));
		columns.push(new IntegerColumn('topSpeed'));
		result = await database.createTable('cars', columns);
		console.log('Created \'cars\' table.');

		console.log('Describe \'cars\' table:');
		result = await database.desc('cars');
		console.log(result);

		await database.insert('cars', {brand: 'Mazda'});

		for(let i=0;i < 10000;i++) {
			let name = 'Henk_' + i;
			let car = {
				owner: name,
				brand: 'Mazda'
			}
			database.insert('cars', car);
		}
		for(let i=0;i < 5000;i++) {
			let name = 'John_' + i;
			let car = {
				owner: name,
				brand: 'Ford'
			}
			database.insert('cars', car);
		}
		database.insert('cars', {sedan:true,owner:'PeeWee',brand:'Mazda',model:'323F'})
		database.insert('cars', {sedan:true,owner:'Myself',brand:'Ford',model:'Focus'})
		let numberOfCars = await database.count('cars');
		console.log('Number of cars: ' + numberOfCars);
		numberOfCars = await database.count('cars','brand="Mazda"');
		console.log('Number of Mazda\'s: ' + numberOfCars);
		numberOfCars = await database.count('cars','brand="Ford"');
		console.log('Number of Ford\'s: ' + numberOfCars);
		numberOfCars = await database.count('cars','sedan=true');
		console.log('Number of sedans: ' + numberOfCars);
		let query = 'select * from cars where owner in ("Henk_123","Henk_456","Henk_9871")';
		console.log('Query: ' + query);
		result = await database.query(query);
		console.log('Selected car: ' + JSON.stringify(result));
		query = 'insert into users (firstName, lastName) values ("Blaat", "Prut");'
		console.log('Query: ' + query);
		result = await database.execute(query);
		console.log('inserted: ' + result.ids);

		result = await database.insert('users', {firstName:'Henk', lastName:'Smith', age: 10,weight:150});
		console.log('inserted 1: ' + result.ids);

		result = await database.insert('users', {firstName:'David', lastName:'Smith', age:16}, {firstName:'Sarah', lastName:'Bright', age: 32});
		console.log('inserted 2: ' + result.ids);

		result = await database.insert('users', [
				{firstName:'Henk', lastName:'Smart'},
				{firstName:'Jacqueline', lastName:'Goliath',age:10,weight:140},
				{firstName:'John', lastName:'Main',age:10, weight:150}
			]
		);
		console.log('inserted 3: ' + result.ids);

		result = await database.insert('users', [
				{firstName:'Wendy', lastName:'Schuurman'},
				{firstName:'Lindy', lastName:'van Dijk'}
			],
			{firstName:'David', lastName:'van Dijk', age:12},
			{firstName:'David', lastName:'Older', age:61},
			{firstName:'Danny', lastName:'LaTour'},
			{firstName:'Diana', lastName:'Valianth'}
		);
		console.log('inserted 6: ' + result.ids);

// logging.setLevel(logging.Level.TRACE);
		query = 'select id,firstName,weight,age from users where age<20 and weight>140 and firstName like "%enk"';
		console.log('Query: ' + query);
		result = await database.query(query);
		for(let i=0;i < result.length;i++) {
			console.log('' + i + ': ' + JSON.stringify(result[i]));
		}
// logging.setLevel(logging.Level.OFF);

		query = 'select firstName,age from users where (age<=16 and (firstName = "Henk" or firstName = "David")) or age>60';
		console.log('Query: ' + query);
		result = await database.query(query);
// 		result = await database.query('select firstName,age from users where (firstName = "Henk") or age = 10');
		for(let i=0;i < result.length;i++) {
			console.log('' + i + ': ' + JSON.stringify(result[i]));
		}

		result = await database.delete('cars', 'brand="Ford"');
		console.log('Deleted ' + result.nRemoved + ' Ford cars.');
		numberOfCars = await database.count('cars','brand="Ford"');
		console.log('number of Ford\'s: ' + numberOfCars);

		await database.execute('update cars set sedan=false where brand="Mazda"');

		for(let i=0;i < 10;i++) {
			result = await database.nextValue('ids');
			console.log('Next id is: ' + result);
		}

		result = await database.listSequences();
		console.log('Known sequences: ' + result);

		result = await database.listTables();
		console.log('Known tables: ' + result);

		result = await database.deleteSequence('ids');
		console.log('Deleted ids sequence result: ' + result);

		result = await database.deleteTable('users');
		console.log('Deleted users table result: ' + result);

		result = await database.listSequences();
		console.log('Known sequences: ' + result);

		result = await database.listTables();
		console.log('Known tables: ' + result);
	} catch(exception) {
		console.log('Exception: ' + exception.toString());
	}
}
start();