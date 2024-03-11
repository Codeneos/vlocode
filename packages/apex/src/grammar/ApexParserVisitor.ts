// Generated from ./grammar/ApexParser.g4 by ANTLR 4.13.1

import { AbstractParseTreeVisitor } from "antlr4ng";


import { TriggerUnitContext } from "./ApexParser.js";
import { TriggerUnit2Context } from "./ApexParser.js";
import { TriggerCaseContext } from "./ApexParser.js";
import { TriggerBlockContext } from "./ApexParser.js";
import { TriggerBlockMemberContext } from "./ApexParser.js";
import { CompilationUnitContext } from "./ApexParser.js";
import { TypeDeclarationContext } from "./ApexParser.js";
import { ClassDeclarationContext } from "./ApexParser.js";
import { EnumDeclarationContext } from "./ApexParser.js";
import { EnumConstantsContext } from "./ApexParser.js";
import { InterfaceDeclarationContext } from "./ApexParser.js";
import { TypeListContext } from "./ApexParser.js";
import { ClassBodyContext } from "./ApexParser.js";
import { InterfaceBodyContext } from "./ApexParser.js";
import { ClassBodyDeclarationContext } from "./ApexParser.js";
import { ModifierContext } from "./ApexParser.js";
import { MemberDeclarationContext } from "./ApexParser.js";
import { TriggerMemberDeclarationContext } from "./ApexParser.js";
import { MethodDeclarationContext } from "./ApexParser.js";
import { ConstructorDeclarationContext } from "./ApexParser.js";
import { FieldDeclarationContext } from "./ApexParser.js";
import { PropertyDeclarationContext } from "./ApexParser.js";
import { InterfaceMethodDeclarationContext } from "./ApexParser.js";
import { VariableDeclaratorsContext } from "./ApexParser.js";
import { VariableDeclaratorContext } from "./ApexParser.js";
import { ArrayInitializerContext } from "./ApexParser.js";
import { TypeRefContext } from "./ApexParser.js";
import { ArraySubscriptsContext } from "./ApexParser.js";
import { TypeNameContext } from "./ApexParser.js";
import { TypeArgumentsContext } from "./ApexParser.js";
import { FormalParametersContext } from "./ApexParser.js";
import { FormalParameterListContext } from "./ApexParser.js";
import { FormalParameterContext } from "./ApexParser.js";
import { QualifiedNameContext } from "./ApexParser.js";
import { LiteralContext } from "./ApexParser.js";
import { AnnotationContext } from "./ApexParser.js";
import { ElementValuePairsContext } from "./ApexParser.js";
import { ElementValuePairContext } from "./ApexParser.js";
import { ElementValueContext } from "./ApexParser.js";
import { ElementValueArrayInitializerContext } from "./ApexParser.js";
import { BlockContext } from "./ApexParser.js";
import { LocalVariableDeclarationStatementContext } from "./ApexParser.js";
import { LocalVariableDeclarationContext } from "./ApexParser.js";
import { StatementContext } from "./ApexParser.js";
import { IfStatementContext } from "./ApexParser.js";
import { SwitchStatementContext } from "./ApexParser.js";
import { WhenControlContext } from "./ApexParser.js";
import { WhenValueContext } from "./ApexParser.js";
import { WhenLiteralContext } from "./ApexParser.js";
import { ForStatementContext } from "./ApexParser.js";
import { WhileStatementContext } from "./ApexParser.js";
import { DoWhileStatementContext } from "./ApexParser.js";
import { TryStatementContext } from "./ApexParser.js";
import { ReturnStatementContext } from "./ApexParser.js";
import { ThrowStatementContext } from "./ApexParser.js";
import { BreakStatementContext } from "./ApexParser.js";
import { ContinueStatementContext } from "./ApexParser.js";
import { AccessLevelContext } from "./ApexParser.js";
import { InsertStatementContext } from "./ApexParser.js";
import { UpdateStatementContext } from "./ApexParser.js";
import { DeleteStatementContext } from "./ApexParser.js";
import { UndeleteStatementContext } from "./ApexParser.js";
import { UpsertStatementContext } from "./ApexParser.js";
import { MergeStatementContext } from "./ApexParser.js";
import { RunAsStatementContext } from "./ApexParser.js";
import { ExpressionStatementContext } from "./ApexParser.js";
import { PropertyBlockContext } from "./ApexParser.js";
import { GetterContext } from "./ApexParser.js";
import { SetterContext } from "./ApexParser.js";
import { CatchClauseContext } from "./ApexParser.js";
import { FinallyBlockContext } from "./ApexParser.js";
import { ForControlContext } from "./ApexParser.js";
import { ForInitContext } from "./ApexParser.js";
import { EnhancedForControlContext } from "./ApexParser.js";
import { ForUpdateContext } from "./ApexParser.js";
import { ParExpressionContext } from "./ApexParser.js";
import { ExpressionListContext } from "./ApexParser.js";
import { PrimaryExpressionContext } from "./ApexParser.js";
import { Arth1ExpressionContext } from "./ApexParser.js";
import { DotExpressionContext } from "./ApexParser.js";
import { BitOrExpressionContext } from "./ApexParser.js";
import { ArrayExpressionContext } from "./ApexParser.js";
import { NewExpressionContext } from "./ApexParser.js";
import { AssignExpressionContext } from "./ApexParser.js";
import { MethodCallExpressionContext } from "./ApexParser.js";
import { BitNotExpressionContext } from "./ApexParser.js";
import { Arth2ExpressionContext } from "./ApexParser.js";
import { LogAndExpressionContext } from "./ApexParser.js";
import { CoalescingExpressionContext } from "./ApexParser.js";
import { CastExpressionContext } from "./ApexParser.js";
import { BitAndExpressionContext } from "./ApexParser.js";
import { CmpExpressionContext } from "./ApexParser.js";
import { BitExpressionContext } from "./ApexParser.js";
import { LogOrExpressionContext } from "./ApexParser.js";
import { CondExpressionContext } from "./ApexParser.js";
import { EqualityExpressionContext } from "./ApexParser.js";
import { PostOpExpressionContext } from "./ApexParser.js";
import { NegExpressionContext } from "./ApexParser.js";
import { PreOpExpressionContext } from "./ApexParser.js";
import { SubExpressionContext } from "./ApexParser.js";
import { InstanceOfExpressionContext } from "./ApexParser.js";
import { ThisPrimaryContext } from "./ApexParser.js";
import { SuperPrimaryContext } from "./ApexParser.js";
import { LiteralPrimaryContext } from "./ApexParser.js";
import { TypeRefPrimaryContext } from "./ApexParser.js";
import { VoidPrimaryContext } from "./ApexParser.js";
import { IdPrimaryContext } from "./ApexParser.js";
import { SoqlPrimaryContext } from "./ApexParser.js";
import { SoslPrimaryContext } from "./ApexParser.js";
import { MethodCallContext } from "./ApexParser.js";
import { DotMethodCallContext } from "./ApexParser.js";
import { CreatorContext } from "./ApexParser.js";
import { CreatedNameContext } from "./ApexParser.js";
import { IdCreatedNamePairContext } from "./ApexParser.js";
import { NoRestContext } from "./ApexParser.js";
import { ClassCreatorRestContext } from "./ApexParser.js";
import { ArrayCreatorRestContext } from "./ApexParser.js";
import { MapCreatorRestContext } from "./ApexParser.js";
import { MapCreatorRestPairContext } from "./ApexParser.js";
import { SetCreatorRestContext } from "./ApexParser.js";
import { ArgumentsContext } from "./ApexParser.js";
import { SoqlLiteralContext } from "./ApexParser.js";
import { QueryContext } from "./ApexParser.js";
import { SubQueryContext } from "./ApexParser.js";
import { SelectListContext } from "./ApexParser.js";
import { SelectEntryContext } from "./ApexParser.js";
import { FieldNameContext } from "./ApexParser.js";
import { FromNameListContext } from "./ApexParser.js";
import { SubFieldListContext } from "./ApexParser.js";
import { SubFieldEntryContext } from "./ApexParser.js";
import { SoqlFieldsParameterContext } from "./ApexParser.js";
import { SoqlFunctionContext } from "./ApexParser.js";
import { DateFieldNameContext } from "./ApexParser.js";
import { LocationValueContext } from "./ApexParser.js";
import { CoordinateValueContext } from "./ApexParser.js";
import { TypeOfContext } from "./ApexParser.js";
import { WhenClauseContext } from "./ApexParser.js";
import { ElseClauseContext } from "./ApexParser.js";
import { FieldNameListContext } from "./ApexParser.js";
import { UsingScopeContext } from "./ApexParser.js";
import { WhereClauseContext } from "./ApexParser.js";
import { LogicalExpressionContext } from "./ApexParser.js";
import { ConditionalExpressionContext } from "./ApexParser.js";
import { FieldExpressionContext } from "./ApexParser.js";
import { ComparisonOperatorContext } from "./ApexParser.js";
import { ValueContext } from "./ApexParser.js";
import { ValueListContext } from "./ApexParser.js";
import { SignedNumberContext } from "./ApexParser.js";
import { WithClauseContext } from "./ApexParser.js";
import { FilteringExpressionContext } from "./ApexParser.js";
import { DataCategorySelectionContext } from "./ApexParser.js";
import { DataCategoryNameContext } from "./ApexParser.js";
import { FilteringSelectorContext } from "./ApexParser.js";
import { GroupByClauseContext } from "./ApexParser.js";
import { OrderByClauseContext } from "./ApexParser.js";
import { FieldOrderListContext } from "./ApexParser.js";
import { FieldOrderContext } from "./ApexParser.js";
import { LimitClauseContext } from "./ApexParser.js";
import { OffsetClauseContext } from "./ApexParser.js";
import { AllRowsClauseContext } from "./ApexParser.js";
import { ForClausesContext } from "./ApexParser.js";
import { BoundExpressionContext } from "./ApexParser.js";
import { DateFormulaContext } from "./ApexParser.js";
import { SignedIntegerContext } from "./ApexParser.js";
import { SoqlIdContext } from "./ApexParser.js";
import { SoslLiteralContext } from "./ApexParser.js";
import { SoslLiteralAltContext } from "./ApexParser.js";
import { SoslClausesContext } from "./ApexParser.js";
import { SearchGroupContext } from "./ApexParser.js";
import { FieldSpecListContext } from "./ApexParser.js";
import { FieldSpecContext } from "./ApexParser.js";
import { FieldListContext } from "./ApexParser.js";
import { UpdateListContext } from "./ApexParser.js";
import { UpdateTypeContext } from "./ApexParser.js";
import { NetworkListContext } from "./ApexParser.js";
import { SoslIdContext } from "./ApexParser.js";
import { IdContext } from "./ApexParser.js";
import { AnyIdContext } from "./ApexParser.js";

