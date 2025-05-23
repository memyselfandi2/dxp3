const SQLUpdateQuery = require('../SQLUpdateQuery');
const SQLEqualCondition = require('../SQLEqualCondition');
const SQLColumn = require('../SQLColumn');

try {
    const testUpdate1 = new SQLUpdateQuery('myTable', { col1: '\'val1\'', col2: 123 });
    console.log('Test 1 (Object):', testUpdate1.toString());
    
    const testUpdate2 = new SQLUpdateQuery('myTable', ['col1', 'col2'], ['"val1"', 123]);
    console.log('Test 2 (Array):', testUpdate2.toString());

    const testUpdate3 = new SQLUpdateQuery('myTable', ['col1', 'col2'], ['\'val1\'', 123], 'col3=456');
    console.log('Test 3 (Array with condition):', testUpdate3.toString());

    const testUpdate4 = new SQLUpdateQuery('myTable', new Map([['col1', '\'val1\''], ['col2', 123]]));
    console.log('Test 4 (Map):', testUpdate4.toString());

    const testUpdate5 = new SQLUpdateQuery('myTable', new Map([['col1', '\'val1\''], ['col2', 123]]), 'col3=456');
    console.log('Test 5 (Map with condition):', testUpdate5.toString());

    const testUpdate6 = new SQLUpdateQuery('myTable', ['col1', new SQLColumn('col2')], ['\'val1\'', new SQLColumn('col3')]);
    console.log('Test 6 (SQLColumn):', testUpdate6.toString());

    const testUpdate7 = new SQLUpdateQuery('myTable', ['col1', 'col2'], ['\'val1\'', 123]);
    console.log('Test 7 (String with quotes):', testUpdate7.toString());

    const testUpdate8 = new SQLUpdateQuery('myTable', { col1: '\'val1\'', col2: 123 });
    console.log('Test 8 (Object with quotes):', testUpdate8.toString());

    const testUpdate9 = new SQLUpdateQuery('myTable', ['col1', 'col2'], ['"val1"', 123]);
    console.log('Test 9 (Array):', testUpdate9.toString());

    const testUpdate10 = new SQLUpdateQuery('myTable', ['col1', 'col2'], ['"val1"', 123], 'col3=\'Henk\'');
    console.log('Test 10 (Array with condition):', testUpdate10.toString());

} catch (error) {
    console.error('Test failed:', error);
}