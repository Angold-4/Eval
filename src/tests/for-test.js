const assert = require('assert');
const {test} = require('./test-util');

// also test both `++`` and `+=`
module.exports = eva => {
    test(eva,
    `
	(var result 0)
	(for (var x 0) (< x 10) (++ x)
	    (+= result 2)
	)
	result
    `,
    20);
};
