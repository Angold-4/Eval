module.exports = test => {
    `
    "Hello World!";

    23;
    `
    ,
    {
      "type": "Program",
      "body": [
	{
	  "type": "ExpressionStatement",
	  "expression": {
	    "type": "StringLiteral",
	    "value": "Hello World!"
	  }
	},
	{
	  "type": "ExpressionStatement",
	  "expression": {
	    "type": "NumericLiteral",
	    "value": 23
	  }
	}
      ]
    }


}






