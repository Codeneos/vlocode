// eslint-disable-file
// Generated from ./grammar/ApexParser.g4 by ANTLR 4.13.1

import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";

import { ApexParserListener } from "./ApexParserListener.js";
import { ApexParserVisitor } from "./ApexParserVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars

export class ApexParser extends antlr.Parser {
    public static readonly ABSTRACT = 1;
    public static readonly AFTER = 2;
    public static readonly BEFORE = 3;
    public static readonly BREAK = 4;
    public static readonly CATCH = 5;
    public static readonly CLASS = 6;
    public static readonly CONTINUE = 7;
    public static readonly DELETE = 8;
    public static readonly DO = 9;
    public static readonly ELSE = 10;
    public static readonly ENUM = 11;
    public static readonly EXTENDS = 12;
    public static readonly FINAL = 13;
    public static readonly FINALLY = 14;
    public static readonly FOR = 15;
    public static readonly GET = 16;
    public static readonly GLOBAL = 17;
    public static readonly IF = 18;
    public static readonly IMPLEMENTS = 19;
    public static readonly INHERITED = 20;
    public static readonly INSERT = 21;
    public static readonly INSTANCEOF = 22;
    public static readonly INTERFACE = 23;
    public static readonly MERGE = 24;
    public static readonly NEW = 25;
    public static readonly NULL = 26;
    public static readonly ON = 27;
    public static readonly OVERRIDE = 28;
    public static readonly PRIVATE = 29;
    public static readonly PROTECTED = 30;
    public static readonly PUBLIC = 31;
    public static readonly RETURN = 32;
    public static readonly SYSTEMRUNAS = 33;
    public static readonly SET = 34;
    public static readonly SHARING = 35;
    public static readonly STATIC = 36;
    public static readonly SUPER = 37;
    public static readonly SWITCH = 38;
    public static readonly TESTMETHOD = 39;
    public static readonly THIS = 40;
    public static readonly THROW = 41;
    public static readonly TRANSIENT = 42;
    public static readonly TRIGGER = 43;
    public static readonly TRY = 44;
    public static readonly UNDELETE = 45;
    public static readonly UPDATE = 46;
    public static readonly UPSERT = 47;
    public static readonly VIRTUAL = 48;
    public static readonly VOID = 49;
    public static readonly WEBSERVICE = 50;
    public static readonly WHEN = 51;
    public static readonly WHILE = 52;
    public static readonly WITH = 53;
    public static readonly WITHOUT = 54;
    public static readonly LIST = 55;
    public static readonly MAP = 56;
    public static readonly SYSTEM = 57;
    public static readonly USER = 58;
    public static readonly SELECT = 59;
    public static readonly COUNT = 60;
    public static readonly FROM = 61;
    public static readonly AS = 62;
    public static readonly USING = 63;
    public static readonly SCOPE = 64;
    public static readonly WHERE = 65;
    public static readonly ORDER = 66;
    public static readonly BY = 67;
    public static readonly LIMIT = 68;
    public static readonly SOQLAND = 69;
    public static readonly SOQLOR = 70;
    public static readonly NOT = 71;
    public static readonly AVG = 72;
    public static readonly COUNT_DISTINCT = 73;
    public static readonly MIN = 74;
    public static readonly MAX = 75;
    public static readonly SUM = 76;
    public static readonly TYPEOF = 77;
    public static readonly END = 78;
    public static readonly THEN = 79;
    public static readonly LIKE = 80;
    public static readonly IN = 81;
    public static readonly INCLUDES = 82;
    public static readonly EXCLUDES = 83;
    public static readonly ASC = 84;
    public static readonly DESC = 85;
    public static readonly NULLS = 86;
    public static readonly FIRST = 87;
    public static readonly LAST = 88;
    public static readonly GROUP = 89;
    public static readonly ALL = 90;
    public static readonly ROWS = 91;
    public static readonly VIEW = 92;
    public static readonly HAVING = 93;
    public static readonly ROLLUP = 94;
    public static readonly TOLABEL = 95;
    public static readonly OFFSET = 96;
    public static readonly DATA = 97;
    public static readonly CATEGORY = 98;
    public static readonly AT = 99;
    public static readonly ABOVE = 100;
    public static readonly BELOW = 101;
    public static readonly ABOVE_OR_BELOW = 102;
    public static readonly SECURITY_ENFORCED = 103;
    public static readonly SYSTEM_MODE = 104;
    public static readonly USER_MODE = 105;
    public static readonly REFERENCE = 106;
    public static readonly CUBE = 107;
    public static readonly FORMAT = 108;
    public static readonly TRACKING = 109;
    public static readonly VIEWSTAT = 110;
    public static readonly CUSTOM = 111;
    public static readonly STANDARD = 112;
    public static readonly DISTANCE = 113;
    public static readonly GEOLOCATION = 114;
    public static readonly CALENDAR_MONTH = 115;
    public static readonly CALENDAR_QUARTER = 116;
    public static readonly CALENDAR_YEAR = 117;
    public static readonly DAY_IN_MONTH = 118;
    public static readonly DAY_IN_WEEK = 119;
    public static readonly DAY_IN_YEAR = 120;
    public static readonly DAY_ONLY = 121;
    public static readonly FISCAL_MONTH = 122;
    public static readonly FISCAL_QUARTER = 123;
    public static readonly FISCAL_YEAR = 124;
    public static readonly HOUR_IN_DAY = 125;
    public static readonly WEEK_IN_MONTH = 126;
    public static readonly WEEK_IN_YEAR = 127;
    public static readonly CONVERT_TIMEZONE = 128;
    public static readonly YESTERDAY = 129;
    public static readonly TODAY = 130;
    public static readonly TOMORROW = 131;
    public static readonly LAST_WEEK = 132;
    public static readonly THIS_WEEK = 133;
    public static readonly NEXT_WEEK = 134;
    public static readonly LAST_MONTH = 135;
    public static readonly THIS_MONTH = 136;
    public static readonly NEXT_MONTH = 137;
    public static readonly LAST_90_DAYS = 138;
    public static readonly NEXT_90_DAYS = 139;
    public static readonly LAST_N_DAYS_N = 140;
    public static readonly NEXT_N_DAYS_N = 141;
    public static readonly N_DAYS_AGO_N = 142;
    public static readonly NEXT_N_WEEKS_N = 143;
    public static readonly LAST_N_WEEKS_N = 144;
    public static readonly N_WEEKS_AGO_N = 145;
    public static readonly NEXT_N_MONTHS_N = 146;
    public static readonly LAST_N_MONTHS_N = 147;
    public static readonly N_MONTHS_AGO_N = 148;
    public static readonly THIS_QUARTER = 149;
    public static readonly LAST_QUARTER = 150;
    public static readonly NEXT_QUARTER = 151;
    public static readonly NEXT_N_QUARTERS_N = 152;
    public static readonly LAST_N_QUARTERS_N = 153;
    public static readonly N_QUARTERS_AGO_N = 154;
    public static readonly THIS_YEAR = 155;
    public static readonly LAST_YEAR = 156;
    public static readonly NEXT_YEAR = 157;
    public static readonly NEXT_N_YEARS_N = 158;
    public static readonly LAST_N_YEARS_N = 159;
    public static readonly N_YEARS_AGO_N = 160;
    public static readonly THIS_FISCAL_QUARTER = 161;
    public static readonly LAST_FISCAL_QUARTER = 162;
    public static readonly NEXT_FISCAL_QUARTER = 163;
    public static readonly NEXT_N_FISCAL_QUARTERS_N = 164;
    public static readonly LAST_N_FISCAL_QUARTERS_N = 165;
    public static readonly N_FISCAL_QUARTERS_AGO_N = 166;
    public static readonly THIS_FISCAL_YEAR = 167;
    public static readonly LAST_FISCAL_YEAR = 168;
    public static readonly NEXT_FISCAL_YEAR = 169;
    public static readonly NEXT_N_FISCAL_YEARS_N = 170;
    public static readonly LAST_N_FISCAL_YEARS_N = 171;
    public static readonly N_FISCAL_YEARS_AGO_N = 172;
    public static readonly DateLiteral = 173;
    public static readonly DateTimeLiteral = 174;
    public static readonly IntegralCurrencyLiteral = 175;
    public static readonly FIND = 176;
    public static readonly EMAIL = 177;
    public static readonly NAME = 178;
    public static readonly PHONE = 179;
    public static readonly SIDEBAR = 180;
    public static readonly FIELDS = 181;
    public static readonly METADATA = 182;
    public static readonly PRICEBOOKID = 183;
    public static readonly NETWORK = 184;
    public static readonly SNIPPET = 185;
    public static readonly TARGET_LENGTH = 186;
    public static readonly DIVISION = 187;
    public static readonly RETURNING = 188;
    public static readonly LISTVIEW = 189;
    public static readonly FindLiteral = 190;
    public static readonly FindLiteralAlt = 191;
    public static readonly IntegerLiteral = 192;
    public static readonly LongLiteral = 193;
    public static readonly NumberLiteral = 194;
    public static readonly BooleanLiteral = 195;
    public static readonly StringLiteral = 196;
    public static readonly NullLiteral = 197;
    public static readonly LPAREN = 198;
    public static readonly RPAREN = 199;
    public static readonly LBRACE = 200;
    public static readonly RBRACE = 201;
    public static readonly LBRACK = 202;
    public static readonly RBRACK = 203;
    public static readonly SEMI = 204;
    public static readonly COMMA = 205;
    public static readonly DOT = 206;
    public static readonly ASSIGN = 207;
    public static readonly GT = 208;
    public static readonly LT = 209;
    public static readonly BANG = 210;
    public static readonly TILDE = 211;
    public static readonly QUESTIONDOT = 212;
    public static readonly QUESTION = 213;
    public static readonly DOUBLEQUESTION = 214;
    public static readonly COLON = 215;
    public static readonly EQUAL = 216;
    public static readonly TRIPLEEQUAL = 217;
    public static readonly NOTEQUAL = 218;
    public static readonly LESSANDGREATER = 219;
    public static readonly TRIPLENOTEQUAL = 220;
    public static readonly AND = 221;
    public static readonly OR = 222;
    public static readonly INC = 223;
    public static readonly DEC = 224;
    public static readonly ADD = 225;
    public static readonly SUB = 226;
    public static readonly MUL = 227;
    public static readonly DIV = 228;
    public static readonly BITAND = 229;
    public static readonly BITOR = 230;
    public static readonly CARET = 231;
    public static readonly MAPTO = 232;
    public static readonly ADD_ASSIGN = 233;
    public static readonly SUB_ASSIGN = 234;
    public static readonly MUL_ASSIGN = 235;
    public static readonly DIV_ASSIGN = 236;
    public static readonly AND_ASSIGN = 237;
    public static readonly OR_ASSIGN = 238;
    public static readonly XOR_ASSIGN = 239;
    public static readonly LSHIFT_ASSIGN = 240;
    public static readonly RSHIFT_ASSIGN = 241;
    public static readonly URSHIFT_ASSIGN = 242;
    public static readonly ATSIGN = 243;
    public static readonly Identifier = 244;
    public static readonly WS = 245;
    public static readonly DOC_COMMENT = 246;
    public static readonly COMMENT = 247;
    public static readonly LINE_COMMENT = 248;
    public static readonly RULE_compilationUnit = 0;
    public static readonly RULE_typeDeclaration = 1;
    public static readonly RULE_classDeclaration = 2;
    public static readonly RULE_enumDeclaration = 3;
    public static readonly RULE_enumConstants = 4;
    public static readonly RULE_triggerDeclaration = 5;
    public static readonly RULE_triggerEvent = 6;
    public static readonly RULE_interfaceDeclaration = 7;
    public static readonly RULE_typeList = 8;
    public static readonly RULE_classBody = 9;
    public static readonly RULE_interfaceBody = 10;
    public static readonly RULE_classBodyDeclaration = 11;
    public static readonly RULE_modifier = 12;
    public static readonly RULE_memberDeclaration = 13;
    public static readonly RULE_methodDeclaration = 14;
    public static readonly RULE_constructorDeclaration = 15;
    public static readonly RULE_fieldDeclaration = 16;
    public static readonly RULE_propertyDeclaration = 17;
    public static readonly RULE_interfaceMethodDeclaration = 18;
    public static readonly RULE_variableDeclarators = 19;
    public static readonly RULE_variableDeclarator = 20;
    public static readonly RULE_arrayInitializer = 21;
    public static readonly RULE_typeRef = 22;
    public static readonly RULE_arraySubscripts = 23;
    public static readonly RULE_typeName = 24;
    public static readonly RULE_typeArguments = 25;
    public static readonly RULE_formalParameters = 26;
    public static readonly RULE_formalParameterList = 27;
    public static readonly RULE_formalParameter = 28;
    public static readonly RULE_qualifiedName = 29;
    public static readonly RULE_literal = 30;
    public static readonly RULE_annotation = 31;
    public static readonly RULE_elementValuePairs = 32;
    public static readonly RULE_elementValuePair = 33;
    public static readonly RULE_elementValue = 34;
    public static readonly RULE_elementValueArrayInitializer = 35;
    public static readonly RULE_block = 36;
    public static readonly RULE_localVariableDeclarationStatement = 37;
    public static readonly RULE_localVariableDeclaration = 38;
    public static readonly RULE_statement = 39;
    public static readonly RULE_ifStatement = 40;
    public static readonly RULE_switchStatement = 41;
    public static readonly RULE_whenControl = 42;
    public static readonly RULE_whenValue = 43;
    public static readonly RULE_whenLiteral = 44;
    public static readonly RULE_forStatement = 45;
    public static readonly RULE_whileStatement = 46;
    public static readonly RULE_doWhileStatement = 47;
    public static readonly RULE_tryStatement = 48;
    public static readonly RULE_returnStatement = 49;
    public static readonly RULE_throwStatement = 50;
    public static readonly RULE_breakStatement = 51;
    public static readonly RULE_continueStatement = 52;
    public static readonly RULE_accessLevel = 53;
    public static readonly RULE_insertStatement = 54;
    public static readonly RULE_updateStatement = 55;
    public static readonly RULE_deleteStatement = 56;
    public static readonly RULE_undeleteStatement = 57;
    public static readonly RULE_upsertStatement = 58;
    public static readonly RULE_mergeStatement = 59;
    public static readonly RULE_runAsStatement = 60;
    public static readonly RULE_expressionStatement = 61;
    public static readonly RULE_propertyBlock = 62;
    public static readonly RULE_getter = 63;
    public static readonly RULE_setter = 64;
    public static readonly RULE_catchClause = 65;
    public static readonly RULE_finallyBlock = 66;
    public static readonly RULE_forControl = 67;
    public static readonly RULE_forInit = 68;
    public static readonly RULE_enhancedForControl = 69;
    public static readonly RULE_forUpdate = 70;
    public static readonly RULE_parExpression = 71;
    public static readonly RULE_expressionList = 72;
    public static readonly RULE_expression = 73;
    public static readonly RULE_primary = 74;
    public static readonly RULE_methodCall = 75;
    public static readonly RULE_dotMethodCall = 76;
    public static readonly RULE_creator = 77;
    public static readonly RULE_createdName = 78;
    public static readonly RULE_idCreatedNamePair = 79;
    public static readonly RULE_noRest = 80;
    public static readonly RULE_classCreatorRest = 81;
    public static readonly RULE_arrayCreatorRest = 82;
    public static readonly RULE_mapCreatorRest = 83;
    public static readonly RULE_mapCreatorRestPair = 84;
    public static readonly RULE_setCreatorRest = 85;
    public static readonly RULE_arguments = 86;
    public static readonly RULE_soqlLiteral = 87;
    public static readonly RULE_query = 88;
    public static readonly RULE_subQuery = 89;
    public static readonly RULE_selectList = 90;
    public static readonly RULE_selectEntry = 91;
    public static readonly RULE_fieldName = 92;
    public static readonly RULE_fromNameList = 93;
    public static readonly RULE_subFieldList = 94;
    public static readonly RULE_subFieldEntry = 95;
    public static readonly RULE_soqlFieldsParameter = 96;
    public static readonly RULE_soqlFunction = 97;
    public static readonly RULE_dateFieldName = 98;
    public static readonly RULE_locationValue = 99;
    public static readonly RULE_coordinateValue = 100;
    public static readonly RULE_typeOf = 101;
    public static readonly RULE_whenClause = 102;
    public static readonly RULE_elseClause = 103;
    public static readonly RULE_fieldNameList = 104;
    public static readonly RULE_usingScope = 105;
    public static readonly RULE_whereClause = 106;
    public static readonly RULE_logicalExpression = 107;
    public static readonly RULE_conditionalExpression = 108;
    public static readonly RULE_fieldExpression = 109;
    public static readonly RULE_comparisonOperator = 110;
    public static readonly RULE_value = 111;
    public static readonly RULE_valueList = 112;
    public static readonly RULE_signedNumber = 113;
    public static readonly RULE_withClause = 114;
    public static readonly RULE_filteringExpression = 115;
    public static readonly RULE_dataCategorySelection = 116;
    public static readonly RULE_dataCategoryName = 117;
    public static readonly RULE_filteringSelector = 118;
    public static readonly RULE_groupByClause = 119;
    public static readonly RULE_orderByClause = 120;
    public static readonly RULE_fieldOrderList = 121;
    public static readonly RULE_fieldOrder = 122;
    public static readonly RULE_limitClause = 123;
    public static readonly RULE_offsetClause = 124;
    public static readonly RULE_allRowsClause = 125;
    public static readonly RULE_forClauses = 126;
    public static readonly RULE_boundExpression = 127;
    public static readonly RULE_dateFormula = 128;
    public static readonly RULE_signedInteger = 129;
    public static readonly RULE_soqlId = 130;
    public static readonly RULE_soslLiteral = 131;
    public static readonly RULE_soslLiteralAlt = 132;
    public static readonly RULE_soslClauses = 133;
    public static readonly RULE_searchGroup = 134;
    public static readonly RULE_fieldSpecList = 135;
    public static readonly RULE_fieldSpec = 136;
    public static readonly RULE_fieldList = 137;
    public static readonly RULE_updateList = 138;
    public static readonly RULE_updateType = 139;
    public static readonly RULE_networkList = 140;
    public static readonly RULE_soslId = 141;
    public static readonly RULE_id = 142;
    public static readonly RULE_anyId = 143;

    public static readonly literalNames = [
        null, "'abstract'", "'after'", "'before'", "'break'", "'catch'", 
        "'class'", "'continue'", "'delete'", "'do'", "'else'", "'enum'", 
        "'extends'", "'final'", "'finally'", "'for'", "'get'", "'global'", 
        "'if'", "'implements'", "'inherited'", "'insert'", "'instanceof'", 
        "'interface'", "'merge'", "'new'", "'null'", "'on'", "'override'", 
        "'private'", "'protected'", "'public'", "'return'", "'system.runas'", 
        "'set'", "'sharing'", "'static'", "'super'", "'switch'", "'testmethod'", 
        "'this'", "'throw'", "'transient'", "'trigger'", "'try'", "'undelete'", 
        "'update'", "'upsert'", "'virtual'", "'void'", "'webservice'", "'when'", 
        "'while'", "'with'", "'without'", "'list'", "'map'", "'system'", 
        "'user'", "'select'", "'count'", "'from'", "'as'", "'using'", "'scope'", 
        "'where'", "'order'", "'by'", "'limit'", "'and'", "'or'", "'not'", 
        "'avg'", "'count_distinct'", "'min'", "'max'", "'sum'", "'typeof'", 
        "'end'", "'then'", "'like'", "'in'", "'includes'", "'excludes'", 
        "'asc'", "'desc'", "'nulls'", "'first'", "'last'", "'group'", "'all'", 
        "'rows'", "'view'", "'having'", "'rollup'", "'tolabel'", "'offset'", 
        "'data'", "'category'", "'at'", "'above'", "'below'", "'above_or_below'", 
        "'security_enforced'", "'system_mode'", "'user_mode'", "'reference'", 
        "'cube'", "'format'", "'tracking'", "'viewstat'", "'custom'", "'standard'", 
        "'distance'", "'geolocation'", "'calendar_month'", "'calendar_quarter'", 
        "'calendar_year'", "'day_in_month'", "'day_in_week'", "'day_in_year'", 
        "'day_only'", "'fiscal_month'", "'fiscal_quarter'", "'fiscal_year'", 
        "'hour_in_day'", "'week_in_month'", "'week_in_year'", "'converttimezone'", 
        "'yesterday'", "'today'", "'tomorrow'", "'last_week'", "'this_week'", 
        "'next_week'", "'last_month'", "'this_month'", "'next_month'", "'last_90_days'", 
        "'next_90_days'", "'last_n_days'", "'next_n_days'", "'n_days_ago'", 
        "'next_n_weeks'", "'last_n_weeks'", "'n_weeks_ago'", "'next_n_months'", 
        "'last_n_months'", "'n_months_ago'", "'this_quarter'", "'last_quarter'", 
        "'next_quarter'", "'next_n_quarters'", "'last_n_quarters'", "'n_quarters_ago'", 
        "'this_year'", "'last_year'", "'next_year'", "'next_n_years'", "'last_n_years'", 
        "'n_years_ago'", "'this_fiscal_quarter'", "'last_fiscal_quarter'", 
        "'next_fiscal_quarter'", "'next_n_fiscal_quarters'", "'last_n_fiscal_quarters'", 
        "'n_fiscal_quarters_ago'", "'this_fiscal_year'", "'last_fiscal_year'", 
        "'next_fiscal_year'", "'next_n_fiscal_years'", "'last_n_fiscal_years'", 
        "'n_fiscal_years_ago'", null, null, null, "'find'", "'email'", "'name'", 
        "'phone'", "'sidebar'", "'fields'", "'metadata'", "'pricebookid'", 
        "'network'", "'snippet'", "'target_length'", "'division'", "'returning'", 
        "'listview'", null, null, null, null, null, null, null, null, "'('", 
        "')'", "'{'", "'}'", "'['", "']'", "';'", "','", "'.'", "'='", "'>'", 
        "'<'", "'!'", "'~'", "'?.'", "'?'", "'??'", "':'", "'=='", "'==='", 
        "'!='", "'<>'", "'!=='", "'&&'", "'||'", "'++'", "'--'", "'+'", 
        "'-'", "'*'", "'/'", "'&'", "'|'", "'^'", "'=>'", "'+='", "'-='", 
        "'*='", "'/='", "'&='", "'|='", "'^='", "'<<='", "'>>='", "'>>>='", 
        "'@'"
    ];

    public static readonly symbolicNames = [
        null, "ABSTRACT", "AFTER", "BEFORE", "BREAK", "CATCH", "CLASS", 
        "CONTINUE", "DELETE", "DO", "ELSE", "ENUM", "EXTENDS", "FINAL", 
        "FINALLY", "FOR", "GET", "GLOBAL", "IF", "IMPLEMENTS", "INHERITED", 
        "INSERT", "INSTANCEOF", "INTERFACE", "MERGE", "NEW", "NULL", "ON", 
        "OVERRIDE", "PRIVATE", "PROTECTED", "PUBLIC", "RETURN", "SYSTEMRUNAS", 
        "SET", "SHARING", "STATIC", "SUPER", "SWITCH", "TESTMETHOD", "THIS", 
        "THROW", "TRANSIENT", "TRIGGER", "TRY", "UNDELETE", "UPDATE", "UPSERT", 
        "VIRTUAL", "VOID", "WEBSERVICE", "WHEN", "WHILE", "WITH", "WITHOUT", 
        "LIST", "MAP", "SYSTEM", "USER", "SELECT", "COUNT", "FROM", "AS", 
        "USING", "SCOPE", "WHERE", "ORDER", "BY", "LIMIT", "SOQLAND", "SOQLOR", 
        "NOT", "AVG", "COUNT_DISTINCT", "MIN", "MAX", "SUM", "TYPEOF", "END", 
        "THEN", "LIKE", "IN", "INCLUDES", "EXCLUDES", "ASC", "DESC", "NULLS", 
        "FIRST", "LAST", "GROUP", "ALL", "ROWS", "VIEW", "HAVING", "ROLLUP", 
        "TOLABEL", "OFFSET", "DATA", "CATEGORY", "AT", "ABOVE", "BELOW", 
        "ABOVE_OR_BELOW", "SECURITY_ENFORCED", "SYSTEM_MODE", "USER_MODE", 
        "REFERENCE", "CUBE", "FORMAT", "TRACKING", "VIEWSTAT", "CUSTOM", 
        "STANDARD", "DISTANCE", "GEOLOCATION", "CALENDAR_MONTH", "CALENDAR_QUARTER", 
        "CALENDAR_YEAR", "DAY_IN_MONTH", "DAY_IN_WEEK", "DAY_IN_YEAR", "DAY_ONLY", 
        "FISCAL_MONTH", "FISCAL_QUARTER", "FISCAL_YEAR", "HOUR_IN_DAY", 
        "WEEK_IN_MONTH", "WEEK_IN_YEAR", "CONVERT_TIMEZONE", "YESTERDAY", 
        "TODAY", "TOMORROW", "LAST_WEEK", "THIS_WEEK", "NEXT_WEEK", "LAST_MONTH", 
        "THIS_MONTH", "NEXT_MONTH", "LAST_90_DAYS", "NEXT_90_DAYS", "LAST_N_DAYS_N", 
        "NEXT_N_DAYS_N", "N_DAYS_AGO_N", "NEXT_N_WEEKS_N", "LAST_N_WEEKS_N", 
        "N_WEEKS_AGO_N", "NEXT_N_MONTHS_N", "LAST_N_MONTHS_N", "N_MONTHS_AGO_N", 
        "THIS_QUARTER", "LAST_QUARTER", "NEXT_QUARTER", "NEXT_N_QUARTERS_N", 
        "LAST_N_QUARTERS_N", "N_QUARTERS_AGO_N", "THIS_YEAR", "LAST_YEAR", 
        "NEXT_YEAR", "NEXT_N_YEARS_N", "LAST_N_YEARS_N", "N_YEARS_AGO_N", 
        "THIS_FISCAL_QUARTER", "LAST_FISCAL_QUARTER", "NEXT_FISCAL_QUARTER", 
        "NEXT_N_FISCAL_QUARTERS_N", "LAST_N_FISCAL_QUARTERS_N", "N_FISCAL_QUARTERS_AGO_N", 
        "THIS_FISCAL_YEAR", "LAST_FISCAL_YEAR", "NEXT_FISCAL_YEAR", "NEXT_N_FISCAL_YEARS_N", 
        "LAST_N_FISCAL_YEARS_N", "N_FISCAL_YEARS_AGO_N", "DateLiteral", 
        "DateTimeLiteral", "IntegralCurrencyLiteral", "FIND", "EMAIL", "NAME", 
        "PHONE", "SIDEBAR", "FIELDS", "METADATA", "PRICEBOOKID", "NETWORK", 
        "SNIPPET", "TARGET_LENGTH", "DIVISION", "RETURNING", "LISTVIEW", 
        "FindLiteral", "FindLiteralAlt", "IntegerLiteral", "LongLiteral", 
        "NumberLiteral", "BooleanLiteral", "StringLiteral", "NullLiteral", 
        "LPAREN", "RPAREN", "LBRACE", "RBRACE", "LBRACK", "RBRACK", "SEMI", 
        "COMMA", "DOT", "ASSIGN", "GT", "LT", "BANG", "TILDE", "QUESTIONDOT", 
        "QUESTION", "DOUBLEQUESTION", "COLON", "EQUAL", "TRIPLEEQUAL", "NOTEQUAL", 
        "LESSANDGREATER", "TRIPLENOTEQUAL", "AND", "OR", "INC", "DEC", "ADD", 
        "SUB", "MUL", "DIV", "BITAND", "BITOR", "CARET", "MAPTO", "ADD_ASSIGN", 
        "SUB_ASSIGN", "MUL_ASSIGN", "DIV_ASSIGN", "AND_ASSIGN", "OR_ASSIGN", 
        "XOR_ASSIGN", "LSHIFT_ASSIGN", "RSHIFT_ASSIGN", "URSHIFT_ASSIGN", 
        "ATSIGN", "Identifier", "WS", "DOC_COMMENT", "COMMENT", "LINE_COMMENT"
    ];
    public static readonly ruleNames = [
        "compilationUnit", "typeDeclaration", "classDeclaration", "enumDeclaration", 
        "enumConstants", "triggerDeclaration", "triggerEvent", "interfaceDeclaration", 
        "typeList", "classBody", "interfaceBody", "classBodyDeclaration", 
        "modifier", "memberDeclaration", "methodDeclaration", "constructorDeclaration", 
        "fieldDeclaration", "propertyDeclaration", "interfaceMethodDeclaration", 
        "variableDeclarators", "variableDeclarator", "arrayInitializer", 
        "typeRef", "arraySubscripts", "typeName", "typeArguments", "formalParameters", 
        "formalParameterList", "formalParameter", "qualifiedName", "literal", 
        "annotation", "elementValuePairs", "elementValuePair", "elementValue", 
        "elementValueArrayInitializer", "block", "localVariableDeclarationStatement", 
        "localVariableDeclaration", "statement", "ifStatement", "switchStatement", 
        "whenControl", "whenValue", "whenLiteral", "forStatement", "whileStatement", 
        "doWhileStatement", "tryStatement", "returnStatement", "throwStatement", 
        "breakStatement", "continueStatement", "accessLevel", "insertStatement", 
        "updateStatement", "deleteStatement", "undeleteStatement", "upsertStatement", 
        "mergeStatement", "runAsStatement", "expressionStatement", "propertyBlock", 
        "getter", "setter", "catchClause", "finallyBlock", "forControl", 
        "forInit", "enhancedForControl", "forUpdate", "parExpression", "expressionList", 
        "expression", "primary", "methodCall", "dotMethodCall", "creator", 
        "createdName", "idCreatedNamePair", "noRest", "classCreatorRest", 
        "arrayCreatorRest", "mapCreatorRest", "mapCreatorRestPair", "setCreatorRest", 
        "arguments", "soqlLiteral", "query", "subQuery", "selectList", "selectEntry", 
        "fieldName", "fromNameList", "subFieldList", "subFieldEntry", "soqlFieldsParameter", 
        "soqlFunction", "dateFieldName", "locationValue", "coordinateValue", 
        "typeOf", "whenClause", "elseClause", "fieldNameList", "usingScope", 
        "whereClause", "logicalExpression", "conditionalExpression", "fieldExpression", 
        "comparisonOperator", "value", "valueList", "signedNumber", "withClause", 
        "filteringExpression", "dataCategorySelection", "dataCategoryName", 
        "filteringSelector", "groupByClause", "orderByClause", "fieldOrderList", 
        "fieldOrder", "limitClause", "offsetClause", "allRowsClause", "forClauses", 
        "boundExpression", "dateFormula", "signedInteger", "soqlId", "soslLiteral", 
        "soslLiteralAlt", "soslClauses", "searchGroup", "fieldSpecList", 
        "fieldSpec", "fieldList", "updateList", "updateType", "networkList", 
        "soslId", "id", "anyId",
    ];

    public get grammarFileName(): string { return "ApexParser.g4"; }
    public get literalNames(): (string | null)[] { return ApexParser.literalNames; }
    public get symbolicNames(): (string | null)[] { return ApexParser.symbolicNames; }
    public get ruleNames(): string[] { return ApexParser.ruleNames; }
    public get serializedATN(): number[] { return ApexParser._serializedATN; }

    protected createFailedPredicateException(predicate?: string, message?: string): antlr.FailedPredicateException {
        return new antlr.FailedPredicateException(this, predicate, message);
    }

    public constructor(input: antlr.TokenStream) {
        super(input);
        this.interpreter = new antlr.ParserATNSimulator(this, ApexParser._ATN, ApexParser.decisionsToDFA, new antlr.PredictionContextCache());
    }
    public compilationUnit(): CompilationUnitContext {
        let localContext = new CompilationUnitContext(this.context, this.state);
        this.enterRule(localContext, 0, ApexParser.RULE_compilationUnit);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 291;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4036110402) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & 413897) !== 0) || _la === 243) {
                {
                {
                this.state = 288;
                this.typeDeclaration();
                }
                }
                this.state = 293;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 294;
            this.match(ApexParser.EOF);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public typeDeclaration(): TypeDeclarationContext {
        let localContext = new TypeDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 2, ApexParser.RULE_typeDeclaration);
        try {
            this.state = 300;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 1, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 296;
                this.triggerDeclaration();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 297;
                this.classDeclaration();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 298;
                this.enumDeclaration();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 299;
                this.interfaceDeclaration();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public classDeclaration(): ClassDeclarationContext {
        let localContext = new ClassDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 4, ApexParser.RULE_classDeclaration);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 305;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4027719682) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & 413769) !== 0) || _la === 243) {
                {
                {
                this.state = 302;
                this.modifier();
                }
                }
                this.state = 307;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 308;
            this.match(ApexParser.CLASS);
            this.state = 309;
            this.id();
            this.state = 312;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 12) {
                {
                this.state = 310;
                this.match(ApexParser.EXTENDS);
                this.state = 311;
                this.typeRef();
                }
            }

            this.state = 316;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 19) {
                {
                this.state = 314;
                this.match(ApexParser.IMPLEMENTS);
                this.state = 315;
                this.typeList();
                }
            }

            this.state = 318;
            this.classBody();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public enumDeclaration(): EnumDeclarationContext {
        let localContext = new EnumDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 6, ApexParser.RULE_enumDeclaration);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 323;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4027719682) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & 413769) !== 0) || _la === 243) {
                {
                {
                this.state = 320;
                this.modifier();
                }
                }
                this.state = 325;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 326;
            this.match(ApexParser.ENUM);
            this.state = 327;
            this.id();
            this.state = 328;
            this.match(ApexParser.LBRACE);
            this.state = 330;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 5308428) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4288283411) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 268429311) !== 0) || _la === 244) {
                {
                this.state = 329;
                this.enumConstants();
                }
            }

            this.state = 332;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public enumConstants(): EnumConstantsContext {
        let localContext = new EnumConstantsContext(this.context, this.state);
        this.enterRule(localContext, 8, ApexParser.RULE_enumConstants);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 334;
            this.id();
            this.state = 339;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 335;
                this.match(ApexParser.COMMA);
                this.state = 336;
                this.id();
                }
                }
                this.state = 341;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public triggerDeclaration(): TriggerDeclarationContext {
        let localContext = new TriggerDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 10, ApexParser.RULE_triggerDeclaration);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 342;
            this.match(ApexParser.TRIGGER);
            this.state = 343;
            this.id();
            this.state = 344;
            this.match(ApexParser.ON);
            this.state = 345;
            localContext._sobject = this.id();
            this.state = 346;
            this.match(ApexParser.LPAREN);
            this.state = 347;
            this.triggerEvent();
            this.state = 352;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 348;
                this.match(ApexParser.COMMA);
                this.state = 349;
                this.triggerEvent();
                }
                }
                this.state = 354;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 355;
            this.match(ApexParser.RPAREN);
            this.state = 356;
            this.block();
            this.state = 357;
            this.match(ApexParser.EOF);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public triggerEvent(): TriggerEventContext {
        let localContext = new TriggerEventContext(this.context, this.state);
        this.enterRule(localContext, 12, ApexParser.RULE_triggerEvent);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 359;
            localContext._when = this.tokenStream.LT(1);
            _la = this.tokenStream.LA(1);
            if(!(_la === 2 || _la === 3)) {
                localContext._when = this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 360;
            localContext._operation = this.tokenStream.LT(1);
            _la = this.tokenStream.LA(1);
            if(!(_la === 8 || _la === 21 || _la === 45 || _la === 46)) {
                localContext._operation = this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public interfaceDeclaration(): InterfaceDeclarationContext {
        let localContext = new InterfaceDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 14, ApexParser.RULE_interfaceDeclaration);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 365;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4027719682) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & 413769) !== 0) || _la === 243) {
                {
                {
                this.state = 362;
                this.modifier();
                }
                }
                this.state = 367;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 368;
            this.match(ApexParser.INTERFACE);
            this.state = 369;
            this.id();
            this.state = 372;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 12) {
                {
                this.state = 370;
                this.match(ApexParser.EXTENDS);
                this.state = 371;
                this.typeList();
                }
            }

            this.state = 374;
            this.interfaceBody();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public typeList(): TypeListContext {
        let localContext = new TypeListContext(this.context, this.state);
        this.enterRule(localContext, 16, ApexParser.RULE_typeList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 376;
            this.typeRef();
            this.state = 381;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 377;
                this.match(ApexParser.COMMA);
                this.state = 378;
                this.typeRef();
                }
                }
                this.state = 383;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public classBody(): ClassBodyContext {
        let localContext = new ClassBodyContext(this.context, this.state);
        this.enterRule(localContext, 18, ApexParser.RULE_classBody);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 384;
            this.match(ApexParser.LBRACE);
            this.state = 388;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4040370254) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294689591) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 268429311) !== 0) || _la === 200 || _la === 204 || _la === 243 || _la === 244) {
                {
                {
                this.state = 385;
                this.classBodyDeclaration();
                }
                }
                this.state = 390;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 391;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public interfaceBody(): InterfaceBodyContext {
        let localContext = new InterfaceBodyContext(this.context, this.state);
        this.enterRule(localContext, 20, ApexParser.RULE_interfaceBody);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 393;
            this.match(ApexParser.LBRACE);
            this.state = 397;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4031979534) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294689591) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 268429311) !== 0) || _la === 243 || _la === 244) {
                {
                {
                this.state = 394;
                this.interfaceMethodDeclaration();
                }
                }
                this.state = 399;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 400;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public classBodyDeclaration(): ClassBodyDeclarationContext {
        let localContext = new ClassBodyDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 22, ApexParser.RULE_classBodyDeclaration);
        let _la: number;
        try {
            let alternative: number;
            this.state = 414;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 16, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 402;
                this.match(ApexParser.SEMI);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 404;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 36) {
                    {
                    this.state = 403;
                    this.match(ApexParser.STATIC);
                    }
                }

                this.state = 406;
                this.block();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 410;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 15, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 407;
                        this.modifier();
                        }
                        }
                    }
                    this.state = 412;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 15, this.context);
                }
                this.state = 413;
                this.memberDeclaration();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public modifier(): ModifierContext {
        let localContext = new ModifierContext(this.context, this.state);
        this.enterRule(localContext, 24, ApexParser.RULE_modifier);
        try {
            this.state = 435;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.ATSIGN:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 416;
                this.annotation();
                }
                break;
            case ApexParser.GLOBAL:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 417;
                this.match(ApexParser.GLOBAL);
                }
                break;
            case ApexParser.PUBLIC:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 418;
                this.match(ApexParser.PUBLIC);
                }
                break;
            case ApexParser.PROTECTED:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 419;
                this.match(ApexParser.PROTECTED);
                }
                break;
            case ApexParser.PRIVATE:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 420;
                this.match(ApexParser.PRIVATE);
                }
                break;
            case ApexParser.TRANSIENT:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 421;
                this.match(ApexParser.TRANSIENT);
                }
                break;
            case ApexParser.STATIC:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 422;
                this.match(ApexParser.STATIC);
                }
                break;
            case ApexParser.ABSTRACT:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 423;
                this.match(ApexParser.ABSTRACT);
                }
                break;
            case ApexParser.FINAL:
                this.enterOuterAlt(localContext, 9);
                {
                this.state = 424;
                this.match(ApexParser.FINAL);
                }
                break;
            case ApexParser.WEBSERVICE:
                this.enterOuterAlt(localContext, 10);
                {
                this.state = 425;
                this.match(ApexParser.WEBSERVICE);
                }
                break;
            case ApexParser.OVERRIDE:
                this.enterOuterAlt(localContext, 11);
                {
                this.state = 426;
                this.match(ApexParser.OVERRIDE);
                }
                break;
            case ApexParser.VIRTUAL:
                this.enterOuterAlt(localContext, 12);
                {
                this.state = 427;
                this.match(ApexParser.VIRTUAL);
                }
                break;
            case ApexParser.TESTMETHOD:
                this.enterOuterAlt(localContext, 13);
                {
                this.state = 428;
                this.match(ApexParser.TESTMETHOD);
                }
                break;
            case ApexParser.WITH:
                this.enterOuterAlt(localContext, 14);
                {
                this.state = 429;
                this.match(ApexParser.WITH);
                this.state = 430;
                this.match(ApexParser.SHARING);
                }
                break;
            case ApexParser.WITHOUT:
                this.enterOuterAlt(localContext, 15);
                {
                this.state = 431;
                this.match(ApexParser.WITHOUT);
                this.state = 432;
                this.match(ApexParser.SHARING);
                }
                break;
            case ApexParser.INHERITED:
                this.enterOuterAlt(localContext, 16);
                {
                this.state = 433;
                this.match(ApexParser.INHERITED);
                this.state = 434;
                this.match(ApexParser.SHARING);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public memberDeclaration(): MemberDeclarationContext {
        let localContext = new MemberDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 26, ApexParser.RULE_memberDeclaration);
        try {
            this.state = 444;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 18, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 437;
                this.methodDeclaration();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 438;
                this.fieldDeclaration();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 439;
                this.constructorDeclaration();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 440;
                this.interfaceDeclaration();
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 441;
                this.classDeclaration();
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 442;
                this.enumDeclaration();
                }
                break;
            case 7:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 443;
                this.propertyDeclaration();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public methodDeclaration(): MethodDeclarationContext {
        let localContext = new MethodDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 28, ApexParser.RULE_methodDeclaration);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 448;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.AFTER:
            case ApexParser.BEFORE:
            case ApexParser.GET:
            case ApexParser.INHERITED:
            case ApexParser.INSTANCEOF:
            case ApexParser.SET:
            case ApexParser.SHARING:
            case ApexParser.SWITCH:
            case ApexParser.TRANSIENT:
            case ApexParser.TRIGGER:
            case ApexParser.WHEN:
            case ApexParser.WITH:
            case ApexParser.WITHOUT:
            case ApexParser.LIST:
            case ApexParser.MAP:
            case ApexParser.SYSTEM:
            case ApexParser.USER:
            case ApexParser.SELECT:
            case ApexParser.COUNT:
            case ApexParser.FROM:
            case ApexParser.AS:
            case ApexParser.USING:
            case ApexParser.SCOPE:
            case ApexParser.WHERE:
            case ApexParser.ORDER:
            case ApexParser.BY:
            case ApexParser.LIMIT:
            case ApexParser.SOQLAND:
            case ApexParser.SOQLOR:
            case ApexParser.NOT:
            case ApexParser.AVG:
            case ApexParser.COUNT_DISTINCT:
            case ApexParser.MIN:
            case ApexParser.MAX:
            case ApexParser.SUM:
            case ApexParser.TYPEOF:
            case ApexParser.END:
            case ApexParser.THEN:
            case ApexParser.LIKE:
            case ApexParser.IN:
            case ApexParser.INCLUDES:
            case ApexParser.EXCLUDES:
            case ApexParser.ASC:
            case ApexParser.DESC:
            case ApexParser.NULLS:
            case ApexParser.FIRST:
            case ApexParser.LAST:
            case ApexParser.GROUP:
            case ApexParser.ALL:
            case ApexParser.ROWS:
            case ApexParser.VIEW:
            case ApexParser.HAVING:
            case ApexParser.ROLLUP:
            case ApexParser.TOLABEL:
            case ApexParser.OFFSET:
            case ApexParser.DATA:
            case ApexParser.CATEGORY:
            case ApexParser.AT:
            case ApexParser.ABOVE:
            case ApexParser.BELOW:
            case ApexParser.ABOVE_OR_BELOW:
            case ApexParser.SECURITY_ENFORCED:
            case ApexParser.SYSTEM_MODE:
            case ApexParser.USER_MODE:
            case ApexParser.REFERENCE:
            case ApexParser.CUBE:
            case ApexParser.FORMAT:
            case ApexParser.TRACKING:
            case ApexParser.VIEWSTAT:
            case ApexParser.CUSTOM:
            case ApexParser.STANDARD:
            case ApexParser.DISTANCE:
            case ApexParser.GEOLOCATION:
            case ApexParser.CALENDAR_MONTH:
            case ApexParser.CALENDAR_QUARTER:
            case ApexParser.CALENDAR_YEAR:
            case ApexParser.DAY_IN_MONTH:
            case ApexParser.DAY_IN_WEEK:
            case ApexParser.DAY_IN_YEAR:
            case ApexParser.DAY_ONLY:
            case ApexParser.FISCAL_MONTH:
            case ApexParser.FISCAL_QUARTER:
            case ApexParser.FISCAL_YEAR:
            case ApexParser.HOUR_IN_DAY:
            case ApexParser.WEEK_IN_MONTH:
            case ApexParser.WEEK_IN_YEAR:
            case ApexParser.CONVERT_TIMEZONE:
            case ApexParser.YESTERDAY:
            case ApexParser.TODAY:
            case ApexParser.TOMORROW:
            case ApexParser.LAST_WEEK:
            case ApexParser.THIS_WEEK:
            case ApexParser.NEXT_WEEK:
            case ApexParser.LAST_MONTH:
            case ApexParser.THIS_MONTH:
            case ApexParser.NEXT_MONTH:
            case ApexParser.LAST_90_DAYS:
            case ApexParser.NEXT_90_DAYS:
            case ApexParser.LAST_N_DAYS_N:
            case ApexParser.NEXT_N_DAYS_N:
            case ApexParser.N_DAYS_AGO_N:
            case ApexParser.NEXT_N_WEEKS_N:
            case ApexParser.LAST_N_WEEKS_N:
            case ApexParser.N_WEEKS_AGO_N:
            case ApexParser.NEXT_N_MONTHS_N:
            case ApexParser.LAST_N_MONTHS_N:
            case ApexParser.N_MONTHS_AGO_N:
            case ApexParser.THIS_QUARTER:
            case ApexParser.LAST_QUARTER:
            case ApexParser.NEXT_QUARTER:
            case ApexParser.NEXT_N_QUARTERS_N:
            case ApexParser.LAST_N_QUARTERS_N:
            case ApexParser.N_QUARTERS_AGO_N:
            case ApexParser.THIS_YEAR:
            case ApexParser.LAST_YEAR:
            case ApexParser.NEXT_YEAR:
            case ApexParser.NEXT_N_YEARS_N:
            case ApexParser.LAST_N_YEARS_N:
            case ApexParser.N_YEARS_AGO_N:
            case ApexParser.THIS_FISCAL_QUARTER:
            case ApexParser.LAST_FISCAL_QUARTER:
            case ApexParser.NEXT_FISCAL_QUARTER:
            case ApexParser.NEXT_N_FISCAL_QUARTERS_N:
            case ApexParser.LAST_N_FISCAL_QUARTERS_N:
            case ApexParser.N_FISCAL_QUARTERS_AGO_N:
            case ApexParser.THIS_FISCAL_YEAR:
            case ApexParser.LAST_FISCAL_YEAR:
            case ApexParser.NEXT_FISCAL_YEAR:
            case ApexParser.NEXT_N_FISCAL_YEARS_N:
            case ApexParser.LAST_N_FISCAL_YEARS_N:
            case ApexParser.N_FISCAL_YEARS_AGO_N:
            case ApexParser.IntegralCurrencyLiteral:
            case ApexParser.FIND:
            case ApexParser.EMAIL:
            case ApexParser.NAME:
            case ApexParser.PHONE:
            case ApexParser.SIDEBAR:
            case ApexParser.FIELDS:
            case ApexParser.METADATA:
            case ApexParser.PRICEBOOKID:
            case ApexParser.NETWORK:
            case ApexParser.SNIPPET:
            case ApexParser.TARGET_LENGTH:
            case ApexParser.DIVISION:
            case ApexParser.RETURNING:
            case ApexParser.LISTVIEW:
            case ApexParser.Identifier:
                {
                this.state = 446;
                this.typeRef();
                }
                break;
            case ApexParser.VOID:
                {
                this.state = 447;
                this.match(ApexParser.VOID);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            this.state = 450;
            this.id();
            this.state = 451;
            this.formalParameters();
            this.state = 454;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.LBRACE:
                {
                this.state = 452;
                this.block();
                }
                break;
            case ApexParser.SEMI:
                {
                this.state = 453;
                this.match(ApexParser.SEMI);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public constructorDeclaration(): ConstructorDeclarationContext {
        let localContext = new ConstructorDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 30, ApexParser.RULE_constructorDeclaration);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 456;
            this.qualifiedName();
            this.state = 457;
            this.formalParameters();
            this.state = 458;
            this.block();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public fieldDeclaration(): FieldDeclarationContext {
        let localContext = new FieldDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 32, ApexParser.RULE_fieldDeclaration);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 460;
            this.typeRef();
            this.state = 461;
            this.variableDeclarators();
            this.state = 462;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public propertyDeclaration(): PropertyDeclarationContext {
        let localContext = new PropertyDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 34, ApexParser.RULE_propertyDeclaration);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 464;
            this.typeRef();
            this.state = 465;
            this.id();
            this.state = 466;
            this.match(ApexParser.LBRACE);
            this.state = 470;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4027785218) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 1655077) !== 0) || _la === 243) {
                {
                {
                this.state = 467;
                this.propertyBlock();
                }
                }
                this.state = 472;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 473;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public interfaceMethodDeclaration(): InterfaceMethodDeclarationContext {
        let localContext = new InterfaceMethodDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 36, ApexParser.RULE_interfaceMethodDeclaration);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 478;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 22, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 475;
                    this.modifier();
                    }
                    }
                }
                this.state = 480;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 22, this.context);
            }
            this.state = 483;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.AFTER:
            case ApexParser.BEFORE:
            case ApexParser.GET:
            case ApexParser.INHERITED:
            case ApexParser.INSTANCEOF:
            case ApexParser.SET:
            case ApexParser.SHARING:
            case ApexParser.SWITCH:
            case ApexParser.TRANSIENT:
            case ApexParser.TRIGGER:
            case ApexParser.WHEN:
            case ApexParser.WITH:
            case ApexParser.WITHOUT:
            case ApexParser.LIST:
            case ApexParser.MAP:
            case ApexParser.SYSTEM:
            case ApexParser.USER:
            case ApexParser.SELECT:
            case ApexParser.COUNT:
            case ApexParser.FROM:
            case ApexParser.AS:
            case ApexParser.USING:
            case ApexParser.SCOPE:
            case ApexParser.WHERE:
            case ApexParser.ORDER:
            case ApexParser.BY:
            case ApexParser.LIMIT:
            case ApexParser.SOQLAND:
            case ApexParser.SOQLOR:
            case ApexParser.NOT:
            case ApexParser.AVG:
            case ApexParser.COUNT_DISTINCT:
            case ApexParser.MIN:
            case ApexParser.MAX:
            case ApexParser.SUM:
            case ApexParser.TYPEOF:
            case ApexParser.END:
            case ApexParser.THEN:
            case ApexParser.LIKE:
            case ApexParser.IN:
            case ApexParser.INCLUDES:
            case ApexParser.EXCLUDES:
            case ApexParser.ASC:
            case ApexParser.DESC:
            case ApexParser.NULLS:
            case ApexParser.FIRST:
            case ApexParser.LAST:
            case ApexParser.GROUP:
            case ApexParser.ALL:
            case ApexParser.ROWS:
            case ApexParser.VIEW:
            case ApexParser.HAVING:
            case ApexParser.ROLLUP:
            case ApexParser.TOLABEL:
            case ApexParser.OFFSET:
            case ApexParser.DATA:
            case ApexParser.CATEGORY:
            case ApexParser.AT:
            case ApexParser.ABOVE:
            case ApexParser.BELOW:
            case ApexParser.ABOVE_OR_BELOW:
            case ApexParser.SECURITY_ENFORCED:
            case ApexParser.SYSTEM_MODE:
            case ApexParser.USER_MODE:
            case ApexParser.REFERENCE:
            case ApexParser.CUBE:
            case ApexParser.FORMAT:
            case ApexParser.TRACKING:
            case ApexParser.VIEWSTAT:
            case ApexParser.CUSTOM:
            case ApexParser.STANDARD:
            case ApexParser.DISTANCE:
            case ApexParser.GEOLOCATION:
            case ApexParser.CALENDAR_MONTH:
            case ApexParser.CALENDAR_QUARTER:
            case ApexParser.CALENDAR_YEAR:
            case ApexParser.DAY_IN_MONTH:
            case ApexParser.DAY_IN_WEEK:
            case ApexParser.DAY_IN_YEAR:
            case ApexParser.DAY_ONLY:
            case ApexParser.FISCAL_MONTH:
            case ApexParser.FISCAL_QUARTER:
            case ApexParser.FISCAL_YEAR:
            case ApexParser.HOUR_IN_DAY:
            case ApexParser.WEEK_IN_MONTH:
            case ApexParser.WEEK_IN_YEAR:
            case ApexParser.CONVERT_TIMEZONE:
            case ApexParser.YESTERDAY:
            case ApexParser.TODAY:
            case ApexParser.TOMORROW:
            case ApexParser.LAST_WEEK:
            case ApexParser.THIS_WEEK:
            case ApexParser.NEXT_WEEK:
            case ApexParser.LAST_MONTH:
            case ApexParser.THIS_MONTH:
            case ApexParser.NEXT_MONTH:
            case ApexParser.LAST_90_DAYS:
            case ApexParser.NEXT_90_DAYS:
            case ApexParser.LAST_N_DAYS_N:
            case ApexParser.NEXT_N_DAYS_N:
            case ApexParser.N_DAYS_AGO_N:
            case ApexParser.NEXT_N_WEEKS_N:
            case ApexParser.LAST_N_WEEKS_N:
            case ApexParser.N_WEEKS_AGO_N:
            case ApexParser.NEXT_N_MONTHS_N:
            case ApexParser.LAST_N_MONTHS_N:
            case ApexParser.N_MONTHS_AGO_N:
            case ApexParser.THIS_QUARTER:
            case ApexParser.LAST_QUARTER:
            case ApexParser.NEXT_QUARTER:
            case ApexParser.NEXT_N_QUARTERS_N:
            case ApexParser.LAST_N_QUARTERS_N:
            case ApexParser.N_QUARTERS_AGO_N:
            case ApexParser.THIS_YEAR:
            case ApexParser.LAST_YEAR:
            case ApexParser.NEXT_YEAR:
            case ApexParser.NEXT_N_YEARS_N:
            case ApexParser.LAST_N_YEARS_N:
            case ApexParser.N_YEARS_AGO_N:
            case ApexParser.THIS_FISCAL_QUARTER:
            case ApexParser.LAST_FISCAL_QUARTER:
            case ApexParser.NEXT_FISCAL_QUARTER:
            case ApexParser.NEXT_N_FISCAL_QUARTERS_N:
            case ApexParser.LAST_N_FISCAL_QUARTERS_N:
            case ApexParser.N_FISCAL_QUARTERS_AGO_N:
            case ApexParser.THIS_FISCAL_YEAR:
            case ApexParser.LAST_FISCAL_YEAR:
            case ApexParser.NEXT_FISCAL_YEAR:
            case ApexParser.NEXT_N_FISCAL_YEARS_N:
            case ApexParser.LAST_N_FISCAL_YEARS_N:
            case ApexParser.N_FISCAL_YEARS_AGO_N:
            case ApexParser.IntegralCurrencyLiteral:
            case ApexParser.FIND:
            case ApexParser.EMAIL:
            case ApexParser.NAME:
            case ApexParser.PHONE:
            case ApexParser.SIDEBAR:
            case ApexParser.FIELDS:
            case ApexParser.METADATA:
            case ApexParser.PRICEBOOKID:
            case ApexParser.NETWORK:
            case ApexParser.SNIPPET:
            case ApexParser.TARGET_LENGTH:
            case ApexParser.DIVISION:
            case ApexParser.RETURNING:
            case ApexParser.LISTVIEW:
            case ApexParser.Identifier:
                {
                this.state = 481;
                this.typeRef();
                }
                break;
            case ApexParser.VOID:
                {
                this.state = 482;
                this.match(ApexParser.VOID);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            this.state = 485;
            this.id();
            this.state = 486;
            this.formalParameters();
            this.state = 487;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public variableDeclarators(): VariableDeclaratorsContext {
        let localContext = new VariableDeclaratorsContext(this.context, this.state);
        this.enterRule(localContext, 38, ApexParser.RULE_variableDeclarators);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 489;
            this.variableDeclarator();
            this.state = 494;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 490;
                this.match(ApexParser.COMMA);
                this.state = 491;
                this.variableDeclarator();
                }
                }
                this.state = 496;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public variableDeclarator(): VariableDeclaratorContext {
        let localContext = new VariableDeclaratorContext(this.context, this.state);
        this.enterRule(localContext, 40, ApexParser.RULE_variableDeclarator);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 497;
            this.id();
            this.state = 500;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 207) {
                {
                this.state = 498;
                this.match(ApexParser.ASSIGN);
                this.state = 499;
                this.expression(0);
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public arrayInitializer(): ArrayInitializerContext {
        let localContext = new ArrayInitializerContext(this.context, this.state);
        this.enterRule(localContext, 42, ApexParser.RULE_arrayInitializer);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 502;
            this.match(ApexParser.LBRACE);
            this.state = 514;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 3758293271) !== 0) || _la === 226 || _la === 244) {
                {
                this.state = 503;
                this.expression(0);
                this.state = 508;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 26, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 504;
                        this.match(ApexParser.COMMA);
                        this.state = 505;
                        this.expression(0);
                        }
                        }
                    }
                    this.state = 510;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 26, this.context);
                }
                this.state = 512;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 205) {
                    {
                    this.state = 511;
                    this.match(ApexParser.COMMA);
                    }
                }

                }
            }

            this.state = 516;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public typeRef(): TypeRefContext {
        let localContext = new TypeRefContext(this.context, this.state);
        this.enterRule(localContext, 44, ApexParser.RULE_typeRef);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 518;
            this.typeName();
            this.state = 523;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 29, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 519;
                    this.match(ApexParser.DOT);
                    this.state = 520;
                    this.typeName();
                    }
                    }
                }
                this.state = 525;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 29, this.context);
            }
            this.state = 526;
            this.arraySubscripts();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public arraySubscripts(): ArraySubscriptsContext {
        let localContext = new ArraySubscriptsContext(this.context, this.state);
        this.enterRule(localContext, 46, ApexParser.RULE_arraySubscripts);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 532;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 30, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 528;
                    this.match(ApexParser.LBRACK);
                    this.state = 529;
                    this.match(ApexParser.RBRACK);
                    }
                    }
                }
                this.state = 534;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 30, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public typeName(): TypeNameContext {
        let localContext = new TypeNameContext(this.context, this.state);
        this.enterRule(localContext, 48, ApexParser.RULE_typeName);
        try {
            this.state = 551;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 35, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 535;
                this.match(ApexParser.LIST);
                this.state = 537;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 31, this.context) ) {
                case 1:
                    {
                    this.state = 536;
                    this.typeArguments();
                    }
                    break;
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 539;
                this.match(ApexParser.SET);
                this.state = 541;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 32, this.context) ) {
                case 1:
                    {
                    this.state = 540;
                    this.typeArguments();
                    }
                    break;
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 543;
                this.match(ApexParser.MAP);
                this.state = 545;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 33, this.context) ) {
                case 1:
                    {
                    this.state = 544;
                    this.typeArguments();
                    }
                    break;
                }
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 547;
                this.id();
                this.state = 549;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 34, this.context) ) {
                case 1:
                    {
                    this.state = 548;
                    this.typeArguments();
                    }
                    break;
                }
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public typeArguments(): TypeArgumentsContext {
        let localContext = new TypeArgumentsContext(this.context, this.state);
        this.enterRule(localContext, 50, ApexParser.RULE_typeArguments);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 553;
            this.match(ApexParser.LT);
            this.state = 554;
            this.typeList();
            this.state = 555;
            this.match(ApexParser.GT);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public formalParameters(): FormalParametersContext {
        let localContext = new FormalParametersContext(this.context, this.state);
        this.enterRule(localContext, 52, ApexParser.RULE_formalParameters);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 557;
            this.match(ApexParser.LPAREN);
            this.state = 559;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4031979534) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294656823) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 268429311) !== 0) || _la === 243 || _la === 244) {
                {
                this.state = 558;
                this.formalParameterList();
                }
            }

            this.state = 561;
            this.match(ApexParser.RPAREN);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public formalParameterList(): FormalParameterListContext {
        let localContext = new FormalParameterListContext(this.context, this.state);
        this.enterRule(localContext, 54, ApexParser.RULE_formalParameterList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 563;
            this.formalParameter();
            this.state = 568;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 564;
                this.match(ApexParser.COMMA);
                this.state = 565;
                this.formalParameter();
                }
                }
                this.state = 570;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public formalParameter(): FormalParameterContext {
        let localContext = new FormalParameterContext(this.context, this.state);
        this.enterRule(localContext, 56, ApexParser.RULE_formalParameter);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 574;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 38, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 571;
                    this.modifier();
                    }
                    }
                }
                this.state = 576;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 38, this.context);
            }
            this.state = 577;
            this.typeRef();
            this.state = 578;
            this.id();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public qualifiedName(): QualifiedNameContext {
        let localContext = new QualifiedNameContext(this.context, this.state);
        this.enterRule(localContext, 58, ApexParser.RULE_qualifiedName);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 580;
            this.id();
            this.state = 585;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 206) {
                {
                {
                this.state = 581;
                this.match(ApexParser.DOT);
                this.state = 582;
                this.id();
                }
                }
                this.state = 587;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public literal(): LiteralContext {
        let localContext = new LiteralContext(this.context, this.state);
        this.enterRule(localContext, 60, ApexParser.RULE_literal);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 588;
            _la = this.tokenStream.LA(1);
            if(!(_la === 26 || ((((_la - 192)) & ~0x1F) === 0 && ((1 << (_la - 192)) & 31) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public annotation(): AnnotationContext {
        let localContext = new AnnotationContext(this.context, this.state);
        this.enterRule(localContext, 62, ApexParser.RULE_annotation);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 590;
            this.match(ApexParser.ATSIGN);
            this.state = 591;
            this.qualifiedName();
            this.state = 598;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 198) {
                {
                this.state = 592;
                this.match(ApexParser.LPAREN);
                this.state = 595;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 40, this.context) ) {
                case 1:
                    {
                    this.state = 593;
                    this.elementValuePairs();
                    }
                    break;
                case 2:
                    {
                    this.state = 594;
                    this.elementValue();
                    }
                    break;
                }
                this.state = 597;
                this.match(ApexParser.RPAREN);
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public elementValuePairs(): ElementValuePairsContext {
        let localContext = new ElementValuePairsContext(this.context, this.state);
        this.enterRule(localContext, 64, ApexParser.RULE_elementValuePairs);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 600;
            this.elementValuePair();
            this.state = 607;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 5308428) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4288283411) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 268429311) !== 0) || _la === 205 || _la === 244) {
                {
                {
                this.state = 602;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 205) {
                    {
                    this.state = 601;
                    this.match(ApexParser.COMMA);
                    }
                }

                this.state = 604;
                this.elementValuePair();
                }
                }
                this.state = 609;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public elementValuePair(): ElementValuePairContext {
        let localContext = new ElementValuePairContext(this.context, this.state);
        this.enterRule(localContext, 66, ApexParser.RULE_elementValuePair);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 610;
            this.id();
            this.state = 611;
            this.match(ApexParser.ASSIGN);
            this.state = 612;
            this.elementValue();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public elementValue(): ElementValueContext {
        let localContext = new ElementValueContext(this.context, this.state);
        this.enterRule(localContext, 68, ApexParser.RULE_elementValue);
        try {
            this.state = 617;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.AFTER:
            case ApexParser.BEFORE:
            case ApexParser.GET:
            case ApexParser.INHERITED:
            case ApexParser.INSTANCEOF:
            case ApexParser.NEW:
            case ApexParser.NULL:
            case ApexParser.SET:
            case ApexParser.SHARING:
            case ApexParser.SUPER:
            case ApexParser.SWITCH:
            case ApexParser.THIS:
            case ApexParser.TRANSIENT:
            case ApexParser.TRIGGER:
            case ApexParser.VOID:
            case ApexParser.WHEN:
            case ApexParser.WITH:
            case ApexParser.WITHOUT:
            case ApexParser.LIST:
            case ApexParser.MAP:
            case ApexParser.SYSTEM:
            case ApexParser.USER:
            case ApexParser.SELECT:
            case ApexParser.COUNT:
            case ApexParser.FROM:
            case ApexParser.AS:
            case ApexParser.USING:
            case ApexParser.SCOPE:
            case ApexParser.WHERE:
            case ApexParser.ORDER:
            case ApexParser.BY:
            case ApexParser.LIMIT:
            case ApexParser.SOQLAND:
            case ApexParser.SOQLOR:
            case ApexParser.NOT:
            case ApexParser.AVG:
            case ApexParser.COUNT_DISTINCT:
            case ApexParser.MIN:
            case ApexParser.MAX:
            case ApexParser.SUM:
            case ApexParser.TYPEOF:
            case ApexParser.END:
            case ApexParser.THEN:
            case ApexParser.LIKE:
            case ApexParser.IN:
            case ApexParser.INCLUDES:
            case ApexParser.EXCLUDES:
            case ApexParser.ASC:
            case ApexParser.DESC:
            case ApexParser.NULLS:
            case ApexParser.FIRST:
            case ApexParser.LAST:
            case ApexParser.GROUP:
            case ApexParser.ALL:
            case ApexParser.ROWS:
            case ApexParser.VIEW:
            case ApexParser.HAVING:
            case ApexParser.ROLLUP:
            case ApexParser.TOLABEL:
            case ApexParser.OFFSET:
            case ApexParser.DATA:
            case ApexParser.CATEGORY:
            case ApexParser.AT:
            case ApexParser.ABOVE:
            case ApexParser.BELOW:
            case ApexParser.ABOVE_OR_BELOW:
            case ApexParser.SECURITY_ENFORCED:
            case ApexParser.SYSTEM_MODE:
            case ApexParser.USER_MODE:
            case ApexParser.REFERENCE:
            case ApexParser.CUBE:
            case ApexParser.FORMAT:
            case ApexParser.TRACKING:
            case ApexParser.VIEWSTAT:
            case ApexParser.CUSTOM:
            case ApexParser.STANDARD:
            case ApexParser.DISTANCE:
            case ApexParser.GEOLOCATION:
            case ApexParser.CALENDAR_MONTH:
            case ApexParser.CALENDAR_QUARTER:
            case ApexParser.CALENDAR_YEAR:
            case ApexParser.DAY_IN_MONTH:
            case ApexParser.DAY_IN_WEEK:
            case ApexParser.DAY_IN_YEAR:
            case ApexParser.DAY_ONLY:
            case ApexParser.FISCAL_MONTH:
            case ApexParser.FISCAL_QUARTER:
            case ApexParser.FISCAL_YEAR:
            case ApexParser.HOUR_IN_DAY:
            case ApexParser.WEEK_IN_MONTH:
            case ApexParser.WEEK_IN_YEAR:
            case ApexParser.CONVERT_TIMEZONE:
            case ApexParser.YESTERDAY:
            case ApexParser.TODAY:
            case ApexParser.TOMORROW:
            case ApexParser.LAST_WEEK:
            case ApexParser.THIS_WEEK:
            case ApexParser.NEXT_WEEK:
            case ApexParser.LAST_MONTH:
            case ApexParser.THIS_MONTH:
            case ApexParser.NEXT_MONTH:
            case ApexParser.LAST_90_DAYS:
            case ApexParser.NEXT_90_DAYS:
            case ApexParser.LAST_N_DAYS_N:
            case ApexParser.NEXT_N_DAYS_N:
            case ApexParser.N_DAYS_AGO_N:
            case ApexParser.NEXT_N_WEEKS_N:
            case ApexParser.LAST_N_WEEKS_N:
            case ApexParser.N_WEEKS_AGO_N:
            case ApexParser.NEXT_N_MONTHS_N:
            case ApexParser.LAST_N_MONTHS_N:
            case ApexParser.N_MONTHS_AGO_N:
            case ApexParser.THIS_QUARTER:
            case ApexParser.LAST_QUARTER:
            case ApexParser.NEXT_QUARTER:
            case ApexParser.NEXT_N_QUARTERS_N:
            case ApexParser.LAST_N_QUARTERS_N:
            case ApexParser.N_QUARTERS_AGO_N:
            case ApexParser.THIS_YEAR:
            case ApexParser.LAST_YEAR:
            case ApexParser.NEXT_YEAR:
            case ApexParser.NEXT_N_YEARS_N:
            case ApexParser.LAST_N_YEARS_N:
            case ApexParser.N_YEARS_AGO_N:
            case ApexParser.THIS_FISCAL_QUARTER:
            case ApexParser.LAST_FISCAL_QUARTER:
            case ApexParser.NEXT_FISCAL_QUARTER:
            case ApexParser.NEXT_N_FISCAL_QUARTERS_N:
            case ApexParser.LAST_N_FISCAL_QUARTERS_N:
            case ApexParser.N_FISCAL_QUARTERS_AGO_N:
            case ApexParser.THIS_FISCAL_YEAR:
            case ApexParser.LAST_FISCAL_YEAR:
            case ApexParser.NEXT_FISCAL_YEAR:
            case ApexParser.NEXT_N_FISCAL_YEARS_N:
            case ApexParser.LAST_N_FISCAL_YEARS_N:
            case ApexParser.N_FISCAL_YEARS_AGO_N:
            case ApexParser.IntegralCurrencyLiteral:
            case ApexParser.FIND:
            case ApexParser.EMAIL:
            case ApexParser.NAME:
            case ApexParser.PHONE:
            case ApexParser.SIDEBAR:
            case ApexParser.FIELDS:
            case ApexParser.METADATA:
            case ApexParser.PRICEBOOKID:
            case ApexParser.NETWORK:
            case ApexParser.SNIPPET:
            case ApexParser.TARGET_LENGTH:
            case ApexParser.DIVISION:
            case ApexParser.RETURNING:
            case ApexParser.LISTVIEW:
            case ApexParser.FindLiteral:
            case ApexParser.IntegerLiteral:
            case ApexParser.LongLiteral:
            case ApexParser.NumberLiteral:
            case ApexParser.BooleanLiteral:
            case ApexParser.StringLiteral:
            case ApexParser.LPAREN:
            case ApexParser.LBRACK:
            case ApexParser.BANG:
            case ApexParser.TILDE:
            case ApexParser.INC:
            case ApexParser.DEC:
            case ApexParser.ADD:
            case ApexParser.SUB:
            case ApexParser.Identifier:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 614;
                this.expression(0);
                }
                break;
            case ApexParser.ATSIGN:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 615;
                this.annotation();
                }
                break;
            case ApexParser.LBRACE:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 616;
                this.elementValueArrayInitializer();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public elementValueArrayInitializer(): ElementValueArrayInitializerContext {
        let localContext = new ElementValueArrayInitializerContext(this.context, this.state);
        this.enterRule(localContext, 70, ApexParser.RULE_elementValueArrayInitializer);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 619;
            this.match(ApexParser.LBRACE);
            this.state = 628;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 3758293335) !== 0) || ((((_la - 226)) & ~0x1F) === 0 && ((1 << (_la - 226)) & 393217) !== 0)) {
                {
                this.state = 620;
                this.elementValue();
                this.state = 625;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 45, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 621;
                        this.match(ApexParser.COMMA);
                        this.state = 622;
                        this.elementValue();
                        }
                        }
                    }
                    this.state = 627;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 45, this.context);
                }
                }
            }

            this.state = 631;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 205) {
                {
                this.state = 630;
                this.match(ApexParser.COMMA);
                }
            }

            this.state = 633;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public block(): BlockContext {
        let localContext = new BlockContext(this.context, this.state);
        this.enterRule(localContext, 72, ApexParser.RULE_block);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 635;
            this.match(ApexParser.LBRACE);
            this.state = 639;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4151813022) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & 4294967295) !== 0) || ((((_la - 64)) & ~0x1F) === 0 && ((1 << (_la - 64)) & 4294967295) !== 0) || ((((_la - 96)) & ~0x1F) === 0 && ((1 << (_la - 96)) & 4294967295) !== 0) || ((((_la - 128)) & ~0x1F) === 0 && ((1 << (_la - 128)) & 4294967295) !== 0) || ((((_la - 160)) & ~0x1F) === 0 && ((1 << (_la - 160)) & 2147459071) !== 0) || ((((_la - 192)) & ~0x1F) === 0 && ((1 << (_la - 192)) & 2148271455) !== 0) || ((((_la - 224)) & ~0x1F) === 0 && ((1 << (_la - 224)) & 1572871) !== 0)) {
                {
                {
                this.state = 636;
                this.statement();
                }
                }
                this.state = 641;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 642;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public localVariableDeclarationStatement(): LocalVariableDeclarationStatementContext {
        let localContext = new LocalVariableDeclarationStatementContext(this.context, this.state);
        this.enterRule(localContext, 74, ApexParser.RULE_localVariableDeclarationStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 644;
            this.localVariableDeclaration();
            this.state = 645;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public localVariableDeclaration(): LocalVariableDeclarationContext {
        let localContext = new LocalVariableDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 76, ApexParser.RULE_localVariableDeclaration);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 650;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 49, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 647;
                    this.modifier();
                    }
                    }
                }
                this.state = 652;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 49, this.context);
            }
            this.state = 653;
            this.typeRef();
            this.state = 654;
            this.variableDeclarators();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public statement(): StatementContext {
        let localContext = new StatementContext(this.context, this.state);
        this.enterRule(localContext, 78, ApexParser.RULE_statement);
        try {
            this.state = 676;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 50, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 656;
                this.block();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 657;
                this.ifStatement();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 658;
                this.switchStatement();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 659;
                this.forStatement();
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 660;
                this.whileStatement();
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 661;
                this.doWhileStatement();
                }
                break;
            case 7:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 662;
                this.tryStatement();
                }
                break;
            case 8:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 663;
                this.returnStatement();
                }
                break;
            case 9:
                this.enterOuterAlt(localContext, 9);
                {
                this.state = 664;
                this.throwStatement();
                }
                break;
            case 10:
                this.enterOuterAlt(localContext, 10);
                {
                this.state = 665;
                this.breakStatement();
                }
                break;
            case 11:
                this.enterOuterAlt(localContext, 11);
                {
                this.state = 666;
                this.continueStatement();
                }
                break;
            case 12:
                this.enterOuterAlt(localContext, 12);
                {
                this.state = 667;
                this.insertStatement();
                }
                break;
            case 13:
                this.enterOuterAlt(localContext, 13);
                {
                this.state = 668;
                this.updateStatement();
                }
                break;
            case 14:
                this.enterOuterAlt(localContext, 14);
                {
                this.state = 669;
                this.deleteStatement();
                }
                break;
            case 15:
                this.enterOuterAlt(localContext, 15);
                {
                this.state = 670;
                this.undeleteStatement();
                }
                break;
            case 16:
                this.enterOuterAlt(localContext, 16);
                {
                this.state = 671;
                this.upsertStatement();
                }
                break;
            case 17:
                this.enterOuterAlt(localContext, 17);
                {
                this.state = 672;
                this.mergeStatement();
                }
                break;
            case 18:
                this.enterOuterAlt(localContext, 18);
                {
                this.state = 673;
                this.runAsStatement();
                }
                break;
            case 19:
                this.enterOuterAlt(localContext, 19);
                {
                this.state = 674;
                this.localVariableDeclarationStatement();
                }
                break;
            case 20:
                this.enterOuterAlt(localContext, 20);
                {
                this.state = 675;
                this.expressionStatement();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public ifStatement(): IfStatementContext {
        let localContext = new IfStatementContext(this.context, this.state);
        this.enterRule(localContext, 80, ApexParser.RULE_ifStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 678;
            this.match(ApexParser.IF);
            this.state = 679;
            this.parExpression();
            this.state = 680;
            this.statement();
            this.state = 683;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 51, this.context) ) {
            case 1:
                {
                this.state = 681;
                this.match(ApexParser.ELSE);
                this.state = 682;
                this.statement();
                }
                break;
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public switchStatement(): SwitchStatementContext {
        let localContext = new SwitchStatementContext(this.context, this.state);
        this.enterRule(localContext, 82, ApexParser.RULE_switchStatement);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 685;
            this.match(ApexParser.SWITCH);
            this.state = 686;
            this.match(ApexParser.ON);
            this.state = 687;
            this.expression(0);
            this.state = 688;
            this.match(ApexParser.LBRACE);
            this.state = 690;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 689;
                this.whenControl();
                }
                }
                this.state = 692;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while (_la === 51);
            this.state = 694;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public whenControl(): WhenControlContext {
        let localContext = new WhenControlContext(this.context, this.state);
        this.enterRule(localContext, 84, ApexParser.RULE_whenControl);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 696;
            this.match(ApexParser.WHEN);
            this.state = 697;
            this.whenValue();
            this.state = 698;
            this.block();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public whenValue(): WhenValueContext {
        let localContext = new WhenValueContext(this.context, this.state);
        this.enterRule(localContext, 86, ApexParser.RULE_whenValue);
        let _la: number;
        try {
            this.state = 712;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 54, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 700;
                this.match(ApexParser.ELSE);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 701;
                this.whenLiteral();
                this.state = 706;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 205) {
                    {
                    {
                    this.state = 702;
                    this.match(ApexParser.COMMA);
                    this.state = 703;
                    this.whenLiteral();
                    }
                    }
                    this.state = 708;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 709;
                this.id();
                this.state = 710;
                this.id();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public whenLiteral(): WhenLiteralContext {
        let localContext = new WhenLiteralContext(this.context, this.state);
        this.enterRule(localContext, 88, ApexParser.RULE_whenLiteral);
        let _la: number;
        try {
            this.state = 726;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.IntegerLiteral:
            case ApexParser.SUB:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 715;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 226) {
                    {
                    this.state = 714;
                    this.match(ApexParser.SUB);
                    }
                }

                this.state = 717;
                this.match(ApexParser.IntegerLiteral);
                }
                break;
            case ApexParser.LongLiteral:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 718;
                this.match(ApexParser.LongLiteral);
                }
                break;
            case ApexParser.StringLiteral:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 719;
                this.match(ApexParser.StringLiteral);
                }
                break;
            case ApexParser.NULL:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 720;
                this.match(ApexParser.NULL);
                }
                break;
            case ApexParser.AFTER:
            case ApexParser.BEFORE:
            case ApexParser.GET:
            case ApexParser.INHERITED:
            case ApexParser.INSTANCEOF:
            case ApexParser.SET:
            case ApexParser.SHARING:
            case ApexParser.SWITCH:
            case ApexParser.TRANSIENT:
            case ApexParser.TRIGGER:
            case ApexParser.WHEN:
            case ApexParser.WITH:
            case ApexParser.WITHOUT:
            case ApexParser.SYSTEM:
            case ApexParser.USER:
            case ApexParser.SELECT:
            case ApexParser.COUNT:
            case ApexParser.FROM:
            case ApexParser.AS:
            case ApexParser.USING:
            case ApexParser.SCOPE:
            case ApexParser.WHERE:
            case ApexParser.ORDER:
            case ApexParser.BY:
            case ApexParser.LIMIT:
            case ApexParser.SOQLAND:
            case ApexParser.SOQLOR:
            case ApexParser.NOT:
            case ApexParser.AVG:
            case ApexParser.COUNT_DISTINCT:
            case ApexParser.MIN:
            case ApexParser.MAX:
            case ApexParser.SUM:
            case ApexParser.TYPEOF:
            case ApexParser.END:
            case ApexParser.THEN:
            case ApexParser.LIKE:
            case ApexParser.IN:
            case ApexParser.INCLUDES:
            case ApexParser.EXCLUDES:
            case ApexParser.ASC:
            case ApexParser.DESC:
            case ApexParser.NULLS:
            case ApexParser.FIRST:
            case ApexParser.LAST:
            case ApexParser.GROUP:
            case ApexParser.ALL:
            case ApexParser.ROWS:
            case ApexParser.VIEW:
            case ApexParser.HAVING:
            case ApexParser.ROLLUP:
            case ApexParser.TOLABEL:
            case ApexParser.OFFSET:
            case ApexParser.DATA:
            case ApexParser.CATEGORY:
            case ApexParser.AT:
            case ApexParser.ABOVE:
            case ApexParser.BELOW:
            case ApexParser.ABOVE_OR_BELOW:
            case ApexParser.SECURITY_ENFORCED:
            case ApexParser.SYSTEM_MODE:
            case ApexParser.USER_MODE:
            case ApexParser.REFERENCE:
            case ApexParser.CUBE:
            case ApexParser.FORMAT:
            case ApexParser.TRACKING:
            case ApexParser.VIEWSTAT:
            case ApexParser.CUSTOM:
            case ApexParser.STANDARD:
            case ApexParser.DISTANCE:
            case ApexParser.GEOLOCATION:
            case ApexParser.CALENDAR_MONTH:
            case ApexParser.CALENDAR_QUARTER:
            case ApexParser.CALENDAR_YEAR:
            case ApexParser.DAY_IN_MONTH:
            case ApexParser.DAY_IN_WEEK:
            case ApexParser.DAY_IN_YEAR:
            case ApexParser.DAY_ONLY:
            case ApexParser.FISCAL_MONTH:
            case ApexParser.FISCAL_QUARTER:
            case ApexParser.FISCAL_YEAR:
            case ApexParser.HOUR_IN_DAY:
            case ApexParser.WEEK_IN_MONTH:
            case ApexParser.WEEK_IN_YEAR:
            case ApexParser.CONVERT_TIMEZONE:
            case ApexParser.YESTERDAY:
            case ApexParser.TODAY:
            case ApexParser.TOMORROW:
            case ApexParser.LAST_WEEK:
            case ApexParser.THIS_WEEK:
            case ApexParser.NEXT_WEEK:
            case ApexParser.LAST_MONTH:
            case ApexParser.THIS_MONTH:
            case ApexParser.NEXT_MONTH:
            case ApexParser.LAST_90_DAYS:
            case ApexParser.NEXT_90_DAYS:
            case ApexParser.LAST_N_DAYS_N:
            case ApexParser.NEXT_N_DAYS_N:
            case ApexParser.N_DAYS_AGO_N:
            case ApexParser.NEXT_N_WEEKS_N:
            case ApexParser.LAST_N_WEEKS_N:
            case ApexParser.N_WEEKS_AGO_N:
            case ApexParser.NEXT_N_MONTHS_N:
            case ApexParser.LAST_N_MONTHS_N:
            case ApexParser.N_MONTHS_AGO_N:
            case ApexParser.THIS_QUARTER:
            case ApexParser.LAST_QUARTER:
            case ApexParser.NEXT_QUARTER:
            case ApexParser.NEXT_N_QUARTERS_N:
            case ApexParser.LAST_N_QUARTERS_N:
            case ApexParser.N_QUARTERS_AGO_N:
            case ApexParser.THIS_YEAR:
            case ApexParser.LAST_YEAR:
            case ApexParser.NEXT_YEAR:
            case ApexParser.NEXT_N_YEARS_N:
            case ApexParser.LAST_N_YEARS_N:
            case ApexParser.N_YEARS_AGO_N:
            case ApexParser.THIS_FISCAL_QUARTER:
            case ApexParser.LAST_FISCAL_QUARTER:
            case ApexParser.NEXT_FISCAL_QUARTER:
            case ApexParser.NEXT_N_FISCAL_QUARTERS_N:
            case ApexParser.LAST_N_FISCAL_QUARTERS_N:
            case ApexParser.N_FISCAL_QUARTERS_AGO_N:
            case ApexParser.THIS_FISCAL_YEAR:
            case ApexParser.LAST_FISCAL_YEAR:
            case ApexParser.NEXT_FISCAL_YEAR:
            case ApexParser.NEXT_N_FISCAL_YEARS_N:
            case ApexParser.LAST_N_FISCAL_YEARS_N:
            case ApexParser.N_FISCAL_YEARS_AGO_N:
            case ApexParser.IntegralCurrencyLiteral:
            case ApexParser.FIND:
            case ApexParser.EMAIL:
            case ApexParser.NAME:
            case ApexParser.PHONE:
            case ApexParser.SIDEBAR:
            case ApexParser.FIELDS:
            case ApexParser.METADATA:
            case ApexParser.PRICEBOOKID:
            case ApexParser.NETWORK:
            case ApexParser.SNIPPET:
            case ApexParser.TARGET_LENGTH:
            case ApexParser.DIVISION:
            case ApexParser.RETURNING:
            case ApexParser.LISTVIEW:
            case ApexParser.Identifier:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 721;
                this.id();
                }
                break;
            case ApexParser.LPAREN:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 722;
                this.match(ApexParser.LPAREN);
                this.state = 723;
                this.whenLiteral();
                this.state = 724;
                this.match(ApexParser.RPAREN);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public forStatement(): ForStatementContext {
        let localContext = new ForStatementContext(this.context, this.state);
        this.enterRule(localContext, 90, ApexParser.RULE_forStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 728;
            this.match(ApexParser.FOR);
            this.state = 729;
            this.match(ApexParser.LPAREN);
            this.state = 730;
            this.forControl();
            this.state = 731;
            this.match(ApexParser.RPAREN);
            this.state = 734;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.ABSTRACT:
            case ApexParser.AFTER:
            case ApexParser.BEFORE:
            case ApexParser.BREAK:
            case ApexParser.CONTINUE:
            case ApexParser.DELETE:
            case ApexParser.DO:
            case ApexParser.FINAL:
            case ApexParser.FOR:
            case ApexParser.GET:
            case ApexParser.GLOBAL:
            case ApexParser.IF:
            case ApexParser.INHERITED:
            case ApexParser.INSERT:
            case ApexParser.INSTANCEOF:
            case ApexParser.MERGE:
            case ApexParser.NEW:
            case ApexParser.NULL:
            case ApexParser.OVERRIDE:
            case ApexParser.PRIVATE:
            case ApexParser.PROTECTED:
            case ApexParser.PUBLIC:
            case ApexParser.RETURN:
            case ApexParser.SYSTEMRUNAS:
            case ApexParser.SET:
            case ApexParser.SHARING:
            case ApexParser.STATIC:
            case ApexParser.SUPER:
            case ApexParser.SWITCH:
            case ApexParser.TESTMETHOD:
            case ApexParser.THIS:
            case ApexParser.THROW:
            case ApexParser.TRANSIENT:
            case ApexParser.TRIGGER:
            case ApexParser.TRY:
            case ApexParser.UNDELETE:
            case ApexParser.UPDATE:
            case ApexParser.UPSERT:
            case ApexParser.VIRTUAL:
            case ApexParser.VOID:
            case ApexParser.WEBSERVICE:
            case ApexParser.WHEN:
            case ApexParser.WHILE:
            case ApexParser.WITH:
            case ApexParser.WITHOUT:
            case ApexParser.LIST:
            case ApexParser.MAP:
            case ApexParser.SYSTEM:
            case ApexParser.USER:
            case ApexParser.SELECT:
            case ApexParser.COUNT:
            case ApexParser.FROM:
            case ApexParser.AS:
            case ApexParser.USING:
            case ApexParser.SCOPE:
            case ApexParser.WHERE:
            case ApexParser.ORDER:
            case ApexParser.BY:
            case ApexParser.LIMIT:
            case ApexParser.SOQLAND:
            case ApexParser.SOQLOR:
            case ApexParser.NOT:
            case ApexParser.AVG:
            case ApexParser.COUNT_DISTINCT:
            case ApexParser.MIN:
            case ApexParser.MAX:
            case ApexParser.SUM:
            case ApexParser.TYPEOF:
            case ApexParser.END:
            case ApexParser.THEN:
            case ApexParser.LIKE:
            case ApexParser.IN:
            case ApexParser.INCLUDES:
            case ApexParser.EXCLUDES:
            case ApexParser.ASC:
            case ApexParser.DESC:
            case ApexParser.NULLS:
            case ApexParser.FIRST:
            case ApexParser.LAST:
            case ApexParser.GROUP:
            case ApexParser.ALL:
            case ApexParser.ROWS:
            case ApexParser.VIEW:
            case ApexParser.HAVING:
            case ApexParser.ROLLUP:
            case ApexParser.TOLABEL:
            case ApexParser.OFFSET:
            case ApexParser.DATA:
            case ApexParser.CATEGORY:
            case ApexParser.AT:
            case ApexParser.ABOVE:
            case ApexParser.BELOW:
            case ApexParser.ABOVE_OR_BELOW:
            case ApexParser.SECURITY_ENFORCED:
            case ApexParser.SYSTEM_MODE:
            case ApexParser.USER_MODE:
            case ApexParser.REFERENCE:
            case ApexParser.CUBE:
            case ApexParser.FORMAT:
            case ApexParser.TRACKING:
            case ApexParser.VIEWSTAT:
            case ApexParser.CUSTOM:
            case ApexParser.STANDARD:
            case ApexParser.DISTANCE:
            case ApexParser.GEOLOCATION:
            case ApexParser.CALENDAR_MONTH:
            case ApexParser.CALENDAR_QUARTER:
            case ApexParser.CALENDAR_YEAR:
            case ApexParser.DAY_IN_MONTH:
            case ApexParser.DAY_IN_WEEK:
            case ApexParser.DAY_IN_YEAR:
            case ApexParser.DAY_ONLY:
            case ApexParser.FISCAL_MONTH:
            case ApexParser.FISCAL_QUARTER:
            case ApexParser.FISCAL_YEAR:
            case ApexParser.HOUR_IN_DAY:
            case ApexParser.WEEK_IN_MONTH:
            case ApexParser.WEEK_IN_YEAR:
            case ApexParser.CONVERT_TIMEZONE:
            case ApexParser.YESTERDAY:
            case ApexParser.TODAY:
            case ApexParser.TOMORROW:
            case ApexParser.LAST_WEEK:
            case ApexParser.THIS_WEEK:
            case ApexParser.NEXT_WEEK:
            case ApexParser.LAST_MONTH:
            case ApexParser.THIS_MONTH:
            case ApexParser.NEXT_MONTH:
            case ApexParser.LAST_90_DAYS:
            case ApexParser.NEXT_90_DAYS:
            case ApexParser.LAST_N_DAYS_N:
            case ApexParser.NEXT_N_DAYS_N:
            case ApexParser.N_DAYS_AGO_N:
            case ApexParser.NEXT_N_WEEKS_N:
            case ApexParser.LAST_N_WEEKS_N:
            case ApexParser.N_WEEKS_AGO_N:
            case ApexParser.NEXT_N_MONTHS_N:
            case ApexParser.LAST_N_MONTHS_N:
            case ApexParser.N_MONTHS_AGO_N:
            case ApexParser.THIS_QUARTER:
            case ApexParser.LAST_QUARTER:
            case ApexParser.NEXT_QUARTER:
            case ApexParser.NEXT_N_QUARTERS_N:
            case ApexParser.LAST_N_QUARTERS_N:
            case ApexParser.N_QUARTERS_AGO_N:
            case ApexParser.THIS_YEAR:
            case ApexParser.LAST_YEAR:
            case ApexParser.NEXT_YEAR:
            case ApexParser.NEXT_N_YEARS_N:
            case ApexParser.LAST_N_YEARS_N:
            case ApexParser.N_YEARS_AGO_N:
            case ApexParser.THIS_FISCAL_QUARTER:
            case ApexParser.LAST_FISCAL_QUARTER:
            case ApexParser.NEXT_FISCAL_QUARTER:
            case ApexParser.NEXT_N_FISCAL_QUARTERS_N:
            case ApexParser.LAST_N_FISCAL_QUARTERS_N:
            case ApexParser.N_FISCAL_QUARTERS_AGO_N:
            case ApexParser.THIS_FISCAL_YEAR:
            case ApexParser.LAST_FISCAL_YEAR:
            case ApexParser.NEXT_FISCAL_YEAR:
            case ApexParser.NEXT_N_FISCAL_YEARS_N:
            case ApexParser.LAST_N_FISCAL_YEARS_N:
            case ApexParser.N_FISCAL_YEARS_AGO_N:
            case ApexParser.IntegralCurrencyLiteral:
            case ApexParser.FIND:
            case ApexParser.EMAIL:
            case ApexParser.NAME:
            case ApexParser.PHONE:
            case ApexParser.SIDEBAR:
            case ApexParser.FIELDS:
            case ApexParser.METADATA:
            case ApexParser.PRICEBOOKID:
            case ApexParser.NETWORK:
            case ApexParser.SNIPPET:
            case ApexParser.TARGET_LENGTH:
            case ApexParser.DIVISION:
            case ApexParser.RETURNING:
            case ApexParser.LISTVIEW:
            case ApexParser.FindLiteral:
            case ApexParser.IntegerLiteral:
            case ApexParser.LongLiteral:
            case ApexParser.NumberLiteral:
            case ApexParser.BooleanLiteral:
            case ApexParser.StringLiteral:
            case ApexParser.LPAREN:
            case ApexParser.LBRACE:
            case ApexParser.LBRACK:
            case ApexParser.BANG:
            case ApexParser.TILDE:
            case ApexParser.INC:
            case ApexParser.DEC:
            case ApexParser.ADD:
            case ApexParser.SUB:
            case ApexParser.ATSIGN:
            case ApexParser.Identifier:
                {
                this.state = 732;
                this.statement();
                }
                break;
            case ApexParser.SEMI:
                {
                this.state = 733;
                this.match(ApexParser.SEMI);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public whileStatement(): WhileStatementContext {
        let localContext = new WhileStatementContext(this.context, this.state);
        this.enterRule(localContext, 92, ApexParser.RULE_whileStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 736;
            this.match(ApexParser.WHILE);
            this.state = 737;
            this.parExpression();
            this.state = 740;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.ABSTRACT:
            case ApexParser.AFTER:
            case ApexParser.BEFORE:
            case ApexParser.BREAK:
            case ApexParser.CONTINUE:
            case ApexParser.DELETE:
            case ApexParser.DO:
            case ApexParser.FINAL:
            case ApexParser.FOR:
            case ApexParser.GET:
            case ApexParser.GLOBAL:
            case ApexParser.IF:
            case ApexParser.INHERITED:
            case ApexParser.INSERT:
            case ApexParser.INSTANCEOF:
            case ApexParser.MERGE:
            case ApexParser.NEW:
            case ApexParser.NULL:
            case ApexParser.OVERRIDE:
            case ApexParser.PRIVATE:
            case ApexParser.PROTECTED:
            case ApexParser.PUBLIC:
            case ApexParser.RETURN:
            case ApexParser.SYSTEMRUNAS:
            case ApexParser.SET:
            case ApexParser.SHARING:
            case ApexParser.STATIC:
            case ApexParser.SUPER:
            case ApexParser.SWITCH:
            case ApexParser.TESTMETHOD:
            case ApexParser.THIS:
            case ApexParser.THROW:
            case ApexParser.TRANSIENT:
            case ApexParser.TRIGGER:
            case ApexParser.TRY:
            case ApexParser.UNDELETE:
            case ApexParser.UPDATE:
            case ApexParser.UPSERT:
            case ApexParser.VIRTUAL:
            case ApexParser.VOID:
            case ApexParser.WEBSERVICE:
            case ApexParser.WHEN:
            case ApexParser.WHILE:
            case ApexParser.WITH:
            case ApexParser.WITHOUT:
            case ApexParser.LIST:
            case ApexParser.MAP:
            case ApexParser.SYSTEM:
            case ApexParser.USER:
            case ApexParser.SELECT:
            case ApexParser.COUNT:
            case ApexParser.FROM:
            case ApexParser.AS:
            case ApexParser.USING:
            case ApexParser.SCOPE:
            case ApexParser.WHERE:
            case ApexParser.ORDER:
            case ApexParser.BY:
            case ApexParser.LIMIT:
            case ApexParser.SOQLAND:
            case ApexParser.SOQLOR:
            case ApexParser.NOT:
            case ApexParser.AVG:
            case ApexParser.COUNT_DISTINCT:
            case ApexParser.MIN:
            case ApexParser.MAX:
            case ApexParser.SUM:
            case ApexParser.TYPEOF:
            case ApexParser.END:
            case ApexParser.THEN:
            case ApexParser.LIKE:
            case ApexParser.IN:
            case ApexParser.INCLUDES:
            case ApexParser.EXCLUDES:
            case ApexParser.ASC:
            case ApexParser.DESC:
            case ApexParser.NULLS:
            case ApexParser.FIRST:
            case ApexParser.LAST:
            case ApexParser.GROUP:
            case ApexParser.ALL:
            case ApexParser.ROWS:
            case ApexParser.VIEW:
            case ApexParser.HAVING:
            case ApexParser.ROLLUP:
            case ApexParser.TOLABEL:
            case ApexParser.OFFSET:
            case ApexParser.DATA:
            case ApexParser.CATEGORY:
            case ApexParser.AT:
            case ApexParser.ABOVE:
            case ApexParser.BELOW:
            case ApexParser.ABOVE_OR_BELOW:
            case ApexParser.SECURITY_ENFORCED:
            case ApexParser.SYSTEM_MODE:
            case ApexParser.USER_MODE:
            case ApexParser.REFERENCE:
            case ApexParser.CUBE:
            case ApexParser.FORMAT:
            case ApexParser.TRACKING:
            case ApexParser.VIEWSTAT:
            case ApexParser.CUSTOM:
            case ApexParser.STANDARD:
            case ApexParser.DISTANCE:
            case ApexParser.GEOLOCATION:
            case ApexParser.CALENDAR_MONTH:
            case ApexParser.CALENDAR_QUARTER:
            case ApexParser.CALENDAR_YEAR:
            case ApexParser.DAY_IN_MONTH:
            case ApexParser.DAY_IN_WEEK:
            case ApexParser.DAY_IN_YEAR:
            case ApexParser.DAY_ONLY:
            case ApexParser.FISCAL_MONTH:
            case ApexParser.FISCAL_QUARTER:
            case ApexParser.FISCAL_YEAR:
            case ApexParser.HOUR_IN_DAY:
            case ApexParser.WEEK_IN_MONTH:
            case ApexParser.WEEK_IN_YEAR:
            case ApexParser.CONVERT_TIMEZONE:
            case ApexParser.YESTERDAY:
            case ApexParser.TODAY:
            case ApexParser.TOMORROW:
            case ApexParser.LAST_WEEK:
            case ApexParser.THIS_WEEK:
            case ApexParser.NEXT_WEEK:
            case ApexParser.LAST_MONTH:
            case ApexParser.THIS_MONTH:
            case ApexParser.NEXT_MONTH:
            case ApexParser.LAST_90_DAYS:
            case ApexParser.NEXT_90_DAYS:
            case ApexParser.LAST_N_DAYS_N:
            case ApexParser.NEXT_N_DAYS_N:
            case ApexParser.N_DAYS_AGO_N:
            case ApexParser.NEXT_N_WEEKS_N:
            case ApexParser.LAST_N_WEEKS_N:
            case ApexParser.N_WEEKS_AGO_N:
            case ApexParser.NEXT_N_MONTHS_N:
            case ApexParser.LAST_N_MONTHS_N:
            case ApexParser.N_MONTHS_AGO_N:
            case ApexParser.THIS_QUARTER:
            case ApexParser.LAST_QUARTER:
            case ApexParser.NEXT_QUARTER:
            case ApexParser.NEXT_N_QUARTERS_N:
            case ApexParser.LAST_N_QUARTERS_N:
            case ApexParser.N_QUARTERS_AGO_N:
            case ApexParser.THIS_YEAR:
            case ApexParser.LAST_YEAR:
            case ApexParser.NEXT_YEAR:
            case ApexParser.NEXT_N_YEARS_N:
            case ApexParser.LAST_N_YEARS_N:
            case ApexParser.N_YEARS_AGO_N:
            case ApexParser.THIS_FISCAL_QUARTER:
            case ApexParser.LAST_FISCAL_QUARTER:
            case ApexParser.NEXT_FISCAL_QUARTER:
            case ApexParser.NEXT_N_FISCAL_QUARTERS_N:
            case ApexParser.LAST_N_FISCAL_QUARTERS_N:
            case ApexParser.N_FISCAL_QUARTERS_AGO_N:
            case ApexParser.THIS_FISCAL_YEAR:
            case ApexParser.LAST_FISCAL_YEAR:
            case ApexParser.NEXT_FISCAL_YEAR:
            case ApexParser.NEXT_N_FISCAL_YEARS_N:
            case ApexParser.LAST_N_FISCAL_YEARS_N:
            case ApexParser.N_FISCAL_YEARS_AGO_N:
            case ApexParser.IntegralCurrencyLiteral:
            case ApexParser.FIND:
            case ApexParser.EMAIL:
            case ApexParser.NAME:
            case ApexParser.PHONE:
            case ApexParser.SIDEBAR:
            case ApexParser.FIELDS:
            case ApexParser.METADATA:
            case ApexParser.PRICEBOOKID:
            case ApexParser.NETWORK:
            case ApexParser.SNIPPET:
            case ApexParser.TARGET_LENGTH:
            case ApexParser.DIVISION:
            case ApexParser.RETURNING:
            case ApexParser.LISTVIEW:
            case ApexParser.FindLiteral:
            case ApexParser.IntegerLiteral:
            case ApexParser.LongLiteral:
            case ApexParser.NumberLiteral:
            case ApexParser.BooleanLiteral:
            case ApexParser.StringLiteral:
            case ApexParser.LPAREN:
            case ApexParser.LBRACE:
            case ApexParser.LBRACK:
            case ApexParser.BANG:
            case ApexParser.TILDE:
            case ApexParser.INC:
            case ApexParser.DEC:
            case ApexParser.ADD:
            case ApexParser.SUB:
            case ApexParser.ATSIGN:
            case ApexParser.Identifier:
                {
                this.state = 738;
                this.statement();
                }
                break;
            case ApexParser.SEMI:
                {
                this.state = 739;
                this.match(ApexParser.SEMI);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public doWhileStatement(): DoWhileStatementContext {
        let localContext = new DoWhileStatementContext(this.context, this.state);
        this.enterRule(localContext, 94, ApexParser.RULE_doWhileStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 742;
            this.match(ApexParser.DO);
            this.state = 743;
            this.statement();
            this.state = 744;
            this.match(ApexParser.WHILE);
            this.state = 745;
            this.parExpression();
            this.state = 746;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public tryStatement(): TryStatementContext {
        let localContext = new TryStatementContext(this.context, this.state);
        this.enterRule(localContext, 96, ApexParser.RULE_tryStatement);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 748;
            this.match(ApexParser.TRY);
            this.state = 749;
            this.block();
            this.state = 759;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.CATCH:
                {
                this.state = 751;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                do {
                    {
                    {
                    this.state = 750;
                    this.catchClause();
                    }
                    }
                    this.state = 753;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                } while (_la === 5);
                this.state = 756;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 14) {
                    {
                    this.state = 755;
                    this.finallyBlock();
                    }
                }

                }
                break;
            case ApexParser.FINALLY:
                {
                this.state = 758;
                this.finallyBlock();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public returnStatement(): ReturnStatementContext {
        let localContext = new ReturnStatementContext(this.context, this.state);
        this.enterRule(localContext, 98, ApexParser.RULE_returnStatement);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 761;
            this.match(ApexParser.RETURN);
            this.state = 763;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 3758293271) !== 0) || _la === 226 || _la === 244) {
                {
                this.state = 762;
                this.expression(0);
                }
            }

            this.state = 765;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public throwStatement(): ThrowStatementContext {
        let localContext = new ThrowStatementContext(this.context, this.state);
        this.enterRule(localContext, 100, ApexParser.RULE_throwStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 767;
            this.match(ApexParser.THROW);
            this.state = 768;
            this.expression(0);
            this.state = 769;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public breakStatement(): BreakStatementContext {
        let localContext = new BreakStatementContext(this.context, this.state);
        this.enterRule(localContext, 102, ApexParser.RULE_breakStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 771;
            this.match(ApexParser.BREAK);
            this.state = 772;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public continueStatement(): ContinueStatementContext {
        let localContext = new ContinueStatementContext(this.context, this.state);
        this.enterRule(localContext, 104, ApexParser.RULE_continueStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 774;
            this.match(ApexParser.CONTINUE);
            this.state = 775;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public accessLevel(): AccessLevelContext {
        let localContext = new AccessLevelContext(this.context, this.state);
        this.enterRule(localContext, 106, ApexParser.RULE_accessLevel);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 777;
            this.match(ApexParser.AS);
            this.state = 778;
            _la = this.tokenStream.LA(1);
            if(!(_la === 57 || _la === 58)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public insertStatement(): InsertStatementContext {
        let localContext = new InsertStatementContext(this.context, this.state);
        this.enterRule(localContext, 108, ApexParser.RULE_insertStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 780;
            this.match(ApexParser.INSERT);
            this.state = 782;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 63, this.context) ) {
            case 1:
                {
                this.state = 781;
                this.accessLevel();
                }
                break;
            }
            this.state = 784;
            this.expression(0);
            this.state = 785;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public updateStatement(): UpdateStatementContext {
        let localContext = new UpdateStatementContext(this.context, this.state);
        this.enterRule(localContext, 110, ApexParser.RULE_updateStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 787;
            this.match(ApexParser.UPDATE);
            this.state = 789;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 64, this.context) ) {
            case 1:
                {
                this.state = 788;
                this.accessLevel();
                }
                break;
            }
            this.state = 791;
            this.expression(0);
            this.state = 792;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public deleteStatement(): DeleteStatementContext {
        let localContext = new DeleteStatementContext(this.context, this.state);
        this.enterRule(localContext, 112, ApexParser.RULE_deleteStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 794;
            this.match(ApexParser.DELETE);
            this.state = 796;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 65, this.context) ) {
            case 1:
                {
                this.state = 795;
                this.accessLevel();
                }
                break;
            }
            this.state = 798;
            this.expression(0);
            this.state = 799;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public undeleteStatement(): UndeleteStatementContext {
        let localContext = new UndeleteStatementContext(this.context, this.state);
        this.enterRule(localContext, 114, ApexParser.RULE_undeleteStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 801;
            this.match(ApexParser.UNDELETE);
            this.state = 803;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 66, this.context) ) {
            case 1:
                {
                this.state = 802;
                this.accessLevel();
                }
                break;
            }
            this.state = 805;
            this.expression(0);
            this.state = 806;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public upsertStatement(): UpsertStatementContext {
        let localContext = new UpsertStatementContext(this.context, this.state);
        this.enterRule(localContext, 116, ApexParser.RULE_upsertStatement);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 808;
            this.match(ApexParser.UPSERT);
            this.state = 810;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 67, this.context) ) {
            case 1:
                {
                this.state = 809;
                this.accessLevel();
                }
                break;
            }
            this.state = 812;
            this.expression(0);
            this.state = 814;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 5308428) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4288283411) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 268429311) !== 0) || _la === 244) {
                {
                this.state = 813;
                this.qualifiedName();
                }
            }

            this.state = 816;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public mergeStatement(): MergeStatementContext {
        let localContext = new MergeStatementContext(this.context, this.state);
        this.enterRule(localContext, 118, ApexParser.RULE_mergeStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 818;
            this.match(ApexParser.MERGE);
            this.state = 820;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 69, this.context) ) {
            case 1:
                {
                this.state = 819;
                this.accessLevel();
                }
                break;
            }
            this.state = 822;
            this.expression(0);
            this.state = 823;
            this.expression(0);
            this.state = 824;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public runAsStatement(): RunAsStatementContext {
        let localContext = new RunAsStatementContext(this.context, this.state);
        this.enterRule(localContext, 120, ApexParser.RULE_runAsStatement);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 826;
            this.match(ApexParser.SYSTEMRUNAS);
            this.state = 827;
            this.match(ApexParser.LPAREN);
            this.state = 829;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 3758293271) !== 0) || _la === 226 || _la === 244) {
                {
                this.state = 828;
                this.expressionList();
                }
            }

            this.state = 831;
            this.match(ApexParser.RPAREN);
            this.state = 832;
            this.block();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public expressionStatement(): ExpressionStatementContext {
        let localContext = new ExpressionStatementContext(this.context, this.state);
        this.enterRule(localContext, 122, ApexParser.RULE_expressionStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 834;
            this.expression(0);
            this.state = 835;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public propertyBlock(): PropertyBlockContext {
        let localContext = new PropertyBlockContext(this.context, this.state);
        this.enterRule(localContext, 124, ApexParser.RULE_propertyBlock);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 840;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4027719682) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & 413769) !== 0) || _la === 243) {
                {
                {
                this.state = 837;
                this.modifier();
                }
                }
                this.state = 842;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 845;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.GET:
                {
                this.state = 843;
                this.getter();
                }
                break;
            case ApexParser.SET:
                {
                this.state = 844;
                this.setter();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public getter(): GetterContext {
        let localContext = new GetterContext(this.context, this.state);
        this.enterRule(localContext, 126, ApexParser.RULE_getter);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 847;
            this.match(ApexParser.GET);
            this.state = 850;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.SEMI:
                {
                this.state = 848;
                this.match(ApexParser.SEMI);
                }
                break;
            case ApexParser.LBRACE:
                {
                this.state = 849;
                this.block();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public setter(): SetterContext {
        let localContext = new SetterContext(this.context, this.state);
        this.enterRule(localContext, 128, ApexParser.RULE_setter);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 852;
            this.match(ApexParser.SET);
            this.state = 855;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.SEMI:
                {
                this.state = 853;
                this.match(ApexParser.SEMI);
                }
                break;
            case ApexParser.LBRACE:
                {
                this.state = 854;
                this.block();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public catchClause(): CatchClauseContext {
        let localContext = new CatchClauseContext(this.context, this.state);
        this.enterRule(localContext, 130, ApexParser.RULE_catchClause);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 857;
            this.match(ApexParser.CATCH);
            this.state = 858;
            this.match(ApexParser.LPAREN);
            this.state = 862;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 75, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 859;
                    this.modifier();
                    }
                    }
                }
                this.state = 864;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 75, this.context);
            }
            this.state = 865;
            this.qualifiedName();
            this.state = 866;
            this.id();
            this.state = 867;
            this.match(ApexParser.RPAREN);
            this.state = 868;
            this.block();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public finallyBlock(): FinallyBlockContext {
        let localContext = new FinallyBlockContext(this.context, this.state);
        this.enterRule(localContext, 132, ApexParser.RULE_finallyBlock);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 870;
            this.match(ApexParser.FINALLY);
            this.state = 871;
            this.block();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public forControl(): ForControlContext {
        let localContext = new ForControlContext(this.context, this.state);
        this.enterRule(localContext, 134, ApexParser.RULE_forControl);
        let _la: number;
        try {
            this.state = 885;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 79, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 873;
                this.enhancedForControl();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 875;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4132642830) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294689663) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 3758293271) !== 0) || ((((_la - 226)) & ~0x1F) === 0 && ((1 << (_la - 226)) & 393217) !== 0)) {
                    {
                    this.state = 874;
                    this.forInit();
                    }
                }

                this.state = 877;
                this.match(ApexParser.SEMI);
                this.state = 879;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 3758293271) !== 0) || _la === 226 || _la === 244) {
                    {
                    this.state = 878;
                    this.expression(0);
                    }
                }

                this.state = 881;
                this.match(ApexParser.SEMI);
                this.state = 883;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 3758293271) !== 0) || _la === 226 || _la === 244) {
                    {
                    this.state = 882;
                    this.forUpdate();
                    }
                }

                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public forInit(): ForInitContext {
        let localContext = new ForInitContext(this.context, this.state);
        this.enterRule(localContext, 136, ApexParser.RULE_forInit);
        try {
            this.state = 889;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 80, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 887;
                this.localVariableDeclaration();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 888;
                this.expressionList();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public enhancedForControl(): EnhancedForControlContext {
        let localContext = new EnhancedForControlContext(this.context, this.state);
        this.enterRule(localContext, 138, ApexParser.RULE_enhancedForControl);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 891;
            this.typeRef();
            this.state = 892;
            this.id();
            this.state = 893;
            this.match(ApexParser.COLON);
            this.state = 894;
            this.expression(0);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public forUpdate(): ForUpdateContext {
        let localContext = new ForUpdateContext(this.context, this.state);
        this.enterRule(localContext, 140, ApexParser.RULE_forUpdate);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 896;
            this.expressionList();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public parExpression(): ParExpressionContext {
        let localContext = new ParExpressionContext(this.context, this.state);
        this.enterRule(localContext, 142, ApexParser.RULE_parExpression);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 898;
            this.match(ApexParser.LPAREN);
            this.state = 899;
            this.expression(0);
            this.state = 900;
            this.match(ApexParser.RPAREN);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public expressionList(): ExpressionListContext {
        let localContext = new ExpressionListContext(this.context, this.state);
        this.enterRule(localContext, 144, ApexParser.RULE_expressionList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 902;
            this.expression(0);
            this.state = 907;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 903;
                this.match(ApexParser.COMMA);
                this.state = 904;
                this.expression(0);
                }
                }
                this.state = 909;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }

    public expression(): ExpressionContext;
    public expression(_p: number): ExpressionContext;
    public expression(_p?: number): ExpressionContext {
        if (_p === undefined) {
            _p = 0;
        }

        let parentContext = this.context;
        let parentState = this.state;
        let localContext = new ExpressionContext(this.context, parentState);
        let _startState = 146;
        this.enterRecursionRule(localContext, 146, ApexParser.RULE_expression, _p);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 928;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 82, this.context) ) {
            case 1:
                {
                localContext = new PrimaryExpressionContext(localContext);
                this.context = localContext;

                this.state = 911;
                this.primary();
                }
                break;
            case 2:
                {
                localContext = new MethodCallExpressionContext(localContext);
                this.context = localContext;
                this.state = 912;
                this.methodCall();
                }
                break;
            case 3:
                {
                localContext = new NewExpressionContext(localContext);
                this.context = localContext;
                this.state = 913;
                this.match(ApexParser.NEW);
                this.state = 914;
                this.creator();
                }
                break;
            case 4:
                {
                localContext = new CastExpressionContext(localContext);
                this.context = localContext;
                this.state = 915;
                this.match(ApexParser.LPAREN);
                this.state = 916;
                this.typeRef();
                this.state = 917;
                this.match(ApexParser.RPAREN);
                this.state = 918;
                this.expression(19);
                }
                break;
            case 5:
                {
                localContext = new SubExpressionContext(localContext);
                this.context = localContext;
                this.state = 920;
                this.match(ApexParser.LPAREN);
                this.state = 921;
                this.expression(0);
                this.state = 922;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 6:
                {
                localContext = new PreOpExpressionContext(localContext);
                this.context = localContext;
                this.state = 924;
                _la = this.tokenStream.LA(1);
                if(!(((((_la - 223)) & ~0x1F) === 0 && ((1 << (_la - 223)) & 15) !== 0))) {
                this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                this.state = 925;
                this.expression(16);
                }
                break;
            case 7:
                {
                localContext = new NegExpressionContext(localContext);
                this.context = localContext;
                this.state = 926;
                _la = this.tokenStream.LA(1);
                if(!(_la === 210 || _la === 211)) {
                this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                this.state = 927;
                this.expression(15);
                }
                break;
            }
            this.context!.stop = this.tokenStream.LT(-1);
            this.state = 1001;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 87, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    if (this.parseListeners != null) {
                        this.triggerExitRuleEvent();
                    }
                    {
                    this.state = 999;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 86, this.context) ) {
                    case 1:
                        {
                        localContext = new Arth1ExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 930;
                        if (!(this.precpred(this.context, 14))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 14)");
                        }
                        this.state = 931;
                        _la = this.tokenStream.LA(1);
                        if(!(_la === 227 || _la === 228)) {
                        this.errorHandler.recoverInline(this);
                        }
                        else {
                            this.errorHandler.reportMatch(this);
                            this.consume();
                        }
                        this.state = 932;
                        this.expression(15);
                        }
                        break;
                    case 2:
                        {
                        localContext = new Arth2ExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 933;
                        if (!(this.precpred(this.context, 13))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 13)");
                        }
                        this.state = 934;
                        _la = this.tokenStream.LA(1);
                        if(!(_la === 225 || _la === 226)) {
                        this.errorHandler.recoverInline(this);
                        }
                        else {
                            this.errorHandler.reportMatch(this);
                            this.consume();
                        }
                        this.state = 935;
                        this.expression(14);
                        }
                        break;
                    case 3:
                        {
                        localContext = new BitExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 936;
                        if (!(this.precpred(this.context, 12))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 12)");
                        }
                        this.state = 944;
                        this.errorHandler.sync(this);
                        switch (this.interpreter.adaptivePredict(this.tokenStream, 83, this.context) ) {
                        case 1:
                            {
                            this.state = 937;
                            this.match(ApexParser.LT);
                            this.state = 938;
                            this.match(ApexParser.LT);
                            }
                            break;
                        case 2:
                            {
                            this.state = 939;
                            this.match(ApexParser.GT);
                            this.state = 940;
                            this.match(ApexParser.GT);
                            this.state = 941;
                            this.match(ApexParser.GT);
                            }
                            break;
                        case 3:
                            {
                            this.state = 942;
                            this.match(ApexParser.GT);
                            this.state = 943;
                            this.match(ApexParser.GT);
                            }
                            break;
                        }
                        this.state = 946;
                        this.expression(13);
                        }
                        break;
                    case 4:
                        {
                        localContext = new CmpExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 947;
                        if (!(this.precpred(this.context, 11))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 11)");
                        }
                        this.state = 948;
                        _la = this.tokenStream.LA(1);
                        if(!(_la === 208 || _la === 209)) {
                        this.errorHandler.recoverInline(this);
                        }
                        else {
                            this.errorHandler.reportMatch(this);
                            this.consume();
                        }
                        this.state = 950;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 207) {
                            {
                            this.state = 949;
                            this.match(ApexParser.ASSIGN);
                            }
                        }

                        this.state = 952;
                        this.expression(12);
                        }
                        break;
                    case 5:
                        {
                        localContext = new EqualityExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 953;
                        if (!(this.precpred(this.context, 9))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 9)");
                        }
                        this.state = 954;
                        _la = this.tokenStream.LA(1);
                        if(!(((((_la - 216)) & ~0x1F) === 0 && ((1 << (_la - 216)) & 31) !== 0))) {
                        this.errorHandler.recoverInline(this);
                        }
                        else {
                            this.errorHandler.reportMatch(this);
                            this.consume();
                        }
                        this.state = 955;
                        this.expression(10);
                        }
                        break;
                    case 6:
                        {
                        localContext = new BitAndExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 956;
                        if (!(this.precpred(this.context, 8))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 8)");
                        }
                        this.state = 957;
                        this.match(ApexParser.BITAND);
                        this.state = 958;
                        this.expression(9);
                        }
                        break;
                    case 7:
                        {
                        localContext = new BitNotExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 959;
                        if (!(this.precpred(this.context, 7))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 7)");
                        }
                        this.state = 960;
                        this.match(ApexParser.CARET);
                        this.state = 961;
                        this.expression(8);
                        }
                        break;
                    case 8:
                        {
                        localContext = new BitOrExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 962;
                        if (!(this.precpred(this.context, 6))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 6)");
                        }
                        this.state = 963;
                        this.match(ApexParser.BITOR);
                        this.state = 964;
                        this.expression(7);
                        }
                        break;
                    case 9:
                        {
                        localContext = new LogAndExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 965;
                        if (!(this.precpred(this.context, 5))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 5)");
                        }
                        this.state = 966;
                        this.match(ApexParser.AND);
                        this.state = 967;
                        this.expression(6);
                        }
                        break;
                    case 10:
                        {
                        localContext = new LogOrExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 968;
                        if (!(this.precpred(this.context, 4))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 4)");
                        }
                        this.state = 969;
                        this.match(ApexParser.OR);
                        this.state = 970;
                        this.expression(5);
                        }
                        break;
                    case 11:
                        {
                        localContext = new CondExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 971;
                        if (!(this.precpred(this.context, 3))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 3)");
                        }
                        this.state = 972;
                        this.match(ApexParser.QUESTION);
                        this.state = 973;
                        this.expression(0);
                        this.state = 974;
                        this.match(ApexParser.COLON);
                        this.state = 975;
                        this.expression(3);
                        }
                        break;
                    case 12:
                        {
                        localContext = new CoalescingExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 977;
                        if (!(this.precpred(this.context, 2))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 2)");
                        }
                        this.state = 978;
                        this.match(ApexParser.DOUBLEQUESTION);
                        this.state = 979;
                        this.expression(2);
                        }
                        break;
                    case 13:
                        {
                        localContext = new AssignExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 980;
                        if (!(this.precpred(this.context, 1))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 1)");
                        }
                        this.state = 981;
                        _la = this.tokenStream.LA(1);
                        if(!(((((_la - 207)) & ~0x1F) === 0 && ((1 << (_la - 207)) & 4227858433) !== 0) || ((((_la - 239)) & ~0x1F) === 0 && ((1 << (_la - 239)) & 15) !== 0))) {
                        this.errorHandler.recoverInline(this);
                        }
                        else {
                            this.errorHandler.reportMatch(this);
                            this.consume();
                        }
                        this.state = 982;
                        this.expression(1);
                        }
                        break;
                    case 14:
                        {
                        localContext = new DotExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 983;
                        if (!(this.precpred(this.context, 23))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 23)");
                        }
                        this.state = 984;
                        _la = this.tokenStream.LA(1);
                        if(!(_la === 206 || _la === 212)) {
                        this.errorHandler.recoverInline(this);
                        }
                        else {
                            this.errorHandler.reportMatch(this);
                            this.consume();
                        }
                        this.state = 987;
                        this.errorHandler.sync(this);
                        switch (this.interpreter.adaptivePredict(this.tokenStream, 85, this.context) ) {
                        case 1:
                            {
                            this.state = 985;
                            this.dotMethodCall();
                            }
                            break;
                        case 2:
                            {
                            this.state = 986;
                            this.anyId();
                            }
                            break;
                        }
                        }
                        break;
                    case 15:
                        {
                        localContext = new ArrayExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 989;
                        if (!(this.precpred(this.context, 22))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 22)");
                        }
                        this.state = 990;
                        this.match(ApexParser.LBRACK);
                        this.state = 991;
                        this.expression(0);
                        this.state = 992;
                        this.match(ApexParser.RBRACK);
                        }
                        break;
                    case 16:
                        {
                        localContext = new PostOpExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 994;
                        if (!(this.precpred(this.context, 17))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 17)");
                        }
                        this.state = 995;
                        _la = this.tokenStream.LA(1);
                        if(!(_la === 223 || _la === 224)) {
                        this.errorHandler.recoverInline(this);
                        }
                        else {
                            this.errorHandler.reportMatch(this);
                            this.consume();
                        }
                        }
                        break;
                    case 17:
                        {
                        localContext = new InstanceOfExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 996;
                        if (!(this.precpred(this.context, 10))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 10)");
                        }
                        this.state = 997;
                        this.match(ApexParser.INSTANCEOF);
                        this.state = 998;
                        this.typeRef();
                        }
                        break;
                    }
                    }
                }
                this.state = 1003;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 87, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.unrollRecursionContexts(parentContext);
        }
        return localContext;
    }
    public primary(): PrimaryContext {
        let localContext = new PrimaryContext(this.context, this.state);
        this.enterRule(localContext, 148, ApexParser.RULE_primary);
        try {
            this.state = 1017;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 88, this.context) ) {
            case 1:
                localContext = new ThisPrimaryContext(localContext);
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1004;
                this.match(ApexParser.THIS);
                }
                break;
            case 2:
                localContext = new SuperPrimaryContext(localContext);
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1005;
                this.match(ApexParser.SUPER);
                }
                break;
            case 3:
                localContext = new LiteralPrimaryContext(localContext);
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1006;
                this.literal();
                }
                break;
            case 4:
                localContext = new TypeRefPrimaryContext(localContext);
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1007;
                this.typeRef();
                this.state = 1008;
                this.match(ApexParser.DOT);
                this.state = 1009;
                this.match(ApexParser.CLASS);
                }
                break;
            case 5:
                localContext = new VoidPrimaryContext(localContext);
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1011;
                this.match(ApexParser.VOID);
                this.state = 1012;
                this.match(ApexParser.DOT);
                this.state = 1013;
                this.match(ApexParser.CLASS);
                }
                break;
            case 6:
                localContext = new IdPrimaryContext(localContext);
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1014;
                this.id();
                }
                break;
            case 7:
                localContext = new SoqlPrimaryContext(localContext);
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 1015;
                this.soqlLiteral();
                }
                break;
            case 8:
                localContext = new SoslPrimaryContext(localContext);
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 1016;
                this.soslLiteral();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public methodCall(): MethodCallContext {
        let localContext = new MethodCallContext(this.context, this.state);
        this.enterRule(localContext, 150, ApexParser.RULE_methodCall);
        let _la: number;
        try {
            this.state = 1038;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.AFTER:
            case ApexParser.BEFORE:
            case ApexParser.GET:
            case ApexParser.INHERITED:
            case ApexParser.INSTANCEOF:
            case ApexParser.SET:
            case ApexParser.SHARING:
            case ApexParser.SWITCH:
            case ApexParser.TRANSIENT:
            case ApexParser.TRIGGER:
            case ApexParser.WHEN:
            case ApexParser.WITH:
            case ApexParser.WITHOUT:
            case ApexParser.SYSTEM:
            case ApexParser.USER:
            case ApexParser.SELECT:
            case ApexParser.COUNT:
            case ApexParser.FROM:
            case ApexParser.AS:
            case ApexParser.USING:
            case ApexParser.SCOPE:
            case ApexParser.WHERE:
            case ApexParser.ORDER:
            case ApexParser.BY:
            case ApexParser.LIMIT:
            case ApexParser.SOQLAND:
            case ApexParser.SOQLOR:
            case ApexParser.NOT:
            case ApexParser.AVG:
            case ApexParser.COUNT_DISTINCT:
            case ApexParser.MIN:
            case ApexParser.MAX:
            case ApexParser.SUM:
            case ApexParser.TYPEOF:
            case ApexParser.END:
            case ApexParser.THEN:
            case ApexParser.LIKE:
            case ApexParser.IN:
            case ApexParser.INCLUDES:
            case ApexParser.EXCLUDES:
            case ApexParser.ASC:
            case ApexParser.DESC:
            case ApexParser.NULLS:
            case ApexParser.FIRST:
            case ApexParser.LAST:
            case ApexParser.GROUP:
            case ApexParser.ALL:
            case ApexParser.ROWS:
            case ApexParser.VIEW:
            case ApexParser.HAVING:
            case ApexParser.ROLLUP:
            case ApexParser.TOLABEL:
            case ApexParser.OFFSET:
            case ApexParser.DATA:
            case ApexParser.CATEGORY:
            case ApexParser.AT:
            case ApexParser.ABOVE:
            case ApexParser.BELOW:
            case ApexParser.ABOVE_OR_BELOW:
            case ApexParser.SECURITY_ENFORCED:
            case ApexParser.SYSTEM_MODE:
            case ApexParser.USER_MODE:
            case ApexParser.REFERENCE:
            case ApexParser.CUBE:
            case ApexParser.FORMAT:
            case ApexParser.TRACKING:
            case ApexParser.VIEWSTAT:
            case ApexParser.CUSTOM:
            case ApexParser.STANDARD:
            case ApexParser.DISTANCE:
            case ApexParser.GEOLOCATION:
            case ApexParser.CALENDAR_MONTH:
            case ApexParser.CALENDAR_QUARTER:
            case ApexParser.CALENDAR_YEAR:
            case ApexParser.DAY_IN_MONTH:
            case ApexParser.DAY_IN_WEEK:
            case ApexParser.DAY_IN_YEAR:
            case ApexParser.DAY_ONLY:
            case ApexParser.FISCAL_MONTH:
            case ApexParser.FISCAL_QUARTER:
            case ApexParser.FISCAL_YEAR:
            case ApexParser.HOUR_IN_DAY:
            case ApexParser.WEEK_IN_MONTH:
            case ApexParser.WEEK_IN_YEAR:
            case ApexParser.CONVERT_TIMEZONE:
            case ApexParser.YESTERDAY:
            case ApexParser.TODAY:
            case ApexParser.TOMORROW:
            case ApexParser.LAST_WEEK:
            case ApexParser.THIS_WEEK:
            case ApexParser.NEXT_WEEK:
            case ApexParser.LAST_MONTH:
            case ApexParser.THIS_MONTH:
            case ApexParser.NEXT_MONTH:
            case ApexParser.LAST_90_DAYS:
            case ApexParser.NEXT_90_DAYS:
            case ApexParser.LAST_N_DAYS_N:
            case ApexParser.NEXT_N_DAYS_N:
            case ApexParser.N_DAYS_AGO_N:
            case ApexParser.NEXT_N_WEEKS_N:
            case ApexParser.LAST_N_WEEKS_N:
            case ApexParser.N_WEEKS_AGO_N:
            case ApexParser.NEXT_N_MONTHS_N:
            case ApexParser.LAST_N_MONTHS_N:
            case ApexParser.N_MONTHS_AGO_N:
            case ApexParser.THIS_QUARTER:
            case ApexParser.LAST_QUARTER:
            case ApexParser.NEXT_QUARTER:
            case ApexParser.NEXT_N_QUARTERS_N:
            case ApexParser.LAST_N_QUARTERS_N:
            case ApexParser.N_QUARTERS_AGO_N:
            case ApexParser.THIS_YEAR:
            case ApexParser.LAST_YEAR:
            case ApexParser.NEXT_YEAR:
            case ApexParser.NEXT_N_YEARS_N:
            case ApexParser.LAST_N_YEARS_N:
            case ApexParser.N_YEARS_AGO_N:
            case ApexParser.THIS_FISCAL_QUARTER:
            case ApexParser.LAST_FISCAL_QUARTER:
            case ApexParser.NEXT_FISCAL_QUARTER:
            case ApexParser.NEXT_N_FISCAL_QUARTERS_N:
            case ApexParser.LAST_N_FISCAL_QUARTERS_N:
            case ApexParser.N_FISCAL_QUARTERS_AGO_N:
            case ApexParser.THIS_FISCAL_YEAR:
            case ApexParser.LAST_FISCAL_YEAR:
            case ApexParser.NEXT_FISCAL_YEAR:
            case ApexParser.NEXT_N_FISCAL_YEARS_N:
            case ApexParser.LAST_N_FISCAL_YEARS_N:
            case ApexParser.N_FISCAL_YEARS_AGO_N:
            case ApexParser.IntegralCurrencyLiteral:
            case ApexParser.FIND:
            case ApexParser.EMAIL:
            case ApexParser.NAME:
            case ApexParser.PHONE:
            case ApexParser.SIDEBAR:
            case ApexParser.FIELDS:
            case ApexParser.METADATA:
            case ApexParser.PRICEBOOKID:
            case ApexParser.NETWORK:
            case ApexParser.SNIPPET:
            case ApexParser.TARGET_LENGTH:
            case ApexParser.DIVISION:
            case ApexParser.RETURNING:
            case ApexParser.LISTVIEW:
            case ApexParser.Identifier:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1019;
                this.id();
                this.state = 1020;
                this.match(ApexParser.LPAREN);
                this.state = 1022;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 3758293271) !== 0) || _la === 226 || _la === 244) {
                    {
                    this.state = 1021;
                    this.expressionList();
                    }
                }

                this.state = 1024;
                this.match(ApexParser.RPAREN);
                }
                break;
            case ApexParser.THIS:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1026;
                this.match(ApexParser.THIS);
                this.state = 1027;
                this.match(ApexParser.LPAREN);
                this.state = 1029;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 3758293271) !== 0) || _la === 226 || _la === 244) {
                    {
                    this.state = 1028;
                    this.expressionList();
                    }
                }

                this.state = 1031;
                this.match(ApexParser.RPAREN);
                }
                break;
            case ApexParser.SUPER:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1032;
                this.match(ApexParser.SUPER);
                this.state = 1033;
                this.match(ApexParser.LPAREN);
                this.state = 1035;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 3758293271) !== 0) || _la === 226 || _la === 244) {
                    {
                    this.state = 1034;
                    this.expressionList();
                    }
                }

                this.state = 1037;
                this.match(ApexParser.RPAREN);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public dotMethodCall(): DotMethodCallContext {
        let localContext = new DotMethodCallContext(this.context, this.state);
        this.enterRule(localContext, 152, ApexParser.RULE_dotMethodCall);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1040;
            this.anyId();
            this.state = 1041;
            this.match(ApexParser.LPAREN);
            this.state = 1043;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 3758293271) !== 0) || _la === 226 || _la === 244) {
                {
                this.state = 1042;
                this.expressionList();
                }
            }

            this.state = 1045;
            this.match(ApexParser.RPAREN);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public creator(): CreatorContext {
        let localContext = new CreatorContext(this.context, this.state);
        this.enterRule(localContext, 154, ApexParser.RULE_creator);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1047;
            this.createdName();
            this.state = 1053;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 94, this.context) ) {
            case 1:
                {
                this.state = 1048;
                this.noRest();
                }
                break;
            case 2:
                {
                this.state = 1049;
                this.classCreatorRest();
                }
                break;
            case 3:
                {
                this.state = 1050;
                this.arrayCreatorRest();
                }
                break;
            case 4:
                {
                this.state = 1051;
                this.mapCreatorRest();
                }
                break;
            case 5:
                {
                this.state = 1052;
                this.setCreatorRest();
                }
                break;
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public createdName(): CreatedNameContext {
        let localContext = new CreatedNameContext(this.context, this.state);
        this.enterRule(localContext, 156, ApexParser.RULE_createdName);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1055;
            this.idCreatedNamePair();
            this.state = 1060;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 206) {
                {
                {
                this.state = 1056;
                this.match(ApexParser.DOT);
                this.state = 1057;
                this.idCreatedNamePair();
                }
                }
                this.state = 1062;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public idCreatedNamePair(): IdCreatedNamePairContext {
        let localContext = new IdCreatedNamePairContext(this.context, this.state);
        this.enterRule(localContext, 158, ApexParser.RULE_idCreatedNamePair);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1063;
            this.anyId();
            this.state = 1068;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 209) {
                {
                this.state = 1064;
                this.match(ApexParser.LT);
                this.state = 1065;
                this.typeList();
                this.state = 1066;
                this.match(ApexParser.GT);
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public noRest(): NoRestContext {
        let localContext = new NoRestContext(this.context, this.state);
        this.enterRule(localContext, 160, ApexParser.RULE_noRest);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1070;
            this.match(ApexParser.LBRACE);
            this.state = 1071;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public classCreatorRest(): ClassCreatorRestContext {
        let localContext = new ClassCreatorRestContext(this.context, this.state);
        this.enterRule(localContext, 162, ApexParser.RULE_classCreatorRest);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1073;
            this.arguments();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public arrayCreatorRest(): ArrayCreatorRestContext {
        let localContext = new ArrayCreatorRestContext(this.context, this.state);
        this.enterRule(localContext, 164, ApexParser.RULE_arrayCreatorRest);
        try {
            this.state = 1084;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 98, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1075;
                this.match(ApexParser.LBRACK);
                this.state = 1076;
                this.expression(0);
                this.state = 1077;
                this.match(ApexParser.RBRACK);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1079;
                this.match(ApexParser.LBRACK);
                this.state = 1080;
                this.match(ApexParser.RBRACK);
                this.state = 1082;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 97, this.context) ) {
                case 1:
                    {
                    this.state = 1081;
                    this.arrayInitializer();
                    }
                    break;
                }
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public mapCreatorRest(): MapCreatorRestContext {
        let localContext = new MapCreatorRestContext(this.context, this.state);
        this.enterRule(localContext, 166, ApexParser.RULE_mapCreatorRest);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1086;
            this.match(ApexParser.LBRACE);
            this.state = 1087;
            this.mapCreatorRestPair();
            this.state = 1092;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 1088;
                this.match(ApexParser.COMMA);
                this.state = 1089;
                this.mapCreatorRestPair();
                }
                }
                this.state = 1094;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 1095;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public mapCreatorRestPair(): MapCreatorRestPairContext {
        let localContext = new MapCreatorRestPairContext(this.context, this.state);
        this.enterRule(localContext, 168, ApexParser.RULE_mapCreatorRestPair);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1097;
            this.expression(0);
            this.state = 1098;
            this.match(ApexParser.MAPTO);
            this.state = 1099;
            this.expression(0);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public setCreatorRest(): SetCreatorRestContext {
        let localContext = new SetCreatorRestContext(this.context, this.state);
        this.enterRule(localContext, 170, ApexParser.RULE_setCreatorRest);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1101;
            this.match(ApexParser.LBRACE);
            this.state = 1102;
            this.expression(0);
            this.state = 1107;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 1103;
                this.match(ApexParser.COMMA);
                {
                this.state = 1104;
                this.expression(0);
                }
                }
                }
                this.state = 1109;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 1110;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public arguments(): ArgumentsContext {
        let localContext = new ArgumentsContext(this.context, this.state);
        this.enterRule(localContext, 172, ApexParser.RULE_arguments);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1112;
            this.match(ApexParser.LPAREN);
            this.state = 1114;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 3758293271) !== 0) || _la === 226 || _la === 244) {
                {
                this.state = 1113;
                this.expressionList();
                }
            }

            this.state = 1116;
            this.match(ApexParser.RPAREN);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public soqlLiteral(): SoqlLiteralContext {
        let localContext = new SoqlLiteralContext(this.context, this.state);
        this.enterRule(localContext, 174, ApexParser.RULE_soqlLiteral);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1118;
            this.match(ApexParser.LBRACK);
            this.state = 1119;
            this.query();
            this.state = 1120;
            this.match(ApexParser.RBRACK);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public query(): QueryContext {
        let localContext = new QueryContext(this.context, this.state);
        this.enterRule(localContext, 176, ApexParser.RULE_query);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1122;
            this.match(ApexParser.SELECT);
            this.state = 1123;
            this.selectList();
            this.state = 1124;
            this.match(ApexParser.FROM);
            this.state = 1125;
            this.fromNameList();
            this.state = 1127;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 63) {
                {
                this.state = 1126;
                this.usingScope();
                }
            }

            this.state = 1130;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 65) {
                {
                this.state = 1129;
                this.whereClause();
                }
            }

            this.state = 1133;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 53) {
                {
                this.state = 1132;
                this.withClause();
                }
            }

            this.state = 1136;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 89) {
                {
                this.state = 1135;
                this.groupByClause();
                }
            }

            this.state = 1139;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 66) {
                {
                this.state = 1138;
                this.orderByClause();
                }
            }

            this.state = 1142;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 68) {
                {
                this.state = 1141;
                this.limitClause();
                }
            }

            this.state = 1145;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 96) {
                {
                this.state = 1144;
                this.offsetClause();
                }
            }

            this.state = 1148;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 90) {
                {
                this.state = 1147;
                this.allRowsClause();
                }
            }

            this.state = 1150;
            this.forClauses();
            this.state = 1153;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 46) {
                {
                this.state = 1151;
                this.match(ApexParser.UPDATE);
                this.state = 1152;
                this.updateList();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public subQuery(): SubQueryContext {
        let localContext = new SubQueryContext(this.context, this.state);
        this.enterRule(localContext, 178, ApexParser.RULE_subQuery);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1155;
            this.match(ApexParser.SELECT);
            this.state = 1156;
            this.subFieldList();
            this.state = 1157;
            this.match(ApexParser.FROM);
            this.state = 1158;
            this.fromNameList();
            this.state = 1160;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 65) {
                {
                this.state = 1159;
                this.whereClause();
                }
            }

            this.state = 1163;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 66) {
                {
                this.state = 1162;
                this.orderByClause();
                }
            }

            this.state = 1166;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 68) {
                {
                this.state = 1165;
                this.limitClause();
                }
            }

            this.state = 1168;
            this.forClauses();
            this.state = 1171;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 46) {
                {
                this.state = 1169;
                this.match(ApexParser.UPDATE);
                this.state = 1170;
                this.updateList();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public selectList(): SelectListContext {
        let localContext = new SelectListContext(this.context, this.state);
        this.enterRule(localContext, 180, ApexParser.RULE_selectList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1173;
            this.selectEntry();
            this.state = 1178;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 1174;
                this.match(ApexParser.COMMA);
                this.state = 1175;
                this.selectEntry();
                }
                }
                this.state = 1180;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public selectEntry(): SelectEntryContext {
        let localContext = new SelectEntryContext(this.context, this.state);
        this.enterRule(localContext, 182, ApexParser.RULE_selectEntry);
        try {
            this.state = 1196;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 119, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1181;
                this.fieldName();
                this.state = 1183;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 116, this.context) ) {
                case 1:
                    {
                    this.state = 1182;
                    this.soqlId();
                    }
                    break;
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1185;
                this.soqlFunction();
                this.state = 1187;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 117, this.context) ) {
                case 1:
                    {
                    this.state = 1186;
                    this.soqlId();
                    }
                    break;
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1189;
                this.match(ApexParser.LPAREN);
                this.state = 1190;
                this.subQuery();
                this.state = 1191;
                this.match(ApexParser.RPAREN);
                this.state = 1193;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 118, this.context) ) {
                case 1:
                    {
                    this.state = 1192;
                    this.soqlId();
                    }
                    break;
                }
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1195;
                this.typeOf();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public fieldName(): FieldNameContext {
        let localContext = new FieldNameContext(this.context, this.state);
        this.enterRule(localContext, 184, ApexParser.RULE_fieldName);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1198;
            this.soqlId();
            this.state = 1203;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 206) {
                {
                {
                this.state = 1199;
                this.match(ApexParser.DOT);
                this.state = 1200;
                this.soqlId();
                }
                }
                this.state = 1205;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public fromNameList(): FromNameListContext {
        let localContext = new FromNameListContext(this.context, this.state);
        this.enterRule(localContext, 186, ApexParser.RULE_fromNameList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1206;
            this.fieldName();
            this.state = 1208;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 121, this.context) ) {
            case 1:
                {
                this.state = 1207;
                this.soqlId();
                }
                break;
            }
            this.state = 1217;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 1210;
                this.match(ApexParser.COMMA);
                this.state = 1211;
                this.fieldName();
                this.state = 1213;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 122, this.context) ) {
                case 1:
                    {
                    this.state = 1212;
                    this.soqlId();
                    }
                    break;
                }
                }
                }
                this.state = 1219;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public subFieldList(): SubFieldListContext {
        let localContext = new SubFieldListContext(this.context, this.state);
        this.enterRule(localContext, 188, ApexParser.RULE_subFieldList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1220;
            this.subFieldEntry();
            this.state = 1225;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 1221;
                this.match(ApexParser.COMMA);
                this.state = 1222;
                this.subFieldEntry();
                }
                }
                this.state = 1227;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public subFieldEntry(): SubFieldEntryContext {
        let localContext = new SubFieldEntryContext(this.context, this.state);
        this.enterRule(localContext, 190, ApexParser.RULE_subFieldEntry);
        try {
            this.state = 1237;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 127, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1228;
                this.fieldName();
                this.state = 1230;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 125, this.context) ) {
                case 1:
                    {
                    this.state = 1229;
                    this.soqlId();
                    }
                    break;
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1232;
                this.soqlFunction();
                this.state = 1234;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 126, this.context) ) {
                case 1:
                    {
                    this.state = 1233;
                    this.soqlId();
                    }
                    break;
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1236;
                this.typeOf();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public soqlFieldsParameter(): SoqlFieldsParameterContext {
        let localContext = new SoqlFieldsParameterContext(this.context, this.state);
        this.enterRule(localContext, 192, ApexParser.RULE_soqlFieldsParameter);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1239;
            _la = this.tokenStream.LA(1);
            if(!(((((_la - 90)) & ~0x1F) === 0 && ((1 << (_la - 90)) & 6291457) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public soqlFunction(): SoqlFunctionContext {
        let localContext = new SoqlFunctionContext(this.context, this.state);
        this.enterRule(localContext, 194, ApexParser.RULE_soqlFunction);
        try {
            this.state = 1363;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 128, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1241;
                this.match(ApexParser.AVG);
                this.state = 1242;
                this.match(ApexParser.LPAREN);
                this.state = 1243;
                this.fieldName();
                this.state = 1244;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1246;
                this.match(ApexParser.COUNT);
                this.state = 1247;
                this.match(ApexParser.LPAREN);
                this.state = 1248;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1249;
                this.match(ApexParser.COUNT);
                this.state = 1250;
                this.match(ApexParser.LPAREN);
                this.state = 1251;
                this.fieldName();
                this.state = 1252;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1254;
                this.match(ApexParser.COUNT_DISTINCT);
                this.state = 1255;
                this.match(ApexParser.LPAREN);
                this.state = 1256;
                this.fieldName();
                this.state = 1257;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1259;
                this.match(ApexParser.MIN);
                this.state = 1260;
                this.match(ApexParser.LPAREN);
                this.state = 1261;
                this.fieldName();
                this.state = 1262;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1264;
                this.match(ApexParser.MAX);
                this.state = 1265;
                this.match(ApexParser.LPAREN);
                this.state = 1266;
                this.fieldName();
                this.state = 1267;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 7:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 1269;
                this.match(ApexParser.SUM);
                this.state = 1270;
                this.match(ApexParser.LPAREN);
                this.state = 1271;
                this.fieldName();
                this.state = 1272;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 8:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 1274;
                this.match(ApexParser.TOLABEL);
                this.state = 1275;
                this.match(ApexParser.LPAREN);
                this.state = 1276;
                this.fieldName();
                this.state = 1277;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 9:
                this.enterOuterAlt(localContext, 9);
                {
                this.state = 1279;
                this.match(ApexParser.FORMAT);
                this.state = 1280;
                this.match(ApexParser.LPAREN);
                this.state = 1281;
                this.fieldName();
                this.state = 1282;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 10:
                this.enterOuterAlt(localContext, 10);
                {
                this.state = 1284;
                this.match(ApexParser.CALENDAR_MONTH);
                this.state = 1285;
                this.match(ApexParser.LPAREN);
                this.state = 1286;
                this.dateFieldName();
                this.state = 1287;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 11:
                this.enterOuterAlt(localContext, 11);
                {
                this.state = 1289;
                this.match(ApexParser.CALENDAR_QUARTER);
                this.state = 1290;
                this.match(ApexParser.LPAREN);
                this.state = 1291;
                this.dateFieldName();
                this.state = 1292;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 12:
                this.enterOuterAlt(localContext, 12);
                {
                this.state = 1294;
                this.match(ApexParser.CALENDAR_YEAR);
                this.state = 1295;
                this.match(ApexParser.LPAREN);
                this.state = 1296;
                this.dateFieldName();
                this.state = 1297;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 13:
                this.enterOuterAlt(localContext, 13);
                {
                this.state = 1299;
                this.match(ApexParser.DAY_IN_MONTH);
                this.state = 1300;
                this.match(ApexParser.LPAREN);
                this.state = 1301;
                this.dateFieldName();
                this.state = 1302;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 14:
                this.enterOuterAlt(localContext, 14);
                {
                this.state = 1304;
                this.match(ApexParser.DAY_IN_WEEK);
                this.state = 1305;
                this.match(ApexParser.LPAREN);
                this.state = 1306;
                this.dateFieldName();
                this.state = 1307;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 15:
                this.enterOuterAlt(localContext, 15);
                {
                this.state = 1309;
                this.match(ApexParser.DAY_IN_YEAR);
                this.state = 1310;
                this.match(ApexParser.LPAREN);
                this.state = 1311;
                this.dateFieldName();
                this.state = 1312;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 16:
                this.enterOuterAlt(localContext, 16);
                {
                this.state = 1314;
                this.match(ApexParser.DAY_ONLY);
                this.state = 1315;
                this.match(ApexParser.LPAREN);
                this.state = 1316;
                this.dateFieldName();
                this.state = 1317;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 17:
                this.enterOuterAlt(localContext, 17);
                {
                this.state = 1319;
                this.match(ApexParser.FISCAL_MONTH);
                this.state = 1320;
                this.match(ApexParser.LPAREN);
                this.state = 1321;
                this.dateFieldName();
                this.state = 1322;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 18:
                this.enterOuterAlt(localContext, 18);
                {
                this.state = 1324;
                this.match(ApexParser.FISCAL_QUARTER);
                this.state = 1325;
                this.match(ApexParser.LPAREN);
                this.state = 1326;
                this.dateFieldName();
                this.state = 1327;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 19:
                this.enterOuterAlt(localContext, 19);
                {
                this.state = 1329;
                this.match(ApexParser.FISCAL_YEAR);
                this.state = 1330;
                this.match(ApexParser.LPAREN);
                this.state = 1331;
                this.dateFieldName();
                this.state = 1332;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 20:
                this.enterOuterAlt(localContext, 20);
                {
                this.state = 1334;
                this.match(ApexParser.HOUR_IN_DAY);
                this.state = 1335;
                this.match(ApexParser.LPAREN);
                this.state = 1336;
                this.dateFieldName();
                this.state = 1337;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 21:
                this.enterOuterAlt(localContext, 21);
                {
                this.state = 1339;
                this.match(ApexParser.WEEK_IN_MONTH);
                this.state = 1340;
                this.match(ApexParser.LPAREN);
                this.state = 1341;
                this.dateFieldName();
                this.state = 1342;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 22:
                this.enterOuterAlt(localContext, 22);
                {
                this.state = 1344;
                this.match(ApexParser.WEEK_IN_YEAR);
                this.state = 1345;
                this.match(ApexParser.LPAREN);
                this.state = 1346;
                this.dateFieldName();
                this.state = 1347;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 23:
                this.enterOuterAlt(localContext, 23);
                {
                this.state = 1349;
                this.match(ApexParser.FIELDS);
                this.state = 1350;
                this.match(ApexParser.LPAREN);
                this.state = 1351;
                this.soqlFieldsParameter();
                this.state = 1352;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 24:
                this.enterOuterAlt(localContext, 24);
                {
                this.state = 1354;
                this.match(ApexParser.DISTANCE);
                this.state = 1355;
                this.match(ApexParser.LPAREN);
                this.state = 1356;
                this.locationValue();
                this.state = 1357;
                this.match(ApexParser.COMMA);
                this.state = 1358;
                this.locationValue();
                this.state = 1359;
                this.match(ApexParser.COMMA);
                this.state = 1360;
                this.match(ApexParser.StringLiteral);
                this.state = 1361;
                this.match(ApexParser.RPAREN);
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public dateFieldName(): DateFieldNameContext {
        let localContext = new DateFieldNameContext(this.context, this.state);
        this.enterRule(localContext, 196, ApexParser.RULE_dateFieldName);
        try {
            this.state = 1371;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 129, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1365;
                this.match(ApexParser.CONVERT_TIMEZONE);
                this.state = 1366;
                this.match(ApexParser.LPAREN);
                this.state = 1367;
                this.fieldName();
                this.state = 1368;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1370;
                this.fieldName();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public locationValue(): LocationValueContext {
        let localContext = new LocationValueContext(this.context, this.state);
        this.enterRule(localContext, 198, ApexParser.RULE_locationValue);
        try {
            this.state = 1382;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 130, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1373;
                this.fieldName();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1374;
                this.boundExpression();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1375;
                this.match(ApexParser.GEOLOCATION);
                this.state = 1376;
                this.match(ApexParser.LPAREN);
                this.state = 1377;
                this.coordinateValue();
                this.state = 1378;
                this.match(ApexParser.COMMA);
                this.state = 1379;
                this.coordinateValue();
                this.state = 1380;
                this.match(ApexParser.RPAREN);
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public coordinateValue(): CoordinateValueContext {
        let localContext = new CoordinateValueContext(this.context, this.state);
        this.enterRule(localContext, 200, ApexParser.RULE_coordinateValue);
        try {
            this.state = 1386;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.IntegerLiteral:
            case ApexParser.NumberLiteral:
            case ApexParser.ADD:
            case ApexParser.SUB:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1384;
                this.signedNumber();
                }
                break;
            case ApexParser.COLON:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1385;
                this.boundExpression();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public typeOf(): TypeOfContext {
        let localContext = new TypeOfContext(this.context, this.state);
        this.enterRule(localContext, 202, ApexParser.RULE_typeOf);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1388;
            this.match(ApexParser.TYPEOF);
            this.state = 1389;
            this.fieldName();
            this.state = 1391;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 1390;
                this.whenClause();
                }
                }
                this.state = 1393;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while (_la === 51);
            this.state = 1396;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 10) {
                {
                this.state = 1395;
                this.elseClause();
                }
            }

            this.state = 1398;
            this.match(ApexParser.END);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public whenClause(): WhenClauseContext {
        let localContext = new WhenClauseContext(this.context, this.state);
        this.enterRule(localContext, 204, ApexParser.RULE_whenClause);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1400;
            this.match(ApexParser.WHEN);
            this.state = 1401;
            this.fieldName();
            this.state = 1402;
            this.match(ApexParser.THEN);
            this.state = 1403;
            this.fieldNameList();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public elseClause(): ElseClauseContext {
        let localContext = new ElseClauseContext(this.context, this.state);
        this.enterRule(localContext, 206, ApexParser.RULE_elseClause);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1405;
            this.match(ApexParser.ELSE);
            this.state = 1406;
            this.fieldNameList();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public fieldNameList(): FieldNameListContext {
        let localContext = new FieldNameListContext(this.context, this.state);
        this.enterRule(localContext, 208, ApexParser.RULE_fieldNameList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1408;
            this.fieldName();
            this.state = 1413;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 1409;
                this.match(ApexParser.COMMA);
                this.state = 1410;
                this.fieldName();
                }
                }
                this.state = 1415;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public usingScope(): UsingScopeContext {
        let localContext = new UsingScopeContext(this.context, this.state);
        this.enterRule(localContext, 210, ApexParser.RULE_usingScope);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1416;
            this.match(ApexParser.USING);
            this.state = 1417;
            this.match(ApexParser.SCOPE);
            this.state = 1418;
            this.soqlId();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public whereClause(): WhereClauseContext {
        let localContext = new WhereClauseContext(this.context, this.state);
        this.enterRule(localContext, 212, ApexParser.RULE_whereClause);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1420;
            this.match(ApexParser.WHERE);
            this.state = 1421;
            this.logicalExpression();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public logicalExpression(): LogicalExpressionContext {
        let localContext = new LogicalExpressionContext(this.context, this.state);
        this.enterRule(localContext, 214, ApexParser.RULE_logicalExpression);
        let _la: number;
        try {
            this.state = 1441;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 137, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1423;
                this.conditionalExpression();
                this.state = 1428;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 69) {
                    {
                    {
                    this.state = 1424;
                    this.match(ApexParser.SOQLAND);
                    this.state = 1425;
                    this.conditionalExpression();
                    }
                    }
                    this.state = 1430;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1431;
                this.conditionalExpression();
                this.state = 1436;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 70) {
                    {
                    {
                    this.state = 1432;
                    this.match(ApexParser.SOQLOR);
                    this.state = 1433;
                    this.conditionalExpression();
                    }
                    }
                    this.state = 1438;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1439;
                this.match(ApexParser.NOT);
                this.state = 1440;
                this.conditionalExpression();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public conditionalExpression(): ConditionalExpressionContext {
        let localContext = new ConditionalExpressionContext(this.context, this.state);
        this.enterRule(localContext, 216, ApexParser.RULE_conditionalExpression);
        try {
            this.state = 1448;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.LPAREN:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1443;
                this.match(ApexParser.LPAREN);
                this.state = 1444;
                this.logicalExpression();
                this.state = 1445;
                this.match(ApexParser.RPAREN);
                }
                break;
            case ApexParser.AFTER:
            case ApexParser.BEFORE:
            case ApexParser.GET:
            case ApexParser.INHERITED:
            case ApexParser.INSTANCEOF:
            case ApexParser.SET:
            case ApexParser.SHARING:
            case ApexParser.SWITCH:
            case ApexParser.TRANSIENT:
            case ApexParser.TRIGGER:
            case ApexParser.WHEN:
            case ApexParser.WITH:
            case ApexParser.WITHOUT:
            case ApexParser.SYSTEM:
            case ApexParser.USER:
            case ApexParser.SELECT:
            case ApexParser.COUNT:
            case ApexParser.FROM:
            case ApexParser.AS:
            case ApexParser.USING:
            case ApexParser.SCOPE:
            case ApexParser.WHERE:
            case ApexParser.ORDER:
            case ApexParser.BY:
            case ApexParser.LIMIT:
            case ApexParser.SOQLAND:
            case ApexParser.SOQLOR:
            case ApexParser.NOT:
            case ApexParser.AVG:
            case ApexParser.COUNT_DISTINCT:
            case ApexParser.MIN:
            case ApexParser.MAX:
            case ApexParser.SUM:
            case ApexParser.TYPEOF:
            case ApexParser.END:
            case ApexParser.THEN:
            case ApexParser.LIKE:
            case ApexParser.IN:
            case ApexParser.INCLUDES:
            case ApexParser.EXCLUDES:
            case ApexParser.ASC:
            case ApexParser.DESC:
            case ApexParser.NULLS:
            case ApexParser.FIRST:
            case ApexParser.LAST:
            case ApexParser.GROUP:
            case ApexParser.ALL:
            case ApexParser.ROWS:
            case ApexParser.VIEW:
            case ApexParser.HAVING:
            case ApexParser.ROLLUP:
            case ApexParser.TOLABEL:
            case ApexParser.OFFSET:
            case ApexParser.DATA:
            case ApexParser.CATEGORY:
            case ApexParser.AT:
            case ApexParser.ABOVE:
            case ApexParser.BELOW:
            case ApexParser.ABOVE_OR_BELOW:
            case ApexParser.SECURITY_ENFORCED:
            case ApexParser.SYSTEM_MODE:
            case ApexParser.USER_MODE:
            case ApexParser.REFERENCE:
            case ApexParser.CUBE:
            case ApexParser.FORMAT:
            case ApexParser.TRACKING:
            case ApexParser.VIEWSTAT:
            case ApexParser.CUSTOM:
            case ApexParser.STANDARD:
            case ApexParser.DISTANCE:
            case ApexParser.GEOLOCATION:
            case ApexParser.CALENDAR_MONTH:
            case ApexParser.CALENDAR_QUARTER:
            case ApexParser.CALENDAR_YEAR:
            case ApexParser.DAY_IN_MONTH:
            case ApexParser.DAY_IN_WEEK:
            case ApexParser.DAY_IN_YEAR:
            case ApexParser.DAY_ONLY:
            case ApexParser.FISCAL_MONTH:
            case ApexParser.FISCAL_QUARTER:
            case ApexParser.FISCAL_YEAR:
            case ApexParser.HOUR_IN_DAY:
            case ApexParser.WEEK_IN_MONTH:
            case ApexParser.WEEK_IN_YEAR:
            case ApexParser.CONVERT_TIMEZONE:
            case ApexParser.YESTERDAY:
            case ApexParser.TODAY:
            case ApexParser.TOMORROW:
            case ApexParser.LAST_WEEK:
            case ApexParser.THIS_WEEK:
            case ApexParser.NEXT_WEEK:
            case ApexParser.LAST_MONTH:
            case ApexParser.THIS_MONTH:
            case ApexParser.NEXT_MONTH:
            case ApexParser.LAST_90_DAYS:
            case ApexParser.NEXT_90_DAYS:
            case ApexParser.LAST_N_DAYS_N:
            case ApexParser.NEXT_N_DAYS_N:
            case ApexParser.N_DAYS_AGO_N:
            case ApexParser.NEXT_N_WEEKS_N:
            case ApexParser.LAST_N_WEEKS_N:
            case ApexParser.N_WEEKS_AGO_N:
            case ApexParser.NEXT_N_MONTHS_N:
            case ApexParser.LAST_N_MONTHS_N:
            case ApexParser.N_MONTHS_AGO_N:
            case ApexParser.THIS_QUARTER:
            case ApexParser.LAST_QUARTER:
            case ApexParser.NEXT_QUARTER:
            case ApexParser.NEXT_N_QUARTERS_N:
            case ApexParser.LAST_N_QUARTERS_N:
            case ApexParser.N_QUARTERS_AGO_N:
            case ApexParser.THIS_YEAR:
            case ApexParser.LAST_YEAR:
            case ApexParser.NEXT_YEAR:
            case ApexParser.NEXT_N_YEARS_N:
            case ApexParser.LAST_N_YEARS_N:
            case ApexParser.N_YEARS_AGO_N:
            case ApexParser.THIS_FISCAL_QUARTER:
            case ApexParser.LAST_FISCAL_QUARTER:
            case ApexParser.NEXT_FISCAL_QUARTER:
            case ApexParser.NEXT_N_FISCAL_QUARTERS_N:
            case ApexParser.LAST_N_FISCAL_QUARTERS_N:
            case ApexParser.N_FISCAL_QUARTERS_AGO_N:
            case ApexParser.THIS_FISCAL_YEAR:
            case ApexParser.LAST_FISCAL_YEAR:
            case ApexParser.NEXT_FISCAL_YEAR:
            case ApexParser.NEXT_N_FISCAL_YEARS_N:
            case ApexParser.LAST_N_FISCAL_YEARS_N:
            case ApexParser.N_FISCAL_YEARS_AGO_N:
            case ApexParser.IntegralCurrencyLiteral:
            case ApexParser.FIND:
            case ApexParser.EMAIL:
            case ApexParser.NAME:
            case ApexParser.PHONE:
            case ApexParser.SIDEBAR:
            case ApexParser.FIELDS:
            case ApexParser.METADATA:
            case ApexParser.PRICEBOOKID:
            case ApexParser.NETWORK:
            case ApexParser.SNIPPET:
            case ApexParser.TARGET_LENGTH:
            case ApexParser.DIVISION:
            case ApexParser.RETURNING:
            case ApexParser.LISTVIEW:
            case ApexParser.Identifier:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1447;
                this.fieldExpression();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public fieldExpression(): FieldExpressionContext {
        let localContext = new FieldExpressionContext(this.context, this.state);
        this.enterRule(localContext, 218, ApexParser.RULE_fieldExpression);
        try {
            this.state = 1458;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 139, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1450;
                this.fieldName();
                this.state = 1451;
                this.comparisonOperator();
                this.state = 1452;
                this.value();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1454;
                this.soqlFunction();
                this.state = 1455;
                this.comparisonOperator();
                this.state = 1456;
                this.value();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public comparisonOperator(): ComparisonOperatorContext {
        let localContext = new ComparisonOperatorContext(this.context, this.state);
        this.enterRule(localContext, 220, ApexParser.RULE_comparisonOperator);
        try {
            this.state = 1475;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 140, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1460;
                this.match(ApexParser.ASSIGN);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1461;
                this.match(ApexParser.NOTEQUAL);
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1462;
                this.match(ApexParser.LT);
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1463;
                this.match(ApexParser.GT);
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1464;
                this.match(ApexParser.LT);
                this.state = 1465;
                this.match(ApexParser.ASSIGN);
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1466;
                this.match(ApexParser.GT);
                this.state = 1467;
                this.match(ApexParser.ASSIGN);
                }
                break;
            case 7:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 1468;
                this.match(ApexParser.LESSANDGREATER);
                }
                break;
            case 8:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 1469;
                this.match(ApexParser.LIKE);
                }
                break;
            case 9:
                this.enterOuterAlt(localContext, 9);
                {
                this.state = 1470;
                this.match(ApexParser.IN);
                }
                break;
            case 10:
                this.enterOuterAlt(localContext, 10);
                {
                this.state = 1471;
                this.match(ApexParser.NOT);
                this.state = 1472;
                this.match(ApexParser.IN);
                }
                break;
            case 11:
                this.enterOuterAlt(localContext, 11);
                {
                this.state = 1473;
                this.match(ApexParser.INCLUDES);
                }
                break;
            case 12:
                this.enterOuterAlt(localContext, 12);
                {
                this.state = 1474;
                this.match(ApexParser.EXCLUDES);
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public value(): ValueContext {
        let localContext = new ValueContext(this.context, this.state);
        this.enterRule(localContext, 222, ApexParser.RULE_value);
        let _la: number;
        try {
            this.state = 1497;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 143, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1477;
                this.match(ApexParser.NULL);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1478;
                this.match(ApexParser.BooleanLiteral);
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1479;
                this.signedNumber();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1480;
                this.match(ApexParser.StringLiteral);
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1481;
                this.match(ApexParser.DateLiteral);
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1482;
                this.match(ApexParser.DateTimeLiteral);
                }
                break;
            case 7:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 1483;
                this.dateFormula();
                }
                break;
            case 8:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 1484;
                this.match(ApexParser.IntegralCurrencyLiteral);
                this.state = 1489;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 206) {
                    {
                    this.state = 1485;
                    this.match(ApexParser.DOT);
                    this.state = 1487;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 192) {
                        {
                        this.state = 1486;
                        this.match(ApexParser.IntegerLiteral);
                        }
                    }

                    }
                }

                }
                break;
            case 9:
                this.enterOuterAlt(localContext, 9);
                {
                this.state = 1491;
                this.match(ApexParser.LPAREN);
                this.state = 1492;
                this.subQuery();
                this.state = 1493;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 10:
                this.enterOuterAlt(localContext, 10);
                {
                this.state = 1495;
                this.valueList();
                }
                break;
            case 11:
                this.enterOuterAlt(localContext, 11);
                {
                this.state = 1496;
                this.boundExpression();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public valueList(): ValueListContext {
        let localContext = new ValueListContext(this.context, this.state);
        this.enterRule(localContext, 224, ApexParser.RULE_valueList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1499;
            this.match(ApexParser.LPAREN);
            this.state = 1500;
            this.value();
            this.state = 1505;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 1501;
                this.match(ApexParser.COMMA);
                this.state = 1502;
                this.value();
                }
                }
                this.state = 1507;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 1508;
            this.match(ApexParser.RPAREN);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public signedNumber(): SignedNumberContext {
        let localContext = new SignedNumberContext(this.context, this.state);
        this.enterRule(localContext, 226, ApexParser.RULE_signedNumber);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1511;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 225 || _la === 226) {
                {
                this.state = 1510;
                _la = this.tokenStream.LA(1);
                if(!(_la === 225 || _la === 226)) {
                this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                }
            }

            this.state = 1513;
            _la = this.tokenStream.LA(1);
            if(!(_la === 192 || _la === 194)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public withClause(): WithClauseContext {
        let localContext = new WithClauseContext(this.context, this.state);
        this.enterRule(localContext, 228, ApexParser.RULE_withClause);
        try {
            this.state = 1527;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 146, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1515;
                this.match(ApexParser.WITH);
                this.state = 1516;
                this.match(ApexParser.DATA);
                this.state = 1517;
                this.match(ApexParser.CATEGORY);
                this.state = 1518;
                this.filteringExpression();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1519;
                this.match(ApexParser.WITH);
                this.state = 1520;
                this.match(ApexParser.SECURITY_ENFORCED);
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1521;
                this.match(ApexParser.WITH);
                this.state = 1522;
                this.match(ApexParser.SYSTEM_MODE);
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1523;
                this.match(ApexParser.WITH);
                this.state = 1524;
                this.match(ApexParser.USER_MODE);
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1525;
                this.match(ApexParser.WITH);
                this.state = 1526;
                this.logicalExpression();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public filteringExpression(): FilteringExpressionContext {
        let localContext = new FilteringExpressionContext(this.context, this.state);
        this.enterRule(localContext, 230, ApexParser.RULE_filteringExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1529;
            this.dataCategorySelection();
            this.state = 1534;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 221) {
                {
                {
                this.state = 1530;
                this.match(ApexParser.AND);
                this.state = 1531;
                this.dataCategorySelection();
                }
                }
                this.state = 1536;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public dataCategorySelection(): DataCategorySelectionContext {
        let localContext = new DataCategorySelectionContext(this.context, this.state);
        this.enterRule(localContext, 232, ApexParser.RULE_dataCategorySelection);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1537;
            this.soqlId();
            this.state = 1538;
            this.filteringSelector();
            this.state = 1539;
            this.dataCategoryName();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public dataCategoryName(): DataCategoryNameContext {
        let localContext = new DataCategoryNameContext(this.context, this.state);
        this.enterRule(localContext, 234, ApexParser.RULE_dataCategoryName);
        let _la: number;
        try {
            this.state = 1553;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.AFTER:
            case ApexParser.BEFORE:
            case ApexParser.GET:
            case ApexParser.INHERITED:
            case ApexParser.INSTANCEOF:
            case ApexParser.SET:
            case ApexParser.SHARING:
            case ApexParser.SWITCH:
            case ApexParser.TRANSIENT:
            case ApexParser.TRIGGER:
            case ApexParser.WHEN:
            case ApexParser.WITH:
            case ApexParser.WITHOUT:
            case ApexParser.SYSTEM:
            case ApexParser.USER:
            case ApexParser.SELECT:
            case ApexParser.COUNT:
            case ApexParser.FROM:
            case ApexParser.AS:
            case ApexParser.USING:
            case ApexParser.SCOPE:
            case ApexParser.WHERE:
            case ApexParser.ORDER:
            case ApexParser.BY:
            case ApexParser.LIMIT:
            case ApexParser.SOQLAND:
            case ApexParser.SOQLOR:
            case ApexParser.NOT:
            case ApexParser.AVG:
            case ApexParser.COUNT_DISTINCT:
            case ApexParser.MIN:
            case ApexParser.MAX:
            case ApexParser.SUM:
            case ApexParser.TYPEOF:
            case ApexParser.END:
            case ApexParser.THEN:
            case ApexParser.LIKE:
            case ApexParser.IN:
            case ApexParser.INCLUDES:
            case ApexParser.EXCLUDES:
            case ApexParser.ASC:
            case ApexParser.DESC:
            case ApexParser.NULLS:
            case ApexParser.FIRST:
            case ApexParser.LAST:
            case ApexParser.GROUP:
            case ApexParser.ALL:
            case ApexParser.ROWS:
            case ApexParser.VIEW:
            case ApexParser.HAVING:
            case ApexParser.ROLLUP:
            case ApexParser.TOLABEL:
            case ApexParser.OFFSET:
            case ApexParser.DATA:
            case ApexParser.CATEGORY:
            case ApexParser.AT:
            case ApexParser.ABOVE:
            case ApexParser.BELOW:
            case ApexParser.ABOVE_OR_BELOW:
            case ApexParser.SECURITY_ENFORCED:
            case ApexParser.SYSTEM_MODE:
            case ApexParser.USER_MODE:
            case ApexParser.REFERENCE:
            case ApexParser.CUBE:
            case ApexParser.FORMAT:
            case ApexParser.TRACKING:
            case ApexParser.VIEWSTAT:
            case ApexParser.CUSTOM:
            case ApexParser.STANDARD:
            case ApexParser.DISTANCE:
            case ApexParser.GEOLOCATION:
            case ApexParser.CALENDAR_MONTH:
            case ApexParser.CALENDAR_QUARTER:
            case ApexParser.CALENDAR_YEAR:
            case ApexParser.DAY_IN_MONTH:
            case ApexParser.DAY_IN_WEEK:
            case ApexParser.DAY_IN_YEAR:
            case ApexParser.DAY_ONLY:
            case ApexParser.FISCAL_MONTH:
            case ApexParser.FISCAL_QUARTER:
            case ApexParser.FISCAL_YEAR:
            case ApexParser.HOUR_IN_DAY:
            case ApexParser.WEEK_IN_MONTH:
            case ApexParser.WEEK_IN_YEAR:
            case ApexParser.CONVERT_TIMEZONE:
            case ApexParser.YESTERDAY:
            case ApexParser.TODAY:
            case ApexParser.TOMORROW:
            case ApexParser.LAST_WEEK:
            case ApexParser.THIS_WEEK:
            case ApexParser.NEXT_WEEK:
            case ApexParser.LAST_MONTH:
            case ApexParser.THIS_MONTH:
            case ApexParser.NEXT_MONTH:
            case ApexParser.LAST_90_DAYS:
            case ApexParser.NEXT_90_DAYS:
            case ApexParser.LAST_N_DAYS_N:
            case ApexParser.NEXT_N_DAYS_N:
            case ApexParser.N_DAYS_AGO_N:
            case ApexParser.NEXT_N_WEEKS_N:
            case ApexParser.LAST_N_WEEKS_N:
            case ApexParser.N_WEEKS_AGO_N:
            case ApexParser.NEXT_N_MONTHS_N:
            case ApexParser.LAST_N_MONTHS_N:
            case ApexParser.N_MONTHS_AGO_N:
            case ApexParser.THIS_QUARTER:
            case ApexParser.LAST_QUARTER:
            case ApexParser.NEXT_QUARTER:
            case ApexParser.NEXT_N_QUARTERS_N:
            case ApexParser.LAST_N_QUARTERS_N:
            case ApexParser.N_QUARTERS_AGO_N:
            case ApexParser.THIS_YEAR:
            case ApexParser.LAST_YEAR:
            case ApexParser.NEXT_YEAR:
            case ApexParser.NEXT_N_YEARS_N:
            case ApexParser.LAST_N_YEARS_N:
            case ApexParser.N_YEARS_AGO_N:
            case ApexParser.THIS_FISCAL_QUARTER:
            case ApexParser.LAST_FISCAL_QUARTER:
            case ApexParser.NEXT_FISCAL_QUARTER:
            case ApexParser.NEXT_N_FISCAL_QUARTERS_N:
            case ApexParser.LAST_N_FISCAL_QUARTERS_N:
            case ApexParser.N_FISCAL_QUARTERS_AGO_N:
            case ApexParser.THIS_FISCAL_YEAR:
            case ApexParser.LAST_FISCAL_YEAR:
            case ApexParser.NEXT_FISCAL_YEAR:
            case ApexParser.NEXT_N_FISCAL_YEARS_N:
            case ApexParser.LAST_N_FISCAL_YEARS_N:
            case ApexParser.N_FISCAL_YEARS_AGO_N:
            case ApexParser.IntegralCurrencyLiteral:
            case ApexParser.FIND:
            case ApexParser.EMAIL:
            case ApexParser.NAME:
            case ApexParser.PHONE:
            case ApexParser.SIDEBAR:
            case ApexParser.FIELDS:
            case ApexParser.METADATA:
            case ApexParser.PRICEBOOKID:
            case ApexParser.NETWORK:
            case ApexParser.SNIPPET:
            case ApexParser.TARGET_LENGTH:
            case ApexParser.DIVISION:
            case ApexParser.RETURNING:
            case ApexParser.LISTVIEW:
            case ApexParser.Identifier:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1541;
                this.soqlId();
                }
                break;
            case ApexParser.LPAREN:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1542;
                this.match(ApexParser.LPAREN);
                this.state = 1543;
                this.soqlId();
                this.state = 1548;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 205) {
                    {
                    {
                    this.state = 1544;
                    this.match(ApexParser.COMMA);
                    this.state = 1545;
                    this.soqlId();
                    }
                    }
                    this.state = 1550;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 1551;
                this.match(ApexParser.LPAREN);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public filteringSelector(): FilteringSelectorContext {
        let localContext = new FilteringSelectorContext(this.context, this.state);
        this.enterRule(localContext, 236, ApexParser.RULE_filteringSelector);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1555;
            _la = this.tokenStream.LA(1);
            if(!(((((_la - 99)) & ~0x1F) === 0 && ((1 << (_la - 99)) & 15) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public groupByClause(): GroupByClauseContext {
        let localContext = new GroupByClauseContext(this.context, this.state);
        this.enterRule(localContext, 238, ApexParser.RULE_groupByClause);
        let _la: number;
        try {
            this.state = 1592;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 153, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1557;
                this.match(ApexParser.GROUP);
                this.state = 1558;
                this.match(ApexParser.BY);
                this.state = 1559;
                this.selectList();
                this.state = 1562;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 93) {
                    {
                    this.state = 1560;
                    this.match(ApexParser.HAVING);
                    this.state = 1561;
                    this.logicalExpression();
                    }
                }

                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1564;
                this.match(ApexParser.GROUP);
                this.state = 1565;
                this.match(ApexParser.BY);
                this.state = 1566;
                this.match(ApexParser.ROLLUP);
                this.state = 1567;
                this.match(ApexParser.LPAREN);
                this.state = 1568;
                this.fieldName();
                this.state = 1573;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 205) {
                    {
                    {
                    this.state = 1569;
                    this.match(ApexParser.COMMA);
                    this.state = 1570;
                    this.fieldName();
                    }
                    }
                    this.state = 1575;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 1576;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1578;
                this.match(ApexParser.GROUP);
                this.state = 1579;
                this.match(ApexParser.BY);
                this.state = 1580;
                this.match(ApexParser.CUBE);
                this.state = 1581;
                this.match(ApexParser.LPAREN);
                this.state = 1582;
                this.fieldName();
                this.state = 1587;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 205) {
                    {
                    {
                    this.state = 1583;
                    this.match(ApexParser.COMMA);
                    this.state = 1584;
                    this.fieldName();
                    }
                    }
                    this.state = 1589;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 1590;
                this.match(ApexParser.RPAREN);
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public orderByClause(): OrderByClauseContext {
        let localContext = new OrderByClauseContext(this.context, this.state);
        this.enterRule(localContext, 240, ApexParser.RULE_orderByClause);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1594;
            this.match(ApexParser.ORDER);
            this.state = 1595;
            this.match(ApexParser.BY);
            this.state = 1596;
            this.fieldOrderList();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public fieldOrderList(): FieldOrderListContext {
        let localContext = new FieldOrderListContext(this.context, this.state);
        this.enterRule(localContext, 242, ApexParser.RULE_fieldOrderList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1598;
            this.fieldOrder();
            this.state = 1603;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 1599;
                this.match(ApexParser.COMMA);
                this.state = 1600;
                this.fieldOrder();
                }
                }
                this.state = 1605;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public fieldOrder(): FieldOrderContext {
        let localContext = new FieldOrderContext(this.context, this.state);
        this.enterRule(localContext, 244, ApexParser.RULE_fieldOrder);
        let _la: number;
        try {
            this.state = 1622;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 159, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1606;
                this.fieldName();
                this.state = 1608;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 84 || _la === 85) {
                    {
                    this.state = 1607;
                    _la = this.tokenStream.LA(1);
                    if(!(_la === 84 || _la === 85)) {
                    this.errorHandler.recoverInline(this);
                    }
                    else {
                        this.errorHandler.reportMatch(this);
                        this.consume();
                    }
                    }
                }

                this.state = 1612;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 86) {
                    {
                    this.state = 1610;
                    this.match(ApexParser.NULLS);
                    this.state = 1611;
                    _la = this.tokenStream.LA(1);
                    if(!(_la === 87 || _la === 88)) {
                    this.errorHandler.recoverInline(this);
                    }
                    else {
                        this.errorHandler.reportMatch(this);
                        this.consume();
                    }
                    }
                }

                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1614;
                this.soqlFunction();
                this.state = 1616;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 84 || _la === 85) {
                    {
                    this.state = 1615;
                    _la = this.tokenStream.LA(1);
                    if(!(_la === 84 || _la === 85)) {
                    this.errorHandler.recoverInline(this);
                    }
                    else {
                        this.errorHandler.reportMatch(this);
                        this.consume();
                    }
                    }
                }

                this.state = 1620;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 86) {
                    {
                    this.state = 1618;
                    this.match(ApexParser.NULLS);
                    this.state = 1619;
                    _la = this.tokenStream.LA(1);
                    if(!(_la === 87 || _la === 88)) {
                    this.errorHandler.recoverInline(this);
                    }
                    else {
                        this.errorHandler.reportMatch(this);
                        this.consume();
                    }
                    }
                }

                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public limitClause(): LimitClauseContext {
        let localContext = new LimitClauseContext(this.context, this.state);
        this.enterRule(localContext, 246, ApexParser.RULE_limitClause);
        try {
            this.state = 1628;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 160, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1624;
                this.match(ApexParser.LIMIT);
                this.state = 1625;
                this.match(ApexParser.IntegerLiteral);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1626;
                this.match(ApexParser.LIMIT);
                this.state = 1627;
                this.boundExpression();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public offsetClause(): OffsetClauseContext {
        let localContext = new OffsetClauseContext(this.context, this.state);
        this.enterRule(localContext, 248, ApexParser.RULE_offsetClause);
        try {
            this.state = 1634;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 161, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1630;
                this.match(ApexParser.OFFSET);
                this.state = 1631;
                this.match(ApexParser.IntegerLiteral);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1632;
                this.match(ApexParser.OFFSET);
                this.state = 1633;
                this.boundExpression();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public allRowsClause(): AllRowsClauseContext {
        let localContext = new AllRowsClauseContext(this.context, this.state);
        this.enterRule(localContext, 250, ApexParser.RULE_allRowsClause);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1636;
            this.match(ApexParser.ALL);
            this.state = 1637;
            this.match(ApexParser.ROWS);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public forClauses(): ForClausesContext {
        let localContext = new ForClausesContext(this.context, this.state);
        this.enterRule(localContext, 252, ApexParser.RULE_forClauses);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1643;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 15) {
                {
                {
                this.state = 1639;
                this.match(ApexParser.FOR);
                this.state = 1640;
                _la = this.tokenStream.LA(1);
                if(!(_la === 46 || _la === 92 || _la === 106)) {
                this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                }
                }
                this.state = 1645;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public boundExpression(): BoundExpressionContext {
        let localContext = new BoundExpressionContext(this.context, this.state);
        this.enterRule(localContext, 254, ApexParser.RULE_boundExpression);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1646;
            this.match(ApexParser.COLON);
            this.state = 1647;
            this.expression(0);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public dateFormula(): DateFormulaContext {
        let localContext = new DateFormulaContext(this.context, this.state);
        this.enterRule(localContext, 256, ApexParser.RULE_dateFormula);
        try {
            this.state = 1735;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.YESTERDAY:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1649;
                this.match(ApexParser.YESTERDAY);
                }
                break;
            case ApexParser.TODAY:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1650;
                this.match(ApexParser.TODAY);
                }
                break;
            case ApexParser.TOMORROW:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1651;
                this.match(ApexParser.TOMORROW);
                }
                break;
            case ApexParser.LAST_WEEK:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1652;
                this.match(ApexParser.LAST_WEEK);
                }
                break;
            case ApexParser.THIS_WEEK:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1653;
                this.match(ApexParser.THIS_WEEK);
                }
                break;
            case ApexParser.NEXT_WEEK:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1654;
                this.match(ApexParser.NEXT_WEEK);
                }
                break;
            case ApexParser.LAST_MONTH:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 1655;
                this.match(ApexParser.LAST_MONTH);
                }
                break;
            case ApexParser.THIS_MONTH:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 1656;
                this.match(ApexParser.THIS_MONTH);
                }
                break;
            case ApexParser.NEXT_MONTH:
                this.enterOuterAlt(localContext, 9);
                {
                this.state = 1657;
                this.match(ApexParser.NEXT_MONTH);
                }
                break;
            case ApexParser.LAST_90_DAYS:
                this.enterOuterAlt(localContext, 10);
                {
                this.state = 1658;
                this.match(ApexParser.LAST_90_DAYS);
                }
                break;
            case ApexParser.NEXT_90_DAYS:
                this.enterOuterAlt(localContext, 11);
                {
                this.state = 1659;
                this.match(ApexParser.NEXT_90_DAYS);
                }
                break;
            case ApexParser.LAST_N_DAYS_N:
                this.enterOuterAlt(localContext, 12);
                {
                this.state = 1660;
                this.match(ApexParser.LAST_N_DAYS_N);
                this.state = 1661;
                this.match(ApexParser.COLON);
                this.state = 1662;
                this.signedInteger();
                }
                break;
            case ApexParser.NEXT_N_DAYS_N:
                this.enterOuterAlt(localContext, 13);
                {
                this.state = 1663;
                this.match(ApexParser.NEXT_N_DAYS_N);
                this.state = 1664;
                this.match(ApexParser.COLON);
                this.state = 1665;
                this.signedInteger();
                }
                break;
            case ApexParser.N_DAYS_AGO_N:
                this.enterOuterAlt(localContext, 14);
                {
                this.state = 1666;
                this.match(ApexParser.N_DAYS_AGO_N);
                this.state = 1667;
                this.match(ApexParser.COLON);
                this.state = 1668;
                this.signedInteger();
                }
                break;
            case ApexParser.NEXT_N_WEEKS_N:
                this.enterOuterAlt(localContext, 15);
                {
                this.state = 1669;
                this.match(ApexParser.NEXT_N_WEEKS_N);
                this.state = 1670;
                this.match(ApexParser.COLON);
                this.state = 1671;
                this.signedInteger();
                }
                break;
            case ApexParser.LAST_N_WEEKS_N:
                this.enterOuterAlt(localContext, 16);
                {
                this.state = 1672;
                this.match(ApexParser.LAST_N_WEEKS_N);
                this.state = 1673;
                this.match(ApexParser.COLON);
                this.state = 1674;
                this.signedInteger();
                }
                break;
            case ApexParser.N_WEEKS_AGO_N:
                this.enterOuterAlt(localContext, 17);
                {
                this.state = 1675;
                this.match(ApexParser.N_WEEKS_AGO_N);
                this.state = 1676;
                this.match(ApexParser.COLON);
                this.state = 1677;
                this.signedInteger();
                }
                break;
            case ApexParser.NEXT_N_MONTHS_N:
                this.enterOuterAlt(localContext, 18);
                {
                this.state = 1678;
                this.match(ApexParser.NEXT_N_MONTHS_N);
                this.state = 1679;
                this.match(ApexParser.COLON);
                this.state = 1680;
                this.signedInteger();
                }
                break;
            case ApexParser.LAST_N_MONTHS_N:
                this.enterOuterAlt(localContext, 19);
                {
                this.state = 1681;
                this.match(ApexParser.LAST_N_MONTHS_N);
                this.state = 1682;
                this.match(ApexParser.COLON);
                this.state = 1683;
                this.signedInteger();
                }
                break;
            case ApexParser.N_MONTHS_AGO_N:
                this.enterOuterAlt(localContext, 20);
                {
                this.state = 1684;
                this.match(ApexParser.N_MONTHS_AGO_N);
                this.state = 1685;
                this.match(ApexParser.COLON);
                this.state = 1686;
                this.signedInteger();
                }
                break;
            case ApexParser.THIS_QUARTER:
                this.enterOuterAlt(localContext, 21);
                {
                this.state = 1687;
                this.match(ApexParser.THIS_QUARTER);
                }
                break;
            case ApexParser.LAST_QUARTER:
                this.enterOuterAlt(localContext, 22);
                {
                this.state = 1688;
                this.match(ApexParser.LAST_QUARTER);
                }
                break;
            case ApexParser.NEXT_QUARTER:
                this.enterOuterAlt(localContext, 23);
                {
                this.state = 1689;
                this.match(ApexParser.NEXT_QUARTER);
                }
                break;
            case ApexParser.NEXT_N_QUARTERS_N:
                this.enterOuterAlt(localContext, 24);
                {
                this.state = 1690;
                this.match(ApexParser.NEXT_N_QUARTERS_N);
                this.state = 1691;
                this.match(ApexParser.COLON);
                this.state = 1692;
                this.signedInteger();
                }
                break;
            case ApexParser.LAST_N_QUARTERS_N:
                this.enterOuterAlt(localContext, 25);
                {
                this.state = 1693;
                this.match(ApexParser.LAST_N_QUARTERS_N);
                this.state = 1694;
                this.match(ApexParser.COLON);
                this.state = 1695;
                this.signedInteger();
                }
                break;
            case ApexParser.N_QUARTERS_AGO_N:
                this.enterOuterAlt(localContext, 26);
                {
                this.state = 1696;
                this.match(ApexParser.N_QUARTERS_AGO_N);
                this.state = 1697;
                this.match(ApexParser.COLON);
                this.state = 1698;
                this.signedInteger();
                }
                break;
            case ApexParser.THIS_YEAR:
                this.enterOuterAlt(localContext, 27);
                {
                this.state = 1699;
                this.match(ApexParser.THIS_YEAR);
                }
                break;
            case ApexParser.LAST_YEAR:
                this.enterOuterAlt(localContext, 28);
                {
                this.state = 1700;
                this.match(ApexParser.LAST_YEAR);
                }
                break;
            case ApexParser.NEXT_YEAR:
                this.enterOuterAlt(localContext, 29);
                {
                this.state = 1701;
                this.match(ApexParser.NEXT_YEAR);
                }
                break;
            case ApexParser.NEXT_N_YEARS_N:
                this.enterOuterAlt(localContext, 30);
                {
                this.state = 1702;
                this.match(ApexParser.NEXT_N_YEARS_N);
                this.state = 1703;
                this.match(ApexParser.COLON);
                this.state = 1704;
                this.signedInteger();
                }
                break;
            case ApexParser.LAST_N_YEARS_N:
                this.enterOuterAlt(localContext, 31);
                {
                this.state = 1705;
                this.match(ApexParser.LAST_N_YEARS_N);
                this.state = 1706;
                this.match(ApexParser.COLON);
                this.state = 1707;
                this.signedInteger();
                }
                break;
            case ApexParser.N_YEARS_AGO_N:
                this.enterOuterAlt(localContext, 32);
                {
                this.state = 1708;
                this.match(ApexParser.N_YEARS_AGO_N);
                this.state = 1709;
                this.match(ApexParser.COLON);
                this.state = 1710;
                this.signedInteger();
                }
                break;
            case ApexParser.THIS_FISCAL_QUARTER:
                this.enterOuterAlt(localContext, 33);
                {
                this.state = 1711;
                this.match(ApexParser.THIS_FISCAL_QUARTER);
                }
                break;
            case ApexParser.LAST_FISCAL_QUARTER:
                this.enterOuterAlt(localContext, 34);
                {
                this.state = 1712;
                this.match(ApexParser.LAST_FISCAL_QUARTER);
                }
                break;
            case ApexParser.NEXT_FISCAL_QUARTER:
                this.enterOuterAlt(localContext, 35);
                {
                this.state = 1713;
                this.match(ApexParser.NEXT_FISCAL_QUARTER);
                }
                break;
            case ApexParser.NEXT_N_FISCAL_QUARTERS_N:
                this.enterOuterAlt(localContext, 36);
                {
                this.state = 1714;
                this.match(ApexParser.NEXT_N_FISCAL_QUARTERS_N);
                this.state = 1715;
                this.match(ApexParser.COLON);
                this.state = 1716;
                this.signedInteger();
                }
                break;
            case ApexParser.LAST_N_FISCAL_QUARTERS_N:
                this.enterOuterAlt(localContext, 37);
                {
                this.state = 1717;
                this.match(ApexParser.LAST_N_FISCAL_QUARTERS_N);
                this.state = 1718;
                this.match(ApexParser.COLON);
                this.state = 1719;
                this.signedInteger();
                }
                break;
            case ApexParser.N_FISCAL_QUARTERS_AGO_N:
                this.enterOuterAlt(localContext, 38);
                {
                this.state = 1720;
                this.match(ApexParser.N_FISCAL_QUARTERS_AGO_N);
                this.state = 1721;
                this.match(ApexParser.COLON);
                this.state = 1722;
                this.signedInteger();
                }
                break;
            case ApexParser.THIS_FISCAL_YEAR:
                this.enterOuterAlt(localContext, 39);
                {
                this.state = 1723;
                this.match(ApexParser.THIS_FISCAL_YEAR);
                }
                break;
            case ApexParser.LAST_FISCAL_YEAR:
                this.enterOuterAlt(localContext, 40);
                {
                this.state = 1724;
                this.match(ApexParser.LAST_FISCAL_YEAR);
                }
                break;
            case ApexParser.NEXT_FISCAL_YEAR:
                this.enterOuterAlt(localContext, 41);
                {
                this.state = 1725;
                this.match(ApexParser.NEXT_FISCAL_YEAR);
                }
                break;
            case ApexParser.NEXT_N_FISCAL_YEARS_N:
                this.enterOuterAlt(localContext, 42);
                {
                this.state = 1726;
                this.match(ApexParser.NEXT_N_FISCAL_YEARS_N);
                this.state = 1727;
                this.match(ApexParser.COLON);
                this.state = 1728;
                this.signedInteger();
                }
                break;
            case ApexParser.LAST_N_FISCAL_YEARS_N:
                this.enterOuterAlt(localContext, 43);
                {
                this.state = 1729;
                this.match(ApexParser.LAST_N_FISCAL_YEARS_N);
                this.state = 1730;
                this.match(ApexParser.COLON);
                this.state = 1731;
                this.signedInteger();
                }
                break;
            case ApexParser.N_FISCAL_YEARS_AGO_N:
                this.enterOuterAlt(localContext, 44);
                {
                this.state = 1732;
                this.match(ApexParser.N_FISCAL_YEARS_AGO_N);
                this.state = 1733;
                this.match(ApexParser.COLON);
                this.state = 1734;
                this.signedInteger();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public signedInteger(): SignedIntegerContext {
        let localContext = new SignedIntegerContext(this.context, this.state);
        this.enterRule(localContext, 258, ApexParser.RULE_signedInteger);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1738;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 225 || _la === 226) {
                {
                this.state = 1737;
                _la = this.tokenStream.LA(1);
                if(!(_la === 225 || _la === 226)) {
                this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                }
            }

            this.state = 1740;
            this.match(ApexParser.IntegerLiteral);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public soqlId(): SoqlIdContext {
        let localContext = new SoqlIdContext(this.context, this.state);
        this.enterRule(localContext, 260, ApexParser.RULE_soqlId);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1742;
            this.id();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public soslLiteral(): SoslLiteralContext {
        let localContext = new SoslLiteralContext(this.context, this.state);
        this.enterRule(localContext, 262, ApexParser.RULE_soslLiteral);
        try {
            this.state = 1754;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.FindLiteral:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1744;
                this.match(ApexParser.FindLiteral);
                this.state = 1745;
                this.soslClauses();
                this.state = 1746;
                this.match(ApexParser.RBRACK);
                }
                break;
            case ApexParser.LBRACK:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1748;
                this.match(ApexParser.LBRACK);
                this.state = 1749;
                this.match(ApexParser.FIND);
                this.state = 1750;
                this.boundExpression();
                this.state = 1751;
                this.soslClauses();
                this.state = 1752;
                this.match(ApexParser.RBRACK);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public soslLiteralAlt(): SoslLiteralAltContext {
        let localContext = new SoslLiteralAltContext(this.context, this.state);
        this.enterRule(localContext, 264, ApexParser.RULE_soslLiteralAlt);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1756;
            this.match(ApexParser.FindLiteralAlt);
            this.state = 1757;
            this.soslClauses();
            this.state = 1758;
            this.match(ApexParser.RBRACK);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public soslClauses(): SoslClausesContext {
        let localContext = new SoslClausesContext(this.context, this.state);
        this.enterRule(localContext, 266, ApexParser.RULE_soslClauses);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1762;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 81) {
                {
                this.state = 1760;
                this.match(ApexParser.IN);
                this.state = 1761;
                this.searchGroup();
                }
            }

            this.state = 1766;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 188) {
                {
                this.state = 1764;
                this.match(ApexParser.RETURNING);
                this.state = 1765;
                this.fieldSpecList();
                }
            }

            this.state = 1772;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 168, this.context) ) {
            case 1:
                {
                this.state = 1768;
                this.match(ApexParser.WITH);
                this.state = 1769;
                this.match(ApexParser.DIVISION);
                this.state = 1770;
                this.match(ApexParser.ASSIGN);
                this.state = 1771;
                this.match(ApexParser.StringLiteral);
                }
                break;
            }
            this.state = 1778;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 169, this.context) ) {
            case 1:
                {
                this.state = 1774;
                this.match(ApexParser.WITH);
                this.state = 1775;
                this.match(ApexParser.DATA);
                this.state = 1776;
                this.match(ApexParser.CATEGORY);
                this.state = 1777;
                this.filteringExpression();
                }
                break;
            }
            this.state = 1789;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 171, this.context) ) {
            case 1:
                {
                this.state = 1780;
                this.match(ApexParser.WITH);
                this.state = 1781;
                this.match(ApexParser.SNIPPET);
                this.state = 1787;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 198) {
                    {
                    this.state = 1782;
                    this.match(ApexParser.LPAREN);
                    this.state = 1783;
                    this.match(ApexParser.TARGET_LENGTH);
                    this.state = 1784;
                    this.match(ApexParser.ASSIGN);
                    this.state = 1785;
                    this.match(ApexParser.IntegerLiteral);
                    this.state = 1786;
                    this.match(ApexParser.RPAREN);
                    }
                }

                }
                break;
            }
            this.state = 1798;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 172, this.context) ) {
            case 1:
                {
                this.state = 1791;
                this.match(ApexParser.WITH);
                this.state = 1792;
                this.match(ApexParser.NETWORK);
                this.state = 1793;
                this.match(ApexParser.IN);
                this.state = 1794;
                this.match(ApexParser.LPAREN);
                this.state = 1795;
                this.networkList();
                this.state = 1796;
                this.match(ApexParser.RPAREN);
                }
                break;
            }
            this.state = 1804;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 173, this.context) ) {
            case 1:
                {
                this.state = 1800;
                this.match(ApexParser.WITH);
                this.state = 1801;
                this.match(ApexParser.NETWORK);
                this.state = 1802;
                this.match(ApexParser.ASSIGN);
                this.state = 1803;
                this.match(ApexParser.StringLiteral);
                }
                break;
            }
            this.state = 1810;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 174, this.context) ) {
            case 1:
                {
                this.state = 1806;
                this.match(ApexParser.WITH);
                this.state = 1807;
                this.match(ApexParser.PRICEBOOKID);
                this.state = 1808;
                this.match(ApexParser.ASSIGN);
                this.state = 1809;
                this.match(ApexParser.StringLiteral);
                }
                break;
            }
            this.state = 1816;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 53) {
                {
                this.state = 1812;
                this.match(ApexParser.WITH);
                this.state = 1813;
                this.match(ApexParser.METADATA);
                this.state = 1814;
                this.match(ApexParser.ASSIGN);
                this.state = 1815;
                this.match(ApexParser.StringLiteral);
                }
            }

            this.state = 1819;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 68) {
                {
                this.state = 1818;
                this.limitClause();
                }
            }

            this.state = 1823;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 46) {
                {
                this.state = 1821;
                this.match(ApexParser.UPDATE);
                this.state = 1822;
                this.updateList();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public searchGroup(): SearchGroupContext {
        let localContext = new SearchGroupContext(this.context, this.state);
        this.enterRule(localContext, 268, ApexParser.RULE_searchGroup);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1825;
            _la = this.tokenStream.LA(1);
            if(!(_la === 90 || ((((_la - 177)) & ~0x1F) === 0 && ((1 << (_la - 177)) & 15) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 1826;
            this.match(ApexParser.FIELDS);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public fieldSpecList(): FieldSpecListContext {
        let localContext = new FieldSpecListContext(this.context, this.state);
        this.enterRule(localContext, 270, ApexParser.RULE_fieldSpecList);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1828;
            this.fieldSpec();
            this.state = 1833;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 178, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1829;
                    this.match(ApexParser.COMMA);
                    this.state = 1830;
                    this.fieldSpecList();
                    }
                    }
                }
                this.state = 1835;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 178, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public fieldSpec(): FieldSpecContext {
        let localContext = new FieldSpecContext(this.context, this.state);
        this.enterRule(localContext, 272, ApexParser.RULE_fieldSpec);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1836;
            this.soslId();
            this.state = 1862;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 198) {
                {
                this.state = 1837;
                this.match(ApexParser.LPAREN);
                this.state = 1838;
                this.fieldList();
                this.state = 1841;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 65) {
                    {
                    this.state = 1839;
                    this.match(ApexParser.WHERE);
                    this.state = 1840;
                    this.logicalExpression();
                    }
                }

                this.state = 1847;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 63) {
                    {
                    this.state = 1843;
                    this.match(ApexParser.USING);
                    this.state = 1844;
                    this.match(ApexParser.LISTVIEW);
                    this.state = 1845;
                    this.match(ApexParser.ASSIGN);
                    this.state = 1846;
                    this.soslId();
                    }
                }

                this.state = 1852;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 66) {
                    {
                    this.state = 1849;
                    this.match(ApexParser.ORDER);
                    this.state = 1850;
                    this.match(ApexParser.BY);
                    this.state = 1851;
                    this.fieldOrderList();
                    }
                }

                this.state = 1855;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 68) {
                    {
                    this.state = 1854;
                    this.limitClause();
                    }
                }

                this.state = 1858;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 96) {
                    {
                    this.state = 1857;
                    this.offsetClause();
                    }
                }

                this.state = 1860;
                this.match(ApexParser.RPAREN);
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public fieldList(): FieldListContext {
        let localContext = new FieldListContext(this.context, this.state);
        this.enterRule(localContext, 274, ApexParser.RULE_fieldList);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1864;
            this.soslId();
            this.state = 1869;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 185, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1865;
                    this.match(ApexParser.COMMA);
                    this.state = 1866;
                    this.fieldList();
                    }
                    }
                }
                this.state = 1871;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 185, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public updateList(): UpdateListContext {
        let localContext = new UpdateListContext(this.context, this.state);
        this.enterRule(localContext, 276, ApexParser.RULE_updateList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1872;
            this.updateType();
            this.state = 1875;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 205) {
                {
                this.state = 1873;
                this.match(ApexParser.COMMA);
                this.state = 1874;
                this.updateList();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public updateType(): UpdateTypeContext {
        let localContext = new UpdateTypeContext(this.context, this.state);
        this.enterRule(localContext, 278, ApexParser.RULE_updateType);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1877;
            _la = this.tokenStream.LA(1);
            if(!(_la === 109 || _la === 110)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public networkList(): NetworkListContext {
        let localContext = new NetworkListContext(this.context, this.state);
        this.enterRule(localContext, 280, ApexParser.RULE_networkList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1879;
            this.match(ApexParser.StringLiteral);
            this.state = 1882;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 205) {
                {
                this.state = 1880;
                this.match(ApexParser.COMMA);
                this.state = 1881;
                this.networkList();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public soslId(): SoslIdContext {
        let localContext = new SoslIdContext(this.context, this.state);
        this.enterRule(localContext, 282, ApexParser.RULE_soslId);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1884;
            this.id();
            this.state = 1889;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 188, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1885;
                    this.match(ApexParser.DOT);
                    this.state = 1886;
                    this.soslId();
                    }
                    }
                }
                this.state = 1891;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 188, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public id(): IdContext {
        let localContext = new IdContext(this.context, this.state);
        this.enterRule(localContext, 284, ApexParser.RULE_id);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1892;
            _la = this.tokenStream.LA(1);
            if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 5308428) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4288283411) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 268429311) !== 0) || _la === 244)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public anyId(): AnyIdContext {
        let localContext = new AnyIdContext(this.context, this.state);
        this.enterRule(localContext, 286, ApexParser.RULE_anyId);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1894;
            _la = this.tokenStream.LA(1);
            if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 4294967294) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & 4294836221) !== 0) || ((((_la - 64)) & ~0x1F) === 0 && ((1 << (_la - 64)) & 4294967295) !== 0) || ((((_la - 96)) & ~0x1F) === 0 && ((1 << (_la - 96)) & 4294967295) !== 0) || ((((_la - 128)) & ~0x1F) === 0 && ((1 << (_la - 128)) & 4294967295) !== 0) || ((((_la - 160)) & ~0x1F) === 0 && ((1 << (_la - 160)) & 1073717247) !== 0) || _la === 244)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }

    public override sempred(localContext: antlr.ParserRuleContext | null, ruleIndex: number, predIndex: number): boolean {
        switch (ruleIndex) {
        case 73:
            return this.expression_sempred(localContext as ExpressionContext, predIndex);
        }
        return true;
    }
    private expression_sempred(localContext: ExpressionContext | null, predIndex: number): boolean {
        switch (predIndex) {
        case 0:
            return this.precpred(this.context, 14);
        case 1:
            return this.precpred(this.context, 13);
        case 2:
            return this.precpred(this.context, 12);
        case 3:
            return this.precpred(this.context, 11);
        case 4:
            return this.precpred(this.context, 9);
        case 5:
            return this.precpred(this.context, 8);
        case 6:
            return this.precpred(this.context, 7);
        case 7:
            return this.precpred(this.context, 6);
        case 8:
            return this.precpred(this.context, 5);
        case 9:
            return this.precpred(this.context, 4);
        case 10:
            return this.precpred(this.context, 3);
        case 11:
            return this.precpred(this.context, 2);
        case 12:
            return this.precpred(this.context, 1);
        case 13:
            return this.precpred(this.context, 23);
        case 14:
            return this.precpred(this.context, 22);
        case 15:
            return this.precpred(this.context, 17);
        case 16:
            return this.precpred(this.context, 10);
        }
        return true;
    }

    public static readonly _serializedATN: number[] = [
        4,1,248,1897,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,
        7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,
        13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,19,2,
        20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,2,25,7,25,2,26,7,
        26,2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,31,7,31,2,32,7,32,2,
        33,7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,7,38,2,39,7,
        39,2,40,7,40,2,41,7,41,2,42,7,42,2,43,7,43,2,44,7,44,2,45,7,45,2,
        46,7,46,2,47,7,47,2,48,7,48,2,49,7,49,2,50,7,50,2,51,7,51,2,52,7,
        52,2,53,7,53,2,54,7,54,2,55,7,55,2,56,7,56,2,57,7,57,2,58,7,58,2,
        59,7,59,2,60,7,60,2,61,7,61,2,62,7,62,2,63,7,63,2,64,7,64,2,65,7,
        65,2,66,7,66,2,67,7,67,2,68,7,68,2,69,7,69,2,70,7,70,2,71,7,71,2,
        72,7,72,2,73,7,73,2,74,7,74,2,75,7,75,2,76,7,76,2,77,7,77,2,78,7,
        78,2,79,7,79,2,80,7,80,2,81,7,81,2,82,7,82,2,83,7,83,2,84,7,84,2,
        85,7,85,2,86,7,86,2,87,7,87,2,88,7,88,2,89,7,89,2,90,7,90,2,91,7,
        91,2,92,7,92,2,93,7,93,2,94,7,94,2,95,7,95,2,96,7,96,2,97,7,97,2,
        98,7,98,2,99,7,99,2,100,7,100,2,101,7,101,2,102,7,102,2,103,7,103,
        2,104,7,104,2,105,7,105,2,106,7,106,2,107,7,107,2,108,7,108,2,109,
        7,109,2,110,7,110,2,111,7,111,2,112,7,112,2,113,7,113,2,114,7,114,
        2,115,7,115,2,116,7,116,2,117,7,117,2,118,7,118,2,119,7,119,2,120,
        7,120,2,121,7,121,2,122,7,122,2,123,7,123,2,124,7,124,2,125,7,125,
        2,126,7,126,2,127,7,127,2,128,7,128,2,129,7,129,2,130,7,130,2,131,
        7,131,2,132,7,132,2,133,7,133,2,134,7,134,2,135,7,135,2,136,7,136,
        2,137,7,137,2,138,7,138,2,139,7,139,2,140,7,140,2,141,7,141,2,142,
        7,142,2,143,7,143,1,0,5,0,290,8,0,10,0,12,0,293,9,0,1,0,1,0,1,1,
        1,1,1,1,1,1,3,1,301,8,1,1,2,5,2,304,8,2,10,2,12,2,307,9,2,1,2,1,
        2,1,2,1,2,3,2,313,8,2,1,2,1,2,3,2,317,8,2,1,2,1,2,1,3,5,3,322,8,
        3,10,3,12,3,325,9,3,1,3,1,3,1,3,1,3,3,3,331,8,3,1,3,1,3,1,4,1,4,
        1,4,5,4,338,8,4,10,4,12,4,341,9,4,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,
        5,5,5,351,8,5,10,5,12,5,354,9,5,1,5,1,5,1,5,1,5,1,6,1,6,1,6,1,7,
        5,7,364,8,7,10,7,12,7,367,9,7,1,7,1,7,1,7,1,7,3,7,373,8,7,1,7,1,
        7,1,8,1,8,1,8,5,8,380,8,8,10,8,12,8,383,9,8,1,9,1,9,5,9,387,8,9,
        10,9,12,9,390,9,9,1,9,1,9,1,10,1,10,5,10,396,8,10,10,10,12,10,399,
        9,10,1,10,1,10,1,11,1,11,3,11,405,8,11,1,11,1,11,5,11,409,8,11,10,
        11,12,11,412,9,11,1,11,3,11,415,8,11,1,12,1,12,1,12,1,12,1,12,1,
        12,1,12,1,12,1,12,1,12,1,12,1,12,1,12,1,12,1,12,1,12,1,12,1,12,1,
        12,3,12,436,8,12,1,13,1,13,1,13,1,13,1,13,1,13,1,13,3,13,445,8,13,
        1,14,1,14,3,14,449,8,14,1,14,1,14,1,14,1,14,3,14,455,8,14,1,15,1,
        15,1,15,1,15,1,16,1,16,1,16,1,16,1,17,1,17,1,17,1,17,5,17,469,8,
        17,10,17,12,17,472,9,17,1,17,1,17,1,18,5,18,477,8,18,10,18,12,18,
        480,9,18,1,18,1,18,3,18,484,8,18,1,18,1,18,1,18,1,18,1,19,1,19,1,
        19,5,19,493,8,19,10,19,12,19,496,9,19,1,20,1,20,1,20,3,20,501,8,
        20,1,21,1,21,1,21,1,21,5,21,507,8,21,10,21,12,21,510,9,21,1,21,3,
        21,513,8,21,3,21,515,8,21,1,21,1,21,1,22,1,22,1,22,5,22,522,8,22,
        10,22,12,22,525,9,22,1,22,1,22,1,23,1,23,5,23,531,8,23,10,23,12,
        23,534,9,23,1,24,1,24,3,24,538,8,24,1,24,1,24,3,24,542,8,24,1,24,
        1,24,3,24,546,8,24,1,24,1,24,3,24,550,8,24,3,24,552,8,24,1,25,1,
        25,1,25,1,25,1,26,1,26,3,26,560,8,26,1,26,1,26,1,27,1,27,1,27,5,
        27,567,8,27,10,27,12,27,570,9,27,1,28,5,28,573,8,28,10,28,12,28,
        576,9,28,1,28,1,28,1,28,1,29,1,29,1,29,5,29,584,8,29,10,29,12,29,
        587,9,29,1,30,1,30,1,31,1,31,1,31,1,31,1,31,3,31,596,8,31,1,31,3,
        31,599,8,31,1,32,1,32,3,32,603,8,32,1,32,5,32,606,8,32,10,32,12,
        32,609,9,32,1,33,1,33,1,33,1,33,1,34,1,34,1,34,3,34,618,8,34,1,35,
        1,35,1,35,1,35,5,35,624,8,35,10,35,12,35,627,9,35,3,35,629,8,35,
        1,35,3,35,632,8,35,1,35,1,35,1,36,1,36,5,36,638,8,36,10,36,12,36,
        641,9,36,1,36,1,36,1,37,1,37,1,37,1,38,5,38,649,8,38,10,38,12,38,
        652,9,38,1,38,1,38,1,38,1,39,1,39,1,39,1,39,1,39,1,39,1,39,1,39,
        1,39,1,39,1,39,1,39,1,39,1,39,1,39,1,39,1,39,1,39,1,39,1,39,3,39,
        677,8,39,1,40,1,40,1,40,1,40,1,40,3,40,684,8,40,1,41,1,41,1,41,1,
        41,1,41,4,41,691,8,41,11,41,12,41,692,1,41,1,41,1,42,1,42,1,42,1,
        42,1,43,1,43,1,43,1,43,5,43,705,8,43,10,43,12,43,708,9,43,1,43,1,
        43,1,43,3,43,713,8,43,1,44,3,44,716,8,44,1,44,1,44,1,44,1,44,1,44,
        1,44,1,44,1,44,1,44,3,44,727,8,44,1,45,1,45,1,45,1,45,1,45,1,45,
        3,45,735,8,45,1,46,1,46,1,46,1,46,3,46,741,8,46,1,47,1,47,1,47,1,
        47,1,47,1,47,1,48,1,48,1,48,4,48,752,8,48,11,48,12,48,753,1,48,3,
        48,757,8,48,1,48,3,48,760,8,48,1,49,1,49,3,49,764,8,49,1,49,1,49,
        1,50,1,50,1,50,1,50,1,51,1,51,1,51,1,52,1,52,1,52,1,53,1,53,1,53,
        1,54,1,54,3,54,783,8,54,1,54,1,54,1,54,1,55,1,55,3,55,790,8,55,1,
        55,1,55,1,55,1,56,1,56,3,56,797,8,56,1,56,1,56,1,56,1,57,1,57,3,
        57,804,8,57,1,57,1,57,1,57,1,58,1,58,3,58,811,8,58,1,58,1,58,3,58,
        815,8,58,1,58,1,58,1,59,1,59,3,59,821,8,59,1,59,1,59,1,59,1,59,1,
        60,1,60,1,60,3,60,830,8,60,1,60,1,60,1,60,1,61,1,61,1,61,1,62,5,
        62,839,8,62,10,62,12,62,842,9,62,1,62,1,62,3,62,846,8,62,1,63,1,
        63,1,63,3,63,851,8,63,1,64,1,64,1,64,3,64,856,8,64,1,65,1,65,1,65,
        5,65,861,8,65,10,65,12,65,864,9,65,1,65,1,65,1,65,1,65,1,65,1,66,
        1,66,1,66,1,67,1,67,3,67,876,8,67,1,67,1,67,3,67,880,8,67,1,67,1,
        67,3,67,884,8,67,3,67,886,8,67,1,68,1,68,3,68,890,8,68,1,69,1,69,
        1,69,1,69,1,69,1,70,1,70,1,71,1,71,1,71,1,71,1,72,1,72,1,72,5,72,
        906,8,72,10,72,12,72,909,9,72,1,73,1,73,1,73,1,73,1,73,1,73,1,73,
        1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,3,73,929,
        8,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,
        1,73,1,73,3,73,945,8,73,1,73,1,73,1,73,1,73,3,73,951,8,73,1,73,1,
        73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,
        73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,1,
        73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,3,73,988,8,73,1,73,1,73,1,
        73,1,73,1,73,1,73,1,73,1,73,1,73,1,73,5,73,1000,8,73,10,73,12,73,
        1003,9,73,1,74,1,74,1,74,1,74,1,74,1,74,1,74,1,74,1,74,1,74,1,74,
        1,74,1,74,3,74,1018,8,74,1,75,1,75,1,75,3,75,1023,8,75,1,75,1,75,
        1,75,1,75,1,75,3,75,1030,8,75,1,75,1,75,1,75,1,75,3,75,1036,8,75,
        1,75,3,75,1039,8,75,1,76,1,76,1,76,3,76,1044,8,76,1,76,1,76,1,77,
        1,77,1,77,1,77,1,77,1,77,3,77,1054,8,77,1,78,1,78,1,78,5,78,1059,
        8,78,10,78,12,78,1062,9,78,1,79,1,79,1,79,1,79,1,79,3,79,1069,8,
        79,1,80,1,80,1,80,1,81,1,81,1,82,1,82,1,82,1,82,1,82,1,82,1,82,3,
        82,1083,8,82,3,82,1085,8,82,1,83,1,83,1,83,1,83,5,83,1091,8,83,10,
        83,12,83,1094,9,83,1,83,1,83,1,84,1,84,1,84,1,84,1,85,1,85,1,85,
        1,85,5,85,1106,8,85,10,85,12,85,1109,9,85,1,85,1,85,1,86,1,86,3,
        86,1115,8,86,1,86,1,86,1,87,1,87,1,87,1,87,1,88,1,88,1,88,1,88,1,
        88,3,88,1128,8,88,1,88,3,88,1131,8,88,1,88,3,88,1134,8,88,1,88,3,
        88,1137,8,88,1,88,3,88,1140,8,88,1,88,3,88,1143,8,88,1,88,3,88,1146,
        8,88,1,88,3,88,1149,8,88,1,88,1,88,1,88,3,88,1154,8,88,1,89,1,89,
        1,89,1,89,1,89,3,89,1161,8,89,1,89,3,89,1164,8,89,1,89,3,89,1167,
        8,89,1,89,1,89,1,89,3,89,1172,8,89,1,90,1,90,1,90,5,90,1177,8,90,
        10,90,12,90,1180,9,90,1,91,1,91,3,91,1184,8,91,1,91,1,91,3,91,1188,
        8,91,1,91,1,91,1,91,1,91,3,91,1194,8,91,1,91,3,91,1197,8,91,1,92,
        1,92,1,92,5,92,1202,8,92,10,92,12,92,1205,9,92,1,93,1,93,3,93,1209,
        8,93,1,93,1,93,1,93,3,93,1214,8,93,5,93,1216,8,93,10,93,12,93,1219,
        9,93,1,94,1,94,1,94,5,94,1224,8,94,10,94,12,94,1227,9,94,1,95,1,
        95,3,95,1231,8,95,1,95,1,95,3,95,1235,8,95,1,95,3,95,1238,8,95,1,
        96,1,96,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,
        97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,
        97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,
        97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,
        97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,
        97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,
        97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,
        97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,
        97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,97,1,
        97,1,97,1,97,1,97,1,97,1,97,1,97,3,97,1364,8,97,1,98,1,98,1,98,1,
        98,1,98,1,98,3,98,1372,8,98,1,99,1,99,1,99,1,99,1,99,1,99,1,99,1,
        99,1,99,3,99,1383,8,99,1,100,1,100,3,100,1387,8,100,1,101,1,101,
        1,101,4,101,1392,8,101,11,101,12,101,1393,1,101,3,101,1397,8,101,
        1,101,1,101,1,102,1,102,1,102,1,102,1,102,1,103,1,103,1,103,1,104,
        1,104,1,104,5,104,1412,8,104,10,104,12,104,1415,9,104,1,105,1,105,
        1,105,1,105,1,106,1,106,1,106,1,107,1,107,1,107,5,107,1427,8,107,
        10,107,12,107,1430,9,107,1,107,1,107,1,107,5,107,1435,8,107,10,107,
        12,107,1438,9,107,1,107,1,107,3,107,1442,8,107,1,108,1,108,1,108,
        1,108,1,108,3,108,1449,8,108,1,109,1,109,1,109,1,109,1,109,1,109,
        1,109,1,109,3,109,1459,8,109,1,110,1,110,1,110,1,110,1,110,1,110,
        1,110,1,110,1,110,1,110,1,110,1,110,1,110,1,110,1,110,3,110,1476,
        8,110,1,111,1,111,1,111,1,111,1,111,1,111,1,111,1,111,1,111,1,111,
        3,111,1488,8,111,3,111,1490,8,111,1,111,1,111,1,111,1,111,1,111,
        1,111,3,111,1498,8,111,1,112,1,112,1,112,1,112,5,112,1504,8,112,
        10,112,12,112,1507,9,112,1,112,1,112,1,113,3,113,1512,8,113,1,113,
        1,113,1,114,1,114,1,114,1,114,1,114,1,114,1,114,1,114,1,114,1,114,
        1,114,1,114,3,114,1528,8,114,1,115,1,115,1,115,5,115,1533,8,115,
        10,115,12,115,1536,9,115,1,116,1,116,1,116,1,116,1,117,1,117,1,117,
        1,117,1,117,5,117,1547,8,117,10,117,12,117,1550,9,117,1,117,1,117,
        3,117,1554,8,117,1,118,1,118,1,119,1,119,1,119,1,119,1,119,3,119,
        1563,8,119,1,119,1,119,1,119,1,119,1,119,1,119,1,119,5,119,1572,
        8,119,10,119,12,119,1575,9,119,1,119,1,119,1,119,1,119,1,119,1,119,
        1,119,1,119,1,119,5,119,1586,8,119,10,119,12,119,1589,9,119,1,119,
        1,119,3,119,1593,8,119,1,120,1,120,1,120,1,120,1,121,1,121,1,121,
        5,121,1602,8,121,10,121,12,121,1605,9,121,1,122,1,122,3,122,1609,
        8,122,1,122,1,122,3,122,1613,8,122,1,122,1,122,3,122,1617,8,122,
        1,122,1,122,3,122,1621,8,122,3,122,1623,8,122,1,123,1,123,1,123,
        1,123,3,123,1629,8,123,1,124,1,124,1,124,1,124,3,124,1635,8,124,
        1,125,1,125,1,125,1,126,1,126,5,126,1642,8,126,10,126,12,126,1645,
        9,126,1,127,1,127,1,127,1,128,1,128,1,128,1,128,1,128,1,128,1,128,
        1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,
        1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,
        1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,
        1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,
        1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,
        1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,
        1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,1,128,
        1,128,1,128,3,128,1736,8,128,1,129,3,129,1739,8,129,1,129,1,129,
        1,130,1,130,1,131,1,131,1,131,1,131,1,131,1,131,1,131,1,131,1,131,
        1,131,3,131,1755,8,131,1,132,1,132,1,132,1,132,1,133,1,133,3,133,
        1763,8,133,1,133,1,133,3,133,1767,8,133,1,133,1,133,1,133,1,133,
        3,133,1773,8,133,1,133,1,133,1,133,1,133,3,133,1779,8,133,1,133,
        1,133,1,133,1,133,1,133,1,133,1,133,3,133,1788,8,133,3,133,1790,
        8,133,1,133,1,133,1,133,1,133,1,133,1,133,1,133,3,133,1799,8,133,
        1,133,1,133,1,133,1,133,3,133,1805,8,133,1,133,1,133,1,133,1,133,
        3,133,1811,8,133,1,133,1,133,1,133,1,133,3,133,1817,8,133,1,133,
        3,133,1820,8,133,1,133,1,133,3,133,1824,8,133,1,134,1,134,1,134,
        1,135,1,135,1,135,5,135,1832,8,135,10,135,12,135,1835,9,135,1,136,
        1,136,1,136,1,136,1,136,3,136,1842,8,136,1,136,1,136,1,136,1,136,
        3,136,1848,8,136,1,136,1,136,1,136,3,136,1853,8,136,1,136,3,136,
        1856,8,136,1,136,3,136,1859,8,136,1,136,1,136,3,136,1863,8,136,1,
        137,1,137,1,137,5,137,1868,8,137,10,137,12,137,1871,9,137,1,138,
        1,138,1,138,3,138,1876,8,138,1,139,1,139,1,140,1,140,1,140,3,140,
        1883,8,140,1,141,1,141,1,141,5,141,1888,8,141,10,141,12,141,1891,
        9,141,1,142,1,142,1,143,1,143,1,143,0,1,146,144,0,2,4,6,8,10,12,
        14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,
        58,60,62,64,66,68,70,72,74,76,78,80,82,84,86,88,90,92,94,96,98,100,
        102,104,106,108,110,112,114,116,118,120,122,124,126,128,130,132,
        134,136,138,140,142,144,146,148,150,152,154,156,158,160,162,164,
        166,168,170,172,174,176,178,180,182,184,186,188,190,192,194,196,
        198,200,202,204,206,208,210,212,214,216,218,220,222,224,226,228,
        230,232,234,236,238,240,242,244,246,248,250,252,254,256,258,260,
        262,264,266,268,270,272,274,276,278,280,282,284,286,0,23,1,0,2,3,
        3,0,8,8,21,21,45,46,2,0,26,26,192,196,1,0,57,58,1,0,223,226,1,0,
        210,211,1,0,227,228,1,0,225,226,1,0,208,209,1,0,216,220,2,0,207,
        207,233,242,2,0,206,206,212,212,1,0,223,224,2,0,90,90,111,112,2,
        0,192,192,194,194,1,0,99,102,1,0,84,85,1,0,87,88,3,0,46,46,92,92,
        106,106,2,0,90,90,177,180,1,0,109,110,12,0,2,3,16,16,20,20,22,22,
        34,35,38,38,42,43,51,51,53,54,57,172,175,189,244,244,5,0,1,32,34,
        48,50,172,175,189,244,244,2113,0,291,1,0,0,0,2,300,1,0,0,0,4,305,
        1,0,0,0,6,323,1,0,0,0,8,334,1,0,0,0,10,342,1,0,0,0,12,359,1,0,0,
        0,14,365,1,0,0,0,16,376,1,0,0,0,18,384,1,0,0,0,20,393,1,0,0,0,22,
        414,1,0,0,0,24,435,1,0,0,0,26,444,1,0,0,0,28,448,1,0,0,0,30,456,
        1,0,0,0,32,460,1,0,0,0,34,464,1,0,0,0,36,478,1,0,0,0,38,489,1,0,
        0,0,40,497,1,0,0,0,42,502,1,0,0,0,44,518,1,0,0,0,46,532,1,0,0,0,
        48,551,1,0,0,0,50,553,1,0,0,0,52,557,1,0,0,0,54,563,1,0,0,0,56,574,
        1,0,0,0,58,580,1,0,0,0,60,588,1,0,0,0,62,590,1,0,0,0,64,600,1,0,
        0,0,66,610,1,0,0,0,68,617,1,0,0,0,70,619,1,0,0,0,72,635,1,0,0,0,
        74,644,1,0,0,0,76,650,1,0,0,0,78,676,1,0,0,0,80,678,1,0,0,0,82,685,
        1,0,0,0,84,696,1,0,0,0,86,712,1,0,0,0,88,726,1,0,0,0,90,728,1,0,
        0,0,92,736,1,0,0,0,94,742,1,0,0,0,96,748,1,0,0,0,98,761,1,0,0,0,
        100,767,1,0,0,0,102,771,1,0,0,0,104,774,1,0,0,0,106,777,1,0,0,0,
        108,780,1,0,0,0,110,787,1,0,0,0,112,794,1,0,0,0,114,801,1,0,0,0,
        116,808,1,0,0,0,118,818,1,0,0,0,120,826,1,0,0,0,122,834,1,0,0,0,
        124,840,1,0,0,0,126,847,1,0,0,0,128,852,1,0,0,0,130,857,1,0,0,0,
        132,870,1,0,0,0,134,885,1,0,0,0,136,889,1,0,0,0,138,891,1,0,0,0,
        140,896,1,0,0,0,142,898,1,0,0,0,144,902,1,0,0,0,146,928,1,0,0,0,
        148,1017,1,0,0,0,150,1038,1,0,0,0,152,1040,1,0,0,0,154,1047,1,0,
        0,0,156,1055,1,0,0,0,158,1063,1,0,0,0,160,1070,1,0,0,0,162,1073,
        1,0,0,0,164,1084,1,0,0,0,166,1086,1,0,0,0,168,1097,1,0,0,0,170,1101,
        1,0,0,0,172,1112,1,0,0,0,174,1118,1,0,0,0,176,1122,1,0,0,0,178,1155,
        1,0,0,0,180,1173,1,0,0,0,182,1196,1,0,0,0,184,1198,1,0,0,0,186,1206,
        1,0,0,0,188,1220,1,0,0,0,190,1237,1,0,0,0,192,1239,1,0,0,0,194,1363,
        1,0,0,0,196,1371,1,0,0,0,198,1382,1,0,0,0,200,1386,1,0,0,0,202,1388,
        1,0,0,0,204,1400,1,0,0,0,206,1405,1,0,0,0,208,1408,1,0,0,0,210,1416,
        1,0,0,0,212,1420,1,0,0,0,214,1441,1,0,0,0,216,1448,1,0,0,0,218,1458,
        1,0,0,0,220,1475,1,0,0,0,222,1497,1,0,0,0,224,1499,1,0,0,0,226,1511,
        1,0,0,0,228,1527,1,0,0,0,230,1529,1,0,0,0,232,1537,1,0,0,0,234,1553,
        1,0,0,0,236,1555,1,0,0,0,238,1592,1,0,0,0,240,1594,1,0,0,0,242,1598,
        1,0,0,0,244,1622,1,0,0,0,246,1628,1,0,0,0,248,1634,1,0,0,0,250,1636,
        1,0,0,0,252,1643,1,0,0,0,254,1646,1,0,0,0,256,1735,1,0,0,0,258,1738,
        1,0,0,0,260,1742,1,0,0,0,262,1754,1,0,0,0,264,1756,1,0,0,0,266,1762,
        1,0,0,0,268,1825,1,0,0,0,270,1828,1,0,0,0,272,1836,1,0,0,0,274,1864,
        1,0,0,0,276,1872,1,0,0,0,278,1877,1,0,0,0,280,1879,1,0,0,0,282,1884,
        1,0,0,0,284,1892,1,0,0,0,286,1894,1,0,0,0,288,290,3,2,1,0,289,288,
        1,0,0,0,290,293,1,0,0,0,291,289,1,0,0,0,291,292,1,0,0,0,292,294,
        1,0,0,0,293,291,1,0,0,0,294,295,5,0,0,1,295,1,1,0,0,0,296,301,3,
        10,5,0,297,301,3,4,2,0,298,301,3,6,3,0,299,301,3,14,7,0,300,296,
        1,0,0,0,300,297,1,0,0,0,300,298,1,0,0,0,300,299,1,0,0,0,301,3,1,
        0,0,0,302,304,3,24,12,0,303,302,1,0,0,0,304,307,1,0,0,0,305,303,
        1,0,0,0,305,306,1,0,0,0,306,308,1,0,0,0,307,305,1,0,0,0,308,309,
        5,6,0,0,309,312,3,284,142,0,310,311,5,12,0,0,311,313,3,44,22,0,312,
        310,1,0,0,0,312,313,1,0,0,0,313,316,1,0,0,0,314,315,5,19,0,0,315,
        317,3,16,8,0,316,314,1,0,0,0,316,317,1,0,0,0,317,318,1,0,0,0,318,
        319,3,18,9,0,319,5,1,0,0,0,320,322,3,24,12,0,321,320,1,0,0,0,322,
        325,1,0,0,0,323,321,1,0,0,0,323,324,1,0,0,0,324,326,1,0,0,0,325,
        323,1,0,0,0,326,327,5,11,0,0,327,328,3,284,142,0,328,330,5,200,0,
        0,329,331,3,8,4,0,330,329,1,0,0,0,330,331,1,0,0,0,331,332,1,0,0,
        0,332,333,5,201,0,0,333,7,1,0,0,0,334,339,3,284,142,0,335,336,5,
        205,0,0,336,338,3,284,142,0,337,335,1,0,0,0,338,341,1,0,0,0,339,
        337,1,0,0,0,339,340,1,0,0,0,340,9,1,0,0,0,341,339,1,0,0,0,342,343,
        5,43,0,0,343,344,3,284,142,0,344,345,5,27,0,0,345,346,3,284,142,
        0,346,347,5,198,0,0,347,352,3,12,6,0,348,349,5,205,0,0,349,351,3,
        12,6,0,350,348,1,0,0,0,351,354,1,0,0,0,352,350,1,0,0,0,352,353,1,
        0,0,0,353,355,1,0,0,0,354,352,1,0,0,0,355,356,5,199,0,0,356,357,
        3,72,36,0,357,358,5,0,0,1,358,11,1,0,0,0,359,360,7,0,0,0,360,361,
        7,1,0,0,361,13,1,0,0,0,362,364,3,24,12,0,363,362,1,0,0,0,364,367,
        1,0,0,0,365,363,1,0,0,0,365,366,1,0,0,0,366,368,1,0,0,0,367,365,
        1,0,0,0,368,369,5,23,0,0,369,372,3,284,142,0,370,371,5,12,0,0,371,
        373,3,16,8,0,372,370,1,0,0,0,372,373,1,0,0,0,373,374,1,0,0,0,374,
        375,3,20,10,0,375,15,1,0,0,0,376,381,3,44,22,0,377,378,5,205,0,0,
        378,380,3,44,22,0,379,377,1,0,0,0,380,383,1,0,0,0,381,379,1,0,0,
        0,381,382,1,0,0,0,382,17,1,0,0,0,383,381,1,0,0,0,384,388,5,200,0,
        0,385,387,3,22,11,0,386,385,1,0,0,0,387,390,1,0,0,0,388,386,1,0,
        0,0,388,389,1,0,0,0,389,391,1,0,0,0,390,388,1,0,0,0,391,392,5,201,
        0,0,392,19,1,0,0,0,393,397,5,200,0,0,394,396,3,36,18,0,395,394,1,
        0,0,0,396,399,1,0,0,0,397,395,1,0,0,0,397,398,1,0,0,0,398,400,1,
        0,0,0,399,397,1,0,0,0,400,401,5,201,0,0,401,21,1,0,0,0,402,415,5,
        204,0,0,403,405,5,36,0,0,404,403,1,0,0,0,404,405,1,0,0,0,405,406,
        1,0,0,0,406,415,3,72,36,0,407,409,3,24,12,0,408,407,1,0,0,0,409,
        412,1,0,0,0,410,408,1,0,0,0,410,411,1,0,0,0,411,413,1,0,0,0,412,
        410,1,0,0,0,413,415,3,26,13,0,414,402,1,0,0,0,414,404,1,0,0,0,414,
        410,1,0,0,0,415,23,1,0,0,0,416,436,3,62,31,0,417,436,5,17,0,0,418,
        436,5,31,0,0,419,436,5,30,0,0,420,436,5,29,0,0,421,436,5,42,0,0,
        422,436,5,36,0,0,423,436,5,1,0,0,424,436,5,13,0,0,425,436,5,50,0,
        0,426,436,5,28,0,0,427,436,5,48,0,0,428,436,5,39,0,0,429,430,5,53,
        0,0,430,436,5,35,0,0,431,432,5,54,0,0,432,436,5,35,0,0,433,434,5,
        20,0,0,434,436,5,35,0,0,435,416,1,0,0,0,435,417,1,0,0,0,435,418,
        1,0,0,0,435,419,1,0,0,0,435,420,1,0,0,0,435,421,1,0,0,0,435,422,
        1,0,0,0,435,423,1,0,0,0,435,424,1,0,0,0,435,425,1,0,0,0,435,426,
        1,0,0,0,435,427,1,0,0,0,435,428,1,0,0,0,435,429,1,0,0,0,435,431,
        1,0,0,0,435,433,1,0,0,0,436,25,1,0,0,0,437,445,3,28,14,0,438,445,
        3,32,16,0,439,445,3,30,15,0,440,445,3,14,7,0,441,445,3,4,2,0,442,
        445,3,6,3,0,443,445,3,34,17,0,444,437,1,0,0,0,444,438,1,0,0,0,444,
        439,1,0,0,0,444,440,1,0,0,0,444,441,1,0,0,0,444,442,1,0,0,0,444,
        443,1,0,0,0,445,27,1,0,0,0,446,449,3,44,22,0,447,449,5,49,0,0,448,
        446,1,0,0,0,448,447,1,0,0,0,449,450,1,0,0,0,450,451,3,284,142,0,
        451,454,3,52,26,0,452,455,3,72,36,0,453,455,5,204,0,0,454,452,1,
        0,0,0,454,453,1,0,0,0,455,29,1,0,0,0,456,457,3,58,29,0,457,458,3,
        52,26,0,458,459,3,72,36,0,459,31,1,0,0,0,460,461,3,44,22,0,461,462,
        3,38,19,0,462,463,5,204,0,0,463,33,1,0,0,0,464,465,3,44,22,0,465,
        466,3,284,142,0,466,470,5,200,0,0,467,469,3,124,62,0,468,467,1,0,
        0,0,469,472,1,0,0,0,470,468,1,0,0,0,470,471,1,0,0,0,471,473,1,0,
        0,0,472,470,1,0,0,0,473,474,5,201,0,0,474,35,1,0,0,0,475,477,3,24,
        12,0,476,475,1,0,0,0,477,480,1,0,0,0,478,476,1,0,0,0,478,479,1,0,
        0,0,479,483,1,0,0,0,480,478,1,0,0,0,481,484,3,44,22,0,482,484,5,
        49,0,0,483,481,1,0,0,0,483,482,1,0,0,0,484,485,1,0,0,0,485,486,3,
        284,142,0,486,487,3,52,26,0,487,488,5,204,0,0,488,37,1,0,0,0,489,
        494,3,40,20,0,490,491,5,205,0,0,491,493,3,40,20,0,492,490,1,0,0,
        0,493,496,1,0,0,0,494,492,1,0,0,0,494,495,1,0,0,0,495,39,1,0,0,0,
        496,494,1,0,0,0,497,500,3,284,142,0,498,499,5,207,0,0,499,501,3,
        146,73,0,500,498,1,0,0,0,500,501,1,0,0,0,501,41,1,0,0,0,502,514,
        5,200,0,0,503,508,3,146,73,0,504,505,5,205,0,0,505,507,3,146,73,
        0,506,504,1,0,0,0,507,510,1,0,0,0,508,506,1,0,0,0,508,509,1,0,0,
        0,509,512,1,0,0,0,510,508,1,0,0,0,511,513,5,205,0,0,512,511,1,0,
        0,0,512,513,1,0,0,0,513,515,1,0,0,0,514,503,1,0,0,0,514,515,1,0,
        0,0,515,516,1,0,0,0,516,517,5,201,0,0,517,43,1,0,0,0,518,523,3,48,
        24,0,519,520,5,206,0,0,520,522,3,48,24,0,521,519,1,0,0,0,522,525,
        1,0,0,0,523,521,1,0,0,0,523,524,1,0,0,0,524,526,1,0,0,0,525,523,
        1,0,0,0,526,527,3,46,23,0,527,45,1,0,0,0,528,529,5,202,0,0,529,531,
        5,203,0,0,530,528,1,0,0,0,531,534,1,0,0,0,532,530,1,0,0,0,532,533,
        1,0,0,0,533,47,1,0,0,0,534,532,1,0,0,0,535,537,5,55,0,0,536,538,
        3,50,25,0,537,536,1,0,0,0,537,538,1,0,0,0,538,552,1,0,0,0,539,541,
        5,34,0,0,540,542,3,50,25,0,541,540,1,0,0,0,541,542,1,0,0,0,542,552,
        1,0,0,0,543,545,5,56,0,0,544,546,3,50,25,0,545,544,1,0,0,0,545,546,
        1,0,0,0,546,552,1,0,0,0,547,549,3,284,142,0,548,550,3,50,25,0,549,
        548,1,0,0,0,549,550,1,0,0,0,550,552,1,0,0,0,551,535,1,0,0,0,551,
        539,1,0,0,0,551,543,1,0,0,0,551,547,1,0,0,0,552,49,1,0,0,0,553,554,
        5,209,0,0,554,555,3,16,8,0,555,556,5,208,0,0,556,51,1,0,0,0,557,
        559,5,198,0,0,558,560,3,54,27,0,559,558,1,0,0,0,559,560,1,0,0,0,
        560,561,1,0,0,0,561,562,5,199,0,0,562,53,1,0,0,0,563,568,3,56,28,
        0,564,565,5,205,0,0,565,567,3,56,28,0,566,564,1,0,0,0,567,570,1,
        0,0,0,568,566,1,0,0,0,568,569,1,0,0,0,569,55,1,0,0,0,570,568,1,0,
        0,0,571,573,3,24,12,0,572,571,1,0,0,0,573,576,1,0,0,0,574,572,1,
        0,0,0,574,575,1,0,0,0,575,577,1,0,0,0,576,574,1,0,0,0,577,578,3,
        44,22,0,578,579,3,284,142,0,579,57,1,0,0,0,580,585,3,284,142,0,581,
        582,5,206,0,0,582,584,3,284,142,0,583,581,1,0,0,0,584,587,1,0,0,
        0,585,583,1,0,0,0,585,586,1,0,0,0,586,59,1,0,0,0,587,585,1,0,0,0,
        588,589,7,2,0,0,589,61,1,0,0,0,590,591,5,243,0,0,591,598,3,58,29,
        0,592,595,5,198,0,0,593,596,3,64,32,0,594,596,3,68,34,0,595,593,
        1,0,0,0,595,594,1,0,0,0,595,596,1,0,0,0,596,597,1,0,0,0,597,599,
        5,199,0,0,598,592,1,0,0,0,598,599,1,0,0,0,599,63,1,0,0,0,600,607,
        3,66,33,0,601,603,5,205,0,0,602,601,1,0,0,0,602,603,1,0,0,0,603,
        604,1,0,0,0,604,606,3,66,33,0,605,602,1,0,0,0,606,609,1,0,0,0,607,
        605,1,0,0,0,607,608,1,0,0,0,608,65,1,0,0,0,609,607,1,0,0,0,610,611,
        3,284,142,0,611,612,5,207,0,0,612,613,3,68,34,0,613,67,1,0,0,0,614,
        618,3,146,73,0,615,618,3,62,31,0,616,618,3,70,35,0,617,614,1,0,0,
        0,617,615,1,0,0,0,617,616,1,0,0,0,618,69,1,0,0,0,619,628,5,200,0,
        0,620,625,3,68,34,0,621,622,5,205,0,0,622,624,3,68,34,0,623,621,
        1,0,0,0,624,627,1,0,0,0,625,623,1,0,0,0,625,626,1,0,0,0,626,629,
        1,0,0,0,627,625,1,0,0,0,628,620,1,0,0,0,628,629,1,0,0,0,629,631,
        1,0,0,0,630,632,5,205,0,0,631,630,1,0,0,0,631,632,1,0,0,0,632,633,
        1,0,0,0,633,634,5,201,0,0,634,71,1,0,0,0,635,639,5,200,0,0,636,638,
        3,78,39,0,637,636,1,0,0,0,638,641,1,0,0,0,639,637,1,0,0,0,639,640,
        1,0,0,0,640,642,1,0,0,0,641,639,1,0,0,0,642,643,5,201,0,0,643,73,
        1,0,0,0,644,645,3,76,38,0,645,646,5,204,0,0,646,75,1,0,0,0,647,649,
        3,24,12,0,648,647,1,0,0,0,649,652,1,0,0,0,650,648,1,0,0,0,650,651,
        1,0,0,0,651,653,1,0,0,0,652,650,1,0,0,0,653,654,3,44,22,0,654,655,
        3,38,19,0,655,77,1,0,0,0,656,677,3,72,36,0,657,677,3,80,40,0,658,
        677,3,82,41,0,659,677,3,90,45,0,660,677,3,92,46,0,661,677,3,94,47,
        0,662,677,3,96,48,0,663,677,3,98,49,0,664,677,3,100,50,0,665,677,
        3,102,51,0,666,677,3,104,52,0,667,677,3,108,54,0,668,677,3,110,55,
        0,669,677,3,112,56,0,670,677,3,114,57,0,671,677,3,116,58,0,672,677,
        3,118,59,0,673,677,3,120,60,0,674,677,3,74,37,0,675,677,3,122,61,
        0,676,656,1,0,0,0,676,657,1,0,0,0,676,658,1,0,0,0,676,659,1,0,0,
        0,676,660,1,0,0,0,676,661,1,0,0,0,676,662,1,0,0,0,676,663,1,0,0,
        0,676,664,1,0,0,0,676,665,1,0,0,0,676,666,1,0,0,0,676,667,1,0,0,
        0,676,668,1,0,0,0,676,669,1,0,0,0,676,670,1,0,0,0,676,671,1,0,0,
        0,676,672,1,0,0,0,676,673,1,0,0,0,676,674,1,0,0,0,676,675,1,0,0,
        0,677,79,1,0,0,0,678,679,5,18,0,0,679,680,3,142,71,0,680,683,3,78,
        39,0,681,682,5,10,0,0,682,684,3,78,39,0,683,681,1,0,0,0,683,684,
        1,0,0,0,684,81,1,0,0,0,685,686,5,38,0,0,686,687,5,27,0,0,687,688,
        3,146,73,0,688,690,5,200,0,0,689,691,3,84,42,0,690,689,1,0,0,0,691,
        692,1,0,0,0,692,690,1,0,0,0,692,693,1,0,0,0,693,694,1,0,0,0,694,
        695,5,201,0,0,695,83,1,0,0,0,696,697,5,51,0,0,697,698,3,86,43,0,
        698,699,3,72,36,0,699,85,1,0,0,0,700,713,5,10,0,0,701,706,3,88,44,
        0,702,703,5,205,0,0,703,705,3,88,44,0,704,702,1,0,0,0,705,708,1,
        0,0,0,706,704,1,0,0,0,706,707,1,0,0,0,707,713,1,0,0,0,708,706,1,
        0,0,0,709,710,3,284,142,0,710,711,3,284,142,0,711,713,1,0,0,0,712,
        700,1,0,0,0,712,701,1,0,0,0,712,709,1,0,0,0,713,87,1,0,0,0,714,716,
        5,226,0,0,715,714,1,0,0,0,715,716,1,0,0,0,716,717,1,0,0,0,717,727,
        5,192,0,0,718,727,5,193,0,0,719,727,5,196,0,0,720,727,5,26,0,0,721,
        727,3,284,142,0,722,723,5,198,0,0,723,724,3,88,44,0,724,725,5,199,
        0,0,725,727,1,0,0,0,726,715,1,0,0,0,726,718,1,0,0,0,726,719,1,0,
        0,0,726,720,1,0,0,0,726,721,1,0,0,0,726,722,1,0,0,0,727,89,1,0,0,
        0,728,729,5,15,0,0,729,730,5,198,0,0,730,731,3,134,67,0,731,734,
        5,199,0,0,732,735,3,78,39,0,733,735,5,204,0,0,734,732,1,0,0,0,734,
        733,1,0,0,0,735,91,1,0,0,0,736,737,5,52,0,0,737,740,3,142,71,0,738,
        741,3,78,39,0,739,741,5,204,0,0,740,738,1,0,0,0,740,739,1,0,0,0,
        741,93,1,0,0,0,742,743,5,9,0,0,743,744,3,78,39,0,744,745,5,52,0,
        0,745,746,3,142,71,0,746,747,5,204,0,0,747,95,1,0,0,0,748,749,5,
        44,0,0,749,759,3,72,36,0,750,752,3,130,65,0,751,750,1,0,0,0,752,
        753,1,0,0,0,753,751,1,0,0,0,753,754,1,0,0,0,754,756,1,0,0,0,755,
        757,3,132,66,0,756,755,1,0,0,0,756,757,1,0,0,0,757,760,1,0,0,0,758,
        760,3,132,66,0,759,751,1,0,0,0,759,758,1,0,0,0,760,97,1,0,0,0,761,
        763,5,32,0,0,762,764,3,146,73,0,763,762,1,0,0,0,763,764,1,0,0,0,
        764,765,1,0,0,0,765,766,5,204,0,0,766,99,1,0,0,0,767,768,5,41,0,
        0,768,769,3,146,73,0,769,770,5,204,0,0,770,101,1,0,0,0,771,772,5,
        4,0,0,772,773,5,204,0,0,773,103,1,0,0,0,774,775,5,7,0,0,775,776,
        5,204,0,0,776,105,1,0,0,0,777,778,5,62,0,0,778,779,7,3,0,0,779,107,
        1,0,0,0,780,782,5,21,0,0,781,783,3,106,53,0,782,781,1,0,0,0,782,
        783,1,0,0,0,783,784,1,0,0,0,784,785,3,146,73,0,785,786,5,204,0,0,
        786,109,1,0,0,0,787,789,5,46,0,0,788,790,3,106,53,0,789,788,1,0,
        0,0,789,790,1,0,0,0,790,791,1,0,0,0,791,792,3,146,73,0,792,793,5,
        204,0,0,793,111,1,0,0,0,794,796,5,8,0,0,795,797,3,106,53,0,796,795,
        1,0,0,0,796,797,1,0,0,0,797,798,1,0,0,0,798,799,3,146,73,0,799,800,
        5,204,0,0,800,113,1,0,0,0,801,803,5,45,0,0,802,804,3,106,53,0,803,
        802,1,0,0,0,803,804,1,0,0,0,804,805,1,0,0,0,805,806,3,146,73,0,806,
        807,5,204,0,0,807,115,1,0,0,0,808,810,5,47,0,0,809,811,3,106,53,
        0,810,809,1,0,0,0,810,811,1,0,0,0,811,812,1,0,0,0,812,814,3,146,
        73,0,813,815,3,58,29,0,814,813,1,0,0,0,814,815,1,0,0,0,815,816,1,
        0,0,0,816,817,5,204,0,0,817,117,1,0,0,0,818,820,5,24,0,0,819,821,
        3,106,53,0,820,819,1,0,0,0,820,821,1,0,0,0,821,822,1,0,0,0,822,823,
        3,146,73,0,823,824,3,146,73,0,824,825,5,204,0,0,825,119,1,0,0,0,
        826,827,5,33,0,0,827,829,5,198,0,0,828,830,3,144,72,0,829,828,1,
        0,0,0,829,830,1,0,0,0,830,831,1,0,0,0,831,832,5,199,0,0,832,833,
        3,72,36,0,833,121,1,0,0,0,834,835,3,146,73,0,835,836,5,204,0,0,836,
        123,1,0,0,0,837,839,3,24,12,0,838,837,1,0,0,0,839,842,1,0,0,0,840,
        838,1,0,0,0,840,841,1,0,0,0,841,845,1,0,0,0,842,840,1,0,0,0,843,
        846,3,126,63,0,844,846,3,128,64,0,845,843,1,0,0,0,845,844,1,0,0,
        0,846,125,1,0,0,0,847,850,5,16,0,0,848,851,5,204,0,0,849,851,3,72,
        36,0,850,848,1,0,0,0,850,849,1,0,0,0,851,127,1,0,0,0,852,855,5,34,
        0,0,853,856,5,204,0,0,854,856,3,72,36,0,855,853,1,0,0,0,855,854,
        1,0,0,0,856,129,1,0,0,0,857,858,5,5,0,0,858,862,5,198,0,0,859,861,
        3,24,12,0,860,859,1,0,0,0,861,864,1,0,0,0,862,860,1,0,0,0,862,863,
        1,0,0,0,863,865,1,0,0,0,864,862,1,0,0,0,865,866,3,58,29,0,866,867,
        3,284,142,0,867,868,5,199,0,0,868,869,3,72,36,0,869,131,1,0,0,0,
        870,871,5,14,0,0,871,872,3,72,36,0,872,133,1,0,0,0,873,886,3,138,
        69,0,874,876,3,136,68,0,875,874,1,0,0,0,875,876,1,0,0,0,876,877,
        1,0,0,0,877,879,5,204,0,0,878,880,3,146,73,0,879,878,1,0,0,0,879,
        880,1,0,0,0,880,881,1,0,0,0,881,883,5,204,0,0,882,884,3,140,70,0,
        883,882,1,0,0,0,883,884,1,0,0,0,884,886,1,0,0,0,885,873,1,0,0,0,
        885,875,1,0,0,0,886,135,1,0,0,0,887,890,3,76,38,0,888,890,3,144,
        72,0,889,887,1,0,0,0,889,888,1,0,0,0,890,137,1,0,0,0,891,892,3,44,
        22,0,892,893,3,284,142,0,893,894,5,215,0,0,894,895,3,146,73,0,895,
        139,1,0,0,0,896,897,3,144,72,0,897,141,1,0,0,0,898,899,5,198,0,0,
        899,900,3,146,73,0,900,901,5,199,0,0,901,143,1,0,0,0,902,907,3,146,
        73,0,903,904,5,205,0,0,904,906,3,146,73,0,905,903,1,0,0,0,906,909,
        1,0,0,0,907,905,1,0,0,0,907,908,1,0,0,0,908,145,1,0,0,0,909,907,
        1,0,0,0,910,911,6,73,-1,0,911,929,3,148,74,0,912,929,3,150,75,0,
        913,914,5,25,0,0,914,929,3,154,77,0,915,916,5,198,0,0,916,917,3,
        44,22,0,917,918,5,199,0,0,918,919,3,146,73,19,919,929,1,0,0,0,920,
        921,5,198,0,0,921,922,3,146,73,0,922,923,5,199,0,0,923,929,1,0,0,
        0,924,925,7,4,0,0,925,929,3,146,73,16,926,927,7,5,0,0,927,929,3,
        146,73,15,928,910,1,0,0,0,928,912,1,0,0,0,928,913,1,0,0,0,928,915,
        1,0,0,0,928,920,1,0,0,0,928,924,1,0,0,0,928,926,1,0,0,0,929,1001,
        1,0,0,0,930,931,10,14,0,0,931,932,7,6,0,0,932,1000,3,146,73,15,933,
        934,10,13,0,0,934,935,7,7,0,0,935,1000,3,146,73,14,936,944,10,12,
        0,0,937,938,5,209,0,0,938,945,5,209,0,0,939,940,5,208,0,0,940,941,
        5,208,0,0,941,945,5,208,0,0,942,943,5,208,0,0,943,945,5,208,0,0,
        944,937,1,0,0,0,944,939,1,0,0,0,944,942,1,0,0,0,945,946,1,0,0,0,
        946,1000,3,146,73,13,947,948,10,11,0,0,948,950,7,8,0,0,949,951,5,
        207,0,0,950,949,1,0,0,0,950,951,1,0,0,0,951,952,1,0,0,0,952,1000,
        3,146,73,12,953,954,10,9,0,0,954,955,7,9,0,0,955,1000,3,146,73,10,
        956,957,10,8,0,0,957,958,5,229,0,0,958,1000,3,146,73,9,959,960,10,
        7,0,0,960,961,5,231,0,0,961,1000,3,146,73,8,962,963,10,6,0,0,963,
        964,5,230,0,0,964,1000,3,146,73,7,965,966,10,5,0,0,966,967,5,221,
        0,0,967,1000,3,146,73,6,968,969,10,4,0,0,969,970,5,222,0,0,970,1000,
        3,146,73,5,971,972,10,3,0,0,972,973,5,213,0,0,973,974,3,146,73,0,
        974,975,5,215,0,0,975,976,3,146,73,3,976,1000,1,0,0,0,977,978,10,
        2,0,0,978,979,5,214,0,0,979,1000,3,146,73,2,980,981,10,1,0,0,981,
        982,7,10,0,0,982,1000,3,146,73,1,983,984,10,23,0,0,984,987,7,11,
        0,0,985,988,3,152,76,0,986,988,3,286,143,0,987,985,1,0,0,0,987,986,
        1,0,0,0,988,1000,1,0,0,0,989,990,10,22,0,0,990,991,5,202,0,0,991,
        992,3,146,73,0,992,993,5,203,0,0,993,1000,1,0,0,0,994,995,10,17,
        0,0,995,1000,7,12,0,0,996,997,10,10,0,0,997,998,5,22,0,0,998,1000,
        3,44,22,0,999,930,1,0,0,0,999,933,1,0,0,0,999,936,1,0,0,0,999,947,
        1,0,0,0,999,953,1,0,0,0,999,956,1,0,0,0,999,959,1,0,0,0,999,962,
        1,0,0,0,999,965,1,0,0,0,999,968,1,0,0,0,999,971,1,0,0,0,999,977,
        1,0,0,0,999,980,1,0,0,0,999,983,1,0,0,0,999,989,1,0,0,0,999,994,
        1,0,0,0,999,996,1,0,0,0,1000,1003,1,0,0,0,1001,999,1,0,0,0,1001,
        1002,1,0,0,0,1002,147,1,0,0,0,1003,1001,1,0,0,0,1004,1018,5,40,0,
        0,1005,1018,5,37,0,0,1006,1018,3,60,30,0,1007,1008,3,44,22,0,1008,
        1009,5,206,0,0,1009,1010,5,6,0,0,1010,1018,1,0,0,0,1011,1012,5,49,
        0,0,1012,1013,5,206,0,0,1013,1018,5,6,0,0,1014,1018,3,284,142,0,
        1015,1018,3,174,87,0,1016,1018,3,262,131,0,1017,1004,1,0,0,0,1017,
        1005,1,0,0,0,1017,1006,1,0,0,0,1017,1007,1,0,0,0,1017,1011,1,0,0,
        0,1017,1014,1,0,0,0,1017,1015,1,0,0,0,1017,1016,1,0,0,0,1018,149,
        1,0,0,0,1019,1020,3,284,142,0,1020,1022,5,198,0,0,1021,1023,3,144,
        72,0,1022,1021,1,0,0,0,1022,1023,1,0,0,0,1023,1024,1,0,0,0,1024,
        1025,5,199,0,0,1025,1039,1,0,0,0,1026,1027,5,40,0,0,1027,1029,5,
        198,0,0,1028,1030,3,144,72,0,1029,1028,1,0,0,0,1029,1030,1,0,0,0,
        1030,1031,1,0,0,0,1031,1039,5,199,0,0,1032,1033,5,37,0,0,1033,1035,
        5,198,0,0,1034,1036,3,144,72,0,1035,1034,1,0,0,0,1035,1036,1,0,0,
        0,1036,1037,1,0,0,0,1037,1039,5,199,0,0,1038,1019,1,0,0,0,1038,1026,
        1,0,0,0,1038,1032,1,0,0,0,1039,151,1,0,0,0,1040,1041,3,286,143,0,
        1041,1043,5,198,0,0,1042,1044,3,144,72,0,1043,1042,1,0,0,0,1043,
        1044,1,0,0,0,1044,1045,1,0,0,0,1045,1046,5,199,0,0,1046,153,1,0,
        0,0,1047,1053,3,156,78,0,1048,1054,3,160,80,0,1049,1054,3,162,81,
        0,1050,1054,3,164,82,0,1051,1054,3,166,83,0,1052,1054,3,170,85,0,
        1053,1048,1,0,0,0,1053,1049,1,0,0,0,1053,1050,1,0,0,0,1053,1051,
        1,0,0,0,1053,1052,1,0,0,0,1054,155,1,0,0,0,1055,1060,3,158,79,0,
        1056,1057,5,206,0,0,1057,1059,3,158,79,0,1058,1056,1,0,0,0,1059,
        1062,1,0,0,0,1060,1058,1,0,0,0,1060,1061,1,0,0,0,1061,157,1,0,0,
        0,1062,1060,1,0,0,0,1063,1068,3,286,143,0,1064,1065,5,209,0,0,1065,
        1066,3,16,8,0,1066,1067,5,208,0,0,1067,1069,1,0,0,0,1068,1064,1,
        0,0,0,1068,1069,1,0,0,0,1069,159,1,0,0,0,1070,1071,5,200,0,0,1071,
        1072,5,201,0,0,1072,161,1,0,0,0,1073,1074,3,172,86,0,1074,163,1,
        0,0,0,1075,1076,5,202,0,0,1076,1077,3,146,73,0,1077,1078,5,203,0,
        0,1078,1085,1,0,0,0,1079,1080,5,202,0,0,1080,1082,5,203,0,0,1081,
        1083,3,42,21,0,1082,1081,1,0,0,0,1082,1083,1,0,0,0,1083,1085,1,0,
        0,0,1084,1075,1,0,0,0,1084,1079,1,0,0,0,1085,165,1,0,0,0,1086,1087,
        5,200,0,0,1087,1092,3,168,84,0,1088,1089,5,205,0,0,1089,1091,3,168,
        84,0,1090,1088,1,0,0,0,1091,1094,1,0,0,0,1092,1090,1,0,0,0,1092,
        1093,1,0,0,0,1093,1095,1,0,0,0,1094,1092,1,0,0,0,1095,1096,5,201,
        0,0,1096,167,1,0,0,0,1097,1098,3,146,73,0,1098,1099,5,232,0,0,1099,
        1100,3,146,73,0,1100,169,1,0,0,0,1101,1102,5,200,0,0,1102,1107,3,
        146,73,0,1103,1104,5,205,0,0,1104,1106,3,146,73,0,1105,1103,1,0,
        0,0,1106,1109,1,0,0,0,1107,1105,1,0,0,0,1107,1108,1,0,0,0,1108,1110,
        1,0,0,0,1109,1107,1,0,0,0,1110,1111,5,201,0,0,1111,171,1,0,0,0,1112,
        1114,5,198,0,0,1113,1115,3,144,72,0,1114,1113,1,0,0,0,1114,1115,
        1,0,0,0,1115,1116,1,0,0,0,1116,1117,5,199,0,0,1117,173,1,0,0,0,1118,
        1119,5,202,0,0,1119,1120,3,176,88,0,1120,1121,5,203,0,0,1121,175,
        1,0,0,0,1122,1123,5,59,0,0,1123,1124,3,180,90,0,1124,1125,5,61,0,
        0,1125,1127,3,186,93,0,1126,1128,3,210,105,0,1127,1126,1,0,0,0,1127,
        1128,1,0,0,0,1128,1130,1,0,0,0,1129,1131,3,212,106,0,1130,1129,1,
        0,0,0,1130,1131,1,0,0,0,1131,1133,1,0,0,0,1132,1134,3,228,114,0,
        1133,1132,1,0,0,0,1133,1134,1,0,0,0,1134,1136,1,0,0,0,1135,1137,
        3,238,119,0,1136,1135,1,0,0,0,1136,1137,1,0,0,0,1137,1139,1,0,0,
        0,1138,1140,3,240,120,0,1139,1138,1,0,0,0,1139,1140,1,0,0,0,1140,
        1142,1,0,0,0,1141,1143,3,246,123,0,1142,1141,1,0,0,0,1142,1143,1,
        0,0,0,1143,1145,1,0,0,0,1144,1146,3,248,124,0,1145,1144,1,0,0,0,
        1145,1146,1,0,0,0,1146,1148,1,0,0,0,1147,1149,3,250,125,0,1148,1147,
        1,0,0,0,1148,1149,1,0,0,0,1149,1150,1,0,0,0,1150,1153,3,252,126,
        0,1151,1152,5,46,0,0,1152,1154,3,276,138,0,1153,1151,1,0,0,0,1153,
        1154,1,0,0,0,1154,177,1,0,0,0,1155,1156,5,59,0,0,1156,1157,3,188,
        94,0,1157,1158,5,61,0,0,1158,1160,3,186,93,0,1159,1161,3,212,106,
        0,1160,1159,1,0,0,0,1160,1161,1,0,0,0,1161,1163,1,0,0,0,1162,1164,
        3,240,120,0,1163,1162,1,0,0,0,1163,1164,1,0,0,0,1164,1166,1,0,0,
        0,1165,1167,3,246,123,0,1166,1165,1,0,0,0,1166,1167,1,0,0,0,1167,
        1168,1,0,0,0,1168,1171,3,252,126,0,1169,1170,5,46,0,0,1170,1172,
        3,276,138,0,1171,1169,1,0,0,0,1171,1172,1,0,0,0,1172,179,1,0,0,0,
        1173,1178,3,182,91,0,1174,1175,5,205,0,0,1175,1177,3,182,91,0,1176,
        1174,1,0,0,0,1177,1180,1,0,0,0,1178,1176,1,0,0,0,1178,1179,1,0,0,
        0,1179,181,1,0,0,0,1180,1178,1,0,0,0,1181,1183,3,184,92,0,1182,1184,
        3,260,130,0,1183,1182,1,0,0,0,1183,1184,1,0,0,0,1184,1197,1,0,0,
        0,1185,1187,3,194,97,0,1186,1188,3,260,130,0,1187,1186,1,0,0,0,1187,
        1188,1,0,0,0,1188,1197,1,0,0,0,1189,1190,5,198,0,0,1190,1191,3,178,
        89,0,1191,1193,5,199,0,0,1192,1194,3,260,130,0,1193,1192,1,0,0,0,
        1193,1194,1,0,0,0,1194,1197,1,0,0,0,1195,1197,3,202,101,0,1196,1181,
        1,0,0,0,1196,1185,1,0,0,0,1196,1189,1,0,0,0,1196,1195,1,0,0,0,1197,
        183,1,0,0,0,1198,1203,3,260,130,0,1199,1200,5,206,0,0,1200,1202,
        3,260,130,0,1201,1199,1,0,0,0,1202,1205,1,0,0,0,1203,1201,1,0,0,
        0,1203,1204,1,0,0,0,1204,185,1,0,0,0,1205,1203,1,0,0,0,1206,1208,
        3,184,92,0,1207,1209,3,260,130,0,1208,1207,1,0,0,0,1208,1209,1,0,
        0,0,1209,1217,1,0,0,0,1210,1211,5,205,0,0,1211,1213,3,184,92,0,1212,
        1214,3,260,130,0,1213,1212,1,0,0,0,1213,1214,1,0,0,0,1214,1216,1,
        0,0,0,1215,1210,1,0,0,0,1216,1219,1,0,0,0,1217,1215,1,0,0,0,1217,
        1218,1,0,0,0,1218,187,1,0,0,0,1219,1217,1,0,0,0,1220,1225,3,190,
        95,0,1221,1222,5,205,0,0,1222,1224,3,190,95,0,1223,1221,1,0,0,0,
        1224,1227,1,0,0,0,1225,1223,1,0,0,0,1225,1226,1,0,0,0,1226,189,1,
        0,0,0,1227,1225,1,0,0,0,1228,1230,3,184,92,0,1229,1231,3,260,130,
        0,1230,1229,1,0,0,0,1230,1231,1,0,0,0,1231,1238,1,0,0,0,1232,1234,
        3,194,97,0,1233,1235,3,260,130,0,1234,1233,1,0,0,0,1234,1235,1,0,
        0,0,1235,1238,1,0,0,0,1236,1238,3,202,101,0,1237,1228,1,0,0,0,1237,
        1232,1,0,0,0,1237,1236,1,0,0,0,1238,191,1,0,0,0,1239,1240,7,13,0,
        0,1240,193,1,0,0,0,1241,1242,5,72,0,0,1242,1243,5,198,0,0,1243,1244,
        3,184,92,0,1244,1245,5,199,0,0,1245,1364,1,0,0,0,1246,1247,5,60,
        0,0,1247,1248,5,198,0,0,1248,1364,5,199,0,0,1249,1250,5,60,0,0,1250,
        1251,5,198,0,0,1251,1252,3,184,92,0,1252,1253,5,199,0,0,1253,1364,
        1,0,0,0,1254,1255,5,73,0,0,1255,1256,5,198,0,0,1256,1257,3,184,92,
        0,1257,1258,5,199,0,0,1258,1364,1,0,0,0,1259,1260,5,74,0,0,1260,
        1261,5,198,0,0,1261,1262,3,184,92,0,1262,1263,5,199,0,0,1263,1364,
        1,0,0,0,1264,1265,5,75,0,0,1265,1266,5,198,0,0,1266,1267,3,184,92,
        0,1267,1268,5,199,0,0,1268,1364,1,0,0,0,1269,1270,5,76,0,0,1270,
        1271,5,198,0,0,1271,1272,3,184,92,0,1272,1273,5,199,0,0,1273,1364,
        1,0,0,0,1274,1275,5,95,0,0,1275,1276,5,198,0,0,1276,1277,3,184,92,
        0,1277,1278,5,199,0,0,1278,1364,1,0,0,0,1279,1280,5,108,0,0,1280,
        1281,5,198,0,0,1281,1282,3,184,92,0,1282,1283,5,199,0,0,1283,1364,
        1,0,0,0,1284,1285,5,115,0,0,1285,1286,5,198,0,0,1286,1287,3,196,
        98,0,1287,1288,5,199,0,0,1288,1364,1,0,0,0,1289,1290,5,116,0,0,1290,
        1291,5,198,0,0,1291,1292,3,196,98,0,1292,1293,5,199,0,0,1293,1364,
        1,0,0,0,1294,1295,5,117,0,0,1295,1296,5,198,0,0,1296,1297,3,196,
        98,0,1297,1298,5,199,0,0,1298,1364,1,0,0,0,1299,1300,5,118,0,0,1300,
        1301,5,198,0,0,1301,1302,3,196,98,0,1302,1303,5,199,0,0,1303,1364,
        1,0,0,0,1304,1305,5,119,0,0,1305,1306,5,198,0,0,1306,1307,3,196,
        98,0,1307,1308,5,199,0,0,1308,1364,1,0,0,0,1309,1310,5,120,0,0,1310,
        1311,5,198,0,0,1311,1312,3,196,98,0,1312,1313,5,199,0,0,1313,1364,
        1,0,0,0,1314,1315,5,121,0,0,1315,1316,5,198,0,0,1316,1317,3,196,
        98,0,1317,1318,5,199,0,0,1318,1364,1,0,0,0,1319,1320,5,122,0,0,1320,
        1321,5,198,0,0,1321,1322,3,196,98,0,1322,1323,5,199,0,0,1323,1364,
        1,0,0,0,1324,1325,5,123,0,0,1325,1326,5,198,0,0,1326,1327,3,196,
        98,0,1327,1328,5,199,0,0,1328,1364,1,0,0,0,1329,1330,5,124,0,0,1330,
        1331,5,198,0,0,1331,1332,3,196,98,0,1332,1333,5,199,0,0,1333,1364,
        1,0,0,0,1334,1335,5,125,0,0,1335,1336,5,198,0,0,1336,1337,3,196,
        98,0,1337,1338,5,199,0,0,1338,1364,1,0,0,0,1339,1340,5,126,0,0,1340,
        1341,5,198,0,0,1341,1342,3,196,98,0,1342,1343,5,199,0,0,1343,1364,
        1,0,0,0,1344,1345,5,127,0,0,1345,1346,5,198,0,0,1346,1347,3,196,
        98,0,1347,1348,5,199,0,0,1348,1364,1,0,0,0,1349,1350,5,181,0,0,1350,
        1351,5,198,0,0,1351,1352,3,192,96,0,1352,1353,5,199,0,0,1353,1364,
        1,0,0,0,1354,1355,5,113,0,0,1355,1356,5,198,0,0,1356,1357,3,198,
        99,0,1357,1358,5,205,0,0,1358,1359,3,198,99,0,1359,1360,5,205,0,
        0,1360,1361,5,196,0,0,1361,1362,5,199,0,0,1362,1364,1,0,0,0,1363,
        1241,1,0,0,0,1363,1246,1,0,0,0,1363,1249,1,0,0,0,1363,1254,1,0,0,
        0,1363,1259,1,0,0,0,1363,1264,1,0,0,0,1363,1269,1,0,0,0,1363,1274,
        1,0,0,0,1363,1279,1,0,0,0,1363,1284,1,0,0,0,1363,1289,1,0,0,0,1363,
        1294,1,0,0,0,1363,1299,1,0,0,0,1363,1304,1,0,0,0,1363,1309,1,0,0,
        0,1363,1314,1,0,0,0,1363,1319,1,0,0,0,1363,1324,1,0,0,0,1363,1329,
        1,0,0,0,1363,1334,1,0,0,0,1363,1339,1,0,0,0,1363,1344,1,0,0,0,1363,
        1349,1,0,0,0,1363,1354,1,0,0,0,1364,195,1,0,0,0,1365,1366,5,128,
        0,0,1366,1367,5,198,0,0,1367,1368,3,184,92,0,1368,1369,5,199,0,0,
        1369,1372,1,0,0,0,1370,1372,3,184,92,0,1371,1365,1,0,0,0,1371,1370,
        1,0,0,0,1372,197,1,0,0,0,1373,1383,3,184,92,0,1374,1383,3,254,127,
        0,1375,1376,5,114,0,0,1376,1377,5,198,0,0,1377,1378,3,200,100,0,
        1378,1379,5,205,0,0,1379,1380,3,200,100,0,1380,1381,5,199,0,0,1381,
        1383,1,0,0,0,1382,1373,1,0,0,0,1382,1374,1,0,0,0,1382,1375,1,0,0,
        0,1383,199,1,0,0,0,1384,1387,3,226,113,0,1385,1387,3,254,127,0,1386,
        1384,1,0,0,0,1386,1385,1,0,0,0,1387,201,1,0,0,0,1388,1389,5,77,0,
        0,1389,1391,3,184,92,0,1390,1392,3,204,102,0,1391,1390,1,0,0,0,1392,
        1393,1,0,0,0,1393,1391,1,0,0,0,1393,1394,1,0,0,0,1394,1396,1,0,0,
        0,1395,1397,3,206,103,0,1396,1395,1,0,0,0,1396,1397,1,0,0,0,1397,
        1398,1,0,0,0,1398,1399,5,78,0,0,1399,203,1,0,0,0,1400,1401,5,51,
        0,0,1401,1402,3,184,92,0,1402,1403,5,79,0,0,1403,1404,3,208,104,
        0,1404,205,1,0,0,0,1405,1406,5,10,0,0,1406,1407,3,208,104,0,1407,
        207,1,0,0,0,1408,1413,3,184,92,0,1409,1410,5,205,0,0,1410,1412,3,
        184,92,0,1411,1409,1,0,0,0,1412,1415,1,0,0,0,1413,1411,1,0,0,0,1413,
        1414,1,0,0,0,1414,209,1,0,0,0,1415,1413,1,0,0,0,1416,1417,5,63,0,
        0,1417,1418,5,64,0,0,1418,1419,3,260,130,0,1419,211,1,0,0,0,1420,
        1421,5,65,0,0,1421,1422,3,214,107,0,1422,213,1,0,0,0,1423,1428,3,
        216,108,0,1424,1425,5,69,0,0,1425,1427,3,216,108,0,1426,1424,1,0,
        0,0,1427,1430,1,0,0,0,1428,1426,1,0,0,0,1428,1429,1,0,0,0,1429,1442,
        1,0,0,0,1430,1428,1,0,0,0,1431,1436,3,216,108,0,1432,1433,5,70,0,
        0,1433,1435,3,216,108,0,1434,1432,1,0,0,0,1435,1438,1,0,0,0,1436,
        1434,1,0,0,0,1436,1437,1,0,0,0,1437,1442,1,0,0,0,1438,1436,1,0,0,
        0,1439,1440,5,71,0,0,1440,1442,3,216,108,0,1441,1423,1,0,0,0,1441,
        1431,1,0,0,0,1441,1439,1,0,0,0,1442,215,1,0,0,0,1443,1444,5,198,
        0,0,1444,1445,3,214,107,0,1445,1446,5,199,0,0,1446,1449,1,0,0,0,
        1447,1449,3,218,109,0,1448,1443,1,0,0,0,1448,1447,1,0,0,0,1449,217,
        1,0,0,0,1450,1451,3,184,92,0,1451,1452,3,220,110,0,1452,1453,3,222,
        111,0,1453,1459,1,0,0,0,1454,1455,3,194,97,0,1455,1456,3,220,110,
        0,1456,1457,3,222,111,0,1457,1459,1,0,0,0,1458,1450,1,0,0,0,1458,
        1454,1,0,0,0,1459,219,1,0,0,0,1460,1476,5,207,0,0,1461,1476,5,218,
        0,0,1462,1476,5,209,0,0,1463,1476,5,208,0,0,1464,1465,5,209,0,0,
        1465,1476,5,207,0,0,1466,1467,5,208,0,0,1467,1476,5,207,0,0,1468,
        1476,5,219,0,0,1469,1476,5,80,0,0,1470,1476,5,81,0,0,1471,1472,5,
        71,0,0,1472,1476,5,81,0,0,1473,1476,5,82,0,0,1474,1476,5,83,0,0,
        1475,1460,1,0,0,0,1475,1461,1,0,0,0,1475,1462,1,0,0,0,1475,1463,
        1,0,0,0,1475,1464,1,0,0,0,1475,1466,1,0,0,0,1475,1468,1,0,0,0,1475,
        1469,1,0,0,0,1475,1470,1,0,0,0,1475,1471,1,0,0,0,1475,1473,1,0,0,
        0,1475,1474,1,0,0,0,1476,221,1,0,0,0,1477,1498,5,26,0,0,1478,1498,
        5,195,0,0,1479,1498,3,226,113,0,1480,1498,5,196,0,0,1481,1498,5,
        173,0,0,1482,1498,5,174,0,0,1483,1498,3,256,128,0,1484,1489,5,175,
        0,0,1485,1487,5,206,0,0,1486,1488,5,192,0,0,1487,1486,1,0,0,0,1487,
        1488,1,0,0,0,1488,1490,1,0,0,0,1489,1485,1,0,0,0,1489,1490,1,0,0,
        0,1490,1498,1,0,0,0,1491,1492,5,198,0,0,1492,1493,3,178,89,0,1493,
        1494,5,199,0,0,1494,1498,1,0,0,0,1495,1498,3,224,112,0,1496,1498,
        3,254,127,0,1497,1477,1,0,0,0,1497,1478,1,0,0,0,1497,1479,1,0,0,
        0,1497,1480,1,0,0,0,1497,1481,1,0,0,0,1497,1482,1,0,0,0,1497,1483,
        1,0,0,0,1497,1484,1,0,0,0,1497,1491,1,0,0,0,1497,1495,1,0,0,0,1497,
        1496,1,0,0,0,1498,223,1,0,0,0,1499,1500,5,198,0,0,1500,1505,3,222,
        111,0,1501,1502,5,205,0,0,1502,1504,3,222,111,0,1503,1501,1,0,0,
        0,1504,1507,1,0,0,0,1505,1503,1,0,0,0,1505,1506,1,0,0,0,1506,1508,
        1,0,0,0,1507,1505,1,0,0,0,1508,1509,5,199,0,0,1509,225,1,0,0,0,1510,
        1512,7,7,0,0,1511,1510,1,0,0,0,1511,1512,1,0,0,0,1512,1513,1,0,0,
        0,1513,1514,7,14,0,0,1514,227,1,0,0,0,1515,1516,5,53,0,0,1516,1517,
        5,97,0,0,1517,1518,5,98,0,0,1518,1528,3,230,115,0,1519,1520,5,53,
        0,0,1520,1528,5,103,0,0,1521,1522,5,53,0,0,1522,1528,5,104,0,0,1523,
        1524,5,53,0,0,1524,1528,5,105,0,0,1525,1526,5,53,0,0,1526,1528,3,
        214,107,0,1527,1515,1,0,0,0,1527,1519,1,0,0,0,1527,1521,1,0,0,0,
        1527,1523,1,0,0,0,1527,1525,1,0,0,0,1528,229,1,0,0,0,1529,1534,3,
        232,116,0,1530,1531,5,221,0,0,1531,1533,3,232,116,0,1532,1530,1,
        0,0,0,1533,1536,1,0,0,0,1534,1532,1,0,0,0,1534,1535,1,0,0,0,1535,
        231,1,0,0,0,1536,1534,1,0,0,0,1537,1538,3,260,130,0,1538,1539,3,
        236,118,0,1539,1540,3,234,117,0,1540,233,1,0,0,0,1541,1554,3,260,
        130,0,1542,1543,5,198,0,0,1543,1548,3,260,130,0,1544,1545,5,205,
        0,0,1545,1547,3,260,130,0,1546,1544,1,0,0,0,1547,1550,1,0,0,0,1548,
        1546,1,0,0,0,1548,1549,1,0,0,0,1549,1551,1,0,0,0,1550,1548,1,0,0,
        0,1551,1552,5,198,0,0,1552,1554,1,0,0,0,1553,1541,1,0,0,0,1553,1542,
        1,0,0,0,1554,235,1,0,0,0,1555,1556,7,15,0,0,1556,237,1,0,0,0,1557,
        1558,5,89,0,0,1558,1559,5,67,0,0,1559,1562,3,180,90,0,1560,1561,
        5,93,0,0,1561,1563,3,214,107,0,1562,1560,1,0,0,0,1562,1563,1,0,0,
        0,1563,1593,1,0,0,0,1564,1565,5,89,0,0,1565,1566,5,67,0,0,1566,1567,
        5,94,0,0,1567,1568,5,198,0,0,1568,1573,3,184,92,0,1569,1570,5,205,
        0,0,1570,1572,3,184,92,0,1571,1569,1,0,0,0,1572,1575,1,0,0,0,1573,
        1571,1,0,0,0,1573,1574,1,0,0,0,1574,1576,1,0,0,0,1575,1573,1,0,0,
        0,1576,1577,5,199,0,0,1577,1593,1,0,0,0,1578,1579,5,89,0,0,1579,
        1580,5,67,0,0,1580,1581,5,107,0,0,1581,1582,5,198,0,0,1582,1587,
        3,184,92,0,1583,1584,5,205,0,0,1584,1586,3,184,92,0,1585,1583,1,
        0,0,0,1586,1589,1,0,0,0,1587,1585,1,0,0,0,1587,1588,1,0,0,0,1588,
        1590,1,0,0,0,1589,1587,1,0,0,0,1590,1591,5,199,0,0,1591,1593,1,0,
        0,0,1592,1557,1,0,0,0,1592,1564,1,0,0,0,1592,1578,1,0,0,0,1593,239,
        1,0,0,0,1594,1595,5,66,0,0,1595,1596,5,67,0,0,1596,1597,3,242,121,
        0,1597,241,1,0,0,0,1598,1603,3,244,122,0,1599,1600,5,205,0,0,1600,
        1602,3,244,122,0,1601,1599,1,0,0,0,1602,1605,1,0,0,0,1603,1601,1,
        0,0,0,1603,1604,1,0,0,0,1604,243,1,0,0,0,1605,1603,1,0,0,0,1606,
        1608,3,184,92,0,1607,1609,7,16,0,0,1608,1607,1,0,0,0,1608,1609,1,
        0,0,0,1609,1612,1,0,0,0,1610,1611,5,86,0,0,1611,1613,7,17,0,0,1612,
        1610,1,0,0,0,1612,1613,1,0,0,0,1613,1623,1,0,0,0,1614,1616,3,194,
        97,0,1615,1617,7,16,0,0,1616,1615,1,0,0,0,1616,1617,1,0,0,0,1617,
        1620,1,0,0,0,1618,1619,5,86,0,0,1619,1621,7,17,0,0,1620,1618,1,0,
        0,0,1620,1621,1,0,0,0,1621,1623,1,0,0,0,1622,1606,1,0,0,0,1622,1614,
        1,0,0,0,1623,245,1,0,0,0,1624,1625,5,68,0,0,1625,1629,5,192,0,0,
        1626,1627,5,68,0,0,1627,1629,3,254,127,0,1628,1624,1,0,0,0,1628,
        1626,1,0,0,0,1629,247,1,0,0,0,1630,1631,5,96,0,0,1631,1635,5,192,
        0,0,1632,1633,5,96,0,0,1633,1635,3,254,127,0,1634,1630,1,0,0,0,1634,
        1632,1,0,0,0,1635,249,1,0,0,0,1636,1637,5,90,0,0,1637,1638,5,91,
        0,0,1638,251,1,0,0,0,1639,1640,5,15,0,0,1640,1642,7,18,0,0,1641,
        1639,1,0,0,0,1642,1645,1,0,0,0,1643,1641,1,0,0,0,1643,1644,1,0,0,
        0,1644,253,1,0,0,0,1645,1643,1,0,0,0,1646,1647,5,215,0,0,1647,1648,
        3,146,73,0,1648,255,1,0,0,0,1649,1736,5,129,0,0,1650,1736,5,130,
        0,0,1651,1736,5,131,0,0,1652,1736,5,132,0,0,1653,1736,5,133,0,0,
        1654,1736,5,134,0,0,1655,1736,5,135,0,0,1656,1736,5,136,0,0,1657,
        1736,5,137,0,0,1658,1736,5,138,0,0,1659,1736,5,139,0,0,1660,1661,
        5,140,0,0,1661,1662,5,215,0,0,1662,1736,3,258,129,0,1663,1664,5,
        141,0,0,1664,1665,5,215,0,0,1665,1736,3,258,129,0,1666,1667,5,142,
        0,0,1667,1668,5,215,0,0,1668,1736,3,258,129,0,1669,1670,5,143,0,
        0,1670,1671,5,215,0,0,1671,1736,3,258,129,0,1672,1673,5,144,0,0,
        1673,1674,5,215,0,0,1674,1736,3,258,129,0,1675,1676,5,145,0,0,1676,
        1677,5,215,0,0,1677,1736,3,258,129,0,1678,1679,5,146,0,0,1679,1680,
        5,215,0,0,1680,1736,3,258,129,0,1681,1682,5,147,0,0,1682,1683,5,
        215,0,0,1683,1736,3,258,129,0,1684,1685,5,148,0,0,1685,1686,5,215,
        0,0,1686,1736,3,258,129,0,1687,1736,5,149,0,0,1688,1736,5,150,0,
        0,1689,1736,5,151,0,0,1690,1691,5,152,0,0,1691,1692,5,215,0,0,1692,
        1736,3,258,129,0,1693,1694,5,153,0,0,1694,1695,5,215,0,0,1695,1736,
        3,258,129,0,1696,1697,5,154,0,0,1697,1698,5,215,0,0,1698,1736,3,
        258,129,0,1699,1736,5,155,0,0,1700,1736,5,156,0,0,1701,1736,5,157,
        0,0,1702,1703,5,158,0,0,1703,1704,5,215,0,0,1704,1736,3,258,129,
        0,1705,1706,5,159,0,0,1706,1707,5,215,0,0,1707,1736,3,258,129,0,
        1708,1709,5,160,0,0,1709,1710,5,215,0,0,1710,1736,3,258,129,0,1711,
        1736,5,161,0,0,1712,1736,5,162,0,0,1713,1736,5,163,0,0,1714,1715,
        5,164,0,0,1715,1716,5,215,0,0,1716,1736,3,258,129,0,1717,1718,5,
        165,0,0,1718,1719,5,215,0,0,1719,1736,3,258,129,0,1720,1721,5,166,
        0,0,1721,1722,5,215,0,0,1722,1736,3,258,129,0,1723,1736,5,167,0,
        0,1724,1736,5,168,0,0,1725,1736,5,169,0,0,1726,1727,5,170,0,0,1727,
        1728,5,215,0,0,1728,1736,3,258,129,0,1729,1730,5,171,0,0,1730,1731,
        5,215,0,0,1731,1736,3,258,129,0,1732,1733,5,172,0,0,1733,1734,5,
        215,0,0,1734,1736,3,258,129,0,1735,1649,1,0,0,0,1735,1650,1,0,0,
        0,1735,1651,1,0,0,0,1735,1652,1,0,0,0,1735,1653,1,0,0,0,1735,1654,
        1,0,0,0,1735,1655,1,0,0,0,1735,1656,1,0,0,0,1735,1657,1,0,0,0,1735,
        1658,1,0,0,0,1735,1659,1,0,0,0,1735,1660,1,0,0,0,1735,1663,1,0,0,
        0,1735,1666,1,0,0,0,1735,1669,1,0,0,0,1735,1672,1,0,0,0,1735,1675,
        1,0,0,0,1735,1678,1,0,0,0,1735,1681,1,0,0,0,1735,1684,1,0,0,0,1735,
        1687,1,0,0,0,1735,1688,1,0,0,0,1735,1689,1,0,0,0,1735,1690,1,0,0,
        0,1735,1693,1,0,0,0,1735,1696,1,0,0,0,1735,1699,1,0,0,0,1735,1700,
        1,0,0,0,1735,1701,1,0,0,0,1735,1702,1,0,0,0,1735,1705,1,0,0,0,1735,
        1708,1,0,0,0,1735,1711,1,0,0,0,1735,1712,1,0,0,0,1735,1713,1,0,0,
        0,1735,1714,1,0,0,0,1735,1717,1,0,0,0,1735,1720,1,0,0,0,1735,1723,
        1,0,0,0,1735,1724,1,0,0,0,1735,1725,1,0,0,0,1735,1726,1,0,0,0,1735,
        1729,1,0,0,0,1735,1732,1,0,0,0,1736,257,1,0,0,0,1737,1739,7,7,0,
        0,1738,1737,1,0,0,0,1738,1739,1,0,0,0,1739,1740,1,0,0,0,1740,1741,
        5,192,0,0,1741,259,1,0,0,0,1742,1743,3,284,142,0,1743,261,1,0,0,
        0,1744,1745,5,190,0,0,1745,1746,3,266,133,0,1746,1747,5,203,0,0,
        1747,1755,1,0,0,0,1748,1749,5,202,0,0,1749,1750,5,176,0,0,1750,1751,
        3,254,127,0,1751,1752,3,266,133,0,1752,1753,5,203,0,0,1753,1755,
        1,0,0,0,1754,1744,1,0,0,0,1754,1748,1,0,0,0,1755,263,1,0,0,0,1756,
        1757,5,191,0,0,1757,1758,3,266,133,0,1758,1759,5,203,0,0,1759,265,
        1,0,0,0,1760,1761,5,81,0,0,1761,1763,3,268,134,0,1762,1760,1,0,0,
        0,1762,1763,1,0,0,0,1763,1766,1,0,0,0,1764,1765,5,188,0,0,1765,1767,
        3,270,135,0,1766,1764,1,0,0,0,1766,1767,1,0,0,0,1767,1772,1,0,0,
        0,1768,1769,5,53,0,0,1769,1770,5,187,0,0,1770,1771,5,207,0,0,1771,
        1773,5,196,0,0,1772,1768,1,0,0,0,1772,1773,1,0,0,0,1773,1778,1,0,
        0,0,1774,1775,5,53,0,0,1775,1776,5,97,0,0,1776,1777,5,98,0,0,1777,
        1779,3,230,115,0,1778,1774,1,0,0,0,1778,1779,1,0,0,0,1779,1789,1,
        0,0,0,1780,1781,5,53,0,0,1781,1787,5,185,0,0,1782,1783,5,198,0,0,
        1783,1784,5,186,0,0,1784,1785,5,207,0,0,1785,1786,5,192,0,0,1786,
        1788,5,199,0,0,1787,1782,1,0,0,0,1787,1788,1,0,0,0,1788,1790,1,0,
        0,0,1789,1780,1,0,0,0,1789,1790,1,0,0,0,1790,1798,1,0,0,0,1791,1792,
        5,53,0,0,1792,1793,5,184,0,0,1793,1794,5,81,0,0,1794,1795,5,198,
        0,0,1795,1796,3,280,140,0,1796,1797,5,199,0,0,1797,1799,1,0,0,0,
        1798,1791,1,0,0,0,1798,1799,1,0,0,0,1799,1804,1,0,0,0,1800,1801,
        5,53,0,0,1801,1802,5,184,0,0,1802,1803,5,207,0,0,1803,1805,5,196,
        0,0,1804,1800,1,0,0,0,1804,1805,1,0,0,0,1805,1810,1,0,0,0,1806,1807,
        5,53,0,0,1807,1808,5,183,0,0,1808,1809,5,207,0,0,1809,1811,5,196,
        0,0,1810,1806,1,0,0,0,1810,1811,1,0,0,0,1811,1816,1,0,0,0,1812,1813,
        5,53,0,0,1813,1814,5,182,0,0,1814,1815,5,207,0,0,1815,1817,5,196,
        0,0,1816,1812,1,0,0,0,1816,1817,1,0,0,0,1817,1819,1,0,0,0,1818,1820,
        3,246,123,0,1819,1818,1,0,0,0,1819,1820,1,0,0,0,1820,1823,1,0,0,
        0,1821,1822,5,46,0,0,1822,1824,3,276,138,0,1823,1821,1,0,0,0,1823,
        1824,1,0,0,0,1824,267,1,0,0,0,1825,1826,7,19,0,0,1826,1827,5,181,
        0,0,1827,269,1,0,0,0,1828,1833,3,272,136,0,1829,1830,5,205,0,0,1830,
        1832,3,270,135,0,1831,1829,1,0,0,0,1832,1835,1,0,0,0,1833,1831,1,
        0,0,0,1833,1834,1,0,0,0,1834,271,1,0,0,0,1835,1833,1,0,0,0,1836,
        1862,3,282,141,0,1837,1838,5,198,0,0,1838,1841,3,274,137,0,1839,
        1840,5,65,0,0,1840,1842,3,214,107,0,1841,1839,1,0,0,0,1841,1842,
        1,0,0,0,1842,1847,1,0,0,0,1843,1844,5,63,0,0,1844,1845,5,189,0,0,
        1845,1846,5,207,0,0,1846,1848,3,282,141,0,1847,1843,1,0,0,0,1847,
        1848,1,0,0,0,1848,1852,1,0,0,0,1849,1850,5,66,0,0,1850,1851,5,67,
        0,0,1851,1853,3,242,121,0,1852,1849,1,0,0,0,1852,1853,1,0,0,0,1853,
        1855,1,0,0,0,1854,1856,3,246,123,0,1855,1854,1,0,0,0,1855,1856,1,
        0,0,0,1856,1858,1,0,0,0,1857,1859,3,248,124,0,1858,1857,1,0,0,0,
        1858,1859,1,0,0,0,1859,1860,1,0,0,0,1860,1861,5,199,0,0,1861,1863,
        1,0,0,0,1862,1837,1,0,0,0,1862,1863,1,0,0,0,1863,273,1,0,0,0,1864,
        1869,3,282,141,0,1865,1866,5,205,0,0,1866,1868,3,274,137,0,1867,
        1865,1,0,0,0,1868,1871,1,0,0,0,1869,1867,1,0,0,0,1869,1870,1,0,0,
        0,1870,275,1,0,0,0,1871,1869,1,0,0,0,1872,1875,3,278,139,0,1873,
        1874,5,205,0,0,1874,1876,3,276,138,0,1875,1873,1,0,0,0,1875,1876,
        1,0,0,0,1876,277,1,0,0,0,1877,1878,7,20,0,0,1878,279,1,0,0,0,1879,
        1882,5,196,0,0,1880,1881,5,205,0,0,1881,1883,3,280,140,0,1882,1880,
        1,0,0,0,1882,1883,1,0,0,0,1883,281,1,0,0,0,1884,1889,3,284,142,0,
        1885,1886,5,206,0,0,1886,1888,3,282,141,0,1887,1885,1,0,0,0,1888,
        1891,1,0,0,0,1889,1887,1,0,0,0,1889,1890,1,0,0,0,1890,283,1,0,0,
        0,1891,1889,1,0,0,0,1892,1893,7,21,0,0,1893,285,1,0,0,0,1894,1895,
        7,22,0,0,1895,287,1,0,0,0,189,291,300,305,312,316,323,330,339,352,
        365,372,381,388,397,404,410,414,435,444,448,454,470,478,483,494,
        500,508,512,514,523,532,537,541,545,549,551,559,568,574,585,595,
        598,602,607,617,625,628,631,639,650,676,683,692,706,712,715,726,
        734,740,753,756,759,763,782,789,796,803,810,814,820,829,840,845,
        850,855,862,875,879,883,885,889,907,928,944,950,987,999,1001,1017,
        1022,1029,1035,1038,1043,1053,1060,1068,1082,1084,1092,1107,1114,
        1127,1130,1133,1136,1139,1142,1145,1148,1153,1160,1163,1166,1171,
        1178,1183,1187,1193,1196,1203,1208,1213,1217,1225,1230,1234,1237,
        1363,1371,1382,1386,1393,1396,1413,1428,1436,1441,1448,1458,1475,
        1487,1489,1497,1505,1511,1527,1534,1548,1553,1562,1573,1587,1592,
        1603,1608,1612,1616,1620,1622,1628,1634,1643,1735,1738,1754,1762,
        1766,1772,1778,1787,1789,1798,1804,1810,1816,1819,1823,1833,1841,
        1847,1852,1855,1858,1862,1869,1875,1882,1889
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!ApexParser.__ATN) {
            ApexParser.__ATN = new antlr.ATNDeserializer().deserialize(ApexParser._serializedATN);
        }

        return ApexParser.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(ApexParser.literalNames, ApexParser.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return ApexParser.vocabulary;
    }

    private static readonly decisionsToDFA = ApexParser._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}

export class CompilationUnitContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public EOF(): antlr.TerminalNode {
        return this.getToken(ApexParser.EOF, 0)!;
    }
    public typeDeclaration(): TypeDeclarationContext[];
    public typeDeclaration(i: number): TypeDeclarationContext | null;
    public typeDeclaration(i?: number): TypeDeclarationContext[] | TypeDeclarationContext | null {
        if (i === undefined) {
            return this.getRuleContexts(TypeDeclarationContext);
        }

        return this.getRuleContext(i, TypeDeclarationContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_compilationUnit;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterCompilationUnit) {
             listener.enterCompilationUnit(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitCompilationUnit) {
             listener.exitCompilationUnit(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitCompilationUnit) {
            return visitor.visitCompilationUnit(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TypeDeclarationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public triggerDeclaration(): TriggerDeclarationContext | null {
        return this.getRuleContext(0, TriggerDeclarationContext);
    }
    public classDeclaration(): ClassDeclarationContext | null {
        return this.getRuleContext(0, ClassDeclarationContext);
    }
    public enumDeclaration(): EnumDeclarationContext | null {
        return this.getRuleContext(0, EnumDeclarationContext);
    }
    public interfaceDeclaration(): InterfaceDeclarationContext | null {
        return this.getRuleContext(0, InterfaceDeclarationContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_typeDeclaration;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterTypeDeclaration) {
             listener.enterTypeDeclaration(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitTypeDeclaration) {
             listener.exitTypeDeclaration(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitTypeDeclaration) {
            return visitor.visitTypeDeclaration(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ClassDeclarationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public CLASS(): antlr.TerminalNode {
        return this.getToken(ApexParser.CLASS, 0)!;
    }
    public id(): IdContext {
        return this.getRuleContext(0, IdContext)!;
    }
    public classBody(): ClassBodyContext {
        return this.getRuleContext(0, ClassBodyContext)!;
    }
    public modifier(): ModifierContext[];
    public modifier(i: number): ModifierContext | null;
    public modifier(i?: number): ModifierContext[] | ModifierContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ModifierContext);
        }

        return this.getRuleContext(i, ModifierContext);
    }
    public EXTENDS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.EXTENDS, 0);
    }
    public typeRef(): TypeRefContext | null {
        return this.getRuleContext(0, TypeRefContext);
    }
    public IMPLEMENTS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.IMPLEMENTS, 0);
    }
    public typeList(): TypeListContext | null {
        return this.getRuleContext(0, TypeListContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_classDeclaration;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterClassDeclaration) {
             listener.enterClassDeclaration(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitClassDeclaration) {
             listener.exitClassDeclaration(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitClassDeclaration) {
            return visitor.visitClassDeclaration(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class EnumDeclarationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ENUM(): antlr.TerminalNode {
        return this.getToken(ApexParser.ENUM, 0)!;
    }
    public id(): IdContext {
        return this.getRuleContext(0, IdContext)!;
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.LBRACE, 0)!;
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.RBRACE, 0)!;
    }
    public modifier(): ModifierContext[];
    public modifier(i: number): ModifierContext | null;
    public modifier(i?: number): ModifierContext[] | ModifierContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ModifierContext);
        }

        return this.getRuleContext(i, ModifierContext);
    }
    public enumConstants(): EnumConstantsContext | null {
        return this.getRuleContext(0, EnumConstantsContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_enumDeclaration;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterEnumDeclaration) {
             listener.enterEnumDeclaration(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitEnumDeclaration) {
             listener.exitEnumDeclaration(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitEnumDeclaration) {
            return visitor.visitEnumDeclaration(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class EnumConstantsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public id(): IdContext[];
    public id(i: number): IdContext | null;
    public id(i?: number): IdContext[] | IdContext | null {
        if (i === undefined) {
            return this.getRuleContexts(IdContext);
        }

        return this.getRuleContext(i, IdContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_enumConstants;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterEnumConstants) {
             listener.enterEnumConstants(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitEnumConstants) {
             listener.exitEnumConstants(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitEnumConstants) {
            return visitor.visitEnumConstants(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TriggerDeclarationContext extends antlr.ParserRuleContext {
    public _sobject?: IdContext;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TRIGGER(): antlr.TerminalNode {
        return this.getToken(ApexParser.TRIGGER, 0)!;
    }
    public id(): IdContext[];
    public id(i: number): IdContext | null;
    public id(i?: number): IdContext[] | IdContext | null {
        if (i === undefined) {
            return this.getRuleContexts(IdContext);
        }

        return this.getRuleContext(i, IdContext);
    }
    public ON(): antlr.TerminalNode {
        return this.getToken(ApexParser.ON, 0)!;
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.LPAREN, 0)!;
    }
    public triggerEvent(): TriggerEventContext[];
    public triggerEvent(i: number): TriggerEventContext | null;
    public triggerEvent(i?: number): TriggerEventContext[] | TriggerEventContext | null {
        if (i === undefined) {
            return this.getRuleContexts(TriggerEventContext);
        }

        return this.getRuleContext(i, TriggerEventContext);
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.RPAREN, 0)!;
    }
    public block(): BlockContext {
        return this.getRuleContext(0, BlockContext)!;
    }
    public EOF(): antlr.TerminalNode {
        return this.getToken(ApexParser.EOF, 0)!;
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_triggerDeclaration;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterTriggerDeclaration) {
             listener.enterTriggerDeclaration(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitTriggerDeclaration) {
             listener.exitTriggerDeclaration(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitTriggerDeclaration) {
            return visitor.visitTriggerDeclaration(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TriggerEventContext extends antlr.ParserRuleContext {
    public _when?: Token | null;
    public _operation?: Token | null;
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public BEFORE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.BEFORE, 0);
    }
    public AFTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.AFTER, 0);
    }
    public INSERT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.INSERT, 0);
    }
    public UPDATE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.UPDATE, 0);
    }
    public DELETE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DELETE, 0);
    }
    public UNDELETE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.UNDELETE, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_triggerEvent;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterTriggerEvent) {
             listener.enterTriggerEvent(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitTriggerEvent) {
             listener.exitTriggerEvent(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitTriggerEvent) {
            return visitor.visitTriggerEvent(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class InterfaceDeclarationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public INTERFACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.INTERFACE, 0)!;
    }
    public id(): IdContext {
        return this.getRuleContext(0, IdContext)!;
    }
    public interfaceBody(): InterfaceBodyContext {
        return this.getRuleContext(0, InterfaceBodyContext)!;
    }
    public modifier(): ModifierContext[];
    public modifier(i: number): ModifierContext | null;
    public modifier(i?: number): ModifierContext[] | ModifierContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ModifierContext);
        }

        return this.getRuleContext(i, ModifierContext);
    }
    public EXTENDS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.EXTENDS, 0);
    }
    public typeList(): TypeListContext | null {
        return this.getRuleContext(0, TypeListContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_interfaceDeclaration;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterInterfaceDeclaration) {
             listener.enterInterfaceDeclaration(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitInterfaceDeclaration) {
             listener.exitInterfaceDeclaration(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitInterfaceDeclaration) {
            return visitor.visitInterfaceDeclaration(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TypeListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public typeRef(): TypeRefContext[];
    public typeRef(i: number): TypeRefContext | null;
    public typeRef(i?: number): TypeRefContext[] | TypeRefContext | null {
        if (i === undefined) {
            return this.getRuleContexts(TypeRefContext);
        }

        return this.getRuleContext(i, TypeRefContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_typeList;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterTypeList) {
             listener.enterTypeList(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitTypeList) {
             listener.exitTypeList(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitTypeList) {
            return visitor.visitTypeList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ClassBodyContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.LBRACE, 0)!;
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.RBRACE, 0)!;
    }
    public classBodyDeclaration(): ClassBodyDeclarationContext[];
    public classBodyDeclaration(i: number): ClassBodyDeclarationContext | null;
    public classBodyDeclaration(i?: number): ClassBodyDeclarationContext[] | ClassBodyDeclarationContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ClassBodyDeclarationContext);
        }

        return this.getRuleContext(i, ClassBodyDeclarationContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_classBody;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterClassBody) {
             listener.enterClassBody(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitClassBody) {
             listener.exitClassBody(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitClassBody) {
            return visitor.visitClassBody(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class InterfaceBodyContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.LBRACE, 0)!;
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.RBRACE, 0)!;
    }
    public interfaceMethodDeclaration(): InterfaceMethodDeclarationContext[];
    public interfaceMethodDeclaration(i: number): InterfaceMethodDeclarationContext | null;
    public interfaceMethodDeclaration(i?: number): InterfaceMethodDeclarationContext[] | InterfaceMethodDeclarationContext | null {
        if (i === undefined) {
            return this.getRuleContexts(InterfaceMethodDeclarationContext);
        }

        return this.getRuleContext(i, InterfaceMethodDeclarationContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_interfaceBody;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterInterfaceBody) {
             listener.enterInterfaceBody(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitInterfaceBody) {
             listener.exitInterfaceBody(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitInterfaceBody) {
            return visitor.visitInterfaceBody(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ClassBodyDeclarationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SEMI(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SEMI, 0);
    }
    public block(): BlockContext | null {
        return this.getRuleContext(0, BlockContext);
    }
    public STATIC(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.STATIC, 0);
    }
    public memberDeclaration(): MemberDeclarationContext | null {
        return this.getRuleContext(0, MemberDeclarationContext);
    }
    public modifier(): ModifierContext[];
    public modifier(i: number): ModifierContext | null;
    public modifier(i?: number): ModifierContext[] | ModifierContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ModifierContext);
        }

        return this.getRuleContext(i, ModifierContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_classBodyDeclaration;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterClassBodyDeclaration) {
             listener.enterClassBodyDeclaration(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitClassBodyDeclaration) {
             listener.exitClassBodyDeclaration(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitClassBodyDeclaration) {
            return visitor.visitClassBodyDeclaration(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ModifierContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public annotation(): AnnotationContext | null {
        return this.getRuleContext(0, AnnotationContext);
    }
    public GLOBAL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.GLOBAL, 0);
    }
    public PUBLIC(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.PUBLIC, 0);
    }
    public PROTECTED(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.PROTECTED, 0);
    }
    public PRIVATE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.PRIVATE, 0);
    }
    public TRANSIENT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TRANSIENT, 0);
    }
    public STATIC(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.STATIC, 0);
    }
    public ABSTRACT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ABSTRACT, 0);
    }
    public FINAL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FINAL, 0);
    }
    public WEBSERVICE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.WEBSERVICE, 0);
    }
    public OVERRIDE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.OVERRIDE, 0);
    }
    public VIRTUAL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.VIRTUAL, 0);
    }
    public TESTMETHOD(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TESTMETHOD, 0);
    }
    public WITH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.WITH, 0);
    }
    public SHARING(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SHARING, 0);
    }
    public WITHOUT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.WITHOUT, 0);
    }
    public INHERITED(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.INHERITED, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_modifier;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterModifier) {
             listener.enterModifier(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitModifier) {
             listener.exitModifier(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitModifier) {
            return visitor.visitModifier(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class MemberDeclarationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public methodDeclaration(): MethodDeclarationContext | null {
        return this.getRuleContext(0, MethodDeclarationContext);
    }
    public fieldDeclaration(): FieldDeclarationContext | null {
        return this.getRuleContext(0, FieldDeclarationContext);
    }
    public constructorDeclaration(): ConstructorDeclarationContext | null {
        return this.getRuleContext(0, ConstructorDeclarationContext);
    }
    public interfaceDeclaration(): InterfaceDeclarationContext | null {
        return this.getRuleContext(0, InterfaceDeclarationContext);
    }
    public classDeclaration(): ClassDeclarationContext | null {
        return this.getRuleContext(0, ClassDeclarationContext);
    }
    public enumDeclaration(): EnumDeclarationContext | null {
        return this.getRuleContext(0, EnumDeclarationContext);
    }
    public propertyDeclaration(): PropertyDeclarationContext | null {
        return this.getRuleContext(0, PropertyDeclarationContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_memberDeclaration;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterMemberDeclaration) {
             listener.enterMemberDeclaration(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitMemberDeclaration) {
             listener.exitMemberDeclaration(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitMemberDeclaration) {
            return visitor.visitMemberDeclaration(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class MethodDeclarationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public id(): IdContext {
        return this.getRuleContext(0, IdContext)!;
    }
    public formalParameters(): FormalParametersContext {
        return this.getRuleContext(0, FormalParametersContext)!;
    }
    public typeRef(): TypeRefContext | null {
        return this.getRuleContext(0, TypeRefContext);
    }
    public VOID(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.VOID, 0);
    }
    public block(): BlockContext | null {
        return this.getRuleContext(0, BlockContext);
    }
    public SEMI(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SEMI, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_methodDeclaration;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterMethodDeclaration) {
             listener.enterMethodDeclaration(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitMethodDeclaration) {
             listener.exitMethodDeclaration(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitMethodDeclaration) {
            return visitor.visitMethodDeclaration(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ConstructorDeclarationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public qualifiedName(): QualifiedNameContext {
        return this.getRuleContext(0, QualifiedNameContext)!;
    }
    public formalParameters(): FormalParametersContext {
        return this.getRuleContext(0, FormalParametersContext)!;
    }
    public block(): BlockContext {
        return this.getRuleContext(0, BlockContext)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_constructorDeclaration;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterConstructorDeclaration) {
             listener.enterConstructorDeclaration(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitConstructorDeclaration) {
             listener.exitConstructorDeclaration(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitConstructorDeclaration) {
            return visitor.visitConstructorDeclaration(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FieldDeclarationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public typeRef(): TypeRefContext {
        return this.getRuleContext(0, TypeRefContext)!;
    }
    public variableDeclarators(): VariableDeclaratorsContext {
        return this.getRuleContext(0, VariableDeclaratorsContext)!;
    }
    public SEMI(): antlr.TerminalNode {
        return this.getToken(ApexParser.SEMI, 0)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_fieldDeclaration;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterFieldDeclaration) {
             listener.enterFieldDeclaration(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitFieldDeclaration) {
             listener.exitFieldDeclaration(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitFieldDeclaration) {
            return visitor.visitFieldDeclaration(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class PropertyDeclarationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public typeRef(): TypeRefContext {
        return this.getRuleContext(0, TypeRefContext)!;
    }
    public id(): IdContext {
        return this.getRuleContext(0, IdContext)!;
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.LBRACE, 0)!;
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.RBRACE, 0)!;
    }
    public propertyBlock(): PropertyBlockContext[];
    public propertyBlock(i: number): PropertyBlockContext | null;
    public propertyBlock(i?: number): PropertyBlockContext[] | PropertyBlockContext | null {
        if (i === undefined) {
            return this.getRuleContexts(PropertyBlockContext);
        }

        return this.getRuleContext(i, PropertyBlockContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_propertyDeclaration;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterPropertyDeclaration) {
             listener.enterPropertyDeclaration(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitPropertyDeclaration) {
             listener.exitPropertyDeclaration(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitPropertyDeclaration) {
            return visitor.visitPropertyDeclaration(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class InterfaceMethodDeclarationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public id(): IdContext {
        return this.getRuleContext(0, IdContext)!;
    }
    public formalParameters(): FormalParametersContext {
        return this.getRuleContext(0, FormalParametersContext)!;
    }
    public SEMI(): antlr.TerminalNode {
        return this.getToken(ApexParser.SEMI, 0)!;
    }
    public typeRef(): TypeRefContext | null {
        return this.getRuleContext(0, TypeRefContext);
    }
    public VOID(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.VOID, 0);
    }
    public modifier(): ModifierContext[];
    public modifier(i: number): ModifierContext | null;
    public modifier(i?: number): ModifierContext[] | ModifierContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ModifierContext);
        }

        return this.getRuleContext(i, ModifierContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_interfaceMethodDeclaration;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterInterfaceMethodDeclaration) {
             listener.enterInterfaceMethodDeclaration(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitInterfaceMethodDeclaration) {
             listener.exitInterfaceMethodDeclaration(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitInterfaceMethodDeclaration) {
            return visitor.visitInterfaceMethodDeclaration(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class VariableDeclaratorsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public variableDeclarator(): VariableDeclaratorContext[];
    public variableDeclarator(i: number): VariableDeclaratorContext | null;
    public variableDeclarator(i?: number): VariableDeclaratorContext[] | VariableDeclaratorContext | null {
        if (i === undefined) {
            return this.getRuleContexts(VariableDeclaratorContext);
        }

        return this.getRuleContext(i, VariableDeclaratorContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_variableDeclarators;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterVariableDeclarators) {
             listener.enterVariableDeclarators(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitVariableDeclarators) {
             listener.exitVariableDeclarators(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitVariableDeclarators) {
            return visitor.visitVariableDeclarators(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class VariableDeclaratorContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public id(): IdContext {
        return this.getRuleContext(0, IdContext)!;
    }
    public ASSIGN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ASSIGN, 0);
    }
    public expression(): ExpressionContext | null {
        return this.getRuleContext(0, ExpressionContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_variableDeclarator;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterVariableDeclarator) {
             listener.enterVariableDeclarator(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitVariableDeclarator) {
             listener.exitVariableDeclarator(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitVariableDeclarator) {
            return visitor.visitVariableDeclarator(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ArrayInitializerContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.LBRACE, 0)!;
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.RBRACE, 0)!;
    }
    public expression(): ExpressionContext[];
    public expression(i: number): ExpressionContext | null;
    public expression(i?: number): ExpressionContext[] | ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExpressionContext);
        }

        return this.getRuleContext(i, ExpressionContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_arrayInitializer;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterArrayInitializer) {
             listener.enterArrayInitializer(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitArrayInitializer) {
             listener.exitArrayInitializer(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitArrayInitializer) {
            return visitor.visitArrayInitializer(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TypeRefContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public typeName(): TypeNameContext[];
    public typeName(i: number): TypeNameContext | null;
    public typeName(i?: number): TypeNameContext[] | TypeNameContext | null {
        if (i === undefined) {
            return this.getRuleContexts(TypeNameContext);
        }

        return this.getRuleContext(i, TypeNameContext);
    }
    public arraySubscripts(): ArraySubscriptsContext {
        return this.getRuleContext(0, ArraySubscriptsContext)!;
    }
    public DOT(): antlr.TerminalNode[];
    public DOT(i: number): antlr.TerminalNode | null;
    public DOT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.DOT);
        } else {
            return this.getToken(ApexParser.DOT, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_typeRef;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterTypeRef) {
             listener.enterTypeRef(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitTypeRef) {
             listener.exitTypeRef(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitTypeRef) {
            return visitor.visitTypeRef(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ArraySubscriptsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LBRACK(): antlr.TerminalNode[];
    public LBRACK(i: number): antlr.TerminalNode | null;
    public LBRACK(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.LBRACK);
        } else {
            return this.getToken(ApexParser.LBRACK, i);
        }
    }
    public RBRACK(): antlr.TerminalNode[];
    public RBRACK(i: number): antlr.TerminalNode | null;
    public RBRACK(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.RBRACK);
        } else {
            return this.getToken(ApexParser.RBRACK, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_arraySubscripts;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterArraySubscripts) {
             listener.enterArraySubscripts(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitArraySubscripts) {
             listener.exitArraySubscripts(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitArraySubscripts) {
            return visitor.visitArraySubscripts(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TypeNameContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LIST(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LIST, 0);
    }
    public typeArguments(): TypeArgumentsContext | null {
        return this.getRuleContext(0, TypeArgumentsContext);
    }
    public SET(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SET, 0);
    }
    public MAP(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.MAP, 0);
    }
    public id(): IdContext | null {
        return this.getRuleContext(0, IdContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_typeName;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterTypeName) {
             listener.enterTypeName(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitTypeName) {
             listener.exitTypeName(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitTypeName) {
            return visitor.visitTypeName(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TypeArgumentsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LT(): antlr.TerminalNode {
        return this.getToken(ApexParser.LT, 0)!;
    }
    public typeList(): TypeListContext {
        return this.getRuleContext(0, TypeListContext)!;
    }
    public GT(): antlr.TerminalNode {
        return this.getToken(ApexParser.GT, 0)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_typeArguments;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterTypeArguments) {
             listener.enterTypeArguments(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitTypeArguments) {
             listener.exitTypeArguments(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitTypeArguments) {
            return visitor.visitTypeArguments(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FormalParametersContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.LPAREN, 0)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.RPAREN, 0)!;
    }
    public formalParameterList(): FormalParameterListContext | null {
        return this.getRuleContext(0, FormalParameterListContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_formalParameters;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterFormalParameters) {
             listener.enterFormalParameters(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitFormalParameters) {
             listener.exitFormalParameters(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitFormalParameters) {
            return visitor.visitFormalParameters(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FormalParameterListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public formalParameter(): FormalParameterContext[];
    public formalParameter(i: number): FormalParameterContext | null;
    public formalParameter(i?: number): FormalParameterContext[] | FormalParameterContext | null {
        if (i === undefined) {
            return this.getRuleContexts(FormalParameterContext);
        }

        return this.getRuleContext(i, FormalParameterContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_formalParameterList;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterFormalParameterList) {
             listener.enterFormalParameterList(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitFormalParameterList) {
             listener.exitFormalParameterList(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitFormalParameterList) {
            return visitor.visitFormalParameterList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FormalParameterContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public typeRef(): TypeRefContext {
        return this.getRuleContext(0, TypeRefContext)!;
    }
    public id(): IdContext {
        return this.getRuleContext(0, IdContext)!;
    }
    public modifier(): ModifierContext[];
    public modifier(i: number): ModifierContext | null;
    public modifier(i?: number): ModifierContext[] | ModifierContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ModifierContext);
        }

        return this.getRuleContext(i, ModifierContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_formalParameter;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterFormalParameter) {
             listener.enterFormalParameter(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitFormalParameter) {
             listener.exitFormalParameter(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitFormalParameter) {
            return visitor.visitFormalParameter(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class QualifiedNameContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public id(): IdContext[];
    public id(i: number): IdContext | null;
    public id(i?: number): IdContext[] | IdContext | null {
        if (i === undefined) {
            return this.getRuleContexts(IdContext);
        }

        return this.getRuleContext(i, IdContext);
    }
    public DOT(): antlr.TerminalNode[];
    public DOT(i: number): antlr.TerminalNode | null;
    public DOT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.DOT);
        } else {
            return this.getToken(ApexParser.DOT, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_qualifiedName;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterQualifiedName) {
             listener.enterQualifiedName(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitQualifiedName) {
             listener.exitQualifiedName(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitQualifiedName) {
            return visitor.visitQualifiedName(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LiteralContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IntegerLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.IntegerLiteral, 0);
    }
    public LongLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LongLiteral, 0);
    }
    public NumberLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NumberLiteral, 0);
    }
    public StringLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.StringLiteral, 0);
    }
    public BooleanLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.BooleanLiteral, 0);
    }
    public NULL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NULL, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_literal;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterLiteral) {
             listener.enterLiteral(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitLiteral) {
             listener.exitLiteral(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitLiteral) {
            return visitor.visitLiteral(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class AnnotationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ATSIGN(): antlr.TerminalNode {
        return this.getToken(ApexParser.ATSIGN, 0)!;
    }
    public qualifiedName(): QualifiedNameContext {
        return this.getRuleContext(0, QualifiedNameContext)!;
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LPAREN, 0);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.RPAREN, 0);
    }
    public elementValuePairs(): ElementValuePairsContext | null {
        return this.getRuleContext(0, ElementValuePairsContext);
    }
    public elementValue(): ElementValueContext | null {
        return this.getRuleContext(0, ElementValueContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_annotation;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterAnnotation) {
             listener.enterAnnotation(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitAnnotation) {
             listener.exitAnnotation(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitAnnotation) {
            return visitor.visitAnnotation(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ElementValuePairsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public elementValuePair(): ElementValuePairContext[];
    public elementValuePair(i: number): ElementValuePairContext | null;
    public elementValuePair(i?: number): ElementValuePairContext[] | ElementValuePairContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ElementValuePairContext);
        }

        return this.getRuleContext(i, ElementValuePairContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_elementValuePairs;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterElementValuePairs) {
             listener.enterElementValuePairs(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitElementValuePairs) {
             listener.exitElementValuePairs(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitElementValuePairs) {
            return visitor.visitElementValuePairs(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ElementValuePairContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public id(): IdContext {
        return this.getRuleContext(0, IdContext)!;
    }
    public ASSIGN(): antlr.TerminalNode {
        return this.getToken(ApexParser.ASSIGN, 0)!;
    }
    public elementValue(): ElementValueContext {
        return this.getRuleContext(0, ElementValueContext)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_elementValuePair;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterElementValuePair) {
             listener.enterElementValuePair(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitElementValuePair) {
             listener.exitElementValuePair(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitElementValuePair) {
            return visitor.visitElementValuePair(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ElementValueContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public expression(): ExpressionContext | null {
        return this.getRuleContext(0, ExpressionContext);
    }
    public annotation(): AnnotationContext | null {
        return this.getRuleContext(0, AnnotationContext);
    }
    public elementValueArrayInitializer(): ElementValueArrayInitializerContext | null {
        return this.getRuleContext(0, ElementValueArrayInitializerContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_elementValue;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterElementValue) {
             listener.enterElementValue(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitElementValue) {
             listener.exitElementValue(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitElementValue) {
            return visitor.visitElementValue(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ElementValueArrayInitializerContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.LBRACE, 0)!;
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.RBRACE, 0)!;
    }
    public elementValue(): ElementValueContext[];
    public elementValue(i: number): ElementValueContext | null;
    public elementValue(i?: number): ElementValueContext[] | ElementValueContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ElementValueContext);
        }

        return this.getRuleContext(i, ElementValueContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_elementValueArrayInitializer;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterElementValueArrayInitializer) {
             listener.enterElementValueArrayInitializer(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitElementValueArrayInitializer) {
             listener.exitElementValueArrayInitializer(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitElementValueArrayInitializer) {
            return visitor.visitElementValueArrayInitializer(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class BlockContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.LBRACE, 0)!;
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.RBRACE, 0)!;
    }
    public statement(): StatementContext[];
    public statement(i: number): StatementContext | null;
    public statement(i?: number): StatementContext[] | StatementContext | null {
        if (i === undefined) {
            return this.getRuleContexts(StatementContext);
        }

        return this.getRuleContext(i, StatementContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_block;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterBlock) {
             listener.enterBlock(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitBlock) {
             listener.exitBlock(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitBlock) {
            return visitor.visitBlock(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LocalVariableDeclarationStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public localVariableDeclaration(): LocalVariableDeclarationContext {
        return this.getRuleContext(0, LocalVariableDeclarationContext)!;
    }
    public SEMI(): antlr.TerminalNode {
        return this.getToken(ApexParser.SEMI, 0)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_localVariableDeclarationStatement;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterLocalVariableDeclarationStatement) {
             listener.enterLocalVariableDeclarationStatement(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitLocalVariableDeclarationStatement) {
             listener.exitLocalVariableDeclarationStatement(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitLocalVariableDeclarationStatement) {
            return visitor.visitLocalVariableDeclarationStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LocalVariableDeclarationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public typeRef(): TypeRefContext {
        return this.getRuleContext(0, TypeRefContext)!;
    }
    public variableDeclarators(): VariableDeclaratorsContext {
        return this.getRuleContext(0, VariableDeclaratorsContext)!;
    }
    public modifier(): ModifierContext[];
    public modifier(i: number): ModifierContext | null;
    public modifier(i?: number): ModifierContext[] | ModifierContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ModifierContext);
        }

        return this.getRuleContext(i, ModifierContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_localVariableDeclaration;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterLocalVariableDeclaration) {
             listener.enterLocalVariableDeclaration(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitLocalVariableDeclaration) {
             listener.exitLocalVariableDeclaration(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitLocalVariableDeclaration) {
            return visitor.visitLocalVariableDeclaration(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class StatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public block(): BlockContext | null {
        return this.getRuleContext(0, BlockContext);
    }
    public ifStatement(): IfStatementContext | null {
        return this.getRuleContext(0, IfStatementContext);
    }
    public switchStatement(): SwitchStatementContext | null {
        return this.getRuleContext(0, SwitchStatementContext);
    }
    public forStatement(): ForStatementContext | null {
        return this.getRuleContext(0, ForStatementContext);
    }
    public whileStatement(): WhileStatementContext | null {
        return this.getRuleContext(0, WhileStatementContext);
    }
    public doWhileStatement(): DoWhileStatementContext | null {
        return this.getRuleContext(0, DoWhileStatementContext);
    }
    public tryStatement(): TryStatementContext | null {
        return this.getRuleContext(0, TryStatementContext);
    }
    public returnStatement(): ReturnStatementContext | null {
        return this.getRuleContext(0, ReturnStatementContext);
    }
    public throwStatement(): ThrowStatementContext | null {
        return this.getRuleContext(0, ThrowStatementContext);
    }
    public breakStatement(): BreakStatementContext | null {
        return this.getRuleContext(0, BreakStatementContext);
    }
    public continueStatement(): ContinueStatementContext | null {
        return this.getRuleContext(0, ContinueStatementContext);
    }
    public insertStatement(): InsertStatementContext | null {
        return this.getRuleContext(0, InsertStatementContext);
    }
    public updateStatement(): UpdateStatementContext | null {
        return this.getRuleContext(0, UpdateStatementContext);
    }
    public deleteStatement(): DeleteStatementContext | null {
        return this.getRuleContext(0, DeleteStatementContext);
    }
    public undeleteStatement(): UndeleteStatementContext | null {
        return this.getRuleContext(0, UndeleteStatementContext);
    }
    public upsertStatement(): UpsertStatementContext | null {
        return this.getRuleContext(0, UpsertStatementContext);
    }
    public mergeStatement(): MergeStatementContext | null {
        return this.getRuleContext(0, MergeStatementContext);
    }
    public runAsStatement(): RunAsStatementContext | null {
        return this.getRuleContext(0, RunAsStatementContext);
    }
    public localVariableDeclarationStatement(): LocalVariableDeclarationStatementContext | null {
        return this.getRuleContext(0, LocalVariableDeclarationStatementContext);
    }
    public expressionStatement(): ExpressionStatementContext | null {
        return this.getRuleContext(0, ExpressionStatementContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_statement;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterStatement) {
             listener.enterStatement(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitStatement) {
             listener.exitStatement(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitStatement) {
            return visitor.visitStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class IfStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IF(): antlr.TerminalNode {
        return this.getToken(ApexParser.IF, 0)!;
    }
    public parExpression(): ParExpressionContext {
        return this.getRuleContext(0, ParExpressionContext)!;
    }
    public statement(): StatementContext[];
    public statement(i: number): StatementContext | null;
    public statement(i?: number): StatementContext[] | StatementContext | null {
        if (i === undefined) {
            return this.getRuleContexts(StatementContext);
        }

        return this.getRuleContext(i, StatementContext);
    }
    public ELSE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ELSE, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_ifStatement;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterIfStatement) {
             listener.enterIfStatement(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitIfStatement) {
             listener.exitIfStatement(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitIfStatement) {
            return visitor.visitIfStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SwitchStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SWITCH(): antlr.TerminalNode {
        return this.getToken(ApexParser.SWITCH, 0)!;
    }
    public ON(): antlr.TerminalNode {
        return this.getToken(ApexParser.ON, 0)!;
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.LBRACE, 0)!;
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.RBRACE, 0)!;
    }
    public whenControl(): WhenControlContext[];
    public whenControl(i: number): WhenControlContext | null;
    public whenControl(i?: number): WhenControlContext[] | WhenControlContext | null {
        if (i === undefined) {
            return this.getRuleContexts(WhenControlContext);
        }

        return this.getRuleContext(i, WhenControlContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_switchStatement;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSwitchStatement) {
             listener.enterSwitchStatement(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSwitchStatement) {
             listener.exitSwitchStatement(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSwitchStatement) {
            return visitor.visitSwitchStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class WhenControlContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public WHEN(): antlr.TerminalNode {
        return this.getToken(ApexParser.WHEN, 0)!;
    }
    public whenValue(): WhenValueContext {
        return this.getRuleContext(0, WhenValueContext)!;
    }
    public block(): BlockContext {
        return this.getRuleContext(0, BlockContext)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_whenControl;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterWhenControl) {
             listener.enterWhenControl(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitWhenControl) {
             listener.exitWhenControl(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitWhenControl) {
            return visitor.visitWhenControl(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class WhenValueContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ELSE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ELSE, 0);
    }
    public whenLiteral(): WhenLiteralContext[];
    public whenLiteral(i: number): WhenLiteralContext | null;
    public whenLiteral(i?: number): WhenLiteralContext[] | WhenLiteralContext | null {
        if (i === undefined) {
            return this.getRuleContexts(WhenLiteralContext);
        }

        return this.getRuleContext(i, WhenLiteralContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public id(): IdContext[];
    public id(i: number): IdContext | null;
    public id(i?: number): IdContext[] | IdContext | null {
        if (i === undefined) {
            return this.getRuleContexts(IdContext);
        }

        return this.getRuleContext(i, IdContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_whenValue;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterWhenValue) {
             listener.enterWhenValue(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitWhenValue) {
             listener.exitWhenValue(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitWhenValue) {
            return visitor.visitWhenValue(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class WhenLiteralContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IntegerLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.IntegerLiteral, 0);
    }
    public SUB(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SUB, 0);
    }
    public LongLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LongLiteral, 0);
    }
    public StringLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.StringLiteral, 0);
    }
    public NULL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NULL, 0);
    }
    public id(): IdContext | null {
        return this.getRuleContext(0, IdContext);
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LPAREN, 0);
    }
    public whenLiteral(): WhenLiteralContext | null {
        return this.getRuleContext(0, WhenLiteralContext);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.RPAREN, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_whenLiteral;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterWhenLiteral) {
             listener.enterWhenLiteral(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitWhenLiteral) {
             listener.exitWhenLiteral(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitWhenLiteral) {
            return visitor.visitWhenLiteral(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ForStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public FOR(): antlr.TerminalNode {
        return this.getToken(ApexParser.FOR, 0)!;
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.LPAREN, 0)!;
    }
    public forControl(): ForControlContext {
        return this.getRuleContext(0, ForControlContext)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.RPAREN, 0)!;
    }
    public statement(): StatementContext | null {
        return this.getRuleContext(0, StatementContext);
    }
    public SEMI(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SEMI, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_forStatement;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterForStatement) {
             listener.enterForStatement(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitForStatement) {
             listener.exitForStatement(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitForStatement) {
            return visitor.visitForStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class WhileStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public WHILE(): antlr.TerminalNode {
        return this.getToken(ApexParser.WHILE, 0)!;
    }
    public parExpression(): ParExpressionContext {
        return this.getRuleContext(0, ParExpressionContext)!;
    }
    public statement(): StatementContext | null {
        return this.getRuleContext(0, StatementContext);
    }
    public SEMI(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SEMI, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_whileStatement;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterWhileStatement) {
             listener.enterWhileStatement(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitWhileStatement) {
             listener.exitWhileStatement(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitWhileStatement) {
            return visitor.visitWhileStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class DoWhileStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public DO(): antlr.TerminalNode {
        return this.getToken(ApexParser.DO, 0)!;
    }
    public statement(): StatementContext {
        return this.getRuleContext(0, StatementContext)!;
    }
    public WHILE(): antlr.TerminalNode {
        return this.getToken(ApexParser.WHILE, 0)!;
    }
    public parExpression(): ParExpressionContext {
        return this.getRuleContext(0, ParExpressionContext)!;
    }
    public SEMI(): antlr.TerminalNode {
        return this.getToken(ApexParser.SEMI, 0)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_doWhileStatement;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterDoWhileStatement) {
             listener.enterDoWhileStatement(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitDoWhileStatement) {
             listener.exitDoWhileStatement(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitDoWhileStatement) {
            return visitor.visitDoWhileStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TryStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TRY(): antlr.TerminalNode {
        return this.getToken(ApexParser.TRY, 0)!;
    }
    public block(): BlockContext {
        return this.getRuleContext(0, BlockContext)!;
    }
    public finallyBlock(): FinallyBlockContext | null {
        return this.getRuleContext(0, FinallyBlockContext);
    }
    public catchClause(): CatchClauseContext[];
    public catchClause(i: number): CatchClauseContext | null;
    public catchClause(i?: number): CatchClauseContext[] | CatchClauseContext | null {
        if (i === undefined) {
            return this.getRuleContexts(CatchClauseContext);
        }

        return this.getRuleContext(i, CatchClauseContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_tryStatement;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterTryStatement) {
             listener.enterTryStatement(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitTryStatement) {
             listener.exitTryStatement(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitTryStatement) {
            return visitor.visitTryStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ReturnStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public RETURN(): antlr.TerminalNode {
        return this.getToken(ApexParser.RETURN, 0)!;
    }
    public SEMI(): antlr.TerminalNode {
        return this.getToken(ApexParser.SEMI, 0)!;
    }
    public expression(): ExpressionContext | null {
        return this.getRuleContext(0, ExpressionContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_returnStatement;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterReturnStatement) {
             listener.enterReturnStatement(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitReturnStatement) {
             listener.exitReturnStatement(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitReturnStatement) {
            return visitor.visitReturnStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ThrowStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public THROW(): antlr.TerminalNode {
        return this.getToken(ApexParser.THROW, 0)!;
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public SEMI(): antlr.TerminalNode {
        return this.getToken(ApexParser.SEMI, 0)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_throwStatement;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterThrowStatement) {
             listener.enterThrowStatement(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitThrowStatement) {
             listener.exitThrowStatement(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitThrowStatement) {
            return visitor.visitThrowStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class BreakStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public BREAK(): antlr.TerminalNode {
        return this.getToken(ApexParser.BREAK, 0)!;
    }
    public SEMI(): antlr.TerminalNode {
        return this.getToken(ApexParser.SEMI, 0)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_breakStatement;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterBreakStatement) {
             listener.enterBreakStatement(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitBreakStatement) {
             listener.exitBreakStatement(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitBreakStatement) {
            return visitor.visitBreakStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ContinueStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public CONTINUE(): antlr.TerminalNode {
        return this.getToken(ApexParser.CONTINUE, 0)!;
    }
    public SEMI(): antlr.TerminalNode {
        return this.getToken(ApexParser.SEMI, 0)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_continueStatement;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterContinueStatement) {
             listener.enterContinueStatement(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitContinueStatement) {
             listener.exitContinueStatement(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitContinueStatement) {
            return visitor.visitContinueStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class AccessLevelContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public AS(): antlr.TerminalNode {
        return this.getToken(ApexParser.AS, 0)!;
    }
    public SYSTEM(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SYSTEM, 0);
    }
    public USER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.USER, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_accessLevel;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterAccessLevel) {
             listener.enterAccessLevel(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitAccessLevel) {
             listener.exitAccessLevel(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitAccessLevel) {
            return visitor.visitAccessLevel(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class InsertStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public INSERT(): antlr.TerminalNode {
        return this.getToken(ApexParser.INSERT, 0)!;
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public SEMI(): antlr.TerminalNode {
        return this.getToken(ApexParser.SEMI, 0)!;
    }
    public accessLevel(): AccessLevelContext | null {
        return this.getRuleContext(0, AccessLevelContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_insertStatement;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterInsertStatement) {
             listener.enterInsertStatement(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitInsertStatement) {
             listener.exitInsertStatement(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitInsertStatement) {
            return visitor.visitInsertStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class UpdateStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public UPDATE(): antlr.TerminalNode {
        return this.getToken(ApexParser.UPDATE, 0)!;
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public SEMI(): antlr.TerminalNode {
        return this.getToken(ApexParser.SEMI, 0)!;
    }
    public accessLevel(): AccessLevelContext | null {
        return this.getRuleContext(0, AccessLevelContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_updateStatement;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterUpdateStatement) {
             listener.enterUpdateStatement(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitUpdateStatement) {
             listener.exitUpdateStatement(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitUpdateStatement) {
            return visitor.visitUpdateStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class DeleteStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public DELETE(): antlr.TerminalNode {
        return this.getToken(ApexParser.DELETE, 0)!;
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public SEMI(): antlr.TerminalNode {
        return this.getToken(ApexParser.SEMI, 0)!;
    }
    public accessLevel(): AccessLevelContext | null {
        return this.getRuleContext(0, AccessLevelContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_deleteStatement;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterDeleteStatement) {
             listener.enterDeleteStatement(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitDeleteStatement) {
             listener.exitDeleteStatement(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitDeleteStatement) {
            return visitor.visitDeleteStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class UndeleteStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public UNDELETE(): antlr.TerminalNode {
        return this.getToken(ApexParser.UNDELETE, 0)!;
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public SEMI(): antlr.TerminalNode {
        return this.getToken(ApexParser.SEMI, 0)!;
    }
    public accessLevel(): AccessLevelContext | null {
        return this.getRuleContext(0, AccessLevelContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_undeleteStatement;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterUndeleteStatement) {
             listener.enterUndeleteStatement(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitUndeleteStatement) {
             listener.exitUndeleteStatement(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitUndeleteStatement) {
            return visitor.visitUndeleteStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class UpsertStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public UPSERT(): antlr.TerminalNode {
        return this.getToken(ApexParser.UPSERT, 0)!;
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public SEMI(): antlr.TerminalNode {
        return this.getToken(ApexParser.SEMI, 0)!;
    }
    public accessLevel(): AccessLevelContext | null {
        return this.getRuleContext(0, AccessLevelContext);
    }
    public qualifiedName(): QualifiedNameContext | null {
        return this.getRuleContext(0, QualifiedNameContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_upsertStatement;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterUpsertStatement) {
             listener.enterUpsertStatement(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitUpsertStatement) {
             listener.exitUpsertStatement(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitUpsertStatement) {
            return visitor.visitUpsertStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class MergeStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public MERGE(): antlr.TerminalNode {
        return this.getToken(ApexParser.MERGE, 0)!;
    }
    public expression(): ExpressionContext[];
    public expression(i: number): ExpressionContext | null;
    public expression(i?: number): ExpressionContext[] | ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExpressionContext);
        }

        return this.getRuleContext(i, ExpressionContext);
    }
    public SEMI(): antlr.TerminalNode {
        return this.getToken(ApexParser.SEMI, 0)!;
    }
    public accessLevel(): AccessLevelContext | null {
        return this.getRuleContext(0, AccessLevelContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_mergeStatement;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterMergeStatement) {
             listener.enterMergeStatement(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitMergeStatement) {
             listener.exitMergeStatement(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitMergeStatement) {
            return visitor.visitMergeStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class RunAsStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SYSTEMRUNAS(): antlr.TerminalNode {
        return this.getToken(ApexParser.SYSTEMRUNAS, 0)!;
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.LPAREN, 0)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.RPAREN, 0)!;
    }
    public block(): BlockContext {
        return this.getRuleContext(0, BlockContext)!;
    }
    public expressionList(): ExpressionListContext | null {
        return this.getRuleContext(0, ExpressionListContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_runAsStatement;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterRunAsStatement) {
             listener.enterRunAsStatement(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitRunAsStatement) {
             listener.exitRunAsStatement(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitRunAsStatement) {
            return visitor.visitRunAsStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ExpressionStatementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public SEMI(): antlr.TerminalNode {
        return this.getToken(ApexParser.SEMI, 0)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_expressionStatement;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterExpressionStatement) {
             listener.enterExpressionStatement(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitExpressionStatement) {
             listener.exitExpressionStatement(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitExpressionStatement) {
            return visitor.visitExpressionStatement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class PropertyBlockContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public getter(): GetterContext | null {
        return this.getRuleContext(0, GetterContext);
    }
    public setter(): SetterContext | null {
        return this.getRuleContext(0, SetterContext);
    }
    public modifier(): ModifierContext[];
    public modifier(i: number): ModifierContext | null;
    public modifier(i?: number): ModifierContext[] | ModifierContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ModifierContext);
        }

        return this.getRuleContext(i, ModifierContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_propertyBlock;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterPropertyBlock) {
             listener.enterPropertyBlock(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitPropertyBlock) {
             listener.exitPropertyBlock(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitPropertyBlock) {
            return visitor.visitPropertyBlock(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class GetterContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public GET(): antlr.TerminalNode {
        return this.getToken(ApexParser.GET, 0)!;
    }
    public SEMI(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SEMI, 0);
    }
    public block(): BlockContext | null {
        return this.getRuleContext(0, BlockContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_getter;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterGetter) {
             listener.enterGetter(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitGetter) {
             listener.exitGetter(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitGetter) {
            return visitor.visitGetter(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SetterContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SET(): antlr.TerminalNode {
        return this.getToken(ApexParser.SET, 0)!;
    }
    public SEMI(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SEMI, 0);
    }
    public block(): BlockContext | null {
        return this.getRuleContext(0, BlockContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_setter;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSetter) {
             listener.enterSetter(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSetter) {
             listener.exitSetter(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSetter) {
            return visitor.visitSetter(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class CatchClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public CATCH(): antlr.TerminalNode {
        return this.getToken(ApexParser.CATCH, 0)!;
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.LPAREN, 0)!;
    }
    public qualifiedName(): QualifiedNameContext {
        return this.getRuleContext(0, QualifiedNameContext)!;
    }
    public id(): IdContext {
        return this.getRuleContext(0, IdContext)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.RPAREN, 0)!;
    }
    public block(): BlockContext {
        return this.getRuleContext(0, BlockContext)!;
    }
    public modifier(): ModifierContext[];
    public modifier(i: number): ModifierContext | null;
    public modifier(i?: number): ModifierContext[] | ModifierContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ModifierContext);
        }

        return this.getRuleContext(i, ModifierContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_catchClause;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterCatchClause) {
             listener.enterCatchClause(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitCatchClause) {
             listener.exitCatchClause(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitCatchClause) {
            return visitor.visitCatchClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FinallyBlockContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public FINALLY(): antlr.TerminalNode {
        return this.getToken(ApexParser.FINALLY, 0)!;
    }
    public block(): BlockContext {
        return this.getRuleContext(0, BlockContext)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_finallyBlock;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterFinallyBlock) {
             listener.enterFinallyBlock(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitFinallyBlock) {
             listener.exitFinallyBlock(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitFinallyBlock) {
            return visitor.visitFinallyBlock(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ForControlContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public enhancedForControl(): EnhancedForControlContext | null {
        return this.getRuleContext(0, EnhancedForControlContext);
    }
    public SEMI(): antlr.TerminalNode[];
    public SEMI(i: number): antlr.TerminalNode | null;
    public SEMI(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.SEMI);
        } else {
            return this.getToken(ApexParser.SEMI, i);
        }
    }
    public forInit(): ForInitContext | null {
        return this.getRuleContext(0, ForInitContext);
    }
    public expression(): ExpressionContext | null {
        return this.getRuleContext(0, ExpressionContext);
    }
    public forUpdate(): ForUpdateContext | null {
        return this.getRuleContext(0, ForUpdateContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_forControl;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterForControl) {
             listener.enterForControl(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitForControl) {
             listener.exitForControl(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitForControl) {
            return visitor.visitForControl(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ForInitContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public localVariableDeclaration(): LocalVariableDeclarationContext | null {
        return this.getRuleContext(0, LocalVariableDeclarationContext);
    }
    public expressionList(): ExpressionListContext | null {
        return this.getRuleContext(0, ExpressionListContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_forInit;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterForInit) {
             listener.enterForInit(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitForInit) {
             listener.exitForInit(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitForInit) {
            return visitor.visitForInit(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class EnhancedForControlContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public typeRef(): TypeRefContext {
        return this.getRuleContext(0, TypeRefContext)!;
    }
    public id(): IdContext {
        return this.getRuleContext(0, IdContext)!;
    }
    public COLON(): antlr.TerminalNode {
        return this.getToken(ApexParser.COLON, 0)!;
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_enhancedForControl;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterEnhancedForControl) {
             listener.enterEnhancedForControl(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitEnhancedForControl) {
             listener.exitEnhancedForControl(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitEnhancedForControl) {
            return visitor.visitEnhancedForControl(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ForUpdateContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public expressionList(): ExpressionListContext {
        return this.getRuleContext(0, ExpressionListContext)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_forUpdate;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterForUpdate) {
             listener.enterForUpdate(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitForUpdate) {
             listener.exitForUpdate(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitForUpdate) {
            return visitor.visitForUpdate(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ParExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.LPAREN, 0)!;
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.RPAREN, 0)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_parExpression;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterParExpression) {
             listener.enterParExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitParExpression) {
             listener.exitParExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitParExpression) {
            return visitor.visitParExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ExpressionListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public expression(): ExpressionContext[];
    public expression(i: number): ExpressionContext | null;
    public expression(i?: number): ExpressionContext[] | ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExpressionContext);
        }

        return this.getRuleContext(i, ExpressionContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_expressionList;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterExpressionList) {
             listener.enterExpressionList(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitExpressionList) {
             listener.exitExpressionList(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitExpressionList) {
            return visitor.visitExpressionList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_expression;
    }
    public override copyFrom(ctx: ExpressionContext): void {
        super.copyFrom(ctx);
    }
}
export class PrimaryExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public primary(): PrimaryContext {
        return this.getRuleContext(0, PrimaryContext)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterPrimaryExpression) {
             listener.enterPrimaryExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitPrimaryExpression) {
             listener.exitPrimaryExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitPrimaryExpression) {
            return visitor.visitPrimaryExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class Arth1ExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public expression(): ExpressionContext[];
    public expression(i: number): ExpressionContext | null;
    public expression(i?: number): ExpressionContext[] | ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExpressionContext);
        }

        return this.getRuleContext(i, ExpressionContext);
    }
    public MUL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.MUL, 0);
    }
    public DIV(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DIV, 0);
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterArth1Expression) {
             listener.enterArth1Expression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitArth1Expression) {
             listener.exitArth1Expression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitArth1Expression) {
            return visitor.visitArth1Expression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class DotExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public DOT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DOT, 0);
    }
    public QUESTIONDOT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.QUESTIONDOT, 0);
    }
    public dotMethodCall(): DotMethodCallContext | null {
        return this.getRuleContext(0, DotMethodCallContext);
    }
    public anyId(): AnyIdContext | null {
        return this.getRuleContext(0, AnyIdContext);
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterDotExpression) {
             listener.enterDotExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitDotExpression) {
             listener.exitDotExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitDotExpression) {
            return visitor.visitDotExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class BitOrExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public expression(): ExpressionContext[];
    public expression(i: number): ExpressionContext | null;
    public expression(i?: number): ExpressionContext[] | ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExpressionContext);
        }

        return this.getRuleContext(i, ExpressionContext);
    }
    public BITOR(): antlr.TerminalNode {
        return this.getToken(ApexParser.BITOR, 0)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterBitOrExpression) {
             listener.enterBitOrExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitBitOrExpression) {
             listener.exitBitOrExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitBitOrExpression) {
            return visitor.visitBitOrExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class ArrayExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public expression(): ExpressionContext[];
    public expression(i: number): ExpressionContext | null;
    public expression(i?: number): ExpressionContext[] | ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExpressionContext);
        }

        return this.getRuleContext(i, ExpressionContext);
    }
    public LBRACK(): antlr.TerminalNode {
        return this.getToken(ApexParser.LBRACK, 0)!;
    }
    public RBRACK(): antlr.TerminalNode {
        return this.getToken(ApexParser.RBRACK, 0)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterArrayExpression) {
             listener.enterArrayExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitArrayExpression) {
             listener.exitArrayExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitArrayExpression) {
            return visitor.visitArrayExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class NewExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public NEW(): antlr.TerminalNode {
        return this.getToken(ApexParser.NEW, 0)!;
    }
    public creator(): CreatorContext {
        return this.getRuleContext(0, CreatorContext)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterNewExpression) {
             listener.enterNewExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitNewExpression) {
             listener.exitNewExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitNewExpression) {
            return visitor.visitNewExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class AssignExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public expression(): ExpressionContext[];
    public expression(i: number): ExpressionContext | null;
    public expression(i?: number): ExpressionContext[] | ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExpressionContext);
        }

        return this.getRuleContext(i, ExpressionContext);
    }
    public ASSIGN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ASSIGN, 0);
    }
    public ADD_ASSIGN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ADD_ASSIGN, 0);
    }
    public SUB_ASSIGN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SUB_ASSIGN, 0);
    }
    public MUL_ASSIGN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.MUL_ASSIGN, 0);
    }
    public DIV_ASSIGN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DIV_ASSIGN, 0);
    }
    public AND_ASSIGN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.AND_ASSIGN, 0);
    }
    public OR_ASSIGN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.OR_ASSIGN, 0);
    }
    public XOR_ASSIGN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.XOR_ASSIGN, 0);
    }
    public RSHIFT_ASSIGN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.RSHIFT_ASSIGN, 0);
    }
    public URSHIFT_ASSIGN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.URSHIFT_ASSIGN, 0);
    }
    public LSHIFT_ASSIGN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LSHIFT_ASSIGN, 0);
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterAssignExpression) {
             listener.enterAssignExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitAssignExpression) {
             listener.exitAssignExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitAssignExpression) {
            return visitor.visitAssignExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class MethodCallExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public methodCall(): MethodCallContext {
        return this.getRuleContext(0, MethodCallContext)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterMethodCallExpression) {
             listener.enterMethodCallExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitMethodCallExpression) {
             listener.exitMethodCallExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitMethodCallExpression) {
            return visitor.visitMethodCallExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class BitNotExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public expression(): ExpressionContext[];
    public expression(i: number): ExpressionContext | null;
    public expression(i?: number): ExpressionContext[] | ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExpressionContext);
        }

        return this.getRuleContext(i, ExpressionContext);
    }
    public CARET(): antlr.TerminalNode {
        return this.getToken(ApexParser.CARET, 0)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterBitNotExpression) {
             listener.enterBitNotExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitBitNotExpression) {
             listener.exitBitNotExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitBitNotExpression) {
            return visitor.visitBitNotExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class Arth2ExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public expression(): ExpressionContext[];
    public expression(i: number): ExpressionContext | null;
    public expression(i?: number): ExpressionContext[] | ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExpressionContext);
        }

        return this.getRuleContext(i, ExpressionContext);
    }
    public ADD(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ADD, 0);
    }
    public SUB(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SUB, 0);
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterArth2Expression) {
             listener.enterArth2Expression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitArth2Expression) {
             listener.exitArth2Expression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitArth2Expression) {
            return visitor.visitArth2Expression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class LogAndExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public expression(): ExpressionContext[];
    public expression(i: number): ExpressionContext | null;
    public expression(i?: number): ExpressionContext[] | ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExpressionContext);
        }

        return this.getRuleContext(i, ExpressionContext);
    }
    public AND(): antlr.TerminalNode {
        return this.getToken(ApexParser.AND, 0)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterLogAndExpression) {
             listener.enterLogAndExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitLogAndExpression) {
             listener.exitLogAndExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitLogAndExpression) {
            return visitor.visitLogAndExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class CoalescingExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public expression(): ExpressionContext[];
    public expression(i: number): ExpressionContext | null;
    public expression(i?: number): ExpressionContext[] | ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExpressionContext);
        }

        return this.getRuleContext(i, ExpressionContext);
    }
    public DOUBLEQUESTION(): antlr.TerminalNode {
        return this.getToken(ApexParser.DOUBLEQUESTION, 0)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterCoalescingExpression) {
             listener.enterCoalescingExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitCoalescingExpression) {
             listener.exitCoalescingExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitCoalescingExpression) {
            return visitor.visitCoalescingExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class CastExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.LPAREN, 0)!;
    }
    public typeRef(): TypeRefContext {
        return this.getRuleContext(0, TypeRefContext)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.RPAREN, 0)!;
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterCastExpression) {
             listener.enterCastExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitCastExpression) {
             listener.exitCastExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitCastExpression) {
            return visitor.visitCastExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class BitAndExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public expression(): ExpressionContext[];
    public expression(i: number): ExpressionContext | null;
    public expression(i?: number): ExpressionContext[] | ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExpressionContext);
        }

        return this.getRuleContext(i, ExpressionContext);
    }
    public BITAND(): antlr.TerminalNode {
        return this.getToken(ApexParser.BITAND, 0)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterBitAndExpression) {
             listener.enterBitAndExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitBitAndExpression) {
             listener.exitBitAndExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitBitAndExpression) {
            return visitor.visitBitAndExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class CmpExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public expression(): ExpressionContext[];
    public expression(i: number): ExpressionContext | null;
    public expression(i?: number): ExpressionContext[] | ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExpressionContext);
        }

        return this.getRuleContext(i, ExpressionContext);
    }
    public GT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.GT, 0);
    }
    public LT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LT, 0);
    }
    public ASSIGN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ASSIGN, 0);
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterCmpExpression) {
             listener.enterCmpExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitCmpExpression) {
             listener.exitCmpExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitCmpExpression) {
            return visitor.visitCmpExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class BitExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public expression(): ExpressionContext[];
    public expression(i: number): ExpressionContext | null;
    public expression(i?: number): ExpressionContext[] | ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExpressionContext);
        }

        return this.getRuleContext(i, ExpressionContext);
    }
    public LT(): antlr.TerminalNode[];
    public LT(i: number): antlr.TerminalNode | null;
    public LT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.LT);
        } else {
            return this.getToken(ApexParser.LT, i);
        }
    }
    public GT(): antlr.TerminalNode[];
    public GT(i: number): antlr.TerminalNode | null;
    public GT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.GT);
        } else {
            return this.getToken(ApexParser.GT, i);
        }
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterBitExpression) {
             listener.enterBitExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitBitExpression) {
             listener.exitBitExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitBitExpression) {
            return visitor.visitBitExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class LogOrExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public expression(): ExpressionContext[];
    public expression(i: number): ExpressionContext | null;
    public expression(i?: number): ExpressionContext[] | ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExpressionContext);
        }

        return this.getRuleContext(i, ExpressionContext);
    }
    public OR(): antlr.TerminalNode {
        return this.getToken(ApexParser.OR, 0)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterLogOrExpression) {
             listener.enterLogOrExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitLogOrExpression) {
             listener.exitLogOrExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitLogOrExpression) {
            return visitor.visitLogOrExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class CondExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public expression(): ExpressionContext[];
    public expression(i: number): ExpressionContext | null;
    public expression(i?: number): ExpressionContext[] | ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExpressionContext);
        }

        return this.getRuleContext(i, ExpressionContext);
    }
    public QUESTION(): antlr.TerminalNode {
        return this.getToken(ApexParser.QUESTION, 0)!;
    }
    public COLON(): antlr.TerminalNode {
        return this.getToken(ApexParser.COLON, 0)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterCondExpression) {
             listener.enterCondExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitCondExpression) {
             listener.exitCondExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitCondExpression) {
            return visitor.visitCondExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class EqualityExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public expression(): ExpressionContext[];
    public expression(i: number): ExpressionContext | null;
    public expression(i?: number): ExpressionContext[] | ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExpressionContext);
        }

        return this.getRuleContext(i, ExpressionContext);
    }
    public TRIPLEEQUAL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TRIPLEEQUAL, 0);
    }
    public TRIPLENOTEQUAL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TRIPLENOTEQUAL, 0);
    }
    public EQUAL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.EQUAL, 0);
    }
    public NOTEQUAL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NOTEQUAL, 0);
    }
    public LESSANDGREATER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LESSANDGREATER, 0);
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterEqualityExpression) {
             listener.enterEqualityExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitEqualityExpression) {
             listener.exitEqualityExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitEqualityExpression) {
            return visitor.visitEqualityExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class PostOpExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public INC(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.INC, 0);
    }
    public DEC(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DEC, 0);
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterPostOpExpression) {
             listener.enterPostOpExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitPostOpExpression) {
             listener.exitPostOpExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitPostOpExpression) {
            return visitor.visitPostOpExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class NegExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public TILDE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TILDE, 0);
    }
    public BANG(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.BANG, 0);
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterNegExpression) {
             listener.enterNegExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitNegExpression) {
             listener.exitNegExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitNegExpression) {
            return visitor.visitNegExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class PreOpExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public ADD(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ADD, 0);
    }
    public SUB(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SUB, 0);
    }
    public INC(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.INC, 0);
    }
    public DEC(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DEC, 0);
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterPreOpExpression) {
             listener.enterPreOpExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitPreOpExpression) {
             listener.exitPreOpExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitPreOpExpression) {
            return visitor.visitPreOpExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class SubExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.LPAREN, 0)!;
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.RPAREN, 0)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSubExpression) {
             listener.enterSubExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSubExpression) {
             listener.exitSubExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSubExpression) {
            return visitor.visitSubExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class InstanceOfExpressionContext extends ExpressionContext {
    public constructor(ctx: ExpressionContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public INSTANCEOF(): antlr.TerminalNode {
        return this.getToken(ApexParser.INSTANCEOF, 0)!;
    }
    public typeRef(): TypeRefContext {
        return this.getRuleContext(0, TypeRefContext)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterInstanceOfExpression) {
             listener.enterInstanceOfExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitInstanceOfExpression) {
             listener.exitInstanceOfExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitInstanceOfExpression) {
            return visitor.visitInstanceOfExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class PrimaryContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_primary;
    }
    public override copyFrom(ctx: PrimaryContext): void {
        super.copyFrom(ctx);
    }
}
export class ThisPrimaryContext extends PrimaryContext {
    public constructor(ctx: PrimaryContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public THIS(): antlr.TerminalNode {
        return this.getToken(ApexParser.THIS, 0)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterThisPrimary) {
             listener.enterThisPrimary(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitThisPrimary) {
             listener.exitThisPrimary(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitThisPrimary) {
            return visitor.visitThisPrimary(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class VoidPrimaryContext extends PrimaryContext {
    public constructor(ctx: PrimaryContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public VOID(): antlr.TerminalNode {
        return this.getToken(ApexParser.VOID, 0)!;
    }
    public DOT(): antlr.TerminalNode {
        return this.getToken(ApexParser.DOT, 0)!;
    }
    public CLASS(): antlr.TerminalNode {
        return this.getToken(ApexParser.CLASS, 0)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterVoidPrimary) {
             listener.enterVoidPrimary(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitVoidPrimary) {
             listener.exitVoidPrimary(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitVoidPrimary) {
            return visitor.visitVoidPrimary(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class SoqlPrimaryContext extends PrimaryContext {
    public constructor(ctx: PrimaryContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public soqlLiteral(): SoqlLiteralContext {
        return this.getRuleContext(0, SoqlLiteralContext)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSoqlPrimary) {
             listener.enterSoqlPrimary(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSoqlPrimary) {
             listener.exitSoqlPrimary(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSoqlPrimary) {
            return visitor.visitSoqlPrimary(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class SuperPrimaryContext extends PrimaryContext {
    public constructor(ctx: PrimaryContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public SUPER(): antlr.TerminalNode {
        return this.getToken(ApexParser.SUPER, 0)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSuperPrimary) {
             listener.enterSuperPrimary(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSuperPrimary) {
             listener.exitSuperPrimary(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSuperPrimary) {
            return visitor.visitSuperPrimary(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class TypeRefPrimaryContext extends PrimaryContext {
    public constructor(ctx: PrimaryContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public typeRef(): TypeRefContext {
        return this.getRuleContext(0, TypeRefContext)!;
    }
    public DOT(): antlr.TerminalNode {
        return this.getToken(ApexParser.DOT, 0)!;
    }
    public CLASS(): antlr.TerminalNode {
        return this.getToken(ApexParser.CLASS, 0)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterTypeRefPrimary) {
             listener.enterTypeRefPrimary(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitTypeRefPrimary) {
             listener.exitTypeRefPrimary(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitTypeRefPrimary) {
            return visitor.visitTypeRefPrimary(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class IdPrimaryContext extends PrimaryContext {
    public constructor(ctx: PrimaryContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public id(): IdContext {
        return this.getRuleContext(0, IdContext)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterIdPrimary) {
             listener.enterIdPrimary(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitIdPrimary) {
             listener.exitIdPrimary(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitIdPrimary) {
            return visitor.visitIdPrimary(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class SoslPrimaryContext extends PrimaryContext {
    public constructor(ctx: PrimaryContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public soslLiteral(): SoslLiteralContext {
        return this.getRuleContext(0, SoslLiteralContext)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSoslPrimary) {
             listener.enterSoslPrimary(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSoslPrimary) {
             listener.exitSoslPrimary(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSoslPrimary) {
            return visitor.visitSoslPrimary(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
export class LiteralPrimaryContext extends PrimaryContext {
    public constructor(ctx: PrimaryContext) {
        super(ctx.parent, ctx.invokingState);
        super.copyFrom(ctx);
    }
    public literal(): LiteralContext {
        return this.getRuleContext(0, LiteralContext)!;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterLiteralPrimary) {
             listener.enterLiteralPrimary(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitLiteralPrimary) {
             listener.exitLiteralPrimary(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitLiteralPrimary) {
            return visitor.visitLiteralPrimary(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class MethodCallContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public id(): IdContext | null {
        return this.getRuleContext(0, IdContext);
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.LPAREN, 0)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.RPAREN, 0)!;
    }
    public expressionList(): ExpressionListContext | null {
        return this.getRuleContext(0, ExpressionListContext);
    }
    public THIS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THIS, 0);
    }
    public SUPER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SUPER, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_methodCall;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterMethodCall) {
             listener.enterMethodCall(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitMethodCall) {
             listener.exitMethodCall(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitMethodCall) {
            return visitor.visitMethodCall(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class DotMethodCallContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public anyId(): AnyIdContext {
        return this.getRuleContext(0, AnyIdContext)!;
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.LPAREN, 0)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.RPAREN, 0)!;
    }
    public expressionList(): ExpressionListContext | null {
        return this.getRuleContext(0, ExpressionListContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_dotMethodCall;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterDotMethodCall) {
             listener.enterDotMethodCall(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitDotMethodCall) {
             listener.exitDotMethodCall(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitDotMethodCall) {
            return visitor.visitDotMethodCall(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class CreatorContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public createdName(): CreatedNameContext {
        return this.getRuleContext(0, CreatedNameContext)!;
    }
    public noRest(): NoRestContext | null {
        return this.getRuleContext(0, NoRestContext);
    }
    public classCreatorRest(): ClassCreatorRestContext | null {
        return this.getRuleContext(0, ClassCreatorRestContext);
    }
    public arrayCreatorRest(): ArrayCreatorRestContext | null {
        return this.getRuleContext(0, ArrayCreatorRestContext);
    }
    public mapCreatorRest(): MapCreatorRestContext | null {
        return this.getRuleContext(0, MapCreatorRestContext);
    }
    public setCreatorRest(): SetCreatorRestContext | null {
        return this.getRuleContext(0, SetCreatorRestContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_creator;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterCreator) {
             listener.enterCreator(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitCreator) {
             listener.exitCreator(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitCreator) {
            return visitor.visitCreator(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class CreatedNameContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public idCreatedNamePair(): IdCreatedNamePairContext[];
    public idCreatedNamePair(i: number): IdCreatedNamePairContext | null;
    public idCreatedNamePair(i?: number): IdCreatedNamePairContext[] | IdCreatedNamePairContext | null {
        if (i === undefined) {
            return this.getRuleContexts(IdCreatedNamePairContext);
        }

        return this.getRuleContext(i, IdCreatedNamePairContext);
    }
    public DOT(): antlr.TerminalNode[];
    public DOT(i: number): antlr.TerminalNode | null;
    public DOT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.DOT);
        } else {
            return this.getToken(ApexParser.DOT, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_createdName;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterCreatedName) {
             listener.enterCreatedName(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitCreatedName) {
             listener.exitCreatedName(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitCreatedName) {
            return visitor.visitCreatedName(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class IdCreatedNamePairContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public anyId(): AnyIdContext {
        return this.getRuleContext(0, AnyIdContext)!;
    }
    public LT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LT, 0);
    }
    public typeList(): TypeListContext | null {
        return this.getRuleContext(0, TypeListContext);
    }
    public GT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.GT, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_idCreatedNamePair;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterIdCreatedNamePair) {
             listener.enterIdCreatedNamePair(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitIdCreatedNamePair) {
             listener.exitIdCreatedNamePair(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitIdCreatedNamePair) {
            return visitor.visitIdCreatedNamePair(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class NoRestContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.LBRACE, 0)!;
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.RBRACE, 0)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_noRest;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterNoRest) {
             listener.enterNoRest(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitNoRest) {
             listener.exitNoRest(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitNoRest) {
            return visitor.visitNoRest(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ClassCreatorRestContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public arguments(): ArgumentsContext {
        return this.getRuleContext(0, ArgumentsContext)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_classCreatorRest;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterClassCreatorRest) {
             listener.enterClassCreatorRest(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitClassCreatorRest) {
             listener.exitClassCreatorRest(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitClassCreatorRest) {
            return visitor.visitClassCreatorRest(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ArrayCreatorRestContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LBRACK(): antlr.TerminalNode {
        return this.getToken(ApexParser.LBRACK, 0)!;
    }
    public expression(): ExpressionContext | null {
        return this.getRuleContext(0, ExpressionContext);
    }
    public RBRACK(): antlr.TerminalNode {
        return this.getToken(ApexParser.RBRACK, 0)!;
    }
    public arrayInitializer(): ArrayInitializerContext | null {
        return this.getRuleContext(0, ArrayInitializerContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_arrayCreatorRest;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterArrayCreatorRest) {
             listener.enterArrayCreatorRest(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitArrayCreatorRest) {
             listener.exitArrayCreatorRest(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitArrayCreatorRest) {
            return visitor.visitArrayCreatorRest(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class MapCreatorRestContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.LBRACE, 0)!;
    }
    public mapCreatorRestPair(): MapCreatorRestPairContext[];
    public mapCreatorRestPair(i: number): MapCreatorRestPairContext | null;
    public mapCreatorRestPair(i?: number): MapCreatorRestPairContext[] | MapCreatorRestPairContext | null {
        if (i === undefined) {
            return this.getRuleContexts(MapCreatorRestPairContext);
        }

        return this.getRuleContext(i, MapCreatorRestPairContext);
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.RBRACE, 0)!;
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_mapCreatorRest;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterMapCreatorRest) {
             listener.enterMapCreatorRest(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitMapCreatorRest) {
             listener.exitMapCreatorRest(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitMapCreatorRest) {
            return visitor.visitMapCreatorRest(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class MapCreatorRestPairContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public expression(): ExpressionContext[];
    public expression(i: number): ExpressionContext | null;
    public expression(i?: number): ExpressionContext[] | ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExpressionContext);
        }

        return this.getRuleContext(i, ExpressionContext);
    }
    public MAPTO(): antlr.TerminalNode {
        return this.getToken(ApexParser.MAPTO, 0)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_mapCreatorRestPair;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterMapCreatorRestPair) {
             listener.enterMapCreatorRestPair(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitMapCreatorRestPair) {
             listener.exitMapCreatorRestPair(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitMapCreatorRestPair) {
            return visitor.visitMapCreatorRestPair(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SetCreatorRestContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.LBRACE, 0)!;
    }
    public expression(): ExpressionContext[];
    public expression(i: number): ExpressionContext | null;
    public expression(i?: number): ExpressionContext[] | ExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExpressionContext);
        }

        return this.getRuleContext(i, ExpressionContext);
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.RBRACE, 0)!;
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_setCreatorRest;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSetCreatorRest) {
             listener.enterSetCreatorRest(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSetCreatorRest) {
             listener.exitSetCreatorRest(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSetCreatorRest) {
            return visitor.visitSetCreatorRest(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ArgumentsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.LPAREN, 0)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.RPAREN, 0)!;
    }
    public expressionList(): ExpressionListContext | null {
        return this.getRuleContext(0, ExpressionListContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_arguments;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterArguments) {
             listener.enterArguments(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitArguments) {
             listener.exitArguments(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitArguments) {
            return visitor.visitArguments(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SoqlLiteralContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LBRACK(): antlr.TerminalNode {
        return this.getToken(ApexParser.LBRACK, 0)!;
    }
    public query(): QueryContext {
        return this.getRuleContext(0, QueryContext)!;
    }
    public RBRACK(): antlr.TerminalNode {
        return this.getToken(ApexParser.RBRACK, 0)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_soqlLiteral;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSoqlLiteral) {
             listener.enterSoqlLiteral(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSoqlLiteral) {
             listener.exitSoqlLiteral(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSoqlLiteral) {
            return visitor.visitSoqlLiteral(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class QueryContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SELECT(): antlr.TerminalNode {
        return this.getToken(ApexParser.SELECT, 0)!;
    }
    public selectList(): SelectListContext {
        return this.getRuleContext(0, SelectListContext)!;
    }
    public FROM(): antlr.TerminalNode {
        return this.getToken(ApexParser.FROM, 0)!;
    }
    public fromNameList(): FromNameListContext {
        return this.getRuleContext(0, FromNameListContext)!;
    }
    public forClauses(): ForClausesContext {
        return this.getRuleContext(0, ForClausesContext)!;
    }
    public usingScope(): UsingScopeContext | null {
        return this.getRuleContext(0, UsingScopeContext);
    }
    public whereClause(): WhereClauseContext | null {
        return this.getRuleContext(0, WhereClauseContext);
    }
    public withClause(): WithClauseContext | null {
        return this.getRuleContext(0, WithClauseContext);
    }
    public groupByClause(): GroupByClauseContext | null {
        return this.getRuleContext(0, GroupByClauseContext);
    }
    public orderByClause(): OrderByClauseContext | null {
        return this.getRuleContext(0, OrderByClauseContext);
    }
    public limitClause(): LimitClauseContext | null {
        return this.getRuleContext(0, LimitClauseContext);
    }
    public offsetClause(): OffsetClauseContext | null {
        return this.getRuleContext(0, OffsetClauseContext);
    }
    public allRowsClause(): AllRowsClauseContext | null {
        return this.getRuleContext(0, AllRowsClauseContext);
    }
    public UPDATE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.UPDATE, 0);
    }
    public updateList(): UpdateListContext | null {
        return this.getRuleContext(0, UpdateListContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_query;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterQuery) {
             listener.enterQuery(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitQuery) {
             listener.exitQuery(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitQuery) {
            return visitor.visitQuery(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SubQueryContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public SELECT(): antlr.TerminalNode {
        return this.getToken(ApexParser.SELECT, 0)!;
    }
    public subFieldList(): SubFieldListContext {
        return this.getRuleContext(0, SubFieldListContext)!;
    }
    public FROM(): antlr.TerminalNode {
        return this.getToken(ApexParser.FROM, 0)!;
    }
    public fromNameList(): FromNameListContext {
        return this.getRuleContext(0, FromNameListContext)!;
    }
    public forClauses(): ForClausesContext {
        return this.getRuleContext(0, ForClausesContext)!;
    }
    public whereClause(): WhereClauseContext | null {
        return this.getRuleContext(0, WhereClauseContext);
    }
    public orderByClause(): OrderByClauseContext | null {
        return this.getRuleContext(0, OrderByClauseContext);
    }
    public limitClause(): LimitClauseContext | null {
        return this.getRuleContext(0, LimitClauseContext);
    }
    public UPDATE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.UPDATE, 0);
    }
    public updateList(): UpdateListContext | null {
        return this.getRuleContext(0, UpdateListContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_subQuery;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSubQuery) {
             listener.enterSubQuery(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSubQuery) {
             listener.exitSubQuery(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSubQuery) {
            return visitor.visitSubQuery(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SelectListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public selectEntry(): SelectEntryContext[];
    public selectEntry(i: number): SelectEntryContext | null;
    public selectEntry(i?: number): SelectEntryContext[] | SelectEntryContext | null {
        if (i === undefined) {
            return this.getRuleContexts(SelectEntryContext);
        }

        return this.getRuleContext(i, SelectEntryContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_selectList;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSelectList) {
             listener.enterSelectList(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSelectList) {
             listener.exitSelectList(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSelectList) {
            return visitor.visitSelectList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SelectEntryContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public fieldName(): FieldNameContext | null {
        return this.getRuleContext(0, FieldNameContext);
    }
    public soqlId(): SoqlIdContext | null {
        return this.getRuleContext(0, SoqlIdContext);
    }
    public soqlFunction(): SoqlFunctionContext | null {
        return this.getRuleContext(0, SoqlFunctionContext);
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LPAREN, 0);
    }
    public subQuery(): SubQueryContext | null {
        return this.getRuleContext(0, SubQueryContext);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.RPAREN, 0);
    }
    public typeOf(): TypeOfContext | null {
        return this.getRuleContext(0, TypeOfContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_selectEntry;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSelectEntry) {
             listener.enterSelectEntry(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSelectEntry) {
             listener.exitSelectEntry(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSelectEntry) {
            return visitor.visitSelectEntry(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FieldNameContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public soqlId(): SoqlIdContext[];
    public soqlId(i: number): SoqlIdContext | null;
    public soqlId(i?: number): SoqlIdContext[] | SoqlIdContext | null {
        if (i === undefined) {
            return this.getRuleContexts(SoqlIdContext);
        }

        return this.getRuleContext(i, SoqlIdContext);
    }
    public DOT(): antlr.TerminalNode[];
    public DOT(i: number): antlr.TerminalNode | null;
    public DOT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.DOT);
        } else {
            return this.getToken(ApexParser.DOT, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_fieldName;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterFieldName) {
             listener.enterFieldName(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitFieldName) {
             listener.exitFieldName(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitFieldName) {
            return visitor.visitFieldName(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FromNameListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public fieldName(): FieldNameContext[];
    public fieldName(i: number): FieldNameContext | null;
    public fieldName(i?: number): FieldNameContext[] | FieldNameContext | null {
        if (i === undefined) {
            return this.getRuleContexts(FieldNameContext);
        }

        return this.getRuleContext(i, FieldNameContext);
    }
    public soqlId(): SoqlIdContext[];
    public soqlId(i: number): SoqlIdContext | null;
    public soqlId(i?: number): SoqlIdContext[] | SoqlIdContext | null {
        if (i === undefined) {
            return this.getRuleContexts(SoqlIdContext);
        }

        return this.getRuleContext(i, SoqlIdContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_fromNameList;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterFromNameList) {
             listener.enterFromNameList(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitFromNameList) {
             listener.exitFromNameList(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitFromNameList) {
            return visitor.visitFromNameList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SubFieldListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public subFieldEntry(): SubFieldEntryContext[];
    public subFieldEntry(i: number): SubFieldEntryContext | null;
    public subFieldEntry(i?: number): SubFieldEntryContext[] | SubFieldEntryContext | null {
        if (i === undefined) {
            return this.getRuleContexts(SubFieldEntryContext);
        }

        return this.getRuleContext(i, SubFieldEntryContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_subFieldList;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSubFieldList) {
             listener.enterSubFieldList(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSubFieldList) {
             listener.exitSubFieldList(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSubFieldList) {
            return visitor.visitSubFieldList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SubFieldEntryContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public fieldName(): FieldNameContext | null {
        return this.getRuleContext(0, FieldNameContext);
    }
    public soqlId(): SoqlIdContext | null {
        return this.getRuleContext(0, SoqlIdContext);
    }
    public soqlFunction(): SoqlFunctionContext | null {
        return this.getRuleContext(0, SoqlFunctionContext);
    }
    public typeOf(): TypeOfContext | null {
        return this.getRuleContext(0, TypeOfContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_subFieldEntry;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSubFieldEntry) {
             listener.enterSubFieldEntry(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSubFieldEntry) {
             listener.exitSubFieldEntry(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSubFieldEntry) {
            return visitor.visitSubFieldEntry(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SoqlFieldsParameterContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ALL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ALL, 0);
    }
    public CUSTOM(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CUSTOM, 0);
    }
    public STANDARD(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.STANDARD, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_soqlFieldsParameter;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSoqlFieldsParameter) {
             listener.enterSoqlFieldsParameter(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSoqlFieldsParameter) {
             listener.exitSoqlFieldsParameter(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSoqlFieldsParameter) {
            return visitor.visitSoqlFieldsParameter(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SoqlFunctionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public AVG(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.AVG, 0);
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.LPAREN, 0)!;
    }
    public fieldName(): FieldNameContext | null {
        return this.getRuleContext(0, FieldNameContext);
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.RPAREN, 0)!;
    }
    public COUNT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.COUNT, 0);
    }
    public COUNT_DISTINCT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.COUNT_DISTINCT, 0);
    }
    public MIN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.MIN, 0);
    }
    public MAX(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.MAX, 0);
    }
    public SUM(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SUM, 0);
    }
    public TOLABEL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TOLABEL, 0);
    }
    public FORMAT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FORMAT, 0);
    }
    public CALENDAR_MONTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CALENDAR_MONTH, 0);
    }
    public dateFieldName(): DateFieldNameContext | null {
        return this.getRuleContext(0, DateFieldNameContext);
    }
    public CALENDAR_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CALENDAR_QUARTER, 0);
    }
    public CALENDAR_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CALENDAR_YEAR, 0);
    }
    public DAY_IN_MONTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DAY_IN_MONTH, 0);
    }
    public DAY_IN_WEEK(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DAY_IN_WEEK, 0);
    }
    public DAY_IN_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DAY_IN_YEAR, 0);
    }
    public DAY_ONLY(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DAY_ONLY, 0);
    }
    public FISCAL_MONTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FISCAL_MONTH, 0);
    }
    public FISCAL_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FISCAL_QUARTER, 0);
    }
    public FISCAL_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FISCAL_YEAR, 0);
    }
    public HOUR_IN_DAY(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.HOUR_IN_DAY, 0);
    }
    public WEEK_IN_MONTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.WEEK_IN_MONTH, 0);
    }
    public WEEK_IN_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.WEEK_IN_YEAR, 0);
    }
    public FIELDS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FIELDS, 0);
    }
    public soqlFieldsParameter(): SoqlFieldsParameterContext | null {
        return this.getRuleContext(0, SoqlFieldsParameterContext);
    }
    public DISTANCE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DISTANCE, 0);
    }
    public locationValue(): LocationValueContext[];
    public locationValue(i: number): LocationValueContext | null;
    public locationValue(i?: number): LocationValueContext[] | LocationValueContext | null {
        if (i === undefined) {
            return this.getRuleContexts(LocationValueContext);
        }

        return this.getRuleContext(i, LocationValueContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public StringLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.StringLiteral, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_soqlFunction;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSoqlFunction) {
             listener.enterSoqlFunction(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSoqlFunction) {
             listener.exitSoqlFunction(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSoqlFunction) {
            return visitor.visitSoqlFunction(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class DateFieldNameContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public CONVERT_TIMEZONE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CONVERT_TIMEZONE, 0);
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LPAREN, 0);
    }
    public fieldName(): FieldNameContext {
        return this.getRuleContext(0, FieldNameContext)!;
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.RPAREN, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_dateFieldName;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterDateFieldName) {
             listener.enterDateFieldName(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitDateFieldName) {
             listener.exitDateFieldName(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitDateFieldName) {
            return visitor.visitDateFieldName(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LocationValueContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public fieldName(): FieldNameContext | null {
        return this.getRuleContext(0, FieldNameContext);
    }
    public boundExpression(): BoundExpressionContext | null {
        return this.getRuleContext(0, BoundExpressionContext);
    }
    public GEOLOCATION(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.GEOLOCATION, 0);
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LPAREN, 0);
    }
    public coordinateValue(): CoordinateValueContext[];
    public coordinateValue(i: number): CoordinateValueContext | null;
    public coordinateValue(i?: number): CoordinateValueContext[] | CoordinateValueContext | null {
        if (i === undefined) {
            return this.getRuleContexts(CoordinateValueContext);
        }

        return this.getRuleContext(i, CoordinateValueContext);
    }
    public COMMA(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.COMMA, 0);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.RPAREN, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_locationValue;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterLocationValue) {
             listener.enterLocationValue(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitLocationValue) {
             listener.exitLocationValue(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitLocationValue) {
            return visitor.visitLocationValue(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class CoordinateValueContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public signedNumber(): SignedNumberContext | null {
        return this.getRuleContext(0, SignedNumberContext);
    }
    public boundExpression(): BoundExpressionContext | null {
        return this.getRuleContext(0, BoundExpressionContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_coordinateValue;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterCoordinateValue) {
             listener.enterCoordinateValue(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitCoordinateValue) {
             listener.exitCoordinateValue(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitCoordinateValue) {
            return visitor.visitCoordinateValue(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TypeOfContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TYPEOF(): antlr.TerminalNode {
        return this.getToken(ApexParser.TYPEOF, 0)!;
    }
    public fieldName(): FieldNameContext {
        return this.getRuleContext(0, FieldNameContext)!;
    }
    public END(): antlr.TerminalNode {
        return this.getToken(ApexParser.END, 0)!;
    }
    public whenClause(): WhenClauseContext[];
    public whenClause(i: number): WhenClauseContext | null;
    public whenClause(i?: number): WhenClauseContext[] | WhenClauseContext | null {
        if (i === undefined) {
            return this.getRuleContexts(WhenClauseContext);
        }

        return this.getRuleContext(i, WhenClauseContext);
    }
    public elseClause(): ElseClauseContext | null {
        return this.getRuleContext(0, ElseClauseContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_typeOf;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterTypeOf) {
             listener.enterTypeOf(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitTypeOf) {
             listener.exitTypeOf(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitTypeOf) {
            return visitor.visitTypeOf(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class WhenClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public WHEN(): antlr.TerminalNode {
        return this.getToken(ApexParser.WHEN, 0)!;
    }
    public fieldName(): FieldNameContext {
        return this.getRuleContext(0, FieldNameContext)!;
    }
    public THEN(): antlr.TerminalNode {
        return this.getToken(ApexParser.THEN, 0)!;
    }
    public fieldNameList(): FieldNameListContext {
        return this.getRuleContext(0, FieldNameListContext)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_whenClause;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterWhenClause) {
             listener.enterWhenClause(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitWhenClause) {
             listener.exitWhenClause(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitWhenClause) {
            return visitor.visitWhenClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ElseClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ELSE(): antlr.TerminalNode {
        return this.getToken(ApexParser.ELSE, 0)!;
    }
    public fieldNameList(): FieldNameListContext {
        return this.getRuleContext(0, FieldNameListContext)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_elseClause;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterElseClause) {
             listener.enterElseClause(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitElseClause) {
             listener.exitElseClause(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitElseClause) {
            return visitor.visitElseClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FieldNameListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public fieldName(): FieldNameContext[];
    public fieldName(i: number): FieldNameContext | null;
    public fieldName(i?: number): FieldNameContext[] | FieldNameContext | null {
        if (i === undefined) {
            return this.getRuleContexts(FieldNameContext);
        }

        return this.getRuleContext(i, FieldNameContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_fieldNameList;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterFieldNameList) {
             listener.enterFieldNameList(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitFieldNameList) {
             listener.exitFieldNameList(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitFieldNameList) {
            return visitor.visitFieldNameList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class UsingScopeContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public USING(): antlr.TerminalNode {
        return this.getToken(ApexParser.USING, 0)!;
    }
    public SCOPE(): antlr.TerminalNode {
        return this.getToken(ApexParser.SCOPE, 0)!;
    }
    public soqlId(): SoqlIdContext {
        return this.getRuleContext(0, SoqlIdContext)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_usingScope;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterUsingScope) {
             listener.enterUsingScope(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitUsingScope) {
             listener.exitUsingScope(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitUsingScope) {
            return visitor.visitUsingScope(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class WhereClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public WHERE(): antlr.TerminalNode {
        return this.getToken(ApexParser.WHERE, 0)!;
    }
    public logicalExpression(): LogicalExpressionContext {
        return this.getRuleContext(0, LogicalExpressionContext)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_whereClause;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterWhereClause) {
             listener.enterWhereClause(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitWhereClause) {
             listener.exitWhereClause(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitWhereClause) {
            return visitor.visitWhereClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LogicalExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public conditionalExpression(): ConditionalExpressionContext[];
    public conditionalExpression(i: number): ConditionalExpressionContext | null;
    public conditionalExpression(i?: number): ConditionalExpressionContext[] | ConditionalExpressionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ConditionalExpressionContext);
        }

        return this.getRuleContext(i, ConditionalExpressionContext);
    }
    public SOQLAND(): antlr.TerminalNode[];
    public SOQLAND(i: number): antlr.TerminalNode | null;
    public SOQLAND(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.SOQLAND);
        } else {
            return this.getToken(ApexParser.SOQLAND, i);
        }
    }
    public SOQLOR(): antlr.TerminalNode[];
    public SOQLOR(i: number): antlr.TerminalNode | null;
    public SOQLOR(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.SOQLOR);
        } else {
            return this.getToken(ApexParser.SOQLOR, i);
        }
    }
    public NOT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NOT, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_logicalExpression;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterLogicalExpression) {
             listener.enterLogicalExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitLogicalExpression) {
             listener.exitLogicalExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitLogicalExpression) {
            return visitor.visitLogicalExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ConditionalExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LPAREN, 0);
    }
    public logicalExpression(): LogicalExpressionContext | null {
        return this.getRuleContext(0, LogicalExpressionContext);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.RPAREN, 0);
    }
    public fieldExpression(): FieldExpressionContext | null {
        return this.getRuleContext(0, FieldExpressionContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_conditionalExpression;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterConditionalExpression) {
             listener.enterConditionalExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitConditionalExpression) {
             listener.exitConditionalExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitConditionalExpression) {
            return visitor.visitConditionalExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FieldExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public fieldName(): FieldNameContext | null {
        return this.getRuleContext(0, FieldNameContext);
    }
    public comparisonOperator(): ComparisonOperatorContext {
        return this.getRuleContext(0, ComparisonOperatorContext)!;
    }
    public value(): ValueContext {
        return this.getRuleContext(0, ValueContext)!;
    }
    public soqlFunction(): SoqlFunctionContext | null {
        return this.getRuleContext(0, SoqlFunctionContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_fieldExpression;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterFieldExpression) {
             listener.enterFieldExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitFieldExpression) {
             listener.exitFieldExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitFieldExpression) {
            return visitor.visitFieldExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ComparisonOperatorContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ASSIGN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ASSIGN, 0);
    }
    public NOTEQUAL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NOTEQUAL, 0);
    }
    public LT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LT, 0);
    }
    public GT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.GT, 0);
    }
    public LESSANDGREATER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LESSANDGREATER, 0);
    }
    public LIKE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LIKE, 0);
    }
    public IN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.IN, 0);
    }
    public NOT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NOT, 0);
    }
    public INCLUDES(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.INCLUDES, 0);
    }
    public EXCLUDES(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.EXCLUDES, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_comparisonOperator;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterComparisonOperator) {
             listener.enterComparisonOperator(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitComparisonOperator) {
             listener.exitComparisonOperator(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitComparisonOperator) {
            return visitor.visitComparisonOperator(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ValueContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public NULL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NULL, 0);
    }
    public BooleanLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.BooleanLiteral, 0);
    }
    public signedNumber(): SignedNumberContext | null {
        return this.getRuleContext(0, SignedNumberContext);
    }
    public StringLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.StringLiteral, 0);
    }
    public DateLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DateLiteral, 0);
    }
    public DateTimeLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DateTimeLiteral, 0);
    }
    public dateFormula(): DateFormulaContext | null {
        return this.getRuleContext(0, DateFormulaContext);
    }
    public IntegralCurrencyLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.IntegralCurrencyLiteral, 0);
    }
    public DOT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DOT, 0);
    }
    public IntegerLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.IntegerLiteral, 0);
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LPAREN, 0);
    }
    public subQuery(): SubQueryContext | null {
        return this.getRuleContext(0, SubQueryContext);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.RPAREN, 0);
    }
    public valueList(): ValueListContext | null {
        return this.getRuleContext(0, ValueListContext);
    }
    public boundExpression(): BoundExpressionContext | null {
        return this.getRuleContext(0, BoundExpressionContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_value;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterValue) {
             listener.enterValue(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitValue) {
             listener.exitValue(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitValue) {
            return visitor.visitValue(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ValueListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.LPAREN, 0)!;
    }
    public value(): ValueContext[];
    public value(i: number): ValueContext | null;
    public value(i?: number): ValueContext[] | ValueContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ValueContext);
        }

        return this.getRuleContext(i, ValueContext);
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.RPAREN, 0)!;
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_valueList;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterValueList) {
             listener.enterValueList(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitValueList) {
             listener.exitValueList(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitValueList) {
            return visitor.visitValueList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SignedNumberContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IntegerLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.IntegerLiteral, 0);
    }
    public NumberLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NumberLiteral, 0);
    }
    public ADD(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ADD, 0);
    }
    public SUB(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SUB, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_signedNumber;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSignedNumber) {
             listener.enterSignedNumber(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSignedNumber) {
             listener.exitSignedNumber(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSignedNumber) {
            return visitor.visitSignedNumber(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class WithClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public WITH(): antlr.TerminalNode {
        return this.getToken(ApexParser.WITH, 0)!;
    }
    public DATA(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DATA, 0);
    }
    public CATEGORY(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CATEGORY, 0);
    }
    public filteringExpression(): FilteringExpressionContext | null {
        return this.getRuleContext(0, FilteringExpressionContext);
    }
    public SECURITY_ENFORCED(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SECURITY_ENFORCED, 0);
    }
    public SYSTEM_MODE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SYSTEM_MODE, 0);
    }
    public USER_MODE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.USER_MODE, 0);
    }
    public logicalExpression(): LogicalExpressionContext | null {
        return this.getRuleContext(0, LogicalExpressionContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_withClause;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterWithClause) {
             listener.enterWithClause(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitWithClause) {
             listener.exitWithClause(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitWithClause) {
            return visitor.visitWithClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FilteringExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public dataCategorySelection(): DataCategorySelectionContext[];
    public dataCategorySelection(i: number): DataCategorySelectionContext | null;
    public dataCategorySelection(i?: number): DataCategorySelectionContext[] | DataCategorySelectionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(DataCategorySelectionContext);
        }

        return this.getRuleContext(i, DataCategorySelectionContext);
    }
    public AND(): antlr.TerminalNode[];
    public AND(i: number): antlr.TerminalNode | null;
    public AND(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.AND);
        } else {
            return this.getToken(ApexParser.AND, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_filteringExpression;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterFilteringExpression) {
             listener.enterFilteringExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitFilteringExpression) {
             listener.exitFilteringExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitFilteringExpression) {
            return visitor.visitFilteringExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class DataCategorySelectionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public soqlId(): SoqlIdContext {
        return this.getRuleContext(0, SoqlIdContext)!;
    }
    public filteringSelector(): FilteringSelectorContext {
        return this.getRuleContext(0, FilteringSelectorContext)!;
    }
    public dataCategoryName(): DataCategoryNameContext {
        return this.getRuleContext(0, DataCategoryNameContext)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_dataCategorySelection;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterDataCategorySelection) {
             listener.enterDataCategorySelection(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitDataCategorySelection) {
             listener.exitDataCategorySelection(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitDataCategorySelection) {
            return visitor.visitDataCategorySelection(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class DataCategoryNameContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public soqlId(): SoqlIdContext[];
    public soqlId(i: number): SoqlIdContext | null;
    public soqlId(i?: number): SoqlIdContext[] | SoqlIdContext | null {
        if (i === undefined) {
            return this.getRuleContexts(SoqlIdContext);
        }

        return this.getRuleContext(i, SoqlIdContext);
    }
    public LPAREN(): antlr.TerminalNode[];
    public LPAREN(i: number): antlr.TerminalNode | null;
    public LPAREN(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.LPAREN);
        } else {
            return this.getToken(ApexParser.LPAREN, i);
        }
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_dataCategoryName;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterDataCategoryName) {
             listener.enterDataCategoryName(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitDataCategoryName) {
             listener.exitDataCategoryName(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitDataCategoryName) {
            return visitor.visitDataCategoryName(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FilteringSelectorContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public AT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.AT, 0);
    }
    public ABOVE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ABOVE, 0);
    }
    public BELOW(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.BELOW, 0);
    }
    public ABOVE_OR_BELOW(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ABOVE_OR_BELOW, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_filteringSelector;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterFilteringSelector) {
             listener.enterFilteringSelector(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitFilteringSelector) {
             listener.exitFilteringSelector(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitFilteringSelector) {
            return visitor.visitFilteringSelector(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class GroupByClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public GROUP(): antlr.TerminalNode {
        return this.getToken(ApexParser.GROUP, 0)!;
    }
    public BY(): antlr.TerminalNode {
        return this.getToken(ApexParser.BY, 0)!;
    }
    public selectList(): SelectListContext | null {
        return this.getRuleContext(0, SelectListContext);
    }
    public HAVING(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.HAVING, 0);
    }
    public logicalExpression(): LogicalExpressionContext | null {
        return this.getRuleContext(0, LogicalExpressionContext);
    }
    public ROLLUP(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ROLLUP, 0);
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LPAREN, 0);
    }
    public fieldName(): FieldNameContext[];
    public fieldName(i: number): FieldNameContext | null;
    public fieldName(i?: number): FieldNameContext[] | FieldNameContext | null {
        if (i === undefined) {
            return this.getRuleContexts(FieldNameContext);
        }

        return this.getRuleContext(i, FieldNameContext);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.RPAREN, 0);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public CUBE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CUBE, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_groupByClause;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterGroupByClause) {
             listener.enterGroupByClause(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitGroupByClause) {
             listener.exitGroupByClause(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitGroupByClause) {
            return visitor.visitGroupByClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class OrderByClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ORDER(): antlr.TerminalNode {
        return this.getToken(ApexParser.ORDER, 0)!;
    }
    public BY(): antlr.TerminalNode {
        return this.getToken(ApexParser.BY, 0)!;
    }
    public fieldOrderList(): FieldOrderListContext {
        return this.getRuleContext(0, FieldOrderListContext)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_orderByClause;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterOrderByClause) {
             listener.enterOrderByClause(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitOrderByClause) {
             listener.exitOrderByClause(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitOrderByClause) {
            return visitor.visitOrderByClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FieldOrderListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public fieldOrder(): FieldOrderContext[];
    public fieldOrder(i: number): FieldOrderContext | null;
    public fieldOrder(i?: number): FieldOrderContext[] | FieldOrderContext | null {
        if (i === undefined) {
            return this.getRuleContexts(FieldOrderContext);
        }

        return this.getRuleContext(i, FieldOrderContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_fieldOrderList;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterFieldOrderList) {
             listener.enterFieldOrderList(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitFieldOrderList) {
             listener.exitFieldOrderList(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitFieldOrderList) {
            return visitor.visitFieldOrderList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FieldOrderContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public fieldName(): FieldNameContext | null {
        return this.getRuleContext(0, FieldNameContext);
    }
    public NULLS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NULLS, 0);
    }
    public ASC(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ASC, 0);
    }
    public DESC(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DESC, 0);
    }
    public FIRST(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FIRST, 0);
    }
    public LAST(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST, 0);
    }
    public soqlFunction(): SoqlFunctionContext | null {
        return this.getRuleContext(0, SoqlFunctionContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_fieldOrder;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterFieldOrder) {
             listener.enterFieldOrder(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitFieldOrder) {
             listener.exitFieldOrder(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitFieldOrder) {
            return visitor.visitFieldOrder(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LimitClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LIMIT(): antlr.TerminalNode {
        return this.getToken(ApexParser.LIMIT, 0)!;
    }
    public IntegerLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.IntegerLiteral, 0);
    }
    public boundExpression(): BoundExpressionContext | null {
        return this.getRuleContext(0, BoundExpressionContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_limitClause;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterLimitClause) {
             listener.enterLimitClause(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitLimitClause) {
             listener.exitLimitClause(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitLimitClause) {
            return visitor.visitLimitClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class OffsetClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OFFSET(): antlr.TerminalNode {
        return this.getToken(ApexParser.OFFSET, 0)!;
    }
    public IntegerLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.IntegerLiteral, 0);
    }
    public boundExpression(): BoundExpressionContext | null {
        return this.getRuleContext(0, BoundExpressionContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_offsetClause;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterOffsetClause) {
             listener.enterOffsetClause(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitOffsetClause) {
             listener.exitOffsetClause(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitOffsetClause) {
            return visitor.visitOffsetClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class AllRowsClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ALL(): antlr.TerminalNode {
        return this.getToken(ApexParser.ALL, 0)!;
    }
    public ROWS(): antlr.TerminalNode {
        return this.getToken(ApexParser.ROWS, 0)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_allRowsClause;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterAllRowsClause) {
             listener.enterAllRowsClause(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitAllRowsClause) {
             listener.exitAllRowsClause(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitAllRowsClause) {
            return visitor.visitAllRowsClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ForClausesContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public FOR(): antlr.TerminalNode[];
    public FOR(i: number): antlr.TerminalNode | null;
    public FOR(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.FOR);
        } else {
            return this.getToken(ApexParser.FOR, i);
        }
    }
    public VIEW(): antlr.TerminalNode[];
    public VIEW(i: number): antlr.TerminalNode | null;
    public VIEW(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.VIEW);
        } else {
            return this.getToken(ApexParser.VIEW, i);
        }
    }
    public UPDATE(): antlr.TerminalNode[];
    public UPDATE(i: number): antlr.TerminalNode | null;
    public UPDATE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.UPDATE);
        } else {
            return this.getToken(ApexParser.UPDATE, i);
        }
    }
    public REFERENCE(): antlr.TerminalNode[];
    public REFERENCE(i: number): antlr.TerminalNode | null;
    public REFERENCE(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.REFERENCE);
        } else {
            return this.getToken(ApexParser.REFERENCE, i);
        }
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_forClauses;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterForClauses) {
             listener.enterForClauses(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitForClauses) {
             listener.exitForClauses(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitForClauses) {
            return visitor.visitForClauses(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class BoundExpressionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public COLON(): antlr.TerminalNode {
        return this.getToken(ApexParser.COLON, 0)!;
    }
    public expression(): ExpressionContext {
        return this.getRuleContext(0, ExpressionContext)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_boundExpression;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterBoundExpression) {
             listener.enterBoundExpression(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitBoundExpression) {
             listener.exitBoundExpression(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitBoundExpression) {
            return visitor.visitBoundExpression(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class DateFormulaContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public YESTERDAY(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.YESTERDAY, 0);
    }
    public TODAY(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TODAY, 0);
    }
    public TOMORROW(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TOMORROW, 0);
    }
    public LAST_WEEK(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_WEEK, 0);
    }
    public THIS_WEEK(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THIS_WEEK, 0);
    }
    public NEXT_WEEK(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_WEEK, 0);
    }
    public LAST_MONTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_MONTH, 0);
    }
    public THIS_MONTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THIS_MONTH, 0);
    }
    public NEXT_MONTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_MONTH, 0);
    }
    public LAST_90_DAYS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_90_DAYS, 0);
    }
    public NEXT_90_DAYS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_90_DAYS, 0);
    }
    public LAST_N_DAYS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_N_DAYS_N, 0);
    }
    public COLON(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.COLON, 0);
    }
    public signedInteger(): SignedIntegerContext | null {
        return this.getRuleContext(0, SignedIntegerContext);
    }
    public NEXT_N_DAYS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_N_DAYS_N, 0);
    }
    public N_DAYS_AGO_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.N_DAYS_AGO_N, 0);
    }
    public NEXT_N_WEEKS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_N_WEEKS_N, 0);
    }
    public LAST_N_WEEKS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_N_WEEKS_N, 0);
    }
    public N_WEEKS_AGO_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.N_WEEKS_AGO_N, 0);
    }
    public NEXT_N_MONTHS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_N_MONTHS_N, 0);
    }
    public LAST_N_MONTHS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_N_MONTHS_N, 0);
    }
    public N_MONTHS_AGO_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.N_MONTHS_AGO_N, 0);
    }
    public THIS_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THIS_QUARTER, 0);
    }
    public LAST_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_QUARTER, 0);
    }
    public NEXT_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_QUARTER, 0);
    }
    public NEXT_N_QUARTERS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_N_QUARTERS_N, 0);
    }
    public LAST_N_QUARTERS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_N_QUARTERS_N, 0);
    }
    public N_QUARTERS_AGO_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.N_QUARTERS_AGO_N, 0);
    }
    public THIS_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THIS_YEAR, 0);
    }
    public LAST_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_YEAR, 0);
    }
    public NEXT_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_YEAR, 0);
    }
    public NEXT_N_YEARS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_N_YEARS_N, 0);
    }
    public LAST_N_YEARS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_N_YEARS_N, 0);
    }
    public N_YEARS_AGO_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.N_YEARS_AGO_N, 0);
    }
    public THIS_FISCAL_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THIS_FISCAL_QUARTER, 0);
    }
    public LAST_FISCAL_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_FISCAL_QUARTER, 0);
    }
    public NEXT_FISCAL_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_FISCAL_QUARTER, 0);
    }
    public NEXT_N_FISCAL_QUARTERS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_N_FISCAL_QUARTERS_N, 0);
    }
    public LAST_N_FISCAL_QUARTERS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_N_FISCAL_QUARTERS_N, 0);
    }
    public N_FISCAL_QUARTERS_AGO_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.N_FISCAL_QUARTERS_AGO_N, 0);
    }
    public THIS_FISCAL_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THIS_FISCAL_YEAR, 0);
    }
    public LAST_FISCAL_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_FISCAL_YEAR, 0);
    }
    public NEXT_FISCAL_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_FISCAL_YEAR, 0);
    }
    public NEXT_N_FISCAL_YEARS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_N_FISCAL_YEARS_N, 0);
    }
    public LAST_N_FISCAL_YEARS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_N_FISCAL_YEARS_N, 0);
    }
    public N_FISCAL_YEARS_AGO_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.N_FISCAL_YEARS_AGO_N, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_dateFormula;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterDateFormula) {
             listener.enterDateFormula(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitDateFormula) {
             listener.exitDateFormula(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitDateFormula) {
            return visitor.visitDateFormula(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SignedIntegerContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IntegerLiteral(): antlr.TerminalNode {
        return this.getToken(ApexParser.IntegerLiteral, 0)!;
    }
    public ADD(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ADD, 0);
    }
    public SUB(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SUB, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_signedInteger;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSignedInteger) {
             listener.enterSignedInteger(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSignedInteger) {
             listener.exitSignedInteger(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSignedInteger) {
            return visitor.visitSignedInteger(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SoqlIdContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public id(): IdContext {
        return this.getRuleContext(0, IdContext)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_soqlId;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSoqlId) {
             listener.enterSoqlId(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSoqlId) {
             listener.exitSoqlId(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSoqlId) {
            return visitor.visitSoqlId(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SoslLiteralContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public FindLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FindLiteral, 0);
    }
    public soslClauses(): SoslClausesContext {
        return this.getRuleContext(0, SoslClausesContext)!;
    }
    public RBRACK(): antlr.TerminalNode {
        return this.getToken(ApexParser.RBRACK, 0)!;
    }
    public LBRACK(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LBRACK, 0);
    }
    public FIND(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FIND, 0);
    }
    public boundExpression(): BoundExpressionContext | null {
        return this.getRuleContext(0, BoundExpressionContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_soslLiteral;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSoslLiteral) {
             listener.enterSoslLiteral(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSoslLiteral) {
             listener.exitSoslLiteral(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSoslLiteral) {
            return visitor.visitSoslLiteral(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SoslLiteralAltContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public FindLiteralAlt(): antlr.TerminalNode {
        return this.getToken(ApexParser.FindLiteralAlt, 0)!;
    }
    public soslClauses(): SoslClausesContext {
        return this.getRuleContext(0, SoslClausesContext)!;
    }
    public RBRACK(): antlr.TerminalNode {
        return this.getToken(ApexParser.RBRACK, 0)!;
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_soslLiteralAlt;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSoslLiteralAlt) {
             listener.enterSoslLiteralAlt(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSoslLiteralAlt) {
             listener.exitSoslLiteralAlt(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSoslLiteralAlt) {
            return visitor.visitSoslLiteralAlt(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SoslClausesContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IN(): antlr.TerminalNode[];
    public IN(i: number): antlr.TerminalNode | null;
    public IN(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.IN);
        } else {
            return this.getToken(ApexParser.IN, i);
        }
    }
    public searchGroup(): SearchGroupContext | null {
        return this.getRuleContext(0, SearchGroupContext);
    }
    public RETURNING(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.RETURNING, 0);
    }
    public fieldSpecList(): FieldSpecListContext | null {
        return this.getRuleContext(0, FieldSpecListContext);
    }
    public WITH(): antlr.TerminalNode[];
    public WITH(i: number): antlr.TerminalNode | null;
    public WITH(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.WITH);
        } else {
            return this.getToken(ApexParser.WITH, i);
        }
    }
    public DIVISION(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DIVISION, 0);
    }
    public ASSIGN(): antlr.TerminalNode[];
    public ASSIGN(i: number): antlr.TerminalNode | null;
    public ASSIGN(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.ASSIGN);
        } else {
            return this.getToken(ApexParser.ASSIGN, i);
        }
    }
    public StringLiteral(): antlr.TerminalNode[];
    public StringLiteral(i: number): antlr.TerminalNode | null;
    public StringLiteral(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.StringLiteral);
        } else {
            return this.getToken(ApexParser.StringLiteral, i);
        }
    }
    public DATA(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DATA, 0);
    }
    public CATEGORY(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CATEGORY, 0);
    }
    public filteringExpression(): FilteringExpressionContext | null {
        return this.getRuleContext(0, FilteringExpressionContext);
    }
    public SNIPPET(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SNIPPET, 0);
    }
    public NETWORK(): antlr.TerminalNode[];
    public NETWORK(i: number): antlr.TerminalNode | null;
    public NETWORK(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.NETWORK);
        } else {
            return this.getToken(ApexParser.NETWORK, i);
        }
    }
    public LPAREN(): antlr.TerminalNode[];
    public LPAREN(i: number): antlr.TerminalNode | null;
    public LPAREN(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.LPAREN);
        } else {
            return this.getToken(ApexParser.LPAREN, i);
        }
    }
    public networkList(): NetworkListContext | null {
        return this.getRuleContext(0, NetworkListContext);
    }
    public RPAREN(): antlr.TerminalNode[];
    public RPAREN(i: number): antlr.TerminalNode | null;
    public RPAREN(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.RPAREN);
        } else {
            return this.getToken(ApexParser.RPAREN, i);
        }
    }
    public PRICEBOOKID(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.PRICEBOOKID, 0);
    }
    public METADATA(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.METADATA, 0);
    }
    public limitClause(): LimitClauseContext | null {
        return this.getRuleContext(0, LimitClauseContext);
    }
    public UPDATE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.UPDATE, 0);
    }
    public updateList(): UpdateListContext | null {
        return this.getRuleContext(0, UpdateListContext);
    }
    public TARGET_LENGTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TARGET_LENGTH, 0);
    }
    public IntegerLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.IntegerLiteral, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_soslClauses;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSoslClauses) {
             listener.enterSoslClauses(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSoslClauses) {
             listener.exitSoslClauses(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSoslClauses) {
            return visitor.visitSoslClauses(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SearchGroupContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public FIELDS(): antlr.TerminalNode {
        return this.getToken(ApexParser.FIELDS, 0)!;
    }
    public ALL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ALL, 0);
    }
    public EMAIL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.EMAIL, 0);
    }
    public NAME(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NAME, 0);
    }
    public PHONE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.PHONE, 0);
    }
    public SIDEBAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SIDEBAR, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_searchGroup;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSearchGroup) {
             listener.enterSearchGroup(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSearchGroup) {
             listener.exitSearchGroup(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSearchGroup) {
            return visitor.visitSearchGroup(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FieldSpecListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public fieldSpec(): FieldSpecContext {
        return this.getRuleContext(0, FieldSpecContext)!;
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public fieldSpecList(): FieldSpecListContext[];
    public fieldSpecList(i: number): FieldSpecListContext | null;
    public fieldSpecList(i?: number): FieldSpecListContext[] | FieldSpecListContext | null {
        if (i === undefined) {
            return this.getRuleContexts(FieldSpecListContext);
        }

        return this.getRuleContext(i, FieldSpecListContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_fieldSpecList;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterFieldSpecList) {
             listener.enterFieldSpecList(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitFieldSpecList) {
             listener.exitFieldSpecList(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitFieldSpecList) {
            return visitor.visitFieldSpecList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FieldSpecContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public soslId(): SoslIdContext[];
    public soslId(i: number): SoslIdContext | null;
    public soslId(i?: number): SoslIdContext[] | SoslIdContext | null {
        if (i === undefined) {
            return this.getRuleContexts(SoslIdContext);
        }

        return this.getRuleContext(i, SoslIdContext);
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LPAREN, 0);
    }
    public fieldList(): FieldListContext | null {
        return this.getRuleContext(0, FieldListContext);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.RPAREN, 0);
    }
    public WHERE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.WHERE, 0);
    }
    public logicalExpression(): LogicalExpressionContext | null {
        return this.getRuleContext(0, LogicalExpressionContext);
    }
    public USING(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.USING, 0);
    }
    public LISTVIEW(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LISTVIEW, 0);
    }
    public ASSIGN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ASSIGN, 0);
    }
    public ORDER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ORDER, 0);
    }
    public BY(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.BY, 0);
    }
    public fieldOrderList(): FieldOrderListContext | null {
        return this.getRuleContext(0, FieldOrderListContext);
    }
    public limitClause(): LimitClauseContext | null {
        return this.getRuleContext(0, LimitClauseContext);
    }
    public offsetClause(): OffsetClauseContext | null {
        return this.getRuleContext(0, OffsetClauseContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_fieldSpec;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterFieldSpec) {
             listener.enterFieldSpec(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitFieldSpec) {
             listener.exitFieldSpec(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitFieldSpec) {
            return visitor.visitFieldSpec(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FieldListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public soslId(): SoslIdContext {
        return this.getRuleContext(0, SoslIdContext)!;
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.COMMA);
        } else {
            return this.getToken(ApexParser.COMMA, i);
        }
    }
    public fieldList(): FieldListContext[];
    public fieldList(i: number): FieldListContext | null;
    public fieldList(i?: number): FieldListContext[] | FieldListContext | null {
        if (i === undefined) {
            return this.getRuleContexts(FieldListContext);
        }

        return this.getRuleContext(i, FieldListContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_fieldList;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterFieldList) {
             listener.enterFieldList(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitFieldList) {
             listener.exitFieldList(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitFieldList) {
            return visitor.visitFieldList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class UpdateListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public updateType(): UpdateTypeContext {
        return this.getRuleContext(0, UpdateTypeContext)!;
    }
    public COMMA(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.COMMA, 0);
    }
    public updateList(): UpdateListContext | null {
        return this.getRuleContext(0, UpdateListContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_updateList;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterUpdateList) {
             listener.enterUpdateList(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitUpdateList) {
             listener.exitUpdateList(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitUpdateList) {
            return visitor.visitUpdateList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class UpdateTypeContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TRACKING(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TRACKING, 0);
    }
    public VIEWSTAT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.VIEWSTAT, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_updateType;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterUpdateType) {
             listener.enterUpdateType(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitUpdateType) {
             listener.exitUpdateType(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitUpdateType) {
            return visitor.visitUpdateType(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class NetworkListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public StringLiteral(): antlr.TerminalNode {
        return this.getToken(ApexParser.StringLiteral, 0)!;
    }
    public COMMA(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.COMMA, 0);
    }
    public networkList(): NetworkListContext | null {
        return this.getRuleContext(0, NetworkListContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_networkList;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterNetworkList) {
             listener.enterNetworkList(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitNetworkList) {
             listener.exitNetworkList(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitNetworkList) {
            return visitor.visitNetworkList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SoslIdContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public id(): IdContext {
        return this.getRuleContext(0, IdContext)!;
    }
    public DOT(): antlr.TerminalNode[];
    public DOT(i: number): antlr.TerminalNode | null;
    public DOT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
        if (i === undefined) {
            return this.getTokens(ApexParser.DOT);
        } else {
            return this.getToken(ApexParser.DOT, i);
        }
    }
    public soslId(): SoslIdContext[];
    public soslId(i: number): SoslIdContext | null;
    public soslId(i?: number): SoslIdContext[] | SoslIdContext | null {
        if (i === undefined) {
            return this.getRuleContexts(SoslIdContext);
        }

        return this.getRuleContext(i, SoslIdContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_soslId;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterSoslId) {
             listener.enterSoslId(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitSoslId) {
             listener.exitSoslId(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitSoslId) {
            return visitor.visitSoslId(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class IdContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public Identifier(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.Identifier, 0);
    }
    public AFTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.AFTER, 0);
    }
    public BEFORE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.BEFORE, 0);
    }
    public GET(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.GET, 0);
    }
    public INHERITED(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.INHERITED, 0);
    }
    public INSTANCEOF(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.INSTANCEOF, 0);
    }
    public SET(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SET, 0);
    }
    public SHARING(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SHARING, 0);
    }
    public SWITCH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SWITCH, 0);
    }
    public TRANSIENT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TRANSIENT, 0);
    }
    public TRIGGER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TRIGGER, 0);
    }
    public WHEN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.WHEN, 0);
    }
    public WITH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.WITH, 0);
    }
    public WITHOUT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.WITHOUT, 0);
    }
    public USER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.USER, 0);
    }
    public SYSTEM(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SYSTEM, 0);
    }
    public IntegralCurrencyLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.IntegralCurrencyLiteral, 0);
    }
    public SELECT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SELECT, 0);
    }
    public COUNT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.COUNT, 0);
    }
    public FROM(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FROM, 0);
    }
    public AS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.AS, 0);
    }
    public USING(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.USING, 0);
    }
    public SCOPE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SCOPE, 0);
    }
    public WHERE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.WHERE, 0);
    }
    public ORDER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ORDER, 0);
    }
    public BY(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.BY, 0);
    }
    public LIMIT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LIMIT, 0);
    }
    public SOQLAND(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SOQLAND, 0);
    }
    public SOQLOR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SOQLOR, 0);
    }
    public NOT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NOT, 0);
    }
    public AVG(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.AVG, 0);
    }
    public COUNT_DISTINCT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.COUNT_DISTINCT, 0);
    }
    public MIN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.MIN, 0);
    }
    public MAX(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.MAX, 0);
    }
    public SUM(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SUM, 0);
    }
    public TYPEOF(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TYPEOF, 0);
    }
    public END(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.END, 0);
    }
    public THEN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THEN, 0);
    }
    public LIKE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LIKE, 0);
    }
    public IN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.IN, 0);
    }
    public INCLUDES(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.INCLUDES, 0);
    }
    public EXCLUDES(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.EXCLUDES, 0);
    }
    public ASC(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ASC, 0);
    }
    public DESC(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DESC, 0);
    }
    public NULLS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NULLS, 0);
    }
    public FIRST(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FIRST, 0);
    }
    public LAST(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST, 0);
    }
    public GROUP(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.GROUP, 0);
    }
    public ALL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ALL, 0);
    }
    public ROWS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ROWS, 0);
    }
    public VIEW(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.VIEW, 0);
    }
    public HAVING(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.HAVING, 0);
    }
    public ROLLUP(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ROLLUP, 0);
    }
    public TOLABEL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TOLABEL, 0);
    }
    public OFFSET(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.OFFSET, 0);
    }
    public DATA(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DATA, 0);
    }
    public CATEGORY(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CATEGORY, 0);
    }
    public AT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.AT, 0);
    }
    public ABOVE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ABOVE, 0);
    }
    public BELOW(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.BELOW, 0);
    }
    public ABOVE_OR_BELOW(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ABOVE_OR_BELOW, 0);
    }
    public SECURITY_ENFORCED(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SECURITY_ENFORCED, 0);
    }
    public USER_MODE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.USER_MODE, 0);
    }
    public SYSTEM_MODE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SYSTEM_MODE, 0);
    }
    public REFERENCE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.REFERENCE, 0);
    }
    public CUBE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CUBE, 0);
    }
    public FORMAT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FORMAT, 0);
    }
    public TRACKING(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TRACKING, 0);
    }
    public VIEWSTAT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.VIEWSTAT, 0);
    }
    public STANDARD(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.STANDARD, 0);
    }
    public CUSTOM(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CUSTOM, 0);
    }
    public DISTANCE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DISTANCE, 0);
    }
    public GEOLOCATION(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.GEOLOCATION, 0);
    }
    public CALENDAR_MONTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CALENDAR_MONTH, 0);
    }
    public CALENDAR_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CALENDAR_QUARTER, 0);
    }
    public CALENDAR_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CALENDAR_YEAR, 0);
    }
    public DAY_IN_MONTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DAY_IN_MONTH, 0);
    }
    public DAY_IN_WEEK(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DAY_IN_WEEK, 0);
    }
    public DAY_IN_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DAY_IN_YEAR, 0);
    }
    public DAY_ONLY(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DAY_ONLY, 0);
    }
    public FISCAL_MONTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FISCAL_MONTH, 0);
    }
    public FISCAL_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FISCAL_QUARTER, 0);
    }
    public FISCAL_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FISCAL_YEAR, 0);
    }
    public HOUR_IN_DAY(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.HOUR_IN_DAY, 0);
    }
    public WEEK_IN_MONTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.WEEK_IN_MONTH, 0);
    }
    public WEEK_IN_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.WEEK_IN_YEAR, 0);
    }
    public CONVERT_TIMEZONE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CONVERT_TIMEZONE, 0);
    }
    public YESTERDAY(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.YESTERDAY, 0);
    }
    public TODAY(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TODAY, 0);
    }
    public TOMORROW(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TOMORROW, 0);
    }
    public LAST_WEEK(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_WEEK, 0);
    }
    public THIS_WEEK(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THIS_WEEK, 0);
    }
    public NEXT_WEEK(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_WEEK, 0);
    }
    public LAST_MONTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_MONTH, 0);
    }
    public THIS_MONTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THIS_MONTH, 0);
    }
    public NEXT_MONTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_MONTH, 0);
    }
    public LAST_90_DAYS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_90_DAYS, 0);
    }
    public NEXT_90_DAYS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_90_DAYS, 0);
    }
    public LAST_N_DAYS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_N_DAYS_N, 0);
    }
    public NEXT_N_DAYS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_N_DAYS_N, 0);
    }
    public N_DAYS_AGO_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.N_DAYS_AGO_N, 0);
    }
    public NEXT_N_WEEKS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_N_WEEKS_N, 0);
    }
    public LAST_N_WEEKS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_N_WEEKS_N, 0);
    }
    public N_WEEKS_AGO_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.N_WEEKS_AGO_N, 0);
    }
    public NEXT_N_MONTHS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_N_MONTHS_N, 0);
    }
    public LAST_N_MONTHS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_N_MONTHS_N, 0);
    }
    public N_MONTHS_AGO_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.N_MONTHS_AGO_N, 0);
    }
    public THIS_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THIS_QUARTER, 0);
    }
    public LAST_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_QUARTER, 0);
    }
    public NEXT_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_QUARTER, 0);
    }
    public NEXT_N_QUARTERS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_N_QUARTERS_N, 0);
    }
    public LAST_N_QUARTERS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_N_QUARTERS_N, 0);
    }
    public N_QUARTERS_AGO_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.N_QUARTERS_AGO_N, 0);
    }
    public THIS_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THIS_YEAR, 0);
    }
    public LAST_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_YEAR, 0);
    }
    public NEXT_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_YEAR, 0);
    }
    public NEXT_N_YEARS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_N_YEARS_N, 0);
    }
    public LAST_N_YEARS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_N_YEARS_N, 0);
    }
    public N_YEARS_AGO_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.N_YEARS_AGO_N, 0);
    }
    public THIS_FISCAL_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THIS_FISCAL_QUARTER, 0);
    }
    public LAST_FISCAL_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_FISCAL_QUARTER, 0);
    }
    public NEXT_FISCAL_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_FISCAL_QUARTER, 0);
    }
    public NEXT_N_FISCAL_QUARTERS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_N_FISCAL_QUARTERS_N, 0);
    }
    public LAST_N_FISCAL_QUARTERS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_N_FISCAL_QUARTERS_N, 0);
    }
    public N_FISCAL_QUARTERS_AGO_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.N_FISCAL_QUARTERS_AGO_N, 0);
    }
    public THIS_FISCAL_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THIS_FISCAL_YEAR, 0);
    }
    public LAST_FISCAL_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_FISCAL_YEAR, 0);
    }
    public NEXT_FISCAL_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_FISCAL_YEAR, 0);
    }
    public NEXT_N_FISCAL_YEARS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_N_FISCAL_YEARS_N, 0);
    }
    public LAST_N_FISCAL_YEARS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_N_FISCAL_YEARS_N, 0);
    }
    public N_FISCAL_YEARS_AGO_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.N_FISCAL_YEARS_AGO_N, 0);
    }
    public FIND(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FIND, 0);
    }
    public EMAIL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.EMAIL, 0);
    }
    public NAME(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NAME, 0);
    }
    public PHONE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.PHONE, 0);
    }
    public SIDEBAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SIDEBAR, 0);
    }
    public FIELDS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FIELDS, 0);
    }
    public METADATA(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.METADATA, 0);
    }
    public PRICEBOOKID(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.PRICEBOOKID, 0);
    }
    public NETWORK(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NETWORK, 0);
    }
    public SNIPPET(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SNIPPET, 0);
    }
    public TARGET_LENGTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TARGET_LENGTH, 0);
    }
    public DIVISION(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DIVISION, 0);
    }
    public RETURNING(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.RETURNING, 0);
    }
    public LISTVIEW(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LISTVIEW, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_id;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterId) {
             listener.enterId(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitId) {
             listener.exitId(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitId) {
            return visitor.visitId(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class AnyIdContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public Identifier(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.Identifier, 0);
    }
    public ABSTRACT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ABSTRACT, 0);
    }
    public AFTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.AFTER, 0);
    }
    public BEFORE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.BEFORE, 0);
    }
    public BREAK(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.BREAK, 0);
    }
    public CATCH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CATCH, 0);
    }
    public CLASS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CLASS, 0);
    }
    public CONTINUE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CONTINUE, 0);
    }
    public DELETE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DELETE, 0);
    }
    public DO(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DO, 0);
    }
    public ELSE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ELSE, 0);
    }
    public ENUM(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ENUM, 0);
    }
    public EXTENDS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.EXTENDS, 0);
    }
    public FINAL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FINAL, 0);
    }
    public FINALLY(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FINALLY, 0);
    }
    public FOR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FOR, 0);
    }
    public GET(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.GET, 0);
    }
    public GLOBAL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.GLOBAL, 0);
    }
    public IF(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.IF, 0);
    }
    public IMPLEMENTS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.IMPLEMENTS, 0);
    }
    public INHERITED(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.INHERITED, 0);
    }
    public INSERT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.INSERT, 0);
    }
    public INSTANCEOF(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.INSTANCEOF, 0);
    }
    public INTERFACE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.INTERFACE, 0);
    }
    public LIST(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LIST, 0);
    }
    public MAP(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.MAP, 0);
    }
    public MERGE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.MERGE, 0);
    }
    public NEW(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEW, 0);
    }
    public NULL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NULL, 0);
    }
    public ON(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ON, 0);
    }
    public OVERRIDE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.OVERRIDE, 0);
    }
    public PRIVATE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.PRIVATE, 0);
    }
    public PROTECTED(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.PROTECTED, 0);
    }
    public PUBLIC(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.PUBLIC, 0);
    }
    public RETURN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.RETURN, 0);
    }
    public SET(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SET, 0);
    }
    public SHARING(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SHARING, 0);
    }
    public STATIC(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.STATIC, 0);
    }
    public SUPER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SUPER, 0);
    }
    public SWITCH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SWITCH, 0);
    }
    public TESTMETHOD(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TESTMETHOD, 0);
    }
    public THIS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THIS, 0);
    }
    public THROW(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THROW, 0);
    }
    public TRANSIENT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TRANSIENT, 0);
    }
    public TRIGGER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TRIGGER, 0);
    }
    public TRY(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TRY, 0);
    }
    public UNDELETE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.UNDELETE, 0);
    }
    public UPDATE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.UPDATE, 0);
    }
    public UPSERT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.UPSERT, 0);
    }
    public VIRTUAL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.VIRTUAL, 0);
    }
    public WEBSERVICE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.WEBSERVICE, 0);
    }
    public WHEN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.WHEN, 0);
    }
    public WHILE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.WHILE, 0);
    }
    public WITH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.WITH, 0);
    }
    public WITHOUT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.WITHOUT, 0);
    }
    public USER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.USER, 0);
    }
    public SYSTEM(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SYSTEM, 0);
    }
    public IntegralCurrencyLiteral(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.IntegralCurrencyLiteral, 0);
    }
    public SELECT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SELECT, 0);
    }
    public COUNT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.COUNT, 0);
    }
    public FROM(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FROM, 0);
    }
    public AS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.AS, 0);
    }
    public USING(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.USING, 0);
    }
    public SCOPE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SCOPE, 0);
    }
    public WHERE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.WHERE, 0);
    }
    public ORDER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ORDER, 0);
    }
    public BY(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.BY, 0);
    }
    public LIMIT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LIMIT, 0);
    }
    public SOQLAND(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SOQLAND, 0);
    }
    public SOQLOR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SOQLOR, 0);
    }
    public NOT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NOT, 0);
    }
    public AVG(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.AVG, 0);
    }
    public COUNT_DISTINCT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.COUNT_DISTINCT, 0);
    }
    public MIN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.MIN, 0);
    }
    public MAX(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.MAX, 0);
    }
    public SUM(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SUM, 0);
    }
    public TYPEOF(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TYPEOF, 0);
    }
    public END(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.END, 0);
    }
    public THEN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THEN, 0);
    }
    public LIKE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LIKE, 0);
    }
    public IN(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.IN, 0);
    }
    public INCLUDES(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.INCLUDES, 0);
    }
    public EXCLUDES(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.EXCLUDES, 0);
    }
    public ASC(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ASC, 0);
    }
    public DESC(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DESC, 0);
    }
    public NULLS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NULLS, 0);
    }
    public FIRST(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FIRST, 0);
    }
    public LAST(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST, 0);
    }
    public GROUP(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.GROUP, 0);
    }
    public ALL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ALL, 0);
    }
    public ROWS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ROWS, 0);
    }
    public VIEW(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.VIEW, 0);
    }
    public HAVING(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.HAVING, 0);
    }
    public ROLLUP(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ROLLUP, 0);
    }
    public TOLABEL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TOLABEL, 0);
    }
    public OFFSET(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.OFFSET, 0);
    }
    public DATA(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DATA, 0);
    }
    public CATEGORY(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CATEGORY, 0);
    }
    public AT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.AT, 0);
    }
    public ABOVE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ABOVE, 0);
    }
    public BELOW(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.BELOW, 0);
    }
    public ABOVE_OR_BELOW(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.ABOVE_OR_BELOW, 0);
    }
    public SECURITY_ENFORCED(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SECURITY_ENFORCED, 0);
    }
    public SYSTEM_MODE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SYSTEM_MODE, 0);
    }
    public USER_MODE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.USER_MODE, 0);
    }
    public REFERENCE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.REFERENCE, 0);
    }
    public CUBE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CUBE, 0);
    }
    public FORMAT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FORMAT, 0);
    }
    public TRACKING(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TRACKING, 0);
    }
    public VIEWSTAT(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.VIEWSTAT, 0);
    }
    public STANDARD(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.STANDARD, 0);
    }
    public CUSTOM(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CUSTOM, 0);
    }
    public DISTANCE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DISTANCE, 0);
    }
    public GEOLOCATION(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.GEOLOCATION, 0);
    }
    public CALENDAR_MONTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CALENDAR_MONTH, 0);
    }
    public CALENDAR_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CALENDAR_QUARTER, 0);
    }
    public CALENDAR_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CALENDAR_YEAR, 0);
    }
    public DAY_IN_MONTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DAY_IN_MONTH, 0);
    }
    public DAY_IN_WEEK(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DAY_IN_WEEK, 0);
    }
    public DAY_IN_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DAY_IN_YEAR, 0);
    }
    public DAY_ONLY(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DAY_ONLY, 0);
    }
    public FISCAL_MONTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FISCAL_MONTH, 0);
    }
    public FISCAL_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FISCAL_QUARTER, 0);
    }
    public FISCAL_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FISCAL_YEAR, 0);
    }
    public HOUR_IN_DAY(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.HOUR_IN_DAY, 0);
    }
    public WEEK_IN_MONTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.WEEK_IN_MONTH, 0);
    }
    public WEEK_IN_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.WEEK_IN_YEAR, 0);
    }
    public CONVERT_TIMEZONE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.CONVERT_TIMEZONE, 0);
    }
    public YESTERDAY(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.YESTERDAY, 0);
    }
    public TODAY(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TODAY, 0);
    }
    public TOMORROW(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TOMORROW, 0);
    }
    public LAST_WEEK(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_WEEK, 0);
    }
    public THIS_WEEK(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THIS_WEEK, 0);
    }
    public NEXT_WEEK(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_WEEK, 0);
    }
    public LAST_MONTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_MONTH, 0);
    }
    public THIS_MONTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THIS_MONTH, 0);
    }
    public NEXT_MONTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_MONTH, 0);
    }
    public LAST_90_DAYS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_90_DAYS, 0);
    }
    public NEXT_90_DAYS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_90_DAYS, 0);
    }
    public LAST_N_DAYS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_N_DAYS_N, 0);
    }
    public NEXT_N_DAYS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_N_DAYS_N, 0);
    }
    public N_DAYS_AGO_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.N_DAYS_AGO_N, 0);
    }
    public NEXT_N_WEEKS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_N_WEEKS_N, 0);
    }
    public LAST_N_WEEKS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_N_WEEKS_N, 0);
    }
    public N_WEEKS_AGO_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.N_WEEKS_AGO_N, 0);
    }
    public NEXT_N_MONTHS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_N_MONTHS_N, 0);
    }
    public LAST_N_MONTHS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_N_MONTHS_N, 0);
    }
    public N_MONTHS_AGO_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.N_MONTHS_AGO_N, 0);
    }
    public THIS_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THIS_QUARTER, 0);
    }
    public LAST_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_QUARTER, 0);
    }
    public NEXT_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_QUARTER, 0);
    }
    public NEXT_N_QUARTERS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_N_QUARTERS_N, 0);
    }
    public LAST_N_QUARTERS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_N_QUARTERS_N, 0);
    }
    public N_QUARTERS_AGO_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.N_QUARTERS_AGO_N, 0);
    }
    public THIS_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THIS_YEAR, 0);
    }
    public LAST_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_YEAR, 0);
    }
    public NEXT_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_YEAR, 0);
    }
    public NEXT_N_YEARS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_N_YEARS_N, 0);
    }
    public LAST_N_YEARS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_N_YEARS_N, 0);
    }
    public N_YEARS_AGO_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.N_YEARS_AGO_N, 0);
    }
    public THIS_FISCAL_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THIS_FISCAL_QUARTER, 0);
    }
    public LAST_FISCAL_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_FISCAL_QUARTER, 0);
    }
    public NEXT_FISCAL_QUARTER(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_FISCAL_QUARTER, 0);
    }
    public NEXT_N_FISCAL_QUARTERS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_N_FISCAL_QUARTERS_N, 0);
    }
    public LAST_N_FISCAL_QUARTERS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_N_FISCAL_QUARTERS_N, 0);
    }
    public N_FISCAL_QUARTERS_AGO_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.N_FISCAL_QUARTERS_AGO_N, 0);
    }
    public THIS_FISCAL_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.THIS_FISCAL_YEAR, 0);
    }
    public LAST_FISCAL_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_FISCAL_YEAR, 0);
    }
    public NEXT_FISCAL_YEAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_FISCAL_YEAR, 0);
    }
    public NEXT_N_FISCAL_YEARS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NEXT_N_FISCAL_YEARS_N, 0);
    }
    public LAST_N_FISCAL_YEARS_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LAST_N_FISCAL_YEARS_N, 0);
    }
    public N_FISCAL_YEARS_AGO_N(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.N_FISCAL_YEARS_AGO_N, 0);
    }
    public FIND(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FIND, 0);
    }
    public EMAIL(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.EMAIL, 0);
    }
    public NAME(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NAME, 0);
    }
    public PHONE(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.PHONE, 0);
    }
    public SIDEBAR(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SIDEBAR, 0);
    }
    public FIELDS(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.FIELDS, 0);
    }
    public METADATA(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.METADATA, 0);
    }
    public PRICEBOOKID(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.PRICEBOOKID, 0);
    }
    public NETWORK(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.NETWORK, 0);
    }
    public SNIPPET(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.SNIPPET, 0);
    }
    public TARGET_LENGTH(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.TARGET_LENGTH, 0);
    }
    public DIVISION(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.DIVISION, 0);
    }
    public RETURNING(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.RETURNING, 0);
    }
    public LISTVIEW(): antlr.TerminalNode | null {
        return this.getToken(ApexParser.LISTVIEW, 0);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_anyId;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterAnyId) {
             listener.enterAnyId(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitAnyId) {
             listener.exitAnyId(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitAnyId) {
            return visitor.visitAnyId(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
