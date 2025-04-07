

class AstVisitor {

    constructor(){
    }

    defaultAction(stmt){}

    visitFunctionDeclaration(functionDeclaration){
        let statements = functionDeclaration.body;
        for(let stmt of statements){
            stmt.accept(this)
        }
    }

    visitArrayExpression(stmt){
        this.visitBlockStatement(stmt.elements)
    }

    visitBlockStatement(block){
        for(let stmt of block){
            stmt.accept(this)
        }
    }

    visitUpdateExpression(stmt){
    }

    visitForStatement(stmt){
        stmt.init.accept(this)
        this.visitLoopStatement(stmt)
    }

    visitLoopStatement(stmt){
        stmt.condition.accept(this)
        this.visitBlockStatement(this)
    }
    
    visitExpressionStatement(stmt){
    }

    visitLogicalExpression(stmt){
        stmt.left.accept(this)
        stmt.right.accept(this)
    }

    visitConditionalStatement(stmt) {
        stmt.condition.accept(this)
        this.visitBlockStatement(stmt.then)
        if (stmt.alternates){
            if (stmt.alternates instanceof ConditionalStatement) {
                this.visitConditionalStatement(stmt.alternates)
            } else {
                this.visitBlockStatement(stmt.alternates)
            }
        }  
    }

    visitFunctionCall(stmt){
        for(let arg of stmt.args){
            arg.accept(this)
        }
    }

    visitAssignmentStatement(stmt){
        stmt.left.accept(this)
        stmt.right.accept(this)
    }

    visitVariableDeclaration(stmt){
        // FIXME: handle names
        stmt.value.accept(this)
    }

    visitBinaryExpression(stmt){
        stmt.left.accept(this)
        stmt.right.accept(this)
    }

    visitUnaryExpression(stmt){
        stmt.argument.accept(this)
    }

    visitReturnStatement(stmt){
        stmt.value.accept(this)
    }

    visitBreakStatement(stmt){}

    visitMemberExpression(stmt){
        stmt.object.accept(this)
        stmt.property.accept(this)
    }

}
module.exports = AstVisitor;