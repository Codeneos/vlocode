// Generated from ./grammar/ApexParser.g4 by ANTLR 4.13.1

import { ParseTreeListener } from "antlr4ng";


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


/**
 * This interface defines a complete listener for a parse tree produced by
 * `ApexParser`.
 */
export interface ApexParserListener extends ParseTreeListener {
    /**
     * Enter a parse tree produced by `ApexParser.triggerUnit`.
     * @param ctx the parse tree
     */
    enterTriggerUnit?: (ctx: TriggerUnitContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.triggerUnit`.
     * @param ctx the parse tree
     */
    exitTriggerUnit?: (ctx: TriggerUnitContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.triggerUnit2`.
     * @param ctx the parse tree
     */
    enterTriggerUnit2?: (ctx: TriggerUnit2Context) => void;
    /**
     * Exit a parse tree produced by `ApexParser.triggerUnit2`.
     * @param ctx the parse tree
     */
    exitTriggerUnit2?: (ctx: TriggerUnit2Context) => void;
    /**
     * Enter a parse tree produced by `ApexParser.triggerCase`.
     * @param ctx the parse tree
     */
    enterTriggerCase?: (ctx: TriggerCaseContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.triggerCase`.
     * @param ctx the parse tree
     */
    exitTriggerCase?: (ctx: TriggerCaseContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.triggerBlock`.
     * @param ctx the parse tree
     */
    enterTriggerBlock?: (ctx: TriggerBlockContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.triggerBlock`.
     * @param ctx the parse tree
     */
    exitTriggerBlock?: (ctx: TriggerBlockContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.triggerBlockMember`.
     * @param ctx the parse tree
     */
    enterTriggerBlockMember?: (ctx: TriggerBlockMemberContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.triggerBlockMember`.
     * @param ctx the parse tree
     */
    exitTriggerBlockMember?: (ctx: TriggerBlockMemberContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.compilationUnit`.
     * @param ctx the parse tree
     */
    enterCompilationUnit?: (ctx: CompilationUnitContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.compilationUnit`.
     * @param ctx the parse tree
     */
    exitCompilationUnit?: (ctx: CompilationUnitContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.typeDeclaration`.
     * @param ctx the parse tree
     */
    enterTypeDeclaration?: (ctx: TypeDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.typeDeclaration`.
     * @param ctx the parse tree
     */
    exitTypeDeclaration?: (ctx: TypeDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.classDeclaration`.
     * @param ctx the parse tree
     */
    enterClassDeclaration?: (ctx: ClassDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.classDeclaration`.
     * @param ctx the parse tree
     */
    exitClassDeclaration?: (ctx: ClassDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.enumDeclaration`.
     * @param ctx the parse tree
     */
    enterEnumDeclaration?: (ctx: EnumDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.enumDeclaration`.
     * @param ctx the parse tree
     */
    exitEnumDeclaration?: (ctx: EnumDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.enumConstants`.
     * @param ctx the parse tree
     */
    enterEnumConstants?: (ctx: EnumConstantsContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.enumConstants`.
     * @param ctx the parse tree
     */
    exitEnumConstants?: (ctx: EnumConstantsContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.interfaceDeclaration`.
     * @param ctx the parse tree
     */
    enterInterfaceDeclaration?: (ctx: InterfaceDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.interfaceDeclaration`.
     * @param ctx the parse tree
     */
    exitInterfaceDeclaration?: (ctx: InterfaceDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.typeList`.
     * @param ctx the parse tree
     */
    enterTypeList?: (ctx: TypeListContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.typeList`.
     * @param ctx the parse tree
     */
    exitTypeList?: (ctx: TypeListContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.classBody`.
     * @param ctx the parse tree
     */
    enterClassBody?: (ctx: ClassBodyContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.classBody`.
     * @param ctx the parse tree
     */
    exitClassBody?: (ctx: ClassBodyContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.interfaceBody`.
     * @param ctx the parse tree
     */
    enterInterfaceBody?: (ctx: InterfaceBodyContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.interfaceBody`.
     * @param ctx the parse tree
     */
    exitInterfaceBody?: (ctx: InterfaceBodyContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.classBodyDeclaration`.
     * @param ctx the parse tree
     */
    enterClassBodyDeclaration?: (ctx: ClassBodyDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.classBodyDeclaration`.
     * @param ctx the parse tree
     */
    exitClassBodyDeclaration?: (ctx: ClassBodyDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.modifier`.
     * @param ctx the parse tree
     */
    enterModifier?: (ctx: ModifierContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.modifier`.
     * @param ctx the parse tree
     */
    exitModifier?: (ctx: ModifierContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.memberDeclaration`.
     * @param ctx the parse tree
     */
    enterMemberDeclaration?: (ctx: MemberDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.memberDeclaration`.
     * @param ctx the parse tree
     */
    exitMemberDeclaration?: (ctx: MemberDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.triggerMemberDeclaration`.
     * @param ctx the parse tree
     */
    enterTriggerMemberDeclaration?: (ctx: TriggerMemberDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.triggerMemberDeclaration`.
     * @param ctx the parse tree
     */
    exitTriggerMemberDeclaration?: (ctx: TriggerMemberDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.methodDeclaration`.
     * @param ctx the parse tree
     */
    enterMethodDeclaration?: (ctx: MethodDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.methodDeclaration`.
     * @param ctx the parse tree
     */
    exitMethodDeclaration?: (ctx: MethodDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.constructorDeclaration`.
     * @param ctx the parse tree
     */
    enterConstructorDeclaration?: (ctx: ConstructorDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.constructorDeclaration`.
     * @param ctx the parse tree
     */
    exitConstructorDeclaration?: (ctx: ConstructorDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.fieldDeclaration`.
     * @param ctx the parse tree
     */
    enterFieldDeclaration?: (ctx: FieldDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.fieldDeclaration`.
     * @param ctx the parse tree
     */
    exitFieldDeclaration?: (ctx: FieldDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.propertyDeclaration`.
     * @param ctx the parse tree
     */
    enterPropertyDeclaration?: (ctx: PropertyDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.propertyDeclaration`.
     * @param ctx the parse tree
     */
    exitPropertyDeclaration?: (ctx: PropertyDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.interfaceMethodDeclaration`.
     * @param ctx the parse tree
     */
    enterInterfaceMethodDeclaration?: (ctx: InterfaceMethodDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.interfaceMethodDeclaration`.
     * @param ctx the parse tree
     */
    exitInterfaceMethodDeclaration?: (ctx: InterfaceMethodDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.variableDeclarators`.
     * @param ctx the parse tree
     */
    enterVariableDeclarators?: (ctx: VariableDeclaratorsContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.variableDeclarators`.
     * @param ctx the parse tree
     */
    exitVariableDeclarators?: (ctx: VariableDeclaratorsContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.variableDeclarator`.
     * @param ctx the parse tree
     */
    enterVariableDeclarator?: (ctx: VariableDeclaratorContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.variableDeclarator`.
     * @param ctx the parse tree
     */
    exitVariableDeclarator?: (ctx: VariableDeclaratorContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.arrayInitializer`.
     * @param ctx the parse tree
     */
    enterArrayInitializer?: (ctx: ArrayInitializerContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.arrayInitializer`.
     * @param ctx the parse tree
     */
    exitArrayInitializer?: (ctx: ArrayInitializerContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.typeRef`.
     * @param ctx the parse tree
     */
    enterTypeRef?: (ctx: TypeRefContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.typeRef`.
     * @param ctx the parse tree
     */
    exitTypeRef?: (ctx: TypeRefContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.arraySubscripts`.
     * @param ctx the parse tree
     */
    enterArraySubscripts?: (ctx: ArraySubscriptsContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.arraySubscripts`.
     * @param ctx the parse tree
     */
    exitArraySubscripts?: (ctx: ArraySubscriptsContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.typeName`.
     * @param ctx the parse tree
     */
    enterTypeName?: (ctx: TypeNameContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.typeName`.
     * @param ctx the parse tree
     */
    exitTypeName?: (ctx: TypeNameContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.typeArguments`.
     * @param ctx the parse tree
     */
    enterTypeArguments?: (ctx: TypeArgumentsContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.typeArguments`.
     * @param ctx the parse tree
     */
    exitTypeArguments?: (ctx: TypeArgumentsContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.formalParameters`.
     * @param ctx the parse tree
     */
    enterFormalParameters?: (ctx: FormalParametersContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.formalParameters`.
     * @param ctx the parse tree
     */
    exitFormalParameters?: (ctx: FormalParametersContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.formalParameterList`.
     * @param ctx the parse tree
     */
    enterFormalParameterList?: (ctx: FormalParameterListContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.formalParameterList`.
     * @param ctx the parse tree
     */
    exitFormalParameterList?: (ctx: FormalParameterListContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.formalParameter`.
     * @param ctx the parse tree
     */
    enterFormalParameter?: (ctx: FormalParameterContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.formalParameter`.
     * @param ctx the parse tree
     */
    exitFormalParameter?: (ctx: FormalParameterContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.qualifiedName`.
     * @param ctx the parse tree
     */
    enterQualifiedName?: (ctx: QualifiedNameContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.qualifiedName`.
     * @param ctx the parse tree
     */
    exitQualifiedName?: (ctx: QualifiedNameContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.literal`.
     * @param ctx the parse tree
     */
    enterLiteral?: (ctx: LiteralContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.literal`.
     * @param ctx the parse tree
     */
    exitLiteral?: (ctx: LiteralContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.annotation`.
     * @param ctx the parse tree
     */
    enterAnnotation?: (ctx: AnnotationContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.annotation`.
     * @param ctx the parse tree
     */
    exitAnnotation?: (ctx: AnnotationContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.elementValuePairs`.
     * @param ctx the parse tree
     */
    enterElementValuePairs?: (ctx: ElementValuePairsContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.elementValuePairs`.
     * @param ctx the parse tree
     */
    exitElementValuePairs?: (ctx: ElementValuePairsContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.elementValuePair`.
     * @param ctx the parse tree
     */
    enterElementValuePair?: (ctx: ElementValuePairContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.elementValuePair`.
     * @param ctx the parse tree
     */
    exitElementValuePair?: (ctx: ElementValuePairContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.elementValue`.
     * @param ctx the parse tree
     */
    enterElementValue?: (ctx: ElementValueContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.elementValue`.
     * @param ctx the parse tree
     */
    exitElementValue?: (ctx: ElementValueContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.elementValueArrayInitializer`.
     * @param ctx the parse tree
     */
    enterElementValueArrayInitializer?: (ctx: ElementValueArrayInitializerContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.elementValueArrayInitializer`.
     * @param ctx the parse tree
     */
    exitElementValueArrayInitializer?: (ctx: ElementValueArrayInitializerContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.block`.
     * @param ctx the parse tree
     */
    enterBlock?: (ctx: BlockContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.block`.
     * @param ctx the parse tree
     */
    exitBlock?: (ctx: BlockContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.localVariableDeclarationStatement`.
     * @param ctx the parse tree
     */
    enterLocalVariableDeclarationStatement?: (ctx: LocalVariableDeclarationStatementContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.localVariableDeclarationStatement`.
     * @param ctx the parse tree
     */
    exitLocalVariableDeclarationStatement?: (ctx: LocalVariableDeclarationStatementContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.localVariableDeclaration`.
     * @param ctx the parse tree
     */
    enterLocalVariableDeclaration?: (ctx: LocalVariableDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.localVariableDeclaration`.
     * @param ctx the parse tree
     */
    exitLocalVariableDeclaration?: (ctx: LocalVariableDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.statement`.
     * @param ctx the parse tree
     */
    enterStatement?: (ctx: StatementContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.statement`.
     * @param ctx the parse tree
     */
    exitStatement?: (ctx: StatementContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.ifStatement`.
     * @param ctx the parse tree
     */
    enterIfStatement?: (ctx: IfStatementContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.ifStatement`.
     * @param ctx the parse tree
     */
    exitIfStatement?: (ctx: IfStatementContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.switchStatement`.
     * @param ctx the parse tree
     */
    enterSwitchStatement?: (ctx: SwitchStatementContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.switchStatement`.
     * @param ctx the parse tree
     */
    exitSwitchStatement?: (ctx: SwitchStatementContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.whenControl`.
     * @param ctx the parse tree
     */
    enterWhenControl?: (ctx: WhenControlContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.whenControl`.
     * @param ctx the parse tree
     */
    exitWhenControl?: (ctx: WhenControlContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.whenValue`.
     * @param ctx the parse tree
     */
    enterWhenValue?: (ctx: WhenValueContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.whenValue`.
     * @param ctx the parse tree
     */
    exitWhenValue?: (ctx: WhenValueContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.whenLiteral`.
     * @param ctx the parse tree
     */
    enterWhenLiteral?: (ctx: WhenLiteralContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.whenLiteral`.
     * @param ctx the parse tree
     */
    exitWhenLiteral?: (ctx: WhenLiteralContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.forStatement`.
     * @param ctx the parse tree
     */
    enterForStatement?: (ctx: ForStatementContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.forStatement`.
     * @param ctx the parse tree
     */
    exitForStatement?: (ctx: ForStatementContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.whileStatement`.
     * @param ctx the parse tree
     */
    enterWhileStatement?: (ctx: WhileStatementContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.whileStatement`.
     * @param ctx the parse tree
     */
    exitWhileStatement?: (ctx: WhileStatementContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.doWhileStatement`.
     * @param ctx the parse tree
     */
    enterDoWhileStatement?: (ctx: DoWhileStatementContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.doWhileStatement`.
     * @param ctx the parse tree
     */
    exitDoWhileStatement?: (ctx: DoWhileStatementContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.tryStatement`.
     * @param ctx the parse tree
     */
    enterTryStatement?: (ctx: TryStatementContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.tryStatement`.
     * @param ctx the parse tree
     */
    exitTryStatement?: (ctx: TryStatementContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.returnStatement`.
     * @param ctx the parse tree
     */
    enterReturnStatement?: (ctx: ReturnStatementContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.returnStatement`.
     * @param ctx the parse tree
     */
    exitReturnStatement?: (ctx: ReturnStatementContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.throwStatement`.
     * @param ctx the parse tree
     */
    enterThrowStatement?: (ctx: ThrowStatementContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.throwStatement`.
     * @param ctx the parse tree
     */
    exitThrowStatement?: (ctx: ThrowStatementContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.breakStatement`.
     * @param ctx the parse tree
     */
    enterBreakStatement?: (ctx: BreakStatementContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.breakStatement`.
     * @param ctx the parse tree
     */
    exitBreakStatement?: (ctx: BreakStatementContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.continueStatement`.
     * @param ctx the parse tree
     */
    enterContinueStatement?: (ctx: ContinueStatementContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.continueStatement`.
     * @param ctx the parse tree
     */
    exitContinueStatement?: (ctx: ContinueStatementContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.accessLevel`.
     * @param ctx the parse tree
     */
    enterAccessLevel?: (ctx: AccessLevelContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.accessLevel`.
     * @param ctx the parse tree
     */
    exitAccessLevel?: (ctx: AccessLevelContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.insertStatement`.
     * @param ctx the parse tree
     */
    enterInsertStatement?: (ctx: InsertStatementContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.insertStatement`.
     * @param ctx the parse tree
     */
    exitInsertStatement?: (ctx: InsertStatementContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.updateStatement`.
     * @param ctx the parse tree
     */
    enterUpdateStatement?: (ctx: UpdateStatementContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.updateStatement`.
     * @param ctx the parse tree
     */
    exitUpdateStatement?: (ctx: UpdateStatementContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.deleteStatement`.
     * @param ctx the parse tree
     */
    enterDeleteStatement?: (ctx: DeleteStatementContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.deleteStatement`.
     * @param ctx the parse tree
     */
    exitDeleteStatement?: (ctx: DeleteStatementContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.undeleteStatement`.
     * @param ctx the parse tree
     */
    enterUndeleteStatement?: (ctx: UndeleteStatementContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.undeleteStatement`.
     * @param ctx the parse tree
     */
    exitUndeleteStatement?: (ctx: UndeleteStatementContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.upsertStatement`.
     * @param ctx the parse tree
     */
    enterUpsertStatement?: (ctx: UpsertStatementContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.upsertStatement`.
     * @param ctx the parse tree
     */
    exitUpsertStatement?: (ctx: UpsertStatementContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.mergeStatement`.
     * @param ctx the parse tree
     */
    enterMergeStatement?: (ctx: MergeStatementContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.mergeStatement`.
     * @param ctx the parse tree
     */
    exitMergeStatement?: (ctx: MergeStatementContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.runAsStatement`.
     * @param ctx the parse tree
     */
    enterRunAsStatement?: (ctx: RunAsStatementContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.runAsStatement`.
     * @param ctx the parse tree
     */
    exitRunAsStatement?: (ctx: RunAsStatementContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.expressionStatement`.
     * @param ctx the parse tree
     */
    enterExpressionStatement?: (ctx: ExpressionStatementContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.expressionStatement`.
     * @param ctx the parse tree
     */
    exitExpressionStatement?: (ctx: ExpressionStatementContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.propertyBlock`.
     * @param ctx the parse tree
     */
    enterPropertyBlock?: (ctx: PropertyBlockContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.propertyBlock`.
     * @param ctx the parse tree
     */
    exitPropertyBlock?: (ctx: PropertyBlockContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.getter`.
     * @param ctx the parse tree
     */
    enterGetter?: (ctx: GetterContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.getter`.
     * @param ctx the parse tree
     */
    exitGetter?: (ctx: GetterContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.setter`.
     * @param ctx the parse tree
     */
    enterSetter?: (ctx: SetterContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.setter`.
     * @param ctx the parse tree
     */
    exitSetter?: (ctx: SetterContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.catchClause`.
     * @param ctx the parse tree
     */
    enterCatchClause?: (ctx: CatchClauseContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.catchClause`.
     * @param ctx the parse tree
     */
    exitCatchClause?: (ctx: CatchClauseContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.finallyBlock`.
     * @param ctx the parse tree
     */
    enterFinallyBlock?: (ctx: FinallyBlockContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.finallyBlock`.
     * @param ctx the parse tree
     */
    exitFinallyBlock?: (ctx: FinallyBlockContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.forControl`.
     * @param ctx the parse tree
     */
    enterForControl?: (ctx: ForControlContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.forControl`.
     * @param ctx the parse tree
     */
    exitForControl?: (ctx: ForControlContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.forInit`.
     * @param ctx the parse tree
     */
    enterForInit?: (ctx: ForInitContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.forInit`.
     * @param ctx the parse tree
     */
    exitForInit?: (ctx: ForInitContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.enhancedForControl`.
     * @param ctx the parse tree
     */
    enterEnhancedForControl?: (ctx: EnhancedForControlContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.enhancedForControl`.
     * @param ctx the parse tree
     */
    exitEnhancedForControl?: (ctx: EnhancedForControlContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.forUpdate`.
     * @param ctx the parse tree
     */
    enterForUpdate?: (ctx: ForUpdateContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.forUpdate`.
     * @param ctx the parse tree
     */
    exitForUpdate?: (ctx: ForUpdateContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.parExpression`.
     * @param ctx the parse tree
     */
    enterParExpression?: (ctx: ParExpressionContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.parExpression`.
     * @param ctx the parse tree
     */
    exitParExpression?: (ctx: ParExpressionContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.expressionList`.
     * @param ctx the parse tree
     */
    enterExpressionList?: (ctx: ExpressionListContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.expressionList`.
     * @param ctx the parse tree
     */
    exitExpressionList?: (ctx: ExpressionListContext) => void;
    /**
     * Enter a parse tree produced by the `primaryExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterPrimaryExpression?: (ctx: PrimaryExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `primaryExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitPrimaryExpression?: (ctx: PrimaryExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `arth1Expression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterArth1Expression?: (ctx: Arth1ExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `arth1Expression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitArth1Expression?: (ctx: Arth1ExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `dotExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterDotExpression?: (ctx: DotExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `dotExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitDotExpression?: (ctx: DotExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `bitOrExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterBitOrExpression?: (ctx: BitOrExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `bitOrExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitBitOrExpression?: (ctx: BitOrExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `arrayExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterArrayExpression?: (ctx: ArrayExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `arrayExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitArrayExpression?: (ctx: ArrayExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `newExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterNewExpression?: (ctx: NewExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `newExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitNewExpression?: (ctx: NewExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `assignExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterAssignExpression?: (ctx: AssignExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `assignExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitAssignExpression?: (ctx: AssignExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `methodCallExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterMethodCallExpression?: (ctx: MethodCallExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `methodCallExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitMethodCallExpression?: (ctx: MethodCallExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `bitNotExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterBitNotExpression?: (ctx: BitNotExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `bitNotExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitBitNotExpression?: (ctx: BitNotExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `arth2Expression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterArth2Expression?: (ctx: Arth2ExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `arth2Expression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitArth2Expression?: (ctx: Arth2ExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `logAndExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterLogAndExpression?: (ctx: LogAndExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `logAndExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitLogAndExpression?: (ctx: LogAndExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `castExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterCastExpression?: (ctx: CastExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `castExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitCastExpression?: (ctx: CastExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `bitAndExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterBitAndExpression?: (ctx: BitAndExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `bitAndExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitBitAndExpression?: (ctx: BitAndExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `cmpExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterCmpExpression?: (ctx: CmpExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `cmpExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitCmpExpression?: (ctx: CmpExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `bitExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterBitExpression?: (ctx: BitExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `bitExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitBitExpression?: (ctx: BitExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `logOrExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterLogOrExpression?: (ctx: LogOrExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `logOrExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitLogOrExpression?: (ctx: LogOrExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `condExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterCondExpression?: (ctx: CondExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `condExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitCondExpression?: (ctx: CondExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `equalityExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterEqualityExpression?: (ctx: EqualityExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `equalityExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitEqualityExpression?: (ctx: EqualityExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `postOpExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterPostOpExpression?: (ctx: PostOpExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `postOpExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitPostOpExpression?: (ctx: PostOpExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `negExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterNegExpression?: (ctx: NegExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `negExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitNegExpression?: (ctx: NegExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `preOpExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterPreOpExpression?: (ctx: PreOpExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `preOpExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitPreOpExpression?: (ctx: PreOpExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `subExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterSubExpression?: (ctx: SubExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `subExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitSubExpression?: (ctx: SubExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `instanceOfExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    enterInstanceOfExpression?: (ctx: InstanceOfExpressionContext) => void;
    /**
     * Exit a parse tree produced by the `instanceOfExpression`
     * labeled alternative in `ApexParser.expression`.
     * @param ctx the parse tree
     */
    exitInstanceOfExpression?: (ctx: InstanceOfExpressionContext) => void;
    /**
     * Enter a parse tree produced by the `thisPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     */
    enterThisPrimary?: (ctx: ThisPrimaryContext) => void;
    /**
     * Exit a parse tree produced by the `thisPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     */
    exitThisPrimary?: (ctx: ThisPrimaryContext) => void;
    /**
     * Enter a parse tree produced by the `superPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     */
    enterSuperPrimary?: (ctx: SuperPrimaryContext) => void;
    /**
     * Exit a parse tree produced by the `superPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     */
    exitSuperPrimary?: (ctx: SuperPrimaryContext) => void;
    /**
     * Enter a parse tree produced by the `literalPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     */
    enterLiteralPrimary?: (ctx: LiteralPrimaryContext) => void;
    /**
     * Exit a parse tree produced by the `literalPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     */
    exitLiteralPrimary?: (ctx: LiteralPrimaryContext) => void;
    /**
     * Enter a parse tree produced by the `typeRefPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     */
    enterTypeRefPrimary?: (ctx: TypeRefPrimaryContext) => void;
    /**
     * Exit a parse tree produced by the `typeRefPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     */
    exitTypeRefPrimary?: (ctx: TypeRefPrimaryContext) => void;
    /**
     * Enter a parse tree produced by the `voidPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     */
    enterVoidPrimary?: (ctx: VoidPrimaryContext) => void;
    /**
     * Exit a parse tree produced by the `voidPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     */
    exitVoidPrimary?: (ctx: VoidPrimaryContext) => void;
    /**
     * Enter a parse tree produced by the `idPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     */
    enterIdPrimary?: (ctx: IdPrimaryContext) => void;
    /**
     * Exit a parse tree produced by the `idPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     */
    exitIdPrimary?: (ctx: IdPrimaryContext) => void;
    /**
     * Enter a parse tree produced by the `soqlPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     */
    enterSoqlPrimary?: (ctx: SoqlPrimaryContext) => void;
    /**
     * Exit a parse tree produced by the `soqlPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     */
    exitSoqlPrimary?: (ctx: SoqlPrimaryContext) => void;
    /**
     * Enter a parse tree produced by the `soslPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     */
    enterSoslPrimary?: (ctx: SoslPrimaryContext) => void;
    /**
     * Exit a parse tree produced by the `soslPrimary`
     * labeled alternative in `ApexParser.primary`.
     * @param ctx the parse tree
     */
    exitSoslPrimary?: (ctx: SoslPrimaryContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.methodCall`.
     * @param ctx the parse tree
     */
    enterMethodCall?: (ctx: MethodCallContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.methodCall`.
     * @param ctx the parse tree
     */
    exitMethodCall?: (ctx: MethodCallContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.dotMethodCall`.
     * @param ctx the parse tree
     */
    enterDotMethodCall?: (ctx: DotMethodCallContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.dotMethodCall`.
     * @param ctx the parse tree
     */
    exitDotMethodCall?: (ctx: DotMethodCallContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.creator`.
     * @param ctx the parse tree
     */
    enterCreator?: (ctx: CreatorContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.creator`.
     * @param ctx the parse tree
     */
    exitCreator?: (ctx: CreatorContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.createdName`.
     * @param ctx the parse tree
     */
    enterCreatedName?: (ctx: CreatedNameContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.createdName`.
     * @param ctx the parse tree
     */
    exitCreatedName?: (ctx: CreatedNameContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.idCreatedNamePair`.
     * @param ctx the parse tree
     */
    enterIdCreatedNamePair?: (ctx: IdCreatedNamePairContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.idCreatedNamePair`.
     * @param ctx the parse tree
     */
    exitIdCreatedNamePair?: (ctx: IdCreatedNamePairContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.noRest`.
     * @param ctx the parse tree
     */
    enterNoRest?: (ctx: NoRestContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.noRest`.
     * @param ctx the parse tree
     */
    exitNoRest?: (ctx: NoRestContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.classCreatorRest`.
     * @param ctx the parse tree
     */
    enterClassCreatorRest?: (ctx: ClassCreatorRestContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.classCreatorRest`.
     * @param ctx the parse tree
     */
    exitClassCreatorRest?: (ctx: ClassCreatorRestContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.arrayCreatorRest`.
     * @param ctx the parse tree
     */
    enterArrayCreatorRest?: (ctx: ArrayCreatorRestContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.arrayCreatorRest`.
     * @param ctx the parse tree
     */
    exitArrayCreatorRest?: (ctx: ArrayCreatorRestContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.mapCreatorRest`.
     * @param ctx the parse tree
     */
    enterMapCreatorRest?: (ctx: MapCreatorRestContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.mapCreatorRest`.
     * @param ctx the parse tree
     */
    exitMapCreatorRest?: (ctx: MapCreatorRestContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.mapCreatorRestPair`.
     * @param ctx the parse tree
     */
    enterMapCreatorRestPair?: (ctx: MapCreatorRestPairContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.mapCreatorRestPair`.
     * @param ctx the parse tree
     */
    exitMapCreatorRestPair?: (ctx: MapCreatorRestPairContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.setCreatorRest`.
     * @param ctx the parse tree
     */
    enterSetCreatorRest?: (ctx: SetCreatorRestContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.setCreatorRest`.
     * @param ctx the parse tree
     */
    exitSetCreatorRest?: (ctx: SetCreatorRestContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.arguments`.
     * @param ctx the parse tree
     */
    enterArguments?: (ctx: ArgumentsContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.arguments`.
     * @param ctx the parse tree
     */
    exitArguments?: (ctx: ArgumentsContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.soqlLiteral`.
     * @param ctx the parse tree
     */
    enterSoqlLiteral?: (ctx: SoqlLiteralContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.soqlLiteral`.
     * @param ctx the parse tree
     */
    exitSoqlLiteral?: (ctx: SoqlLiteralContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.query`.
     * @param ctx the parse tree
     */
    enterQuery?: (ctx: QueryContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.query`.
     * @param ctx the parse tree
     */
    exitQuery?: (ctx: QueryContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.subQuery`.
     * @param ctx the parse tree
     */
    enterSubQuery?: (ctx: SubQueryContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.subQuery`.
     * @param ctx the parse tree
     */
    exitSubQuery?: (ctx: SubQueryContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.selectList`.
     * @param ctx the parse tree
     */
    enterSelectList?: (ctx: SelectListContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.selectList`.
     * @param ctx the parse tree
     */
    exitSelectList?: (ctx: SelectListContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.selectEntry`.
     * @param ctx the parse tree
     */
    enterSelectEntry?: (ctx: SelectEntryContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.selectEntry`.
     * @param ctx the parse tree
     */
    exitSelectEntry?: (ctx: SelectEntryContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.fieldName`.
     * @param ctx the parse tree
     */
    enterFieldName?: (ctx: FieldNameContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.fieldName`.
     * @param ctx the parse tree
     */
    exitFieldName?: (ctx: FieldNameContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.fromNameList`.
     * @param ctx the parse tree
     */
    enterFromNameList?: (ctx: FromNameListContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.fromNameList`.
     * @param ctx the parse tree
     */
    exitFromNameList?: (ctx: FromNameListContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.subFieldList`.
     * @param ctx the parse tree
     */
    enterSubFieldList?: (ctx: SubFieldListContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.subFieldList`.
     * @param ctx the parse tree
     */
    exitSubFieldList?: (ctx: SubFieldListContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.subFieldEntry`.
     * @param ctx the parse tree
     */
    enterSubFieldEntry?: (ctx: SubFieldEntryContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.subFieldEntry`.
     * @param ctx the parse tree
     */
    exitSubFieldEntry?: (ctx: SubFieldEntryContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.soqlFieldsParameter`.
     * @param ctx the parse tree
     */
    enterSoqlFieldsParameter?: (ctx: SoqlFieldsParameterContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.soqlFieldsParameter`.
     * @param ctx the parse tree
     */
    exitSoqlFieldsParameter?: (ctx: SoqlFieldsParameterContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.soqlFunction`.
     * @param ctx the parse tree
     */
    enterSoqlFunction?: (ctx: SoqlFunctionContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.soqlFunction`.
     * @param ctx the parse tree
     */
    exitSoqlFunction?: (ctx: SoqlFunctionContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.dateFieldName`.
     * @param ctx the parse tree
     */
    enterDateFieldName?: (ctx: DateFieldNameContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.dateFieldName`.
     * @param ctx the parse tree
     */
    exitDateFieldName?: (ctx: DateFieldNameContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.locationValue`.
     * @param ctx the parse tree
     */
    enterLocationValue?: (ctx: LocationValueContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.locationValue`.
     * @param ctx the parse tree
     */
    exitLocationValue?: (ctx: LocationValueContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.coordinateValue`.
     * @param ctx the parse tree
     */
    enterCoordinateValue?: (ctx: CoordinateValueContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.coordinateValue`.
     * @param ctx the parse tree
     */
    exitCoordinateValue?: (ctx: CoordinateValueContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.typeOf`.
     * @param ctx the parse tree
     */
    enterTypeOf?: (ctx: TypeOfContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.typeOf`.
     * @param ctx the parse tree
     */
    exitTypeOf?: (ctx: TypeOfContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.whenClause`.
     * @param ctx the parse tree
     */
    enterWhenClause?: (ctx: WhenClauseContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.whenClause`.
     * @param ctx the parse tree
     */
    exitWhenClause?: (ctx: WhenClauseContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.elseClause`.
     * @param ctx the parse tree
     */
    enterElseClause?: (ctx: ElseClauseContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.elseClause`.
     * @param ctx the parse tree
     */
    exitElseClause?: (ctx: ElseClauseContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.fieldNameList`.
     * @param ctx the parse tree
     */
    enterFieldNameList?: (ctx: FieldNameListContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.fieldNameList`.
     * @param ctx the parse tree
     */
    exitFieldNameList?: (ctx: FieldNameListContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.usingScope`.
     * @param ctx the parse tree
     */
    enterUsingScope?: (ctx: UsingScopeContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.usingScope`.
     * @param ctx the parse tree
     */
    exitUsingScope?: (ctx: UsingScopeContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.whereClause`.
     * @param ctx the parse tree
     */
    enterWhereClause?: (ctx: WhereClauseContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.whereClause`.
     * @param ctx the parse tree
     */
    exitWhereClause?: (ctx: WhereClauseContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.logicalExpression`.
     * @param ctx the parse tree
     */
    enterLogicalExpression?: (ctx: LogicalExpressionContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.logicalExpression`.
     * @param ctx the parse tree
     */
    exitLogicalExpression?: (ctx: LogicalExpressionContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.conditionalExpression`.
     * @param ctx the parse tree
     */
    enterConditionalExpression?: (ctx: ConditionalExpressionContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.conditionalExpression`.
     * @param ctx the parse tree
     */
    exitConditionalExpression?: (ctx: ConditionalExpressionContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.fieldExpression`.
     * @param ctx the parse tree
     */
    enterFieldExpression?: (ctx: FieldExpressionContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.fieldExpression`.
     * @param ctx the parse tree
     */
    exitFieldExpression?: (ctx: FieldExpressionContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.comparisonOperator`.
     * @param ctx the parse tree
     */
    enterComparisonOperator?: (ctx: ComparisonOperatorContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.comparisonOperator`.
     * @param ctx the parse tree
     */
    exitComparisonOperator?: (ctx: ComparisonOperatorContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.value`.
     * @param ctx the parse tree
     */
    enterValue?: (ctx: ValueContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.value`.
     * @param ctx the parse tree
     */
    exitValue?: (ctx: ValueContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.valueList`.
     * @param ctx the parse tree
     */
    enterValueList?: (ctx: ValueListContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.valueList`.
     * @param ctx the parse tree
     */
    exitValueList?: (ctx: ValueListContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.signedNumber`.
     * @param ctx the parse tree
     */
    enterSignedNumber?: (ctx: SignedNumberContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.signedNumber`.
     * @param ctx the parse tree
     */
    exitSignedNumber?: (ctx: SignedNumberContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.withClause`.
     * @param ctx the parse tree
     */
    enterWithClause?: (ctx: WithClauseContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.withClause`.
     * @param ctx the parse tree
     */
    exitWithClause?: (ctx: WithClauseContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.filteringExpression`.
     * @param ctx the parse tree
     */
    enterFilteringExpression?: (ctx: FilteringExpressionContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.filteringExpression`.
     * @param ctx the parse tree
     */
    exitFilteringExpression?: (ctx: FilteringExpressionContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.dataCategorySelection`.
     * @param ctx the parse tree
     */
    enterDataCategorySelection?: (ctx: DataCategorySelectionContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.dataCategorySelection`.
     * @param ctx the parse tree
     */
    exitDataCategorySelection?: (ctx: DataCategorySelectionContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.dataCategoryName`.
     * @param ctx the parse tree
     */
    enterDataCategoryName?: (ctx: DataCategoryNameContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.dataCategoryName`.
     * @param ctx the parse tree
     */
    exitDataCategoryName?: (ctx: DataCategoryNameContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.filteringSelector`.
     * @param ctx the parse tree
     */
    enterFilteringSelector?: (ctx: FilteringSelectorContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.filteringSelector`.
     * @param ctx the parse tree
     */
    exitFilteringSelector?: (ctx: FilteringSelectorContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.groupByClause`.
     * @param ctx the parse tree
     */
    enterGroupByClause?: (ctx: GroupByClauseContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.groupByClause`.
     * @param ctx the parse tree
     */
    exitGroupByClause?: (ctx: GroupByClauseContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.orderByClause`.
     * @param ctx the parse tree
     */
    enterOrderByClause?: (ctx: OrderByClauseContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.orderByClause`.
     * @param ctx the parse tree
     */
    exitOrderByClause?: (ctx: OrderByClauseContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.fieldOrderList`.
     * @param ctx the parse tree
     */
    enterFieldOrderList?: (ctx: FieldOrderListContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.fieldOrderList`.
     * @param ctx the parse tree
     */
    exitFieldOrderList?: (ctx: FieldOrderListContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.fieldOrder`.
     * @param ctx the parse tree
     */
    enterFieldOrder?: (ctx: FieldOrderContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.fieldOrder`.
     * @param ctx the parse tree
     */
    exitFieldOrder?: (ctx: FieldOrderContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.limitClause`.
     * @param ctx the parse tree
     */
    enterLimitClause?: (ctx: LimitClauseContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.limitClause`.
     * @param ctx the parse tree
     */
    exitLimitClause?: (ctx: LimitClauseContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.offsetClause`.
     * @param ctx the parse tree
     */
    enterOffsetClause?: (ctx: OffsetClauseContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.offsetClause`.
     * @param ctx the parse tree
     */
    exitOffsetClause?: (ctx: OffsetClauseContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.allRowsClause`.
     * @param ctx the parse tree
     */
    enterAllRowsClause?: (ctx: AllRowsClauseContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.allRowsClause`.
     * @param ctx the parse tree
     */
    exitAllRowsClause?: (ctx: AllRowsClauseContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.forClauses`.
     * @param ctx the parse tree
     */
    enterForClauses?: (ctx: ForClausesContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.forClauses`.
     * @param ctx the parse tree
     */
    exitForClauses?: (ctx: ForClausesContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.boundExpression`.
     * @param ctx the parse tree
     */
    enterBoundExpression?: (ctx: BoundExpressionContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.boundExpression`.
     * @param ctx the parse tree
     */
    exitBoundExpression?: (ctx: BoundExpressionContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.dateFormula`.
     * @param ctx the parse tree
     */
    enterDateFormula?: (ctx: DateFormulaContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.dateFormula`.
     * @param ctx the parse tree
     */
    exitDateFormula?: (ctx: DateFormulaContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.signedInteger`.
     * @param ctx the parse tree
     */
    enterSignedInteger?: (ctx: SignedIntegerContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.signedInteger`.
     * @param ctx the parse tree
     */
    exitSignedInteger?: (ctx: SignedIntegerContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.soqlId`.
     * @param ctx the parse tree
     */
    enterSoqlId?: (ctx: SoqlIdContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.soqlId`.
     * @param ctx the parse tree
     */
    exitSoqlId?: (ctx: SoqlIdContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.soslLiteral`.
     * @param ctx the parse tree
     */
    enterSoslLiteral?: (ctx: SoslLiteralContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.soslLiteral`.
     * @param ctx the parse tree
     */
    exitSoslLiteral?: (ctx: SoslLiteralContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.soslLiteralAlt`.
     * @param ctx the parse tree
     */
    enterSoslLiteralAlt?: (ctx: SoslLiteralAltContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.soslLiteralAlt`.
     * @param ctx the parse tree
     */
    exitSoslLiteralAlt?: (ctx: SoslLiteralAltContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.soslClauses`.
     * @param ctx the parse tree
     */
    enterSoslClauses?: (ctx: SoslClausesContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.soslClauses`.
     * @param ctx the parse tree
     */
    exitSoslClauses?: (ctx: SoslClausesContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.searchGroup`.
     * @param ctx the parse tree
     */
    enterSearchGroup?: (ctx: SearchGroupContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.searchGroup`.
     * @param ctx the parse tree
     */
    exitSearchGroup?: (ctx: SearchGroupContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.fieldSpecList`.
     * @param ctx the parse tree
     */
    enterFieldSpecList?: (ctx: FieldSpecListContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.fieldSpecList`.
     * @param ctx the parse tree
     */
    exitFieldSpecList?: (ctx: FieldSpecListContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.fieldSpec`.
     * @param ctx the parse tree
     */
    enterFieldSpec?: (ctx: FieldSpecContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.fieldSpec`.
     * @param ctx the parse tree
     */
    exitFieldSpec?: (ctx: FieldSpecContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.fieldList`.
     * @param ctx the parse tree
     */
    enterFieldList?: (ctx: FieldListContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.fieldList`.
     * @param ctx the parse tree
     */
    exitFieldList?: (ctx: FieldListContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.updateList`.
     * @param ctx the parse tree
     */
    enterUpdateList?: (ctx: UpdateListContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.updateList`.
     * @param ctx the parse tree
     */
    exitUpdateList?: (ctx: UpdateListContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.updateType`.
     * @param ctx the parse tree
     */
    enterUpdateType?: (ctx: UpdateTypeContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.updateType`.
     * @param ctx the parse tree
     */
    exitUpdateType?: (ctx: UpdateTypeContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.networkList`.
     * @param ctx the parse tree
     */
    enterNetworkList?: (ctx: NetworkListContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.networkList`.
     * @param ctx the parse tree
     */
    exitNetworkList?: (ctx: NetworkListContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.soslId`.
     * @param ctx the parse tree
     */
    enterSoslId?: (ctx: SoslIdContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.soslId`.
     * @param ctx the parse tree
     */
    exitSoslId?: (ctx: SoslIdContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.id`.
     * @param ctx the parse tree
     */
    enterId?: (ctx: IdContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.id`.
     * @param ctx the parse tree
     */
    exitId?: (ctx: IdContext) => void;
    /**
     * Enter a parse tree produced by `ApexParser.anyId`.
     * @param ctx the parse tree
     */
    enterAnyId?: (ctx: AnyIdContext) => void;
    /**
     * Exit a parse tree produced by `ApexParser.anyId`.
     * @param ctx the parse tree
     */
    exitAnyId?: (ctx: AnyIdContext) => void;
}