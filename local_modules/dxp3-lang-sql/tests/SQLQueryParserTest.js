// SQLQueryParser.test.js

const SQLQueryParser = require('../SQLQueryParser'); // Adjust the path if necessary

// Helper function to check if two objects are deeply equal
function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

// Helper function to run a test and report the result
async function runTest(testName, sql) {
  try {
    const parser = new SQLQueryParser(sql);
    const result = await parser.nextSQLQuery();
    const passed = (result.toString() === sql);
    if (passed) {
      console.log(`Test Passed: ${testName}`);
    } else {
      console.error(`Test Failed: ${testName}`);
      console.error('  Expected:', sql);
      console.error('  Received:', result.toString());
    }
  } catch (error) {
    console.error(`Test Failed: ${testName}`);
    console.error('  Error:', error);
  }
}

// Test cases

// Test 1: SELECT query
(async () => {
  await runTest(
    'SELECT query',
    'SELECT * FROM mytable;'
  );
})();

// Test 2: INSERT INTO query
(async () => {
  await runTest(
    'INSERT INTO query',
    'INSERT INTO users (id, name) VALUES(1, \'John\');'
  );
})();

// Test 3: DELETE FROM query
(async () => {
  await runTest(
    'DELETE FROM query',
    'DELETE FROM users WHERE id = 1;'
  );
})();

// Test 4: UPDATE query
(async () => {
  await runTest(
    'UPDATE query',
    'UPDATE users SET name=\'Jane\' WHERE id = 1;'
  );
})();

// Test 5: CREATE TABLE query
(async () => {
  await runTest(
    'CREATE TABLE query',
    'CREATE TABLE mytable (id int, name varchar);'
  );
})();

// Test 6: ALTER TABLE ADD COLUMN query
(async () => {
  await runTest(
    'ALTER TABLE ADD COLUMN query',
    'ALTER TABLE mytable ADD COLUMN age int;'
  );
})();

// Test 7: ALTER TABLE ALTER COLUMN query
(async () => {
  await runTest(
    'ALTER TABLE ALTER COLUMN query',
    'ALTER TABLE mytable ALTER COLUMN name varchar;'
  );
})();

// Test 8: ALTER TABLE DROP COLUMN query
(async () => {
  await runTest(
    'ALTER TABLE DROP COLUMN query',
    'ALTER TABLE mytable DROP COLUMN age;'
  );
})();

// Test 9: ALTER TABLE RENAME COLUMN query
(async () => {
  await runTest(
    'ALTER TABLE RENAME COLUMN query',
    'ALTER TABLE mytable RENAME COLUMN oldname TO newname;'
  );
})();

// Test 10: DESC query
(async () => {
  await runTest(
    'DESC query',
    'DESC mytable;'
  );
})();

// Test 11: CREATE SEQUENCE query
(async () => {
  await runTest(
    'CREATE SEQUENCE query',
    'CREATE SEQUENCE mysequence;'
  );
})();

// Test 12: SELECT with WHERE clause
(async () => {
  await runTest(
    'SELECT with WHERE clause',
    'SELECT * FROM mytable WHERE id = 1;'
  );
})();

// Test 13: SELECT with GROUP BY clause
(async () => {
  await runTest(
    'SELECT with GROUP BY clause',
    'SELECT * FROM mytable GROUP BY id;'
  );
})();

// Test 14: SELECT with HAVING clause
(async () => {
  await runTest(
    'SELECT with HAVING clause',
    'SELECT * FROM mytable HAVING id = 1;'
  );
})();

// Test 15: SELECT with ORDER BY clause ascending
(async () => {
  await runTest(
    'SELECT with ORDER BY clause ascending',
    'SELECT * FROM mytable ORDER BY id ASC;'
  );
})();

// Test 16: SELECT with ORDER BY clause descending
(async () => {
  await runTest(
    'SELECT with ORDER BY clause descending',
    'SELECT * FROM mytable ORDER BY id DESC;'
  );
})();

