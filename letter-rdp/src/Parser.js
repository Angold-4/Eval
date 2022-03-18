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
     * : StatementList
     * ;
     */
    Program() {
	return {
	    type: 'Program',
	    body: this.StatementList(),
	};
    }


    /**
     * StatementList
     * : Statement
     * | StatementList Statement
     * ;
     */
    StatementList(stopLookahead = null) {
	const statementlist = [this.Statement()];

	while (this._lookahead != null && this._lookahead.type !== stopLookahead) {
	    statementlist.push(this.Statement());
	}
	return statementlist;
    }

    /**
     * Statement
     * : ExpressionStatement
     * | BlockStatement
     * | EmptyStatement
     * ;
     */
    Statement() {
	switch (this._lookahead.type) {
	    case ';':
		return this.EmptyStatement();
	    case '{':
		return this.BlockStatement();
	    default:
		return this.ExpressionStatement();
	}
    }

    /**
     * EmptyStatement
     * : ';'
     * ;
     */
    EmptyStatement() {
	this._eat(';');
	return {
	    type: 'EmptyStatement',
	}
    }

    /**
     * BlockStatement
     * : '{' OptStatementList '}'
     * ;
     */
    BlockStatement() {
	this._eat('{');

	// OptStatementList
	const body = this._lookahead.type !== '}' ? this.StatementList('}') : [];
	
	this._eat('}');

	return {
	    type: 'BlockStatement',
	    body,
	};
    }

    /**
     * ExpressionStatement
     * : Expression ';'
     * ;
     */
    ExpressionStatement() {
	const expression = this.Expression();
	this._eat(';');
	return {
	    type: 'ExpressionStatement',
	    expression,
	};
    }

    /**
     * Expression
     * : Literal
     * ;
     */
    Expression() {
	return this.AssignmentExpression();
    }


    /**
     * AssignmentExpression
     * : AdditiveExpression
     * | LeftHandSideExpression AssignmentOperator AssignmentExpression
     * ;
     */
    AssignmentExpression() {
	const left = this.AdditiveExpression();

	if (!this._isAssignmentOperator(this._lookahead.type)) {
	    return left;
	}
	return {
	    type: 'AssignmentExpression',
	    operator: this.AssignmentOperator().value,
	    left: this._checkValidAssignmentTarget(left),
	    right: this.AssignmentExpression(),
	}
    }

    /**
     * Whether the token is an assignment operator
     */
    _isAssignmentOperator(tokenType) {
	return tokenType === 'SIMPLE_ASSIGN' || tokenType === 'COMPLEX_ASSIGN';
    }

    /**
     * Check whether it is a valid assignment target
     */
    _checkValidAssignmentTarget(node) {
	if (node.type === 'Identifier') {
	    return node;
	}
	throw new SyntaxError('Invalid left-hand side in assignemnt expression.')
    }


    /**
     * AssignmentOperator
     *	: SIMPLE_ASSIGN
     *	| COMPLEX_ASSIGN
     *	;
     */
    AssignmentOperator() {
	if (this._lookahead.type === 'SIMPLE_ASSIGN') {
	    return this._eat('SIMPLE_ASSIGN');
	} 
	return this._eat('COMPLEX_ASSIGN');
    }

    /**
     * LeftHandSideExpression
     *	: Identifier
     *	;
     */
    LeftHandSideExpression() {
	return this.Identifier();
    }

    /**
     * Identifier
     *	: IDENTIFIER
     *	;
     */
    Identifier() {
	const name = this._eat('IDENTIFIER').value;
	return {
	    type: 'Identifier',
	    name,
	};
    }


    /**
     * AdditiveExpression
     * : MultiplicativeExpression
     * | AdditiveExpression ADDITIVE_OPERATOR MultiplicativeExpression
     * ;
     */
    AdditiveExpression() {
	return this._BinaryExpression(
	    'MultiplicativeExpression',
	    'ADDITIVE_OPERATOR',
	)
    }

    /**
     * MultiplicatitiveExprssion
     * : PrimaryExpression
     * | MultiplicatitiveExprssion MULTIPLICATIVE_OPERATOR PrimaryExpression
     * ;
     *
     */
    MultiplicativeExpression() {
	return this._BinaryExpression(
	    'PrimaryExpression',
	    'MULTIPLICATIVE_OPERATOR',
	)
    }


    /**
     * Genric binary expression.
     */
    _BinaryExpression(builderName, operatorToken) {
	let left = this[builderName]();

	while (this._lookahead.type === operatorToken) {

	    const operator = this._eat(operatorToken).value;

	    const right = this[builderName]();

	    left = {
		type: 'BinaryExpression',
		operator,
		left,
		right,
	    };
	}

	return left;
    }

    /**
     * PrimaryExpression
     * : Literal
     * | ParentheizedExpression
     * | LeftHandSideExpression
     * ;
     */
    PrimaryExpression() {
	if (this._isLiteral(this._lookahead.type)) {
	    return this.Literal();
	}

	switch(this._lookahead.type) {
	    case '(':
		return this.ParentheizedExpression();
	    default:
		return this.LeftHandSideExpression();
	}
    }


    /**
     * Whether the token is a literal
     */
    _isLiteral(tokenType) {
	return tokenType === 'NUMBER' || tokenType === 'STRING';
    }


    /**
     * ParentheizedExpression
     * : '(' Expression ')'
     * ;
     */
    ParentheizedExpression() {
	this._eat('(');
	const expression = this.Expression();
	this._eat(')');
	return expression;
    }


    /**
     * Literal
     * : NumericLiteral
     * | StringLiteral
     * ;
     */
    Literal() {
	switch (this._lookahead.type) {
	    case 'NUMBER': return this.NumericLiteral();
	    case 'STRING': return this.StringLiteral();
	}
	throw new SyntaxError(`Literal: unexpected literal production`);
    }

    /**
     * StringLiteral
     * : STRING
     * ;
     */
    StringLiteral() {
	const token = this._eat(`STRING`);
	return {
	    type: 'StringLiteral',
	    value: token.value.slice(1, -1),
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
