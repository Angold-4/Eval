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
const evaParser = require('./parser/evaParser');

class Eva {
    /*
     * Creates an Eva instance with the global environment
     */
    constructor(global = GlobalEnvironment) {
	this.global = global;
    }


    /*
     * Evaluates an expression in the given environment
     */
    eval(exp, env = this.global) {
	// ------------------------------------------------------------
	// Self-evaluation expressions:
	if (this._isNumber(exp)) {
	    return exp;
	}

	if (this._isString(exp)) {
	    return exp.slice(1, -1);
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
	    return env.define(name, this.eval(value, env)); // return the value
	}

	// ------------------------------------------------------------
	// Variable update:
	if (exp[0] === 'set') {
	    const [_, name, value] = exp;
	    return env.assign(name, this.eval(value, env));

	}

	// ------------------------------------------------------------
	// Variable access:
	if (this._isVariableName(exp)) {
	    return env.lookup(exp);
	}

	// ------------------------------------------------------------
	// If expressions:
	if (exp[0] === 'if') {
	    const [_, condition, consequent, alternate] = exp;
	    if (this.eval(condition, env)) {
		return this.eval(consequent, env);
	    }
	    return this.eval(alternate, env);
	}

	// ------------------------------------------------------------
	// While expressions:
	if (exp[0] === 'while') {
	    const [_, condition, body] = exp;
	    let result;
	    while(this.eval(condition, env)) {
		result = this.eval(body, env);
	    }
	    return result;
	}


	// ------------------------------------------------------------
	// Function declaration: (def square (x) (* x x))
	//
	// Syntactic sugar for : (var square (lambda (x) (* x x)))
	if (exp[0] === 'def') {
	    const [_, name, params, body] = exp;


	    /*
	    const fn = {
		params,
		body,
		env,
	    };
	    */

	    // return env.define(name, fn); // this.record[name] = fn
	    // also return fn {params, body, env}
	    // Closure -> a function which captures its definition environment
	    
	    // JIT-transpile to a variable declaration
	    
	    const varExp = ['var', name, ['lambda', params, body]];
	    return this.eval(varExp, env);
	}

	// ------------------------------------------------------------
	// Lambda function: (lambda (x) (* x x)) just a function without a name
	if (exp[0] === 'lambda') {
	    const [_, params, body] = exp;

	    return {
		params,
		body,
		env,
	    };
	}
	

	// ------------------------------------------------------------
	// Function calls:
	if (Array.isArray(exp)) { // lambda will execute this first
	    const fn = this.eval(exp[0], env); // return a user-define fn

	    const args = exp.slice(1).map(arg => this.eval(arg, env));  // 2

	    // 1. Native function:
	    if (typeof fn === 'function') {
	        return fn(...args);
	    }

	    // 2. User-defined function:
	    const activationRecord = {}; // actual storage for the local variables and for the parameters

	    fn.params.forEach((param, index) => { 
		activationRecord[param] = args[index]; // x = 2
	    });

	    const activationEnv = new Environment(
		activationRecord,
		fn.env,
	    );

	    return this._evalBody(fn.body, activationEnv); // (x * x)
	}

	throw `Unimplemented: ${JSON.stringify(exp)}`;
    }

    _evalBody(body, env) {
	if (body[0] === 'begin') {
	    return this._evalBlock(body, env);
	}
	return this.eval(body, env); // just return simple expression
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
    _isNumber(exp) {
	return typeof exp === 'number';
    }

    _isString(exp) {
	return typeof exp == 'string' && exp[0] === '"' && exp.slice(-1) === '"';
    }

    _isVariableName(exp) {
	return typeof exp === 'string' && /^[+\-*/<>=a-zA-Z0-9_]*$/.test(exp);
    }

}

/*
 * Default Global Environment
 */

const GlobalEnvironment = new Environment({
    null: null,
    true: true,
    false: false,

    VERSION: '0.1',

    // Built-in functions
    // Operators:
    '+'(op1, op2) {
	return op1 + op2;
    },


    '*'(op1, op2) {
	return op1 * op2;
    },

    '-'(op1, op2 = null) {
	if (op2 == null) {
	    return -op1;
	}
	return op1 - op2;
    },

    '/'(op1, op2) {
	return op1 / op2;
    },

    // Comparision:
    '>'(op1, op2) {
	return op1 > op2;
    },
    '<'(op1, op2) {
	return op1 < op2;
    },
    '>='(op1, op2) {
	return op1 >= op2;
    },
    '<='(op1, op2) {
	return op1 <= op2;
    },
    '='(op1, op2) {
	return op1 === op2;
    },

    // Console output:
    print(...args) {
	console.log(...args);
    },
});


module.exports = Eva;