// Regex: (\w+)\?: (\([^\)]+\)) => Result;
// Replace: $1? $2: Result;

/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `ApexParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export abstract class ApexParserVisitor<Result> extends AbstractParseTreeVisitor<Result> {
    /**
     * Visit a parse tree produced by `ApexParser.triggerUnit`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTriggerUnit? (ctx: TriggerUnitContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.triggerUnit2`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTriggerUnit2? (ctx: TriggerUnit2Context): Result;
    /**
     * Visit a parse tree produced by `ApexParser.triggerCase`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTriggerCase? (ctx: TriggerCaseContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.triggerBlock`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTriggerBlock? (ctx: TriggerBlockContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.triggerBlockMember`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTriggerBlockMember? (ctx: TriggerBlockMemberContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.compilationUnit`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCompilationUnit? (ctx: CompilationUnitContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.typeDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTypeDeclaration? (ctx: TypeDeclarationContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.classDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitClassDeclaration? (ctx: ClassDeclarationContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.enumDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEnumDeclaration? (ctx: EnumDeclarationContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.enumConstants`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEnumConstants? (ctx: EnumConstantsContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.interfaceDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInterfaceDeclaration? (ctx: InterfaceDeclarationContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.typeList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTypeList? (ctx: TypeListContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.classBody`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitClassBody? (ctx: ClassBodyContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.interfaceBody`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInterfaceBody? (ctx: InterfaceBodyContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.classBodyDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitClassBodyDeclaration? (ctx: ClassBodyDeclarationContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.modifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitModifier? (ctx: ModifierContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.memberDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMemberDeclaration? (ctx: MemberDeclarationContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.triggerMemberDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTriggerMemberDeclaration? (ctx: TriggerMemberDeclarationContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.methodDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMethodDeclaration? (ctx: MethodDeclarationContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.constructorDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitConstructorDeclaration? (ctx: ConstructorDeclarationContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.fieldDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFieldDeclaration? (ctx: FieldDeclarationContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.propertyDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPropertyDeclaration? (ctx: PropertyDeclarationContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.interfaceMethodDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInterfaceMethodDeclaration? (ctx: InterfaceMethodDeclarationContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.variableDeclarators`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitVariableDeclarators? (ctx: VariableDeclaratorsContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.variableDeclarator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitVariableDeclarator? (ctx: VariableDeclaratorContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.arrayInitializer`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitArrayInitializer? (ctx: ArrayInitializerContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.typeRef`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTypeRef? (ctx: TypeRefContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.arraySubscripts`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitArraySubscripts? (ctx: ArraySubscriptsContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.typeName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTypeName? (ctx: TypeNameContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.typeArguments`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTypeArguments? (ctx: TypeArgumentsContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.formalParameters`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFormalParameters? (ctx: FormalParametersContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.formalParameterList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFormalParameterList? (ctx: FormalParameterListContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.formalParameter`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFormalParameter? (ctx: FormalParameterContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.qualifiedName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitQualifiedName? (ctx: QualifiedNameContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.literal`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLiteral? (ctx: LiteralContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.annotation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAnnotation? (ctx: AnnotationContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.elementValuePairs`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitElementValuePairs? (ctx: ElementValuePairsContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.elementValuePair`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitElementValuePair? (ctx: ElementValuePairContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.elementValue`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitElementValue? (ctx: ElementValueContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.elementValueArrayInitializer`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitElementValueArrayInitializer? (ctx: ElementValueArrayInitializerContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.block`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBlock? (ctx: BlockContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.localVariableDeclarationStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLocalVariableDeclarationStatement? (ctx: LocalVariableDeclarationStatementContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.localVariableDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLocalVariableDeclaration? (ctx: LocalVariableDeclarationContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStatement? (ctx: StatementContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.ifStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIfStatement? (ctx: IfStatementContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.switchStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSwitchStatement? (ctx: SwitchStatementContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.whenControl`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWhenControl? (ctx: WhenControlContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.whenValue`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWhenValue? (ctx: WhenValueContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.whenLiteral`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWhenLiteral? (ctx: WhenLiteralContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.forStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitForStatement? (ctx: ForStatementContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.whileStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWhileStatement? (ctx: WhileStatementContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.doWhileStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDoWhileStatement? (ctx: DoWhileStatementContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.tryStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTryStatement? (ctx: TryStatementContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.returnStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitReturnStatement? (ctx: ReturnStatementContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.throwStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitThrowStatement? (ctx: ThrowStatementContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.breakStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBreakStatement? (ctx: BreakStatementContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.continueStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitContinueStatement? (ctx: ContinueStatementContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.accessLevel`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAccessLevel? (ctx: AccessLevelContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.insertStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInsertStatement? (ctx: InsertStatementContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.updateStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUpdateStatement? (ctx: UpdateStatementContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.deleteStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDeleteStatement? (ctx: DeleteStatementContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.undeleteStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUndeleteStatement? (ctx: UndeleteStatementContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.upsertStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUpsertStatement? (ctx: UpsertStatementContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.mergeStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMergeStatement? (ctx: MergeStatementContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.runAsStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRunAsStatement? (ctx: RunAsStatementContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.expressionStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExpressionStatement? (ctx: ExpressionStatementContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.propertyBlock`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPropertyBlock? (ctx: PropertyBlockContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.getter`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGetter? (ctx: GetterContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.setter`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetter? (ctx: SetterContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.catchClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCatchClause? (ctx: CatchClauseContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.finallyBlock`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFinallyBlock? (ctx: FinallyBlockContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.forControl`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitForControl? (ctx: ForControlContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.forInit`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitForInit? (ctx: ForInitContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.enhancedForControl`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEnhancedForControl? (ctx: EnhancedForControlContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.forUpdate`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitForUpdate? (ctx: ForUpdateContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.parExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParExpression? (ctx: ParExpressionContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.expressionList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExpressionList? (ctx: ExpressionListContext): Result;
    /**
     * Visit a parse tree produced by the `primaryExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPrimaryExpression? (ctx: PrimaryExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `arth1Expression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitArth1Expression? (ctx: Arth1ExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `dotExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDotExpression? (ctx: DotExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `bitOrExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBitOrExpression? (ctx: BitOrExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `arrayExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitArrayExpression? (ctx: ArrayExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `newExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNewExpression? (ctx: NewExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `assignExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAssignExpression? (ctx: AssignExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `methodCallExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMethodCallExpression? (ctx: MethodCallExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `bitNotExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBitNotExpression? (ctx: BitNotExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `arth2Expression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitArth2Expression? (ctx: Arth2ExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `logAndExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLogAndExpression? (ctx: LogAndExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `coalescingExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCoalescingExpression? (ctx: CoalescingExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `castExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCastExpression? (ctx: CastExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `bitAndExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBitAndExpression? (ctx: BitAndExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `cmpExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCmpExpression? (ctx: CmpExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `bitExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBitExpression? (ctx: BitExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `logOrExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLogOrExpression? (ctx: LogOrExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `condExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCondExpression? (ctx: CondExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `equalityExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEqualityExpression? (ctx: EqualityExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `postOpExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPostOpExpression? (ctx: PostOpExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `negExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNegExpression? (ctx: NegExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `preOpExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPreOpExpression? (ctx: PreOpExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `subExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubExpression? (ctx: SubExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `instanceOfExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInstanceOfExpression? (ctx: InstanceOfExpressionContext): Result;
    /**
     * Visit a parse tree produced by the `thisPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitThisPrimary? (ctx: ThisPrimaryContext): Result;
    /**
     * Visit a parse tree produced by the `superPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSuperPrimary? (ctx: SuperPrimaryContext): Result;
    /**
     * Visit a parse tree produced by the `literalPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLiteralPrimary? (ctx: LiteralPrimaryContext): Result;
    /**
     * Visit a parse tree produced by the `typeRefPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTypeRefPrimary? (ctx: TypeRefPrimaryContext): Result;
    /**
     * Visit a parse tree produced by the `voidPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitVoidPrimary? (ctx: VoidPrimaryContext): Result;
    /**
     * Visit a parse tree produced by the `idPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIdPrimary? (ctx: IdPrimaryContext): Result;
    /**
     * Visit a parse tree produced by the `soqlPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSoqlPrimary? (ctx: SoqlPrimaryContext): Result;
    /**
     * Visit a parse tree produced by the `soslPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSoslPrimary? (ctx: SoslPrimaryContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.methodCall`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMethodCall? (ctx: MethodCallContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.dotMethodCall`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDotMethodCall? (ctx: DotMethodCallContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.creator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCreator? (ctx: CreatorContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.createdName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCreatedName? (ctx: CreatedNameContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.idCreatedNamePair`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIdCreatedNamePair? (ctx: IdCreatedNamePairContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.noRest`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNoRest? (ctx: NoRestContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.classCreatorRest`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitClassCreatorRest? (ctx: ClassCreatorRestContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.arrayCreatorRest`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitArrayCreatorRest? (ctx: ArrayCreatorRestContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.mapCreatorRest`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMapCreatorRest? (ctx: MapCreatorRestContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.mapCreatorRestPair`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMapCreatorRestPair? (ctx: MapCreatorRestPairContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.setCreatorRest`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetCreatorRest? (ctx: SetCreatorRestContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.arguments`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitArguments? (ctx: ArgumentsContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.soqlLiteral`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSoqlLiteral? (ctx: SoqlLiteralContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.query`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitQuery? (ctx: QueryContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.subQuery`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubQuery? (ctx: SubQueryContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.selectList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSelectList? (ctx: SelectListContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.selectEntry`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSelectEntry? (ctx: SelectEntryContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.fieldName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFieldName? (ctx: FieldNameContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.fromNameList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFromNameList? (ctx: FromNameListContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.subFieldList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubFieldList? (ctx: SubFieldListContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.subFieldEntry`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSubFieldEntry? (ctx: SubFieldEntryContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.soqlFieldsParameter`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSoqlFieldsParameter? (ctx: SoqlFieldsParameterContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.soqlFunction`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSoqlFunction? (ctx: SoqlFunctionContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.dateFieldName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDateFieldName? (ctx: DateFieldNameContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.locationValue`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLocationValue? (ctx: LocationValueContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.coordinateValue`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCoordinateValue? (ctx: CoordinateValueContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.typeOf`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTypeOf? (ctx: TypeOfContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.whenClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWhenClause? (ctx: WhenClauseContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.elseClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitElseClause? (ctx: ElseClauseContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.fieldNameList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFieldNameList? (ctx: FieldNameListContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.usingScope`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUsingScope? (ctx: UsingScopeContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.whereClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWhereClause? (ctx: WhereClauseContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.logicalExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLogicalExpression? (ctx: LogicalExpressionContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.conditionalExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitConditionalExpression? (ctx: ConditionalExpressionContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.fieldExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFieldExpression? (ctx: FieldExpressionContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.comparisonOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitComparisonOperator? (ctx: ComparisonOperatorContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.value`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitValue? (ctx: ValueContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.valueList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitValueList? (ctx: ValueListContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.signedNumber`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSignedNumber? (ctx: SignedNumberContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.withClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitWithClause? (ctx: WithClauseContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.filteringExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFilteringExpression? (ctx: FilteringExpressionContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.dataCategorySelection`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDataCategorySelection? (ctx: DataCategorySelectionContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.dataCategoryName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDataCategoryName? (ctx: DataCategoryNameContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.filteringSelector`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFilteringSelector? (ctx: FilteringSelectorContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.groupByClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGroupByClause? (ctx: GroupByClauseContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.orderByClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOrderByClause? (ctx: OrderByClauseContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.fieldOrderList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFieldOrderList? (ctx: FieldOrderListContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.fieldOrder`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFieldOrder? (ctx: FieldOrderContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.limitClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLimitClause? (ctx: LimitClauseContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.offsetClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOffsetClause? (ctx: OffsetClauseContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.allRowsClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAllRowsClause? (ctx: AllRowsClauseContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.forClauses`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitForClauses? (ctx: ForClausesContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.boundExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBoundExpression? (ctx: BoundExpressionContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.dateFormula`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDateFormula? (ctx: DateFormulaContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.signedInteger`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSignedInteger? (ctx: SignedIntegerContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.soqlId`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSoqlId? (ctx: SoqlIdContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.soslLiteral`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSoslLiteral? (ctx: SoslLiteralContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.soslLiteralAlt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSoslLiteralAlt? (ctx: SoslLiteralAltContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.soslClauses`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSoslClauses? (ctx: SoslClausesContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.searchGroup`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSearchGroup? (ctx: SearchGroupContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.fieldSpecList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFieldSpecList? (ctx: FieldSpecListContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.fieldSpec`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFieldSpec? (ctx: FieldSpecContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.fieldList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFieldList? (ctx: FieldListContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.updateList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUpdateList? (ctx: UpdateListContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.updateType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUpdateType? (ctx: UpdateTypeContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.networkList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNetworkList? (ctx: NetworkListContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.soslId`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSoslId? (ctx: SoslIdContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.id`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitId? (ctx: IdContext): Result;
    /**
     * Visit a parse tree produced by `ApexParser.anyId`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAnyId? (ctx: AnyIdContext): Result;
}