// Test 17: SELECT with DISTINCT
(async () => {
  await runTest(
    'SELECT with DISTINCT',
    'SELECT DISTINCT name FROM mytable;'
  );
})();

// Test 18: INSERT INTO with multiple rows
(async () => {
  await runTest(
    'INSERT INTO with multiple rows',
    'INSERT INTO users (id, name) VALUES(1, \'John\'), (2, \'Jane\');'
  );
})();

// Test 19: UPDATE with multiple column value pairs
(async () => {
  await runTest(
    'UPDATE with multiple column value pairs',
    'UPDATE users SET name=\'Jane\',age=30 WHERE id = 1;'
  );
})();

// Test 20: SELECT with aggregate functions
(async () => {
  await runTest(
    'SELECT with aggregate functions',
    'SELECT COUNT(*), AVG(age), MAX(age), MIN(age), SUM(age) FROM users;'
  );
})();

// Test 21: SELECT with CONCAT function
(async () => {
  await runTest(
    'SELECT with CONCAT function',
    'SELECT CONCAT(firstName, lastName) FROM users;'
  );
})();

// Test 22: SELECT with alias
(async () => {
  await runTest(
    'SELECT with alias',
    'SELECT name AS userName FROM users;'
  );
})();

// Test 23: SELECT with alias and aggregate function
(async () => {
  await runTest(
    'SELECT with alias and aggregate function',
    'SELECT COUNT(*) AS totalUsers FROM users;'
  );
})();

// Test 24: SELECT with alias and concat function
(async () => {
  await runTest(
    'SELECT with alias and concat function',
    'SELECT CONCAT(firstName, lastName) AS fullName FROM users;'
  );
})();

// Test 25: SELECT with a table with whitespace in the name
(async () => {
  await runTest(
    'SELECT with whitespace',
    'SELECT * FROM [My Fancy Table];'
  );
})();

// Test 26: INSERT INTO query with whitespace
(async () => {
  await runTest(
    'INSERT INTO query with whitespace',
    'INSERT INTO [My Fancy Users Table] (id, name) VALUES(1, \'John\');'
  );
})();

// Test 27: DELETE FROM query with whitespace
(async () => {
  await runTest(
    'DELETE FROM query with whitespace',
    'DELETE FROM [My Users Table] WHERE id = 1;'
  );
})();

// Test 28: DESC with whitespace
(async () => {
  await runTest(
    'DESC with whitespace',
    'DESC [My Users Table];'
  );
})();

// Test 29: UPDATE with whitespace
(async () => {
  await runTest(
    'UPDATE with whitespace',
    'UPDATE [My Users] SET name=\'John\',age=37 WHERE id = 1001;'
  );
})();

// Test 30: SELECT with alias and whitespace
(async () => {
  await runTest(
    'SELECT with alias and whitespace',
    'SELECT [First Name] AS [User Full Name] FROM [My Users] WHERE [Last Name] = \'Smith\';'
  );
})();

// Test 31: SELECT with like condition
(async () => {
  await runTest(
    'SELECT with like condition',
    'SELECT [First Name] AS [User Full Name] FROM [My Users] WHERE [Last Name] LIKE \'Sm%\';'
  );
})();

// Test 32: SELECT with between number condition
(async () => {
  await runTest(
    'SELECT with between number condition',
    'SELECT * FROM Users WHERE age BETWEEN 18 AND 35;'
  );
})();

// Test 33: SELECT with between string condition
(async () => {
  await runTest(
    'SELECT with between string condition',
    'SELECT * FROM Pets WHERE type BETWEEN \'Dog\' AND \'Fish\';'
  );
})();

// Test 34: SELECT with and condition
(async () => {
  await runTest(
    'SELECT with and condition',
    'SELECT * FROM Pets WHERE (type BETWEEN \'Dog\' AND \'Fish\' AND age < 12);'
  );
})();

// Test 35: SELECT with or condition
(async () => {
  await runTest(
    'SELECT with or condition',
    'SELECT * FROM Pets WHERE (age < 12 OR age > 89);'
  );
})();
