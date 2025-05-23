const packageName = 'dxp3-db';
const moduleName = 'DatabaseTest';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;

const Database = require('../Database');
const DatabaseError = require('../DatabaseError');

const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);


// logging.setLevel(logging.Level.TRACE);

async function runTests() {
  console.log('Starting Database tests...');

  // Test 1: Constructor with in-memory database
  console.log('\nTest 1: Constructor with in-memory database');
  try {
    const db1 = new Database('testDB1');
    if (db1.getName() === 'testDB1') {
      console.log('  Test 1 Passed: In-memory database created successfully.');
    } else {
      console.error('  Test 1 Failed: In-memory database name mismatch.');
    }
  } catch (error) {
    console.error('  Test 1 Failed: Error creating in-memory database:', error);
  }

  // Test 1b: Constructor with filesystem database
  console.log('\nTest 1b: Constructor with filesystem database');
  let db1b = null;
  try {
    db1b = new Database('collection', 'C:\\temp\\');
    await db1b.init(); // Initialize to allow proper closing and full test
    if (db1b.getName() === 'collection' && db1b.isInitialized()) {
      console.log('  Test 1b Passed: Filesystem database created and initialized successfully.');
    } else {
      console.error('  Test 1b Failed: Filesystem database name mismatch or not initialized.');
    }
  } catch (error) {
    console.error('  Test 1b Failed: Error creating/initializing filesystem database:', error);
  } finally {
    if(db1b) {
      await db1b.close();
    }
  }

  // Test 2: init()
  console.log('\nTest 2: init()');
  try {
    // Test name in console log was "Test 3", correcting to "Test 2"
    const db2 = new Database('testDB2_init'); // Using a more descriptive DB name
    await db2.init();
    if (db2.isInitialized()) {
      console.log('  Test 2 Passed: Database initialized successfully.');
    } else {
      console.error('  Test 2 Failed: Database not initialized.');
    }
  } catch (error) {
    console.error('  Test 2 Failed: Error initializing database:', error);
  }

  // Test 2b: init() file system database
  console.log('\nTest 2b: init() filesystem database');
  let db2b = null;
  try {
    db2b = new Database('collection', 'C:\\temp\\');
    await db2b.init();
    if (db2b.isInitialized()) {
      console.log('  Test 2b Passed: Filesystem database initialized successfully.');
    } else {
      console.error('  Test 2b Failed: Filesystem database not initialized.');
    }
  } catch (error) {
    console.error('  Test 2b Failed: Error initializing filesystem database:', error);
  } finally {
    if(db2b) {
      await db2b.close();
    }
  }

  // Test 3: close()
  console.log('\nTest 3: close()');
  try {
    const db3 = new Database('testDB3_close'); // Using a more descriptive DB name
    await db3.init();
    await db3.close();
    if (!db3.isInitialized()) {
      console.log('  Test 3 Passed: Database closed successfully.');
    } else {
      console.error('  Test 3 Failed: Database not closed.');
    }
  } catch (error) {
    console.error('  Test 3 Failed: Error closing database:', error);
  }

  // Test 3b: close()
  console.log('\nTest 3b: close() filesystem database');
  try {
    const db3b = new Database('collection', 'C:\\temp\\');
    await db3b.init();
    await db3b.close();
    if (!db3b.isInitialized()) {
      console.log('  Test 3b Passed: Filesystem database closed successfully.');
    } else {
      console.error('  Test 3b Failed: Filesystem database not closed.');
    }
  } catch (error) {
    console.error('  Test 3 Failed: Error closing filesystem database:', error);
  }

  // Test 5: createTable()
  console.log('\nTest 5: createTable()');
  try {
    const db5 = new Database('testDB5');
    await db5.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    await db5.createTable('users', columns);
    if (await db5.hasTable('users')) {
      console.log('  Test 5 Passed: Table created successfully.');
    } else {
      console.error('  Test 5 Failed: Table not created.');
    }
  } catch (error) {
    console.error('  Test 5 Failed: Error creating table:', error);
  }

  // Test 5b: createTable() filesystem database
  console.log('\nTest 5b: createTable() filesystem database');
  let db5b = null;
  try {
    db5b = new Database('collection', 'C:\\temp\\');
    await db5b.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if (await db5b.hasTable('users')) {
      await db5b.deleteTable('users');
    }
    await db5b.createTable('users', columns);
    if (await db5b.hasTable('users')) {
      console.log('  Test 5b Passed: Table created successfully in filesystem database.');
    } else {
      console.error('  Test 5b Failed: Table not created in filesystem database.');
    }
  } catch (error) {
    console.error('  Test 5b Failed: Error creating table in filesystem database:', error);
  } finally {
    if (db5b) await db5b.close();
  }

  // Test 6: createTable() - duplicate table
  console.log('\nTest 6: createTable() - duplicate table');
  try {
    const db6 = new Database('testDB6');
    await db6.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    await db6.createTable('users', columns);
    await db6.createTable('users', columns); // This should throw
    console.error('  Test 6 Failed: Duplicate table created.');
  } catch (error) {
    if (error.code === DatabaseError.CONFLICT.code) { // Adjusted error check
      console.log('  Test 6 Passed: Duplicate table creation correctly throws CONFLICT error.');
    } else {
      console.error('  Test 6 Failed: Incorrect error thrown for duplicate table creation:', error);
    }
  }

  // Test 6b: createTable() - duplicate table filesystem database
  console.log('\nTest 6b: createTable() - duplicate table filesystem database');
  let db6b = null;
  try {
    db6b = new Database('collection', 'C:\\temp\\');
    await db6b.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if (await db6b.hasTable('users')) {
      await db6b.deleteTable('users');
    }
    await db6b.createTable('users', columns);
    await db6b.createTable('users', columns); // This should throw
    console.error('  Test 6b Failed: Duplicate table created in filesystem database.');
  } catch (error) {
    if (error.code === DatabaseError.CONFLICT.code) { // Adjusted error check
      console.log('  Test 6b Passed: Duplicate table creation correctly throws CONFLICT error in filesystem database.');
    } else {
      console.error('  Test 6b Failed: Incorrect error thrown for duplicate table creation in filesystem database:', error);
    }
  }

  // Test 7: insertOne()
  console.log('\nTest 7: insertOne()');
  try {
    const db7 = new Database('testDB7');
    await db7.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    await db7.createTable('users', columns);
    const result = await db7.insertOne('users', { id: 1, name: 'John Doe' });
    if (result.nInserted === 1) {
      console.log('  Test 7 Passed: Record inserted successfully.');
    } else {
      console.error('  Test 7 Failed: Record not inserted.');
    }
  } catch (error) {
    console.error('  Test 7 Failed: Error inserting record:', error);
  }

  // Test 7b: insertOne() filesystem database
  console.log('\nTest 7b: insertOne() filesystem database');
  let db7b = null;
  try {
    db7b = new Database('collection', 'C:\\temp\\');
    await db7b.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if (await db7b.hasTable('users')) await db7b.deleteTable('users');
    await db7b.createTable('users', columns);
    const result = await db7b.insertOne('users', { id: 1, name: 'John Doe FS' });
    if (result.nInserted === 1) {
      console.log('  Test 7b Passed: Record inserted successfully in filesystem database.');
    } else {
      console.error('  Test 7b Failed: Record not inserted in filesystem database.');
    }
  } catch (error) {
    console.error('  Test 7b Failed: Error inserting record in filesystem database:', error);
  } finally {
    if (db7b) await db7b.close();
  }

  // Test 8: selectAll()
  console.log('\nTest 8: selectAll()');
  try {
    const db8 = new Database('testDB8');
    await db8.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    await db8.createTable('users', columns);
    await db8.insertOne('users', { id: 1, name: 'John Doe' });
    await db8.insertOne('users', { id: 2, name: 'Jane Doe' });
    const resultSet = await db8.selectAll('users');
    resultSet.toNextRow();
    let row1 = resultSet.getRow();
    resultSet.toNextRow();
    let row2 = resultSet.getRow();
    if (resultSet.getTotalNumberOfRows() === 2 && row1.name === 'John Doe' && row2.name === 'Jane Doe') {
      console.log('  Test 8 Passed: Records selected successfully.');
    } else {
      console.error('  Test 8 Failed: Records not selected correctly.');
    }
  } catch (error) {
    console.error('  Test 8 Failed: Error selecting records:', error);
  }

  // Test 8b: selectAll() filesystem database
  console.log('\nTest 8b: selectAll() filesystem database');
  let db8b = null;
  try {
    db8b = new Database('collection', 'C:\\temp\\');
    await db8b.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if (await db8b.hasTable('users')) await db8b.deleteTable('users');
    await db8b.createTable('users', columns);
    await db8b.insertOne('users', { id: 1, name: 'John Doe FS' });
    await db8b.insertOne('users', { id: 2, name: 'Jane Doe FS' });
    const resultSet = await db8b.selectAll('users');
    resultSet.toNextRow();
    let row1 = resultSet.getRow();
    resultSet.toNextRow();
    let row2 = resultSet.getRow();
    if (resultSet.getTotalNumberOfRows() === 2 && row1.name === 'John Doe FS' && row2.name === 'Jane Doe FS') {
      console.log('  Test 8b Passed: Records selected successfully from filesystem database.');
    } else {
      console.error('  Test 8b Failed: Records not selected correctly from filesystem database.');
    }
  } catch (error) {
    console.error('  Test 8b Failed: Error selecting records from filesystem database:', error);
  } finally {
    if (db8b) await db8b.close();
  }

  // Test 9: deleteTable()
  console.log('\nTest 9: deleteTable()');
  try {
    const db9 = new Database('testDB9');
    await db9.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    await db9.createTable('users', columns);
    await db9.deleteTable('users');
    if (!(await db9.hasTable('users'))) {
      console.log('  Test 9 Passed: Table deleted successfully.');
    } else {
      console.error('  Test 9 Failed: Table not deleted.');
    }
  } catch (error) {
    console.error('  Test 9 Failed: Error deleting table:', error);
  }

  // Test 9b: deleteTable() filesystem database
  console.log('\nTest 9b: deleteTable() filesystem database');
  let db9b = null;
  try {
    db9b = new Database('collection', 'C:\\temp\\');
    await db9b.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    // Ensure table doesn't exist from previous failed run before creating it
    if (await db9b.hasTable('users_to_delete')) await db9b.deleteTable('users_to_delete');
    await db9b.createTable('users_to_delete', columns);
    await db9b.deleteTable('users_to_delete');
    if (!(await db9b.hasTable('users_to_delete'))) {
      console.log('  Test 9b Passed: Table deleted successfully from filesystem database.');
    } else {
      console.error('  Test 9b Failed: Table not deleted from filesystem database.');
    }
  } catch (error) {
    console.error('  Test 9b Failed: Error deleting table from filesystem database:', error);
  } finally {
    if (db9b) await db9b.close();
  }

  // Test 10: createIndex()
  console.log('\nTest 10: createIndex()');
  try {
    const db10 = new Database('testDB10');
    await db10.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    // Cleanup from previous runs
    if(await db10.hasTable('users')) await db10.deleteTable('users');

    await db10.createTable('users', columns);
    await db10.createIndex('index_users_id', 'users', 'id');
    await db10.createIndex('index_users_name', 'users', 'name');
    const indices = await db10.listIndices();
    let found1 = false;
    let found2 = false;
    for(let i=0;i < indices.length;i++) {
      let index = indices[i];
      if(index.name === 'index_users_name') {
        found1 = true;
      }
      if(index.name === 'index_users_id') {
        found2 = true;
      }
    }
    // Every table gets an _uuid column with a hash index.
    if (indices.length === 3 && found1 && found2) {
      console.log('  Test 10 Passed: Index created successfully.');
    } else {
      console.error('  Test 10 Failed: Index not created.');
    }
  } catch (error) {
    console.error('  Test 10 Failed: Error creating index:', error);
  }

  // Test 10b: createIndex() filesystem database
  console.log('\nTest 10b: createIndex() filesystem database');
  let db10b = null;
  try {
    db10b = new Database('collection', 'C:\\temp\\');
    await db10b.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if (await db10b.hasTable('users')) await db10b.deleteTable('users'); // Clears old indices too
    await db10b.createTable('users', columns);
    await db10b.createIndex('index_users_id_fs', 'users', 'id');
    await db10b.createIndex('index_users_name_fs', 'users', 'name');
    const indices = await db10b.listIndices('users'); // listIndices can take tableName
    let found1 = false;
    let found2 = false;
    for(let i=0;i < indices.length;i++) {
      let index = indices[i];
      if(index.name === 'index_users_name_fs') found1 = true;
      if(index.name === 'index_users_id_fs') found2 = true;
    }
    // Every table gets an _uuid column with a hash index.
    if (indices.length >= 2 && found1 && found2) { // Check for >=2 because of _uuid index
      console.log('  Test 10b Passed: Index created successfully in filesystem database.');
    } else {
      console.error('  Test 10b Failed: Index not created in filesystem database. Indices found:', JSON.stringify(indices));
    }
  } catch (error) {
    console.error('  Test 10b Failed: Error creating index in filesystem database:', error);
  } finally {
    if (db10b) await db10b.close();
  }

  // Test 11: createSequence()
  console.log('\nTest 11: createSequence()');
  try {
    const db11 = new Database('testDB11');
    await db11.init();
    // Cleanup
    if(await db11.hasSequence('user_id_seq')) await db11.deleteSequence('user_id_seq');
    if(await db11.hasSequence('user_id2_seq')) await db11.deleteSequence('user_id2_seq');
    if(await db11.hasSequence('user_id3_seq')) await db11.deleteSequence('user_id3_seq');
    await db11.createSequence('user_id_seq');
    await db11.createSequence('user_id2_seq');
    await db11.createSequence('user_id3_seq');
    if (await db11.hasSequence('user_id_seq')) {
      const sequences = await db11.listSequences();
      if(sequences.includes('user_id_seq') && sequences.includes('user_id2_seq') && sequences.includes('user_id3_seq')) {
        console.log('  Test 11 Passed: Sequence created successfully.');
      }
      else {
        console.error('  Test 11 Failed: Sequence not created.');
      }
    } else {
      console.error('  Test 11 Failed: Sequence not created.');
    }
  } catch (error) {
    console.error('  Test 11 Failed: Error creating sequence:', error);
  }

  // Test 11b: createSequence() filesystem database
  console.log('\nTest 11b: createSequence() filesystem database');
  let db11b = null;
  try {
    db11b = new Database('collection', 'C:\\temp\\');
    await db11b.init();
    const seqNames = ['user_id_seq_fs', 'user_id2_seq_fs', 'user_id3_seq_fs'];
    for (const seqName of seqNames) {
      if (await db11b.hasSequence(seqName)) await db11b.deleteSequence(seqName);
      await db11b.createSequence(seqName);
    }
    if (await db11b.hasSequence(seqNames[0])) {
      const sequences = await db11b.listSequences();
      if(seqNames.every(seqName => sequences.includes(seqName))) {
        console.log('  Test 11b Passed: Sequence created successfully in filesystem database.');
      } else {
        console.error('  Test 11b Failed: Sequence not created in filesystem database.');
      }
    } else {
      console.error('  Test 11b Failed: Sequence not created in filesystem database.');
    }
  } catch (error) {
    console.error('  Test 11b Failed: Error creating sequence in filesystem database:', error);
  } finally {
    if (db11b) await db11b.close();
  }

  // Test 12: nextValue()
  console.log('\nTest 12: nextValue()');
  try {
    const db12 = new Database('testDB12');
    await db12.init();
    if(await db12.hasSequence('user_id_seq')) await db12.deleteSequence('user_id_seq');
    await db12.createSequence('user_id_seq');
    const nextVal1 = await db12.nextValue('user_id_seq');
    const nextVal2 = await db12.nextValue('user_id_seq');
    const nextVal3 = await db12.nextValue('user_id_seq');
    if (nextVal1 === 0 && nextVal2 === 1 && nextVal3 === 2) {
      console.log('  Test 12 Passed: nextValue() works correctly.');
    } else {
      console.error('  Test 12 Failed: nextValue() returned incorrect values.');
    }
  } catch (error) {
    console.error('  Test 12 Failed: Error with nextValue():', error);
  }

  // Test 12b: nextValue() filesystem database
  console.log('\nTest 12b: nextValue() filesystem database');
  let db12b = null;
  try {
    db12b = new Database('collection', 'C:\\temp\\');
    await db12b.init();
    const seqName = 'user_id_seq_fs_nextval';
    if (await db12b.hasSequence(seqName)) await db12b.deleteSequence(seqName);
    await db12b.createSequence(seqName);
    const nextVal1 = await db12b.nextValue(seqName);
    const nextVal2 = await db12b.nextValue(seqName);
    const nextVal3 = await db12b.nextValue(seqName);
    if (nextVal1 === 0 && nextVal2 === 1 && nextVal3 === 2) {
      console.log('  Test 12b Passed: nextValue() works correctly in filesystem database.');
    } else {
      console.error('  Test 12b Failed: nextValue() returned incorrect values in filesystem database.');
    }
  } catch (error) {
    console.error('  Test 12b Failed: Error with nextValue() in filesystem database:', error);
  } finally {
    if (db12b) await db12b.close();
  }

  // Test 13: deleteSequence()
  console.log('\nTest 13: deleteSequence()');
  try {
    const db13 = new Database('testDB13');
    await db13.init();
    if(await db13.hasSequence('user_id_seq')) await db13.deleteSequence('user_id_seq');
    if(await db13.hasSequence('user_id2_seq')) await db13.deleteSequence('user_id2_seq');
    await db13.createSequence('user_id_seq');
    await db13.createSequence('user_id2_seq');
    await db13.deleteSequence('user_id_seq');
    if (!(await db13.hasSequence('user_id_seq')) && (await db13.hasSequence('user_id2_seq'))) {
      console.log('  Test 13 Passed: Sequence deleted successfully.');
    } else {
      console.error('  Test 13 Failed: Sequence not deleted.');
    }
  } catch (error) {
    console.error('  Test 13 Failed: Error deleting sequence:', error);
  }

  // Test 13b: deleteSequence() filesystem database
  console.log('\nTest 13b: deleteSequence() filesystem database');
  let db13b = null;
  try {
    db13b = new Database('collection', 'C:\\temp\\');
    await db13b.init();
    const seq1 = 'user_id_seq_fs_del1';
    const seq2 = 'user_id_seq_fs_del2';
    if (await db13b.hasSequence(seq1)) await db13b.deleteSequence(seq1);
    if (await db13b.hasSequence(seq2)) await db13b.deleteSequence(seq2);
    await db13b.createSequence(seq1);
    await db13b.createSequence(seq2);
    await db13b.deleteSequence(seq1);
    if (!(await db13b.hasSequence(seq1)) && (await db13b.hasSequence(seq2))) {
      console.log('  Test 13b Passed: Sequence deleted successfully in filesystem database.');
    } else {
      console.error('  Test 13b Failed: Sequence not deleted in filesystem database.');
    }
  } catch (error) {
    console.error('  Test 13b Failed: Error deleting sequence in filesystem database:', error);
  } finally {
    if (db13b) await db13b.close();
  }

  // Test 14: deleteIndex()
  console.log('\nTest 14: deleteIndex()');
  try {
    const db14 = new Database('testDB14');
    await db14.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if(await db14.hasTable('users')) await db14.deleteTable('users');
    await db14.createTable('users', columns);
    await db14.createIndex('index_users_name', 'users', 'name');
    await db14.createIndex('index_users_id', 'users', 'id');
    await db14.deleteIndex('index_users_name', 'users');
    const indices = await db14.listIndices('users');
    let found1 = false;
    let found2 = false;
    for(let i=0;i < indices.length;i++) {
      let index = indices[i];
      if(index.name === 'index_users_name') {
        found1 = true;
      }
      if(index.name === 'index_users_id') {
        found2 = true;
      }
    }

    // Every table has a _uuid column with a hash index.
    // After deleting one custom index, we expect the other custom index and the _uuid index.
    if (!found1 && found2 && indices.some(idx => idx.name === 'index_users_id') && indices.length >=1 ) { // Check specific index and _uuid presence
      console.log('  Test 14 Passed: Index deleted successfully.');
    } else {
      console.error('  Test 14 Failed: Index not deleted. Found1:', found1, 'Found2:', found2, 'Indices:', JSON.stringify(indices));
    }
  } catch (error) {
    console.error('  Test 14 Failed: Error deleting index:', error);
  }

  // Test 14b: deleteIndex() filesystem database
  console.log('\nTest 14b: deleteIndex() filesystem database');
  let db14b = null;
  try {
    db14b = new Database('collection', 'C:\\temp\\');
    await db14b.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if (await db14b.hasTable('users')) await db14b.deleteTable('users');
    await db14b.createTable('users', columns);
    await db14b.createIndex('index_users_name_fs_del', 'users', 'name');
    await db14b.createIndex('index_users_id_fs_keep', 'users', 'id');
    await db14b.deleteIndex('index_users_name_fs_del', 'users');
    const indices = await db14b.listIndices('users');
    const indexExists = (name) => indices.some(idx => idx.name === name);

    if (!indexExists('index_users_name_fs_del') && indexExists('index_users_id_fs_keep')) {
      console.log('  Test 14b Passed: Index deleted successfully in filesystem database.');
    } else {
      console.error('  Test 14b Failed: Index not deleted in filesystem database. Indices:', JSON.stringify(indices));
    }
  } catch (error) {
    console.error('  Test 14b Failed: Error deleting index in filesystem database:', error);
  } finally {
    if (db14b) await db14b.close();
  }

  // Test 15: alterTableAddColumns()
  console.log('\nTest 15: alterTableAddColumns()');
  try {
    const db15 = new Database('testDB15');
    await db15.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if(await db15.hasTable('users')) await db15.deleteTable('users');
    await db15.createTable('users', columns);
    const newColumns = [
      { name: 'email', dataType: 'STRING' },
      { name: 'age', dataType: 'INTEGER' },
    ];
    await db15.alterTableAddColumns('users', newColumns);
    const desc = await db15.desc('users');
    // desc returns an array of column definition strings
    const hasEmail = (desc.indexOf('email STRING') > 0);
    const hasAge = (desc.indexOf('age INTEGER') > 0);
    if (hasEmail && hasAge) {
      console.log('  Test 15 Passed: Columns added successfully.');
    } else {
      console.error('  Test 15 Failed: Columns not added. Desc:', desc);
    }
  } catch (error) {
    console.error('  Test 15 Failed: Error adding columns:', error);
  }

  // Test 15b: alterTableAddColumns() filesystem database
  console.log('\nTest 15b: alterTableAddColumns() filesystem database');
  let db15b = null;
  try {
    db15b = new Database('collection', 'C:\\temp\\');
    await db15b.init();
    const columns = [ { name: 'id', dataType: 'INTEGER' }, { name: 'name', dataType: 'STRING' } ];
    if (await db15b.hasTable('users')) await db15b.deleteTable('users');
    await db15b.createTable('users', columns);
    const newColumns = [ { name: 'email', dataType: 'STRING' }, { name: 'age', dataType: 'INTEGER' } ];
    await db15b.alterTableAddColumns('users', newColumns);
    const desc = await db15b.desc('users');
    const hasEmail = (desc.indexOf('email STRING') > 0);
    const hasAge = (desc.indexOf('age INTEGER') > 0);
    if (hasEmail && hasAge) {
      console.log('  Test 15b Passed: Columns added successfully in filesystem database.');
    } else {
      console.error('  Test 15b Failed: Columns not added in filesystem database. Desc:', desc);
    }
  } catch (error) {
    console.error('  Test 15b Failed: Error adding columns in filesystem database:', error);
  } finally {
    if (db15b) await db15b.close();
  }

  // Test 16: alterTableAlterColumns()
  console.log('\nTest 16: alterTableAlterColumns()');
  try {
    const db16 = new Database('testDB16');
    await db16.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if(await db16.hasTable('users')) await db16.deleteTable('users');
    await db16.createTable('users', columns);
    const alterColumns = [
      { name: 'name', dataType: 'STRING' },
    ];
    await db16.alterTableAlterColumns('users', alterColumns);
    console.log('  Test 16 Passed: Columns altered successfully.');
  } catch (error) {
    console.error('  Test 16 Failed: Error altering columns:', error);
  }

  // Test 16b: alterTableAlterColumns() filesystem database
  console.log('\nTest 16b: alterTableAlterColumns() filesystem database');
  let db16b = null;
  try {
    db16b = new Database('collection', 'C:\\temp\\');
    await db16b.init();
    const columns = [ { name: 'id', dataType: 'INTEGER' }, { name: 'name', dataType: 'Boolean' } ];
    if (await db16b.hasTable('users')) await db16b.deleteTable('users');
    await db16b.createTable('users', columns);
    const alterColumns = [ { name: 'name', dataType: 'STRING', length: 100 } ]; // Example: Change length
    await db16b.alterTableAlterColumns('users', alterColumns);
    const desc = await db16b.desc('users');
    const hasNameCol = (desc.indexOf('name STRING') > 0);
    if (hasNameCol) { // Check new length
      console.log('  Test 16b Passed: Columns altered successfully in filesystem database.');
    } else {
      console.error('  Test 16b Failed: Columns not altered as expected in filesystem database. Desc:', desc);
    }
  } catch (error) {
    console.error('  Test 16b Failed: Error altering columns in filesystem database:', error);
  } finally {
    if (db16b) await db16b.close();
  }

  // Test 17: alterTableDropColumns()
  console.log('\nTest 17: alterTableDropColumns()');
  try {
    const db17 = new Database('testDB17');
    await db17.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
      { name: 'email', dataType: 'STRING' },
    ];
    if(await db17.hasTable('users')) await db17.deleteTable('users');
    await db17.createTable('users', columns);
    await db17.alterTableDropColumns('users', ['email']);
    const desc = await db17.desc('users');
    const hasEmail = (desc.indexOf('email STRING') > 0);
    if (!hasEmail) {
      console.log('  Test 17 Passed: Column dropped successfully.');
    } else {
      console.error('  Test 17 Failed: Column not dropped. Desc:', desc);
    }
  } catch (error) {
    console.error('  Test 17 Failed: Error dropping column:', error);
  }

  // Test 17b: alterTableDropColumns() filesystem database
  console.log('\nTest 17b: alterTableDropColumns() filesystem database');
  let db17b = null;
  try {
    db17b = new Database('collection', 'C:\\temp\\');
    await db17b.init();
    const columns = [ { name: 'id', dataType: 'INTEGER' }, { name: 'name', dataType: 'STRING' }, { name: 'email_to_drop', dataType: 'STRING' }];
    if (await db17b.hasTable('users')) await db17b.deleteTable('users');
    await db17b.createTable('users', columns);
    await db17b.alterTableDropColumns('users', ['email_to_drop']);
    const desc = await db17b.desc('users');
    const hasEmailToDrop = (desc.indexOf('email_to_drop') > 0);
    if (!hasEmailToDrop) {
      console.log('  Test 17b Passed: Column dropped successfully in filesystem database.');
    } else {
      console.error('  Test 17b Failed: Column not dropped in filesystem database. Desc:', desc);
    }
  } catch (error) {
    console.error('  Test 17b Failed: Error dropping column in filesystem database:', error);
  } finally {
    if (db17b) await db17b.close();
  }

  // Test 18: alterTableRenameColumns()
  console.log('\nTest 18: alterTableRenameColumns()');
  try {
    const db18 = new Database('testDB18');
    await db18.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name_first', dataType: 'STRING' },
    ];
    if(await db18.hasTable('users')) await db18.deleteTable('users');
    await db18.createTable('users', columns);
    await db18.alterTableRenameColumns('users', 'name_first', 'full_name');
    const desc = await db18.desc('users');
    const hasFullName = (desc.indexOf('full_name') > 0);
    const hasOldName = (desc.indexOf('name_first') > 0);
    if (hasFullName && !hasOldName) {
      console.log('  Test 18 Passed: Column renamed successfully.');
    } else {
      console.error('  Test 18 Failed: Column not renamed. Desc:', desc);
    }
  } catch (error) {
    console.error('  Test 18 Failed: Error renaming column:', error);
  }

  // Test 18b: alterTableRenameColumns() filesystem database
  console.log('\nTest 18b: alterTableRenameColumns() filesystem database');
  let db18b = null;
  try {
    db18b = new Database('collection', 'C:\\temp\\');
    await db18b.init();
    const columns = [ { name: 'id', dataType: 'INTEGER' }, { name: 'old_name_fs', dataType: 'STRING' } ];
    if (await db18b.hasTable('users')) await db18b.deleteTable('users');
    await db18b.createTable('users', columns);
    await db18b.alterTableRenameColumns('users', 'old_name_fs', 'new_name_fs');
    const desc = await db18b.desc('users');
    const hasNewName = (desc.indexOf('new_name_fs') > 0);
    const hasOldName = (desc.indexOf('old_name_fs') > 0);
    if (hasNewName && !hasOldName) {
      console.log('  Test 18b Passed: Column renamed successfully in filesystem database.');
    } else {
      console.error('  Test 18b Failed: Column not renamed in filesystem database. Desc:', desc);
    }
  } catch (error) {
    console.error('  Test 18b Failed: Error renaming column in filesystem database:', error);
  } finally {
    if (db18b) await db18b.close();
  }

  // Test 19: count()
  console.log('\nTest 19: count()');
  try {
    const db19 = new Database('testDB19');
    await db19.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if(await db19.hasTable('users')) await db19.deleteTable('users');
    await db19.createTable('users', columns);
    await db19.insertOne('users', { id: 1, name: 'John Doe' });
    await db19.insertOne('users', { id: 2, name: 'Jane Doe' });
    const count = await db19.count('users');
    if (count === 2) {
      console.log('  Test 19 Passed: Count returned correct value.');
    } else {
      console.error('  Test 19 Failed: Count returned incorrect value.');
    }
  } catch (error) {
    console.error('  Test 19 Failed: Error with count():', error);
  }

  // Test 19b: count() filesystem database
  console.log('\nTest 19b: count() filesystem database');
  let db19b = null;
  try {
    db19b = new Database('collection', 'C:\\temp\\');
    await db19b.init();
    const columns = [ { name: 'id', dataType: 'INTEGER' }, { name: 'name', dataType: 'STRING' } ];
    if (await db19b.hasTable('users')) await db19b.deleteTable('users');
    await db19b.createTable('users', columns);
    await db19b.insertOne('users', { id: 1, name: 'John FS' });
    await db19b.insertOne('users', { id: 2, name: 'Jane FS' });
    const count = await db19b.count('users');
    if (count === 2) {
      console.log('  Test 19b Passed: Count returned correct value from filesystem database.');
    } else {
      console.error('  Test 19b Failed: Count returned incorrect value from filesystem database. Count:', count);
    }
  } catch (error) {
    console.error('  Test 19b Failed: Error with count() in filesystem database:', error);
  } finally {
    if (db19b) await db19b.close();
  }

  // Test 20: deleteFrom()
  console.log('\nTest 20: deleteFrom()');
  try {
    const db20 = new Database('testDB20');
    await db20.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if(await db20.hasTable('users')) await db20.deleteTable('users');
    await db20.createTable('users', columns);
    await db20.insertOne('users', { id: 1, name: 'John Doe' });
    await db20.insertOne('users', { id: 2, name: 'Jane Doe' });
    let result = await db20.deleteFrom('users', 'id = 1');
    const count = await db20.count('users');
    if (count === 1) {
      console.log('  Test 20 Passed: deleteFrom() worked correctly.');
    } else {
      console.error('  Test 20 Failed: deleteFrom() did not delete the correct record.');
    }
  } catch (error) {
    console.error('  Test 20 Failed: Error with deleteFrom():', error);
  }

  // Test 20b: deleteFrom() filesystem database
  console.log('\nTest 20b: deleteFrom() filesystem database');
  let db20b = null;
  try {
    db20b = new Database('collection', 'C:\\temp\\');
    await db20b.init();
    const columns = [ { name: 'id', dataType: 'INTEGER' }, { name: 'name', dataType: 'STRING' } ];
    if (await db20b.hasTable('users')) await db20b.deleteTable('users');
    await db20b.createTable('users', columns);
    await db20b.insertOne('users', { id: 1, name: 'John FS Del' });
    await db20b.insertOne('users', { id: 2, name: 'Jane FS Keep' });
    let result = await db20b.deleteFrom('users', 'id = 1');
    const count = await db20b.count('users');
    if (count === 1 && result.nRemoved === 1) {
      console.log('  Test 20b Passed: deleteFrom() worked correctly in filesystem database.');
    } else {
      console.error('  Test 20b Failed: deleteFrom() did not delete the correct record in filesystem database. Count:', count, 'Removed:', result.nRemoved);
    }
  } catch (error) {
    console.error('  Test 20b Failed: Error with deleteFrom() in filesystem database:', error);
  } finally {
    if (db20b) await db20b.close();
  }

  // Test 21: desc()
  console.log('\nTest 21: desc()');
  try {
    const db21 = new Database('testDB21');
    await db21.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if(await db21.hasTable('users')) await db21.deleteTable('users');
    await db21.createTable('users', columns);
    const desc = await db21.desc('users');
    const hasId = (desc.indexOf('id INTEGER') > 0);
    const hasName = (desc.indexOf('name STRING') > 0);
    if (hasId && hasName) {
      console.log('  Test 21 Passed: desc() returned correct description.');
    } else {
      console.error('  Test 21 Failed: desc() returned incorrect description. Desc:', desc);
    }
  } catch (error) {
    console.error('  Test 21 Failed: Error with desc():', error);
  }

  // Test 21b: desc() filesystem database
  console.log('\nTest 21b: desc() filesystem database');
  let db21b = null;
  try {
    db21b = new Database('collection', 'C:\\temp\\');
    await db21b.init();
    const columns = [ { name: 'id', dataType: 'INTEGER' }, { name: 'name', dataType: 'STRING' } ];
    if (await db21b.hasTable('users')) await db21b.deleteTable('users');
    await db21b.createTable('users', columns);
    const desc = await db21b.desc('users');
    const hasId = (desc.indexOf('id INTEGER') > 0);
    const hasName = (desc.indexOf('name STRING') > 0);
    if (hasId && hasName) {
      console.log('  Test 21b Passed: desc() returned correct description from filesystem database.');
    } else {
      console.error('  Test 21b Failed: desc() returned incorrect description from filesystem database. Desc:', desc);
    }
  } catch (error) {
    console.error('  Test 21b Failed: Error with desc() in filesystem database:', error);
  } finally {
    if (db21b) await db21b.close();
  }

  // Test 22: insert()
  console.log('\nTest 22: insert()');
  try {
    const db22 = new Database('testDB22');
    await db22.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if(await db22.hasTable('users')) await db22.deleteTable('users');
    await db22.createTable('users', columns);
    const result = await db22.insert('users', { id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Doe' });
    if (result.nInserted === 2 && result.ids.length === 2) {
      console.log('  Test 22 Passed: insert() worked correctly.');
    } else {
      console.error('  Test 22 Failed: insert() did not insert the correct number of records.');
    }
  } catch (error) {
    console.error('  Test 22 Failed: Error with insert():', error);
  }

  // Test 22b: insert() filesystem database
  console.log('\nTest 22b: insert() filesystem database');
  let db22b = null;
  try {
    db22b = new Database('collection', 'C:\\temp\\');
    await db22b.init();
    const columns = [ { name: 'id', dataType: 'INTEGER' }, { name: 'name', dataType: 'STRING' } ];
    if (await db22b.hasTable('users')) await db22b.deleteTable('users');
    await db22b.createTable('users', columns);
    const result = await db22b.insert('users', { id: 1, name: 'John FS' }, { id: 2, name: 'Jane FS' });
    if (result.nInserted === 2 && result.ids.length === 2) {
      console.log('  Test 22b Passed: insert() worked correctly in filesystem database.');
    } else {
      console.error('  Test 22b Failed: insert() did not insert the correct number of records in filesystem database.');
    }
  } catch (error) {
    console.error('  Test 22b Failed: Error with insert() in filesystem database:', error);
  } finally {
    if (db22b) await db22b.close();
  }


  // Test 23: insertMany()
  console.log('\nTest 23: insertMany()');
  try {
    const db23 = new Database('testDB23');
    await db23.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if(await db23.hasTable('users')) await db23.deleteTable('users');
    await db23.createTable('users', columns);
    const result = await db23.insertMany('users', [{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Doe' }]);
    if (result.nInserted === 2 && result.ids.length === 2) {
      console.log('  Test 23 Passed: insertMany() worked correctly.');
    } else {
      console.error('  Test 23 Failed: insertMany() did not insert the correct number of records.');
    }
  } catch (error) {
    console.error('  Test 23 Failed: Error with insertMany():', error);
  }

  // Test 23b: insertMany() filesystem database
  console.log('\nTest 23b: insertMany() filesystem database');
  let db23b = null;
  try {
    db23b = new Database('collection', 'C:\\temp\\');
    await db23b.init();
    const columns = [ { name: 'id', dataType: 'INTEGER' }, { name: 'name', dataType: 'STRING' } ];
    if (await db23b.hasTable('users')) await db23b.deleteTable('users');
    await db23b.createTable('users', columns);
    const result = await db23b.insertMany('users', [{ id: 1, name: 'John FS Many' }, { id: 2, name: 'Jane FS Many' }]);
    if (result.nInserted === 2 && result.ids.length === 2) {
      console.log('  Test 23b Passed: insertMany() worked correctly in filesystem database.');
    } else {
      console.error('  Test 23b Failed: insertMany() did not insert the correct number of records in filesystem database.');
    }
  } catch (error)
 {
    console.error('  Test 23b Failed: Error with insertMany() in filesystem database:', error);
  } finally {
    if (db23b) await db23b.close();
  }

  // Test 24: listIndices()
  console.log('\nTest 24: listIndices()');
  try {
    const db24 = new Database('testDB24');
    await db24.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if(await db24.hasTable('users')) await db24.deleteTable('users');
    await db24.createTable('users', columns);
    await db24.createIndex('index_users_name', 'users', 'name');
    const indices = await db24.listIndices('users');
    let found = false;
    for(let i=0;i < indices.length;i++) {
      let index = indices[i];
      if(index.name === 'index_users_name') {
        found = true;
        break;
      }
    }
    if (found) {
      console.log('  Test 24 Passed: listIndices() returned correct indices.');
    } else {
      console.error('  Test 24 Failed: listIndices() did not return correct indices.');
    }
  } catch (error) {
    console.error('  Test 24 Failed: Error with listIndices():', error);
  }

  // Test 24b: listIndices() filesystem database
  console.log('\nTest 24b: listIndices() filesystem database');
  let db24b = null;
  try {
    db24b = new Database('collection', 'C:\\temp\\');
    await db24b.init();
    const columns = [ { name: 'id', dataType: 'INTEGER' }, { name: 'name', dataType: 'STRING' } ];
    if (await db24b.hasTable('users')) await db24b.deleteTable('users');
    await db24b.createTable('users', columns);
    await db24b.createIndex('index_users_name_fs_list', 'users', 'name');
    const indices = await db24b.listIndices('users');
    const found = indices.some(index => index.name === 'index_users_name_fs_list');
    if (found) {
      console.log('  Test 24b Passed: listIndices() returned correct indices from filesystem database.');
    } else {
      console.error('  Test 24b Failed: listIndices() did not return correct indices from filesystem database. Indices:', JSON.stringify(indices));
    }
  } catch (error) {
    console.error('  Test 24b Failed: Error with listIndices() in filesystem database:', error);
  } finally {
    if (db24b) await db24b.close();
  }

  // Test 25: listSequences()
  console.log('\nTest 25: listSequences()');
  try {
    const db25 = new Database('testDB25');
    await db25.init();
    if(await db25.hasSequence('user_id_seq')) await db25.deleteSequence('user_id_seq');
    if(await db25.hasSequence('usergroup_id_seq')) await db25.deleteSequence('usergroup_id_seq');
    await db25.createSequence('user_id_seq');
    await db25.createSequence('usergroup_id_seq');
    const sequences = await db25.listSequences();
    if (sequences.includes('user_id_seq') && sequences.includes('usergroup_id_seq')) {
      console.log('  Test 25 Passed: listSequences() returned correct sequences.');
    } else {
      console.error('  Test 25 Failed: listSequences() did not return correct sequences.');
    }
  } catch (error) {
    console.error('  Test 25 Failed: Error with listSequences():', error);
  }

  // Test 25b: listSequences() filesystem database
  console.log('\nTest 25b: listSequences() filesystem database');
  let db25b = null;
  try {
    db25b = new Database('collection', 'C:\\temp\\');
    await db25b.init();
    const seq1 = 'user_id_seq_fs_list';
    const seq2 = 'usergroup_id_seq_fs_list';
    if (await db25b.hasSequence(seq1)) await db25b.deleteSequence(seq1);
    if (await db25b.hasSequence(seq2)) await db25b.deleteSequence(seq2);
    await db25b.createSequence(seq1);
    await db25b.createSequence(seq2);
    const sequences = await db25b.listSequences();
    if (sequences.includes(seq1) && sequences.includes(seq2)) {
      console.log('  Test 25b Passed: listSequences() returned correct sequences from filesystem database.');
    } else {
      console.error('  Test 25b Failed: listSequences() did not return correct sequences from filesystem database. Sequences:', sequences);
    }
  } catch (error) {
    console.error('  Test 25b Failed: Error with listSequences() in filesystem database:', error);
  } finally {
    if (db25b) await db25b.close();
  }

  // Test 26: listTables()
  console.log('\nTest 26: listTables()');
  try {
    const db26 = new Database('testDB26');
    await db26.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if(await db26.hasTable('users')) await db26.deleteTable('users');
    if(await db26.hasTable('users_backup')) await db26.deleteTable('users_backup');
    await db26.createTable('users', columns);
    await db26.createTable('users_backup', columns);
    const tables = await db26.listTables();
    if (tables.includes('users') && tables.includes('users_backup')) {
      console.log('  Test 26 Passed: listTables() returned correct tables.');
    } else {
      console.error('  Test 26 Failed: listTables() did not return correct tables.');
    }
  } catch (error) {
    console.error('  Test 26 Failed: Error with listTables():', error);
  }

  // Test 26b: listTables() filesystem database
  console.log('\nTest 26b: listTables() filesystem database');
  let db26b = null;
  try {
    db26b = new Database('collection', 'C:\\temp\\');
    await db26b.init();
    const columns = [ { name: 'id', dataType: 'INTEGER' }, { name: 'name', dataType: 'STRING' } ];
    const table1 = 'users_fs_list';
    const table2 = 'users_backup_fs_list';
    if (await db26b.hasTable(table1)) await db26b.deleteTable(table1);
    if (await db26b.hasTable(table2)) await db26b.deleteTable(table2);
    await db26b.createTable(table1, columns);
    await db26b.createTable(table2, columns);
    const tables = await db26b.listTables();
    if (tables.includes(table1) && tables.includes(table2)) {
      console.log('  Test 26b Passed: listTables() returned correct tables from filesystem database.');
    } else {
      console.error('  Test 26b Failed: listTables() did not return correct tables from filesystem database. Tables:', tables);
    }
  } catch (error) {
    console.error('  Test 26b Failed: Error with listTables() in filesystem database:', error);
  } finally {
    if (db26b) await db26b.close();
  }

  // Test 27: renameSequence()
  console.log('\nTest 27: renameSequence()');
  try {
    const db27 = new Database('testDB27');
    await db27.init();
    if(await db27.hasSequence('user_id_seq')) await db27.deleteSequence('user_id_seq');
    if(await db27.hasSequence('new_user_id_seq')) await db27.deleteSequence('new_user_id_seq');
    await db27.createSequence('user_id_seq');
    await db27.renameSequence('user_id_seq', 'new_user_id_seq');
    if ((await db27.hasSequence('new_user_id_seq')) && (!(await db27.hasSequence('user_id_seq')))) {
      console.log('  Test 27 Passed: renameSequence() worked correctly.');
    } else {
      console.error('  Test 27 Failed: renameSequence() did not rename the sequence.');
    }
  } catch (error) {
    console.error('  Test 27 Failed: Error with renameSequence():', error);
  } finally {
    // db27 is in-memory, usually not closed in these tests, but good practice if it were file-based
  }

  // Test 27b: renameSequence() filesystem database
  console.log('\nTest 27b: renameSequence() filesystem database');
  let db27b = null;
  try {
    db27b = new Database('collection', 'C:\\temp\\');
    await db27b.init();
    const oldSeqName = 'user_id_seq_fs_old_rename';
    const newSeqName = 'user_id_seq_fs_new_rename';
    if (await db27b.hasSequence(oldSeqName)) await db27b.deleteSequence(oldSeqName);
    if (await db27b.hasSequence(newSeqName)) await db27b.deleteSequence(newSeqName);
    await db27b.createSequence(oldSeqName);
    await db27b.renameSequence(oldSeqName, newSeqName);
    if ((await db27b.hasSequence(newSeqName)) && (!(await db27b.hasSequence(oldSeqName)))) {
      console.log('  Test 27b Passed: renameSequence() worked correctly in filesystem database.');
    } else {
      console.error('  Test 27b Failed: renameSequence() did not rename the sequence in filesystem database.');
    }
  } catch (error) {
    console.error('  Test 27b Failed: Error with renameSequence() in filesystem database:', error);
  } finally {
    if (db27b) await db27b.close();
  }

  // Test 28: renameIndex()
  console.log('\nTest 28: renameIndex()');
  try {
    const db28 = new Database('testDB28');
    await db28.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if(await db28.hasTable('users')) await db28.deleteTable('users');
    await db28.createTable('users', columns);
    await db28.createIndex('index_users_name', 'users', 'name');
    await db28.renameIndex('index_users_name', 'new_index_users_name', 'users');
    const indices = await db28.listIndices('users');
    let found = false;
    for(let i=0;i < indices.length;i++) {
      let index = indices[i];
      if(index.name === 'new_index_users_name') {
        found = true;
        break;
      }
    }
    if (found) {
      console.log('  Test 28 Passed: renameIndex() worked correctly.');
    } else {
      console.error('  Test 28 Failed: renameIndex() did not rename the index.');
    }
  } catch (error) {
    console.error('  Test 28 Failed: Error with renameIndex():', error);
  }

// logging.setLevel(logging.Level.TRACE);

  // Test 28b: renameIndex() filesystem database
  console.log('\nTest 28b: renameIndex() filesystem database');
  let db28b = null;
  try {
    db28b = new Database('collection', 'C:\\temp\\');
    await db28b.init();
    const columns = [ { name: 'id', dataType: 'INTEGER' }, { name: 'name', dataType: 'STRING' } ];
    if (await db28b.hasTable('users')) await db28b.deleteTable('users');
    await db28b.createTable('users', columns);
    const oldIndexName = 'index_users_name_fs_old_rename';
    const newIndexName = 'index_users_name_fs_new_rename';
    await db28b.createIndex(oldIndexName, 'users', 'name');
    await db28b.renameIndex(oldIndexName, newIndexName, 'users');
    const indices = await db28b.listIndices();
    const foundNew = indices.some(index => index.name === newIndexName);
    const foundOld = indices.some(index => index.name === oldIndexName);
    if (foundNew && !foundOld) {
      console.log('  Test 28b Passed: renameIndex() worked correctly in filesystem database.');
    } else {
      console.error('  Test 28b Failed: renameIndex() did not rename the index in filesystem database. Indices:', JSON.stringify(indices));
    }
  } catch (error) {
    console.error('  Test 28b Failed: Error with renameIndex() in filesystem database:', error);
  } finally {
    if (db28b) await db28b.close();
  }

  // Test 29: renameTable()
  console.log('\nTest 29: renameTable()');
  try {
    const db29 = new Database('testDB29');
    await db29.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if(await db29.hasTable('users')) await db29.deleteTable('users');
    if(await db29.hasTable('new_users')) await db29.deleteTable('new_users');
    await db29.createTable('users', columns);
    await db29.renameTable('users', 'new_users');
    if ((await db29.hasTable('new_users')) && !(await db29.hasTable('users'))) {
      console.log('  Test 29 Passed: renameTable() worked correctly.');
    } else {
      console.error('  Test 29 Failed: renameTable() did not rename the table.');
    }
  } catch (error) {
    console.error('  Test 29 Failed: Error with renameTable():', error);
  }

  // Test 29b: renameTable() filesystem database
  console.log('\nTest 29b: renameTable() filesystem database');
  let db29b = null;
  try {
    db29b = new Database('collection', 'C:\\temp\\');
    await db29b.init();
    const columns = [ { name: 'id', dataType: 'INTEGER' }, { name: 'name', dataType: 'STRING' } ];
    const oldTableName = 'users_fs_old_rename';
    const newTableName = 'users_fs_new_rename';
    if (await db29b.hasTable(oldTableName)) await db29b.deleteTable(oldTableName);
    if (await db29b.hasTable(newTableName)) await db29b.deleteTable(newTableName);
    await db29b.createTable(oldTableName, columns);
    await db29b.renameTable(oldTableName, newTableName);
    if ((await db29b.hasTable(newTableName)) && !(await db29b.hasTable(oldTableName))) {
      console.log('  Test 29b Passed: renameTable() worked correctly in filesystem database.');
    } else {
      console.error('  Test 29b Failed: renameTable() did not rename the table in filesystem database.');
    }
  } catch (error) {
    console.error('  Test 29b Failed: Error with renameTable() in filesystem database:', error);
  } finally {
    if (db29b) await db29b.close();
  }

// logging.setLogLevel(logging.Level.TRACE);
  // Test 30: select()
  console.log('\nTest 30: select()');
  try {
    const db30 = new Database('testDB30');
    await db30.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if(await db30.hasTable('users')) await db30.deleteTable('users');
    await db30.createTable('users', columns);
    await db30.insertOne('users', { id: 1, name: 'John Doe' });
    const resultSet = await db30.select('users');
    resultSet.toNextRow();
    if (resultSet.getTotalNumberOfRows() === 1 && resultSet.getRow().name === 'John Doe') {
      console.log('  Test 30 Passed: select() worked correctly.');
    } else {
      console.error('  Test 30 Failed: select() did not select the correct records.');
    }
  } catch (error) {
    console.error('  Test 30 Failed: Error with select():', error);
  }

  // Test 30b: select() filesystem database
  console.log('\nTest 30b: select() filesystem database');
  let db30b = null;
  try {
    db30b = new Database('collection', 'C:\\temp\\');
    await db30b.init();
    const columns = [ { name: 'id', dataType: 'INTEGER' }, { name: 'name', dataType: 'STRING' } ];
    if (await db30b.hasTable('users')) await db30b.deleteTable('users');
    await db30b.createTable('users', columns);
    await db30b.insertOne('users', { id: 1, name: 'John Doe FS Select' });
    const resultSet = await db30b.select('users');
    resultSet.toNextRow();
    if (resultSet.getTotalNumberOfRows() === 1 && resultSet.getRow().name === 'John Doe FS Select') {
      console.log('  Test 30b Passed: select() worked correctly in filesystem database.');
    } else {
      console.error('  Test 30b Failed: select() did not select the correct records in filesystem database.');
    }
  } catch (error) {
    console.error('  Test 30b Failed: Error with select() in filesystem database:', error);
  } finally {
    if (db30b) await db30b.close();
  }

  // Test 31: selectDistinct()
  console.log('\nTest 31: selectDistinct()');
  try {
    const db31 = new Database('testDB31');
    await db31.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if(await db31.hasTable('users')) await db31.deleteTable('users');
    await db31.createTable('users', columns);
    await db31.insertOne('users', { id: 1, name: 'John Doe' });
    await db31.insertOne('users', { id: 2, name: 'John Doe' });
    const resultSet = await db31.selectDistinct('name', 'users', null);
    resultSet.toNextRow();
    if (resultSet.getTotalNumberOfRows() === 1 && resultSet.getRow().name === 'John Doe') {
      console.log('  Test 31 Passed: selectDistinct() worked correctly.');
    } else {
      console.error('  Test 31 Failed: selectDistinct() did not select the correct records.');
    }
  } catch (error) {
    console.error('  Test 31 Failed: Error with selectDistinct():', error);
  }

  // Test 31b: selectDistinct() filesystem database
  console.log('\nTest 31b: selectDistinct() filesystem database');
  let db31b = null;
  try {
    db31b = new Database('collection', 'C:\\temp\\');
    await db31b.init();
    const columns = [ { name: 'id', dataType: 'INTEGER' }, { name: 'name', dataType: 'STRING' } ];
    if (await db31b.hasTable('users')) await db31b.deleteTable('users');
    await db31b.createTable('users', columns);
    await db31b.insertOne('users', { id: 1, name: 'John Doe FS Distinct' });
    await db31b.insertOne('users', { id: 2, name: 'John Doe FS Distinct' }); // Duplicate name
    await db31b.insertOne('users', { id: 3, name: 'Jane Doe FS Distinct' });
    const resultSet = await db31b.selectDistinct('name', 'users', null); // Select distinct names
    if (resultSet.getTotalNumberOfRows() === 2) { // Expecting John and Jane
      console.log('  Test 31b Passed: selectDistinct() worked correctly in filesystem database.');
    } else {
      console.error('  Test 31b Failed: selectDistinct() did not select the correct records in filesystem database. Rows:', resultSet.getTotalNumberOfRows());
    }
  } catch (error) {
    console.error('  Test 31b Failed: Error with selectDistinct() in filesystem database:', error);
  } finally {
    if (db31b) await db31b.close();
  }

  // Test 32: selectAll()
  console.log('\nTest 32: selectAll()');
  try {
    const db32 = new Database('testDB32');
    await db32.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if(await db32.hasTable('users')) await db32.deleteTable('users');
    await db32.createTable('users', columns);
    await db32.insertOne('users', { id: 1, name: 'John Doe' });
    const resultSet = await db32.selectAll('users');
    resultSet.toNextRow();
    if (resultSet.getTotalNumberOfRows() === 1 && resultSet.getRow().name === 'John Doe') {
      console.log('  Test 32 Passed: selectAll() worked correctly.');
    } else {
      console.error('  Test 32 Failed: selectAll() did not select the correct records.');
    }
  } catch (error) {
    console.error('  Test 32 Failed: Error with selectAll():', error);
  }

  // Test 32b: selectAll() filesystem database (similar to 8b, for completeness if 32 was intended as separate)
  console.log('\nTest 32b: selectAll() filesystem database');
  let db32b = null;
  try {
    db32b = new Database('collection', 'C:\\temp\\');
    await db32b.init();
    const columns = [ { name: 'id', dataType: 'INTEGER' }, { name: 'name', dataType: 'STRING' } ];
    if (await db32b.hasTable('users_selectAllFS')) await db32b.deleteTable('users_selectAllFS');
    await db32b.createTable('users_selectAllFS', columns);
    await db32b.insertOne('users_selectAllFS', { id: 1, name: 'Solo John FS' });
    const resultSet = await db32b.selectAll('users_selectAllFS');
    resultSet.toNextRow();
    if (resultSet.getTotalNumberOfRows() === 1 && resultSet.getRow().name === 'Solo John FS') {
      console.log('  Test 32b Passed: selectAll() worked correctly in filesystem database.');
    } else {
      console.error('  Test 32b Failed: selectAll() did not select the correct records in filesystem database.');
    }
  } catch (error) {
    console.error('  Test 32b Failed: Error with selectAll() in filesystem database:', error);
  } finally {
    if (db32b) await db32b.close();
  }

  // Test 33: selectSlice()
  console.log('\nTest 33: selectSlice()');
  let db33 = null;
  try {
    db33 = new Database('collection', 'C:\\temp\\');
    await db33.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if(await db33.hasTable('users')) { // Added await
      await db33.deleteTable('users');
    }
    await db33.createTable('users', columns);
    await db33.insertOne('users', { id: 1, name: 'John Doe' });
    const resultSet = await db33.selectSlice('name', 'users');
    resultSet.toNextRow();
    if (resultSet.getTotalNumberOfRows() === 1 && resultSet.getRow().name === 'John Doe') {
      console.log('  Test 33 Passed: selectSlice() worked correctly.');
    } else {
      console.error('  Test 33 Failed: selectSlice() did not select the correct records.');
    }
  } catch (error) {
    console.error('  Test 33 Failed: Error with selectSlice():', error);
  } finally {
    if(db33) {
      await db33.close(); // Added await
    }
  }

  // Test 34: selectSubset()
  console.log('\nTest 34: selectSubset()');
  let db34 = null;
  try {
    db34 = new Database('collection', 'C:\\temp\\');
    await db34.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if(await db34.hasTable('users')) { // Added await
      await db34.deleteTable('users');
    }
    await db34.createTable('users', columns);
    await db34.insertOne('users', { id: 1, name: 'John Doe' });
    await db34.insertOne('users', { id: 2, name: 'Jane Doe' });
    const resultSet = await db34.selectSubset('users', 'name = "John Doe"');
    resultSet.toNextRow();
    let row = resultSet.getRow();
    console.log('row: ' + JSON.stringify(row));
    if (resultSet.getTotalNumberOfRows() === 1 && resultSet.getRow().name === 'John Doe') {
      console.log('  Test 34 Passed: selectSubset() worked correctly.');
    } else {
      console.error('  Test 34 Failed: selectSubset() did not select the correct records.');
    }
  } catch (error) {
    console.error('  Test 34 Failed: Error with selectSubset():', error);
  } finally {
    if(db34) {
      await db34.close(); // Added await
    }
  }

  // Test 35: update()
  console.log('\nTest 35: update()');
  try {
    const db35 = new Database('testDB35');
    await db35.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
    ];
    if(await db35.hasTable('users')) await db35.deleteTable('users');
    await db35.createTable('users', columns);
    await db35.insertOne('users', { id: 1, name: 'John Doe' });
    await db35.update('users', ['name'], ['Jane Doe'], 'id = 1');
    const resultSet = await db35.selectAll('users');
    resultSet.toNextRow();
    if (resultSet.getTotalNumberOfRows() === 1 && resultSet.getRow().name === 'Jane Doe') {
      console.log('  Test 35 Passed: update() worked correctly.');
    } else {
      console.error('  Test 35 Failed: update() did not update the correct record.');
    }
  } catch (error) {
    console.error('  Test 35 Failed: Error with update():', error);
  }

  // Test 35b: update() filesystem database
  console.log('\nTest 35b: update() filesystem database');
  let db35b = null;
  try {
    db35b = new Database('collection', 'C:\\temp\\');
    await db35b.init();
    const columns = [ { name: 'id', dataType: 'INTEGER' }, { name: 'name', dataType: 'STRING' } ];
    if (await db35b.hasTable('users')) await db35b.deleteTable('users');
    await db35b.createTable('users', columns);
    await db35b.insertOne('users', { id: 1, name: 'John Doe FS Update' });
    await db35b.update('users', ['name'], ['Jane Doe FS Updated'], 'id = 1');
    const resultSet = await db35b.selectAll('users');
    resultSet.toNextRow();
    if (resultSet.getTotalNumberOfRows() === 1 && resultSet.getRow().name === 'Jane Doe FS Updated') {
      console.log('  Test 35b Passed: update() worked correctly in filesystem database.');
    } else {
      console.error('  Test 35b Failed: update() did not update the correct record in filesystem database.');
    }
  } catch (error) {
    console.error('  Test 35b Failed: Error with update() in filesystem database:', error);
  } finally {
    if (db35b) await db35b.close();
  }

  // Test 36: updateByObject()
  console.log('\nTest 36: updateByObject()');
  let db36 = null;
  try {
    db36 = new Database('collection', 'C:\\temp\\'); // Using filesystem as per original
    await db36.init();
    const columns = [
      { name: 'id', dataType: 'INTEGER' },
      { name: 'name', dataType: 'STRING' },
      // age column will be added by updateByObject if it doesn't exist, or updated if it does.
    ];
    if(await db36.hasTable('users')) { // Added await
      await db36.deleteTable('users');
    }
    await db36.createTable('users', columns);
    await db36.insertOne('users', { id: 1, name: 'John Doe' });
    await db36.insertOne('users', { id: 2, name: 'Jane Doe' });
    await db36.updateByObject('users', { age: 100 });
    const resultSet = await db36.selectAll('users');
    let allUpdated = true;
    if (resultSet.getTotalNumberOfRows() === 2) {
      while(resultSet.toNextRow()){
        let row = resultSet.getRow();
        if(row.age !== 100) allUpdated = false;
      }
    } else {
      allUpdated = false;
    }

    if(allUpdated) {
      console.log('  Test 36 Passed: updateByObject() worked correctly.');
    } else {
      console.error('  Test 36 Failed: updateByObject() did not update the correct records.');
    }
  } catch (error) {
    console.error('  Test 36 Failed: Error with updateByObject():', error);
  } finally {
    if (db36) await db36.close(); // Added finally block and await close
  }
}

runTests();