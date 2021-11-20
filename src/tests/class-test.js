const assert = require('assert');
const {test} = require('./test-util');

// Class is a named environment which can be instantiated and create objects
// From the implementation perspective classes and instances and nothing but 
// in other environments
module.exports = eva => {
    test(eva,
    `
    (class Point null
	(begin
	    (def constructor (this x y)
		(begin
		    (set (prop this x) x)
		    (set (prop this y) y)
		)
	    )

	    (def calc (this)
		(+ (prop this x) (prop this y))
	    )
	)
    )

    (var p (new Point 10 20))
	(class Point3D Point
	  (begin
	    (def constructor (this x y z)
	      (begin
		((prop (super Point3D) constructor) this x y)
		(set (prop this z) z)))
	    (def calc (this)
	      (+ ((prop (super Point3D) calc) this)
		 (prop this z)))))
	(var p (new Point3D 10 20 30))
	((prop p calc) p)
      `,
    60);
};

