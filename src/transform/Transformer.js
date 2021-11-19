/**
 * AST Transformer
 */

class Transformer {

    /**
     * Translates `def`-expression (function declaration)
     * into a variable declaration with a lambda expression.
     */

    transformDefToVarLambda(defExp) {
	const [_, name, params, body] = defExp;
	return ['var', name, ['lambda', params, body]];
    }

    /**
     * Transforms `switch` to nested `if`-expressions
     */

    transformSwitchToIf(switchExp) {
	const [_, ...cases] = switchExp; 

	const ifExp = ['if', null, null, null]; // for building the if expressions
	// nested if loops

	let current = ifExp; // current is a reference

	for (let i = 0; i < cases.length-1; i++) {
	    const [currentCond, currentBlock] = cases[i];

	    current[1] = currentCond;
	    current[2] = currentBlock;

	    const next = cases[i+1]; // next cases
	    const [nextCond, nextBlock] = next;

	    current[3] = nextCond === 'else' ? nextBlock : ['if'];

	    current = current[3]; // recursive
	}

	// console.log(ifExp); // │[ 'if', [ '=', 'x', 10 ], 100, [ 'if', [ '>', 'x', 10 ], 200, 300 ] ]  
	return ifExp;
    }

    /**
     * Transforms `for` to `while`-expressions with just a init
     */

    transformWhileToFor(forExp) {
	const [_, init, condition, modifier, exp] = forExp;

	const body = ['begin', modifier, exp];

	const whileExp = ['begin', init, ['while', condition, body]]; // build the for loop

	return whileExp;
    }

    /**
     * Transforms `++ foo` to (set foo (+ foo 1))
     */

    transformIncToSet(incExp) {
	const [_, exp] = incExp;
	return ['set', exp, ['+', exp, 1]];
    }

    /**
     * Transforms `-- foo` to (set foo (- foo 1))
     */

    transformDecToSet(decExp) {
	const [_, exp] = decExp;
	return ['set', exp, ['-', exp, 1]];
    }

    /**
     * Transforms `+= foo val` to (set foo (+ foo val))
     */

    transformIncValToSet(incExp) {
	const [_, exp, val] = incExp;
	return ['set', exp, ['+', exp, val]];
    }

    /**
     * Transforms `-= foo val` to (set foo (- foo val))
     */

    transformDecValToSet(decExp) {
	const [_, exp, val] = decExp;
	return ['set', exp, ['-', exp, val]];
    }
};




module.exports = Transformer;
