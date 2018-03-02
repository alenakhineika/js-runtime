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
		this.output = '';
		listener.call(this);
	};

	CustomListener.prototype = listener.prototype;
	CustomListener.prototype.constructor = CustomListener;

	CustomListener.prototype.enterExpressionStatement = (ctx) => {
		// console.log(`---> enterExpressionStatement: ${ctx.getText()}`);
	};

	CustomListener.prototype.enterBlock = function (ctx) {
		this.output += 'new BsonDocument {';
	};

	CustomListener.prototype.exitBlock = function (ctx) {
		this.output += '}';
	};

	CustomListener.prototype.enterLabelledStatement = function(ctx) {
		var statement = ctx.getText().split(':')

		this.output += `"${statement[0]}": `;
	};

	// Enter a parse tree produced by ECMAScriptParser#literal.
	CustomListener.prototype.enterLiteral = function(ctx) {
		this.output += ctx.getText()
	};

	CustomListener.prototype.enterEveryRule = (ctx) => {
		// console.log(`enter ${parser.ruleNames[ctx.ruleIndex]}: ${ctx.getText()}`);
	};

	return new CustomListener();
}

const createCustomVisitor = (visitor, parser) => {
	function CustomVisitor() {
		this.output = '';
		visitor.call(this);
	};

	CustomVisitor.prototype = visitor.prototype;
	CustomVisitor.prototype.constructor = CustomVisitor;

	CustomVisitor.prototype.visitProgram = function(ctx) {
		// console.log('start visitor');
		return this.visitChildren(ctx);
	};

	CustomVisitor.prototype.visitBlock = function(ctx) {
		this.output += '{';
		return this.visitChildren(ctx);
	};
	  
	CustomVisitor.prototype.visitLiteral = function(ctx) {
		// console.log('literal: ' + ctx.getText());
		this.output += ctx.getText()

		return this.visitChildren(ctx);
	}

	return new CustomVisitor();
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

	if (typeof source.visitor !== 'undefined') {
		const visitor = createCustomVisitor(source.visitor, parser);

		this.visitor = visitor;
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

ECMAScriptTransformer.prototype.visit = function () {
	this.visitor.visitProgram(this.tree)
	return this.output;
};

ECMAScriptTransformer.prototype.getVisitorOutput = function () {
	return this.visitor.output;
};

ECMAScriptTransformer.prototype.getListenerOutput = function () {
	return this.listener.output;
};

module.exports = ECMAScriptTransformer;
