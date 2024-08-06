// Auto generated type definitions from Metadata API WSDL
// Designed for use with Vlocode libraries and extension
// Provides design-time validation of Salesforce metadata types
import type { AsyncResult } from '../connection/metadata/types/asyncResult';
import type { RecordError } from '../connection/metadata/types/error';
import type { ReadResult, SaveResult, UpsertResult } from '../connection/metadata/types/crudResult';
import type { DeployMessage, DeployResult, DeployOptions, RunTestsResult } from '../connection/metadata/types/deployResult';
import type { CancelDeployResult } from '../connection/metadata/types/cancelDeployResult';
import type { DescribeMetadataResult } from '../connection/metadata/types/describeMetadataResult';
import type { DescribeValueTypeResult } from '../connection/metadata/types/describeValueTypeResult';
import type { ListMetadataQuery } from '../connection/metadata/types/metadataQuery';
import type { FileProperties, RetrieveResult } from '../connection/metadata/types/retrieveResult';

// Enums
export type DeployProblemType = 'Warning' | 'Error' | 'Info';
export type FlowProcessType = 'AutoLaunchedFlow' | 'Flow' | 'Workflow' | 'CustomEvent' | 'InvocableProcess' | 'LoginFlow' | 'ActionPlan' | 'JourneyBuilderIntegration' | 'UserProvisioningFlow' |
	'Survey' | 'SurveyEnrich' | 'Appointments' | 'FSCLending' | 'DigitalForm' | 'FieldServiceMobile' | 'OrchestrationFlow' | 'FieldServiceWeb' | 'TransactionSecurityFlow' |
	'ContactRequestFlow' | 'ActionCadenceFlow' | 'ManagedContentFlow' | 'CheckoutFlow' | 'CartAsyncFlow' | 'CustomerLifecycle' | 'Journey' | 'RecommendationStrategy' |
	'Orchestrator' | 'RoutingFlow' | 'ServiceCatalogItemFlow' | 'EvaluationFlow' | 'LoyaltyManagementFlow' | 'ManagedContentAuthoringWorkflow' | 'ActionCadenceAutolaunchedFlow' |
	'ActionCadenceStepFlow';
export type AIApplicationStatus = 'Draft' | 'Migrated' | 'Enabled' | 'Disabled';
export type AIApplicationType = 'PredictionBuilder' | 'RecommendationBuilder';
export type AIScoringMode = 'Batch' | 'OnDemand' | 'Streaming';
export type ItemActionType = 'Omniscript';
export type ItemCategory = 'dbBased' | 'fileBased';
export type ActionLinkType = 'API' | 'APIAsync' | 'Download' | 'UI';
export type ActionLinkHttpMethod = 'HttpDelete' | 'HttpHead' | 'HttpGet' | 'HttpPatch' | 'HttpPost' | 'HttpPut';
export type ActionLinkUserVisibility = 'Creator' | 'Everyone' | 'EveryoneButCreator' | 'Manager' | 'CustomUser' | 'CustomExcludedUser';
export type PlatformActionGroupCategory = 'Primary' | 'Overflow';
export type ActionLinkExecutionsAllowed = 'Once' | 'OncePerUser' | 'Unlimited';
export type ReportSummaryType = 'Sum' | 'Average' | 'Maximum' | 'Minimum' | 'Unique' | 'Median' | 'None';
export type ReportJobSourceTypes = 'tabular' | 'summary' | 'snapshot';
export type AppDomainUsageType = 'ExplainabilityService';
export type PolicyApplicableDuration = 'ParameterBased' | 'Monthly' | 'Weekly';
export type AssignmentPolicyType = 'loadBalancing';
export type UtilizationFactor = 'TotalAppointmentDuration' | 'NumberOfAppointments';
export type ProcessSubmitterType = 'group' | 'role' | 'user' | 'roleSubordinates' | 'roleSubordinatesInternal' | 'owner' | 'creator' | 'partnerUser' | 'customerPortalUser' | 'portalRole' |
	'portalRoleSubordinates' | 'allInternalUsers';
export type WorkflowActionType = 'FieldUpdate' | 'KnowledgePublish' | 'Task' | 'Alert' | 'Send' | 'OutboundMessage' | 'FlowAction';
export type NextOwnerType = 'adhoc' | 'user' | 'userHierarchyField' | 'relatedUserField' | 'queue';
export type RoutingType = 'Unanimous' | 'FirstResponse';
export type FilterOperation = 'equals' | 'notEqual' | 'lessThan' | 'greaterThan' | 'lessOrEqual' | 'greaterOrEqual' | 'contains' | 'notContain' | 'startsWith' | 'includes' |
	'excludes' | 'within';
export type StepCriteriaNotMetType = 'ApproveRecord' | 'RejectRecord' | 'GotoNextStep';
export type StepRejectBehaviorType = 'RejectRequest' | 'BackToPrevious';
export type RecordEditabilityType = 'AdminOnly' | 'AdminOrCurrentApprover';
export type AssignToLookupValueType = 'User' | 'Queue';
export type BusinessHoursSourceType = 'None' | 'Case' | 'Static';
export type EscalationStartTimeType = 'CaseCreation' | 'CaseLastModified';
export type AudienceCriterionOperator = 'Equal' | 'NotEqual' | 'GreaterThan' | 'GreaterThanOrEqual' | 'LessThan' | 'LessThanOrEqual' | 'Contains' | 'StartsWith' | 'Includes' | 'NotIncludes';
export type AudienceCriterionType = 'Default' | 'Profile' | 'FieldBased' | 'GeoLocation' | 'Domain' | 'Permission' | 'Audience';
export type FormulaFilterType = 'AllCriteriaMatch' | 'AnyCriterionMatches' | 'CustomLogicMatches';
export type AuraBundleType = 'Application' | 'Component' | 'Event' | 'Interface' | 'Tokens';
export type MuleSoftControlPlane = 'None' | 'US' | 'EU';
export type AuthProviderType = 'Facebook' | 'Janrain' | 'Salesforce' | 'OpenIdConnect' | 'MicrosoftACS' | 'LinkedIn' | 'Twitter' | 'Google' | 'GitHub' | 'Custom' | 'Apple' | 'Evergreen' |
	'Slack' | 'HubSpot' | 'Microsoft' | 'MuleSoft';
export type Language = 'en_US' | 'de' | 'es' | 'fr' | 'it' | 'ja' | 'sv' | 'ko' | 'zh_TW' | 'zh_CN' | 'pt_BR' | 'nl_NL' | 'da' | 'th' | 'fi' | 'ru' | 'es_MX' | 'no' |
	'hu' | 'pl' | 'cs' | 'tr' | 'in' | 'ro' | 'vi' | 'uk' | 'iw' | 'el' | 'bg' | 'en_GB' | 'ar' | 'sk' | 'pt_PT' | 'hr' | 'sl' | 'fr_CA' | 'ka' | 'sr' |
	'sh' | 'en_AU' | 'en_MY' | 'en_IN' | 'en_PH' | 'en_CA' | 'ro_MD' | 'bs' | 'mk' | 'lv' | 'lt' | 'et' | 'sq' | 'sh_ME' | 'mt' | 'ga' | 'eu' | 'cy' |
	'is' | 'ms' | 'tl' | 'lb' | 'rm' | 'hy' | 'hi' | 'ur' | 'bn' | 'de_AT' | 'de_CH' | 'ta' | 'ar_DZ' | 'ar_BH' | 'ar_EG' | 'ar_IQ' | 'ar_JO' | 'ar_KW' |
	'ar_LB' | 'ar_LY' | 'ar_MA' | 'ar_OM' | 'ar_QA' | 'ar_SA' | 'ar_SD' | 'ar_SY' | 'ar_TN' | 'ar_AE' | 'ar_YE' | 'zh_SG' | 'zh_HK' | 'en_HK' | 'en_IE' |
	'en_SG' | 'en_ZA' | 'fr_BE' | 'fr_LU' | 'fr_CH' | 'de_BE' | 'de_LU' | 'it_CH' | 'nl_BE' | 'es_AR' | 'es_BO' | 'es_CL' | 'es_CO' | 'es_CR' | 'es_DO' |
	'es_EC' | 'es_SV' | 'es_GT' | 'es_HN' | 'es_NI' | 'es_PA' | 'es_PY' | 'es_PE' | 'es_PR' | 'es_US' | 'es_UY' | 'es_VE' | 'ca' | 'af' | 'sw' | 'zu' |
	'xh' | 'te' | 'ml' | 'kn' | 'mr' | 'gu' | 'pa' | 'en_NZ' | 'mi' | 'my' | 'fa' | 'km' | 'am' | 'kk' | 'ht' | 'sm' | 'haw' | 'zh_MY' | 'ru_LT' | 'ru_PL' |
	'ru_AM' | 'ru_KZ' | 'ru_KG' | 'ru_BY' | 'ru_MD' | 'ru_UA' | 'en_AE' | 'en_BE' | 'en_CY' | 'en_DE' | 'en_IL' | 'en_NL' | 'en_MT' | 'el_CY' | 'fr_MA' |
	'kl' | 'ji' | 'hmn' | 'eo' | 'iw_EO';
export type MlSlotClassDataType = 'Text' | 'Number' | 'Boolean' | 'Date' | 'DateTime' | 'Currency';
export type MlSlotClassExtractionType = 'Pattern' | 'Value';
export type ConversationInvocableTargetType = 'apex' | 'flow' | 'standardInvocableAction' | 'logFeedback' | 'externalService' | 'logGoalAchieved';
export type BotInvocationMappingType = 'Input' | 'Output';
export type ConversationVariableType = 'ConversationVariable' | 'ContextVariable';
export type BotNavigationType = 'Call' | 'Redirect' | 'TransferToAgent';
export type BotStepConditionOperatorType = 'Equals' | 'NotEquals' | 'IsSet' | 'IsNotSet' | 'GreaterThan' | 'LessThan' | 'GreaterThanOrEqualTo' | 'LessThanOrEqualTo';
export type ConversationVariableOperandSourceType = 'StandardConversationVariable' | 'ConversationVariable' | 'ContextVariable' | 'MlSlotClass' | 'StandardMlSlotClass' | 'Value' | 'BotDefinition' |
	'Queue' | 'FlowDefinition';
export type BotQuickReplyType = 'Static' | 'Dynamic';
export type BotWidgetType = 'Menu' | 'Buttons';
export type BotVariableOperationType = 'Set' | 'Unset' | 'Collect' | 'SetConversationLanguage' | 'CollectAttachment';
export type SortOrder = 'Asc' | 'Desc';
export type ConversationMappingType = 'Input' | 'Output';
export type ConversationSystemMessageParamType = 'Transfer';
export type ConversationSystemMessageType = 'Transfer' | 'EndChat';
export type BotStepType = 'Navigation' | 'Invocation' | 'VariableOperation' | 'Message' | 'Wait' | 'Group' | 'SystemMessage' | 'RecordLookup' | 'RichMessage' | 'GoalStep';
export type ConversationSystemDialogType = 'TransferFailed' | 'ErrorHandling' | 'KnowledgeFallback' | 'Disambiguation';
export type ConversationVariableCollectionType = 'List';
export type ConversationDataType = 'Text' | 'Number' | 'Boolean' | 'Object' | 'Date' | 'DateTime' | 'Currency' | 'Id';
export type ConversationDefinitionNlpProviderType = 'EinsteinAi' | 'Apex';
export type MessageType = 'Text' | 'Facebook' | 'Line' | 'GoogleHome' | 'Alexa' | 'Omega' | 'AppleBusinessChat' | 'WeChat' | 'WebChat' | 'WhatsApp' | 'Phone' | 'EmbeddedMessaging' |
	'Voice';
export type ConvDefBlockVersionStatus = 'Published';
export type BriefcaseFilterOperator = 'e' | 'n' | 'l' | 'g' | 'm' | 'h' | 's' | 'd';
export type FilterScope = 'Everything' | 'Mine' | 'Queue' | 'Delegated' | 'MyTerritory' | 'MyTeamTerritory' | 'Team' | 'SalesTeam' | 'AssignedToMe' | 'MineAndMyGroups' |
	'ScopingRule';
export type BriefcaseRuleRelationshipType = 'ParentToChild' | 'ChildToParent';
export type BriefcaseType = 'Standard' | 'HighVolume';
export type ForecastCategories = 'Omitted' | 'Pipeline' | 'BestCase' | 'MostLikely' | 'Forecast' | 'Closed';
export type ExpFeedbackCollType = 'SURVEY' | 'PHONE_CALL';
export type SurveyQuestionType = 'MultiChoice' | 'RadioButton' | 'FreeText' | 'Date' | 'Rating' | 'CSAT' | 'Slider' | 'Picklist' | 'NPS' | 'StackRank' | 'Currency' | 'Number' |
	'DateTime' | 'Toggle' | 'MultiSelectPicklist' | 'Image' | 'Boolean' | 'ShortText' | 'Attachment' | 'Matrix';
export type CMSSourceConnectionType = 'Public' | 'Authenticated';
export type CMSConnectionStatus = 'ACTIVE' | 'INACTIVE';
export type CMSConnectionSourceType = 'AEM' | 'Drupal' | 'WordPress' | 'SDL' | 'Sitecore' | 'Other';
export type FeedItemDisplayFormat = 'Default' | 'HideBlankLines';
export type FeedItemType = 'TrackedChange' | 'UserStatus' | 'TextPost' | 'AdvancedTextPost' | 'LinkPost' | 'ContentPost' | 'PollPost' | 'RypplePost' | 'ProfileSkillPost' |
	'DashboardComponentSnapshot' | 'ApprovalPost' | 'CaseCommentPost' | 'ReplyPost' | 'EmailMessageEvent' | 'CallLogPost' | 'ChangeStatusPost' | 'AttachArticleEvent' |
	'MilestoneEvent' | 'ActivityEvent' | 'ChatTranscriptPost' | 'CollaborationGroupCreated' | 'CollaborationGroupUnarchived' | 'SocialPost' | 'QuestionPost' |
	'FacebookPost' | 'BasicTemplateFeedItem' | 'CreateRecordEvent' | 'CanvasPost' | 'AnnouncementPost';
export type EmailToCaseOnFailureActionType = 'Bounce' | 'Discard' | 'Requeue';
export type EmailToCaseRoutingAddressType = 'EmailToCase' | 'Outlook' | 'GmailOAuth' | 'E2cEasy';
export type CaseSubjectParticleType = 'ProvidedString' | 'Source' | 'MessageType' | 'SocialHandle' | 'SocialNetwork' | 'Sentiment' | 'RealName' | 'Content' | 'PipeSeparator' | 'ColonSeparator' |
	'HyphenSeparator';
export type ActionForNoRecordFound = 'CreateNewRecordAndLink' | 'PromptAgent';
export type ActionForSingleRecordFound = 'AutoLink' | 'PromptAgent';
export type ChannelType = 'FacebookMessenger' | 'Text' | 'WeChat' | 'WhatsApp' | 'Phone';
export type ObjectToLink = 'Contact';
export type ChatterExtensionType = 'Lightning';
export type MappingOperation = 'Autofill' | 'Overwrite';
export type CleanRuleStatus = 'Inactive' | 'Active';
export type CommunityBaseTemplate = 'c';
export type CommunityTemplateBundleInfoType = 'Highlight' | 'PreviewImage';
export type CommunityTemplateCategory = 'IT' | 'Marketing' | 'Sales' | 'Service' | 'Commerce';
export type CommunityThemeLayoutType = 'Login' | 'Home' | 'Inner' | 'ServiceNotAvailable';
export type AccessMethod = 'Get' | 'Post';
export type CanvasLocationOptions = 'None' | 'Chatter' | 'UserProfile' | 'Visualforce' | 'Aura' | 'Publisher' | 'ChatterFeed' | 'ServiceDesk' | 'OpenCTI' | 'AppLauncher' | 'MobileNav' |
	'PageLayout';
export type CanvasOptions = 'HideShare' | 'HideHeader' | 'PersonalEnabled';
export type SamlInitiationMethod = 'None' | 'IdpInitiated' | 'SpInitiated';
export type DevicePlatformType = 'ios' | 'android';
export type DeviceType = 'phone' | 'tablet' | 'minitablet';
export type ConnectedAppOauthAccessScope = 'Basic' | 'Api' | 'Web' | 'Full' | 'Chatter' | 'CustomApplications' | 'RefreshToken' | 'OpenID' | 'Profile' | 'Email' | 'Address' | 'Phone' | 'OfflineAccess' |
	'CustomPermissions' | 'Wave' | 'Eclair' | 'Pardot' | 'Lightning' | 'Content' | 'CDPIngest' | 'CDPProfile' | 'CDPQuery' | 'Chatbot' | 'CDPSegment' |
	'CDPIdentityResolution' | 'CDPCalculatedInsight' | 'ForgotPassword';
export type SamlEncryptionType = 'AES_128' | 'AES_256' | 'Triple_Des';
export type SamlIdpSLOBinding = 'RedirectBinding' | 'PostBinding';
export type SamlNameIdFormatType = 'Unspecified' | 'EmailAddress' | 'Persistent' | 'Transient';
export type SamlSigningAlgoType = 'SHA1' | 'SHA256';
export type SamlSubjectType = 'Username' | 'FederationId' | 'UserId' | 'SpokeId' | 'CustomAttribute' | 'PersistentId';
export type ClientAuthMode = 'SSO' | 'Custom' | 'Mixed';
export type ServerAuthMode = 'OAuth' | 'None';
export type ConversationVendorType = 'ServiceCloudVoicePartner' | 'Amazon_Connect';
export type CspTrustedSiteContext = 'All' | 'LEX' | 'Communities' | 'FieldServiceMobileExtension' | 'VisualForce';
export type FormFactor = 'Small' | 'Medium' | 'Large';
export type ActionOverrideType = 'Default' | 'Standard' | 'Scontrol' | 'Visualforce' | 'Flexipage' | 'LightningComponent';
export type NavType = 'Standard' | 'Console';
export type UiType = 'Aloha' | 'Lightning';
export type FeedItemVisibility = 'AllUsers' | 'InternalUsers';
export type DeleteConstraint = 'Cascade' | 'Restrict' | 'SetNull';
export type EncryptionScheme = 'None' | 'ProbabilisticEncryption' | 'CaseSensitiveDeterministicEncryption' | 'CaseInsensitiveDeterministicEncryption';
export type FieldManageability = 'DeveloperControlled' | 'SubscriberControlled' | 'Locked';
export type TreatBlanksAs = 'BlankAsBlank' | 'BlankAsZero';
export type EncryptedFieldMaskChar = 'asterisk' | 'X';
export type EncryptedFieldMaskType = 'all' | 'creditCard' | 'ssn' | 'lastFour' | 'sin' | 'nino';
export type DefinitionCreationType = 'Standard' | 'Custom' | 'System' | 'Derived' | 'Bridge' | 'Curated' | 'Segment_Membership' | 'Ml_Prediction' | 'Activation_Audience';
export type UsageTag = 'NONE' | 'KEY_QUALIFIER';
export type InvalidMergeActionType = 'Drop' | 'Keep' | 'Override';
export type MktDataModelFieldUsageTag = 'None' | 'KeyQualifier';
export type SummaryOperations = 'count' | 'sum' | 'min' | 'max';
export type ObjectFieldType = 'AutoNumber' | 'Lookup' | 'MasterDetail' | 'Checkbox' | 'Currency' | 'Date' | 'DateTime' | 'Email' | 'Number' | 'Percent' | 'Phone' | 'Picklist' |
	'MultiselectPicklist' | 'Text' | 'TextArea' | 'LongTextArea' | 'Html' | 'Url' | 'EncryptedText' | 'Summary' | 'Hierarchy' | 'File' | 'MetadataRelationship' |
	'Location' | 'ExternalLookup' | 'IndirectLookup' | 'CustomDataType' | 'Time' | 'Address';
export type Channel = 'AllChannels' | 'App' | 'Pkb' | 'Csp' | 'Prm';
export type Template = 'Page' | 'Tab' | 'Toc';
export type CustomSettingsType = 'List' | 'Hierarchy';
export type DeploymentStatus = 'InDevelopment' | 'Deployed';
export type PlatformEventType = 'HighVolume' | 'StandardVolume' | 'ExternalEvent';
export type SharingModel = 'Private' | 'Read' | 'ReadSelect' | 'ReadWrite' | 'ReadWriteTransfer' | 'FullAccess' | 'ControlledByParent' | 'ControlledByLeadOrContact' | 'ControlledByCampaign';
export type Gender = 'Neuter' | 'Masculine' | 'Feminine' | 'AnimateMasculine' | 'ClassI' | 'ClassIII' | 'ClassV' | 'ClassVII' | 'ClassIX' | 'ClassXI' | 'ClassXIV' |
	'ClassXV' | 'ClassXVI' | 'ClassXVII' | 'ClassXVIII';
export type PlatformEventPublishBehavior = 'PublishAfterCommit' | 'PublishImmediately';
export type StartsWith = 'Consonant' | 'Vowel' | 'Special';
export type SetupObjectVisibility = 'PackageProtected' | 'Protected' | 'Public';
export type WebLinkAvailability = 'online' | 'offline';
export type WebLinkDisplayType = 'link' | 'button' | 'massActionButton';
export type Encoding = 'UTF-8' | 'ISO-8859-1' | 'Shift_JIS' | 'ISO-2022-JP' | 'EUC-JP' | 'ks_c_5601-1987' | 'Big5' | 'GB2312' | 'Big5-HKSCS' | 'x-SJIS_0213';
export type WebLinkType = 'url' | 'sControl' | 'javascript' | 'page' | 'flow';
export type WebLinkWindowType = 'newWindow' | 'sidebar' | 'noSidebar' | 'replace' | 'onClickJavaScript';
export type WebLinkPosition = 'fullScreen' | 'none' | 'topLeft';
export type Article = 'None' | 'Indefinite' | 'Definite';
export type CaseType = 'Nominative' | 'Accusative' | 'Genitive' | 'Dative' | 'Inessive' | 'Elative' | 'Illative' | 'Adessive' | 'Ablative' | 'Allative' | 'Essive' | 'Translative' |
	'Partitive' | 'Objective' | 'Subjective' | 'Instrumental' | 'Prepositional' | 'Locative' | 'Vocative' | 'Sublative' | 'Superessive' | 'Delative' |
	'Causalfinal' | 'Essiveformal' | 'Termanative' | 'Distributive' | 'Ergative' | 'Adverbial' | 'Abessive' | 'Comitative';
export type Possessive = 'None' | 'First' | 'Second';
export type SiteClickjackProtectionLevel = 'AllowAllFraming' | 'External' | 'SameOriginOnly' | 'NoFraming';
export type SiteRedirect = 'Permanent' | 'Temporary';
export type SiteType = 'Siteforce' | 'Visualforce' | 'ChatterNetwork' | 'ChatterNetworkPicasso';
export type ChartBackgroundDirection = 'TopToBottom' | 'LeftToRight' | 'Diagonal';
export type ChartTheme = 'light' | 'dark';
export type ChartColorPalettes = 'Default' | 'gray' | 'colorSafe' | 'unity' | 'justice' | 'nightfall' | 'sunrise' | 'bluegrass' | 'tropic' | 'heat' | 'dusk' | 'pond' | 'watermelon' |
	'fire' | 'water' | 'earth' | 'accessible';
export type DashboardFilterOperation = 'equals' | 'notEqual' | 'lessThan' | 'greaterThan' | 'lessOrEqual' | 'greaterOrEqual' | 'contains' | 'notContain' | 'startsWith' | 'includes' |
	'excludes' | 'between';
export type ChartRangeType = 'Auto' | 'Manual';
export type ChartAxis = 'x' | 'y' | 'y2' | 'r';
export type DashboardComponentType = 'Bar' | 'BarGrouped' | 'BarStacked' | 'BarStacked100' | 'Column' | 'ColumnGrouped' | 'ColumnStacked' | 'ColumnStacked100' | 'Line' | 'LineGrouped' |
	'Pie' | 'Table' | 'Metric' | 'Gauge' | 'LineCumulative' | 'LineGroupedCumulative' | 'Scontrol' | 'VisualforcePage' | 'Donut' | 'Funnel' | 'ColumnLine' |
	'ColumnLineGrouped' | 'ColumnLineStacked' | 'ColumnLineStacked100' | 'Scatter' | 'ScatterGrouped' | 'FlexTable';
export type DashboardComponentFilter = 'RowLabelAscending' | 'RowLabelDescending' | 'RowValueAscending' | 'RowValueDescending';
export type ChartUnits = 'Auto' | 'Integer' | 'Hundreds' | 'Thousands' | 'Millions' | 'Billions' | 'Trillions';
export type ChartLegendPosition = 'Right' | 'Bottom' | 'OnChart';
export type DashboardType = 'SpecifiedUser' | 'LoggedInUser' | 'MyTeamUser';
export type DashboardComponentSize = 'Narrow' | 'Medium' | 'Wide';
export type SchedulingCategory = 'B' | 'A';
export type SchedulingObjectiveType = 'AgentPreference' | 'BalanceShifts' | 'BalanceNonStandardShifts';
export type ObjectiveParameterKey = 'DaysBack' | 'DaysAhead';
export type VirtualVisitComprehendServiceType = 'ComprehendService' | 'ComprehendMedicalService';
export type VirtualVisitUsageType = 'CHIME' | 'INTELLIGENT_FORM_READER' | 'SENTIMENT_ANALYSIS';
export type VirtualVisitVisitRegion = 'us-east-1' | 'us-east-2' | 'us-west-1' | 'us-west-2' | 'af-south-1' | 'ap-east-1' | 'ap-south-1' | 'ap-northeast-1' | 'ap-northeast-2' | 'ap-northeast-3' |
	'ap-southeast-1' | 'ap-southeast-2' | 'ca-central-1' | 'eu-central-1' | 'eu-west-1' | 'eu-west-2' | 'eu-west-3' | 'eu-south-1' | 'eu-north-1' |
	'me-south-1' | 'sa-east-1';
export type MobileSecurityMobilePlatform = 'Android' | 'iOS';
export type MobileSecurityPolicyRuleValueType = 'Boolean' | 'Text' | 'TextList';
export type MobileSecurityPolicySeverityLevel = 'Warn' | 'Error' | 'Critical' | 'Info';
export type MobileSecurityPolicyType = 'JailbrokenDevice' | 'MinimumOsVersion' | 'MaximumOsVersion' | 'MinimumSecurityPatchVersion' | 'ManInMiddle' | 'MinimumAppVersion' | 'MininumAppVersion' |
	'MaximumAppVersion' | 'DevicePasscode' | 'BlockedDeviceList' | 'BlockCustomKeyboard' | 'BlockFileBackup' | 'Block3dTouch' | 'Screenshot' | 'LogScreenshot' |
	'LogEmail' | 'LogPhonecall' | 'LogTextmessage' | 'LogPolicyResult' | 'BlockMicrophone' | 'BlockCamera' | 'MalwareDetection' | 'DisableUrlCaching' |
	'MaxOffline' | 'LogoutAfterRestart' | 'LogoutOnBiometricChange' | 'BlockOsSharing' | 'BrowserUriScheme' | 'CheckBiometric' | 'BlockContacts' | 'BlockCalendar' |
	'PhonecallUriScheme' | 'AllowedDeviceList' | 'LogCertPin';
export type ExtensionPointName = 'Product_Inventory_CheckInventory' | 'Cart_Prices_Extension' | 'Checkout_CartSummary_PriceCart' | 'Cart_CartSummary_PriceCart' | 'Checkout_CartSummary_ComputePromotions' |
	'Cart_CartSummary_ComputePromotions' | 'Checkout_CartSummary_Inventory' | 'Cart_CartSummary_Inventory' | 'Checkout_Update_CalcCartSummary' | 'CommerceDx_Pricing' |
	'CommerceDx_Inventory' | 'CommerceDx_TicketProcessing' | 'Commerce_Inventory';
export type RegistryProviderType = 'Price' | 'Promotions' | 'Inventory' | 'Shipment' | 'Tax' | 'Extension';
export type MappingBehaviorType = 'PointInTime' | 'CurrentValue';
export type MobileSecurityCertPinType = 'AuthServer' | 'Resource';
export type DatasetColumnDataType = 'Dimensions' | 'Dates' | 'Measures';
export type ProviderSearchObjectMapping = 'HealthcareProvider' | 'HealthcarePractitionerFacility';
export type SourceSystemFieldRole = 'NotApplicable' | 'Patient' | 'ServiceProvider' | 'RemoteMonitoringPatient' | 'RemoteMonitoringDevice';
export type CareLimitTypeMetricType = 'Money' | 'Percentage' | 'Amount' | 'Text';
export type SchedulingRuleType = 'M' | 'B' | 'W' | 'A' | 'RestTimeMinutes' | 'Q' | 'C' | 'LimitNonstandardShifts';
export type SchedulingParameterKey = 'L' | 'R' | 'W' | 'T' | 'C' | 'ConsiderAbsence' | 'ConsiderSTM';
export type AssociationType = 'BranchManagement';
export type AssociationEventType = 'Create' | 'Update';
export type AssociationStatusType = 'Draft' | 'Active' | 'Inactive';
export type ApexCodeUnitStatus = 'Inactive' | 'Active' | 'Deleted';
export type ContentAssetFormat = 'Original' | 'ZippedVersions';
export type ContentAssetAccess = 'VIEWER' | 'COLLABORATOR' | 'INFERRED';
export type DiscoveryAlgorithmType = 'Glm' | 'Gbm' | 'Xgboost' | 'Drf' | 'Best';
export type DiscoveryModelFieldType = 'Text' | 'Number' | 'Date';
export type DiscoveryModelRuntimeType = 'Discovery' | 'H2O';
export type DiscoveryPredictionType = 'Unknown' | 'Regression' | 'Classification' | 'MulticlassClassification';
export type DiscoveryModelSourceType = 'Discovery' | 'UserUpload';
export type DiscoveryAIModelStatus = 'Disabled' | 'Enabled';
export type EmailTemplateStyle = 'none' | 'freeForm' | 'formalLetter' | 'promotionRight' | 'promotionLeft' | 'newsletter' | 'products';
export type EmailTemplateType = 'text' | 'html' | 'custom' | 'visualforce';
export type EmailTemplateUiType = 'Aloha' | 'SFX' | 'SFX_Sample';
export type SControlContentSource = 'HTML' | 'URL' | 'Snippet';
export type StaticResourceCacheControl = 'Private' | 'Public';
export type DiscoveryFieldMapSourceType = 'SalesforceField' | 'AnalyticsDatasetField';
export type DiscoveryFilterOperator = 'Equal' | 'NotEqual' | 'GreaterThan' | 'GreaterThanOrEqual' | 'LessThan' | 'LessThanOrEqual' | 'Between' | 'NotBetween' | 'InSet' | 'NotIn' | 'Contains' |
	'StartsWith' | 'EndsWith' | 'IsNull' | 'IsNotNull';
export type DiscoveryFilterFieldType = 'Text' | 'Number' | 'Date' | 'DateTime' | 'Boolean';
export type DiscoveryFilterValueType = 'Constant' | 'PlaceHolder';
export type DiscoveryOutcomeGoal = 'Minimize' | 'Maximize' | 'None';
export type DiscoveryPushbackType = 'AiRecordInsight' | 'Direct';
export type DupeActionType = 'Allow' | 'Block';
export type DupeSecurityOptionType = 'EnforceSharingRules' | 'BypassSharingRules';
export type EmailServicesAttOptions = 'None' | 'TextOnly' | 'BinaryOnly' | 'All' | 'NoContent';
export type EmailServicesErrorAction = 'UseSystemDefault' | 'Bounce' | 'Discard' | 'Requeue';
export type EmbeddedServiceAuthMethod = 'CommunitiesLogin' | 'CustomLogin';
export type EmbeddedServiceDeploymentFeature = 'None' | 'EmbeddedMessaging' | 'LiveAgent' | 'Flows' | 'FieldService';
export type EmbeddedServiceDeploymentType = 'Web' | 'Mobile';
export type EmbeddedServiceComponentBundleType = 'AuraDefinitionBundle' | 'LightningComponentBundle';
export type EmbeddedServiceCustomComponentType = 'LA_Prechat' | 'LA_Minimized' | 'LA_PlainTextChatMessage' | 'LA_ChatHeader';
export type EmbeddedServiceFeature = 'NotInUse' | 'Base' | 'LiveAgent' | 'FieldService' | 'Flows' | 'ChannelMenu' | 'EmbeddedMessaging';
export type EmbeddedServiceLabelKey = 'LA_Container_Base_Close' | 'LA_Container_Base_Minimize' | 'LA_Container_Base_EndOfDialog' | 'LA_Container_Base_MinimizedContainerAssistiveText' |
	'LA_Chat_Body_ChatWindowAgent' | 'LA_Chat_Body_InputTextPlaceholder' | 'LA_Chat_Body_AgentTypingUpdate' | 'LA_Chat_Body_Send' | 'LA_Chat_Body_ChatStartTime' |
	'LA_Chat_Body_MessageAreaTransferred' | 'LA_Chat_Body_FileTransferCanceled' | 'LA_Chat_Body_FileTransferSuccess' | 'LA_Chat_Body_FileTransferFailure' |
	'LA_Chat_Body_FileTransferRequested' | 'LA_Chat_Body_TransferFailed' | 'LA_Chat_ExtendedHeader_ShowExtendedHeader' | 'LA_Chat_ExtendedHeader_HideExtendedHeader' |
	'LA_Chat_ExtendedHeader_ChatStateHeaderGreeting' | 'LA_Chat_ExtendedHeader_SaveTranscript' | 'LA_Chat_ExtendedHeader_EndChatAction' | 'LA_Chat_FileTransfer_FileUpload' |
	'LA_Chat_FileTransfer_UploadFile' | 'LA_Chat_FileTransfer_SelectNewFile' | 'LA_Chat_FileTransfer_UsePreviousElementToUploadFile' | 'LA_Chat_FileTransfer_RemoveFile' |
	'LA_Chat_Minimized_MessageNotification' | 'LA_Chat_Minimized_SingleMessageNotification' | 'LA_Chat_Minimized_AgentSaysNotification' | 'LA_Chat_Minimized_IdleTimeoutMinimizedWarning' |
	'LA_Chat_Minimized_IdleTimeoutMinimizedEndChat' | 'LA_Chat_Ended_ChatEnd' | 'LA_Chat_Ended_ChatEndAgent' | 'LA_Chat_Ended_ChatEndConnection' | 'LA_Chat_Ended_ChatButtonClose' |
	'LA_Chat_Ended_PostChatButton' | 'LA_Chat_Ended_IdleTimeoutEndChatMessage' | 'LA_Chat_Reconnecting_ReconnectingChasitorIssue' | 'LA_Chat_Reconnecting_ReconnectingMinimizedMessage' |
	'LA_Chat_Timeout_IdleTimeoutWarningQuestion' | 'LA_Chat_AgentTransfer_BannerInProgressTransfer' | 'LA_Chat_AgentTransfer_MinimizedInProgressTransfer' |
	'LA_Chat_AgentTransfer_BannerTransferred' | 'LA_Chat_AgentTransfer_BannerReconnected' | 'LA_Chat_CloseConfirmation_ChatStateHeader' | 'LA_Chat_CloseConfirmation_ChatStateBody' |
	'LA_Chat_CloseConfirmation_ChatStateResume' | 'LA_Chat_CloseConfirmation_ChatStateEnd' | 'LA_Chat_UnseenMessage_UnseenMessage' | 'LA_Chat_UnseenMessage_SingleUnseenMessage' |
	'LA_OfflineSupport_SupportForm_HeaderText' | 'LA_OfflineSupport_Error_ErrorDialogTitle' | 'LA_OfflineSupport_Error_ErrorDialogBody' | 'LA_OfflineSupport_Error_ErrorDialogButton' |
	'LA_OfflineSupport_SupportForm_SupportFormTitle' | 'LA_OfflineSupport_SupportForm_SupportFormSubtitle' | 'LA_OfflineSupport_SupportForm_SupportFormButton' |
	'LA_OfflineSupport_SupportForm_BannerAltText' | 'LA_OfflineSupport_CloseConfirmation_ConfirmationDialogTitle' | 'LA_OfflineSupport_CloseConfirmation_ConfirmationDialogBody' |
	'LA_OfflineSupport_CloseConfirmation_ConfirmationDialogButton' | 'LA_OfflineSupport_Minimized_ConfirmationMinimizedText' | 'LA_OfflineSupport_Minimized_ErrorMinimizedText' |
	'LA_PostChat_Base_PostChat' | 'LA_PreChat_Base_LiveChat' | 'LA_PreChat_Base_Instructions' | 'LA_PreChat_Base_BannerAltText' | 'LA_PreChat_Base_PrechatAssistiveText' |
	'LA_PreChat_Base_StartChat' | 'LA_PreChat_Base_FieldError' | 'LA_Waiting_WithoutQueuePos_WaitingGreeting' | 'LA_Waiting_WithoutQueuePos_WaitingDefaultName' |
	'LA_Waiting_WithoutQueuePos_WaitingMessage' | 'LA_Waiting_WithoutQueuePos_WaitingCancelChatRequest' | 'LA_Waiting_WithQueuePos_WaitingQueuePosMessageFirstLine' |
	'LA_Waiting_WithQueuePos_WaitingQueuePosMessageSecondLine' | 'LA_Waiting_WithQueuePos_WaitingQueuePosZeroMessage' | 'LA_Waiting_WithQueuePos_WaitingQueuePosConnectingMessage' |
	'LA_Waiting_WithQueuePos_WaitingQueuePosMaxNumber' | 'LA_Waiting_WithQueuePos_WaitingQueuePosMaxMessageFirstLine' | 'LA_Waiting_WithQueuePos_WaitingQueuePosMaxMessageSecondLine' |
	'LA_Waiting_Minimized_MinimizedWaitingMessage' | 'LA_Waiting_Minimized_MinimizedQueuePosMessage' | 'LA_Waiting_Minimized_MinimizedQueuePosZeroMessage' |
	'LA_Waiting_Minimized_MinimizedQueuePosAssistiveMessage' | 'LA_Waiting_Minimized_MinimizedQueuePosZeroAssistiveMessage' | 'LA_Waiting_Error_ErrorNoAgentTitle' |
	'LA_Waiting_Error_ErrorNoAgentHeader' | 'LA_Waiting_Error_ErrorNoAgentBodyApology' | 'LA_Waiting_Error_ErrorBlockedTitleAndHeader' | 'LA_Waiting_Error_ErrorBlockedBody' |
	'LA_Waiting_Error_ErrorBlockedCloseButton' | 'LA_Waiting_Error_ErrorNoConnectionTitle' | 'LA_Waiting_Error_ErrorNoConnectionHeader' | 'LA_Waiting_Error_ErrorNoConnectionBodyApology' |
	'LA_Waiting_Error_ErrorTryAgainButton' | 'LA_Waiting_Error_ErrorExitChatButton' | 'LA_Waiting_CloseConfirmation_WaitingStateHeader' | 'LA_Waiting_CloseConfirmation_WaitingStateBodyApology' |
	'LA_Waiting_CloseConfirmation_WaitingStateLeave' | 'LA_Waiting_CloseConfirmation_WaitingStateContinue' | 'LA_Chat_Timeout_IdleTimeoutWarningRequest' |
	'LA_Waiting_Error_ErrorNoAgentBodyRequest' | 'LA_Waiting_Error_ErrorNoConnectionBodyRequest' | 'LA_Waiting_CloseConfirmation_WaitingStateBodyWarning' |
	'LA_General_CloseSessionWarningTitle' | 'LA_General_CloseSessionWarningBody' | 'LA_General_CloseSessionWarningButton' | 'LA_Chat_Body_ChooseOption' |
	'LA_Waiting_Base_BannerAssistiveText' | 'LA_Chat_Group_Chat_HeaderTitle' | 'LA_Chat_Group_Chat_ExtendedHeaderGreeting' | 'LA_Chat_Group_Chat_AgentJoinedChat' |
	'LA_Chat_Group_Chat_AgentLeftChat' | 'LA_Chat_Group_Chat_MinimizedStateMessage' | 'LA_Chat_WithQueuePos_QueuePosTransferringMessage' | 'LA_Chat_Ended_ChatEndChatbot' |
	'LA_Chat_Body_InputTextAssistiveText' | 'LA_Waiting_Header_Text' | 'FS_Container_Base_Back' | 'FS_Container_AuthenticationFailure_Title' | 'FS_Container_AuthenticationFailure_Body' |
	'FS_Container_AuthenticationFailure_Button' | 'FS_AppointmentDetail_Error_AccessDenied' | 'FS_AppointmentDetail_Error_NoAppointmentFound' | 'FS_AppointmentDetail_Error_ButtonOK' |
	'FS_AppointmentList_Base_ActiveAppointmentTab' | 'FS_AppointmentList_Base_ClosedAppointmentTab' | 'FS_AppointmentList_Base_Header' | 'FS_AppointmentList_Base_NewAppointmentButtonLabel' |
	'FS_AppointmentList_Error_GenericErrorStatement' | 'FS_AppointmentList_Empty_NoAppointmentsTitleUpcomingTab' | 'FS_AppointmentList_Empty_NoAppointmentsDescriptionUpcomingTab' |
	'FS_AppointmentList_Empty_NoAppointmentsTitlePastTab' | 'FS_AppointmentList_Empty_NoAppointmentsDescriptionPastTab' | 'FS_Confirmation_Base_Scheduled' |
	'FS_Confirmation_Base_Assigned' | 'FS_Confirmation_Base_Arriving' | 'FS_Confirmation_Base_InProgress' | 'FS_Confirmation_Base_Dispatched' | 'FS_Confirmation_Base_Completed' |
	'FS_Confirmation_Base_HeaderText' | 'FS_Confirmation_Base_AddCalendar' | 'FS_Confirmation_Base_ViewAppointment' | 'FS_Flows_Error_Title' | 'FS_Flows_Error_Body' |
	'FS_Flows_Error_ConfirmButton' | 'FS_Flows_Error_CancelOrModifyError' | 'FS_Flows_NewAppointmentCloseConfirmation_Title' | 'FS_Flows_NewAppointmentCloseConfirmation_Body' |
	'FS_Flows_NewAppointmentCloseConfirmation_ButtonClose' | 'FS_Flows_NewAppointmentCloseConfirmation_ButtonCancel' | 'FS_Flows_CancelAppointmentCloseConfirmation_Title' |
	'FS_Flows_CancelAppointmentCloseConfirmation_Body' | 'FS_Flows_CancelAppointmentCloseConfirmation_ButtonClose' | 'FS_Flows_CancelAppointmentCloseConfirmation_ButtonCancel' |
	'FS_Flows_CancelAppointmentCloseConfirmation_Footer' | 'FS_Flows_ModifyAppointmentCloseConfirmation_Title' | 'FS_Flows_ModifyAppointmentCloseConfirmation_Body' |
	'FS_Flows_ModifyAppointmentCloseConfirmation_ButtonClose' | 'FS_Flows_ModifyAppointmentCloseConfirmation_ButtonCancel' | 'FS_Flows_ModifyAppointmentCloseConfirmation_Footer' |
	'FS_Scheduling_Base_HeaderText' | 'FS_Scheduling_Base_RecommendedTab' | 'FS_Scheduling_Base_ByDateTab' | 'FS_Scheduling_Base_PreviousWeekAssistiveText' |
	'FS_Scheduling_Base_NextWeekAssistiveText' | 'FS_Scheduling_Base_DatePickerAssistiveText' | 'FS_Scheduling_Error_UnexpectedError' | 'FS_Scheduling_Error_NoAvailableTimeslotsError' |
	'FS_Scheduling_Error_NoAvailableTimeslotsByDateError' | 'FS_Welcome_Base_GreetingTitle' | 'FS_Welcome_Base_NewAppointmentButton' | 'FS_Welcome_Base_ExistingAppointmentsButton' |
	'FS_Confirmation_Base_DoneButton' | 'FS_AppointmentList_Error_GenericErrorRequest' | 'FS_AppointmentHome_Base_CancelAppointmentButton' | 'FS_AppointmentHome_Base_ModifyAppointmentButton' |
	'FS_AppointmentHome_Base_ErrorTitle' | 'FS_Scheduling_Base_TimePickerAssistiveText' | 'FS_ResourceDetail_Base_Header' | 'FS_AppointmentHome_Base_DefaultCardHeaderText' |
	'FS_Error_Dialog_Title' | 'FS_Error_Dialog_Body' | 'FS_Error_Dialog_Confirm_Button' | 'CM_Container_Header_Primary_Greeting' | 'CM_Container_Header_Secondary_Greeting' |
	'CM_Container_MenuItems_WebChatAvailable' | 'CM_Container_MenuItems_WebChatUnavailable' | 'CM_Container_MenuItems_WebChatLoading' | 'CM_Container_MenuItems_ChannelLabel' |
	'CM_Container_Button_AssistiveText' | 'CM_Container_MenuItems_AssistiveText' | 'CM_Container_MenuItems_WebLinkNewTabAssistiveText' | 'EM_Container_Base_DefaultHeaderText' |
	'EM_Container_Base_Minimize' | 'EM_Container_Base_Close' | 'EM_Container_Base_CloseConversation' | 'EM_Container_Base_DefaultMinimizedText' | 'EM_Container_Base_MinimizedButtonAssistiveText' |
	'EM_Container_Base_MinimizedNotifDismissButtonAssistiveText' | 'EM_Container_Base_HeaderGreetingAnnouncement' | 'EM_Container_Base_NinePlusUnseenMessageCount' |
	'EM_Container_Base_ZeroUnseenMessagesAssistiveText' | 'EM_Container_Base_UnseenMessagesAssistiveText' | 'EM_Container_Base_NinePlusUnseenMessagesAssistiveText' |
	'EM_Container_Base_InputFooterTextAreaPlaceHolder' | 'EM_Container_Base_PrechatFirstName' | 'EM_Container_Base_PrechatLastName' | 'EM_Container_Base_PrechatSubject' |
	'EM_Container_Base_PrechatEmail' | 'EM_Container_Base_BeforeUnloadWarningMessage' | 'EM_Container_Base_StartBookendText' | 'EM_Container_Base_EndBookendText' |
	'EM_Container_Base_ChatMessageMetadataAssistiveText' | 'EM_Container_Base_ParticipantJoinText' | 'EM_Container_Base_ParticipantLeaveText' | 'EM_Container_Base_InputFooterTextAreaAssistiveText' |
	'EM_Container_Base_InputFooterSendButtonAssistiveText' | 'EM_Container_Base_PrechatStateSubmitButton' | 'EM_Container_Base_InvalidEmailFormFieldError' |
	'EM_Container_Base_RequiredFormFieldError' | 'EM_Container_Base_NotificationDismissButtonText' | 'EM_Container_Base_ConversationEndedMinimizedText' |
	'EM_Container_Base_ExpiredJWT' | 'EM_Chat_FileTransfer_SelectNewFileText' | 'EM_PreChat_Base_PrechatCustomFieldLabel' | 'EM_Chat_FileTransfer_FileSendingText' |
	'EM_Chat_FileTransfer_DownloadFileButtonTitle' | 'EM_Chat_FileTransfer_SelectFileAttachmentButtonTitle' | 'EM_Chat_FileTransfer_CancelFileAttachmentButtonTitle' |
	'EM_Chat_FileTransfer_DownloadFileButtonAssistiveText' | 'EM_Chat_FileTransfer_SelectFileAttachmentButtonAssistiveText' | 'EM_Chat_FileTransfer_CancelFileAttachmentButtonAssistiveText' |
	'EM_Chat_ChatBody_Sent' | 'EM_Chat_ChatBody_Delivered' | 'EM_Chat_ChatBody_Read' | 'EM_Chat_ChoicesMessage_MenuAssistiveText' | 'EM_Chat_ChoicesSelectionResponse_PlaceholderText' |
	'EM_Chat_ChoicesMessage_ButtonsAssistiveText' | 'EM_Container_Base_HeaderAnnouncementTransferRequestSuccess' | 'EM_Container_Base_HeaderAnnouncementTransferRequestFailure' |
	'EM_Container_Base_SystemMessageTransferRequestSuccess' | 'EM_Container_Base_SystemMessageTransferRequestFailure' | 'EM_Container_Base_SystemMessageTransferRequestTryAgain' |
	'EM_Chat_ChatBody_AgentTypingIndicatorAssistiveText' | 'EM_Chat_ChatBody_ChatbotTypingIndicatorAssistiveText' | 'EM_Container_Base_InputFooterTextAreaPlaceholderOnlyParticipant' |
	'EM_Container_Base_AgentJoinAnnouncement' | 'EM_Container_Base_AgentLeaveAnnouncement' | 'EM_Container_Base_JWTExpiredAnnouncement' | 'EM_Container_Base_ParticipantJoinedText' |
	'EM_Container_Base_ParticipantLeftText' | 'EM_Container_Base_NewMessageText' | 'EM_Container_Base_MultipleNewMessagesText' | 'EM_Container_Base_JwtExpiredText' |
	'EM_Container_Base_TransferInitiatedText' | 'EM_Container_Base_TransferFailedText' | 'EM_Chat_ChatBody_NotSent' | 'EM_Chat_ChatBody_SpinnerDefaultAssistiveText' |
	'EM_Chat_ChatBody_FetchMoreEntriesSpinnerAssistiveText' | 'EM_Container_Base_MinimizeButtonAssistiveText' | 'EM_Container_Base_CloseButtonAssistiveText' |
	'EM_Container_Base_ConfirmationDialogMenuItemAssistiveText' | 'EM_Container_Base_MinimizedNotificationAssistiveText' | 'EM_Container_Base_MinimizedStateAssistiveText' |
	'EM_Chat_ChatBody_NotRoutedToAgentRoutingResult' | 'EM_Container_Base_TitleNotificationSenderDisplayName' | 'EM_Container_Base_MessagingIframeTitle' |
	'EM_Container_Base_FilePreviewIframeTitle' | 'EM_Container_Base_FilePreviewIframeCloseButtonTitle' | 'EM_Chat_ChatBody_MessageResendButtonText' |
	'EM_Chat_ChatBody_EstimatedWaitTimeInMinute' | 'EM_Chat_ChatBody_EstimatedWaitTimeInMinutes' | 'EM_Container_Base_InputFooterEmojiButtonAssistiveText' |
	'EM_Container_Base_InputFooterEmojiKeyboardAssistiveText' | 'EM_Container_Base_PostchatFrameTitle' | 'EM_Container_Base_PostchatHeaderText' | 'EM_Container_Base_PostchatHeaderBackButtonTitle' |
	'EM_Container_Base_PostchatHeaderBackButtonAssistiveText' | 'EM_Container_Base_PostchatConfirmationDialogTitleText' | 'EM_Container_Base_PostchatConfirmationDialogBodyText' |
	'EM_Container_Base_PostchatConfirmationDialogConfirmButton' | 'EM_Container_Base_PostchatConfirmationDialogCancelButton' | 'EM_Container_Base_JWTRetrievalFailureText';
export type EmbeddedServiceResourceType = 'SettingsFile' | 'ChatInvitation';
export type EmbeddedServiceFlowType = 'FL_Flow' | 'FS_NewAppointment' | 'FS_ModifyAppointment' | 'FS_CancelAppointment' | 'LA_Survey';
export type EmbeddedServiceLayoutType = 'FS_AppointmentHome';
export type EmbeddedServiceQuickActionType = 'Prechat' | 'OfflineCase';
export type EmbeddedServiceFontSize = 'Small' | 'Medium' | 'Large';
export type EmbeddedServiceScenario = 'Sales' | 'Service' | 'Basic';
export type EmbeddedServiceChannelType = 'EmbeddedServiceConfig' | 'MessagingChannel' | 'Phone' | 'CustomURL';
export type MilestoneTimeUnits = 'Minutes' | 'Hours' | 'Days';
export type EventRelayAdminState = 'RUN' | 'STOP' | 'PAUSE';
export type ActionLogSchemaType = 'Other' | 'ExpressionSet';
export type EASAppType = 'PublicSector' | 'Loyalty' | 'HealthCloud' | 'IndustryServiceExcellence';
export type AuthenticationProtocol = 'NoAuthentication' | 'Oauth' | 'Password' | 'AwsSv4' | 'Jwt' | 'JwtExchange' | 'Custom';
export type ExternalCredentialParamType = 'AuthProvider' | 'AuthProviderUrl' | 'AuthProviderUrlQueryParameter' | 'SigningCertificate' | 'AuthParameter' | 'NamedPrincipal' | 'PerUserPrincipal' |
	'AwsStsPrincipal' | 'AuthHeader' | 'AuthProtocolVariant' | 'JwtBodyClaim' | 'JwtHeaderClaim';
export type ExternalDataSrcDescSubtype = 'SchemaTableQualifiers' | 'SchemaTableMetadata' | 'SchemaTableDDL';
export type ExternalDataSrcDescType = 'Schema';
export type ExternalPrincipalType = 'Anonymous' | 'PerUser' | 'NamedUser';
export type ExternalDataSourceType = 'contentHubItem' | 'Datajourney' | 'Identity' | 'OpenSearch' | 'outgoingemail' | 'QLIAttribute' | 'SciApi' | 'SelectableEmailAddressView' | 'SimpleURL' |
	'usermobileconfig' | 'usrconnectionstatus' | 'vlocity_cmt.IntegrationProcedureDataSourceProvider' | 'Wrapper';
export type ExternalServiceRegistrationProviderType = 'MuleSoft' | 'Custom' | 'SchemaInferred';
export type ClassificationType = 'ComplianceCategory' | 'FieldSet';
export type EnforcementType = 'Scoping' | 'Restrict' | 'FieldRestrict' | 'D360_Restrict';
export type ApptAssistantRadiusUnit = 'Kilometer' | 'Meter' | 'Mile' | 'Yard';
export type WorkOrderDurationSource = 'WorkType' | 'TotalFromWorkPlan' | 'Custom';
export type FileDownloadBehavior = 'DOWNLOAD' | 'EXECUTE_IN_BROWSER' | 'HYBRID';
export type FileType = 'UNKNOWN' | 'PDF' | 'POWER_POINT' | 'POWER_POINT_X' | 'POWER_POINT_M' | 'POWER_POINT_T' | 'WORD' | 'WORD_X' | 'WORD_M' | 'WORD_T' | 'PPS' | 'PPSX' |
	'EXCEL' | 'EXCEL_X' | 'EXCEL_M' | 'EXCEL_T' | 'GOOGLE_DOCUMENT' | 'GOOGLE_PRESENTATION' | 'GOOGLE_SPREADSHEET' | 'GOOGLE_DRAWING' | 'GOOGLE_FORM' |
	'GOOGLE_SCRIPT' | 'LINK' | 'SLIDE' | 'AAC' | 'ACGI' | 'AI' | 'AVI' | 'BMP' | 'BOXNOTE' | 'CSV' | 'EPS' | 'EXE' | 'FLASH' | 'GIF' | 'GZIP' | 'HTM' |
	'HTML' | 'HTX' | 'JPEG' | 'JPE' | 'PJP' | 'PJPEG' | 'JFIF' | 'JPG' | 'JS' | 'JSON' | 'MHTM' | 'MHTML' | 'MP3' | 'M4A' | 'M4V' | 'MP4' | 'MPEG' |
	'MPG' | 'MOV' | 'MSG' | 'ODP' | 'ODS' | 'ODT' | 'OGV' | 'PNG' | 'PSD' | 'RTF' | 'QUIPDOC' | 'QUIPSHEET' | 'QUIPCHAT' | 'QUIPSLIDES' | 'QUIPTEMPLATE' |
	'SHTM' | 'SHTML' | 'SNOTE' | 'MCONTENT' | 'STYPI' | 'SVG' | 'SVGZ' | 'JPGZ' | 'TEXT' | 'THTML' | 'USDZ' | 'VISIO' | 'VTT' | 'WMV' | 'WRF' | 'XML' |
	'ZIP' | 'XZIP' | 'WMA' | 'XSN' | 'INSIGHT' | 'TRTF' | 'TXML' | 'WEBVIEW' | 'RFC822' | 'ASF' | 'DWG' | 'JAR' | 'XJS' | 'OPX' | 'XPSD' | 'TIF' | 'TIFF' |
	'WAV' | 'CSS' | 'THUMB720BY480' | 'THUMB240BY180' | 'THUMB120BY90' | 'ALLTHUMBS' | 'PAGED_FLASH' | 'XMOB' | 'PACK' | 'C' | 'CPP' | 'WORDT' | 'INI' |
	'JAVA' | 'LOG' | 'POWER_POINTT' | 'SQL' | 'XHTML' | 'EXCELT';
export type FlexipageEventSourceTypeEnum = 'Component';
export type FlexipageEventTargetTypeEnum = 'FlexipageServices' | 'LwcServices' | 'InvocableApexServices' | 'InvocableExternalServices' | 'ActionServices' | 'ViewServices';
export type RegionFlagStatus = 'disabled' | 'enabled';
export type ComponentInstancePropertyKeyEnum = 'decorator';
export type ComponentInstanceType = 'Component' | 'Card';
export type FlexiPageRegionMode = 'Append' | 'Prepend' | 'Replace';
export type FlexiPageRegionType = 'Region' | 'Facet' | 'Background';
export type PlatformActionListContext = 'ListView' | 'RelatedList' | 'ListViewRecord' | 'RelatedListRecord' | 'Record' | 'FeedElement' | 'Chatter' | 'Global' | 'Flexipage' | 'MruList' |
	'MruRow' | 'RecordEdit' | 'Photo' | 'BannerPhoto' | 'ObjectHomeChart' | 'ListViewDefinition' | 'Dockable' | 'Lookup' | 'Assistant';
export type PlatformActionType = 'QuickAction' | 'StandardButton' | 'CustomButton' | 'ProductivityAction' | 'ActionLink' | 'InvocableAction';
export type FlexiPageType = 'AppPage' | 'ObjectPage' | 'RecordPage' | 'HomePage' | 'ForecastingPage' | 'MailAppAppPage' | 'CommAppPage' | 'CommForgotPasswordPage' | 'CommLoginPage' |
	'CommObjectPage' | 'CommQuickActionCreatePage' | 'CommRecordPage' | 'CommRelatedListPage' | 'CommSearchResultPage' | 'CommGlobalSearchResultPage' |
	'CommSelfRegisterPage' | 'CommThemeLayoutPage' | 'UtilityBar' | 'RecordPreview' | 'EmbeddedServicePage' | 'CommCheckoutPage' | 'CommOrderConfirmationPage' |
	'CommFlowPage' | 'EmailTemplatePage' | 'ApplicationLayout' | 'CommNoSearchResultsPage' | 'CommElectronicSignaturePage' | 'CommContractDocumentsPage' |
	'EmailContentPage' | 'ServiceDocument' | 'LandingPage' | 'CdpRecordPage' | 'SlackAppHome' | 'SlackMessage' | 'SlackModal' | 'SlackNotification' |
	'EasyHomePage' | 'CardPage' | 'VoiceExtension';
export type FlowAssignmentOperator = 'Assign' | 'Add' | 'Subtract' | 'AddItem' | 'RemoveFirst' | 'RemoveBeforeFirst' | 'RemoveAfterFirst' | 'RemoveAll' | 'AddAtStart' | 'RemoveUncommon' |
	'AssignCount' | 'RemovePosition';
export type FlowComparisonOperator = 'EqualTo' | 'NotEqualTo' | 'GreaterThan' | 'LessThan' | 'GreaterThanOrEqualTo' | 'LessThanOrEqualTo' | 'StartsWith' | 'EndsWith' | 'Contains' |
	'IsNull' | 'IsChanged' | 'WasSet' | 'WasSelected' | 'WasVisited' | 'In' | 'NotIn';
export type FlowRecordFilterOperator = 'EqualTo' | 'NotEqualTo' | 'GreaterThan' | 'LessThan' | 'GreaterThanOrEqualTo' | 'LessThanOrEqualTo' | 'StartsWith' | 'EndsWith' | 'Contains' |
	'IsNull' | 'IsChanged' | 'In' | 'NotIn';
export type FlowStageStepAssigneeType = 'User' | 'Group' | 'Queue';
export type FlowTransformValueActionType = 'Map';
export type FlowDataType = 'Currency' | 'Date' | 'Number' | 'String' | 'Boolean' | 'SObject' | 'DateTime' | 'Picklist' | 'Multipicklist' | 'Apex';
export type FlowScheduledPathOffsetUnit = 'Hours' | 'Days' | 'Minutes' | 'Months' | 'Weeks';
export type FlowScheduledPathType = 'AsyncAfterCommit';
export type FlowScheduledPathTimeSource = 'RecordTriggerEvent' | 'RecordField';
export type FlowScreenFieldType = 'DisplayText' | 'InputField' | 'LargeTextArea' | 'PasswordField' | 'RadioButtons' | 'DropdownBox' | 'MultiSelectCheckboxes' | 'MultiSelectPicklist' |
	'ComponentInstance' | 'ComponentInput' | 'ComponentChoice' | 'ComponentMultiChoice' | 'ComponentDisplay' | 'RegionContainer' | 'Region' | 'ObjectProvided';
export type FlowScreenFieldInputsRevisited = 'UseStoredValues' | 'ResetValues';
export type FlowRegionContainerType = 'SectionWithHeader' | 'SectionWithoutHeader';
export type InvocableActionType = 'apex' | 'chatterPost' | 'contentWorkspaceEnableFolders' | 'emailAlert' | 'emailSimple' | 'externalService' | 'flow' | 'metricRefresh' | 'quickAction' |
	'submit' | 'thanks' | 'thunderResponse' | 'createServiceReport' | 'deployOrchestration' | 'createResponseEventAction' | 'sfdcOutputAction' | 'invokeOrchOutputFlow' |
	'generateWorkOrders' | 'deactivateSessionPermSet' | 'activateSessionPermSet' | 'aggregateValue' | 'orchestrationTimer' | 'orchestrationDebugLog' |
	'choosePricebook' | 'component' | 'liveMessageNotification' | 'scaleCacheAsyncRefresh' | 'skillsBasedRouting' | 'addSkillRequirements' | 'addScreenPop' |
	'findMatchingIndividuals' | 'routeWork' | 'scvOutboundCall' | 'checkAvailabilityForRouting' | 'createCustomField' | 'assignTrailheadBadge' | 'insightFeedback' |
	'publishKnowledgeArticles' | 'routingAddressVerification' | 'assignTargetToSalesCadence' | 'removeTargetFromSalesCadence' | 'modifyCadenceTrackerAttributes' |
	'invocableApplyLeadAssignmentRules' | 'pauseSalesCadenceTracker' | 'resumeSalesCadenceTracker' | 'changeSalesCadenceTargetAssignee' | 'sendSalesCadenceEvent' |
	'selectTemplateForSalesCadenceStepTracker' | 'assignKnowledgeArticles' | 'createDraftFromOnlineKnowledgeArticle' | 'archiveKnowledgeArticles' |
	'restoreKnowledgeArticleVersion' | 'customNotificationAction' | 'submitDigitalFormResponse' | 'contactRequestAction' | 'saveAppointment' | 'saveAppointmentInvitationDetails' |
	'deleteKnowledgeArticles' | 'submitKnowledgeArticleForTranslation' | 'einsteinEPLitePredictionAction' | 'cartToOrderAction' | 'orderToCartAction' |
	'activateOrderAction' | 'refreshActualsCalculation' | 'cancelAppointment' | 'recalculateForecast' | 'getBenefitAndCalculateRebateAmount' | 'upsertCustomRebatePayout' |
	'calculateRebateAmountAndUpsertPayout' | 'processRebatesBatchCalculationJob' | 'generateRebatePayoutPeriods' | 'calculateAdvancedAccountForecast' |
	'processAccountForecasts' | 'managedContentReleasePublish' | 'editQuipDocument' | 'attachQuipDocumentToRecord' | 'createQuipDocument' | 'createQuipFolder' |
	'addUsersToQuipDocument' | 'removeUsersFromQuipDocument' | 'copyQuipDocument' | 'addMessageToQuipDocument' | 'addQuipDocumentToFolder' | 'removeQuipDocumentFromFolder' |
	'createQuipChat' | 'addMessageToQuipChat' | 'addUsersToQuipChat' | 'removeUsersFromQuipChat' | 'copyQuipContent' | 'lockQuipDocument' | 'lockQuipSection' |
	'quipLivePaste' | 'exportQuipDocumentToPdf' | 'priceCart' | 'cartInitiateAsyncStep' | 'cartCompleteAsyncStep' | 'cancelCartAsyncOperation' | 'createCart' |
	'addCartItem' | 'deleteCart' | 'cancelFulfillmentOrderItem' | 'createFulfillmentOrder' | 'createInvoiceFromFulfillmentOrder' | 'createFulfillmentOrders' |
	'createOrderPaymentSummary' | 'cancelOrderItemSummariesPreview' | 'cancelOrderItemSummariesSubmit' | 'createCreditMemoOrderSummary' | 'ensureFundsOrderSummaryAsync' |
	'ensureRefundsOrderSummaryAsync' | 'returnOrderItemSummariesPreview' | 'returnOrderItemSummariesSubmit' | 'createReturnOrder' | 'createOrderSummary' |
	'adjustOrderItemSummariesPreview' | 'adjustOrderItemSummariesSubmit' | 'addOrderItemSummarySubmit' | 'createOrderFromQuote' | 'createOrUpdateAssetFromOrder' |
	'createBillingScheduleFromOrderItem' | 'changeFinancePeriodStatus' | 'applyPayment' | 'paymentSale' | 'automateRefund' | 'createInvoiceFromOrder' |
	'ociTransferReservation' | 'ociReleaseReservation' | 'ociGetAvailability' | 'ociFulfillReservation' | 'ociCreateReservation' | 'orderRoutingRankByAverageDistance' |
	'orderRoutingFindRoutesWithFewestSplits' | 'orderRoutingFindRoutesWithFewestSplitsUsingOCI' | 'holdFulfillmentOrderCapacity' | 'releaseHeldFulfillmentOrderCapacity' |
	'confirmHeldFulfillmentOrderCapacity' | 'getFulfillmentOrderCapacityValues' | 'print' | 'exportSurveyResponses' | 'checkoutSessionAction' | 'checkCartInventoryAction' |
	'calcCartTaxesAction' | 'calcCartShipmentAction' | 'calcCartPromotionsAction' | 'sendSurveyInvitation' | 'publishPardotContent' | 'storeReplyRecommendationsFeedback' |
	'marketingEmail' | 'updateCheckoutSessionStateAction' | 'massUpdateAccountForecast' | 'massUpdateSalesAgreement' | 'decisionTableAction' | 'runDecisionMatrix' |
	'createFinancialRecords' | 'addWorkPlans' | 'addWorkSteps' | 'generateWorkPlans' | 'deleteWorkPlans' | 'pardotGetListx' | 'pardotAddToListMembership' |
	'getTier' | 'changeTier' | 'changeAllTierOrNone' | 'getPointsBalance' | 'updateAcctMgrTarget' | 'creditPoints' | 'debitPoints' | 'batchJobAction' |
	'dataProcessingEngineAction' | 'adjustPointsAction' | 'cancelRedemption' | 'cancelAccrual' | 'addRebateMemberList' | 'saveRecommendationDecision' |
	'outboundMessage' | 'internalTestAction' | 'internalTestConnectApiAction' | 'getDialerSoftphonePathSuffix' | 'performMultiLevelRollups' | 'rebatesProcessCSV' |
	'processMemberBenefitAction' | 'assignMemberTierBenefits' | 'dynamicSendSurveyInvitation' | 'getIntelligentAccountSettingsToken' | 'issueVoucher' |
	'setCheckoutDeliveryMethod' | 'refreshDecisionTable' | 'evaluationFlow' | 'stepInteractive' | 'stepBackground' | 'managedContentRoleStepInteractive' |
	'generateKnowledgeLogData' | 'submitFailedRecordsBatchJob' | 'getEligibleProgramRebateTypes' | 'returnReturnOrderItems' | 'slackPostMessage' | 'slackUpdateMessage' |
	'slackPinMessage' | 'slackCreateChannel' | 'slackInviteUsersToChannel' | 'slackCheckUsersAreConnectedToSlack' | 'slackArchiveChannel' | 'slackGetConversationInfo' |
	'getLoyaltyPromotionBasedOnSalesforceCDP' | 'transferMemberPointsToGroups' | 'getLoyaltyPromotion' | 'createServiceDocument' | 'createArticleRecommendations' |
	'discoveryPredict' | 'processProgramRebateTypeProducts' | 'fetchCaseClassificationRecommendations' | 'applyCaseClassificationRecommendations' |
	'updateProgressForCumulativePromotionUsage' | 'updateAdvancedAccountForecastSetPartner' | 'swarmingCollaborationToolSettings' | 'getArticleSmartLinkUrl' |
	'performSurveySentimentAnalysis' | 'pardotSlackCompletionActionNotification' | 'calculateProjectedRebateAmount' | 'runProgramProcessForTransactionJournal' |
	'goalAchievedAction' | 'buildIdentityVerification' | 'getVerificationData' | 'createEinsteinDocReaderLogic' | 'sendNotification' | 'uploadBlockchainData' |
	'saveMemberVerificationSteps' | 'limitRepetitions' | 'slackSendMessageToLaunchFlow' | 'manageRecurringSchedules' | 'importRecordsFromCsvFile' |
	'authorizePayment' | 'getMemberActiveSegments' | 'managedContentVariantSetReadyStatus' | 'getAvailableSwarmObject' | 'runExpressionSet' | 'mergeLoyaltyProgramMembership' |
	'unmergeLoyaltyProgramMembership' | 'managedContentVariantSetLockStatus' | 'massUpdateAdvAccountForecast' | 'runProgramProcess' | 'getAssessmentResponseSummary' |
	'industriesSendApexAsyncRequest' | 'slackJoinChannel' | 'createInvoiceFromChangeOrders' | 'generateInboxSchedulingLink' | 'sendMessage' | 'goToCadenceStep' |
	'createBenefitDisbursement' | 'createCareProgramEnrolleeWorkOrderStep' | 'generateTransactionJournals' | 'cdpRefreshDataStream' | 'generateMemberReferralCode' |
	'cdpPublishSegment' | 'industriesSendExtAsyncRequest' | 'getDataCategoryDetails' | 'getDataCategoryGroups' | 'searchKnowledgeArticles' | 'cdpPublishCalculatedInsight';
export type FlowElementSubtype = 'SortCollectionProcessor' | 'RecommendationMapCollectionProcessor' | 'FilterCollectionProcessor' | 'DateWait' | 'AttributeWait' | 'DurationWait' |
	'InteractiveStep' | 'BackgroundStep' | 'ManagedContentRoleInteractiveStep';
export type FlowCollectionProcessorType = 'SortCollectionProcessor' | 'RecommendationMapCollectionProcessor' | 'FilterCollectionProcessor';
export type IterationOrder = 'Asc' | 'Desc';
export type RecordTriggerType = 'Update' | 'Create' | 'CreateAndUpdate' | 'Delete' | 'None';
export type FlowStartFrequency = 'OnActivate' | 'Once' | 'Daily' | 'Weekly';
export type FlowTriggerType = 'None' | 'Scheduled' | 'RecordBeforeSave' | 'RecordBeforeDelete' | 'RecordAfterSave' | 'PlatformEvent' | 'EventDrivenJourney' | 'Segment';
export type FlowTransactionModel = 'Automatic' | 'NewTransaction' | 'CurrentTransaction';
export type FlowEnvironment = 'Default' | 'Slack';
export type FlowRunInMode = 'DefaultMode' | 'SystemModeWithSharing' | 'SystemModeWithoutSharing';
export type FlowVersionStatus = 'Active' | 'Draft' | 'Obsolete' | 'InvalidDraft';
export type FlowTestParameterType = 'InputTriggeringRecordInitial' | 'InputTriggeringRecordUpdated' | 'ScheduledPath';
export type FolderAccessTypes = 'Shared' | 'Public' | 'Hidden' | 'PublicInternal';
export type FolderShareAccessLevel = 'View' | 'EditAllContents' | 'Manage';
export type FolderSharedToType = 'Group' | 'Role' | 'RoleAndSubordinates' | 'RoleAndSubordinatesInternal' | 'Manager' | 'ManagerAndSubordinatesInternal' | 'Organization' | 'Territory' |
	'TerritoryAndSubordinates' | 'AllPrmUsers' | 'User' | 'PartnerUser' | 'AllCspUsers' | 'CustomerPortalUser' | 'PortalRole' | 'PortalRoleAndSubordinates' |
	'ChannelProgramGroup';
export type PublicFolderAccess = 'ReadOnly' | 'ReadWrite';
export type ForecastingDateType = 'OpportunityCloseDate' | 'ProductDate' | 'ScheduleDate' | 'OLIMeasureCloseDateOnly' | 'ProductDateOnly' | 'ScheduleDateOnly' | 'OpportunityCustomDate' |
	'OLIMeasureOppCustomDateOnly';
export type PeriodTypes = 'Month' | 'Quarter' | 'Week' | 'Year';
export type PageComponentType = 'links' | 'htmlArea' | 'imageOrNote' | 'visualforcePage';
export type PageComponentWidth = 'narrow' | 'wide';
export type IPAddressFeature = 'EmailIpFiltering';
export type IPAddressUsageScope = 'Exclusion' | 'Inclusion';
export type IdentityVerificationDataSourceType = 'Salesforce' | 'External';
export type IdentityVerificationProcFldDataSourceType = 'Salesforce' | 'External';
export type IdentityVerificationProcFldFieldDataType = 'address' | 'checkbox' | 'currency' | 'dateonly' | 'datetime' | 'email' | 'number' | 'percent' | 'phone' | 'picklist' | 'reference' | 'text' | 'timeonly' |
	'url' | 'other';
export type IdentityVerificationProcFldFieldType = 'requiredVerifier' | 'optionalVerifier' | 'searchField' | 'resultField' | 'additionalResultField' | 'searchFilter';
export type IdentityVerificationSearchType = 'Text-Based' | 'Object-Based';
export type IdentityVerificationSearchLayoutType = 'Tab' | 'Stack';
export type IFrameWhitelistContext = 'VisualforcePages' | 'Surveys' | 'EmbeddedService';
export type ExternalConnectionType = 'AwsPrivateLink';
export type InboundConnPropertyName = 'Region' | 'AwsVpcEndpointId' | 'SourceIpRanges';
export type ExternalConnectionStatus = 'Unprovisioned' | 'Allocating' | 'PendingAcceptance' | 'PendingActivation' | 'RejectedRemotely' | 'DeletedRemotely' | 'TeardownInProgress' | 'Ready';
export type KnowledgeCaseEditor = 'simple' | 'standard';
export type KnowledgeLanguageLookupValueType = 'User' | 'Queue';
export type FeedLayoutFilterPosition = 'CenterDropDown' | 'LeftFixed' | 'LeftFloat';
export type FeedLayoutFilterType = 'AllUpdates' | 'FeedItemType' | 'Custom';
export type FeedLayoutComponentType = 'HelpAndToolLinks' | 'CustomButtons' | 'Following' | 'Followers' | 'CustomLinks' | 'Milestones' | 'Topics' | 'CaseUnifiedFiles' | 'Visualforce';
export type LayoutHeader = 'PersonalTagging' | 'PublicTagging';
export type UiBehavior = 'Edit' | 'Required' | 'Readonly';
export type ReportChartComponentSize = 'SMALL' | 'MEDIUM' | 'LARGE';
export type LayoutSectionStyle = 'TwoColumnsTopToBottom' | 'TwoColumnsLeftToRight' | 'OneColumn' | 'CustomLinks';
export type SummaryLayoutStyle = 'Default' | 'QuoteTemplate' | 'DefaultQuoteTemplate' | 'ServiceReportTemplate' | 'ChildServiceReportTemplateStyle' | 'DefaultServiceReportTemplate' |
	'CaseInteraction' | 'QuickActionLayoutLeftRight' | 'QuickActionLayoutTopDown' | 'PathAssistant';
export type VisibleOrRequired = 'VisibleOptional' | 'VisibleRequired' | 'NotVisible';
export type LetterheadHorizontalAlignment = 'None' | 'Left' | 'Center' | 'Right';
export type LetterheadVerticalAlignment = 'None' | 'Top' | 'Middle' | 'Bottom';
export type LightningBoltCategory = 'Communications' | 'Education' | 'FinancialServices' | 'Government' | 'HealthcareLifeSciences' | 'Manufacturing' | 'Media' | 'Nonprofits' | 'ProfessionalServices' |
	'RealEstate' | 'Retail' | 'TravelTransportationHospitality' | 'HighTech' | 'GeneralBusiness';
export type SupervisorAgentStatusFilter = 'Online' | 'Away' | 'Offline';
export type LiveChatButtonPresentation = 'Slide' | 'Fade' | 'Appear' | 'Custom';
export type LiveChatButtonInviteEndPosition = 'TopLeft' | 'Top' | 'TopRight' | 'Left' | 'Center' | 'Right' | 'BottomLeft' | 'Bottom' | 'BottomRight';
export type LiveChatButtonInviteStartPosition = 'TopLeft' | 'TopLeftTop' | 'Top' | 'TopRightTop' | 'TopRight' | 'TopRightRight' | 'Right' | 'BottomRightRight' | 'BottomRight' | 'BottomRightBottom' |
	'Bottom' | 'BottomLeftBottom' | 'BottomLeft' | 'BottomLeftLeft' | 'Left' | 'TopLeftLeft';
export type LiveChatButtonRoutingType = 'Choice' | 'LeastActive' | 'MostAvailable';
export type LiveChatButtonType = 'Standard' | 'Invite';
export type SensitiveDataActionType = 'Remove' | 'Replace';
export type MLRelationType = 'Inner' | 'Leftouter' | 'Leftinner' | 'Full';
export type MLFieldType = 'Prediction' | 'Pushback' | 'Included' | 'Excluded' | 'Join' | 'Related' | 'Expression' | 'SegmentExpression' | 'TrainingExpression' | 'ScoringExpression' |
	'PositiveExpression' | 'NegativeExpression' | 'SourceDate';
export type AIValueType = 'Number' | 'String' | 'Boolean' | 'Date' | 'DateTime' | 'Supplier' | 'Currency' | 'Varchar' | 'Comparison';
export type AIFilterUnit = 'Milliseconds' | 'Seconds' | 'Minutes' | 'Hours' | 'Days' | 'Weeks' | 'Months' | 'Years';
export type AIFilterOperation = 'And' | 'Or' | 'Not' | 'LessThan' | 'LessThanOrEqual' | 'GreaterThan' | 'GreaterThanOrEqual' | 'Equals' | 'NotEquals' | 'Add' | 'Subtract' | 'Multiply' |
	'Divide' | 'IsNull' | 'IsNotNull' | 'StartsWith' | 'EndsWith' | 'Contains' | 'Concat' | 'DoesNotContain' | 'Between' | 'In';
export type MLDataDefinitionType = 'Recipient' | 'Candidate' | 'Interaction' | 'Prediction';
export type MLPredictionDefinitionStatus = 'Enabled' | 'Disabled' | 'Draft';
export type AIPredictionType = 'ScoringSpecificOutcome' | 'BinaryClassification' | 'MulticlassClassification' | 'Regression' | 'LanguageDetection' | 'DeepLearningIntentClassification' |
	'DeepLearningNameEntityRecognition' | 'GlobalDeepLearningIntentClassification' | 'GlobalDeepLearningNameEntityRecognition';
export type MLRecommendationDefinitionStatus = 'Enabled' | 'Disabled' | 'Draft';
export type MCNodeType = 'TEXT' | 'MTEXT' | 'RTE' | 'IMG' | 'NAMEFIELD' | 'URL' | 'DATETIME' | 'DATE';
export type BlankValueBehavior = 'MatchBlanks' | 'NullNotAllowed';
export type MatchingMethod = 'Exact' | 'FirstName' | 'LastName' | 'CompanyName' | 'Phone' | 'City' | 'Street' | 'Zip' | 'Title';
export type MatchingRuleStatus = 'Inactive' | 'DeactivationFailed' | 'Activating' | 'Deactivating' | 'Active' | 'ActivationFailed';
export type MessagingAutoResponseType = 'InitialResponse' | 'AgentEngagedResponse' | 'AgentEndEngagementResponse';
export type MessagingChannelType = 'EmbeddedMessaging';
export type MessagingSessionHandlerType = 'Queue' | 'Flow';
export type MessagingChannelStandardParameterType = 'FirstName' | 'LastName' | 'Email' | 'Subject';
export type MilestoneTypeRecurrenceType = 'none' | 'recursIndependently' | 'recursChained';
export type ModerationRuleAction = 'Block' | 'FreezeAndNotify' | 'Review' | 'Replace' | 'Flag';
export type RateLimitTimePeriod = 'Short' | 'Medium';
export type ModerationRuleType = 'Content' | 'Rate';
export type OrgDomainShard = 'none' | 'sandbox' | 'develop' | 'patch' | 'trailblaze' | 'scratch' | 'demo' | 'free' | 'sfdctest';
export type OrgDomainProdSuffix = 'MySalesforceLimited' | 'DatabaseLimited' | 'CloudforceLimited' | 'OrgLevelCertificateLimited' | 'Restricted1' | 'MySalesforce' | 'Restricted2';
export type NamedCredentialParamType = 'Url' | 'HttpHeader' | 'ClientCertificate' | 'Authentication' | 'OutboundNetworkConnection' | 'AllowedManagedPackageNamespaces';
export type NamedCredentialType = 'Legacy' | 'SecuredEndpoint' | 'PrivateEndpoint';
export type NetworkPageOverrideSetting = 'Designer' | 'VisualForce' | 'Standard' | 'Configurable';
export type AudienceCriteriaType = 'CustomList' | 'MaxDaysInCommunity';
export type RecommendationChannel = 'DefaultChannel' | 'CustomChannel1' | 'CustomChannel2' | 'CustomChannel3' | 'CustomChannel4' | 'CustomChannel5';
export type SitesArchiveStatus = 'TemporarilyArchived' | 'NotArchived';
export type NetworkStatus = 'UnderConstruction' | 'Live' | 'DownForMaintenance';
export type OmniDataTransformInputType = 'JSON' | 'XML' | 'SObject' | 'Custom';
export type ODTItemFilterDataType = 'ADDRESS' | 'ANYTYPE' | 'BASE64' | 'BOOLEAN' | 'COMBOBOX' | 'CURRENCY' | 'DATACATEGORY' | 'GROUPREFERENCE' | 'DATE' | 'DATETIME' | 'DOUBLE' | 'EMAIL' |
	'ENCRYPTEDSTRING' | 'ID' | 'INTEGER' | 'LONG' | 'MULTIPICKLIST' | 'PERCENT' | 'PHONE' | 'PICKLIST' | 'REFERENCE' | 'STRING' | 'TEXTAREA' | 'TIME' |
	'URL';
export type OmniProcessType = 'OmniScript';
export type OmniSupervisorActionName = 'ChangeQueues' | 'ChangeSkills' | 'AssignLearning' | 'AWSDashboard' | 'ManageQueues' | 'CustomAction';
export type OmniSupervisorActionTab = 'AllAgents' | 'AgentDetails' | 'QueuesBacklog' | 'QueueDetails' | 'AssignedWork' | 'AssignedWorkDetails' | 'SkillsBacklog' | 'SkillDetails';
export type OmniSuperSkillVisibilityType = 'AllSkills' | 'AnySkill';
export type OmniUiCardType = 'Parent' | 'Child';
export type OutboundConnPropertyName = 'Region' | 'AwsVpcEndpointId' | 'AwsVpcEndpointServiceName';
export type APIAccessLevel = 'Unrestricted' | 'Restricted';
export type ParticipantRoleAccessLevel = 'None' | 'Read' | 'Edit';
export type IdempotencySupportStatus = 'No' | 'Yes';
export type PermissionSetTabVisibility = 'None' | 'Available' | 'Visible';
export type LicenseExpirationPolicy = 'AllowNamespaceAccess' | 'BlockNamespaceAccess';
export type PlatformCacheType = 'Session' | 'Organization';
export type PlatformEventChannelType = 'event' | 'data';
export type PortalRoles = 'Executive' | 'Manager' | 'Worker' | 'PersonAccount';
export type PortalType = 'CustomerSuccess' | 'Partner' | 'Network';
export type CategoryGroupVisibility = 'ALL' | 'NONE' | 'CUSTOM';
export type LoginFlowType = 'UI';
export type UiLoginFlowType = 'VisualWorkflow' | 'VisualForce';
export type TabVisibility = 'Hidden' | 'DefaultOff' | 'DefaultOn';
export type SessionSecurityLevel = 'LOW' | 'STANDARD' | 'HIGH_ASSURANCE';
export type PromptDisplayPosition = 'TopLeft' | 'TopCenter' | 'TopRight' | 'BottomLeft' | 'BottomCenter' | 'BottomRight' | 'MiddleLeft' | 'MiddleCenter' | 'MiddleRight';
export type PromptDisplayType = 'DockedComposer' | 'FloatingPanel' | 'Targeted';
export type PromptElementRelativePosition = 'TopLeft' | 'TopCenter' | 'TopRight' | 'LeftTop' | 'LeftCenter' | 'LeftBottom' | 'RightTop' | 'RightCenter' | 'RightBottom' | 'BottomLeft' | 'BottomCenter' |
	'BottomRight';
export type PromptImageLocation = 'Top' | 'Bottom' | 'Left' | 'Right';
export type PromptThemeColor = 'Theme1' | 'Theme2' | 'Theme3' | 'Theme4';
export type PromptThemeSaturation = 'Dark' | 'Light';
export type PromptUserAccess = 'Everyone' | 'SpecificPermissions';
export type PromptUserProfileAccess = 'Everyone' | 'SpecificProfiles';
export type RoutingModel = 'LEAST_ACTIVE' | 'MOST_AVAILABLE' | 'EXTERNAL_ROUTING';
export type ActionSubtype = 'ScreenAction' | 'Action';
export type QuickActionLabel = 'LogACall' | 'LogANote' | 'New' | 'NewRecordType' | 'Update' | 'NewChild' | 'NewChildRecordType' | 'CreateNew' | 'CreateNewRecordType' | 'SendEmail' |
	'QuickRecordType' | 'Quick' | 'EditDescription' | 'Defer' | 'ChangeDueDate' | 'ChangePriority' | 'ChangeStatus' | 'SocialPost' | 'Escalate' | 'EscalateToRecord' |
	'OfferFeedback' | 'RequestFeedback' | 'AddRecord' | 'AddMember' | 'Reply' | 'ReplyAll' | 'Forward' | 'ScheduleAppointment' | 'EnrollInProgram' |
	'ModifyAppointment' | 'Quip';
export type QuickActionType = 'Create' | 'VisualforcePage' | 'Post' | 'SendEmail' | 'LogACall' | 'SocialPost' | 'Canvas' | 'Update' | 'LightningComponent' | 'LightningWebComponent' |
	'Flow' | 'MobileExtension' | 'Quip';
export type StrategyReactionType = 'Accepted' | 'Rejected';
export type RecommendationConditionOperator = 'EQUALS' | 'GREATER_THAN' | 'GREATER_THAN_OR_EQUAL_TO' | 'LESS_THAN' | 'LESS_THAN_OR_EQUAL_TO' | 'NOT_EQUALS' | 'LIKE' | 'STARTS_WITH' | 'ENDS_WITH' |
	'CONTAINS';
export type RecommendationConditionValueType = 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'DATE_TIME' | 'TIME';
export type ChannelSource = 'Other' | 'Phone' | 'Chat';
export type PinnedAction = 'None' | 'Top' | 'Bottom';
export type RecordActionType = 'Flow' | 'QuickAction' | 'Omniscript';
export type ComponentName = 'ActionsAndRecommendations' | 'ActionLauncher';
export type ReportAggregateDatatype = 'currency' | 'percent' | 'number';
export type ReportBucketFieldType = 'text' | 'number' | 'picklist';
export type ReportFormulaNullTreatment = 'n' | 'z';
export type ChartType = 'None' | 'Scatter' | 'ScatterGrouped' | 'Bubble' | 'BubbleGrouped' | 'HorizontalBar' | 'HorizontalBarGrouped' | 'HorizontalBarStacked' | 'HorizontalBarStackedTo100' |
	'VerticalColumn' | 'VerticalColumnGrouped' | 'VerticalColumnStacked' | 'VerticalColumnStackedTo100' | 'Line' | 'LineGrouped' | 'LineCumulative' |
	'LineCumulativeGrouped' | 'Pie' | 'Donut' | 'Funnel' | 'VerticalColumnLine' | 'VerticalColumnGroupedLine' | 'VerticalColumnStackedLine' | 'Plugin';
export type ChartPosition = 'CHART_TOP' | 'CHART_BOTTOM';
export type ReportChartSize = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge';
export type ObjectFilterOperator = 'with' | 'without';
export type CurrencyIsoCode = 'ADP' | 'AED' | 'AFA' | 'AFN' | 'ALL' | 'AMD' | 'ANG' | 'AOA' | 'ARS' | 'ATS' | 'AUD' | 'XAV' | 'AWG' | 'AZM' | 'AZN' | 'BAM' | 'BBD' | 'BDT' |
	'BEF' | 'BGL' | 'BGN' | 'BHD' | 'BIF' | 'BMD' | 'BND' | 'BOB' | 'BOV' | 'BRB' | 'BRL' | 'BSD' | 'BTN' | 'BWP' | 'BYB' | 'BYN' | 'BYR' | 'BZD' |
	'CAD' | 'CDF' | 'CHF' | 'CLF' | 'CLP' | 'CNH' | 'CNY' | 'COP' | 'CRC' | 'CSD' | 'CUC' | 'CUP' | 'CVE' | 'CYP' | 'CZK' | 'DEM' | 'DJF' | 'DKK' |
	'DOP' | 'DZD' | 'ECS' | 'EEK' | 'EGP' | 'ERN' | 'ESP' | 'ETB' | 'EUR' | 'FIM' | 'FJD' | 'FKP' | 'XFL' | 'FRF' | 'GBP' | 'GEL' | 'GHC' | 'GHS' |
	'GIP' | 'GMD' | 'GNF' | 'GRD' | 'GTQ' | 'GWP' | 'GYD' | 'HKD' | 'HNL' | 'HRD' | 'HRK' | 'HTG' | 'HUF' | 'IDR' | 'IEP' | 'ILS' | 'INR' | 'IQD' |
	'IRR' | 'ISK' | 'ITL' | 'JMD' | 'JOD' | 'JPY' | 'KES' | 'KGS' | 'KHR' | 'KMF' | 'KPW' | 'KRW' | 'KWD' | 'KYD' | 'KZT' | 'LAK' | 'LBP' | 'LKR' |
	'LRD' | 'LSL' | 'LTL' | 'LUF' | 'LVL' | 'LYD' | 'MAD' | 'XMA' | 'MDL' | 'MGA' | 'MGF' | 'MKD' | 'MMK' | 'MNT' | 'MOP' | 'MRO' | 'MRU' | 'MTL' |
	'MUR' | 'MVR' | 'MWK' | 'MXN' | 'MXV' | 'MYR' | 'MZM' | 'MZN' | 'NAD' | 'NGN' | 'NIO' | 'NLG' | 'NOK' | 'NPR' | 'NZD' | 'OMR' | 'PAB' | 'XPA' |
	'PEN' | 'PGK' | 'PHP' | 'PKR' | 'PLN' | 'PTE' | 'PYG' | 'QAR' | 'RMB' | 'ROL' | 'RON' | 'RSD' | 'RUB' | 'RUR' | 'RWF' | 'SAR' | 'SBD' | 'SCR' |
	'SDD' | 'SDG' | 'SEK' | 'SGD' | 'SHP' | 'SIT' | 'SKK' | 'SLE' | 'SLL' | 'XSO' | 'SOS' | 'SRD' | 'SRG' | 'SSP' | 'STD' | 'STN' | 'SUR' | 'SVC' |
	'SYP' | 'SZL' | 'THB' | 'TJR' | 'TJS' | 'TMM' | 'TMT' | 'TND' | 'TOP' | 'TPE' | 'TRL' | 'TRY' | 'TTD' | 'TWD' | 'TZS' | 'UAH' | 'UGX' | 'USD' |
	'UYU' | 'UZS' | 'VEB' | 'VEF' | 'VES' | 'VND' | 'VUV' | 'WST' | 'XAF' | 'XCD' | 'XOF' | 'XPF' | 'YER' | 'YUM' | 'ZAR' | 'ZMK' | 'ZMW' | 'ZWD' |
	'ZWL';
export type DataCategoryFilterOperation = 'above' | 'below' | 'at' | 'aboveOrBelow';
export type ReportFormat = 'MultiBlock' | 'Matrix' | 'Summary' | 'Tabular';
export type ReportAggrType = 'Sum' | 'Average' | 'Maximum' | 'Minimum' | 'Unique' | 'RowCount' | 'Median';
export type UserDateGranularity = 'None' | 'Day' | 'Week' | 'Month' | 'Quarter' | 'Year' | 'FiscalQuarter' | 'FiscalYear' | 'MonthInYear' | 'DayInMonth' | 'FiscalPeriod' | 'FiscalWeek';
export type ReportSortType = 'Column' | 'Aggregate' | 'CustomSummaryFormula';
export type UserDateInterval = 'INTERVAL_CURRENT' | 'INTERVAL_CURNEXT1' | 'INTERVAL_CURPREV1' | 'INTERVAL_NEXT1' | 'INTERVAL_PREV1' | 'INTERVAL_CURNEXT3' | 'INTERVAL_CURFY' |
	'INTERVAL_PREVFY' | 'INTERVAL_PREV2FY' | 'INTERVAL_AGO2FY' | 'INTERVAL_NEXTFY' | 'INTERVAL_PREVCURFY' | 'INTERVAL_PREVCUR2FY' | 'INTERVAL_CURNEXTFY' |
	'INTERVAL_CUSTOM' | 'INTERVAL_YESTERDAY' | 'INTERVAL_TODAY' | 'INTERVAL_TOMORROW' | 'INTERVAL_LASTWEEK' | 'INTERVAL_THISWEEK' | 'INTERVAL_NEXTWEEK' |
	'INTERVAL_LASTMONTH' | 'INTERVAL_THISMONTH' | 'INTERVAL_NEXTMONTH' | 'INTERVAL_LASTTHISMONTH' | 'INTERVAL_THISNEXTMONTH' | 'INTERVAL_CURRENTQ' |
	'INTERVAL_CURNEXTQ' | 'INTERVAL_CURPREVQ' | 'INTERVAL_NEXTQ' | 'INTERVAL_PREVQ' | 'INTERVAL_CURNEXT3Q' | 'INTERVAL_CURY' | 'INTERVAL_PREVY' | 'INTERVAL_PREV2Y' |
	'INTERVAL_AGO2Y' | 'INTERVAL_NEXTY' | 'INTERVAL_PREVCURY' | 'INTERVAL_PREVCUR2Y' | 'INTERVAL_CURNEXTY' | 'INTERVAL_LAST7' | 'INTERVAL_LAST30' |
	'INTERVAL_LAST60' | 'INTERVAL_LAST90' | 'INTERVAL_LAST120' | 'INTERVAL_NEXT7' | 'INTERVAL_NEXT30' | 'INTERVAL_NEXT60' | 'INTERVAL_NEXT90' | 'INTERVAL_NEXT120' |
	'LAST_FISCALWEEK' | 'THIS_FISCALWEEK' | 'NEXT_FISCALWEEK' | 'LAST_FISCALPERIOD' | 'THIS_FISCALPERIOD' | 'NEXT_FISCALPERIOD' | 'LASTTHIS_FISCALPERIOD' |
	'THISNEXT_FISCALPERIOD' | 'CURRENT_ENTITLEMENT_PERIOD' | 'PREVIOUS_ENTITLEMENT_PERIOD' | 'PREVIOUS_TWO_ENTITLEMENT_PERIODS' | 'TWO_ENTITLEMENT_PERIODS_AGO' |
	'CURRENT_AND_PREVIOUS_ENTITLEMENT_PERIOD' | 'CURRENT_AND_PREVIOUS_TWO_ENTITLEMENT_PERIODS';
export type ReportTypeCategory = 'accounts' | 'opportunities' | 'forecasts' | 'cases' | 'leads' | 'campaigns' | 'activities' | 'busop' | 'products' | 'admin' | 'territory' | 'other' |
	'content' | 'usage_entitlement' | 'wdc' | 'calibration' | 'territory2' | 'quotes' | 'individual' | 'employee';
export type SamlIdentityLocationType = 'SubjectNameId' | 'Attribute';
export type SamlIdentityType = 'Username' | 'FederationId' | 'UserId';
export type SamlType = 'SAML1_1' | 'SAML2_0';
export type SamlSpSLOBinding = 'RedirectBinding' | 'PostBinding';
export type Complexity = 'NoRestriction' | 'AlphaNumeric' | 'SpecialCharacters' | 'UpperLowerCaseNumeric' | 'UpperLowerCaseNumericSpecialCharacters' | 'Any3UpperLowerCaseNumericSpecialCharacters';
export type Expiration = 'ThirtyDays' | 'SixtyDays' | 'NinetyDays' | 'SixMonths' | 'OneYear' | 'Never';
export type LockoutInterval = 'FifteenMinutes' | 'ThirtyMinutes' | 'SixtyMinutes' | 'Forever';
export type MaxLoginAttempts = 'ThreeAttempts' | 'FiveAttempts' | 'TenAttempts' | 'NoLimit';
export type QuestionRestriction = 'None' | 'DoesNotContainPassword';
export type SessionTimeout = 'TwentyFourHours' | 'TwelveHours' | 'EightHours' | 'FourHours' | 'TwoHours' | 'SixtyMinutes' | 'ThirtyMinutes' | 'FifteenMinutes';
export type ApplicationSourceType = 'REPLY_RECOMMENDATION' | 'ARTICLE_RECOMMENDATION' | 'UTTERANCE_RECOMMENDATION' | 'FAQ' | 'EAR_FOR_CONVERSATION' | 'USE_CASE_EXPLORER' | 'EAR_FOR_VOICE';
export type ServiceAISetupDefStatus = 'FIELDS_SELECTED' | 'TRAINING' | 'READY_TO_ACTIVATE' | 'SERVING' | 'RETIRED' | 'ARCHIVED' | 'READY_FOR_REVIEW';
export type ServiceAISetupFieldType = 'CASE_DESC' | 'CASE_SUBJ' | 'ARTICLE_TITLE' | 'ARTICLE_CONTENT' | 'ARTICLE_SUMMARY' | 'ARTICLE_ANSWER' | 'ARTICLE_QUESTION';
export type CaseSubjectOption = 'SocialPostSource' | 'SocialPostContent' | 'BuildCustom';
export type PropertyDisplayType = 'Lookup' | 'Picklist' | 'Text' | 'Checkbox' | 'Number' | 'Queue';
export type TimeSheetFrequency = 'Daily' | 'Weekly' | 'EveryTwoWeeks' | 'TwiceAMonth' | 'Monthly';
export type DaysOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type TransactionSecurityEventName = 'ReportEvent' | 'ApiEvent' | 'AdminSetupEvent' | 'LoginEvent' | 'ListViewEvent' | 'CredentialStuffingEventStore' | 'ReportAnomalyEventStore' | 'SessionHijackingEventStore' |
	'ApiAnomalyEventStore' | 'BulkApiResultEventStore' | 'PermissionSetEventStore' | 'FileEventStore';
export type MonitoredEvents = 'AuditTrail' | 'Login' | 'Entity' | 'DataExport' | 'AccessResource';
export type TxnSecurityPolicyType = 'CustomApexPolicy' | 'CustomConditionBuilderPolicy';
export type ObjectRelationshipType = 'Direct' | 'Indirect' | 'Self' | 'InverseDirect';
export type NetworkUserType = 'Internal' | 'Customer' | 'Partner';
export type CountryIsoCode = 'AD' | 'AE' | 'AF' | 'AG' | 'AI' | 'AL' | 'AM' | 'AO' | 'AQ' | 'AR' | 'AT' | 'AU' | 'AW' | 'AX' | 'AZ' | 'BA' | 'BB' | 'BD' | 'BE' | 'BF' | 'BG' |
	'BH' | 'BI' | 'BJ' | 'BL' | 'BM' | 'BN' | 'BO' | 'BQ' | 'BR' | 'BS' | 'BT' | 'BV' | 'BW' | 'BY' | 'BZ' | 'CA' | 'CC' | 'CD' | 'CF' | 'CG' | 'CH' |
	'CI' | 'CK' | 'CL' | 'CM' | 'CN' | 'CO' | 'CR' | 'CU' | 'CV' | 'CW' | 'CX' | 'CY' | 'CZ' | 'DE' | 'DJ' | 'DK' | 'DM' | 'DO' | 'DZ' | 'EC' | 'EE' |
	'EG' | 'EH' | 'ER' | 'ES' | 'ET' | 'FI' | 'FJ' | 'FK' | 'FO' | 'FR' | 'GA' | 'GB' | 'GD' | 'GE' | 'GF' | 'GG' | 'GH' | 'GI' | 'GL' | 'GM' | 'GN' |
	'GP' | 'GQ' | 'GR' | 'GS' | 'GT' | 'GW' | 'GY' | 'HM' | 'HN' | 'HR' | 'HT' | 'HU' | 'ID' | 'IE' | 'IL' | 'IM' | 'IN' | 'IO' | 'IQ' | 'IR' | 'IS' |
	'IT' | 'JE' | 'JM' | 'JO' | 'JP' | 'KE' | 'KG' | 'KH' | 'KI' | 'KM' | 'KN' | 'KP' | 'KR' | 'KW' | 'KY' | 'KZ' | 'LA' | 'LB' | 'LC' | 'LI' | 'LK' |
	'LR' | 'LS' | 'LT' | 'LU' | 'LV' | 'LY' | 'MA' | 'MC' | 'MD' | 'ME' | 'MF' | 'MG' | 'MK' | 'ML' | 'MM' | 'MN' | 'MO' | 'MQ' | 'MR' | 'MS' | 'MT' |
	'MU' | 'MV' | 'MW' | 'MX' | 'MY' | 'MZ' | 'NA' | 'NC' | 'NE' | 'NF' | 'NG' | 'NI' | 'NL' | 'NO' | 'NP' | 'NR' | 'NU' | 'NZ' | 'OM' | 'PA' | 'PE' |
	'PF' | 'PG' | 'PH' | 'PK' | 'PL' | 'PM' | 'PN' | 'PS' | 'PT' | 'PY' | 'QA' | 'RE' | 'RO' | 'RS' | 'RU' | 'RW' | 'SA' | 'SB' | 'SC' | 'SD' | 'SE' |
	'SG' | 'SH' | 'SI' | 'SJ' | 'SK' | 'SL' | 'SM' | 'SN' | 'SO' | 'SR' | 'SS' | 'ST' | 'SV' | 'SX' | 'SY' | 'SZ' | 'TC' | 'TD' | 'TF' | 'TG' | 'TH' |
	'TJ' | 'TK' | 'TL' | 'TM' | 'TN' | 'TO' | 'TR' | 'TT' | 'TV' | 'TW' | 'TZ' | 'UA' | 'UG' | 'US' | 'UY' | 'UZ' | 'VA' | 'VC' | 'VE' | 'VG' | 'VN' |
	'VU' | 'WF' | 'WS' | 'YE' | 'YT' | 'ZA' | 'ZM' | 'ZW';
export type TaxLocaleType = 'Net' | 'Gross';
export type OrderLifeCycleType = 'MANAGED' | 'UNMANAGED';
export type PricingStrategy = 'LowestPrice' | 'Priority';
export type ProductGrouping = 'VariationParent' | 'NoGrouping';
export type WebStoreType = 'B2B' | 'B2C' | 'B2CE';
export type LookupValueType = 'User' | 'Queue' | 'RecordType';
export type FieldUpdateOperation = 'Formula' | 'Literal' | 'Null' | 'NextValue' | 'PreviousValue' | 'LookupValue';
export type KnowledgeWorkflowAction = 'PublishAsNew' | 'Publish';
export type SendAction = 'Send';
export type ActionTaskAssignedToTypes = 'user' | 'role' | 'opportunityTeam' | 'accountTeam' | 'owner' | 'accountOwner' | 'creator' | 'accountCreator' | 'partnerUser' | 'portalRole';
export type ActionEmailRecipientTypes = 'group' | 'role' | 'user' | 'opportunityTeam' | 'accountTeam' | 'roleSubordinates' | 'owner' | 'creator' | 'partnerUser' | 'accountOwner' | 'customerPortalUser' |
	'portalRole' | 'portalRoleSubordinates' | 'contactLookup' | 'userLookup' | 'roleSubordinatesInternal' | 'email' | 'caseTeam' | 'campaignMemberDerivedOwner';
export type ActionEmailSenderType = 'CurrentUser' | 'OrgWideEmailAddress' | 'DefaultWorkflowUser';
export type WorkflowTriggerTypes = 'onCreateOnly' | 'onCreateOrTriggeringUpdate' | 'onAllChanges' | 'OnRecursiveUpdate';
export type WorkflowTimeUnits = 'Hours' | 'Days';
export type ExtendedErrorCode = 'ACTIONCALL_DUPLICATE_INPUT_PARAM' | 'ACTIONCALL_DUPLICATE_OUTPUT_PARAM' | 'ACTIONCALL_INPUT_VALIDATION_FAILED' | 'ACTIONCALL_INVALID_INPUT_PARAM_NAME' |
	'ACTIONCALL_MISSING_NAME' | 'ACTIONCALL_MISSING_REQUIRED_PARAM' | 'ACTIONCALL_MISSING_REQUIRED_TYPE' | 'ACTIONCALL_NOT_FOUND_WITH_NAME_AND_TYPE' |
	'ACTIONCALL_NOT_SUPPORTED_FOR_PROCESSTYPE' | 'ACTIONCALL_NOT_SUPPORTED_FOR_TRIGGERTYPE' | 'ACTIONCALL_TRANSACTION_MODEL_NOT_ALLOWED' | 'ACTIONCALL_TRANSACTION_MODEL_NOT_SUPPORTED' |
	'ACTIONCALL_TRIGGERING_RECORD_MISMATCHED_OBJECTTYPE' | 'ACTION_CALL_INVALID_CONFIGURATION' | 'ACTION_CALL_INVALID_INPUT_PARAM' | 'ACTION_CALL_INVALID_OUTPUT_PARAM' |
	'ACTION_TYPE_REQUIRED_FOR_STEP' | 'ADDING_ATTACHMENT_QUESTIONS_ADDITION_TO_EXISTING_SURVEY' | 'APEXCALLOUT_INPUT_DUPLICATE' | 'APEXCALLOUT_INPUT_INCOMPATIBLE_DATATYPE' |
	'APEXCALLOUT_INVALID' | 'APEXCALLOUT_MISSING_CLASSNAME' | 'APEXCALLOUT_NOT_FOUND' | 'APEXCALLOUT_OUTPUT_INCOMPATIBLE_DATATYPE' | 'APEXCALLOUT_OUTPUT_INVALID' |
	'APEXCALLOUT_REQUIRED_INPUT_MISSING' | 'APEXCLASS_MISSING_INTERFACE' | 'APEX_CLASS_VARIABLE_NOT_FOUND' | 'ASSIGNEE_AUTOPROC' | 'ASSIGNEE_USER_USERNAME' |
	'ASSIGNMENTITEM_ELEMENT_MISSING_DATATYPE' | 'ASSIGNMENTITEM_ELEMENT_NOT_SUPPORTED' | 'ASSIGNMENTITEM_FIELD_INVALID_DATATYPE' | 'ASSIGNMENTITEM_FIELD_INVALID_DATATYPE_WITH_ELEMENT' |
	'ASSIGNMENTITEM_INCOMPATIBLE_DATATYPES' | 'ASSIGNMENTITEM_INVALID_ASSIGNTOREFERENCE' | 'ASSIGNMENTITEM_INVALID_COLLECTION' | 'ASSIGNMENTITEM_INVALID_DATATYPE_IN_ELEMENT' |
	'ASSIGNMENTITEM_INVALID_ELEMENTREFERENCE' | 'ASSIGNMENTITEM_INVALID_MERGE_FIELD' | 'ASSIGNMENTITEM_INVALID_OPERATOR' | 'ASSIGNMENTITEM_INVALID_REFERENCE' |
	'ASSIGNMENTITEM_INVALID_VALUE' | 'ASSIGNMENTITEM_LEFT_DATATYPE_INVALID_FOR_OPERATOR' | 'ASSIGNMENTITEM_MODIFIES_NONVARIABLE' | 'ASSIGNMENTITEM_NONEXISTENT_REFERENCE' |
	'ASSIGNMENTITEM_REQUIRED' | 'ASSIGNMENTITEM_RIGHT_DATATYPE_INVALID_FOR_OPERATOR' | 'AUTOLAUNCHED_CHOICELOOKUP_NOT_SUPPORTED' | 'AUTOLAUNCHED_CHOICE_NOT_SUPPORTED' |
	'AUTOLAUNCHED_SCREEN_NOT_SUPPORTED' | 'AUTOLAUNCHED_STEP_NOT_SUPPORTED' | 'AUTOLAUNCHED_SUBFLOW_INCOMPATIBLE_FLOWTYPE' | 'AUTOLAUNCHED_WAIT_NOT_SUPPORTED' |
	'BEFORE_SAVE_FLOW_RECORD_UPDATE_CANNOT_HAVE_FAULT_CONNECTOR' | 'BEFORE_SAVE_FLOW_RECORD_UPDATE_INVALID_REFERENCE' | 'BEFORE_SAVE_FLOW_RECORD_UPDATE_RELATED_RECORD_REQUIRES_INPUTASSIGNMENTS' |
	'BEFORE_SAVE_FLOW_RECORD_UPDATE_REQUIRES_INPUTASSIGNMENTS' | 'BOTH_START_NODE_AND_REFERENCE_FOUND' | 'CHOICEFIELD_DEFAULT_CHOICE_NOT_FOUND' | 'CHOICEFIELD_MISSING_CHOICE' |
	'CHOICELOOKUP_DATATYPE_INCOMPATIBLE_WITH_CHOICEFIELD' | 'CHOICE_DATATYPE_INCOMPATIBLE_WITH_CHOICEFIELD' | 'CHOICE_LOOKUP_COLLECTION_REFERENCE_NULL' |
	'CHOICE_LOOKUP_INVALID_COLLECTION_REFERENCE' | 'CHOICE_NOT_SUPPORTED_FOR_SCREENFIELDTYPE' | 'CHOICE_USED_MULTIPLE_TIMES_IN_SAME_FIELD' | 'COLLECTION_PROCESSOR_DUPLICATE_MAPITEM' |
	'COLLECTION_PROCESSOR_INVALID_COLLECTION_REFERENCE' | 'COLLECTION_PROCESSOR_INVALID_CONFIGURATION' | 'COLLECTION_PROCESSOR_INVALID_OUTPUTSOBJECTTYPE' |
	'COLLECTION_PROCESSOR_MAX_SORT_FIELDS_LIMIT_EXCEEDED' | 'COLLECTION_PROCESSOR_MISMATCHED_OBJECTTYPE' | 'COLLECTION_PROCESSOR_MISSING_MAP' | 'COLLECTION_PROCESSOR_MISSING_OUTPUTSOBJECTTYPE' |
	'COLLECTION_PROCESSOR_MISSING_PARAMETER' | 'COLLECTION_PROCESSOR_MISSING_SORT' | 'COLLECTION_PROCESSOR_NOT_SUPPORTED_FOR_API_VERSION' | 'COLLECTION_PROCESSOR_REQUIRES_PERM' |
	'COLLECTION_PROCESSOR_SORT_FIELD_INVALID_FOR_OBJECT' | 'COLLECTION_PROCESSOR_TYPE_NOT_SUPPORTED' | 'COLLECTION_PROCESSOR_VARIABLE_NULL' | 'CONDITIONAL_SCREENFIELD_VISIBILITY_NOT_SUPPORTED_FOR_ENVIRONMENT' |
	'CONDITION_BUILDER_MISSING_FLOW_VARIABLE' | 'CONDITION_BUILDER_MISSING_REQUIRED_PERMISSIONS' | 'CONDITION_BUILDER_UNSUPPORTED_FLOW_VARIABLE' | 'CONDITION_INVALID_LEFTOPERAND' |
	'CONDITION_LOGIC_EXCEEDS_LIMIT' | 'CONDITION_LOGIC_INVALID' | 'CONDITION_LOGIC_MISSING' | 'CONDITION_MISSING_DATATYPE' | 'CONDITION_MISSING_OPERATOR' |
	'CONDITION_OPERAND_DATATYPES_INCOMPATIBLE' | 'CONDITION_OPERAND_INCOMPATIBLE_WITH_ELEMENT' | 'CONDITION_OPERATOR_INCOMPATIBLE' | 'CONDITION_REFERENCED_ELEMENT_NOT_FOUND' |
	'CONDITION_RIGHTOPERAND_NULL' | 'CONNECTOR_MISSING_TARGET' | 'CONSTANT_INCLUDES_REFERENCES' | 'CUSTOMEVENTS_NOT_ENABLED' | 'CUSTOMEVENT_MISSING_PROCESSMETADATAVALUES' |
	'CUSTOMEVENT_OBJECTTYPE_NOT_FOUND' | 'CUSTOMEVENT_OBJECTTYPE_NOT_SUPPORTED' | 'CUSTOMEVENT_PROCESSMETADATAVALUES_MISSING_NAME' | 'CUSTOMEVENT_PROCESSMETADATAVALUES_MORE_THAN_ONE_NAME' |
	'DATATYPE_INVALID' | 'DATATYPE_MISSING' | 'DATA_TYPE_NOT_SUPPORTED_FOR_PROCESSTYPE' | 'DECISION_DEFAULT_CONNECTOR_MISSING_LABEL' | 'DECISION_MISSING_OUTCOME' |
	'DETERMINATION_FLOW_ACTION_TYPE_REQUIRED' | 'DYNAMIC_TYPE_MAPPING_MISSING' | 'ELEMENT_CONNECTS_TO_SELF' | 'ELEMENT_COORDINATES_INVALID' | 'ELEMENT_INVALID_CONNECTOR' |
	'ELEMENT_INVALID_REFERENCE' | 'ELEMENT_INVALID_REFERENCE_FOR_CONFLICTING_FIELD_VALUE' | 'ELEMENT_MISSING_CONNECTOR' | 'ELEMENT_MISSING_LABEL' |
	'ELEMENT_MISSING_NAME' | 'ELEMENT_MISSING_REFERENCE' | 'ELEMENT_MORE_THAN_ONE_FIELD' | 'ELEMENT_NAME_INVALID' | 'ELEMENT_NEVER_USED' | 'ELEMENT_NOT_SUPPORTED_IN_SUBFLOW_FOR_TRIGGER_TYPE' |
	'ELEMENT_SCALE_SMALLER_THAN_DEFAULTVALUE' | 'ELEMENT_SUBTYPE_NOT_SUPPORTED_FOR_ELEMENTTYPE' | 'ELEMENT_SUBTYPE_NOT_SUPPORTED_FOR_PROCESSTYPE' |
	'ELEMENT_TYPE_NOT_SUPPORTED_FOR_ENVIRONMENT' | 'ENTRY_CONDITION_CONFLICTING_FILTERS' | 'ENVIRONMENTS_VALUE_CHANGED' | 'ENVIRONMENT_PERMISSION_REQUIRED' |
	'EXTERNAL_OBJECTS_NOT_SUPPORTED' | 'EXTERNAL_OBJECT_FIELDS_NOT_SUPPORTED' | 'EX_AUTOLAUNCHED_SUBFLOW_INCOMPATIBLE_FLOWTYPE' | 'FEATURE_DISABLED' |
	'FIELDASSIGNMENT_FIELD_INCOMPATIBLE_DATATYPE' | 'FIELDASSIGNMENT_INVALID_DATATYPE' | 'FIELDASSIGNMENT_INVALID_ELEMENT' | 'FIELDASSIGNMENT_INVALID_REFERENCE' |
	'FIELDASSIGNMENT_MULTIPLE_REFERENCES_SAME_FIELD' | 'FIELDASSIGNMENT_PICKLISTFIELD_INCOMPATIBLE_DATATYPE' | 'FIELDASSIGNMENT_REFERENCED_ELEMENT_MISSING_DATATYPE' |
	'FIELDSERVICE_UNSUPPORTED_FIELD_TYPE' | 'FIELD_INVALID_VALUE' | 'FIELD_NOT_FOUND' | 'FIELD_RELATIONSHIP_NOT_SUPPORTED' | 'FIELD_TYPE_NOT_SUPPORTED_AS_CHILD_OF_SCREENFIELD_REGION_OR_REGIONCONTAINER' |
	'FIELD_TYPE_NOT_SUPPORTED_AS_PARENT' | 'FIELD_VALUE_REQUIRES_PERM' | 'FLEXIPAGE_COMPONENT_ATTRIBUTE_EXPRESSION_EXCEPTION' | 'FLEXIPAGE_COMPONENT_ATTRIBUTE_GENERIC_EXCEPTION' |
	'FLEXIPAGE_COMPONENT_ATTRIBUTE_MISSING_REQUIRED' | 'FLEXIPAGE_COMPONENT_ATTRIBUTE_TOO_LONG' | 'FLEXIPAGE_COMPONENT_CUSTOM_VALIDATION_EXCEPTION' |
	'FLEXIPAGE_COMPONENT_DESIGN_EXCEPTION' | 'FLEXIPAGE_COMPONENT_EVENT_DUPLICATE_TARGET_EXCEPTION' | 'FLEXIPAGE_COMPONENT_EVENT_EMPTY_TARGET_MAPPING_EXCEPTION' |
	'FLEXIPAGE_COMPONENT_EVENT_INVALID_FORMFACTOR_EXCEPTION' | 'FLEXIPAGE_COMPONENT_EVENT_INVALID_SERVICE_EXCEPTION' | 'FLEXIPAGE_COMPONENT_EVENT_SOURCE_EXCEPTION' |
	'FLEXIPAGE_COMPONENT_MAX_LIMIT_EXCEPTION' | 'FLEXIPAGE_COMPONENT_RULE_VALIDATION_EXCEPTION' | 'FLEXIPAGE_DUPLICATE_PROPERTY_COMPONENT_EXCEPTION' |
	'FLEXIPAGE_EVENT_ATTRIBUTE_GENERIC_EXCEPTION' | 'FLEXIPAGE_INVALID_ITEM_INSTANCE_TYPE_EXCEPTION' | 'FLEXIPAGE_INVALID_PROPERTY_TYPE_COMPONENT_EXCEPTION' |
	'FLEXIPAGE_INVALID_PROPERTY_TYPE_EVENT_TARGET_EXCEPTION' | 'FLEXIPAGE_ITEM_INSTANCE_CUSTOM_VALIDATION_EXCEPTION' | 'FLEXIPAGE_MAX_INTERACTIONS_EXCEPTION' |
	'FLEXIPAGE_PICKLIST_INVALID_VALUE_EXCEPTION' | 'FLEXIPAGE_RENAMED_COMPONENT_VALIDATION_EXCEPTION' | 'FLEXIPAGE_TEMPLATE_INVALID_SWITCH' | 'FLOW_ALREADY_OVERRIDDEN' |
	'FLOW_COMPLEX_VALUE_COLLECTION_TYPE_EXPECTED' | 'FLOW_COMPLEX_VALUE_INVALID_JSON' | 'FLOW_COMPLEX_VALUE_INVALID_MERGE_FIELD' | 'FLOW_COMPLEX_VALUE_NOT_SUPPORTED' |
	'FLOW_COMPLEX_VALUE_SCALAR_TYPE_EXPECTED' | 'FLOW_CONTEXT_RECORD_ASSIGNMENT_VARIABLE_INVALID' | 'FLOW_ELEMENT_SCALE_LESS_THAN_ZERO' | 'FLOW_IMMEDIATE_PATH_INCOMPATIBLE_WITH_EXTERNAL_CALLOUTS' |
	'FLOW_IMMEDIATE_PATH_INCOMPATIBLE_WITH_EXTERNAL_OBJECTS' | 'FLOW_INCLUDES_STEP' | 'FLOW_INPUTPARAM_MISMATCHED_APEX_CLASS' | 'FLOW_INTERVIEW_BULK_EXECUTION' |
	'FLOW_INTERVIEW_HANDLED_ERROR' | 'FLOW_INTERVIEW_INPUT_VALIDATION' | 'FLOW_INTERVIEW_INTERACTION_NOT_FOUND' | 'FLOW_INTERVIEW_INVALID_CHOICE_USER_INPUT' |
	'FLOW_INTERVIEW_INVALID_FIELD_VALUE' | 'FLOW_INTERVIEW_INVALID_START_REQUEST' | 'FLOW_INTERVIEW_LIMIT_EXCEEDED' | 'FLOW_INTERVIEW_MISSING_CHOICE_FOR_REQUIRED_CHOICE_FIELD' |
	'FLOW_INTERVIEW_MISSING_VALUE_FOR_REQUIRED_INPUT_FIELD' | 'FLOW_INTERVIEW_NAVIGATE' | 'FLOW_INTERVIEW_RANGE_VALIDATION' | 'FLOW_INTERVIEW_REGEX_VALIDATION' |
	'FLOW_INTERVIEW_RESUME_INTERVIEW' | 'FLOW_INTERVIEW_SAVE_RESULT' | 'FLOW_INTERVIEW_SET_CHOICE_SELECTED' | 'FLOW_INTERVIEW_START_INTERVIEW' | 'FLOW_INTERVIEW_TYPE_CONVERSION' |
	'FLOW_INVALID_NAME' | 'FLOW_NAME_USED_IN_OTHER_CLIENT' | 'FLOW_OVERRIDABLE_CANNOT_BE_OVERRIDE' | 'FLOW_OVERRIDABLE_CANNOT_BE_TEMPLATE' | 'FLOW_OVERRIDDEN_FLOW_INVALID_REFERENCE' |
	'FLOW_OVERRIDE_EXTRA_VARIABLE' | 'FLOW_OVERRIDE_INCOMPATIBLE_PROCESS_TYPE' | 'FLOW_OVERRIDE_INCOMPATIBLE_TYPE' | 'FLOW_OVERRIDE_INCOMPATIBLE_VARIABLE' |
	'FLOW_RECORD_PRIOR_AUTOLAUNCH_UPDATE_ONLY' | 'FLOW_RECORD_PRIOR_INVALID_IN_RECORD_CREATE' | 'FLOW_RECORD_PRIOR_INVALID_IN_RECORD_DELETE' | 'FLOW_RECORD_PRIOR_INVALID_IN_RECORD_UPDATE' |
	'FLOW_RECORD_PRIOR_READ_ONLY' | 'FLOW_REFERENCES_APEX_CLASS_NOT_IN_SAME_PACKAGE' | 'FLOW_RESOURCE_NOT_SUPPORTED_FOR_ENVIRONMENT' | 'FLOW_RULE_REQUIRE_RECORD_CHANGED_NEVER_CHECKED_FOR_RECORD_PRIOR' |
	'FLOW_SCHEDULED_PATH_ALLOWED_ONE_ASYNCAFTERCOMMIT_PATH' | 'FLOW_SCHEDULED_PATH_ASYNCAFTERCOMMIT_REQUIRES_RECORD_CHANGED_OR_ISCHANGED' | 'FLOW_SCHEDULED_PATH_CANNOT_USE_IS_CHANGED' |
	'FLOW_SCHEDULED_PATH_INCOMPATIBLE_TIME_SOURCE' | 'FLOW_SCHEDULED_PATH_INCOMPATIBLE_WHEN_DECISION_REQUIRES_RECORD_CHANGED' | 'FLOW_SCHEDULED_PATH_INCOMPATIBLE_WITH_FLOW_TRIGGER_TYPE' |
	'FLOW_SCHEDULED_PATH_INCOMPATIBLE_WITH_RECORD_PRIOR' | 'FLOW_SCHEDULED_PATH_INVALID_BATCH_SIZE' | 'FLOW_SCHEDULED_PATH_INVALID_OFFSET' | 'FLOW_SCHEDULED_PATH_REQUIRES_DEFAULT_WORKFLOW_USER' |
	'FLOW_SCHEDULED_PATH_REQUIRES_RECORD_CHANGED_TO_MEET_CRITERIA' | 'FLOW_SCHEDULE_INFORMATION_INCOMPLETE' | 'FLOW_SOBJECT_VARIABLE_NOT_PERSISTED' |
	'FLOW_SOURCE_TEMPLATE_INVALID_REFERENCE' | 'FLOW_STAGE_INCLUDES_REFERENCES' | 'FLOW_STAGE_ORDER_DUPLICATE' | 'FLOW_STAGE_ORDER_OUT_OF_RANGE' | 'FLOW_SYSTEM_VARIABLE_NOT_SUPPORTED_FOR_TRIGGERTYPE' |
	'FLOW_TEST_API_NAME_DUPLICATED' | 'FLOW_TEST_ASSERTION_MISSING' | 'FLOW_TEST_ASSERTION_NOT_SUPPORTED' | 'FLOW_TEST_CONDITION_INCOMPATIBLE' | 'FLOW_TEST_CONDITION_INVALID_DATATYPE_MAPPING' |
	'FLOW_TEST_CONDITION_LIMIT' | 'FLOW_TEST_CONDITION_NOT_SUPPORTED' | 'FLOW_TEST_DATATYPE_INVALID' | 'FLOW_TEST_FLOW_INVALID' | 'FLOW_TEST_IMMEDIATE_PATH_MISSING' |
	'FLOW_TEST_MERGE_FIELD_INVALID' | 'FLOW_TEST_MERGE_FIELD_NOT_SUPPORTED' | 'FLOW_TEST_OPERATOR_INVALID' | 'FLOW_TEST_PARAMETER_DUPLICATED' | 'FLOW_TEST_PARAMETER_INCOMPATIBLE' |
	'FLOW_TEST_PARAMETER_INVALID' | 'FLOW_TEST_PARAMETER_LEFTVALUEREFERENCE_INVALID' | 'FLOW_TEST_PARAMETER_MISSING' | 'FLOW_TEST_PARAMETER_NOT_SUPPORTED' |
	'FLOW_TEST_PARAMETER_TYPE_INVALID' | 'FLOW_TEST_PARAMETER_VALUE_INVALID' | 'FLOW_TEST_PARAMETER_VALUE_MISSING' | 'FLOW_TEST_PARAMS_REQUIRED' | 'FLOW_TEST_POINTS_DUPLICATED' |
	'FLOW_TEST_POINT_MISSING' | 'FLOW_TEST_POINT_NOT_SUPPORTED' | 'FLOW_TEST_PROCESSTYPE_INVALID' | 'FLOW_TEST_RIGHTVALUE_INVALID' | 'FLOW_TRANSFORM_APEX_CLASS_INCOMPATIBLE' |
	'FLOW_TRANSFORM_API_VERSION_NOT_SUPPORTED' | 'FLOW_TRANSFORM_TYPE_INVALID' | 'FLOW_TRIGGER_DERIVED_FIELD_NOT_SUPPORTED' | 'FLOW_TRIGGER_ORDER_OUT_OF_BOUNDS' |
	'FLOW_TRIGGER_TYPE_INCOMPATIBLE_WITH_RECORD_TRIGGER_TYPE' | 'FORMULA_CMT_LIMIT_EXCEEDED' | 'FORMULA_EXPRESSION_INVALID' | 'GLOBAL_VARIABLE_NOT_SUPPORTED_FOR_PROCESSTYPE' |
	'HTTP_METHOD_NOT_SUPPORTED' | 'INCONSISTENT_DYNAMIC_TYPE_MAPPING' | 'INCONSISTENT_VALUE_FOR_DYNAMIC_VALUE_FIELD' | 'INPUTPARAM_CONFIGURATION_NOT_FOUND' |
	'INPUTPARAM_INCOMPATIBLE_CONFIGURATION_ONLY' | 'INPUTPARAM_INCOMPATIBLE_DATATYPE' | 'INPUTPARAM_INCOMPATIBLE_WITH_COLLECTION_VARIABLE' | 'INPUTPARAM_INCOMPATIBLE_WITH_NONCOLLECTION_VARIABLE' |
	'INPUTPARAM_MISMATCHED_OBJECTTYPE' | 'INPUTVARIABLE_COLLECTION_NOT_SUPPORTED_FOR_DYNAMIC_ACTION' | 'INPUTVARIABLE_COLLECTION_NOT_SUPPORTED_FOR_ENVIRONMENT' |
	'INPUTVARIABLE_DATATYPE_NOT_SUPPORTED_FOR_DYNAMIC_ACTION' | 'INPUTVARIABLE_DATATYPE_NOT_SUPPORTED_FOR_ENVIRONMENT' | 'INVALID_ACTION_TYPE_FOR_STEP' |
	'INVALID_ASSIGNEE' | 'INVALID_EMAIL_ADDRESS' | 'INVALID_ENVIRONMENTS_VALUE' | 'INVALID_FLOW' | 'INVALID_FLOW_INTERVIEW' | 'INVALID_PROCESSTYPE_ENVIRONMENT_COMBINATION' |
	'INVALID_QUERY_LOCATOR_FORMAT' | 'INVALID_REGEX_IN_SURVEY_QUESTIONS' | 'INVALID_SENDER_TYPE' | 'INVALID_SURVEY_VARIABLE_NAME_OR_TYPE' | 'INVALID_TIME_ZONE' |
	'INVOCABLE_ACTION_TYPE_NOT_SUPPORTED_FOR_ENVIRONMENT' | 'LOCATOR_LOCATION_EXCEEDS_SIZE' | 'LOOP_ASSIGNNEXTVALUETO_MISMATCHED_APEXCLASSTYPE' | 'LOOP_ASSIGNNEXTVALUETO_MISMATCHED_DATATYPE' |
	'LOOP_ASSIGNNEXTVALUETO_MISMATCHED_OBJECTTYPE' | 'LOOP_ASSIGNNEXTVALUETO_MISSING' | 'LOOP_ASSIGNNEXTVALUETO_MISSING_VARIABLE' | 'LOOP_ASSIGNNEXTVALUETO_REFERENCE_NOT_FOUND' |
	'LOOP_COLLECTION_ELEMENT_NOT_FOUND' | 'LOOP_COLLECTION_NOT_FOUND' | 'LOOP_COLLECTION_NOT_SUPPORTED_FOR_FIELD' | 'LOOP_MISSING_COLLECTION' | 'MAX_CHILD_TYPES' |
	'MAX_EXTERNAL_REFERENCES_IN_QUERY' | 'MAX_STATEMENT_SIZE' | 'MISSING_ASSIGNEE' | 'MISSING_ASSIGNEE_TYPE' | 'MISSING_EMAIL_RECIPIENTS' | 'MULTIPLE_ASSIGNEES_NOT_ALLOWED' |
	'NON_EXPOSED_COMPONENT_IN_FLOW' | 'NON_GLOBAL_COMPONENT_IN_EXPORTED_FLOW' | 'NUMBER_OF_SCREENFIELD_REGIONS_EXCEEDS_LIMIT' | 'OBJECTTYPE_INVALID' |
	'OBJECT_CANNOT_BE_CREATED' | 'OBJECT_CANNOT_BE_DELETED' | 'OBJECT_CANNOT_BE_QUERIED' | 'OBJECT_CANNOT_BE_UPDATED' | 'OBJECT_ENCRYPTED_FIELDS_NOT_SUPPORTED' |
	'OBJECT_NOT_FOUND' | 'OBJECT_TYPE_DOES_NOT_EXIST' | 'ORCHESTRATION_REQUIRESASYNCPROCESSING_NOT_SUPPORTED' | 'ORG_WIDE_EMAIL_INVALID' | 'ORG_WIDE_EMAIL_NOT_USED' |
	'OUTPUTPARAM_ASSIGNTOREFERENCE_INVALID' | 'OUTPUTPARAM_ASSIGNTOREFERENCE_NOTFOUND' | 'OUTPUTPARAM_INCOMPATIBLE_DATATYPE' | 'OUTPUTPARAM_MISMATCHED_OBJECTTYPE' |
	'OUTPUTPARAM_MISMATCHED_WITH_COLLECTION_VARIABLE' | 'OUTPUTPARAM_MISSING_ASSIGNTOREFERENCE' | 'OUTPUTPARAM_MISTMATCHED_WITH_NONCOLLECTION_VARIABLE' |
	'PARAM_DATATYPE_NOT_SUPPORTED' | 'PAST_SCHEDULE_FLOW_WILL_NOT_RUN' | 'PRICE_ADJUSTMENT_TIER_VALIDATION_ERROR' | 'PROCESSMETADATAVALUES_NOT_SUPPORTED_FOR_PROCESSTYPE' |
	'PROCESSMETADATAVALUE_NONEXISTENT_ELEMENT' | 'PROCESSTYPE_COMPONENTTYPE_NOT_SUPPORTED' | 'PROCESSTYPE_ELEMENT_CONFIG_NOT_SUPPORTED' | 'PROCESSTYPE_ELEMENT_NOT_SUPPORTED' |
	'PROCESSTYPE_EVALUATIONFLOW_REQUIRED' | 'PROCESSTYPE_NOT_SUPPORTED' | 'PROCESSTYPE_SCREEN_FIELDTYPE_NOT_SUPPORTED' | 'PROCESS_TYPE_ELEMENT_ATTRIBUTE_REQUIRED' |
	'PROCESS_TYPE_INCOMPATIBLE' | 'QUERY_LOCATOR_EXPIRED' | 'QUERY_LOCATOR_NOT_FOUND' | 'RECOMMENDATION_STRATEGY_EXCEPTION' | 'RECORDFILTER_ENCRYPTED_FIELDS_NOT_SUPPORTED' |
	'RECORDFILTER_GEOLOCATION_FIELDS_NOT_SUPPORTED' | 'RECORDFILTER_INVALID_DATATYPE' | 'RECORDFILTER_INVALID_ELEMENT' | 'RECORDFILTER_INVALID_OPERATOR' |
	'RECORDFILTER_INVALID_REFERENCE' | 'RECORDFILTER_MISSING_DATATYPE' | 'RECORDFILTER_MULTIPLE_QUERIES_SAME_FIELD' | 'RECORDFILTER_NON_PRIMITIVE' |
	'RECORDLOOKUP_IDASSIGNMENT_VARIABLE_INCOMPATIBLE_DATATYPE' | 'RECORDLOOKUP_IDASSIGNMENT_VARIABLE_NOT_FOUND' | 'RECORDUPDATE_MISSING_FILTERS' | 'REFERENCED_ELEMENT_NOT_FOUND' |
	'REQUIRED_VARIABLE_INVALID' | 'REQUIRED_VARIABLE_MISSING' | 'RESOURCE_NOT_SUPPORTED' | 'RULE_MISSING_CONDITION' | 'RULE_REQUIRE_RECORD_CHANGED_NEVER_CHECKED' |
	'SCHEDULE_TRIGGERED_FLOW_REQUIRES_DEFAULT_WORKFLOW_USER' | 'SCREENCOMPONENT_CONTAINS_VISIBILITY_RULE' | 'SCREENFIELD_API_VERSION_NOT_SUPPORTED' |
	'SCREENFIELD_BOOLEAN_ISREQUIRED_IS_FALSE' | 'SCREENFIELD_CANNOT_HAVE_BOTH_DEFAULTVALUE_AND_DEFAULTSELECTEDCHOICEREFERENCE' | 'SCREENFIELD_DEFAULTVALUE_NOT_SUPPORTED' |
	'SCREENFIELD_EXTENSION_DUPLICATE_INPUT_PARAM' | 'SCREENFIELD_EXTENSION_DUPLICATE_OUTPUT_PARAM' | 'SCREENFIELD_EXTENSION_IMPLEMENTATION_INVALID' |
	'SCREENFIELD_EXTENSION_INPUT_ATTRIBUTE_INVALID' | 'SCREENFIELD_EXTENSION_NAME_INVALID' | 'SCREENFIELD_EXTENSION_NAME_MISSING' | 'SCREENFIELD_EXTENSION_NAME_NOT_SUPPORTED' |
	'SCREENFIELD_EXTENSION_OUTPUT_ATTRIBUTE_INVALID' | 'SCREENFIELD_EXTENSION_REQUIRED_INPUT_MISSING' | 'SCREENFIELD_INPUTS_NOT_SUPPORTED' | 'SCREENFIELD_INPUTS_ON_NEXT_NAV_TO_ASSOC_SCRN_NOT_SUPPORTED' |
	'SCREENFIELD_INVALID_DATATYPE' | 'SCREENFIELD_MULTISELECTCHOICE_SEMICOLON_NOT_SUPPORTED' | 'SCREENFIELD_OBJECTFIELDREFERENCE_INVALID_FORMAT' | 'SCREENFIELD_OBJECTPROVIDED_CANNOT_HAVE_DEFAULTVALUE' |
	'SCREENFIELD_OBJECTPROVIDED_CANNOT_HAVE_HELPTEXT' | 'SCREENFIELD_OBJECTPROVIDED_INVALID_DATATYPE' | 'SCREENFIELD_OBJECTPROVIDED_ISREQUIRED_NOT_SUPPORTED' |
	'SCREENFIELD_OBJECTPROVIDED_LIGHTNING_RUNTIME_DISABLED' | 'SCREENFIELD_OBJECTPROVIDED_MISSING_OBJECTFIELDREFERENCE' | 'SCREENFIELD_OUTPUTS_NOT_SUPPORTED' |
	'SCREENFIELD_REGION_CONTAINS_DUPLICATE_INPUT_PARAMETER_VALUES' | 'SCREENFIELD_REGION_INPUT_PARAMETER_NOT_SUPPORTED' | 'SCREENFIELD_REGION_MISSING_REQUIRED_PERMISSIONS' |
	'SCREENFIELD_REGION_NOT_IN_CONTAINER' | 'SCREENFIELD_REGION_REQUIRED_INPUT_PARAMETER_MISSING' | 'SCREENFIELD_REGION_WIDTH_SUM_EXCEEDS_LIMIT' | 'SCREENFIELD_REGION_WIDTH_VALUE_INVALID' |
	'SCREENFIELD_TYPE_NOT_SUPPORTED' | 'SCREENFIELD_TYPE_NOT_SUPPORTED_FOR_API_VERSION' | 'SCREENFIELD_TYPE_NOT_SUPPORTED_FOR_ENVIRONMENT' | 'SCREENFIELD_USERINPUT_NOT_SUPPORTED_FOR_CHOICETYPE' |
	'SCREENFIELD_VALIDATIONRULE_NOT_SUPPORTED' | 'SCREENFIELD_VALIDATION_RULES_NOT_SUPPORTED_FOR_ENVIRONMENT' | 'SCREENFOOTER_MERGEFIELD_NOT_SUPPORTED' |
	'SCREENRULE_ACTION_INVALID_ATTRIBUTE' | 'SCREENRULE_ACTION_INVALID_ATTRIBUTE_FOR_API_VERSION' | 'SCREENRULE_ACTION_INVALID_VALUE' | 'SCREENRULE_ACTION_MISSING_ATTRIBUTE' |
	'SCREENRULE_ACTION_MISSING_FIELDREFERENCE' | 'SCREENRULE_ACTION_MISSING_VALUE' | 'SCREENRULE_ATTRIBUTE_NOT_SUPPORTED_FOR_SCREENFIELD' | 'SCREENRULE_FIELD_NOT_FOUND_ON_SCREEN' |
	'SCREENRULE_MISSING_ACTION' | 'SCREENRULE_NOT_SUPPORTED_IN_ORG' | 'SCREENRULE_SCREENFIELD_NOT_VISIBLE' | 'SCREENRULE_VISIBILITY_NOT_SUPPORTED_IN_ORG' |
	'SCREEN_ALLOWBACK_ALLOWFINISH_BOTH_FALSE' | 'SCREEN_CONTAINS_LIGHTNING_COMPONENT' | 'SCREEN_CONTAINS_REGION_CONTAINER_COMPONENT' | 'SCREEN_FIELD_REGION_CONTAINER_TYPE_INVALID_VALUE' |
	'SCREEN_FIELD_REGION_CONTAINER_TYPE_MISSING' | 'SCREEN_FIELD_SECTION_HEADER_INVALID_VALUE' | 'SCREEN_FIELD_SECTION_HEADER_MISSING' | 'SCREEN_MISSING_FOOTER_AND_LIGHTNING_COMPONENT' |
	'SCREEN_MISSING_LABEL' | 'SCREEN_MULTISELECTFIELD_DOESNT_SUPPORT_CHOICE_WITH_USERINPUT' | 'SCREEN_PAUSEDTEXT_NOT_SHOWN_WHEN_ALLOWPAUSE_IS_FALSE' |
	'SETTING_FIELD_MAKES_OTHER_FIELD_REQUIRED' | 'SETTING_FIELD_MAKES_OTHER_FIELD_UNSUPPORTED' | 'SETTING_FIELD_VALUE_MAKES_OTHER_FIELD_UNSUPPORTED' |
	'SETTING_FIELD_VALUE_MAKES_OTHER_FIELD_VALUE_UNSUPPORTED' | 'SLACK_API_EXCEPTION_EXTENSION' | 'SOBJECT_ELEMENT_INCOMPATIBLE_DATATYPE' | 'SOBJECT_ELEMENT_MISMATCHED_OBJECTTYPE' |
	'SORT_ENCRYPTED_FIELDS_NOT_SUPPORTED' | 'SORT_FIELD_MISSING' | 'SORT_FIELD_NOT_SUPPORTED' | 'SORT_GEOLOCATION_FIELDS_NOT_SUPPORTED' | 'SORT_LIMIT_INVALID' |
	'SORT_ORDER_MISSING' | 'SPECIFIC_FIELD_VALUE_MAKES_OTHER_FIELD_REQUIRED' | 'SPECIFIC_FIELD_VALUE_MAKES_OTHER_FIELD_VALUE_REQUIRED' | 'STAGE_NAME_NOT_FULLY_QUALIFIED' |
	'START_ELEMENT_MISSING' | 'SUBFLOW_DESKTOP_DESIGNER_FLOWS_NOT_SUPPORTED' | 'SUBFLOW_DIFFERENT_RUNMODE' | 'SUBFLOW_INPUT_MISSING_NAME' | 'SUBFLOW_INPUT_MULTIPLE_ASSIGNMENTS_TO_ONE_VARIABLE' |
	'SUBFLOW_INPUT_REFERENCES_FIELD_ON_SOBJECT_VARIABLE' | 'SUBFLOW_INPUT_VARIABLE_NOT_FOUND_IN_REFERENCEDFLOW' | 'SUBFLOW_INPUT_VARIABLE_NO_INPUT_ACCESS' |
	'SUBFLOW_INVALID_NAME' | 'SUBFLOW_INVALID_REFERENCE' | 'SUBFLOW_MASTER_FLOW_TYPE_NOT_AUTOLAUNCHED' | 'SUBFLOW_MISSING_NAME' | 'SUBFLOW_NO_ACTIVE_VERSION' |
	'SUBFLOW_OUTPUT_INCOMPATIBLE_DATATYPES' | 'SUBFLOW_OUTPUT_MISMATCHED_APEX_CLASS' | 'SUBFLOW_OUTPUT_MISMATCHED_COLLECTIONTYPES' | 'SUBFLOW_OUTPUT_MISMATCHED_OBJECTS' |
	'SUBFLOW_OUTPUT_MISSING_ASSIGNTOREFERENCE' | 'SUBFLOW_OUTPUT_MISSING_NAME' | 'SUBFLOW_OUTPUT_MULTIPLE_ASSIGNMENTS_TO_ONE_VARIABLE' | 'SUBFLOW_OUTPUT_REFERENCES_FIELD_ON_SOBJECT_VARIABLE' |
	'SUBFLOW_OUTPUT_TARGET_DOES_NOT_EXIST_IN_MASTER_FLOW' | 'SUBFLOW_OUTPUT_VARIABLE_NOT_FOUND_IN_MASTERFLOW' | 'SUBFLOW_OUTPUT_VARIABLE_NOT_FOUND_IN_REFERENCEDFLOW' |
	'SUBFLOW_OUTPUT_VARIABLE_NO_OUTPUT_ACCESS' | 'SUBFLOW_PROCESSTYPE_NOT_SUPPORTED' | 'SUBFLOW_PROCESS_TYPE_INCOMPATIBLE' | 'SUBFLOW_REFERENCES_MASTERFLOW' |
	'SURVEY_ADVANCED_CONDITION_LOGIC_NOT_SUPPORTED' | 'SURVEY_CHOICE_NOT_REFERENCED_BY_A_QUESTION' | 'SURVEY_CHOICE_REFERENCED_BY_MULTIPLE_QUESTIONS' |
	'SURVEY_ELEMENT_NEVER_REACHED' | 'SURVEY_ENRICH_INVALID_CONFIGURATION' | 'SURVEY_INACTIVE_SUBFLOWS' | 'SURVEY_INVALID_ATTACHMENT_QUESTION_CONFIGURATION' |
	'SURVEY_INVALID_CMT_CONFIGURED' | 'SURVEY_INVALID_CUSTOM_THANK_YOU_CONFIGURATION' | 'SURVEY_INVALID_LINK_TARGET_IN_QUESTION_LABEL' | 'SURVEY_INVALID_MATRIX_QUESTION_CONFIGURATION' |
	'SURVEY_INVALID_MERGE_FIELD_CONFIGURATION' | 'SURVEY_INVALID_OUTPUT_VARIABLE' | 'SURVEY_MISSING_QUESTION_OR_SUBFLOW' | 'SURVEY_MISSING_REQUIRED_VARIABLES' |
	'SURVEY_MULTIPLE_SCREENS_CANNOT_CONNECT_TO_SAME_DECISION' | 'SURVEY_NESTED_SUBFLOWS' | 'SURVEY_NONSURVEY_SUBFLOWS' | 'SURVEY_RULE_INVALID_RIGHT_OPERAND' |
	'SURVEY_SAVE_ERROR' | 'SURVEY_SCREENFIELD_TYPE_NOT_SUPPORTED_FOR_QUESTION' | 'SURVEY_START_ELEMENT_INVALID' | 'SURVEY_VARIABLE_ACCESS_INVALID' |
	'SYSTEM_MODE_NOT_ALLOWED' | 'TEMPORARY_QUERY_MORE_FAILURE' | 'TRIGGERED_FLOW_REDUNDANT_QUERY' | 'TRIGGERING_RECORD_UPDATE_REQUIRES_INPUTASSIGNMENTS' |
	'TRIGGER_ORDER_NOT_SUPPORTED' | 'TRIGGER_TYPE_CONTEXT_OBJECT_NOT_SUPPORTED' | 'TRIGGER_TYPE_ELEMENT_NOT_SUPPORTED' | 'TRIGGER_TYPE_INCOMPATIBLE_WITH_PROCESS_TYPE' |
	'TRIGGER_TYPE_NOT_ALLOWED_FOR_SUBFLOW' | 'TYPE_MAPPING_DUPLICATED' | 'TYPE_MAPPING_NAME_MISSING' | 'TYPE_MAPPING_NOT_FOUND' | 'TYPE_MAPPING_NOT_SUPPORTED' |
	'TYPE_MAPPING_NOT_SUPPORTED_FOR_API_VERSION' | 'TYPE_MAPPING_NOT_SUPPORTED_FOR_PROCESS_TYPE' | 'UNAUTHORIZED_USER_FOR_CURSOR' | 'UNEXPECTED_ERROR' |
	'VALIDATION_EXCEPTION' | 'VALUE_CHAR_LIMIT_EXCEEDED' | 'VARIABLE_FIELD_NOT_SUPPORTED_FOR_DATATYPE' | 'VARIABLE_FIELD_NOT_SUPPORTED_FOR_DATATYPE_AND_COLLECTION' |
	'VARIABLE_FIELD_REQUIRED_FOR_DATATYPE' | 'VARIABLE_SCALE_EXCEEDS_LIMIT' | 'VARIABLE_SCALE_NEGATIVE_INTEGER' | 'VARIABLE_SCALE_NULL' | 'VERSION_NOT_VALID' |
	'VISIBILITY_RULE_EXCEEDS_CONDITION_LIMIT' | 'VISIBILITY_RULE_NOT_AVAILABLE_IN_ORG' | 'VISIBILITY_RULE_NOT_SUPPORTED_FOR_API_VERSION' | 'VISIBILITY_RULE_NOT_SUPPORTED_FOR_PROCESSTYPE' |
	'VISIBILITY_RULE_NO_CONDITIONS' | 'WAITEVENT_BATCH_SIZE_NOT_SUPPORTED_FOR_EVENTTYPE' | 'WAITEVENT_DEFAULT_CONNECTOR_MISSING_LABEL' | 'WAITEVENT_DUPLICATE_INPUT_PARAM' |
	'WAITEVENT_INPUT_NOT_SUPPORTED_FOR_EVENTTYPE' | 'WAITEVENT_INPUT_REQUIRES_LITERAL_VALUE' | 'WAITEVENT_INVALID_CONDITION_LOGIC' | 'WAITEVENT_MISSING' |
	'WAITEVENT_MISSING_CONNECTOR' | 'WAITEVENT_MISSING_EVENTTYPE' | 'WAITEVENT_OBJECT_NOT_SUPPORTED_FOR_EVENTTYPE' | 'WAITEVENT_OUTPUT_NOT_SUPPORTED_FOR_EVENTTYPE' |
	'WAITEVENT_RELATIVEALARM_INVALID_DATETIME_FIELD' | 'WAITEVENT_RELATIVEALARM_INVALID_FIELD' | 'WAITEVENT_RELATIVEALARM_INVALID_OBJECTTYPE' | 'WAITEVENT_RELATIVEALARM_INVALID_OFFSETNUMBER' |
	'WAITEVENT_RELATIVEALARM_INVALID_OFFSETUNIT' | 'WAITEVENT_REQUIRED_INPUT_MISSING' | 'WAITEVENT_RESUME_DATE_IN_PAST' | 'WAITEVENT_TYPE_INVALID_OR_NOT_SUPPORTED' |
	'WORKFLOW_MISSING_PROCESSMETADATAVALUES' | 'WORKFLOW_OBJECTTYPE_NOT_FOUND' | 'WORKFLOW_OBJECTTYPE_NOT_SUPPORTED' | 'WORKFLOW_OBJECTVARIABLE_AND_OLDOBJECTVARIABLE_REFERENCE_SAME_SOBJECT_VARIABLE' |
	'WORKFLOW_OBJECTVARIABLE_DOESNT_SUPPORT_INPUT' | 'WORKFLOW_OLDOBJECTVARIABLE_DOESNT_SUPPORT_INPUT' | 'WORKFLOW_PROCESSMETADATAVALUES_MORE_THAN_ONE_NAME' |
	'WORKFLOW_PROCESS_METADATAVALUES_MISSING_NAME' | 'WORKFLOW_RECURSIVECOUNTVARIABLE_DOESNT_SUPPORT_INPUT' | 'WORKFLOW_RULE_NOT_DEACTIVATED' | 'WORKFLOW_TRIGGERTYPE_INVALID_VALUE';
export type TestLevel = 'NoTestRun' | 'RunSpecifiedTests' | 'RunLocalTests' | 'RunAllTestsInOrg';
export type AsyncRequestState = 'Queued' | 'InProgress' | 'Completed' | 'Error';
export type LogCategory = 'Db' | 'Workflow' | 'Validation' | 'Callout' | 'Apex_code' | 'Apex_profiling' | 'Visualforce' | 'System' | 'Wave' | 'Nba' | 'All';
export type LogCategoryLevel = 'None' | 'Finest' | 'Finer' | 'Fine' | 'Debug' | 'Info' | 'Warn' | 'Error';
export type LogType = 'None' | 'Debugonly' | 'Db' | 'Profiling' | 'Callout' | 'Detail';
export type StatusCode = 'ALERT_NOTIFICATION_LIMIT_EXCEEDED' | 'ALL_OR_NONE_OPERATION_ROLLED_BACK' | 'ALREADY_APPLIED' | 'ALREADY_IN_PROCESS' | 'ALREADY_REDEEMED_VOUCHER' |
	'APEX_DATA_ACCESS_RESTRICTION' | 'APEX_FAILED' | 'ASSIGNEE_TYPE_REQUIRED' | 'ATTRIBUTE_DEFINITION_LIMIT_EXCEEDED' | 'AURA_COMPILE_ERROR' | 'AUTH_PROVIDER_NEEDS_AUTH' |
	'AUTH_PROVIDER_NOT_FOUND' | 'B2B_SEARCH_ADMIN_ERROR' | 'BAD_CUSTOM_ENTITY_PARENT_DOMAIN' | 'BCC_NOT_ALLOWED_IF_BCC_COMPLIANCE_ENABLED' | 'BLOCKED_EXCLUSIVE' |
	'CANNOT_CASCADE_PRODUCT_ACTIVE' | 'CANNOT_CHANGE_FIELD_TYPE_OF_APEX_REFERENCED_FIELD' | 'CANNOT_CHANGE_FIELD_TYPE_OF_REFERENCED_FIELD' | 'CANNOT_CREATE_ANOTHER_MANAGED_PACKAGE' |
	'CANNOT_DEACTIVATE_DIVISION' | 'CANNOT_DELETE_GLOBAL_ACTION_LIST' | 'CANNOT_DELETE_LAST_DATED_CONVERSION_RATE' | 'CANNOT_DELETE_MANAGED_OBJECT' |
	'CANNOT_DISABLE_LAST_ADMIN' | 'CANNOT_ENABLE_IP_RESTRICT_REQUESTS' | 'CANNOT_EXECUTE_FLOW_TRIGGER' | 'CANNOT_FREEZE_SELF' | 'CANNOT_INSERT_UPDATE_ACTIVATE_ENTITY' |
	'CANNOT_MODIFY_MANAGED_OBJECT' | 'CANNOT_PASSWORD_LOCKOUT' | 'CANNOT_POST_TO_ARCHIVED_GROUP' | 'CANNOT_RENAME_APEX_REFERENCED_FIELD' | 'CANNOT_RENAME_APEX_REFERENCED_OBJECT' |
	'CANNOT_RENAME_REFERENCED_FIELD' | 'CANNOT_RENAME_REFERENCED_OBJECT' | 'CANNOT_REPARENT_RECORD' | 'CANNOT_UPDATE_CONVERTED_LEAD' | 'CANNOT_UPDATE_IS_THIRD_PARTY' |
	'CANT_DISABLE_CORP_CURRENCY' | 'CANT_UNSET_CORP_CURRENCY' | 'CART_NOT_FOUND' | 'CHECKOUT_CONFLICT' | 'CHECKOUT_EXPIRED' | 'CHECKOUT_INVALIDATED' |
	'CHECKOUT_LOCKED' | 'CHECKOUT_NOT_FOUND' | 'CHECKOUT_UNAUTHORIZED' | 'CHILD_SHARE_FAILS_PARENT' | 'CIRCULAR_DEPENDENCY' | 'CLEAN_SERVICE_ERROR' |
	'CLONE_FIELD_INTEGRITY_EXCEPTION' | 'CLONE_NOT_SUPPORTED' | 'CMS_FOLDER_ITEM_MOVE_FAILED' | 'COLLISION_DETECTED' | 'COMMERCE_SEARCH_INDEXING_SYSTEM_ERROR' |
	'COMMERCE_SEARCH_MQ_ERROR' | 'COMMERCE_SEARCH_PROVIDER_LIMIT_EXCEEDED' | 'COMMERCE_SEARCH_RESOURCE_NOT_FOUND' | 'COMMERCIAL_CONTROL_ERROR' | 'COMMUNITY_NOT_ACCESSIBLE' |
	'CONFLICT' | 'CONFLICTING_ENVIRONMENT_HUB_MEMBER' | 'CONFLICTING_SSO_USER_MAPPING' | 'CONTENT_NOT_FOUND' | 'CONTENT_SEARCH_NOT_ENABLED' | 'CONTENT_TYPE_NOT_FOUND' |
	'COUPON_REDEMPTION_LIMIT_EXCEEDED' | 'CUSTOM_APEX_ERROR' | 'CUSTOM_CLOB_FIELD_LIMIT_EXCEEDED' | 'CUSTOM_ENTITY_OR_FIELD_LIMIT' | 'CUSTOM_FIELD_INDEX_LIMIT_EXCEEDED' |
	'CUSTOM_INDEX_EXISTS' | 'CUSTOM_LINK_LIMIT_EXCEEDED' | 'CUSTOM_METADATA_LIMIT_EXCEEDED' | 'CUSTOM_METADATA_REL_FIELD_MANAGEABILITY' | 'CUSTOM_SETTINGS_LIMIT_EXCEEDED' |
	'CUSTOM_TAB_LIMIT_EXCEEDED' | 'DATAASSESSMENT_CONFIG_ASSESSMENT_IN_PROGRESS_ERROR' | 'DATAASSESSMENT_CONFIG_SERVICE_ERROR' | 'DATACLOUDADDRESS_NO_RECORDS_FOUND' |
	'DATACLOUDADDRESS_PROCESSING_ERROR' | 'DATACLOUDADDRESS_SERVER_ERROR' | 'DATA_MAPPING_NOT_FOUND' | 'DATA_MAPPING_SCHEMA_NOT_FOUND' | 'DATA_TRANSFER_RECORD_LIMIT_EXCEEDED' |
	'DATA_TYPE_NOT_SUPPORTED' | 'DATE_OUT_OF_RANGE' | 'DELETE_FAILED' | 'DELETE_NOT_ALLOWED' | 'DELETE_OPERATION_TOO_LARGE' | 'DELETE_REQUIRED_ON_CASCADE' |
	'DEPENDENCY_EXISTS' | 'DUPLICATES_DETECTED' | 'DUPLICATE_CASE_SOLUTION' | 'DUPLICATE_COMM_NICKNAME' | 'DUPLICATE_CUSTOM_ENTITY_DEFINITION' | 'DUPLICATE_CUSTOM_TAB_MOTIF' |
	'DUPLICATE_DEVELOPER_NAME' | 'DUPLICATE_EXTERNAL_ID' | 'DUPLICATE_MASTER_LABEL' | 'DUPLICATE_SENDER_DISPLAY_NAME' | 'DUPLICATE_USERNAME' | 'DUPLICATE_VALUE' |
	'EMAIL_ADDRESS_BOUNCED' | 'EMAIL_EXTERNAL_TRANSPORT_CONNECTION_ERROR' | 'EMAIL_EXTERNAL_TRANSPORT_PERMISSION_ERROR' | 'EMAIL_EXTERNAL_TRANSPORT_TOKEN_ERROR' |
	'EMAIL_EXTERNAL_TRANSPORT_TOO_LARGE_ERROR' | 'EMAIL_EXTERNAL_TRANSPORT_TOO_MANY_REQUESTS_ERROR' | 'EMAIL_EXTERNAL_TRANSPORT_UNKNOWN_ERROR' | 'EMAIL_NOT_PROCESSED_DUE_TO_PRIOR_ERROR' |
	'EMAIL_OPTED_OUT' | 'EMAIL_TEMPLATE_FORMULA_ERROR' | 'EMAIL_TEMPLATE_MERGEFIELD_ACCESS_ERROR' | 'EMAIL_TEMPLATE_MERGEFIELD_ERROR' | 'EMAIL_TEMPLATE_MERGEFIELD_VALUE_ERROR' |
	'EMAIL_TEMPLATE_PROCESSING_ERROR' | 'EMPTY_CATALOG' | 'EMPTY_INGESTION_JOB' | 'EMPTY_SCONTROL_FILE_NAME' | 'ENHANCED_EMAIL_TEMPLATE_COMPILATION_ERROR' |
	'ENTITY_FAILED_IFLASTMODIFIED_ON_UPDATE' | 'ENTITY_IS_ARCHIVED' | 'ENTITY_IS_DELETED' | 'ENTITY_IS_LOCKED' | 'ENTITY_SAVE_ERROR' | 'ENTITY_SAVE_VALIDATION_ERROR' |
	'ENVIRONMENT_HUB_MEMBERSHIP_CONFLICT' | 'ENVIRONMENT_HUB_MEMBERSHIP_ERROR_JOINING_HUB' | 'ENVIRONMENT_HUB_MEMBERSHIP_USER_ALREADY_IN_HUB' | 'ENVIRONMENT_HUB_MEMBERSHIP_USER_NOT_ORG_ADMIN' |
	'ERROR_CALCULATING_EXPIRY_DATE' | 'ERROR_IN_MAILER' | 'EXCEEDED_MAX_SEMIJOIN_SUBSELECTS_WRITE' | 'EXCHANGE_WEB_SERVICES_URL_INVALID' | 'EXTERNAL_RESOURCE_FORBIDDEN' |
	'FAILED_ACTIVATION' | 'FAILED_DUE_TO_OTHER_INPUTS' | 'FAILED_TO_RESOLVE_MAPPING' | 'FAILED_TO_RESOLVE_SCHEMA_INFORMATION' | 'FIELD_CUSTOM_VALIDATION_EXCEPTION' |
	'FIELD_FILTER_VALIDATION_EXCEPTION' | 'FIELD_INTEGRITY_EXCEPTION' | 'FIELD_KEYWORD_LIST_MATCH_LIMIT' | 'FIELD_MAPPING_ERROR' | 'FIELD_MODERATION_RULE_BLOCK' |
	'FIELD_NOT_UPDATABLE' | 'FILE_EXTENSION_NOT_ALLOWED' | 'FILE_SIZE_LIMIT_EXCEEDED' | 'FILTERED_LOOKUP_LIMIT_EXCEEDED' | 'FIND_DUPLICATES_ERROR' |
	'FLOW_EXCEPTION' | 'FUNCTIONALITY_NOT_ENABLED' | 'GET_EINSTEIN_TENANT_ERROR' | 'HAS_PUBLIC_REFERENCES' | 'HTML_FILE_UPLOAD_NOT_ALLOWED' | 'IAS_AM_AUTH_BAD_REQUEST' |
	'IAS_AM_AUTH_UNAUTHORIZED' | 'IAS_INVALID_AUTH' | 'IAS_INVALID_REQUEST_PARAMETER' | 'IAS_RECORD_DOES_NOT_EXIST' | 'IAS_TENANT_NOT_PROVISIONED' |
	'IAS_UNCOMMITTED_WORK' | 'IMAGE_TOO_LARGE' | 'INACTIVE_OWNER_OR_USER' | 'INACTIVE_RULE_ERROR' | 'INDEX_ITEM_LIMIT_EXCEEDED' | 'INDEX_PAYLOAD_NOT_FOUND' |
	'INGESTION_JOB_RECORDS_LIMIT_EXCEEDED' | 'INGESTION_TOTAL_FILE_SIZE_LIMIT_EXCEEDED' | 'INPUTPARAM_INCOMPATIBLE_DATATYPE' | 'INSERT_UPDATE_DELETE_NOT_ALLOWED_DURING_MAINTENANCE' |
	'INSUFFICIENT_ACCESS' | 'INSUFFICIENT_ACCESS_ON_CROSS_REFERENCE_ENTITY' | 'INSUFFICIENT_ACCESS_OR_READONLY' | 'INSUFFICIENT_ACCESS_TO_INSIGHTSEXTERNALDATA' |
	'INSUFFICIENT_BALANCE' | 'INSUFFICIENT_BENEFIT_REMAINING' | 'INSUFFICIENT_CREDITS' | 'INTEGRATION_CANCELLED' | 'INTERNAL_ERROR' | 'INVALID_ACCESS_LEVEL' |
	'INVALID_ACCESS_TOKEN' | 'INVALID_ACCOUNT' | 'INVALID_API_INPUT' | 'INVALID_ARGUMENT_TYPE' | 'INVALID_ASSIGNEE_TYPE' | 'INVALID_ASSIGNMENT_RULE' |
	'INVALID_AUTH_HEADER' | 'INVALID_BATCH_OPERATION' | 'INVALID_CHECKOUT_INPUT' | 'INVALID_CONTACT' | 'INVALID_CONTENT_TYPE' | 'INVALID_CREDIT_CARD_INFO' |
	'INVALID_CROSS_REFERENCE_KEY' | 'INVALID_CROSS_REFERENCE_TYPE_FOR_FIELD' | 'INVALID_CURRENCY_CONV_RATE' | 'INVALID_CURRENCY_CORP_RATE' | 'INVALID_CURRENCY_ISO' |
	'INVALID_DATASET_REFERENCE_INPUT' | 'INVALID_DATA_CATEGORY_GROUP_REFERENCE' | 'INVALID_DATA_URI' | 'INVALID_EMAIL_ADDRESS' | 'INVALID_EMPTY_KEY_OWNER' |
	'INVALID_ENTITY_FOR_MATCH_ENGINE_ERROR' | 'INVALID_ENTITY_FOR_MATCH_OPERATION_ERROR' | 'INVALID_ENTITY_FOR_UPSERT' | 'INVALID_ENVIRONMENT_HUB_MEMBER' |
	'INVALID_EVENT_DELIVERY' | 'INVALID_EVENT_INPUT' | 'INVALID_EVENT_SUBSCRIPTION' | 'INVALID_EXTENSION_ID' | 'INVALID_EXTERNAL_ID_FIELD_NAME' | 'INVALID_FIELD' |
	'INVALID_FIELD_FOR_INSERT_UPDATE' | 'INVALID_FIELD_WHEN_USING_TEMPLATE' | 'INVALID_FILTER_ACTION' | 'INVALID_GOOGLE_DOCS_URL' | 'INVALID_ID_FIELD' |
	'INVALID_INET_ADDRESS' | 'INVALID_INPUT' | 'INVALID_INPUT_FORMAT' | 'INVALID_KEY_FIELD_INPUT' | 'INVALID_LINEITEM_CLONE_STATE' | 'INVALID_MARKUP' |
	'INVALID_MASTER_OR_TRANSLATED_SOLUTION' | 'INVALID_MERCHANT_ACCOUNT_MODE' | 'INVALID_MERCHANT_ACCOUNT_MODE_OR_STATUS' | 'INVALID_MERGE_RECORD' |
	'INVALID_MESSAGE_ID_REFERENCE' | 'INVALID_NAMESPACE_PREFIX' | 'INVALID_OAUTH_URL' | 'INVALID_OPERATION' | 'INVALID_OPERATOR' | 'INVALID_OR_NULL_FOR_RESTRICTED_PICKLIST' |
	'INVALID_OWNER' | 'INVALID_PACKAGE_LICENSE' | 'INVALID_PACKAGE_VERSION' | 'INVALID_PARTNER_NETWORK_STATUS' | 'INVALID_PAYLOAD_VERSION' | 'INVALID_PERSON_ACCOUNT_OPERATION' |
	'INVALID_PROFILE' | 'INVALID_PROMOTION' | 'INVALID_PROVIDER_TYPE' | 'INVALID_QUERY_KEY' | 'INVALID_QUERY_LOCATOR' | 'INVALID_QUERY_VALUE' | 'INVALID_READ_ONLY_USER_DML' |
	'INVALID_RECEIVEDDOCUMENTID_ATTACHMENT' | 'INVALID_RECORD_ATTRIBUTE_VALUE' | 'INVALID_RECORD_TYPE' | 'INVALID_REFRESH_TOKEN' | 'INVALID_REQUEST_STATE' |
	'INVALID_RUNTIME_VALUE' | 'INVALID_SAVE_AS_ACTIVITY_FLAG' | 'INVALID_SCS_INBOUND_USER' | 'INVALID_SEARCH_PROVIDER_REQUEST' | 'INVALID_SESSION_ID' |
	'INVALID_SETUP_OWNER' | 'INVALID_SIGNUP_COUNTRY' | 'INVALID_SIGNUP_OPTION' | 'INVALID_SITE_DELETE_EXCEPTION' | 'INVALID_SITE_FILE_IMPORTED_EXCEPTION' |
	'INVALID_SITE_FILE_TYPE_EXCEPTION' | 'INVALID_SOURCE_OBJECT_ID' | 'INVALID_STATUS' | 'INVALID_SUBDOMAIN' | 'INVALID_TARGET_OBJECT_NAME' | 'INVALID_TEXT_REPRESENTATION' |
	'INVALID_TYPE' | 'INVALID_TYPE_FOR_OPERATION' | 'INVALID_TYPE_ON_FIELD_IN_RECORD' | 'INVALID_UNMERGE_RECORD' | 'INVALID_USERID' | 'INVALID_USER_OBJECT' |
	'IP_RANGE_LIMIT_EXCEEDED' | 'ITEM_NOT_FOUND' | 'JIGSAW_IMPORT_LIMIT_EXCEEDED' | 'LICENSE_LIMIT_EXCEEDED' | 'LIGHT_PORTAL_USER_EXCEPTION' | 'LIMIT_EXCEEDED' |
	'LIST_PRICE_NOT_FOUND' | 'MALFORMED_ID' | 'MANAGER_NOT_DEFINED' | 'MASSMAIL_RETRY_LIMIT_EXCEEDED' | 'MASS_MAIL_LIMIT_EXCEEDED' | 'MATCH_DEFINITION_ERROR' |
	'MATCH_OPERATION_ERROR' | 'MATCH_OPERATION_INVALID_ENGINE_ERROR' | 'MATCH_OPERATION_INVALID_RULE_ERROR' | 'MATCH_OPERATION_MISSING_ENGINE_ERROR' |
	'MATCH_OPERATION_MISSING_OBJECT_TYPE_ERROR' | 'MATCH_OPERATION_MISSING_OPTIONS_ERROR' | 'MATCH_OPERATION_MISSING_RULE_ERROR' | 'MATCH_OPERATION_UNKNOWN_RULE_ERROR' |
	'MATCH_OPERATION_UNSUPPORTED_VERSION_ERROR' | 'MATCH_PRECONDITION_FAILED' | 'MATCH_PRECONDITION_REQUIRED' | 'MATCH_RUNTIME_ERROR' | 'MATCH_SERVICE_ERROR' |
	'MATCH_SERVICE_TIMED_OUT' | 'MATCH_SERVICE_UNAVAILABLE_ERROR' | 'MAXIMUM_CCEMAILS_EXCEEDED' | 'MAXIMUM_DASHBOARD_COMPONENTS_EXCEEDED' | 'MAXIMUM_HIERARCHY_CHILDREN_REACHED' |
	'MAXIMUM_HIERARCHY_LEVELS_REACHED' | 'MAXIMUM_HIERARCHY_TREE_SIZE_REACHED' | 'MAXIMUM_SIZE_OF_ATTACHMENT' | 'MAXIMUM_SIZE_OF_DOCUMENT' | 'MAX_ACTIONS_PER_RULE_EXCEEDED' |
	'MAX_ACTIVE_RULES_EXCEEDED' | 'MAX_APPROVAL_STEPS_EXCEEDED' | 'MAX_DEPTH_IN_FLOW_EXECUTION' | 'MAX_FORMULAS_PER_RULE_EXCEEDED' | 'MAX_LIMIT_EXCEEDED' |
	'MAX_RULES_EXCEEDED' | 'MAX_RULE_ENTRIES_EXCEEDED' | 'MAX_TASK_DESCRIPTION_EXCEEEDED' | 'MAX_TM_RULES_EXCEEDED' | 'MAX_TM_RULE_ITEMS_EXCEEDED' |
	'MAX_TRIGGERS_EXCEEDED' | 'MERGE_FAILED' | 'METADATA_FIELD_UPDATE_ERROR' | 'METHOD_NOT_ALLOWED' | 'MISMATCHING_TYPES' | 'MISSING_ARGUMENT' | 'MISSING_OMNI_PROCESS_ID' |
	'MISSING_RECEIVEDDOCUMENTID_ATTACHMENT' | 'MISSING_RECORD' | 'MIXED_DML_OPERATION' | 'MULTIPLE_CONTENT_FOUND' | 'MULTIPLE_VOUCHERS' | 'NONUNIQUE_SHIPPING_ADDRESS' |
	'NOT_FOUND' | 'NOT_RECOVERABLE_SEARCH_PROVIDER_ERROR' | 'NO_ACCESS_TOKEN' | 'NO_ACCESS_TOKEN_FROM_REFRESH' | 'NO_APPLICABLE_PROCESS' | 'NO_ATTACHMENT_PERMISSION' |
	'NO_AUTH_PROVIDER' | 'NO_INACTIVE_DIVISION_MEMBERS' | 'NO_MASS_MAIL_PERMISSION' | 'NO_PARTNER_PERMISSION' | 'NO_REFRESH_TOKEN' | 'NO_SEARCH_ATTRIBUTES' |
	'NO_SINGLE_MAIL_PERMISSION' | 'NO_SORT_PRICEBOOK_ASSOCIATED_ERROR' | 'NO_SUCH_USER_EXISTS' | 'NO_TOKEN_ENDPOINT' | 'NUMBER_OUTSIDE_VALID_RANGE' |
	'NUM_HISTORY_FIELDS_BY_SOBJECT_EXCEEDED' | 'OCR_INVALID_REQUEST' | 'OPERATION_ENQUEUED' | 'OPTED_OUT_OF_MASS_MAIL' | 'OP_WITH_INVALID_USER_TYPE_EXCEPTION' |
	'ORCHESTRATION_INVALID' | 'ORDER_MANAGEMENT_ACTION_NOT_ALLOWED' | 'ORDER_MANAGEMENT_INVALID_RECORD' | 'ORDER_MANAGEMENT_RECORD_EXISTS' | 'ORDER_MANAGEMENT_RECORD_NOT_FOUND' |
	'PACKAGE_DISABLED' | 'PACKAGE_LICENSE_REQUIRED' | 'PACKAGING_API_INSTALL_FAILED' | 'PACKAGING_API_UNINSTALL_FAILED' | 'PALI_INVALID_ACTION_ID' |
	'PALI_INVALID_ACTION_NAME' | 'PALI_INVALID_ACTION_TYPE' | 'PAL_INVALID_ASSISTANT_RECOMMENDATION_TYPE_ID' | 'PAL_INVALID_ENTITY_ID' | 'PAL_INVALID_FLEXIPAGE_ID' |
	'PAL_INVALID_LAYOUT_ID' | 'PAL_INVALID_PARAMETERS' | 'PARAMETER_TOO_LARGE' | 'PARTICIPANT_RELATIONSHIP_EXISTS' | 'PAYLOAD_SIZE_EXCEEDED' | 'PA_API_EXCEPTION' |
	'PA_AXIS_FAULT' | 'PA_INVALID_ID_EXCEPTION' | 'PA_NO_ACCESS_EXCEPTION' | 'PA_NO_DATA_FOUND_EXCEPTION' | 'PA_URI_SYNTAX_EXCEPTION' | 'PA_VISIBLE_ACTIONS_FILTER_ORDERING_EXCEPTION' |
	'PENDING_COMMIT' | 'PICKLIST_INACTIVE_VALUES_EXCEEDED' | 'PLATFORM_EVENT_ENCRYPTION_ERROR' | 'PLATFORM_EVENT_PUBLISHING_UNAVAILABLE' | 'PLATFORM_EVENT_PUBLISH_FAILED' |
	'PORTAL_NO_ACCESS' | 'PORTAL_USER_ALREADY_EXISTS_FOR_CONTACT' | 'PORTAL_USER_CREATION_RESTRICTED_WITH_ENCRYPTION' | 'PRICE_NOT_FOUND' | 'PRIVATE_CONTACT_ON_ASSET' |
	'PROCESSING_HALTED' | 'PROGRAM_PROGRESS_NOT_ACTIVE' | 'QA_INVALID_CREATE_FEED_ITEM' | 'QA_INVALID_SUCCESS_MESSAGE' | 'QUERY_REFINEMENT_VALUE_LIMIT_EXCEEDED' |
	'QUERY_TIMEOUT' | 'QUICK_ACTION_LIST_ITEM_NOT_ALLOWED' | 'QUICK_ACTION_LIST_NOT_ALLOWED' | 'RECORD_CREATION_FAILED' | 'RECORD_IN_USE_BY_WORKFLOW' |
	'RECORD_UPDATE_FAILED' | 'RECOVERABLE_SEARCH_PROVIDER_ERROR' | 'RELATED_ENTITY_FILTER_VALIDATION_EXCEPTION' | 'REL_FIELD_BAD_ACCESSIBILITY' | 'REPUTATION_MINIMUM_NUMBER_NOT_REACHED' |
	'REQUEST_RUNNING_TOO_LONG' | 'REQUIRED_FEATURE_MISSING' | 'REQUIRED_FIELD_MISSING' | 'REQUIRE_CONNECTED_APP_SCS' | 'REQUIRE_CONNECTED_APP_SESSION_SCS' |
	'REQUIRE_RUNAS_USER' | 'RETRIEVE_EXCHANGE_ATTACHMENT_FAILED' | 'RETRIEVE_EXCHANGE_EMAIL_FAILED' | 'RETRIEVE_EXCHANGE_EVENT_FAILED' | 'RETRIEVE_GOOGLE_EMAIL_FAILED' |
	'RETRIEVE_GOOGLE_EVENT_FAILED' | 'RETRIEVE_USER_CONFIG_ERROR' | 'ROUTES_EVALUATION_LIMIT_EXCEEDED' | 'SALESFORCE_INBOX_TRANSPORT_CONNECTION_ERROR' |
	'SALESFORCE_INBOX_TRANSPORT_INVALID_INPUT_ERROR' | 'SALESFORCE_INBOX_TRANSPORT_TOKEN_ERROR' | 'SALESFORCE_INBOX_TRANSPORT_UNKNOWN_ERROR' | 'SCHEMA_OBJECT_NOT_FOUND' |
	'SCREEN_POP_REQUIRED_INPUT_MISSING' | 'SEARCH_PROVIDER_REQUEST_RATE_EXCEEDED' | 'SEGMENT_COUNT_LIMIT_EXCEEDED' | 'SELF_REFERENCE_FROM_FLOW' | 'SELF_REFERENCE_FROM_TRIGGER' |
	'SERVICE_UNAVAILABLE' | 'SESSION_EXPIRED' | 'SESSION_INVALIDATED' | 'SHARE_NEEDED_FOR_CHILD_OWNER' | 'SINGLE_EMAIL_LIMIT_EXCEEDED' | 'SLACK_API_ERROR' |
	'SOCIAL_ACCOUNT_NOT_FOUND' | 'SOCIAL_ACTION_INVALID' | 'SOCIAL_PERSONA_NOT_FOUND' | 'SOCIAL_POST_INVALID' | 'SOCIAL_POST_NOT_FOUND' | 'SPECIFICATION_GENERATION_EXCEPTION' |
	'STANDARD_PRICE_NOT_DEFINED' | 'STORAGE_LIMIT_EXCEEDED' | 'STRING_TOO_LONG' | 'SUBDOMAIN_IN_USE' | 'TABSET_LIMIT_EXCEEDED' | 'TEMPLATE_NOT_ACTIVE' |
	'TEMPLATE_NOT_FOUND' | 'TERMS_OF_SERVICE_UNREAD' | 'TERRITORY_REALIGN_IN_PROGRESS' | 'TEXT_DATA_OUTSIDE_SUPPORTED_CHARSET' | 'TEXT_TO_PICKLIST_VALUES_EXCEEDED' |
	'TOO_MANY_APEX_REQUESTS' | 'TOO_MANY_ENUM_VALUE' | 'TOO_MANY_JOBS' | 'TOO_MANY_POSSIBLE_USERS_EXIST' | 'TRANSFER_REQUIRES_READ' | 'UISF_ENTITY_QUERY_FAILED' |
	'UISF_NO_MAPPINGS_FOUND' | 'UISF_TOKEN_NOT_FOUND' | 'UISF_UNKNOWN_EXCEPTION' | 'UISF_USER_MAPPING_FAILED' | 'UNABLE_TO_LOCK_ROW' | 'UNAUTHORIZED_SEARCH_PROVIDER_REQUEST' |
	'UNAVAILABLE_RECORDTYPE_EXCEPTION' | 'UNAVAILABLE_REF' | 'UNDEFINED_MAPPING_DEFINITION' | 'UNDELETE_FAILED' | 'UNKNOWN_EXCEPTION' | 'UNKNOWN_TOKEN_ERROR' |
	'UNQUALIFIED_CART' | 'UNSAFE_HTML_CONTENT' | 'UNSPECIFIED_EMAIL_ADDRESS' | 'UNSUPPORTED_APEX_TRIGGER_OPERATON' | 'UNSUPPORTED_MODE' | 'UNSUPPORTED_PAYMENT_GATEWAY_TYPE' |
	'UNSUPPORTED_PAYMENT_REQUEST_TYPE' | 'UNSUPPORTED_SITE' | 'UNSUPPORTED_SITE_FILE_IMPORTED_EXCEPTION' | 'UNSUPPORTED_SOCIAL_PROVIDER' | 'UNVERIFIED_SENDER_ADDRESS' |
	'UPDATE_GOOGLE_EMAIL_LABEL_FAILED' | 'USER_OWNS_PORTAL_ACCOUNT_EXCEPTION' | 'USER_WITHOUT_WEM_PERMISSION' | 'USER_WITH_APEX_SHARES_EXCEPTION' |
	'VARIANT_NOT_FOUND' | 'VF_COMPILE_ERROR' | 'WEBLINK_SIZE_LIMIT_EXCEEDED' | 'WEBLINK_URL_INVALID' | 'WEM_SEGMENTS_CAN_NOT_HAVE_NON_ACTIVE_SEGMENT_TYPE' |
	'WEM_SHIFT_SEGMENT_TIME_IS_OUTSIDE_OF_THE_SHIFT_DURATION' | 'WEM_USER_NOT_ORG_ADMIN' | 'WORKSPACE_NOT_FOUND' | 'WRONG_CONTROLLER_TYPE' | 'XCLEAN_DJ_MATCH_IGNORABLE_ERROR' |
	'XCLEAN_DJ_MATCH_INTERNAL_DJ_ERROR' | 'XCLEAN_DJ_MATCH_NON_RETRIABLE_ERROR' | 'XCLEAN_DJ_MATCH_RETRIABLE_ERROR' | 'XCLEAN_DJ_MATCH_UNKNOWN_ERROR' |
	'XCLEAN_UNEXPECTED_ERROR';

// Types

export interface DeployDetails {
    componentFailures?: Array<DeployMessage>;
    componentSuccesses?: Array<DeployMessage>;
    retrieveResult?: RetrieveResult;
    runTestResult?: RunTestsResult;
}

export interface FlowCoverageResult {
    elementsNotCovered?: Array<string>;
    flowId: string;
    flowName: string;
    flowNamespace?: string | null;
    numElements: number; // xsd-type: "int"
    numElementsNotCovered: number; // xsd-type: "int"
    processType: FlowProcessType;
}

export interface FlowCoverageWarning {
    flowId?: string | null;
    flowName?: string | null;
    flowNamespace?: string | null;
    message: string;
}

export interface MetadataInfo {
    fullName?: string;
}

export interface AIApplicationMetadata extends MetadataInfo {
    developerName: string;
    masterLabel?: string;
    status: AIApplicationStatus;
    type: AIApplicationType;
}

export interface AIApplicationConfigMetadata extends MetadataInfo {
    aiApplicationDeveloperName: string;
    applicationId?: string;
    developerName: string;
    insightReasonEnabled?: boolean;
    masterLabel?: string;
    rank?: number; // xsd-type: "int"
    scoringMode?: AIScoringMode;
}

export interface AIReplyRecommendationsSettingsMetadata extends MetadataInfo {
    enableAIReplyRecommendations?: boolean;
}

export interface AccountInsightsSettingsMetadata extends MetadataInfo {
    enableAccountInsights?: boolean;
}

export interface AccountIntelligenceSettingsMetadata extends MetadataInfo {
    enableAccountLogos?: boolean;
    enableAutomatedAccountFields?: boolean;
    enableNewsStories?: boolean;
}

export interface AccountRelationshipShareRuleMetadata extends MetadataInfo {
    accessLevel: string;
    accountToCriteriaField: string;
    description?: string;
    entityType: string;
    masterLabel: string;
    staticFormulaCriteria?: string;
    type: string;
}

export interface AccountSettingsMetadata extends MetadataInfo {
    enableAccountDiscovery?: boolean;
    enableAccountHistoryTracking?: boolean;
    enableAccountInsightsInMobile?: boolean;
    enableAccountOwnerReport?: boolean;
    enableAccountTeams?: boolean;
    enableContactHistoryTracking?: boolean;
    enableRelateContactToMultipleAccounts?: boolean;
    showViewHierarchyLink?: boolean;
}

export interface ActionLauncherItemDefMetadata extends MetadataInfo {
    identifier: string;
    itemActionType: ItemActionType;
    itemCategory: ItemCategory;
    itemLanguage: string;
    masterLabel: string;
    subType: string;
    type: string;
    versionNumber: string;
}

export interface ActionLinkGroupTemplateMetadata extends MetadataInfo {
    actionLinkTemplates?: Array<ActionLinkTemplate>;
    category: PlatformActionGroupCategory;
    executionsAllowed: ActionLinkExecutionsAllowed;
    hoursUntilExpiration?: number; // xsd-type: "int"
    isPublished: boolean;
    name: string;
}

export interface ActionLinkTemplate {
    actionUrl: string;
    headers?: string;
    isConfirmationRequired: boolean;
    isGroupDefault: boolean;
    label?: string;
    labelKey: string;
    linkType: ActionLinkType;
    method: ActionLinkHttpMethod;
    position: number; // xsd-type: "int"
    requestBody?: string;
    userAlias?: string;
    userVisibility: ActionLinkUserVisibility;
}

export interface ActionPlanTemplateMetadata extends MetadataInfo {
    actionPlanTemplateItem?: Array<ActionPlanTemplateItem>;
    actionPlanTemplateItemDependencies?: Array<ActionPlanTemplateItemDependency>;
    description?: string;
    isAdHocItemCreationEnabled: boolean;
    name: string;
    targetEntityType: string;
    uniqueName: string;
}

export interface ActionPlanTemplateItem {
    actionPlanTemplateItemValue?: Array<ActionPlanTemplateItemValue>;
    displayOrder?: number; // xsd-type: "int"
    isRequired?: boolean;
    itemEntityType: string;
    name: string;
    uniqueName: string;
}

export interface ActionPlanTemplateItemValue {
    itemEntityType: string;
    name: string;
    valueFormula?: string;
    valueLiteral?: string;
}

export interface ActionPlanTemplateItemDependency {
    creationType: string;
    name: string;
    previousTemplateItem: ActionPlanTemplateItem;
    templateItem: ActionPlanTemplateItem;
}

export interface ActionsSettingsMetadata extends MetadataInfo {
    enableDefaultQuickActionsOn?: boolean;
    enableMdpEnabled?: boolean;
    enableOfflineWebLinks?: boolean;
    enableThirdPartyActions?: boolean;
}

export interface ActivitiesSettingsMetadata extends MetadataInfo {
    allowUsersToRelateMultipleContactsToTasksAndEvents?: boolean;
    autoRelateEventAttendees?: boolean;
    enableActivityReminders?: boolean;
    enableClickCreateEvents?: boolean;
    enableDragAndDropScheduling?: boolean;
    enableEmailTracking?: boolean;
    enableFlowTaskNotifsViaApex?: boolean;
    enableGroupTasks?: boolean;
    enableHideChildEventsPreference?: boolean;
    enableListViewScheduling?: boolean;
    enableLogNote?: boolean;
    enableMLSingleClientProfile?: boolean;
    enableMultidayEvents?: boolean;
    enableRecurringEvents?: boolean;
    enableRecurringTasks?: boolean;
    enableRollUpActivToContactsAcct?: boolean;
    enableSidebarCalendarShortcut?: boolean;
    enableSimpleTaskCreateUI?: boolean;
    enableTimelineCompDateSort?: boolean;
    enableUNSTaskDelegatedToNotifications?: boolean;
    enableUserListViewCalendars?: boolean;
    meetingRequestsLogo?: string;
    showCustomLogoMeetingRequests?: boolean;
    showEventDetailsMultiUserCalendar?: boolean;
    showHomePageHoverLinksForEvents?: boolean;
    showMyTasksHoverLinks?: boolean;
}

export interface AddressSettingsMetadata extends MetadataInfo {
    countriesAndStates: CountriesAndStates;
}

export interface CountriesAndStates {
    countries?: Array<Country>;
}

export interface Country {
    active: boolean;
    integrationValue: string;
    isoCode: string;
    label: string;
    orgDefault: boolean;
    standard: boolean;
    states?: Array<State>;
    visible: boolean;
}

export interface State {
    active: boolean;
    integrationValue: string;
    isoCode: string;
    label: string;
    standard: boolean;
    visible: boolean;
}

export interface AnalyticSnapshotMetadata extends MetadataInfo {
    description?: string;
    groupColumn?: string;
    mappings?: Array<AnalyticSnapshotMapping>;
    name: string;
    runningUser?: string;
    sourceReport: string;
    targetObject: string;
}

export interface AnalyticSnapshotMapping {
    aggregateType?: ReportSummaryType;
    sourceField: string;
    sourceType: ReportJobSourceTypes;
    targetField: string;
}

export interface AnalyticsSettingsMetadata extends MetadataInfo {
    alwaysGenPreviews?: boolean;
    analyticsAdoptionMetadata?: boolean;
    autoInstallApps?: boolean;
    canAccessAnalyticsViaAPI?: boolean;
    canAnnotateDashboards?: boolean;
    canEnableSavedView?: boolean;
    canExploreDataConversationally?: boolean;
    canShareAppsWithCommunities?: boolean;
    canViewThumbnailAssets?: boolean;
    enableAmazonRedshiftOutputConnector?: boolean;
    enableAnalyticsEncryption?: boolean;
    enableAnalyticsSharingEnable?: boolean;
    enableAutoCompleteCombo?: boolean;
    enableAutonomousExperience?: boolean;
    enableAzureDLGen2OutputConnector?: boolean;
    enableC360GlobalProfileData?: boolean;
    enableCreateLegacyDataflows?: boolean;
    enableDashboardComponentSnapshot?: boolean;
    enableDashboardFlexiTable?: boolean;
    enableDashboardToPDFEnable?: boolean;
    enableEmailReportsToPortalUsers?: boolean;
    enableFirebirdEditor?: boolean;
    enableFloatingReportHeaders?: boolean;
    enableInsights?: boolean;
    enableInsightsHCMode?: boolean;
    enableLightningReportBuilder?: boolean;
    enableLotusNotesImages?: boolean;
    enableMassEnableReportBuilder?: boolean;
    enableNewChartsEngine?: boolean;
    enableNullDimension?: boolean;
    enableOrgCanSeeLivePreviews?: boolean;
    enableOrgCanViewTableau?: boolean;
    enableOrgCanViewThumbnailForOA?: boolean;
    enableOrgHasMobileOfflineEnabled?: boolean;
    enableOrgHasWatchlistEnabled?: boolean;
    enableQueryLiveConnectors?: boolean;
    enableRemoveFooterForRepDisplay?: boolean;
    enableRemoveFooterFromRepExp?: boolean;
    enableReportHideXlsExportPref?: boolean;
    enableReportInlineEditPref?: boolean;
    enableReportNotificationsEnable?: boolean;
    enableRequestPrioritySchdl?: boolean;
    enableS1AnalyticsEclairEnable?: boolean;
    enableS3OutputConnector?: boolean;
    enableSFXJoinedReportsEnable?: boolean;
    enableSalesforceOutputConnector?: boolean;
    enableSecureImageSharing?: boolean;
    enableSnowflakeOutputConnector?: boolean;
    enableTableauHyperOutputConnector?: boolean;
    enableUseOldChartsLookAndFeel?: boolean;
    enableWaveAssetsNewDateVersion?: boolean;
    enableWaveCustomFiscal?: boolean;
    enableWaveIndexMVDim?: boolean;
    enableWaveIndexMVDimV2?: boolean;
    enableWaveMultiCurrency?: boolean;
    enableWaveRecordNavigation?: boolean;
    enableWaveReplication?: boolean;
    enableWaveSharingInheritance?: boolean;
    enableWaveSqlCFIndexing?: boolean;
    enableWaveTrendedDatasetCleanup?: boolean;
    etlOrchestrationPref?: boolean;
    isHighVolumePushbackEnabled?: boolean;
    maxHoursAppInProgress?: number; // xsd-type: "int"
    recipeDirectDataPref?: boolean;
    recipeFiscalPref?: boolean;
    recipePreCachingOptOut?: boolean;
    recipeStagedDataPref?: boolean;
    replaceBlankMeasuresWithNulls?: boolean;
    setWaveIsYearEndFiscalYear?: boolean;
    sonicEnabled?: boolean;
    turnOnTimeZones?: boolean;
}

export interface AnimationRuleMetadata extends MetadataInfo {
    animationFrequency: string;
    developerName: string;
    isActive: boolean;
    masterLabel: string;
    recordTypeContext: string;
    recordTypeName?: string;
    sobjectType: string;
    targetField: string;
    targetFieldChangeToValues: string;
}

export interface ApexEmailNotificationsMetadata extends MetadataInfo {
    apexEmailNotification?: Array<ApexEmailNotification>;
}

export interface ApexEmailNotification {
    email?: string;
    user?: string;
}

export interface ApexSettingsMetadata extends MetadataInfo {
    defaultQueueableDelay?: number; // xsd-type: "int"
    enableAggregateCodeCoverageOnly?: boolean;
    enableApexAccessRightsPref?: boolean;
    enableApexApprovalLockUnlock?: boolean;
    enableApexCtrlImplicitWithSharingPref?: boolean;
    enableApexPropertyGetterPref?: boolean;
    enableAuraApexCtrlAuthUserAccessCheckPref?: boolean;
    enableAuraApexCtrlGuestUserAccessCheckPref?: boolean;
    enableCompileOnDeploy?: boolean;
    enableDisableParallelApexTesting?: boolean;
    enableDoNotEmailDebugLog?: boolean;
    enableGaplessTestAutoNum?: boolean;
    enableMngdCtrlActionAccessPref?: boolean;
    enableNonCertifiedApexMdCrud?: boolean;
    enableRestrictCommunityExecAnon?: boolean;
    enableSecureNoArgConstructorPref?: boolean;
}

export interface ApexTestSuiteMetadata extends MetadataInfo {
    testClassName?: Array<string>;
}

export interface AppExperienceSettingsMetadata extends MetadataInfo {
    doesHideAllAppsInAppLauncher?: boolean;
}

export interface AppMenuMetadata extends MetadataInfo {
    appMenuItems?: Array<AppMenuItem>;
}

export interface AppMenuItem {
    name: string;
    type: string;
}

export interface ApplicationSubtypeDefinitionMetadata extends MetadataInfo {
    applicationUsageType: AppDomainUsageType;
    description?: string;
    masterLabel: string;
}

export interface AppointmentAssignmentPolicyMetadata extends MetadataInfo {
    masterLabel: string;
    policyApplicableDuration: PolicyApplicableDuration;
    policyType: AssignmentPolicyType;
    utilizationFactor: UtilizationFactor;
}

export interface AppointmentSchedulingPolicyMetadata extends MetadataInfo {
    appointmentAssignmentPolicy?: string;
    appointmentStartTimeInterval: string;
    extCalEventHandler?: string;
    isSvcTerrOpHoursWithShiftsUsed?: boolean;
    isSvcTerritoryMemberShiftUsed?: boolean;
    masterLabel: string;
    shouldCheckExternalCalendar: boolean;
    shouldConsiderCalendarEvents: boolean;
    shouldEnforceExcludedResource: boolean;
    shouldEnforceRequiredResource: boolean;
    shouldMatchSkill: boolean;
    shouldMatchSkillLevel: boolean;
    shouldRespectVisitingHours: boolean;
    shouldUsePrimaryMembers: boolean;
    shouldUseSecondaryMembers: boolean;
}

export interface ApprovalProcessMetadata extends MetadataInfo {
    active: boolean;
    allowRecall?: boolean;
    allowedSubmitters?: Array<ApprovalSubmitter>;
    approvalPageFields?: ApprovalPageField;
    approvalStep?: Array<ApprovalStep>;
    description?: string;
    emailTemplate?: string;
    enableMobileDeviceAccess?: boolean;
    entryCriteria?: ApprovalEntryCriteria;
    finalApprovalActions?: ApprovalAction;
    finalApprovalRecordLock?: boolean;
    finalRejectionActions?: ApprovalAction;
    finalRejectionRecordLock?: boolean;
    initialSubmissionActions?: ApprovalAction;
    label: string;
    nextAutomatedApprover?: NextAutomatedApprover;
    postTemplate?: string;
    processOrder?: number; // xsd-type: "int"
    recallActions?: ApprovalAction;
    recordEditability: RecordEditabilityType;
    showApprovalHistory?: boolean;
}

export interface ApprovalSubmitter {
    submitter?: string;
    type: ProcessSubmitterType;
}

export interface ApprovalPageField {
    field?: Array<string>;
}

export interface ApprovalStep {
    allowDelegate?: boolean;
    approvalActions?: ApprovalAction;
    assignedApprover: ApprovalStepApprover;
    description?: string;
    entryCriteria?: ApprovalEntryCriteria;
    ifCriteriaNotMet?: StepCriteriaNotMetType;
    label: string;
    name: string;
    rejectBehavior?: ApprovalStepRejectBehavior;
    rejectionActions?: ApprovalAction;
}

export interface ApprovalAction {
    action?: Array<WorkflowActionReference>;
}

export interface WorkflowActionReference {
    name: string;
    type: WorkflowActionType;
}

export interface ApprovalStepApprover {
    approver?: Array<Approver>;
    whenMultipleApprovers?: RoutingType;
}

export interface Approver {
    name?: string;
    type: NextOwnerType;
}

export interface ApprovalEntryCriteria {
    booleanFilter?: string;
    criteriaItems?: Array<FilterItem>;
    formula?: string;
}

export interface FilterItem {
    field: string;
    operation: FilterOperation;
    value?: string;
    valueField?: string;
}

export interface DuplicateRuleFilterItem extends FilterItem {
    sortOrder: number; // xsd-type: "int"
    table: string;
}

export interface ApprovalStepRejectBehavior {
    type: StepRejectBehaviorType;
}

export interface NextAutomatedApprover {
    useApproverFieldOfRecordOwner?: boolean;
    userHierarchyField: string;
}

export interface ArchiveSettingsMetadata extends MetadataInfo {
    enableEntityArchivingEnabled?: boolean;
}

export interface AssignmentRuleMetadata extends MetadataInfo {
    active?: boolean;
    ruleEntry?: Array<RuleEntry>;
}

export interface RuleEntry {
    assignedTo?: string;
    assignedToType?: AssignToLookupValueType;
    booleanFilter?: string;
    businessHours?: string;
    businessHoursSource?: BusinessHoursSourceType;
    criteriaItems?: Array<FilterItem>;
    disableEscalationWhenModified?: boolean;
    escalationAction?: Array<EscalationAction>;
    escalationStartTime?: EscalationStartTimeType;
    formula?: string;
    notifyCcRecipients?: boolean;
    overrideExistingTeams?: boolean;
    replyToEmail?: string;
    senderEmail?: string;
    senderName?: string;
    team?: Array<string>;
    template?: string;
}

export interface EscalationAction {
    assignedTo?: string;
    assignedToTemplate?: string;
    assignedToType?: AssignToLookupValueType;
    minutesToEscalation?: number; // xsd-type: "int"
    notifyCaseOwner?: boolean;
    notifyEmail?: Array<string>;
    notifyTo?: string;
    notifyToTemplate?: string;
}

export interface AssignmentRulesMetadata extends MetadataInfo {
    assignmentRule?: Array<AssignmentRuleMetadata>;
}

export interface AudienceMetadata extends MetadataInfo {
    audienceName: string;
    container: string;
    criteria: AudienceCriteria;
    description?: string;
    formula?: string;
    formulaFilterType?: FormulaFilterType;
    isDefaultAudience?: boolean;
    targets?: PersonalizationTargetInfos;
}

export interface AudienceCriteria {
    criterion?: Array<AudienceCriterion>;
}

export interface AudienceCriterion {
    criteriaNumber?: number; // xsd-type: "int"
    criterionValue?: AudienceCriteriaValue;
    operator?: AudienceCriterionOperator;
    type: AudienceCriterionType;
}

export interface AudienceCriteriaValue {
    audienceDeveloperName?: string;
    city?: string;
    country?: string;
    domain?: string;
    entityField?: string;
    entityType?: string;
    fieldValue?: string;
    isEnabled?: string;
    permissionName?: string;
    permissionType?: string;
    profile?: string;
    subdivision?: string;
}

export interface PersonalizationTargetInfos {
    target?: Array<PersonalizationTargetInfo>;
}

export interface PersonalizationTargetInfo {
    groupName: string;
    priority?: number; // xsd-type: "int"
    targetType: string;
    targetValue: string;
}

export interface AuraDefinitionBundleMetadata extends MetadataInfo {
    SVGContent?: string; // xsd-type: "base64Binary"
    apiVersion?: number; // xsd-type: "double"
    auraDefinitions?: AuraDefinitions;
    controllerContent?: string; // xsd-type: "base64Binary"
    description?: string;
    designContent?: string; // xsd-type: "base64Binary"
    documentationContent?: string; // xsd-type: "base64Binary"
    helperContent?: string; // xsd-type: "base64Binary"
    markup?: string; // xsd-type: "base64Binary"
    modelContent?: string; // xsd-type: "base64Binary"
    packageVersions?: Array<PackageVersion>;
    rendererContent?: string; // xsd-type: "base64Binary"
    styleContent?: string; // xsd-type: "base64Binary"
    testsuiteContent?: string; // xsd-type: "base64Binary"
    type?: AuraBundleType;
}

export interface AuraDefinitions {
    auraDefinition?: Array<AuraDefinition>;
}

export interface AuraDefinition {
    defType: string;
    source: string; // xsd-type: "base64Binary"
}

export interface PackageVersion {
    majorNumber: number; // xsd-type: "int"
    minorNumber: number; // xsd-type: "int"
    namespace: string;
}

export interface AuthProviderMetadata extends MetadataInfo {
    appleTeam?: string;
    authorizeUrl?: string;
    consumerKey?: string;
    consumerSecret?: string;
    controlPlane?: MuleSoftControlPlane | null;
    customMetadataTypeRecord?: string;
    defaultScopes?: string;
    ecKey?: string;
    errorUrl?: string;
    executionUser?: string;
    friendlyName: string;
    iconUrl?: string;
    idTokenIssuer?: string;
    includeOrgIdInIdentifier?: boolean;
    linkKickoffUrl?: string;
    logoutUrl?: string;
    oauthKickoffUrl?: string;
    plugin?: string;
    portal?: string;
    providerType: AuthProviderType;
    registrationHandler?: string;
    sendAccessTokenInHeader?: boolean;
    sendClientCredentialsInHeader?: boolean;
    sendSecretInApis?: boolean;
    ssoKickoffUrl?: string;
    tokenUrl?: string;
    userInfoUrl?: string;
}

export interface AutoResponseRuleMetadata extends MetadataInfo {
    active?: boolean;
    ruleEntry?: Array<RuleEntry>;
}

export interface AutoResponseRulesMetadata extends MetadataInfo {
    autoResponseRule?: Array<AutoResponseRuleMetadata>;
}

export interface AutomatedContactsSettingsMetadata extends MetadataInfo {
    enableAddContactAutomatically?: boolean;
    enableAddContactRoleAutomatically?: boolean;
    enableAddContactRoleWithSuggestion?: boolean;
    enableAddContactWithSuggestion?: boolean;
}

export interface BatchProcessJobDefinitionMetadata extends MetadataInfo {
    batchSize: number; // xsd-type: "int"
    dataSource: BatchDataSource;
    description?: string;
    executionProcessApiName?: string;
    flowApiName?: string;
    flowInputVariable?: string;
    masterLabel: string;
    processGroup: string;
    retryCount: number; // xsd-type: "int"
    retryInterval: number; // xsd-type: "int"
    status?: string;
    type?: string;
}

export interface BatchDataSource {
    condition: string;
    criteria?: string;
    filters?: Array<BatchDataSrcFilterCriteria>;
    sourceObject: string;
    sourceObjectField?: string;
}

export interface BatchDataSrcFilterCriteria {
    dynamicValue: boolean;
    dynamicValueType?: string;
    fieldName: string;
    fieldValue: string;
    operator: string;
    sequenceNo: number; // xsd-type: "int"
}

export interface BlacklistedConsumerMetadata extends MetadataInfo {
    blockedByApiWhitelisting: boolean;
    consumerKey: string;
    consumerName: string;
    masterLabel: string;
}

export interface BlockchainSettingsMetadata extends MetadataInfo {
    enableBcp?: boolean;
    enableEtpNft?: boolean;
}

export interface BotMetadata extends MetadataInfo {
    botMlDomain?: LocalMlDomain;
    botUser?: string;
    botVersions?: Array<BotVersionMetadata>;
    contextVariables?: Array<ConversationContextVariable>;
    conversationChannelProviders?: Array<ConversationDefinitionChannelProvider>;
    defaultOutboundFlow?: string;
    description?: string;
    label?: string;
    logPrivateConversationData?: boolean;
    richContentEnabled?: boolean;
}

export interface LocalMlDomain {
    label: string;
    mlIntents?: Array<MlIntent>;
    mlSlotClasses?: Array<MlSlotClass>;
    name: string;
}

export interface MlIntent {
    description?: string;
    developerName: string;
    label: string;
    mlIntentUtterances?: Array<MlIntentUtterance>;
    relatedMlIntents?: Array<MlRelatedIntent>;
}

export interface MlIntentUtterance {
    language?: Language;
    utterance: string;
}

export interface MlRelatedIntent {
    relatedMlIntent: string;
}

export interface MlSlotClass {
    dataType: MlSlotClassDataType;
    description?: string;
    developerName: string;
    extractionRegex?: string;
    extractionType?: MlSlotClassExtractionType;
    label: string;
    mlSlotClassValues?: Array<MlSlotClassValue>;
}

export interface MlSlotClassValue {
    synonymGroup?: SynonymGroup;
    synonymGroups?: Array<SynonymGroup>;
    value: string;
}

export interface SynonymGroup {
    languages?: Array<Language>;
    terms?: Array<string>;
}

export interface BotVersionMetadata extends MetadataInfo {
    botDialogGroups?: Array<BotDialogGroup>;
    botDialogs?: Array<BotDialog>;
    conversationGoals?: Array<ConversationDefinitionGoal>;
    conversationSystemDialogs?: Array<ConversationSystemDialog>;
    conversationVariables?: Array<ConversationVariable>;
    entryDialog: string;
    mainMenuDialog: string;
    nlpProviders?: Array<ConversationDefinitionNlpProvider>;
    responseDelayMilliseconds?: number; // xsd-type: "int"
}

export interface BotDialogGroup {
    description?: string;
    developerName: string;
    label: string;
}

export interface BotDialog {
    botDialogGroup?: string;
    botSteps?: Array<BotStep>;
    description?: string;
    developerName: string;
    isPlaceholderDialog?: boolean;
    label: string;
    mlIntent?: string;
    mlIntentTrainingEnabled?: boolean;
    showInFooterMenu?: boolean;
}

export interface BotStep {
    booleanFilter?: string;
    botInvocation?: BotInvocation;
    botMessages?: Array<BotMessage>;
    botNavigation?: BotNavigation;
    botStepConditions?: Array<BotStepCondition>;
    botSteps?: Array<BotStep>;
    botVariableOperation?: BotVariableOperation;
    conversationRecordLookup?: ConversationRecordLookup;
    conversationStepGoalMappings?: Array<ConversationDefinitionStepGoalMapping>;
    conversationSystemMessage?: ConversationSystemMessage;
    messageDefinition?: ConversationDefinitionRichMessage;
    stepIdentifier?: string;
    type: BotStepType;
}

export interface BotInvocation {
    invocationActionName?: string;
    invocationActionType?: ConversationInvocableTargetType;
    invocationMappings?: Array<BotInvocationMapping>;
}

export interface BotInvocationMapping {
    parameterName: string;
    recordName?: string;
    type: BotInvocationMappingType;
    value?: string;
    variableName?: string;
    variableType?: ConversationVariableType;
}

export interface BotMessage {
    message: string;
    messageIdentifier?: string;
}

export interface BotNavigation {
    botNavigationLinks?: Array<BotNavigationLink>;
    type: BotNavigationType;
}

export interface BotNavigationLink {
    label?: string;
    targetBotDialog?: string;
    targetVariable?: string;
    targetVariableType?: ConversationVariableType;
}

export interface BotStepCondition {
    leftOperandName: string;
    leftOperandType: ConversationVariableType;
    operatorType: BotStepConditionOperatorType;
    rightOperandValue?: string;
}

export interface BotVariableOperation {
    askCollectIfSet?: boolean;
    autoSelectIfSingleChoice?: boolean;
    botInvocation?: BotInvocation;
    botMessages?: Array<BotMessage>;
    botQuickReplyOptions?: Array<BotQuickReplyOption>;
    botVariableOperands?: Array<BotVariableOperand>;
    invalidInputBotNavigation?: BotNavigation;
    optionalCollect?: boolean;
    quickReplyOptionTemplate?: string;
    quickReplyType?: BotQuickReplyType;
    quickReplyWidgetType?: BotWidgetType;
    retryMessages?: Array<BotMessage>;
    sourceVariableName?: string;
    sourceVariableType?: ConversationVariableType;
    successMessages?: Array<BotMessage>;
    type: BotVariableOperationType;
    variableOperationIdentifier?: string;
}

export interface BotQuickReplyOption {
    literalValue: string;
    quickReplyOptionIdentifier?: string;
}

export interface BotVariableOperand {
    disableAutoFill?: boolean;
    sourceName?: string;
    sourceType?: ConversationVariableOperandSourceType;
    sourceValue?: string;
    targetName: string;
    targetType: ConversationVariableType;
}

export interface ConversationRecordLookup {
    SObjectType: string;
    conditions?: Array<ConversationRecordLookupCondition>;
    filterLogic?: string;
    lookupFields?: Array<ConversationRecordLookupField>;
    maxLookupResults: number; // xsd-type: "int"
    sortFieldName?: string;
    sortOrder?: SortOrder;
    sourceVariableName?: string;
    sourceVariableType?: ConversationVariableType;
    targetVariableName: string;
}

export interface ConversationRecordLookupCondition {
    leftOperand: string;
    operatorType: string;
    rightOperandName?: string;
    rightOperandType?: ConversationVariableType;
    rightOperandValue?: string;
    sortOrder: number; // xsd-type: "int"
}

export interface ConversationRecordLookupField {
    fieldName: string;
}

export interface ConversationDefinitionStepGoalMapping {
    goalName: string;
}

export interface ConversationSystemMessage {
    systemMessageMappings?: Array<ConversationSystemMessageMapping>;
    type: ConversationSystemMessageType;
}

export interface ConversationSystemMessageMapping {
    mappingType: ConversationMappingType;
    parameterType: ConversationSystemMessageParamType;
    variableName: string;
}

export interface ConversationDefinitionRichMessage {
    messageDefinitionMappings?: Array<BotInvocationMapping>;
    messageDefinitionName: string;
}

export interface ConversationDefinitionGoal {
    developerName: string;
    label: string;
}

export interface ConversationSystemDialog {
    dialog: string;
    type: ConversationSystemDialogType;
}

export interface ConversationVariable {
    SObjectType?: string;
    collectionType?: ConversationVariableCollectionType;
    dataType: ConversationDataType;
    developerName: string;
    label: string;
}

export interface ConversationDefinitionNlpProvider {
    language?: Language;
    nlpProviderName?: string;
    nlpProviderType: ConversationDefinitionNlpProviderType;
}

export interface ConversationContextVariable {
    SObjectType?: string;
    contextVariableMappings?: Array<ConversationContextVariableMapping>;
    dataType: ConversationDataType;
    developerName: string;
    label: string;
}

export interface ConversationContextVariableMapping {
    SObjectType: string;
    fieldName: string;
    messageType: MessageType;
}

export interface ConversationDefinitionChannelProvider {
    agentRequired?: boolean;
    chatButtonName: string;
}

export interface BotBlockMetadata extends MetadataInfo {
    botBlockVersions?: Array<BotBlockVersionMetadata>;
    description?: string;
    icon?: string;
    masterLabel: string;
    richContentEnabled?: boolean;
}

export interface BotBlockVersionMetadata extends MetadataInfo {
    botDialogs?: Array<BotDialog>;
    conversationGoals?: Array<ConversationDefinitionGoal>;
    conversationLanguages: string;
    conversationVariables?: Array<ConversationVariable>;
    description?: string;
    mlDomain: LocalMlDomain;
    status: ConvDefBlockVersionStatus;
}

export interface BotSettingsMetadata extends MetadataInfo {
    enableBots?: boolean;
}

export interface BotTemplateMetadata extends MetadataInfo {
    botDialogGroups?: Array<BotDialogGroup>;
    botDialogs?: Array<BotDialog>;
    contextVariables?: Array<ConversationContextVariable>;
    conversationGoals?: Array<ConversationDefinitionGoal>;
    conversationLanguages: string;
    conversationSystemDialogs?: Array<ConversationSystemDialog>;
    conversationVariables?: Array<ConversationVariable>;
    description?: string;
    entryDialog?: string;
    icon?: string;
    mainMenuDialog?: string;
    masterLabel: string;
    mlDomain?: LocalMlDomain;
    richContentEnabled?: boolean;
}

export interface BrandingSetMetadata extends MetadataInfo {
    brandingSetProperty?: Array<BrandingSetProperty>;
    description?: string;
    masterLabel: string;
    type?: string;
}

export interface BrandingSetProperty {
    propertyName: string;
    propertyValue?: string;
}

export interface BriefcaseDefinitionMetadata extends MetadataInfo {
    briefcaseRules?: Array<BriefcaseRule>;
    description?: string;
    isActive: boolean;
    masterLabel: string;
    type?: BriefcaseType;
}

export interface BriefcaseRule {
    briefcaseRuleFilters?: Array<BriefcaseRuleFilter>;
    filterLogic?: string;
    isAscendingOrder?: boolean;
    orderBy?: string;
    queryScope?: FilterScope;
    recordLimit?: number; // xsd-type: "int"
    relatedRules?: Array<BriefcaseRule>;
    relationshipField?: string;
    relationshipType?: BriefcaseRuleRelationshipType;
    targetEntity: string;
}

export interface BriefcaseRuleFilter {
    filterOperator: BriefcaseFilterOperator;
    filterSeqNumber: number; // xsd-type: "int"
    filterValue?: string;
    targetEntityField: string;
}

export interface BusinessHoursEntryMetadata extends MetadataInfo {
    active?: boolean;
    default: boolean;
    fridayEndTime?: string; // xsd-type: "time"
    fridayStartTime?: string; // xsd-type: "time"
    mondayEndTime?: string; // xsd-type: "time"
    mondayStartTime?: string; // xsd-type: "time"
    name?: string;
    saturdayEndTime?: string; // xsd-type: "time"
    saturdayStartTime?: string; // xsd-type: "time"
    sundayEndTime?: string; // xsd-type: "time"
    sundayStartTime?: string; // xsd-type: "time"
    thursdayEndTime?: string; // xsd-type: "time"
    thursdayStartTime?: string; // xsd-type: "time"
    timeZoneId?: string;
    tuesdayEndTime?: string; // xsd-type: "time"
    tuesdayStartTime?: string; // xsd-type: "time"
    wednesdayEndTime?: string; // xsd-type: "time"
    wednesdayStartTime?: string; // xsd-type: "time"
}

export interface BusinessHoursSettingsMetadata extends MetadataInfo {
    businessHours?: Array<BusinessHoursEntryMetadata>;
    holidays?: Array<Holiday>;
}

export interface Holiday {
    activityDate?: string; // xsd-type: "date"
    businessHours?: Array<string>;
    description?: string;
    endTime?: string; // xsd-type: "time"
    isRecurring?: boolean;
    name?: string;
    recurrenceDayOfMonth?: number; // xsd-type: "int"
    recurrenceDayOfWeek?: Array<string>;
    recurrenceDayOfWeekMask?: number; // xsd-type: "int"
    recurrenceEndDate?: string; // xsd-type: "date"
    recurrenceInstance?: string;
    recurrenceInterval?: number; // xsd-type: "int"
    recurrenceMonthOfYear?: string;
    recurrenceStartDate?: string; // xsd-type: "date"
    recurrenceType?: string;
    startTime?: string; // xsd-type: "time"
}

export interface BusinessProcessMetadata extends MetadataInfo {
    description?: string;
    isActive?: boolean;
    values?: Array<PicklistValueMetadata>;
}

export interface PicklistValueMetadata extends MetadataInfo {
    color?: string;
    default: boolean;
    description?: string;
    isActive?: boolean;
    allowEmail?: boolean;
    closed?: boolean;
    controllingFieldValues?: Array<string>;
    converted?: boolean;
    cssExposed?: boolean;
    forecastCategory?: ForecastCategories;
    highPriority?: boolean;
    probability?: number; // xsd-type: "int"
    reverseRole?: string;
    reviewed?: boolean;
    won?: boolean;
}

export interface BusinessProcessGroupMetadata extends MetadataInfo {
    businessProcessDefinitions?: Array<BusinessProcessDefinition>;
    customerSatisfactionMetric: SurveyQuestionType;
    description?: string;
    masterLabel: string;
}

export interface BusinessProcessDefinition {
    businessProcessFeedbacks?: Array<BusinessProcessFeedback>;
    description?: string;
    developerName: string;
    masterLabel: string;
    sequenceNumber: number; // xsd-type: "int"
}

export interface BusinessProcessFeedback {
    actionName: string;
    actionParam: string;
    actionType: ExpFeedbackCollType;
}

export interface BusinessProcessTypeDefinitionMetadata extends MetadataInfo {
    applicationUsageType: AppDomainUsageType;
    description?: string;
    masterLabel: string;
}

export interface CMSConnectSourceMetadata extends MetadataInfo {
    cmsConnectAsset?: Array<CMSConnectAsset>;
    cmsConnectLanguage?: Array<CMSConnectLanguage>;
    cmsConnectPersonalization?: CMSConnectPersonalization;
    cmsConnectResourceType?: Array<CMSConnectResourceType>;
    connectionType: CMSSourceConnectionType;
    cssScope?: string;
    developerName: string;
    languageEnabled?: string;
    masterLabel: string;
    namedCredential?: string;
    personalizationEnabled?: string;
    rootPath?: string;
    sortOrder: number; // xsd-type: "int"
    status: CMSConnectionStatus;
    type: CMSConnectionSourceType;
    websiteUrl?: string;
}

export interface CMSConnectAsset {
    assetPath: string;
    assetType: string;
    sortOrder: number; // xsd-type: "int"
}

export interface CMSConnectLanguage {
    cmsLanguage: string;
    language: string;
}

export interface CMSConnectPersonalization {
    connectorPage: string;
    connectorPageAsset: string;
}

export interface CMSConnectResourceType {
    cmsConnectResourceDefinition?: Array<CMSConnectResourceDefinition>;
    developerName: string;
    masterLabel: string;
    resourceType: string;
}

export interface CMSConnectResourceDefinition {
    developerName: string;
    masterLabel: string;
    options: number; // xsd-type: "int"
    payloadType: string;
    resourceIdPath?: string;
    resourceNamePath?: string;
    resourcePath: string;
    rootNodePath?: string;
}

export interface CallCenterMetadata extends MetadataInfo {
    adapterUrl?: string;
    contactCenterChannels?: Array<ContactCenterChannel>;
    customSettings?: string;
    displayName: string;
    displayNameLabel: string;
    internalNameLabel: string;
    sections?: Array<CallCenterSection>;
    vendorCallCenterStatusMaps?: Array<VendorCallCenterStatusMap>;
    version?: string;
}

export interface ContactCenterChannel {
    channel: string;
}

export interface CallCenterSection {
    items?: Array<CallCenterItem>;
    label: string;
    name: string;
}

export interface CallCenterItem {
    label: string;
    name: string;
    value: string;
}

export interface VendorCallCenterStatusMap {
    externalStatus: string;
    servicePresenceStatus: string;
}

export interface CallCenterRoutingMapMetadata extends MetadataInfo {
    callCenter: string;
    developerName: string;
    externalId: string;
    masterLabel: string;
    quickConnect?: string;
    referenceRecord: string;
}

export interface CallCoachingMediaProviderMetadata extends MetadataInfo {
    isActive: boolean;
    providerDescription: string;
    providerName: string;
}

export interface CallCtrAgentFavTrfrDestMetadata extends MetadataInfo {
    agent: string;
    callCenter: string;
    name: string;
    transferDestination: string;
}

export interface CampaignInfluenceModelMetadata extends MetadataInfo {
    isActive?: boolean;
    isDefaultModel: boolean;
    isModelLocked: boolean;
    modelDescription?: string;
    name: string;
    recordPreference?: string;
}

export interface CampaignSettingsMetadata extends MetadataInfo {
    aiAttributionTimeframe?: number; // xsd-type: "int"
    enableAIAttribution?: boolean;
    enableAccountsAsCM?: boolean;
    enableAutoCampInfluenceDisabled?: boolean;
    enableB2bmaCampaignInfluence2?: boolean;
    enableCampaignHistoryTrackEnabled?: boolean;
    enableCampaignInfluence2?: boolean;
    enableCampaignMemberTWCF?: boolean;
    enableEKAI?: boolean;
    enableSuppressNoValueCI2?: boolean;
}

export interface CanvasMetadata extends MetadataInfo {
    accessMethod: string;
    canvasOptions?: string;
    canvasUrl: string;
    lifecycleClass?: string;
    locationOptions?: string;
    samlInitiationMethod?: string;
}

export interface CareBenefitVerifySettingsMetadata extends MetadataInfo {
    codeSetType?: string;
    defaultNpi?: string;
    generalPlanServiceTypeCode?: string;
    isDefault?: boolean;
    masterLabel: string;
    organizationName?: string;
    serviceApexClass?: string;
    serviceNamedCredential?: string;
    serviceTypeSourceSystem?: string;
    uriPath?: string;
}

export interface CareRequestConfigurationMetadata extends MetadataInfo {
    careRequestRecordType: string;
    careRequestRecords?: Array<CareRequestRecords>;
    careRequestType: string;
    isActive?: boolean;
    isDefaultRecordType?: boolean;
    masterLabel: string;
}

export interface CareRequestRecords {
    careRequestRecord: string;
}

export interface CaseSettingsMetadata extends MetadataInfo {
    caseAssignNotificationTemplate?: string;
    caseAutoProcUser?: boolean;
    caseCloseNotificationTemplate?: string;
    caseCommentNotificationTemplate?: string;
    caseCreateNotificationTemplate?: string;
    caseFeedItemSettings?: Array<FeedItemSettings>;
    caseFeedReadUnreadLtng?: boolean;
    caseMergeInLightning?: boolean;
    closeCaseThroughStatusChange?: boolean;
    defaultCaseFeedLayoutOn?: boolean;
    defaultCaseOwner?: string;
    defaultCaseOwnerType?: string;
    defaultCaseUser?: string;
    emailActionDefaultsHandlerClass?: string;
    emailToCase?: EmailToCaseSettings;
    enableCaseFeed?: boolean;
    enableCaseSwarming?: boolean;
    enableCollapseEmailThread?: boolean;
    enableDraftEmails?: boolean;
    enableEarlyEscalationRuleTriggers?: boolean;
    enableEmailActionDefaultsHandler?: boolean;
    enableEmailContactOnCasePost?: boolean;
    enableEscalateQfiToCaseInternal?: boolean;
    enableEscalateQfiToCaseNetworks?: boolean;
    enableExtNetworksCaseFeedEnabled?: boolean;
    enableMultiLangSolnSrchCSS?: boolean;
    enableMultiLangSolnSrchPKB?: boolean;
    enableMultiLangSolution?: boolean;
    enableSolutionCategory?: boolean;
    enableSolutionInlineCategory?: boolean;
    enableSolutionShortSummary?: boolean;
    enableSuggestedArticlesApplication?: boolean;
    enableSuggestedArticlesCustomerPortal?: boolean;
    enableSuggestedArticlesPartnerPortal?: boolean;
    enableSuggestedSolutions?: boolean;
    escalateCaseBefore?: boolean;
    genericMessageEnabled?: boolean;
    keepCaseMergeRecords?: boolean;
    keepRecordTypeOnAssignmentRule?: boolean;
    notifyContactOnCaseComment?: boolean;
    notifyDefaultCaseOwner?: boolean;
    notifyOwnerOnCaseComment?: boolean;
    notifyOwnerOnCaseOwnerChange?: boolean;
    predictiveSupportEnabled?: boolean;
    showEmailAttachmentsInCaseAttachmentsRL?: boolean;
    showFewerCloseActions?: boolean;
    systemUserEmail?: string;
    useSystemEmailAddress?: boolean;
    useSystemUserAsDefaultCaseUser?: boolean;
    visibleInCssCheckbox?: boolean;
    webToCase?: WebToCaseSettings;
}

export interface FeedItemSettings {
    characterLimit?: number; // xsd-type: "int"
    displayFormat?: FeedItemDisplayFormat;
    feedItemType: FeedItemType;
}

export interface EmailToCaseSettings {
    enableE2CAttachmentAsFile?: boolean;
    enableE2CSourceTracking?: boolean;
    enableEmailToCase?: boolean;
    enableHtmlEmail?: boolean;
    enableOnDemandEmailToCase?: boolean;
    enableThreadIDInBody?: boolean;
    enableThreadIDInSubject?: boolean;
    notifyOwnerOnNewCaseEmail?: boolean;
    overEmailLimitAction?: EmailToCaseOnFailureActionType;
    preQuoteSignature?: boolean;
    routingAddresses?: Array<EmailToCaseRoutingAddress>;
    unauthorizedSenderAction?: EmailToCaseOnFailureActionType;
}

export interface EmailToCaseRoutingAddress {
    addressType?: EmailToCaseRoutingAddressType;
    authorizedSenders?: string;
    caseOrigin?: string;
    caseOwner?: string;
    caseOwnerType?: string;
    casePriority?: string;
    createTask?: boolean;
    emailAddress?: string;
    emailServicesAddress?: string;
    fallbackQueue?: string;
    isVerified?: boolean;
    routingFlow?: string;
    routingName?: string;
    saveEmailHeaders?: boolean;
    taskStatus?: string;
}

export interface WebToCaseSettings {
    caseOrigin?: string;
    defaultResponseTemplate?: string;
    enableWebToCase?: boolean;
}

export interface CaseSubjectParticleMetadata extends MetadataInfo {
    index: number; // xsd-type: "int"
    textField?: string;
    type: CaseSubjectParticleType;
}

export interface ChannelLayoutMetadata extends MetadataInfo {
    doesExcludeFieldLabels?: boolean;
    doesExcludeFiles?: boolean;
    enabledChannels?: Array<string>;
    label: string;
    layoutItems?: Array<ChannelLayoutItem>;
    recordType?: string;
}

export interface ChannelLayoutItem {
    field: string;
}

export interface ChannelObjectLinkingRuleMetadata extends MetadataInfo {
    actionForNoRecordFound: ActionForNoRecordFound;
    actionForSingleRecordFound: ActionForSingleRecordFound;
    channelType: ChannelType;
    description?: string;
    isLinkedRecordOpenedAsSubTab: boolean;
    isRuleActive: boolean;
    masterLabel: string;
    objectToLink: ObjectToLink;
    ruleName: string;
}

export interface ChatterAnswersSettingsMetadata extends MetadataInfo {
    emailFollowersOnBestAnswer?: boolean;
    emailFollowersOnReply?: boolean;
    emailOwnerOnPrivateReply?: boolean;
    emailOwnerOnReply?: boolean;
    enableAnswerViaEmail?: boolean;
    enableChatterAnswers: boolean;
    enableFacebookSSO?: boolean;
    enableInlinePublisher?: boolean;
    enableReputation?: boolean;
    enableRichTextEditor?: boolean;
    facebookAuthProvider?: string;
    showInPortals?: boolean;
}

export interface ChatterEmailsMDSettingsMetadata extends MetadataInfo {
    enableChatterDigestEmailsApiOnly?: boolean;
    enableChatterEmailAttachment?: boolean;
    enableCollaborationEmail?: boolean;
    enableDisplayAppDownloadBadges?: boolean;
    enableEmailReplyToChatter?: boolean;
    enableEmailToChatter?: boolean;
    noQnOwnNotifyOnCaseCmt?: boolean;
    noQnOwnNotifyOnRep?: boolean;
    noQnSubNotifyOnBestR?: boolean;
    noQnSubNotifyOnRep?: boolean;
}

export interface ChatterExtensionMetadata extends MetadataInfo {
    compositionComponent: string;
    description: string;
    extensionName: string;
    headerText?: string;
    hoverText?: string;
    icon: string;
    isProtected?: boolean;
    masterLabel: string;
    renderComponent: string;
    type: ChatterExtensionType;
}

export interface ChatterSettingsMetadata extends MetadataInfo {
    allowChatterGroupArchiving?: boolean;
    allowRecordsInChatterGroup?: boolean;
    enableApprovalRequest?: boolean;
    enableCaseFeedRelativeTimestamps?: boolean;
    enableChatter?: boolean;
    enableChatterEmoticons?: boolean;
    enableFeedEdit?: boolean;
    enableFeedPinning?: boolean;
    enableFeedsDraftPosts?: boolean;
    enableFeedsRichText?: boolean;
    enableInviteCsnUsers?: boolean;
    enableOutOfOfficeEnabledPref?: boolean;
    enableRichLinkPreviewsInFeed?: boolean;
    enableTodayRecsInFeed?: boolean;
    unlistedGroupsEnabled?: boolean;
}

export interface CleanDataServiceMetadata extends MetadataInfo {
    cleanRules?: Array<CleanRule>;
    description: string;
    masterLabel: string;
    matchEngine: string;
}

export interface CleanRule {
    bulkEnabled: boolean;
    bypassTriggers: boolean;
    bypassWorkflow: boolean;
    description: string;
    developerName: string;
    fieldMappings?: Array<FieldMapping>;
    masterLabel: string;
    matchRule: string;
    sourceSobjectType: string;
    status: CleanRuleStatus;
    targetSobjectType: string;
}

export interface FieldMapping {
    SObjectType: string;
    developerName: string;
    fieldMappingRows?: Array<FieldMappingRow>;
    masterLabel: string;
}

export interface FieldMappingRow {
    SObjectType: string;
    fieldMappingFields?: Array<FieldMappingField>;
    fieldName: string;
    mappingOperation: MappingOperation;
}

export interface FieldMappingField {
    dataServiceField: string;
    dataServiceObjectName: string;
    priority: number; // xsd-type: "int"
}

export interface CommandActionMetadata extends MetadataInfo {
    actionType: string;
    description?: string;
    intents?: Array<CommandActionIntent>;
    label: string;
    parameters?: Array<CommandActionParam>;
    responseTemplates?: Array<CommandActionResponse>;
    target?: string;
}

export interface CommandActionIntent {
    phrase: string;
    responseTemplates?: Array<CommandActionResponse>;
}

export interface CommandActionResponse {
    template: string;
}

export interface CommandActionParam {
    defaultValue?: string;
    description?: string;
    name: string;
    required?: boolean;
    type: string;
}

export interface CommerceSettingsMetadata extends MetadataInfo {
    commerceEnabled?: boolean;
}

export interface CommunitiesSettingsMetadata extends MetadataInfo {
    applyLoginPageTypeToEmbeddedLogin?: boolean;
    blockEmbeddedLoginUnknownURLRedirect?: boolean;
    canModerateAllFeedPosts?: boolean;
    canModerateInternalFeedPosts?: boolean;
    embeddedVisualforcePages?: boolean;
    enableCommunityWorkspaces?: boolean;
    enableCspContactVisibilityPref?: boolean;
    enableCspNotesOnAccConPref?: boolean;
    enableEnablePRM?: boolean;
    enableExternalAccHierPref?: boolean;
    enableGuestPermDisOptOutCruc?: boolean;
    enableGuestRecordReassignOrgPref?: boolean;
    enableGuestSecurityOptOutCruc?: boolean;
    enableGuvSecurityOptOutPref?: boolean;
    enableInviteChatterGuestEnabled?: boolean;
    enableNameFieldsUserPIIEnabled?: boolean;
    enableNetPortalUserReportOpts?: boolean;
    enableNetworksEnabled?: boolean;
    enableOotbProfExtUserOpsEnable?: boolean;
    enablePRMAccRelPref?: boolean;
    enablePowerCustomerCaseStatus?: boolean;
    enablePreventBadgeGuestAccess?: boolean;
    enableRelaxPartnerAccountFieldPref?: boolean;
    enableUnsupportedBrowserModalPref?: boolean;
    enableUsernameUniqForOrgPref?: boolean;
}

export interface CommunityMetadata extends MetadataInfo {
    active?: boolean;
    chatterAnswersFacebookSsoUrl?: string;
    communityFeedPage?: string;
    dataCategoryName?: string;
    description?: string;
    emailFooterDocument?: string;
    emailHeaderDocument?: string;
    emailNotificationUrl?: string;
    enableChatterAnswers?: boolean;
    enablePrivateQuestions?: boolean;
    expertsGroup?: string;
    portal?: string;
    reputationLevels?: ReputationLevels;
    showInPortal?: boolean;
    site?: string;
}

export interface ReputationLevels {
    chatterAnswersReputationLevels?: Array<ChatterAnswersReputationLevel>;
    ideaReputationLevels?: Array<IdeaReputationLevel>;
}

export interface ChatterAnswersReputationLevel {
    name: string;
    value: number; // xsd-type: "int"
}

export interface IdeaReputationLevel {
    name: string;
    value: number; // xsd-type: "int"
}

export interface CommunityTemplateDefinitionMetadata extends MetadataInfo {
    baseTemplate?: CommunityBaseTemplate;
    bundlesInfo?: Array<CommunityTemplateBundleInfo>;
    category: CommunityTemplateCategory;
    defaultBrandingSet?: string;
    defaultThemeDefinition: string;
    description?: string;
    enableExtendedCleanUpOnDelete?: boolean;
    masterLabel: string;
    navigationLinkSet?: Array<NavigationLinkSet>;
    pageSetting?: Array<CommunityTemplatePageSetting>;
    publisher?: string;
}

export interface CommunityTemplateBundleInfo {
    description?: string;
    image?: string;
    order: number; // xsd-type: "int"
    title: string;
    type: CommunityTemplateBundleInfoType;
}

export interface NavigationLinkSet {
    navigationMenuItem?: Array<NavigationMenuItem>;
}

export interface NavigationMenuItem {
    defaultListViewId?: string;
    label: string;
    menuItemBranding?: NavigationMenuItemBranding;
    position: number; // xsd-type: "int"
    publiclyAvailable?: boolean;
    subMenu?: NavigationSubMenu;
    target?: string;
    targetPreference?: string;
    type: string;
}

export interface NavigationMenuItemBranding {
    tileImage?: string;
}

export interface NavigationSubMenu {
    navigationMenuItem?: Array<NavigationMenuItem>;
}

export interface CommunityTemplatePageSetting {
    page: string;
    themeLayout: string;
}

export interface CommunityThemeDefinitionMetadata extends MetadataInfo {
    bundlesInfo?: Array<CommunityTemplateBundleInfo>;
    customThemeLayoutType?: Array<CommunityCustomThemeLayoutType>;
    defaultBrandingSet?: string;
    description?: string;
    enableExtendedCleanUpOnDelete?: boolean;
    masterLabel: string;
    publisher?: string;
    themeRouteOverride?: Array<CommunityThemeRouteOverride>;
    themeSetting?: Array<CommunityThemeSetting>;
}

export interface CommunityCustomThemeLayoutType {
    description?: string;
    label: string;
}

export interface CommunityThemeRouteOverride {
    customThemeLayoutType?: string;
    pageAttributes: string;
    pageType: string;
    themeLayoutType?: CommunityThemeLayoutType;
}

export interface CommunityThemeSetting {
    customThemeLayoutType?: string;
    themeLayout: string;
    themeLayoutType?: CommunityThemeLayoutType;
}

export interface CompactLayoutMetadata extends MetadataInfo {
    fields?: Array<string>;
    label: string;
}

export interface CompanySettingsMetadata extends MetadataInfo {
    enableCustomFiscalYear: boolean;
    fiscalYear?: FiscalYearSettings;
}

export interface FiscalYearSettings {
    fiscalYearNameBasedOn?: string;
    startMonth?: string;
}

export interface ConnectedAppMetadata extends MetadataInfo {
    attributes?: Array<ConnectedAppAttribute>;
    canvas?: CanvasMetadata;
    canvasConfig?: ConnectedAppCanvasConfig;
    contactEmail: string;
    contactPhone?: string;
    description?: string;
    iconUrl?: string;
    infoUrl?: string;
    ipRanges?: Array<ConnectedAppIpRange>;
    label: string;
    logoUrl?: string;
    mobileAppConfig?: ConnectedAppMobileDetailConfig;
    mobileStartUrl?: string;
    oauthConfig?: ConnectedAppOauthConfig;
    oauthPolicy?: ConnectedAppOauthPolicy;
    permissionSetName?: Array<string>;
    plugin?: string;
    pluginExecutionUser?: string;
    profileName?: Array<string>;
    samlConfig?: ConnectedAppSamlConfig;
    sessionPolicy?: ConnectedAppSessionPolicy;
    startUrl?: string;
}

export interface ConnectedAppAttribute {
    formula: string;
    key: string;
}

export interface ConnectedAppCanvasConfig {
    accessMethod: AccessMethod;
    canvasUrl: string;
    lifecycleClass?: string;
    locations?: Array<CanvasLocationOptions>;
    options?: Array<CanvasOptions>;
    samlInitiationMethod?: SamlInitiationMethod;
}

export interface ConnectedAppIpRange {
    description?: string;
    end: string;
    start: string;
}

export interface ConnectedAppMobileDetailConfig {
    applicationBinaryFile?: string; // xsd-type: "base64Binary"
    applicationBinaryFileName?: string;
    applicationBundleIdentifier?: string;
    applicationFileLength?: number; // xsd-type: "int"
    applicationIconFile?: string;
    applicationIconFileName?: string;
    applicationInstallUrl?: string;
    devicePlatform: DevicePlatformType;
    deviceType?: DeviceType;
    minimumOsVersion?: string;
    privateApp?: boolean;
    version: string;
}

export interface ConnectedAppOauthConfig {
    assetTokenConfig?: ConnectedAppOauthAssetToken;
    callbackUrl: string;
    certificate?: string;
    consumerKey?: string;
    consumerSecret?: string;
    idTokenConfig?: ConnectedAppOauthIdToken;
    isAdminApproved?: boolean;
    isClientCredentialEnabled?: boolean;
    isCodeCredentialEnabled?: boolean;
    isCodeCredentialPostOnly?: boolean;
    isConsumerSecretOptional?: boolean;
    isIntrospectAllTokens?: boolean;
    isSecretRequiredForRefreshToken?: boolean;
    oauthClientCredentialUser?: string;
    scopes?: Array<ConnectedAppOauthAccessScope>;
    singleLogoutUrl?: string;
}

export interface ConnectedAppOauthAssetToken {
    assetAudiences: string;
    assetIncludeAttributes: boolean;
    assetIncludeCustomPerms: boolean;
    assetSigningCertId: string;
    assetValidityPeriod: number; // xsd-type: "int"
}

export interface ConnectedAppOauthIdToken {
    idTokenAudience?: string;
    idTokenIncludeAttributes?: boolean;
    idTokenIncludeCustomPerms?: boolean;
    idTokenIncludeStandardClaims?: boolean;
    idTokenValidity?: number; // xsd-type: "int"
}

export interface ConnectedAppOauthPolicy {
    ipRelaxation: string;
    refreshTokenPolicy: string;
    singleLogoutUrl?: string;
}

export interface ConnectedAppSamlConfig {
    acsUrl: string;
    certificate?: string;
    encryptionCertificate?: string;
    encryptionType?: SamlEncryptionType;
    entityUrl: string;
    issuer?: string;
    samlIdpSLOBindingEnum?: SamlIdpSLOBinding;
    samlNameIdFormat?: SamlNameIdFormatType;
    samlSigningAlgoType?: SamlSigningAlgoType;
    samlSloUrl?: string;
    samlSubjectCustomAttr?: string;
    samlSubjectType: SamlSubjectType;
}

export interface ConnectedAppSessionPolicy {
    policyAction?: string;
    sessionLevel?: string;
    sessionTimeout?: number; // xsd-type: "int"
}

export interface ConnectedAppSettingsMetadata extends MetadataInfo {
    enableAdminApprovedAppsOnly?: boolean;
    enableAdminApprovedAppsOnlyForExternalUser?: boolean;
    enableSkipUserProvisioningWizardWelcomePage?: boolean;
}

export interface ContentSettingsMetadata extends MetadataInfo {
    enableCMSC2CConnections?: boolean;
    enableChatterFileLink?: boolean;
    enableContent?: boolean;
    enableContentAutoAssign?: boolean;
    enableContentDistForPortalUsers?: boolean;
    enableContentDistPwOptionsBit1?: boolean;
    enableContentDistPwOptionsBit2?: boolean;
    enableContentDistribution?: boolean;
    enableContentSupportMultiLanguage?: boolean;
    enableContentWorkspaceAccess?: boolean;
    enableDeleteFileInContentPacks?: boolean;
    enableFileShareSetByRecord?: boolean;
    enableFilesUsrShareNetRestricted?: boolean;
    enableJPGPreviews?: boolean;
    enableLibraryManagedFiles?: boolean;
    enableShowChatterFilesInContent?: boolean;
    enableSiteGuestUserToUploadFiles?: boolean;
    enableUploadFilesOnAttachments?: boolean;
    setValidContentTypeForAtchDocDownload?: boolean;
    skipContentAssetTriggers?: boolean;
    skipContentAssetTriggersOnDeploy?: boolean;
}

export interface ContractSettingsMetadata extends MetadataInfo {
    autoCalculateEndDate?: boolean;
    autoExpirationDelay?: string;
    autoExpirationRecipient?: string;
    autoExpireContracts?: boolean;
    enableContractHistoryTracking?: boolean;
    notifyOwnersOnContractExpiration?: boolean;
}

export interface ConversationVendorInfoMetadata extends MetadataInfo {
    agentSSOSupported?: boolean;
    awsAccountKey?: string;
    awsRootEmail?: string;
    awsTenantVersion?: number; // xsd-type: "double"
    bridgeComponent?: string;
    clientAuthMode?: ClientAuthMode;
    connectorUrl?: string;
    customConfig?: string;
    customLoginUrl?: string;
    developerName: string;
    einsteinConversationInsightsSupported?: boolean;
    integrationClass?: string;
    integrationClassName?: string;
    isTaxCompliant?: boolean;
    keyProvisioningSupported?: boolean;
    masterLabel: string;
    namedCredential?: string;
    namedCredentialSupported?: boolean;
    partnerContactCenterListSupported?: boolean;
    partnerPhoneNumbersSupported?: boolean;
    partnerTransferDestinationsSupported?: boolean;
    queueManagementSupported?: boolean;
    serverAuthMode?: ServerAuthMode;
    telephonySettingsComponent?: string;
    universalCallRecordingAccessSupported?: boolean;
    userSyncingSupported?: boolean;
    vendorType?: ConversationVendorType;
}

export interface ConversationalIntelligenceSettingsMetadata extends MetadataInfo {
    enableCallCoaching?: boolean;
    enableCallCoachingZoom?: boolean;
    enableOpptyMatching?: boolean;
    enableUnifiedActivities?: boolean;
}

export interface CorsWhitelistOriginMetadata extends MetadataInfo {
    urlPattern: string;
}

export interface CspTrustedSiteMetadata extends MetadataInfo {
    context?: CspTrustedSiteContext;
    description?: string;
    endpointUrl: string;
    isActive: boolean;
    isApplicableToConnectSrc?: boolean;
    isApplicableToFontSrc?: boolean;
    isApplicableToFrameSrc?: boolean;
    isApplicableToImgSrc?: boolean;
    isApplicableToMediaSrc?: boolean;
    isApplicableToStyleSrc?: boolean;
    mobileExtension?: string;
}

export interface CurrencySettingsMetadata extends MetadataInfo {
    enableCurrencyEffectiveDates?: boolean;
    enableCurrencySymbolWithMultiCurrency?: boolean;
    enableMultiCurrency?: boolean;
    isMultiCurrencyActivationAllowed?: boolean;
    isParenCurrencyConvDisabled?: boolean;
}

export interface CustomAddressFieldSettingsMetadata extends MetadataInfo {
    enableCustomAddressField?: boolean;
}

export interface CustomApplicationMetadata extends MetadataInfo {
    actionOverrides?: Array<AppActionOverride>;
    brand?: AppBrand;
    consoleConfig?: ServiceCloudConsoleConfig;
    defaultLandingTab?: string;
    description?: string;
    formFactors?: Array<FormFactor>;
    isNavAutoTempTabsDisabled?: boolean;
    isNavPersonalizationDisabled?: boolean;
    isNavTabPersistenceDisabled?: boolean;
    isServiceCloudConsole?: boolean;
    label?: string;
    logo?: string;
    navType?: NavType;
    preferences?: AppPreferences;
    profileActionOverrides?: Array<AppProfileActionOverride>;
    setupExperience?: string;
    subscriberTabs?: Array<string>;
    tabs?: Array<string>;
    uiType?: UiType;
    utilityBar?: string;
    workspaceConfig?: AppWorkspaceConfig;
}

export interface AppActionOverride extends ActionOverride {
    pageOrSobjectType: string;
}

export interface ActionOverride {
    actionName?: string;
    comment?: string;
    content?: string;
    formFactor?: FormFactor;
    skipRecordTypeSelect?: boolean;
    type?: ActionOverrideType;
}

export interface AppBrand {
    footerColor?: string;
    headerColor?: string;
    logo?: string;
    logoVersion?: number; // xsd-type: "int"
    shouldOverrideOrgTheme?: boolean;
}

export interface ServiceCloudConsoleConfig {
    componentList?: AppComponentList;
    detailPageRefreshMethod: string;
    footerColor?: string;
    headerColor?: string;
    keyboardShortcuts: KeyboardShortcuts;
    listPlacement: ListPlacement;
    listRefreshMethod: string;
    liveAgentConfig?: LiveAgentConfig;
    primaryTabColor?: string;
    pushNotifications?: Array<PushNotification>;
    tabLimitConfig?: TabLimitConfig;
    whitelistedDomains?: Array<string>;
}

export interface AppComponentList {
    alignment: string;
    components?: Array<string>;
}

export interface KeyboardShortcuts {
    customShortcuts?: Array<CustomShortcut>;
    defaultShortcuts?: Array<DefaultShortcut>;
}

export interface CustomShortcut extends DefaultShortcut {
    description?: string;
    eventName: string;
}

export interface DefaultShortcut {
    action: string;
    active: boolean;
    keyCommand: string;
}

export interface ListPlacement {
    height?: number; // xsd-type: "int"
    location: string;
    units?: string;
    width?: number; // xsd-type: "int"
}

export interface LiveAgentConfig {
    enableLiveChat?: boolean;
    openNewAccountSubtab?: boolean;
    openNewCaseSubtab?: boolean;
    openNewContactSubtab?: boolean;
    openNewLeadSubtab?: boolean;
    openNewVFPageSubtab?: boolean;
    pageNamesToOpen?: Array<string>;
    showKnowledgeArticles?: boolean;
}

export interface PushNotification {
    fieldNames?: Array<string>;
    objectName: string;
}

export interface TabLimitConfig {
    maxNumberOfPrimaryTabs?: string;
    maxNumberOfSubTabs?: string;
}

export interface AppPreferences {
    enableCustomizeMyTabs: boolean;
    enableKeyboardShortcuts: boolean;
    enableListViewHover: boolean;
    enableListViewReskin: boolean;
    enableMultiMonitorComponents: boolean;
    enablePinTabs: boolean;
    enableTabHover: boolean;
    enableTabLimits: boolean;
    saveUserSessions: boolean;
}

export interface AppProfileActionOverride extends ProfileActionOverride {
    profile: string;
}

export interface ProfileActionOverride {
    actionName: string;
    content?: string;
    formFactor: FormFactor;
    pageOrSobjectType: string;
    recordType?: string;
    type: ActionOverrideType;
}

export interface AppWorkspaceConfig {
    mappings?: Array<WorkspaceMapping>;
}

export interface WorkspaceMapping {
    fieldName?: string;
    tab: string;
}

export interface CustomApplicationComponentMetadata extends MetadataInfo {
    buttonIconUrl?: string;
    buttonStyle?: string;
    buttonText?: string;
    buttonWidth?: number; // xsd-type: "int"
    height?: number; // xsd-type: "int"
    isHeightFixed: boolean;
    isHidden: boolean;
    isWidthFixed: boolean;
    visualforcePage: string;
    width?: number; // xsd-type: "int"
}

export interface CustomFeedFilterMetadata extends MetadataInfo {
    criteria?: Array<FeedFilterCriterion>;
    description?: string;
    isProtected?: boolean;
    label: string;
}

export interface FeedFilterCriterion {
    feedItemType: FeedItemType;
    feedItemVisibility?: FeedItemVisibility;
    relatedSObjectType?: string;
}

export interface CustomFieldMetadata extends MetadataInfo {
    businessOwnerGroup?: string;
    businessOwnerUser?: string;
    businessStatus?: string;
    caseSensitive?: boolean;
    complianceGroup?: string;
    customDataType?: string;
    defaultValue?: string;
    deleteConstraint?: DeleteConstraint;
    deprecated?: boolean;
    description?: string;
    displayFormat?: string;
    encryptionScheme?: EncryptionScheme;
    escapeMarkup?: boolean;
    externalDeveloperName?: string;
    externalId?: boolean;
    fieldManageability?: FieldManageability;
    formula?: string;
    formulaTreatBlanksAs?: TreatBlanksAs;
    inlineHelpText?: string;
    isAIPredictionField?: boolean;
    isConvertLeadDisabled?: boolean;
    isFilteringDisabled?: boolean;
    isNameField?: boolean;
    isSortingDisabled?: boolean;
    label?: string;
    length?: number; // xsd-type: "int"
    lookupFilter?: LookupFilter;
    maskChar?: EncryptedFieldMaskChar;
    maskType?: EncryptedFieldMaskType;
    metadataRelationshipControllingField?: string;
    mktDataLakeFieldAttributes?: MktDataLakeFieldAttributes;
    mktDataModelFieldAttributes?: MktDataModelFieldAttributes;
    populateExistingRows?: boolean;
    precision?: number; // xsd-type: "int"
    referenceTargetField?: string;
    referenceTo?: string;
    relationshipLabel?: string;
    relationshipName?: string;
    relationshipOrder?: number; // xsd-type: "int"
    reparentableMasterDetail?: boolean;
    required?: boolean;
    restrictedAdminField?: boolean;
    scale?: number; // xsd-type: "int"
    securityClassification?: string;
    startingNumber?: number; // xsd-type: "int"
    stripMarkup?: boolean;
    summarizedField?: string;
    summaryFilterItems?: Array<FilterItem>;
    summaryForeignKey?: string;
    summaryOperation?: SummaryOperations;
    trackFeedHistory?: boolean;
    trackHistory?: boolean;
    trackTrending?: boolean;
    translateData?: boolean;
    type?: ObjectFieldType;
    unique?: boolean;
    valueSet?: ValueSet;
    visibleLines?: number; // xsd-type: "int"
    writeRequiresMasterRead?: boolean;
}

export interface LookupFilter {
    active: boolean;
    booleanFilter?: string;
    description?: string;
    errorMessage?: string;
    filterItems?: Array<FilterItem>;
    infoMessage?: string;
    isOptional: boolean;
}

export interface MktDataLakeFieldAttributes {
    dateFormat?: string;
    definitionCreationType?: DefinitionCreationType;
    externalName?: string;
    isEventDate?: boolean;
    isInternalOrganization?: boolean;
    isRecordModified?: boolean;
    keyQualifierName?: string;
    mktDatalakeSrcKeyQualifier?: string;
    primaryIndexOrder?: number; // xsd-type: "int"
    usageTag?: UsageTag;
}

export interface MktDataModelFieldAttributes {
    definitionCreationType?: DefinitionCreationType;
    invalidMergeActionType?: InvalidMergeActionType;
    isDynamicLookup?: boolean;
    keyQualifierName?: string;
    primaryIndexOrder?: number; // xsd-type: "int"
    refAttrDeveloperName?: string;
    usageTag?: MktDataModelFieldUsageTag;
}

export interface ValueSet {
    controllingField?: string;
    restricted?: boolean;
    valueSetDefinition?: ValueSetValuesDefinition;
    valueSetName?: string;
    valueSettings?: Array<ValueSettings>;
}

export interface ValueSetValuesDefinition {
    sorted: boolean;
    value?: Array<CustomValueMetadata>;
}

export interface CustomValueMetadata extends MetadataInfo {
    color?: string;
    default: boolean;
    description?: string;
    isActive?: boolean;
    label?: string;
}

export interface StandardValue extends CustomValueMetadata {
    allowEmail?: boolean;
    closed?: boolean;
    converted?: boolean;
    cssExposed?: boolean;
    forecastCategory?: ForecastCategories;
    groupingString?: string;
    highPriority?: boolean;
    probability?: number; // xsd-type: "int"
    reverseRole?: string;
    reviewed?: boolean;
    won?: boolean;
}

export interface ValueSettings {
    controllingFieldValue?: Array<string>;
    valueName: string;
}

export interface CustomHelpMenuSectionMetadata extends MetadataInfo {
    customHelpMenuItems?: Array<CustomHelpMenuItem>;
    masterLabel: string;
}

export interface CustomHelpMenuItem {
    linkUrl: string;
    masterLabel: string;
    sortOrder: number; // xsd-type: "int"
}

export interface CustomIndexMetadata extends MetadataInfo {
    allowNullValues?: boolean;
}

export interface CustomLabelMetadata extends MetadataInfo {
    categories?: string;
    language: string;
    protected: boolean;
    shortDescription: string;
    value: string;
}

export interface CustomLabelsMetadata extends MetadataInfo {
    labels?: Array<CustomLabelMetadata>;
}

export interface CustomMetadata extends MetadataInfo {
    description?: string;
    label?: string;
    protected?: boolean;
    values?: Array<CustomMetadataValue>;
}

export interface CustomMetadataValue {
    field: string;
    value?: unknown | null; // xsd-type: "anyType"
}

export interface CustomNotificationTypeMetadata extends MetadataInfo {
    customNotifTypeName: string;
    description?: string;
    desktop: boolean;
    masterLabel: string;
    mobile: boolean;
    slack?: boolean;
}

export interface CustomObjectMetadata extends MetadataInfo {
    actionOverrides?: Array<ActionOverride>;
    allowInChatterGroups?: boolean;
    articleTypeChannelDisplay?: ArticleTypeChannelDisplay;
    businessProcesses?: Array<BusinessProcessMetadata>;
    compactLayoutAssignment?: string;
    compactLayouts?: Array<CompactLayoutMetadata>;
    customHelp?: string;
    customHelpPage?: string;
    customSettingsType?: CustomSettingsType;
    deploymentStatus?: DeploymentStatus;
    deprecated?: boolean;
    description?: string;
    enableActivities?: boolean;
    enableBulkApi?: boolean;
    enableDataTranslation?: boolean;
    enableDivisions?: boolean;
    enableEnhancedLookup?: boolean;
    enableFeeds?: boolean;
    enableHistory?: boolean;
    enableLicensing?: boolean;
    enablePublishStatusTracking?: boolean;
    enableReports?: boolean;
    enableSearch?: boolean;
    enableSharing?: boolean;
    enableStreamingApi?: boolean;
    eventType?: PlatformEventType;
    externalDataSource?: string;
    externalName?: string;
    externalRepository?: string;
    externalSharingModel?: SharingModel;
    fieldSets?: Array<FieldSetMetadata>;
    fields?: Array<CustomFieldMetadata>;
    gender?: Gender;
    historyRetentionPolicy?: HistoryRetentionPolicy;
    household?: boolean;
    indexes?: Array<IndexMetadata>;
    label?: string;
    listViews?: Array<ListViewMetadata>;
    mktDataLakeAttributes?: MktDataLakeAttributes;
    mktDataModelAttributes?: MktDataModelAttributes;
    nameField?: CustomFieldMetadata;
    pluralLabel?: string;
    profileSearchLayouts?: Array<ProfileSearchLayouts>;
    publishBehavior?: PlatformEventPublishBehavior;
    recordTypeTrackFeedHistory?: boolean;
    recordTypeTrackHistory?: boolean;
    recordTypes?: Array<RecordTypeMetadata>;
    searchLayouts?: SearchLayouts;
    sharingModel?: SharingModel;
    sharingReasons?: Array<SharingReasonMetadata>;
    sharingRecalculations?: Array<SharingRecalculation>;
    startsWith?: StartsWith;
    validationRules?: Array<ValidationRuleMetadata>;
    visibility?: SetupObjectVisibility;
    webLinks?: Array<WebLinkMetadata>;
}

export interface ArticleTypeChannelDisplay {
    articleTypeTemplates?: Array<ArticleTypeTemplate>;
}

export interface ArticleTypeTemplate {
    channel: Channel;
    page?: string;
    template: Template;
}

export interface FieldSetMetadata extends MetadataInfo {
    availableFields?: Array<FieldSetItem>;
    description: string;
    displayedFields?: Array<FieldSetItem>;
    label: string;
}

export interface FieldSetItem {
    field?: string;
    isFieldManaged?: boolean;
    isRequired?: boolean;
}

export interface HistoryRetentionPolicy {
    archiveAfterMonths: number; // xsd-type: "int"
    archiveRetentionYears: number; // xsd-type: "int"
    description?: string;
}

export interface IndexMetadata extends MetadataInfo {
    fields?: Array<IndexField>;
    label: string;
}

export interface IndexField {
    name: string;
    sortDirection: string;
}

export interface ListViewMetadata extends MetadataInfo {
    booleanFilter?: string;
    columns?: Array<string>;
    division?: string;
    filterScope: FilterScope;
    filters?: Array<ListViewFilter>;
    label: string;
    language?: Language;
    queue?: string;
    sharedTo?: SharedTo;
}

export interface ListViewFilter {
    field: string;
    operation: FilterOperation;
    value?: string;
}

export interface SharedTo {
    allCustomerPortalUsers?: string;
    allInternalUsers?: string;
    allPartnerUsers?: string;
    channelProgramGroup?: Array<string>;
    channelProgramGroups?: Array<string>;
    group?: Array<string>;
    groups?: Array<string>;
    guestUser?: Array<string>;
    managerSubordinates?: Array<string>;
    managers?: Array<string>;
    portalRole?: Array<string>;
    portalRoleAndSubordinates?: Array<string>;
    queue?: Array<string>;
    role?: Array<string>;
    roleAndSubordinates?: Array<string>;
    roleAndSubordinatesInternal?: Array<string>;
    roles?: Array<string>;
    rolesAndSubordinates?: Array<string>;
    territories?: Array<string>;
    territoriesAndSubordinates?: Array<string>;
    territory?: Array<string>;
    territoryAndSubordinates?: Array<string>;
}

export interface MktDataLakeAttributes {
    creationType?: DefinitionCreationType;
    isEnabled?: boolean;
    objectCategory?: string;
}

export interface MktDataModelAttributes {
    creationType?: DefinitionCreationType;
    dataModelTaxonomy?: string;
    description?: string;
    isEnabled?: boolean;
    isSegmentable?: boolean;
    isUsedForMetrics?: boolean;
    objectCategory?: string;
    referenceEntityGroup?: string;
    referenceEntityName?: string;
    referenceEntitySubjectArea?: string;
}

export interface ProfileSearchLayouts {
    fields?: Array<string>;
    profileName?: string;
}

export interface RecordTypeMetadata extends MetadataInfo {
    active: boolean;
    businessProcess?: string;
    compactLayoutAssignment?: string;
    description?: string;
    label: string;
    picklistValues?: Array<RecordTypePicklistValue>;
}

export interface RecordTypePicklistValue {
    picklist: string;
    values?: Array<PicklistValueMetadata>;
}

export interface SearchLayouts {
    customTabListAdditionalFields?: Array<string>;
    excludedStandardButtons?: Array<string>;
    listViewButtons?: Array<string>;
    lookupDialogsAdditionalFields?: Array<string>;
    lookupFilterFields?: Array<string>;
    lookupPhoneDialogsAdditionalFields?: Array<string>;
    massQuickActions?: Array<string>;
    searchFilterFields?: Array<string>;
    searchResultsAdditionalFields?: Array<string>;
    searchResultsCustomButtons?: Array<string>;
}

export interface SharingReasonMetadata extends MetadataInfo {
    label: string;
}

export interface SharingRecalculation {
    className: string;
}

export interface ValidationRuleMetadata extends MetadataInfo {
    active: boolean;
    description?: string;
    errorConditionFormula: string;
    errorDisplayField?: string;
    errorMessage: string;
}

export interface WebLinkMetadata extends MetadataInfo {
    availability: WebLinkAvailability;
    description?: string;
    displayType: WebLinkDisplayType;
    encodingKey?: Encoding;
    hasMenubar?: boolean;
    hasScrollbars?: boolean;
    hasToolbar?: boolean;
    height?: number; // xsd-type: "int"
    isResizable?: boolean;
    linkType: WebLinkType;
    masterLabel?: string;
    openType: WebLinkWindowType;
    page?: string;
    position?: WebLinkPosition;
    protected: boolean;
    requireRowSelection?: boolean;
    scontrol?: string;
    showsLocation?: boolean;
    showsStatus?: boolean;
    url?: string;
    width?: number; // xsd-type: "int"
}

export interface CustomObjectTranslationMetadata extends MetadataInfo {
    caseValues?: Array<ObjectNameCaseValue>;
    fieldSets?: Array<FieldSetTranslation>;
    fields?: Array<CustomFieldTranslation>;
    gender?: Gender;
    layouts?: Array<LayoutTranslation>;
    nameFieldLabel?: string;
    quickActions?: Array<QuickActionTranslation>;
    recordTypes?: Array<RecordTypeTranslation>;
    sharingReasons?: Array<SharingReasonTranslation>;
    standardFields?: Array<StandardFieldTranslation>;
    startsWith?: StartsWith;
    validationRules?: Array<ValidationRuleTranslation>;
    webLinks?: Array<WebLinkTranslation>;
    workflowTasks?: Array<WorkflowTaskTranslation>;
}

export interface ObjectNameCaseValue {
    article?: Article;
    caseType?: CaseType;
    plural?: boolean;
    possessive?: Possessive;
    value: string;
}

export interface FieldSetTranslation {
    label: string;
    name: string;
}

export interface CustomFieldTranslation {
    caseValues?: Array<ObjectNameCaseValue>;
    gender?: Gender;
    help?: string;
    label?: string;
    lookupFilter?: LookupFilterTranslation;
    name: string;
    picklistValues?: Array<PicklistValueTranslation>;
    relationshipLabel?: string;
    startsWith?: StartsWith;
}

export interface LookupFilterTranslation {
    errorMessage: string;
    informationalMessage: string;
}

export interface PicklistValueTranslation {
    masterLabel: string;
    translation?: string;
}

export interface LayoutTranslation {
    layout: string;
    layoutType?: string;
    sections?: Array<LayoutSectionTranslation>;
}

export interface LayoutSectionTranslation {
    label: string;
    section: string;
}

export interface QuickActionTranslation {
    aspect?: string;
    label: string;
    name: string;
}

export interface RecordTypeTranslation {
    description?: string;
    label: string;
    name: string;
}

export interface SharingReasonTranslation {
    label: string;
    name: string;
}

export interface StandardFieldTranslation {
    label?: string;
    name: string;
}

export interface ValidationRuleTranslation {
    errorMessage: string;
    name: string;
}

export interface WebLinkTranslation {
    label: string;
    name: string;
}

export interface WorkflowTaskTranslation {
    description?: string;
    name: string;
    subject?: string;
}

export interface CustomPageWebLinkMetadata extends MetadataInfo {
    availability: WebLinkAvailability;
    description?: string;
    displayType: WebLinkDisplayType;
    encodingKey?: Encoding;
    hasMenubar?: boolean;
    hasScrollbars?: boolean;
    hasToolbar?: boolean;
    height?: number; // xsd-type: "int"
    isResizable?: boolean;
    linkType: WebLinkType;
    masterLabel?: string;
    openType: WebLinkWindowType;
    page?: string;
    position?: WebLinkPosition;
    protected: boolean;
    requireRowSelection?: boolean;
    scontrol?: string;
    showsLocation?: boolean;
    showsStatus?: boolean;
    url?: string;
    width?: number; // xsd-type: "int"
}

export interface CustomPermissionMetadata extends MetadataInfo {
    connectedApp?: string;
    description?: string;
    isLicensed: boolean;
    label: string;
    requiredPermission?: Array<CustomPermissionDependencyRequired>;
}

export interface CustomPermissionDependencyRequired {
    customPermission: string;
    dependency: boolean;
}

export interface CustomSiteMetadata extends MetadataInfo {
    active: boolean;
    allowHomePage: boolean;
    allowStandardAnswersPages?: boolean;
    allowStandardIdeasPages: boolean;
    allowStandardLookups: boolean;
    allowStandardPortalPages: boolean;
    allowStandardSearch: boolean;
    analyticsTrackingCode?: string;
    authorizationRequiredPage?: string;
    bandwidthExceededPage?: string;
    browserXssProtection: boolean;
    cachePublicVisualforcePagesInProxyServers?: boolean;
    changePasswordPage?: string;
    chatterAnswersForgotPasswordConfirmPage?: string;
    chatterAnswersForgotPasswordPage?: string;
    chatterAnswersHelpPage?: string;
    chatterAnswersLoginPage?: string;
    chatterAnswersRegistrationPage?: string;
    clickjackProtectionLevel: SiteClickjackProtectionLevel;
    contentSniffingProtection: boolean;
    customWebAddresses?: Array<SiteWebAddress>;
    description?: string;
    enableAuraRequests?: boolean;
    favoriteIcon?: string;
    fileNotFoundPage?: string;
    forgotPasswordPage?: string;
    genericErrorPage?: string;
    guestProfile?: string;
    inMaintenancePage?: string;
    inactiveIndexPage?: string;
    indexPage: string;
    masterLabel: string;
    myProfilePage?: string;
    portal?: string;
    redirectToCustomDomain?: boolean;
    referrerPolicyOriginWhenCrossOrigin: boolean;
    robotsTxtPage?: string;
    selfRegPage?: string;
    serverIsDown?: string;
    siteAdmin?: string;
    siteGuestRecordDefaultOwner?: string;
    siteIframeWhiteListUrls?: Array<SiteIframeWhiteListUrl>;
    siteRedirectMappings?: Array<SiteRedirectMapping>;
    siteTemplate?: string;
    siteType: SiteType;
    subdomain?: string;
    urlPathPrefix?: string;
}

export interface SiteWebAddress {
    certificate?: string;
    domainName: string;
    primary: boolean;
}

export interface SiteIframeWhiteListUrl {
    url: string;
}

export interface SiteRedirectMapping {
    action: SiteRedirect;
    isActive?: boolean;
    isDynamic?: boolean;
    source: string;
    target: string;
}

export interface CustomTabMetadata extends MetadataInfo {
    actionOverrides?: Array<ActionOverride>;
    auraComponent?: string;
    customObject?: boolean;
    description?: string;
    flexiPage?: string;
    frameHeight?: number; // xsd-type: "int"
    hasSidebar?: boolean;
    icon?: string;
    label?: string;
    lwcComponent?: string;
    motif?: string;
    page?: string;
    scontrol?: string;
    splashPageLink?: string;
    url?: string;
    urlEncodingKey?: Encoding;
}

export interface CustomerDataPlatformSettingsMetadata extends MetadataInfo {
    enableCustomerDataPlatform?: boolean;
}

export interface CustomizablePropensityScoringSettingsMetadata extends MetadataInfo {
    enableCpsPref?: boolean;
}

export interface DashboardMetadata extends MetadataInfo {
    backgroundEndColor: string;
    backgroundFadeDirection: ChartBackgroundDirection;
    backgroundStartColor: string;
    chartTheme?: ChartTheme;
    colorPalette?: ChartColorPalettes;
    dashboardChartTheme?: ChartTheme;
    dashboardColorPalette?: ChartColorPalettes;
    dashboardFilters?: Array<DashboardFilter>;
    dashboardGridLayout?: DashboardGridLayout;
    dashboardResultRefreshedDate?: string;
    dashboardResultRunningUser?: string;
    dashboardType?: DashboardType;
    description?: string;
    folderName?: string;
    isGridLayout?: boolean;
    leftSection?: DashboardComponentSection;
    middleSection?: DashboardComponentSection;
    numSubscriptions?: number; // xsd-type: "int"
    rightSection?: DashboardComponentSection;
    runningUser?: string;
    textColor: string;
    title: string;
    titleColor: string;
    titleSize: number; // xsd-type: "int"
}

export interface DashboardFilter {
    dashboardFilterOptions?: Array<DashboardFilterOption>;
    name: string;
}

export interface DashboardFilterOption {
    operator: DashboardFilterOperation;
    values?: Array<string>;
}

export interface DashboardGridLayout {
    dashboardGridComponents?: Array<DashboardGridComponent>;
    numberOfColumns: number; // xsd-type: "int"
    rowHeight: number; // xsd-type: "int"
}

export interface DashboardGridComponent {
    colSpan: number; // xsd-type: "int"
    columnIndex: number; // xsd-type: "int"
    dashboardComponent: DashboardComponent;
    rowIndex: number; // xsd-type: "int"
    rowSpan: number; // xsd-type: "int"
}

export interface DashboardComponent {
    autoselectColumnsFromReport?: boolean;
    chartAxisRange?: ChartRangeType;
    chartAxisRangeMax?: number; // xsd-type: "double"
    chartAxisRangeMin?: number; // xsd-type: "double"
    chartSummary?: Array<ChartSummary>;
    componentChartTheme?: ChartTheme;
    componentType: DashboardComponentType;
    dashboardDynamicValues?: Array<DashboardDynamicValue>;
    dashboardFilterColumns?: Array<DashboardFilterColumn>;
    dashboardTableColumn?: Array<DashboardTableColumn>;
    decimalPrecision?: number; // xsd-type: "int"
    displayUnits?: ChartUnits;
    drillDownUrl?: string;
    drillEnabled?: boolean;
    drillToDetailEnabled?: boolean;
    enableHover?: boolean;
    expandOthers?: boolean;
    flexComponentProperties?: DashboardFlexTableComponentProperties;
    footer?: string;
    gaugeMax?: number; // xsd-type: "double"
    gaugeMin?: number; // xsd-type: "double"
    groupingColumn?: Array<string>;
    groupingSortProperties?: DashboardComponentGroupingSortProperties;
    header?: string;
    indicatorBreakpoint1?: number; // xsd-type: "double"
    indicatorBreakpoint2?: number; // xsd-type: "double"
    indicatorHighColor?: string;
    indicatorLowColor?: string;
    indicatorMiddleColor?: string;
    legendPosition?: ChartLegendPosition;
    maxValuesDisplayed?: number; // xsd-type: "int"
    metricLabel?: string;
    page?: string;
    pageHeightInPixels?: number; // xsd-type: "int"
    report?: string;
    scontrol?: string;
    scontrolHeightInPixels?: number; // xsd-type: "int"
    showPercentage?: boolean;
    showPicturesOnCharts?: boolean;
    showPicturesOnTables?: boolean;
    showRange?: boolean;
    showTotal?: boolean;
    showValues?: boolean;
    sortBy?: DashboardComponentFilter;
    title?: string;
    useReportChart?: boolean;
}

export interface ChartSummary {
    aggregate?: ReportSummaryType;
    axisBinding?: ChartAxis;
    column: string;
}

export interface DashboardDynamicValue {
    additionalInfo?: string;
    fieldName: string;
    isDynamicUser?: boolean;
}

export interface DashboardFilterColumn {
    column: string;
}

export interface DashboardTableColumn {
    aggregateType?: ReportSummaryType;
    calculatePercent?: boolean;
    column: string;
    decimalPlaces?: number; // xsd-type: "int"
    showSubTotal?: boolean;
    showTotal?: boolean;
    sortBy?: DashboardComponentFilter;
}

export interface DashboardFlexTableComponentProperties {
    decimalPrecision?: number; // xsd-type: "int"
    flexTableColumn?: Array<DashboardComponentColumn>;
    flexTableSortInfo?: DashboardComponentSortInfo;
    hideChatterPhotos?: boolean;
}

export interface DashboardComponentColumn {
    breakPoint1?: number; // xsd-type: "double"
    breakPoint2?: number; // xsd-type: "double"
    breakPointOrder?: number; // xsd-type: "int"
    highRangeColor?: number; // xsd-type: "int"
    lowRangeColor?: number; // xsd-type: "int"
    midRangeColor?: number; // xsd-type: "int"
    reportColumn: string;
    showSubTotal?: boolean;
    showTotal?: boolean;
    type: string; // xsd-type: "DashboardComponentColumnType"
}

export interface DashboardComponentSortInfo {
    sortColumn?: string;
    sortOrder?: string;
}

export interface DashboardComponentGroupingSortProperties {
    groupingSorts?: Array<DashboardComponentGroupingSort>;
}

export interface DashboardComponentGroupingSort {
    groupingLevel: string;
    inheritedReportGroupingSort?: string;
    sortColumn?: string;
    sortOrder?: string;
}

export interface DashboardComponentSection {
    columnSize: DashboardComponentSize;
    components?: Array<DashboardComponent>;
}

export interface DataCategoryGroupMetadata extends MetadataInfo {
    active: boolean;
    dataCategory: DataCategory;
    description?: string;
    label: string;
    objectUsage?: ObjectUsage;
}

export interface DataCategory {
    dataCategory?: Array<DataCategory>;
    label: string;
    name: string;
}

export interface ObjectUsage {
    object?: Array<string>;
}

export interface DataDotComSettingsMetadata extends MetadataInfo {
    enableAccountExportButtonOff?: boolean;
    enableAccountImportButtonOff?: boolean;
    enableAllowDupeContactFromLead?: boolean;
    enableAllowDupeLeadFromContact?: boolean;
    enableContactExportButtonOff?: boolean;
    enableContactImportButtonOff?: boolean;
    enableDDCSocialKeyEnabled?: boolean;
    enableDataDotComCleanEnabled?: boolean;
    enableDataDotComOptOutsEnabled?: boolean;
    enableDatacloudAPIEnabled?: boolean;
}

export interface PlatformEventSubscriberConfigMetadata extends MetadataInfo {
    batchSize?: number; // xsd-type: "int"
    isProtected?: boolean;
    masterLabel: string;
    platformEventConsumer: string;
    user?: string;
}

export interface SchedulingObjectiveMetadata extends MetadataInfo {
    isProtected?: boolean;
    masterLabel: string;
    schedulingCategory: SchedulingCategory;
    schedulingObjectiveParameters?: Array<SchedulingObjectiveParameter>;
    schedulingObjectiveType: SchedulingObjectiveType;
}

export interface SchedulingObjectiveParameter {
    parameterKey: ObjectiveParameterKey;
    value?: string;
}

export interface PipelineInspMetricConfigMetadata extends MetadataInfo {
    isCumulative: boolean;
    isProtected?: boolean;
    masterLabel: string;
    metric: string; // xsd-type: "PipelineInspectionMetric"
}

export interface VirtualVisitConfigMetadata extends MetadataInfo {
    comprehendServiceType?: VirtualVisitComprehendServiceType;
    experienceCloudSiteUrl?: string;
    externalMsgServiceIdentifier?: string;
    externalRoleIdentifier?: string;
    externalUserIdentifier?: string;
    isProtected?: boolean;
    masterLabel: string;
    messagingRegion?: string;
    namedCredential?: string;
    storageBucketName?: string;
    usageType?: VirtualVisitUsageType;
    videoCallApptTypeValue?: string;
    videoControlRegion?: string;
    visitRegion?: VirtualVisitVisitRegion;
}

export interface MobileSecurityAssignmentMetadata extends MetadataInfo {
    connectedApplication?: string;
    isProtected?: boolean;
    masterLabel: string;
    profile?: string;
}

export interface MobileSecurityPolicyMetadata extends MetadataInfo {
    effectiveDate?: string; // xsd-type: "dateTime"
    isEnabled: boolean;
    isProtected?: boolean;
    masterLabel: string;
    mobilePlatform?: MobileSecurityMobilePlatform;
    mobileSecurityAssignment?: string;
    ruleValue: string;
    ruleValueType: MobileSecurityPolicyRuleValueType;
    severityLevel: MobileSecurityPolicySeverityLevel;
    type: MobileSecurityPolicyType;
}

export interface RecordAlertDataSourceMetadata extends MetadataInfo {
    apexClass?: string;
    isActive?: boolean;
    isProtected?: boolean;
    masterLabel: string;
}

export interface AppExplorationDataConsentMetadata extends MetadataInfo {
    applicationName?: string;
    availableObjects?: string;
    enabledObjects?: string;
    isProjectAccessEnabled?: boolean;
    isProtected?: boolean;
    masterLabel: string;
    projectName?: string;
}

export interface EmployeeDataSyncProfileMetadata extends MetadataInfo {
    description?: string;
    employeeDataSyncField?: Array<EmployeeDataSyncField>;
    isActive: boolean;
    isProtected?: boolean;
    masterLabel: string;
}

export interface EmployeeDataSyncField {
    description?: string;
    isActive: boolean;
    isDefault: boolean;
    isRequired: boolean;
    sourceField: string;
    targetField: string;
}

export interface RegisteredExternalServiceMetadata extends MetadataInfo {
    configUrl?: string;
    documentationUrl?: string;
    extensionPointName?: ExtensionPointName;
    externalServiceProvider: string;
    externalServiceProviderType: RegistryProviderType;
    isProtected?: boolean;
    masterLabel: string;
}

export interface AccountingFieldMappingMetadata extends MetadataInfo {
    isForAllocationType?: boolean;
    isForPaymentType?: boolean;
    isForTransactionType?: boolean;
    isProtected?: boolean;
    mappingBehavior: MappingBehaviorType;
    masterLabel: string;
    sourceField?: string;
    targetField: string;
}

export interface MobSecurityCertPinConfigMetadata extends MetadataInfo {
    certificateHash: string;
    domainName: string;
    isEnabled: boolean;
    isProtected?: boolean;
    isSubdomainIncluded: boolean;
    masterLabel: string;
    mobilePlatform?: MobileSecurityMobilePlatform;
    mobileSecurityAssignment?: string;
    severityLevel: MobileSecurityPolicySeverityLevel;
    type: MobileSecurityCertPinType;
}

export interface ActionableListDefinitionMetadata extends MetadataInfo {
    actionableListDatasetColumns?: Array<ActionableListDatasetColumn>;
    actionableListMemberStatuses?: Array<ActionableListMemberStatus>;
    batchCalcJobDefinition?: string;
    datasetName?: string;
    edgeMart?: string;
    isActive?: boolean;
    isProtected?: boolean;
    masterLabel: string;
    objectName: string;
}

export interface ActionableListDatasetColumn {
    dataDomain?: DatasetColumnDataType;
    isDefault?: boolean;
    objectName?: string;
    sourceColumnApiName?: string;
    sourceFieldName?: string;
}

export interface ActionableListMemberStatus {
    iconName?: string;
    status?: string;
}

export interface CareProviderSearchConfigMetadata extends MetadataInfo {
    isActive?: boolean;
    isProtected?: boolean;
    mappedObject: ProviderSearchObjectMapping;
    masterLabel: string;
    sourceField?: string;
    targetField?: string;
}

export interface CareSystemFieldMappingMetadata extends MetadataInfo {
    externalIdField?: string;
    isActive?: boolean;
    isProtected?: boolean;
    masterLabel: string;
    role: SourceSystemFieldRole;
    sourceSystem?: string;
    targetObject?: string;
}

export interface CareLimitTypeMetadata extends MetadataInfo {
    isProtected?: boolean;
    limitType?: string;
    masterLabel: string;
    metricType?: CareLimitTypeMetricType;
}

export interface SchedulingRuleMetadata extends MetadataInfo {
    isProtected?: boolean;
    masterLabel: string;
    schedulingCategory: SchedulingCategory;
    schedulingRuleParameters?: Array<SchedulingRuleParameter>;
    schedulingRuleType: SchedulingRuleType;
}

export interface SchedulingRuleParameter {
    schedulingParameterKey: SchedulingParameterKey;
    value?: string;
}

export interface PortalDelegablePermissionSetMetadata extends MetadataInfo {
    isProtected?: boolean;
    masterLabel: string;
    permissionSet: string;
    profile: string;
}

export interface RelatedRecordAssocCriteriaMetadata extends MetadataInfo {
    associationHandlerApexClass?: string;
    associationType: AssociationType;
    description?: string;
    eventType: AssociationEventType;
    isProtected?: boolean;
    masterLabel: string;
    preCondition: string;
    referenceObject: string;
    selectedOwnerField?: string;
    status: AssociationStatusType;
}

export interface PlatformSlackSettingsMetadata extends MetadataInfo {
    enableSlackService?: boolean;
    enableSlackServiceAlerts?: boolean;
    slackCapabilitiesEnabled?: boolean;
}

export interface DataImportManagementSettingsMetadata extends MetadataInfo {
    enableDataConnectorHubspot?: boolean;
    enableEasyImport?: boolean;
}

export interface WorkforceEngagementSettingsMetadata extends MetadataInfo {
    enableHistoricalAdherence?: boolean;
    enableIndividualAdherence?: boolean;
    enableIntradayManagement?: boolean;
    enableMachineLearningForecasting?: boolean;
    enableRealTimeAdherence?: boolean;
    enableWorkforceEngagement?: boolean;
    enableWorkforceEngagementConfiguration?: boolean;
}

export interface MailMergeSettingsMetadata extends MetadataInfo {
    enableExtendedMailMerge?: boolean;
    saveMailMergeDocsAsSalesforceDocs?: boolean;
}

export interface AccountingSettingsMetadata extends MetadataInfo {
    enableAccountingSubledger?: boolean;
    enableFinancePeriod?: boolean;
    enablePaymentMethodAdjust?: boolean;
    enableScheduledJob?: boolean;
}

export interface CollectionsDashboardSettingsMetadata extends MetadataInfo {
    enableCollectionsDashboard?: boolean;
}

export interface InvLatePymntRiskCalcSettingsMetadata extends MetadataInfo {
    enableInvLatePymntRiskCalc?: boolean;
}

export interface MediaAdSalesSettingsMetadata extends MetadataInfo {
    enableMediaAdSales?: boolean;
}

export interface BranchManagementSettingsMetadata extends MetadataInfo {
    associateAccountWithBranch?: boolean;
}

export interface SandboxSettingsMetadata extends MetadataInfo {
    disableSandboxExpirationEmails?: boolean;
}

export interface InterestTaggingSettingsMetadata extends MetadataInfo {
    enableInterestTagging?: boolean;
}

export interface AssociationEngineSettingsMetadata extends MetadataInfo {
    enableAssociationEngine?: boolean;
}

export interface PaymentsIngestEnabledSettingsMetadata extends MetadataInfo {
    paymentsIngestEnabled?: boolean;
}

export interface SourceTrackingSettingsMetadata extends MetadataInfo {
    enableSourceTrackingSandboxes?: boolean;
}

export interface OrgSettingsMetadata extends MetadataInfo {
    enableCustomerSuccessPortal?: boolean;
    enableIncludeContractStatus?: boolean;
    enableMakeDeploymentsMandatory?: boolean;
    enableManageSelfServiceUsers?: boolean;
    enableOrgFeedSentimentAnalysis?: boolean;
    enableRADeploymentAttributeOnly?: boolean;
    enableResetDivisionOnLogin?: boolean;
}

export interface DevHubSettingsMetadata extends MetadataInfo {
    devOpsCenterBetaMsa?: boolean;
    enableDevOpsCenter?: boolean;
    enableDevOpsCenterGA?: boolean;
    enablePackaging2?: boolean;
    enableScratchOrgManagementPref?: boolean;
    enableShapeExportPref?: boolean;
}

export interface IncludeEstTaxInQuoteSettingsMetadata extends MetadataInfo {
    enableQuoteEstimatedTax?: boolean;
}

export interface IndustriesLoyaltySettingsMetadata extends MetadataInfo {
    enableAutomaticVoucherCodeGeneration?: boolean;
    enableFixedTypeNQPAggregation?: boolean;
    enableLoyaltyRedeemedPointsExpirationInfoPref?: boolean;
    enableLoyaltyRulesVerifyCdpMemberSegment?: boolean;
    enableLoyaltyServiceExcellence?: boolean;
    enableNQPRealTimePointBalance?: boolean;
    enableQPRealTimePointBalance?: boolean;
}

export interface PaymentsManagementEnabledSettingsMetadata extends MetadataInfo {
    paymentsManagementEnabled?: boolean;
}

export interface AppAnalyticsSettingsMetadata extends MetadataInfo {
    enableSimulationMode?: boolean;
}

export interface MapsAndLocationSettingsMetadata extends MetadataInfo {
    enableAddressAutoComplete?: boolean;
    enableMapsAndLocation?: boolean;
}

export interface OnlineSalesSettingsMetadata extends MetadataInfo {
    enableSubscriptionAppEnrolled?: boolean;
}

export interface DelegateGroupMetadata extends MetadataInfo {
    customObjects?: Array<string>;
    groups?: Array<string>;
    label: string;
    loginAccess: boolean;
    permissionSets?: Array<string>;
    profiles?: Array<string>;
    roles?: Array<string>;
}

export interface DeploymentSettingsMetadata extends MetadataInfo {
    doesSkipAsyncApexValidation?: boolean;
}

export interface DigitalExperienceBundleMetadata extends MetadataInfo {
    description?: string;
    label: string;
    spaceResources?: Array<DigitalExperienceMetadata>;
}

export interface DigitalExperienceMetadata extends MetadataWithContentMetadata {
    fileName: string;
    filePath?: string;
    format: string;
}

export interface MetadataWithContentMetadata extends MetadataInfo {
    content?: string; // xsd-type: "base64Binary"
}

export interface ApexClassMetadata extends MetadataWithContentMetadata {
    apiVersion: number; // xsd-type: "double"
    packageVersions?: Array<PackageVersion>;
    status: ApexCodeUnitStatus;
}

export interface ApexComponentMetadata extends MetadataWithContentMetadata {
    apiVersion?: number; // xsd-type: "double"
    description?: string;
    label: string;
    packageVersions?: Array<PackageVersion>;
}

export interface ApexPageMetadata extends MetadataWithContentMetadata {
    apiVersion: number; // xsd-type: "double"
    availableInTouch?: boolean;
    confirmationTokenRequired?: boolean;
    description?: string;
    label: string;
    packageVersions?: Array<PackageVersion>;
}

export interface ApexTriggerMetadata extends MetadataWithContentMetadata {
    apiVersion: number; // xsd-type: "double"
    packageVersions?: Array<PackageVersion>;
    status: ApexCodeUnitStatus;
}

export interface CertificateMetadata extends MetadataWithContentMetadata {
    caSigned: boolean;
    encryptedWithPlatformEncryption?: boolean | null;
    expirationDate?: string | null; // xsd-type: "dateTime"
    keySize?: number; // xsd-type: "int"
    masterLabel: string;
    privateKeyExportable?: boolean | null;
}

export interface ContentAssetMetadata extends MetadataWithContentMetadata {
    format?: ContentAssetFormat;
    isVisibleByExternalUsers?: boolean;
    language: string;
    masterLabel: string;
    originNetwork?: string;
    relationships?: ContentAssetRelationships;
    versions: ContentAssetVersions;
}

export interface ContentAssetRelationships {
    emailTemplate?: Array<ContentAssetLink>;
    insightsApplication?: Array<ContentAssetLink>;
    network?: Array<ContentAssetLink>;
    organization?: ContentAssetLink;
    workspace?: Array<ContentAssetLink>;
}

export interface ContentAssetLink {
    access: ContentAssetAccess;
    isManagingWorkspace?: boolean;
    name?: string;
}

export interface ContentAssetVersions {
    version?: Array<ContentAssetVersion>;
}

export interface ContentAssetVersion {
    number: string;
    pathOnClient: string;
    zipEntry?: string;
}

export interface DataWeaveResourceMetadata extends MetadataWithContentMetadata {
    apiVersion: number; // xsd-type: "double"
    isProtected?: boolean;
}

export interface DiscoveryAIModelMetadata extends MetadataWithContentMetadata {
    algorithmType: DiscoveryAlgorithmType;
    classificationThreshold?: number; // xsd-type: "double"
    description?: string;
    label: string;
    modelFields?: Array<DiscoveryModelField>;
    modelRuntimeType: DiscoveryModelRuntimeType;
    predictedField: string;
    predictionType: DiscoveryPredictionType;
    sourceType: DiscoveryModelSourceType;
    status: DiscoveryAIModelStatus;
    trainingMetrics?: string;
    transformations?: Array<DiscoveryModelTransform>;
}

export interface DiscoveryModelField {
    isDisparateImpact?: boolean;
    isSensitive?: boolean;
    label: string;
    name: string;
    type: DiscoveryModelFieldType;
    values?: Array<string>;
}

export interface DiscoveryModelTransform {
    config?: string;
    sourceFieldNames?: Array<string>;
    targetFieldNames?: Array<string>;
    type: string; // xsd-type: "DiscoveryAIModelTransformationType"
}

export interface DiscoveryStoryMetadata extends MetadataWithContentMetadata {
    application: string;
    autopilot?: string; // xsd-type: "DiscoveryStoryAutopilotStatus"
    classificationThreshold?: number; // xsd-type: "double"
    label: string;
    outcome: DiscoveryStoryOutcome;
    sourceContainer: string;
    sourceType: string; // xsd-type: "DiscoveryStorySourceType"
    validationContainer?: string;
}

export interface DiscoveryStoryOutcome {
    failureValue?: string;
    field: string;
    goal: string; // xsd-type: "DiscoveryStoryOutcomeGoal"
    label: string;
    successValue?: string;
    type: string; // xsd-type: "DiscoveryStoryOutcomeType"
}

export interface DocumentMetadata extends MetadataWithContentMetadata {
    description?: string;
    internalUseOnly: boolean;
    keywords?: string;
    name?: string;
    public: boolean;
}

export interface EclairGeoDataMetadata extends MetadataWithContentMetadata {
    maps?: Array<EclairMap>;
    masterLabel: string;
}

export interface EclairMap {
    boundingBoxBottom?: number; // xsd-type: "double"
    boundingBoxLeft?: number; // xsd-type: "double"
    boundingBoxRight?: number; // xsd-type: "double"
    boundingBoxTop?: number; // xsd-type: "double"
    mapLabel?: string;
    mapName: string;
    projection: string;
}

export interface EmailTemplateMetadata extends MetadataWithContentMetadata {
    apiVersion?: number; // xsd-type: "double"
    attachedDocuments?: Array<string>;
    attachments?: Array<Attachment>;
    available: boolean;
    description?: string;
    encodingKey: Encoding;
    letterhead?: string;
    name: string;
    packageVersions?: Array<PackageVersion>;
    pageDevName?: string;
    relatedEntityType?: string;
    style: EmailTemplateStyle;
    subject?: string;
    textOnly?: string;
    type: EmailTemplateType;
    uiType?: EmailTemplateUiType;
}

export interface Attachment {
    content: string; // xsd-type: "base64Binary"
    name: string;
}

export interface FieldServiceMobileExtensionMetadata extends MetadataWithContentMetadata {
    description?: string;
    developerName: string;
    fileName: string;
    masterLabel?: string;
    size?: number; // xsd-type: "int"
    version?: number; // xsd-type: "int"
}

export interface InboundCertificateMetadata extends MetadataWithContentMetadata {
    expirationDate: string; // xsd-type: "date"
    issuer: string;
    masterLabel: string;
    serialId: string;
}

export interface NetworkBrandingMetadata extends MetadataWithContentMetadata {
    loginBackgroundImageUrl?: string;
    loginFooterText?: string;
    loginLogo?: string;
    loginLogoName?: string;
    loginPrimaryColor?: string;
    loginQuaternaryColor?: string;
    loginRightFrameUrl?: string;
    network?: string;
    pageFooter?: string;
    pageHeader?: string;
    primaryColor: string;
    primaryComplementColor: string;
    quaternaryColor: string;
    quaternaryComplementColor: string;
    secondaryColor: string;
    staticLogoImageUrl?: string;
    tertiaryColor: string;
    tertiaryComplementColor: string;
    zeronaryColor: string;
    zeronaryComplementColor: string;
}

export interface OrchestrationMetadata extends MetadataWithContentMetadata {
    context: string;
    masterLabel: string;
}

export interface ScontrolMetadata extends MetadataWithContentMetadata {
    contentSource: SControlContentSource;
    description?: string;
    encodingKey: Encoding;
    fileContent?: string; // xsd-type: "base64Binary"
    fileName?: string;
    name: string;
    supportsCaching: boolean;
}

export interface SiteDotComMetadata extends MetadataWithContentMetadata {
    label: string;
    siteType: SiteType;
}

export interface StaticResourceMetadata extends MetadataWithContentMetadata {
    cacheControl: StaticResourceCacheControl;
    contentType: string;
    description?: string;
}

export interface UiPluginMetadata extends MetadataWithContentMetadata {
    description?: string;
    extensionPointIdentifier: string;
    isEnabled: boolean;
    language: string;
    masterLabel: string;
}

export interface UserAuthCertificateMetadata extends MetadataWithContentMetadata {
    developerName: string;
    expirationDate?: string; // xsd-type: "dateTime"
    masterLabel: string;
    serialNumber: string;
    user: string;
}

export interface WaveDashboardMetadata extends MetadataWithContentMetadata {
    application: string;
    dateVersion?: number; // xsd-type: "int"
    description?: string;
    masterLabel: string;
    templateAssetSourceName?: string;
}

export interface WaveDataflowMetadata extends MetadataWithContentMetadata {
    application?: string;
    dataflowType?: string;
    description?: string;
    masterLabel: string;
}

export interface WaveLensMetadata extends MetadataWithContentMetadata {
    application: string;
    datasets?: Array<string>;
    dateVersion?: number; // xsd-type: "int"
    description?: string;
    masterLabel: string;
    templateAssetSourceName?: string;
    visualizationType: string;
}

export interface WaveRecipeMetadata extends MetadataWithContentMetadata {
    application?: string;
    dataflow: string;
    format?: string;
    masterLabel: string;
    securityPredicate?: string;
    targetDatasetAlias?: string;
    templateAssetSourceName?: string;
}

export interface DigitalExperienceConfigMetadata extends MetadataInfo {
    label: string;
    site: Site;
    space: string;
}

export interface Site {
    urlPathPrefix?: string;
}

export interface DiscoveryGoalMetadata extends MetadataInfo {
    active: boolean;
    deployedModels?: Array<DiscoveryDeployedModel>;
    label: string;
    modelCards?: Array<DiscoveryModelCard>;
    outcome: DiscoveryGoalOutcome;
    predictionType: DiscoveryPredictionType;
    pushbackField?: string;
    pushbackType?: DiscoveryPushbackType;
    subscribedEntity?: string;
    terminalStateFilters?: Array<DiscoveryFilter>;
}

export interface DiscoveryDeployedModel {
    active: boolean;
    aiModel: string;
    classificationThreshold?: number; // xsd-type: "double"
    fieldMappings?: Array<DiscoveryFieldMap>;
    filters?: Array<DiscoveryFilter>;
    label: string;
    name: string;
    prescribableFields?: Array<DiscoveryPrescribableField>;
}

export interface DiscoveryFieldMap {
    mappedField: string;
    modelField: string;
    sobjectFieldJoinKey?: string;
    source?: string;
    sourceFieldJoinKey?: string;
    sourceType: DiscoveryFieldMapSourceType;
}

export interface DiscoveryFilter {
    field: string;
    operator: DiscoveryFilterOperator;
    type?: DiscoveryFilterFieldType;
    values?: Array<DiscoveryFilterValue>;
}

export interface DiscoveryFilterValue {
    type: DiscoveryFilterValueType;
    value: string;
}

export interface DiscoveryPrescribableField {
    customDefinitions?: Array<DiscoveryCustomPrescribableFieldDefinition>;
    name: string;
}

export interface DiscoveryCustomPrescribableFieldDefinition {
    filters?: Array<DiscoveryFilter>;
    template?: string;
}

export interface DiscoveryModelCard {
    contactEmail?: string;
    contactName?: string;
    label?: string;
    sections?: string;
}

export interface DiscoveryGoalOutcome {
    field: string;
    fieldLabel: string;
    goal: DiscoveryOutcomeGoal;
    mappedField?: string;
}

export interface DiscoverySettingsMetadata extends MetadataInfo {
    enableEinsteinAnswersPref?: boolean;
    enableEinsteinArticleRecommendations?: boolean;
}

export interface DocumentChecklistSettingsMetadata extends MetadataInfo {
    dciCustomSharing?: boolean;
    deleteDCIWithFiles?: boolean;
}

export interface DocumentTypeMetadata extends MetadataInfo {
    description?: string;
    isActive: boolean;
    masterLabel: string;
}

export interface DuplicateRuleMetadata extends MetadataInfo {
    actionOnInsert: DupeActionType;
    actionOnUpdate: DupeActionType;
    alertText?: string | null;
    description?: string | null;
    duplicateRuleFilter?: DuplicateRuleFilter | null;
    duplicateRuleMatchRules?: Array<DuplicateRuleMatchRule> | null;
    isActive: boolean;
    masterLabel: string;
    operationsOnInsert?: Array<string>;
    operationsOnUpdate?: Array<string>;
    securityOption: DupeSecurityOptionType;
    sortOrder: number; // xsd-type: "int"
}

export interface DuplicateRuleFilter {
    booleanFilter?: string | null;
    duplicateRuleFilterItems?: Array<DuplicateRuleFilterItem>;
}

export interface DuplicateRuleMatchRule {
    matchRuleSObjectType: string;
    matchingRule: string;
    objectMapping?: ObjectMapping | null;
}

export interface ObjectMapping {
    inputObject: string;
    mappingFields?: Array<ObjectMappingField>;
    outputObject: string;
}

export interface ObjectMappingField {
    inputField: string;
    outputField: string;
}

export interface EACSettingsMetadata extends MetadataInfo {
    addRcCompToFlexiPages?: boolean;
    autoPopulateGoogleMeetLinks?: boolean;
    automatedEmailFilter?: boolean;
    enableActivityAnalyticsPref?: boolean;
    enableActivityCapture?: boolean;
    enableActivityMetrics?: boolean;
    enableActivitySyncEngine?: boolean;
    enableEACForEveryonePref?: boolean;
    enableEnforceEacSharingPref?: boolean;
    enableInboxActivitySharing?: boolean;
    enableInsightsInTimeline?: boolean;
    enableInsightsInTimelineEacStd?: boolean;
    provisionProductivityFeatures?: boolean;
    salesforceEventsOnlyPref?: boolean;
    sensitiveEmailFilter?: boolean;
    syncInternalEvents?: boolean;
}

export interface EinsteinAgentSettingsMetadata extends MetadataInfo {
    einsteinAgentRecommendations?: boolean;
    reRunAttributeBasedRules?: boolean;
    runAssignmentRules?: boolean;
}

export interface EinsteinAssistantSettingsMetadata extends MetadataInfo {
    enableEinsteinAssistantDataExtractionEnabled?: boolean;
    enableEinsteinAssistantEnabled?: boolean;
    enableEinsteinEnableVoiceLogging?: boolean;
}

export interface EinsteinDealInsightsSettingsMetadata extends MetadataInfo {
    enableUnlikelyToCloseThisMonth?: boolean;
}

export interface EinsteinDocumentCaptureSettingsMetadata extends MetadataInfo {
    enableEinsteinDocumentReader?: boolean;
}

export interface EmailAdministrationSettingsMetadata extends MetadataInfo {
    enableComplianceBcc?: boolean;
    enableEmailConsentManagement?: boolean;
    enableEmailSenderIdCompliance?: boolean;
    enableEmailSpfCompliance?: boolean;
    enableEmailToSalesforce?: boolean;
    enableEmailTrackingIPBlocklist?: boolean;
    enableEmailWorkflowApproval?: boolean;
    enableEnhancedEmailEnabled?: boolean;
    enableHandleBouncedEmails?: boolean;
    enableHtmlEmail?: boolean;
    enableInternationalEmailAddresses?: boolean;
    enableListEmailLogActivities?: boolean;
    enableResendBouncedEmails?: boolean;
    enableRestrictTlsToDomains?: boolean;
    enableSendThroughGmailPref?: boolean;
    enableSendViaExchangePref?: boolean;
    enableSendViaGmailPref?: boolean;
    enableUseOrgFootersForExtTrans?: boolean;
    enableVerifyEmailDomainByDkim?: boolean;
    sendEmailsEvenWhenAutomationUpdatesSameRecord?: boolean;
    sendMassEmailNotification?: boolean;
    sendTextOnlySystemEmails?: boolean;
}

export interface EmailIntegrationSettingsMetadata extends MetadataInfo {
    doesEmailLogAsEmailMessageInOutlook?: boolean;
    doesGmailStayConnectedToSalesforce?: boolean;
    enableContactAndEventSync?: boolean;
    enableEmailTrackingInMobile?: boolean;
    enableEngageForOutlook?: boolean;
    enableGmailIntegration?: boolean;
    enableInboxMobileIntune?: boolean;
    enableOutlookIntegration?: boolean;
    enableOutlookMobileIntegration?: boolean;
    enableProductivityFeatures?: boolean;
    enableSupplementalContactInfoInMobile?: boolean;
    isLayoutCustomizationAllowed?: boolean;
    orgIsSyncingEventsOutbound?: boolean;
    shouldUseTrustedDomainsList?: boolean;
}

export interface EmailServicesFunctionMetadata extends MetadataInfo {
    apexClass: string;
    attachmentOption: EmailServicesAttOptions;
    authenticationFailureAction: EmailServicesErrorAction;
    authorizationFailureAction: EmailServicesErrorAction;
    authorizedSenders?: string;
    emailServicesAddresses?: Array<EmailServicesAddress>;
    errorRoutingAddress?: string;
    functionInactiveAction: EmailServicesErrorAction;
    functionName: string;
    isActive?: boolean;
    isAuthenticationRequired?: boolean;
    isErrorRoutingEnabled?: boolean;
    isTextAttachmentsAsBinary?: boolean;
    isTlsRequired?: boolean;
    overLimitAction: EmailServicesErrorAction;
}

export interface EmailServicesAddress {
    authorizedSenders?: string;
    developerName: string;
    isActive?: boolean;
    localPart: string;
    runAsUser: string;
}

export interface EmailTemplateSettingsMetadata extends MetadataInfo {
    enableTemplateEnhancedFolderPref?: boolean;
}

export interface EmbeddedServiceBrandingMetadata extends MetadataInfo {
    contrastInvertedColor?: string;
    contrastPrimaryColor?: string;
    embeddedServiceConfig: string;
    font?: string;
    height?: number; // xsd-type: "int"
    masterLabel: string;
    navBarColor?: string;
    navBarTextColor?: string;
    primaryColor?: string;
    secondaryColor?: string;
    secondaryNavBarColor?: string;
    width?: number; // xsd-type: "int"
}

export interface EmbeddedServiceConfigMetadata extends MetadataInfo {
    areGuestUsersAllowed?: boolean;
    authMethod?: EmbeddedServiceAuthMethod;
    branding?: string;
    deploymentFeature: EmbeddedServiceDeploymentFeature;
    deploymentType: EmbeddedServiceDeploymentType;
    embeddedServiceAppointmentSettings?: EmbeddedServiceAppointmentSettings;
    embeddedServiceCustomComponents?: Array<EmbeddedServiceCustomComponent>;
    embeddedServiceCustomLabels?: Array<EmbeddedServiceCustomLabel>;
    embeddedServiceCustomizations?: Array<EmbeddedServiceCustomization>;
    embeddedServiceFlowConfig?: EmbeddedServiceFlowConfigMetadata;
    embeddedServiceFlows?: Array<EmbeddedServiceFlow>;
    embeddedServiceLayouts?: Array<EmbeddedServiceLayout>;
    isEnabled?: boolean;
    masterLabel: string;
    shouldHideAuthDialog?: boolean;
    site?: string;
}

export interface EmbeddedServiceAppointmentSettings {
    appointmentConfirmImg?: string;
    enabled: boolean;
    homeImg?: string;
    logoImg?: string;
    shouldShowExistingAppointment?: boolean;
    shouldShowNewAppointment?: boolean;
}

export interface EmbeddedServiceCustomComponent {
    componentBundleType?: EmbeddedServiceComponentBundleType;
    customComponent?: string;
    customComponentType?: EmbeddedServiceCustomComponentType;
}

export interface EmbeddedServiceCustomLabel {
    customLabel?: string;
    feature?: EmbeddedServiceFeature;
    labelKey?: EmbeddedServiceLabelKey;
}

export interface EmbeddedServiceCustomization {
    customizationName: string;
    description?: string;
    embeddedServiceResources?: Array<EmbeddedServiceResource>;
}

export interface EmbeddedServiceResource {
    resource: string;
    resourceType: EmbeddedServiceResourceType;
}

export interface EmbeddedServiceFlowConfigMetadata extends MetadataInfo {
    enabled: boolean;
}

export interface EmbeddedServiceFlow {
    flow: string;
    flowType: EmbeddedServiceFlowType;
    isAuthenticationRequired: boolean;
}

export interface EmbeddedServiceLayout {
    embeddedServiceLayoutRules?: Array<EmbeddedServiceLayoutRule>;
    layout: string;
    layoutType?: EmbeddedServiceLayoutType;
}

export interface EmbeddedServiceLayoutRule {
    appointmentStatus: string;
}

export interface EmbeddedServiceLiveAgentMetadata extends MetadataInfo {
    avatarImg?: string;
    embeddedServiceConfig: string;
    embeddedServiceQuickActions?: Array<EmbeddedServiceQuickAction>;
    enabled: boolean;
    fontSize: EmbeddedServiceFontSize;
    isOfflineCaseEnabled?: boolean;
    isQueuePositionEnabled?: boolean;
    liveAgentChatUrl?: string;
    liveAgentContentUrl?: string;
    liveChatButton: string;
    liveChatDeployment: string;
    masterLabel: string;
    offlineCaseBackgroundImg?: string;
    prechatBackgroundImg?: string;
    prechatEnabled: boolean;
    prechatJson?: string;
    scenario: EmbeddedServiceScenario;
    smallCompanyLogoImg?: string;
    waitingStateBackgroundImg?: string;
}

export interface EmbeddedServiceQuickAction {
    embeddedServiceLiveAgent: string;
    order: number; // xsd-type: "int"
    quickActionDefinition: string;
    quickActionType?: EmbeddedServiceQuickActionType;
}

export interface EmbeddedServiceMenuSettingsMetadata extends MetadataInfo {
    branding?: string;
    embeddedServiceCustomLabels?: Array<EmbeddedServiceCustomLabel>;
    embeddedServiceCustomizations?: Array<EmbeddedServiceCustomization>;
    embeddedServiceMenuItems?: Array<EmbeddedServiceMenuItem>;
    isEnabled?: boolean;
    masterLabel?: string;
    site?: string;
}

export interface EmbeddedServiceMenuItem {
    channel?: string;
    channelType?: EmbeddedServiceChannelType;
    customUrl?: string;
    displayOrder?: number; // xsd-type: "int"
    embeddedServiceCustomLabels?: Array<EmbeddedServiceCustomLabel>;
    iconUrl?: string;
    isDisplayedOnPageLoad: boolean;
    itemName: string;
    osOptionsHideInIOS?: boolean;
    osOptionsHideInLinuxOS?: boolean;
    osOptionsHideInMacOS?: boolean;
    osOptionsHideInOtherOS?: boolean;
    osOptionsHideInWindowsOS?: boolean;
    phoneNumber?: string;
    shouldOpenUrlInSameTab?: boolean;
}

export interface EmployeeFieldAccessSettingsMetadata extends MetadataInfo {
    enableEmployeeFieldMaskDefaults?: boolean;
    enableEmployeeFieldMasking?: boolean;
}

export interface EmployeeUserSettingsMetadata extends MetadataInfo {
    emailEncoding: string;
    enableEmployeeAutoCreateUser?: boolean;
    enableEmployeeIsSourceOfTruth?: boolean;
    permset?: string;
    profile: string;
    usernameSuffix?: string;
}

export interface EncryptionKeySettingsMetadata extends MetadataInfo {
    canOptOutOfDerivationWithBYOK?: boolean;
    enableCacheOnlyKeys?: boolean;
    enableReplayDetection?: boolean;
}

export interface EngagementMessagingSettingsMetadata extends MetadataInfo {
    isEngagementMessagingComplete?: boolean;
    isEngagementMessagingEnabled?: boolean;
}

export interface EnhancedNotesSettingsMetadata extends MetadataInfo {
    enableEnhancedNotes?: boolean;
    enableTasksOnEnhancedNotes?: boolean;
}

export interface EntitlementProcessMetadata extends MetadataInfo {
    SObjectType?: string;
    active?: boolean;
    businessHours?: string;
    description?: string;
    entryStartDateField?: string;
    exitCriteriaBooleanFilter?: string;
    exitCriteriaFilterItems?: Array<FilterItem>;
    exitCriteriaFormula?: string;
    isRecordTypeApplied?: boolean;
    isVersionDefault?: boolean;
    milestones?: Array<EntitlementProcessMilestoneItem>;
    name?: string;
    recordType?: string;
    versionMaster?: string;
    versionNotes?: string;
    versionNumber?: number; // xsd-type: "int"
}

export interface EntitlementProcessMilestoneItem {
    businessHours?: string;
    criteriaBooleanFilter?: string;
    milestoneCriteriaFilterItems?: Array<FilterItem>;
    milestoneCriteriaFormula?: string;
    milestoneName?: string;
    minutesCustomClass?: string;
    minutesToComplete?: number; // xsd-type: "int"
    successActions?: Array<WorkflowActionReference>;
    timeTriggers?: Array<EntitlementProcessMilestoneTimeTrigger>;
    useCriteriaStartTime?: boolean;
}

export interface EntitlementProcessMilestoneTimeTrigger {
    actions?: Array<WorkflowActionReference>;
    timeLength?: number; // xsd-type: "int"
    workflowTimeTriggerUnit: MilestoneTimeUnits;
}

export interface EntitlementSettingsMetadata extends MetadataInfo {
    assetLookupLimitedToActiveEntitlementsOnAccount?: boolean;
    assetLookupLimitedToActiveEntitlementsOnContact?: boolean;
    assetLookupLimitedToSameAccount?: boolean;
    assetLookupLimitedToSameContact?: boolean;
    enableEntitlementVersioning: boolean;
    enableEntitlements: boolean;
    enableMilestoneFeedItem?: boolean;
    enableMilestoneStoppedTime?: boolean;
    entitlementLookupLimitedToActiveStatus?: boolean;
    entitlementLookupLimitedToSameAccount?: boolean;
    entitlementLookupLimitedToSameAsset?: boolean;
    entitlementLookupLimitedToSameContact?: boolean;
    ignoreMilestoneBusinessHours?: boolean;
}

export interface EntitlementTemplateMetadata extends MetadataInfo {
    businessHours?: string;
    casesPerEntitlement?: number; // xsd-type: "int"
    entitlementProcess?: string;
    isPerIncident?: boolean;
    term?: number; // xsd-type: "int"
    type?: string;
}

export interface EntityImplementsMetadata extends MetadataInfo {
    fieldImplements?: Array<FieldImplements>;
    isDefault?: boolean;
    isFullyMapped?: boolean;
}

export interface FieldImplements {
    field?: string;
    interfaceField?: string;
}

export interface EscalationRuleMetadata extends MetadataInfo {
    active?: boolean;
    ruleEntry?: Array<RuleEntry>;
}

export interface EscalationRulesMetadata extends MetadataInfo {
    escalationRule?: Array<EscalationRuleMetadata>;
}

export interface EssentialsSettingsMetadata extends MetadataInfo {
    emailConnectorEnabled?: boolean;
}

export interface EventRelayConfigMetadata extends MetadataInfo {
    destinationResourceName: string;
    eventChannel: string;
    relayOption?: string;
    state?: EventRelayAdminState;
}

export interface EventSettingsMetadata extends MetadataInfo {
    bypassMeteringBlock?: boolean;
    enableApexLimitEvents?: boolean;
    enableDeleteMonitoringData?: boolean;
    enableDynamicStreamingChannel?: boolean;
    enableEventLogGeneration?: boolean;
    enableEventLogWaveIntegration?: boolean;
    enableLoginForensics?: boolean;
    enableStreamingApi?: boolean;
    enableTerminateOldestSession?: boolean;
    enableTransactionSecurityPolicies?: boolean;
}

export interface ExperienceBundleMetadata extends MetadataInfo {
    experienceResources?: ExperienceResources;
    label: string;
    type: SiteType;
    urlPathPrefix?: string;
}

export interface ExperienceResources {
    experienceResource?: Array<ExperienceResource>;
}

export interface ExperienceResource {
    fileName: string;
    format: string;
    source?: string; // xsd-type: "base64Binary"
    type: string;
}

export interface ExperienceBundleSettingsMetadata extends MetadataInfo {
    enableExperienceBundleMetadata?: boolean;
}

export interface ExperiencePropertyKeyBundleMetadata extends MetadataInfo {
    defaultDesignConfigMCTBody?: string; // xsd-type: "base64Binary"
    description?: string;
    developerName: string;
    masterLabel: string;
    schemaMCTBody: string; // xsd-type: "base64Binary"
}

export interface ExplainabilityActionDefinitionMetadata extends MetadataInfo {
    actionLogSchemaType: ActionLogSchemaType;
    applicationSubtype: string;
    applicationType: EASAppType;
    description?: string;
    internal: boolean;
    masterLabel: string;
    processType: string;
}

export interface ExplainabilityActionVersionMetadata extends MetadataInfo {
    actionLogMessageTemplate?: string;
    actionSpecification: string;
    active: boolean;
    definitionVersion: number; // xsd-type: "int"
    description?: string;
    explainabilityActionDef: string;
    masterLabel: string;
}

export interface ExternalClientAppSettingsMetadata extends MetadataInfo {
    enableConsumerSecretApiAccess?: boolean;
}

export interface ExternalCredentialMetadata extends MetadataInfo {
    authenticationProtocol: AuthenticationProtocol;
    description?: string;
    externalCredentialParameters?: Array<ExternalCredentialParameter>;
    label: string;
}

export interface ExternalCredentialParameter {
    authProvider?: string;
    certificate?: string;
    description?: string;
    parameterName: string;
    parameterType: ExternalCredentialParamType;
    parameterValue?: string;
    principal?: string;
    sequenceNumber?: number; // xsd-type: "int"
}

export interface ExternalDataSourceMetadata extends MetadataInfo {
    authProvider?: string;
    certificate?: string;
    customConfiguration?: string;
    customHttpHeaders?: Array<CustomHttpHeader>;
    endpoint?: string;
    externalDataSrcDescriptors?: Array<ExternalDataSrcDescriptorMetadata>;
    isWritable?: boolean;
    label: string;
    namedCredential?: string;
    oauthRefreshToken?: string;
    oauthScope?: string;
    oauthToken?: string;
    password?: string;
    principalType: ExternalPrincipalType;
    protocol: AuthenticationProtocol;
    repository?: string;
    type: ExternalDataSourceType;
    username?: string;
    version?: string;
}

export interface CustomHttpHeader {
    description?: string;
    headerFieldName: string;
    headerFieldValue: string;
    isActive?: boolean;
}

export interface ExternalDataSrcDescriptorMetadata extends MetadataInfo {
    customObject?: string;
    descriptor: string;
    descriptorVersion?: string;
    developerName: string;
    externalDataSource: string;
    subtype: ExternalDataSrcDescSubtype;
    systemVersion: number; // xsd-type: "int"
    type: ExternalDataSrcDescType;
}

export interface ExternalServiceRegistrationMetadata extends MetadataInfo {
    description?: string;
    label: string;
    namedCredential?: string;
    namedCredentialReference?: string;
    operations?: Array<ExternalServiceOperation>;
    providerAssetEndpoint?: string;
    registrationProviderType?: ExternalServiceRegistrationProviderType;
    schema?: string;
    schemaAbsoluteUrl?: string;
    schemaType?: string;
    schemaUploadFileExtension?: string;
    schemaUploadFileName?: string;
    schemaUrl?: string;
    serviceBinding?: string;
    status: string;
    systemVersion?: number; // xsd-type: "int"
}

export interface ExternalServiceOperation {
    active: boolean;
    name: string;
}

export interface FieldRestrictionRuleMetadata extends MetadataInfo {
    active: boolean;
    classification?: Array<string>;
    classificationType?: ClassificationType;
    description?: string;
    enforcementType: EnforcementType;
    masterLabel: string;
    recordFilter: string;
    targetEntity: string;
    userCriteria: string;
    version: number; // xsd-type: "int"
}

export interface FieldServiceSettingsMetadata extends MetadataInfo {
    apptAssistantExpiration?: number; // xsd-type: "int"
    apptAssistantInfoUrl?: string;
    apptAssistantRadiusUnitValue?: ApptAssistantRadiusUnit;
    apptAssistantRadiusValue?: number; // xsd-type: "int"
    apptAssistantStatus?: string;
    deepLinkPublicSecurityKey?: string;
    doesAllowEditSaForCrew?: boolean;
    doesShareSaParentWoWithAr?: boolean;
    doesShareSaWithAr?: boolean;
    enableBatchWindow?: boolean;
    enableFloatingWorkOrder?: boolean;
    enablePopulateWorkOrderAddress?: boolean;
    enableWorkOrders?: boolean;
    enableWorkPlansAutoGeneration?: boolean;
    enableWorkStepManualStatusUpdate?: boolean;
    fieldServiceNotificationsOrgPref?: boolean;
    fieldServiceOrgPref?: boolean;
    isGeoCodeSyncEnabled?: boolean;
    isLocationHistoryEnabled?: boolean;
    mobileFeedbackEmails?: string;
    o2EngineEnabled?: boolean;
    objectMappingItem?: Array<ObjectMappingItem>;
    optimizationServiceAccess?: boolean;
    serviceAppointmentsDueDateOffsetOrgValue?: number; // xsd-type: "int"
    workOrderDurationSource?: WorkOrderDurationSource;
    workOrderLineItemSearchFields?: Array<string>;
    workOrderSearchFields?: Array<string>;
}

export interface ObjectMappingItem {
    mappingType: string; // xsd-type: "MappingType"
    objectMapping: ObjectMapping;
}

export interface FileUploadAndDownloadSecuritySettingsMetadata extends MetadataInfo {
    dispositions?: Array<FileTypeDispositionAssignmentBean>;
    noHtmlUploadAsAttachment: boolean;
}

export interface FileTypeDispositionAssignmentBean {
    behavior: FileDownloadBehavior;
    fileType: FileType;
    securityRiskFileType: boolean;
}

export interface FilesConnectSettingsMetadata extends MetadataInfo {
    enableContentHubAllowed?: boolean;
    enableContentHubCvtLinksAllowed?: boolean;
    enableContentHubEOSearchLayout?: boolean;
}

export interface FlexiPageMetadata extends MetadataInfo {
    description?: string;
    events?: Array<FlexiPageEvent>;
    flexiPageRegions?: Array<FlexiPageRegion>;
    masterLabel: string;
    parentFlexiPage?: string;
    platformActionlist?: PlatformActionList;
    quickActionList?: QuickActionList;
    sobjectType?: string;
    template: FlexiPageTemplateInstance;
    type: FlexiPageType;
}

export interface FlexiPageEvent {
    sourceName: string;
    sourceProperties?: Array<FlexiPageEventSourceProperty>;
    sourceType: FlexipageEventSourceTypeEnum;
    targets?: Array<FlexiPageEventTarget>;
}

export interface FlexiPageEventSourceProperty {
    name: string;
    value: string;
}

export interface FlexiPageEventTarget {
    mappings?: Array<FlexiPageEventPropertyMapping>;
    method: string;
    name: string;
    properties?: Array<FlexiPageEventTargetProperty>;
    type: FlexipageEventTargetTypeEnum;
}

export interface FlexiPageEventPropertyMapping {
    name: string;
    value?: string;
}

export interface FlexiPageEventTargetProperty {
    name: string;
    value: string;
}

export interface FlexiPageRegion {
    appendable?: RegionFlagStatus;
    itemInstances?: Array<ItemInstance>;
    mode?: FlexiPageRegionMode;
    name: string;
    prependable?: RegionFlagStatus;
    replaceable?: RegionFlagStatus;
    type: FlexiPageRegionType;
}

export interface ItemInstance {
    componentInstance?: ComponentInstance;
    fieldInstance?: FieldInstance;
}

export interface ComponentInstance {
    componentInstanceProperties?: Array<ComponentInstanceProperty>;
    componentName: string;
    componentType?: ComponentInstanceType;
    identifier?: string;
    visibilityRule?: UiFormulaRule;
}

export interface ComponentInstanceProperty {
    name?: string;
    type?: ComponentInstancePropertyKeyEnum;
    value?: string;
    valueList?: ComponentInstancePropertyList;
}

export interface ComponentInstancePropertyList {
    valueListItems?: Array<ComponentInstancePropertyListItem>;
}

export interface ComponentInstancePropertyListItem {
    value?: string;
    visibilityRule?: UiFormulaRule;
}

export interface UiFormulaRule {
    booleanFilter?: string;
    criteria?: Array<UiFormulaCriterion>;
}

export interface UiFormulaCriterion {
    leftValue: string;
    operator: string;
    rightValue?: string;
}

export interface FieldInstance {
    fieldInstanceProperties?: Array<FieldInstanceProperty>;
    fieldItem: string;
    identifier?: string;
    visibilityRule?: UiFormulaRule;
}

export interface FieldInstanceProperty {
    name?: string;
    value?: string;
}

export interface PlatformActionList {
    actionListContext: PlatformActionListContext;
    platformActionListItems?: Array<PlatformActionListItem>;
    relatedSourceEntity?: string;
}

export interface PlatformActionListItem {
    actionName: string;
    actionType: PlatformActionType;
    sortOrder: number; // xsd-type: "int"
    subtype?: string;
}

export interface QuickActionList {
    quickActionListItems?: Array<QuickActionListItem>;
}

export interface QuickActionListItem {
    quickActionName: string;
}

export interface FlexiPageTemplateInstance {
    componentType?: ComponentInstanceType;
    identifier?: string;
    name: string;
    properties?: Array<ComponentInstanceProperty>;
}

export interface FlowMetadata extends MetadataInfo {
    actionCalls?: Array<FlowActionCall>;
    apexPluginCalls?: Array<FlowApexPluginCall>;
    apiVersion?: number | null; // xsd-type: "double"
    assignments?: Array<FlowAssignment>;
    associatedRecord?: string;
    choices?: Array<FlowChoice>;
    collectionProcessors?: Array<FlowCollectionProcessor>;
    constants?: Array<FlowConstant>;
    decisions?: Array<FlowDecision>;
    description?: string;
    dynamicChoiceSets?: Array<FlowDynamicChoiceSet>;
    environments?: Array<FlowEnvironment>;
    formulas?: Array<FlowFormula>;
    interviewLabel?: string;
    isAdditionalPermissionRequiredToRun?: boolean;
    isOverridable?: boolean;
    isTemplate?: boolean;
    label: string;
    loops?: Array<FlowLoop>;
    migratedFromWorkflowRuleName?: string;
    orchestratedStages?: Array<FlowOrchestratedStage>;
    overriddenFlow?: string;
    processMetadataValues?: Array<FlowMetadataValue>;
    processType?: FlowProcessType;
    recordCreates?: Array<FlowRecordCreate>;
    recordDeletes?: Array<FlowRecordDelete>;
    recordLookups?: Array<FlowRecordLookup>;
    recordRollbacks?: Array<FlowRecordRollback>;
    recordUpdates?: Array<FlowRecordUpdate>;
    runInMode?: FlowRunInMode;
    screens?: Array<FlowScreen>;
    sourceTemplate?: string;
    stages?: Array<FlowStage>;
    start?: FlowStart;
    startElementReference?: string;
    status?: FlowVersionStatus;
    steps?: Array<FlowStep>;
    subflows?: Array<FlowSubflow>;
    textTemplates?: Array<FlowTextTemplate>;
    timeZoneSidKey?: string;
    transforms?: Array<FlowTransform>;
    triggerOrder?: number | null; // xsd-type: "int"
    variables?: Array<FlowVariable>;
    waits?: Array<FlowWait>;
}

export interface FlowActionCall extends FlowNode {
    actionName: string;
    actionType: InvocableActionType;
    connector?: FlowConnector;
    dataTypeMappings?: Array<FlowDataTypeMapping>;
    faultConnector?: FlowConnector;
    flowTransactionModel?: FlowTransactionModel;
    inputParameters?: Array<FlowActionCallInputParameter>;
    outputParameters?: Array<FlowActionCallOutputParameter>;
    storeOutputAutomatically?: boolean;
}

export interface FlowNode extends FlowElement {
    elementSubtype?: FlowElementSubtype;
    label?: string;
    locationX: number; // xsd-type: "int"
    locationY: number; // xsd-type: "int"
}

export interface FlowElement extends FlowBaseElement {
    description?: string;
    name?: string;
}

export interface FlowBaseElement {
    processMetadataValues?: Array<FlowMetadataValue>;
}

export interface FlowMetadataValue {
    name: string;
    value?: FlowElementReferenceOrValue;
}

export interface FlowElementReferenceOrValue {
    apexValue?: string | null;
    booleanValue?: boolean | null;
    dateTimeValue?: string; // xsd-type: "dateTime"
    dateValue?: string; // xsd-type: "date"
    elementReference?: string;
    numberValue?: number | null; // xsd-type: "double"
    sobjectValue?: string | null;
    stringValue?: string;
}

export interface FlowActionCallInputParameter extends FlowBaseElement {
    name: string;
    value?: FlowElementReferenceOrValue;
}

export interface FlowActionCallOutputParameter extends FlowBaseElement {
    assignToReference: string;
    name: string;
}

export interface FlowApexPluginCallInputParameter extends FlowBaseElement {
    name: string;
    value?: FlowElementReferenceOrValue;
}

export interface FlowApexPluginCallOutputParameter extends FlowBaseElement {
    assignToReference: string;
    name: string;
}

export interface FlowAssignmentItem extends FlowBaseElement {
    assignToReference: string;
    operator: FlowAssignmentOperator;
    value?: FlowElementReferenceOrValue;
}

export interface FlowChoiceUserInput extends FlowBaseElement {
    isRequired?: boolean;
    promptText?: string;
    validationRule?: FlowInputValidationRule;
}

export interface FlowInputValidationRule {
    errorMessage: string;
    formulaExpression: string;
}

export interface FlowCollectionMapItem extends FlowBaseElement {
    assignToFieldReference: string;
    operator: FlowAssignmentOperator;
    value: FlowElementReferenceOrValue;
}

export interface FlowCollectionSortOption extends FlowBaseElement {
    doesPutEmptyStringAndNullFirst: boolean;
    sortField?: string;
    sortOrder: SortOrder;
}

export interface FlowCondition extends FlowBaseElement {
    leftValueReference: string;
    operator: FlowComparisonOperator;
    rightValue?: FlowElementReferenceOrValue;
}

export interface FlowConnector extends FlowBaseElement {
    isGoTo?: boolean;
    targetReference: string;
}

export interface FlowDataTypeMapping extends FlowBaseElement {
    typeName: string;
    typeValue: string;
}

export interface FlowInputFieldAssignment extends FlowBaseElement {
    field: string;
    value?: FlowElementReferenceOrValue;
}

export interface FlowOutputFieldAssignment extends FlowBaseElement {
    assignToReference: string;
    field: string;
}

export interface FlowRecordFilter extends FlowBaseElement {
    field: string;
    operator: FlowRecordFilterOperator;
    value?: FlowElementReferenceOrValue;
}

export interface FlowScreenFieldInputParameter extends FlowBaseElement {
    name: string;
    value?: FlowElementReferenceOrValue;
}

export interface FlowScreenFieldOutputParameter extends FlowBaseElement {
    assignToReference: string;
    name: string;
}

export interface FlowScreenRule extends FlowBaseElement {
    conditionLogic?: string;
    conditions?: Array<FlowCondition>;
    label: string;
    ruleActions?: Array<FlowScreenRuleAction>;
}

export interface FlowScreenRuleAction extends FlowBaseElement {
    attribute: string;
    fieldReference: string;
    value?: FlowElementReferenceOrValue;
}

export interface FlowStageStepAssignee extends FlowBaseElement {
    assignee: FlowElementReferenceOrValue;
    assigneeType: FlowStageStepAssigneeType;
}

export interface FlowStageStepEntryActionInputParameter extends FlowBaseElement {
    name: string;
    value?: FlowElementReferenceOrValue;
}

export interface FlowStageStepEntryActionOutputParameter extends FlowBaseElement {
    assignToReference: string;
    name: string;
}

export interface FlowStageStepExitActionInputParameter extends FlowBaseElement {
    name: string;
    value?: FlowElementReferenceOrValue;
}

export interface FlowStageStepExitActionOutputParameter extends FlowBaseElement {
    assignToReference: string;
    name: string;
}

export interface FlowStageStepInputParameter extends FlowBaseElement {
    name: string;
    value?: FlowElementReferenceOrValue;
}

export interface FlowStageStepOutputParameter extends FlowBaseElement {
    assignToReference: string;
    name: string;
}

export interface FlowSubflowInputAssignment extends FlowBaseElement {
    name: string;
    value?: FlowElementReferenceOrValue;
}

export interface FlowSubflowOutputAssignment extends FlowBaseElement {
    assignToReference: string;
    name: string;
}

export interface FlowTransformValue extends FlowBaseElement {
    inputReference?: string;
    transformValueActions?: Array<FlowTransformValueAction>;
}

export interface FlowTransformValueAction extends FlowBaseElement {
    outputFieldApiName?: string;
    transformType: FlowTransformValueActionType;
    value?: FlowElementReferenceOrValue;
}

export interface FlowVisibilityRule extends FlowBaseElement {
    conditionLogic?: string;
    conditions?: Array<FlowCondition>;
}

export interface FlowWaitEventInputParameter extends FlowBaseElement {
    name: string;
    value?: FlowElementReferenceOrValue;
}

export interface FlowWaitEventOutputParameter extends FlowBaseElement {
    assignToReference: string;
    name: string;
}

export interface FlowChoice extends FlowElement {
    choiceText: string;
    dataType: FlowDataType;
    userInput?: FlowChoiceUserInput;
    value?: FlowElementReferenceOrValue;
}

export interface FlowConstant extends FlowElement {
    dataType: FlowDataType;
    value?: FlowElementReferenceOrValue;
}

export interface FlowDynamicChoiceSet extends FlowElement {
    collectionReference?: string;
    dataType: FlowDataType;
    displayField: string;
    filterLogic?: string;
    filters?: Array<FlowRecordFilter>;
    limit?: number | null; // xsd-type: "int"
    object: string;
    outputAssignments?: Array<FlowOutputFieldAssignment>;
    picklistField?: string;
    picklistObject?: string;
    sortField?: string;
    sortOrder?: SortOrder;
    valueField?: string;
}

export interface FlowFormula extends FlowElement {
    dataType?: FlowDataType;
    expression: string;
    scale?: number; // xsd-type: "int"
}

export interface FlowRule extends FlowElement {
    conditionLogic: string;
    conditions?: Array<FlowCondition>;
    connector?: FlowConnector;
    doesRequireRecordChangedToMeetCriteria?: boolean;
    label: string;
}

export interface FlowScheduledPath extends FlowElement {
    connector?: FlowConnector;
    label?: string;
    maxBatchSize?: number; // xsd-type: "int"
    offsetNumber?: number; // xsd-type: "int"
    offsetUnit?: FlowScheduledPathOffsetUnit;
    pathType?: FlowScheduledPathType;
    recordField?: string;
    timeSource?: FlowScheduledPathTimeSource;
}

export interface FlowScreenField extends FlowElement {
    choiceReferences?: Array<string>;
    dataType?: FlowDataType;
    dataTypeMappings?: Array<FlowDataTypeMapping>;
    defaultSelectedChoiceReference?: string;
    defaultValue?: FlowElementReferenceOrValue;
    extensionName?: string;
    fieldText?: string;
    fieldType: FlowScreenFieldType;
    fields?: Array<FlowScreenField>;
    helpText?: string;
    inputParameters?: Array<FlowScreenFieldInputParameter>;
    inputsOnNextNavToAssocScrn?: FlowScreenFieldInputsRevisited;
    isRequired?: boolean;
    isVisible?: boolean | null;
    objectFieldReference?: string;
    outputParameters?: Array<FlowScreenFieldOutputParameter>;
    regionContainerType?: FlowRegionContainerType;
    scale?: number; // xsd-type: "int"
    storeOutputAutomatically?: boolean;
    validationRule?: FlowInputValidationRule;
    visibilityRule?: FlowVisibilityRule;
}

export interface FlowStage extends FlowElement {
    isActive: boolean;
    label: string;
    stageOrder: number; // xsd-type: "int"
}

export interface FlowStageStep extends FlowElement {
    actionName: string;
    actionType: InvocableActionType;
    assignees?: Array<FlowStageStepAssignee>;
    entryActionInputParameters?: Array<FlowStageStepEntryActionInputParameter>;
    entryActionName?: string;
    entryActionOutputParameters?: Array<FlowStageStepEntryActionOutputParameter>;
    entryActionType?: InvocableActionType;
    entryConditionLogic: string;
    entryConditions?: Array<FlowCondition>;
    exitActionInputParameters?: Array<FlowStageStepExitActionInputParameter>;
    exitActionName?: string;
    exitActionOutputParameters?: Array<FlowStageStepExitActionOutputParameter>;
    exitActionType?: InvocableActionType;
    inputParameters?: Array<FlowStageStepInputParameter>;
    label: string;
    outputParameters?: Array<FlowStageStepOutputParameter>;
    requiresAsyncProcessing?: boolean;
    stepSubtype?: FlowElementSubtype;
}

export interface FlowTextTemplate extends FlowElement {
    isViewedAsPlainText?: boolean;
    text: string;
}

export interface FlowVariable extends FlowElement {
    apexClass?: string;
    dataType: FlowDataType;
    isCollection?: boolean;
    isInput?: boolean;
    isOutput?: boolean;
    objectType?: string;
    scale?: number; // xsd-type: "int"
    value?: FlowElementReferenceOrValue;
}

export interface FlowWaitEvent extends FlowElement {
    conditionLogic?: string;
    conditions?: Array<FlowCondition>;
    connector?: FlowConnector;
    eventType?: string;
    inputParameters?: Array<FlowWaitEventInputParameter>;
    label: string;
    maxBatchSize?: number; // xsd-type: "int"
    offset?: number; // xsd-type: "int"
    offsetUnit?: FlowScheduledPathOffsetUnit;
    outputParameters?: Array<FlowWaitEventOutputParameter>;
    resumeDate?: string; // xsd-type: "date"
    resumeDateReference?: string;
    resumeTime?: string; // xsd-type: "time"
}

export interface FlowApexPluginCall extends FlowNode {
    apexClass: string;
    connector?: FlowConnector;
    faultConnector?: FlowConnector;
    inputParameters?: Array<FlowApexPluginCallInputParameter>;
    outputParameters?: Array<FlowApexPluginCallOutputParameter>;
}

export interface FlowAssignment extends FlowNode {
    assignmentItems?: Array<FlowAssignmentItem>;
    connector?: FlowConnector;
}

export interface FlowCollectionProcessor extends FlowNode {
    assignNextValueToReference?: string;
    collectionProcessorType: FlowCollectionProcessorType;
    collectionReference: string;
    conditionLogic?: string;
    conditions?: Array<FlowCondition>;
    connector?: FlowConnector;
    formula?: string;
    limit?: number | null; // xsd-type: "int"
    mapItems?: Array<FlowCollectionMapItem>;
    outputSObjectType?: string;
    sortOptions?: Array<FlowCollectionSortOption>;
}

export interface FlowDecision extends FlowNode {
    defaultConnector?: FlowConnector;
    defaultConnectorLabel?: string;
    rules?: Array<FlowRule>;
}

export interface FlowLoop extends FlowNode {
    assignNextValueToReference?: string;
    collectionReference: string;
    iterationOrder?: IterationOrder;
    nextValueConnector?: FlowConnector;
    noMoreValuesConnector?: FlowConnector;
}

export interface FlowOrchestratedStage extends FlowNode {
    connector?: FlowConnector;
    exitActionInputParameters?: Array<FlowStageStepExitActionInputParameter>;
    exitActionName?: string;
    exitActionOutputParameters?: Array<FlowStageStepExitActionOutputParameter>;
    exitActionType?: InvocableActionType;
    exitConditionLogic?: string;
    exitConditions?: Array<FlowCondition>;
    faultConnector?: FlowConnector;
    stageSteps?: Array<FlowStageStep>;
}

export interface FlowRecordCreate extends FlowNode {
    assignRecordIdToReference?: string;
    connector?: FlowConnector;
    faultConnector?: FlowConnector;
    inputAssignments?: Array<FlowInputFieldAssignment>;
    inputReference?: string;
    object?: string;
    storeOutputAutomatically?: boolean;
}

export interface FlowRecordDelete extends FlowNode {
    connector?: FlowConnector;
    faultConnector?: FlowConnector;
    filterLogic?: string;
    filters?: Array<FlowRecordFilter>;
    inputReference?: string;
    object?: string;
}

export interface FlowRecordLookup extends FlowNode {
    assignNullValuesIfNoRecordsFound?: boolean;
    connector?: FlowConnector;
    faultConnector?: FlowConnector;
    filterLogic?: string;
    filters?: Array<FlowRecordFilter>;
    getFirstRecordOnly?: boolean;
    object: string;
    outputAssignments?: Array<FlowOutputFieldAssignment>;
    outputReference?: string;
    queriedFields?: Array<string>;
    sortField?: string;
    sortOrder?: SortOrder;
    storeOutputAutomatically?: boolean;
}

export interface FlowRecordRollback extends FlowNode {
    connector?: FlowConnector;
}

export interface FlowRecordUpdate extends FlowNode {
    connector?: FlowConnector;
    faultConnector?: FlowConnector;
    filterLogic?: string;
    filters?: Array<FlowRecordFilter>;
    inputAssignments?: Array<FlowInputFieldAssignment>;
    inputReference?: string;
    object?: string;
}

export interface FlowScreen extends FlowNode {
    allowBack?: boolean;
    allowFinish?: boolean;
    allowPause?: boolean;
    backButtonLabel?: string;
    connector?: FlowConnector;
    fields?: Array<FlowScreenField>;
    helpText?: string;
    nextOrFinishButtonLabel?: string;
    pauseButtonLabel?: string;
    pausedText?: string;
    rules?: Array<FlowScreenRule>;
    showFooter?: boolean;
    showHeader?: boolean;
}

export interface FlowStart extends FlowNode {
    connector?: FlowConnector;
    doesRequireRecordChangedToMeetCriteria?: boolean;
    filterFormula?: string;
    filterLogic?: string;
    filters?: Array<FlowRecordFilter>;
    object?: string;
    objectContainer?: string;
    recordTriggerType?: RecordTriggerType;
    schedule?: FlowSchedule;
    scheduledPaths?: Array<FlowScheduledPath>;
    segment?: string;
    triggerType?: FlowTriggerType;
}

export interface FlowSchedule {
    frequency?: FlowStartFrequency;
    startDate?: string; // xsd-type: "date"
    startTime?: string; // xsd-type: "time"
}

export interface FlowStep extends FlowNode {
    connectors?: Array<FlowConnector>;
}

export interface FlowSubflow extends FlowNode {
    connector?: FlowConnector;
    flowName: string;
    inputAssignments?: Array<FlowSubflowInputAssignment>;
    outputAssignments?: Array<FlowSubflowOutputAssignment>;
    storeOutputAutomatically?: boolean;
}

export interface FlowTransform extends FlowNode {
    apexClass?: string;
    connector?: FlowConnector;
    dataType?: FlowDataType;
    isCollection?: boolean;
    objectType?: string;
    scale?: number; // xsd-type: "int"
    transformValues?: Array<FlowTransformValue>;
}

export interface FlowWait extends FlowNode {
    defaultConnector?: FlowConnector;
    defaultConnectorLabel: string;
    faultConnector?: FlowConnector;
    timeZoneId?: string;
    waitEvents?: Array<FlowWaitEvent>;
}

export interface FlowCategoryMetadata extends MetadataInfo {
    description?: string;
    flowCategoryItems?: Array<FlowCategoryItems>;
    masterLabel: string;
}

export interface FlowCategoryItems {
    flow: string;
}

export interface FlowDefinitionMetadata extends MetadataInfo {
    activeVersionNumber?: number; // xsd-type: "int"
    description?: string;
    masterLabel?: string;
}

export interface FlowSettingsMetadata extends MetadataInfo {
    canDebugFlowAsAnotherUser?: boolean;
    doesEnforceApexCpuTimeLimit?: boolean;
    doesFormulaEnforceDataAccess?: boolean;
    doesFormulaGenerateHtmlOutput?: boolean;
    enableFlowBREncodedFixEnabled?: boolean;
    enableFlowCustomPropertyEditor?: boolean;
    enableFlowDeployAsActiveEnabled?: boolean;
    enableFlowFieldFilterEnabled?: boolean;
    enableFlowFormulasFixEnabled?: boolean;
    enableFlowInterviewSharingEnabled?: boolean;
    enableFlowNullPreviousValueFix?: boolean;
    enableFlowPauseEnabled?: boolean;
    enableFlowReactiveScreens?: boolean;
    enableFlowUseApexExceptionEmail?: boolean;
    enableFlowViaRestUsesUserCtxt?: boolean;
    enableLightningRuntimeEnabled?: boolean;
    isAccessToInvokedApexRequired?: boolean;
    isApexPluginAccessModifierRespected?: boolean;
    isEnhancedFlowListViewVisible?: boolean;
    isFlowApexContextRetired?: boolean;
    isFlowBlockAccessToSessionIDEnabled?: boolean;
    isManageFlowRequiredForAutomationCharts?: boolean;
    isSupportRollbackOnErrorForApexInvocableActionsEnabled?: boolean;
    isTimeResumedInSameRunContext?: boolean;
}

export interface FlowTestMetadata extends MetadataInfo {
    description?: string;
    flowApiName: string;
    label: string;
    testPoints?: Array<FlowTestPoint>;
}

export interface FlowTestPoint {
    assertions?: Array<FlowTestAssertion>;
    elementApiName: string;
    parameters?: Array<FlowTestParameter>;
}

export interface FlowTestAssertion {
    conditions?: Array<FlowTestCondition>;
    errorMessage?: string;
}

export interface FlowTestCondition {
    leftValueReference: string;
    operator: FlowComparisonOperator;
    rightValue?: FlowTestReferenceOrValue;
}

export interface FlowTestReferenceOrValue {
    booleanValue?: boolean | null;
    dateTimeValue?: string; // xsd-type: "dateTime"
    dateValue?: string; // xsd-type: "date"
    numberValue?: number | null; // xsd-type: "double"
    sobjectValue?: string | null;
    stringValue?: string;
}

export interface FlowTestParameter {
    leftValueReference: string;
    type: FlowTestParameterType;
    value: FlowTestReferenceOrValue;
}

export interface FolderMetadata extends MetadataInfo {
    accessType?: FolderAccessTypes;
    folderShares?: Array<FolderShare>;
    name: string;
    publicFolderAccess?: PublicFolderAccess;
    sharedTo?: SharedTo;
}

export interface FolderShare {
    accessLevel: FolderShareAccessLevel;
    sharedTo: string;
    sharedToType: FolderSharedToType;
}

export interface ForecastingFilterMetadata extends MetadataInfo {
    filterLogic?: string;
    forecastingType: string;
    forecastingTypeSource: string;
    isProtected?: boolean;
    masterLabel: string;
}

export interface ForecastingFilterConditionMetadata extends MetadataInfo {
    colName?: string;
    fieldName: string;
    forecastingFilter: string;
    forecastingSourceDefinition?: string;
    isProtected?: boolean;
    masterLabel: string;
    operation: FilterOperation;
    sortOrder: number; // xsd-type: "int"
    value?: string;
}

export interface ForecastingObjectListSettingsMetadata extends MetadataInfo {
    forecastingTypeObjectListSettings?: Array<ForecastingTypeObjectListSettings>;
}

export interface ForecastingTypeObjectListSettings {
    forecastingObjectListLabelMappings?: Array<ForecastingObjectListLabelMapping>;
    forecastingObjectListSelectedSettings: ForecastingObjectListSelectedSettings;
    forecastingObjectListUnselectedSettings: ForecastingObjectListUnselectedSettings;
    forecastingTypeDeveloperName: string;
}

export interface ForecastingObjectListLabelMapping {
    field: string;
    label: string;
}

export interface ForecastingObjectListSelectedSettings {
    field?: Array<string>;
}

export interface ForecastingObjectListUnselectedSettings {
    field?: Array<string>;
}

export interface ForecastingSettingsMetadata extends MetadataInfo {
    defaultToPersonalCurrency?: boolean;
    enableForecasts?: boolean;
    forecastingCategoryMappings?: Array<ForecastingCategoryMapping>;
    forecastingDisplayedFamilySettings?: Array<ForecastingDisplayedFamilySettings>;
    forecastingTypeSettings?: Array<ForecastingTypeSettings>;
    globalAdjustmentsSettings: AdjustmentsSettings;
    globalForecastRangeSettings: ForecastRangeSettings;
    globalQuotasSettings: QuotasSettings;
}

export interface ForecastingCategoryMapping {
    forecastingItemCategoryApiName: string;
    weightedSourceCategories?: Array<WeightedSourceCategory>;
}

export interface WeightedSourceCategory {
    sourceCategoryApiName: string;
    weight: number; // xsd-type: "double"
}

export interface ForecastingDisplayedFamilySettings {
    productFamily?: string;
}

export interface ForecastingTypeSettings {
    active: boolean;
    displayedCategoryApiNames?: Array<string>;
    forecastedCategoryApiNames?: Array<string>;
    forecastingDateType: ForecastingDateType;
    hasProductFamily: boolean;
    isAmount: boolean;
    isAvailable: boolean;
    isQuantity: boolean;
    managerAdjustableCategoryApiNames?: Array<string>;
    masterLabel: string;
    name: string;
    opportunityListFieldsLabelMappings?: Array<OpportunityListFieldsLabelMapping>;
    opportunityListFieldsSelectedSettings: OpportunityListFieldsSelectedSettings;
    opportunityListFieldsUnselectedSettings: OpportunityListFieldsUnselectedSettings;
    opportunitySplitName?: string;
    ownerAdjustableCategoryApiNames?: Array<string>;
    territory2ModelName?: string;
}

export interface OpportunityListFieldsLabelMapping {
    field: string;
    label: string;
}

export interface OpportunityListFieldsSelectedSettings {
    field?: Array<string>;
}

export interface OpportunityListFieldsUnselectedSettings {
    field?: Array<string>;
}

export interface AdjustmentsSettings {
    enableAdjustments: boolean;
    enableOwnerAdjustments: boolean;
}

export interface ForecastRangeSettings {
    beginning: number; // xsd-type: "int"
    displaying: number; // xsd-type: "int"
    periodType: PeriodTypes;
}

export interface QuotasSettings {
    showQuotas: boolean;
}

export interface ForecastingSourceDefinitionMetadata extends MetadataInfo {
    categoryField?: string;
    dateField?: string;
    familyField?: string;
    isProtected?: boolean;
    masterLabel: string;
    measureField?: string;
    sourceObject: string;
    territory2Field?: string;
    userField?: string;
}

export interface ForecastingTypeMetadata extends MetadataInfo {
    active: boolean;
    amount: boolean;
    dateType: string;
    developerName: string;
    hasProductFamily: boolean;
    masterLabel: string;
    opportunitySplitType?: string;
    quantity: boolean;
    roleType: string;
    territory2Model?: string;
}

export interface ForecastingTypeSourceMetadata extends MetadataInfo {
    forecastingSourceDefinition: string;
    forecastingType: string;
    isProtected?: boolean;
    masterLabel: string;
    parentSourceDefinition?: string;
    relationField?: string;
    sourceGroup: number; // xsd-type: "int"
}

export interface FormulaSettingsMetadata extends MetadataInfo {
    enableDSTAwareDatevalue?: boolean;
}

export interface GatewayProviderPaymentMethodTypeMetadata extends MetadataInfo {
    comments?: string;
    gtwyProviderPaymentMethodType?: string;
    masterLabel: string;
    paymentGatewayProvider?: string;
    paymentMethodType?: string;
    recordType?: string;
}

export interface GlobalValueSetMetadata extends MetadataInfo {
    customValue?: Array<CustomValueMetadata>;
    description?: string;
    masterLabel: string;
    sorted: boolean;
}

export interface GlobalValueSetTranslationMetadata extends MetadataInfo {
    valueTranslation?: Array<ValueTranslation>;
}

export interface ValueTranslation {
    masterLabel: string;
    translation?: string;
}

export interface GoogleAppsSettingsMetadata extends MetadataInfo {
    enableGmailButtons?: boolean;
    enableGmailButtonsAndLinks?: boolean;
    enableGmailLinks?: boolean;
    enableGoogleDocs?: boolean;
    enableGoogleDocsTab?: boolean;
    enableGoogleTalk?: boolean;
    googleAppsDomain?: string;
    googleAppsDomainLinked?: boolean;
    googleAppsDomainValidated?: boolean;
}

export interface GroupMetadata extends MetadataInfo {
    doesIncludeBosses?: boolean;
    name: string;
}

export interface HighVelocitySalesSettingsMetadata extends MetadataInfo {
    enableACAutoSendEmail?: boolean;
    enableACChangeTargetAssignee?: boolean;
    enableACSkipWeekends?: boolean;
    enableCadenceVariantTestingPref?: boolean;
    enableChgTgtAssigneeUsrPermPref?: boolean;
    enableDispositionCategory?: boolean;
    enableEngagementWaveAnalyticsPref?: boolean;
    enableHighVelocitySales?: boolean;
    enableHighVelocitySalesSetup?: boolean;
    enableInvoiceAttributionPref?: boolean;
    enableLogACallForCTIPref?: boolean;
    enableLogTasksForLinkedInPref?: boolean;
    enableMultipleCadencesPref?: boolean;
    enableOpportunityAttributionPermPref?: boolean;
    enableQuickCadenceAutoSendEmail?: boolean;
    enableTaskLoggingPref?: boolean;
}

export interface HomePageComponentMetadata extends MetadataInfo {
    body?: string;
    height?: number; // xsd-type: "int"
    links?: Array<string>;
    page?: string;
    pageComponentType: PageComponentType;
    showLabel?: boolean;
    showScrollbars?: boolean;
    width?: PageComponentWidth;
}

export interface HomePageLayoutMetadata extends MetadataInfo {
    narrowComponents?: Array<string>;
    wideComponents?: Array<string>;
}

export interface IPAddressRangeMetadata extends MetadataInfo {
    description?: string;
    endIpAddress: string;
    ipAddressFeature: IPAddressFeature;
    ipAddressUsageScope: IPAddressUsageScope;
    isProtected?: boolean;
    masterLabel: string;
    startIpAddress: string;
}

export interface IdeasSettingsMetadata extends MetadataInfo {
    enableChatterProfile?: boolean;
    enableHtmlIdea?: boolean;
    enableIdeaMultipleCategory?: boolean;
    enableIdeaThemes?: boolean;
    enableIdeas?: boolean;
    enableIdeasControllerExtensions?: boolean;
    enableIdeasReputation?: boolean;
    halfLife?: number; // xsd-type: "double"
    ideasProfilePage?: string;
}

export interface IdentityProviderSettingsMetadata extends MetadataInfo {
    certificateName: string;
    enableIdentityProvider: boolean;
}

export interface IdentityVerificationProcDefMetadata extends MetadataInfo {
    identityVerificationProcDtls?: Array<IdentityVerificationProcDtlMetadata>;
    masterLabel: string;
    searchLayoutType: IdentityVerificationSearchLayoutType;
}

export interface IdentityVerificationProcDtlMetadata extends MetadataInfo {
    apexClass?: string;
    dataSourceType: IdentityVerificationDataSourceType;
    developerName: string;
    identityVerificationProcFlds?: Array<IdentityVerificationProcFldMetadata>;
    isActive?: boolean;
    isRetryAllowedAfterLimit?: boolean;
    linkedIdVerfProcessDet?: string;
    masterLabel: string;
    objectName?: string;
    optionalVerifiersMinVerfCount?: number; // xsd-type: "int"
    retryLimit?: number; // xsd-type: "int"
    searchFilter?: string;
    searchRecordUniqueIdField?: string;
    searchResultSortBy?: string;
    searchSequenceNumber: number; // xsd-type: "int"
    searchType: IdentityVerificationSearchType;
}

export interface IdentityVerificationProcFldMetadata extends MetadataInfo {
    customFieldLabel?: string;
    dataSourceType: IdentityVerificationProcFldDataSourceType;
    developerName: string;
    fieldDataType?: IdentityVerificationProcFldFieldDataType;
    fieldName: string;
    fieldType: IdentityVerificationProcFldFieldType;
    fieldValueFormula?: string;
    isActive?: boolean;
    isManualInput?: boolean;
    masterLabel: string;
    sequenceNumber: number; // xsd-type: "int"
}

export interface IframeWhiteListUrlSettingsMetadata extends MetadataInfo {
    iframeWhiteListUrls?: Array<IframeWhiteListUrl>;
}

export interface IframeWhiteListUrl {
    context: IFrameWhitelistContext;
    url?: string;
}

export interface InboundNetworkConnectionMetadata extends MetadataInfo {
    connectionType: ExternalConnectionType;
    description: string;
    inboundNetworkConnProperties?: Array<InboundNetworkConnProperty>;
    isActive: boolean;
    label: string;
    status: ExternalConnectionStatus;
}

export interface InboundNetworkConnProperty {
    propertyName: InboundConnPropertyName;
    propertyValue: string;
}

export interface IncidentMgmtSettingsMetadata extends MetadataInfo {
    enableAlertBroadcastType?: boolean;
    enableEmailBroadcastType?: boolean;
    enableIncidentMgmt?: boolean;
    enableSiteBannerBroadcastType?: boolean;
    enableSlackBroadcastType?: boolean;
}

export interface IndustriesAutomotiveSettingsMetadata extends MetadataInfo {
    enableAutomotiveCloud?: boolean;
    enableAutomotiveServiceExcellence?: boolean;
}

export interface IndustriesEinsteinFeatureSettingsMetadata extends MetadataInfo {
    documentReaderConfidenceOrgValue: number; // xsd-type: "double"
}

export interface IndustriesManufacturingSettingsMetadata extends MetadataInfo {
    enableIndManufacturing?: boolean;
    enableIndustriesMfgAccountForecast?: boolean;
    enableIndustriesMfgAdvForecast?: boolean;
    enableIndustriesMfgIAS?: boolean;
    enableIndustriesMfgProgram?: boolean;
    enableIndustriesMfgTargets?: boolean;
    enablePartnerLeadManagement?: boolean;
    enablePartnerPerformanceManagement?: boolean;
    enablePartnerVisitManagement?: boolean;
}

export interface IndustriesSettingsMetadata extends MetadataInfo {
    allowMultipleProducersToWorkOnSamePolicy?: boolean;
    appointmentDistributionOrgPref?: boolean;
    captureResourceUtilizationOrgPref?: boolean;
    createCustomerPropertyFromLAProperty?: boolean;
    createFSCAssetFromLAAsset?: boolean;
    createFSCAssetFromLAProperty?: boolean;
    createFSCLiabilityFromLAFinancial?: boolean;
    createFSCLiabilityFromLALiability?: boolean;
    createFinancialAccountFromLAAsset?: boolean;
    createFinancialAccountFromLALiability?: boolean;
    createFinancialAccountsFromLAFinancials?: boolean;
    createFinancialAccountsFromLAProperty?: boolean;
    enableAIAccelerator?: boolean;
    enableAWSTextractAnalyzeIDPref?: boolean;
    enableAccessToMasterListOfCoverageTypes?: boolean;
    enableAccountScoreEnabled?: boolean;
    enableActionableList?: boolean;
    enableAnyResourceTypeOrgPref?: boolean;
    enableAppFrmAnywhereOrgPref?: boolean;
    enableAppInviteOrgPref?: boolean;
    enableBlockResourceAvailabilityOrgPref?: boolean;
    enableBusinessMessenger?: boolean;
    enableCalculationUsingParentPolicyOnly?: boolean;
    enableCallReportAdminContextPref?: boolean;
    enableCareMgmtSlackAccess?: boolean;
    enableChurnPredictionRT?: boolean;
    enableClaimMgmt?: boolean;
    enableClinicalDataModel?: boolean;
    enableCompliantDataSharingForAccount?: boolean;
    enableCompliantDataSharingForCustomObjects?: boolean;
    enableCompliantDataSharingForFinancialDeal?: boolean;
    enableCompliantDataSharingForInteraction?: boolean;
    enableCompliantDataSharingForInteractionSummary?: boolean;
    enableCompliantDataSharingForOpportunity?: boolean;
    enableComprehendMedical?: boolean;
    enableContactCenterAccess?: boolean;
    enableCreateMultiAttendeeEventOrgPref?: boolean;
    enableCrisisCenterAccess?: boolean;
    enableCustomFlowsOnCycleCount?: boolean;
    enableCustomFlowsOnExpiryPage?: boolean;
    enableDealManagement?: boolean;
    enableDisclsReprtFeatureOff?: boolean;
    enableDiscoveryFrameworkMetadata?: boolean;
    enableDpeProviderSearchSettingsOrgPref?: boolean;
    enableEducationCloud?: boolean;
    enableEinsteinDocReader?: boolean;
    enableEinsteinVisits?: boolean;
    enableEnhancedQuestionCreation?: boolean;
    enableEventManagementOrgPref?: boolean;
    enableEventWriteOrgPref?: boolean;
    enableExistingHealthCloudOrg?: boolean;
    enableFSCInsuranceReport?: boolean;
    enableFinancialDealCallReportCmpPref?: boolean;
    enableFinancialDealCallReportPref?: boolean;
    enableFinancialDealRoleHierarchy?: boolean;
    enableGnrcDisclsFrmwrk?: boolean;
    enableHCReferralScoring?: boolean;
    enableIESentimentAnalysis?: boolean;
    enableIndustriesAssessment?: boolean;
    enableIndustriesAssessmentGuestOrgPref?: boolean;
    enableIndustriesKYC?: boolean;
    enableIndustriesRebates?: boolean;
    enableIntegratedCareManagementSetting?: boolean;
    enableInteractionCstmSharingPref?: boolean;
    enableInteractionRoleHierarchy?: boolean;
    enableInteractionSummaryPref?: boolean;
    enableInteractionSummaryRoleHierarchy?: boolean;
    enableManyToManyRelationships?: boolean;
    enableMedRecSetting?: boolean;
    enableMedicalDeviceEnabled?: boolean;
    enableMedicationManagementEnabled?: boolean;
    enableMortgageRlaTotalsOrgPref?: boolean;
    enableMulesoftFhirR4Apis?: boolean;
    enableMultiResourceOrgPref?: boolean;
    enableMultipleCareProgramEnrolleeOrgPref?: boolean;
    enableMultipleTopicsForShiftsOrgPref?: boolean;
    enableObjectDetection?: boolean;
    enableOverbookingOrgPref?: boolean;
    enablePatientAppointmentSchedulingOrgPref?: boolean;
    enablePatientServicesOrchestration?: boolean;
    enablePolicyAdministration?: boolean;
    enableProviderSearchSyncOrgPref?: boolean;
    enableRBLUsingCalcService?: boolean;
    enableRecordRollup?: boolean;
    enableReferralScoring?: boolean;
    enableSCAssignFootprint?: boolean;
    enableSCBEIEnabled?: boolean;
    enableSCCarbonAccounting?: boolean;
    enableSCCarbonCreditAlloc?: boolean;
    enableSCCreateFootprint?: boolean;
    enableSCDGF?: boolean;
    enableSCEmssnsForecasting?: boolean;
    enableSCExpansionUseCase?: boolean;
    enableSCExternalEngMgmt?: boolean;
    enableSCGenrateCnsmpRcd?: boolean;
    enableSCSNGManagement?: boolean;
    enableSCScope3HubEnabled?: boolean;
    enableSCSplitCnsmpRcd?: boolean;
    enableSCTargetSetting?: boolean;
    enableSCWasteManagement?: boolean;
    enableSCWaterManagement?: boolean;
    enableSentimentAnalysis?: boolean;
    enableShareSaWithArOrgPref?: boolean;
    enableSlackForCib?: boolean;
    enableSmartTags?: boolean;
    enableSustainabilityCloud?: boolean;
    enableSyncInteractionsPref?: boolean;
    enableTearSheetPref?: boolean;
    enableTextExtract?: boolean;
    enableTimelinePref?: boolean;
    enableTopicOrTemplate?: boolean;
    enableTopicTimeSlot?: boolean;
    enableUMPayerAppAccessOrgPreference?: boolean;
    enableVideoVisitsOrgPref?: boolean;
    enableVisitCalendarSync?: boolean;
    enableVisitInventoryEnabled?: boolean;
    loanApplicantAddressAutoCreation?: boolean;
    loanApplicantAutoCreation?: boolean;
    rlaEditIfAccHasEdit?: boolean;
    transformRBLtoDPE?: boolean;
}

export interface InstalledPackageMetadata extends MetadataInfo {
    activateRSS: boolean;
    password?: string;
    securityType?: string;
    versionNumber: string;
}

export interface InventorySettingsMetadata extends MetadataInfo {
    enableOCIB2CIntegration?: boolean;
    enableOmniChannelInventory?: boolean;
}

export interface InvocableActionSettingsMetadata extends MetadataInfo {
    isPartialSaveAllowed?: boolean;
}

export interface IoTSettingsMetadata extends MetadataInfo {
    enableIoT?: boolean;
    enableIoTInsightsPilot?: boolean;
    enableIoTUsageEmail?: boolean;
}

export interface KeywordListMetadata extends MetadataInfo {
    description?: string;
    keywords?: Array<Keyword>;
    masterLabel: string;
}

export interface Keyword {
    keyword: string;
}

export interface KnowledgeSettingsMetadata extends MetadataInfo {
    answers?: KnowledgeAnswerSettings;
    cases?: KnowledgeCaseSettings;
    defaultLanguage?: string;
    enableChatterQuestionKBDeflection?: boolean;
    enableCreateEditOnArticlesTab?: boolean;
    enableExternalMediaContent?: boolean;
    enableKbStandardSharing?: boolean;
    enableKnowledge?: boolean;
    enableKnowledgeAgentContribution?: boolean;
    enableKnowledgeAnswersPromotion?: boolean;
    enableKnowledgeArticleTextHighlights?: boolean;
    enableKnowledgeCaseRL?: boolean;
    enableKnowledgeKeywordAutoComplete?: boolean;
    enableKnowledgeTitleAutoComplete?: boolean;
    enableLightningKbAutoLoadRichTextField?: boolean;
    enableLightningKnowledge?: boolean;
    languages?: KnowledgeLanguageSettings;
    showArticleSummariesCustomerPortal?: boolean;
    showArticleSummariesInternalApp?: boolean;
    showArticleSummariesPartnerPortal?: boolean;
    showValidationStatusField?: boolean;
    suggestedArticles?: KnowledgeSuggestedArticlesSettings;
    votingEnabled?: boolean;
}

export interface KnowledgeAnswerSettings {
    assignTo?: string;
    defaultArticleType?: string;
    enableArticleCreation?: boolean;
}

export interface KnowledgeCaseSettings {
    articlePDFCreationProfile?: string;
    articlePublicSharingCommunities?: KnowledgeCommunitiesSettings;
    articlePublicSharingSites?: KnowledgeSitesSettings;
    articlePublicSharingSitesChatterAnswers?: KnowledgeSitesSettings;
    assignTo?: string;
    customizationClass?: string;
    defaultContributionArticleType?: string;
    editor?: KnowledgeCaseEditor;
    enableArticleCreation?: boolean;
    enableArticlePublicSharingSites?: boolean;
    enableCaseDataCategoryMapping?: boolean;
    useProfileForPDFCreation?: boolean;
}

export interface KnowledgeCommunitiesSettings {
    community?: Array<string>;
}

export interface KnowledgeSitesSettings {
    site?: Array<string>;
}

export interface KnowledgeLanguageSettings {
    language?: Array<KnowledgeLanguage>;
}

export interface KnowledgeLanguage {
    active?: boolean;
    defaultAssignee?: string;
    defaultAssigneeType?: KnowledgeLanguageLookupValueType;
    defaultReviewer?: string;
    defaultReviewerType?: KnowledgeLanguageLookupValueType;
    name: string;
}

export interface KnowledgeSuggestedArticlesSettings {
    caseFields?: KnowledgeCaseFieldsSettings;
    useSuggestedArticlesForCase?: boolean;
    workOrderFields?: KnowledgeWorkOrderFieldsSettings;
    workOrderLineItemFields?: KnowledgeWorkOrderLineItemFieldsSettings;
}

export interface KnowledgeCaseFieldsSettings {
    field?: Array<KnowledgeCaseField>;
}

export interface KnowledgeCaseField {
    name?: string;
}

export interface KnowledgeWorkOrderFieldsSettings {
    field?: Array<KnowledgeWorkOrderField>;
}

export interface KnowledgeWorkOrderField {
    name?: string;
}

export interface KnowledgeWorkOrderLineItemFieldsSettings {
    field?: Array<KnowledgeWorkOrderLineItemField>;
}

export interface KnowledgeWorkOrderLineItemField {
    name?: string;
}

export interface LanguageSettingsMetadata extends MetadataInfo {
    enableCanadaIcuFormat?: boolean;
    enableDataTranslation?: boolean;
    enableEndUserLanguages?: boolean;
    enableICULocaleDateFormat?: boolean;
    enableLocalNamesForStdObjects?: boolean;
    enableLocaleInsensitiveFiltering?: boolean;
    enablePlatformLanguages?: boolean;
    enableTranslationWorkbench?: boolean;
    useLanguageFallback?: boolean;
}

export interface LayoutMetadata extends MetadataInfo {
    customButtons?: Array<string>;
    customConsoleComponents?: CustomConsoleComponents;
    emailDefault?: boolean;
    excludeButtons?: Array<string>;
    feedLayout?: FeedLayout;
    headers?: Array<LayoutHeader>;
    layoutSections?: Array<LayoutSection>;
    miniLayout?: MiniLayout;
    multilineLayoutFields?: Array<string>;
    platformActionList?: PlatformActionList;
    quickActionList?: QuickActionList;
    relatedContent?: RelatedContent;
    relatedLists?: Array<RelatedListItem>;
    relatedObjects?: Array<string>;
    runAssignmentRulesDefault?: boolean;
    showEmailCheckbox?: boolean;
    showHighlightsPanel?: boolean;
    showInteractionLogPanel?: boolean;
    showKnowledgeComponent?: boolean;
    showRunAssignmentRulesCheckbox?: boolean;
    showSolutionSection?: boolean;
    showSubmitAndAttachButton?: boolean;
    summaryLayout?: SummaryLayout;
}

export interface CustomConsoleComponents {
    primaryTabComponents?: PrimaryTabComponents;
    subtabComponents?: SubtabComponents;
}

export interface PrimaryTabComponents {
    containers?: Array<Container>;
}

export interface Container {
    height?: number; // xsd-type: "int"
    isContainerAutoSizeEnabled: boolean;
    region: string;
    sidebarComponents?: Array<SidebarComponent>;
    style: string;
    unit: string;
    width?: number; // xsd-type: "int"
}

export interface SidebarComponent {
    componentType: string;
    createAction?: string;
    enableLinking?: boolean;
    height?: number; // xsd-type: "int"
    label?: string;
    lookup?: string;
    page?: string;
    relatedLists?: Array<RelatedList>;
    unit?: string;
    updateAction?: string;
    width?: number; // xsd-type: "int"
}

export interface RelatedList {
    hideOnDetail: boolean;
    name: string;
}

export interface SubtabComponents {
    containers?: Array<Container>;
}

export interface FeedLayout {
    autocollapsePublisher?: boolean;
    compactFeed?: boolean;
    feedFilterPosition?: FeedLayoutFilterPosition;
    feedFilters?: Array<FeedLayoutFilter>;
    fullWidthFeed?: boolean;
    hideSidebar?: boolean;
    highlightExternalFeedItems?: boolean;
    leftComponents?: Array<FeedLayoutComponent>;
    rightComponents?: Array<FeedLayoutComponent>;
    useInlineFiltersInConsole?: boolean;
}

export interface FeedLayoutFilter {
    feedFilterName?: string;
    feedFilterType: FeedLayoutFilterType;
    feedItemType?: FeedItemType;
}

export interface FeedLayoutComponent {
    componentType: FeedLayoutComponentType;
    height?: number; // xsd-type: "int"
    page?: string;
}

export interface LayoutSection {
    customLabel?: boolean;
    detailHeading?: boolean;
    editHeading?: boolean;
    label?: string;
    layoutColumns?: Array<LayoutColumn>;
    style: LayoutSectionStyle;
}

export interface LayoutColumn {
    layoutItems?: Array<LayoutItem>;
    reserved?: string;
}

export interface LayoutItem {
    analyticsCloudComponent?: AnalyticsCloudComponentLayoutItem;
    behavior?: UiBehavior;
    canvas?: string;
    component?: string;
    customLink?: string;
    emptySpace?: boolean;
    field?: string;
    height?: number; // xsd-type: "int"
    page?: string;
    reportChartComponent?: ReportChartComponentLayoutItem;
    scontrol?: string;
    showLabel?: boolean;
    showScrollbars?: boolean;
    width?: string;
}

export interface AnalyticsCloudComponentLayoutItem {
    assetType: string;
    devName: string;
    error?: string;
    filter?: string;
    height?: number; // xsd-type: "int"
    hideOnError?: boolean;
    showHeader?: boolean;
    showSharing?: boolean;
    showTitle?: boolean;
    width?: string;
}

export interface ReportChartComponentLayoutItem {
    cacheData?: boolean;
    contextFilterableField?: string;
    error?: string;
    hideOnError?: boolean;
    includeContext?: boolean;
    reportName: string;
    showTitle?: boolean;
    size?: ReportChartComponentSize;
}

export interface MiniLayout {
    fields?: Array<string>;
    relatedLists?: Array<RelatedListItem>;
}

export interface RelatedListItem {
    customButtons?: Array<string>;
    excludeButtons?: Array<string>;
    fields?: Array<string>;
    relatedList: string;
    sortField?: string;
    sortOrder?: SortOrder;
}

export interface RelatedContent {
    relatedContentItems?: Array<RelatedContentItem>;
}

export interface RelatedContentItem {
    layoutItem: LayoutItem;
}

export interface SummaryLayout {
    masterLabel: string;
    sizeX: number; // xsd-type: "int"
    sizeY?: number; // xsd-type: "int"
    sizeZ?: number; // xsd-type: "int"
    summaryLayoutItems?: Array<SummaryLayoutItem>;
    summaryLayoutStyle: SummaryLayoutStyle;
}

export interface SummaryLayoutItem {
    customLink?: string;
    field?: string;
    posX: number; // xsd-type: "int"
    posY?: number; // xsd-type: "int"
    posZ?: number; // xsd-type: "int"
}

export interface LeadConfigSettingsMetadata extends MetadataInfo {
    doesEnableLeadConvertDefaultSubjectBlankTaskCreation?: boolean;
    doesHideOpportunityInConvertLeadWindow?: boolean;
    doesPreserveLeadStatus?: boolean;
    doesSelectNoOpportunityOnConvertLead?: boolean;
    doesTrackHistory?: boolean;
    enableConversionsOnMobile?: boolean;
    enableOrgWideMergeAndDelete?: boolean;
    shouldLeadConvertRequireValidation?: boolean;
    shouldSendNotificationEmailWhenLeadOwnerUpdatesViaApexInLEX?: boolean;
}

export interface LeadConvertSettingsMetadata extends MetadataInfo {
    allowOwnerChange?: boolean;
    objectMapping?: Array<ObjectMapping>;
    opportunityCreationOptions?: VisibleOrRequired;
}

export interface LetterheadMetadata extends MetadataInfo {
    available: boolean;
    backgroundColor: string;
    bodyColor: string;
    bottomLine: LetterheadLine;
    description?: string;
    footer: LetterheadHeaderFooter;
    header: LetterheadHeaderFooter;
    middleLine: LetterheadLine;
    name: string;
    topLine: LetterheadLine;
}

export interface LetterheadLine {
    color: string;
    height: number; // xsd-type: "int"
}

export interface LetterheadHeaderFooter {
    backgroundColor: string;
    height: number; // xsd-type: "int"
    horizontalAlignment?: LetterheadHorizontalAlignment;
    logo?: string;
    verticalAlignment?: LetterheadVerticalAlignment;
}

export interface LicenseDefinitionMetadata extends MetadataInfo {
    aggregationGroup: string;
    description?: string;
    isPublished: boolean;
    label: string;
    licensedCustomPermissions?: Array<LicensedCustomPermissions>;
    licensingAuthority: string;
    licensingAuthorityProvider: string;
    minPlatformVersion: number; // xsd-type: "int"
    origin: string;
    revision: number; // xsd-type: "int"
    trialLicenseDuration: number; // xsd-type: "int"
    trialLicenseQuantity: number; // xsd-type: "int"
}

export interface LicensedCustomPermissions {
    customPermission: string;
    licenseDefinition: string;
}

export interface LightningBoltMetadata extends MetadataInfo {
    category: LightningBoltCategory;
    lightningBoltFeatures?: Array<LightningBoltFeatures>;
    lightningBoltImages?: Array<LightningBoltImages>;
    lightningBoltItems?: Array<LightningBoltItems>;
    masterLabel: string;
    publisher: string;
    summary: string;
}

export interface LightningBoltFeatures {
    description?: string;
    order: number; // xsd-type: "int"
    title: string;
}

export interface LightningBoltImages {
    image: string;
    order: number; // xsd-type: "int"
}

export interface LightningBoltItems {
    name: string;
    type: string;
}

export interface LightningComponentBundleMetadata extends MetadataInfo {
    apiVersion?: number; // xsd-type: "double"
    capabilities?: Capabilities;
    description?: string;
    isExplicitImport?: boolean;
    isExposed?: boolean;
    lwcResources?: LwcResources;
    masterLabel?: string;
    runtimeNamespace?: string;
    targetConfigs?: string; // xsd-type: "base64Binary"
    targets?: Targets;
}

export interface Capabilities {
    capability?: Array<string>;
}

export interface LwcResources {
    lwcResource?: Array<LwcResource>;
}

export interface LwcResource {
    filePath: string;
    source: string; // xsd-type: "base64Binary"
}

export interface Targets {
    target?: Array<string>;
}

export interface LightningExperienceSettingsMetadata extends MetadataInfo {
    activeThemeName?: string;
    enableAccessCheckCrucPref?: boolean;
    enableApiUserLtngOutAccessPref?: boolean;
    enableAuraCDNPref?: boolean;
    enableAuraSecStaticResCRUCPref?: boolean;
    enableErrorExperienceEnabled?: boolean;
    enableFeedbackInMobile?: boolean;
    enableGoogleSheetsForSfdcEnabled?: boolean;
    enableHideOpenInQuip?: boolean;
    enableIE11DeprecationMsgHidden?: boolean;
    enableIE11LEXCrucPref?: boolean;
    enableInAppLearning?: boolean;
    enableInAppTooltips?: boolean;
    enableLEXExtensionComponentCustomization?: boolean;
    enableLEXExtensionDarkMode?: boolean;
    enableLEXExtensionInlineEditModifier?: boolean;
    enableLEXExtensionLinkGrabber?: boolean;
    enableLEXExtensionRelatedLists?: boolean;
    enableLEXExtensionRequiredFields?: boolean;
    enableLEXExtensionTrailhead?: boolean;
    enableLEXOnIpadEnabled?: boolean;
    enableLWCDynamicComponents?: boolean;
    enableLexEndUsersNoSwitching?: boolean;
    enableNavPersonalizationOptOut?: boolean;
    enableNoBackgroundNavigations?: boolean;
    enableQuip?: boolean;
    enableRemoveThemeBrandBanner?: boolean;
    enableS1BannerPref?: boolean;
    enableS1BrowserEnabled?: boolean;
    enableS1DesktopEnabled?: boolean;
    enableS1UiLoggingEnabled?: boolean;
    enableSalesforceNext?: boolean;
    enableSidToken3rdPartyAuraApp?: boolean;
    enableSkypeChatEnabled?: boolean;
    enableSparkAllUsers?: boolean;
    enableSparkConversationEnabled?: boolean;
    enableTryLightningOptOut?: boolean;
    enableUseS1AlohaDesktop?: boolean;
    enableUsersAreLightningOnly?: boolean;
    enableWebExEnabled?: boolean;
    enableWebexAllUsers?: boolean;
    isLEXExtensionComponentCustomizationOff?: boolean;
    isLEXExtensionDarkModeOff?: boolean;
    isLEXExtensionLinkGrabberOff?: boolean;
    isLEXExtensionOff?: boolean;
}

export interface LightningExperienceThemeMetadata extends MetadataInfo {
    defaultBrandingSet: string;
    description?: string;
    masterLabel: string;
    shouldOverrideLoadingImage?: boolean;
}

export interface LightningMessageChannelMetadata extends MetadataInfo {
    description?: string;
    isExposed?: boolean;
    lightningMessageFields?: Array<LightningMessageField>;
    masterLabel: string;
}

export interface LightningMessageField {
    description?: string;
    fieldName: string;
}

export interface LightningOnboardingConfigMetadata extends MetadataInfo {
    collaborationGroup?: string | null;
    customQuestion?: string;
    feedbackFormDaysFrequency?: number | null; // xsd-type: "int"
    isCustom: boolean;
    masterLabel: string;
    promptDelayTime?: number | null; // xsd-type: "int"
    sendFeedbackToSalesforce: boolean;
}

export interface LiveAgentSettingsMetadata extends MetadataInfo {
    enableChatFindOrCreateEnable?: boolean;
    enableLiveAgent?: boolean;
    enableQuickTextEnabled?: boolean;
}

export interface LiveChatAgentConfigMetadata extends MetadataInfo {
    assignments?: AgentConfigAssignments;
    autoGreeting?: string;
    capacity?: number; // xsd-type: "int"
    criticalWaitTime?: number; // xsd-type: "int"
    customAgentName?: string;
    disableTransferConferenceGreeting?: boolean;
    enableAgentFileTransfer?: boolean;
    enableAgentSneakPeek?: boolean;
    enableAssistanceFlag?: boolean;
    enableAutoAwayOnDecline?: boolean;
    enableAutoAwayOnPushTimeout?: boolean;
    enableChatConferencing?: boolean;
    enableChatMonitoring?: boolean;
    enableChatTransferToAgent?: boolean;
    enableChatTransferToButton?: boolean;
    enableChatTransferToSkill?: boolean;
    enableLogoutSound?: boolean;
    enableNotifications?: boolean;
    enableRequestSound?: boolean;
    enableSneakPeek?: boolean;
    enableVisitorBlocking?: boolean;
    enableWhisperMessage?: boolean;
    label: string;
    supervisorDefaultAgentStatusFilter?: SupervisorAgentStatusFilter;
    supervisorDefaultButtonFilter?: string;
    supervisorDefaultSkillFilter?: string;
    supervisorSkills?: SupervisorAgentConfigSkills;
    transferableButtons?: AgentConfigButtons;
    transferableSkills?: AgentConfigSkills;
}

export interface AgentConfigAssignments {
    profiles?: AgentConfigProfileAssignments;
    users?: AgentConfigUserAssignments;
}

export interface AgentConfigProfileAssignments {
    profile?: Array<string>;
}

export interface AgentConfigUserAssignments {
    user?: Array<string>;
}

export interface SupervisorAgentConfigSkills {
    skill?: Array<string>;
}

export interface AgentConfigButtons {
    button?: Array<string>;
}

export interface AgentConfigSkills {
    skill?: Array<string>;
}

export interface LiveChatButtonMetadata extends MetadataInfo {
    animation?: LiveChatButtonPresentation;
    autoGreeting?: string;
    chasitorIdleTimeout?: number; // xsd-type: "int"
    chasitorIdleTimeoutWarning?: number; // xsd-type: "int"
    chatPage?: string;
    customAgentName?: string;
    deployments?: LiveChatButtonDeployments;
    enableQueue?: boolean;
    inviteEndPosition?: LiveChatButtonInviteEndPosition;
    inviteImage?: string;
    inviteStartPosition?: LiveChatButtonInviteStartPosition;
    isActive?: boolean;
    label: string;
    numberOfReroutingAttempts?: number; // xsd-type: "int"
    offlineImage?: string;
    onlineImage?: string;
    optionsCustomRoutingIsEnabled?: boolean;
    optionsHasChasitorIdleTimeout: boolean;
    optionsHasInviteAfterAccept?: boolean;
    optionsHasInviteAfterReject?: boolean;
    optionsHasRerouteDeclinedRequest?: boolean;
    optionsIsAutoAccept?: boolean;
    optionsIsInviteAutoRemove?: boolean;
    overallQueueLength?: number; // xsd-type: "int"
    perAgentQueueLength?: number; // xsd-type: "int"
    postChatPage?: string;
    postChatUrl?: string;
    preChatFormPage?: string;
    preChatFormUrl?: string;
    pushTimeOut?: number; // xsd-type: "int"
    routingType: LiveChatButtonRoutingType;
    site?: string;
    skills?: LiveChatButtonSkills;
    timeToRemoveInvite?: number; // xsd-type: "int"
    type: LiveChatButtonType;
    windowLanguage?: Language;
}

export interface LiveChatButtonDeployments {
    deployment?: Array<string>;
}

export interface LiveChatButtonSkills {
    skill?: Array<string>;
}

export interface LiveChatDeploymentMetadata extends MetadataInfo {
    brandingImage?: string;
    connectionTimeoutDuration?: number; // xsd-type: "int"
    connectionWarningDuration?: number; // xsd-type: "int"
    displayQueuePosition?: boolean;
    domainWhiteList?: LiveChatDeploymentDomainWhitelist;
    enablePrechatApi?: boolean;
    enableTranscriptSave?: boolean;
    label: string;
    mobileBrandingImage?: string;
    site?: string;
    windowTitle: string;
}

export interface LiveChatDeploymentDomainWhitelist {
    domain?: Array<string>;
}

export interface LiveChatSensitiveDataRuleMetadata extends MetadataInfo {
    actionType: SensitiveDataActionType;
    description?: string;
    enforceOn: number; // xsd-type: "int"
    isEnabled: boolean;
    pattern: string;
    priority: number; // xsd-type: "int"
    replacement?: string;
}

export interface LiveMessageSettingsMetadata extends MetadataInfo {
    enableCheckCEUserPerm?: boolean;
    enableLiveMessage?: boolean;
}

export interface MLDataDefinitionMetadata extends MetadataInfo {
    developerName: string;
    entityDeveloperName: string;
    excludedFields?: Array<string>;
    includedFields?: Array<string>;
    joinFields?: Array<MLField>;
    parentDefinitionDevName: string;
    scoringFilter?: MLFilter;
    segmentFilter?: MLFilter;
    trainingFilter?: MLFilter;
    type: MLDataDefinitionType;
}

export interface MLField {
    entity?: string;
    entityName?: string;
    field?: string;
    fieldName?: string;
    relatedField?: MLField;
    relationType?: MLRelationType;
    type: MLFieldType;
}

export interface MLFilter {
    filterName: string;
    lhFilter?: MLFilter;
    lhPredictionField?: string;
    lhType?: AIValueType;
    lhUnit?: AIFilterUnit;
    lhValue?: string;
    operation: AIFilterOperation;
    rhFilter?: MLFilter;
    rhPredictionField?: string;
    rhType?: AIValueType;
    rhUnit?: AIFilterUnit;
    rhValue?: string;
    sortOrder?: number; // xsd-type: "int"
}

export interface MLPredictionDefinitionMetadata extends MetadataInfo {
    aiApplicationDeveloperName: string;
    description?: string;
    developerName: string;
    masterLabel?: string;
    negativeExpression?: MLFilter;
    positiveExpression?: MLFilter;
    predictionField?: string;
    priority?: number | null; // xsd-type: "int"
    pushbackField?: string;
    status: MLPredictionDefinitionStatus;
    type: AIPredictionType;
}

export interface MLRecommendationDefinitionMetadata extends MetadataInfo {
    aiApplicationDeveloperName: string;
    description?: string;
    developerName: string;
    externalId?: string;
    interactionDateTimeField?: string;
    masterLabel: string;
    negativeExpression?: MLFilter;
    positiveExpression?: MLFilter;
    status: MLRecommendationDefinitionStatus;
}

export interface MacroSettingsMetadata extends MetadataInfo {
    contextualMacroFiltering?: boolean;
    enableAdvancedSearch?: boolean;
    macrosInFolders?: boolean;
}

export interface ManagedContentTypeMetadata extends MetadataInfo {
    description?: string;
    developerName: string;
    managedContentNodeTypes?: Array<ManagedContentNodeType>;
    masterLabel: string;
}

export interface ManagedContentNodeType {
    helpText?: string;
    isLocalizable?: boolean;
    isRequired?: boolean;
    nodeLabel: string;
    nodeName: string;
    nodeType: MCNodeType;
    placeholderText?: string;
}

export interface ManagedTopicMetadata extends MetadataInfo {
    managedTopicType: string;
    name: string;
    parentName: string;
    position: number; // xsd-type: "int"
    topicDescription: string;
}

export interface ManagedTopicsMetadata extends MetadataInfo {
    managedTopic?: Array<ManagedTopicMetadata>;
}

export interface MarketingAppExtActivityMetadata extends MetadataInfo {
    description?: string;
    endpointUrl?: string;
    isActive?: boolean;
    isProtected?: boolean;
    marketingAppExtension: string;
    masterLabel: string;
}

export interface MarketingAppExtensionMetadata extends MetadataInfo {
    description?: string;
    isActive?: boolean;
    isProtected?: boolean;
    marketingAppExtActions?: Array<MarketingAppExtAction>;
    marketingAppExtActivities?: Array<MarketingAppExtActivityMetadata>;
    masterLabel: string;
}

export interface MarketingAppExtAction {
    actionName: string;
    actionParams?: string;
    actionSchema?: string;
    actionSelector: string;
    apiName: string;
    description?: string;
    isActive?: boolean;
    marketingAppExtension: string;
}

export interface MatchingRuleMetadata extends MetadataInfo {
    booleanFilter?: string;
    description?: string;
    label: string;
    matchingRuleItems?: Array<MatchingRuleItem>;
    ruleStatus: MatchingRuleStatus;
}

export interface MatchingRuleItem {
    blankValueBehavior?: BlankValueBehavior;
    fieldName: string;
    matchingMethod: MatchingMethod;
}

export interface MatchingRulesMetadata extends MetadataInfo {
    matchingRules?: Array<MatchingRuleMetadata>;
}

export interface MeetingsSettingsMetadata extends MetadataInfo {
    enableSalesforceMeetings?: boolean;
    enableSalesforceMeetingsSyncCheck?: boolean;
    enableZoomVideoConference?: boolean;
}

export interface MessagingChannelMetadata extends MetadataInfo {
    automatedResponses?: Array<MessagingAutoResponse>;
    customParameters?: Array<MessagingChannelCustomParameter>;
    description?: string;
    masterLabel: string;
    messagingChannelType: MessagingChannelType;
    sessionHandlerFlow?: string;
    sessionHandlerQueue: string;
    sessionHandlerType: MessagingSessionHandlerType;
    standardParameters?: Array<MessagingChannelStandardParameter>;
}

export interface MessagingAutoResponse {
    response: string;
    type: MessagingAutoResponseType;
}

export interface MessagingChannelCustomParameter {
    actionParameterMappings?: Array<MessagingChannelActionParameterMapping>;
    externalParameterName: string;
    masterLabel: string;
    maxLength?: number; // xsd-type: "int"
    name: string;
    parameterDataType: FlowDataType;
}

export interface MessagingChannelActionParameterMapping {
    actionParameterName: string;
}

export interface MessagingChannelStandardParameter {
    actionParameterMappings?: Array<MessagingChannelActionParameterMapping>;
    parameterType: MessagingChannelStandardParameterType;
}

export interface MfgServiceConsoleSettingsMetadata extends MetadataInfo {
    enableMfgServiceConsole?: boolean;
}

export interface MilestoneTypeMetadata extends MetadataInfo {
    description?: string;
    recurrenceType?: MilestoneTypeRecurrenceType;
}

export interface MlDomainMetadata extends MetadataInfo {
    description?: string;
    label: string;
    mlIntents?: Array<MlIntent>;
    mlSlotClasses?: Array<MlSlotClass>;
}

export interface MobileApplicationDetailMetadata extends MetadataInfo {
    applicationBinaryFile?: string; // xsd-type: "base64Binary"
    applicationBinaryFileName?: string;
    applicationBundleIdentifier?: string;
    applicationFileLength?: number; // xsd-type: "int"
    applicationIconFile?: string;
    applicationIconFileName?: string;
    applicationInstallUrl?: string;
    devicePlatform: DevicePlatformType;
    deviceType?: string;
    minimumOsVersion?: string;
    privateApp?: boolean;
    version: string;
}

export interface MobileSettingsMetadata extends MetadataInfo {
    dashboardMobile?: DashboardMobileSettings;
    enableImportContactFromDevice?: boolean;
    enableOfflineDraftsEnabled?: boolean;
    enablePopulateNameManuallyInToday?: boolean;
    enableS1EncryptedStoragePref2?: boolean;
    enableS1OfflinePref?: boolean;
}

export interface DashboardMobileSettings {
    enableDashboardIPadApp?: boolean;
}

export interface ModerationRuleMetadata extends MetadataInfo {
    action: ModerationRuleAction;
    actionLimit?: number; // xsd-type: "int"
    active: boolean;
    description?: string;
    entitiesAndFields?: Array<ModeratedEntityField>;
    masterLabel: string;
    notifyLimit?: number; // xsd-type: "int"
    timePeriod?: RateLimitTimePeriod;
    type?: ModerationRuleType;
    userCriteria?: Array<string>;
    userMessage?: string;
}

export interface ModeratedEntityField {
    entityName: string;
    fieldName?: string;
    keywordList?: string;
}

export interface MyDomainDiscoverableLoginMetadata extends MetadataInfo {
    apexHandler: string;
    executeApexHandlerAs?: string;
    usernameLabel?: string;
}

export interface MyDomainSettingsMetadata extends MetadataInfo {
    canOnlyLoginWithMyDomainUrl?: boolean;
    doesApiLoginRequireOrgDomain?: boolean;
    domainPartition?: OrgDomainShard;
    enableNativeBrowserForAuthOnAndroid?: boolean;
    enableNativeBrowserForAuthOnIos?: boolean;
    enableShareBrowserSessionAndroidForAuth?: boolean;
    enableShareBrowserSessionIOSForAuth?: boolean;
    logRedirections?: boolean;
    myDomainName?: string;
    myDomainSuffix?: OrgDomainProdSuffix;
    redirectForceComSiteUrls?: boolean;
    redirectPriorMyDomain?: boolean;
    use3rdPartyCookieBlockingCompatibleHostnames?: boolean;
    useEdge?: boolean;
    useEnhancedDomainsInSandbox?: boolean;
    useStabilizedMyDomainHostnames?: boolean;
    useStabilizedSandboxMyDomainHostnames?: boolean;
}

export interface NameSettingsMetadata extends MetadataInfo {
    enableInformalName?: boolean;
    enableMiddleName?: boolean;
    enableNameSuffix?: boolean;
}

export interface NamedCredentialMetadata extends MetadataInfo {
    allowMergeFieldsInBody?: boolean;
    allowMergeFieldsInHeader?: boolean;
    authProvider?: string;
    authTokenEndpointUrl?: string;
    awsAccessKey?: string;
    awsAccessSecret?: string;
    awsRegion?: string;
    awsService?: string;
    certificate?: string;
    endpoint?: string;
    generateAuthorizationHeader?: boolean;
    jwtAudience?: string;
    jwtFormulaSubject?: string;
    jwtIssuer?: string;
    jwtSigningCertificate?: string;
    jwtTextSubject?: string;
    jwtValidityPeriodSeconds?: number; // xsd-type: "int"
    label: string;
    namedCredentialParameters?: Array<NamedCredentialParameter>;
    namedCredentialType?: NamedCredentialType;
    oauthRefreshToken?: string;
    oauthScope?: string;
    oauthToken?: string;
    outboundNetworkConnection?: string;
    password?: string;
    principalType?: ExternalPrincipalType;
    protocol?: AuthenticationProtocol;
    username?: string;
}

export interface NamedCredentialParameter {
    certificate?: string;
    description?: string;
    externalCredential?: string;
    outboundNetworkConnection?: string;
    parameterName: string;
    parameterType: NamedCredentialParamType;
    parameterValue?: string;
    sequenceNumber?: number; // xsd-type: "int"
}

export interface NavigationMenuMetadata extends MetadataInfo {
    container: string;
    containerType: string;
    label: string;
    navigationMenuItem?: Array<NavigationMenuItem>;
}

export interface NetworkMetadata extends MetadataInfo {
    allowInternalUserLogin?: boolean;
    allowMembersToFlag?: boolean;
    allowedExtensions?: string;
    caseCommentEmailTemplate?: string;
    changePasswordTemplate: string;
    chgEmailVerNewTemplate?: string;
    chgEmailVerOldTemplate?: string;
    communityRoles?: CommunityRoles;
    description?: string;
    deviceActEmailTemplate?: string;
    disableReputationRecordConversations?: boolean;
    emailFooterLogo?: string;
    emailFooterText?: string;
    emailSenderAddress: string;
    emailSenderName: string;
    enableApexCDNCaching?: boolean;
    enableCustomVFErrorPageOverrides?: boolean;
    enableDirectMessages?: boolean;
    enableExperienceBundleBasedSnaOverrideEnabled?: boolean;
    enableGuestChatter?: boolean;
    enableGuestFileAccess?: boolean;
    enableGuestMemberVisibility?: boolean;
    enableImageOptimizationCDN?: boolean;
    enableInvitation?: boolean;
    enableKnowledgeable?: boolean;
    enableMemberVisibility?: boolean;
    enableNicknameDisplay?: boolean;
    enablePrivateMessages?: boolean;
    enableReputation?: boolean;
    enableShowAllNetworkSettings?: boolean;
    enableSiteAsContainer?: boolean;
    enableTalkingAboutStats?: boolean;
    enableTopicAssignmentRules?: boolean;
    enableTopicSuggestions?: boolean;
    enableUpDownVote?: boolean;
    feedChannel?: string;
    forgotPasswordTemplate: string;
    gatherCustomerSentimentData?: boolean;
    headlessForgotPasswordTemplate?: string;
    lockoutTemplate?: string;
    logoutUrl?: string;
    maxFileSizeKb?: number; // xsd-type: "int"
    navigationLinkSet?: NavigationLinkSet;
    networkMemberGroups?: NetworkMemberGroup;
    networkPageOverrides?: NetworkPageOverride;
    newSenderAddress?: string;
    picassoSite?: string;
    recommendationAudience?: RecommendationAudience;
    recommendationDefinition?: RecommendationDefinition;
    reputationLevels?: ReputationLevelDefinitions;
    reputationPointsRules?: ReputationPointsRules;
    selfRegMicroBatchSubErrorEmailTemplate?: string;
    selfRegProfile?: string;
    selfRegistration?: boolean;
    sendWelcomeEmail?: boolean;
    site: string;
    siteArchiveStatus?: SitesArchiveStatus;
    status: NetworkStatus;
    tabs: NetworkTabSet;
    urlPathPrefix?: string;
    verificationTemplate?: string;
    welcomeTemplate: string;
}

export interface CommunityRoles {
    customerUserRole?: string;
    employeeUserRole?: string;
    partnerUserRole?: string;
}

export interface NetworkMemberGroup {
    permissionSet?: Array<string>;
    profile?: Array<string>;
}

export interface NetworkPageOverride {
    changePasswordPageOverrideSetting?: NetworkPageOverrideSetting;
    forgotPasswordPageOverrideSetting?: NetworkPageOverrideSetting;
    homePageOverrideSetting?: NetworkPageOverrideSetting;
    loginPageOverrideSetting?: NetworkPageOverrideSetting;
    selfRegProfilePageOverrideSetting?: NetworkPageOverrideSetting;
}

export interface RecommendationAudience {
    recommendationAudienceDetails?: Array<RecommendationAudienceDetail>;
}

export interface RecommendationAudienceDetail {
    audienceCriteriaType?: AudienceCriteriaType;
    audienceCriteriaValue?: string;
    setupName?: string;
}

export interface RecommendationDefinition {
    recommendationDefinitionDetails?: Array<RecommendationDefinitionDetail>;
}

export interface RecommendationDefinitionDetail {
    actionUrl?: string;
    description?: string;
    linkText?: string;
    scheduledRecommendations?: ScheduledRecommendation;
    setupName?: string;
    title?: string;
}

export interface ScheduledRecommendation {
    scheduledRecommendationDetails?: Array<ScheduledRecommendationDetail>;
}

export interface ScheduledRecommendationDetail {
    channel?: RecommendationChannel;
    enabled?: boolean;
    rank?: number; // xsd-type: "int"
    recommendationAudience?: string;
}

export interface ReputationLevelDefinitions {
    level?: Array<ReputationLevel>;
}

export interface ReputationLevel {
    branding?: ReputationBranding;
    label?: string;
    lowerThreshold: number; // xsd-type: "double"
}

export interface ReputationBranding {
    smallImage?: string;
}

export interface ReputationPointsRules {
    pointsRule?: Array<ReputationPointsRule>;
}

export interface ReputationPointsRule {
    eventType: string;
    points: number; // xsd-type: "int"
}

export interface NetworkTabSet {
    customTab?: Array<string>;
    defaultTab: string;
    standardTab?: Array<string>;
}

export interface NotificationTypeConfigMetadata extends MetadataInfo {
    notificationTypeSettings?: Array<NotificationTypeSettings>;
}

export interface NotificationTypeSettings {
    appSettings?: Array<AppSettings>;
    notificationChannels?: NotificationChannels;
    notificationType: string;
}

export interface AppSettings {
    connectedAppName: string;
    enabled?: boolean;
}

export interface NotificationChannels {
    desktopEnabled?: boolean;
    mobileEnabled?: boolean;
    slackEnabled?: boolean;
}

export interface NotificationsSettingsMetadata extends MetadataInfo {
    enableActvityReminderBrowserNotifs?: boolean;
    enableMobileAppPushNotifications?: boolean;
    enableNotifications?: boolean;
}

export interface OauthCustomScopeMetadata extends MetadataInfo {
    assignedTo?: Array<OauthCustomScopeApp>;
    description: string;
    developerName: string;
    isProtected?: boolean;
    isPublic?: boolean;
    masterLabel: string;
}

export interface OauthCustomScopeApp {
    connectedApp: string;
}

export interface OauthOidcSettingsMetadata extends MetadataInfo {
    blockOAuthUnPwFlow?: boolean;
    blockOAuthUsrAgtFlow?: boolean;
    enableHdlessFgtPswFlow?: boolean;
    oAuthCdCrdtFlowEnable?: boolean;
}

export interface ObjectLinkingSettingsMetadata extends MetadataInfo {
    enableObjectLinking?: boolean;
}

export interface OmniChannelSettingsMetadata extends MetadataInfo {
    enableOmniAutoLoginPrompt?: boolean;
    enableOmniChannel?: boolean;
    enableOmniSecondaryRoutingPriority?: boolean;
    enableOmniSkillsRouting?: boolean;
}

export interface OmniDataTransformMetadata extends MetadataInfo {
    active?: boolean;
    assignmentRulesUsed?: boolean;
    deletedOnSuccess?: boolean;
    description?: string;
    errorIgnored?: boolean;
    expectedInputJson?: string;
    expectedInputOtherData?: string;
    expectedInputXml?: string;
    expectedOutputJson?: string;
    expectedOutputOtherData?: string;
    expectedOutputXml?: string;
    fieldLevelSecurityEnabled?: boolean;
    inputParsingClass?: string;
    inputType?: OmniDataTransformInputType;
    name: string;
    namespace?: string;
    nullInputsIncludedInOutput?: boolean;
    omniDataTransformItem?: Array<OmniDataTransformItem>;
    outputParsingClass?: string;
    outputType?: string;
    overrideKey?: string;
    preprocessorClassName?: string;
    previewJsonData?: string;
    previewOtherData?: string;
    previewSourceObjectData?: string;
    previewXmlData?: string;
    processSuperBulk?: boolean;
    requiredPermission?: string;
    responseCacheTtlMinutes?: number; // xsd-type: "double"
    responseCacheType?: string;
    rollbackOnError?: boolean;
    sourceObject?: string;
    sourceObjectDefault?: boolean;
    synchronousProcessThreshold?: number; // xsd-type: "double"
    targetOutputDocumentIdentifier?: string;
    targetOutputFileName?: string;
    type: string;
    uniqueName?: string;
    versionNumber?: number; // xsd-type: "double"
    xmlDeclarationRemoved?: boolean;
    xmlOutputTagsOrder?: string;
}

export interface OmniDataTransformItem {
    defaultValue?: string;
    disabled?: boolean;
    filterDataType?: ODTItemFilterDataType;
    filterGroup?: number; // xsd-type: "double"
    filterOperator?: string;
    filterValue?: string;
    formulaConverted?: string;
    formulaExpression?: string;
    formulaResultPath?: string;
    formulaSequence?: number; // xsd-type: "double"
    globalKey?: string;
    inputFieldName?: string;
    inputObjectName?: string;
    inputObjectQuerySequence?: number; // xsd-type: "double"
    linkedFieldName?: string;
    linkedObjectSequence?: number; // xsd-type: "double"
    lookupByFieldName?: string;
    lookupObjectName?: string;
    lookupReturnedFieldName?: string;
    migrationAttribute?: string;
    migrationCategory?: string;
    migrationGroup?: string;
    migrationKey?: string;
    migrationPattern?: string;
    migrationProcess?: string;
    migrationType?: string;
    migrationValue?: string;
    name: string;
    omniDataTransformation?: string;
    omniDataTransformationId?: string;
    outputCreationSequence?: number; // xsd-type: "double"
    outputFieldFormat?: string;
    outputFieldName?: string;
    outputObjectName?: string;
    requiredForUpsert?: boolean;
    transformValuesMappings?: string;
    upsertKey?: boolean;
}

export interface OmniIntegrationProcedureMetadata extends MetadataInfo {
    customHtmlTemplates?: string;
    customJavaScript?: string;
    description?: string;
    designerCustomizationType?: string;
    elementTypeComponentMapping?: string;
    isActive?: boolean;
    isIntegrationProcedure?: boolean;
    isMetadataCacheDisabled?: boolean;
    isOmniScriptEmbeddable?: boolean;
    isTestProcedure?: boolean;
    isWebCompEnabled?: boolean;
    language: string;
    lastPreviewPage?: string;
    name: string;
    nameSpace?: string;
    omniProcessElements?: Array<OmniProcessElement>;
    omniProcessKey?: string;
    omniProcessType: OmniProcessType;
    overrideKey?: string;
    propertySetConfig?: string;
    requiredPermission?: string;
    responseCacheType?: string;
    subType: string;
    type: string;
    uniqueName: string;
    versionNumber: number; // xsd-type: "double"
    webComponentKey?: string;
}

export interface OmniProcessElement {
    childElements?: Array<OmniProcessElement>;
    description?: string;
    designerCustomizationType?: string;
    embeddedOmniScriptKey?: string;
    isActive?: boolean;
    isOmniScriptEmbeddable?: boolean;
    level?: number; // xsd-type: "double"
    name: string;
    omniProcessVersionNumber?: number; // xsd-type: "double"
    parentElementName?: string;
    parentElementType?: string;
    propertySetConfig?: string;
    questionDevName?: string;
    sequenceNumber?: number; // xsd-type: "double"
    type?: string;
}

export interface OmniScriptMetadata extends MetadataInfo {
    customHtmlTemplates?: string;
    customJavaScript?: string;
    description?: string;
    designerCustomizationType?: string;
    elementTypeComponentMapping?: string;
    isActive?: boolean;
    isIntegrationProcedure?: boolean;
    isMetadataCacheDisabled?: boolean;
    isOmniScriptEmbeddable?: boolean;
    isTestProcedure?: boolean;
    isWebCompEnabled?: boolean;
    language: string;
    lastPreviewPage?: string;
    name: string;
    nameSpace?: string;
    omniProcessElements?: Array<OmniProcessElement>;
    omniProcessKey?: string;
    omniProcessType: OmniProcessType;
    overrideKey?: string;
    propertySetConfig?: string;
    requiredPermission?: string;
    responseCacheType?: string;
    subType: string;
    type: string;
    uniqueName: string;
    versionNumber: number; // xsd-type: "double"
    webComponentKey?: string;
}

export interface OmniSupervisorConfigMetadata extends MetadataInfo {
    isTimelineHidden: boolean;
    masterLabel: string;
    omniSupervisorConfigAction?: Array<OmniSupervisorConfigAction>;
    omniSupervisorConfigGroup?: Array<OmniSupervisorConfigGroup>;
    omniSupervisorConfigProfile?: Array<OmniSupervisorConfigProfile>;
    omniSupervisorConfigQueue?: Array<OmniSupervisorConfigQueue>;
    omniSupervisorConfigSkill?: Array<OmniSupervisorConfigSkill>;
    skillVisibility?: OmniSuperSkillVisibilityType;
}

export interface OmniSupervisorConfigAction {
    actionName: OmniSupervisorActionName;
    actionTab: OmniSupervisorActionTab;
    customActionFlow?: string;
    displayOrder: number; // xsd-type: "int"
}

export interface OmniSupervisorConfigGroup {
    group: string;
}

export interface OmniSupervisorConfigProfile {
    profile: string;
}

export interface OmniSupervisorConfigQueue {
    queue: string;
}

export interface OmniSupervisorConfigSkill {
    skill: string;
}

export interface OmniUiCardMetadata extends MetadataInfo {
    authorName: string;
    clonedFromOmniUiCardKey?: string;
    dataSourceConfig: string;
    description?: string;
    isActive: boolean;
    name: string;
    omniUiCardType: OmniUiCardType;
    overrideKey?: string;
    propertySetConfig: string;
    sampleDataSourceResponse?: string;
    stylingConfiguration?: string;
    versionNumber: string;
}

export interface OpportunityInsightsSettingsMetadata extends MetadataInfo {
    enableOpportunityInsights?: boolean;
}

export interface OpportunityScoreSettingsMetadata extends MetadataInfo {
    enableOpportunityScoring?: boolean;
}

export interface OpportunitySettingsMetadata extends MetadataInfo {
    autoActivateNewReminders?: boolean;
    customizableProductSchedulesEnabled?: boolean;
    doesEnforceStandardOpportunitySaveLogic?: boolean;
    enableExpandedPipelineInspectionSetup?: boolean;
    enableFindSimilarOpportunities?: boolean;
    enableForecastCategoryMetrics?: boolean;
    enableOpportunityFieldHistoryTracking?: boolean;
    enableOpportunityInsightsInMobile?: boolean;
    enableOpportunityTeam?: boolean;
    enablePipelineChangesMetrics?: boolean;
    enablePipelineInspection?: boolean;
    enablePipelineInspectionFlow?: boolean;
    enablePipelineInspectionSingleCategoryRollup?: boolean;
    enableRevenueInsights?: boolean;
    enableServiceCaseInsights?: boolean;
    enableUpdateReminders?: boolean;
    findSimilarOppFilter?: FindSimilarOppFilter;
    oppAmountDealMotionEnabled?: boolean;
    oppCloseDateDealMotionEnabled?: boolean;
    promptToAddProducts?: boolean;
    pushCountEnabled?: boolean;
    simpleOppCreateFromContact?: boolean;
    simpleOppCreateFromEvent?: boolean;
}

export interface FindSimilarOppFilter {
    similarOpportunitiesDisplayColumns?: Array<string>;
    similarOpportunitiesMatchFields?: Array<string>;
}

export interface OrchestrationContextMetadata extends MetadataInfo {
    datasets?: Array<OrchestrationContextDataset>;
    description?: string;
    events?: Array<OrchestrationContextEvent>;
    imageFile: string;
    imageScale: number; // xsd-type: "int"
    masterLabel: string;
    runtimeType: string;
    salesforceObject?: string;
    salesforceObjectPrimaryKey?: string;
}

export interface OrchestrationContextDataset {
    datasetType: string;
    orchestrationDataset: string;
}

export interface OrchestrationContextEvent {
    eventType: string;
    orchestrationEvent: string;
    platformEvent: string;
    platformEventPrimaryKey: string;
}

export interface OrderManagementSettingsMetadata extends MetadataInfo {
    enableB2CIntegration?: boolean;
    enableB2CSelfService?: boolean;
    enableDuplicateManagement?: boolean;
    enableHighScaleOrders?: boolean;
    enableIndividualOrderItemTaxAdjustments?: boolean;
    enableOMAutomation?: boolean;
    enableOrderManagement?: boolean;
    enablePersonAccountsForShoppers?: boolean;
    initOMAutomation?: boolean;
}

export interface OrderSettingsMetadata extends MetadataInfo {
    enableEnhancedCommerceOrders?: boolean;
    enableNegativeQuantity?: boolean;
    enableOptionalPricebook?: boolean;
    enableOrderEvents?: boolean;
    enableOrders: boolean;
    enableReductionOrders?: boolean;
    enableZeroQuantity?: boolean;
}

export interface OutboundNetworkConnectionMetadata extends MetadataInfo {
    connectionType: ExternalConnectionType;
    description?: string;
    isActive: boolean;
    label: string;
    outboundNetworkConnProperties?: Array<OutboundNetworkConnProperty>;
    status: ExternalConnectionStatus;
}

export interface OutboundNetworkConnProperty {
    propertyName: OutboundConnPropertyName;
    propertyValue: string;
}

export interface PackageMetadata extends MetadataInfo {
    apiAccessLevel?: APIAccessLevel;
    description?: string;
    namespacePrefix?: string;
    objectPermissions?: Array<ProfileObjectPermissions>;
    packageType?: string;
    postInstallClass?: string;
    setupWeblink?: string;
    types?: Array<PackageTypeMembers>;
    uninstallClass?: string;
    version: string;
}

export interface ProfileObjectPermissions {
    allowCreate?: boolean;
    allowDelete?: boolean;
    allowEdit?: boolean;
    allowRead?: boolean;
    modifyAllRecords?: boolean;
    object: string;
    viewAllRecords?: boolean;
}

export interface PackageTypeMembers {
    members?: Array<string>;
    name: string;
}

export interface PardotEinsteinSettingsMetadata extends MetadataInfo {
    enableCampaignInsight?: boolean;
    enableEngagementScore?: boolean;
}

export interface PardotSettingsMetadata extends MetadataInfo {
    enableAIEinsteinEngageFreq?: boolean;
    enableAIOptimizedSendTime?: boolean;
    enableB2bmaAppEnabled?: boolean;
    enableEngagementHistoryDashboards?: boolean;
    enableEnhancedProspectCustomFieldsSync?: boolean;
    enablePardotAppV1Enabled?: boolean;
    enablePardotEnabled?: boolean;
    enablePardotObjectSync?: boolean;
    enableProspectActivityDataset?: boolean;
}

export interface ParticipantRoleMetadata extends MetadataInfo {
    defaultAccessLevel: ParticipantRoleAccessLevel;
    isActive?: boolean;
    masterLabel: string;
    parentObject: string;
}

export interface PartyDataModelSettingsMetadata extends MetadataInfo {
    enableAutoSelectIndividualOnMerge?: boolean;
    enableConsentManagement?: boolean;
    enableIndividualAutoCreate?: boolean;
}

export interface PathAssistantMetadata extends MetadataInfo {
    active: boolean;
    entityName: string;
    fieldName: string;
    masterLabel: string;
    pathAssistantSteps?: Array<PathAssistantStep>;
    recordTypeName: string;
}

export interface PathAssistantStep {
    fieldNames?: Array<string>;
    info?: string;
    picklistValueName: string;
}

export interface PathAssistantSettingsMetadata extends MetadataInfo {
    canOverrideAutoPathCollapseWithUserPref?: boolean;
    pathAssistantEnabled?: boolean;
}

export interface PaymentGatewayProviderMetadata extends MetadataInfo {
    apexAdapter?: string;
    comments?: string;
    idempotencySupported: IdempotencySupportStatus;
    masterLabel: string;
}

export interface PaymentsSettingsMetadata extends MetadataInfo {
    enablePayments?: boolean;
}

export interface PermissionSetMetadata extends MetadataInfo {
    applicationVisibilities?: Array<PermissionSetApplicationVisibility>;
    classAccesses?: Array<PermissionSetApexClassAccess>;
    customMetadataTypeAccesses?: Array<PermissionSetCustomMetadataTypeAccess>;
    customPermissions?: Array<PermissionSetCustomPermissions>;
    customSettingAccesses?: Array<PermissionSetCustomSettingAccess>;
    description?: string;
    externalDataSourceAccesses?: Array<PermissionSetExternalDataSourceAccess>;
    fieldPermissions?: Array<PermissionSetFieldPermissions>;
    flowAccesses?: Array<PermissionSetFlowAccess>;
    hasActivationRequired?: boolean;
    label: string;
    license?: string;
    objectPermissions?: Array<PermissionSetObjectPermissions>;
    pageAccesses?: Array<PermissionSetApexPageAccess>;
    recordTypeVisibilities?: Array<PermissionSetRecordTypeVisibility>;
    tabSettings?: Array<PermissionSetTabSetting>;
    userPermissions?: Array<PermissionSetUserPermission>;
}

export interface PermissionSetApplicationVisibility {
    application: string;
    visible: boolean;
}

export interface PermissionSetApexClassAccess {
    apexClass: string;
    enabled: boolean;
}

export interface PermissionSetCustomMetadataTypeAccess {
    enabled: boolean;
    name: string;
}

export interface PermissionSetCustomPermissions {
    enabled: boolean;
    name: string;
}

export interface PermissionSetCustomSettingAccess {
    enabled: boolean;
    name: string;
}

export interface PermissionSetExternalDataSourceAccess {
    enabled: boolean;
    externalDataSource: string;
}

export interface PermissionSetFieldPermissions {
    editable: boolean;
    field: string;
    readable?: boolean;
}

export interface PermissionSetFlowAccess {
    enabled: boolean;
    flow: string;
}

export interface PermissionSetObjectPermissions {
    allowCreate: boolean;
    allowDelete: boolean;
    allowEdit: boolean;
    allowRead: boolean;
    modifyAllRecords: boolean;
    object: string;
    viewAllRecords: boolean;
}

export interface PermissionSetApexPageAccess {
    apexPage: string;
    enabled: boolean;
}

export interface PermissionSetRecordTypeVisibility {
    recordType: string;
    visible: boolean;
}

export interface PermissionSetTabSetting {
    tab: string;
    visibility: PermissionSetTabVisibility;
}

export interface PermissionSetUserPermission {
    enabled: boolean;
    name: string;
}

export interface MutingPermissionSet extends PermissionSetMetadata {
    label: string;
}

export interface PermissionSetGroupMetadata extends MetadataInfo {
    description?: string;
    hasActivationRequired?: boolean;
    label: string;
    mutingPermissionSets?: Array<string>;
    permissionSets?: Array<string>;
    status?: string;
}

export interface PermissionSetLicenseDefinitionMetadata extends MetadataInfo {
    customPermissions?: Array<PermissionSetLicenseDefinitionCustomPermission>;
    isSupplementLicense?: boolean;
    label: string;
    licenseExpirationPolicy: LicenseExpirationPolicy;
    userLicenseRestrictions?: string;
}

export interface PermissionSetLicenseDefinitionCustomPermission {
    name: string;
}

export interface PersonAccountOwnerPowerUserMetadata extends MetadataInfo {
    developerName: string;
    masterLabel: string;
    portalType: string;
    user: string;
}

export interface PicklistSettingsMetadata extends MetadataInfo {
    isPicklistApiNameEditDisabled?: boolean;
}

export interface PlatformCachePartitionMetadata extends MetadataInfo {
    description?: string;
    isDefaultPartition: boolean;
    masterLabel: string;
    platformCachePartitionTypes?: Array<PlatformCachePartitionType>;
}

export interface PlatformCachePartitionType {
    allocatedCapacity: number; // xsd-type: "int"
    allocatedPartnerCapacity: number; // xsd-type: "int"
    allocatedPurchasedCapacity: number; // xsd-type: "int"
    allocatedTrialCapacity: number; // xsd-type: "int"
    cacheType: PlatformCacheType;
}

export interface PlatformEncryptionSettingsMetadata extends MetadataInfo {
    canEncryptManagedPackageFields?: boolean;
    enableDeterministicEncryption?: boolean;
    enableEncryptFieldHistory?: boolean;
    enableEncryptionSearchEnabled?: boolean;
    enableEventBusEncryption?: boolean;
    isMEKForEncryptionRequired?: boolean;
    isUseHighAssuranceKeysRequired?: boolean;
}

export interface PlatformEventChannelMetadata extends MetadataInfo {
    channelType: PlatformEventChannelType;
    label: string;
}

export interface PlatformEventChannelMemberMetadata extends MetadataInfo {
    enrichedFields?: Array<EnrichedField>;
    eventChannel: string;
    filterExpression?: string;
    selectedEntity: string;
}

export interface EnrichedField {
    name: string;
}

export interface PortalMetadata extends MetadataInfo {
    active: boolean;
    admin?: string;
    defaultLanguage?: string;
    description?: string;
    emailSenderAddress: string;
    emailSenderName: string;
    enableSelfCloseCase?: boolean;
    footerDocument?: string;
    forgotPassTemplate?: string;
    headerDocument?: string;
    isSelfRegistrationActivated?: boolean;
    loginHeaderDocument?: string;
    logoDocument?: string;
    logoutUrl?: string;
    newCommentTemplate?: string;
    newPassTemplate?: string;
    newUserTemplate?: string;
    ownerNotifyTemplate?: string;
    selfRegNewUserUrl?: string;
    selfRegUserDefaultProfile?: string;
    selfRegUserDefaultRole?: PortalRoles;
    selfRegUserTemplate?: string;
    showActionConfirmation?: boolean;
    stylesheetDocument?: string;
    type: PortalType;
}

export interface PortalsSettingsMetadata extends MetadataInfo {
    clickjackSSPLoginPage?: boolean;
    redirectPortalLoginToHttps?: boolean;
}

export interface PostTemplateMetadata extends MetadataInfo {
    default?: boolean;
    description?: string;
    fields?: Array<string>;
    label: string;
}

export interface PredictionBuilderSettingsMetadata extends MetadataInfo {
    enablePredictionBuilder?: boolean;
    isPredictionBuilderStarted?: boolean;
}

export interface PresenceDeclineReasonMetadata extends MetadataInfo {
    label: string;
}

export interface PresenceUserConfigMetadata extends MetadataInfo {
    assignments?: PresenceConfigAssignments;
    capacity: number; // xsd-type: "int"
    declineReasons?: Array<string>;
    enableAutoAccept?: boolean;
    enableDecline?: boolean;
    enableDeclineReason?: boolean;
    enableDisconnectSound?: boolean;
    enableRequestSound?: boolean;
    label: string;
    presenceStatusOnDecline?: string;
    presenceStatusOnPushTimeout?: string;
}

export interface PresenceConfigAssignments {
    profiles?: PresenceConfigProfileAssignments;
    users?: PresenceConfigUserAssignments;
}

export interface PresenceConfigProfileAssignments {
    profile?: Array<string>;
}

export interface PresenceConfigUserAssignments {
    user?: Array<string>;
}

export interface PrivacySettingsMetadata extends MetadataInfo {
    authorizationCaptureBrowser?: boolean;
    authorizationCaptureEmail?: boolean;
    authorizationCaptureIp?: boolean;
    authorizationCaptureLocation?: boolean;
    authorizationCustomSharing?: boolean;
    authorizationLockingAndVersioning?: boolean;
    enableConfigurableUserPIIActive?: boolean;
    enableConsentAuditTrail?: boolean;
    enableConsentEventStream?: boolean;
    enableDefaultMetadataValues?: boolean;
}

export interface ProductAttributeSetMetadata extends MetadataInfo {
    description?: string;
    developerName: string;
    masterLabel: string;
    productAttributeSetItems?: Array<ProductAttributeSetItem>;
}

export interface ProductAttributeSetItem {
    field: string;
    sequence: number; // xsd-type: "int"
}

export interface ProductSettingsMetadata extends MetadataInfo {
    enableCascadeActivateToRelatedPrices?: boolean;
    enableMySettings?: boolean;
    enableQuantitySchedule?: boolean;
    enableRevenueSchedule?: boolean;
}

export interface ProductSpecificationTypeDefinitionMetadata extends MetadataInfo {
    developerName: string;
    masterLabel: string;
    recordType: string;
}

export interface ProfileMetadata extends MetadataInfo {
    applicationVisibilities?: Array<ProfileApplicationVisibility>;
    categoryGroupVisibilities?: Array<ProfileCategoryGroupVisibility>;
    classAccesses?: Array<ProfileApexClassAccess>;
    custom?: boolean;
    customMetadataTypeAccesses?: Array<ProfileCustomMetadataTypeAccess>;
    customPermissions?: Array<ProfileCustomPermissions>;
    customSettingAccesses?: Array<ProfileCustomSettingAccess>;
    description?: string;
    externalDataSourceAccesses?: Array<ProfileExternalDataSourceAccess>;
    fieldPermissions?: Array<ProfileFieldLevelSecurity>;
    flowAccesses?: Array<ProfileFlowAccess>;
    layoutAssignments?: Array<ProfileLayoutAssignment>;
    loginFlows?: Array<LoginFlow>;
    loginHours?: ProfileLoginHours;
    loginIpRanges?: Array<ProfileLoginIpRange>;
    objectPermissions?: Array<ProfileObjectPermissions>;
    pageAccesses?: Array<ProfileApexPageAccess>;
    profileActionOverrides?: Array<ProfileActionOverride>;
    recordTypeVisibilities?: Array<ProfileRecordTypeVisibility>;
    tabVisibilities?: Array<ProfileTabVisibility>;
    userLicense?: string;
    userPermissions?: Array<ProfileUserPermission>;
}

export interface ProfileApplicationVisibility {
    application: string;
    default: boolean;
    visible: boolean;
}

export interface ProfileCategoryGroupVisibility {
    dataCategories?: Array<string>;
    dataCategoryGroup: string;
    visibility: CategoryGroupVisibility;
}

export interface ProfileApexClassAccess {
    apexClass: string;
    enabled: boolean;
}

export interface ProfileCustomMetadataTypeAccess {
    enabled: boolean;
    name: string;
}

export interface ProfileCustomPermissions {
    enabled: boolean;
    name: string;
}

export interface ProfileCustomSettingAccess {
    enabled: boolean;
    name: string;
}

export interface ProfileExternalDataSourceAccess {
    enabled: boolean;
    externalDataSource: string;
}

export interface ProfileFieldLevelSecurity {
    editable: boolean;
    field: string;
    readable?: boolean;
}

export interface ProfileFlowAccess {
    enabled: boolean;
    flow: string;
}

export interface ProfileLayoutAssignment {
    layout: string;
    recordType?: string;
}

export interface LoginFlow {
    flow?: string;
    flowType: LoginFlowType;
    friendlyName: string;
    uiLoginFlowType: UiLoginFlowType;
    useLightningRuntime?: boolean;
    vfFlowPage?: string;
    vfFlowPageTitle?: string;
}

export interface ProfileLoginHours {
    fridayEnd?: string;
    fridayStart?: string;
    mondayEnd?: string;
    mondayStart?: string;
    saturdayEnd?: string;
    saturdayStart?: string;
    sundayEnd?: string;
    sundayStart?: string;
    thursdayEnd?: string;
    thursdayStart?: string;
    tuesdayEnd?: string;
    tuesdayStart?: string;
    wednesdayEnd?: string;
    wednesdayStart?: string;
}

export interface ProfileLoginIpRange {
    description?: string;
    endAddress: string;
    startAddress: string;
}

export interface ProfileApexPageAccess {
    apexPage: string;
    enabled: boolean;
}

export interface ProfileRecordTypeVisibility {
    default: boolean;
    personAccountDefault?: boolean;
    recordType: string;
    visible: boolean;
}

export interface ProfileTabVisibility {
    tab: string;
    visibility: TabVisibility;
}

export interface ProfileUserPermission {
    enabled: boolean;
    name: string;
}

export interface ProfilePasswordPolicyMetadata extends MetadataInfo {
    forgotPasswordRedirect?: boolean;
    lockoutInterval: number; // xsd-type: "int"
    maxLoginAttempts: number; // xsd-type: "int"
    minimumPasswordLength: number; // xsd-type: "int"
    minimumPasswordLifetime?: boolean;
    obscure?: boolean;
    passwordComplexity: number; // xsd-type: "int"
    passwordExpiration: number; // xsd-type: "int"
    passwordHistory: number; // xsd-type: "int"
    passwordQuestion: number; // xsd-type: "int"
    profile: string;
}

export interface ProfileSessionSettingMetadata extends MetadataInfo {
    externalCommunityUserIdentityVerif: boolean;
    forceLogout: boolean;
    profile: string;
    requiredSessionLevel?: SessionSecurityLevel;
    sessionPersistence: boolean;
    sessionTimeout: number; // xsd-type: "int"
    sessionTimeoutWarning: boolean;
}

export interface PromptMetadata extends MetadataInfo {
    masterLabel: string;
    promptVersions?: Array<PromptVersion>;
}

export interface PromptVersion {
    actionButtonLabel?: string;
    actionButtonLink?: string;
    body: string;
    customApplication?: string;
    delayDays?: number; // xsd-type: "int"
    description?: string;
    dismissButtonLabel?: string;
    displayPosition?: PromptDisplayPosition;
    displayType: PromptDisplayType;
    elementRelativePosition?: PromptElementRelativePosition;
    endDate?: string; // xsd-type: "date"
    header?: string;
    icon?: string;
    image?: string;
    imageAltText?: string;
    imageLink?: string;
    imageLocation?: PromptImageLocation;
    indexWithIsPublished?: string;
    indexWithoutIsPublished?: string;
    isPublished?: boolean;
    masterLabel: string;
    publishedByUser?: string;
    publishedDate?: string; // xsd-type: "date"
    referenceElementContext?: string;
    shouldDisplayActionButton?: boolean;
    shouldIgnoreGlobalDelay?: boolean;
    startDate?: string; // xsd-type: "date"
    stepNumber?: number; // xsd-type: "int"
    targetAppDeveloperName?: string;
    targetAppNamespacePrefix?: string;
    targetPageKey1?: string;
    targetPageKey2?: string;
    targetPageKey3?: string;
    targetPageKey4?: string;
    targetPageType?: string;
    targetRecordType?: string;
    themeColor?: PromptThemeColor;
    themeSaturation?: PromptThemeSaturation;
    timesToDisplay?: number; // xsd-type: "int"
    title: string;
    uiFormulaRule?: UiFormulaRule;
    userAccess?: PromptUserAccess;
    userProfileAccess?: PromptUserProfileAccess;
    versionNumber: number; // xsd-type: "int"
    videoLink?: string;
}

export interface QueueMetadata extends MetadataInfo {
    doesSendEmailToMembers?: boolean;
    email?: string;
    name: string;
    queueMembers?: QueueMembers;
    queueRoutingConfig?: string;
    queueSobject?: Array<QueueSobject>;
}

export interface QueueMembers {
    publicGroups?: PublicGroups;
    roleAndSubordinates?: RoleAndSubordinates;
    roleAndSubordinatesInternal?: RoleAndSubordinatesInternal;
    roles?: Roles;
    users?: Users;
}

export interface PublicGroups {
    publicGroup?: Array<string>;
}

export interface RoleAndSubordinates {
    roleAndSubordinate?: Array<string>;
}

export interface RoleAndSubordinatesInternal {
    roleAndSubordinateInternal?: Array<string>;
}

export interface Roles {
    role?: Array<string>;
}

export interface Users {
    user?: Array<string>;
}

export interface QueueSobject {
    sobjectType: string;
}

export interface QueueRoutingConfigMetadata extends MetadataInfo {
    capacityPercentage?: number; // xsd-type: "double"
    capacityWeight?: number; // xsd-type: "double"
    dropAdditionalSkillsTimeout?: number; // xsd-type: "int"
    isAttributeBased?: boolean;
    label: string;
    pushTimeout?: number; // xsd-type: "int"
    queueOverflowAssignee?: string;
    routingModel: RoutingModel;
    routingPriority: number; // xsd-type: "int"
    skills?: Array<QueueRoutingConfigSkill>;
    userOverflowAssignee?: string;
}

export interface QueueRoutingConfigSkill {
    skill?: string;
}

export interface QuickActionMetadata extends MetadataInfo {
    actionSubtype?: ActionSubtype;
    canvas?: string;
    description?: string;
    fieldOverrides?: Array<FieldOverride>;
    flowDefinition?: string;
    height?: number; // xsd-type: "int"
    icon?: string;
    isProtected?: boolean;
    label?: string;
    lightningComponent?: string;
    lightningWebComponent?: string;
    optionsCreateFeedItem: boolean;
    page?: string;
    quickActionLayout?: QuickActionLayout;
    quickActionSendEmailOptions?: QuickActionSendEmailOptions;
    standardLabel?: QuickActionLabel;
    successMessage?: string;
    targetObject?: string;
    targetParentField?: string;
    targetRecordType?: string;
    type: QuickActionType;
    width?: number; // xsd-type: "int"
}

export interface FieldOverride {
    field: string;
    formula?: string;
    literalValue?: string;
}

export interface QuickActionLayout {
    layoutSectionStyle: LayoutSectionStyle;
    quickActionLayoutColumns?: Array<QuickActionLayoutColumn>;
}

export interface QuickActionLayoutColumn {
    quickActionLayoutItems?: Array<QuickActionLayoutItem>;
}

export interface QuickActionLayoutItem {
    emptySpace?: boolean;
    field?: string;
    uiBehavior?: UiBehavior;
}

export interface QuickActionSendEmailOptions {
    defaultEmailTemplateName?: string;
    ignoreDefaultEmailTemplateSubject: boolean;
}

export interface QuickTextSettingsMetadata extends MetadataInfo {
    hideQuickTextUiInLtng?: boolean;
    lightningQuickTextEnabled?: boolean;
    quickTextsInFolders?: boolean;
}

export interface QuoteSettingsMetadata extends MetadataInfo {
    enableQuote: boolean;
    enableQuotesWithoutOppEnabled?: boolean;
}

export interface RealTimeEventSettingsMetadata extends MetadataInfo {
    realTimeEvents?: Array<RealTimeEvent>;
}

export interface RealTimeEvent {
    entityName: string;
    isEnabled: boolean;
}

export interface RecommendationBuilderSettingsMetadata extends MetadataInfo {
    enableErbEnabledPref?: boolean;
    enableErbStartedPref?: boolean;
}

export interface RecommendationStrategyMetadata extends MetadataInfo {
    actionContext?: Array<StrategyAction>;
    contextRecordType?: string;
    description?: string;
    filter?: Array<StrategyNodeFilter>;
    if?: Array<StrategyNodeIf>;
    invocableAction?: Array<StrategyNodeInvocableAction>;
    isTemplate?: boolean;
    label: string;
    map?: Array<StrategyNodeMap>;
    mutuallyExclusive?: Array<StrategyNodeUnionBase>;
    onBehalfOfExpression?: string;
    recommendationLimit?: Array<StrategyNodeRecommendationLimit>;
    recommendationLoad?: Array<StrategyNodeRecommendationLoad>;
    sort?: Array<StrategyNodeSort>;
    union?: Array<StrategyNodeUnionBase>;
}

export interface StrategyAction {
    action: string;
    argument?: Array<StrategyActionArg>;
    description?: string;
    label?: string;
    name: string;
    type: InvocableActionType;
}

export interface StrategyActionArg {
    name: string;
    value: string;
}

export interface StrategyNodeFilter extends StrategyNodeUnionBase {
    expression: string;
}

export interface StrategyNodeUnionBase extends StrategyNodeBase {
    limit?: number; // xsd-type: "int"
}

export interface StrategyNodeBase {
    childNode?: Array<string>;
    description?: string;
    label?: string;
    name: string;
}

export interface StrategyNodeAiLoad extends StrategyNodeUnionBase {
    acceptanceLabel: string;
    actionReference: string;
    descriptionField: string;
    recommendationDefinitionDevName: string;
    rejectionLabel?: string;
    titleField: string;
}

export interface StrategyNodeIf extends StrategyNodeUnionBase {
    childNodeExpression?: Array<IfExpression>;
    onlyFirstMatch?: boolean;
}

export interface IfExpression {
    childName: string;
    expression: string;
}

export interface StrategyNodeInvocableAction extends StrategyNodeUnionBase {
    action: string;
    argument?: Array<StrategyNodeInvocableActionArg>;
    isGenerator: boolean;
    type: InvocableActionType;
}

export interface StrategyNodeInvocableActionArg {
    name: string;
    value: string;
}

export interface StrategyNodeMap extends StrategyNodeUnionBase {
    mapExpression?: Array<MapExpression>;
}

export interface MapExpression {
    expression: string;
    name: string;
    type?: string;
}

export interface StrategyNodeRecommendationLimit extends StrategyNodeUnionBase {
    filterMode?: Array<StrategyReactionType>;
    lookbackDuration?: number; // xsd-type: "int"
    maxRecommendationCount?: number; // xsd-type: "int"
}

export interface StrategyNodeRecommendationLoad extends StrategyNodeUnionBase {
    condition?: Array<RecommendationLoadCondition>;
    conditionLogic?: string;
    object: string;
    sortField?: Array<StrategyNodeSortField>;
}

export interface RecommendationLoadCondition {
    field: string;
    operator: RecommendationConditionOperator;
    value: RecommendationConditionValue;
}

export interface RecommendationConditionValue {
    type: RecommendationConditionValueType;
    value?: string;
}

export interface StrategyNodeSortField {
    name: string;
    nullsFirst?: boolean;
    order?: SortOrder;
}

export interface StrategyNodeSort extends StrategyNodeUnionBase {
    field?: Array<StrategyNodeSortField>;
}

export interface RecordActionDeploymentMetadata extends MetadataInfo {
    channelConfigurations?: Array<RecordActionDeploymentChannel>;
    componentName?: ComponentName;
    deploymentContexts?: Array<RecordActionDeploymentContext>;
    hasGuidedActions?: boolean;
    hasOmniscripts?: boolean;
    hasRecommendations?: boolean;
    masterLabel: string;
    recommendation?: RecordActionRecommendation;
    selectableItems?: Array<RecordActionSelectableItem>;
}

export interface RecordActionDeploymentChannel {
    channel: ChannelSource;
    channelItems?: Array<RecordActionDefaultItem>;
    isAutopopEnabled?: boolean;
}

export interface RecordActionDefaultItem {
    action: string;
    isMandatory?: boolean;
    isUiRemoveHidden?: boolean;
    pinned: PinnedAction;
    position: number; // xsd-type: "int"
    type: RecordActionType;
}

export interface RecordActionDeploymentContext {
    entityName: string;
    recommendationStrategy?: string;
}

export interface RecordActionRecommendation {
    defaultStrategy?: string;
    hasDescription: boolean;
    hasImage: boolean;
    hasRejectAction: boolean;
    hasTitle: boolean;
    maxDisplayRecommendations: number; // xsd-type: "int"
    shouldLaunchActionOnReject: boolean;
}

export interface RecordActionSelectableItem {
    action: string;
    frequentActionSequenceNbr?: number; // xsd-type: "int"
    isFrequentAction?: boolean;
    type: RecordActionType;
}

export interface RecordAlertCategoryMetadata extends MetadataInfo {
    description?: string;
    masterLabel: string;
    severity?: string;
}

export interface RecordPageSettingsMetadata extends MetadataInfo {
    enableActivityRelatedList?: boolean;
    enableFullRecordView?: boolean;
}

export interface RedirectWhitelistUrlMetadata extends MetadataInfo {
    url: string;
}

export interface ReferencedDashboardMetadata extends MetadataInfo {
    application: string;
    description?: string;
    embedUrl: string;
    masterLabel: string;
    templateAssetSourceName?: string;
    visibility: string;
}

export interface RelationshipGraphDefinitionMetadata extends MetadataInfo {
    isActive: boolean;
    isTemplate: boolean;
    masterLabel: string;
    relationshipGraphDefVersions?: Array<RelationshipGraphDefVersion>;
}

export interface RelationshipGraphDefVersion {
    graphDefinition: string;
    graphType: string;
}

export interface RemoteSiteSettingMetadata extends MetadataInfo {
    description?: string;
    disableProtocolSecurity: boolean;
    isActive: boolean;
    url: string;
}

export interface ReportMetadata extends MetadataInfo {
    aggregates?: Array<ReportAggregate>;
    block?: Array<ReportMetadata>;
    blockInfo?: ReportBlockInfo;
    buckets?: Array<ReportBucketField>;
    chart?: ReportChart;
    colorRanges?: Array<ReportColorRange>;
    columns?: Array<ReportColumn>;
    crossFilters?: Array<ReportCrossFilter>;
    currency?: CurrencyIsoCode;
    customDetailFormulas?: Array<ReportCustomDetailFormula>;
    dataCategoryFilters?: Array<ReportDataCategoryFilter>;
    description?: string;
    division?: string;
    filter?: ReportFilter;
    folderName?: string;
    format: ReportFormat;
    formattingRules?: Array<ReportFormattingRule>;
    groupingsAcross?: Array<ReportGrouping>;
    groupingsDown?: Array<ReportGrouping>;
    historicalSelector?: ReportHistoricalSelector;
    name: string;
    numSubscriptions?: number; // xsd-type: "int"
    params?: Array<ReportParam>;
    reportType: string;
    reportTypeApiName?: string;
    roleHierarchyFilter?: string;
    rowLimit?: number; // xsd-type: "int"
    scope?: string;
    showCurrentDate?: boolean;
    showDetails?: boolean;
    showGrandTotal?: boolean;
    showSubTotals?: boolean;
    sortColumn?: string;
    sortOrder?: SortOrder;
    territoryHierarchyFilter?: string;
    timeFrameFilter?: ReportTimeFrameFilter;
    userFilter?: string;
}

export interface ReportAggregate {
    acrossGroupingContext?: string;
    calculatedFormula: string;
    datatype: ReportAggregateDatatype;
    description?: string;
    developerName: string;
    downGroupingContext?: string;
    isActive: boolean;
    isCrossBlock?: boolean;
    masterLabel: string;
    reportType?: string;
    scale?: number; // xsd-type: "int"
}

export interface ReportBlockInfo {
    aggregateReferences?: Array<ReportAggregateReference>;
    blockId: string;
    joinTable: string;
}

export interface ReportAggregateReference {
    aggregate: string;
}

export interface ReportBucketField {
    bucketType: ReportBucketFieldType;
    developerName: string;
    masterLabel: string;
    nullTreatment?: ReportFormulaNullTreatment;
    otherBucketLabel?: string;
    sourceColumnName: string;
    useOther?: boolean;
    values?: Array<ReportBucketFieldValue>;
}

export interface ReportBucketFieldValue {
    sourceValues?: Array<ReportBucketFieldSourceValue>;
    value: string;
}

export interface ReportBucketFieldSourceValue {
    from?: string;
    sourceValue?: string;
    to?: string;
}

export interface ReportChart {
    backgroundColor1?: string;
    backgroundColor2?: string;
    backgroundFadeDir?: ChartBackgroundDirection;
    chartSummaries?: Array<ChartSummary>;
    chartType: ChartType;
    enableHoverLabels?: boolean;
    expandOthers?: boolean;
    groupingColumn?: string;
    legendPosition?: ChartLegendPosition;
    location?: ChartPosition;
    secondaryGroupingColumn?: string;
    showAxisLabels?: boolean;
    showPercentage?: boolean;
    showTotal?: boolean;
    showValues?: boolean;
    size?: ReportChartSize;
    summaryAxisManualRangeEnd?: number; // xsd-type: "double"
    summaryAxisManualRangeStart?: number; // xsd-type: "double"
    summaryAxisRange?: ChartRangeType;
    textColor?: string;
    textSize?: number; // xsd-type: "int"
    title?: string;
    titleColor?: string;
    titleSize?: number; // xsd-type: "int"
}

export interface ReportColorRange {
    aggregate?: ReportSummaryType;
    columnName: string;
    highBreakpoint?: number; // xsd-type: "double"
    highColor: string;
    lowBreakpoint?: number; // xsd-type: "double"
    lowColor: string;
    midColor: string;
}

export interface ReportColumn {
    aggregateTypes?: Array<ReportSummaryType>;
    field: string;
    reverseColors?: boolean;
    showChanges?: boolean;
}

export interface ReportCrossFilter {
    criteriaItems?: Array<ReportFilterItem>;
    operation: ObjectFilterOperator;
    primaryTableColumn: string;
    relatedTable: string;
    relatedTableJoinColumn: string;
}

export interface ReportFilterItem {
    column: string;
    columnToColumn?: boolean;
    isUnlocked?: boolean;
    operator: FilterOperation;
    snapshot?: string;
    value?: string;
}

export interface ReportCustomDetailFormula {
    calculatedFormula: string;
    dataType: string;
    description?: string;
    developerName: string;
    label: string;
    scale: number; // xsd-type: "int"
}

export interface ReportDataCategoryFilter {
    dataCategory: string;
    dataCategoryGroup: string;
    operator: DataCategoryFilterOperation;
}

export interface ReportFilter {
    booleanFilter?: string;
    criteriaItems?: Array<ReportFilterItem>;
    language?: Language;
}

export interface ReportFormattingRule {
    aggregate?: ReportSummaryType;
    columnName: string;
    values?: Array<ReportFormattingRuleValue>;
}

export interface ReportFormattingRuleValue {
    backgroundColor?: string;
    rangeUpperBound?: number; // xsd-type: "double"
}

export interface ReportGrouping {
    aggregateType?: ReportAggrType;
    dateGranularity?: UserDateGranularity;
    field: string;
    sortByName?: string;
    sortOrder: SortOrder;
    sortType?: ReportSortType;
}

export interface ReportHistoricalSelector {
    snapshot?: Array<string>;
}

export interface ReportParam {
    name: string;
    value: string;
}

export interface ReportTimeFrameFilter {
    dateColumn: string;
    endDate?: string; // xsd-type: "date"
    interval: UserDateInterval;
    startDate?: string; // xsd-type: "date"
}

export interface ReportTypeMetadata extends MetadataInfo {
    autogenerated?: boolean;
    baseObject: string;
    category: ReportTypeCategory;
    deployed: boolean;
    description?: string;
    join?: ObjectRelationship;
    label: string;
    sections?: Array<ReportLayoutSection>;
}

export interface ObjectRelationship {
    join?: ObjectRelationship;
    outerJoin: boolean;
    relationship: string;
}

export interface ReportLayoutSection {
    columns?: Array<ReportTypeColumn>;
    masterLabel: string;
}

export interface ReportTypeColumn {
    checkedByDefault: boolean;
    displayNameOverride?: string;
    field: string;
    table: string;
}

export interface RestrictionRuleMetadata extends MetadataInfo {
    active: boolean;
    description?: string;
    enforcementType: EnforcementType;
    masterLabel: string;
    recordFilter: string;
    targetEntity: string;
    userCriteria: string;
    version: number; // xsd-type: "int"
}

export interface RetailExecutionSettingsMetadata extends MetadataInfo {
    enableProductHierarchy?: boolean;
    enableRetailExecution?: boolean;
    enableVisitSharing?: boolean;
}

export interface RoleOrTerritoryMetadata extends MetadataInfo {
    caseAccessLevel?: string;
    contactAccessLevel?: string;
    description?: string;
    mayForecastManagerShare?: boolean;
    name: string;
    opportunityAccessLevel?: string;
}

export interface Role extends RoleOrTerritoryMetadata {
    parentRole?: string;
}

export interface Territory extends RoleOrTerritoryMetadata {
    accountAccessLevel?: string;
    parentTerritory?: string;
}

export interface SalesWorkQueueSettingsMetadata extends MetadataInfo {
    featureName: string;
    targetEntity: string;
    targetField: string;
}

export interface SamlSsoConfigMetadata extends MetadataInfo {
    attributeName?: string;
    attributeNameIdFormat?: string;
    decryptionCertificate?: string;
    errorUrl?: string;
    executionUserId?: string;
    identityLocation: SamlIdentityLocationType;
    identityMapping: SamlIdentityType;
    issuer: string;
    loginUrl?: string;
    logoutUrl?: string;
    name: string;
    oauthTokenEndpoint?: string;
    redirectBinding?: boolean;
    requestSignatureMethod?: string;
    requestSigningCertId?: string;
    salesforceLoginUrl?: string;
    samlEntityId: string;
    samlJitHandlerId?: string;
    samlVersion: SamlType;
    singleLogoutBinding?: SamlSpSLOBinding;
    singleLogoutUrl?: string;
    useConfigRequestMethod?: boolean;
    useSameDigestAlgoForSigning?: boolean;
    userProvisioning?: boolean;
    validationCert: string;
}

export interface SchemaSettingsMetadata extends MetadataInfo {
    enableAdvancedCMTSecurity?: boolean;
    enableAdvancedCSSecurity?: boolean;
    enableListCustomSettingCreation?: boolean;
    enableSOSLOnCustomSettings?: boolean;
}

export interface SearchCustomizationMetadata extends MetadataInfo {
    isProtected?: boolean;
    masterLabel: string;
}

export interface SearchSettingsMetadata extends MetadataInfo {
    documentContentSearchEnabled: boolean;
    enableAdvancedSearchInAlohaSidebar?: boolean;
    enableEinsteinSearchAssistantDialog?: boolean;
    enableEinsteinSearchEs4kPilot?: boolean;
    enableEinsteinSearchNLSFilters?: boolean;
    enableEinsteinSearchNaturalLanguage?: boolean;
    enableEinsteinSearchPersonalization?: boolean;
    enableEinsteinSearchQA?: boolean;
    enablePersonalTagging?: boolean;
    enablePublicTagging?: boolean;
    enableQuerySuggestionPigOn?: boolean;
    enableSalesforceGeneratedSynonyms?: boolean;
    enableSearchTermHistory?: boolean;
    enableSetupSearch?: boolean;
    enableSuggestArticlesLinksOnly?: boolean;
    enableUseDefaultSearchEntity?: boolean;
    optimizeSearchForCJKEnabled: boolean;
    recentlyViewedUsersForBlankLookupEnabled: boolean;
    searchSettingsByObject: SearchSettingsByObject;
    sidebarAutoCompleteEnabled: boolean;
    sidebarDropDownListEnabled: boolean;
    sidebarLimitToItemsIOwnCheckboxEnabled: boolean;
    singleSearchResultShortcutEnabled: boolean;
    spellCorrectKnowledgeSearchEnabled: boolean;
}

export interface SearchSettingsByObject {
    searchSettingsByObject?: Array<ObjectSearchSetting>;
}

export interface ObjectSearchSetting {
    enhancedLookupEnabled: boolean;
    lookupAutoCompleteEnabled: boolean;
    name: string;
    resultsPerPageCount: number; // xsd-type: "int"
}

export interface SecuritySettingsMetadata extends MetadataInfo {
    canUsersGrantLoginAccess?: boolean;
    enableAdminLoginAsAnyUser?: boolean;
    enableAuditFieldsInactiveOwner?: boolean;
    enableAuraSecureEvalPref?: boolean;
    enableCoepHeader?: boolean;
    enableCoopHeader?: boolean;
    enableRequireHttpsConnection?: boolean;
    networkAccess?: NetworkAccess;
    passwordPolicies?: PasswordPolicies;
    redirectBlockModeEnabled?: boolean;
    sessionSettings?: SessionSettings;
    singleSignOnSettings?: SingleSignOnSettings;
}

export interface NetworkAccess {
    ipRanges?: Array<IpRange>;
}

export interface IpRange {
    description?: string;
    end?: string;
    start?: string;
}

export interface PasswordPolicies {
    apiOnlyUserHomePageURL?: string;
    complexity?: Complexity;
    expiration?: Expiration;
    historyRestriction?: string;
    lockoutInterval?: LockoutInterval;
    maxLoginAttempts?: MaxLoginAttempts;
    minimumPasswordLength?: string;
    minimumPasswordLifetime?: boolean;
    obscureSecretAnswer?: boolean;
    passwordAssistanceMessage?: string;
    passwordAssistanceURL?: string;
    questionRestriction?: QuestionRestriction;
}

export interface SessionSettings {
    allowUserAuthenticationByCertificate?: boolean;
    allowUserCertBasedAuthenticationWithOcspValidation?: boolean;
    canConfirmEmailChangeInLightningCommunities?: boolean;
    canConfirmIdentityBySmsOnly?: boolean;
    disableTimeoutWarning?: boolean;
    enableBuiltInAuthenticator?: boolean;
    enableCSPOnEmail?: boolean;
    enableCSRFOnGet?: boolean;
    enableCSRFOnPost?: boolean;
    enableCacheAndAutocomplete?: boolean;
    enableClickjackNonsetupSFDC?: boolean;
    enableClickjackNonsetupUser?: boolean;
    enableClickjackNonsetupUserHeaderless?: boolean;
    enableClickjackSetup?: boolean;
    enableCoepHeader?: boolean;
    enableContentSniffingProtection?: boolean;
    enableCoopHeader?: boolean;
    enableLightningLogin?: boolean;
    enableLightningLoginOnlyWithUserPerm?: boolean;
    enableMFADirectUILoginOptIn?: boolean;
    enableOauthCorsPolicy?: boolean;
    enablePostForSessions?: boolean;
    enableSMSIdentity?: boolean;
    enableU2F?: boolean;
    enableUpgradeInsecureRequests?: boolean;
    enableXssProtection?: boolean;
    enforceIpRangesEveryRequest?: boolean;
    enforceUserDeviceRevoked?: boolean;
    forceLogoutOnSessionTimeout?: boolean;
    forceRelogin?: boolean;
    hasRetainedLoginHints?: boolean;
    hasUserSwitching?: boolean;
    hstsOnForcecomSites?: boolean;
    identityConfirmationOnEmailChange?: boolean;
    identityConfirmationOnTwoFactorRegistrationEnabled?: boolean;
    lockSessionsToDomain?: boolean;
    lockSessionsToIp?: boolean;
    lockerServiceAPIVersion?: string;
    lockerServiceCSP?: boolean;
    lockerServiceNext?: boolean;
    lockerServiceNextControl?: boolean;
    logoutURL?: string;
    redirectBlockModeEnabled?: boolean;
    redirectionWarning?: boolean;
    referrerPolicy?: boolean;
    requireHttpOnly?: boolean;
    requireHttps?: boolean;
    sessionTimeout?: SessionTimeout;
    sidToken3rdPartyAuraApp?: boolean;
    useLocalStorageForLogoutUrl?: boolean;
}

export interface SingleSignOnSettings {
    enableCaseInsensitiveFederationID?: boolean;
    enableForceDelegatedCallout?: boolean;
    enableMultipleSamlConfigs?: boolean;
    enableSamlJitProvisioning?: boolean;
    enableSamlLogin?: boolean;
    isLoginWithSalesforceCredentialsDisabled?: boolean;
}

export interface ServiceAISetupDefinitionMetadata extends MetadataInfo {
    appSourceType: ApplicationSourceType;
    name: string;
    setupStatus: ServiceAISetupDefStatus;
    supportedLanguages?: string;
}

export interface ServiceAISetupFieldMetadata extends MetadataInfo {
    entity: string;
    field: string;
    fieldMappingType: ServiceAISetupFieldType;
    fieldPosition: number; // xsd-type: "int"
    name: string;
    setupDefinition: string;
}

export interface ServiceChannelMetadata extends MetadataInfo {
    doesMinimizeWidgetOnAccept?: boolean;
    hasAutoAcceptEnabled?: boolean;
    interactionComponent?: string;
    label: string;
    relatedEntityType: string;
    secondaryRoutingPriorityField?: string;
    serviceChannelFieldPriorities?: Array<ServiceChannelFieldPriority>;
}

export interface ServiceChannelFieldPriority {
    priority: number; // xsd-type: "int"
    value: string;
}

export interface ServiceCloudVoiceSettingsMetadata extends MetadataInfo {
    enableAmazonQueueManagement?: boolean;
    enableDefaultChannelForSCV?: boolean;
    enableEndUserForSCV?: boolean;
    enableOmniCapacityForSCV?: boolean;
    enablePTQueueManagement?: boolean;
    enableSCVBYOT?: boolean;
    enableSCVExternalTelephony?: boolean;
    enableServiceCloudVoice?: boolean;
    enableVoiceInGovCloudOptIn?: boolean;
}

export interface ServicePresenceStatusMetadata extends MetadataInfo {
    channels?: ServiceChannelStatus;
    label: string;
}

export interface ServiceChannelStatus {
    channel?: Array<string>;
}

export interface ServiceSetupAssistantSettingsMetadata extends MetadataInfo {
    enableServiceSetupAssistant?: boolean;
}

export interface SharingBaseRuleMetadata extends MetadataInfo {
    accessLevel: string;
    accountSettings?: AccountSharingRuleSettings;
    description?: string;
    label: string;
    sharedTo: SharedTo;
}

export interface AccountSharingRuleSettings {
    caseAccessLevel: string;
    contactAccessLevel: string;
    opportunityAccessLevel: string;
}

export interface SharingCriteriaRule extends SharingBaseRuleMetadata {
    booleanFilter?: string;
    criteriaItems?: Array<FilterItem>;
    includeRecordsOwnedByAll: boolean;
}

export interface SharingGuestRule extends SharingBaseRuleMetadata {
    booleanFilter?: string;
    criteriaItems?: Array<FilterItem>;
    includeHVUOwnedRecords: boolean;
}

export interface SharingOwnerRule extends SharingBaseRuleMetadata {
    sharedFrom: SharedTo;
}

export interface SharingRulesMetadata extends MetadataInfo {
    sharingCriteriaRules?: Array<SharingCriteriaRule>;
    sharingGuestRules?: Array<SharingGuestRule>;
    sharingOwnerRules?: Array<SharingOwnerRule>;
    sharingTerritoryRules?: Array<SharingOwnerRule>;
}

export interface SharingSetMetadata extends MetadataInfo {
    accessMappings?: Array<AccessMapping>;
    description?: string;
    name: string;
    profiles?: Array<string>;
}

export interface AccessMapping {
    accessLevel: string;
    object: string;
    objectField: string;
    userField: string;
}

export interface SharingSettingsMetadata extends MetadataInfo {
    deferGroupMembership?: boolean;
    deferSharingRules?: boolean;
    enableAccountRoleOptimization?: boolean;
    enableAssetSharing?: boolean;
    enableCommunityUserVisibility?: boolean;
    enableExternalSharingModel?: boolean;
    enableManagerGroups?: boolean;
    enableManualUserRecordSharing?: boolean;
    enablePartnerSuperUserAccess?: boolean;
    enablePortalUserCaseSharing?: boolean;
    enablePortalUserVisibility?: boolean;
    enableRemoveTMGroupMembership?: boolean;
    enableRestrictAccessLookupRecords?: boolean;
    enableSecureGuestAccess?: boolean;
    enableShareObjectReportTypes?: boolean;
    enableStandardReportVisibility?: boolean;
    enableTerritoryForecastManager?: boolean;
}

export interface SiteSettingsMetadata extends MetadataInfo {
    enableEnhancedSitesAndContentPlatform?: boolean;
    enableProxyLoginICHeader?: boolean;
    enableSitesRecordReassignOrgPref?: boolean;
    enableTopicsInSites?: boolean;
}

export interface SkillMetadata extends MetadataInfo {
    assignments?: SkillAssignments;
    description?: string;
    label: string;
}

export interface SkillAssignments {
    profiles?: SkillProfileAssignments;
    users?: SkillUserAssignments;
}

export interface SkillProfileAssignments {
    profile?: Array<string>;
}

export interface SkillUserAssignments {
    user?: Array<string>;
}

export interface SocialCustomerServiceSettingsMetadata extends MetadataInfo {
    caseSubjectOption: CaseSubjectOption;
    enableAllFBResponseAccounts?: boolean;
    enableInboundProcessingConcurrency?: boolean;
    enableSocialApprovals?: boolean;
    enableSocialCaseAssignmentRules?: boolean;
    enableSocialCustomerService?: boolean;
    enableSocialPersonaHistoryTracking?: boolean;
    enableSocialPostHistoryTracking?: boolean;
    enableSocialReceiveParentPost?: boolean;
}

export interface SocialProfileSettingsMetadata extends MetadataInfo {
    enableSocialProfiles?: boolean;
    isFacebookSocialProfilesDisabled?: boolean;
    isLinkedInSocialProfilesDisabled?: boolean;
    isTwitterSocialProfilesDisabled?: boolean;
    isYouTubeSocialProfilesDisabled?: boolean;
}

export interface StandardValueSetMetadata extends MetadataInfo {
    groupingStringEnum?: string;
    sorted: boolean;
    standardValue?: Array<StandardValue>;
}

export interface StandardValueSetTranslationMetadata extends MetadataInfo {
    valueTranslation?: Array<ValueTranslation>;
}

export interface SubscriptionManagementSettingsMetadata extends MetadataInfo {
    enableConvertNegativeInvoiceLinesToCreditMemoAndApply?: boolean;
    enablePaymentScheduleAutomation?: boolean;
    enableRefundAutomation?: boolean;
    enableSubscriptionManagement?: boolean;
}

export interface SurveySettingsMetadata extends MetadataInfo {
    enableIndustriesCxmEnabled?: boolean;
    enableSurvey?: boolean;
    enableSurveyOwnerCanManageResponse?: boolean;
}

export interface SvcCatalogCategoryMetadata extends MetadataInfo {
    image?: string;
    isActive?: boolean;
    isProtected?: boolean;
    masterLabel: string;
    parentCategory?: string;
    sortOrder?: number; // xsd-type: "int"
}

export interface SvcCatalogFulfillmentFlowMetadata extends MetadataInfo {
    description: string;
    flow: string;
    icon?: string;
    isProtected?: boolean;
    items?: Array<SvcCatalogFulfillFlowItem>;
    masterLabel: string;
}

export interface SvcCatalogFulfillFlowItem {
    catalogInputVariable: string;
    displayType?: PropertyDisplayType;
    fieldDefinition?: string;
    fieldLookupDomain?: string;
    isAdditionalQuestionsInputVariable?: boolean;
    isRequired?: boolean;
    lookupDomainFieldType?: string;
    masterLabel: string;
    objectLookupDomain?: string;
}

export interface SynonymDictionaryMetadata extends MetadataInfo {
    groups?: Array<SynonymGroup>;
    isProtected?: boolean;
    label: string;
}

export interface SystemNotificationSettingsMetadata extends MetadataInfo {
    disableDowntimeNotifications?: boolean;
    disableMaintenanceNotifications?: boolean;
}

export interface Territory2Metadata extends MetadataInfo {
    accountAccessLevel?: string;
    caseAccessLevel?: string;
    contactAccessLevel?: string;
    customFields?: Array<FieldValue>;
    description?: string;
    name: string;
    objectAccessLevels?: Array<Territory2AccessLevel>;
    opportunityAccessLevel?: string;
    parentTerritory?: string;
    ruleAssociations?: Array<Territory2RuleAssociation>;
    territory2Type: string;
}

export interface FieldValue {
    name: string;
    value?: unknown | null; // xsd-type: "anyType"
}

export interface Territory2AccessLevel {
    accessLevel: string;
    objectType: string;
}

export interface Territory2RuleAssociation {
    inherited: boolean;
    ruleName: string;
}

export interface Territory2ModelMetadata extends MetadataInfo {
    customFields?: Array<FieldValue>;
    description?: string;
    name: string;
}

export interface Territory2RuleMetadata extends MetadataInfo {
    active: boolean;
    booleanFilter?: string;
    name: string;
    objectType: string;
    ruleItems?: Array<Territory2RuleItem>;
}

export interface Territory2RuleItem {
    field: string;
    operation: FilterOperation;
    value?: string;
}

export interface Territory2SettingsMetadata extends MetadataInfo {
    defaultAccountAccessLevel?: string;
    defaultCaseAccessLevel?: string;
    defaultContactAccessLevel?: string;
    defaultOpportunityAccessLevel?: string;
    enableTerritoryManagement2?: boolean;
    opportunityFilterSettings?: Territory2SettingsOpportunityFilter;
    showTM2EnabledBanner?: boolean;
    supportedObjects?: Array<Territory2SupportedObject>;
    t2ForecastAccessLevel?: string;
    tm2BypassRealignAccInsert?: boolean;
    tm2EnableUserAssignmentLog?: boolean;
}

export interface Territory2SettingsOpportunityFilter {
    apexClassName?: string | null;
    enableFilter: boolean;
    runOnCreate: boolean;
}

export interface Territory2SupportedObject {
    defaultAccessLevel: string;
    objectType: string;
    state: string;
}

export interface Territory2TypeMetadata extends MetadataInfo {
    description?: string;
    name: string;
    priority: number; // xsd-type: "int"
}

export interface TimeSheetTemplateMetadata extends MetadataInfo {
    active: boolean;
    description?: string;
    frequency: TimeSheetFrequency;
    masterLabel: string;
    startDate: string; // xsd-type: "date"
    timeSheetTemplateAssignments?: Array<TimeSheetTemplateAssignment>;
    workWeekEndDay: DaysOfWeek;
    workWeekStartDay: DaysOfWeek;
}

export interface TimeSheetTemplateAssignment {
    assignedTo?: string;
}

export interface TimelineObjectDefinitionMetadata extends MetadataInfo {
    baseObject: string;
    definition: string;
    isActive?: boolean;
    masterLabel: string;
}

export interface TopicsForObjectsMetadata extends MetadataInfo {
    enableTopics: boolean;
    entityApiName: string;
}

export interface TrailheadSettingsMetadata extends MetadataInfo {
    enableConfettiEffect?: boolean;
    enableMyTrailheadPref?: boolean;
    enableTrailheadInLexTerms?: boolean;
}

export interface TransactionSecurityPolicyMetadata extends MetadataInfo {
    action: TransactionSecurityAction;
    active: boolean;
    apexClass?: string;
    blockMessage?: string;
    customEmailContent?: string;
    description?: string;
    developerName?: string;
    eventName?: TransactionSecurityEventName;
    eventType?: MonitoredEvents;
    executionUser?: string;
    flow?: string;
    masterLabel?: string;
    resourceName?: string;
    type?: TxnSecurityPolicyType;
}

export interface TransactionSecurityAction {
    block: boolean;
    endSession: boolean;
    freezeUser: boolean;
    notifications?: Array<TransactionSecurityNotification>;
    twoFactorAuthentication: boolean;
}

export interface TransactionSecurityNotification {
    inApp: boolean;
    sendEmail: boolean;
    user: string;
}

export interface TranslationsMetadata extends MetadataInfo {
    bots?: Array<BotTranslation>;
    customApplications?: Array<CustomApplicationTranslation>;
    customLabels?: Array<CustomLabelTranslation>;
    customPageWebLinks?: Array<CustomPageWebLinkTranslation>;
    customTabs?: Array<CustomTabTranslation>;
    desFieldTemplateMessages?: Array<ExplainabilityMsgTemplateFieldTranslation>;
    flowDefinitions?: Array<FlowDefinitionTranslation>;
    identityVerificationCustomFieldLabels?: Array<IdentityVerificationFieldTranslation>;
    pipelineInspMetricConfigs?: Array<PipelineInspMetricConfigTranslation>;
    prompts?: Array<PromptTranslation>;
    quickActions?: Array<GlobalQuickActionTranslation>;
    reportTypes?: Array<ReportTypeTranslation>;
    scontrols?: Array<ScontrolTranslation>;
}

export interface BotTranslation {
    botVersions?: Array<BotVersionTranslation>;
    fullName: string;
}

export interface BotVersionTranslation {
    botDialogs?: Array<BotDialogTranslation>;
    fullName: string;
}

export interface BotDialogTranslation {
    botSteps?: Array<BotStepTranslation>;
    developerName: string;
    label?: string;
}

export interface BotStepTranslation {
    botMessages?: Array<BotMessageTranslation>;
    botSteps?: Array<BotStepTranslation>;
    botVariableOperation?: BotVariableOperationTranslation;
    stepIdentifier: string;
    type: BotStepType;
}

export interface BotMessageTranslation {
    message?: string;
    messageIdentifier: string;
}

export interface BotVariableOperationTranslation {
    botMessages?: Array<BotMessageTranslation>;
    botQuickReplyOptions?: Array<BotQuickReplyOptionTranslation>;
    quickReplyOptionTemplate?: string;
    retryMessages?: Array<BotMessageTranslation>;
    successMessages?: Array<BotMessageTranslation>;
    type: BotVariableOperationType;
    variableOperationIdentifier: string;
}

export interface BotQuickReplyOptionTranslation {
    literalValue?: string;
    quickReplyOptionIdentifier: string;
}

export interface CustomApplicationTranslation {
    label: string;
    name: string;
}

export interface CustomLabelTranslation {
    label: string;
    name: string;
}

export interface CustomPageWebLinkTranslation {
    label: string;
    name: string;
}

export interface CustomTabTranslation {
    label: string;
    name: string;
}

export interface ExplainabilityMsgTemplateFieldTranslation {
    description?: string;
    label?: string;
    name: string;
    templateMessage?: string;
}

export interface FlowDefinitionTranslation {
    flows?: Array<FlowTranslation>;
    fullName: string;
    label?: string;
}

export interface FlowTranslation {
    choices?: Array<FlowChoiceTranslation>;
    fullName?: string;
    label?: string;
    screens?: Array<FlowScreenTranslation>;
    stages?: Array<FlowStageTranslation>;
    textTemplates?: Array<FlowTextTemplateTranslation>;
}

export interface FlowChoiceTranslation {
    choiceText?: string;
    name: string;
    userInput?: FlowChoiceUserInputTranslation;
}

export interface FlowChoiceUserInputTranslation {
    promptText?: string;
    validationRule?: FlowInputValidationRuleTranslation;
}

export interface FlowInputValidationRuleTranslation {
    errorMessage?: string;
}

export interface FlowScreenTranslation {
    backButtonLabel?: string;
    fields?: Array<FlowScreenFieldTranslation>;
    helpText?: string;
    name: string;
    nextOrFinishButtonLabel?: string;
    pauseButtonLabel?: string;
    pausedText?: string;
}

export interface FlowScreenFieldTranslation {
    fieldText?: string;
    helpText?: string;
    inputParameters?: Array<FlowInputParameterTranslation>;
    name: string;
    validationRule?: FlowInputValidationRuleTranslation;
}

export interface FlowInputParameterTranslation {
    name: string;
    value: FlowFerovTranslation;
}

export interface FlowFerovTranslation {
    complexValues?: Array<FlowComplexLiteralTranslation>;
    stringValue?: string;
}

export interface FlowComplexLiteralTranslation {
    customAspectKey?: string;
    value?: string;
}

export interface FlowStageTranslation {
    label?: string;
    name: string;
}

export interface FlowTextTemplateTranslation {
    name: string;
    text?: string;
}

export interface IdentityVerificationFieldTranslation {
    customFieldLabel?: string;
    description?: string;
    label?: string;
    name: string;
}

export interface PipelineInspMetricConfigTranslation {
    label: string;
    name: string;
}

export interface PromptTranslation {
    description?: string;
    label?: string;
    name: string;
    promptVersions?: Array<PromptVersionTranslation>;
}

export interface PromptVersionTranslation {
    actionButtonLabel?: string;
    actionButtonLink?: string;
    body?: string;
    description?: string;
    dismissButtonLabel?: string;
    header?: string;
    imageAltText?: string;
    imageLink?: string;
    label?: string;
    name: string;
    stepNumber?: number; // xsd-type: "int"
    title?: string;
    videoLink?: string;
}

export interface GlobalQuickActionTranslation {
    aspect?: string;
    label: string;
    name: string;
}

export interface ReportTypeTranslation {
    description?: string;
    label?: string;
    name: string;
    sections?: Array<ReportTypeSectionTranslation>;
}

export interface ReportTypeSectionTranslation {
    columns?: Array<ReportTypeColumnTranslation>;
    label?: string;
    name: string;
}

export interface ReportTypeColumnTranslation {
    label: string;
    name: string;
}

export interface ScontrolTranslation {
    label: string;
    name: string;
}

export interface TrialOrgSettingsMetadata extends MetadataInfo {
    enableSampleDataDeleted?: boolean;
}

export interface UIObjectRelationConfigMetadata extends MetadataInfo {
    UIObjectRelationFieldConfigs?: Array<UIObjectRelationFieldConfig>;
    contextObject: string;
    contextObjectRecordType?: string;
    directRelationshipField?: string;
    indirectObjectContextField?: string;
    indirectObjectRelatedField?: string;
    indirectRelationshipObject?: string;
    isActive?: boolean;
    masterLabel: string;
    relatedObject: string;
    relatedObjectRecordType?: string;
    relationshipType: ObjectRelationshipType;
}

export interface UIObjectRelationFieldConfig {
    displayLabel: string;
    queryText: string;
    rowOrder: number; // xsd-type: "int"
}

export interface UserCriteriaMetadata extends MetadataInfo {
    creationAgeInSeconds?: number; // xsd-type: "int"
    description?: string;
    lastChatterActivityAgeInSeconds?: number; // xsd-type: "int"
    masterLabel: string;
    profiles?: Array<string>;
    userTypes?: Array<NetworkUserType>;
}

export interface UserEngagementSettingsMetadata extends MetadataInfo {
    canGovCloudUseAdoptionApps?: boolean;
    doesScheduledSwitcherRunDaily?: boolean;
    enableCustomHelpGlobalSection?: boolean;
    enableHelpMenuShowFeedback?: boolean;
    enableHelpMenuShowHelp?: boolean;
    enableHelpMenuShowNewUser?: boolean;
    enableHelpMenuShowSearch?: boolean;
    enableHelpMenuShowSfdcContent?: boolean;
    enableHelpMenuShowShortcut?: boolean;
    enableHelpMenuShowSupport?: boolean;
    enableHelpMenuShowTrailhead?: boolean;
    enableIBILOptOutDashboards?: boolean;
    enableIBILOptOutEvents?: boolean;
    enableIBILOptOutReports?: boolean;
    enableIBILOptOutTasks?: boolean;
    enableLexToClassicFeedbackEnable?: boolean;
    enableOrchestrationInSandbox?: boolean;
    enableOrgUserAssistEnabled?: boolean;
    enableScheduledSwitcher?: boolean;
    enableSfdcProductFeedbackSurvey?: boolean;
    enableShowSalesforceUserAssist?: boolean;
    isAutoTransitionDelayed?: boolean;
    isCrucNotificationDisabled?: boolean;
    isCustomProfileAutoTransitionDelayed?: boolean;
    isLEXWelcomeMatDisabled?: boolean;
    isMeetTheAssistantDisabledInClassic?: boolean;
    isMeetTheAssistantDisabledInLightning?: boolean;
    isSmartNudgesDisabled?: boolean;
    optimizerAppEnabled?: boolean;
}

export interface UserInterfaceSettingsMetadata extends MetadataInfo {
    alternateAlohaListView?: boolean;
    dynamicMruActionsOff?: boolean;
    enableAsyncRelatedLists?: boolean;
    enableClickjackUserPageHeaderless?: boolean;
    enableCollapsibleSections?: boolean;
    enableCollapsibleSideBar?: boolean;
    enableCustomObjectTruncate?: boolean;
    enableCustomeSideBarOnAllPages?: boolean;
    enableDeleteFieldHistory?: boolean;
    enableExternalObjectAsyncRelatedLists?: boolean;
    enableHoverDetails?: boolean;
    enableInlineEdit?: boolean;
    enableNewPageLayoutEditor?: boolean;
    enablePersonalCanvas?: boolean;
    enablePrintableListViews?: boolean;
    enableProfileCustomTabsets?: boolean;
    enableQuickCreate?: boolean;
    enableRelatedListHovers?: boolean;
    enableTabOrganizer?: boolean;
}

export interface UserManagementSettingsMetadata extends MetadataInfo {
    enableCanAnswerContainUsername?: boolean;
    enableConcealPersonalInfo?: boolean;
    enableContactlessExternalIdentityUsers?: boolean;
    enableEnhancedConcealPersonalInfo?: boolean;
    enableEnhancedPermsetMgmt?: boolean;
    enableEnhancedProfileMgmt?: boolean;
    enableNewProfileUI?: boolean;
    enableProfileFiltering?: boolean;
    enableRestrictEmailDomains?: boolean;
    enableScrambleUserData?: boolean;
    enableUserSelfDeactivate?: boolean;
    permsetsInFieldCreation?: boolean;
    psaExpirationUIEnabled?: boolean;
    restrictedProfileCloning?: boolean;
}

export interface UserProfileSearchScopeMetadata extends MetadataInfo {
    entityApiNames?: Array<string>;
    profile?: string;
}

export interface UserProvisioningConfigMetadata extends MetadataInfo {
    approvalRequired?: string;
    connectedApp: string;
    enabled?: boolean;
    enabledOperations?: string;
    flow?: string;
    masterLabel: string;
    namedCredential?: string;
    notes?: string;
    onUpdateAttributes?: string;
    reconFilter?: string;
    userAccountMapping?: string;
}

export interface VoiceSettingsMetadata extends MetadataInfo {
    enableCallDisposition?: boolean;
    enableConsentReminder?: boolean;
    enableDefaultRecording?: boolean;
    enableVoiceCallList?: boolean;
    enableVoiceCallRecording?: boolean;
    enableVoiceCoaching?: boolean;
    enableVoiceConferencing?: boolean;
    enableVoiceLocalPresence?: boolean;
    enableVoiceMail?: boolean;
    enableVoiceMailDrop?: boolean;
}

export interface WarrantyLifecycleMgmtSettingsMetadata extends MetadataInfo {
    enableWarrantyLCMgmt?: boolean;
}

export interface WaveApplicationMetadata extends MetadataInfo {
    assetIcon?: string;
    description?: string;
    folder: string;
    masterLabel: string;
    shares?: Array<FolderShare>;
    templateOrigin?: string;
    templateVersion?: string;
}

export interface WaveDatasetMetadata extends MetadataInfo {
    application: string;
    description?: string;
    masterLabel: string;
    templateAssetSourceName?: string;
    type?: string;
}

export interface WaveTemplateBundleMetadata extends MetadataInfo {
    assetIcon?: string;
    assetVersion?: number; // xsd-type: "double"
    description?: string;
    label: string;
    templateType: string;
}

export interface WaveXmdMetadata extends MetadataInfo {
    application?: string;
    dataset: string;
    datasetConnector?: string;
    datasetFullyQualifiedName?: string;
    dates?: Array<WaveXmdDate>;
    dimensions?: Array<WaveXmdDimension>;
    measures?: Array<WaveXmdMeasure>;
    organizations?: Array<WaveXmdOrganization>;
    origin?: string;
    type?: string;
    waveVisualization?: string;
}

export interface WaveXmdDate {
    alias: string;
    compact?: boolean;
    dateFieldDay?: string;
    dateFieldEpochDay?: string;
    dateFieldEpochSecond?: string;
    dateFieldFiscalMonth?: string;
    dateFieldFiscalQuarter?: string;
    dateFieldFiscalWeek?: string;
    dateFieldFiscalYear?: string;
    dateFieldFullYear?: string;
    dateFieldHour?: string;
    dateFieldMinute?: string;
    dateFieldMonth?: string;
    dateFieldQuarter?: string;
    dateFieldSecond?: string;
    dateFieldWeek?: string;
    dateFieldYear?: string;
    description?: string;
    firstDayOfWeek: number; // xsd-type: "int"
    fiscalMonthOffset: number; // xsd-type: "int"
    isYearEndFiscalYear?: boolean;
    label?: string;
    showInExplorer?: boolean;
    sortIndex: number; // xsd-type: "int"
    type: string;
}

export interface WaveXmdDimension {
    conditionalFormatting?: Array<WaveXmdFormattingProperty>;
    customActions?: Array<WaveXmdDimensionCustomAction>;
    customActionsEnabled?: boolean;
    dateFormat?: string;
    defaultAction?: string;
    description?: string;
    field: string;
    fullyQualifiedName?: string;
    imageTemplate?: string;
    isDerived: boolean;
    isMultiValue?: boolean;
    label?: string;
    linkTemplate?: string;
    linkTemplateEnabled?: boolean;
    linkTooltip?: string;
    members?: Array<WaveXmdDimensionMember>;
    origin?: string;
    recordDisplayFields?: Array<WaveXmdRecordDisplayLookup>;
    recordIdField?: string;
    recordOrganizationIdField?: string;
    salesforceActions?: Array<WaveXmdDimensionSalesforceAction>;
    salesforceActionsEnabled?: boolean;
    showDetailsDefaultFieldIndex?: number; // xsd-type: "int"
    showInExplorer?: boolean;
    sortIndex: number; // xsd-type: "int"
}

export interface WaveXmdFormattingProperty {
    formattingBins?: Array<WaveXmdFormattingBin>;
    formattingPredicates?: Array<WaveXmdFormattingPredicate>;
    property: string;
    referenceField: string;
    sortIndex: number; // xsd-type: "int"
    type: string;
}

export interface WaveXmdFormattingBin {
    bin: string;
    formatValue: string;
    label: string;
    sortIndex: number; // xsd-type: "int"
}

export interface WaveXmdFormattingPredicate {
    formatValue: string;
    operator: string;
    sortIndex: number; // xsd-type: "int"
    value: string;
}

export interface WaveXmdDimensionCustomAction {
    customActionName: string;
    enabled: boolean;
    icon?: string;
    method?: string;
    sortIndex: number; // xsd-type: "int"
    target?: string;
    tooltip?: string;
    url?: string;
}

export interface WaveXmdDimensionMember {
    color?: string;
    label?: string;
    member: string;
    sortIndex: number; // xsd-type: "int"
}

export interface WaveXmdRecordDisplayLookup {
    recordDisplayField: string;
    sortIndex: number; // xsd-type: "int"
}

export interface WaveXmdDimensionSalesforceAction {
    enabled: boolean;
    salesforceActionName: string;
    sortIndex: number; // xsd-type: "int"
}

export interface WaveXmdMeasure {
    conditionalFormatting?: Array<WaveXmdFormattingProperty>;
    currencies?: Array<WaveXmdMeasure>;
    currencyCode?: string;
    dateFormat?: string;
    description?: string;
    field: string;
    formatCustomFormat?: string;
    formatDecimalDigits?: number; // xsd-type: "int"
    formatDecimalSeparator?: string;
    formatIsNegativeParens?: boolean;
    formatPrefix?: string;
    formatSuffix?: string;
    formatThousandsSeparator?: string;
    formatUnit?: string;
    formatUnitMultiplier?: number; // xsd-type: "double"
    fullyQualifiedName?: string;
    isDerived: boolean;
    isMultiCurrency?: boolean;
    label?: string;
    origin?: string;
    showDetailsDefaultFieldIndex?: number; // xsd-type: "int"
    showInExplorer?: boolean;
    sortIndex: number; // xsd-type: "int"
}

export interface WaveXmdOrganization {
    instanceUrl: string;
    label: string;
    organizationIdentifier: string;
    sortIndex: number; // xsd-type: "int"
}

export interface WebStoreTemplateMetadata extends MetadataInfo {
    autoFacetingEnabled?: boolean;
    cartToOrderAutoCustomFieldMapping?: boolean;
    checkoutTimeToLive?: number; // xsd-type: "int"
    checkoutValidAfterDate?: string; // xsd-type: "dateTime"
    commerceEinsteinActivitiesTracked?: boolean;
    commerceEinsteinDeployed?: boolean;
    country?: CountryIsoCode;
    defaultCurrency?: string;
    defaultLanguage: string;
    defaultTaxLocaleType: TaxLocaleType;
    description?: string;
    guestBrowsingEnabled?: boolean;
    guestCartTimeToLive?: number; // xsd-type: "int"
    masterLabel: string;
    maxValuesPerFacet?: number; // xsd-type: "int"
    orderActivationStatus?: string;
    orderLifeCycleType?: OrderLifeCycleType;
    paginationSize?: number; // xsd-type: "int"
    pricingStrategy: PricingStrategy;
    productGrouping?: ProductGrouping;
    skipAdditionalEntitlementCheckForSearch?: boolean;
    supportedCurrencies?: string;
    supportedLanguages: string;
    supportedShipToCountries?: string;
    type: WebStoreType;
}

export interface WebToXSettingsMetadata extends MetadataInfo {
    shouldHideRecordInfoInEmail?: boolean;
    webToCaseSpamFilter?: boolean;
    webToLeadSpamFilter?: boolean;
}

export interface WorkDotComSettingsMetadata extends MetadataInfo {
    enableCoachingManagerGroupAccess?: boolean;
    enableGoalManagerGroupAccess?: boolean;
    enableProfileSkills?: boolean;
    enableProfileSkillsAddFeedPost?: boolean;
    enableProfileSkillsAutoSuggest?: boolean;
    enableProfileSkillsUsePlatform?: boolean;
    enableWorkBadgeDefRestrictPref?: boolean;
    enableWorkCalibration?: boolean;
    enableWorkCanvasPref?: boolean;
    enableWorkCertification?: boolean;
    enableWorkCertificationNotification?: boolean;
    enableWorkRewardsPref?: boolean;
    enableWorkThanksPref?: boolean;
    enableWorkUseObjectivesForGoals?: boolean;
}

export interface WorkflowMetadata extends MetadataInfo {
    alerts?: Array<WorkflowAlert>;
    fieldUpdates?: Array<WorkflowFieldUpdate>;
    flowActions?: Array<WorkflowFlowAction>;
    knowledgePublishes?: Array<WorkflowKnowledgePublish>;
    outboundMessages?: Array<WorkflowOutboundMessage>;
    rules?: Array<WorkflowRuleMetadata>;
    send?: Array<WorkflowSend>;
    tasks?: Array<WorkflowTask>;
}

export interface WorkflowAlert extends MetadataInfo {
    ccEmails?: Array<string>;
    description: string;
    protected: boolean;
    recipients?: Array<WorkflowEmailRecipient>;
    senderAddress?: string;
    senderType?: ActionEmailSenderType;
    template: string;
}

export interface WorkflowFieldUpdate extends MetadataInfo {
    description?: string;
    field: string;
    formula?: string;
    literalValue?: string;
    lookupValue?: string;
    lookupValueType?: LookupValueType;
    name: string;
    notifyAssignee: boolean;
    operation: FieldUpdateOperation;
    protected: boolean;
    reevaluateOnChange?: boolean;
    targetObject?: string;
}

export interface WorkflowFlowAction extends MetadataInfo {
    description?: string;
    flow: string;
    flowInputs?: Array<WorkflowFlowActionParameter>;
    label: string;
    language?: string;
    protected: boolean;
}

export interface WorkflowFlowActionParameter {
    name: string;
    value?: string;
}

export interface WorkflowKnowledgePublish extends MetadataInfo {
    action: KnowledgeWorkflowAction;
    description?: string;
    label: string;
    language?: string;
    protected: boolean;
}

export interface WorkflowOutboundMessage extends MetadataInfo {
    apiVersion: number; // xsd-type: "double"
    description?: string;
    endpointUrl: string;
    fields?: Array<string>;
    includeSessionId: boolean;
    integrationUser: string;
    name: string;
    protected: boolean;
    useDeadLetterQueue?: boolean;
}

export interface WorkflowSend extends MetadataInfo {
    action: SendAction;
    description?: string;
    label: string;
    language?: string;
    protected: boolean;
}

export interface WorkflowTask extends MetadataInfo {
    assignedTo?: string;
    assignedToType: ActionTaskAssignedToTypes;
    description?: string;
    dueDateOffset: number; // xsd-type: "int"
    notifyAssignee: boolean;
    offsetFromField?: string;
    priority: string;
    protected: boolean;
    status: string;
    subject: string;
}

export interface WorkflowEmailRecipient {
    field?: string;
    recipient?: string;
    type: ActionEmailRecipientTypes;
}

export interface WorkflowRuleMetadata extends MetadataInfo {
    actions?: Array<WorkflowActionReference>;
    active: boolean;
    booleanFilter?: string;
    criteriaItems?: Array<FilterItem>;
    description?: string;
    failedMigrationToolVersion?: string;
    formula?: string;
    triggerType: WorkflowTriggerTypes;
    workflowTimeTriggers?: Array<WorkflowTimeTrigger>;
}

export interface WorkflowTimeTrigger {
    actions?: Array<WorkflowActionReference>;
    offsetFromField?: string;
    timeLength?: string;
    workflowTimeTriggerUnit: WorkflowTimeUnits;
}

export interface ExtendedErrorDetails {
    extendedErrorCode: ExtendedErrorCode;
}

export interface DeleteResult {
    errors?: Array<Error>;
    fullName: string;
    success: boolean;
}

export interface PicklistEntry {
    active: boolean;
    defaultValue: boolean;
    label: string;
    validFor?: string;
    value: string;
}

export interface LogInfo {
    category: LogCategory;
    level: LogCategoryLevel;
}

// Request/Response Types
export interface AllOrNoneHeader {
    allOrNone: boolean;
}

export interface CallOptions {
    client: string;
}

export interface DebuggingHeader {
    categories?: Array<LogInfo>;
    debugLevel: LogType;
}

export interface DebuggingInfo {
    debugLog: string;
}

export interface SessionHeader {
    sessionId: string;
}

export interface CancelDeployRequest {
    String: string; // xsd-type: "ID"
}

export interface CancelDeployResponse {
    result: CancelDeployResult;
}

export interface CheckDeployStatusRequest {
    asyncProcessId: string; // xsd-type: "ID"
    includeDetails: boolean;
}

export interface CheckDeployStatusResponse {
    result: DeployResult;
}

export interface CheckRetrieveStatusRequest {
    asyncProcessId: string; // xsd-type: "ID"
    includeZip: boolean;
}

export interface CheckRetrieveStatusResponse {
    result: RetrieveResult;
}

export interface CreateMetadataRequest {
    metadata?: Array<MetadataInfo>;
}

export interface CreateMetadataResponse {
    result?: Array<SaveResult>;
}

export interface DeleteMetadataRequest {
    type: string;
    fullNames?: Array<string>;
}

export interface DeleteMetadataResponse {
    result?: Array<DeleteResult>;
}

export interface DeployRequest {
    ZipFile: string; // xsd-type: "base64Binary"
    DeployOptions: DeployOptions;
}

export interface DeployResponse {
    result: AsyncResult;
}

export interface DeployRecentValidationRequest {
    validationId: string; // xsd-type: "ID"
}

export interface DeployRecentValidationResponse {
    result: string;
}

export interface DescribeMetadataRequest {
    asOfVersion: number; // xsd-type: "double"
}

export interface DescribeMetadataResponse {
    result: DescribeMetadataResult;
}

export interface DescribeValueTypeRequest {
    type: string;
}

export interface DescribeValueTypeResponse {
    result: DescribeValueTypeResult;
}

export interface ListMetadataRequest {
    queries?: Array<ListMetadataQuery>;
    asOfVersion: number; // xsd-type: "double"
}

export interface ListMetadataResponse {
    result?: Array<FileProperties>;
}

export interface ReadMetadataRequest {
    type: string;
    fullNames?: Array<string>;
}

export interface ReadMetadataResponse {
    result: ReadResult;
}

export interface RenameMetadataRequest {
    type: string;
    oldFullName: string;
    newFullName: string;
}

export interface RenameMetadataResponse {
    result: SaveResult;
}

export interface RetrieveResponse {
    result: AsyncResult;
}

export interface UpdateMetadataRequest {
    metadata?: Array<MetadataInfo>;
}

export interface UpdateMetadataResponse {
    result?: Array<SaveResult>;
}

export interface UpsertMetadataRequest {
    metadata?: Array<MetadataInfo>;
}

export interface UpsertMetadataResponse {
    result?: Array<UpsertResult>;
}