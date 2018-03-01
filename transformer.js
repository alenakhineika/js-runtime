const antlr4 = require('antlr4');

const buildAST = (tree, ruleNames) => {
	ruleNames = ruleNames || null;

	let s = antlr4.tree.Trees.getNodeText(tree, ruleNames);
	
	const c = tree.getChildCount();
	
	if (c === 0) {
		return s;
	}
	
	let res = {type: s};

	if (c > 0) {
		s = buildAST(tree.getChild(0), ruleNames);

		if (typeof s !== 'object') {
			res.value = s;
		} else {
			res.arguments = [...(res.arguments || []), s];
		}
	}
	
	for (let i=1; i<c; i++) {
		s = buildAST(tree.getChild(i), ruleNames);
		res.arguments = [...(res.arguments || []), s];
	}

	return res;
};

const createCustomListener = (listener, parser) => {
	function CustomListener() {
		listener.call(this);
	};

	CustomListener.prototype = listener.prototype;
	CustomListener.prototype.constructor = CustomListener;

	CustomListener.prototype.enterExpressionStatement = (ctx) => {
		console.log(`---> enterExpressionStatement: ${ctx.getText()}`);
	};

	CustomListener.prototype.enterEveryRule = (ctx) => {
		console.log(`enter ${parser.ruleNames[ctx.ruleIndex]}: ${ctx.getText()}`);
	};

	return new CustomListener();
}

const ECMAScriptTransformer = function (input, source) {
	if (typeof source.lexer === 'undefined' || typeof source.parser === 'undefined') {
		return new Error('No lexer or parser');
	}

	const chars = new antlr4.InputStream(input);
	const lexer = new source.lexer(chars);
	const tokens  = new antlr4.CommonTokenStream(lexer);
	const parser = new source.parser(tokens);

	parser.buildParseTrees = true;

	const tree = parser[parser.ruleNames[0]]()

	if (typeof source.listener !== 'undefined') {
		const listener = createCustomListener(source.listener, parser);

		this.listener = listener;
	}
	
	this.input = input;
	this.parser = parser;
	this.tree = tree;
}

ECMAScriptTransformer.prototype.getTree = function () {
	return this.tree.toStringTree(this.parser.ruleNames);
};

ECMAScriptTransformer.prototype.getAST = function () {
	return JSON.stringify(buildAST(this.tree, this.parser.ruleNames), null, 2);
};

ECMAScriptTransformer.prototype.walk = function () {
	antlr4.tree.ParseTreeWalker.DEFAULT.walk(this.listener, this.tree);
};

module.exports = ECMAScriptTransformer;
