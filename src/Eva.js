/********************************************************************/
/*                                                                   */
/*   The Eva Language Interpreter                                    */
/*                                                                   */
/*   Based on Dimtry's "Essentials of Interpretation Class           */
/*   http://dmitrysoshnikov.com/courses/essentials-of-interpretation */
/*                                                                   */
/*   Jiawei Wang (Angold-4) Nov 2021                                 */ 
/*                                                                   */
/*********************************************************************/

const assert = require('assert');
const Environment = require('./Environment');

class Eva {
    /*
     * Creates an Eva instance with the global environment
     */
    constructor(global = new Environment()) {
	this.global = global;
    }


    /*
     * Evaluates an expression in the given environment
     */
    eval(exp, env = this.global) {
	// ------------------------------------------------------------
	// Self-evaluation expressions:
	if (isNumber(exp)) {
	    return exp;
	}

	if (isString(exp)) {
	    return exp.slice(1, -1);
	}

	// ------------------------------------------------------------
	// Math operations
	if (exp[0] === '+') {
	    return this.eval(exp[1], env) + this.eval(exp[2], env);
	}

	if (exp[0] === '*') {
	    return this.eval(exp[1], env) * this.eval(exp[2], env);
	}

	// ------------------------------------------------------------
	// Block: sequence of expressions:
	if (exp[0] === 'begin') {
	    const blockEnv = new Environment({}, env);
	    return this._evalBlock(exp, blockEnv);
	}

	// ------------------------------------------------------------
	// Variable declaration:
	if (exp[0] === 'var') {
	    const [_, name, value] = exp;
	    return env.define(name, this.eval(value, env));
	}

	// ------------------------------------------------------------
	// Variable access:
	if (exp[0] === 'set') {
	    const [_, name, value] = exp;
	    return env.assign(name, this.eval(value, env));

	}

	// ------------------------------------------------------------
	// Variable access:
	if (isVariableName(exp)) {
	    return env.lookup(exp);
	}
	
	
	throw 'Unimplemented: ${JSON.stringify(exp)}';
    }

_evalBlock (block, env) {
    let result;

    const [_, ...expressions] = block;

    expressions.forEach(exp => {
	// executing sequentially
	result = this.eval(exp, env);
    });

    return result;
}
}

function isNumber(exp) {
    return typeof exp === 'number';
}

function isString(exp) {
    return typeof exp == 'string' && exp[0] === '"' && exp.slice(-1) === '"';
}

function isVariableName(exp) {
    return typeof exp === 'string' && /^[a-zA-Z][a-zA-Z0-9_]*$/.test(exp);
}

module.exports = Eva;
