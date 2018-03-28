const antlr4 = require('antlr4');
const ECMAScriptLexer = require('./lib/ECMAScriptLexer.js');
const ECMAScriptParser = require('./lib/ECMAScriptParser.js');
const PythonGenerator = require('./codegeneration/PythonGenerator.js');
const ErrorListener = require('./codegeneration/ErrorListener.js');

const input = '{x: new Number(1)}';

const chars = new antlr4.InputStream(input);
const lexer = new ECMAScriptLexer.ECMAScriptLexer(chars);

lexer.strictMode = false; // do not use js strictMode

const tokens = new antlr4.CommonTokenStream(lexer);
const parser = new ECMAScriptParser.ECMAScriptParser(tokens);
const listener = new ErrorListener();

// Do this after creating the parser and before running it
parser.removeErrorListeners(); // Remove default ConsoleErrorListener
parser.addErrorListener(listener); // Add custom error listener

const tree = parser.expressionSequence();

if (listener.hasErrors() === true) {
  console.log(listener.errors);
}

console.log('JavaScript input:');
console.log(input);

const output = new PythonGenerator().start(tree);

console.log('Python output:');
console.log(output);

// console.log(tree.toStringTree(parser.ruleNames));
