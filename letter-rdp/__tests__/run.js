/**
 * Main test runner.
 */

const tests = [
    require('./literals-test.js'),
    require('./statement-list-test.js'),
    require('./block-test.js'),
    require('./empty-statement-test.js'),
    require('./math-test.js'),
];

const {Parser} = require('../src/Parser');

const assert = require('assert');

const parser = new Parser();

// For manual test
function exec() {
    const program = `

	/**
	 * Hello
	 */

	// World
	
	"Hello World!";

	23;
    `;

    const ast = parser.parse(program);
    console.log(JSON.stringify(ast, null, 2));
}


// Test function
function test(program, expected) {
    const ast = parser.parse(program);
    assert.deepEqual(ast, expected);
}

// exec();

// Run all tests
tests.forEach(testRun => testRun(test));

console.log('All assertions passed!');


