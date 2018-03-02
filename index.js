const path = require('path');
const Transformer = require('./transformer');

const ECMAScriptLexer = require(path.resolve('lib', 'ECMAScriptLexer'));
const ECMAScriptParser = require(path.resolve('lib', 'ECMAScriptParser'));
const ECMAScriptListener = require(path.resolve('lib', 'ECMAScriptListener'));
const ECMAScriptVisitor = require(path.resolve('lib', 'ECMAScriptVisitor'));

const CSharpLexer = require(path.resolve('lib', 'CSharpLexer'));
const CSharpParser = require(path.resolve('lib', 'CSharpParser'));

const jsInput = `{ $text: { $search: "java coffee shop" } }`;

console.log(jsInput);

/*
const jsInput = `{
	var x = 4;
	
	db.bios.findOne({$test: 1});
	db.bios.findTwo([1, 2, 3]);
}`;
*/

const jsTransformer = new Transformer(jsInput, {
	lexer: ECMAScriptLexer.ECMAScriptLexer,
	parser: ECMAScriptParser.ECMAScriptParser,
	listener: ECMAScriptListener.ECMAScriptListener,
	visitor: ECMAScriptVisitor.ECMAScriptVisitor
});

const jsTree = jsTransformer.getTree();
const jsAST = jsTransformer.getAST();

// console.log('///////// JS TREE /////////\n');

jsTransformer.walk();
const output = jsTransformer.getListenerOutput()

// jsTransformer.visit();
// const output = jsTransformer.getVisitorOutput()

console.log(output);

/*
console.log('\n');
console.log(jsTree);
console.log('\nOR\n');
console.log(jsAST);
*/

/*
const csInput = `
	public class Car {
		int speedIncrease = 10;
	}
`;

const csTransformer = new Transformer(csInput, {
	lexer: CSharpLexer.CSharpLexer,
	parser: CSharpParser.CSharpParser
});

const csTree = csTransformer.getTree();
const csAST = csTransformer.getAST();

console.log('\n');
console.log('///////// CSHARP TREE /////////\n');
console.log(csTree);
console.log('\nOR\n');
console.log(csAST);
*/
