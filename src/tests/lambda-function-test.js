const assert = require('assert');
const {test} = require('./test-util');

// lambda -> a function just do not have a name
// Understand and review this file ! 11.18 2021
module.exports = eva => {
    test(eva, 
    `
	(begin
	    (def onClick (callback)
		(begin
		    (var x 10)
		    (var y 20)
		    (callback (+ x y))
		)
	    )

	    (onClick (lambda (data) (* data 10)))
	)
    `,
    300);

    test(eva, 
    `
	((lambda (x) (* x x)) 2)
    `,
    4);

    test(eva, 
    `
	(begin
	    (var square (lambda (x) (* x x)))
	    (square 2)
	)
    `,
    4);

};

