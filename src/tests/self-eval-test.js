const assert = require('assert');


// Self-evaluation expressions:
module.exports = eva => {
    assert.strictEqual(eva.eval(1), 1);
    assert.strictEqual(eva.eval('"string"'), 'string');
};

