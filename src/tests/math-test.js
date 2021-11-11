const assert = require('assert');

module.exports = eva => {
    // Math operations:
    assert.strictEqual(eva.eval(['+', 1, 5]), 6);
    assert.strictEqual(eva.eval(['+', ['+', 3, 2], 5]), 10);
    assert.strictEqual(eva.eval(['+', ['*', 3, 2], 5]), 11);
} 


