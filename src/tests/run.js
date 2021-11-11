const Eva = require('../Eva');
const Environment = require('../Environment');

const tests = [
    require('./self-eval-test.js'),
    require('./math-test.js'),
    require('./variables-test.js'),
    require('./block-test.js'),
    require('./if-test.js'),
    require('./while-test.js'),
];

// ---------------------------------------------------------------------
// Tests:
const eva = new Eva(new Environment({
    // Build-in variables
    null: null,
    true: true,
    false: false,

    VERSION: '0.1',
}));

tests.forEach(test => test(eva)); // forEach syntax: treat each element as test then run its export
// module.exports = name -> (name) then excute the statements inside the {}
console.log('All assertions passed!');
