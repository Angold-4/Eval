const assert = require('assert');
const evaParser = require('../parser/evaParser');

function test(eva, code, expected) {
    const exp = evaParser.parse(`(begin ${code})`); // add a 'begin' 
    assert.strictEqual(eva.evalGlobal(exp), expected);
}

module.exports = {
    test,
};
