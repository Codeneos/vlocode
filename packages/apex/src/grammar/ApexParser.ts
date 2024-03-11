// Generated from ./grammar/ApexParser.g4 by ANTLR 4.13.1

import * as antlr from "antlr4ng";

import { ApexParserListener } from "./ApexParserListener.js";
import { ApexParserVisitor } from "./ApexParserVisitor.js";

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
    public static readonly COLON = 214;
    public static readonly EQUAL = 215;
    public static readonly TRIPLEEQUAL = 216;
    public static readonly NOTEQUAL = 217;
    public static readonly LESSANDGREATER = 218;
    public static readonly TRIPLENOTEQUAL = 219;
    public static readonly AND = 220;
    public static readonly OR = 221;
    public static readonly INC = 222;
    public static readonly DEC = 223;
    public static readonly ADD = 224;
    public static readonly SUB = 225;
    public static readonly MUL = 226;
    public static readonly DIV = 227;
    public static readonly BITAND = 228;
    public static readonly BITOR = 229;
    public static readonly CARET = 230;
    public static readonly MAPTO = 231;
    public static readonly ADD_ASSIGN = 232;
    public static readonly SUB_ASSIGN = 233;
    public static readonly MUL_ASSIGN = 234;
    public static readonly DIV_ASSIGN = 235;
    public static readonly AND_ASSIGN = 236;
    public static readonly OR_ASSIGN = 237;
    public static readonly XOR_ASSIGN = 238;
    public static readonly LSHIFT_ASSIGN = 239;
    public static readonly RSHIFT_ASSIGN = 240;
    public static readonly URSHIFT_ASSIGN = 241;
    public static readonly ATSIGN = 242;
    public static readonly Identifier = 243;
    public static readonly WS = 244;
    public static readonly DOC_COMMENT = 245;
    public static readonly COMMENT = 246;
    public static readonly LINE_COMMENT = 247;
    public static readonly RULE_triggerUnit = 0;
    public static readonly RULE_triggerUnit2 = 1;
    public static readonly RULE_triggerCase = 2;
    public static readonly RULE_triggerBlock = 3;
    public static readonly RULE_triggerBlockMember = 4;
    public static readonly RULE_compilationUnit = 5;
    public static readonly RULE_typeDeclaration = 6;
    public static readonly RULE_classDeclaration = 7;
    public static readonly RULE_enumDeclaration = 8;
    public static readonly RULE_enumConstants = 9;
    public static readonly RULE_interfaceDeclaration = 10;
    public static readonly RULE_typeList = 11;
    public static readonly RULE_classBody = 12;
    public static readonly RULE_interfaceBody = 13;
    public static readonly RULE_classBodyDeclaration = 14;
    public static readonly RULE_modifier = 15;
    public static readonly RULE_memberDeclaration = 16;
    public static readonly RULE_triggerMemberDeclaration = 17;
    public static readonly RULE_methodDeclaration = 18;
    public static readonly RULE_constructorDeclaration = 19;
    public static readonly RULE_fieldDeclaration = 20;
    public static readonly RULE_propertyDeclaration = 21;
    public static readonly RULE_interfaceMethodDeclaration = 22;
    public static readonly RULE_variableDeclarators = 23;
    public static readonly RULE_variableDeclarator = 24;
    public static readonly RULE_arrayInitializer = 25;
    public static readonly RULE_typeRef = 26;
    public static readonly RULE_arraySubscripts = 27;
    public static readonly RULE_typeName = 28;
    public static readonly RULE_typeArguments = 29;
    public static readonly RULE_formalParameters = 30;
    public static readonly RULE_formalParameterList = 31;
    public static readonly RULE_formalParameter = 32;
    public static readonly RULE_qualifiedName = 33;
    public static readonly RULE_literal = 34;
    public static readonly RULE_annotation = 35;
    public static readonly RULE_elementValuePairs = 36;
    public static readonly RULE_elementValuePair = 37;
    public static readonly RULE_elementValue = 38;
    public static readonly RULE_elementValueArrayInitializer = 39;
    public static readonly RULE_block = 40;
    public static readonly RULE_localVariableDeclarationStatement = 41;
    public static readonly RULE_localVariableDeclaration = 42;
    public static readonly RULE_statement = 43;
    public static readonly RULE_ifStatement = 44;
    public static readonly RULE_switchStatement = 45;
    public static readonly RULE_whenControl = 46;
    public static readonly RULE_whenValue = 47;
    public static readonly RULE_whenLiteral = 48;
    public static readonly RULE_forStatement = 49;
    public static readonly RULE_whileStatement = 50;
    public static readonly RULE_doWhileStatement = 51;
    public static readonly RULE_tryStatement = 52;
    public static readonly RULE_returnStatement = 53;
    public static readonly RULE_throwStatement = 54;
    public static readonly RULE_breakStatement = 55;
    public static readonly RULE_continueStatement = 56;
    public static readonly RULE_accessLevel = 57;
    public static readonly RULE_insertStatement = 58;
    public static readonly RULE_updateStatement = 59;
    public static readonly RULE_deleteStatement = 60;
    public static readonly RULE_undeleteStatement = 61;
    public static readonly RULE_upsertStatement = 62;
    public static readonly RULE_mergeStatement = 63;
    public static readonly RULE_runAsStatement = 64;
    public static readonly RULE_expressionStatement = 65;
    public static readonly RULE_propertyBlock = 66;
    public static readonly RULE_getter = 67;
    public static readonly RULE_setter = 68;
    public static readonly RULE_catchClause = 69;
    public static readonly RULE_finallyBlock = 70;
    public static readonly RULE_forControl = 71;
    public static readonly RULE_forInit = 72;
    public static readonly RULE_enhancedForControl = 73;
    public static readonly RULE_forUpdate = 74;
    public static readonly RULE_parExpression = 75;
    public static readonly RULE_expressionList = 76;
    public static readonly RULE_expression = 77;
    public static readonly RULE_primary = 78;
    public static readonly RULE_methodCall = 79;
    public static readonly RULE_dotMethodCall = 80;
    public static readonly RULE_creator = 81;
    public static readonly RULE_createdName = 82;
    public static readonly RULE_idCreatedNamePair = 83;
    public static readonly RULE_noRest = 84;
    public static readonly RULE_classCreatorRest = 85;
    public static readonly RULE_arrayCreatorRest = 86;
    public static readonly RULE_mapCreatorRest = 87;
    public static readonly RULE_mapCreatorRestPair = 88;
    public static readonly RULE_setCreatorRest = 89;
    public static readonly RULE_arguments = 90;
    public static readonly RULE_soqlLiteral = 91;
    public static readonly RULE_query = 92;
    public static readonly RULE_subQuery = 93;
    public static readonly RULE_selectList = 94;
    public static readonly RULE_selectEntry = 95;
    public static readonly RULE_fieldName = 96;
    public static readonly RULE_fromNameList = 97;
    public static readonly RULE_subFieldList = 98;
    public static readonly RULE_subFieldEntry = 99;
    public static readonly RULE_soqlFieldsParameter = 100;
    public static readonly RULE_soqlFunction = 101;
    public static readonly RULE_dateFieldName = 102;
    public static readonly RULE_locationValue = 103;
    public static readonly RULE_coordinateValue = 104;
    public static readonly RULE_typeOf = 105;
    public static readonly RULE_whenClause = 106;
    public static readonly RULE_elseClause = 107;
    public static readonly RULE_fieldNameList = 108;
    public static readonly RULE_usingScope = 109;
    public static readonly RULE_whereClause = 110;
    public static readonly RULE_logicalExpression = 111;
    public static readonly RULE_conditionalExpression = 112;
    public static readonly RULE_fieldExpression = 113;
    public static readonly RULE_comparisonOperator = 114;
    public static readonly RULE_value = 115;
    public static readonly RULE_valueList = 116;
    public static readonly RULE_signedNumber = 117;
    public static readonly RULE_withClause = 118;
    public static readonly RULE_filteringExpression = 119;
    public static readonly RULE_dataCategorySelection = 120;
    public static readonly RULE_dataCategoryName = 121;
    public static readonly RULE_filteringSelector = 122;
    public static readonly RULE_groupByClause = 123;
    public static readonly RULE_orderByClause = 124;
    public static readonly RULE_fieldOrderList = 125;
    public static readonly RULE_fieldOrder = 126;
    public static readonly RULE_limitClause = 127;
    public static readonly RULE_offsetClause = 128;
    public static readonly RULE_allRowsClause = 129;
    public static readonly RULE_forClauses = 130;
    public static readonly RULE_boundExpression = 131;
    public static readonly RULE_dateFormula = 132;
    public static readonly RULE_signedInteger = 133;
    public static readonly RULE_soqlId = 134;
    public static readonly RULE_soslLiteral = 135;
    public static readonly RULE_soslLiteralAlt = 136;
    public static readonly RULE_soslClauses = 137;
    public static readonly RULE_searchGroup = 138;
    public static readonly RULE_fieldSpecList = 139;
    public static readonly RULE_fieldSpec = 140;
    public static readonly RULE_fieldList = 141;
    public static readonly RULE_updateList = 142;
    public static readonly RULE_updateType = 143;
    public static readonly RULE_networkList = 144;
    public static readonly RULE_soslId = 145;
    public static readonly RULE_id = 146;
    public static readonly RULE_anyId = 147;

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
        "'<'", "'!'", "'~'", "'?.'", "'?'", "':'", "'=='", "'==='", "'!='", 
        "'<>'", "'!=='", "'&&'", "'||'", "'++'", "'--'", "'+'", "'-'", "'*'", 
        "'/'", "'&'", "'|'", "'^'", "'=>'", "'+='", "'-='", "'*='", "'/='", 
        "'&='", "'|='", "'^='", "'<<='", "'>>='", "'>>>='", "'@'"
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
        "QUESTION", "COLON", "EQUAL", "TRIPLEEQUAL", "NOTEQUAL", "LESSANDGREATER", 
        "TRIPLENOTEQUAL", "AND", "OR", "INC", "DEC", "ADD", "SUB", "MUL", 
        "DIV", "BITAND", "BITOR", "CARET", "MAPTO", "ADD_ASSIGN", "SUB_ASSIGN", 
        "MUL_ASSIGN", "DIV_ASSIGN", "AND_ASSIGN", "OR_ASSIGN", "XOR_ASSIGN", 
        "LSHIFT_ASSIGN", "RSHIFT_ASSIGN", "URSHIFT_ASSIGN", "ATSIGN", "Identifier", 
        "WS", "DOC_COMMENT", "COMMENT", "LINE_COMMENT"
    ];
    public static readonly ruleNames = [
        "triggerUnit", "triggerUnit2", "triggerCase", "triggerBlock", "triggerBlockMember", 
        "compilationUnit", "typeDeclaration", "classDeclaration", "enumDeclaration", 
        "enumConstants", "interfaceDeclaration", "typeList", "classBody", 
        "interfaceBody", "classBodyDeclaration", "modifier", "memberDeclaration", 
        "triggerMemberDeclaration", "methodDeclaration", "constructorDeclaration", 
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
    public triggerUnit(): TriggerUnitContext {
        const localContext = new TriggerUnitContext(this.context, this.state);
        this.enterRule(localContext, 0, ApexParser.RULE_triggerUnit);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 296;
            this.match(ApexParser.TRIGGER);
            this.state = 297;
            this.id();
            this.state = 298;
            this.match(ApexParser.ON);
            this.state = 299;
            this.id();
            this.state = 300;
            this.match(ApexParser.LPAREN);
            this.state = 301;
            this.triggerCase();
            this.state = 306;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 302;
                this.match(ApexParser.COMMA);
                this.state = 303;
                this.triggerCase();
                }
                }
                this.state = 308;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 309;
            this.match(ApexParser.RPAREN);
            this.state = 310;
            this.block();
            this.state = 311;
            this.match(ApexParser.EOF);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
    public triggerUnit2(): TriggerUnit2Context {
        const localContext = new TriggerUnit2Context(this.context, this.state);
        this.enterRule(localContext, 2, ApexParser.RULE_triggerUnit2);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 313;
            this.match(ApexParser.TRIGGER);
            this.state = 314;
            this.id();
            this.state = 315;
            this.match(ApexParser.ON);
            this.state = 316;
            this.id();
            this.state = 317;
            this.match(ApexParser.LPAREN);
            this.state = 318;
            this.triggerCase();
            this.state = 323;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 319;
                this.match(ApexParser.COMMA);
                this.state = 320;
                this.triggerCase();
                }
                }
                this.state = 325;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 326;
            this.match(ApexParser.RPAREN);
            this.state = 327;
            this.triggerBlock();
            this.state = 328;
            this.match(ApexParser.EOF);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
    public triggerCase(): TriggerCaseContext {
        const localContext = new TriggerCaseContext(this.context, this.state);
        this.enterRule(localContext, 4, ApexParser.RULE_triggerCase);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 330;
            _la = this.tokenStream.LA(1);
            if(!(_la === 2 || _la === 3)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 331;
            _la = this.tokenStream.LA(1);
            if(!(_la === 8 || _la === 21 || _la === 45 || _la === 46)) {
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
                localContext.exception = re;
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
    public triggerBlock(): TriggerBlockContext {
        const localContext = new TriggerBlockContext(this.context, this.state);
        this.enterRule(localContext, 6, ApexParser.RULE_triggerBlock);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 333;
            this.match(ApexParser.LBRACE);
            this.state = 337;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4160203742) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & 4294967295) !== 0) || ((((_la - 64)) & ~0x1F) === 0 && ((1 << (_la - 64)) & 4294967295) !== 0) || ((((_la - 96)) & ~0x1F) === 0 && ((1 << (_la - 96)) & 4294967295) !== 0) || ((((_la - 128)) & ~0x1F) === 0 && ((1 << (_la - 128)) & 4294967295) !== 0) || ((((_la - 160)) & ~0x1F) === 0 && ((1 << (_la - 160)) & 2147459071) !== 0) || ((((_la - 192)) & ~0x1F) === 0 && ((1 << (_la - 192)) & 3222013279) !== 0) || ((((_la - 224)) & ~0x1F) === 0 && ((1 << (_la - 224)) & 786435) !== 0)) {
                {
                {
                this.state = 334;
                this.triggerBlockMember();
                }
                }
                this.state = 339;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 340;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
    public triggerBlockMember(): TriggerBlockMemberContext {
        const localContext = new TriggerBlockMemberContext(this.context, this.state);
        this.enterRule(localContext, 8, ApexParser.RULE_triggerBlockMember);
        try {
            let alternative: number;
            this.state = 350;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 4, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 345;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 3, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 342;
                        this.modifier();
                        }
                        }
                    }
                    this.state = 347;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 3, this.context);
                }
                this.state = 348;
                this.triggerMemberDeclaration();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 349;
                this.statement();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
    public compilationUnit(): CompilationUnitContext {
        const localContext = new CompilationUnitContext(this.context, this.state);
        this.enterRule(localContext, 10, ApexParser.RULE_compilationUnit);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 355;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4036110402) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & 413769) !== 0) || _la === 242) {
                {
                {
                this.state = 352;
                this.typeDeclaration();
                }
                }
                this.state = 357;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 358;
            this.match(ApexParser.EOF);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new TypeDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 12, ApexParser.RULE_typeDeclaration);
        let _la: number;
        try {
            this.state = 381;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 9, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 363;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4027719682) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & 413769) !== 0) || _la === 242) {
                    {
                    {
                    this.state = 360;
                    this.modifier();
                    }
                    }
                    this.state = 365;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 366;
                this.classDeclaration();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 370;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4027719682) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & 413769) !== 0) || _la === 242) {
                    {
                    {
                    this.state = 367;
                    this.modifier();
                    }
                    }
                    this.state = 372;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 373;
                this.enumDeclaration();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 377;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4027719682) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & 413769) !== 0) || _la === 242) {
                    {
                    {
                    this.state = 374;
                    this.modifier();
                    }
                    }
                    this.state = 379;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 380;
                this.interfaceDeclaration();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ClassDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 14, ApexParser.RULE_classDeclaration);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 383;
            this.match(ApexParser.CLASS);
            this.state = 384;
            this.id();
            this.state = 387;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 12) {
                {
                this.state = 385;
                this.match(ApexParser.EXTENDS);
                this.state = 386;
                this.typeRef();
                }
            }

            this.state = 391;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 19) {
                {
                this.state = 389;
                this.match(ApexParser.IMPLEMENTS);
                this.state = 390;
                this.typeList();
                }
            }

            this.state = 393;
            this.classBody();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new EnumDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 16, ApexParser.RULE_enumDeclaration);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 395;
            this.match(ApexParser.ENUM);
            this.state = 396;
            this.id();
            this.state = 397;
            this.match(ApexParser.LBRACE);
            this.state = 399;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 5308428) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4288283411) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 268429311) !== 0) || _la === 243) {
                {
                this.state = 398;
                this.enumConstants();
                }
            }

            this.state = 401;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new EnumConstantsContext(this.context, this.state);
        this.enterRule(localContext, 18, ApexParser.RULE_enumConstants);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 403;
            this.id();
            this.state = 408;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 404;
                this.match(ApexParser.COMMA);
                this.state = 405;
                this.id();
                }
                }
                this.state = 410;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new InterfaceDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 20, ApexParser.RULE_interfaceDeclaration);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 411;
            this.match(ApexParser.INTERFACE);
            this.state = 412;
            this.id();
            this.state = 415;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 12) {
                {
                this.state = 413;
                this.match(ApexParser.EXTENDS);
                this.state = 414;
                this.typeList();
                }
            }

            this.state = 417;
            this.interfaceBody();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new TypeListContext(this.context, this.state);
        this.enterRule(localContext, 22, ApexParser.RULE_typeList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 419;
            this.typeRef();
            this.state = 424;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 420;
                this.match(ApexParser.COMMA);
                this.state = 421;
                this.typeRef();
                }
                }
                this.state = 426;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ClassBodyContext(this.context, this.state);
        this.enterRule(localContext, 24, ApexParser.RULE_classBody);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 427;
            this.match(ApexParser.LBRACE);
            this.state = 431;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4040370254) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294689591) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 268429311) !== 0) || _la === 200 || _la === 204 || _la === 242 || _la === 243) {
                {
                {
                this.state = 428;
                this.classBodyDeclaration();
                }
                }
                this.state = 433;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 434;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new InterfaceBodyContext(this.context, this.state);
        this.enterRule(localContext, 26, ApexParser.RULE_interfaceBody);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 436;
            this.match(ApexParser.LBRACE);
            this.state = 440;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4031979534) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294689591) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 268429311) !== 0) || _la === 242 || _la === 243) {
                {
                {
                this.state = 437;
                this.interfaceMethodDeclaration();
                }
                }
                this.state = 442;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 443;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ClassBodyDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 28, ApexParser.RULE_classBodyDeclaration);
        let _la: number;
        try {
            let alternative: number;
            this.state = 457;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 20, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 445;
                this.match(ApexParser.SEMI);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 447;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 36) {
                    {
                    this.state = 446;
                    this.match(ApexParser.STATIC);
                    }
                }

                this.state = 449;
                this.block();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 453;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 19, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 450;
                        this.modifier();
                        }
                        }
                    }
                    this.state = 455;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 19, this.context);
                }
                this.state = 456;
                this.memberDeclaration();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ModifierContext(this.context, this.state);
        this.enterRule(localContext, 30, ApexParser.RULE_modifier);
        try {
            this.state = 478;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.ATSIGN:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 459;
                this.annotation();
                }
                break;
            case ApexParser.GLOBAL:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 460;
                this.match(ApexParser.GLOBAL);
                }
                break;
            case ApexParser.PUBLIC:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 461;
                this.match(ApexParser.PUBLIC);
                }
                break;
            case ApexParser.PROTECTED:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 462;
                this.match(ApexParser.PROTECTED);
                }
                break;
            case ApexParser.PRIVATE:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 463;
                this.match(ApexParser.PRIVATE);
                }
                break;
            case ApexParser.TRANSIENT:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 464;
                this.match(ApexParser.TRANSIENT);
                }
                break;
            case ApexParser.STATIC:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 465;
                this.match(ApexParser.STATIC);
                }
                break;
            case ApexParser.ABSTRACT:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 466;
                this.match(ApexParser.ABSTRACT);
                }
                break;
            case ApexParser.FINAL:
                this.enterOuterAlt(localContext, 9);
                {
                this.state = 467;
                this.match(ApexParser.FINAL);
                }
                break;
            case ApexParser.WEBSERVICE:
                this.enterOuterAlt(localContext, 10);
                {
                this.state = 468;
                this.match(ApexParser.WEBSERVICE);
                }
                break;
            case ApexParser.OVERRIDE:
                this.enterOuterAlt(localContext, 11);
                {
                this.state = 469;
                this.match(ApexParser.OVERRIDE);
                }
                break;
            case ApexParser.VIRTUAL:
                this.enterOuterAlt(localContext, 12);
                {
                this.state = 470;
                this.match(ApexParser.VIRTUAL);
                }
                break;
            case ApexParser.TESTMETHOD:
                this.enterOuterAlt(localContext, 13);
                {
                this.state = 471;
                this.match(ApexParser.TESTMETHOD);
                }
                break;
            case ApexParser.WITH:
                this.enterOuterAlt(localContext, 14);
                {
                this.state = 472;
                this.match(ApexParser.WITH);
                this.state = 473;
                this.match(ApexParser.SHARING);
                }
                break;
            case ApexParser.WITHOUT:
                this.enterOuterAlt(localContext, 15);
                {
                this.state = 474;
                this.match(ApexParser.WITHOUT);
                this.state = 475;
                this.match(ApexParser.SHARING);
                }
                break;
            case ApexParser.INHERITED:
                this.enterOuterAlt(localContext, 16);
                {
                this.state = 476;
                this.match(ApexParser.INHERITED);
                this.state = 477;
                this.match(ApexParser.SHARING);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new MemberDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 32, ApexParser.RULE_memberDeclaration);
        try {
            this.state = 487;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 22, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 480;
                this.methodDeclaration();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 481;
                this.fieldDeclaration();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 482;
                this.constructorDeclaration();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 483;
                this.interfaceDeclaration();
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 484;
                this.classDeclaration();
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 485;
                this.enumDeclaration();
                }
                break;
            case 7:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 486;
                this.propertyDeclaration();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
    public triggerMemberDeclaration(): TriggerMemberDeclarationContext {
        const localContext = new TriggerMemberDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 34, ApexParser.RULE_triggerMemberDeclaration);
        try {
            this.state = 495;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 23, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 489;
                this.methodDeclaration();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 490;
                this.fieldDeclaration();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 491;
                this.interfaceDeclaration();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 492;
                this.classDeclaration();
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 493;
                this.enumDeclaration();
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 494;
                this.propertyDeclaration();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new MethodDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 36, ApexParser.RULE_methodDeclaration);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 499;
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
                this.state = 497;
                this.typeRef();
                }
                break;
            case ApexParser.VOID:
                {
                this.state = 498;
                this.match(ApexParser.VOID);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            this.state = 501;
            this.id();
            this.state = 502;
            this.formalParameters();
            this.state = 505;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.LBRACE:
                {
                this.state = 503;
                this.block();
                }
                break;
            case ApexParser.SEMI:
                {
                this.state = 504;
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
                localContext.exception = re;
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
        const localContext = new ConstructorDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 38, ApexParser.RULE_constructorDeclaration);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 507;
            this.qualifiedName();
            this.state = 508;
            this.formalParameters();
            this.state = 509;
            this.block();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new FieldDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 40, ApexParser.RULE_fieldDeclaration);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 511;
            this.typeRef();
            this.state = 512;
            this.variableDeclarators();
            this.state = 513;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new PropertyDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 42, ApexParser.RULE_propertyDeclaration);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 515;
            this.typeRef();
            this.state = 516;
            this.id();
            this.state = 517;
            this.match(ApexParser.LBRACE);
            this.state = 521;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4027785218) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 1655077) !== 0) || _la === 242) {
                {
                {
                this.state = 518;
                this.propertyBlock();
                }
                }
                this.state = 523;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 524;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new InterfaceMethodDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 44, ApexParser.RULE_interfaceMethodDeclaration);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 529;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 27, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 526;
                    this.modifier();
                    }
                    }
                }
                this.state = 531;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 27, this.context);
            }
            this.state = 534;
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
                this.state = 532;
                this.typeRef();
                }
                break;
            case ApexParser.VOID:
                {
                this.state = 533;
                this.match(ApexParser.VOID);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            this.state = 536;
            this.id();
            this.state = 537;
            this.formalParameters();
            this.state = 538;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new VariableDeclaratorsContext(this.context, this.state);
        this.enterRule(localContext, 46, ApexParser.RULE_variableDeclarators);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 540;
            this.variableDeclarator();
            this.state = 545;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 541;
                this.match(ApexParser.COMMA);
                this.state = 542;
                this.variableDeclarator();
                }
                }
                this.state = 547;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new VariableDeclaratorContext(this.context, this.state);
        this.enterRule(localContext, 48, ApexParser.RULE_variableDeclarator);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 548;
            this.id();
            this.state = 551;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 207) {
                {
                this.state = 549;
                this.match(ApexParser.ASSIGN);
                this.state = 550;
                this.expression(0);
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ArrayInitializerContext(this.context, this.state);
        this.enterRule(localContext, 50, ApexParser.RULE_arrayInitializer);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 553;
            this.match(ApexParser.LBRACE);
            this.state = 565;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 4026728727) !== 0) || _la === 243) {
                {
                this.state = 554;
                this.expression(0);
                this.state = 559;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 31, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 555;
                        this.match(ApexParser.COMMA);
                        this.state = 556;
                        this.expression(0);
                        }
                        }
                    }
                    this.state = 561;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 31, this.context);
                }
                this.state = 563;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 205) {
                    {
                    this.state = 562;
                    this.match(ApexParser.COMMA);
                    }
                }

                }
            }

            this.state = 567;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new TypeRefContext(this.context, this.state);
        this.enterRule(localContext, 52, ApexParser.RULE_typeRef);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 569;
            this.typeName();
            this.state = 574;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 34, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 570;
                    this.match(ApexParser.DOT);
                    this.state = 571;
                    this.typeName();
                    }
                    }
                }
                this.state = 576;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 34, this.context);
            }
            this.state = 577;
            this.arraySubscripts();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ArraySubscriptsContext(this.context, this.state);
        this.enterRule(localContext, 54, ApexParser.RULE_arraySubscripts);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 583;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 35, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 579;
                    this.match(ApexParser.LBRACK);
                    this.state = 580;
                    this.match(ApexParser.RBRACK);
                    }
                    }
                }
                this.state = 585;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 35, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new TypeNameContext(this.context, this.state);
        this.enterRule(localContext, 56, ApexParser.RULE_typeName);
        try {
            this.state = 602;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 40, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 586;
                this.match(ApexParser.LIST);
                this.state = 588;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 36, this.context) ) {
                case 1:
                    {
                    this.state = 587;
                    this.typeArguments();
                    }
                    break;
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 590;
                this.match(ApexParser.SET);
                this.state = 592;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 37, this.context) ) {
                case 1:
                    {
                    this.state = 591;
                    this.typeArguments();
                    }
                    break;
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 594;
                this.match(ApexParser.MAP);
                this.state = 596;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 38, this.context) ) {
                case 1:
                    {
                    this.state = 595;
                    this.typeArguments();
                    }
                    break;
                }
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 598;
                this.id();
                this.state = 600;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 39, this.context) ) {
                case 1:
                    {
                    this.state = 599;
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
                localContext.exception = re;
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
        const localContext = new TypeArgumentsContext(this.context, this.state);
        this.enterRule(localContext, 58, ApexParser.RULE_typeArguments);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 604;
            this.match(ApexParser.LT);
            this.state = 605;
            this.typeList();
            this.state = 606;
            this.match(ApexParser.GT);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new FormalParametersContext(this.context, this.state);
        this.enterRule(localContext, 60, ApexParser.RULE_formalParameters);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 608;
            this.match(ApexParser.LPAREN);
            this.state = 610;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4031979534) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294656823) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 268429311) !== 0) || _la === 242 || _la === 243) {
                {
                this.state = 609;
                this.formalParameterList();
                }
            }

            this.state = 612;
            this.match(ApexParser.RPAREN);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new FormalParameterListContext(this.context, this.state);
        this.enterRule(localContext, 62, ApexParser.RULE_formalParameterList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 614;
            this.formalParameter();
            this.state = 619;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 615;
                this.match(ApexParser.COMMA);
                this.state = 616;
                this.formalParameter();
                }
                }
                this.state = 621;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new FormalParameterContext(this.context, this.state);
        this.enterRule(localContext, 64, ApexParser.RULE_formalParameter);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 625;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 43, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 622;
                    this.modifier();
                    }
                    }
                }
                this.state = 627;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 43, this.context);
            }
            this.state = 628;
            this.typeRef();
            this.state = 629;
            this.id();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new QualifiedNameContext(this.context, this.state);
        this.enterRule(localContext, 66, ApexParser.RULE_qualifiedName);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 631;
            this.id();
            this.state = 636;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 206) {
                {
                {
                this.state = 632;
                this.match(ApexParser.DOT);
                this.state = 633;
                this.id();
                }
                }
                this.state = 638;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new LiteralContext(this.context, this.state);
        this.enterRule(localContext, 68, ApexParser.RULE_literal);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 639;
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
                localContext.exception = re;
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
        const localContext = new AnnotationContext(this.context, this.state);
        this.enterRule(localContext, 70, ApexParser.RULE_annotation);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 641;
            this.match(ApexParser.ATSIGN);
            this.state = 642;
            this.qualifiedName();
            this.state = 649;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 198) {
                {
                this.state = 643;
                this.match(ApexParser.LPAREN);
                this.state = 646;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 45, this.context) ) {
                case 1:
                    {
                    this.state = 644;
                    this.elementValuePairs();
                    }
                    break;
                case 2:
                    {
                    this.state = 645;
                    this.elementValue();
                    }
                    break;
                }
                this.state = 648;
                this.match(ApexParser.RPAREN);
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ElementValuePairsContext(this.context, this.state);
        this.enterRule(localContext, 72, ApexParser.RULE_elementValuePairs);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 651;
            this.elementValuePair();
            this.state = 658;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 5308428) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4288283411) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 268429311) !== 0) || _la === 205 || _la === 243) {
                {
                {
                this.state = 653;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 205) {
                    {
                    this.state = 652;
                    this.match(ApexParser.COMMA);
                    }
                }

                this.state = 655;
                this.elementValuePair();
                }
                }
                this.state = 660;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ElementValuePairContext(this.context, this.state);
        this.enterRule(localContext, 74, ApexParser.RULE_elementValuePair);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 661;
            this.id();
            this.state = 662;
            this.match(ApexParser.ASSIGN);
            this.state = 663;
            this.elementValue();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ElementValueContext(this.context, this.state);
        this.enterRule(localContext, 76, ApexParser.RULE_elementValue);
        try {
            this.state = 668;
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
                this.state = 665;
                this.expression(0);
                }
                break;
            case ApexParser.ATSIGN:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 666;
                this.annotation();
                }
                break;
            case ApexParser.LBRACE:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 667;
                this.elementValueArrayInitializer();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ElementValueArrayInitializerContext(this.context, this.state);
        this.enterRule(localContext, 78, ApexParser.RULE_elementValueArrayInitializer);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 670;
            this.match(ApexParser.LBRACE);
            this.state = 679;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 4026728791) !== 0) || _la === 242 || _la === 243) {
                {
                this.state = 671;
                this.elementValue();
                this.state = 676;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 50, this.context);
                while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                    if (alternative === 1) {
                        {
                        {
                        this.state = 672;
                        this.match(ApexParser.COMMA);
                        this.state = 673;
                        this.elementValue();
                        }
                        }
                    }
                    this.state = 678;
                    this.errorHandler.sync(this);
                    alternative = this.interpreter.adaptivePredict(this.tokenStream, 50, this.context);
                }
                }
            }

            this.state = 682;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 205) {
                {
                this.state = 681;
                this.match(ApexParser.COMMA);
                }
            }

            this.state = 684;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new BlockContext(this.context, this.state);
        this.enterRule(localContext, 80, ApexParser.RULE_block);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 686;
            this.match(ApexParser.LBRACE);
            this.state = 690;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4151813022) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & 4294967295) !== 0) || ((((_la - 64)) & ~0x1F) === 0 && ((1 << (_la - 64)) & 4294967295) !== 0) || ((((_la - 96)) & ~0x1F) === 0 && ((1 << (_la - 96)) & 4294967295) !== 0) || ((((_la - 128)) & ~0x1F) === 0 && ((1 << (_la - 128)) & 4294967295) !== 0) || ((((_la - 160)) & ~0x1F) === 0 && ((1 << (_la - 160)) & 2147459071) !== 0) || ((((_la - 192)) & ~0x1F) === 0 && ((1 << (_la - 192)) & 3222013279) !== 0) || ((((_la - 224)) & ~0x1F) === 0 && ((1 << (_la - 224)) & 786435) !== 0)) {
                {
                {
                this.state = 687;
                this.statement();
                }
                }
                this.state = 692;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 693;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new LocalVariableDeclarationStatementContext(this.context, this.state);
        this.enterRule(localContext, 82, ApexParser.RULE_localVariableDeclarationStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 695;
            this.localVariableDeclaration();
            this.state = 696;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new LocalVariableDeclarationContext(this.context, this.state);
        this.enterRule(localContext, 84, ApexParser.RULE_localVariableDeclaration);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 701;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 54, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 698;
                    this.modifier();
                    }
                    }
                }
                this.state = 703;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 54, this.context);
            }
            this.state = 704;
            this.typeRef();
            this.state = 705;
            this.variableDeclarators();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new StatementContext(this.context, this.state);
        this.enterRule(localContext, 86, ApexParser.RULE_statement);
        try {
            this.state = 727;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 55, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 707;
                this.block();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 708;
                this.ifStatement();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 709;
                this.switchStatement();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 710;
                this.forStatement();
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 711;
                this.whileStatement();
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 712;
                this.doWhileStatement();
                }
                break;
            case 7:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 713;
                this.tryStatement();
                }
                break;
            case 8:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 714;
                this.returnStatement();
                }
                break;
            case 9:
                this.enterOuterAlt(localContext, 9);
                {
                this.state = 715;
                this.throwStatement();
                }
                break;
            case 10:
                this.enterOuterAlt(localContext, 10);
                {
                this.state = 716;
                this.breakStatement();
                }
                break;
            case 11:
                this.enterOuterAlt(localContext, 11);
                {
                this.state = 717;
                this.continueStatement();
                }
                break;
            case 12:
                this.enterOuterAlt(localContext, 12);
                {
                this.state = 718;
                this.insertStatement();
                }
                break;
            case 13:
                this.enterOuterAlt(localContext, 13);
                {
                this.state = 719;
                this.updateStatement();
                }
                break;
            case 14:
                this.enterOuterAlt(localContext, 14);
                {
                this.state = 720;
                this.deleteStatement();
                }
                break;
            case 15:
                this.enterOuterAlt(localContext, 15);
                {
                this.state = 721;
                this.undeleteStatement();
                }
                break;
            case 16:
                this.enterOuterAlt(localContext, 16);
                {
                this.state = 722;
                this.upsertStatement();
                }
                break;
            case 17:
                this.enterOuterAlt(localContext, 17);
                {
                this.state = 723;
                this.mergeStatement();
                }
                break;
            case 18:
                this.enterOuterAlt(localContext, 18);
                {
                this.state = 724;
                this.runAsStatement();
                }
                break;
            case 19:
                this.enterOuterAlt(localContext, 19);
                {
                this.state = 725;
                this.localVariableDeclarationStatement();
                }
                break;
            case 20:
                this.enterOuterAlt(localContext, 20);
                {
                this.state = 726;
                this.expressionStatement();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new IfStatementContext(this.context, this.state);
        this.enterRule(localContext, 88, ApexParser.RULE_ifStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 729;
            this.match(ApexParser.IF);
            this.state = 730;
            this.parExpression();
            this.state = 731;
            this.statement();
            this.state = 734;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 56, this.context) ) {
            case 1:
                {
                this.state = 732;
                this.match(ApexParser.ELSE);
                this.state = 733;
                this.statement();
                }
                break;
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new SwitchStatementContext(this.context, this.state);
        this.enterRule(localContext, 90, ApexParser.RULE_switchStatement);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 736;
            this.match(ApexParser.SWITCH);
            this.state = 737;
            this.match(ApexParser.ON);
            this.state = 738;
            this.expression(0);
            this.state = 739;
            this.match(ApexParser.LBRACE);
            this.state = 741;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 740;
                this.whenControl();
                }
                }
                this.state = 743;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while (_la === 51);
            this.state = 745;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new WhenControlContext(this.context, this.state);
        this.enterRule(localContext, 92, ApexParser.RULE_whenControl);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 747;
            this.match(ApexParser.WHEN);
            this.state = 748;
            this.whenValue();
            this.state = 749;
            this.block();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new WhenValueContext(this.context, this.state);
        this.enterRule(localContext, 94, ApexParser.RULE_whenValue);
        let _la: number;
        try {
            this.state = 763;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 59, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 751;
                this.match(ApexParser.ELSE);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 752;
                this.whenLiteral();
                this.state = 757;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 205) {
                    {
                    {
                    this.state = 753;
                    this.match(ApexParser.COMMA);
                    this.state = 754;
                    this.whenLiteral();
                    }
                    }
                    this.state = 759;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 760;
                this.id();
                this.state = 761;
                this.id();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new WhenLiteralContext(this.context, this.state);
        this.enterRule(localContext, 96, ApexParser.RULE_whenLiteral);
        let _la: number;
        try {
            this.state = 777;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.IntegerLiteral:
            case ApexParser.SUB:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 766;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 225) {
                    {
                    this.state = 765;
                    this.match(ApexParser.SUB);
                    }
                }

                this.state = 768;
                this.match(ApexParser.IntegerLiteral);
                }
                break;
            case ApexParser.LongLiteral:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 769;
                this.match(ApexParser.LongLiteral);
                }
                break;
            case ApexParser.StringLiteral:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 770;
                this.match(ApexParser.StringLiteral);
                }
                break;
            case ApexParser.NULL:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 771;
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
                this.state = 772;
                this.id();
                }
                break;
            case ApexParser.LPAREN:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 773;
                this.match(ApexParser.LPAREN);
                this.state = 774;
                this.whenLiteral();
                this.state = 775;
                this.match(ApexParser.RPAREN);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ForStatementContext(this.context, this.state);
        this.enterRule(localContext, 98, ApexParser.RULE_forStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 779;
            this.match(ApexParser.FOR);
            this.state = 780;
            this.match(ApexParser.LPAREN);
            this.state = 781;
            this.forControl();
            this.state = 782;
            this.match(ApexParser.RPAREN);
            this.state = 785;
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
                this.state = 783;
                this.statement();
                }
                break;
            case ApexParser.SEMI:
                {
                this.state = 784;
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
                localContext.exception = re;
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
        const localContext = new WhileStatementContext(this.context, this.state);
        this.enterRule(localContext, 100, ApexParser.RULE_whileStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 787;
            this.match(ApexParser.WHILE);
            this.state = 788;
            this.parExpression();
            this.state = 791;
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
                this.state = 789;
                this.statement();
                }
                break;
            case ApexParser.SEMI:
                {
                this.state = 790;
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
                localContext.exception = re;
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
        const localContext = new DoWhileStatementContext(this.context, this.state);
        this.enterRule(localContext, 102, ApexParser.RULE_doWhileStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 793;
            this.match(ApexParser.DO);
            this.state = 794;
            this.statement();
            this.state = 795;
            this.match(ApexParser.WHILE);
            this.state = 796;
            this.parExpression();
            this.state = 797;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new TryStatementContext(this.context, this.state);
        this.enterRule(localContext, 104, ApexParser.RULE_tryStatement);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 799;
            this.match(ApexParser.TRY);
            this.state = 800;
            this.block();
            this.state = 810;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.CATCH:
                {
                this.state = 802;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                do {
                    {
                    {
                    this.state = 801;
                    this.catchClause();
                    }
                    }
                    this.state = 804;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                } while (_la === 5);
                this.state = 807;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 14) {
                    {
                    this.state = 806;
                    this.finallyBlock();
                    }
                }

                }
                break;
            case ApexParser.FINALLY:
                {
                this.state = 809;
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
                localContext.exception = re;
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
        const localContext = new ReturnStatementContext(this.context, this.state);
        this.enterRule(localContext, 106, ApexParser.RULE_returnStatement);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 812;
            this.match(ApexParser.RETURN);
            this.state = 814;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 4026728727) !== 0) || _la === 243) {
                {
                this.state = 813;
                this.expression(0);
                }
            }

            this.state = 816;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ThrowStatementContext(this.context, this.state);
        this.enterRule(localContext, 108, ApexParser.RULE_throwStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 818;
            this.match(ApexParser.THROW);
            this.state = 819;
            this.expression(0);
            this.state = 820;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new BreakStatementContext(this.context, this.state);
        this.enterRule(localContext, 110, ApexParser.RULE_breakStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 822;
            this.match(ApexParser.BREAK);
            this.state = 823;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ContinueStatementContext(this.context, this.state);
        this.enterRule(localContext, 112, ApexParser.RULE_continueStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 825;
            this.match(ApexParser.CONTINUE);
            this.state = 826;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new AccessLevelContext(this.context, this.state);
        this.enterRule(localContext, 114, ApexParser.RULE_accessLevel);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 828;
            this.match(ApexParser.AS);
            this.state = 829;
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
                localContext.exception = re;
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
        const localContext = new InsertStatementContext(this.context, this.state);
        this.enterRule(localContext, 116, ApexParser.RULE_insertStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 831;
            this.match(ApexParser.INSERT);
            this.state = 833;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 68, this.context) ) {
            case 1:
                {
                this.state = 832;
                this.accessLevel();
                }
                break;
            }
            this.state = 835;
            this.expression(0);
            this.state = 836;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new UpdateStatementContext(this.context, this.state);
        this.enterRule(localContext, 118, ApexParser.RULE_updateStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 838;
            this.match(ApexParser.UPDATE);
            this.state = 840;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 69, this.context) ) {
            case 1:
                {
                this.state = 839;
                this.accessLevel();
                }
                break;
            }
            this.state = 842;
            this.expression(0);
            this.state = 843;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new DeleteStatementContext(this.context, this.state);
        this.enterRule(localContext, 120, ApexParser.RULE_deleteStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 845;
            this.match(ApexParser.DELETE);
            this.state = 847;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 70, this.context) ) {
            case 1:
                {
                this.state = 846;
                this.accessLevel();
                }
                break;
            }
            this.state = 849;
            this.expression(0);
            this.state = 850;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new UndeleteStatementContext(this.context, this.state);
        this.enterRule(localContext, 122, ApexParser.RULE_undeleteStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 852;
            this.match(ApexParser.UNDELETE);
            this.state = 854;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 71, this.context) ) {
            case 1:
                {
                this.state = 853;
                this.accessLevel();
                }
                break;
            }
            this.state = 856;
            this.expression(0);
            this.state = 857;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new UpsertStatementContext(this.context, this.state);
        this.enterRule(localContext, 124, ApexParser.RULE_upsertStatement);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 859;
            this.match(ApexParser.UPSERT);
            this.state = 861;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 72, this.context) ) {
            case 1:
                {
                this.state = 860;
                this.accessLevel();
                }
                break;
            }
            this.state = 863;
            this.expression(0);
            this.state = 865;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 5308428) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4288283411) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 268429311) !== 0) || _la === 243) {
                {
                this.state = 864;
                this.qualifiedName();
                }
            }

            this.state = 867;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new MergeStatementContext(this.context, this.state);
        this.enterRule(localContext, 126, ApexParser.RULE_mergeStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 869;
            this.match(ApexParser.MERGE);
            this.state = 871;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 74, this.context) ) {
            case 1:
                {
                this.state = 870;
                this.accessLevel();
                }
                break;
            }
            this.state = 873;
            this.expression(0);
            this.state = 874;
            this.expression(0);
            this.state = 875;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new RunAsStatementContext(this.context, this.state);
        this.enterRule(localContext, 128, ApexParser.RULE_runAsStatement);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 877;
            this.match(ApexParser.SYSTEMRUNAS);
            this.state = 878;
            this.match(ApexParser.LPAREN);
            this.state = 880;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 4026728727) !== 0) || _la === 243) {
                {
                this.state = 879;
                this.expressionList();
                }
            }

            this.state = 882;
            this.match(ApexParser.RPAREN);
            this.state = 883;
            this.block();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ExpressionStatementContext(this.context, this.state);
        this.enterRule(localContext, 130, ApexParser.RULE_expressionStatement);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 885;
            this.expression(0);
            this.state = 886;
            this.match(ApexParser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new PropertyBlockContext(this.context, this.state);
        this.enterRule(localContext, 132, ApexParser.RULE_propertyBlock);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 891;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4027719682) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & 413769) !== 0) || _la === 242) {
                {
                {
                this.state = 888;
                this.modifier();
                }
                }
                this.state = 893;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 896;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.GET:
                {
                this.state = 894;
                this.getter();
                }
                break;
            case ApexParser.SET:
                {
                this.state = 895;
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
                localContext.exception = re;
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
        const localContext = new GetterContext(this.context, this.state);
        this.enterRule(localContext, 134, ApexParser.RULE_getter);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 898;
            this.match(ApexParser.GET);
            this.state = 901;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.SEMI:
                {
                this.state = 899;
                this.match(ApexParser.SEMI);
                }
                break;
            case ApexParser.LBRACE:
                {
                this.state = 900;
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
                localContext.exception = re;
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
        const localContext = new SetterContext(this.context, this.state);
        this.enterRule(localContext, 136, ApexParser.RULE_setter);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 903;
            this.match(ApexParser.SET);
            this.state = 906;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.SEMI:
                {
                this.state = 904;
                this.match(ApexParser.SEMI);
                }
                break;
            case ApexParser.LBRACE:
                {
                this.state = 905;
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
                localContext.exception = re;
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
        const localContext = new CatchClauseContext(this.context, this.state);
        this.enterRule(localContext, 138, ApexParser.RULE_catchClause);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 908;
            this.match(ApexParser.CATCH);
            this.state = 909;
            this.match(ApexParser.LPAREN);
            this.state = 913;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 80, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 910;
                    this.modifier();
                    }
                    }
                }
                this.state = 915;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 80, this.context);
            }
            this.state = 916;
            this.qualifiedName();
            this.state = 917;
            this.id();
            this.state = 918;
            this.match(ApexParser.RPAREN);
            this.state = 919;
            this.block();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new FinallyBlockContext(this.context, this.state);
        this.enterRule(localContext, 140, ApexParser.RULE_finallyBlock);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 921;
            this.match(ApexParser.FINALLY);
            this.state = 922;
            this.block();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ForControlContext(this.context, this.state);
        this.enterRule(localContext, 142, ApexParser.RULE_forControl);
        let _la: number;
        try {
            this.state = 936;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 84, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 924;
                this.enhancedForControl();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 926;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4132642830) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294689663) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 4026728727) !== 0) || _la === 242 || _la === 243) {
                    {
                    this.state = 925;
                    this.forInit();
                    }
                }

                this.state = 928;
                this.match(ApexParser.SEMI);
                this.state = 930;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 4026728727) !== 0) || _la === 243) {
                    {
                    this.state = 929;
                    this.expression(0);
                    }
                }

                this.state = 932;
                this.match(ApexParser.SEMI);
                this.state = 934;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 4026728727) !== 0) || _la === 243) {
                    {
                    this.state = 933;
                    this.forUpdate();
                    }
                }

                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ForInitContext(this.context, this.state);
        this.enterRule(localContext, 144, ApexParser.RULE_forInit);
        try {
            this.state = 940;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 85, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 938;
                this.localVariableDeclaration();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 939;
                this.expressionList();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new EnhancedForControlContext(this.context, this.state);
        this.enterRule(localContext, 146, ApexParser.RULE_enhancedForControl);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 942;
            this.typeRef();
            this.state = 943;
            this.id();
            this.state = 944;
            this.match(ApexParser.COLON);
            this.state = 945;
            this.expression(0);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ForUpdateContext(this.context, this.state);
        this.enterRule(localContext, 148, ApexParser.RULE_forUpdate);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 947;
            this.expressionList();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ParExpressionContext(this.context, this.state);
        this.enterRule(localContext, 150, ApexParser.RULE_parExpression);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 949;
            this.match(ApexParser.LPAREN);
            this.state = 950;
            this.expression(0);
            this.state = 951;
            this.match(ApexParser.RPAREN);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ExpressionListContext(this.context, this.state);
        this.enterRule(localContext, 152, ApexParser.RULE_expressionList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 953;
            this.expression(0);
            this.state = 958;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 954;
                this.match(ApexParser.COMMA);
                this.state = 955;
                this.expression(0);
                }
                }
                this.state = 960;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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

        const parentContext = this.context;
        const parentState = this.state;
        let localContext = new ExpressionContext(this.context, parentState);
        const _startState = 154;
        this.enterRecursionRule(localContext, 154, ApexParser.RULE_expression, _p);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 979;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 87, this.context) ) {
            case 1:
                {
                localContext = new PrimaryExpressionContext(localContext);
                this.context = localContext;

                this.state = 962;
                this.primary();
                }
                break;
            case 2:
                {
                localContext = new MethodCallExpressionContext(localContext);
                this.context = localContext;
                this.state = 963;
                this.methodCall();
                }
                break;
            case 3:
                {
                localContext = new NewExpressionContext(localContext);
                this.context = localContext;
                this.state = 964;
                this.match(ApexParser.NEW);
                this.state = 965;
                this.creator();
                }
                break;
            case 4:
                {
                localContext = new CastExpressionContext(localContext);
                this.context = localContext;
                this.state = 966;
                this.match(ApexParser.LPAREN);
                this.state = 967;
                this.typeRef();
                this.state = 968;
                this.match(ApexParser.RPAREN);
                this.state = 969;
                this.expression(18);
                }
                break;
            case 5:
                {
                localContext = new SubExpressionContext(localContext);
                this.context = localContext;
                this.state = 971;
                this.match(ApexParser.LPAREN);
                this.state = 972;
                this.expression(0);
                this.state = 973;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 6:
                {
                localContext = new PreOpExpressionContext(localContext);
                this.context = localContext;
                this.state = 975;
                _la = this.tokenStream.LA(1);
                if(!(((((_la - 222)) & ~0x1F) === 0 && ((1 << (_la - 222)) & 15) !== 0))) {
                this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                this.state = 976;
                this.expression(15);
                }
                break;
            case 7:
                {
                localContext = new NegExpressionContext(localContext);
                this.context = localContext;
                this.state = 977;
                _la = this.tokenStream.LA(1);
                if(!(_la === 210 || _la === 211)) {
                this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                this.state = 978;
                this.expression(14);
                }
                break;
            }
            this.context!.stop = this.tokenStream.LT(-1);
            this.state = 1049;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 92, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    if (this._parseListeners != null) {
                        this.triggerExitRuleEvent();
                    }
                    {
                    this.state = 1047;
                    this.errorHandler.sync(this);
                    switch (this.interpreter.adaptivePredict(this.tokenStream, 91, this.context) ) {
                    case 1:
                        {
                        localContext = new Arth1ExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 981;
                        if (!(this.precpred(this.context, 13))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 13)");
                        }
                        this.state = 982;
                        _la = this.tokenStream.LA(1);
                        if(!(_la === 226 || _la === 227)) {
                        this.errorHandler.recoverInline(this);
                        }
                        else {
                            this.errorHandler.reportMatch(this);
                            this.consume();
                        }
                        this.state = 983;
                        this.expression(14);
                        }
                        break;
                    case 2:
                        {
                        localContext = new Arth2ExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 984;
                        if (!(this.precpred(this.context, 12))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 12)");
                        }
                        this.state = 985;
                        _la = this.tokenStream.LA(1);
                        if(!(_la === 224 || _la === 225)) {
                        this.errorHandler.recoverInline(this);
                        }
                        else {
                            this.errorHandler.reportMatch(this);
                            this.consume();
                        }
                        this.state = 986;
                        this.expression(13);
                        }
                        break;
                    case 3:
                        {
                        localContext = new BitExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 987;
                        if (!(this.precpred(this.context, 11))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 11)");
                        }
                        this.state = 995;
                        this.errorHandler.sync(this);
                        switch (this.interpreter.adaptivePredict(this.tokenStream, 88, this.context) ) {
                        case 1:
                            {
                            this.state = 988;
                            this.match(ApexParser.LT);
                            this.state = 989;
                            this.match(ApexParser.LT);
                            }
                            break;
                        case 2:
                            {
                            this.state = 990;
                            this.match(ApexParser.GT);
                            this.state = 991;
                            this.match(ApexParser.GT);
                            this.state = 992;
                            this.match(ApexParser.GT);
                            }
                            break;
                        case 3:
                            {
                            this.state = 993;
                            this.match(ApexParser.GT);
                            this.state = 994;
                            this.match(ApexParser.GT);
                            }
                            break;
                        }
                        this.state = 997;
                        this.expression(12);
                        }
                        break;
                    case 4:
                        {
                        localContext = new CmpExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 998;
                        if (!(this.precpred(this.context, 10))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 10)");
                        }
                        this.state = 999;
                        _la = this.tokenStream.LA(1);
                        if(!(_la === 208 || _la === 209)) {
                        this.errorHandler.recoverInline(this);
                        }
                        else {
                            this.errorHandler.reportMatch(this);
                            this.consume();
                        }
                        this.state = 1001;
                        this.errorHandler.sync(this);
                        _la = this.tokenStream.LA(1);
                        if (_la === 207) {
                            {
                            this.state = 1000;
                            this.match(ApexParser.ASSIGN);
                            }
                        }

                        this.state = 1003;
                        this.expression(11);
                        }
                        break;
                    case 5:
                        {
                        localContext = new EqualityExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 1004;
                        if (!(this.precpred(this.context, 8))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 8)");
                        }
                        this.state = 1005;
                        _la = this.tokenStream.LA(1);
                        if(!(((((_la - 215)) & ~0x1F) === 0 && ((1 << (_la - 215)) & 31) !== 0))) {
                        this.errorHandler.recoverInline(this);
                        }
                        else {
                            this.errorHandler.reportMatch(this);
                            this.consume();
                        }
                        this.state = 1006;
                        this.expression(9);
                        }
                        break;
                    case 6:
                        {
                        localContext = new BitAndExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 1007;
                        if (!(this.precpred(this.context, 7))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 7)");
                        }
                        this.state = 1008;
                        this.match(ApexParser.BITAND);
                        this.state = 1009;
                        this.expression(8);
                        }
                        break;
                    case 7:
                        {
                        localContext = new BitNotExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 1010;
                        if (!(this.precpred(this.context, 6))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 6)");
                        }
                        this.state = 1011;
                        this.match(ApexParser.CARET);
                        this.state = 1012;
                        this.expression(7);
                        }
                        break;
                    case 8:
                        {
                        localContext = new BitOrExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 1013;
                        if (!(this.precpred(this.context, 5))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 5)");
                        }
                        this.state = 1014;
                        this.match(ApexParser.BITOR);
                        this.state = 1015;
                        this.expression(6);
                        }
                        break;
                    case 9:
                        {
                        localContext = new LogAndExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 1016;
                        if (!(this.precpred(this.context, 4))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 4)");
                        }
                        this.state = 1017;
                        this.match(ApexParser.AND);
                        this.state = 1018;
                        this.expression(5);
                        }
                        break;
                    case 10:
                        {
                        localContext = new LogOrExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 1019;
                        if (!(this.precpred(this.context, 3))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 3)");
                        }
                        this.state = 1020;
                        this.match(ApexParser.OR);
                        this.state = 1021;
                        this.expression(4);
                        }
                        break;
                    case 11:
                        {
                        localContext = new CondExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 1022;
                        if (!(this.precpred(this.context, 2))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 2)");
                        }
                        this.state = 1023;
                        this.match(ApexParser.QUESTION);
                        this.state = 1024;
                        this.expression(0);
                        this.state = 1025;
                        this.match(ApexParser.COLON);
                        this.state = 1026;
                        this.expression(2);
                        }
                        break;
                    case 12:
                        {
                        localContext = new AssignExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 1028;
                        if (!(this.precpred(this.context, 1))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 1)");
                        }
                        this.state = 1029;
                        _la = this.tokenStream.LA(1);
                        if(!(((((_la - 207)) & ~0x1F) === 0 && ((1 << (_la - 207)) & 4261412865) !== 0) || ((((_la - 239)) & ~0x1F) === 0 && ((1 << (_la - 239)) & 7) !== 0))) {
                        this.errorHandler.recoverInline(this);
                        }
                        else {
                            this.errorHandler.reportMatch(this);
                            this.consume();
                        }
                        this.state = 1030;
                        this.expression(1);
                        }
                        break;
                    case 13:
                        {
                        localContext = new DotExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 1031;
                        if (!(this.precpred(this.context, 22))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 22)");
                        }
                        this.state = 1032;
                        _la = this.tokenStream.LA(1);
                        if(!(_la === 206 || _la === 212)) {
                        this.errorHandler.recoverInline(this);
                        }
                        else {
                            this.errorHandler.reportMatch(this);
                            this.consume();
                        }
                        this.state = 1035;
                        this.errorHandler.sync(this);
                        switch (this.interpreter.adaptivePredict(this.tokenStream, 90, this.context) ) {
                        case 1:
                            {
                            this.state = 1033;
                            this.dotMethodCall();
                            }
                            break;
                        case 2:
                            {
                            this.state = 1034;
                            this.anyId();
                            }
                            break;
                        }
                        }
                        break;
                    case 14:
                        {
                        localContext = new ArrayExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 1037;
                        if (!(this.precpred(this.context, 21))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 21)");
                        }
                        this.state = 1038;
                        this.match(ApexParser.LBRACK);
                        this.state = 1039;
                        this.expression(0);
                        this.state = 1040;
                        this.match(ApexParser.RBRACK);
                        }
                        break;
                    case 15:
                        {
                        localContext = new PostOpExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 1042;
                        if (!(this.precpred(this.context, 16))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 16)");
                        }
                        this.state = 1043;
                        _la = this.tokenStream.LA(1);
                        if(!(_la === 222 || _la === 223)) {
                        this.errorHandler.recoverInline(this);
                        }
                        else {
                            this.errorHandler.reportMatch(this);
                            this.consume();
                        }
                        }
                        break;
                    case 16:
                        {
                        localContext = new InstanceOfExpressionContext(new ExpressionContext(parentContext, parentState));
                        this.pushNewRecursionContext(localContext, _startState, ApexParser.RULE_expression);
                        this.state = 1044;
                        if (!(this.precpred(this.context, 9))) {
                            throw this.createFailedPredicateException("this.precpred(this.context, 9)");
                        }
                        this.state = 1045;
                        this.match(ApexParser.INSTANCEOF);
                        this.state = 1046;
                        this.typeRef();
                        }
                        break;
                    }
                    }
                }
                this.state = 1051;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 92, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        this.enterRule(localContext, 156, ApexParser.RULE_primary);
        try {
            this.state = 1065;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 93, this.context) ) {
            case 1:
                localContext = new ThisPrimaryContext(localContext);
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1052;
                this.match(ApexParser.THIS);
                }
                break;
            case 2:
                localContext = new SuperPrimaryContext(localContext);
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1053;
                this.match(ApexParser.SUPER);
                }
                break;
            case 3:
                localContext = new LiteralPrimaryContext(localContext);
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1054;
                this.literal();
                }
                break;
            case 4:
                localContext = new TypeRefPrimaryContext(localContext);
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1055;
                this.typeRef();
                this.state = 1056;
                this.match(ApexParser.DOT);
                this.state = 1057;
                this.match(ApexParser.CLASS);
                }
                break;
            case 5:
                localContext = new VoidPrimaryContext(localContext);
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1059;
                this.match(ApexParser.VOID);
                this.state = 1060;
                this.match(ApexParser.DOT);
                this.state = 1061;
                this.match(ApexParser.CLASS);
                }
                break;
            case 6:
                localContext = new IdPrimaryContext(localContext);
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1062;
                this.id();
                }
                break;
            case 7:
                localContext = new SoqlPrimaryContext(localContext);
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 1063;
                this.soqlLiteral();
                }
                break;
            case 8:
                localContext = new SoslPrimaryContext(localContext);
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 1064;
                this.soslLiteral();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new MethodCallContext(this.context, this.state);
        this.enterRule(localContext, 158, ApexParser.RULE_methodCall);
        let _la: number;
        try {
            this.state = 1086;
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
                this.state = 1067;
                this.id();
                this.state = 1068;
                this.match(ApexParser.LPAREN);
                this.state = 1070;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 4026728727) !== 0) || _la === 243) {
                    {
                    this.state = 1069;
                    this.expressionList();
                    }
                }

                this.state = 1072;
                this.match(ApexParser.RPAREN);
                }
                break;
            case ApexParser.THIS:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1074;
                this.match(ApexParser.THIS);
                this.state = 1075;
                this.match(ApexParser.LPAREN);
                this.state = 1077;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 4026728727) !== 0) || _la === 243) {
                    {
                    this.state = 1076;
                    this.expressionList();
                    }
                }

                this.state = 1079;
                this.match(ApexParser.RPAREN);
                }
                break;
            case ApexParser.SUPER:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1080;
                this.match(ApexParser.SUPER);
                this.state = 1081;
                this.match(ApexParser.LPAREN);
                this.state = 1083;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 4026728727) !== 0) || _la === 243) {
                    {
                    this.state = 1082;
                    this.expressionList();
                    }
                }

                this.state = 1085;
                this.match(ApexParser.RPAREN);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new DotMethodCallContext(this.context, this.state);
        this.enterRule(localContext, 160, ApexParser.RULE_dotMethodCall);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1088;
            this.anyId();
            this.state = 1089;
            this.match(ApexParser.LPAREN);
            this.state = 1091;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 4026728727) !== 0) || _la === 243) {
                {
                this.state = 1090;
                this.expressionList();
                }
            }

            this.state = 1093;
            this.match(ApexParser.RPAREN);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new CreatorContext(this.context, this.state);
        this.enterRule(localContext, 162, ApexParser.RULE_creator);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1095;
            this.createdName();
            this.state = 1101;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 99, this.context) ) {
            case 1:
                {
                this.state = 1096;
                this.noRest();
                }
                break;
            case 2:
                {
                this.state = 1097;
                this.classCreatorRest();
                }
                break;
            case 3:
                {
                this.state = 1098;
                this.arrayCreatorRest();
                }
                break;
            case 4:
                {
                this.state = 1099;
                this.mapCreatorRest();
                }
                break;
            case 5:
                {
                this.state = 1100;
                this.setCreatorRest();
                }
                break;
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new CreatedNameContext(this.context, this.state);
        this.enterRule(localContext, 164, ApexParser.RULE_createdName);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1103;
            this.idCreatedNamePair();
            this.state = 1108;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 206) {
                {
                {
                this.state = 1104;
                this.match(ApexParser.DOT);
                this.state = 1105;
                this.idCreatedNamePair();
                }
                }
                this.state = 1110;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new IdCreatedNamePairContext(this.context, this.state);
        this.enterRule(localContext, 166, ApexParser.RULE_idCreatedNamePair);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1111;
            this.anyId();
            this.state = 1116;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 209) {
                {
                this.state = 1112;
                this.match(ApexParser.LT);
                this.state = 1113;
                this.typeList();
                this.state = 1114;
                this.match(ApexParser.GT);
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new NoRestContext(this.context, this.state);
        this.enterRule(localContext, 168, ApexParser.RULE_noRest);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1118;
            this.match(ApexParser.LBRACE);
            this.state = 1119;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ClassCreatorRestContext(this.context, this.state);
        this.enterRule(localContext, 170, ApexParser.RULE_classCreatorRest);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1121;
            this.arguments();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ArrayCreatorRestContext(this.context, this.state);
        this.enterRule(localContext, 172, ApexParser.RULE_arrayCreatorRest);
        try {
            this.state = 1132;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 103, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1123;
                this.match(ApexParser.LBRACK);
                this.state = 1124;
                this.expression(0);
                this.state = 1125;
                this.match(ApexParser.RBRACK);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1127;
                this.match(ApexParser.LBRACK);
                this.state = 1128;
                this.match(ApexParser.RBRACK);
                this.state = 1130;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 102, this.context) ) {
                case 1:
                    {
                    this.state = 1129;
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
                localContext.exception = re;
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
        const localContext = new MapCreatorRestContext(this.context, this.state);
        this.enterRule(localContext, 174, ApexParser.RULE_mapCreatorRest);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1134;
            this.match(ApexParser.LBRACE);
            this.state = 1135;
            this.mapCreatorRestPair();
            this.state = 1140;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 1136;
                this.match(ApexParser.COMMA);
                this.state = 1137;
                this.mapCreatorRestPair();
                }
                }
                this.state = 1142;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 1143;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new MapCreatorRestPairContext(this.context, this.state);
        this.enterRule(localContext, 176, ApexParser.RULE_mapCreatorRestPair);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1145;
            this.expression(0);
            this.state = 1146;
            this.match(ApexParser.MAPTO);
            this.state = 1147;
            this.expression(0);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new SetCreatorRestContext(this.context, this.state);
        this.enterRule(localContext, 178, ApexParser.RULE_setCreatorRest);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1149;
            this.match(ApexParser.LBRACE);
            this.state = 1150;
            this.expression(0);
            this.state = 1155;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 1151;
                this.match(ApexParser.COMMA);
                {
                this.state = 1152;
                this.expression(0);
                }
                }
                }
                this.state = 1157;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 1158;
            this.match(ApexParser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ArgumentsContext(this.context, this.state);
        this.enterRule(localContext, 180, ApexParser.RULE_arguments);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1160;
            this.match(ApexParser.LPAREN);
            this.state = 1162;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 105971724) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4294607707) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 3758090239) !== 0) || ((((_la - 194)) & ~0x1F) === 0 && ((1 << (_la - 194)) & 4026728727) !== 0) || _la === 243) {
                {
                this.state = 1161;
                this.expressionList();
                }
            }

            this.state = 1164;
            this.match(ApexParser.RPAREN);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new SoqlLiteralContext(this.context, this.state);
        this.enterRule(localContext, 182, ApexParser.RULE_soqlLiteral);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1166;
            this.match(ApexParser.LBRACK);
            this.state = 1167;
            this.query();
            this.state = 1168;
            this.match(ApexParser.RBRACK);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new QueryContext(this.context, this.state);
        this.enterRule(localContext, 184, ApexParser.RULE_query);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1170;
            this.match(ApexParser.SELECT);
            this.state = 1171;
            this.selectList();
            this.state = 1172;
            this.match(ApexParser.FROM);
            this.state = 1173;
            this.fromNameList();
            this.state = 1175;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 63) {
                {
                this.state = 1174;
                this.usingScope();
                }
            }

            this.state = 1178;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 65) {
                {
                this.state = 1177;
                this.whereClause();
                }
            }

            this.state = 1181;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 53) {
                {
                this.state = 1180;
                this.withClause();
                }
            }

            this.state = 1184;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 89) {
                {
                this.state = 1183;
                this.groupByClause();
                }
            }

            this.state = 1187;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 66) {
                {
                this.state = 1186;
                this.orderByClause();
                }
            }

            this.state = 1190;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 68) {
                {
                this.state = 1189;
                this.limitClause();
                }
            }

            this.state = 1193;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 96) {
                {
                this.state = 1192;
                this.offsetClause();
                }
            }

            this.state = 1196;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 90) {
                {
                this.state = 1195;
                this.allRowsClause();
                }
            }

            this.state = 1198;
            this.forClauses();
            this.state = 1201;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 46) {
                {
                this.state = 1199;
                this.match(ApexParser.UPDATE);
                this.state = 1200;
                this.updateList();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new SubQueryContext(this.context, this.state);
        this.enterRule(localContext, 186, ApexParser.RULE_subQuery);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1203;
            this.match(ApexParser.SELECT);
            this.state = 1204;
            this.subFieldList();
            this.state = 1205;
            this.match(ApexParser.FROM);
            this.state = 1206;
            this.fromNameList();
            this.state = 1208;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 65) {
                {
                this.state = 1207;
                this.whereClause();
                }
            }

            this.state = 1211;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 66) {
                {
                this.state = 1210;
                this.orderByClause();
                }
            }

            this.state = 1214;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 68) {
                {
                this.state = 1213;
                this.limitClause();
                }
            }

            this.state = 1216;
            this.forClauses();
            this.state = 1219;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 46) {
                {
                this.state = 1217;
                this.match(ApexParser.UPDATE);
                this.state = 1218;
                this.updateList();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new SelectListContext(this.context, this.state);
        this.enterRule(localContext, 188, ApexParser.RULE_selectList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1221;
            this.selectEntry();
            this.state = 1226;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 1222;
                this.match(ApexParser.COMMA);
                this.state = 1223;
                this.selectEntry();
                }
                }
                this.state = 1228;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new SelectEntryContext(this.context, this.state);
        this.enterRule(localContext, 190, ApexParser.RULE_selectEntry);
        try {
            this.state = 1244;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 124, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1229;
                this.fieldName();
                this.state = 1231;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 121, this.context) ) {
                case 1:
                    {
                    this.state = 1230;
                    this.soqlId();
                    }
                    break;
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1233;
                this.soqlFunction();
                this.state = 1235;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 122, this.context) ) {
                case 1:
                    {
                    this.state = 1234;
                    this.soqlId();
                    }
                    break;
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1237;
                this.match(ApexParser.LPAREN);
                this.state = 1238;
                this.subQuery();
                this.state = 1239;
                this.match(ApexParser.RPAREN);
                this.state = 1241;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 123, this.context) ) {
                case 1:
                    {
                    this.state = 1240;
                    this.soqlId();
                    }
                    break;
                }
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1243;
                this.typeOf();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new FieldNameContext(this.context, this.state);
        this.enterRule(localContext, 192, ApexParser.RULE_fieldName);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1246;
            this.soqlId();
            this.state = 1251;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 206) {
                {
                {
                this.state = 1247;
                this.match(ApexParser.DOT);
                this.state = 1248;
                this.soqlId();
                }
                }
                this.state = 1253;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new FromNameListContext(this.context, this.state);
        this.enterRule(localContext, 194, ApexParser.RULE_fromNameList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1254;
            this.fieldName();
            this.state = 1256;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 126, this.context) ) {
            case 1:
                {
                this.state = 1255;
                this.soqlId();
                }
                break;
            }
            this.state = 1265;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 1258;
                this.match(ApexParser.COMMA);
                this.state = 1259;
                this.fieldName();
                this.state = 1261;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 127, this.context) ) {
                case 1:
                    {
                    this.state = 1260;
                    this.soqlId();
                    }
                    break;
                }
                }
                }
                this.state = 1267;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new SubFieldListContext(this.context, this.state);
        this.enterRule(localContext, 196, ApexParser.RULE_subFieldList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1268;
            this.subFieldEntry();
            this.state = 1273;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 1269;
                this.match(ApexParser.COMMA);
                this.state = 1270;
                this.subFieldEntry();
                }
                }
                this.state = 1275;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new SubFieldEntryContext(this.context, this.state);
        this.enterRule(localContext, 198, ApexParser.RULE_subFieldEntry);
        try {
            this.state = 1285;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 132, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1276;
                this.fieldName();
                this.state = 1278;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 130, this.context) ) {
                case 1:
                    {
                    this.state = 1277;
                    this.soqlId();
                    }
                    break;
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1280;
                this.soqlFunction();
                this.state = 1282;
                this.errorHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this.tokenStream, 131, this.context) ) {
                case 1:
                    {
                    this.state = 1281;
                    this.soqlId();
                    }
                    break;
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1284;
                this.typeOf();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new SoqlFieldsParameterContext(this.context, this.state);
        this.enterRule(localContext, 200, ApexParser.RULE_soqlFieldsParameter);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1287;
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
                localContext.exception = re;
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
        const localContext = new SoqlFunctionContext(this.context, this.state);
        this.enterRule(localContext, 202, ApexParser.RULE_soqlFunction);
        try {
            this.state = 1411;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 133, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1289;
                this.match(ApexParser.AVG);
                this.state = 1290;
                this.match(ApexParser.LPAREN);
                this.state = 1291;
                this.fieldName();
                this.state = 1292;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1294;
                this.match(ApexParser.COUNT);
                this.state = 1295;
                this.match(ApexParser.LPAREN);
                this.state = 1296;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1297;
                this.match(ApexParser.COUNT);
                this.state = 1298;
                this.match(ApexParser.LPAREN);
                this.state = 1299;
                this.fieldName();
                this.state = 1300;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1302;
                this.match(ApexParser.COUNT_DISTINCT);
                this.state = 1303;
                this.match(ApexParser.LPAREN);
                this.state = 1304;
                this.fieldName();
                this.state = 1305;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1307;
                this.match(ApexParser.MIN);
                this.state = 1308;
                this.match(ApexParser.LPAREN);
                this.state = 1309;
                this.fieldName();
                this.state = 1310;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1312;
                this.match(ApexParser.MAX);
                this.state = 1313;
                this.match(ApexParser.LPAREN);
                this.state = 1314;
                this.fieldName();
                this.state = 1315;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 7:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 1317;
                this.match(ApexParser.SUM);
                this.state = 1318;
                this.match(ApexParser.LPAREN);
                this.state = 1319;
                this.fieldName();
                this.state = 1320;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 8:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 1322;
                this.match(ApexParser.TOLABEL);
                this.state = 1323;
                this.match(ApexParser.LPAREN);
                this.state = 1324;
                this.fieldName();
                this.state = 1325;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 9:
                this.enterOuterAlt(localContext, 9);
                {
                this.state = 1327;
                this.match(ApexParser.FORMAT);
                this.state = 1328;
                this.match(ApexParser.LPAREN);
                this.state = 1329;
                this.fieldName();
                this.state = 1330;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 10:
                this.enterOuterAlt(localContext, 10);
                {
                this.state = 1332;
                this.match(ApexParser.CALENDAR_MONTH);
                this.state = 1333;
                this.match(ApexParser.LPAREN);
                this.state = 1334;
                this.dateFieldName();
                this.state = 1335;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 11:
                this.enterOuterAlt(localContext, 11);
                {
                this.state = 1337;
                this.match(ApexParser.CALENDAR_QUARTER);
                this.state = 1338;
                this.match(ApexParser.LPAREN);
                this.state = 1339;
                this.dateFieldName();
                this.state = 1340;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 12:
                this.enterOuterAlt(localContext, 12);
                {
                this.state = 1342;
                this.match(ApexParser.CALENDAR_YEAR);
                this.state = 1343;
                this.match(ApexParser.LPAREN);
                this.state = 1344;
                this.dateFieldName();
                this.state = 1345;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 13:
                this.enterOuterAlt(localContext, 13);
                {
                this.state = 1347;
                this.match(ApexParser.DAY_IN_MONTH);
                this.state = 1348;
                this.match(ApexParser.LPAREN);
                this.state = 1349;
                this.dateFieldName();
                this.state = 1350;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 14:
                this.enterOuterAlt(localContext, 14);
                {
                this.state = 1352;
                this.match(ApexParser.DAY_IN_WEEK);
                this.state = 1353;
                this.match(ApexParser.LPAREN);
                this.state = 1354;
                this.dateFieldName();
                this.state = 1355;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 15:
                this.enterOuterAlt(localContext, 15);
                {
                this.state = 1357;
                this.match(ApexParser.DAY_IN_YEAR);
                this.state = 1358;
                this.match(ApexParser.LPAREN);
                this.state = 1359;
                this.dateFieldName();
                this.state = 1360;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 16:
                this.enterOuterAlt(localContext, 16);
                {
                this.state = 1362;
                this.match(ApexParser.DAY_ONLY);
                this.state = 1363;
                this.match(ApexParser.LPAREN);
                this.state = 1364;
                this.dateFieldName();
                this.state = 1365;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 17:
                this.enterOuterAlt(localContext, 17);
                {
                this.state = 1367;
                this.match(ApexParser.FISCAL_MONTH);
                this.state = 1368;
                this.match(ApexParser.LPAREN);
                this.state = 1369;
                this.dateFieldName();
                this.state = 1370;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 18:
                this.enterOuterAlt(localContext, 18);
                {
                this.state = 1372;
                this.match(ApexParser.FISCAL_QUARTER);
                this.state = 1373;
                this.match(ApexParser.LPAREN);
                this.state = 1374;
                this.dateFieldName();
                this.state = 1375;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 19:
                this.enterOuterAlt(localContext, 19);
                {
                this.state = 1377;
                this.match(ApexParser.FISCAL_YEAR);
                this.state = 1378;
                this.match(ApexParser.LPAREN);
                this.state = 1379;
                this.dateFieldName();
                this.state = 1380;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 20:
                this.enterOuterAlt(localContext, 20);
                {
                this.state = 1382;
                this.match(ApexParser.HOUR_IN_DAY);
                this.state = 1383;
                this.match(ApexParser.LPAREN);
                this.state = 1384;
                this.dateFieldName();
                this.state = 1385;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 21:
                this.enterOuterAlt(localContext, 21);
                {
                this.state = 1387;
                this.match(ApexParser.WEEK_IN_MONTH);
                this.state = 1388;
                this.match(ApexParser.LPAREN);
                this.state = 1389;
                this.dateFieldName();
                this.state = 1390;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 22:
                this.enterOuterAlt(localContext, 22);
                {
                this.state = 1392;
                this.match(ApexParser.WEEK_IN_YEAR);
                this.state = 1393;
                this.match(ApexParser.LPAREN);
                this.state = 1394;
                this.dateFieldName();
                this.state = 1395;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 23:
                this.enterOuterAlt(localContext, 23);
                {
                this.state = 1397;
                this.match(ApexParser.FIELDS);
                this.state = 1398;
                this.match(ApexParser.LPAREN);
                this.state = 1399;
                this.soqlFieldsParameter();
                this.state = 1400;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 24:
                this.enterOuterAlt(localContext, 24);
                {
                this.state = 1402;
                this.match(ApexParser.DISTANCE);
                this.state = 1403;
                this.match(ApexParser.LPAREN);
                this.state = 1404;
                this.locationValue();
                this.state = 1405;
                this.match(ApexParser.COMMA);
                this.state = 1406;
                this.locationValue();
                this.state = 1407;
                this.match(ApexParser.COMMA);
                this.state = 1408;
                this.match(ApexParser.StringLiteral);
                this.state = 1409;
                this.match(ApexParser.RPAREN);
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new DateFieldNameContext(this.context, this.state);
        this.enterRule(localContext, 204, ApexParser.RULE_dateFieldName);
        try {
            this.state = 1419;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 134, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1413;
                this.match(ApexParser.CONVERT_TIMEZONE);
                this.state = 1414;
                this.match(ApexParser.LPAREN);
                this.state = 1415;
                this.fieldName();
                this.state = 1416;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1418;
                this.fieldName();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new LocationValueContext(this.context, this.state);
        this.enterRule(localContext, 206, ApexParser.RULE_locationValue);
        try {
            this.state = 1430;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 135, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1421;
                this.fieldName();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1422;
                this.boundExpression();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1423;
                this.match(ApexParser.GEOLOCATION);
                this.state = 1424;
                this.match(ApexParser.LPAREN);
                this.state = 1425;
                this.coordinateValue();
                this.state = 1426;
                this.match(ApexParser.COMMA);
                this.state = 1427;
                this.coordinateValue();
                this.state = 1428;
                this.match(ApexParser.RPAREN);
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new CoordinateValueContext(this.context, this.state);
        this.enterRule(localContext, 208, ApexParser.RULE_coordinateValue);
        try {
            this.state = 1434;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.IntegerLiteral:
            case ApexParser.NumberLiteral:
            case ApexParser.ADD:
            case ApexParser.SUB:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1432;
                this.signedNumber();
                }
                break;
            case ApexParser.COLON:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1433;
                this.boundExpression();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new TypeOfContext(this.context, this.state);
        this.enterRule(localContext, 210, ApexParser.RULE_typeOf);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1436;
            this.match(ApexParser.TYPEOF);
            this.state = 1437;
            this.fieldName();
            this.state = 1439;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 1438;
                this.whenClause();
                }
                }
                this.state = 1441;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while (_la === 51);
            this.state = 1444;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 10) {
                {
                this.state = 1443;
                this.elseClause();
                }
            }

            this.state = 1446;
            this.match(ApexParser.END);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new WhenClauseContext(this.context, this.state);
        this.enterRule(localContext, 212, ApexParser.RULE_whenClause);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1448;
            this.match(ApexParser.WHEN);
            this.state = 1449;
            this.fieldName();
            this.state = 1450;
            this.match(ApexParser.THEN);
            this.state = 1451;
            this.fieldNameList();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ElseClauseContext(this.context, this.state);
        this.enterRule(localContext, 214, ApexParser.RULE_elseClause);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1453;
            this.match(ApexParser.ELSE);
            this.state = 1454;
            this.fieldNameList();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new FieldNameListContext(this.context, this.state);
        this.enterRule(localContext, 216, ApexParser.RULE_fieldNameList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1456;
            this.fieldName();
            this.state = 1461;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 1457;
                this.match(ApexParser.COMMA);
                this.state = 1458;
                this.fieldName();
                }
                }
                this.state = 1463;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new UsingScopeContext(this.context, this.state);
        this.enterRule(localContext, 218, ApexParser.RULE_usingScope);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1464;
            this.match(ApexParser.USING);
            this.state = 1465;
            this.match(ApexParser.SCOPE);
            this.state = 1466;
            this.soqlId();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new WhereClauseContext(this.context, this.state);
        this.enterRule(localContext, 220, ApexParser.RULE_whereClause);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1468;
            this.match(ApexParser.WHERE);
            this.state = 1469;
            this.logicalExpression();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new LogicalExpressionContext(this.context, this.state);
        this.enterRule(localContext, 222, ApexParser.RULE_logicalExpression);
        let _la: number;
        try {
            this.state = 1489;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 142, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1471;
                this.conditionalExpression();
                this.state = 1476;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 69) {
                    {
                    {
                    this.state = 1472;
                    this.match(ApexParser.SOQLAND);
                    this.state = 1473;
                    this.conditionalExpression();
                    }
                    }
                    this.state = 1478;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1479;
                this.conditionalExpression();
                this.state = 1484;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 70) {
                    {
                    {
                    this.state = 1480;
                    this.match(ApexParser.SOQLOR);
                    this.state = 1481;
                    this.conditionalExpression();
                    }
                    }
                    this.state = 1486;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1487;
                this.match(ApexParser.NOT);
                this.state = 1488;
                this.conditionalExpression();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ConditionalExpressionContext(this.context, this.state);
        this.enterRule(localContext, 224, ApexParser.RULE_conditionalExpression);
        try {
            this.state = 1496;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.LPAREN:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1491;
                this.match(ApexParser.LPAREN);
                this.state = 1492;
                this.logicalExpression();
                this.state = 1493;
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
                this.state = 1495;
                this.fieldExpression();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new FieldExpressionContext(this.context, this.state);
        this.enterRule(localContext, 226, ApexParser.RULE_fieldExpression);
        try {
            this.state = 1506;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 144, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1498;
                this.fieldName();
                this.state = 1499;
                this.comparisonOperator();
                this.state = 1500;
                this.value();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1502;
                this.soqlFunction();
                this.state = 1503;
                this.comparisonOperator();
                this.state = 1504;
                this.value();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ComparisonOperatorContext(this.context, this.state);
        this.enterRule(localContext, 228, ApexParser.RULE_comparisonOperator);
        try {
            this.state = 1523;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 145, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1508;
                this.match(ApexParser.ASSIGN);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1509;
                this.match(ApexParser.NOTEQUAL);
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1510;
                this.match(ApexParser.LT);
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1511;
                this.match(ApexParser.GT);
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1512;
                this.match(ApexParser.LT);
                this.state = 1513;
                this.match(ApexParser.ASSIGN);
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1514;
                this.match(ApexParser.GT);
                this.state = 1515;
                this.match(ApexParser.ASSIGN);
                }
                break;
            case 7:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 1516;
                this.match(ApexParser.LESSANDGREATER);
                }
                break;
            case 8:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 1517;
                this.match(ApexParser.LIKE);
                }
                break;
            case 9:
                this.enterOuterAlt(localContext, 9);
                {
                this.state = 1518;
                this.match(ApexParser.IN);
                }
                break;
            case 10:
                this.enterOuterAlt(localContext, 10);
                {
                this.state = 1519;
                this.match(ApexParser.NOT);
                this.state = 1520;
                this.match(ApexParser.IN);
                }
                break;
            case 11:
                this.enterOuterAlt(localContext, 11);
                {
                this.state = 1521;
                this.match(ApexParser.INCLUDES);
                }
                break;
            case 12:
                this.enterOuterAlt(localContext, 12);
                {
                this.state = 1522;
                this.match(ApexParser.EXCLUDES);
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ValueContext(this.context, this.state);
        this.enterRule(localContext, 230, ApexParser.RULE_value);
        let _la: number;
        try {
            this.state = 1545;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 148, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1525;
                this.match(ApexParser.NULL);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1526;
                this.match(ApexParser.BooleanLiteral);
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1527;
                this.signedNumber();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1528;
                this.match(ApexParser.StringLiteral);
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1529;
                this.match(ApexParser.DateLiteral);
                }
                break;
            case 6:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1530;
                this.match(ApexParser.DateTimeLiteral);
                }
                break;
            case 7:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 1531;
                this.dateFormula();
                }
                break;
            case 8:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 1532;
                this.match(ApexParser.IntegralCurrencyLiteral);
                this.state = 1537;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 206) {
                    {
                    this.state = 1533;
                    this.match(ApexParser.DOT);
                    this.state = 1535;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 192) {
                        {
                        this.state = 1534;
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
                this.state = 1539;
                this.match(ApexParser.LPAREN);
                this.state = 1540;
                this.subQuery();
                this.state = 1541;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 10:
                this.enterOuterAlt(localContext, 10);
                {
                this.state = 1543;
                this.valueList();
                }
                break;
            case 11:
                this.enterOuterAlt(localContext, 11);
                {
                this.state = 1544;
                this.boundExpression();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ValueListContext(this.context, this.state);
        this.enterRule(localContext, 232, ApexParser.RULE_valueList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1547;
            this.match(ApexParser.LPAREN);
            this.state = 1548;
            this.value();
            this.state = 1553;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 1549;
                this.match(ApexParser.COMMA);
                this.state = 1550;
                this.value();
                }
                }
                this.state = 1555;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 1556;
            this.match(ApexParser.RPAREN);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new SignedNumberContext(this.context, this.state);
        this.enterRule(localContext, 234, ApexParser.RULE_signedNumber);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1559;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 224 || _la === 225) {
                {
                this.state = 1558;
                _la = this.tokenStream.LA(1);
                if(!(_la === 224 || _la === 225)) {
                this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                }
            }

            this.state = 1561;
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
                localContext.exception = re;
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
        const localContext = new WithClauseContext(this.context, this.state);
        this.enterRule(localContext, 236, ApexParser.RULE_withClause);
        try {
            this.state = 1575;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 151, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1563;
                this.match(ApexParser.WITH);
                this.state = 1564;
                this.match(ApexParser.DATA);
                this.state = 1565;
                this.match(ApexParser.CATEGORY);
                this.state = 1566;
                this.filteringExpression();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1567;
                this.match(ApexParser.WITH);
                this.state = 1568;
                this.match(ApexParser.SECURITY_ENFORCED);
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1569;
                this.match(ApexParser.WITH);
                this.state = 1570;
                this.match(ApexParser.SYSTEM_MODE);
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1571;
                this.match(ApexParser.WITH);
                this.state = 1572;
                this.match(ApexParser.USER_MODE);
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1573;
                this.match(ApexParser.WITH);
                this.state = 1574;
                this.logicalExpression();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new FilteringExpressionContext(this.context, this.state);
        this.enterRule(localContext, 238, ApexParser.RULE_filteringExpression);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1577;
            this.dataCategorySelection();
            this.state = 1582;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 220) {
                {
                {
                this.state = 1578;
                this.match(ApexParser.AND);
                this.state = 1579;
                this.dataCategorySelection();
                }
                }
                this.state = 1584;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new DataCategorySelectionContext(this.context, this.state);
        this.enterRule(localContext, 240, ApexParser.RULE_dataCategorySelection);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1585;
            this.soqlId();
            this.state = 1586;
            this.filteringSelector();
            this.state = 1587;
            this.dataCategoryName();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new DataCategoryNameContext(this.context, this.state);
        this.enterRule(localContext, 242, ApexParser.RULE_dataCategoryName);
        let _la: number;
        try {
            this.state = 1601;
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
                this.state = 1589;
                this.soqlId();
                }
                break;
            case ApexParser.LPAREN:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1590;
                this.match(ApexParser.LPAREN);
                this.state = 1591;
                this.soqlId();
                this.state = 1596;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 205) {
                    {
                    {
                    this.state = 1592;
                    this.match(ApexParser.COMMA);
                    this.state = 1593;
                    this.soqlId();
                    }
                    }
                    this.state = 1598;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 1599;
                this.match(ApexParser.LPAREN);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new FilteringSelectorContext(this.context, this.state);
        this.enterRule(localContext, 244, ApexParser.RULE_filteringSelector);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1603;
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
                localContext.exception = re;
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
        const localContext = new GroupByClauseContext(this.context, this.state);
        this.enterRule(localContext, 246, ApexParser.RULE_groupByClause);
        let _la: number;
        try {
            this.state = 1640;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 158, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1605;
                this.match(ApexParser.GROUP);
                this.state = 1606;
                this.match(ApexParser.BY);
                this.state = 1607;
                this.selectList();
                this.state = 1610;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 93) {
                    {
                    this.state = 1608;
                    this.match(ApexParser.HAVING);
                    this.state = 1609;
                    this.logicalExpression();
                    }
                }

                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1612;
                this.match(ApexParser.GROUP);
                this.state = 1613;
                this.match(ApexParser.BY);
                this.state = 1614;
                this.match(ApexParser.ROLLUP);
                this.state = 1615;
                this.match(ApexParser.LPAREN);
                this.state = 1616;
                this.fieldName();
                this.state = 1621;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 205) {
                    {
                    {
                    this.state = 1617;
                    this.match(ApexParser.COMMA);
                    this.state = 1618;
                    this.fieldName();
                    }
                    }
                    this.state = 1623;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 1624;
                this.match(ApexParser.RPAREN);
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1626;
                this.match(ApexParser.GROUP);
                this.state = 1627;
                this.match(ApexParser.BY);
                this.state = 1628;
                this.match(ApexParser.CUBE);
                this.state = 1629;
                this.match(ApexParser.LPAREN);
                this.state = 1630;
                this.fieldName();
                this.state = 1635;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 205) {
                    {
                    {
                    this.state = 1631;
                    this.match(ApexParser.COMMA);
                    this.state = 1632;
                    this.fieldName();
                    }
                    }
                    this.state = 1637;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 1638;
                this.match(ApexParser.RPAREN);
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new OrderByClauseContext(this.context, this.state);
        this.enterRule(localContext, 248, ApexParser.RULE_orderByClause);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1642;
            this.match(ApexParser.ORDER);
            this.state = 1643;
            this.match(ApexParser.BY);
            this.state = 1644;
            this.fieldOrderList();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new FieldOrderListContext(this.context, this.state);
        this.enterRule(localContext, 250, ApexParser.RULE_fieldOrderList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1646;
            this.fieldOrder();
            this.state = 1651;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 205) {
                {
                {
                this.state = 1647;
                this.match(ApexParser.COMMA);
                this.state = 1648;
                this.fieldOrder();
                }
                }
                this.state = 1653;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new FieldOrderContext(this.context, this.state);
        this.enterRule(localContext, 252, ApexParser.RULE_fieldOrder);
        let _la: number;
        try {
            this.state = 1670;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 164, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1654;
                this.fieldName();
                this.state = 1656;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 84 || _la === 85) {
                    {
                    this.state = 1655;
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

                this.state = 1660;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 86) {
                    {
                    this.state = 1658;
                    this.match(ApexParser.NULLS);
                    this.state = 1659;
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
                this.state = 1662;
                this.soqlFunction();
                this.state = 1664;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 84 || _la === 85) {
                    {
                    this.state = 1663;
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

                this.state = 1668;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 86) {
                    {
                    this.state = 1666;
                    this.match(ApexParser.NULLS);
                    this.state = 1667;
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
                localContext.exception = re;
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
        const localContext = new LimitClauseContext(this.context, this.state);
        this.enterRule(localContext, 254, ApexParser.RULE_limitClause);
        try {
            this.state = 1676;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 165, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1672;
                this.match(ApexParser.LIMIT);
                this.state = 1673;
                this.match(ApexParser.IntegerLiteral);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1674;
                this.match(ApexParser.LIMIT);
                this.state = 1675;
                this.boundExpression();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new OffsetClauseContext(this.context, this.state);
        this.enterRule(localContext, 256, ApexParser.RULE_offsetClause);
        try {
            this.state = 1682;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 166, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1678;
                this.match(ApexParser.OFFSET);
                this.state = 1679;
                this.match(ApexParser.IntegerLiteral);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1680;
                this.match(ApexParser.OFFSET);
                this.state = 1681;
                this.boundExpression();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new AllRowsClauseContext(this.context, this.state);
        this.enterRule(localContext, 258, ApexParser.RULE_allRowsClause);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1684;
            this.match(ApexParser.ALL);
            this.state = 1685;
            this.match(ApexParser.ROWS);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new ForClausesContext(this.context, this.state);
        this.enterRule(localContext, 260, ApexParser.RULE_forClauses);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1691;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 15) {
                {
                {
                this.state = 1687;
                this.match(ApexParser.FOR);
                this.state = 1688;
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
                this.state = 1693;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new BoundExpressionContext(this.context, this.state);
        this.enterRule(localContext, 262, ApexParser.RULE_boundExpression);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1694;
            this.match(ApexParser.COLON);
            this.state = 1695;
            this.expression(0);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new DateFormulaContext(this.context, this.state);
        this.enterRule(localContext, 264, ApexParser.RULE_dateFormula);
        try {
            this.state = 1783;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.YESTERDAY:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1697;
                this.match(ApexParser.YESTERDAY);
                }
                break;
            case ApexParser.TODAY:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1698;
                this.match(ApexParser.TODAY);
                }
                break;
            case ApexParser.TOMORROW:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 1699;
                this.match(ApexParser.TOMORROW);
                }
                break;
            case ApexParser.LAST_WEEK:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 1700;
                this.match(ApexParser.LAST_WEEK);
                }
                break;
            case ApexParser.THIS_WEEK:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 1701;
                this.match(ApexParser.THIS_WEEK);
                }
                break;
            case ApexParser.NEXT_WEEK:
                this.enterOuterAlt(localContext, 6);
                {
                this.state = 1702;
                this.match(ApexParser.NEXT_WEEK);
                }
                break;
            case ApexParser.LAST_MONTH:
                this.enterOuterAlt(localContext, 7);
                {
                this.state = 1703;
                this.match(ApexParser.LAST_MONTH);
                }
                break;
            case ApexParser.THIS_MONTH:
                this.enterOuterAlt(localContext, 8);
                {
                this.state = 1704;
                this.match(ApexParser.THIS_MONTH);
                }
                break;
            case ApexParser.NEXT_MONTH:
                this.enterOuterAlt(localContext, 9);
                {
                this.state = 1705;
                this.match(ApexParser.NEXT_MONTH);
                }
                break;
            case ApexParser.LAST_90_DAYS:
                this.enterOuterAlt(localContext, 10);
                {
                this.state = 1706;
                this.match(ApexParser.LAST_90_DAYS);
                }
                break;
            case ApexParser.NEXT_90_DAYS:
                this.enterOuterAlt(localContext, 11);
                {
                this.state = 1707;
                this.match(ApexParser.NEXT_90_DAYS);
                }
                break;
            case ApexParser.LAST_N_DAYS_N:
                this.enterOuterAlt(localContext, 12);
                {
                this.state = 1708;
                this.match(ApexParser.LAST_N_DAYS_N);
                this.state = 1709;
                this.match(ApexParser.COLON);
                this.state = 1710;
                this.signedInteger();
                }
                break;
            case ApexParser.NEXT_N_DAYS_N:
                this.enterOuterAlt(localContext, 13);
                {
                this.state = 1711;
                this.match(ApexParser.NEXT_N_DAYS_N);
                this.state = 1712;
                this.match(ApexParser.COLON);
                this.state = 1713;
                this.signedInteger();
                }
                break;
            case ApexParser.N_DAYS_AGO_N:
                this.enterOuterAlt(localContext, 14);
                {
                this.state = 1714;
                this.match(ApexParser.N_DAYS_AGO_N);
                this.state = 1715;
                this.match(ApexParser.COLON);
                this.state = 1716;
                this.signedInteger();
                }
                break;
            case ApexParser.NEXT_N_WEEKS_N:
                this.enterOuterAlt(localContext, 15);
                {
                this.state = 1717;
                this.match(ApexParser.NEXT_N_WEEKS_N);
                this.state = 1718;
                this.match(ApexParser.COLON);
                this.state = 1719;
                this.signedInteger();
                }
                break;
            case ApexParser.LAST_N_WEEKS_N:
                this.enterOuterAlt(localContext, 16);
                {
                this.state = 1720;
                this.match(ApexParser.LAST_N_WEEKS_N);
                this.state = 1721;
                this.match(ApexParser.COLON);
                this.state = 1722;
                this.signedInteger();
                }
                break;
            case ApexParser.N_WEEKS_AGO_N:
                this.enterOuterAlt(localContext, 17);
                {
                this.state = 1723;
                this.match(ApexParser.N_WEEKS_AGO_N);
                this.state = 1724;
                this.match(ApexParser.COLON);
                this.state = 1725;
                this.signedInteger();
                }
                break;
            case ApexParser.NEXT_N_MONTHS_N:
                this.enterOuterAlt(localContext, 18);
                {
                this.state = 1726;
                this.match(ApexParser.NEXT_N_MONTHS_N);
                this.state = 1727;
                this.match(ApexParser.COLON);
                this.state = 1728;
                this.signedInteger();
                }
                break;
            case ApexParser.LAST_N_MONTHS_N:
                this.enterOuterAlt(localContext, 19);
                {
                this.state = 1729;
                this.match(ApexParser.LAST_N_MONTHS_N);
                this.state = 1730;
                this.match(ApexParser.COLON);
                this.state = 1731;
                this.signedInteger();
                }
                break;
            case ApexParser.N_MONTHS_AGO_N:
                this.enterOuterAlt(localContext, 20);
                {
                this.state = 1732;
                this.match(ApexParser.N_MONTHS_AGO_N);
                this.state = 1733;
                this.match(ApexParser.COLON);
                this.state = 1734;
                this.signedInteger();
                }
                break;
            case ApexParser.THIS_QUARTER:
                this.enterOuterAlt(localContext, 21);
                {
                this.state = 1735;
                this.match(ApexParser.THIS_QUARTER);
                }
                break;
            case ApexParser.LAST_QUARTER:
                this.enterOuterAlt(localContext, 22);
                {
                this.state = 1736;
                this.match(ApexParser.LAST_QUARTER);
                }
                break;
            case ApexParser.NEXT_QUARTER:
                this.enterOuterAlt(localContext, 23);
                {
                this.state = 1737;
                this.match(ApexParser.NEXT_QUARTER);
                }
                break;
            case ApexParser.NEXT_N_QUARTERS_N:
                this.enterOuterAlt(localContext, 24);
                {
                this.state = 1738;
                this.match(ApexParser.NEXT_N_QUARTERS_N);
                this.state = 1739;
                this.match(ApexParser.COLON);
                this.state = 1740;
                this.signedInteger();
                }
                break;
            case ApexParser.LAST_N_QUARTERS_N:
                this.enterOuterAlt(localContext, 25);
                {
                this.state = 1741;
                this.match(ApexParser.LAST_N_QUARTERS_N);
                this.state = 1742;
                this.match(ApexParser.COLON);
                this.state = 1743;
                this.signedInteger();
                }
                break;
            case ApexParser.N_QUARTERS_AGO_N:
                this.enterOuterAlt(localContext, 26);
                {
                this.state = 1744;
                this.match(ApexParser.N_QUARTERS_AGO_N);
                this.state = 1745;
                this.match(ApexParser.COLON);
                this.state = 1746;
                this.signedInteger();
                }
                break;
            case ApexParser.THIS_YEAR:
                this.enterOuterAlt(localContext, 27);
                {
                this.state = 1747;
                this.match(ApexParser.THIS_YEAR);
                }
                break;
            case ApexParser.LAST_YEAR:
                this.enterOuterAlt(localContext, 28);
                {
                this.state = 1748;
                this.match(ApexParser.LAST_YEAR);
                }
                break;
            case ApexParser.NEXT_YEAR:
                this.enterOuterAlt(localContext, 29);
                {
                this.state = 1749;
                this.match(ApexParser.NEXT_YEAR);
                }
                break;
            case ApexParser.NEXT_N_YEARS_N:
                this.enterOuterAlt(localContext, 30);
                {
                this.state = 1750;
                this.match(ApexParser.NEXT_N_YEARS_N);
                this.state = 1751;
                this.match(ApexParser.COLON);
                this.state = 1752;
                this.signedInteger();
                }
                break;
            case ApexParser.LAST_N_YEARS_N:
                this.enterOuterAlt(localContext, 31);
                {
                this.state = 1753;
                this.match(ApexParser.LAST_N_YEARS_N);
                this.state = 1754;
                this.match(ApexParser.COLON);
                this.state = 1755;
                this.signedInteger();
                }
                break;
            case ApexParser.N_YEARS_AGO_N:
                this.enterOuterAlt(localContext, 32);
                {
                this.state = 1756;
                this.match(ApexParser.N_YEARS_AGO_N);
                this.state = 1757;
                this.match(ApexParser.COLON);
                this.state = 1758;
                this.signedInteger();
                }
                break;
            case ApexParser.THIS_FISCAL_QUARTER:
                this.enterOuterAlt(localContext, 33);
                {
                this.state = 1759;
                this.match(ApexParser.THIS_FISCAL_QUARTER);
                }
                break;
            case ApexParser.LAST_FISCAL_QUARTER:
                this.enterOuterAlt(localContext, 34);
                {
                this.state = 1760;
                this.match(ApexParser.LAST_FISCAL_QUARTER);
                }
                break;
            case ApexParser.NEXT_FISCAL_QUARTER:
                this.enterOuterAlt(localContext, 35);
                {
                this.state = 1761;
                this.match(ApexParser.NEXT_FISCAL_QUARTER);
                }
                break;
            case ApexParser.NEXT_N_FISCAL_QUARTERS_N:
                this.enterOuterAlt(localContext, 36);
                {
                this.state = 1762;
                this.match(ApexParser.NEXT_N_FISCAL_QUARTERS_N);
                this.state = 1763;
                this.match(ApexParser.COLON);
                this.state = 1764;
                this.signedInteger();
                }
                break;
            case ApexParser.LAST_N_FISCAL_QUARTERS_N:
                this.enterOuterAlt(localContext, 37);
                {
                this.state = 1765;
                this.match(ApexParser.LAST_N_FISCAL_QUARTERS_N);
                this.state = 1766;
                this.match(ApexParser.COLON);
                this.state = 1767;
                this.signedInteger();
                }
                break;
            case ApexParser.N_FISCAL_QUARTERS_AGO_N:
                this.enterOuterAlt(localContext, 38);
                {
                this.state = 1768;
                this.match(ApexParser.N_FISCAL_QUARTERS_AGO_N);
                this.state = 1769;
                this.match(ApexParser.COLON);
                this.state = 1770;
                this.signedInteger();
                }
                break;
            case ApexParser.THIS_FISCAL_YEAR:
                this.enterOuterAlt(localContext, 39);
                {
                this.state = 1771;
                this.match(ApexParser.THIS_FISCAL_YEAR);
                }
                break;
            case ApexParser.LAST_FISCAL_YEAR:
                this.enterOuterAlt(localContext, 40);
                {
                this.state = 1772;
                this.match(ApexParser.LAST_FISCAL_YEAR);
                }
                break;
            case ApexParser.NEXT_FISCAL_YEAR:
                this.enterOuterAlt(localContext, 41);
                {
                this.state = 1773;
                this.match(ApexParser.NEXT_FISCAL_YEAR);
                }
                break;
            case ApexParser.NEXT_N_FISCAL_YEARS_N:
                this.enterOuterAlt(localContext, 42);
                {
                this.state = 1774;
                this.match(ApexParser.NEXT_N_FISCAL_YEARS_N);
                this.state = 1775;
                this.match(ApexParser.COLON);
                this.state = 1776;
                this.signedInteger();
                }
                break;
            case ApexParser.LAST_N_FISCAL_YEARS_N:
                this.enterOuterAlt(localContext, 43);
                {
                this.state = 1777;
                this.match(ApexParser.LAST_N_FISCAL_YEARS_N);
                this.state = 1778;
                this.match(ApexParser.COLON);
                this.state = 1779;
                this.signedInteger();
                }
                break;
            case ApexParser.N_FISCAL_YEARS_AGO_N:
                this.enterOuterAlt(localContext, 44);
                {
                this.state = 1780;
                this.match(ApexParser.N_FISCAL_YEARS_AGO_N);
                this.state = 1781;
                this.match(ApexParser.COLON);
                this.state = 1782;
                this.signedInteger();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new SignedIntegerContext(this.context, this.state);
        this.enterRule(localContext, 266, ApexParser.RULE_signedInteger);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1786;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 224 || _la === 225) {
                {
                this.state = 1785;
                _la = this.tokenStream.LA(1);
                if(!(_la === 224 || _la === 225)) {
                this.errorHandler.recoverInline(this);
                }
                else {
                    this.errorHandler.reportMatch(this);
                    this.consume();
                }
                }
            }

            this.state = 1788;
            this.match(ApexParser.IntegerLiteral);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new SoqlIdContext(this.context, this.state);
        this.enterRule(localContext, 268, ApexParser.RULE_soqlId);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1790;
            this.id();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new SoslLiteralContext(this.context, this.state);
        this.enterRule(localContext, 270, ApexParser.RULE_soslLiteral);
        try {
            this.state = 1802;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ApexParser.FindLiteral:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 1792;
                this.match(ApexParser.FindLiteral);
                this.state = 1793;
                this.soslClauses();
                this.state = 1794;
                this.match(ApexParser.RBRACK);
                }
                break;
            case ApexParser.LBRACK:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 1796;
                this.match(ApexParser.LBRACK);
                this.state = 1797;
                this.match(ApexParser.FIND);
                this.state = 1798;
                this.boundExpression();
                this.state = 1799;
                this.soslClauses();
                this.state = 1800;
                this.match(ApexParser.RBRACK);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new SoslLiteralAltContext(this.context, this.state);
        this.enterRule(localContext, 272, ApexParser.RULE_soslLiteralAlt);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1804;
            this.match(ApexParser.FindLiteralAlt);
            this.state = 1805;
            this.soslClauses();
            this.state = 1806;
            this.match(ApexParser.RBRACK);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new SoslClausesContext(this.context, this.state);
        this.enterRule(localContext, 274, ApexParser.RULE_soslClauses);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1810;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 81) {
                {
                this.state = 1808;
                this.match(ApexParser.IN);
                this.state = 1809;
                this.searchGroup();
                }
            }

            this.state = 1814;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 188) {
                {
                this.state = 1812;
                this.match(ApexParser.RETURNING);
                this.state = 1813;
                this.fieldSpecList();
                }
            }

            this.state = 1820;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 173, this.context) ) {
            case 1:
                {
                this.state = 1816;
                this.match(ApexParser.WITH);
                this.state = 1817;
                this.match(ApexParser.DIVISION);
                this.state = 1818;
                this.match(ApexParser.ASSIGN);
                this.state = 1819;
                this.match(ApexParser.StringLiteral);
                }
                break;
            }
            this.state = 1826;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 174, this.context) ) {
            case 1:
                {
                this.state = 1822;
                this.match(ApexParser.WITH);
                this.state = 1823;
                this.match(ApexParser.DATA);
                this.state = 1824;
                this.match(ApexParser.CATEGORY);
                this.state = 1825;
                this.filteringExpression();
                }
                break;
            }
            this.state = 1837;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 176, this.context) ) {
            case 1:
                {
                this.state = 1828;
                this.match(ApexParser.WITH);
                this.state = 1829;
                this.match(ApexParser.SNIPPET);
                this.state = 1835;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 198) {
                    {
                    this.state = 1830;
                    this.match(ApexParser.LPAREN);
                    this.state = 1831;
                    this.match(ApexParser.TARGET_LENGTH);
                    this.state = 1832;
                    this.match(ApexParser.ASSIGN);
                    this.state = 1833;
                    this.match(ApexParser.IntegerLiteral);
                    this.state = 1834;
                    this.match(ApexParser.RPAREN);
                    }
                }

                }
                break;
            }
            this.state = 1846;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 177, this.context) ) {
            case 1:
                {
                this.state = 1839;
                this.match(ApexParser.WITH);
                this.state = 1840;
                this.match(ApexParser.NETWORK);
                this.state = 1841;
                this.match(ApexParser.IN);
                this.state = 1842;
                this.match(ApexParser.LPAREN);
                this.state = 1843;
                this.networkList();
                this.state = 1844;
                this.match(ApexParser.RPAREN);
                }
                break;
            }
            this.state = 1852;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 178, this.context) ) {
            case 1:
                {
                this.state = 1848;
                this.match(ApexParser.WITH);
                this.state = 1849;
                this.match(ApexParser.NETWORK);
                this.state = 1850;
                this.match(ApexParser.ASSIGN);
                this.state = 1851;
                this.match(ApexParser.StringLiteral);
                }
                break;
            }
            this.state = 1858;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 179, this.context) ) {
            case 1:
                {
                this.state = 1854;
                this.match(ApexParser.WITH);
                this.state = 1855;
                this.match(ApexParser.PRICEBOOKID);
                this.state = 1856;
                this.match(ApexParser.ASSIGN);
                this.state = 1857;
                this.match(ApexParser.StringLiteral);
                }
                break;
            }
            this.state = 1864;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 53) {
                {
                this.state = 1860;
                this.match(ApexParser.WITH);
                this.state = 1861;
                this.match(ApexParser.METADATA);
                this.state = 1862;
                this.match(ApexParser.ASSIGN);
                this.state = 1863;
                this.match(ApexParser.StringLiteral);
                }
            }

            this.state = 1867;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 68) {
                {
                this.state = 1866;
                this.limitClause();
                }
            }

            this.state = 1871;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 46) {
                {
                this.state = 1869;
                this.match(ApexParser.UPDATE);
                this.state = 1870;
                this.updateList();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new SearchGroupContext(this.context, this.state);
        this.enterRule(localContext, 276, ApexParser.RULE_searchGroup);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1873;
            _la = this.tokenStream.LA(1);
            if(!(_la === 90 || ((((_la - 177)) & ~0x1F) === 0 && ((1 << (_la - 177)) & 15) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 1874;
            this.match(ApexParser.FIELDS);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new FieldSpecListContext(this.context, this.state);
        this.enterRule(localContext, 278, ApexParser.RULE_fieldSpecList);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1876;
            this.fieldSpec();
            this.state = 1881;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 183, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1877;
                    this.match(ApexParser.COMMA);
                    this.state = 1878;
                    this.fieldSpecList();
                    }
                    }
                }
                this.state = 1883;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 183, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new FieldSpecContext(this.context, this.state);
        this.enterRule(localContext, 280, ApexParser.RULE_fieldSpec);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1884;
            this.soslId();
            this.state = 1910;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 198) {
                {
                this.state = 1885;
                this.match(ApexParser.LPAREN);
                this.state = 1886;
                this.fieldList();
                this.state = 1889;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 65) {
                    {
                    this.state = 1887;
                    this.match(ApexParser.WHERE);
                    this.state = 1888;
                    this.logicalExpression();
                    }
                }

                this.state = 1895;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 63) {
                    {
                    this.state = 1891;
                    this.match(ApexParser.USING);
                    this.state = 1892;
                    this.match(ApexParser.LISTVIEW);
                    this.state = 1893;
                    this.match(ApexParser.ASSIGN);
                    this.state = 1894;
                    this.soslId();
                    }
                }

                this.state = 1900;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 66) {
                    {
                    this.state = 1897;
                    this.match(ApexParser.ORDER);
                    this.state = 1898;
                    this.match(ApexParser.BY);
                    this.state = 1899;
                    this.fieldOrderList();
                    }
                }

                this.state = 1903;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 68) {
                    {
                    this.state = 1902;
                    this.limitClause();
                    }
                }

                this.state = 1906;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 96) {
                    {
                    this.state = 1905;
                    this.offsetClause();
                    }
                }

                this.state = 1908;
                this.match(ApexParser.RPAREN);
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new FieldListContext(this.context, this.state);
        this.enterRule(localContext, 282, ApexParser.RULE_fieldList);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1912;
            this.soslId();
            this.state = 1917;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 190, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1913;
                    this.match(ApexParser.COMMA);
                    this.state = 1914;
                    this.fieldList();
                    }
                    }
                }
                this.state = 1919;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 190, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new UpdateListContext(this.context, this.state);
        this.enterRule(localContext, 284, ApexParser.RULE_updateList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1920;
            this.updateType();
            this.state = 1923;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 205) {
                {
                this.state = 1921;
                this.match(ApexParser.COMMA);
                this.state = 1922;
                this.updateList();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new UpdateTypeContext(this.context, this.state);
        this.enterRule(localContext, 286, ApexParser.RULE_updateType);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1925;
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
                localContext.exception = re;
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
        const localContext = new NetworkListContext(this.context, this.state);
        this.enterRule(localContext, 288, ApexParser.RULE_networkList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1927;
            this.match(ApexParser.StringLiteral);
            this.state = 1930;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 205) {
                {
                this.state = 1928;
                this.match(ApexParser.COMMA);
                this.state = 1929;
                this.networkList();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new SoslIdContext(this.context, this.state);
        this.enterRule(localContext, 290, ApexParser.RULE_soslId);
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1932;
            this.id();
            this.state = 1937;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 193, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 1933;
                    this.match(ApexParser.DOT);
                    this.state = 1934;
                    this.soslId();
                    }
                    }
                }
                this.state = 1939;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 193, this.context);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
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
        const localContext = new IdContext(this.context, this.state);
        this.enterRule(localContext, 292, ApexParser.RULE_id);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1940;
            _la = this.tokenStream.LA(1);
            if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 5308428) !== 0) || ((((_la - 34)) & ~0x1F) === 0 && ((1 << (_la - 34)) & 4288283411) !== 0) || ((((_la - 66)) & ~0x1F) === 0 && ((1 << (_la - 66)) & 4294967295) !== 0) || ((((_la - 98)) & ~0x1F) === 0 && ((1 << (_la - 98)) & 4294967295) !== 0) || ((((_la - 130)) & ~0x1F) === 0 && ((1 << (_la - 130)) & 4294967295) !== 0) || ((((_la - 162)) & ~0x1F) === 0 && ((1 << (_la - 162)) & 268429311) !== 0) || _la === 243)) {
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
                localContext.exception = re;
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
        const localContext = new AnyIdContext(this.context, this.state);
        this.enterRule(localContext, 294, ApexParser.RULE_anyId);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 1942;
            _la = this.tokenStream.LA(1);
            if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 4294967294) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & 4294836221) !== 0) || ((((_la - 64)) & ~0x1F) === 0 && ((1 << (_la - 64)) & 4294967295) !== 0) || ((((_la - 96)) & ~0x1F) === 0 && ((1 << (_la - 96)) & 4294967295) !== 0) || ((((_la - 128)) & ~0x1F) === 0 && ((1 << (_la - 128)) & 4294967295) !== 0) || ((((_la - 160)) & ~0x1F) === 0 && ((1 << (_la - 160)) & 1073717247) !== 0) || _la === 243)) {
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
                localContext.exception = re;
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

    public override sempred(localContext: antlr.RuleContext | null, ruleIndex: number, predIndex: number): boolean {
        switch (ruleIndex) {
        case 77:
            return this.expression_sempred(localContext as ExpressionContext, predIndex);
        }
        return true;
    }
    private expression_sempred(localContext: ExpressionContext | null, predIndex: number): boolean {
        switch (predIndex) {
        case 0:
            return this.precpred(this.context, 13);
        case 1:
            return this.precpred(this.context, 12);
        case 2:
            return this.precpred(this.context, 11);
        case 3:
            return this.precpred(this.context, 10);
        case 4:
            return this.precpred(this.context, 8);
        case 5:
            return this.precpred(this.context, 7);
        case 6:
            return this.precpred(this.context, 6);
        case 7:
            return this.precpred(this.context, 5);
        case 8:
            return this.precpred(this.context, 4);
        case 9:
            return this.precpred(this.context, 3);
        case 10:
            return this.precpred(this.context, 2);
        case 11:
            return this.precpred(this.context, 1);
        case 12:
            return this.precpred(this.context, 22);
        case 13:
            return this.precpred(this.context, 21);
        case 14:
            return this.precpred(this.context, 16);
        case 15:
            return this.precpred(this.context, 9);
        }
        return true;
    }

    public static readonly _serializedATN: number[] = [
        4,1,247,1945,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,
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
        7,142,2,143,7,143,2,144,7,144,2,145,7,145,2,146,7,146,2,147,7,147,
        1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,5,0,305,8,0,10,0,12,0,308,9,0,1,
        0,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,322,8,1,10,1,12,
        1,325,9,1,1,1,1,1,1,1,1,1,1,2,1,2,1,2,1,3,1,3,5,3,336,8,3,10,3,12,
        3,339,9,3,1,3,1,3,1,4,5,4,344,8,4,10,4,12,4,347,9,4,1,4,1,4,3,4,
        351,8,4,1,5,5,5,354,8,5,10,5,12,5,357,9,5,1,5,1,5,1,6,5,6,362,8,
        6,10,6,12,6,365,9,6,1,6,1,6,5,6,369,8,6,10,6,12,6,372,9,6,1,6,1,
        6,5,6,376,8,6,10,6,12,6,379,9,6,1,6,3,6,382,8,6,1,7,1,7,1,7,1,7,
        3,7,388,8,7,1,7,1,7,3,7,392,8,7,1,7,1,7,1,8,1,8,1,8,1,8,3,8,400,
        8,8,1,8,1,8,1,9,1,9,1,9,5,9,407,8,9,10,9,12,9,410,9,9,1,10,1,10,
        1,10,1,10,3,10,416,8,10,1,10,1,10,1,11,1,11,1,11,5,11,423,8,11,10,
        11,12,11,426,9,11,1,12,1,12,5,12,430,8,12,10,12,12,12,433,9,12,1,
        12,1,12,1,13,1,13,5,13,439,8,13,10,13,12,13,442,9,13,1,13,1,13,1,
        14,1,14,3,14,448,8,14,1,14,1,14,5,14,452,8,14,10,14,12,14,455,9,
        14,1,14,3,14,458,8,14,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,
        15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,3,15,479,8,
        15,1,16,1,16,1,16,1,16,1,16,1,16,1,16,3,16,488,8,16,1,17,1,17,1,
        17,1,17,1,17,1,17,3,17,496,8,17,1,18,1,18,3,18,500,8,18,1,18,1,18,
        1,18,1,18,3,18,506,8,18,1,19,1,19,1,19,1,19,1,20,1,20,1,20,1,20,
        1,21,1,21,1,21,1,21,5,21,520,8,21,10,21,12,21,523,9,21,1,21,1,21,
        1,22,5,22,528,8,22,10,22,12,22,531,9,22,1,22,1,22,3,22,535,8,22,
        1,22,1,22,1,22,1,22,1,23,1,23,1,23,5,23,544,8,23,10,23,12,23,547,
        9,23,1,24,1,24,1,24,3,24,552,8,24,1,25,1,25,1,25,1,25,5,25,558,8,
        25,10,25,12,25,561,9,25,1,25,3,25,564,8,25,3,25,566,8,25,1,25,1,
        25,1,26,1,26,1,26,5,26,573,8,26,10,26,12,26,576,9,26,1,26,1,26,1,
        27,1,27,5,27,582,8,27,10,27,12,27,585,9,27,1,28,1,28,3,28,589,8,
        28,1,28,1,28,3,28,593,8,28,1,28,1,28,3,28,597,8,28,1,28,1,28,3,28,
        601,8,28,3,28,603,8,28,1,29,1,29,1,29,1,29,1,30,1,30,3,30,611,8,
        30,1,30,1,30,1,31,1,31,1,31,5,31,618,8,31,10,31,12,31,621,9,31,1,
        32,5,32,624,8,32,10,32,12,32,627,9,32,1,32,1,32,1,32,1,33,1,33,1,
        33,5,33,635,8,33,10,33,12,33,638,9,33,1,34,1,34,1,35,1,35,1,35,1,
        35,1,35,3,35,647,8,35,1,35,3,35,650,8,35,1,36,1,36,3,36,654,8,36,
        1,36,5,36,657,8,36,10,36,12,36,660,9,36,1,37,1,37,1,37,1,37,1,38,
        1,38,1,38,3,38,669,8,38,1,39,1,39,1,39,1,39,5,39,675,8,39,10,39,
        12,39,678,9,39,3,39,680,8,39,1,39,3,39,683,8,39,1,39,1,39,1,40,1,
        40,5,40,689,8,40,10,40,12,40,692,9,40,1,40,1,40,1,41,1,41,1,41,1,
        42,5,42,700,8,42,10,42,12,42,703,9,42,1,42,1,42,1,42,1,43,1,43,1,
        43,1,43,1,43,1,43,1,43,1,43,1,43,1,43,1,43,1,43,1,43,1,43,1,43,1,
        43,1,43,1,43,1,43,1,43,3,43,728,8,43,1,44,1,44,1,44,1,44,1,44,3,
        44,735,8,44,1,45,1,45,1,45,1,45,1,45,4,45,742,8,45,11,45,12,45,743,
        1,45,1,45,1,46,1,46,1,46,1,46,1,47,1,47,1,47,1,47,5,47,756,8,47,
        10,47,12,47,759,9,47,1,47,1,47,1,47,3,47,764,8,47,1,48,3,48,767,
        8,48,1,48,1,48,1,48,1,48,1,48,1,48,1,48,1,48,1,48,3,48,778,8,48,
        1,49,1,49,1,49,1,49,1,49,1,49,3,49,786,8,49,1,50,1,50,1,50,1,50,
        3,50,792,8,50,1,51,1,51,1,51,1,51,1,51,1,51,1,52,1,52,1,52,4,52,
        803,8,52,11,52,12,52,804,1,52,3,52,808,8,52,1,52,3,52,811,8,52,1,
        53,1,53,3,53,815,8,53,1,53,1,53,1,54,1,54,1,54,1,54,1,55,1,55,1,
        55,1,56,1,56,1,56,1,57,1,57,1,57,1,58,1,58,3,58,834,8,58,1,58,1,
        58,1,58,1,59,1,59,3,59,841,8,59,1,59,1,59,1,59,1,60,1,60,3,60,848,
        8,60,1,60,1,60,1,60,1,61,1,61,3,61,855,8,61,1,61,1,61,1,61,1,62,
        1,62,3,62,862,8,62,1,62,1,62,3,62,866,8,62,1,62,1,62,1,63,1,63,3,
        63,872,8,63,1,63,1,63,1,63,1,63,1,64,1,64,1,64,3,64,881,8,64,1,64,
        1,64,1,64,1,65,1,65,1,65,1,66,5,66,890,8,66,10,66,12,66,893,9,66,
        1,66,1,66,3,66,897,8,66,1,67,1,67,1,67,3,67,902,8,67,1,68,1,68,1,
        68,3,68,907,8,68,1,69,1,69,1,69,5,69,912,8,69,10,69,12,69,915,9,
        69,1,69,1,69,1,69,1,69,1,69,1,70,1,70,1,70,1,71,1,71,3,71,927,8,
        71,1,71,1,71,3,71,931,8,71,1,71,1,71,3,71,935,8,71,3,71,937,8,71,
        1,72,1,72,3,72,941,8,72,1,73,1,73,1,73,1,73,1,73,1,74,1,74,1,75,
        1,75,1,75,1,75,1,76,1,76,1,76,5,76,957,8,76,10,76,12,76,960,9,76,
        1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,
        1,77,1,77,1,77,1,77,1,77,3,77,980,8,77,1,77,1,77,1,77,1,77,1,77,
        1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,3,77,996,8,77,1,77,
        1,77,1,77,1,77,3,77,1002,8,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,
        1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,
        1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,3,77,
        1036,8,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,1,77,5,77,
        1048,8,77,10,77,12,77,1051,9,77,1,78,1,78,1,78,1,78,1,78,1,78,1,
        78,1,78,1,78,1,78,1,78,1,78,1,78,3,78,1066,8,78,1,79,1,79,1,79,3,
        79,1071,8,79,1,79,1,79,1,79,1,79,1,79,3,79,1078,8,79,1,79,1,79,1,
        79,1,79,3,79,1084,8,79,1,79,3,79,1087,8,79,1,80,1,80,1,80,3,80,1092,
        8,80,1,80,1,80,1,81,1,81,1,81,1,81,1,81,1,81,3,81,1102,8,81,1,82,
        1,82,1,82,5,82,1107,8,82,10,82,12,82,1110,9,82,1,83,1,83,1,83,1,
        83,1,83,3,83,1117,8,83,1,84,1,84,1,84,1,85,1,85,1,86,1,86,1,86,1,
        86,1,86,1,86,1,86,3,86,1131,8,86,3,86,1133,8,86,1,87,1,87,1,87,1,
        87,5,87,1139,8,87,10,87,12,87,1142,9,87,1,87,1,87,1,88,1,88,1,88,
        1,88,1,89,1,89,1,89,1,89,5,89,1154,8,89,10,89,12,89,1157,9,89,1,
        89,1,89,1,90,1,90,3,90,1163,8,90,1,90,1,90,1,91,1,91,1,91,1,91,1,
        92,1,92,1,92,1,92,1,92,3,92,1176,8,92,1,92,3,92,1179,8,92,1,92,3,
        92,1182,8,92,1,92,3,92,1185,8,92,1,92,3,92,1188,8,92,1,92,3,92,1191,
        8,92,1,92,3,92,1194,8,92,1,92,3,92,1197,8,92,1,92,1,92,1,92,3,92,
        1202,8,92,1,93,1,93,1,93,1,93,1,93,3,93,1209,8,93,1,93,3,93,1212,
        8,93,1,93,3,93,1215,8,93,1,93,1,93,1,93,3,93,1220,8,93,1,94,1,94,
        1,94,5,94,1225,8,94,10,94,12,94,1228,9,94,1,95,1,95,3,95,1232,8,
        95,1,95,1,95,3,95,1236,8,95,1,95,1,95,1,95,1,95,3,95,1242,8,95,1,
        95,3,95,1245,8,95,1,96,1,96,1,96,5,96,1250,8,96,10,96,12,96,1253,
        9,96,1,97,1,97,3,97,1257,8,97,1,97,1,97,1,97,3,97,1262,8,97,5,97,
        1264,8,97,10,97,12,97,1267,9,97,1,98,1,98,1,98,5,98,1272,8,98,10,
        98,12,98,1275,9,98,1,99,1,99,3,99,1279,8,99,1,99,1,99,3,99,1283,
        8,99,1,99,3,99,1286,8,99,1,100,1,100,1,101,1,101,1,101,1,101,1,101,
        1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,
        1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,
        1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,
        1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,
        1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,
        1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,
        1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,
        1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,
        1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,
        1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,1,101,
        1,101,1,101,1,101,1,101,1,101,1,101,1,101,3,101,1412,8,101,1,102,
        1,102,1,102,1,102,1,102,1,102,3,102,1420,8,102,1,103,1,103,1,103,
        1,103,1,103,1,103,1,103,1,103,1,103,3,103,1431,8,103,1,104,1,104,
        3,104,1435,8,104,1,105,1,105,1,105,4,105,1440,8,105,11,105,12,105,
        1441,1,105,3,105,1445,8,105,1,105,1,105,1,106,1,106,1,106,1,106,
        1,106,1,107,1,107,1,107,1,108,1,108,1,108,5,108,1460,8,108,10,108,
        12,108,1463,9,108,1,109,1,109,1,109,1,109,1,110,1,110,1,110,1,111,
        1,111,1,111,5,111,1475,8,111,10,111,12,111,1478,9,111,1,111,1,111,
        1,111,5,111,1483,8,111,10,111,12,111,1486,9,111,1,111,1,111,3,111,
        1490,8,111,1,112,1,112,1,112,1,112,1,112,3,112,1497,8,112,1,113,
        1,113,1,113,1,113,1,113,1,113,1,113,1,113,3,113,1507,8,113,1,114,
        1,114,1,114,1,114,1,114,1,114,1,114,1,114,1,114,1,114,1,114,1,114,
        1,114,1,114,1,114,3,114,1524,8,114,1,115,1,115,1,115,1,115,1,115,
        1,115,1,115,1,115,1,115,1,115,3,115,1536,8,115,3,115,1538,8,115,
        1,115,1,115,1,115,1,115,1,115,1,115,3,115,1546,8,115,1,116,1,116,
        1,116,1,116,5,116,1552,8,116,10,116,12,116,1555,9,116,1,116,1,116,
        1,117,3,117,1560,8,117,1,117,1,117,1,118,1,118,1,118,1,118,1,118,
        1,118,1,118,1,118,1,118,1,118,1,118,1,118,3,118,1576,8,118,1,119,
        1,119,1,119,5,119,1581,8,119,10,119,12,119,1584,9,119,1,120,1,120,
        1,120,1,120,1,121,1,121,1,121,1,121,1,121,5,121,1595,8,121,10,121,
        12,121,1598,9,121,1,121,1,121,3,121,1602,8,121,1,122,1,122,1,123,
        1,123,1,123,1,123,1,123,3,123,1611,8,123,1,123,1,123,1,123,1,123,
        1,123,1,123,1,123,5,123,1620,8,123,10,123,12,123,1623,9,123,1,123,
        1,123,1,123,1,123,1,123,1,123,1,123,1,123,1,123,5,123,1634,8,123,
        10,123,12,123,1637,9,123,1,123,1,123,3,123,1641,8,123,1,124,1,124,
        1,124,1,124,1,125,1,125,1,125,5,125,1650,8,125,10,125,12,125,1653,
        9,125,1,126,1,126,3,126,1657,8,126,1,126,1,126,3,126,1661,8,126,
        1,126,1,126,3,126,1665,8,126,1,126,1,126,3,126,1669,8,126,3,126,
        1671,8,126,1,127,1,127,1,127,1,127,3,127,1677,8,127,1,128,1,128,
        1,128,1,128,3,128,1683,8,128,1,129,1,129,1,129,1,130,1,130,5,130,
        1690,8,130,10,130,12,130,1693,9,130,1,131,1,131,1,131,1,132,1,132,
        1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,
        1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,
        1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,
        1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,
        1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,
        1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,
        1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,1,132,
        1,132,1,132,1,132,1,132,1,132,1,132,1,132,3,132,1784,8,132,1,133,
        3,133,1787,8,133,1,133,1,133,1,134,1,134,1,135,1,135,1,135,1,135,
        1,135,1,135,1,135,1,135,1,135,1,135,3,135,1803,8,135,1,136,1,136,
        1,136,1,136,1,137,1,137,3,137,1811,8,137,1,137,1,137,3,137,1815,
        8,137,1,137,1,137,1,137,1,137,3,137,1821,8,137,1,137,1,137,1,137,
        1,137,3,137,1827,8,137,1,137,1,137,1,137,1,137,1,137,1,137,1,137,
        3,137,1836,8,137,3,137,1838,8,137,1,137,1,137,1,137,1,137,1,137,
        1,137,1,137,3,137,1847,8,137,1,137,1,137,1,137,1,137,3,137,1853,
        8,137,1,137,1,137,1,137,1,137,3,137,1859,8,137,1,137,1,137,1,137,
        1,137,3,137,1865,8,137,1,137,3,137,1868,8,137,1,137,1,137,3,137,
        1872,8,137,1,138,1,138,1,138,1,139,1,139,1,139,5,139,1880,8,139,
        10,139,12,139,1883,9,139,1,140,1,140,1,140,1,140,1,140,3,140,1890,
        8,140,1,140,1,140,1,140,1,140,3,140,1896,8,140,1,140,1,140,1,140,
        3,140,1901,8,140,1,140,3,140,1904,8,140,1,140,3,140,1907,8,140,1,
        140,1,140,3,140,1911,8,140,1,141,1,141,1,141,5,141,1916,8,141,10,
        141,12,141,1919,9,141,1,142,1,142,1,142,3,142,1924,8,142,1,143,1,
        143,1,144,1,144,1,144,3,144,1931,8,144,1,145,1,145,1,145,5,145,1936,
        8,145,10,145,12,145,1939,9,145,1,146,1,146,1,147,1,147,1,147,0,1,
        154,148,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,
        42,44,46,48,50,52,54,56,58,60,62,64,66,68,70,72,74,76,78,80,82,84,
        86,88,90,92,94,96,98,100,102,104,106,108,110,112,114,116,118,120,
        122,124,126,128,130,132,134,136,138,140,142,144,146,148,150,152,
        154,156,158,160,162,164,166,168,170,172,174,176,178,180,182,184,
        186,188,190,192,194,196,198,200,202,204,206,208,210,212,214,216,
        218,220,222,224,226,228,230,232,234,236,238,240,242,244,246,248,
        250,252,254,256,258,260,262,264,266,268,270,272,274,276,278,280,
        282,284,286,288,290,292,294,0,23,1,0,2,3,3,0,8,8,21,21,45,46,2,0,
        26,26,192,196,1,0,57,58,1,0,222,225,1,0,210,211,1,0,226,227,1,0,
        224,225,1,0,208,209,1,0,215,219,2,0,207,207,232,241,2,0,206,206,
        212,212,1,0,222,223,2,0,90,90,111,112,2,0,192,192,194,194,1,0,99,
        102,1,0,84,85,1,0,87,88,3,0,46,46,92,92,106,106,2,0,90,90,177,180,
        1,0,109,110,12,0,2,3,16,16,20,20,22,22,34,35,38,38,42,43,51,51,53,
        54,57,172,175,189,243,243,5,0,1,32,34,48,50,172,175,189,243,243,
        2164,0,296,1,0,0,0,2,313,1,0,0,0,4,330,1,0,0,0,6,333,1,0,0,0,8,350,
        1,0,0,0,10,355,1,0,0,0,12,381,1,0,0,0,14,383,1,0,0,0,16,395,1,0,
        0,0,18,403,1,0,0,0,20,411,1,0,0,0,22,419,1,0,0,0,24,427,1,0,0,0,
        26,436,1,0,0,0,28,457,1,0,0,0,30,478,1,0,0,0,32,487,1,0,0,0,34,495,
        1,0,0,0,36,499,1,0,0,0,38,507,1,0,0,0,40,511,1,0,0,0,42,515,1,0,
        0,0,44,529,1,0,0,0,46,540,1,0,0,0,48,548,1,0,0,0,50,553,1,0,0,0,
        52,569,1,0,0,0,54,583,1,0,0,0,56,602,1,0,0,0,58,604,1,0,0,0,60,608,
        1,0,0,0,62,614,1,0,0,0,64,625,1,0,0,0,66,631,1,0,0,0,68,639,1,0,
        0,0,70,641,1,0,0,0,72,651,1,0,0,0,74,661,1,0,0,0,76,668,1,0,0,0,
        78,670,1,0,0,0,80,686,1,0,0,0,82,695,1,0,0,0,84,701,1,0,0,0,86,727,
        1,0,0,0,88,729,1,0,0,0,90,736,1,0,0,0,92,747,1,0,0,0,94,763,1,0,
        0,0,96,777,1,0,0,0,98,779,1,0,0,0,100,787,1,0,0,0,102,793,1,0,0,
        0,104,799,1,0,0,0,106,812,1,0,0,0,108,818,1,0,0,0,110,822,1,0,0,
        0,112,825,1,0,0,0,114,828,1,0,0,0,116,831,1,0,0,0,118,838,1,0,0,
        0,120,845,1,0,0,0,122,852,1,0,0,0,124,859,1,0,0,0,126,869,1,0,0,
        0,128,877,1,0,0,0,130,885,1,0,0,0,132,891,1,0,0,0,134,898,1,0,0,
        0,136,903,1,0,0,0,138,908,1,0,0,0,140,921,1,0,0,0,142,936,1,0,0,
        0,144,940,1,0,0,0,146,942,1,0,0,0,148,947,1,0,0,0,150,949,1,0,0,
        0,152,953,1,0,0,0,154,979,1,0,0,0,156,1065,1,0,0,0,158,1086,1,0,
        0,0,160,1088,1,0,0,0,162,1095,1,0,0,0,164,1103,1,0,0,0,166,1111,
        1,0,0,0,168,1118,1,0,0,0,170,1121,1,0,0,0,172,1132,1,0,0,0,174,1134,
        1,0,0,0,176,1145,1,0,0,0,178,1149,1,0,0,0,180,1160,1,0,0,0,182,1166,
        1,0,0,0,184,1170,1,0,0,0,186,1203,1,0,0,0,188,1221,1,0,0,0,190,1244,
        1,0,0,0,192,1246,1,0,0,0,194,1254,1,0,0,0,196,1268,1,0,0,0,198,1285,
        1,0,0,0,200,1287,1,0,0,0,202,1411,1,0,0,0,204,1419,1,0,0,0,206,1430,
        1,0,0,0,208,1434,1,0,0,0,210,1436,1,0,0,0,212,1448,1,0,0,0,214,1453,
        1,0,0,0,216,1456,1,0,0,0,218,1464,1,0,0,0,220,1468,1,0,0,0,222,1489,
        1,0,0,0,224,1496,1,0,0,0,226,1506,1,0,0,0,228,1523,1,0,0,0,230,1545,
        1,0,0,0,232,1547,1,0,0,0,234,1559,1,0,0,0,236,1575,1,0,0,0,238,1577,
        1,0,0,0,240,1585,1,0,0,0,242,1601,1,0,0,0,244,1603,1,0,0,0,246,1640,
        1,0,0,0,248,1642,1,0,0,0,250,1646,1,0,0,0,252,1670,1,0,0,0,254,1676,
        1,0,0,0,256,1682,1,0,0,0,258,1684,1,0,0,0,260,1691,1,0,0,0,262,1694,
        1,0,0,0,264,1783,1,0,0,0,266,1786,1,0,0,0,268,1790,1,0,0,0,270,1802,
        1,0,0,0,272,1804,1,0,0,0,274,1810,1,0,0,0,276,1873,1,0,0,0,278,1876,
        1,0,0,0,280,1884,1,0,0,0,282,1912,1,0,0,0,284,1920,1,0,0,0,286,1925,
        1,0,0,0,288,1927,1,0,0,0,290,1932,1,0,0,0,292,1940,1,0,0,0,294,1942,
        1,0,0,0,296,297,5,43,0,0,297,298,3,292,146,0,298,299,5,27,0,0,299,
        300,3,292,146,0,300,301,5,198,0,0,301,306,3,4,2,0,302,303,5,205,
        0,0,303,305,3,4,2,0,304,302,1,0,0,0,305,308,1,0,0,0,306,304,1,0,
        0,0,306,307,1,0,0,0,307,309,1,0,0,0,308,306,1,0,0,0,309,310,5,199,
        0,0,310,311,3,80,40,0,311,312,5,0,0,1,312,1,1,0,0,0,313,314,5,43,
        0,0,314,315,3,292,146,0,315,316,5,27,0,0,316,317,3,292,146,0,317,
        318,5,198,0,0,318,323,3,4,2,0,319,320,5,205,0,0,320,322,3,4,2,0,
        321,319,1,0,0,0,322,325,1,0,0,0,323,321,1,0,0,0,323,324,1,0,0,0,
        324,326,1,0,0,0,325,323,1,0,0,0,326,327,5,199,0,0,327,328,3,6,3,
        0,328,329,5,0,0,1,329,3,1,0,0,0,330,331,7,0,0,0,331,332,7,1,0,0,
        332,5,1,0,0,0,333,337,5,200,0,0,334,336,3,8,4,0,335,334,1,0,0,0,
        336,339,1,0,0,0,337,335,1,0,0,0,337,338,1,0,0,0,338,340,1,0,0,0,
        339,337,1,0,0,0,340,341,5,201,0,0,341,7,1,0,0,0,342,344,3,30,15,
        0,343,342,1,0,0,0,344,347,1,0,0,0,345,343,1,0,0,0,345,346,1,0,0,
        0,346,348,1,0,0,0,347,345,1,0,0,0,348,351,3,34,17,0,349,351,3,86,
        43,0,350,345,1,0,0,0,350,349,1,0,0,0,351,9,1,0,0,0,352,354,3,12,
        6,0,353,352,1,0,0,0,354,357,1,0,0,0,355,353,1,0,0,0,355,356,1,0,
        0,0,356,358,1,0,0,0,357,355,1,0,0,0,358,359,5,0,0,1,359,11,1,0,0,
        0,360,362,3,30,15,0,361,360,1,0,0,0,362,365,1,0,0,0,363,361,1,0,
        0,0,363,364,1,0,0,0,364,366,1,0,0,0,365,363,1,0,0,0,366,382,3,14,
        7,0,367,369,3,30,15,0,368,367,1,0,0,0,369,372,1,0,0,0,370,368,1,
        0,0,0,370,371,1,0,0,0,371,373,1,0,0,0,372,370,1,0,0,0,373,382,3,
        16,8,0,374,376,3,30,15,0,375,374,1,0,0,0,376,379,1,0,0,0,377,375,
        1,0,0,0,377,378,1,0,0,0,378,380,1,0,0,0,379,377,1,0,0,0,380,382,
        3,20,10,0,381,363,1,0,0,0,381,370,1,0,0,0,381,377,1,0,0,0,382,13,
        1,0,0,0,383,384,5,6,0,0,384,387,3,292,146,0,385,386,5,12,0,0,386,
        388,3,52,26,0,387,385,1,0,0,0,387,388,1,0,0,0,388,391,1,0,0,0,389,
        390,5,19,0,0,390,392,3,22,11,0,391,389,1,0,0,0,391,392,1,0,0,0,392,
        393,1,0,0,0,393,394,3,24,12,0,394,15,1,0,0,0,395,396,5,11,0,0,396,
        397,3,292,146,0,397,399,5,200,0,0,398,400,3,18,9,0,399,398,1,0,0,
        0,399,400,1,0,0,0,400,401,1,0,0,0,401,402,5,201,0,0,402,17,1,0,0,
        0,403,408,3,292,146,0,404,405,5,205,0,0,405,407,3,292,146,0,406,
        404,1,0,0,0,407,410,1,0,0,0,408,406,1,0,0,0,408,409,1,0,0,0,409,
        19,1,0,0,0,410,408,1,0,0,0,411,412,5,23,0,0,412,415,3,292,146,0,
        413,414,5,12,0,0,414,416,3,22,11,0,415,413,1,0,0,0,415,416,1,0,0,
        0,416,417,1,0,0,0,417,418,3,26,13,0,418,21,1,0,0,0,419,424,3,52,
        26,0,420,421,5,205,0,0,421,423,3,52,26,0,422,420,1,0,0,0,423,426,
        1,0,0,0,424,422,1,0,0,0,424,425,1,0,0,0,425,23,1,0,0,0,426,424,1,
        0,0,0,427,431,5,200,0,0,428,430,3,28,14,0,429,428,1,0,0,0,430,433,
        1,0,0,0,431,429,1,0,0,0,431,432,1,0,0,0,432,434,1,0,0,0,433,431,
        1,0,0,0,434,435,5,201,0,0,435,25,1,0,0,0,436,440,5,200,0,0,437,439,
        3,44,22,0,438,437,1,0,0,0,439,442,1,0,0,0,440,438,1,0,0,0,440,441,
        1,0,0,0,441,443,1,0,0,0,442,440,1,0,0,0,443,444,5,201,0,0,444,27,
        1,0,0,0,445,458,5,204,0,0,446,448,5,36,0,0,447,446,1,0,0,0,447,448,
        1,0,0,0,448,449,1,0,0,0,449,458,3,80,40,0,450,452,3,30,15,0,451,
        450,1,0,0,0,452,455,1,0,0,0,453,451,1,0,0,0,453,454,1,0,0,0,454,
        456,1,0,0,0,455,453,1,0,0,0,456,458,3,32,16,0,457,445,1,0,0,0,457,
        447,1,0,0,0,457,453,1,0,0,0,458,29,1,0,0,0,459,479,3,70,35,0,460,
        479,5,17,0,0,461,479,5,31,0,0,462,479,5,30,0,0,463,479,5,29,0,0,
        464,479,5,42,0,0,465,479,5,36,0,0,466,479,5,1,0,0,467,479,5,13,0,
        0,468,479,5,50,0,0,469,479,5,28,0,0,470,479,5,48,0,0,471,479,5,39,
        0,0,472,473,5,53,0,0,473,479,5,35,0,0,474,475,5,54,0,0,475,479,5,
        35,0,0,476,477,5,20,0,0,477,479,5,35,0,0,478,459,1,0,0,0,478,460,
        1,0,0,0,478,461,1,0,0,0,478,462,1,0,0,0,478,463,1,0,0,0,478,464,
        1,0,0,0,478,465,1,0,0,0,478,466,1,0,0,0,478,467,1,0,0,0,478,468,
        1,0,0,0,478,469,1,0,0,0,478,470,1,0,0,0,478,471,1,0,0,0,478,472,
        1,0,0,0,478,474,1,0,0,0,478,476,1,0,0,0,479,31,1,0,0,0,480,488,3,
        36,18,0,481,488,3,40,20,0,482,488,3,38,19,0,483,488,3,20,10,0,484,
        488,3,14,7,0,485,488,3,16,8,0,486,488,3,42,21,0,487,480,1,0,0,0,
        487,481,1,0,0,0,487,482,1,0,0,0,487,483,1,0,0,0,487,484,1,0,0,0,
        487,485,1,0,0,0,487,486,1,0,0,0,488,33,1,0,0,0,489,496,3,36,18,0,
        490,496,3,40,20,0,491,496,3,20,10,0,492,496,3,14,7,0,493,496,3,16,
        8,0,494,496,3,42,21,0,495,489,1,0,0,0,495,490,1,0,0,0,495,491,1,
        0,0,0,495,492,1,0,0,0,495,493,1,0,0,0,495,494,1,0,0,0,496,35,1,0,
        0,0,497,500,3,52,26,0,498,500,5,49,0,0,499,497,1,0,0,0,499,498,1,
        0,0,0,500,501,1,0,0,0,501,502,3,292,146,0,502,505,3,60,30,0,503,
        506,3,80,40,0,504,506,5,204,0,0,505,503,1,0,0,0,505,504,1,0,0,0,
        506,37,1,0,0,0,507,508,3,66,33,0,508,509,3,60,30,0,509,510,3,80,
        40,0,510,39,1,0,0,0,511,512,3,52,26,0,512,513,3,46,23,0,513,514,
        5,204,0,0,514,41,1,0,0,0,515,516,3,52,26,0,516,517,3,292,146,0,517,
        521,5,200,0,0,518,520,3,132,66,0,519,518,1,0,0,0,520,523,1,0,0,0,
        521,519,1,0,0,0,521,522,1,0,0,0,522,524,1,0,0,0,523,521,1,0,0,0,
        524,525,5,201,0,0,525,43,1,0,0,0,526,528,3,30,15,0,527,526,1,0,0,
        0,528,531,1,0,0,0,529,527,1,0,0,0,529,530,1,0,0,0,530,534,1,0,0,
        0,531,529,1,0,0,0,532,535,3,52,26,0,533,535,5,49,0,0,534,532,1,0,
        0,0,534,533,1,0,0,0,535,536,1,0,0,0,536,537,3,292,146,0,537,538,
        3,60,30,0,538,539,5,204,0,0,539,45,1,0,0,0,540,545,3,48,24,0,541,
        542,5,205,0,0,542,544,3,48,24,0,543,541,1,0,0,0,544,547,1,0,0,0,
        545,543,1,0,0,0,545,546,1,0,0,0,546,47,1,0,0,0,547,545,1,0,0,0,548,
        551,3,292,146,0,549,550,5,207,0,0,550,552,3,154,77,0,551,549,1,0,
        0,0,551,552,1,0,0,0,552,49,1,0,0,0,553,565,5,200,0,0,554,559,3,154,
        77,0,555,556,5,205,0,0,556,558,3,154,77,0,557,555,1,0,0,0,558,561,
        1,0,0,0,559,557,1,0,0,0,559,560,1,0,0,0,560,563,1,0,0,0,561,559,
        1,0,0,0,562,564,5,205,0,0,563,562,1,0,0,0,563,564,1,0,0,0,564,566,
        1,0,0,0,565,554,1,0,0,0,565,566,1,0,0,0,566,567,1,0,0,0,567,568,
        5,201,0,0,568,51,1,0,0,0,569,574,3,56,28,0,570,571,5,206,0,0,571,
        573,3,56,28,0,572,570,1,0,0,0,573,576,1,0,0,0,574,572,1,0,0,0,574,
        575,1,0,0,0,575,577,1,0,0,0,576,574,1,0,0,0,577,578,3,54,27,0,578,
        53,1,0,0,0,579,580,5,202,0,0,580,582,5,203,0,0,581,579,1,0,0,0,582,
        585,1,0,0,0,583,581,1,0,0,0,583,584,1,0,0,0,584,55,1,0,0,0,585,583,
        1,0,0,0,586,588,5,55,0,0,587,589,3,58,29,0,588,587,1,0,0,0,588,589,
        1,0,0,0,589,603,1,0,0,0,590,592,5,34,0,0,591,593,3,58,29,0,592,591,
        1,0,0,0,592,593,1,0,0,0,593,603,1,0,0,0,594,596,5,56,0,0,595,597,
        3,58,29,0,596,595,1,0,0,0,596,597,1,0,0,0,597,603,1,0,0,0,598,600,
        3,292,146,0,599,601,3,58,29,0,600,599,1,0,0,0,600,601,1,0,0,0,601,
        603,1,0,0,0,602,586,1,0,0,0,602,590,1,0,0,0,602,594,1,0,0,0,602,
        598,1,0,0,0,603,57,1,0,0,0,604,605,5,209,0,0,605,606,3,22,11,0,606,
        607,5,208,0,0,607,59,1,0,0,0,608,610,5,198,0,0,609,611,3,62,31,0,
        610,609,1,0,0,0,610,611,1,0,0,0,611,612,1,0,0,0,612,613,5,199,0,
        0,613,61,1,0,0,0,614,619,3,64,32,0,615,616,5,205,0,0,616,618,3,64,
        32,0,617,615,1,0,0,0,618,621,1,0,0,0,619,617,1,0,0,0,619,620,1,0,
        0,0,620,63,1,0,0,0,621,619,1,0,0,0,622,624,3,30,15,0,623,622,1,0,
        0,0,624,627,1,0,0,0,625,623,1,0,0,0,625,626,1,0,0,0,626,628,1,0,
        0,0,627,625,1,0,0,0,628,629,3,52,26,0,629,630,3,292,146,0,630,65,
        1,0,0,0,631,636,3,292,146,0,632,633,5,206,0,0,633,635,3,292,146,
        0,634,632,1,0,0,0,635,638,1,0,0,0,636,634,1,0,0,0,636,637,1,0,0,
        0,637,67,1,0,0,0,638,636,1,0,0,0,639,640,7,2,0,0,640,69,1,0,0,0,
        641,642,5,242,0,0,642,649,3,66,33,0,643,646,5,198,0,0,644,647,3,
        72,36,0,645,647,3,76,38,0,646,644,1,0,0,0,646,645,1,0,0,0,646,647,
        1,0,0,0,647,648,1,0,0,0,648,650,5,199,0,0,649,643,1,0,0,0,649,650,
        1,0,0,0,650,71,1,0,0,0,651,658,3,74,37,0,652,654,5,205,0,0,653,652,
        1,0,0,0,653,654,1,0,0,0,654,655,1,0,0,0,655,657,3,74,37,0,656,653,
        1,0,0,0,657,660,1,0,0,0,658,656,1,0,0,0,658,659,1,0,0,0,659,73,1,
        0,0,0,660,658,1,0,0,0,661,662,3,292,146,0,662,663,5,207,0,0,663,
        664,3,76,38,0,664,75,1,0,0,0,665,669,3,154,77,0,666,669,3,70,35,
        0,667,669,3,78,39,0,668,665,1,0,0,0,668,666,1,0,0,0,668,667,1,0,
        0,0,669,77,1,0,0,0,670,679,5,200,0,0,671,676,3,76,38,0,672,673,5,
        205,0,0,673,675,3,76,38,0,674,672,1,0,0,0,675,678,1,0,0,0,676,674,
        1,0,0,0,676,677,1,0,0,0,677,680,1,0,0,0,678,676,1,0,0,0,679,671,
        1,0,0,0,679,680,1,0,0,0,680,682,1,0,0,0,681,683,5,205,0,0,682,681,
        1,0,0,0,682,683,1,0,0,0,683,684,1,0,0,0,684,685,5,201,0,0,685,79,
        1,0,0,0,686,690,5,200,0,0,687,689,3,86,43,0,688,687,1,0,0,0,689,
        692,1,0,0,0,690,688,1,0,0,0,690,691,1,0,0,0,691,693,1,0,0,0,692,
        690,1,0,0,0,693,694,5,201,0,0,694,81,1,0,0,0,695,696,3,84,42,0,696,
        697,5,204,0,0,697,83,1,0,0,0,698,700,3,30,15,0,699,698,1,0,0,0,700,
        703,1,0,0,0,701,699,1,0,0,0,701,702,1,0,0,0,702,704,1,0,0,0,703,
        701,1,0,0,0,704,705,3,52,26,0,705,706,3,46,23,0,706,85,1,0,0,0,707,
        728,3,80,40,0,708,728,3,88,44,0,709,728,3,90,45,0,710,728,3,98,49,
        0,711,728,3,100,50,0,712,728,3,102,51,0,713,728,3,104,52,0,714,728,
        3,106,53,0,715,728,3,108,54,0,716,728,3,110,55,0,717,728,3,112,56,
        0,718,728,3,116,58,0,719,728,3,118,59,0,720,728,3,120,60,0,721,728,
        3,122,61,0,722,728,3,124,62,0,723,728,3,126,63,0,724,728,3,128,64,
        0,725,728,3,82,41,0,726,728,3,130,65,0,727,707,1,0,0,0,727,708,1,
        0,0,0,727,709,1,0,0,0,727,710,1,0,0,0,727,711,1,0,0,0,727,712,1,
        0,0,0,727,713,1,0,0,0,727,714,1,0,0,0,727,715,1,0,0,0,727,716,1,
        0,0,0,727,717,1,0,0,0,727,718,1,0,0,0,727,719,1,0,0,0,727,720,1,
        0,0,0,727,721,1,0,0,0,727,722,1,0,0,0,727,723,1,0,0,0,727,724,1,
        0,0,0,727,725,1,0,0,0,727,726,1,0,0,0,728,87,1,0,0,0,729,730,5,18,
        0,0,730,731,3,150,75,0,731,734,3,86,43,0,732,733,5,10,0,0,733,735,
        3,86,43,0,734,732,1,0,0,0,734,735,1,0,0,0,735,89,1,0,0,0,736,737,
        5,38,0,0,737,738,5,27,0,0,738,739,3,154,77,0,739,741,5,200,0,0,740,
        742,3,92,46,0,741,740,1,0,0,0,742,743,1,0,0,0,743,741,1,0,0,0,743,
        744,1,0,0,0,744,745,1,0,0,0,745,746,5,201,0,0,746,91,1,0,0,0,747,
        748,5,51,0,0,748,749,3,94,47,0,749,750,3,80,40,0,750,93,1,0,0,0,
        751,764,5,10,0,0,752,757,3,96,48,0,753,754,5,205,0,0,754,756,3,96,
        48,0,755,753,1,0,0,0,756,759,1,0,0,0,757,755,1,0,0,0,757,758,1,0,
        0,0,758,764,1,0,0,0,759,757,1,0,0,0,760,761,3,292,146,0,761,762,
        3,292,146,0,762,764,1,0,0,0,763,751,1,0,0,0,763,752,1,0,0,0,763,
        760,1,0,0,0,764,95,1,0,0,0,765,767,5,225,0,0,766,765,1,0,0,0,766,
        767,1,0,0,0,767,768,1,0,0,0,768,778,5,192,0,0,769,778,5,193,0,0,
        770,778,5,196,0,0,771,778,5,26,0,0,772,778,3,292,146,0,773,774,5,
        198,0,0,774,775,3,96,48,0,775,776,5,199,0,0,776,778,1,0,0,0,777,
        766,1,0,0,0,777,769,1,0,0,0,777,770,1,0,0,0,777,771,1,0,0,0,777,
        772,1,0,0,0,777,773,1,0,0,0,778,97,1,0,0,0,779,780,5,15,0,0,780,
        781,5,198,0,0,781,782,3,142,71,0,782,785,5,199,0,0,783,786,3,86,
        43,0,784,786,5,204,0,0,785,783,1,0,0,0,785,784,1,0,0,0,786,99,1,
        0,0,0,787,788,5,52,0,0,788,791,3,150,75,0,789,792,3,86,43,0,790,
        792,5,204,0,0,791,789,1,0,0,0,791,790,1,0,0,0,792,101,1,0,0,0,793,
        794,5,9,0,0,794,795,3,86,43,0,795,796,5,52,0,0,796,797,3,150,75,
        0,797,798,5,204,0,0,798,103,1,0,0,0,799,800,5,44,0,0,800,810,3,80,
        40,0,801,803,3,138,69,0,802,801,1,0,0,0,803,804,1,0,0,0,804,802,
        1,0,0,0,804,805,1,0,0,0,805,807,1,0,0,0,806,808,3,140,70,0,807,806,
        1,0,0,0,807,808,1,0,0,0,808,811,1,0,0,0,809,811,3,140,70,0,810,802,
        1,0,0,0,810,809,1,0,0,0,811,105,1,0,0,0,812,814,5,32,0,0,813,815,
        3,154,77,0,814,813,1,0,0,0,814,815,1,0,0,0,815,816,1,0,0,0,816,817,
        5,204,0,0,817,107,1,0,0,0,818,819,5,41,0,0,819,820,3,154,77,0,820,
        821,5,204,0,0,821,109,1,0,0,0,822,823,5,4,0,0,823,824,5,204,0,0,
        824,111,1,0,0,0,825,826,5,7,0,0,826,827,5,204,0,0,827,113,1,0,0,
        0,828,829,5,62,0,0,829,830,7,3,0,0,830,115,1,0,0,0,831,833,5,21,
        0,0,832,834,3,114,57,0,833,832,1,0,0,0,833,834,1,0,0,0,834,835,1,
        0,0,0,835,836,3,154,77,0,836,837,5,204,0,0,837,117,1,0,0,0,838,840,
        5,46,0,0,839,841,3,114,57,0,840,839,1,0,0,0,840,841,1,0,0,0,841,
        842,1,0,0,0,842,843,3,154,77,0,843,844,5,204,0,0,844,119,1,0,0,0,
        845,847,5,8,0,0,846,848,3,114,57,0,847,846,1,0,0,0,847,848,1,0,0,
        0,848,849,1,0,0,0,849,850,3,154,77,0,850,851,5,204,0,0,851,121,1,
        0,0,0,852,854,5,45,0,0,853,855,3,114,57,0,854,853,1,0,0,0,854,855,
        1,0,0,0,855,856,1,0,0,0,856,857,3,154,77,0,857,858,5,204,0,0,858,
        123,1,0,0,0,859,861,5,47,0,0,860,862,3,114,57,0,861,860,1,0,0,0,
        861,862,1,0,0,0,862,863,1,0,0,0,863,865,3,154,77,0,864,866,3,66,
        33,0,865,864,1,0,0,0,865,866,1,0,0,0,866,867,1,0,0,0,867,868,5,204,
        0,0,868,125,1,0,0,0,869,871,5,24,0,0,870,872,3,114,57,0,871,870,
        1,0,0,0,871,872,1,0,0,0,872,873,1,0,0,0,873,874,3,154,77,0,874,875,
        3,154,77,0,875,876,5,204,0,0,876,127,1,0,0,0,877,878,5,33,0,0,878,
        880,5,198,0,0,879,881,3,152,76,0,880,879,1,0,0,0,880,881,1,0,0,0,
        881,882,1,0,0,0,882,883,5,199,0,0,883,884,3,80,40,0,884,129,1,0,
        0,0,885,886,3,154,77,0,886,887,5,204,0,0,887,131,1,0,0,0,888,890,
        3,30,15,0,889,888,1,0,0,0,890,893,1,0,0,0,891,889,1,0,0,0,891,892,
        1,0,0,0,892,896,1,0,0,0,893,891,1,0,0,0,894,897,3,134,67,0,895,897,
        3,136,68,0,896,894,1,0,0,0,896,895,1,0,0,0,897,133,1,0,0,0,898,901,
        5,16,0,0,899,902,5,204,0,0,900,902,3,80,40,0,901,899,1,0,0,0,901,
        900,1,0,0,0,902,135,1,0,0,0,903,906,5,34,0,0,904,907,5,204,0,0,905,
        907,3,80,40,0,906,904,1,0,0,0,906,905,1,0,0,0,907,137,1,0,0,0,908,
        909,5,5,0,0,909,913,5,198,0,0,910,912,3,30,15,0,911,910,1,0,0,0,
        912,915,1,0,0,0,913,911,1,0,0,0,913,914,1,0,0,0,914,916,1,0,0,0,
        915,913,1,0,0,0,916,917,3,66,33,0,917,918,3,292,146,0,918,919,5,
        199,0,0,919,920,3,80,40,0,920,139,1,0,0,0,921,922,5,14,0,0,922,923,
        3,80,40,0,923,141,1,0,0,0,924,937,3,146,73,0,925,927,3,144,72,0,
        926,925,1,0,0,0,926,927,1,0,0,0,927,928,1,0,0,0,928,930,5,204,0,
        0,929,931,3,154,77,0,930,929,1,0,0,0,930,931,1,0,0,0,931,932,1,0,
        0,0,932,934,5,204,0,0,933,935,3,148,74,0,934,933,1,0,0,0,934,935,
        1,0,0,0,935,937,1,0,0,0,936,924,1,0,0,0,936,926,1,0,0,0,937,143,
        1,0,0,0,938,941,3,84,42,0,939,941,3,152,76,0,940,938,1,0,0,0,940,
        939,1,0,0,0,941,145,1,0,0,0,942,943,3,52,26,0,943,944,3,292,146,
        0,944,945,5,214,0,0,945,946,3,154,77,0,946,147,1,0,0,0,947,948,3,
        152,76,0,948,149,1,0,0,0,949,950,5,198,0,0,950,951,3,154,77,0,951,
        952,5,199,0,0,952,151,1,0,0,0,953,958,3,154,77,0,954,955,5,205,0,
        0,955,957,3,154,77,0,956,954,1,0,0,0,957,960,1,0,0,0,958,956,1,0,
        0,0,958,959,1,0,0,0,959,153,1,0,0,0,960,958,1,0,0,0,961,962,6,77,
        -1,0,962,980,3,156,78,0,963,980,3,158,79,0,964,965,5,25,0,0,965,
        980,3,162,81,0,966,967,5,198,0,0,967,968,3,52,26,0,968,969,5,199,
        0,0,969,970,3,154,77,18,970,980,1,0,0,0,971,972,5,198,0,0,972,973,
        3,154,77,0,973,974,5,199,0,0,974,980,1,0,0,0,975,976,7,4,0,0,976,
        980,3,154,77,15,977,978,7,5,0,0,978,980,3,154,77,14,979,961,1,0,
        0,0,979,963,1,0,0,0,979,964,1,0,0,0,979,966,1,0,0,0,979,971,1,0,
        0,0,979,975,1,0,0,0,979,977,1,0,0,0,980,1049,1,0,0,0,981,982,10,
        13,0,0,982,983,7,6,0,0,983,1048,3,154,77,14,984,985,10,12,0,0,985,
        986,7,7,0,0,986,1048,3,154,77,13,987,995,10,11,0,0,988,989,5,209,
        0,0,989,996,5,209,0,0,990,991,5,208,0,0,991,992,5,208,0,0,992,996,
        5,208,0,0,993,994,5,208,0,0,994,996,5,208,0,0,995,988,1,0,0,0,995,
        990,1,0,0,0,995,993,1,0,0,0,996,997,1,0,0,0,997,1048,3,154,77,12,
        998,999,10,10,0,0,999,1001,7,8,0,0,1000,1002,5,207,0,0,1001,1000,
        1,0,0,0,1001,1002,1,0,0,0,1002,1003,1,0,0,0,1003,1048,3,154,77,11,
        1004,1005,10,8,0,0,1005,1006,7,9,0,0,1006,1048,3,154,77,9,1007,1008,
        10,7,0,0,1008,1009,5,228,0,0,1009,1048,3,154,77,8,1010,1011,10,6,
        0,0,1011,1012,5,230,0,0,1012,1048,3,154,77,7,1013,1014,10,5,0,0,
        1014,1015,5,229,0,0,1015,1048,3,154,77,6,1016,1017,10,4,0,0,1017,
        1018,5,220,0,0,1018,1048,3,154,77,5,1019,1020,10,3,0,0,1020,1021,
        5,221,0,0,1021,1048,3,154,77,4,1022,1023,10,2,0,0,1023,1024,5,213,
        0,0,1024,1025,3,154,77,0,1025,1026,5,214,0,0,1026,1027,3,154,77,
        2,1027,1048,1,0,0,0,1028,1029,10,1,0,0,1029,1030,7,10,0,0,1030,1048,
        3,154,77,1,1031,1032,10,22,0,0,1032,1035,7,11,0,0,1033,1036,3,160,
        80,0,1034,1036,3,294,147,0,1035,1033,1,0,0,0,1035,1034,1,0,0,0,1036,
        1048,1,0,0,0,1037,1038,10,21,0,0,1038,1039,5,202,0,0,1039,1040,3,
        154,77,0,1040,1041,5,203,0,0,1041,1048,1,0,0,0,1042,1043,10,16,0,
        0,1043,1048,7,12,0,0,1044,1045,10,9,0,0,1045,1046,5,22,0,0,1046,
        1048,3,52,26,0,1047,981,1,0,0,0,1047,984,1,0,0,0,1047,987,1,0,0,
        0,1047,998,1,0,0,0,1047,1004,1,0,0,0,1047,1007,1,0,0,0,1047,1010,
        1,0,0,0,1047,1013,1,0,0,0,1047,1016,1,0,0,0,1047,1019,1,0,0,0,1047,
        1022,1,0,0,0,1047,1028,1,0,0,0,1047,1031,1,0,0,0,1047,1037,1,0,0,
        0,1047,1042,1,0,0,0,1047,1044,1,0,0,0,1048,1051,1,0,0,0,1049,1047,
        1,0,0,0,1049,1050,1,0,0,0,1050,155,1,0,0,0,1051,1049,1,0,0,0,1052,
        1066,5,40,0,0,1053,1066,5,37,0,0,1054,1066,3,68,34,0,1055,1056,3,
        52,26,0,1056,1057,5,206,0,0,1057,1058,5,6,0,0,1058,1066,1,0,0,0,
        1059,1060,5,49,0,0,1060,1061,5,206,0,0,1061,1066,5,6,0,0,1062,1066,
        3,292,146,0,1063,1066,3,182,91,0,1064,1066,3,270,135,0,1065,1052,
        1,0,0,0,1065,1053,1,0,0,0,1065,1054,1,0,0,0,1065,1055,1,0,0,0,1065,
        1059,1,0,0,0,1065,1062,1,0,0,0,1065,1063,1,0,0,0,1065,1064,1,0,0,
        0,1066,157,1,0,0,0,1067,1068,3,292,146,0,1068,1070,5,198,0,0,1069,
        1071,3,152,76,0,1070,1069,1,0,0,0,1070,1071,1,0,0,0,1071,1072,1,
        0,0,0,1072,1073,5,199,0,0,1073,1087,1,0,0,0,1074,1075,5,40,0,0,1075,
        1077,5,198,0,0,1076,1078,3,152,76,0,1077,1076,1,0,0,0,1077,1078,
        1,0,0,0,1078,1079,1,0,0,0,1079,1087,5,199,0,0,1080,1081,5,37,0,0,
        1081,1083,5,198,0,0,1082,1084,3,152,76,0,1083,1082,1,0,0,0,1083,
        1084,1,0,0,0,1084,1085,1,0,0,0,1085,1087,5,199,0,0,1086,1067,1,0,
        0,0,1086,1074,1,0,0,0,1086,1080,1,0,0,0,1087,159,1,0,0,0,1088,1089,
        3,294,147,0,1089,1091,5,198,0,0,1090,1092,3,152,76,0,1091,1090,1,
        0,0,0,1091,1092,1,0,0,0,1092,1093,1,0,0,0,1093,1094,5,199,0,0,1094,
        161,1,0,0,0,1095,1101,3,164,82,0,1096,1102,3,168,84,0,1097,1102,
        3,170,85,0,1098,1102,3,172,86,0,1099,1102,3,174,87,0,1100,1102,3,
        178,89,0,1101,1096,1,0,0,0,1101,1097,1,0,0,0,1101,1098,1,0,0,0,1101,
        1099,1,0,0,0,1101,1100,1,0,0,0,1102,163,1,0,0,0,1103,1108,3,166,
        83,0,1104,1105,5,206,0,0,1105,1107,3,166,83,0,1106,1104,1,0,0,0,
        1107,1110,1,0,0,0,1108,1106,1,0,0,0,1108,1109,1,0,0,0,1109,165,1,
        0,0,0,1110,1108,1,0,0,0,1111,1116,3,294,147,0,1112,1113,5,209,0,
        0,1113,1114,3,22,11,0,1114,1115,5,208,0,0,1115,1117,1,0,0,0,1116,
        1112,1,0,0,0,1116,1117,1,0,0,0,1117,167,1,0,0,0,1118,1119,5,200,
        0,0,1119,1120,5,201,0,0,1120,169,1,0,0,0,1121,1122,3,180,90,0,1122,
        171,1,0,0,0,1123,1124,5,202,0,0,1124,1125,3,154,77,0,1125,1126,5,
        203,0,0,1126,1133,1,0,0,0,1127,1128,5,202,0,0,1128,1130,5,203,0,
        0,1129,1131,3,50,25,0,1130,1129,1,0,0,0,1130,1131,1,0,0,0,1131,1133,
        1,0,0,0,1132,1123,1,0,0,0,1132,1127,1,0,0,0,1133,173,1,0,0,0,1134,
        1135,5,200,0,0,1135,1140,3,176,88,0,1136,1137,5,205,0,0,1137,1139,
        3,176,88,0,1138,1136,1,0,0,0,1139,1142,1,0,0,0,1140,1138,1,0,0,0,
        1140,1141,1,0,0,0,1141,1143,1,0,0,0,1142,1140,1,0,0,0,1143,1144,
        5,201,0,0,1144,175,1,0,0,0,1145,1146,3,154,77,0,1146,1147,5,231,
        0,0,1147,1148,3,154,77,0,1148,177,1,0,0,0,1149,1150,5,200,0,0,1150,
        1155,3,154,77,0,1151,1152,5,205,0,0,1152,1154,3,154,77,0,1153,1151,
        1,0,0,0,1154,1157,1,0,0,0,1155,1153,1,0,0,0,1155,1156,1,0,0,0,1156,
        1158,1,0,0,0,1157,1155,1,0,0,0,1158,1159,5,201,0,0,1159,179,1,0,
        0,0,1160,1162,5,198,0,0,1161,1163,3,152,76,0,1162,1161,1,0,0,0,1162,
        1163,1,0,0,0,1163,1164,1,0,0,0,1164,1165,5,199,0,0,1165,181,1,0,
        0,0,1166,1167,5,202,0,0,1167,1168,3,184,92,0,1168,1169,5,203,0,0,
        1169,183,1,0,0,0,1170,1171,5,59,0,0,1171,1172,3,188,94,0,1172,1173,
        5,61,0,0,1173,1175,3,194,97,0,1174,1176,3,218,109,0,1175,1174,1,
        0,0,0,1175,1176,1,0,0,0,1176,1178,1,0,0,0,1177,1179,3,220,110,0,
        1178,1177,1,0,0,0,1178,1179,1,0,0,0,1179,1181,1,0,0,0,1180,1182,
        3,236,118,0,1181,1180,1,0,0,0,1181,1182,1,0,0,0,1182,1184,1,0,0,
        0,1183,1185,3,246,123,0,1184,1183,1,0,0,0,1184,1185,1,0,0,0,1185,
        1187,1,0,0,0,1186,1188,3,248,124,0,1187,1186,1,0,0,0,1187,1188,1,
        0,0,0,1188,1190,1,0,0,0,1189,1191,3,254,127,0,1190,1189,1,0,0,0,
        1190,1191,1,0,0,0,1191,1193,1,0,0,0,1192,1194,3,256,128,0,1193,1192,
        1,0,0,0,1193,1194,1,0,0,0,1194,1196,1,0,0,0,1195,1197,3,258,129,
        0,1196,1195,1,0,0,0,1196,1197,1,0,0,0,1197,1198,1,0,0,0,1198,1201,
        3,260,130,0,1199,1200,5,46,0,0,1200,1202,3,284,142,0,1201,1199,1,
        0,0,0,1201,1202,1,0,0,0,1202,185,1,0,0,0,1203,1204,5,59,0,0,1204,
        1205,3,196,98,0,1205,1206,5,61,0,0,1206,1208,3,194,97,0,1207,1209,
        3,220,110,0,1208,1207,1,0,0,0,1208,1209,1,0,0,0,1209,1211,1,0,0,
        0,1210,1212,3,248,124,0,1211,1210,1,0,0,0,1211,1212,1,0,0,0,1212,
        1214,1,0,0,0,1213,1215,3,254,127,0,1214,1213,1,0,0,0,1214,1215,1,
        0,0,0,1215,1216,1,0,0,0,1216,1219,3,260,130,0,1217,1218,5,46,0,0,
        1218,1220,3,284,142,0,1219,1217,1,0,0,0,1219,1220,1,0,0,0,1220,187,
        1,0,0,0,1221,1226,3,190,95,0,1222,1223,5,205,0,0,1223,1225,3,190,
        95,0,1224,1222,1,0,0,0,1225,1228,1,0,0,0,1226,1224,1,0,0,0,1226,
        1227,1,0,0,0,1227,189,1,0,0,0,1228,1226,1,0,0,0,1229,1231,3,192,
        96,0,1230,1232,3,268,134,0,1231,1230,1,0,0,0,1231,1232,1,0,0,0,1232,
        1245,1,0,0,0,1233,1235,3,202,101,0,1234,1236,3,268,134,0,1235,1234,
        1,0,0,0,1235,1236,1,0,0,0,1236,1245,1,0,0,0,1237,1238,5,198,0,0,
        1238,1239,3,186,93,0,1239,1241,5,199,0,0,1240,1242,3,268,134,0,1241,
        1240,1,0,0,0,1241,1242,1,0,0,0,1242,1245,1,0,0,0,1243,1245,3,210,
        105,0,1244,1229,1,0,0,0,1244,1233,1,0,0,0,1244,1237,1,0,0,0,1244,
        1243,1,0,0,0,1245,191,1,0,0,0,1246,1251,3,268,134,0,1247,1248,5,
        206,0,0,1248,1250,3,268,134,0,1249,1247,1,0,0,0,1250,1253,1,0,0,
        0,1251,1249,1,0,0,0,1251,1252,1,0,0,0,1252,193,1,0,0,0,1253,1251,
        1,0,0,0,1254,1256,3,192,96,0,1255,1257,3,268,134,0,1256,1255,1,0,
        0,0,1256,1257,1,0,0,0,1257,1265,1,0,0,0,1258,1259,5,205,0,0,1259,
        1261,3,192,96,0,1260,1262,3,268,134,0,1261,1260,1,0,0,0,1261,1262,
        1,0,0,0,1262,1264,1,0,0,0,1263,1258,1,0,0,0,1264,1267,1,0,0,0,1265,
        1263,1,0,0,0,1265,1266,1,0,0,0,1266,195,1,0,0,0,1267,1265,1,0,0,
        0,1268,1273,3,198,99,0,1269,1270,5,205,0,0,1270,1272,3,198,99,0,
        1271,1269,1,0,0,0,1272,1275,1,0,0,0,1273,1271,1,0,0,0,1273,1274,
        1,0,0,0,1274,197,1,0,0,0,1275,1273,1,0,0,0,1276,1278,3,192,96,0,
        1277,1279,3,268,134,0,1278,1277,1,0,0,0,1278,1279,1,0,0,0,1279,1286,
        1,0,0,0,1280,1282,3,202,101,0,1281,1283,3,268,134,0,1282,1281,1,
        0,0,0,1282,1283,1,0,0,0,1283,1286,1,0,0,0,1284,1286,3,210,105,0,
        1285,1276,1,0,0,0,1285,1280,1,0,0,0,1285,1284,1,0,0,0,1286,199,1,
        0,0,0,1287,1288,7,13,0,0,1288,201,1,0,0,0,1289,1290,5,72,0,0,1290,
        1291,5,198,0,0,1291,1292,3,192,96,0,1292,1293,5,199,0,0,1293,1412,
        1,0,0,0,1294,1295,5,60,0,0,1295,1296,5,198,0,0,1296,1412,5,199,0,
        0,1297,1298,5,60,0,0,1298,1299,5,198,0,0,1299,1300,3,192,96,0,1300,
        1301,5,199,0,0,1301,1412,1,0,0,0,1302,1303,5,73,0,0,1303,1304,5,
        198,0,0,1304,1305,3,192,96,0,1305,1306,5,199,0,0,1306,1412,1,0,0,
        0,1307,1308,5,74,0,0,1308,1309,5,198,0,0,1309,1310,3,192,96,0,1310,
        1311,5,199,0,0,1311,1412,1,0,0,0,1312,1313,5,75,0,0,1313,1314,5,
        198,0,0,1314,1315,3,192,96,0,1315,1316,5,199,0,0,1316,1412,1,0,0,
        0,1317,1318,5,76,0,0,1318,1319,5,198,0,0,1319,1320,3,192,96,0,1320,
        1321,5,199,0,0,1321,1412,1,0,0,0,1322,1323,5,95,0,0,1323,1324,5,
        198,0,0,1324,1325,3,192,96,0,1325,1326,5,199,0,0,1326,1412,1,0,0,
        0,1327,1328,5,108,0,0,1328,1329,5,198,0,0,1329,1330,3,192,96,0,1330,
        1331,5,199,0,0,1331,1412,1,0,0,0,1332,1333,5,115,0,0,1333,1334,5,
        198,0,0,1334,1335,3,204,102,0,1335,1336,5,199,0,0,1336,1412,1,0,
        0,0,1337,1338,5,116,0,0,1338,1339,5,198,0,0,1339,1340,3,204,102,
        0,1340,1341,5,199,0,0,1341,1412,1,0,0,0,1342,1343,5,117,0,0,1343,
        1344,5,198,0,0,1344,1345,3,204,102,0,1345,1346,5,199,0,0,1346,1412,
        1,0,0,0,1347,1348,5,118,0,0,1348,1349,5,198,0,0,1349,1350,3,204,
        102,0,1350,1351,5,199,0,0,1351,1412,1,0,0,0,1352,1353,5,119,0,0,
        1353,1354,5,198,0,0,1354,1355,3,204,102,0,1355,1356,5,199,0,0,1356,
        1412,1,0,0,0,1357,1358,5,120,0,0,1358,1359,5,198,0,0,1359,1360,3,
        204,102,0,1360,1361,5,199,0,0,1361,1412,1,0,0,0,1362,1363,5,121,
        0,0,1363,1364,5,198,0,0,1364,1365,3,204,102,0,1365,1366,5,199,0,
        0,1366,1412,1,0,0,0,1367,1368,5,122,0,0,1368,1369,5,198,0,0,1369,
        1370,3,204,102,0,1370,1371,5,199,0,0,1371,1412,1,0,0,0,1372,1373,
        5,123,0,0,1373,1374,5,198,0,0,1374,1375,3,204,102,0,1375,1376,5,
        199,0,0,1376,1412,1,0,0,0,1377,1378,5,124,0,0,1378,1379,5,198,0,
        0,1379,1380,3,204,102,0,1380,1381,5,199,0,0,1381,1412,1,0,0,0,1382,
        1383,5,125,0,0,1383,1384,5,198,0,0,1384,1385,3,204,102,0,1385,1386,
        5,199,0,0,1386,1412,1,0,0,0,1387,1388,5,126,0,0,1388,1389,5,198,
        0,0,1389,1390,3,204,102,0,1390,1391,5,199,0,0,1391,1412,1,0,0,0,
        1392,1393,5,127,0,0,1393,1394,5,198,0,0,1394,1395,3,204,102,0,1395,
        1396,5,199,0,0,1396,1412,1,0,0,0,1397,1398,5,181,0,0,1398,1399,5,
        198,0,0,1399,1400,3,200,100,0,1400,1401,5,199,0,0,1401,1412,1,0,
        0,0,1402,1403,5,113,0,0,1403,1404,5,198,0,0,1404,1405,3,206,103,
        0,1405,1406,5,205,0,0,1406,1407,3,206,103,0,1407,1408,5,205,0,0,
        1408,1409,5,196,0,0,1409,1410,5,199,0,0,1410,1412,1,0,0,0,1411,1289,
        1,0,0,0,1411,1294,1,0,0,0,1411,1297,1,0,0,0,1411,1302,1,0,0,0,1411,
        1307,1,0,0,0,1411,1312,1,0,0,0,1411,1317,1,0,0,0,1411,1322,1,0,0,
        0,1411,1327,1,0,0,0,1411,1332,1,0,0,0,1411,1337,1,0,0,0,1411,1342,
        1,0,0,0,1411,1347,1,0,0,0,1411,1352,1,0,0,0,1411,1357,1,0,0,0,1411,
        1362,1,0,0,0,1411,1367,1,0,0,0,1411,1372,1,0,0,0,1411,1377,1,0,0,
        0,1411,1382,1,0,0,0,1411,1387,1,0,0,0,1411,1392,1,0,0,0,1411,1397,
        1,0,0,0,1411,1402,1,0,0,0,1412,203,1,0,0,0,1413,1414,5,128,0,0,1414,
        1415,5,198,0,0,1415,1416,3,192,96,0,1416,1417,5,199,0,0,1417,1420,
        1,0,0,0,1418,1420,3,192,96,0,1419,1413,1,0,0,0,1419,1418,1,0,0,0,
        1420,205,1,0,0,0,1421,1431,3,192,96,0,1422,1431,3,262,131,0,1423,
        1424,5,114,0,0,1424,1425,5,198,0,0,1425,1426,3,208,104,0,1426,1427,
        5,205,0,0,1427,1428,3,208,104,0,1428,1429,5,199,0,0,1429,1431,1,
        0,0,0,1430,1421,1,0,0,0,1430,1422,1,0,0,0,1430,1423,1,0,0,0,1431,
        207,1,0,0,0,1432,1435,3,234,117,0,1433,1435,3,262,131,0,1434,1432,
        1,0,0,0,1434,1433,1,0,0,0,1435,209,1,0,0,0,1436,1437,5,77,0,0,1437,
        1439,3,192,96,0,1438,1440,3,212,106,0,1439,1438,1,0,0,0,1440,1441,
        1,0,0,0,1441,1439,1,0,0,0,1441,1442,1,0,0,0,1442,1444,1,0,0,0,1443,
        1445,3,214,107,0,1444,1443,1,0,0,0,1444,1445,1,0,0,0,1445,1446,1,
        0,0,0,1446,1447,5,78,0,0,1447,211,1,0,0,0,1448,1449,5,51,0,0,1449,
        1450,3,192,96,0,1450,1451,5,79,0,0,1451,1452,3,216,108,0,1452,213,
        1,0,0,0,1453,1454,5,10,0,0,1454,1455,3,216,108,0,1455,215,1,0,0,
        0,1456,1461,3,192,96,0,1457,1458,5,205,0,0,1458,1460,3,192,96,0,
        1459,1457,1,0,0,0,1460,1463,1,0,0,0,1461,1459,1,0,0,0,1461,1462,
        1,0,0,0,1462,217,1,0,0,0,1463,1461,1,0,0,0,1464,1465,5,63,0,0,1465,
        1466,5,64,0,0,1466,1467,3,268,134,0,1467,219,1,0,0,0,1468,1469,5,
        65,0,0,1469,1470,3,222,111,0,1470,221,1,0,0,0,1471,1476,3,224,112,
        0,1472,1473,5,69,0,0,1473,1475,3,224,112,0,1474,1472,1,0,0,0,1475,
        1478,1,0,0,0,1476,1474,1,0,0,0,1476,1477,1,0,0,0,1477,1490,1,0,0,
        0,1478,1476,1,0,0,0,1479,1484,3,224,112,0,1480,1481,5,70,0,0,1481,
        1483,3,224,112,0,1482,1480,1,0,0,0,1483,1486,1,0,0,0,1484,1482,1,
        0,0,0,1484,1485,1,0,0,0,1485,1490,1,0,0,0,1486,1484,1,0,0,0,1487,
        1488,5,71,0,0,1488,1490,3,224,112,0,1489,1471,1,0,0,0,1489,1479,
        1,0,0,0,1489,1487,1,0,0,0,1490,223,1,0,0,0,1491,1492,5,198,0,0,1492,
        1493,3,222,111,0,1493,1494,5,199,0,0,1494,1497,1,0,0,0,1495,1497,
        3,226,113,0,1496,1491,1,0,0,0,1496,1495,1,0,0,0,1497,225,1,0,0,0,
        1498,1499,3,192,96,0,1499,1500,3,228,114,0,1500,1501,3,230,115,0,
        1501,1507,1,0,0,0,1502,1503,3,202,101,0,1503,1504,3,228,114,0,1504,
        1505,3,230,115,0,1505,1507,1,0,0,0,1506,1498,1,0,0,0,1506,1502,1,
        0,0,0,1507,227,1,0,0,0,1508,1524,5,207,0,0,1509,1524,5,217,0,0,1510,
        1524,5,209,0,0,1511,1524,5,208,0,0,1512,1513,5,209,0,0,1513,1524,
        5,207,0,0,1514,1515,5,208,0,0,1515,1524,5,207,0,0,1516,1524,5,218,
        0,0,1517,1524,5,80,0,0,1518,1524,5,81,0,0,1519,1520,5,71,0,0,1520,
        1524,5,81,0,0,1521,1524,5,82,0,0,1522,1524,5,83,0,0,1523,1508,1,
        0,0,0,1523,1509,1,0,0,0,1523,1510,1,0,0,0,1523,1511,1,0,0,0,1523,
        1512,1,0,0,0,1523,1514,1,0,0,0,1523,1516,1,0,0,0,1523,1517,1,0,0,
        0,1523,1518,1,0,0,0,1523,1519,1,0,0,0,1523,1521,1,0,0,0,1523,1522,
        1,0,0,0,1524,229,1,0,0,0,1525,1546,5,26,0,0,1526,1546,5,195,0,0,
        1527,1546,3,234,117,0,1528,1546,5,196,0,0,1529,1546,5,173,0,0,1530,
        1546,5,174,0,0,1531,1546,3,264,132,0,1532,1537,5,175,0,0,1533,1535,
        5,206,0,0,1534,1536,5,192,0,0,1535,1534,1,0,0,0,1535,1536,1,0,0,
        0,1536,1538,1,0,0,0,1537,1533,1,0,0,0,1537,1538,1,0,0,0,1538,1546,
        1,0,0,0,1539,1540,5,198,0,0,1540,1541,3,186,93,0,1541,1542,5,199,
        0,0,1542,1546,1,0,0,0,1543,1546,3,232,116,0,1544,1546,3,262,131,
        0,1545,1525,1,0,0,0,1545,1526,1,0,0,0,1545,1527,1,0,0,0,1545,1528,
        1,0,0,0,1545,1529,1,0,0,0,1545,1530,1,0,0,0,1545,1531,1,0,0,0,1545,
        1532,1,0,0,0,1545,1539,1,0,0,0,1545,1543,1,0,0,0,1545,1544,1,0,0,
        0,1546,231,1,0,0,0,1547,1548,5,198,0,0,1548,1553,3,230,115,0,1549,
        1550,5,205,0,0,1550,1552,3,230,115,0,1551,1549,1,0,0,0,1552,1555,
        1,0,0,0,1553,1551,1,0,0,0,1553,1554,1,0,0,0,1554,1556,1,0,0,0,1555,
        1553,1,0,0,0,1556,1557,5,199,0,0,1557,233,1,0,0,0,1558,1560,7,7,
        0,0,1559,1558,1,0,0,0,1559,1560,1,0,0,0,1560,1561,1,0,0,0,1561,1562,
        7,14,0,0,1562,235,1,0,0,0,1563,1564,5,53,0,0,1564,1565,5,97,0,0,
        1565,1566,5,98,0,0,1566,1576,3,238,119,0,1567,1568,5,53,0,0,1568,
        1576,5,103,0,0,1569,1570,5,53,0,0,1570,1576,5,104,0,0,1571,1572,
        5,53,0,0,1572,1576,5,105,0,0,1573,1574,5,53,0,0,1574,1576,3,222,
        111,0,1575,1563,1,0,0,0,1575,1567,1,0,0,0,1575,1569,1,0,0,0,1575,
        1571,1,0,0,0,1575,1573,1,0,0,0,1576,237,1,0,0,0,1577,1582,3,240,
        120,0,1578,1579,5,220,0,0,1579,1581,3,240,120,0,1580,1578,1,0,0,
        0,1581,1584,1,0,0,0,1582,1580,1,0,0,0,1582,1583,1,0,0,0,1583,239,
        1,0,0,0,1584,1582,1,0,0,0,1585,1586,3,268,134,0,1586,1587,3,244,
        122,0,1587,1588,3,242,121,0,1588,241,1,0,0,0,1589,1602,3,268,134,
        0,1590,1591,5,198,0,0,1591,1596,3,268,134,0,1592,1593,5,205,0,0,
        1593,1595,3,268,134,0,1594,1592,1,0,0,0,1595,1598,1,0,0,0,1596,1594,
        1,0,0,0,1596,1597,1,0,0,0,1597,1599,1,0,0,0,1598,1596,1,0,0,0,1599,
        1600,5,198,0,0,1600,1602,1,0,0,0,1601,1589,1,0,0,0,1601,1590,1,0,
        0,0,1602,243,1,0,0,0,1603,1604,7,15,0,0,1604,245,1,0,0,0,1605,1606,
        5,89,0,0,1606,1607,5,67,0,0,1607,1610,3,188,94,0,1608,1609,5,93,
        0,0,1609,1611,3,222,111,0,1610,1608,1,0,0,0,1610,1611,1,0,0,0,1611,
        1641,1,0,0,0,1612,1613,5,89,0,0,1613,1614,5,67,0,0,1614,1615,5,94,
        0,0,1615,1616,5,198,0,0,1616,1621,3,192,96,0,1617,1618,5,205,0,0,
        1618,1620,3,192,96,0,1619,1617,1,0,0,0,1620,1623,1,0,0,0,1621,1619,
        1,0,0,0,1621,1622,1,0,0,0,1622,1624,1,0,0,0,1623,1621,1,0,0,0,1624,
        1625,5,199,0,0,1625,1641,1,0,0,0,1626,1627,5,89,0,0,1627,1628,5,
        67,0,0,1628,1629,5,107,0,0,1629,1630,5,198,0,0,1630,1635,3,192,96,
        0,1631,1632,5,205,0,0,1632,1634,3,192,96,0,1633,1631,1,0,0,0,1634,
        1637,1,0,0,0,1635,1633,1,0,0,0,1635,1636,1,0,0,0,1636,1638,1,0,0,
        0,1637,1635,1,0,0,0,1638,1639,5,199,0,0,1639,1641,1,0,0,0,1640,1605,
        1,0,0,0,1640,1612,1,0,0,0,1640,1626,1,0,0,0,1641,247,1,0,0,0,1642,
        1643,5,66,0,0,1643,1644,5,67,0,0,1644,1645,3,250,125,0,1645,249,
        1,0,0,0,1646,1651,3,252,126,0,1647,1648,5,205,0,0,1648,1650,3,252,
        126,0,1649,1647,1,0,0,0,1650,1653,1,0,0,0,1651,1649,1,0,0,0,1651,
        1652,1,0,0,0,1652,251,1,0,0,0,1653,1651,1,0,0,0,1654,1656,3,192,
        96,0,1655,1657,7,16,0,0,1656,1655,1,0,0,0,1656,1657,1,0,0,0,1657,
        1660,1,0,0,0,1658,1659,5,86,0,0,1659,1661,7,17,0,0,1660,1658,1,0,
        0,0,1660,1661,1,0,0,0,1661,1671,1,0,0,0,1662,1664,3,202,101,0,1663,
        1665,7,16,0,0,1664,1663,1,0,0,0,1664,1665,1,0,0,0,1665,1668,1,0,
        0,0,1666,1667,5,86,0,0,1667,1669,7,17,0,0,1668,1666,1,0,0,0,1668,
        1669,1,0,0,0,1669,1671,1,0,0,0,1670,1654,1,0,0,0,1670,1662,1,0,0,
        0,1671,253,1,0,0,0,1672,1673,5,68,0,0,1673,1677,5,192,0,0,1674,1675,
        5,68,0,0,1675,1677,3,262,131,0,1676,1672,1,0,0,0,1676,1674,1,0,0,
        0,1677,255,1,0,0,0,1678,1679,5,96,0,0,1679,1683,5,192,0,0,1680,1681,
        5,96,0,0,1681,1683,3,262,131,0,1682,1678,1,0,0,0,1682,1680,1,0,0,
        0,1683,257,1,0,0,0,1684,1685,5,90,0,0,1685,1686,5,91,0,0,1686,259,
        1,0,0,0,1687,1688,5,15,0,0,1688,1690,7,18,0,0,1689,1687,1,0,0,0,
        1690,1693,1,0,0,0,1691,1689,1,0,0,0,1691,1692,1,0,0,0,1692,261,1,
        0,0,0,1693,1691,1,0,0,0,1694,1695,5,214,0,0,1695,1696,3,154,77,0,
        1696,263,1,0,0,0,1697,1784,5,129,0,0,1698,1784,5,130,0,0,1699,1784,
        5,131,0,0,1700,1784,5,132,0,0,1701,1784,5,133,0,0,1702,1784,5,134,
        0,0,1703,1784,5,135,0,0,1704,1784,5,136,0,0,1705,1784,5,137,0,0,
        1706,1784,5,138,0,0,1707,1784,5,139,0,0,1708,1709,5,140,0,0,1709,
        1710,5,214,0,0,1710,1784,3,266,133,0,1711,1712,5,141,0,0,1712,1713,
        5,214,0,0,1713,1784,3,266,133,0,1714,1715,5,142,0,0,1715,1716,5,
        214,0,0,1716,1784,3,266,133,0,1717,1718,5,143,0,0,1718,1719,5,214,
        0,0,1719,1784,3,266,133,0,1720,1721,5,144,0,0,1721,1722,5,214,0,
        0,1722,1784,3,266,133,0,1723,1724,5,145,0,0,1724,1725,5,214,0,0,
        1725,1784,3,266,133,0,1726,1727,5,146,0,0,1727,1728,5,214,0,0,1728,
        1784,3,266,133,0,1729,1730,5,147,0,0,1730,1731,5,214,0,0,1731,1784,
        3,266,133,0,1732,1733,5,148,0,0,1733,1734,5,214,0,0,1734,1784,3,
        266,133,0,1735,1784,5,149,0,0,1736,1784,5,150,0,0,1737,1784,5,151,
        0,0,1738,1739,5,152,0,0,1739,1740,5,214,0,0,1740,1784,3,266,133,
        0,1741,1742,5,153,0,0,1742,1743,5,214,0,0,1743,1784,3,266,133,0,
        1744,1745,5,154,0,0,1745,1746,5,214,0,0,1746,1784,3,266,133,0,1747,
        1784,5,155,0,0,1748,1784,5,156,0,0,1749,1784,5,157,0,0,1750,1751,
        5,158,0,0,1751,1752,5,214,0,0,1752,1784,3,266,133,0,1753,1754,5,
        159,0,0,1754,1755,5,214,0,0,1755,1784,3,266,133,0,1756,1757,5,160,
        0,0,1757,1758,5,214,0,0,1758,1784,3,266,133,0,1759,1784,5,161,0,
        0,1760,1784,5,162,0,0,1761,1784,5,163,0,0,1762,1763,5,164,0,0,1763,
        1764,5,214,0,0,1764,1784,3,266,133,0,1765,1766,5,165,0,0,1766,1767,
        5,214,0,0,1767,1784,3,266,133,0,1768,1769,5,166,0,0,1769,1770,5,
        214,0,0,1770,1784,3,266,133,0,1771,1784,5,167,0,0,1772,1784,5,168,
        0,0,1773,1784,5,169,0,0,1774,1775,5,170,0,0,1775,1776,5,214,0,0,
        1776,1784,3,266,133,0,1777,1778,5,171,0,0,1778,1779,5,214,0,0,1779,
        1784,3,266,133,0,1780,1781,5,172,0,0,1781,1782,5,214,0,0,1782,1784,
        3,266,133,0,1783,1697,1,0,0,0,1783,1698,1,0,0,0,1783,1699,1,0,0,
        0,1783,1700,1,0,0,0,1783,1701,1,0,0,0,1783,1702,1,0,0,0,1783,1703,
        1,0,0,0,1783,1704,1,0,0,0,1783,1705,1,0,0,0,1783,1706,1,0,0,0,1783,
        1707,1,0,0,0,1783,1708,1,0,0,0,1783,1711,1,0,0,0,1783,1714,1,0,0,
        0,1783,1717,1,0,0,0,1783,1720,1,0,0,0,1783,1723,1,0,0,0,1783,1726,
        1,0,0,0,1783,1729,1,0,0,0,1783,1732,1,0,0,0,1783,1735,1,0,0,0,1783,
        1736,1,0,0,0,1783,1737,1,0,0,0,1783,1738,1,0,0,0,1783,1741,1,0,0,
        0,1783,1744,1,0,0,0,1783,1747,1,0,0,0,1783,1748,1,0,0,0,1783,1749,
        1,0,0,0,1783,1750,1,0,0,0,1783,1753,1,0,0,0,1783,1756,1,0,0,0,1783,
        1759,1,0,0,0,1783,1760,1,0,0,0,1783,1761,1,0,0,0,1783,1762,1,0,0,
        0,1783,1765,1,0,0,0,1783,1768,1,0,0,0,1783,1771,1,0,0,0,1783,1772,
        1,0,0,0,1783,1773,1,0,0,0,1783,1774,1,0,0,0,1783,1777,1,0,0,0,1783,
        1780,1,0,0,0,1784,265,1,0,0,0,1785,1787,7,7,0,0,1786,1785,1,0,0,
        0,1786,1787,1,0,0,0,1787,1788,1,0,0,0,1788,1789,5,192,0,0,1789,267,
        1,0,0,0,1790,1791,3,292,146,0,1791,269,1,0,0,0,1792,1793,5,190,0,
        0,1793,1794,3,274,137,0,1794,1795,5,203,0,0,1795,1803,1,0,0,0,1796,
        1797,5,202,0,0,1797,1798,5,176,0,0,1798,1799,3,262,131,0,1799,1800,
        3,274,137,0,1800,1801,5,203,0,0,1801,1803,1,0,0,0,1802,1792,1,0,
        0,0,1802,1796,1,0,0,0,1803,271,1,0,0,0,1804,1805,5,191,0,0,1805,
        1806,3,274,137,0,1806,1807,5,203,0,0,1807,273,1,0,0,0,1808,1809,
        5,81,0,0,1809,1811,3,276,138,0,1810,1808,1,0,0,0,1810,1811,1,0,0,
        0,1811,1814,1,0,0,0,1812,1813,5,188,0,0,1813,1815,3,278,139,0,1814,
        1812,1,0,0,0,1814,1815,1,0,0,0,1815,1820,1,0,0,0,1816,1817,5,53,
        0,0,1817,1818,5,187,0,0,1818,1819,5,207,0,0,1819,1821,5,196,0,0,
        1820,1816,1,0,0,0,1820,1821,1,0,0,0,1821,1826,1,0,0,0,1822,1823,
        5,53,0,0,1823,1824,5,97,0,0,1824,1825,5,98,0,0,1825,1827,3,238,119,
        0,1826,1822,1,0,0,0,1826,1827,1,0,0,0,1827,1837,1,0,0,0,1828,1829,
        5,53,0,0,1829,1835,5,185,0,0,1830,1831,5,198,0,0,1831,1832,5,186,
        0,0,1832,1833,5,207,0,0,1833,1834,5,192,0,0,1834,1836,5,199,0,0,
        1835,1830,1,0,0,0,1835,1836,1,0,0,0,1836,1838,1,0,0,0,1837,1828,
        1,0,0,0,1837,1838,1,0,0,0,1838,1846,1,0,0,0,1839,1840,5,53,0,0,1840,
        1841,5,184,0,0,1841,1842,5,81,0,0,1842,1843,5,198,0,0,1843,1844,
        3,288,144,0,1844,1845,5,199,0,0,1845,1847,1,0,0,0,1846,1839,1,0,
        0,0,1846,1847,1,0,0,0,1847,1852,1,0,0,0,1848,1849,5,53,0,0,1849,
        1850,5,184,0,0,1850,1851,5,207,0,0,1851,1853,5,196,0,0,1852,1848,
        1,0,0,0,1852,1853,1,0,0,0,1853,1858,1,0,0,0,1854,1855,5,53,0,0,1855,
        1856,5,183,0,0,1856,1857,5,207,0,0,1857,1859,5,196,0,0,1858,1854,
        1,0,0,0,1858,1859,1,0,0,0,1859,1864,1,0,0,0,1860,1861,5,53,0,0,1861,
        1862,5,182,0,0,1862,1863,5,207,0,0,1863,1865,5,196,0,0,1864,1860,
        1,0,0,0,1864,1865,1,0,0,0,1865,1867,1,0,0,0,1866,1868,3,254,127,
        0,1867,1866,1,0,0,0,1867,1868,1,0,0,0,1868,1871,1,0,0,0,1869,1870,
        5,46,0,0,1870,1872,3,284,142,0,1871,1869,1,0,0,0,1871,1872,1,0,0,
        0,1872,275,1,0,0,0,1873,1874,7,19,0,0,1874,1875,5,181,0,0,1875,277,
        1,0,0,0,1876,1881,3,280,140,0,1877,1878,5,205,0,0,1878,1880,3,278,
        139,0,1879,1877,1,0,0,0,1880,1883,1,0,0,0,1881,1879,1,0,0,0,1881,
        1882,1,0,0,0,1882,279,1,0,0,0,1883,1881,1,0,0,0,1884,1910,3,290,
        145,0,1885,1886,5,198,0,0,1886,1889,3,282,141,0,1887,1888,5,65,0,
        0,1888,1890,3,222,111,0,1889,1887,1,0,0,0,1889,1890,1,0,0,0,1890,
        1895,1,0,0,0,1891,1892,5,63,0,0,1892,1893,5,189,0,0,1893,1894,5,
        207,0,0,1894,1896,3,290,145,0,1895,1891,1,0,0,0,1895,1896,1,0,0,
        0,1896,1900,1,0,0,0,1897,1898,5,66,0,0,1898,1899,5,67,0,0,1899,1901,
        3,250,125,0,1900,1897,1,0,0,0,1900,1901,1,0,0,0,1901,1903,1,0,0,
        0,1902,1904,3,254,127,0,1903,1902,1,0,0,0,1903,1904,1,0,0,0,1904,
        1906,1,0,0,0,1905,1907,3,256,128,0,1906,1905,1,0,0,0,1906,1907,1,
        0,0,0,1907,1908,1,0,0,0,1908,1909,5,199,0,0,1909,1911,1,0,0,0,1910,
        1885,1,0,0,0,1910,1911,1,0,0,0,1911,281,1,0,0,0,1912,1917,3,290,
        145,0,1913,1914,5,205,0,0,1914,1916,3,282,141,0,1915,1913,1,0,0,
        0,1916,1919,1,0,0,0,1917,1915,1,0,0,0,1917,1918,1,0,0,0,1918,283,
        1,0,0,0,1919,1917,1,0,0,0,1920,1923,3,286,143,0,1921,1922,5,205,
        0,0,1922,1924,3,284,142,0,1923,1921,1,0,0,0,1923,1924,1,0,0,0,1924,
        285,1,0,0,0,1925,1926,7,20,0,0,1926,287,1,0,0,0,1927,1930,5,196,
        0,0,1928,1929,5,205,0,0,1929,1931,3,288,144,0,1930,1928,1,0,0,0,
        1930,1931,1,0,0,0,1931,289,1,0,0,0,1932,1937,3,292,146,0,1933,1934,
        5,206,0,0,1934,1936,3,290,145,0,1935,1933,1,0,0,0,1936,1939,1,0,
        0,0,1937,1935,1,0,0,0,1937,1938,1,0,0,0,1938,291,1,0,0,0,1939,1937,
        1,0,0,0,1940,1941,7,21,0,0,1941,293,1,0,0,0,1942,1943,7,22,0,0,1943,
        295,1,0,0,0,194,306,323,337,345,350,355,363,370,377,381,387,391,
        399,408,415,424,431,440,447,453,457,478,487,495,499,505,521,529,
        534,545,551,559,563,565,574,583,588,592,596,600,602,610,619,625,
        636,646,649,653,658,668,676,679,682,690,701,727,734,743,757,763,
        766,777,785,791,804,807,810,814,833,840,847,854,861,865,871,880,
        891,896,901,906,913,926,930,934,936,940,958,979,995,1001,1035,1047,
        1049,1065,1070,1077,1083,1086,1091,1101,1108,1116,1130,1132,1140,
        1155,1162,1175,1178,1181,1184,1187,1190,1193,1196,1201,1208,1211,
        1214,1219,1226,1231,1235,1241,1244,1251,1256,1261,1265,1273,1278,
        1282,1285,1411,1419,1430,1434,1441,1444,1461,1476,1484,1489,1496,
        1506,1523,1535,1537,1545,1553,1559,1575,1582,1596,1601,1610,1621,
        1635,1640,1651,1656,1660,1664,1668,1670,1676,1682,1691,1783,1786,
        1802,1810,1814,1820,1826,1835,1837,1846,1852,1858,1864,1867,1871,
        1881,1889,1895,1900,1903,1906,1910,1917,1923,1930,1937
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

export class TriggerUnitContext extends antlr.ParserRuleContext {
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
    public triggerCase(): TriggerCaseContext[];
    public triggerCase(i: number): TriggerCaseContext | null;
    public triggerCase(i?: number): TriggerCaseContext[] | TriggerCaseContext | null {
        if (i === undefined) {
            return this.getRuleContexts(TriggerCaseContext);
        }

        return this.getRuleContext(i, TriggerCaseContext);
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
        return ApexParser.RULE_triggerUnit;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterTriggerUnit) {
             listener.enterTriggerUnit(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitTriggerUnit) {
             listener.exitTriggerUnit(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitTriggerUnit) {
            return visitor.visitTriggerUnit(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TriggerUnit2Context extends antlr.ParserRuleContext {
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
    public triggerCase(): TriggerCaseContext[];
    public triggerCase(i: number): TriggerCaseContext | null;
    public triggerCase(i?: number): TriggerCaseContext[] | TriggerCaseContext | null {
        if (i === undefined) {
            return this.getRuleContexts(TriggerCaseContext);
        }

        return this.getRuleContext(i, TriggerCaseContext);
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(ApexParser.RPAREN, 0)!;
    }
    public triggerBlock(): TriggerBlockContext {
        return this.getRuleContext(0, TriggerBlockContext)!;
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
        return ApexParser.RULE_triggerUnit2;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterTriggerUnit2) {
             listener.enterTriggerUnit2(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitTriggerUnit2) {
             listener.exitTriggerUnit2(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitTriggerUnit2) {
            return visitor.visitTriggerUnit2(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TriggerCaseContext extends antlr.ParserRuleContext {
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
        return ApexParser.RULE_triggerCase;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterTriggerCase) {
             listener.enterTriggerCase(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitTriggerCase) {
             listener.exitTriggerCase(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitTriggerCase) {
            return visitor.visitTriggerCase(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TriggerBlockContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.LBRACE, 0)!;
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(ApexParser.RBRACE, 0)!;
    }
    public triggerBlockMember(): TriggerBlockMemberContext[];
    public triggerBlockMember(i: number): TriggerBlockMemberContext | null;
    public triggerBlockMember(i?: number): TriggerBlockMemberContext[] | TriggerBlockMemberContext | null {
        if (i === undefined) {
            return this.getRuleContexts(TriggerBlockMemberContext);
        }

        return this.getRuleContext(i, TriggerBlockMemberContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_triggerBlock;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterTriggerBlock) {
             listener.enterTriggerBlock(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitTriggerBlock) {
             listener.exitTriggerBlock(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitTriggerBlock) {
            return visitor.visitTriggerBlock(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TriggerBlockMemberContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public triggerMemberDeclaration(): TriggerMemberDeclarationContext | null {
        return this.getRuleContext(0, TriggerMemberDeclarationContext);
    }
    public modifier(): ModifierContext[];
    public modifier(i: number): ModifierContext | null;
    public modifier(i?: number): ModifierContext[] | ModifierContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ModifierContext);
        }

        return this.getRuleContext(i, ModifierContext);
    }
    public statement(): StatementContext | null {
        return this.getRuleContext(0, StatementContext);
    }
    public override get ruleIndex(): number {
        return ApexParser.RULE_triggerBlockMember;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterTriggerBlockMember) {
             listener.enterTriggerBlockMember(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitTriggerBlockMember) {
             listener.exitTriggerBlockMember(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitTriggerBlockMember) {
            return visitor.visitTriggerBlockMember(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
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
    public classDeclaration(): ClassDeclarationContext | null {
        return this.getRuleContext(0, ClassDeclarationContext);
    }
    public modifier(): ModifierContext[];
    public modifier(i: number): ModifierContext | null;
    public modifier(i?: number): ModifierContext[] | ModifierContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ModifierContext);
        }

        return this.getRuleContext(i, ModifierContext);
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


export class TriggerMemberDeclarationContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public methodDeclaration(): MethodDeclarationContext | null {
        return this.getRuleContext(0, MethodDeclarationContext);
    }
    public fieldDeclaration(): FieldDeclarationContext | null {
        return this.getRuleContext(0, FieldDeclarationContext);
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
        return ApexParser.RULE_triggerMemberDeclaration;
    }
    public override enterRule(listener: ApexParserListener): void {
        if(listener.enterTriggerMemberDeclaration) {
             listener.enterTriggerMemberDeclaration(this);
        }
    }
    public override exitRule(listener: ApexParserListener): void {
        if(listener.exitTriggerMemberDeclaration) {
             listener.exitTriggerMemberDeclaration(this);
        }
    }
    public override accept<Result>(visitor: ApexParserVisitor<Result>): Result | null {
        if (visitor.visitTriggerMemberDeclaration) {
            return visitor.visitTriggerMemberDeclaration(this);
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
