/*********************************************************************/
/*                                                                   */
/*   The Eva Language Interpreter                                    */
/*                                                                   */
/*   Based on Dimtry's "Essentials of Interpretation Class           */
/*   http://dmitrysoshnikov.com/courses/essentials-of-interpretation */
/*                                                                   */
/*   Jiawei Wang (Angold-4) Nov 2021                                 */ 
/*                                                                   */
/*********************************************************************/


// Runtime semantics should be preserved

const Environment = require('./Environment');
const Transformer = require('./transform/Transformer');
const evaParser = require('./parser/evaParser');

const fs = require('fs'); // file system (Node lib)

class Eva {
    /*
     * Creates an Eva instance with the global environment
     */
    constructor(global = GlobalEnvironment) {
	this.global = global;
	this._transformer = new Transformer();
    }

    /*
     * Evaluates global code wrapping into a block
     */
    evalGlobal(exp) {
	return this._evalBody(exp, this.global,); // just a _ ('block')
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
	    const [_, ref, value] = exp;
	    // Assignment to a property
	    // instance is also an environment
	    if (ref[0] === 'prop') {
		const [_, instance, propName] = ref;
		// instance is 'this'
		const instanceEnv = this.eval(instance, env);

		return instanceEnv.define(
		    propName,
		    this.eval(value, env),
		);
	    }
	    return env.assign(ref, this.eval(value, env));
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
	// Switch expressions:
	//
	// Syntactic sugar for if expression
	if (exp[0] === 'switch') {
	    const ifExp = this._transformer.transformSwitchToIf(exp);
	    return this.eval(ifExp, env);
	}
	
	// ------------------------------------------------------------
	// While expressions:
	if (exp[0] === 'while') {
	    const [_, condition, body] = exp;
	    let result;
	    while (this.eval(condition, env)) {
		result = this.eval(body, env);
	    }
	    return result;
	}

	// ------------------------------------------------------------
	// For expressions:
	//
	// Syntactic sugar for while expression (with init)
	if (exp[0] === 'for') {

	    const whileExp = this._transformer.transformWhileToFor(exp);

	    return this.eval(whileExp, env);
	}

	// ------------------------------------------------------------
	// Inc Dec IncVal DecVal:
	if (exp[0] === '++') {
	    const incExp = this._transformer.transformIncToSet(exp);
	    return this.eval(incExp, env);
	}

	if (exp[0] === '--') {
	    const decExp = this._transformer.transformDecToSet(exp);
	    return this.eval(decExp, env);
	}
	if (exp[0] === '+=') {
	    const incValExp = this._transformer.transformIncValToSet(exp);
	    return this.eval(incValExp, env);
	}

	if (exp[0] === '-=') {
	    const decValExp = this._transformer.transformDecValToSet(exp);
	    return this.eval(decValExp, env);
	}

	// ------------------------------------------------------------
	// Function declaration: (def square (x) (* x x))
	//
	// Syntactic sugar for : (var square (lambda (x) (* x x)))
	if (exp[0] === 'def') {
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
	    const varExp = this._transformer.transformDefToVarLambda(exp);
	    
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
	// Class declaration: (class <Name> <Parent> <Body>)
	// Class is a named environment which can be instantiated and create objects
	// From the implementation perspective classes and instances and nothing but 
	// in other environments
	
	if (exp[0] === 'class') {
	    const [_, name, parent, body] = exp;

	    // A class is an environment! -- a storage of methods,
	    // and shared properties:

	    const parentEnv = this.eval(parent, env) || env; // if parent is nulll, then return env

	    const classEnv = new Environment({}, parentEnv); // class is just a environment

	    this._evalBody(body, classEnv); // class is just an environment

	    return env.define(name, classEnv);
	}

	// ------------------------------------------------------------
	// Super expressions (super <ClassName>)
	
	if (exp[0] === 'super') {
	    const [_, className] = exp;
	    return this.eval(className, env).parent;
	}

	// ------------------------------------------------------------
	// Class instantiation: (new <Class> <Arguments>... )
	
	if (exp[0] === 'new') {

	    const classEnv = this.eval(exp[1], env); // class environment
	    // An instance of a class is an environment!

	    const instanceEnv = new Environment({}, classEnv); // this is created at here

	    const args = exp.slice(2).map(arg => this.eval(arg, env)); // 10 20 

	    this._callUserDefinedFunction(classEnv.lookup('constructor'),
		[instanceEnv, ...args],); // instanceEnv is 'this' // then assign to this

	    return instanceEnv;
	}
	
	// ------------------------------------------------------------
	// Property access: (prop <instance> <name>)

	if (exp[0] === 'prop') {
	    const [_, instance, name] = exp; // instanceEnv = this

	    const instanceEnv = this.eval(instance, env); // class is a Env
	    return instanceEnv.lookup(name); // value
	}

	// ------------------------------------------------------------
	// Property access: (prop <instance> <name>)
	
	if (exp[0] === 'module') {
	    const [_, name, body] = exp;

	    const moduleEnv = new Environment({}, env);
	    this._evalBody(body, moduleEnv);

	    return env.define(name, moduleEnv);
	}

	// ------------------------------------------------------------
	// Module import:
	
	if (exp[0] === 'import') {
	    const [_, name] = exp;
	    const moduleSrc = fs.readFileSync(
		`${__dirname}/module/${name}.eva`,
		'utf8',
	    );

	    const body = evaParser.parse(`(begin ${moduleSrc})`);
	    const moduleExp = ['module', name, body];

	    return this.eval(moduleExp, this.global);
	}

	// TODO:
	// Implement named imports: (import (abs, square) Math)
        // Implement module exports: (exports (abs, square))

	// ------------------------------------------------------------
	// Function calls:
	
	if (Array.isArray(exp)) { // lambda will execute this first
	    const fn = this.eval(exp[0], env); // return a user-define fn
	    // ((lambda (x) (* x x)) 2)

	    const args = exp.slice(1).map(arg => this.eval(arg, env));  // 2

	    // 1. Native function:
	    if (typeof fn === 'function') {
	        return fn(...args);
	    }

	    // 2. User-defined function:
	    return this._callUserDefinedFunction(fn, args);
	}

	throw `Unimplemented: ${JSON.stringify(exp)}`;
    }

    _callUserDefinedFunction(fn, args) {
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
