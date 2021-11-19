const assert = require('assert');
const {test} = require('./test-util');

// also test both `++`` and `+=`
module.exports = eva => {
    test(eva,
    `
	(begin
	    (var x 10)
	    (++ x)
	    x
	)
    `,
    11);
};

