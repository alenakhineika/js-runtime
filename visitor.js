const ECMAScriptVisitor = require('./lib/ECMAScriptVisitor').ECMAScriptVisitor;

function Visitor () {
  ECMAScriptVisitor.call(this);
  return this;
}

Visitor.prototype = Object.create(ECMAScriptVisitor.prototype);
Visitor.prototype.constructor = Visitor;

Visitor.prototype.visitProgram = function(ctx) {
  console.log('start visitor');
  return this.visitChildren(ctx);
};

Visitor.prototype.visitLiteral = function(ctx) {
  console.log('literal: ' + ctx.getText());
  return this.visitChildren(ctx);
}

module.exports = Visitor;