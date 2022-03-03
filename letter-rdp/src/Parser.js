/**
 * Letter Parser: recursive descent implementation
 */

const {Tokenizer} = require('./Tokenizer');

class Parser {
    /**
     * Parses a string into AST.
     */

    constructor() {
	this._string = '';
	this._tokenizer = new Tokenizer();
    }

    parse(string) {
	this._string = string;
	this._tokenizer.init(string);

	// Prime the tokenizer to obtain the first
	// token which is our lookahead. The lookahead is 
	// used for preictive parsing

	this._lookahead = this._tokenizer.getNextToken();

	// Parse recursively starting from the main
	// entry point, the Program:

	return this.Program();
    }

    /**
     * Main entry point
     *
     * Program
     * : NumericLiteral
     * ;
     */
    Program() {
	return {
	    type: 'Program',
	    body: this.NumericLiteral(),
	};
    }

    /**
     * NumericLiteral
     * : NUMBER
     * ;
     */
    NumericLiteral() {
	const token = this._eat('NUMBER');
	return {
	    type: 'NumericLiteral',
	    value: Number(token.value),
	}
    }


    /**
     * Expects a token of a given type
     */
    _eat(tokenType) {
	const token = this._lookahead;


	if (token == null) {
	    throw new SyntaxError(
		`Unexpected end of input, expected: "${tokenType}"`,
	    );
	}

	if (token.type !== tokenType) {
	    throw new SyntaxError (
		`Unexpected token: "${token.value}", expected: "${tokenType}"`,
	    );
	}

	// Advance to next token.
	this._lookahead = this._tokenizer.getNextToken();
	return token;

    }

}

module.exports = {
    Parser,
};
