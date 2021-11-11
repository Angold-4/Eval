const assert = require('assert');

module.exports = eva => {
    // Variable declaration:
    assert.strictEqual(eva.eval(['var', 'x', 10]), 10);
    assert.strictEqual(eva.eval(['var', 'y', 100]), 100);
    assert.strictEqual(eva.eval(['var', 't', 'true']), true);

    // Variable access:
    assert.strictEqual(eva.eval('x'), 10);
    assert.strictEqual(eva.eval('y'), 100);
    assert.strictEqual(eva.eval('VERSION'), '0.1');
    assert.strictEqual(eva.eval('t'), true);
} 


