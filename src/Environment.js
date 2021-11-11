/********************************************************************/
/*                                                                   */
/*   The Eva Language Interpreter                                    */
/*   Environment: names storage
/*                                                                   */
/*   Based on Dimtry's "Essentials of Interpretation Class           */
/*   http://dmitrysoshnikov.com/courses/essentials-of-interpretation */
/*                                                                   */
/*   Jiawei Wang (Angold-4) Nov 2021                                 */ 
/*                                                                   */
/*********************************************************************/

class Environment {
    // Creates an environment with the given record
    constructor(record = {}, parent = null) {
	this.record = record;
	this.parent = parent;
    }

    // Creates a variable with the given name and value
    define(name, value) {
	this.record[name] = value;
	return value;
    }

    // Updates an existing variable.
    assign(name, value) {
	// no bug, since it will only affects the nearest out-scope name
	this.resolve(name).record[name] = value;
	return value;
    }

    // Returns the value of a defined varible, or throw error
    lookup(name) {
	return this.resolve(name).record[name];
    }

    // Returns specific environment in which a variable is defined, operations
    // or throws if a variable is not defined
    resolve(name) {
	if (this.record.hasOwnProperty(name)) {
	    return this;
	}

	if (this.parent == null) {
	    throw new ReferenceError(`Variable "${name}" is not defined.`);
	}

	return this.parent.resolve(name); // iteration
    }


}


module.exports = Environment;
