'use strict'

const antlr4 = require('antlr4');
const ECMAScriptLexer = require('./ECMAScriptLexer.js');
const ECMAScriptParser = require('./ECMAScriptParser.js');
const ECMAScriptListener = require('./ECMAScriptListener.js');

const input = `{
	db.bios.findOne({$test: 1});
	db.bios.findTwo([1, 2, 3]);
}`

const chars = new antlr4.InputStream(input);
const lexer = new ECMAScriptLexer.ECMAScriptLexer(chars);
const tokens  = new antlr4.CommonTokenStream(lexer);
const parser = new ECMAScriptParser.ECMAScriptParser(tokens);

parser.buildParseTrees = true;

const tree = parser.program();

function CustomListener() {
    ECMAScriptListener.ECMAScriptListener.call(this);
};

CustomListener.prototype = ECMAScriptListener.ECMAScriptListener.prototype
CustomListener.prototype.constructor = CustomListener

CustomListener.prototype.enterExpressionStatement = (ctx) => {
	console.log(`---> enterExpressionStatement: ${ctx.getText()}`);
};

CustomListener.prototype.enterEveryRule = (ctx) => {
	console.log(`enter ${parser.ruleNames[ctx.ruleIndex]}: ${ctx.getText()}`);
};

const listener = new CustomListener();

// antlr4.tree.ParseTreeWalker.DEFAULT.walk(listener, tree);

const buildAST = (tree, ruleNames) => {
	ruleNames = ruleNames || null;

	let s = antlr4.tree.Trees.getNodeText(tree, ruleNames);
	
	s = antlr4.Utils.escapeWhitespace(s, false);
	
	const c = tree.getChildCount();
	
    if (c===0) {
        return s;
	}
	
	let res = {type: s};

    if(c>0) {
		s = buildAST(tree.getChild(0), ruleNames);
        res.arguments = [...(res.arguments || []), s];
    }
    for (let i=1;i<c;i++) {
		s = buildAST(tree.getChild(i), ruleNames);
		res.arguments = [...(res.arguments || []), s];
    }

    return res;
};

console.log(JSON.stringify(buildAST(tree, parser.ruleNames)));
