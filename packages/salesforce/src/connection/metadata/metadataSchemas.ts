// Metadata API Schema Definitions
// These schemas describe the API properties of each metadata API field
// and can be used to correctly map responses to their respective types

// Schemas Type
interface SchemaField {
    readonly array: boolean;
    readonly nullable: boolean;
    readonly optional: boolean;
    readonly type: 'string' | 'number' | 'boolean' | Schema | undefined;
}

interface Schema {
    readonly name: string;
    readonly extends?: Schema;
    readonly fields: Record<string, SchemaField>;
}

interface Operation {
    readonly name: string;
    readonly description?: string;
    readonly request: Schema;
    readonly response: Schema;
}

const CancelDeployResultSchema = {
    name: 'CancelDeployResult',
    fields: {
        done: { array: false, nullable: false, optional: false, type: 'boolean' },
        id: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const DeployResultSchema = {
    name: 'DeployResult',
    fields: {
        canceledBy: { array: false, nullable: false, optional: true, type: 'string' },
        canceledByName: { array: false, nullable: false, optional: true, type: 'string' },
        checkOnly: { array: false, nullable: false, optional: false, type: 'boolean' },
        completedDate: { array: false, nullable: false, optional: true, type: 'string' },
        createdBy: { array: false, nullable: false, optional: false, type: 'string' },
        createdByName: { array: false, nullable: false, optional: false, type: 'string' },
        createdDate: { array: false, nullable: false, optional: false, type: 'string' },
        details: { array: false, nullable: false, optional: false, type: 'DeployDetails' },
        done: { array: false, nullable: false, optional: false, type: 'boolean' },
        errorMessage: { array: false, nullable: false, optional: true, type: 'string' },
        errorStatusCode: { array: false, nullable: false, optional: true, type: 'string' },
        id: { array: false, nullable: false, optional: false, type: 'string' },
        ignoreWarnings: { array: false, nullable: false, optional: false, type: 'boolean' },
        lastModifiedDate: { array: false, nullable: false, optional: true, type: 'string' },
        numberComponentErrors: { array: false, nullable: false, optional: false, type: 'number' },
        numberComponentsDeployed: { array: false, nullable: false, optional: false, type: 'number' },
        numberComponentsTotal: { array: false, nullable: false, optional: false, type: 'number' },
        numberTestErrors: { array: false, nullable: false, optional: false, type: 'number' },
        numberTestsCompleted: { array: false, nullable: false, optional: false, type: 'number' },
        numberTestsTotal: { array: false, nullable: false, optional: false, type: 'number' },
        rollbackOnError: { array: false, nullable: false, optional: false, type: 'boolean' },
        runTestsEnabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        startDate: { array: false, nullable: false, optional: true, type: 'string' },
        stateDetail: { array: false, nullable: false, optional: true, type: 'string' },
        status: { array: false, nullable: false, optional: false, type: 'string' },
        success: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const DeployDetailsSchema = {
    name: 'DeployDetails',
    fields: {
        componentFailures: { array: true, nullable: false, optional: true, type: 'DeployMessage' },
        componentSuccesses: { array: true, nullable: false, optional: true, type: 'DeployMessage' },
        retrieveResult: { array: false, nullable: false, optional: true, type: 'RetrieveResult' },
        runTestResult: { array: false, nullable: false, optional: true, type: 'RunTestsResult' },
    }
}

const DeployMessageSchema = {
    name: 'DeployMessage',
    fields: {
        changed: { array: false, nullable: false, optional: false, type: 'boolean' },
        columnNumber: { array: false, nullable: false, optional: true, type: 'number' },
        componentType: { array: false, nullable: false, optional: true, type: 'string' },
        created: { array: false, nullable: false, optional: false, type: 'boolean' },
        createdDate: { array: false, nullable: false, optional: false, type: 'string' },
        deleted: { array: false, nullable: false, optional: false, type: 'boolean' },
        fileName: { array: false, nullable: false, optional: false, type: 'string' },
        fullName: { array: false, nullable: false, optional: false, type: 'string' },
        id: { array: false, nullable: false, optional: true, type: 'string' },
        lineNumber: { array: false, nullable: false, optional: true, type: 'number' },
        problem: { array: false, nullable: false, optional: true, type: 'string' },
        problemType: { array: false, nullable: false, optional: true, type: 'string' },
        success: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const RetrieveResultSchema = {
    name: 'RetrieveResult',
    fields: {
        done: { array: false, nullable: false, optional: false, type: 'boolean' },
        errorMessage: { array: false, nullable: false, optional: true, type: 'string' },
        errorStatusCode: { array: false, nullable: false, optional: true, type: 'string' },
        fileProperties: { array: true, nullable: false, optional: true, type: 'FileProperties' },
        id: { array: false, nullable: false, optional: false, type: 'string' },
        messages: { array: true, nullable: false, optional: true, type: 'RetrieveMessage' },
        status: { array: false, nullable: false, optional: false, type: 'string' },
        success: { array: false, nullable: false, optional: false, type: 'boolean' },
        zipFile: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FilePropertiesSchema = {
    name: 'FileProperties',
    fields: {
        createdById: { array: false, nullable: false, optional: false, type: 'string' },
        createdByName: { array: false, nullable: false, optional: false, type: 'string' },
        createdDate: { array: false, nullable: false, optional: false, type: 'string' },
        fileName: { array: false, nullable: false, optional: false, type: 'string' },
        fullName: { array: false, nullable: false, optional: false, type: 'string' },
        id: { array: false, nullable: false, optional: false, type: 'string' },
        lastModifiedById: { array: false, nullable: false, optional: false, type: 'string' },
        lastModifiedByName: { array: false, nullable: false, optional: false, type: 'string' },
        lastModifiedDate: { array: false, nullable: false, optional: false, type: 'string' },
        manageableState: { array: false, nullable: false, optional: true, type: 'string' },
        namespacePrefix: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const RetrieveMessageSchema = {
    name: 'RetrieveMessage',
    fields: {
        fileName: { array: false, nullable: false, optional: false, type: 'string' },
        problem: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const RunTestsResultSchema = {
    name: 'RunTestsResult',
    fields: {
        apexLogId: { array: false, nullable: false, optional: true, type: 'string' },
        codeCoverage: { array: true, nullable: false, optional: true, type: 'CodeCoverageResult' },
        codeCoverageWarnings: { array: true, nullable: false, optional: true, type: 'CodeCoverageWarning' },
        failures: { array: true, nullable: false, optional: true, type: 'RunTestFailure' },
        flowCoverage: { array: true, nullable: false, optional: true, type: 'FlowCoverageResult' },
        flowCoverageWarnings: { array: true, nullable: false, optional: true, type: 'FlowCoverageWarning' },
        numFailures: { array: false, nullable: false, optional: false, type: 'number' },
        numTestsRun: { array: false, nullable: false, optional: false, type: 'number' },
        successes: { array: true, nullable: false, optional: true, type: 'RunTestSuccess' },
        totalTime: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const CodeCoverageResultSchema = {
    name: 'CodeCoverageResult',
    fields: {
        dmlInfo: { array: true, nullable: false, optional: true, type: 'CodeLocation' },
        id: { array: false, nullable: false, optional: false, type: 'string' },
        locationsNotCovered: { array: true, nullable: false, optional: true, type: 'CodeLocation' },
        methodInfo: { array: true, nullable: false, optional: true, type: 'CodeLocation' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        namespace: { array: false, nullable: true, optional: true, type: 'string' },
        numLocations: { array: false, nullable: false, optional: false, type: 'number' },
        numLocationsNotCovered: { array: false, nullable: false, optional: false, type: 'number' },
        soqlInfo: { array: true, nullable: false, optional: true, type: 'CodeLocation' },
        soslInfo: { array: true, nullable: false, optional: true, type: 'CodeLocation' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CodeLocationSchema = {
    name: 'CodeLocation',
    fields: {
        column: { array: false, nullable: false, optional: false, type: 'number' },
        line: { array: false, nullable: false, optional: false, type: 'number' },
        numExecutions: { array: false, nullable: false, optional: false, type: 'number' },
        time: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const CodeCoverageWarningSchema = {
    name: 'CodeCoverageWarning',
    fields: {
        id: { array: false, nullable: false, optional: false, type: 'string' },
        message: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: true, optional: true, type: 'string' },
        namespace: { array: false, nullable: true, optional: true, type: 'string' },
    }
}

const RunTestFailureSchema = {
    name: 'RunTestFailure',
    fields: {
        id: { array: false, nullable: false, optional: false, type: 'string' },
        message: { array: false, nullable: false, optional: false, type: 'string' },
        methodName: { array: false, nullable: true, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        namespace: { array: false, nullable: true, optional: true, type: 'string' },
        packageName: { array: false, nullable: false, optional: false, type: 'string' },
        seeAllData: { array: false, nullable: false, optional: true, type: 'boolean' },
        stackTrace: { array: false, nullable: true, optional: true, type: 'string' },
        time: { array: false, nullable: false, optional: false, type: 'number' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlowCoverageResultSchema = {
    name: 'FlowCoverageResult',
    fields: {
        elementsNotCovered: { array: true, nullable: false, optional: true, type: 'string' },
        flowId: { array: false, nullable: false, optional: false, type: 'string' },
        flowName: { array: false, nullable: false, optional: false, type: 'string' },
        flowNamespace: { array: false, nullable: true, optional: true, type: 'string' },
        numElements: { array: false, nullable: false, optional: false, type: 'number' },
        numElementsNotCovered: { array: false, nullable: false, optional: false, type: 'number' },
        processType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlowCoverageWarningSchema = {
    name: 'FlowCoverageWarning',
    fields: {
        flowId: { array: false, nullable: true, optional: true, type: 'string' },
        flowName: { array: false, nullable: true, optional: true, type: 'string' },
        flowNamespace: { array: false, nullable: true, optional: true, type: 'string' },
        message: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const RunTestSuccessSchema = {
    name: 'RunTestSuccess',
    fields: {
        id: { array: false, nullable: false, optional: false, type: 'string' },
        methodName: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        namespace: { array: false, nullable: true, optional: true, type: 'string' },
        seeAllData: { array: false, nullable: false, optional: true, type: 'boolean' },
        time: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const MetadataSchema = {
    name: 'Metadata',
    fields: {
        fullName: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const AIApplicationSchema = {
    name: 'AIApplication',
    extends: 'Metadata',
    fields: {
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: true, type: 'string' },
        status: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const AIApplicationConfigSchema = {
    name: 'AIApplicationConfig',
    extends: 'Metadata',
    fields: {
        aiApplicationDeveloperName: { array: false, nullable: false, optional: false, type: 'string' },
        applicationId: { array: false, nullable: false, optional: true, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        insightReasonEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: true, type: 'string' },
        rank: { array: false, nullable: false, optional: true, type: 'number' },
        scoringMode: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const AIReplyRecommendationsSettingsSchema = {
    name: 'AIReplyRecommendationsSettings',
    extends: 'Metadata',
    fields: {
        enableAIReplyRecommendations: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const AccountInsightsSettingsSchema = {
    name: 'AccountInsightsSettings',
    extends: 'Metadata',
    fields: {
        enableAccountInsights: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const AccountIntelligenceSettingsSchema = {
    name: 'AccountIntelligenceSettings',
    extends: 'Metadata',
    fields: {
        enableAccountLogos: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAutomatedAccountFields: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableNewsStories: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const AccountRelationshipShareRuleSchema = {
    name: 'AccountRelationshipShareRule',
    extends: 'Metadata',
    fields: {
        accessLevel: { array: false, nullable: false, optional: false, type: 'string' },
        accountToCriteriaField: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        entityType: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        staticFormulaCriteria: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const AccountSettingsSchema = {
    name: 'AccountSettings',
    extends: 'Metadata',
    fields: {
        enableAccountDiscovery: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAccountHistoryTracking: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAccountInsightsInMobile: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAccountOwnerReport: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAccountTeams: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableContactHistoryTracking: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRelateContactToMultipleAccounts: { array: false, nullable: false, optional: true, type: 'boolean' },
        showViewHierarchyLink: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ActionLauncherItemDefSchema = {
    name: 'ActionLauncherItemDef',
    extends: 'Metadata',
    fields: {
        identifier: { array: false, nullable: false, optional: false, type: 'string' },
        itemActionType: { array: false, nullable: false, optional: false, type: 'string' },
        itemCategory: { array: false, nullable: false, optional: false, type: 'string' },
        itemLanguage: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        subType: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
        versionNumber: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ActionLinkGroupTemplateSchema = {
    name: 'ActionLinkGroupTemplate',
    extends: 'Metadata',
    fields: {
        actionLinkTemplates: { array: true, nullable: false, optional: true, type: 'ActionLinkTemplate' },
        category: { array: false, nullable: false, optional: false, type: 'string' },
        executionsAllowed: { array: false, nullable: false, optional: false, type: 'string' },
        hoursUntilExpiration: { array: false, nullable: false, optional: true, type: 'number' },
        isPublished: { array: false, nullable: false, optional: false, type: 'boolean' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ActionLinkTemplateSchema = {
    name: 'ActionLinkTemplate',
    fields: {
        actionUrl: { array: false, nullable: false, optional: false, type: 'string' },
        headers: { array: false, nullable: false, optional: true, type: 'string' },
        isConfirmationRequired: { array: false, nullable: false, optional: false, type: 'boolean' },
        isGroupDefault: { array: false, nullable: false, optional: false, type: 'boolean' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        labelKey: { array: false, nullable: false, optional: false, type: 'string' },
        linkType: { array: false, nullable: false, optional: false, type: 'string' },
        method: { array: false, nullable: false, optional: false, type: 'string' },
        position: { array: false, nullable: false, optional: false, type: 'number' },
        requestBody: { array: false, nullable: false, optional: true, type: 'string' },
        userAlias: { array: false, nullable: false, optional: true, type: 'string' },
        userVisibility: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ActionPlanTemplateSchema = {
    name: 'ActionPlanTemplate',
    extends: 'Metadata',
    fields: {
        actionPlanTemplateItem: { array: true, nullable: false, optional: true, type: 'ActionPlanTemplateItem' },
        actionPlanTemplateItemDependencies: { array: true, nullable: false, optional: true, type: 'ActionPlanTemplateItemDependency' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        isAdHocItemCreationEnabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        targetEntityType: { array: false, nullable: false, optional: false, type: 'string' },
        uniqueName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ActionPlanTemplateItemSchema = {
    name: 'ActionPlanTemplateItem',
    fields: {
        actionPlanTemplateItemValue: { array: true, nullable: false, optional: true, type: 'ActionPlanTemplateItemValue' },
        displayOrder: { array: false, nullable: false, optional: true, type: 'number' },
        isRequired: { array: false, nullable: false, optional: true, type: 'boolean' },
        itemEntityType: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        uniqueName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ActionPlanTemplateItemValueSchema = {
    name: 'ActionPlanTemplateItemValue',
    fields: {
        itemEntityType: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        valueFormula: { array: false, nullable: false, optional: true, type: 'string' },
        valueLiteral: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ActionPlanTemplateItemDependencySchema = {
    name: 'ActionPlanTemplateItemDependency',
    fields: {
        creationType: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        previousTemplateItem: { array: false, nullable: false, optional: false, type: 'ActionPlanTemplateItem' },
        templateItem: { array: false, nullable: false, optional: false, type: 'ActionPlanTemplateItem' },
    }
}

const ActionsSettingsSchema = {
    name: 'ActionsSettings',
    extends: 'Metadata',
    fields: {
        enableDefaultQuickActionsOn: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMdpEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOfflineWebLinks: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableThirdPartyActions: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ActivitiesSettingsSchema = {
    name: 'ActivitiesSettings',
    extends: 'Metadata',
    fields: {
        allowUsersToRelateMultipleContactsToTasksAndEvents: { array: false, nullable: false, optional: true, type: 'boolean' },
        autoRelateEventAttendees: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableActivityReminders: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableClickCreateEvents: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDragAndDropScheduling: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEmailTracking: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFlowTaskNotifsViaApex: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableGroupTasks: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHideChildEventsPreference: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableListViewScheduling: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLogNote: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMLSingleClientProfile: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMultidayEvents: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRecurringEvents: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRecurringTasks: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRollUpActivToContactsAcct: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSidebarCalendarShortcut: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSimpleTaskCreateUI: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTimelineCompDateSort: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableUNSTaskDelegatedToNotifications: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableUserListViewCalendars: { array: false, nullable: false, optional: true, type: 'boolean' },
        meetingRequestsLogo: { array: false, nullable: false, optional: true, type: 'string' },
        showCustomLogoMeetingRequests: { array: false, nullable: false, optional: true, type: 'boolean' },
        showEventDetailsMultiUserCalendar: { array: false, nullable: false, optional: true, type: 'boolean' },
        showHomePageHoverLinksForEvents: { array: false, nullable: false, optional: true, type: 'boolean' },
        showMyTasksHoverLinks: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const AddressSettingsSchema = {
    name: 'AddressSettings',
    extends: 'Metadata',
    fields: {
        countriesAndStates: { array: false, nullable: false, optional: false, type: 'CountriesAndStates' },
    }
}

const CountriesAndStatesSchema = {
    name: 'CountriesAndStates',
    fields: {
        countries: { array: true, nullable: false, optional: true, type: 'Country' },
    }
}

const CountrySchema = {
    name: 'Country',
    fields: {
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        integrationValue: { array: false, nullable: false, optional: false, type: 'string' },
        isoCode: { array: false, nullable: false, optional: false, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        orgDefault: { array: false, nullable: false, optional: false, type: 'boolean' },
        standard: { array: false, nullable: false, optional: false, type: 'boolean' },
        states: { array: true, nullable: false, optional: true, type: 'State' },
        visible: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const StateSchema = {
    name: 'State',
    fields: {
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        integrationValue: { array: false, nullable: false, optional: false, type: 'string' },
        isoCode: { array: false, nullable: false, optional: false, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        standard: { array: false, nullable: false, optional: false, type: 'boolean' },
        visible: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const AnalyticSnapshotSchema = {
    name: 'AnalyticSnapshot',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        groupColumn: { array: false, nullable: false, optional: true, type: 'string' },
        mappings: { array: true, nullable: false, optional: true, type: 'AnalyticSnapshotMapping' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        runningUser: { array: false, nullable: false, optional: true, type: 'string' },
        sourceReport: { array: false, nullable: false, optional: false, type: 'string' },
        targetObject: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const AnalyticSnapshotMappingSchema = {
    name: 'AnalyticSnapshotMapping',
    fields: {
        aggregateType: { array: false, nullable: false, optional: true, type: 'string' },
        sourceField: { array: false, nullable: false, optional: false, type: 'string' },
        sourceType: { array: false, nullable: false, optional: false, type: 'string' },
        targetField: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const AnalyticsSettingsSchema = {
    name: 'AnalyticsSettings',
    extends: 'Metadata',
    fields: {
        alwaysGenPreviews: { array: false, nullable: false, optional: true, type: 'boolean' },
        analyticsAdoptionMetadata: { array: false, nullable: false, optional: true, type: 'boolean' },
        autoInstallApps: { array: false, nullable: false, optional: true, type: 'boolean' },
        canAccessAnalyticsViaAPI: { array: false, nullable: false, optional: true, type: 'boolean' },
        canAnnotateDashboards: { array: false, nullable: false, optional: true, type: 'boolean' },
        canEnableSavedView: { array: false, nullable: false, optional: true, type: 'boolean' },
        canExploreDataConversationally: { array: false, nullable: false, optional: true, type: 'boolean' },
        canShareAppsWithCommunities: { array: false, nullable: false, optional: true, type: 'boolean' },
        canViewThumbnailAssets: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAmazonRedshiftOutputConnector: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAnalyticsEncryption: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAnalyticsSharingEnable: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAutoCompleteCombo: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAutonomousExperience: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAzureDLGen2OutputConnector: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableC360GlobalProfileData: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCreateLegacyDataflows: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDashboardComponentSnapshot: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDashboardFlexiTable: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDashboardToPDFEnable: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEmailReportsToPortalUsers: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFirebirdEditor: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFloatingReportHeaders: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableInsights: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableInsightsHCMode: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLightningReportBuilder: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLotusNotesImages: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMassEnableReportBuilder: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableNewChartsEngine: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableNullDimension: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOrgCanSeeLivePreviews: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOrgCanViewTableau: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOrgCanViewThumbnailForOA: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOrgHasMobileOfflineEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOrgHasWatchlistEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableQueryLiveConnectors: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRemoveFooterForRepDisplay: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRemoveFooterFromRepExp: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableReportHideXlsExportPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableReportInlineEditPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableReportNotificationsEnable: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRequestPrioritySchdl: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableS1AnalyticsEclairEnable: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableS3OutputConnector: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSFXJoinedReportsEnable: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSalesforceOutputConnector: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSecureImageSharing: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSnowflakeOutputConnector: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTableauHyperOutputConnector: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableUseOldChartsLookAndFeel: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWaveAssetsNewDateVersion: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWaveCustomFiscal: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWaveIndexMVDim: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWaveIndexMVDimV2: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWaveMultiCurrency: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWaveRecordNavigation: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWaveReplication: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWaveSharingInheritance: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWaveSqlCFIndexing: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWaveTrendedDatasetCleanup: { array: false, nullable: false, optional: true, type: 'boolean' },
        etlOrchestrationPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        isHighVolumePushbackEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        maxHoursAppInProgress: { array: false, nullable: false, optional: true, type: 'number' },
        recipeDirectDataPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        recipeFiscalPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        recipePreCachingOptOut: { array: false, nullable: false, optional: true, type: 'boolean' },
        recipeStagedDataPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        replaceBlankMeasuresWithNulls: { array: false, nullable: false, optional: true, type: 'boolean' },
        setWaveIsYearEndFiscalYear: { array: false, nullable: false, optional: true, type: 'boolean' },
        sonicEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        turnOnTimeZones: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const AnimationRuleSchema = {
    name: 'AnimationRule',
    extends: 'Metadata',
    fields: {
        animationFrequency: { array: false, nullable: false, optional: false, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        isActive: { array: false, nullable: false, optional: false, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        recordTypeContext: { array: false, nullable: false, optional: false, type: 'string' },
        recordTypeName: { array: false, nullable: false, optional: true, type: 'string' },
        sobjectType: { array: false, nullable: false, optional: false, type: 'string' },
        targetField: { array: false, nullable: false, optional: false, type: 'string' },
        targetFieldChangeToValues: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ApexEmailNotificationsSchema = {
    name: 'ApexEmailNotifications',
    extends: 'Metadata',
    fields: {
        apexEmailNotification: { array: true, nullable: false, optional: true, type: 'ApexEmailNotification' },
    }
}

const ApexEmailNotificationSchema = {
    name: 'ApexEmailNotification',
    fields: {
        email: { array: false, nullable: false, optional: true, type: 'string' },
        user: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ApexSettingsSchema = {
    name: 'ApexSettings',
    extends: 'Metadata',
    fields: {
        defaultQueueableDelay: { array: false, nullable: false, optional: true, type: 'number' },
        enableAggregateCodeCoverageOnly: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableApexAccessRightsPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableApexApprovalLockUnlock: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableApexCtrlImplicitWithSharingPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableApexPropertyGetterPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAuraApexCtrlAuthUserAccessCheckPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAuraApexCtrlGuestUserAccessCheckPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCompileOnDeploy: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDisableParallelApexTesting: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDoNotEmailDebugLog: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableGaplessTestAutoNum: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMngdCtrlActionAccessPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableNonCertifiedApexMdCrud: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRestrictCommunityExecAnon: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSecureNoArgConstructorPref: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ApexTestSuiteSchema = {
    name: 'ApexTestSuite',
    extends: 'Metadata',
    fields: {
        testClassName: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const AppExperienceSettingsSchema = {
    name: 'AppExperienceSettings',
    extends: 'Metadata',
    fields: {
        doesHideAllAppsInAppLauncher: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const AppMenuSchema = {
    name: 'AppMenu',
    extends: 'Metadata',
    fields: {
        appMenuItems: { array: true, nullable: false, optional: true, type: 'AppMenuItem' },
    }
}

const AppMenuItemSchema = {
    name: 'AppMenuItem',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ApplicationSubtypeDefinitionSchema = {
    name: 'ApplicationSubtypeDefinition',
    extends: 'Metadata',
    fields: {
        applicationUsageType: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const AppointmentAssignmentPolicySchema = {
    name: 'AppointmentAssignmentPolicy',
    extends: 'Metadata',
    fields: {
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        policyApplicableDuration: { array: false, nullable: false, optional: false, type: 'string' },
        policyType: { array: false, nullable: false, optional: false, type: 'string' },
        utilizationFactor: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const AppointmentSchedulingPolicySchema = {
    name: 'AppointmentSchedulingPolicy',
    extends: 'Metadata',
    fields: {
        appointmentAssignmentPolicy: { array: false, nullable: false, optional: true, type: 'string' },
        appointmentStartTimeInterval: { array: false, nullable: false, optional: false, type: 'string' },
        extCalEventHandler: { array: false, nullable: false, optional: true, type: 'string' },
        isSvcTerrOpHoursWithShiftsUsed: { array: false, nullable: false, optional: true, type: 'boolean' },
        isSvcTerritoryMemberShiftUsed: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        shouldCheckExternalCalendar: { array: false, nullable: false, optional: false, type: 'boolean' },
        shouldConsiderCalendarEvents: { array: false, nullable: false, optional: false, type: 'boolean' },
        shouldEnforceExcludedResource: { array: false, nullable: false, optional: false, type: 'boolean' },
        shouldEnforceRequiredResource: { array: false, nullable: false, optional: false, type: 'boolean' },
        shouldMatchSkill: { array: false, nullable: false, optional: false, type: 'boolean' },
        shouldMatchSkillLevel: { array: false, nullable: false, optional: false, type: 'boolean' },
        shouldRespectVisitingHours: { array: false, nullable: false, optional: false, type: 'boolean' },
        shouldUsePrimaryMembers: { array: false, nullable: false, optional: false, type: 'boolean' },
        shouldUseSecondaryMembers: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const ApprovalProcessSchema = {
    name: 'ApprovalProcess',
    extends: 'Metadata',
    fields: {
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        allowRecall: { array: false, nullable: false, optional: true, type: 'boolean' },
        allowedSubmitters: { array: true, nullable: false, optional: true, type: 'ApprovalSubmitter' },
        approvalPageFields: { array: false, nullable: false, optional: true, type: 'ApprovalPageField' },
        approvalStep: { array: true, nullable: false, optional: true, type: 'ApprovalStep' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        emailTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        enableMobileDeviceAccess: { array: false, nullable: false, optional: true, type: 'boolean' },
        entryCriteria: { array: false, nullable: false, optional: true, type: 'ApprovalEntryCriteria' },
        finalApprovalActions: { array: false, nullable: false, optional: true, type: 'ApprovalAction' },
        finalApprovalRecordLock: { array: false, nullable: false, optional: true, type: 'boolean' },
        finalRejectionActions: { array: false, nullable: false, optional: true, type: 'ApprovalAction' },
        finalRejectionRecordLock: { array: false, nullable: false, optional: true, type: 'boolean' },
        initialSubmissionActions: { array: false, nullable: false, optional: true, type: 'ApprovalAction' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        nextAutomatedApprover: { array: false, nullable: false, optional: true, type: 'NextAutomatedApprover' },
        postTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        processOrder: { array: false, nullable: false, optional: true, type: 'number' },
        recallActions: { array: false, nullable: false, optional: true, type: 'ApprovalAction' },
        recordEditability: { array: false, nullable: false, optional: false, type: 'string' },
        showApprovalHistory: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ApprovalSubmitterSchema = {
    name: 'ApprovalSubmitter',
    fields: {
        submitter: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ApprovalPageFieldSchema = {
    name: 'ApprovalPageField',
    fields: {
        field: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const ApprovalStepSchema = {
    name: 'ApprovalStep',
    fields: {
        allowDelegate: { array: false, nullable: false, optional: true, type: 'boolean' },
        approvalActions: { array: false, nullable: false, optional: true, type: 'ApprovalAction' },
        assignedApprover: { array: false, nullable: false, optional: false, type: 'ApprovalStepApprover' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        entryCriteria: { array: false, nullable: false, optional: true, type: 'ApprovalEntryCriteria' },
        ifCriteriaNotMet: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        rejectBehavior: { array: false, nullable: false, optional: true, type: 'ApprovalStepRejectBehavior' },
        rejectionActions: { array: false, nullable: false, optional: true, type: 'ApprovalAction' },
    }
}

const ApprovalActionSchema = {
    name: 'ApprovalAction',
    fields: {
        action: { array: true, nullable: false, optional: true, type: 'WorkflowActionReference' },
    }
}

const WorkflowActionReferenceSchema = {
    name: 'WorkflowActionReference',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ApprovalStepApproverSchema = {
    name: 'ApprovalStepApprover',
    fields: {
        approver: { array: true, nullable: false, optional: true, type: 'Approver' },
        whenMultipleApprovers: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ApproverSchema = {
    name: 'Approver',
    fields: {
        name: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ApprovalEntryCriteriaSchema = {
    name: 'ApprovalEntryCriteria',
    fields: {
        booleanFilter: { array: false, nullable: false, optional: true, type: 'string' },
        criteriaItems: { array: true, nullable: false, optional: true, type: 'FilterItem' },
        formula: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FilterItemSchema = {
    name: 'FilterItem',
    fields: {
        field: { array: false, nullable: false, optional: false, type: 'string' },
        operation: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'string' },
        valueField: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const DuplicateRuleFilterItemSchema = {
    name: 'DuplicateRuleFilterItem',
    extends: 'FilterItem',
    fields: {
        sortOrder: { array: false, nullable: false, optional: false, type: 'number' },
        table: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ApprovalStepRejectBehaviorSchema = {
    name: 'ApprovalStepRejectBehavior',
    fields: {
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const NextAutomatedApproverSchema = {
    name: 'NextAutomatedApprover',
    fields: {
        useApproverFieldOfRecordOwner: { array: false, nullable: false, optional: true, type: 'boolean' },
        userHierarchyField: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ArchiveSettingsSchema = {
    name: 'ArchiveSettings',
    extends: 'Metadata',
    fields: {
        enableEntityArchivingEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const AssignmentRuleSchema = {
    name: 'AssignmentRule',
    extends: 'Metadata',
    fields: {
        active: { array: false, nullable: false, optional: true, type: 'boolean' },
        ruleEntry: { array: true, nullable: false, optional: true, type: 'RuleEntry' },
    }
}

const RuleEntrySchema = {
    name: 'RuleEntry',
    fields: {
        assignedTo: { array: false, nullable: false, optional: true, type: 'string' },
        assignedToType: { array: false, nullable: false, optional: true, type: 'string' },
        booleanFilter: { array: false, nullable: false, optional: true, type: 'string' },
        businessHours: { array: false, nullable: false, optional: true, type: 'string' },
        businessHoursSource: { array: false, nullable: false, optional: true, type: 'string' },
        criteriaItems: { array: true, nullable: false, optional: true, type: 'FilterItem' },
        disableEscalationWhenModified: { array: false, nullable: false, optional: true, type: 'boolean' },
        escalationAction: { array: true, nullable: false, optional: true, type: 'EscalationAction' },
        escalationStartTime: { array: false, nullable: false, optional: true, type: 'string' },
        formula: { array: false, nullable: false, optional: true, type: 'string' },
        notifyCcRecipients: { array: false, nullable: false, optional: true, type: 'boolean' },
        overrideExistingTeams: { array: false, nullable: false, optional: true, type: 'boolean' },
        replyToEmail: { array: false, nullable: false, optional: true, type: 'string' },
        senderEmail: { array: false, nullable: false, optional: true, type: 'string' },
        senderName: { array: false, nullable: false, optional: true, type: 'string' },
        team: { array: true, nullable: false, optional: true, type: 'string' },
        template: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const EscalationActionSchema = {
    name: 'EscalationAction',
    fields: {
        assignedTo: { array: false, nullable: false, optional: true, type: 'string' },
        assignedToTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        assignedToType: { array: false, nullable: false, optional: true, type: 'string' },
        minutesToEscalation: { array: false, nullable: false, optional: true, type: 'number' },
        notifyCaseOwner: { array: false, nullable: false, optional: true, type: 'boolean' },
        notifyEmail: { array: true, nullable: false, optional: true, type: 'string' },
        notifyTo: { array: false, nullable: false, optional: true, type: 'string' },
        notifyToTemplate: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const AssignmentRulesSchema = {
    name: 'AssignmentRules',
    extends: 'Metadata',
    fields: {
        assignmentRule: { array: true, nullable: false, optional: true, type: 'AssignmentRule' },
    }
}

const AudienceSchema = {
    name: 'Audience',
    extends: 'Metadata',
    fields: {
        audienceName: { array: false, nullable: false, optional: false, type: 'string' },
        container: { array: false, nullable: false, optional: false, type: 'string' },
        criteria: { array: false, nullable: false, optional: false, type: 'AudienceCriteria' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        formula: { array: false, nullable: false, optional: true, type: 'string' },
        formulaFilterType: { array: false, nullable: false, optional: true, type: 'string' },
        isDefaultAudience: { array: false, nullable: false, optional: true, type: 'boolean' },
        targets: { array: false, nullable: false, optional: true, type: 'PersonalizationTargetInfos' },
    }
}

const AudienceCriteriaSchema = {
    name: 'AudienceCriteria',
    fields: {
        criterion: { array: true, nullable: false, optional: true, type: 'AudienceCriterion' },
    }
}

const AudienceCriterionSchema = {
    name: 'AudienceCriterion',
    fields: {
        criteriaNumber: { array: false, nullable: false, optional: true, type: 'number' },
        criterionValue: { array: false, nullable: false, optional: true, type: 'AudienceCriteriaValue' },
        operator: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const AudienceCriteriaValueSchema = {
    name: 'AudienceCriteriaValue',
    fields: {
        audienceDeveloperName: { array: false, nullable: false, optional: true, type: 'string' },
        city: { array: false, nullable: false, optional: true, type: 'string' },
        country: { array: false, nullable: false, optional: true, type: 'string' },
        domain: { array: false, nullable: false, optional: true, type: 'string' },
        entityField: { array: false, nullable: false, optional: true, type: 'string' },
        entityType: { array: false, nullable: false, optional: true, type: 'string' },
        fieldValue: { array: false, nullable: false, optional: true, type: 'string' },
        isEnabled: { array: false, nullable: false, optional: true, type: 'string' },
        permissionName: { array: false, nullable: false, optional: true, type: 'string' },
        permissionType: { array: false, nullable: false, optional: true, type: 'string' },
        profile: { array: false, nullable: false, optional: true, type: 'string' },
        subdivision: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const PersonalizationTargetInfosSchema = {
    name: 'PersonalizationTargetInfos',
    fields: {
        target: { array: true, nullable: false, optional: true, type: 'PersonalizationTargetInfo' },
    }
}

const PersonalizationTargetInfoSchema = {
    name: 'PersonalizationTargetInfo',
    fields: {
        groupName: { array: false, nullable: false, optional: false, type: 'string' },
        priority: { array: false, nullable: false, optional: true, type: 'number' },
        targetType: { array: false, nullable: false, optional: false, type: 'string' },
        targetValue: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const AuraDefinitionBundleSchema = {
    name: 'AuraDefinitionBundle',
    extends: 'Metadata',
    fields: {
        SVGContent: { array: false, nullable: false, optional: true, type: 'string' },
        apiVersion: { array: false, nullable: false, optional: true, type: 'number' },
        auraDefinitions: { array: false, nullable: false, optional: true, type: 'AuraDefinitions' },
        controllerContent: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        designContent: { array: false, nullable: false, optional: true, type: 'string' },
        documentationContent: { array: false, nullable: false, optional: true, type: 'string' },
        helperContent: { array: false, nullable: false, optional: true, type: 'string' },
        markup: { array: false, nullable: false, optional: true, type: 'string' },
        modelContent: { array: false, nullable: false, optional: true, type: 'string' },
        packageVersions: { array: true, nullable: false, optional: true, type: 'PackageVersion' },
        rendererContent: { array: false, nullable: false, optional: true, type: 'string' },
        styleContent: { array: false, nullable: false, optional: true, type: 'string' },
        testsuiteContent: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const AuraDefinitionsSchema = {
    name: 'AuraDefinitions',
    fields: {
        auraDefinition: { array: true, nullable: false, optional: true, type: 'AuraDefinition' },
    }
}

const AuraDefinitionSchema = {
    name: 'AuraDefinition',
    fields: {
        defType: { array: false, nullable: false, optional: false, type: 'string' },
        source: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PackageVersionSchema = {
    name: 'PackageVersion',
    fields: {
        majorNumber: { array: false, nullable: false, optional: false, type: 'number' },
        minorNumber: { array: false, nullable: false, optional: false, type: 'number' },
        namespace: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const AuthProviderSchema = {
    name: 'AuthProvider',
    extends: 'Metadata',
    fields: {
        appleTeam: { array: false, nullable: false, optional: true, type: 'string' },
        authorizeUrl: { array: false, nullable: false, optional: true, type: 'string' },
        consumerKey: { array: false, nullable: false, optional: true, type: 'string' },
        consumerSecret: { array: false, nullable: false, optional: true, type: 'string' },
        controlPlane: { array: false, nullable: true, optional: true, type: 'string' },
        customMetadataTypeRecord: { array: false, nullable: false, optional: true, type: 'string' },
        defaultScopes: { array: false, nullable: false, optional: true, type: 'string' },
        ecKey: { array: false, nullable: false, optional: true, type: 'string' },
        errorUrl: { array: false, nullable: false, optional: true, type: 'string' },
        executionUser: { array: false, nullable: false, optional: true, type: 'string' },
        friendlyName: { array: false, nullable: false, optional: false, type: 'string' },
        iconUrl: { array: false, nullable: false, optional: true, type: 'string' },
        idTokenIssuer: { array: false, nullable: false, optional: true, type: 'string' },
        includeOrgIdInIdentifier: { array: false, nullable: false, optional: true, type: 'boolean' },
        linkKickoffUrl: { array: false, nullable: false, optional: true, type: 'string' },
        logoutUrl: { array: false, nullable: false, optional: true, type: 'string' },
        oauthKickoffUrl: { array: false, nullable: false, optional: true, type: 'string' },
        plugin: { array: false, nullable: false, optional: true, type: 'string' },
        portal: { array: false, nullable: false, optional: true, type: 'string' },
        providerType: { array: false, nullable: false, optional: false, type: 'string' },
        registrationHandler: { array: false, nullable: false, optional: true, type: 'string' },
        sendAccessTokenInHeader: { array: false, nullable: false, optional: true, type: 'boolean' },
        sendClientCredentialsInHeader: { array: false, nullable: false, optional: true, type: 'boolean' },
        sendSecretInApis: { array: false, nullable: false, optional: true, type: 'boolean' },
        ssoKickoffUrl: { array: false, nullable: false, optional: true, type: 'string' },
        tokenUrl: { array: false, nullable: false, optional: true, type: 'string' },
        userInfoUrl: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const AutoResponseRuleSchema = {
    name: 'AutoResponseRule',
    extends: 'Metadata',
    fields: {
        active: { array: false, nullable: false, optional: true, type: 'boolean' },
        ruleEntry: { array: true, nullable: false, optional: true, type: 'RuleEntry' },
    }
}

const AutoResponseRulesSchema = {
    name: 'AutoResponseRules',
    extends: 'Metadata',
    fields: {
        autoResponseRule: { array: true, nullable: false, optional: true, type: 'AutoResponseRule' },
    }
}

const AutomatedContactsSettingsSchema = {
    name: 'AutomatedContactsSettings',
    extends: 'Metadata',
    fields: {
        enableAddContactAutomatically: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAddContactRoleAutomatically: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAddContactRoleWithSuggestion: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAddContactWithSuggestion: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const BatchProcessJobDefinitionSchema = {
    name: 'BatchProcessJobDefinition',
    extends: 'Metadata',
    fields: {
        batchSize: { array: false, nullable: false, optional: false, type: 'number' },
        dataSource: { array: false, nullable: false, optional: false, type: 'BatchDataSource' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        executionProcessApiName: { array: false, nullable: false, optional: true, type: 'string' },
        flowApiName: { array: false, nullable: false, optional: true, type: 'string' },
        flowInputVariable: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        processGroup: { array: false, nullable: false, optional: false, type: 'string' },
        retryCount: { array: false, nullable: false, optional: false, type: 'number' },
        retryInterval: { array: false, nullable: false, optional: false, type: 'number' },
        status: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const BatchDataSourceSchema = {
    name: 'BatchDataSource',
    fields: {
        condition: { array: false, nullable: false, optional: false, type: 'string' },
        criteria: { array: false, nullable: false, optional: true, type: 'string' },
        filters: { array: true, nullable: false, optional: true, type: 'BatchDataSrcFilterCriteria' },
        sourceObject: { array: false, nullable: false, optional: false, type: 'string' },
        sourceObjectField: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const BatchDataSrcFilterCriteriaSchema = {
    name: 'BatchDataSrcFilterCriteria',
    fields: {
        dynamicValue: { array: false, nullable: false, optional: false, type: 'boolean' },
        dynamicValueType: { array: false, nullable: false, optional: true, type: 'string' },
        fieldName: { array: false, nullable: false, optional: false, type: 'string' },
        fieldValue: { array: false, nullable: false, optional: false, type: 'string' },
        operator: { array: false, nullable: false, optional: false, type: 'string' },
        sequenceNo: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const BlacklistedConsumerSchema = {
    name: 'BlacklistedConsumer',
    extends: 'Metadata',
    fields: {
        blockedByApiWhitelisting: { array: false, nullable: false, optional: false, type: 'boolean' },
        consumerKey: { array: false, nullable: false, optional: false, type: 'string' },
        consumerName: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const BlockchainSettingsSchema = {
    name: 'BlockchainSettings',
    extends: 'Metadata',
    fields: {
        enableBcp: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEtpNft: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const BotSchema = {
    name: 'Bot',
    extends: 'Metadata',
    fields: {
        botMlDomain: { array: false, nullable: false, optional: true, type: 'LocalMlDomain' },
        botUser: { array: false, nullable: false, optional: true, type: 'string' },
        botVersions: { array: true, nullable: false, optional: true, type: 'BotVersion' },
        contextVariables: { array: true, nullable: false, optional: true, type: 'ConversationContextVariable' },
        conversationChannelProviders: { array: true, nullable: false, optional: true, type: 'ConversationDefinitionChannelProvider' },
        defaultOutboundFlow: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        logPrivateConversationData: { array: false, nullable: false, optional: true, type: 'boolean' },
        richContentEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const LocalMlDomainSchema = {
    name: 'LocalMlDomain',
    fields: {
        label: { array: false, nullable: false, optional: false, type: 'string' },
        mlIntents: { array: true, nullable: false, optional: true, type: 'MlIntent' },
        mlSlotClasses: { array: true, nullable: false, optional: true, type: 'MlSlotClass' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const MlIntentSchema = {
    name: 'MlIntent',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        mlIntentUtterances: { array: true, nullable: false, optional: true, type: 'MlIntentUtterance' },
        relatedMlIntents: { array: true, nullable: false, optional: true, type: 'MlRelatedIntent' },
    }
}

const MlIntentUtteranceSchema = {
    name: 'MlIntentUtterance',
    fields: {
        language: { array: false, nullable: false, optional: true, type: 'string' },
        utterance: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const MlRelatedIntentSchema = {
    name: 'MlRelatedIntent',
    fields: {
        relatedMlIntent: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const MlSlotClassSchema = {
    name: 'MlSlotClass',
    fields: {
        dataType: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        extractionRegex: { array: false, nullable: false, optional: true, type: 'string' },
        extractionType: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        mlSlotClassValues: { array: true, nullable: false, optional: true, type: 'MlSlotClassValue' },
    }
}

const MlSlotClassValueSchema = {
    name: 'MlSlotClassValue',
    fields: {
        synonymGroup: { array: false, nullable: false, optional: true, type: 'SynonymGroup' },
        synonymGroups: { array: true, nullable: false, optional: true, type: 'SynonymGroup' },
        value: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const SynonymGroupSchema = {
    name: 'SynonymGroup',
    fields: {
        languages: { array: true, nullable: false, optional: true, type: 'string' },
        terms: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const BotVersionSchema = {
    name: 'BotVersion',
    extends: 'Metadata',
    fields: {
        botDialogGroups: { array: true, nullable: false, optional: true, type: 'BotDialogGroup' },
        botDialogs: { array: true, nullable: false, optional: true, type: 'BotDialog' },
        conversationGoals: { array: true, nullable: false, optional: true, type: 'ConversationDefinitionGoal' },
        conversationSystemDialogs: { array: true, nullable: false, optional: true, type: 'ConversationSystemDialog' },
        conversationVariables: { array: true, nullable: false, optional: true, type: 'ConversationVariable' },
        entryDialog: { array: false, nullable: false, optional: false, type: 'string' },
        mainMenuDialog: { array: false, nullable: false, optional: false, type: 'string' },
        nlpProviders: { array: true, nullable: false, optional: true, type: 'ConversationDefinitionNlpProvider' },
        responseDelayMilliseconds: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const BotDialogGroupSchema = {
    name: 'BotDialogGroup',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const BotDialogSchema = {
    name: 'BotDialog',
    fields: {
        botDialogGroup: { array: false, nullable: false, optional: true, type: 'string' },
        botSteps: { array: true, nullable: false, optional: true, type: 'BotStep' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        isPlaceholderDialog: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        mlIntent: { array: false, nullable: false, optional: true, type: 'string' },
        mlIntentTrainingEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        showInFooterMenu: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const BotStepSchema = {
    name: 'BotStep',
    fields: {
        booleanFilter: { array: false, nullable: false, optional: true, type: 'string' },
        botInvocation: { array: false, nullable: false, optional: true, type: 'BotInvocation' },
        botMessages: { array: true, nullable: false, optional: true, type: 'BotMessage' },
        botNavigation: { array: false, nullable: false, optional: true, type: 'BotNavigation' },
        botStepConditions: { array: true, nullable: false, optional: true, type: 'BotStepCondition' },
        botSteps: { array: true, nullable: false, optional: true, type: 'BotStep' },
        botVariableOperation: { array: false, nullable: false, optional: true, type: 'BotVariableOperation' },
        conversationRecordLookup: { array: false, nullable: false, optional: true, type: 'ConversationRecordLookup' },
        conversationStepGoalMappings: { array: true, nullable: false, optional: true, type: 'ConversationDefinitionStepGoalMapping' },
        conversationSystemMessage: { array: false, nullable: false, optional: true, type: 'ConversationSystemMessage' },
        messageDefinition: { array: false, nullable: false, optional: true, type: 'ConversationDefinitionRichMessage' },
        stepIdentifier: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const BotInvocationSchema = {
    name: 'BotInvocation',
    fields: {
        invocationActionName: { array: false, nullable: false, optional: true, type: 'string' },
        invocationActionType: { array: false, nullable: false, optional: true, type: 'string' },
        invocationMappings: { array: true, nullable: false, optional: true, type: 'BotInvocationMapping' },
    }
}

const BotInvocationMappingSchema = {
    name: 'BotInvocationMapping',
    fields: {
        parameterName: { array: false, nullable: false, optional: false, type: 'string' },
        recordName: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'string' },
        variableName: { array: false, nullable: false, optional: true, type: 'string' },
        variableType: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const BotMessageSchema = {
    name: 'BotMessage',
    fields: {
        message: { array: false, nullable: false, optional: false, type: 'string' },
        messageIdentifier: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const BotNavigationSchema = {
    name: 'BotNavigation',
    fields: {
        botNavigationLinks: { array: true, nullable: false, optional: true, type: 'BotNavigationLink' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const BotNavigationLinkSchema = {
    name: 'BotNavigationLink',
    fields: {
        label: { array: false, nullable: false, optional: true, type: 'string' },
        targetBotDialog: { array: false, nullable: false, optional: true, type: 'string' },
        targetVariable: { array: false, nullable: false, optional: true, type: 'string' },
        targetVariableType: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const BotStepConditionSchema = {
    name: 'BotStepCondition',
    fields: {
        leftOperandName: { array: false, nullable: false, optional: false, type: 'string' },
        leftOperandType: { array: false, nullable: false, optional: false, type: 'string' },
        operatorType: { array: false, nullable: false, optional: false, type: 'string' },
        rightOperandValue: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const BotVariableOperationSchema = {
    name: 'BotVariableOperation',
    fields: {
        askCollectIfSet: { array: false, nullable: false, optional: true, type: 'boolean' },
        autoSelectIfSingleChoice: { array: false, nullable: false, optional: true, type: 'boolean' },
        botInvocation: { array: false, nullable: false, optional: true, type: 'BotInvocation' },
        botMessages: { array: true, nullable: false, optional: true, type: 'BotMessage' },
        botQuickReplyOptions: { array: true, nullable: false, optional: true, type: 'BotQuickReplyOption' },
        botVariableOperands: { array: true, nullable: false, optional: true, type: 'BotVariableOperand' },
        invalidInputBotNavigation: { array: false, nullable: false, optional: true, type: 'BotNavigation' },
        optionalCollect: { array: false, nullable: false, optional: true, type: 'boolean' },
        quickReplyOptionTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        quickReplyType: { array: false, nullable: false, optional: true, type: 'string' },
        quickReplyWidgetType: { array: false, nullable: false, optional: true, type: 'string' },
        retryMessages: { array: true, nullable: false, optional: true, type: 'BotMessage' },
        sourceVariableName: { array: false, nullable: false, optional: true, type: 'string' },
        sourceVariableType: { array: false, nullable: false, optional: true, type: 'string' },
        successMessages: { array: true, nullable: false, optional: true, type: 'BotMessage' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
        variableOperationIdentifier: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const BotQuickReplyOptionSchema = {
    name: 'BotQuickReplyOption',
    fields: {
        literalValue: { array: false, nullable: false, optional: false, type: 'string' },
        quickReplyOptionIdentifier: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const BotVariableOperandSchema = {
    name: 'BotVariableOperand',
    fields: {
        disableAutoFill: { array: false, nullable: false, optional: true, type: 'boolean' },
        sourceName: { array: false, nullable: false, optional: true, type: 'string' },
        sourceType: { array: false, nullable: false, optional: true, type: 'string' },
        sourceValue: { array: false, nullable: false, optional: true, type: 'string' },
        targetName: { array: false, nullable: false, optional: false, type: 'string' },
        targetType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ConversationRecordLookupSchema = {
    name: 'ConversationRecordLookup',
    fields: {
        SObjectType: { array: false, nullable: false, optional: false, type: 'string' },
        conditions: { array: true, nullable: false, optional: true, type: 'ConversationRecordLookupCondition' },
        filterLogic: { array: false, nullable: false, optional: true, type: 'string' },
        lookupFields: { array: true, nullable: false, optional: true, type: 'ConversationRecordLookupField' },
        maxLookupResults: { array: false, nullable: false, optional: false, type: 'number' },
        sortFieldName: { array: false, nullable: false, optional: true, type: 'string' },
        sortOrder: { array: false, nullable: false, optional: true, type: 'string' },
        sourceVariableName: { array: false, nullable: false, optional: true, type: 'string' },
        sourceVariableType: { array: false, nullable: false, optional: true, type: 'string' },
        targetVariableName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ConversationRecordLookupConditionSchema = {
    name: 'ConversationRecordLookupCondition',
    fields: {
        leftOperand: { array: false, nullable: false, optional: false, type: 'string' },
        operatorType: { array: false, nullable: false, optional: false, type: 'string' },
        rightOperandName: { array: false, nullable: false, optional: true, type: 'string' },
        rightOperandType: { array: false, nullable: false, optional: true, type: 'string' },
        rightOperandValue: { array: false, nullable: false, optional: true, type: 'string' },
        sortOrder: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const ConversationRecordLookupFieldSchema = {
    name: 'ConversationRecordLookupField',
    fields: {
        fieldName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ConversationDefinitionStepGoalMappingSchema = {
    name: 'ConversationDefinitionStepGoalMapping',
    fields: {
        goalName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ConversationSystemMessageSchema = {
    name: 'ConversationSystemMessage',
    fields: {
        systemMessageMappings: { array: true, nullable: false, optional: true, type: 'ConversationSystemMessageMapping' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ConversationSystemMessageMappingSchema = {
    name: 'ConversationSystemMessageMapping',
    fields: {
        mappingType: { array: false, nullable: false, optional: false, type: 'string' },
        parameterType: { array: false, nullable: false, optional: false, type: 'string' },
        variableName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ConversationDefinitionRichMessageSchema = {
    name: 'ConversationDefinitionRichMessage',
    fields: {
        messageDefinitionMappings: { array: true, nullable: false, optional: true, type: 'BotInvocationMapping' },
        messageDefinitionName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ConversationDefinitionGoalSchema = {
    name: 'ConversationDefinitionGoal',
    fields: {
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ConversationSystemDialogSchema = {
    name: 'ConversationSystemDialog',
    fields: {
        dialog: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ConversationVariableSchema = {
    name: 'ConversationVariable',
    fields: {
        SObjectType: { array: false, nullable: false, optional: true, type: 'string' },
        collectionType: { array: false, nullable: false, optional: true, type: 'string' },
        dataType: { array: false, nullable: false, optional: false, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ConversationDefinitionNlpProviderSchema = {
    name: 'ConversationDefinitionNlpProvider',
    fields: {
        language: { array: false, nullable: false, optional: true, type: 'string' },
        nlpProviderName: { array: false, nullable: false, optional: true, type: 'string' },
        nlpProviderType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ConversationContextVariableSchema = {
    name: 'ConversationContextVariable',
    fields: {
        SObjectType: { array: false, nullable: false, optional: true, type: 'string' },
        contextVariableMappings: { array: true, nullable: false, optional: true, type: 'ConversationContextVariableMapping' },
        dataType: { array: false, nullable: false, optional: false, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ConversationContextVariableMappingSchema = {
    name: 'ConversationContextVariableMapping',
    fields: {
        SObjectType: { array: false, nullable: false, optional: false, type: 'string' },
        fieldName: { array: false, nullable: false, optional: false, type: 'string' },
        messageType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ConversationDefinitionChannelProviderSchema = {
    name: 'ConversationDefinitionChannelProvider',
    fields: {
        agentRequired: { array: false, nullable: false, optional: true, type: 'boolean' },
        chatButtonName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const BotBlockSchema = {
    name: 'BotBlock',
    extends: 'Metadata',
    fields: {
        botBlockVersions: { array: true, nullable: false, optional: true, type: 'BotBlockVersion' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        icon: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        richContentEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const BotBlockVersionSchema = {
    name: 'BotBlockVersion',
    extends: 'Metadata',
    fields: {
        botDialogs: { array: true, nullable: false, optional: true, type: 'BotDialog' },
        conversationGoals: { array: true, nullable: false, optional: true, type: 'ConversationDefinitionGoal' },
        conversationLanguages: { array: false, nullable: false, optional: false, type: 'string' },
        conversationVariables: { array: true, nullable: false, optional: true, type: 'ConversationVariable' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        mlDomain: { array: false, nullable: false, optional: false, type: 'LocalMlDomain' },
        status: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const BotSettingsSchema = {
    name: 'BotSettings',
    extends: 'Metadata',
    fields: {
        enableBots: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const BotTemplateSchema = {
    name: 'BotTemplate',
    extends: 'Metadata',
    fields: {
        botDialogGroups: { array: true, nullable: false, optional: true, type: 'BotDialogGroup' },
        botDialogs: { array: true, nullable: false, optional: true, type: 'BotDialog' },
        contextVariables: { array: true, nullable: false, optional: true, type: 'ConversationContextVariable' },
        conversationGoals: { array: true, nullable: false, optional: true, type: 'ConversationDefinitionGoal' },
        conversationLanguages: { array: false, nullable: false, optional: false, type: 'string' },
        conversationSystemDialogs: { array: true, nullable: false, optional: true, type: 'ConversationSystemDialog' },
        conversationVariables: { array: true, nullable: false, optional: true, type: 'ConversationVariable' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        entryDialog: { array: false, nullable: false, optional: true, type: 'string' },
        icon: { array: false, nullable: false, optional: true, type: 'string' },
        mainMenuDialog: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        mlDomain: { array: false, nullable: false, optional: true, type: 'LocalMlDomain' },
        richContentEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const BrandingSetSchema = {
    name: 'BrandingSet',
    extends: 'Metadata',
    fields: {
        brandingSetProperty: { array: true, nullable: false, optional: true, type: 'BrandingSetProperty' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const BrandingSetPropertySchema = {
    name: 'BrandingSetProperty',
    fields: {
        propertyName: { array: false, nullable: false, optional: false, type: 'string' },
        propertyValue: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const BriefcaseDefinitionSchema = {
    name: 'BriefcaseDefinition',
    extends: 'Metadata',
    fields: {
        briefcaseRules: { array: true, nullable: false, optional: true, type: 'BriefcaseRule' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: false, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const BriefcaseRuleSchema = {
    name: 'BriefcaseRule',
    fields: {
        briefcaseRuleFilters: { array: true, nullable: false, optional: true, type: 'BriefcaseRuleFilter' },
        filterLogic: { array: false, nullable: false, optional: true, type: 'string' },
        isAscendingOrder: { array: false, nullable: false, optional: true, type: 'boolean' },
        orderBy: { array: false, nullable: false, optional: true, type: 'string' },
        queryScope: { array: false, nullable: false, optional: true, type: 'string' },
        recordLimit: { array: false, nullable: false, optional: true, type: 'number' },
        relatedRules: { array: true, nullable: false, optional: true, type: 'BriefcaseRule' },
        relationshipField: { array: false, nullable: false, optional: true, type: 'string' },
        relationshipType: { array: false, nullable: false, optional: true, type: 'string' },
        targetEntity: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const BriefcaseRuleFilterSchema = {
    name: 'BriefcaseRuleFilter',
    fields: {
        filterOperator: { array: false, nullable: false, optional: false, type: 'string' },
        filterSeqNumber: { array: false, nullable: false, optional: false, type: 'number' },
        filterValue: { array: false, nullable: false, optional: true, type: 'string' },
        targetEntityField: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const BusinessHoursEntrySchema = {
    name: 'BusinessHoursEntry',
    extends: 'Metadata',
    fields: {
        active: { array: false, nullable: false, optional: true, type: 'boolean' },
        default: { array: false, nullable: false, optional: false, type: 'boolean' },
        fridayEndTime: { array: false, nullable: false, optional: true, type: 'string' },
        fridayStartTime: { array: false, nullable: false, optional: true, type: 'string' },
        mondayEndTime: { array: false, nullable: false, optional: true, type: 'string' },
        mondayStartTime: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: true, type: 'string' },
        saturdayEndTime: { array: false, nullable: false, optional: true, type: 'string' },
        saturdayStartTime: { array: false, nullable: false, optional: true, type: 'string' },
        sundayEndTime: { array: false, nullable: false, optional: true, type: 'string' },
        sundayStartTime: { array: false, nullable: false, optional: true, type: 'string' },
        thursdayEndTime: { array: false, nullable: false, optional: true, type: 'string' },
        thursdayStartTime: { array: false, nullable: false, optional: true, type: 'string' },
        timeZoneId: { array: false, nullable: false, optional: true, type: 'string' },
        tuesdayEndTime: { array: false, nullable: false, optional: true, type: 'string' },
        tuesdayStartTime: { array: false, nullable: false, optional: true, type: 'string' },
        wednesdayEndTime: { array: false, nullable: false, optional: true, type: 'string' },
        wednesdayStartTime: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const BusinessHoursSettingsSchema = {
    name: 'BusinessHoursSettings',
    extends: 'Metadata',
    fields: {
        businessHours: { array: true, nullable: false, optional: true, type: 'BusinessHoursEntry' },
        holidays: { array: true, nullable: false, optional: true, type: 'Holiday' },
    }
}

const HolidaySchema = {
    name: 'Holiday',
    fields: {
        activityDate: { array: false, nullable: false, optional: true, type: 'string' },
        businessHours: { array: true, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        endTime: { array: false, nullable: false, optional: true, type: 'string' },
        isRecurring: { array: false, nullable: false, optional: true, type: 'boolean' },
        name: { array: false, nullable: false, optional: true, type: 'string' },
        recurrenceDayOfMonth: { array: false, nullable: false, optional: true, type: 'number' },
        recurrenceDayOfWeek: { array: true, nullable: false, optional: true, type: 'string' },
        recurrenceDayOfWeekMask: { array: false, nullable: false, optional: true, type: 'number' },
        recurrenceEndDate: { array: false, nullable: false, optional: true, type: 'string' },
        recurrenceInstance: { array: false, nullable: false, optional: true, type: 'string' },
        recurrenceInterval: { array: false, nullable: false, optional: true, type: 'number' },
        recurrenceMonthOfYear: { array: false, nullable: false, optional: true, type: 'string' },
        recurrenceStartDate: { array: false, nullable: false, optional: true, type: 'string' },
        recurrenceType: { array: false, nullable: false, optional: true, type: 'string' },
        startTime: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const BusinessProcessSchema = {
    name: 'BusinessProcess',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        values: { array: true, nullable: false, optional: true, type: 'PicklistValue' },
    }
}

const PicklistValueSchema = {
    name: 'PicklistValue',
    extends: 'Metadata',
    fields: {
        color: { array: false, nullable: false, optional: true, type: 'string' },
        default: { array: false, nullable: false, optional: false, type: 'boolean' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        allowEmail: { array: false, nullable: false, optional: true, type: 'boolean' },
        closed: { array: false, nullable: false, optional: true, type: 'boolean' },
        controllingFieldValues: { array: true, nullable: false, optional: true, type: 'string' },
        converted: { array: false, nullable: false, optional: true, type: 'boolean' },
        cssExposed: { array: false, nullable: false, optional: true, type: 'boolean' },
        forecastCategory: { array: false, nullable: false, optional: true, type: 'string' },
        highPriority: { array: false, nullable: false, optional: true, type: 'boolean' },
        probability: { array: false, nullable: false, optional: true, type: 'number' },
        reverseRole: { array: false, nullable: false, optional: true, type: 'string' },
        reviewed: { array: false, nullable: false, optional: true, type: 'boolean' },
        won: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const BusinessProcessGroupSchema = {
    name: 'BusinessProcessGroup',
    extends: 'Metadata',
    fields: {
        businessProcessDefinitions: { array: true, nullable: false, optional: true, type: 'BusinessProcessDefinition' },
        customerSatisfactionMetric: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const BusinessProcessDefinitionSchema = {
    name: 'BusinessProcessDefinition',
    fields: {
        businessProcessFeedbacks: { array: true, nullable: false, optional: true, type: 'BusinessProcessFeedback' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        sequenceNumber: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const BusinessProcessFeedbackSchema = {
    name: 'BusinessProcessFeedback',
    fields: {
        actionName: { array: false, nullable: false, optional: false, type: 'string' },
        actionParam: { array: false, nullable: false, optional: false, type: 'string' },
        actionType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const BusinessProcessTypeDefinitionSchema = {
    name: 'BusinessProcessTypeDefinition',
    extends: 'Metadata',
    fields: {
        applicationUsageType: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CMSConnectSourceSchema = {
    name: 'CMSConnectSource',
    extends: 'Metadata',
    fields: {
        cmsConnectAsset: { array: true, nullable: false, optional: true, type: 'CMSConnectAsset' },
        cmsConnectLanguage: { array: true, nullable: false, optional: true, type: 'CMSConnectLanguage' },
        cmsConnectPersonalization: { array: false, nullable: false, optional: true, type: 'CMSConnectPersonalization' },
        cmsConnectResourceType: { array: true, nullable: false, optional: true, type: 'CMSConnectResourceType' },
        connectionType: { array: false, nullable: false, optional: false, type: 'string' },
        cssScope: { array: false, nullable: false, optional: true, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        languageEnabled: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        namedCredential: { array: false, nullable: false, optional: true, type: 'string' },
        personalizationEnabled: { array: false, nullable: false, optional: true, type: 'string' },
        rootPath: { array: false, nullable: false, optional: true, type: 'string' },
        sortOrder: { array: false, nullable: false, optional: false, type: 'number' },
        status: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
        websiteUrl: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const CMSConnectAssetSchema = {
    name: 'CMSConnectAsset',
    fields: {
        assetPath: { array: false, nullable: false, optional: false, type: 'string' },
        assetType: { array: false, nullable: false, optional: false, type: 'string' },
        sortOrder: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const CMSConnectLanguageSchema = {
    name: 'CMSConnectLanguage',
    fields: {
        cmsLanguage: { array: false, nullable: false, optional: false, type: 'string' },
        language: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CMSConnectPersonalizationSchema = {
    name: 'CMSConnectPersonalization',
    fields: {
        connectorPage: { array: false, nullable: false, optional: false, type: 'string' },
        connectorPageAsset: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CMSConnectResourceTypeSchema = {
    name: 'CMSConnectResourceType',
    fields: {
        cmsConnectResourceDefinition: { array: true, nullable: false, optional: true, type: 'CMSConnectResourceDefinition' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        resourceType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CMSConnectResourceDefinitionSchema = {
    name: 'CMSConnectResourceDefinition',
    fields: {
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        options: { array: false, nullable: false, optional: false, type: 'number' },
        payloadType: { array: false, nullable: false, optional: false, type: 'string' },
        resourceIdPath: { array: false, nullable: false, optional: true, type: 'string' },
        resourceNamePath: { array: false, nullable: false, optional: true, type: 'string' },
        resourcePath: { array: false, nullable: false, optional: false, type: 'string' },
        rootNodePath: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const CallCenterSchema = {
    name: 'CallCenter',
    extends: 'Metadata',
    fields: {
        adapterUrl: { array: false, nullable: false, optional: true, type: 'string' },
        contactCenterChannels: { array: true, nullable: false, optional: true, type: 'ContactCenterChannel' },
        customSettings: { array: false, nullable: false, optional: true, type: 'string' },
        displayName: { array: false, nullable: false, optional: false, type: 'string' },
        displayNameLabel: { array: false, nullable: false, optional: false, type: 'string' },
        internalNameLabel: { array: false, nullable: false, optional: false, type: 'string' },
        sections: { array: true, nullable: false, optional: true, type: 'CallCenterSection' },
        vendorCallCenterStatusMaps: { array: true, nullable: false, optional: true, type: 'VendorCallCenterStatusMap' },
        version: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ContactCenterChannelSchema = {
    name: 'ContactCenterChannel',
    fields: {
        channel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CallCenterSectionSchema = {
    name: 'CallCenterSection',
    fields: {
        items: { array: true, nullable: false, optional: true, type: 'CallCenterItem' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CallCenterItemSchema = {
    name: 'CallCenterItem',
    fields: {
        label: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const VendorCallCenterStatusMapSchema = {
    name: 'VendorCallCenterStatusMap',
    fields: {
        externalStatus: { array: false, nullable: false, optional: false, type: 'string' },
        servicePresenceStatus: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CallCenterRoutingMapSchema = {
    name: 'CallCenterRoutingMap',
    extends: 'Metadata',
    fields: {
        callCenter: { array: false, nullable: false, optional: false, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        externalId: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        quickConnect: { array: false, nullable: false, optional: true, type: 'string' },
        referenceRecord: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CallCoachingMediaProviderSchema = {
    name: 'CallCoachingMediaProvider',
    extends: 'Metadata',
    fields: {
        isActive: { array: false, nullable: false, optional: false, type: 'boolean' },
        providerDescription: { array: false, nullable: false, optional: false, type: 'string' },
        providerName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CallCtrAgentFavTrfrDestSchema = {
    name: 'CallCtrAgentFavTrfrDest',
    extends: 'Metadata',
    fields: {
        agent: { array: false, nullable: false, optional: false, type: 'string' },
        callCenter: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        transferDestination: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CampaignInfluenceModelSchema = {
    name: 'CampaignInfluenceModel',
    extends: 'Metadata',
    fields: {
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        isDefaultModel: { array: false, nullable: false, optional: false, type: 'boolean' },
        isModelLocked: { array: false, nullable: false, optional: false, type: 'boolean' },
        modelDescription: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        recordPreference: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const CampaignSettingsSchema = {
    name: 'CampaignSettings',
    extends: 'Metadata',
    fields: {
        aiAttributionTimeframe: { array: false, nullable: false, optional: true, type: 'number' },
        enableAIAttribution: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAccountsAsCM: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAutoCampInfluenceDisabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableB2bmaCampaignInfluence2: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCampaignHistoryTrackEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCampaignInfluence2: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCampaignMemberTWCF: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEKAI: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSuppressNoValueCI2: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const CanvasMetadataSchema = {
    name: 'CanvasMetadata',
    extends: 'Metadata',
    fields: {
        accessMethod: { array: false, nullable: false, optional: false, type: 'string' },
        canvasOptions: { array: false, nullable: false, optional: true, type: 'string' },
        canvasUrl: { array: false, nullable: false, optional: false, type: 'string' },
        lifecycleClass: { array: false, nullable: false, optional: true, type: 'string' },
        locationOptions: { array: false, nullable: false, optional: true, type: 'string' },
        samlInitiationMethod: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const CareBenefitVerifySettingsSchema = {
    name: 'CareBenefitVerifySettings',
    extends: 'Metadata',
    fields: {
        codeSetType: { array: false, nullable: false, optional: true, type: 'string' },
        defaultNpi: { array: false, nullable: false, optional: true, type: 'string' },
        generalPlanServiceTypeCode: { array: false, nullable: false, optional: true, type: 'string' },
        isDefault: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        organizationName: { array: false, nullable: false, optional: true, type: 'string' },
        serviceApexClass: { array: false, nullable: false, optional: true, type: 'string' },
        serviceNamedCredential: { array: false, nullable: false, optional: true, type: 'string' },
        serviceTypeSourceSystem: { array: false, nullable: false, optional: true, type: 'string' },
        uriPath: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const CareRequestConfigurationSchema = {
    name: 'CareRequestConfiguration',
    extends: 'Metadata',
    fields: {
        careRequestRecordType: { array: false, nullable: false, optional: false, type: 'string' },
        careRequestRecords: { array: true, nullable: false, optional: true, type: 'CareRequestRecords' },
        careRequestType: { array: false, nullable: false, optional: false, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        isDefaultRecordType: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CareRequestRecordsSchema = {
    name: 'CareRequestRecords',
    fields: {
        careRequestRecord: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CaseSettingsSchema = {
    name: 'CaseSettings',
    extends: 'Metadata',
    fields: {
        caseAssignNotificationTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        caseAutoProcUser: { array: false, nullable: false, optional: true, type: 'boolean' },
        caseCloseNotificationTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        caseCommentNotificationTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        caseCreateNotificationTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        caseFeedItemSettings: { array: true, nullable: false, optional: true, type: 'FeedItemSettings' },
        caseFeedReadUnreadLtng: { array: false, nullable: false, optional: true, type: 'boolean' },
        caseMergeInLightning: { array: false, nullable: false, optional: true, type: 'boolean' },
        closeCaseThroughStatusChange: { array: false, nullable: false, optional: true, type: 'boolean' },
        defaultCaseFeedLayoutOn: { array: false, nullable: false, optional: true, type: 'boolean' },
        defaultCaseOwner: { array: false, nullable: false, optional: true, type: 'string' },
        defaultCaseOwnerType: { array: false, nullable: false, optional: true, type: 'string' },
        defaultCaseUser: { array: false, nullable: false, optional: true, type: 'string' },
        emailActionDefaultsHandlerClass: { array: false, nullable: false, optional: true, type: 'string' },
        emailToCase: { array: false, nullable: false, optional: true, type: 'EmailToCaseSettings' },
        enableCaseFeed: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCaseSwarming: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCollapseEmailThread: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDraftEmails: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEarlyEscalationRuleTriggers: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEmailActionDefaultsHandler: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEmailContactOnCasePost: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEscalateQfiToCaseInternal: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEscalateQfiToCaseNetworks: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableExtNetworksCaseFeedEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMultiLangSolnSrchCSS: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMultiLangSolnSrchPKB: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMultiLangSolution: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSolutionCategory: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSolutionInlineCategory: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSolutionShortSummary: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSuggestedArticlesApplication: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSuggestedArticlesCustomerPortal: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSuggestedArticlesPartnerPortal: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSuggestedSolutions: { array: false, nullable: false, optional: true, type: 'boolean' },
        escalateCaseBefore: { array: false, nullable: false, optional: true, type: 'boolean' },
        genericMessageEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        keepCaseMergeRecords: { array: false, nullable: false, optional: true, type: 'boolean' },
        keepRecordTypeOnAssignmentRule: { array: false, nullable: false, optional: true, type: 'boolean' },
        notifyContactOnCaseComment: { array: false, nullable: false, optional: true, type: 'boolean' },
        notifyDefaultCaseOwner: { array: false, nullable: false, optional: true, type: 'boolean' },
        notifyOwnerOnCaseComment: { array: false, nullable: false, optional: true, type: 'boolean' },
        notifyOwnerOnCaseOwnerChange: { array: false, nullable: false, optional: true, type: 'boolean' },
        predictiveSupportEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        showEmailAttachmentsInCaseAttachmentsRL: { array: false, nullable: false, optional: true, type: 'boolean' },
        showFewerCloseActions: { array: false, nullable: false, optional: true, type: 'boolean' },
        systemUserEmail: { array: false, nullable: false, optional: true, type: 'string' },
        useSystemEmailAddress: { array: false, nullable: false, optional: true, type: 'boolean' },
        useSystemUserAsDefaultCaseUser: { array: false, nullable: false, optional: true, type: 'boolean' },
        visibleInCssCheckbox: { array: false, nullable: false, optional: true, type: 'boolean' },
        webToCase: { array: false, nullable: false, optional: true, type: 'WebToCaseSettings' },
    }
}

const FeedItemSettingsSchema = {
    name: 'FeedItemSettings',
    fields: {
        characterLimit: { array: false, nullable: false, optional: true, type: 'number' },
        displayFormat: { array: false, nullable: false, optional: true, type: 'string' },
        feedItemType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const EmailToCaseSettingsSchema = {
    name: 'EmailToCaseSettings',
    fields: {
        enableE2CAttachmentAsFile: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableE2CSourceTracking: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEmailToCase: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHtmlEmail: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOnDemandEmailToCase: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableThreadIDInBody: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableThreadIDInSubject: { array: false, nullable: false, optional: true, type: 'boolean' },
        notifyOwnerOnNewCaseEmail: { array: false, nullable: false, optional: true, type: 'boolean' },
        overEmailLimitAction: { array: false, nullable: false, optional: true, type: 'string' },
        preQuoteSignature: { array: false, nullable: false, optional: true, type: 'boolean' },
        routingAddresses: { array: true, nullable: false, optional: true, type: 'EmailToCaseRoutingAddress' },
        unauthorizedSenderAction: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const EmailToCaseRoutingAddressSchema = {
    name: 'EmailToCaseRoutingAddress',
    fields: {
        addressType: { array: false, nullable: false, optional: true, type: 'string' },
        authorizedSenders: { array: false, nullable: false, optional: true, type: 'string' },
        caseOrigin: { array: false, nullable: false, optional: true, type: 'string' },
        caseOwner: { array: false, nullable: false, optional: true, type: 'string' },
        caseOwnerType: { array: false, nullable: false, optional: true, type: 'string' },
        casePriority: { array: false, nullable: false, optional: true, type: 'string' },
        createTask: { array: false, nullable: false, optional: true, type: 'boolean' },
        emailAddress: { array: false, nullable: false, optional: true, type: 'string' },
        emailServicesAddress: { array: false, nullable: false, optional: true, type: 'string' },
        fallbackQueue: { array: false, nullable: false, optional: true, type: 'string' },
        isVerified: { array: false, nullable: false, optional: true, type: 'boolean' },
        routingFlow: { array: false, nullable: false, optional: true, type: 'string' },
        routingName: { array: false, nullable: false, optional: true, type: 'string' },
        saveEmailHeaders: { array: false, nullable: false, optional: true, type: 'boolean' },
        taskStatus: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const WebToCaseSettingsSchema = {
    name: 'WebToCaseSettings',
    fields: {
        caseOrigin: { array: false, nullable: false, optional: true, type: 'string' },
        defaultResponseTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        enableWebToCase: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const CaseSubjectParticleSchema = {
    name: 'CaseSubjectParticle',
    extends: 'Metadata',
    fields: {
        index: { array: false, nullable: false, optional: false, type: 'number' },
        textField: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ChannelLayoutSchema = {
    name: 'ChannelLayout',
    extends: 'Metadata',
    fields: {
        doesExcludeFieldLabels: { array: false, nullable: false, optional: true, type: 'boolean' },
        doesExcludeFiles: { array: false, nullable: false, optional: true, type: 'boolean' },
        enabledChannels: { array: true, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        layoutItems: { array: true, nullable: false, optional: true, type: 'ChannelLayoutItem' },
        recordType: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ChannelLayoutItemSchema = {
    name: 'ChannelLayoutItem',
    fields: {
        field: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ChannelObjectLinkingRuleSchema = {
    name: 'ChannelObjectLinkingRule',
    extends: 'Metadata',
    fields: {
        actionForNoRecordFound: { array: false, nullable: false, optional: false, type: 'string' },
        actionForSingleRecordFound: { array: false, nullable: false, optional: false, type: 'string' },
        channelType: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        isLinkedRecordOpenedAsSubTab: { array: false, nullable: false, optional: false, type: 'boolean' },
        isRuleActive: { array: false, nullable: false, optional: false, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        objectToLink: { array: false, nullable: false, optional: false, type: 'string' },
        ruleName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ChatterAnswersSettingsSchema = {
    name: 'ChatterAnswersSettings',
    extends: 'Metadata',
    fields: {
        emailFollowersOnBestAnswer: { array: false, nullable: false, optional: true, type: 'boolean' },
        emailFollowersOnReply: { array: false, nullable: false, optional: true, type: 'boolean' },
        emailOwnerOnPrivateReply: { array: false, nullable: false, optional: true, type: 'boolean' },
        emailOwnerOnReply: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAnswerViaEmail: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableChatterAnswers: { array: false, nullable: false, optional: false, type: 'boolean' },
        enableFacebookSSO: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableInlinePublisher: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableReputation: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRichTextEditor: { array: false, nullable: false, optional: true, type: 'boolean' },
        facebookAuthProvider: { array: false, nullable: false, optional: true, type: 'string' },
        showInPortals: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ChatterEmailsMDSettingsSchema = {
    name: 'ChatterEmailsMDSettings',
    extends: 'Metadata',
    fields: {
        enableChatterDigestEmailsApiOnly: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableChatterEmailAttachment: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCollaborationEmail: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDisplayAppDownloadBadges: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEmailReplyToChatter: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEmailToChatter: { array: false, nullable: false, optional: true, type: 'boolean' },
        noQnOwnNotifyOnCaseCmt: { array: false, nullable: false, optional: true, type: 'boolean' },
        noQnOwnNotifyOnRep: { array: false, nullable: false, optional: true, type: 'boolean' },
        noQnSubNotifyOnBestR: { array: false, nullable: false, optional: true, type: 'boolean' },
        noQnSubNotifyOnRep: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ChatterExtensionSchema = {
    name: 'ChatterExtension',
    extends: 'Metadata',
    fields: {
        compositionComponent: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: false, type: 'string' },
        extensionName: { array: false, nullable: false, optional: false, type: 'string' },
        headerText: { array: false, nullable: false, optional: true, type: 'string' },
        hoverText: { array: false, nullable: false, optional: true, type: 'string' },
        icon: { array: false, nullable: false, optional: false, type: 'string' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        renderComponent: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ChatterSettingsSchema = {
    name: 'ChatterSettings',
    extends: 'Metadata',
    fields: {
        allowChatterGroupArchiving: { array: false, nullable: false, optional: true, type: 'boolean' },
        allowRecordsInChatterGroup: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableApprovalRequest: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCaseFeedRelativeTimestamps: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableChatter: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableChatterEmoticons: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFeedEdit: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFeedPinning: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFeedsDraftPosts: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFeedsRichText: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableInviteCsnUsers: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOutOfOfficeEnabledPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRichLinkPreviewsInFeed: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTodayRecsInFeed: { array: false, nullable: false, optional: true, type: 'boolean' },
        unlistedGroupsEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const CleanDataServiceSchema = {
    name: 'CleanDataService',
    extends: 'Metadata',
    fields: {
        cleanRules: { array: true, nullable: false, optional: true, type: 'CleanRule' },
        description: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        matchEngine: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CleanRuleSchema = {
    name: 'CleanRule',
    fields: {
        bulkEnabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        bypassTriggers: { array: false, nullable: false, optional: false, type: 'boolean' },
        bypassWorkflow: { array: false, nullable: false, optional: false, type: 'boolean' },
        description: { array: false, nullable: false, optional: false, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        fieldMappings: { array: true, nullable: false, optional: true, type: 'FieldMapping' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        matchRule: { array: false, nullable: false, optional: false, type: 'string' },
        sourceSobjectType: { array: false, nullable: false, optional: false, type: 'string' },
        status: { array: false, nullable: false, optional: false, type: 'string' },
        targetSobjectType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FieldMappingSchema = {
    name: 'FieldMapping',
    fields: {
        SObjectType: { array: false, nullable: false, optional: false, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        fieldMappingRows: { array: true, nullable: false, optional: true, type: 'FieldMappingRow' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FieldMappingRowSchema = {
    name: 'FieldMappingRow',
    fields: {
        SObjectType: { array: false, nullable: false, optional: false, type: 'string' },
        fieldMappingFields: { array: true, nullable: false, optional: true, type: 'FieldMappingField' },
        fieldName: { array: false, nullable: false, optional: false, type: 'string' },
        mappingOperation: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FieldMappingFieldSchema = {
    name: 'FieldMappingField',
    fields: {
        dataServiceField: { array: false, nullable: false, optional: false, type: 'string' },
        dataServiceObjectName: { array: false, nullable: false, optional: false, type: 'string' },
        priority: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const CommandActionSchema = {
    name: 'CommandAction',
    extends: 'Metadata',
    fields: {
        actionType: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        intents: { array: true, nullable: false, optional: true, type: 'CommandActionIntent' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        parameters: { array: true, nullable: false, optional: true, type: 'CommandActionParam' },
        responseTemplates: { array: true, nullable: false, optional: true, type: 'CommandActionResponse' },
        target: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const CommandActionIntentSchema = {
    name: 'CommandActionIntent',
    fields: {
        phrase: { array: false, nullable: false, optional: false, type: 'string' },
        responseTemplates: { array: true, nullable: false, optional: true, type: 'CommandActionResponse' },
    }
}

const CommandActionResponseSchema = {
    name: 'CommandActionResponse',
    fields: {
        template: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CommandActionParamSchema = {
    name: 'CommandActionParam',
    fields: {
        defaultValue: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        required: { array: false, nullable: false, optional: true, type: 'boolean' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CommerceSettingsSchema = {
    name: 'CommerceSettings',
    extends: 'Metadata',
    fields: {
        commerceEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const CommunitiesSettingsSchema = {
    name: 'CommunitiesSettings',
    extends: 'Metadata',
    fields: {
        applyLoginPageTypeToEmbeddedLogin: { array: false, nullable: false, optional: true, type: 'boolean' },
        blockEmbeddedLoginUnknownURLRedirect: { array: false, nullable: false, optional: true, type: 'boolean' },
        canModerateAllFeedPosts: { array: false, nullable: false, optional: true, type: 'boolean' },
        canModerateInternalFeedPosts: { array: false, nullable: false, optional: true, type: 'boolean' },
        embeddedVisualforcePages: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCommunityWorkspaces: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCspContactVisibilityPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCspNotesOnAccConPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEnablePRM: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableExternalAccHierPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableGuestPermDisOptOutCruc: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableGuestRecordReassignOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableGuestSecurityOptOutCruc: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableGuvSecurityOptOutPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableInviteChatterGuestEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableNameFieldsUserPIIEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableNetPortalUserReportOpts: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableNetworksEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOotbProfExtUserOpsEnable: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePRMAccRelPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePowerCustomerCaseStatus: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePreventBadgeGuestAccess: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRelaxPartnerAccountFieldPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableUnsupportedBrowserModalPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableUsernameUniqForOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const CommunitySchema = {
    name: 'Community',
    extends: 'Metadata',
    fields: {
        active: { array: false, nullable: false, optional: true, type: 'boolean' },
        chatterAnswersFacebookSsoUrl: { array: false, nullable: false, optional: true, type: 'string' },
        communityFeedPage: { array: false, nullable: false, optional: true, type: 'string' },
        dataCategoryName: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        emailFooterDocument: { array: false, nullable: false, optional: true, type: 'string' },
        emailHeaderDocument: { array: false, nullable: false, optional: true, type: 'string' },
        emailNotificationUrl: { array: false, nullable: false, optional: true, type: 'string' },
        enableChatterAnswers: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePrivateQuestions: { array: false, nullable: false, optional: true, type: 'boolean' },
        expertsGroup: { array: false, nullable: false, optional: true, type: 'string' },
        portal: { array: false, nullable: false, optional: true, type: 'string' },
        reputationLevels: { array: false, nullable: false, optional: true, type: 'ReputationLevels' },
        showInPortal: { array: false, nullable: false, optional: true, type: 'boolean' },
        site: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ReputationLevelsSchema = {
    name: 'ReputationLevels',
    fields: {
        chatterAnswersReputationLevels: { array: true, nullable: false, optional: true, type: 'ChatterAnswersReputationLevel' },
        ideaReputationLevels: { array: true, nullable: false, optional: true, type: 'IdeaReputationLevel' },
    }
}

const ChatterAnswersReputationLevelSchema = {
    name: 'ChatterAnswersReputationLevel',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const IdeaReputationLevelSchema = {
    name: 'IdeaReputationLevel',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const CommunityTemplateDefinitionSchema = {
    name: 'CommunityTemplateDefinition',
    extends: 'Metadata',
    fields: {
        baseTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        bundlesInfo: { array: true, nullable: false, optional: true, type: 'CommunityTemplateBundleInfo' },
        category: { array: false, nullable: false, optional: false, type: 'string' },
        defaultBrandingSet: { array: false, nullable: false, optional: true, type: 'string' },
        defaultThemeDefinition: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        enableExtendedCleanUpOnDelete: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        navigationLinkSet: { array: true, nullable: false, optional: true, type: 'NavigationLinkSet' },
        pageSetting: { array: true, nullable: false, optional: true, type: 'CommunityTemplatePageSetting' },
        publisher: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const CommunityTemplateBundleInfoSchema = {
    name: 'CommunityTemplateBundleInfo',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        image: { array: false, nullable: false, optional: true, type: 'string' },
        order: { array: false, nullable: false, optional: false, type: 'number' },
        title: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CommunityThemeBundleInfoSchema = {
    name: 'CommunityThemeBundleInfo',
    extends: 'CommunityTemplateBundleInfo',
    fields: {
        
    }
}

const NavigationLinkSetSchema = {
    name: 'NavigationLinkSet',
    fields: {
        navigationMenuItem: { array: true, nullable: false, optional: true, type: 'NavigationMenuItem' },
    }
}

const NavigationMenuItemSchema = {
    name: 'NavigationMenuItem',
    fields: {
        defaultListViewId: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        menuItemBranding: { array: false, nullable: false, optional: true, type: 'NavigationMenuItemBranding' },
        position: { array: false, nullable: false, optional: false, type: 'number' },
        publiclyAvailable: { array: false, nullable: false, optional: true, type: 'boolean' },
        subMenu: { array: false, nullable: false, optional: true, type: 'NavigationSubMenu' },
        target: { array: false, nullable: false, optional: true, type: 'string' },
        targetPreference: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const NavigationMenuItemBrandingSchema = {
    name: 'NavigationMenuItemBranding',
    fields: {
        tileImage: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const NavigationSubMenuSchema = {
    name: 'NavigationSubMenu',
    fields: {
        navigationMenuItem: { array: true, nullable: false, optional: true, type: 'NavigationMenuItem' },
    }
}

const CommunityTemplatePageSettingSchema = {
    name: 'CommunityTemplatePageSetting',
    fields: {
        page: { array: false, nullable: false, optional: false, type: 'string' },
        themeLayout: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CommunityThemeDefinitionSchema = {
    name: 'CommunityThemeDefinition',
    extends: 'Metadata',
    fields: {
        bundlesInfo: { array: true, nullable: false, optional: true, type: 'CommunityThemeBundleInfo' },
        customThemeLayoutType: { array: true, nullable: false, optional: true, type: 'CommunityCustomThemeLayoutType' },
        defaultBrandingSet: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        enableExtendedCleanUpOnDelete: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        publisher: { array: false, nullable: false, optional: true, type: 'string' },
        themeRouteOverride: { array: true, nullable: false, optional: true, type: 'CommunityThemeRouteOverride' },
        themeSetting: { array: true, nullable: false, optional: true, type: 'CommunityThemeSetting' },
    }
}

const CommunityCustomThemeLayoutTypeSchema = {
    name: 'CommunityCustomThemeLayoutType',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CommunityThemeRouteOverrideSchema = {
    name: 'CommunityThemeRouteOverride',
    fields: {
        customThemeLayoutType: { array: false, nullable: false, optional: true, type: 'string' },
        pageAttributes: { array: false, nullable: false, optional: false, type: 'string' },
        pageType: { array: false, nullable: false, optional: false, type: 'string' },
        themeLayoutType: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const CommunityThemeSettingSchema = {
    name: 'CommunityThemeSetting',
    fields: {
        customThemeLayoutType: { array: false, nullable: false, optional: true, type: 'string' },
        themeLayout: { array: false, nullable: false, optional: false, type: 'string' },
        themeLayoutType: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const CompactLayoutSchema = {
    name: 'CompactLayout',
    extends: 'Metadata',
    fields: {
        fields: { array: true, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CompanySettingsSchema = {
    name: 'CompanySettings',
    extends: 'Metadata',
    fields: {
        enableCustomFiscalYear: { array: false, nullable: false, optional: false, type: 'boolean' },
        fiscalYear: { array: false, nullable: false, optional: true, type: 'FiscalYearSettings' },
    }
}

const FiscalYearSettingsSchema = {
    name: 'FiscalYearSettings',
    fields: {
        fiscalYearNameBasedOn: { array: false, nullable: false, optional: true, type: 'string' },
        startMonth: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ConnectedAppSchema = {
    name: 'ConnectedApp',
    extends: 'Metadata',
    fields: {
        attributes: { array: true, nullable: false, optional: true, type: 'ConnectedAppAttribute' },
        canvas: { array: false, nullable: false, optional: true, type: 'CanvasMetadata' },
        canvasConfig: { array: false, nullable: false, optional: true, type: 'ConnectedAppCanvasConfig' },
        contactEmail: { array: false, nullable: false, optional: false, type: 'string' },
        contactPhone: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        iconUrl: { array: false, nullable: false, optional: true, type: 'string' },
        infoUrl: { array: false, nullable: false, optional: true, type: 'string' },
        ipRanges: { array: true, nullable: false, optional: true, type: 'ConnectedAppIpRange' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        logoUrl: { array: false, nullable: false, optional: true, type: 'string' },
        mobileAppConfig: { array: false, nullable: false, optional: true, type: 'ConnectedAppMobileDetailConfig' },
        mobileStartUrl: { array: false, nullable: false, optional: true, type: 'string' },
        oauthConfig: { array: false, nullable: false, optional: true, type: 'ConnectedAppOauthConfig' },
        oauthPolicy: { array: false, nullable: false, optional: true, type: 'ConnectedAppOauthPolicy' },
        permissionSetName: { array: true, nullable: false, optional: true, type: 'string' },
        plugin: { array: false, nullable: false, optional: true, type: 'string' },
        pluginExecutionUser: { array: false, nullable: false, optional: true, type: 'string' },
        profileName: { array: true, nullable: false, optional: true, type: 'string' },
        samlConfig: { array: false, nullable: false, optional: true, type: 'ConnectedAppSamlConfig' },
        sessionPolicy: { array: false, nullable: false, optional: true, type: 'ConnectedAppSessionPolicy' },
        startUrl: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ConnectedAppAttributeSchema = {
    name: 'ConnectedAppAttribute',
    fields: {
        formula: { array: false, nullable: false, optional: false, type: 'string' },
        key: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ConnectedAppCanvasConfigSchema = {
    name: 'ConnectedAppCanvasConfig',
    fields: {
        accessMethod: { array: false, nullable: false, optional: false, type: 'string' },
        canvasUrl: { array: false, nullable: false, optional: false, type: 'string' },
        lifecycleClass: { array: false, nullable: false, optional: true, type: 'string' },
        locations: { array: true, nullable: false, optional: true, type: 'string' },
        options: { array: true, nullable: false, optional: true, type: 'string' },
        samlInitiationMethod: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ConnectedAppIpRangeSchema = {
    name: 'ConnectedAppIpRange',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        end: { array: false, nullable: false, optional: false, type: 'string' },
        start: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ConnectedAppMobileDetailConfigSchema = {
    name: 'ConnectedAppMobileDetailConfig',
    fields: {
        applicationBinaryFile: { array: false, nullable: false, optional: true, type: 'string' },
        applicationBinaryFileName: { array: false, nullable: false, optional: true, type: 'string' },
        applicationBundleIdentifier: { array: false, nullable: false, optional: true, type: 'string' },
        applicationFileLength: { array: false, nullable: false, optional: true, type: 'number' },
        applicationIconFile: { array: false, nullable: false, optional: true, type: 'string' },
        applicationIconFileName: { array: false, nullable: false, optional: true, type: 'string' },
        applicationInstallUrl: { array: false, nullable: false, optional: true, type: 'string' },
        devicePlatform: { array: false, nullable: false, optional: false, type: 'string' },
        deviceType: { array: false, nullable: false, optional: true, type: 'string' },
        minimumOsVersion: { array: false, nullable: false, optional: true, type: 'string' },
        privateApp: { array: false, nullable: false, optional: true, type: 'boolean' },
        version: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ConnectedAppOauthConfigSchema = {
    name: 'ConnectedAppOauthConfig',
    fields: {
        assetTokenConfig: { array: false, nullable: false, optional: true, type: 'ConnectedAppOauthAssetToken' },
        callbackUrl: { array: false, nullable: false, optional: false, type: 'string' },
        certificate: { array: false, nullable: false, optional: true, type: 'string' },
        consumerKey: { array: false, nullable: false, optional: true, type: 'string' },
        consumerSecret: { array: false, nullable: false, optional: true, type: 'string' },
        idTokenConfig: { array: false, nullable: false, optional: true, type: 'ConnectedAppOauthIdToken' },
        isAdminApproved: { array: false, nullable: false, optional: true, type: 'boolean' },
        isClientCredentialEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isCodeCredentialEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isCodeCredentialPostOnly: { array: false, nullable: false, optional: true, type: 'boolean' },
        isConsumerSecretOptional: { array: false, nullable: false, optional: true, type: 'boolean' },
        isIntrospectAllTokens: { array: false, nullable: false, optional: true, type: 'boolean' },
        isSecretRequiredForRefreshToken: { array: false, nullable: false, optional: true, type: 'boolean' },
        oauthClientCredentialUser: { array: false, nullable: false, optional: true, type: 'string' },
        scopes: { array: true, nullable: false, optional: true, type: 'string' },
        singleLogoutUrl: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ConnectedAppOauthAssetTokenSchema = {
    name: 'ConnectedAppOauthAssetToken',
    fields: {
        assetAudiences: { array: false, nullable: false, optional: false, type: 'string' },
        assetIncludeAttributes: { array: false, nullable: false, optional: false, type: 'boolean' },
        assetIncludeCustomPerms: { array: false, nullable: false, optional: false, type: 'boolean' },
        assetSigningCertId: { array: false, nullable: false, optional: false, type: 'string' },
        assetValidityPeriod: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const ConnectedAppOauthIdTokenSchema = {
    name: 'ConnectedAppOauthIdToken',
    fields: {
        idTokenAudience: { array: false, nullable: false, optional: true, type: 'string' },
        idTokenIncludeAttributes: { array: false, nullable: false, optional: true, type: 'boolean' },
        idTokenIncludeCustomPerms: { array: false, nullable: false, optional: true, type: 'boolean' },
        idTokenIncludeStandardClaims: { array: false, nullable: false, optional: true, type: 'boolean' },
        idTokenValidity: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const ConnectedAppOauthPolicySchema = {
    name: 'ConnectedAppOauthPolicy',
    fields: {
        ipRelaxation: { array: false, nullable: false, optional: false, type: 'string' },
        refreshTokenPolicy: { array: false, nullable: false, optional: false, type: 'string' },
        singleLogoutUrl: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ConnectedAppSamlConfigSchema = {
    name: 'ConnectedAppSamlConfig',
    fields: {
        acsUrl: { array: false, nullable: false, optional: false, type: 'string' },
        certificate: { array: false, nullable: false, optional: true, type: 'string' },
        encryptionCertificate: { array: false, nullable: false, optional: true, type: 'string' },
        encryptionType: { array: false, nullable: false, optional: true, type: 'string' },
        entityUrl: { array: false, nullable: false, optional: false, type: 'string' },
        issuer: { array: false, nullable: false, optional: true, type: 'string' },
        samlIdpSLOBindingEnum: { array: false, nullable: false, optional: true, type: 'string' },
        samlNameIdFormat: { array: false, nullable: false, optional: true, type: 'string' },
        samlSigningAlgoType: { array: false, nullable: false, optional: true, type: 'string' },
        samlSloUrl: { array: false, nullable: false, optional: true, type: 'string' },
        samlSubjectCustomAttr: { array: false, nullable: false, optional: true, type: 'string' },
        samlSubjectType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ConnectedAppSessionPolicySchema = {
    name: 'ConnectedAppSessionPolicy',
    fields: {
        policyAction: { array: false, nullable: false, optional: true, type: 'string' },
        sessionLevel: { array: false, nullable: false, optional: true, type: 'string' },
        sessionTimeout: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const ConnectedAppSettingsSchema = {
    name: 'ConnectedAppSettings',
    extends: 'Metadata',
    fields: {
        enableAdminApprovedAppsOnly: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAdminApprovedAppsOnlyForExternalUser: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSkipUserProvisioningWizardWelcomePage: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ContentSettingsSchema = {
    name: 'ContentSettings',
    extends: 'Metadata',
    fields: {
        enableCMSC2CConnections: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableChatterFileLink: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableContent: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableContentAutoAssign: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableContentDistForPortalUsers: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableContentDistPwOptionsBit1: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableContentDistPwOptionsBit2: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableContentDistribution: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableContentSupportMultiLanguage: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableContentWorkspaceAccess: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDeleteFileInContentPacks: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFileShareSetByRecord: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFilesUsrShareNetRestricted: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableJPGPreviews: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLibraryManagedFiles: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableShowChatterFilesInContent: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSiteGuestUserToUploadFiles: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableUploadFilesOnAttachments: { array: false, nullable: false, optional: true, type: 'boolean' },
        setValidContentTypeForAtchDocDownload: { array: false, nullable: false, optional: true, type: 'boolean' },
        skipContentAssetTriggers: { array: false, nullable: false, optional: true, type: 'boolean' },
        skipContentAssetTriggersOnDeploy: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ContractSettingsSchema = {
    name: 'ContractSettings',
    extends: 'Metadata',
    fields: {
        autoCalculateEndDate: { array: false, nullable: false, optional: true, type: 'boolean' },
        autoExpirationDelay: { array: false, nullable: false, optional: true, type: 'string' },
        autoExpirationRecipient: { array: false, nullable: false, optional: true, type: 'string' },
        autoExpireContracts: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableContractHistoryTracking: { array: false, nullable: false, optional: true, type: 'boolean' },
        notifyOwnersOnContractExpiration: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ConversationVendorInfoSchema = {
    name: 'ConversationVendorInfo',
    extends: 'Metadata',
    fields: {
        agentSSOSupported: { array: false, nullable: false, optional: true, type: 'boolean' },
        awsAccountKey: { array: false, nullable: false, optional: true, type: 'string' },
        awsRootEmail: { array: false, nullable: false, optional: true, type: 'string' },
        awsTenantVersion: { array: false, nullable: false, optional: true, type: 'number' },
        bridgeComponent: { array: false, nullable: false, optional: true, type: 'string' },
        clientAuthMode: { array: false, nullable: false, optional: true, type: 'string' },
        connectorUrl: { array: false, nullable: false, optional: true, type: 'string' },
        customConfig: { array: false, nullable: false, optional: true, type: 'string' },
        customLoginUrl: { array: false, nullable: false, optional: true, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        einsteinConversationInsightsSupported: { array: false, nullable: false, optional: true, type: 'boolean' },
        integrationClass: { array: false, nullable: false, optional: true, type: 'string' },
        integrationClassName: { array: false, nullable: false, optional: true, type: 'string' },
        isTaxCompliant: { array: false, nullable: false, optional: true, type: 'boolean' },
        keyProvisioningSupported: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        namedCredential: { array: false, nullable: false, optional: true, type: 'string' },
        namedCredentialSupported: { array: false, nullable: false, optional: true, type: 'boolean' },
        partnerContactCenterListSupported: { array: false, nullable: false, optional: true, type: 'boolean' },
        partnerPhoneNumbersSupported: { array: false, nullable: false, optional: true, type: 'boolean' },
        partnerTransferDestinationsSupported: { array: false, nullable: false, optional: true, type: 'boolean' },
        queueManagementSupported: { array: false, nullable: false, optional: true, type: 'boolean' },
        serverAuthMode: { array: false, nullable: false, optional: true, type: 'string' },
        telephonySettingsComponent: { array: false, nullable: false, optional: true, type: 'string' },
        universalCallRecordingAccessSupported: { array: false, nullable: false, optional: true, type: 'boolean' },
        userSyncingSupported: { array: false, nullable: false, optional: true, type: 'boolean' },
        vendorType: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ConversationalIntelligenceSettingsSchema = {
    name: 'ConversationalIntelligenceSettings',
    extends: 'Metadata',
    fields: {
        enableCallCoaching: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCallCoachingZoom: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOpptyMatching: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableUnifiedActivities: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const CorsWhitelistOriginSchema = {
    name: 'CorsWhitelistOrigin',
    extends: 'Metadata',
    fields: {
        urlPattern: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CspTrustedSiteSchema = {
    name: 'CspTrustedSite',
    extends: 'Metadata',
    fields: {
        context: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        endpointUrl: { array: false, nullable: false, optional: false, type: 'string' },
        isActive: { array: false, nullable: false, optional: false, type: 'boolean' },
        isApplicableToConnectSrc: { array: false, nullable: false, optional: true, type: 'boolean' },
        isApplicableToFontSrc: { array: false, nullable: false, optional: true, type: 'boolean' },
        isApplicableToFrameSrc: { array: false, nullable: false, optional: true, type: 'boolean' },
        isApplicableToImgSrc: { array: false, nullable: false, optional: true, type: 'boolean' },
        isApplicableToMediaSrc: { array: false, nullable: false, optional: true, type: 'boolean' },
        isApplicableToStyleSrc: { array: false, nullable: false, optional: true, type: 'boolean' },
        mobileExtension: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const CurrencySettingsSchema = {
    name: 'CurrencySettings',
    extends: 'Metadata',
    fields: {
        enableCurrencyEffectiveDates: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCurrencySymbolWithMultiCurrency: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMultiCurrency: { array: false, nullable: false, optional: true, type: 'boolean' },
        isMultiCurrencyActivationAllowed: { array: false, nullable: false, optional: true, type: 'boolean' },
        isParenCurrencyConvDisabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const CustomAddressFieldSettingsSchema = {
    name: 'CustomAddressFieldSettings',
    extends: 'Metadata',
    fields: {
        enableCustomAddressField: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const CustomApplicationSchema = {
    name: 'CustomApplication',
    extends: 'Metadata',
    fields: {
        actionOverrides: { array: true, nullable: false, optional: true, type: 'AppActionOverride' },
        brand: { array: false, nullable: false, optional: true, type: 'AppBrand' },
        consoleConfig: { array: false, nullable: false, optional: true, type: 'ServiceCloudConsoleConfig' },
        defaultLandingTab: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        formFactors: { array: true, nullable: false, optional: true, type: 'string' },
        isNavAutoTempTabsDisabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isNavPersonalizationDisabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isNavTabPersistenceDisabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isServiceCloudConsole: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        logo: { array: false, nullable: false, optional: true, type: 'string' },
        navType: { array: false, nullable: false, optional: true, type: 'string' },
        preferences: { array: false, nullable: false, optional: true, type: 'AppPreferences' },
        profileActionOverrides: { array: true, nullable: false, optional: true, type: 'AppProfileActionOverride' },
        setupExperience: { array: false, nullable: false, optional: true, type: 'string' },
        subscriberTabs: { array: true, nullable: false, optional: true, type: 'string' },
        tabs: { array: true, nullable: false, optional: true, type: 'string' },
        uiType: { array: false, nullable: false, optional: true, type: 'string' },
        utilityBar: { array: false, nullable: false, optional: true, type: 'string' },
        workspaceConfig: { array: false, nullable: false, optional: true, type: 'AppWorkspaceConfig' },
    }
}

const AppActionOverrideSchema = {
    name: 'AppActionOverride',
    extends: 'ActionOverride',
    fields: {
        pageOrSobjectType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ActionOverrideSchema = {
    name: 'ActionOverride',
    fields: {
        actionName: { array: false, nullable: false, optional: true, type: 'string' },
        comment: { array: false, nullable: false, optional: true, type: 'string' },
        content: { array: false, nullable: false, optional: true, type: 'string' },
        formFactor: { array: false, nullable: false, optional: true, type: 'string' },
        skipRecordTypeSelect: { array: false, nullable: false, optional: true, type: 'boolean' },
        type: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const AppBrandSchema = {
    name: 'AppBrand',
    fields: {
        footerColor: { array: false, nullable: false, optional: true, type: 'string' },
        headerColor: { array: false, nullable: false, optional: true, type: 'string' },
        logo: { array: false, nullable: false, optional: true, type: 'string' },
        logoVersion: { array: false, nullable: false, optional: true, type: 'number' },
        shouldOverrideOrgTheme: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ServiceCloudConsoleConfigSchema = {
    name: 'ServiceCloudConsoleConfig',
    fields: {
        componentList: { array: false, nullable: false, optional: true, type: 'AppComponentList' },
        detailPageRefreshMethod: { array: false, nullable: false, optional: false, type: 'string' },
        footerColor: { array: false, nullable: false, optional: true, type: 'string' },
        headerColor: { array: false, nullable: false, optional: true, type: 'string' },
        keyboardShortcuts: { array: false, nullable: false, optional: false, type: 'KeyboardShortcuts' },
        listPlacement: { array: false, nullable: false, optional: false, type: 'ListPlacement' },
        listRefreshMethod: { array: false, nullable: false, optional: false, type: 'string' },
        liveAgentConfig: { array: false, nullable: false, optional: true, type: 'LiveAgentConfig' },
        primaryTabColor: { array: false, nullable: false, optional: true, type: 'string' },
        pushNotifications: { array: true, nullable: false, optional: true, type: 'PushNotification' },
        tabLimitConfig: { array: false, nullable: false, optional: true, type: 'TabLimitConfig' },
        whitelistedDomains: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const AppComponentListSchema = {
    name: 'AppComponentList',
    fields: {
        alignment: { array: false, nullable: false, optional: false, type: 'string' },
        components: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const KeyboardShortcutsSchema = {
    name: 'KeyboardShortcuts',
    fields: {
        customShortcuts: { array: true, nullable: false, optional: true, type: 'CustomShortcut' },
        defaultShortcuts: { array: true, nullable: false, optional: true, type: 'DefaultShortcut' },
    }
}

const CustomShortcutSchema = {
    name: 'CustomShortcut',
    extends: 'DefaultShortcut',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        eventName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const DefaultShortcutSchema = {
    name: 'DefaultShortcut',
    fields: {
        action: { array: false, nullable: false, optional: false, type: 'string' },
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        keyCommand: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ListPlacementSchema = {
    name: 'ListPlacement',
    fields: {
        height: { array: false, nullable: false, optional: true, type: 'number' },
        location: { array: false, nullable: false, optional: false, type: 'string' },
        units: { array: false, nullable: false, optional: true, type: 'string' },
        width: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const LiveAgentConfigSchema = {
    name: 'LiveAgentConfig',
    fields: {
        enableLiveChat: { array: false, nullable: false, optional: true, type: 'boolean' },
        openNewAccountSubtab: { array: false, nullable: false, optional: true, type: 'boolean' },
        openNewCaseSubtab: { array: false, nullable: false, optional: true, type: 'boolean' },
        openNewContactSubtab: { array: false, nullable: false, optional: true, type: 'boolean' },
        openNewLeadSubtab: { array: false, nullable: false, optional: true, type: 'boolean' },
        openNewVFPageSubtab: { array: false, nullable: false, optional: true, type: 'boolean' },
        pageNamesToOpen: { array: true, nullable: false, optional: true, type: 'string' },
        showKnowledgeArticles: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const PushNotificationSchema = {
    name: 'PushNotification',
    fields: {
        fieldNames: { array: true, nullable: false, optional: true, type: 'string' },
        objectName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const TabLimitConfigSchema = {
    name: 'TabLimitConfig',
    fields: {
        maxNumberOfPrimaryTabs: { array: false, nullable: false, optional: true, type: 'string' },
        maxNumberOfSubTabs: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const AppPreferencesSchema = {
    name: 'AppPreferences',
    fields: {
        enableCustomizeMyTabs: { array: false, nullable: false, optional: false, type: 'boolean' },
        enableKeyboardShortcuts: { array: false, nullable: false, optional: false, type: 'boolean' },
        enableListViewHover: { array: false, nullable: false, optional: false, type: 'boolean' },
        enableListViewReskin: { array: false, nullable: false, optional: false, type: 'boolean' },
        enableMultiMonitorComponents: { array: false, nullable: false, optional: false, type: 'boolean' },
        enablePinTabs: { array: false, nullable: false, optional: false, type: 'boolean' },
        enableTabHover: { array: false, nullable: false, optional: false, type: 'boolean' },
        enableTabLimits: { array: false, nullable: false, optional: false, type: 'boolean' },
        saveUserSessions: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const AppProfileActionOverrideSchema = {
    name: 'AppProfileActionOverride',
    extends: 'ProfileActionOverride',
    fields: {
        profile: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ProfileActionOverrideSchema = {
    name: 'ProfileActionOverride',
    fields: {
        actionName: { array: false, nullable: false, optional: false, type: 'string' },
        content: { array: false, nullable: false, optional: true, type: 'string' },
        formFactor: { array: false, nullable: false, optional: false, type: 'string' },
        pageOrSobjectType: { array: false, nullable: false, optional: false, type: 'string' },
        recordType: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const AppWorkspaceConfigSchema = {
    name: 'AppWorkspaceConfig',
    fields: {
        mappings: { array: true, nullable: false, optional: true, type: 'WorkspaceMapping' },
    }
}

const WorkspaceMappingSchema = {
    name: 'WorkspaceMapping',
    fields: {
        fieldName: { array: false, nullable: false, optional: true, type: 'string' },
        tab: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CustomApplicationComponentSchema = {
    name: 'CustomApplicationComponent',
    extends: 'Metadata',
    fields: {
        buttonIconUrl: { array: false, nullable: false, optional: true, type: 'string' },
        buttonStyle: { array: false, nullable: false, optional: true, type: 'string' },
        buttonText: { array: false, nullable: false, optional: true, type: 'string' },
        buttonWidth: { array: false, nullable: false, optional: true, type: 'number' },
        height: { array: false, nullable: false, optional: true, type: 'number' },
        isHeightFixed: { array: false, nullable: false, optional: false, type: 'boolean' },
        isHidden: { array: false, nullable: false, optional: false, type: 'boolean' },
        isWidthFixed: { array: false, nullable: false, optional: false, type: 'boolean' },
        visualforcePage: { array: false, nullable: false, optional: false, type: 'string' },
        width: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const CustomFeedFilterSchema = {
    name: 'CustomFeedFilter',
    extends: 'Metadata',
    fields: {
        criteria: { array: true, nullable: false, optional: true, type: 'FeedFilterCriterion' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FeedFilterCriterionSchema = {
    name: 'FeedFilterCriterion',
    fields: {
        feedItemType: { array: false, nullable: false, optional: false, type: 'string' },
        feedItemVisibility: { array: false, nullable: false, optional: true, type: 'string' },
        relatedSObjectType: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const CustomFieldSchema = {
    name: 'CustomField',
    extends: 'Metadata',
    fields: {
        businessOwnerGroup: { array: false, nullable: false, optional: true, type: 'string' },
        businessOwnerUser: { array: false, nullable: false, optional: true, type: 'string' },
        businessStatus: { array: false, nullable: false, optional: true, type: 'string' },
        caseSensitive: { array: false, nullable: false, optional: true, type: 'boolean' },
        complianceGroup: { array: false, nullable: false, optional: true, type: 'string' },
        customDataType: { array: false, nullable: false, optional: true, type: 'string' },
        defaultValue: { array: false, nullable: false, optional: true, type: 'string' },
        deleteConstraint: { array: false, nullable: false, optional: true, type: 'string' },
        deprecated: { array: false, nullable: false, optional: true, type: 'boolean' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        displayFormat: { array: false, nullable: false, optional: true, type: 'string' },
        encryptionScheme: { array: false, nullable: false, optional: true, type: 'string' },
        escapeMarkup: { array: false, nullable: false, optional: true, type: 'boolean' },
        externalDeveloperName: { array: false, nullable: false, optional: true, type: 'string' },
        externalId: { array: false, nullable: false, optional: true, type: 'boolean' },
        fieldManageability: { array: false, nullable: false, optional: true, type: 'string' },
        formula: { array: false, nullable: false, optional: true, type: 'string' },
        formulaTreatBlanksAs: { array: false, nullable: false, optional: true, type: 'string' },
        inlineHelpText: { array: false, nullable: false, optional: true, type: 'string' },
        isAIPredictionField: { array: false, nullable: false, optional: true, type: 'boolean' },
        isConvertLeadDisabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isFilteringDisabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isNameField: { array: false, nullable: false, optional: true, type: 'boolean' },
        isSortingDisabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        length: { array: false, nullable: false, optional: true, type: 'number' },
        lookupFilter: { array: false, nullable: false, optional: true, type: 'LookupFilter' },
        maskChar: { array: false, nullable: false, optional: true, type: 'string' },
        maskType: { array: false, nullable: false, optional: true, type: 'string' },
        metadataRelationshipControllingField: { array: false, nullable: false, optional: true, type: 'string' },
        mktDataLakeFieldAttributes: { array: false, nullable: false, optional: true, type: 'MktDataLakeFieldAttributes' },
        mktDataModelFieldAttributes: { array: false, nullable: false, optional: true, type: 'MktDataModelFieldAttributes' },
        populateExistingRows: { array: false, nullable: false, optional: true, type: 'boolean' },
        precision: { array: false, nullable: false, optional: true, type: 'number' },
        referenceTargetField: { array: false, nullable: false, optional: true, type: 'string' },
        referenceTo: { array: false, nullable: false, optional: true, type: 'string' },
        relationshipLabel: { array: false, nullable: false, optional: true, type: 'string' },
        relationshipName: { array: false, nullable: false, optional: true, type: 'string' },
        relationshipOrder: { array: false, nullable: false, optional: true, type: 'number' },
        reparentableMasterDetail: { array: false, nullable: false, optional: true, type: 'boolean' },
        required: { array: false, nullable: false, optional: true, type: 'boolean' },
        restrictedAdminField: { array: false, nullable: false, optional: true, type: 'boolean' },
        scale: { array: false, nullable: false, optional: true, type: 'number' },
        securityClassification: { array: false, nullable: false, optional: true, type: 'string' },
        startingNumber: { array: false, nullable: false, optional: true, type: 'number' },
        stripMarkup: { array: false, nullable: false, optional: true, type: 'boolean' },
        summarizedField: { array: false, nullable: false, optional: true, type: 'string' },
        summaryFilterItems: { array: true, nullable: false, optional: true, type: 'FilterItem' },
        summaryForeignKey: { array: false, nullable: false, optional: true, type: 'string' },
        summaryOperation: { array: false, nullable: false, optional: true, type: 'string' },
        trackFeedHistory: { array: false, nullable: false, optional: true, type: 'boolean' },
        trackHistory: { array: false, nullable: false, optional: true, type: 'boolean' },
        trackTrending: { array: false, nullable: false, optional: true, type: 'boolean' },
        translateData: { array: false, nullable: false, optional: true, type: 'boolean' },
        type: { array: false, nullable: false, optional: true, type: 'string' },
        unique: { array: false, nullable: false, optional: true, type: 'boolean' },
        valueSet: { array: false, nullable: false, optional: true, type: 'ValueSet' },
        visibleLines: { array: false, nullable: false, optional: true, type: 'number' },
        writeRequiresMasterRead: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const LookupFilterSchema = {
    name: 'LookupFilter',
    fields: {
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        booleanFilter: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        errorMessage: { array: false, nullable: false, optional: true, type: 'string' },
        filterItems: { array: true, nullable: false, optional: true, type: 'FilterItem' },
        infoMessage: { array: false, nullable: false, optional: true, type: 'string' },
        isOptional: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const MktDataLakeFieldAttributesSchema = {
    name: 'MktDataLakeFieldAttributes',
    fields: {
        dateFormat: { array: false, nullable: false, optional: true, type: 'string' },
        definitionCreationType: { array: false, nullable: false, optional: true, type: 'string' },
        externalName: { array: false, nullable: false, optional: true, type: 'string' },
        isEventDate: { array: false, nullable: false, optional: true, type: 'boolean' },
        isInternalOrganization: { array: false, nullable: false, optional: true, type: 'boolean' },
        isRecordModified: { array: false, nullable: false, optional: true, type: 'boolean' },
        keyQualifierName: { array: false, nullable: false, optional: true, type: 'string' },
        mktDatalakeSrcKeyQualifier: { array: false, nullable: false, optional: true, type: 'string' },
        primaryIndexOrder: { array: false, nullable: false, optional: true, type: 'number' },
        usageTag: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const MktDataModelFieldAttributesSchema = {
    name: 'MktDataModelFieldAttributes',
    fields: {
        definitionCreationType: { array: false, nullable: false, optional: true, type: 'string' },
        invalidMergeActionType: { array: false, nullable: false, optional: true, type: 'string' },
        isDynamicLookup: { array: false, nullable: false, optional: true, type: 'boolean' },
        keyQualifierName: { array: false, nullable: false, optional: true, type: 'string' },
        primaryIndexOrder: { array: false, nullable: false, optional: true, type: 'number' },
        refAttrDeveloperName: { array: false, nullable: false, optional: true, type: 'string' },
        usageTag: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ValueSetSchema = {
    name: 'ValueSet',
    fields: {
        controllingField: { array: false, nullable: false, optional: true, type: 'string' },
        restricted: { array: false, nullable: false, optional: true, type: 'boolean' },
        valueSetDefinition: { array: false, nullable: false, optional: true, type: 'ValueSetValuesDefinition' },
        valueSetName: { array: false, nullable: false, optional: true, type: 'string' },
        valueSettings: { array: true, nullable: false, optional: true, type: 'ValueSettings' },
    }
}

const ValueSetValuesDefinitionSchema = {
    name: 'ValueSetValuesDefinition',
    fields: {
        sorted: { array: false, nullable: false, optional: false, type: 'boolean' },
        value: { array: true, nullable: false, optional: true, type: 'CustomValue' },
    }
}

const CustomValueSchema = {
    name: 'CustomValue',
    extends: 'Metadata',
    fields: {
        color: { array: false, nullable: false, optional: true, type: 'string' },
        default: { array: false, nullable: false, optional: false, type: 'boolean' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const StandardValueSchema = {
    name: 'StandardValue',
    extends: 'CustomValue',
    fields: {
        allowEmail: { array: false, nullable: false, optional: true, type: 'boolean' },
        closed: { array: false, nullable: false, optional: true, type: 'boolean' },
        converted: { array: false, nullable: false, optional: true, type: 'boolean' },
        cssExposed: { array: false, nullable: false, optional: true, type: 'boolean' },
        forecastCategory: { array: false, nullable: false, optional: true, type: 'string' },
        groupingString: { array: false, nullable: false, optional: true, type: 'string' },
        highPriority: { array: false, nullable: false, optional: true, type: 'boolean' },
        probability: { array: false, nullable: false, optional: true, type: 'number' },
        reverseRole: { array: false, nullable: false, optional: true, type: 'string' },
        reviewed: { array: false, nullable: false, optional: true, type: 'boolean' },
        won: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ValueSettingsSchema = {
    name: 'ValueSettings',
    fields: {
        controllingFieldValue: { array: true, nullable: false, optional: true, type: 'string' },
        valueName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CustomHelpMenuSectionSchema = {
    name: 'CustomHelpMenuSection',
    extends: 'Metadata',
    fields: {
        customHelpMenuItems: { array: true, nullable: false, optional: true, type: 'CustomHelpMenuItem' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CustomHelpMenuItemSchema = {
    name: 'CustomHelpMenuItem',
    fields: {
        linkUrl: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        sortOrder: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const CustomIndexSchema = {
    name: 'CustomIndex',
    extends: 'Metadata',
    fields: {
        allowNullValues: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const CustomLabelSchema = {
    name: 'CustomLabel',
    extends: 'Metadata',
    fields: {
        categories: { array: false, nullable: false, optional: true, type: 'string' },
        language: { array: false, nullable: false, optional: false, type: 'string' },
        protected: { array: false, nullable: false, optional: false, type: 'boolean' },
        shortDescription: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CustomLabelsSchema = {
    name: 'CustomLabels',
    extends: 'Metadata',
    fields: {
        labels: { array: true, nullable: false, optional: true, type: 'CustomLabel' },
    }
}

const CustomMetadataSchema = {
    name: 'CustomMetadata',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        protected: { array: false, nullable: false, optional: true, type: 'boolean' },
        values: { array: true, nullable: false, optional: true, type: 'CustomMetadataValue' },
    }
}

const CustomMetadataValueSchema = {
    name: 'CustomMetadataValue',
    fields: {
        field: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: true, optional: true, type: undefined },
    }
}

const CustomNotificationTypeSchema = {
    name: 'CustomNotificationType',
    extends: 'Metadata',
    fields: {
        customNotifTypeName: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        desktop: { array: false, nullable: false, optional: false, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        mobile: { array: false, nullable: false, optional: false, type: 'boolean' },
        slack: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const CustomObjectSchema = {
    name: 'CustomObject',
    extends: 'Metadata',
    fields: {
        actionOverrides: { array: true, nullable: false, optional: true, type: 'ActionOverride' },
        allowInChatterGroups: { array: false, nullable: false, optional: true, type: 'boolean' },
        articleTypeChannelDisplay: { array: false, nullable: false, optional: true, type: 'ArticleTypeChannelDisplay' },
        businessProcesses: { array: true, nullable: false, optional: true, type: 'BusinessProcess' },
        compactLayoutAssignment: { array: false, nullable: false, optional: true, type: 'string' },
        compactLayouts: { array: true, nullable: false, optional: true, type: 'CompactLayout' },
        customHelp: { array: false, nullable: false, optional: true, type: 'string' },
        customHelpPage: { array: false, nullable: false, optional: true, type: 'string' },
        customSettingsType: { array: false, nullable: false, optional: true, type: 'string' },
        deploymentStatus: { array: false, nullable: false, optional: true, type: 'string' },
        deprecated: { array: false, nullable: false, optional: true, type: 'boolean' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        enableActivities: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableBulkApi: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDataTranslation: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDivisions: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEnhancedLookup: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFeeds: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHistory: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLicensing: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePublishStatusTracking: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableReports: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSearch: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSharing: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableStreamingApi: { array: false, nullable: false, optional: true, type: 'boolean' },
        eventType: { array: false, nullable: false, optional: true, type: 'string' },
        externalDataSource: { array: false, nullable: false, optional: true, type: 'string' },
        externalName: { array: false, nullable: false, optional: true, type: 'string' },
        externalRepository: { array: false, nullable: false, optional: true, type: 'string' },
        externalSharingModel: { array: false, nullable: false, optional: true, type: 'string' },
        fieldSets: { array: true, nullable: false, optional: true, type: 'FieldSet' },
        fields: { array: true, nullable: false, optional: true, type: 'CustomField' },
        gender: { array: false, nullable: false, optional: true, type: 'string' },
        historyRetentionPolicy: { array: false, nullable: false, optional: true, type: 'HistoryRetentionPolicy' },
        household: { array: false, nullable: false, optional: true, type: 'boolean' },
        indexes: { array: true, nullable: false, optional: true, type: 'Index' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        listViews: { array: true, nullable: false, optional: true, type: 'ListView' },
        mktDataLakeAttributes: { array: false, nullable: false, optional: true, type: 'MktDataLakeAttributes' },
        mktDataModelAttributes: { array: false, nullable: false, optional: true, type: 'MktDataModelAttributes' },
        nameField: { array: false, nullable: false, optional: true, type: 'CustomField' },
        pluralLabel: { array: false, nullable: false, optional: true, type: 'string' },
        profileSearchLayouts: { array: true, nullable: false, optional: true, type: 'ProfileSearchLayouts' },
        publishBehavior: { array: false, nullable: false, optional: true, type: 'string' },
        recordTypeTrackFeedHistory: { array: false, nullable: false, optional: true, type: 'boolean' },
        recordTypeTrackHistory: { array: false, nullable: false, optional: true, type: 'boolean' },
        recordTypes: { array: true, nullable: false, optional: true, type: 'RecordType' },
        searchLayouts: { array: false, nullable: false, optional: true, type: 'SearchLayouts' },
        sharingModel: { array: false, nullable: false, optional: true, type: 'string' },
        sharingReasons: { array: true, nullable: false, optional: true, type: 'SharingReason' },
        sharingRecalculations: { array: true, nullable: false, optional: true, type: 'SharingRecalculation' },
        startsWith: { array: false, nullable: false, optional: true, type: 'string' },
        validationRules: { array: true, nullable: false, optional: true, type: 'ValidationRule' },
        visibility: { array: false, nullable: false, optional: true, type: 'string' },
        webLinks: { array: true, nullable: false, optional: true, type: 'WebLink' },
    }
}

const ArticleTypeChannelDisplaySchema = {
    name: 'ArticleTypeChannelDisplay',
    fields: {
        articleTypeTemplates: { array: true, nullable: false, optional: true, type: 'ArticleTypeTemplate' },
    }
}

const ArticleTypeTemplateSchema = {
    name: 'ArticleTypeTemplate',
    fields: {
        channel: { array: false, nullable: false, optional: false, type: 'string' },
        page: { array: false, nullable: false, optional: true, type: 'string' },
        template: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FieldSetSchema = {
    name: 'FieldSet',
    extends: 'Metadata',
    fields: {
        availableFields: { array: true, nullable: false, optional: true, type: 'FieldSetItem' },
        description: { array: false, nullable: false, optional: false, type: 'string' },
        displayedFields: { array: true, nullable: false, optional: true, type: 'FieldSetItem' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FieldSetItemSchema = {
    name: 'FieldSetItem',
    fields: {
        field: { array: false, nullable: false, optional: true, type: 'string' },
        isFieldManaged: { array: false, nullable: false, optional: true, type: 'boolean' },
        isRequired: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const HistoryRetentionPolicySchema = {
    name: 'HistoryRetentionPolicy',
    fields: {
        archiveAfterMonths: { array: false, nullable: false, optional: false, type: 'number' },
        archiveRetentionYears: { array: false, nullable: false, optional: false, type: 'number' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const IndexSchema = {
    name: 'Index',
    extends: 'Metadata',
    fields: {
        fields: { array: true, nullable: false, optional: true, type: 'IndexField' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const IndexFieldSchema = {
    name: 'IndexField',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        sortDirection: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ListViewSchema = {
    name: 'ListView',
    extends: 'Metadata',
    fields: {
        booleanFilter: { array: false, nullable: false, optional: true, type: 'string' },
        columns: { array: true, nullable: false, optional: true, type: 'string' },
        division: { array: false, nullable: false, optional: true, type: 'string' },
        filterScope: { array: false, nullable: false, optional: false, type: 'string' },
        filters: { array: true, nullable: false, optional: true, type: 'ListViewFilter' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        language: { array: false, nullable: false, optional: true, type: 'string' },
        queue: { array: false, nullable: false, optional: true, type: 'string' },
        sharedTo: { array: false, nullable: false, optional: true, type: 'SharedTo' },
    }
}

const ListViewFilterSchema = {
    name: 'ListViewFilter',
    fields: {
        field: { array: false, nullable: false, optional: false, type: 'string' },
        operation: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const SharedToSchema = {
    name: 'SharedTo',
    fields: {
        allCustomerPortalUsers: { array: false, nullable: false, optional: true, type: 'string' },
        allInternalUsers: { array: false, nullable: false, optional: true, type: 'string' },
        allPartnerUsers: { array: false, nullable: false, optional: true, type: 'string' },
        channelProgramGroup: { array: true, nullable: false, optional: true, type: 'string' },
        channelProgramGroups: { array: true, nullable: false, optional: true, type: 'string' },
        group: { array: true, nullable: false, optional: true, type: 'string' },
        groups: { array: true, nullable: false, optional: true, type: 'string' },
        guestUser: { array: true, nullable: false, optional: true, type: 'string' },
        managerSubordinates: { array: true, nullable: false, optional: true, type: 'string' },
        managers: { array: true, nullable: false, optional: true, type: 'string' },
        portalRole: { array: true, nullable: false, optional: true, type: 'string' },
        portalRoleAndSubordinates: { array: true, nullable: false, optional: true, type: 'string' },
        queue: { array: true, nullable: false, optional: true, type: 'string' },
        role: { array: true, nullable: false, optional: true, type: 'string' },
        roleAndSubordinates: { array: true, nullable: false, optional: true, type: 'string' },
        roleAndSubordinatesInternal: { array: true, nullable: false, optional: true, type: 'string' },
        roles: { array: true, nullable: false, optional: true, type: 'string' },
        rolesAndSubordinates: { array: true, nullable: false, optional: true, type: 'string' },
        territories: { array: true, nullable: false, optional: true, type: 'string' },
        territoriesAndSubordinates: { array: true, nullable: false, optional: true, type: 'string' },
        territory: { array: true, nullable: false, optional: true, type: 'string' },
        territoryAndSubordinates: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const MktDataLakeAttributesSchema = {
    name: 'MktDataLakeAttributes',
    fields: {
        creationType: { array: false, nullable: false, optional: true, type: 'string' },
        isEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        objectCategory: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const MktDataModelAttributesSchema = {
    name: 'MktDataModelAttributes',
    fields: {
        creationType: { array: false, nullable: false, optional: true, type: 'string' },
        dataModelTaxonomy: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        isEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isSegmentable: { array: false, nullable: false, optional: true, type: 'boolean' },
        isUsedForMetrics: { array: false, nullable: false, optional: true, type: 'boolean' },
        objectCategory: { array: false, nullable: false, optional: true, type: 'string' },
        referenceEntityGroup: { array: false, nullable: false, optional: true, type: 'string' },
        referenceEntityName: { array: false, nullable: false, optional: true, type: 'string' },
        referenceEntitySubjectArea: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ProfileSearchLayoutsSchema = {
    name: 'ProfileSearchLayouts',
    fields: {
        fields: { array: true, nullable: false, optional: true, type: 'string' },
        profileName: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const RecordTypeSchema = {
    name: 'RecordType',
    extends: 'Metadata',
    fields: {
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        businessProcess: { array: false, nullable: false, optional: true, type: 'string' },
        compactLayoutAssignment: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        picklistValues: { array: true, nullable: false, optional: true, type: 'RecordTypePicklistValue' },
    }
}

const RecordTypePicklistValueSchema = {
    name: 'RecordTypePicklistValue',
    fields: {
        picklist: { array: false, nullable: false, optional: false, type: 'string' },
        values: { array: true, nullable: false, optional: true, type: 'PicklistValue' },
    }
}

const SearchLayoutsSchema = {
    name: 'SearchLayouts',
    fields: {
        customTabListAdditionalFields: { array: true, nullable: false, optional: true, type: 'string' },
        excludedStandardButtons: { array: true, nullable: false, optional: true, type: 'string' },
        listViewButtons: { array: true, nullable: false, optional: true, type: 'string' },
        lookupDialogsAdditionalFields: { array: true, nullable: false, optional: true, type: 'string' },
        lookupFilterFields: { array: true, nullable: false, optional: true, type: 'string' },
        lookupPhoneDialogsAdditionalFields: { array: true, nullable: false, optional: true, type: 'string' },
        massQuickActions: { array: true, nullable: false, optional: true, type: 'string' },
        searchFilterFields: { array: true, nullable: false, optional: true, type: 'string' },
        searchResultsAdditionalFields: { array: true, nullable: false, optional: true, type: 'string' },
        searchResultsCustomButtons: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const SharingReasonSchema = {
    name: 'SharingReason',
    extends: 'Metadata',
    fields: {
        label: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const SharingRecalculationSchema = {
    name: 'SharingRecalculation',
    fields: {
        className: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ValidationRuleSchema = {
    name: 'ValidationRule',
    extends: 'Metadata',
    fields: {
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        errorConditionFormula: { array: false, nullable: false, optional: false, type: 'string' },
        errorDisplayField: { array: false, nullable: false, optional: true, type: 'string' },
        errorMessage: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const WebLinkSchema = {
    name: 'WebLink',
    extends: 'Metadata',
    fields: {
        availability: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        displayType: { array: false, nullable: false, optional: false, type: 'string' },
        encodingKey: { array: false, nullable: false, optional: true, type: 'string' },
        hasMenubar: { array: false, nullable: false, optional: true, type: 'boolean' },
        hasScrollbars: { array: false, nullable: false, optional: true, type: 'boolean' },
        hasToolbar: { array: false, nullable: false, optional: true, type: 'boolean' },
        height: { array: false, nullable: false, optional: true, type: 'number' },
        isResizable: { array: false, nullable: false, optional: true, type: 'boolean' },
        linkType: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: true, type: 'string' },
        openType: { array: false, nullable: false, optional: false, type: 'string' },
        page: { array: false, nullable: false, optional: true, type: 'string' },
        position: { array: false, nullable: false, optional: true, type: 'string' },
        protected: { array: false, nullable: false, optional: false, type: 'boolean' },
        requireRowSelection: { array: false, nullable: false, optional: true, type: 'boolean' },
        scontrol: { array: false, nullable: false, optional: true, type: 'string' },
        showsLocation: { array: false, nullable: false, optional: true, type: 'boolean' },
        showsStatus: { array: false, nullable: false, optional: true, type: 'boolean' },
        url: { array: false, nullable: false, optional: true, type: 'string' },
        width: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const CustomObjectTranslationSchema = {
    name: 'CustomObjectTranslation',
    extends: 'Metadata',
    fields: {
        caseValues: { array: true, nullable: false, optional: true, type: 'ObjectNameCaseValue' },
        fieldSets: { array: true, nullable: false, optional: true, type: 'FieldSetTranslation' },
        fields: { array: true, nullable: false, optional: true, type: 'CustomFieldTranslation' },
        gender: { array: false, nullable: false, optional: true, type: 'string' },
        layouts: { array: true, nullable: false, optional: true, type: 'LayoutTranslation' },
        nameFieldLabel: { array: false, nullable: false, optional: true, type: 'string' },
        quickActions: { array: true, nullable: false, optional: true, type: 'QuickActionTranslation' },
        recordTypes: { array: true, nullable: false, optional: true, type: 'RecordTypeTranslation' },
        sharingReasons: { array: true, nullable: false, optional: true, type: 'SharingReasonTranslation' },
        standardFields: { array: true, nullable: false, optional: true, type: 'StandardFieldTranslation' },
        startsWith: { array: false, nullable: false, optional: true, type: 'string' },
        validationRules: { array: true, nullable: false, optional: true, type: 'ValidationRuleTranslation' },
        webLinks: { array: true, nullable: false, optional: true, type: 'WebLinkTranslation' },
        workflowTasks: { array: true, nullable: false, optional: true, type: 'WorkflowTaskTranslation' },
    }
}

const ObjectNameCaseValueSchema = {
    name: 'ObjectNameCaseValue',
    fields: {
        article: { array: false, nullable: false, optional: true, type: 'string' },
        caseType: { array: false, nullable: false, optional: true, type: 'string' },
        plural: { array: false, nullable: false, optional: true, type: 'boolean' },
        possessive: { array: false, nullable: false, optional: true, type: 'string' },
        value: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FieldSetTranslationSchema = {
    name: 'FieldSetTranslation',
    fields: {
        label: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CustomFieldTranslationSchema = {
    name: 'CustomFieldTranslation',
    fields: {
        caseValues: { array: true, nullable: false, optional: true, type: 'ObjectNameCaseValue' },
        gender: { array: false, nullable: false, optional: true, type: 'string' },
        help: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        lookupFilter: { array: false, nullable: false, optional: true, type: 'LookupFilterTranslation' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        picklistValues: { array: true, nullable: false, optional: true, type: 'PicklistValueTranslation' },
        relationshipLabel: { array: false, nullable: false, optional: true, type: 'string' },
        startsWith: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const LookupFilterTranslationSchema = {
    name: 'LookupFilterTranslation',
    fields: {
        errorMessage: { array: false, nullable: false, optional: false, type: 'string' },
        informationalMessage: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PicklistValueTranslationSchema = {
    name: 'PicklistValueTranslation',
    fields: {
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        translation: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const LayoutTranslationSchema = {
    name: 'LayoutTranslation',
    fields: {
        layout: { array: false, nullable: false, optional: false, type: 'string' },
        layoutType: { array: false, nullable: false, optional: true, type: 'string' },
        sections: { array: true, nullable: false, optional: true, type: 'LayoutSectionTranslation' },
    }
}

const LayoutSectionTranslationSchema = {
    name: 'LayoutSectionTranslation',
    fields: {
        label: { array: false, nullable: false, optional: false, type: 'string' },
        section: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const QuickActionTranslationSchema = {
    name: 'QuickActionTranslation',
    fields: {
        aspect: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const RecordTypeTranslationSchema = {
    name: 'RecordTypeTranslation',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const SharingReasonTranslationSchema = {
    name: 'SharingReasonTranslation',
    fields: {
        label: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const StandardFieldTranslationSchema = {
    name: 'StandardFieldTranslation',
    fields: {
        label: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ValidationRuleTranslationSchema = {
    name: 'ValidationRuleTranslation',
    fields: {
        errorMessage: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const WebLinkTranslationSchema = {
    name: 'WebLinkTranslation',
    fields: {
        label: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const WorkflowTaskTranslationSchema = {
    name: 'WorkflowTaskTranslation',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        subject: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const CustomPageWebLinkSchema = {
    name: 'CustomPageWebLink',
    extends: 'Metadata',
    fields: {
        availability: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        displayType: { array: false, nullable: false, optional: false, type: 'string' },
        encodingKey: { array: false, nullable: false, optional: true, type: 'string' },
        hasMenubar: { array: false, nullable: false, optional: true, type: 'boolean' },
        hasScrollbars: { array: false, nullable: false, optional: true, type: 'boolean' },
        hasToolbar: { array: false, nullable: false, optional: true, type: 'boolean' },
        height: { array: false, nullable: false, optional: true, type: 'number' },
        isResizable: { array: false, nullable: false, optional: true, type: 'boolean' },
        linkType: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: true, type: 'string' },
        openType: { array: false, nullable: false, optional: false, type: 'string' },
        page: { array: false, nullable: false, optional: true, type: 'string' },
        position: { array: false, nullable: false, optional: true, type: 'string' },
        protected: { array: false, nullable: false, optional: false, type: 'boolean' },
        requireRowSelection: { array: false, nullable: false, optional: true, type: 'boolean' },
        scontrol: { array: false, nullable: false, optional: true, type: 'string' },
        showsLocation: { array: false, nullable: false, optional: true, type: 'boolean' },
        showsStatus: { array: false, nullable: false, optional: true, type: 'boolean' },
        url: { array: false, nullable: false, optional: true, type: 'string' },
        width: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const CustomPermissionSchema = {
    name: 'CustomPermission',
    extends: 'Metadata',
    fields: {
        connectedApp: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        isLicensed: { array: false, nullable: false, optional: false, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        requiredPermission: { array: true, nullable: false, optional: true, type: 'CustomPermissionDependencyRequired' },
    }
}

const CustomPermissionDependencyRequiredSchema = {
    name: 'CustomPermissionDependencyRequired',
    fields: {
        customPermission: { array: false, nullable: false, optional: false, type: 'string' },
        dependency: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const CustomSiteSchema = {
    name: 'CustomSite',
    extends: 'Metadata',
    fields: {
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        allowHomePage: { array: false, nullable: false, optional: false, type: 'boolean' },
        allowStandardAnswersPages: { array: false, nullable: false, optional: true, type: 'boolean' },
        allowStandardIdeasPages: { array: false, nullable: false, optional: false, type: 'boolean' },
        allowStandardLookups: { array: false, nullable: false, optional: false, type: 'boolean' },
        allowStandardPortalPages: { array: false, nullable: false, optional: false, type: 'boolean' },
        allowStandardSearch: { array: false, nullable: false, optional: false, type: 'boolean' },
        analyticsTrackingCode: { array: false, nullable: false, optional: true, type: 'string' },
        authorizationRequiredPage: { array: false, nullable: false, optional: true, type: 'string' },
        bandwidthExceededPage: { array: false, nullable: false, optional: true, type: 'string' },
        browserXssProtection: { array: false, nullable: false, optional: false, type: 'boolean' },
        cachePublicVisualforcePagesInProxyServers: { array: false, nullable: false, optional: true, type: 'boolean' },
        changePasswordPage: { array: false, nullable: false, optional: true, type: 'string' },
        chatterAnswersForgotPasswordConfirmPage: { array: false, nullable: false, optional: true, type: 'string' },
        chatterAnswersForgotPasswordPage: { array: false, nullable: false, optional: true, type: 'string' },
        chatterAnswersHelpPage: { array: false, nullable: false, optional: true, type: 'string' },
        chatterAnswersLoginPage: { array: false, nullable: false, optional: true, type: 'string' },
        chatterAnswersRegistrationPage: { array: false, nullable: false, optional: true, type: 'string' },
        clickjackProtectionLevel: { array: false, nullable: false, optional: false, type: 'string' },
        contentSniffingProtection: { array: false, nullable: false, optional: false, type: 'boolean' },
        customWebAddresses: { array: true, nullable: false, optional: true, type: 'SiteWebAddress' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        enableAuraRequests: { array: false, nullable: false, optional: true, type: 'boolean' },
        favoriteIcon: { array: false, nullable: false, optional: true, type: 'string' },
        fileNotFoundPage: { array: false, nullable: false, optional: true, type: 'string' },
        forgotPasswordPage: { array: false, nullable: false, optional: true, type: 'string' },
        genericErrorPage: { array: false, nullable: false, optional: true, type: 'string' },
        guestProfile: { array: false, nullable: false, optional: true, type: 'string' },
        inMaintenancePage: { array: false, nullable: false, optional: true, type: 'string' },
        inactiveIndexPage: { array: false, nullable: false, optional: true, type: 'string' },
        indexPage: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        myProfilePage: { array: false, nullable: false, optional: true, type: 'string' },
        portal: { array: false, nullable: false, optional: true, type: 'string' },
        redirectToCustomDomain: { array: false, nullable: false, optional: true, type: 'boolean' },
        referrerPolicyOriginWhenCrossOrigin: { array: false, nullable: false, optional: false, type: 'boolean' },
        robotsTxtPage: { array: false, nullable: false, optional: true, type: 'string' },
        selfRegPage: { array: false, nullable: false, optional: true, type: 'string' },
        serverIsDown: { array: false, nullable: false, optional: true, type: 'string' },
        siteAdmin: { array: false, nullable: false, optional: true, type: 'string' },
        siteGuestRecordDefaultOwner: { array: false, nullable: false, optional: true, type: 'string' },
        siteIframeWhiteListUrls: { array: true, nullable: false, optional: true, type: 'SiteIframeWhiteListUrl' },
        siteRedirectMappings: { array: true, nullable: false, optional: true, type: 'SiteRedirectMapping' },
        siteTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        siteType: { array: false, nullable: false, optional: false, type: 'string' },
        subdomain: { array: false, nullable: false, optional: true, type: 'string' },
        urlPathPrefix: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const SiteWebAddressSchema = {
    name: 'SiteWebAddress',
    fields: {
        certificate: { array: false, nullable: false, optional: true, type: 'string' },
        domainName: { array: false, nullable: false, optional: false, type: 'string' },
        primary: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const SiteIframeWhiteListUrlSchema = {
    name: 'SiteIframeWhiteListUrl',
    fields: {
        url: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const SiteRedirectMappingSchema = {
    name: 'SiteRedirectMapping',
    fields: {
        action: { array: false, nullable: false, optional: false, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        isDynamic: { array: false, nullable: false, optional: true, type: 'boolean' },
        source: { array: false, nullable: false, optional: false, type: 'string' },
        target: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CustomTabSchema = {
    name: 'CustomTab',
    extends: 'Metadata',
    fields: {
        actionOverrides: { array: true, nullable: false, optional: true, type: 'ActionOverride' },
        auraComponent: { array: false, nullable: false, optional: true, type: 'string' },
        customObject: { array: false, nullable: false, optional: true, type: 'boolean' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        flexiPage: { array: false, nullable: false, optional: true, type: 'string' },
        frameHeight: { array: false, nullable: false, optional: true, type: 'number' },
        hasSidebar: { array: false, nullable: false, optional: true, type: 'boolean' },
        icon: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        lwcComponent: { array: false, nullable: false, optional: true, type: 'string' },
        motif: { array: false, nullable: false, optional: true, type: 'string' },
        page: { array: false, nullable: false, optional: true, type: 'string' },
        scontrol: { array: false, nullable: false, optional: true, type: 'string' },
        splashPageLink: { array: false, nullable: false, optional: true, type: 'string' },
        url: { array: false, nullable: false, optional: true, type: 'string' },
        urlEncodingKey: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const CustomerDataPlatformSettingsSchema = {
    name: 'CustomerDataPlatformSettings',
    extends: 'Metadata',
    fields: {
        enableCustomerDataPlatform: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const CustomizablePropensityScoringSettingsSchema = {
    name: 'CustomizablePropensityScoringSettings',
    extends: 'Metadata',
    fields: {
        enableCpsPref: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const DashboardSchema = {
    name: 'Dashboard',
    extends: 'Metadata',
    fields: {
        backgroundEndColor: { array: false, nullable: false, optional: false, type: 'string' },
        backgroundFadeDirection: { array: false, nullable: false, optional: false, type: 'string' },
        backgroundStartColor: { array: false, nullable: false, optional: false, type: 'string' },
        chartTheme: { array: false, nullable: false, optional: true, type: 'string' },
        colorPalette: { array: false, nullable: false, optional: true, type: 'string' },
        dashboardChartTheme: { array: false, nullable: false, optional: true, type: 'string' },
        dashboardColorPalette: { array: false, nullable: false, optional: true, type: 'string' },
        dashboardFilters: { array: true, nullable: false, optional: true, type: 'DashboardFilter' },
        dashboardGridLayout: { array: false, nullable: false, optional: true, type: 'DashboardGridLayout' },
        dashboardResultRefreshedDate: { array: false, nullable: false, optional: true, type: 'string' },
        dashboardResultRunningUser: { array: false, nullable: false, optional: true, type: 'string' },
        dashboardType: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        folderName: { array: false, nullable: false, optional: true, type: 'string' },
        isGridLayout: { array: false, nullable: false, optional: true, type: 'boolean' },
        leftSection: { array: false, nullable: false, optional: true, type: 'DashboardComponentSection' },
        middleSection: { array: false, nullable: false, optional: true, type: 'DashboardComponentSection' },
        numSubscriptions: { array: false, nullable: false, optional: true, type: 'number' },
        rightSection: { array: false, nullable: false, optional: true, type: 'DashboardComponentSection' },
        runningUser: { array: false, nullable: false, optional: true, type: 'string' },
        textColor: { array: false, nullable: false, optional: false, type: 'string' },
        title: { array: false, nullable: false, optional: false, type: 'string' },
        titleColor: { array: false, nullable: false, optional: false, type: 'string' },
        titleSize: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const DashboardFilterSchema = {
    name: 'DashboardFilter',
    fields: {
        dashboardFilterOptions: { array: true, nullable: false, optional: true, type: 'DashboardFilterOption' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const DashboardFilterOptionSchema = {
    name: 'DashboardFilterOption',
    fields: {
        operator: { array: false, nullable: false, optional: false, type: 'string' },
        values: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const DashboardGridLayoutSchema = {
    name: 'DashboardGridLayout',
    fields: {
        dashboardGridComponents: { array: true, nullable: false, optional: true, type: 'DashboardGridComponent' },
        numberOfColumns: { array: false, nullable: false, optional: false, type: 'number' },
        rowHeight: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const DashboardGridComponentSchema = {
    name: 'DashboardGridComponent',
    fields: {
        colSpan: { array: false, nullable: false, optional: false, type: 'number' },
        columnIndex: { array: false, nullable: false, optional: false, type: 'number' },
        dashboardComponent: { array: false, nullable: false, optional: false, type: 'DashboardComponent' },
        rowIndex: { array: false, nullable: false, optional: false, type: 'number' },
        rowSpan: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const DashboardComponentSchema = {
    name: 'DashboardComponent',
    fields: {
        autoselectColumnsFromReport: { array: false, nullable: false, optional: true, type: 'boolean' },
        chartAxisRange: { array: false, nullable: false, optional: true, type: 'string' },
        chartAxisRangeMax: { array: false, nullable: false, optional: true, type: 'number' },
        chartAxisRangeMin: { array: false, nullable: false, optional: true, type: 'number' },
        chartSummary: { array: true, nullable: false, optional: true, type: 'ChartSummary' },
        componentChartTheme: { array: false, nullable: false, optional: true, type: 'string' },
        componentType: { array: false, nullable: false, optional: false, type: 'string' },
        dashboardDynamicValues: { array: true, nullable: false, optional: true, type: 'DashboardDynamicValue' },
        dashboardFilterColumns: { array: true, nullable: false, optional: true, type: 'DashboardFilterColumn' },
        dashboardTableColumn: { array: true, nullable: false, optional: true, type: 'DashboardTableColumn' },
        decimalPrecision: { array: false, nullable: false, optional: true, type: 'number' },
        displayUnits: { array: false, nullable: false, optional: true, type: 'string' },
        drillDownUrl: { array: false, nullable: false, optional: true, type: 'string' },
        drillEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        drillToDetailEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHover: { array: false, nullable: false, optional: true, type: 'boolean' },
        expandOthers: { array: false, nullable: false, optional: true, type: 'boolean' },
        flexComponentProperties: { array: false, nullable: false, optional: true, type: 'DashboardFlexTableComponentProperties' },
        footer: { array: false, nullable: false, optional: true, type: 'string' },
        gaugeMax: { array: false, nullable: false, optional: true, type: 'number' },
        gaugeMin: { array: false, nullable: false, optional: true, type: 'number' },
        groupingColumn: { array: true, nullable: false, optional: true, type: 'string' },
        groupingSortProperties: { array: false, nullable: false, optional: true, type: 'DashboardComponentGroupingSortProperties' },
        header: { array: false, nullable: false, optional: true, type: 'string' },
        indicatorBreakpoint1: { array: false, nullable: false, optional: true, type: 'number' },
        indicatorBreakpoint2: { array: false, nullable: false, optional: true, type: 'number' },
        indicatorHighColor: { array: false, nullable: false, optional: true, type: 'string' },
        indicatorLowColor: { array: false, nullable: false, optional: true, type: 'string' },
        indicatorMiddleColor: { array: false, nullable: false, optional: true, type: 'string' },
        legendPosition: { array: false, nullable: false, optional: true, type: 'string' },
        maxValuesDisplayed: { array: false, nullable: false, optional: true, type: 'number' },
        metricLabel: { array: false, nullable: false, optional: true, type: 'string' },
        page: { array: false, nullable: false, optional: true, type: 'string' },
        pageHeightInPixels: { array: false, nullable: false, optional: true, type: 'number' },
        report: { array: false, nullable: false, optional: true, type: 'string' },
        scontrol: { array: false, nullable: false, optional: true, type: 'string' },
        scontrolHeightInPixels: { array: false, nullable: false, optional: true, type: 'number' },
        showPercentage: { array: false, nullable: false, optional: true, type: 'boolean' },
        showPicturesOnCharts: { array: false, nullable: false, optional: true, type: 'boolean' },
        showPicturesOnTables: { array: false, nullable: false, optional: true, type: 'boolean' },
        showRange: { array: false, nullable: false, optional: true, type: 'boolean' },
        showTotal: { array: false, nullable: false, optional: true, type: 'boolean' },
        showValues: { array: false, nullable: false, optional: true, type: 'boolean' },
        sortBy: { array: false, nullable: false, optional: true, type: 'string' },
        title: { array: false, nullable: false, optional: true, type: 'string' },
        useReportChart: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ChartSummarySchema = {
    name: 'ChartSummary',
    fields: {
        aggregate: { array: false, nullable: false, optional: true, type: 'string' },
        axisBinding: { array: false, nullable: false, optional: true, type: 'string' },
        column: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const DashboardDynamicValueSchema = {
    name: 'DashboardDynamicValue',
    fields: {
        additionalInfo: { array: false, nullable: false, optional: true, type: 'string' },
        fieldName: { array: false, nullable: false, optional: false, type: 'string' },
        isDynamicUser: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const DashboardFilterColumnSchema = {
    name: 'DashboardFilterColumn',
    fields: {
        column: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const DashboardTableColumnSchema = {
    name: 'DashboardTableColumn',
    fields: {
        aggregateType: { array: false, nullable: false, optional: true, type: 'string' },
        calculatePercent: { array: false, nullable: false, optional: true, type: 'boolean' },
        column: { array: false, nullable: false, optional: false, type: 'string' },
        decimalPlaces: { array: false, nullable: false, optional: true, type: 'number' },
        showSubTotal: { array: false, nullable: false, optional: true, type: 'boolean' },
        showTotal: { array: false, nullable: false, optional: true, type: 'boolean' },
        sortBy: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const DashboardFlexTableComponentPropertiesSchema = {
    name: 'DashboardFlexTableComponentProperties',
    fields: {
        decimalPrecision: { array: false, nullable: false, optional: true, type: 'number' },
        flexTableColumn: { array: true, nullable: false, optional: true, type: 'DashboardComponentColumn' },
        flexTableSortInfo: { array: false, nullable: false, optional: true, type: 'DashboardComponentSortInfo' },
        hideChatterPhotos: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const DashboardComponentColumnSchema = {
    name: 'DashboardComponentColumn',
    fields: {
        breakPoint1: { array: false, nullable: false, optional: true, type: 'number' },
        breakPoint2: { array: false, nullable: false, optional: true, type: 'number' },
        breakPointOrder: { array: false, nullable: false, optional: true, type: 'number' },
        highRangeColor: { array: false, nullable: false, optional: true, type: 'number' },
        lowRangeColor: { array: false, nullable: false, optional: true, type: 'number' },
        midRangeColor: { array: false, nullable: false, optional: true, type: 'number' },
        reportColumn: { array: false, nullable: false, optional: false, type: 'string' },
        showSubTotal: { array: false, nullable: false, optional: true, type: 'boolean' },
        showTotal: { array: false, nullable: false, optional: true, type: 'boolean' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const DashboardComponentSortInfoSchema = {
    name: 'DashboardComponentSortInfo',
    fields: {
        sortColumn: { array: false, nullable: false, optional: true, type: 'string' },
        sortOrder: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const DashboardComponentGroupingSortPropertiesSchema = {
    name: 'DashboardComponentGroupingSortProperties',
    fields: {
        groupingSorts: { array: true, nullable: false, optional: true, type: 'DashboardComponentGroupingSort' },
    }
}

const DashboardComponentGroupingSortSchema = {
    name: 'DashboardComponentGroupingSort',
    fields: {
        groupingLevel: { array: false, nullable: false, optional: false, type: 'string' },
        inheritedReportGroupingSort: { array: false, nullable: false, optional: true, type: 'string' },
        sortColumn: { array: false, nullable: false, optional: true, type: 'string' },
        sortOrder: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const DashboardComponentSectionSchema = {
    name: 'DashboardComponentSection',
    fields: {
        columnSize: { array: false, nullable: false, optional: false, type: 'string' },
        components: { array: true, nullable: false, optional: true, type: 'DashboardComponent' },
    }
}

const DataCategoryGroupSchema = {
    name: 'DataCategoryGroup',
    extends: 'Metadata',
    fields: {
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        dataCategory: { array: false, nullable: false, optional: false, type: 'DataCategory' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        objectUsage: { array: false, nullable: false, optional: true, type: 'ObjectUsage' },
    }
}

const DataCategorySchema = {
    name: 'DataCategory',
    fields: {
        dataCategory: { array: true, nullable: false, optional: true, type: 'DataCategory' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ObjectUsageSchema = {
    name: 'ObjectUsage',
    fields: {
        object: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const DataDotComSettingsSchema = {
    name: 'DataDotComSettings',
    extends: 'Metadata',
    fields: {
        enableAccountExportButtonOff: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAccountImportButtonOff: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAllowDupeContactFromLead: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAllowDupeLeadFromContact: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableContactExportButtonOff: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableContactImportButtonOff: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDDCSocialKeyEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDataDotComCleanEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDataDotComOptOutsEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDatacloudAPIEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const PlatformEventSubscriberConfigSchema = {
    name: 'PlatformEventSubscriberConfig',
    extends: 'Metadata',
    fields: {
        batchSize: { array: false, nullable: false, optional: true, type: 'number' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        platformEventConsumer: { array: false, nullable: false, optional: false, type: 'string' },
        user: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const SchedulingObjectiveSchema = {
    name: 'SchedulingObjective',
    extends: 'Metadata',
    fields: {
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        schedulingCategory: { array: false, nullable: false, optional: false, type: 'string' },
        schedulingObjectiveParameters: { array: true, nullable: false, optional: true, type: 'SchedulingObjectiveParameter' },
        schedulingObjectiveType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const SchedulingObjectiveParameterSchema = {
    name: 'SchedulingObjectiveParameter',
    fields: {
        parameterKey: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const PipelineInspMetricConfigSchema = {
    name: 'PipelineInspMetricConfig',
    extends: 'Metadata',
    fields: {
        isCumulative: { array: false, nullable: false, optional: false, type: 'boolean' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        metric: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const VirtualVisitConfigSchema = {
    name: 'VirtualVisitConfig',
    extends: 'Metadata',
    fields: {
        comprehendServiceType: { array: false, nullable: false, optional: true, type: 'string' },
        experienceCloudSiteUrl: { array: false, nullable: false, optional: true, type: 'string' },
        externalMsgServiceIdentifier: { array: false, nullable: false, optional: true, type: 'string' },
        externalRoleIdentifier: { array: false, nullable: false, optional: true, type: 'string' },
        externalUserIdentifier: { array: false, nullable: false, optional: true, type: 'string' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        messagingRegion: { array: false, nullable: false, optional: true, type: 'string' },
        namedCredential: { array: false, nullable: false, optional: true, type: 'string' },
        storageBucketName: { array: false, nullable: false, optional: true, type: 'string' },
        usageType: { array: false, nullable: false, optional: true, type: 'string' },
        videoCallApptTypeValue: { array: false, nullable: false, optional: true, type: 'string' },
        videoControlRegion: { array: false, nullable: false, optional: true, type: 'string' },
        visitRegion: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const MobileSecurityAssignmentSchema = {
    name: 'MobileSecurityAssignment',
    extends: 'Metadata',
    fields: {
        connectedApplication: { array: false, nullable: false, optional: true, type: 'string' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        profile: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const MobileSecurityPolicySchema = {
    name: 'MobileSecurityPolicy',
    extends: 'Metadata',
    fields: {
        effectiveDate: { array: false, nullable: false, optional: true, type: 'string' },
        isEnabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        mobilePlatform: { array: false, nullable: false, optional: true, type: 'string' },
        mobileSecurityAssignment: { array: false, nullable: false, optional: true, type: 'string' },
        ruleValue: { array: false, nullable: false, optional: false, type: 'string' },
        ruleValueType: { array: false, nullable: false, optional: false, type: 'string' },
        severityLevel: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const RecordAlertDataSourceSchema = {
    name: 'RecordAlertDataSource',
    extends: 'Metadata',
    fields: {
        apexClass: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const AppExplorationDataConsentSchema = {
    name: 'AppExplorationDataConsent',
    extends: 'Metadata',
    fields: {
        applicationName: { array: false, nullable: false, optional: true, type: 'string' },
        availableObjects: { array: false, nullable: false, optional: true, type: 'string' },
        enabledObjects: { array: false, nullable: false, optional: true, type: 'string' },
        isProjectAccessEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        projectName: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const EmployeeDataSyncProfileSchema = {
    name: 'EmployeeDataSyncProfile',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        employeeDataSyncField: { array: true, nullable: false, optional: true, type: 'EmployeeDataSyncField' },
        isActive: { array: false, nullable: false, optional: false, type: 'boolean' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const EmployeeDataSyncFieldSchema = {
    name: 'EmployeeDataSyncField',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: false, type: 'boolean' },
        isDefault: { array: false, nullable: false, optional: false, type: 'boolean' },
        isRequired: { array: false, nullable: false, optional: false, type: 'boolean' },
        sourceField: { array: false, nullable: false, optional: false, type: 'string' },
        targetField: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const RegisteredExternalServiceSchema = {
    name: 'RegisteredExternalService',
    extends: 'Metadata',
    fields: {
        configUrl: { array: false, nullable: false, optional: true, type: 'string' },
        documentationUrl: { array: false, nullable: false, optional: true, type: 'string' },
        extensionPointName: { array: false, nullable: false, optional: true, type: 'string' },
        externalServiceProvider: { array: false, nullable: false, optional: false, type: 'string' },
        externalServiceProviderType: { array: false, nullable: false, optional: false, type: 'string' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const AccountingFieldMappingSchema = {
    name: 'AccountingFieldMapping',
    extends: 'Metadata',
    fields: {
        isForAllocationType: { array: false, nullable: false, optional: true, type: 'boolean' },
        isForPaymentType: { array: false, nullable: false, optional: true, type: 'boolean' },
        isForTransactionType: { array: false, nullable: false, optional: true, type: 'boolean' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        mappingBehavior: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        sourceField: { array: false, nullable: false, optional: true, type: 'string' },
        targetField: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const MobSecurityCertPinConfigSchema = {
    name: 'MobSecurityCertPinConfig',
    extends: 'Metadata',
    fields: {
        certificateHash: { array: false, nullable: false, optional: false, type: 'string' },
        domainName: { array: false, nullable: false, optional: false, type: 'string' },
        isEnabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        isSubdomainIncluded: { array: false, nullable: false, optional: false, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        mobilePlatform: { array: false, nullable: false, optional: true, type: 'string' },
        mobileSecurityAssignment: { array: false, nullable: false, optional: true, type: 'string' },
        severityLevel: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ActionableListDefinitionSchema = {
    name: 'ActionableListDefinition',
    extends: 'Metadata',
    fields: {
        actionableListDatasetColumns: { array: true, nullable: false, optional: true, type: 'ActionableListDatasetColumn' },
        actionableListMemberStatuses: { array: true, nullable: false, optional: true, type: 'ActionableListMemberStatus' },
        batchCalcJobDefinition: { array: false, nullable: false, optional: true, type: 'string' },
        datasetName: { array: false, nullable: false, optional: true, type: 'string' },
        edgeMart: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        objectName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ActionableListDatasetColumnSchema = {
    name: 'ActionableListDatasetColumn',
    fields: {
        dataDomain: { array: false, nullable: false, optional: true, type: 'string' },
        isDefault: { array: false, nullable: false, optional: true, type: 'boolean' },
        objectName: { array: false, nullable: false, optional: true, type: 'string' },
        sourceColumnApiName: { array: false, nullable: false, optional: true, type: 'string' },
        sourceFieldName: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ActionableListMemberStatusSchema = {
    name: 'ActionableListMemberStatus',
    fields: {
        iconName: { array: false, nullable: false, optional: true, type: 'string' },
        status: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const CareProviderSearchConfigSchema = {
    name: 'CareProviderSearchConfig',
    extends: 'Metadata',
    fields: {
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        mappedObject: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        sourceField: { array: false, nullable: false, optional: true, type: 'string' },
        targetField: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const CareSystemFieldMappingSchema = {
    name: 'CareSystemFieldMapping',
    extends: 'Metadata',
    fields: {
        externalIdField: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        role: { array: false, nullable: false, optional: false, type: 'string' },
        sourceSystem: { array: false, nullable: false, optional: true, type: 'string' },
        targetObject: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const CareLimitTypeSchema = {
    name: 'CareLimitType',
    extends: 'Metadata',
    fields: {
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        limitType: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        metricType: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const SchedulingRuleSchema = {
    name: 'SchedulingRule',
    extends: 'Metadata',
    fields: {
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        schedulingCategory: { array: false, nullable: false, optional: false, type: 'string' },
        schedulingRuleParameters: { array: true, nullable: false, optional: true, type: 'SchedulingRuleParameter' },
        schedulingRuleType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const SchedulingRuleParameterSchema = {
    name: 'SchedulingRuleParameter',
    fields: {
        schedulingParameterKey: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const PortalDelegablePermissionSetSchema = {
    name: 'PortalDelegablePermissionSet',
    extends: 'Metadata',
    fields: {
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        permissionSet: { array: false, nullable: false, optional: false, type: 'string' },
        profile: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const RelatedRecordAssocCriteriaSchema = {
    name: 'RelatedRecordAssocCriteria',
    extends: 'Metadata',
    fields: {
        associationHandlerApexClass: { array: false, nullable: false, optional: true, type: 'string' },
        associationType: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        eventType: { array: false, nullable: false, optional: false, type: 'string' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        preCondition: { array: false, nullable: false, optional: false, type: 'string' },
        referenceObject: { array: false, nullable: false, optional: false, type: 'string' },
        selectedOwnerField: { array: false, nullable: false, optional: true, type: 'string' },
        status: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PlatformSlackSettingsSchema = {
    name: 'PlatformSlackSettings',
    extends: 'Metadata',
    fields: {
        enableSlackService: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSlackServiceAlerts: { array: false, nullable: false, optional: true, type: 'boolean' },
        slackCapabilitiesEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const DataImportManagementSettingsSchema = {
    name: 'DataImportManagementSettings',
    extends: 'Metadata',
    fields: {
        enableDataConnectorHubspot: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEasyImport: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const WorkforceEngagementSettingsSchema = {
    name: 'WorkforceEngagementSettings',
    extends: 'Metadata',
    fields: {
        enableHistoricalAdherence: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIndividualAdherence: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIntradayManagement: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMachineLearningForecasting: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRealTimeAdherence: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWorkforceEngagement: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWorkforceEngagementConfiguration: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const MailMergeSettingsSchema = {
    name: 'MailMergeSettings',
    extends: 'Metadata',
    fields: {
        enableExtendedMailMerge: { array: false, nullable: false, optional: true, type: 'boolean' },
        saveMailMergeDocsAsSalesforceDocs: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const AccountingSettingsSchema = {
    name: 'AccountingSettings',
    extends: 'Metadata',
    fields: {
        enableAccountingSubledger: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFinancePeriod: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePaymentMethodAdjust: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableScheduledJob: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const CollectionsDashboardSettingsSchema = {
    name: 'CollectionsDashboardSettings',
    extends: 'Metadata',
    fields: {
        enableCollectionsDashboard: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const InvLatePymntRiskCalcSettingsSchema = {
    name: 'InvLatePymntRiskCalcSettings',
    extends: 'Metadata',
    fields: {
        enableInvLatePymntRiskCalc: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const MediaAdSalesSettingsSchema = {
    name: 'MediaAdSalesSettings',
    extends: 'Metadata',
    fields: {
        enableMediaAdSales: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const BranchManagementSettingsSchema = {
    name: 'BranchManagementSettings',
    extends: 'Metadata',
    fields: {
        associateAccountWithBranch: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const SandboxSettingsSchema = {
    name: 'SandboxSettings',
    extends: 'Metadata',
    fields: {
        disableSandboxExpirationEmails: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const InterestTaggingSettingsSchema = {
    name: 'InterestTaggingSettings',
    extends: 'Metadata',
    fields: {
        enableInterestTagging: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const AssociationEngineSettingsSchema = {
    name: 'AssociationEngineSettings',
    extends: 'Metadata',
    fields: {
        enableAssociationEngine: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const PaymentsIngestEnabledSettingsSchema = {
    name: 'PaymentsIngestEnabledSettings',
    extends: 'Metadata',
    fields: {
        paymentsIngestEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const SourceTrackingSettingsSchema = {
    name: 'SourceTrackingSettings',
    extends: 'Metadata',
    fields: {
        enableSourceTrackingSandboxes: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const OrgSettingsSchema = {
    name: 'OrgSettings',
    extends: 'Metadata',
    fields: {
        enableCustomerSuccessPortal: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIncludeContractStatus: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMakeDeploymentsMandatory: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableManageSelfServiceUsers: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOrgFeedSentimentAnalysis: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRADeploymentAttributeOnly: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableResetDivisionOnLogin: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const DevHubSettingsSchema = {
    name: 'DevHubSettings',
    extends: 'Metadata',
    fields: {
        devOpsCenterBetaMsa: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDevOpsCenter: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDevOpsCenterGA: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePackaging2: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableScratchOrgManagementPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableShapeExportPref: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const IncludeEstTaxInQuoteSettingsSchema = {
    name: 'IncludeEstTaxInQuoteSettings',
    extends: 'Metadata',
    fields: {
        enableQuoteEstimatedTax: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const IndustriesLoyaltySettingsSchema = {
    name: 'IndustriesLoyaltySettings',
    extends: 'Metadata',
    fields: {
        enableAutomaticVoucherCodeGeneration: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFixedTypeNQPAggregation: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLoyaltyRedeemedPointsExpirationInfoPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLoyaltyRulesVerifyCdpMemberSegment: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLoyaltyServiceExcellence: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableNQPRealTimePointBalance: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableQPRealTimePointBalance: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const PaymentsManagementEnabledSettingsSchema = {
    name: 'PaymentsManagementEnabledSettings',
    extends: 'Metadata',
    fields: {
        paymentsManagementEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const AppAnalyticsSettingsSchema = {
    name: 'AppAnalyticsSettings',
    extends: 'Metadata',
    fields: {
        enableSimulationMode: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const MapsAndLocationSettingsSchema = {
    name: 'MapsAndLocationSettings',
    extends: 'Metadata',
    fields: {
        enableAddressAutoComplete: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMapsAndLocation: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const OnlineSalesSettingsSchema = {
    name: 'OnlineSalesSettings',
    extends: 'Metadata',
    fields: {
        enableSubscriptionAppEnrolled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const DelegateGroupSchema = {
    name: 'DelegateGroup',
    extends: 'Metadata',
    fields: {
        customObjects: { array: true, nullable: false, optional: true, type: 'string' },
        groups: { array: true, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        loginAccess: { array: false, nullable: false, optional: false, type: 'boolean' },
        permissionSets: { array: true, nullable: false, optional: true, type: 'string' },
        profiles: { array: true, nullable: false, optional: true, type: 'string' },
        roles: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const DeploymentSettingsSchema = {
    name: 'DeploymentSettings',
    extends: 'Metadata',
    fields: {
        doesSkipAsyncApexValidation: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const DigitalExperienceBundleSchema = {
    name: 'DigitalExperienceBundle',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        spaceResources: { array: true, nullable: false, optional: true, type: 'DigitalExperience' },
    }
}

const DigitalExperienceSchema = {
    name: 'DigitalExperience',
    extends: 'MetadataWithContent',
    fields: {
        fileName: { array: false, nullable: false, optional: false, type: 'string' },
        filePath: { array: false, nullable: false, optional: true, type: 'string' },
        format: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const MetadataWithContentSchema = {
    name: 'MetadataWithContent',
    extends: 'Metadata',
    fields: {
        content: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ApexClassSchema = {
    name: 'ApexClass',
    extends: 'MetadataWithContent',
    fields: {
        apiVersion: { array: false, nullable: false, optional: false, type: 'number' },
        packageVersions: { array: true, nullable: false, optional: true, type: 'PackageVersion' },
        status: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ApexComponentSchema = {
    name: 'ApexComponent',
    extends: 'MetadataWithContent',
    fields: {
        apiVersion: { array: false, nullable: false, optional: true, type: 'number' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        packageVersions: { array: true, nullable: false, optional: true, type: 'PackageVersion' },
    }
}

const ApexPageSchema = {
    name: 'ApexPage',
    extends: 'MetadataWithContent',
    fields: {
        apiVersion: { array: false, nullable: false, optional: false, type: 'number' },
        availableInTouch: { array: false, nullable: false, optional: true, type: 'boolean' },
        confirmationTokenRequired: { array: false, nullable: false, optional: true, type: 'boolean' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        packageVersions: { array: true, nullable: false, optional: true, type: 'PackageVersion' },
    }
}

const ApexTriggerSchema = {
    name: 'ApexTrigger',
    extends: 'MetadataWithContent',
    fields: {
        apiVersion: { array: false, nullable: false, optional: false, type: 'number' },
        packageVersions: { array: true, nullable: false, optional: true, type: 'PackageVersion' },
        status: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CertificateSchema = {
    name: 'Certificate',
    extends: 'MetadataWithContent',
    fields: {
        caSigned: { array: false, nullable: false, optional: false, type: 'boolean' },
        encryptedWithPlatformEncryption: { array: false, nullable: true, optional: true, type: 'boolean' },
        expirationDate: { array: false, nullable: true, optional: true, type: 'string' },
        keySize: { array: false, nullable: false, optional: true, type: 'number' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        privateKeyExportable: { array: false, nullable: true, optional: true, type: 'boolean' },
    }
}

const ContentAssetSchema = {
    name: 'ContentAsset',
    extends: 'MetadataWithContent',
    fields: {
        format: { array: false, nullable: false, optional: true, type: 'string' },
        isVisibleByExternalUsers: { array: false, nullable: false, optional: true, type: 'boolean' },
        language: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        originNetwork: { array: false, nullable: false, optional: true, type: 'string' },
        relationships: { array: false, nullable: false, optional: true, type: 'ContentAssetRelationships' },
        versions: { array: false, nullable: false, optional: false, type: 'ContentAssetVersions' },
    }
}

const ContentAssetRelationshipsSchema = {
    name: 'ContentAssetRelationships',
    fields: {
        emailTemplate: { array: true, nullable: false, optional: true, type: 'ContentAssetLink' },
        insightsApplication: { array: true, nullable: false, optional: true, type: 'ContentAssetLink' },
        network: { array: true, nullable: false, optional: true, type: 'ContentAssetLink' },
        organization: { array: false, nullable: false, optional: true, type: 'ContentAssetLink' },
        workspace: { array: true, nullable: false, optional: true, type: 'ContentAssetLink' },
    }
}

const ContentAssetLinkSchema = {
    name: 'ContentAssetLink',
    fields: {
        access: { array: false, nullable: false, optional: false, type: 'string' },
        isManagingWorkspace: { array: false, nullable: false, optional: true, type: 'boolean' },
        name: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ContentAssetVersionsSchema = {
    name: 'ContentAssetVersions',
    fields: {
        version: { array: true, nullable: false, optional: true, type: 'ContentAssetVersion' },
    }
}

const ContentAssetVersionSchema = {
    name: 'ContentAssetVersion',
    fields: {
        number: { array: false, nullable: false, optional: false, type: 'string' },
        pathOnClient: { array: false, nullable: false, optional: false, type: 'string' },
        zipEntry: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const DataWeaveResourceSchema = {
    name: 'DataWeaveResource',
    extends: 'MetadataWithContent',
    fields: {
        apiVersion: { array: false, nullable: false, optional: false, type: 'number' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const DiscoveryAIModelSchema = {
    name: 'DiscoveryAIModel',
    extends: 'MetadataWithContent',
    fields: {
        algorithmType: { array: false, nullable: false, optional: false, type: 'string' },
        classificationThreshold: { array: false, nullable: false, optional: true, type: 'number' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        modelFields: { array: true, nullable: false, optional: true, type: 'DiscoveryModelField' },
        modelRuntimeType: { array: false, nullable: false, optional: false, type: 'string' },
        predictedField: { array: false, nullable: false, optional: false, type: 'string' },
        predictionType: { array: false, nullable: false, optional: false, type: 'string' },
        sourceType: { array: false, nullable: false, optional: false, type: 'string' },
        status: { array: false, nullable: false, optional: false, type: 'string' },
        trainingMetrics: { array: false, nullable: false, optional: true, type: 'string' },
        transformations: { array: true, nullable: false, optional: true, type: 'DiscoveryModelTransform' },
    }
}

const DiscoveryModelFieldSchema = {
    name: 'DiscoveryModelField',
    fields: {
        isDisparateImpact: { array: false, nullable: false, optional: true, type: 'boolean' },
        isSensitive: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
        values: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const DiscoveryModelTransformSchema = {
    name: 'DiscoveryModelTransform',
    fields: {
        config: { array: false, nullable: false, optional: true, type: 'string' },
        sourceFieldNames: { array: true, nullable: false, optional: true, type: 'string' },
        targetFieldNames: { array: true, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const DiscoveryStorySchema = {
    name: 'DiscoveryStory',
    extends: 'MetadataWithContent',
    fields: {
        application: { array: false, nullable: false, optional: false, type: 'string' },
        autopilot: { array: false, nullable: false, optional: true, type: 'string' },
        classificationThreshold: { array: false, nullable: false, optional: true, type: 'number' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        outcome: { array: false, nullable: false, optional: false, type: 'DiscoveryStoryOutcome' },
        sourceContainer: { array: false, nullable: false, optional: false, type: 'string' },
        sourceType: { array: false, nullable: false, optional: false, type: 'string' },
        validationContainer: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const DiscoveryStoryOutcomeSchema = {
    name: 'DiscoveryStoryOutcome',
    fields: {
        failureValue: { array: false, nullable: false, optional: true, type: 'string' },
        field: { array: false, nullable: false, optional: false, type: 'string' },
        goal: { array: false, nullable: false, optional: false, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        successValue: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const DocumentSchema = {
    name: 'Document',
    extends: 'MetadataWithContent',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        internalUseOnly: { array: false, nullable: false, optional: false, type: 'boolean' },
        keywords: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: true, type: 'string' },
        public: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const EclairGeoDataSchema = {
    name: 'EclairGeoData',
    extends: 'MetadataWithContent',
    fields: {
        maps: { array: true, nullable: false, optional: true, type: 'EclairMap' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const EclairMapSchema = {
    name: 'EclairMap',
    fields: {
        boundingBoxBottom: { array: false, nullable: false, optional: true, type: 'number' },
        boundingBoxLeft: { array: false, nullable: false, optional: true, type: 'number' },
        boundingBoxRight: { array: false, nullable: false, optional: true, type: 'number' },
        boundingBoxTop: { array: false, nullable: false, optional: true, type: 'number' },
        mapLabel: { array: false, nullable: false, optional: true, type: 'string' },
        mapName: { array: false, nullable: false, optional: false, type: 'string' },
        projection: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const EmailTemplateSchema = {
    name: 'EmailTemplate',
    extends: 'MetadataWithContent',
    fields: {
        apiVersion: { array: false, nullable: false, optional: true, type: 'number' },
        attachedDocuments: { array: true, nullable: false, optional: true, type: 'string' },
        attachments: { array: true, nullable: false, optional: true, type: 'Attachment' },
        available: { array: false, nullable: false, optional: false, type: 'boolean' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        encodingKey: { array: false, nullable: false, optional: false, type: 'string' },
        letterhead: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        packageVersions: { array: true, nullable: false, optional: true, type: 'PackageVersion' },
        pageDevName: { array: false, nullable: false, optional: true, type: 'string' },
        relatedEntityType: { array: false, nullable: false, optional: true, type: 'string' },
        style: { array: false, nullable: false, optional: false, type: 'string' },
        subject: { array: false, nullable: false, optional: true, type: 'string' },
        textOnly: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
        uiType: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const AttachmentSchema = {
    name: 'Attachment',
    fields: {
        content: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FieldServiceMobileExtensionSchema = {
    name: 'FieldServiceMobileExtension',
    extends: 'MetadataWithContent',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        fileName: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: true, type: 'string' },
        size: { array: false, nullable: false, optional: true, type: 'number' },
        version: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const InboundCertificateSchema = {
    name: 'InboundCertificate',
    extends: 'MetadataWithContent',
    fields: {
        expirationDate: { array: false, nullable: false, optional: false, type: 'string' },
        issuer: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        serialId: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const NetworkBrandingSchema = {
    name: 'NetworkBranding',
    extends: 'MetadataWithContent',
    fields: {
        loginBackgroundImageUrl: { array: false, nullable: false, optional: true, type: 'string' },
        loginFooterText: { array: false, nullable: false, optional: true, type: 'string' },
        loginLogo: { array: false, nullable: false, optional: true, type: 'string' },
        loginLogoName: { array: false, nullable: false, optional: true, type: 'string' },
        loginPrimaryColor: { array: false, nullable: false, optional: true, type: 'string' },
        loginQuaternaryColor: { array: false, nullable: false, optional: true, type: 'string' },
        loginRightFrameUrl: { array: false, nullable: false, optional: true, type: 'string' },
        network: { array: false, nullable: false, optional: true, type: 'string' },
        pageFooter: { array: false, nullable: false, optional: true, type: 'string' },
        pageHeader: { array: false, nullable: false, optional: true, type: 'string' },
        primaryColor: { array: false, nullable: false, optional: false, type: 'string' },
        primaryComplementColor: { array: false, nullable: false, optional: false, type: 'string' },
        quaternaryColor: { array: false, nullable: false, optional: false, type: 'string' },
        quaternaryComplementColor: { array: false, nullable: false, optional: false, type: 'string' },
        secondaryColor: { array: false, nullable: false, optional: false, type: 'string' },
        staticLogoImageUrl: { array: false, nullable: false, optional: true, type: 'string' },
        tertiaryColor: { array: false, nullable: false, optional: false, type: 'string' },
        tertiaryComplementColor: { array: false, nullable: false, optional: false, type: 'string' },
        zeronaryColor: { array: false, nullable: false, optional: false, type: 'string' },
        zeronaryComplementColor: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const OrchestrationSchema = {
    name: 'Orchestration',
    extends: 'MetadataWithContent',
    fields: {
        context: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ScontrolSchema = {
    name: 'Scontrol',
    extends: 'MetadataWithContent',
    fields: {
        contentSource: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        encodingKey: { array: false, nullable: false, optional: false, type: 'string' },
        fileContent: { array: false, nullable: false, optional: true, type: 'string' },
        fileName: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        supportsCaching: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const SiteDotComSchema = {
    name: 'SiteDotCom',
    extends: 'MetadataWithContent',
    fields: {
        label: { array: false, nullable: false, optional: false, type: 'string' },
        siteType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const StaticResourceSchema = {
    name: 'StaticResource',
    extends: 'MetadataWithContent',
    fields: {
        cacheControl: { array: false, nullable: false, optional: false, type: 'string' },
        contentType: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const UiPluginSchema = {
    name: 'UiPlugin',
    extends: 'MetadataWithContent',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        extensionPointIdentifier: { array: false, nullable: false, optional: false, type: 'string' },
        isEnabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        language: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const UserAuthCertificateSchema = {
    name: 'UserAuthCertificate',
    extends: 'MetadataWithContent',
    fields: {
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        expirationDate: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        serialNumber: { array: false, nullable: false, optional: false, type: 'string' },
        user: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const WaveDashboardSchema = {
    name: 'WaveDashboard',
    extends: 'MetadataWithContent',
    fields: {
        application: { array: false, nullable: false, optional: false, type: 'string' },
        dateVersion: { array: false, nullable: false, optional: true, type: 'number' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        templateAssetSourceName: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const WaveComponentSchema = {
    name: 'WaveComponent',
    extends: 'WaveDashboard',
    fields: {
        
    }
}

const WaveDataflowSchema = {
    name: 'WaveDataflow',
    extends: 'MetadataWithContent',
    fields: {
        application: { array: false, nullable: false, optional: true, type: 'string' },
        dataflowType: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const WaveLensSchema = {
    name: 'WaveLens',
    extends: 'MetadataWithContent',
    fields: {
        application: { array: false, nullable: false, optional: false, type: 'string' },
        datasets: { array: true, nullable: false, optional: true, type: 'string' },
        dateVersion: { array: false, nullable: false, optional: true, type: 'number' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        templateAssetSourceName: { array: false, nullable: false, optional: true, type: 'string' },
        visualizationType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const WaveRecipeSchema = {
    name: 'WaveRecipe',
    extends: 'MetadataWithContent',
    fields: {
        application: { array: false, nullable: false, optional: true, type: 'string' },
        dataflow: { array: false, nullable: false, optional: false, type: 'string' },
        format: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        securityPredicate: { array: false, nullable: false, optional: true, type: 'string' },
        targetDatasetAlias: { array: false, nullable: false, optional: true, type: 'string' },
        templateAssetSourceName: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const DigitalExperienceConfigSchema = {
    name: 'DigitalExperienceConfig',
    extends: 'Metadata',
    fields: {
        label: { array: false, nullable: false, optional: false, type: 'string' },
        site: { array: false, nullable: false, optional: false, type: 'Site' },
        space: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const SiteSchema = {
    name: 'Site',
    fields: {
        urlPathPrefix: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const DiscoveryGoalSchema = {
    name: 'DiscoveryGoal',
    extends: 'Metadata',
    fields: {
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        deployedModels: { array: true, nullable: false, optional: true, type: 'DiscoveryDeployedModel' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        modelCards: { array: true, nullable: false, optional: true, type: 'DiscoveryModelCard' },
        outcome: { array: false, nullable: false, optional: false, type: 'DiscoveryGoalOutcome' },
        predictionType: { array: false, nullable: false, optional: false, type: 'string' },
        pushbackField: { array: false, nullable: false, optional: true, type: 'string' },
        pushbackType: { array: false, nullable: false, optional: true, type: 'string' },
        subscribedEntity: { array: false, nullable: false, optional: true, type: 'string' },
        terminalStateFilters: { array: true, nullable: false, optional: true, type: 'DiscoveryFilter' },
    }
}

const DiscoveryDeployedModelSchema = {
    name: 'DiscoveryDeployedModel',
    fields: {
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        aiModel: { array: false, nullable: false, optional: false, type: 'string' },
        classificationThreshold: { array: false, nullable: false, optional: true, type: 'number' },
        fieldMappings: { array: true, nullable: false, optional: true, type: 'DiscoveryFieldMap' },
        filters: { array: true, nullable: false, optional: true, type: 'DiscoveryFilter' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        prescribableFields: { array: true, nullable: false, optional: true, type: 'DiscoveryPrescribableField' },
    }
}

const DiscoveryFieldMapSchema = {
    name: 'DiscoveryFieldMap',
    fields: {
        mappedField: { array: false, nullable: false, optional: false, type: 'string' },
        modelField: { array: false, nullable: false, optional: false, type: 'string' },
        sobjectFieldJoinKey: { array: false, nullable: false, optional: true, type: 'string' },
        source: { array: false, nullable: false, optional: true, type: 'string' },
        sourceFieldJoinKey: { array: false, nullable: false, optional: true, type: 'string' },
        sourceType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const DiscoveryFilterSchema = {
    name: 'DiscoveryFilter',
    fields: {
        field: { array: false, nullable: false, optional: false, type: 'string' },
        operator: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: true, type: 'string' },
        values: { array: true, nullable: false, optional: true, type: 'DiscoveryFilterValue' },
    }
}

const DiscoveryFilterValueSchema = {
    name: 'DiscoveryFilterValue',
    fields: {
        type: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const DiscoveryPrescribableFieldSchema = {
    name: 'DiscoveryPrescribableField',
    fields: {
        customDefinitions: { array: true, nullable: false, optional: true, type: 'DiscoveryCustomPrescribableFieldDefinition' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const DiscoveryCustomPrescribableFieldDefinitionSchema = {
    name: 'DiscoveryCustomPrescribableFieldDefinition',
    fields: {
        filters: { array: true, nullable: false, optional: true, type: 'DiscoveryFilter' },
        template: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const DiscoveryModelCardSchema = {
    name: 'DiscoveryModelCard',
    fields: {
        contactEmail: { array: false, nullable: false, optional: true, type: 'string' },
        contactName: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        sections: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const DiscoveryGoalOutcomeSchema = {
    name: 'DiscoveryGoalOutcome',
    fields: {
        field: { array: false, nullable: false, optional: false, type: 'string' },
        fieldLabel: { array: false, nullable: false, optional: false, type: 'string' },
        goal: { array: false, nullable: false, optional: false, type: 'string' },
        mappedField: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const DiscoverySettingsSchema = {
    name: 'DiscoverySettings',
    extends: 'Metadata',
    fields: {
        enableEinsteinAnswersPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEinsteinArticleRecommendations: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const DocumentChecklistSettingsSchema = {
    name: 'DocumentChecklistSettings',
    extends: 'Metadata',
    fields: {
        dciCustomSharing: { array: false, nullable: false, optional: true, type: 'boolean' },
        deleteDCIWithFiles: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const DocumentTypeSchema = {
    name: 'DocumentType',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: false, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const DuplicateRuleSchema = {
    name: 'DuplicateRule',
    extends: 'Metadata',
    fields: {
        actionOnInsert: { array: false, nullable: false, optional: false, type: 'string' },
        actionOnUpdate: { array: false, nullable: false, optional: false, type: 'string' },
        alertText: { array: false, nullable: true, optional: true, type: 'string' },
        description: { array: false, nullable: true, optional: true, type: 'string' },
        duplicateRuleFilter: { array: false, nullable: true, optional: true, type: 'DuplicateRuleFilter' },
        duplicateRuleMatchRules: { array: true, nullable: true, optional: true, type: 'DuplicateRuleMatchRule' },
        isActive: { array: false, nullable: false, optional: false, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        operationsOnInsert: { array: true, nullable: false, optional: true, type: 'string' },
        operationsOnUpdate: { array: true, nullable: false, optional: true, type: 'string' },
        securityOption: { array: false, nullable: false, optional: false, type: 'string' },
        sortOrder: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const DuplicateRuleFilterSchema = {
    name: 'DuplicateRuleFilter',
    fields: {
        booleanFilter: { array: false, nullable: true, optional: true, type: 'string' },
        duplicateRuleFilterItems: { array: true, nullable: false, optional: true, type: 'DuplicateRuleFilterItem' },
    }
}

const DuplicateRuleMatchRuleSchema = {
    name: 'DuplicateRuleMatchRule',
    fields: {
        matchRuleSObjectType: { array: false, nullable: false, optional: false, type: 'string' },
        matchingRule: { array: false, nullable: false, optional: false, type: 'string' },
        objectMapping: { array: false, nullable: true, optional: true, type: 'ObjectMapping' },
    }
}

const ObjectMappingSchema = {
    name: 'ObjectMapping',
    fields: {
        inputObject: { array: false, nullable: false, optional: false, type: 'string' },
        mappingFields: { array: true, nullable: false, optional: true, type: 'ObjectMappingField' },
        outputObject: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ObjectMappingFieldSchema = {
    name: 'ObjectMappingField',
    fields: {
        inputField: { array: false, nullable: false, optional: false, type: 'string' },
        outputField: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const EACSettingsSchema = {
    name: 'EACSettings',
    extends: 'Metadata',
    fields: {
        addRcCompToFlexiPages: { array: false, nullable: false, optional: true, type: 'boolean' },
        autoPopulateGoogleMeetLinks: { array: false, nullable: false, optional: true, type: 'boolean' },
        automatedEmailFilter: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableActivityAnalyticsPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableActivityCapture: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableActivityMetrics: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableActivitySyncEngine: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEACForEveryonePref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEnforceEacSharingPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableInboxActivitySharing: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableInsightsInTimeline: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableInsightsInTimelineEacStd: { array: false, nullable: false, optional: true, type: 'boolean' },
        provisionProductivityFeatures: { array: false, nullable: false, optional: true, type: 'boolean' },
        salesforceEventsOnlyPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        sensitiveEmailFilter: { array: false, nullable: false, optional: true, type: 'boolean' },
        syncInternalEvents: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const EinsteinAgentSettingsSchema = {
    name: 'EinsteinAgentSettings',
    extends: 'Metadata',
    fields: {
        einsteinAgentRecommendations: { array: false, nullable: false, optional: true, type: 'boolean' },
        reRunAttributeBasedRules: { array: false, nullable: false, optional: true, type: 'boolean' },
        runAssignmentRules: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const EinsteinAssistantSettingsSchema = {
    name: 'EinsteinAssistantSettings',
    extends: 'Metadata',
    fields: {
        enableEinsteinAssistantDataExtractionEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEinsteinAssistantEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEinsteinEnableVoiceLogging: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const EinsteinDealInsightsSettingsSchema = {
    name: 'EinsteinDealInsightsSettings',
    extends: 'Metadata',
    fields: {
        enableUnlikelyToCloseThisMonth: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const EinsteinDocumentCaptureSettingsSchema = {
    name: 'EinsteinDocumentCaptureSettings',
    extends: 'Metadata',
    fields: {
        enableEinsteinDocumentReader: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const EmailAdministrationSettingsSchema = {
    name: 'EmailAdministrationSettings',
    extends: 'Metadata',
    fields: {
        enableComplianceBcc: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEmailConsentManagement: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEmailSenderIdCompliance: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEmailSpfCompliance: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEmailToSalesforce: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEmailTrackingIPBlocklist: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEmailWorkflowApproval: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEnhancedEmailEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHandleBouncedEmails: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHtmlEmail: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableInternationalEmailAddresses: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableListEmailLogActivities: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableResendBouncedEmails: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRestrictTlsToDomains: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSendThroughGmailPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSendViaExchangePref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSendViaGmailPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableUseOrgFootersForExtTrans: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableVerifyEmailDomainByDkim: { array: false, nullable: false, optional: true, type: 'boolean' },
        sendEmailsEvenWhenAutomationUpdatesSameRecord: { array: false, nullable: false, optional: true, type: 'boolean' },
        sendMassEmailNotification: { array: false, nullable: false, optional: true, type: 'boolean' },
        sendTextOnlySystemEmails: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const EmailIntegrationSettingsSchema = {
    name: 'EmailIntegrationSettings',
    extends: 'Metadata',
    fields: {
        doesEmailLogAsEmailMessageInOutlook: { array: false, nullable: false, optional: true, type: 'boolean' },
        doesGmailStayConnectedToSalesforce: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableContactAndEventSync: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEmailTrackingInMobile: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEngageForOutlook: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableGmailIntegration: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableInboxMobileIntune: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOutlookIntegration: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOutlookMobileIntegration: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableProductivityFeatures: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSupplementalContactInfoInMobile: { array: false, nullable: false, optional: true, type: 'boolean' },
        isLayoutCustomizationAllowed: { array: false, nullable: false, optional: true, type: 'boolean' },
        orgIsSyncingEventsOutbound: { array: false, nullable: false, optional: true, type: 'boolean' },
        shouldUseTrustedDomainsList: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const EmailServicesFunctionSchema = {
    name: 'EmailServicesFunction',
    extends: 'Metadata',
    fields: {
        apexClass: { array: false, nullable: false, optional: false, type: 'string' },
        attachmentOption: { array: false, nullable: false, optional: false, type: 'string' },
        authenticationFailureAction: { array: false, nullable: false, optional: false, type: 'string' },
        authorizationFailureAction: { array: false, nullable: false, optional: false, type: 'string' },
        authorizedSenders: { array: false, nullable: false, optional: true, type: 'string' },
        emailServicesAddresses: { array: true, nullable: false, optional: true, type: 'EmailServicesAddress' },
        errorRoutingAddress: { array: false, nullable: false, optional: true, type: 'string' },
        functionInactiveAction: { array: false, nullable: false, optional: false, type: 'string' },
        functionName: { array: false, nullable: false, optional: false, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        isAuthenticationRequired: { array: false, nullable: false, optional: true, type: 'boolean' },
        isErrorRoutingEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isTextAttachmentsAsBinary: { array: false, nullable: false, optional: true, type: 'boolean' },
        isTlsRequired: { array: false, nullable: false, optional: true, type: 'boolean' },
        overLimitAction: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const EmailServicesAddressSchema = {
    name: 'EmailServicesAddress',
    fields: {
        authorizedSenders: { array: false, nullable: false, optional: true, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        localPart: { array: false, nullable: false, optional: false, type: 'string' },
        runAsUser: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const EmailTemplateSettingsSchema = {
    name: 'EmailTemplateSettings',
    extends: 'Metadata',
    fields: {
        enableTemplateEnhancedFolderPref: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const EmbeddedServiceBrandingSchema = {
    name: 'EmbeddedServiceBranding',
    extends: 'Metadata',
    fields: {
        contrastInvertedColor: { array: false, nullable: false, optional: true, type: 'string' },
        contrastPrimaryColor: { array: false, nullable: false, optional: true, type: 'string' },
        embeddedServiceConfig: { array: false, nullable: false, optional: false, type: 'string' },
        font: { array: false, nullable: false, optional: true, type: 'string' },
        height: { array: false, nullable: false, optional: true, type: 'number' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        navBarColor: { array: false, nullable: false, optional: true, type: 'string' },
        navBarTextColor: { array: false, nullable: false, optional: true, type: 'string' },
        primaryColor: { array: false, nullable: false, optional: true, type: 'string' },
        secondaryColor: { array: false, nullable: false, optional: true, type: 'string' },
        secondaryNavBarColor: { array: false, nullable: false, optional: true, type: 'string' },
        width: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const EmbeddedServiceConfigSchema = {
    name: 'EmbeddedServiceConfig',
    extends: 'Metadata',
    fields: {
        areGuestUsersAllowed: { array: false, nullable: false, optional: true, type: 'boolean' },
        authMethod: { array: false, nullable: false, optional: true, type: 'string' },
        branding: { array: false, nullable: false, optional: true, type: 'string' },
        deploymentFeature: { array: false, nullable: false, optional: false, type: 'string' },
        deploymentType: { array: false, nullable: false, optional: false, type: 'string' },
        embeddedServiceAppointmentSettings: { array: false, nullable: false, optional: true, type: 'EmbeddedServiceAppointmentSettings' },
        embeddedServiceCustomComponents: { array: true, nullable: false, optional: true, type: 'EmbeddedServiceCustomComponent' },
        embeddedServiceCustomLabels: { array: true, nullable: false, optional: true, type: 'EmbeddedServiceCustomLabel' },
        embeddedServiceCustomizations: { array: true, nullable: false, optional: true, type: 'EmbeddedServiceCustomization' },
        embeddedServiceFlowConfig: { array: false, nullable: false, optional: true, type: 'EmbeddedServiceFlowConfig' },
        embeddedServiceFlows: { array: true, nullable: false, optional: true, type: 'EmbeddedServiceFlow' },
        embeddedServiceLayouts: { array: true, nullable: false, optional: true, type: 'EmbeddedServiceLayout' },
        isEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        shouldHideAuthDialog: { array: false, nullable: false, optional: true, type: 'boolean' },
        site: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const EmbeddedServiceAppointmentSettingsSchema = {
    name: 'EmbeddedServiceAppointmentSettings',
    fields: {
        appointmentConfirmImg: { array: false, nullable: false, optional: true, type: 'string' },
        enabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        homeImg: { array: false, nullable: false, optional: true, type: 'string' },
        logoImg: { array: false, nullable: false, optional: true, type: 'string' },
        shouldShowExistingAppointment: { array: false, nullable: false, optional: true, type: 'boolean' },
        shouldShowNewAppointment: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const EmbeddedServiceCustomComponentSchema = {
    name: 'EmbeddedServiceCustomComponent',
    fields: {
        componentBundleType: { array: false, nullable: false, optional: true, type: 'string' },
        customComponent: { array: false, nullable: false, optional: true, type: 'string' },
        customComponentType: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const EmbeddedServiceCustomLabelSchema = {
    name: 'EmbeddedServiceCustomLabel',
    fields: {
        customLabel: { array: false, nullable: false, optional: true, type: 'string' },
        feature: { array: false, nullable: false, optional: true, type: 'string' },
        labelKey: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const EmbeddedServiceCustomizationSchema = {
    name: 'EmbeddedServiceCustomization',
    fields: {
        customizationName: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        embeddedServiceResources: { array: true, nullable: false, optional: true, type: 'EmbeddedServiceResource' },
    }
}

const EmbeddedServiceResourceSchema = {
    name: 'EmbeddedServiceResource',
    fields: {
        resource: { array: false, nullable: false, optional: false, type: 'string' },
        resourceType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const EmbeddedServiceFlowConfigSchema = {
    name: 'EmbeddedServiceFlowConfig',
    extends: 'Metadata',
    fields: {
        enabled: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const EmbeddedServiceFlowSchema = {
    name: 'EmbeddedServiceFlow',
    fields: {
        flow: { array: false, nullable: false, optional: false, type: 'string' },
        flowType: { array: false, nullable: false, optional: false, type: 'string' },
        isAuthenticationRequired: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const EmbeddedServiceLayoutSchema = {
    name: 'EmbeddedServiceLayout',
    fields: {
        embeddedServiceLayoutRules: { array: true, nullable: false, optional: true, type: 'EmbeddedServiceLayoutRule' },
        layout: { array: false, nullable: false, optional: false, type: 'string' },
        layoutType: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const EmbeddedServiceLayoutRuleSchema = {
    name: 'EmbeddedServiceLayoutRule',
    fields: {
        appointmentStatus: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const EmbeddedServiceLiveAgentSchema = {
    name: 'EmbeddedServiceLiveAgent',
    extends: 'Metadata',
    fields: {
        avatarImg: { array: false, nullable: false, optional: true, type: 'string' },
        embeddedServiceConfig: { array: false, nullable: false, optional: false, type: 'string' },
        embeddedServiceQuickActions: { array: true, nullable: false, optional: true, type: 'EmbeddedServiceQuickAction' },
        enabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        fontSize: { array: false, nullable: false, optional: false, type: 'string' },
        isOfflineCaseEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isQueuePositionEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        liveAgentChatUrl: { array: false, nullable: false, optional: true, type: 'string' },
        liveAgentContentUrl: { array: false, nullable: false, optional: true, type: 'string' },
        liveChatButton: { array: false, nullable: false, optional: false, type: 'string' },
        liveChatDeployment: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        offlineCaseBackgroundImg: { array: false, nullable: false, optional: true, type: 'string' },
        prechatBackgroundImg: { array: false, nullable: false, optional: true, type: 'string' },
        prechatEnabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        prechatJson: { array: false, nullable: false, optional: true, type: 'string' },
        scenario: { array: false, nullable: false, optional: false, type: 'string' },
        smallCompanyLogoImg: { array: false, nullable: false, optional: true, type: 'string' },
        waitingStateBackgroundImg: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const EmbeddedServiceQuickActionSchema = {
    name: 'EmbeddedServiceQuickAction',
    fields: {
        embeddedServiceLiveAgent: { array: false, nullable: false, optional: false, type: 'string' },
        order: { array: false, nullable: false, optional: false, type: 'number' },
        quickActionDefinition: { array: false, nullable: false, optional: false, type: 'string' },
        quickActionType: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const EmbeddedServiceMenuSettingsSchema = {
    name: 'EmbeddedServiceMenuSettings',
    extends: 'Metadata',
    fields: {
        branding: { array: false, nullable: false, optional: true, type: 'string' },
        embeddedServiceCustomLabels: { array: true, nullable: false, optional: true, type: 'EmbeddedServiceCustomLabel' },
        embeddedServiceCustomizations: { array: true, nullable: false, optional: true, type: 'EmbeddedServiceCustomization' },
        embeddedServiceMenuItems: { array: true, nullable: false, optional: true, type: 'EmbeddedServiceMenuItem' },
        isEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: true, type: 'string' },
        site: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const EmbeddedServiceMenuItemSchema = {
    name: 'EmbeddedServiceMenuItem',
    fields: {
        channel: { array: false, nullable: false, optional: true, type: 'string' },
        channelType: { array: false, nullable: false, optional: true, type: 'string' },
        customUrl: { array: false, nullable: false, optional: true, type: 'string' },
        displayOrder: { array: false, nullable: false, optional: true, type: 'number' },
        embeddedServiceCustomLabels: { array: true, nullable: false, optional: true, type: 'EmbeddedServiceCustomLabel' },
        iconUrl: { array: false, nullable: false, optional: true, type: 'string' },
        isDisplayedOnPageLoad: { array: false, nullable: false, optional: false, type: 'boolean' },
        itemName: { array: false, nullable: false, optional: false, type: 'string' },
        osOptionsHideInIOS: { array: false, nullable: false, optional: true, type: 'boolean' },
        osOptionsHideInLinuxOS: { array: false, nullable: false, optional: true, type: 'boolean' },
        osOptionsHideInMacOS: { array: false, nullable: false, optional: true, type: 'boolean' },
        osOptionsHideInOtherOS: { array: false, nullable: false, optional: true, type: 'boolean' },
        osOptionsHideInWindowsOS: { array: false, nullable: false, optional: true, type: 'boolean' },
        phoneNumber: { array: false, nullable: false, optional: true, type: 'string' },
        shouldOpenUrlInSameTab: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const EmployeeFieldAccessSettingsSchema = {
    name: 'EmployeeFieldAccessSettings',
    extends: 'Metadata',
    fields: {
        enableEmployeeFieldMaskDefaults: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEmployeeFieldMasking: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const EmployeeUserSettingsSchema = {
    name: 'EmployeeUserSettings',
    extends: 'Metadata',
    fields: {
        emailEncoding: { array: false, nullable: false, optional: false, type: 'string' },
        enableEmployeeAutoCreateUser: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEmployeeIsSourceOfTruth: { array: false, nullable: false, optional: true, type: 'boolean' },
        permset: { array: false, nullable: false, optional: true, type: 'string' },
        profile: { array: false, nullable: false, optional: false, type: 'string' },
        usernameSuffix: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const EncryptionKeySettingsSchema = {
    name: 'EncryptionKeySettings',
    extends: 'Metadata',
    fields: {
        canOptOutOfDerivationWithBYOK: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCacheOnlyKeys: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableReplayDetection: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const EngagementMessagingSettingsSchema = {
    name: 'EngagementMessagingSettings',
    extends: 'Metadata',
    fields: {
        isEngagementMessagingComplete: { array: false, nullable: false, optional: true, type: 'boolean' },
        isEngagementMessagingEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const EnhancedNotesSettingsSchema = {
    name: 'EnhancedNotesSettings',
    extends: 'Metadata',
    fields: {
        enableEnhancedNotes: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTasksOnEnhancedNotes: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const EntitlementProcessSchema = {
    name: 'EntitlementProcess',
    extends: 'Metadata',
    fields: {
        SObjectType: { array: false, nullable: false, optional: true, type: 'string' },
        active: { array: false, nullable: false, optional: true, type: 'boolean' },
        businessHours: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        entryStartDateField: { array: false, nullable: false, optional: true, type: 'string' },
        exitCriteriaBooleanFilter: { array: false, nullable: false, optional: true, type: 'string' },
        exitCriteriaFilterItems: { array: true, nullable: false, optional: true, type: 'FilterItem' },
        exitCriteriaFormula: { array: false, nullable: false, optional: true, type: 'string' },
        isRecordTypeApplied: { array: false, nullable: false, optional: true, type: 'boolean' },
        isVersionDefault: { array: false, nullable: false, optional: true, type: 'boolean' },
        milestones: { array: true, nullable: false, optional: true, type: 'EntitlementProcessMilestoneItem' },
        name: { array: false, nullable: false, optional: true, type: 'string' },
        recordType: { array: false, nullable: false, optional: true, type: 'string' },
        versionMaster: { array: false, nullable: false, optional: true, type: 'string' },
        versionNotes: { array: false, nullable: false, optional: true, type: 'string' },
        versionNumber: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const EntitlementProcessMilestoneItemSchema = {
    name: 'EntitlementProcessMilestoneItem',
    fields: {
        businessHours: { array: false, nullable: false, optional: true, type: 'string' },
        criteriaBooleanFilter: { array: false, nullable: false, optional: true, type: 'string' },
        milestoneCriteriaFilterItems: { array: true, nullable: false, optional: true, type: 'FilterItem' },
        milestoneCriteriaFormula: { array: false, nullable: false, optional: true, type: 'string' },
        milestoneName: { array: false, nullable: false, optional: true, type: 'string' },
        minutesCustomClass: { array: false, nullable: false, optional: true, type: 'string' },
        minutesToComplete: { array: false, nullable: false, optional: true, type: 'number' },
        successActions: { array: true, nullable: false, optional: true, type: 'WorkflowActionReference' },
        timeTriggers: { array: true, nullable: false, optional: true, type: 'EntitlementProcessMilestoneTimeTrigger' },
        useCriteriaStartTime: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const EntitlementProcessMilestoneTimeTriggerSchema = {
    name: 'EntitlementProcessMilestoneTimeTrigger',
    fields: {
        actions: { array: true, nullable: false, optional: true, type: 'WorkflowActionReference' },
        timeLength: { array: false, nullable: false, optional: true, type: 'number' },
        workflowTimeTriggerUnit: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const EntitlementSettingsSchema = {
    name: 'EntitlementSettings',
    extends: 'Metadata',
    fields: {
        assetLookupLimitedToActiveEntitlementsOnAccount: { array: false, nullable: false, optional: true, type: 'boolean' },
        assetLookupLimitedToActiveEntitlementsOnContact: { array: false, nullable: false, optional: true, type: 'boolean' },
        assetLookupLimitedToSameAccount: { array: false, nullable: false, optional: true, type: 'boolean' },
        assetLookupLimitedToSameContact: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEntitlementVersioning: { array: false, nullable: false, optional: false, type: 'boolean' },
        enableEntitlements: { array: false, nullable: false, optional: false, type: 'boolean' },
        enableMilestoneFeedItem: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMilestoneStoppedTime: { array: false, nullable: false, optional: true, type: 'boolean' },
        entitlementLookupLimitedToActiveStatus: { array: false, nullable: false, optional: true, type: 'boolean' },
        entitlementLookupLimitedToSameAccount: { array: false, nullable: false, optional: true, type: 'boolean' },
        entitlementLookupLimitedToSameAsset: { array: false, nullable: false, optional: true, type: 'boolean' },
        entitlementLookupLimitedToSameContact: { array: false, nullable: false, optional: true, type: 'boolean' },
        ignoreMilestoneBusinessHours: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const EntitlementTemplateSchema = {
    name: 'EntitlementTemplate',
    extends: 'Metadata',
    fields: {
        businessHours: { array: false, nullable: false, optional: true, type: 'string' },
        casesPerEntitlement: { array: false, nullable: false, optional: true, type: 'number' },
        entitlementProcess: { array: false, nullable: false, optional: true, type: 'string' },
        isPerIncident: { array: false, nullable: false, optional: true, type: 'boolean' },
        term: { array: false, nullable: false, optional: true, type: 'number' },
        type: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const EntityImplementsSchema = {
    name: 'EntityImplements',
    extends: 'Metadata',
    fields: {
        fieldImplements: { array: true, nullable: false, optional: true, type: 'FieldImplements' },
        isDefault: { array: false, nullable: false, optional: true, type: 'boolean' },
        isFullyMapped: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const FieldImplementsSchema = {
    name: 'FieldImplements',
    fields: {
        field: { array: false, nullable: false, optional: true, type: 'string' },
        interfaceField: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const EscalationRuleSchema = {
    name: 'EscalationRule',
    extends: 'Metadata',
    fields: {
        active: { array: false, nullable: false, optional: true, type: 'boolean' },
        ruleEntry: { array: true, nullable: false, optional: true, type: 'RuleEntry' },
    }
}

const EscalationRulesSchema = {
    name: 'EscalationRules',
    extends: 'Metadata',
    fields: {
        escalationRule: { array: true, nullable: false, optional: true, type: 'EscalationRule' },
    }
}

const EssentialsSettingsSchema = {
    name: 'EssentialsSettings',
    extends: 'Metadata',
    fields: {
        emailConnectorEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const EventRelayConfigSchema = {
    name: 'EventRelayConfig',
    extends: 'Metadata',
    fields: {
        destinationResourceName: { array: false, nullable: false, optional: false, type: 'string' },
        eventChannel: { array: false, nullable: false, optional: false, type: 'string' },
        relayOption: { array: false, nullable: false, optional: true, type: 'string' },
        state: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const EventSettingsSchema = {
    name: 'EventSettings',
    extends: 'Metadata',
    fields: {
        bypassMeteringBlock: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableApexLimitEvents: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDeleteMonitoringData: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDynamicStreamingChannel: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEventLogGeneration: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEventLogWaveIntegration: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLoginForensics: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableStreamingApi: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTerminateOldestSession: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTransactionSecurityPolicies: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ExperienceBundleSchema = {
    name: 'ExperienceBundle',
    extends: 'Metadata',
    fields: {
        experienceResources: { array: false, nullable: false, optional: true, type: 'ExperienceResources' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
        urlPathPrefix: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ExperienceResourcesSchema = {
    name: 'ExperienceResources',
    fields: {
        experienceResource: { array: true, nullable: false, optional: true, type: 'ExperienceResource' },
    }
}

const ExperienceResourceSchema = {
    name: 'ExperienceResource',
    fields: {
        fileName: { array: false, nullable: false, optional: false, type: 'string' },
        format: { array: false, nullable: false, optional: false, type: 'string' },
        source: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ExperienceBundleSettingsSchema = {
    name: 'ExperienceBundleSettings',
    extends: 'Metadata',
    fields: {
        enableExperienceBundleMetadata: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ExperiencePropertyKeyBundleSchema = {
    name: 'ExperiencePropertyKeyBundle',
    extends: 'Metadata',
    fields: {
        defaultDesignConfigMCTBody: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        schemaMCTBody: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ExplainabilityActionDefinitionSchema = {
    name: 'ExplainabilityActionDefinition',
    extends: 'Metadata',
    fields: {
        actionLogSchemaType: { array: false, nullable: false, optional: false, type: 'string' },
        applicationSubtype: { array: false, nullable: false, optional: false, type: 'string' },
        applicationType: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        internal: { array: false, nullable: false, optional: false, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        processType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ExplainabilityActionVersionSchema = {
    name: 'ExplainabilityActionVersion',
    extends: 'Metadata',
    fields: {
        actionLogMessageTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        actionSpecification: { array: false, nullable: false, optional: false, type: 'string' },
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        definitionVersion: { array: false, nullable: false, optional: false, type: 'number' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        explainabilityActionDef: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ExternalClientAppSettingsSchema = {
    name: 'ExternalClientAppSettings',
    extends: 'Metadata',
    fields: {
        enableConsumerSecretApiAccess: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ExternalCredentialSchema = {
    name: 'ExternalCredential',
    extends: 'Metadata',
    fields: {
        authenticationProtocol: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        externalCredentialParameters: { array: true, nullable: false, optional: true, type: 'ExternalCredentialParameter' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ExternalCredentialParameterSchema = {
    name: 'ExternalCredentialParameter',
    fields: {
        authProvider: { array: false, nullable: false, optional: true, type: 'string' },
        certificate: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        parameterName: { array: false, nullable: false, optional: false, type: 'string' },
        parameterType: { array: false, nullable: false, optional: false, type: 'string' },
        parameterValue: { array: false, nullable: false, optional: true, type: 'string' },
        principal: { array: false, nullable: false, optional: true, type: 'string' },
        sequenceNumber: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const ExternalDataSourceSchema = {
    name: 'ExternalDataSource',
    extends: 'Metadata',
    fields: {
        authProvider: { array: false, nullable: false, optional: true, type: 'string' },
        certificate: { array: false, nullable: false, optional: true, type: 'string' },
        customConfiguration: { array: false, nullable: false, optional: true, type: 'string' },
        customHttpHeaders: { array: true, nullable: false, optional: true, type: 'CustomHttpHeader' },
        endpoint: { array: false, nullable: false, optional: true, type: 'string' },
        externalDataSrcDescriptors: { array: true, nullable: false, optional: true, type: 'ExternalDataSrcDescriptor' },
        isWritable: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        namedCredential: { array: false, nullable: false, optional: true, type: 'string' },
        oauthRefreshToken: { array: false, nullable: false, optional: true, type: 'string' },
        oauthScope: { array: false, nullable: false, optional: true, type: 'string' },
        oauthToken: { array: false, nullable: false, optional: true, type: 'string' },
        password: { array: false, nullable: false, optional: true, type: 'string' },
        principalType: { array: false, nullable: false, optional: false, type: 'string' },
        protocol: { array: false, nullable: false, optional: false, type: 'string' },
        repository: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
        username: { array: false, nullable: false, optional: true, type: 'string' },
        version: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const CustomHttpHeaderSchema = {
    name: 'CustomHttpHeader',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        headerFieldName: { array: false, nullable: false, optional: false, type: 'string' },
        headerFieldValue: { array: false, nullable: false, optional: false, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ExternalDataSrcDescriptorSchema = {
    name: 'ExternalDataSrcDescriptor',
    extends: 'Metadata',
    fields: {
        customObject: { array: false, nullable: false, optional: true, type: 'string' },
        descriptor: { array: false, nullable: false, optional: false, type: 'string' },
        descriptorVersion: { array: false, nullable: false, optional: true, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        externalDataSource: { array: false, nullable: false, optional: false, type: 'string' },
        subtype: { array: false, nullable: false, optional: false, type: 'string' },
        systemVersion: { array: false, nullable: false, optional: false, type: 'number' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ExternalServiceRegistrationSchema = {
    name: 'ExternalServiceRegistration',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        namedCredential: { array: false, nullable: false, optional: true, type: 'string' },
        namedCredentialReference: { array: false, nullable: false, optional: true, type: 'string' },
        operations: { array: true, nullable: false, optional: true, type: 'ExternalServiceOperation' },
        providerAssetEndpoint: { array: false, nullable: false, optional: true, type: 'string' },
        registrationProviderType: { array: false, nullable: false, optional: true, type: 'string' },
        schema: { array: false, nullable: false, optional: true, type: 'string' },
        schemaAbsoluteUrl: { array: false, nullable: false, optional: true, type: 'string' },
        schemaType: { array: false, nullable: false, optional: true, type: 'string' },
        schemaUploadFileExtension: { array: false, nullable: false, optional: true, type: 'string' },
        schemaUploadFileName: { array: false, nullable: false, optional: true, type: 'string' },
        schemaUrl: { array: false, nullable: false, optional: true, type: 'string' },
        serviceBinding: { array: false, nullable: false, optional: true, type: 'string' },
        status: { array: false, nullable: false, optional: false, type: 'string' },
        systemVersion: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const ExternalServiceOperationSchema = {
    name: 'ExternalServiceOperation',
    fields: {
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FieldRestrictionRuleSchema = {
    name: 'FieldRestrictionRule',
    extends: 'Metadata',
    fields: {
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        classification: { array: true, nullable: false, optional: true, type: 'string' },
        classificationType: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        enforcementType: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        recordFilter: { array: false, nullable: false, optional: false, type: 'string' },
        targetEntity: { array: false, nullable: false, optional: false, type: 'string' },
        userCriteria: { array: false, nullable: false, optional: false, type: 'string' },
        version: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const FieldServiceSettingsSchema = {
    name: 'FieldServiceSettings',
    extends: 'Metadata',
    fields: {
        apptAssistantExpiration: { array: false, nullable: false, optional: true, type: 'number' },
        apptAssistantInfoUrl: { array: false, nullable: false, optional: true, type: 'string' },
        apptAssistantRadiusUnitValue: { array: false, nullable: false, optional: true, type: 'string' },
        apptAssistantRadiusValue: { array: false, nullable: false, optional: true, type: 'number' },
        apptAssistantStatus: { array: false, nullable: false, optional: true, type: 'string' },
        deepLinkPublicSecurityKey: { array: false, nullable: false, optional: true, type: 'string' },
        doesAllowEditSaForCrew: { array: false, nullable: false, optional: true, type: 'boolean' },
        doesShareSaParentWoWithAr: { array: false, nullable: false, optional: true, type: 'boolean' },
        doesShareSaWithAr: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableBatchWindow: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFloatingWorkOrder: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePopulateWorkOrderAddress: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWorkOrders: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWorkPlansAutoGeneration: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWorkStepManualStatusUpdate: { array: false, nullable: false, optional: true, type: 'boolean' },
        fieldServiceNotificationsOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        fieldServiceOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        isGeoCodeSyncEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isLocationHistoryEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        mobileFeedbackEmails: { array: false, nullable: false, optional: true, type: 'string' },
        o2EngineEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        objectMappingItem: { array: true, nullable: false, optional: true, type: 'ObjectMappingItem' },
        optimizationServiceAccess: { array: false, nullable: false, optional: true, type: 'boolean' },
        serviceAppointmentsDueDateOffsetOrgValue: { array: false, nullable: false, optional: true, type: 'number' },
        workOrderDurationSource: { array: false, nullable: false, optional: true, type: 'string' },
        workOrderLineItemSearchFields: { array: true, nullable: false, optional: true, type: 'string' },
        workOrderSearchFields: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const ObjectMappingItemSchema = {
    name: 'ObjectMappingItem',
    fields: {
        mappingType: { array: false, nullable: false, optional: false, type: 'string' },
        objectMapping: { array: false, nullable: false, optional: false, type: 'ObjectMapping' },
    }
}

const FileUploadAndDownloadSecuritySettingsSchema = {
    name: 'FileUploadAndDownloadSecuritySettings',
    extends: 'Metadata',
    fields: {
        dispositions: { array: true, nullable: false, optional: true, type: 'FileTypeDispositionAssignmentBean' },
        noHtmlUploadAsAttachment: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const FileTypeDispositionAssignmentBeanSchema = {
    name: 'FileTypeDispositionAssignmentBean',
    fields: {
        behavior: { array: false, nullable: false, optional: false, type: 'string' },
        fileType: { array: false, nullable: false, optional: false, type: 'string' },
        securityRiskFileType: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const FilesConnectSettingsSchema = {
    name: 'FilesConnectSettings',
    extends: 'Metadata',
    fields: {
        enableContentHubAllowed: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableContentHubCvtLinksAllowed: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableContentHubEOSearchLayout: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const FlexiPageSchema = {
    name: 'FlexiPage',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        events: { array: true, nullable: false, optional: true, type: 'FlexiPageEvent' },
        flexiPageRegions: { array: true, nullable: false, optional: true, type: 'FlexiPageRegion' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        parentFlexiPage: { array: false, nullable: false, optional: true, type: 'string' },
        platformActionlist: { array: false, nullable: false, optional: true, type: 'PlatformActionList' },
        quickActionList: { array: false, nullable: false, optional: true, type: 'QuickActionList' },
        sobjectType: { array: false, nullable: false, optional: true, type: 'string' },
        template: { array: false, nullable: false, optional: false, type: 'FlexiPageTemplateInstance' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlexiPageEventSchema = {
    name: 'FlexiPageEvent',
    fields: {
        sourceName: { array: false, nullable: false, optional: false, type: 'string' },
        sourceProperties: { array: true, nullable: false, optional: true, type: 'FlexiPageEventSourceProperty' },
        sourceType: { array: false, nullable: false, optional: false, type: 'string' },
        targets: { array: true, nullable: false, optional: true, type: 'FlexiPageEventTarget' },
    }
}

const FlexiPageEventSourcePropertySchema = {
    name: 'FlexiPageEventSourceProperty',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlexiPageEventTargetSchema = {
    name: 'FlexiPageEventTarget',
    fields: {
        mappings: { array: true, nullable: false, optional: true, type: 'FlexiPageEventPropertyMapping' },
        method: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        properties: { array: true, nullable: false, optional: true, type: 'FlexiPageEventTargetProperty' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlexiPageEventPropertyMappingSchema = {
    name: 'FlexiPageEventPropertyMapping',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FlexiPageEventTargetPropertySchema = {
    name: 'FlexiPageEventTargetProperty',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlexiPageRegionSchema = {
    name: 'FlexiPageRegion',
    fields: {
        appendable: { array: false, nullable: false, optional: true, type: 'string' },
        itemInstances: { array: true, nullable: false, optional: true, type: 'ItemInstance' },
        mode: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        prependable: { array: false, nullable: false, optional: true, type: 'string' },
        replaceable: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ItemInstanceSchema = {
    name: 'ItemInstance',
    fields: {
        componentInstance: { array: false, nullable: false, optional: true, type: 'ComponentInstance' },
        fieldInstance: { array: false, nullable: false, optional: true, type: 'FieldInstance' },
    }
}

const ComponentInstanceSchema = {
    name: 'ComponentInstance',
    fields: {
        componentInstanceProperties: { array: true, nullable: false, optional: true, type: 'ComponentInstanceProperty' },
        componentName: { array: false, nullable: false, optional: false, type: 'string' },
        componentType: { array: false, nullable: false, optional: true, type: 'string' },
        identifier: { array: false, nullable: false, optional: true, type: 'string' },
        visibilityRule: { array: false, nullable: false, optional: true, type: 'UiFormulaRule' },
    }
}

const ComponentInstancePropertySchema = {
    name: 'ComponentInstanceProperty',
    fields: {
        name: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: true, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'string' },
        valueList: { array: false, nullable: false, optional: true, type: 'ComponentInstancePropertyList' },
    }
}

const ComponentInstancePropertyListSchema = {
    name: 'ComponentInstancePropertyList',
    fields: {
        valueListItems: { array: true, nullable: false, optional: true, type: 'ComponentInstancePropertyListItem' },
    }
}

const ComponentInstancePropertyListItemSchema = {
    name: 'ComponentInstancePropertyListItem',
    fields: {
        value: { array: false, nullable: false, optional: true, type: 'string' },
        visibilityRule: { array: false, nullable: false, optional: true, type: 'UiFormulaRule' },
    }
}

const UiFormulaRuleSchema = {
    name: 'UiFormulaRule',
    fields: {
        booleanFilter: { array: false, nullable: false, optional: true, type: 'string' },
        criteria: { array: true, nullable: false, optional: true, type: 'UiFormulaCriterion' },
    }
}

const UiFormulaCriterionSchema = {
    name: 'UiFormulaCriterion',
    fields: {
        leftValue: { array: false, nullable: false, optional: false, type: 'string' },
        operator: { array: false, nullable: false, optional: false, type: 'string' },
        rightValue: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FieldInstanceSchema = {
    name: 'FieldInstance',
    fields: {
        fieldInstanceProperties: { array: true, nullable: false, optional: true, type: 'FieldInstanceProperty' },
        fieldItem: { array: false, nullable: false, optional: false, type: 'string' },
        identifier: { array: false, nullable: false, optional: true, type: 'string' },
        visibilityRule: { array: false, nullable: false, optional: true, type: 'UiFormulaRule' },
    }
}

const FieldInstancePropertySchema = {
    name: 'FieldInstanceProperty',
    fields: {
        name: { array: false, nullable: false, optional: true, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const PlatformActionListSchema = {
    name: 'PlatformActionList',
    fields: {
        actionListContext: { array: false, nullable: false, optional: false, type: 'string' },
        platformActionListItems: { array: true, nullable: false, optional: true, type: 'PlatformActionListItem' },
        relatedSourceEntity: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const PlatformActionListItemSchema = {
    name: 'PlatformActionListItem',
    fields: {
        actionName: { array: false, nullable: false, optional: false, type: 'string' },
        actionType: { array: false, nullable: false, optional: false, type: 'string' },
        sortOrder: { array: false, nullable: false, optional: false, type: 'number' },
        subtype: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const QuickActionListSchema = {
    name: 'QuickActionList',
    fields: {
        quickActionListItems: { array: true, nullable: false, optional: true, type: 'QuickActionListItem' },
    }
}

const QuickActionListItemSchema = {
    name: 'QuickActionListItem',
    fields: {
        quickActionName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlexiPageTemplateInstanceSchema = {
    name: 'FlexiPageTemplateInstance',
    fields: {
        componentType: { array: false, nullable: false, optional: true, type: 'string' },
        identifier: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        properties: { array: true, nullable: false, optional: true, type: 'ComponentInstanceProperty' },
    }
}

const FlowSchema = {
    name: 'Flow',
    extends: 'Metadata',
    fields: {
        actionCalls: { array: true, nullable: false, optional: true, type: 'FlowActionCall' },
        apexPluginCalls: { array: true, nullable: false, optional: true, type: 'FlowApexPluginCall' },
        apiVersion: { array: false, nullable: true, optional: true, type: 'number' },
        assignments: { array: true, nullable: false, optional: true, type: 'FlowAssignment' },
        associatedRecord: { array: false, nullable: false, optional: true, type: 'string' },
        choices: { array: true, nullable: false, optional: true, type: 'FlowChoice' },
        collectionProcessors: { array: true, nullable: false, optional: true, type: 'FlowCollectionProcessor' },
        constants: { array: true, nullable: false, optional: true, type: 'FlowConstant' },
        decisions: { array: true, nullable: false, optional: true, type: 'FlowDecision' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        dynamicChoiceSets: { array: true, nullable: false, optional: true, type: 'FlowDynamicChoiceSet' },
        environments: { array: true, nullable: false, optional: true, type: 'string' },
        formulas: { array: true, nullable: false, optional: true, type: 'FlowFormula' },
        interviewLabel: { array: false, nullable: false, optional: true, type: 'string' },
        isAdditionalPermissionRequiredToRun: { array: false, nullable: false, optional: true, type: 'boolean' },
        isOverridable: { array: false, nullable: false, optional: true, type: 'boolean' },
        isTemplate: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        loops: { array: true, nullable: false, optional: true, type: 'FlowLoop' },
        migratedFromWorkflowRuleName: { array: false, nullable: false, optional: true, type: 'string' },
        orchestratedStages: { array: true, nullable: false, optional: true, type: 'FlowOrchestratedStage' },
        overriddenFlow: { array: false, nullable: false, optional: true, type: 'string' },
        processMetadataValues: { array: true, nullable: false, optional: true, type: 'FlowMetadataValue' },
        processType: { array: false, nullable: false, optional: true, type: 'string' },
        recordCreates: { array: true, nullable: false, optional: true, type: 'FlowRecordCreate' },
        recordDeletes: { array: true, nullable: false, optional: true, type: 'FlowRecordDelete' },
        recordLookups: { array: true, nullable: false, optional: true, type: 'FlowRecordLookup' },
        recordRollbacks: { array: true, nullable: false, optional: true, type: 'FlowRecordRollback' },
        recordUpdates: { array: true, nullable: false, optional: true, type: 'FlowRecordUpdate' },
        runInMode: { array: false, nullable: false, optional: true, type: 'string' },
        screens: { array: true, nullable: false, optional: true, type: 'FlowScreen' },
        sourceTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        stages: { array: true, nullable: false, optional: true, type: 'FlowStage' },
        start: { array: false, nullable: false, optional: true, type: 'FlowStart' },
        startElementReference: { array: false, nullable: false, optional: true, type: 'string' },
        status: { array: false, nullable: false, optional: true, type: 'string' },
        steps: { array: true, nullable: false, optional: true, type: 'FlowStep' },
        subflows: { array: true, nullable: false, optional: true, type: 'FlowSubflow' },
        textTemplates: { array: true, nullable: false, optional: true, type: 'FlowTextTemplate' },
        timeZoneSidKey: { array: false, nullable: false, optional: true, type: 'string' },
        transforms: { array: true, nullable: false, optional: true, type: 'FlowTransform' },
        triggerOrder: { array: false, nullable: true, optional: true, type: 'number' },
        variables: { array: true, nullable: false, optional: true, type: 'FlowVariable' },
        waits: { array: true, nullable: false, optional: true, type: 'FlowWait' },
    }
}

const FlowActionCallSchema = {
    name: 'FlowActionCall',
    extends: 'FlowNode',
    fields: {
        actionName: { array: false, nullable: false, optional: false, type: 'string' },
        actionType: { array: false, nullable: false, optional: false, type: 'string' },
        connector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        dataTypeMappings: { array: true, nullable: false, optional: true, type: 'FlowDataTypeMapping' },
        faultConnector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        flowTransactionModel: { array: false, nullable: false, optional: true, type: 'string' },
        inputParameters: { array: true, nullable: false, optional: true, type: 'FlowActionCallInputParameter' },
        outputParameters: { array: true, nullable: false, optional: true, type: 'FlowActionCallOutputParameter' },
        storeOutputAutomatically: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const FlowNodeSchema = {
    name: 'FlowNode',
    extends: 'FlowElement',
    fields: {
        elementSubtype: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        locationX: { array: false, nullable: false, optional: false, type: 'number' },
        locationY: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const FlowElementSchema = {
    name: 'FlowElement',
    extends: 'FlowBaseElement',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FlowBaseElementSchema = {
    name: 'FlowBaseElement',
    fields: {
        processMetadataValues: { array: true, nullable: false, optional: true, type: 'FlowMetadataValue' },
    }
}

const FlowMetadataValueSchema = {
    name: 'FlowMetadataValue',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'FlowElementReferenceOrValue' },
    }
}

const FlowElementReferenceOrValueSchema = {
    name: 'FlowElementReferenceOrValue',
    fields: {
        apexValue: { array: false, nullable: true, optional: true, type: 'string' },
        booleanValue: { array: false, nullable: true, optional: true, type: 'boolean' },
        dateTimeValue: { array: false, nullable: false, optional: true, type: 'string' },
        dateValue: { array: false, nullable: false, optional: true, type: 'string' },
        elementReference: { array: false, nullable: false, optional: true, type: 'string' },
        numberValue: { array: false, nullable: true, optional: true, type: 'number' },
        sobjectValue: { array: false, nullable: true, optional: true, type: 'string' },
        stringValue: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FlowActionCallInputParameterSchema = {
    name: 'FlowActionCallInputParameter',
    extends: 'FlowBaseElement',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'FlowElementReferenceOrValue' },
    }
}

const FlowActionCallOutputParameterSchema = {
    name: 'FlowActionCallOutputParameter',
    extends: 'FlowBaseElement',
    fields: {
        assignToReference: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlowApexPluginCallInputParameterSchema = {
    name: 'FlowApexPluginCallInputParameter',
    extends: 'FlowBaseElement',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'FlowElementReferenceOrValue' },
    }
}

const FlowApexPluginCallOutputParameterSchema = {
    name: 'FlowApexPluginCallOutputParameter',
    extends: 'FlowBaseElement',
    fields: {
        assignToReference: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlowAssignmentItemSchema = {
    name: 'FlowAssignmentItem',
    extends: 'FlowBaseElement',
    fields: {
        assignToReference: { array: false, nullable: false, optional: false, type: 'string' },
        operator: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'FlowElementReferenceOrValue' },
    }
}

const FlowChoiceUserInputSchema = {
    name: 'FlowChoiceUserInput',
    extends: 'FlowBaseElement',
    fields: {
        isRequired: { array: false, nullable: false, optional: true, type: 'boolean' },
        promptText: { array: false, nullable: false, optional: true, type: 'string' },
        validationRule: { array: false, nullable: false, optional: true, type: 'FlowInputValidationRule' },
    }
}

const FlowInputValidationRuleSchema = {
    name: 'FlowInputValidationRule',
    fields: {
        errorMessage: { array: false, nullable: false, optional: false, type: 'string' },
        formulaExpression: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlowCollectionMapItemSchema = {
    name: 'FlowCollectionMapItem',
    extends: 'FlowBaseElement',
    fields: {
        assignToFieldReference: { array: false, nullable: false, optional: false, type: 'string' },
        operator: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: false, type: 'FlowElementReferenceOrValue' },
    }
}

const FlowCollectionSortOptionSchema = {
    name: 'FlowCollectionSortOption',
    extends: 'FlowBaseElement',
    fields: {
        doesPutEmptyStringAndNullFirst: { array: false, nullable: false, optional: false, type: 'boolean' },
        sortField: { array: false, nullable: false, optional: true, type: 'string' },
        sortOrder: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlowConditionSchema = {
    name: 'FlowCondition',
    extends: 'FlowBaseElement',
    fields: {
        leftValueReference: { array: false, nullable: false, optional: false, type: 'string' },
        operator: { array: false, nullable: false, optional: false, type: 'string' },
        rightValue: { array: false, nullable: false, optional: true, type: 'FlowElementReferenceOrValue' },
    }
}

const FlowConnectorSchema = {
    name: 'FlowConnector',
    extends: 'FlowBaseElement',
    fields: {
        isGoTo: { array: false, nullable: false, optional: true, type: 'boolean' },
        targetReference: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlowDataTypeMappingSchema = {
    name: 'FlowDataTypeMapping',
    extends: 'FlowBaseElement',
    fields: {
        typeName: { array: false, nullable: false, optional: false, type: 'string' },
        typeValue: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlowInputFieldAssignmentSchema = {
    name: 'FlowInputFieldAssignment',
    extends: 'FlowBaseElement',
    fields: {
        field: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'FlowElementReferenceOrValue' },
    }
}

const FlowOutputFieldAssignmentSchema = {
    name: 'FlowOutputFieldAssignment',
    extends: 'FlowBaseElement',
    fields: {
        assignToReference: { array: false, nullable: false, optional: false, type: 'string' },
        field: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlowRecordFilterSchema = {
    name: 'FlowRecordFilter',
    extends: 'FlowBaseElement',
    fields: {
        field: { array: false, nullable: false, optional: false, type: 'string' },
        operator: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'FlowElementReferenceOrValue' },
    }
}

const FlowScreenFieldInputParameterSchema = {
    name: 'FlowScreenFieldInputParameter',
    extends: 'FlowBaseElement',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'FlowElementReferenceOrValue' },
    }
}

const FlowScreenFieldOutputParameterSchema = {
    name: 'FlowScreenFieldOutputParameter',
    extends: 'FlowBaseElement',
    fields: {
        assignToReference: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlowScreenRuleSchema = {
    name: 'FlowScreenRule',
    extends: 'FlowBaseElement',
    fields: {
        conditionLogic: { array: false, nullable: false, optional: true, type: 'string' },
        conditions: { array: true, nullable: false, optional: true, type: 'FlowCondition' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        ruleActions: { array: true, nullable: false, optional: true, type: 'FlowScreenRuleAction' },
    }
}

const FlowScreenRuleActionSchema = {
    name: 'FlowScreenRuleAction',
    extends: 'FlowBaseElement',
    fields: {
        attribute: { array: false, nullable: false, optional: false, type: 'string' },
        fieldReference: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'FlowElementReferenceOrValue' },
    }
}

const FlowStageStepAssigneeSchema = {
    name: 'FlowStageStepAssignee',
    extends: 'FlowBaseElement',
    fields: {
        assignee: { array: false, nullable: false, optional: false, type: 'FlowElementReferenceOrValue' },
        assigneeType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlowStageStepEntryActionInputParameterSchema = {
    name: 'FlowStageStepEntryActionInputParameter',
    extends: 'FlowBaseElement',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'FlowElementReferenceOrValue' },
    }
}

const FlowStageStepEntryActionOutputParameterSchema = {
    name: 'FlowStageStepEntryActionOutputParameter',
    extends: 'FlowBaseElement',
    fields: {
        assignToReference: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlowStageStepExitActionInputParameterSchema = {
    name: 'FlowStageStepExitActionInputParameter',
    extends: 'FlowBaseElement',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'FlowElementReferenceOrValue' },
    }
}

const FlowStageStepExitActionOutputParameterSchema = {
    name: 'FlowStageStepExitActionOutputParameter',
    extends: 'FlowBaseElement',
    fields: {
        assignToReference: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlowStageStepInputParameterSchema = {
    name: 'FlowStageStepInputParameter',
    extends: 'FlowBaseElement',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'FlowElementReferenceOrValue' },
    }
}

const FlowStageStepOutputParameterSchema = {
    name: 'FlowStageStepOutputParameter',
    extends: 'FlowBaseElement',
    fields: {
        assignToReference: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlowSubflowInputAssignmentSchema = {
    name: 'FlowSubflowInputAssignment',
    extends: 'FlowBaseElement',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'FlowElementReferenceOrValue' },
    }
}

const FlowSubflowOutputAssignmentSchema = {
    name: 'FlowSubflowOutputAssignment',
    extends: 'FlowBaseElement',
    fields: {
        assignToReference: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlowTransformValueSchema = {
    name: 'FlowTransformValue',
    extends: 'FlowBaseElement',
    fields: {
        inputReference: { array: false, nullable: false, optional: true, type: 'string' },
        transformValueActions: { array: true, nullable: false, optional: true, type: 'FlowTransformValueAction' },
    }
}

const FlowTransformValueActionSchema = {
    name: 'FlowTransformValueAction',
    extends: 'FlowBaseElement',
    fields: {
        outputFieldApiName: { array: false, nullable: false, optional: true, type: 'string' },
        transformType: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'FlowElementReferenceOrValue' },
    }
}

const FlowVisibilityRuleSchema = {
    name: 'FlowVisibilityRule',
    extends: 'FlowBaseElement',
    fields: {
        conditionLogic: { array: false, nullable: false, optional: true, type: 'string' },
        conditions: { array: true, nullable: false, optional: true, type: 'FlowCondition' },
    }
}

const FlowWaitEventInputParameterSchema = {
    name: 'FlowWaitEventInputParameter',
    extends: 'FlowBaseElement',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'FlowElementReferenceOrValue' },
    }
}

const FlowWaitEventOutputParameterSchema = {
    name: 'FlowWaitEventOutputParameter',
    extends: 'FlowBaseElement',
    fields: {
        assignToReference: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlowChoiceSchema = {
    name: 'FlowChoice',
    extends: 'FlowElement',
    fields: {
        choiceText: { array: false, nullable: false, optional: false, type: 'string' },
        dataType: { array: false, nullable: false, optional: false, type: 'string' },
        userInput: { array: false, nullable: false, optional: true, type: 'FlowChoiceUserInput' },
        value: { array: false, nullable: false, optional: true, type: 'FlowElementReferenceOrValue' },
    }
}

const FlowConstantSchema = {
    name: 'FlowConstant',
    extends: 'FlowElement',
    fields: {
        dataType: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'FlowElementReferenceOrValue' },
    }
}

const FlowDynamicChoiceSetSchema = {
    name: 'FlowDynamicChoiceSet',
    extends: 'FlowElement',
    fields: {
        collectionReference: { array: false, nullable: false, optional: true, type: 'string' },
        dataType: { array: false, nullable: false, optional: false, type: 'string' },
        displayField: { array: false, nullable: false, optional: false, type: 'string' },
        filterLogic: { array: false, nullable: false, optional: true, type: 'string' },
        filters: { array: true, nullable: false, optional: true, type: 'FlowRecordFilter' },
        limit: { array: false, nullable: true, optional: true, type: 'number' },
        object: { array: false, nullable: false, optional: false, type: 'string' },
        outputAssignments: { array: true, nullable: false, optional: true, type: 'FlowOutputFieldAssignment' },
        picklistField: { array: false, nullable: false, optional: true, type: 'string' },
        picklistObject: { array: false, nullable: false, optional: true, type: 'string' },
        sortField: { array: false, nullable: false, optional: true, type: 'string' },
        sortOrder: { array: false, nullable: false, optional: true, type: 'string' },
        valueField: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FlowFormulaSchema = {
    name: 'FlowFormula',
    extends: 'FlowElement',
    fields: {
        dataType: { array: false, nullable: false, optional: true, type: 'string' },
        expression: { array: false, nullable: false, optional: false, type: 'string' },
        scale: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const FlowRuleSchema = {
    name: 'FlowRule',
    extends: 'FlowElement',
    fields: {
        conditionLogic: { array: false, nullable: false, optional: false, type: 'string' },
        conditions: { array: true, nullable: false, optional: true, type: 'FlowCondition' },
        connector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        doesRequireRecordChangedToMeetCriteria: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlowScheduledPathSchema = {
    name: 'FlowScheduledPath',
    extends: 'FlowElement',
    fields: {
        connector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        maxBatchSize: { array: false, nullable: false, optional: true, type: 'number' },
        offsetNumber: { array: false, nullable: false, optional: true, type: 'number' },
        offsetUnit: { array: false, nullable: false, optional: true, type: 'string' },
        pathType: { array: false, nullable: false, optional: true, type: 'string' },
        recordField: { array: false, nullable: false, optional: true, type: 'string' },
        timeSource: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FlowScreenFieldSchema = {
    name: 'FlowScreenField',
    extends: 'FlowElement',
    fields: {
        choiceReferences: { array: true, nullable: false, optional: true, type: 'string' },
        dataType: { array: false, nullable: false, optional: true, type: 'string' },
        dataTypeMappings: { array: true, nullable: false, optional: true, type: 'FlowDataTypeMapping' },
        defaultSelectedChoiceReference: { array: false, nullable: false, optional: true, type: 'string' },
        defaultValue: { array: false, nullable: false, optional: true, type: 'FlowElementReferenceOrValue' },
        extensionName: { array: false, nullable: false, optional: true, type: 'string' },
        fieldText: { array: false, nullable: false, optional: true, type: 'string' },
        fieldType: { array: false, nullable: false, optional: false, type: 'string' },
        fields: { array: true, nullable: false, optional: true, type: 'FlowScreenField' },
        helpText: { array: false, nullable: false, optional: true, type: 'string' },
        inputParameters: { array: true, nullable: false, optional: true, type: 'FlowScreenFieldInputParameter' },
        inputsOnNextNavToAssocScrn: { array: false, nullable: false, optional: true, type: 'string' },
        isRequired: { array: false, nullable: false, optional: true, type: 'boolean' },
        isVisible: { array: false, nullable: true, optional: true, type: 'boolean' },
        objectFieldReference: { array: false, nullable: false, optional: true, type: 'string' },
        outputParameters: { array: true, nullable: false, optional: true, type: 'FlowScreenFieldOutputParameter' },
        regionContainerType: { array: false, nullable: false, optional: true, type: 'string' },
        scale: { array: false, nullable: false, optional: true, type: 'number' },
        storeOutputAutomatically: { array: false, nullable: false, optional: true, type: 'boolean' },
        validationRule: { array: false, nullable: false, optional: true, type: 'FlowInputValidationRule' },
        visibilityRule: { array: false, nullable: false, optional: true, type: 'FlowVisibilityRule' },
    }
}

const FlowStageSchema = {
    name: 'FlowStage',
    extends: 'FlowElement',
    fields: {
        isActive: { array: false, nullable: false, optional: false, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        stageOrder: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const FlowStageStepSchema = {
    name: 'FlowStageStep',
    extends: 'FlowElement',
    fields: {
        actionName: { array: false, nullable: false, optional: false, type: 'string' },
        actionType: { array: false, nullable: false, optional: false, type: 'string' },
        assignees: { array: true, nullable: false, optional: true, type: 'FlowStageStepAssignee' },
        entryActionInputParameters: { array: true, nullable: false, optional: true, type: 'FlowStageStepEntryActionInputParameter' },
        entryActionName: { array: false, nullable: false, optional: true, type: 'string' },
        entryActionOutputParameters: { array: true, nullable: false, optional: true, type: 'FlowStageStepEntryActionOutputParameter' },
        entryActionType: { array: false, nullable: false, optional: true, type: 'string' },
        entryConditionLogic: { array: false, nullable: false, optional: false, type: 'string' },
        entryConditions: { array: true, nullable: false, optional: true, type: 'FlowCondition' },
        exitActionInputParameters: { array: true, nullable: false, optional: true, type: 'FlowStageStepExitActionInputParameter' },
        exitActionName: { array: false, nullable: false, optional: true, type: 'string' },
        exitActionOutputParameters: { array: true, nullable: false, optional: true, type: 'FlowStageStepExitActionOutputParameter' },
        exitActionType: { array: false, nullable: false, optional: true, type: 'string' },
        inputParameters: { array: true, nullable: false, optional: true, type: 'FlowStageStepInputParameter' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        outputParameters: { array: true, nullable: false, optional: true, type: 'FlowStageStepOutputParameter' },
        requiresAsyncProcessing: { array: false, nullable: false, optional: true, type: 'boolean' },
        stepSubtype: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FlowTextTemplateSchema = {
    name: 'FlowTextTemplate',
    extends: 'FlowElement',
    fields: {
        isViewedAsPlainText: { array: false, nullable: false, optional: true, type: 'boolean' },
        text: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlowVariableSchema = {
    name: 'FlowVariable',
    extends: 'FlowElement',
    fields: {
        apexClass: { array: false, nullable: false, optional: true, type: 'string' },
        dataType: { array: false, nullable: false, optional: false, type: 'string' },
        isCollection: { array: false, nullable: false, optional: true, type: 'boolean' },
        isInput: { array: false, nullable: false, optional: true, type: 'boolean' },
        isOutput: { array: false, nullable: false, optional: true, type: 'boolean' },
        objectType: { array: false, nullable: false, optional: true, type: 'string' },
        scale: { array: false, nullable: false, optional: true, type: 'number' },
        value: { array: false, nullable: false, optional: true, type: 'FlowElementReferenceOrValue' },
    }
}

const FlowWaitEventSchema = {
    name: 'FlowWaitEvent',
    extends: 'FlowElement',
    fields: {
        conditionLogic: { array: false, nullable: false, optional: true, type: 'string' },
        conditions: { array: true, nullable: false, optional: true, type: 'FlowCondition' },
        connector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        eventType: { array: false, nullable: false, optional: true, type: 'string' },
        inputParameters: { array: true, nullable: false, optional: true, type: 'FlowWaitEventInputParameter' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        maxBatchSize: { array: false, nullable: false, optional: true, type: 'number' },
        offset: { array: false, nullable: false, optional: true, type: 'number' },
        offsetUnit: { array: false, nullable: false, optional: true, type: 'string' },
        outputParameters: { array: true, nullable: false, optional: true, type: 'FlowWaitEventOutputParameter' },
        resumeDate: { array: false, nullable: false, optional: true, type: 'string' },
        resumeDateReference: { array: false, nullable: false, optional: true, type: 'string' },
        resumeTime: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FlowApexPluginCallSchema = {
    name: 'FlowApexPluginCall',
    extends: 'FlowNode',
    fields: {
        apexClass: { array: false, nullable: false, optional: false, type: 'string' },
        connector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        faultConnector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        inputParameters: { array: true, nullable: false, optional: true, type: 'FlowApexPluginCallInputParameter' },
        outputParameters: { array: true, nullable: false, optional: true, type: 'FlowApexPluginCallOutputParameter' },
    }
}

const FlowAssignmentSchema = {
    name: 'FlowAssignment',
    extends: 'FlowNode',
    fields: {
        assignmentItems: { array: true, nullable: false, optional: true, type: 'FlowAssignmentItem' },
        connector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
    }
}

const FlowCollectionProcessorSchema = {
    name: 'FlowCollectionProcessor',
    extends: 'FlowNode',
    fields: {
        assignNextValueToReference: { array: false, nullable: false, optional: true, type: 'string' },
        collectionProcessorType: { array: false, nullable: false, optional: false, type: 'string' },
        collectionReference: { array: false, nullable: false, optional: false, type: 'string' },
        conditionLogic: { array: false, nullable: false, optional: true, type: 'string' },
        conditions: { array: true, nullable: false, optional: true, type: 'FlowCondition' },
        connector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        formula: { array: false, nullable: false, optional: true, type: 'string' },
        limit: { array: false, nullable: true, optional: true, type: 'number' },
        mapItems: { array: true, nullable: false, optional: true, type: 'FlowCollectionMapItem' },
        outputSObjectType: { array: false, nullable: false, optional: true, type: 'string' },
        sortOptions: { array: true, nullable: false, optional: true, type: 'FlowCollectionSortOption' },
    }
}

const FlowDecisionSchema = {
    name: 'FlowDecision',
    extends: 'FlowNode',
    fields: {
        defaultConnector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        defaultConnectorLabel: { array: false, nullable: false, optional: true, type: 'string' },
        rules: { array: true, nullable: false, optional: true, type: 'FlowRule' },
    }
}

const FlowLoopSchema = {
    name: 'FlowLoop',
    extends: 'FlowNode',
    fields: {
        assignNextValueToReference: { array: false, nullable: false, optional: true, type: 'string' },
        collectionReference: { array: false, nullable: false, optional: false, type: 'string' },
        iterationOrder: { array: false, nullable: false, optional: true, type: 'string' },
        nextValueConnector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        noMoreValuesConnector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
    }
}

const FlowOrchestratedStageSchema = {
    name: 'FlowOrchestratedStage',
    extends: 'FlowNode',
    fields: {
        connector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        exitActionInputParameters: { array: true, nullable: false, optional: true, type: 'FlowStageStepExitActionInputParameter' },
        exitActionName: { array: false, nullable: false, optional: true, type: 'string' },
        exitActionOutputParameters: { array: true, nullable: false, optional: true, type: 'FlowStageStepExitActionOutputParameter' },
        exitActionType: { array: false, nullable: false, optional: true, type: 'string' },
        exitConditionLogic: { array: false, nullable: false, optional: true, type: 'string' },
        exitConditions: { array: true, nullable: false, optional: true, type: 'FlowCondition' },
        faultConnector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        stageSteps: { array: true, nullable: false, optional: true, type: 'FlowStageStep' },
    }
}

const FlowRecordCreateSchema = {
    name: 'FlowRecordCreate',
    extends: 'FlowNode',
    fields: {
        assignRecordIdToReference: { array: false, nullable: false, optional: true, type: 'string' },
        connector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        faultConnector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        inputAssignments: { array: true, nullable: false, optional: true, type: 'FlowInputFieldAssignment' },
        inputReference: { array: false, nullable: false, optional: true, type: 'string' },
        object: { array: false, nullable: false, optional: true, type: 'string' },
        storeOutputAutomatically: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const FlowRecordDeleteSchema = {
    name: 'FlowRecordDelete',
    extends: 'FlowNode',
    fields: {
        connector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        faultConnector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        filterLogic: { array: false, nullable: false, optional: true, type: 'string' },
        filters: { array: true, nullable: false, optional: true, type: 'FlowRecordFilter' },
        inputReference: { array: false, nullable: false, optional: true, type: 'string' },
        object: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FlowRecordLookupSchema = {
    name: 'FlowRecordLookup',
    extends: 'FlowNode',
    fields: {
        assignNullValuesIfNoRecordsFound: { array: false, nullable: false, optional: true, type: 'boolean' },
        connector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        faultConnector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        filterLogic: { array: false, nullable: false, optional: true, type: 'string' },
        filters: { array: true, nullable: false, optional: true, type: 'FlowRecordFilter' },
        getFirstRecordOnly: { array: false, nullable: false, optional: true, type: 'boolean' },
        object: { array: false, nullable: false, optional: false, type: 'string' },
        outputAssignments: { array: true, nullable: false, optional: true, type: 'FlowOutputFieldAssignment' },
        outputReference: { array: false, nullable: false, optional: true, type: 'string' },
        queriedFields: { array: true, nullable: false, optional: true, type: 'string' },
        sortField: { array: false, nullable: false, optional: true, type: 'string' },
        sortOrder: { array: false, nullable: false, optional: true, type: 'string' },
        storeOutputAutomatically: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const FlowRecordRollbackSchema = {
    name: 'FlowRecordRollback',
    extends: 'FlowNode',
    fields: {
        connector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
    }
}

const FlowRecordUpdateSchema = {
    name: 'FlowRecordUpdate',
    extends: 'FlowNode',
    fields: {
        connector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        faultConnector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        filterLogic: { array: false, nullable: false, optional: true, type: 'string' },
        filters: { array: true, nullable: false, optional: true, type: 'FlowRecordFilter' },
        inputAssignments: { array: true, nullable: false, optional: true, type: 'FlowInputFieldAssignment' },
        inputReference: { array: false, nullable: false, optional: true, type: 'string' },
        object: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FlowScreenSchema = {
    name: 'FlowScreen',
    extends: 'FlowNode',
    fields: {
        allowBack: { array: false, nullable: false, optional: true, type: 'boolean' },
        allowFinish: { array: false, nullable: false, optional: true, type: 'boolean' },
        allowPause: { array: false, nullable: false, optional: true, type: 'boolean' },
        backButtonLabel: { array: false, nullable: false, optional: true, type: 'string' },
        connector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        fields: { array: true, nullable: false, optional: true, type: 'FlowScreenField' },
        helpText: { array: false, nullable: false, optional: true, type: 'string' },
        nextOrFinishButtonLabel: { array: false, nullable: false, optional: true, type: 'string' },
        pauseButtonLabel: { array: false, nullable: false, optional: true, type: 'string' },
        pausedText: { array: false, nullable: false, optional: true, type: 'string' },
        rules: { array: true, nullable: false, optional: true, type: 'FlowScreenRule' },
        showFooter: { array: false, nullable: false, optional: true, type: 'boolean' },
        showHeader: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const FlowStartSchema = {
    name: 'FlowStart',
    extends: 'FlowNode',
    fields: {
        connector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        doesRequireRecordChangedToMeetCriteria: { array: false, nullable: false, optional: true, type: 'boolean' },
        filterFormula: { array: false, nullable: false, optional: true, type: 'string' },
        filterLogic: { array: false, nullable: false, optional: true, type: 'string' },
        filters: { array: true, nullable: false, optional: true, type: 'FlowRecordFilter' },
        object: { array: false, nullable: false, optional: true, type: 'string' },
        objectContainer: { array: false, nullable: false, optional: true, type: 'string' },
        recordTriggerType: { array: false, nullable: false, optional: true, type: 'string' },
        schedule: { array: false, nullable: false, optional: true, type: 'FlowSchedule' },
        scheduledPaths: { array: true, nullable: false, optional: true, type: 'FlowScheduledPath' },
        segment: { array: false, nullable: false, optional: true, type: 'string' },
        triggerType: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FlowScheduleSchema = {
    name: 'FlowSchedule',
    fields: {
        frequency: { array: false, nullable: false, optional: true, type: 'string' },
        startDate: { array: false, nullable: false, optional: true, type: 'string' },
        startTime: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FlowStepSchema = {
    name: 'FlowStep',
    extends: 'FlowNode',
    fields: {
        connectors: { array: true, nullable: false, optional: true, type: 'FlowConnector' },
    }
}

const FlowSubflowSchema = {
    name: 'FlowSubflow',
    extends: 'FlowNode',
    fields: {
        connector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        flowName: { array: false, nullable: false, optional: false, type: 'string' },
        inputAssignments: { array: true, nullable: false, optional: true, type: 'FlowSubflowInputAssignment' },
        outputAssignments: { array: true, nullable: false, optional: true, type: 'FlowSubflowOutputAssignment' },
        storeOutputAutomatically: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const FlowTransformSchema = {
    name: 'FlowTransform',
    extends: 'FlowNode',
    fields: {
        apexClass: { array: false, nullable: false, optional: true, type: 'string' },
        connector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        dataType: { array: false, nullable: false, optional: true, type: 'string' },
        isCollection: { array: false, nullable: false, optional: true, type: 'boolean' },
        objectType: { array: false, nullable: false, optional: true, type: 'string' },
        scale: { array: false, nullable: false, optional: true, type: 'number' },
        transformValues: { array: true, nullable: false, optional: true, type: 'FlowTransformValue' },
    }
}

const FlowWaitSchema = {
    name: 'FlowWait',
    extends: 'FlowNode',
    fields: {
        defaultConnector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        defaultConnectorLabel: { array: false, nullable: false, optional: false, type: 'string' },
        faultConnector: { array: false, nullable: false, optional: true, type: 'FlowConnector' },
        timeZoneId: { array: false, nullable: false, optional: true, type: 'string' },
        waitEvents: { array: true, nullable: false, optional: true, type: 'FlowWaitEvent' },
    }
}

const FlowCategorySchema = {
    name: 'FlowCategory',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        flowCategoryItems: { array: true, nullable: false, optional: true, type: 'FlowCategoryItems' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlowCategoryItemsSchema = {
    name: 'FlowCategoryItems',
    fields: {
        flow: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlowDefinitionSchema = {
    name: 'FlowDefinition',
    extends: 'Metadata',
    fields: {
        activeVersionNumber: { array: false, nullable: false, optional: true, type: 'number' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FlowSettingsSchema = {
    name: 'FlowSettings',
    extends: 'Metadata',
    fields: {
        canDebugFlowAsAnotherUser: { array: false, nullable: false, optional: true, type: 'boolean' },
        doesEnforceApexCpuTimeLimit: { array: false, nullable: false, optional: true, type: 'boolean' },
        doesFormulaEnforceDataAccess: { array: false, nullable: false, optional: true, type: 'boolean' },
        doesFormulaGenerateHtmlOutput: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFlowBREncodedFixEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFlowCustomPropertyEditor: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFlowDeployAsActiveEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFlowFieldFilterEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFlowFormulasFixEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFlowInterviewSharingEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFlowNullPreviousValueFix: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFlowPauseEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFlowReactiveScreens: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFlowUseApexExceptionEmail: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFlowViaRestUsesUserCtxt: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLightningRuntimeEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isAccessToInvokedApexRequired: { array: false, nullable: false, optional: true, type: 'boolean' },
        isApexPluginAccessModifierRespected: { array: false, nullable: false, optional: true, type: 'boolean' },
        isEnhancedFlowListViewVisible: { array: false, nullable: false, optional: true, type: 'boolean' },
        isFlowApexContextRetired: { array: false, nullable: false, optional: true, type: 'boolean' },
        isFlowBlockAccessToSessionIDEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isManageFlowRequiredForAutomationCharts: { array: false, nullable: false, optional: true, type: 'boolean' },
        isSupportRollbackOnErrorForApexInvocableActionsEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isTimeResumedInSameRunContext: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const FlowTestSchema = {
    name: 'FlowTest',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        flowApiName: { array: false, nullable: false, optional: false, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        testPoints: { array: true, nullable: false, optional: true, type: 'FlowTestPoint' },
    }
}

const FlowTestPointSchema = {
    name: 'FlowTestPoint',
    fields: {
        assertions: { array: true, nullable: false, optional: true, type: 'FlowTestAssertion' },
        elementApiName: { array: false, nullable: false, optional: false, type: 'string' },
        parameters: { array: true, nullable: false, optional: true, type: 'FlowTestParameter' },
    }
}

const FlowTestAssertionSchema = {
    name: 'FlowTestAssertion',
    fields: {
        conditions: { array: true, nullable: false, optional: true, type: 'FlowTestCondition' },
        errorMessage: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FlowTestConditionSchema = {
    name: 'FlowTestCondition',
    fields: {
        leftValueReference: { array: false, nullable: false, optional: false, type: 'string' },
        operator: { array: false, nullable: false, optional: false, type: 'string' },
        rightValue: { array: false, nullable: false, optional: true, type: 'FlowTestReferenceOrValue' },
    }
}

const FlowTestReferenceOrValueSchema = {
    name: 'FlowTestReferenceOrValue',
    fields: {
        booleanValue: { array: false, nullable: true, optional: true, type: 'boolean' },
        dateTimeValue: { array: false, nullable: false, optional: true, type: 'string' },
        dateValue: { array: false, nullable: false, optional: true, type: 'string' },
        numberValue: { array: false, nullable: true, optional: true, type: 'number' },
        sobjectValue: { array: false, nullable: true, optional: true, type: 'string' },
        stringValue: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FlowTestParameterSchema = {
    name: 'FlowTestParameter',
    fields: {
        leftValueReference: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: false, type: 'FlowTestReferenceOrValue' },
    }
}

const FolderSchema = {
    name: 'Folder',
    extends: 'Metadata',
    fields: {
        accessType: { array: false, nullable: false, optional: true, type: 'string' },
        folderShares: { array: true, nullable: false, optional: true, type: 'FolderShare' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        publicFolderAccess: { array: false, nullable: false, optional: true, type: 'string' },
        sharedTo: { array: false, nullable: false, optional: true, type: 'SharedTo' },
    }
}

const FolderShareSchema = {
    name: 'FolderShare',
    fields: {
        accessLevel: { array: false, nullable: false, optional: false, type: 'string' },
        sharedTo: { array: false, nullable: false, optional: false, type: 'string' },
        sharedToType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const DashboardFolderSchema = {
    name: 'DashboardFolder',
    extends: 'Folder',
    fields: {
        
    }
}

const DocumentFolderSchema = {
    name: 'DocumentFolder',
    extends: 'Folder',
    fields: {
        
    }
}

const EmailFolderSchema = {
    name: 'EmailFolder',
    extends: 'Folder',
    fields: {
        
    }
}

const EmailTemplateFolderSchema = {
    name: 'EmailTemplateFolder',
    extends: 'Folder',
    fields: {
        
    }
}

const ReportFolderSchema = {
    name: 'ReportFolder',
    extends: 'Folder',
    fields: {
        
    }
}

const ForecastingFilterSchema = {
    name: 'ForecastingFilter',
    extends: 'Metadata',
    fields: {
        filterLogic: { array: false, nullable: false, optional: true, type: 'string' },
        forecastingType: { array: false, nullable: false, optional: false, type: 'string' },
        forecastingTypeSource: { array: false, nullable: false, optional: false, type: 'string' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ForecastingFilterConditionSchema = {
    name: 'ForecastingFilterCondition',
    extends: 'Metadata',
    fields: {
        colName: { array: false, nullable: false, optional: true, type: 'string' },
        fieldName: { array: false, nullable: false, optional: false, type: 'string' },
        forecastingFilter: { array: false, nullable: false, optional: false, type: 'string' },
        forecastingSourceDefinition: { array: false, nullable: false, optional: true, type: 'string' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        operation: { array: false, nullable: false, optional: false, type: 'string' },
        sortOrder: { array: false, nullable: false, optional: false, type: 'number' },
        value: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ForecastingObjectListSettingsSchema = {
    name: 'ForecastingObjectListSettings',
    extends: 'Metadata',
    fields: {
        forecastingTypeObjectListSettings: { array: true, nullable: false, optional: true, type: 'ForecastingTypeObjectListSettings' },
    }
}

const ForecastingTypeObjectListSettingsSchema = {
    name: 'ForecastingTypeObjectListSettings',
    fields: {
        forecastingObjectListLabelMappings: { array: true, nullable: false, optional: true, type: 'ForecastingObjectListLabelMapping' },
        forecastingObjectListSelectedSettings: { array: false, nullable: false, optional: false, type: 'ForecastingObjectListSelectedSettings' },
        forecastingObjectListUnselectedSettings: { array: false, nullable: false, optional: false, type: 'ForecastingObjectListUnselectedSettings' },
        forecastingTypeDeveloperName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ForecastingObjectListLabelMappingSchema = {
    name: 'ForecastingObjectListLabelMapping',
    fields: {
        field: { array: false, nullable: false, optional: false, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ForecastingObjectListSelectedSettingsSchema = {
    name: 'ForecastingObjectListSelectedSettings',
    fields: {
        field: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const ForecastingObjectListUnselectedSettingsSchema = {
    name: 'ForecastingObjectListUnselectedSettings',
    fields: {
        field: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const ForecastingSettingsSchema = {
    name: 'ForecastingSettings',
    extends: 'Metadata',
    fields: {
        defaultToPersonalCurrency: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableForecasts: { array: false, nullable: false, optional: true, type: 'boolean' },
        forecastingCategoryMappings: { array: true, nullable: false, optional: true, type: 'ForecastingCategoryMapping' },
        forecastingDisplayedFamilySettings: { array: true, nullable: false, optional: true, type: 'ForecastingDisplayedFamilySettings' },
        forecastingTypeSettings: { array: true, nullable: false, optional: true, type: 'ForecastingTypeSettings' },
        globalAdjustmentsSettings: { array: false, nullable: false, optional: false, type: 'AdjustmentsSettings' },
        globalForecastRangeSettings: { array: false, nullable: false, optional: false, type: 'ForecastRangeSettings' },
        globalQuotasSettings: { array: false, nullable: false, optional: false, type: 'QuotasSettings' },
    }
}

const ForecastingCategoryMappingSchema = {
    name: 'ForecastingCategoryMapping',
    fields: {
        forecastingItemCategoryApiName: { array: false, nullable: false, optional: false, type: 'string' },
        weightedSourceCategories: { array: true, nullable: false, optional: true, type: 'WeightedSourceCategory' },
    }
}

const WeightedSourceCategorySchema = {
    name: 'WeightedSourceCategory',
    fields: {
        sourceCategoryApiName: { array: false, nullable: false, optional: false, type: 'string' },
        weight: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const ForecastingDisplayedFamilySettingsSchema = {
    name: 'ForecastingDisplayedFamilySettings',
    fields: {
        productFamily: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ForecastingTypeSettingsSchema = {
    name: 'ForecastingTypeSettings',
    fields: {
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        displayedCategoryApiNames: { array: true, nullable: false, optional: true, type: 'string' },
        forecastedCategoryApiNames: { array: true, nullable: false, optional: true, type: 'string' },
        forecastingDateType: { array: false, nullable: false, optional: false, type: 'string' },
        hasProductFamily: { array: false, nullable: false, optional: false, type: 'boolean' },
        isAmount: { array: false, nullable: false, optional: false, type: 'boolean' },
        isAvailable: { array: false, nullable: false, optional: false, type: 'boolean' },
        isQuantity: { array: false, nullable: false, optional: false, type: 'boolean' },
        managerAdjustableCategoryApiNames: { array: true, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        opportunityListFieldsLabelMappings: { array: true, nullable: false, optional: true, type: 'OpportunityListFieldsLabelMapping' },
        opportunityListFieldsSelectedSettings: { array: false, nullable: false, optional: false, type: 'OpportunityListFieldsSelectedSettings' },
        opportunityListFieldsUnselectedSettings: { array: false, nullable: false, optional: false, type: 'OpportunityListFieldsUnselectedSettings' },
        opportunitySplitName: { array: false, nullable: false, optional: true, type: 'string' },
        ownerAdjustableCategoryApiNames: { array: true, nullable: false, optional: true, type: 'string' },
        territory2ModelName: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const OpportunityListFieldsLabelMappingSchema = {
    name: 'OpportunityListFieldsLabelMapping',
    fields: {
        field: { array: false, nullable: false, optional: false, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const OpportunityListFieldsSelectedSettingsSchema = {
    name: 'OpportunityListFieldsSelectedSettings',
    fields: {
        field: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const OpportunityListFieldsUnselectedSettingsSchema = {
    name: 'OpportunityListFieldsUnselectedSettings',
    fields: {
        field: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const AdjustmentsSettingsSchema = {
    name: 'AdjustmentsSettings',
    fields: {
        enableAdjustments: { array: false, nullable: false, optional: false, type: 'boolean' },
        enableOwnerAdjustments: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const ForecastRangeSettingsSchema = {
    name: 'ForecastRangeSettings',
    fields: {
        beginning: { array: false, nullable: false, optional: false, type: 'number' },
        displaying: { array: false, nullable: false, optional: false, type: 'number' },
        periodType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const QuotasSettingsSchema = {
    name: 'QuotasSettings',
    fields: {
        showQuotas: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const ForecastingSourceDefinitionSchema = {
    name: 'ForecastingSourceDefinition',
    extends: 'Metadata',
    fields: {
        categoryField: { array: false, nullable: false, optional: true, type: 'string' },
        dateField: { array: false, nullable: false, optional: true, type: 'string' },
        familyField: { array: false, nullable: false, optional: true, type: 'string' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        measureField: { array: false, nullable: false, optional: true, type: 'string' },
        sourceObject: { array: false, nullable: false, optional: false, type: 'string' },
        territory2Field: { array: false, nullable: false, optional: true, type: 'string' },
        userField: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ForecastingTypeSchema = {
    name: 'ForecastingType',
    extends: 'Metadata',
    fields: {
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        amount: { array: false, nullable: false, optional: false, type: 'boolean' },
        dateType: { array: false, nullable: false, optional: false, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        hasProductFamily: { array: false, nullable: false, optional: false, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        opportunitySplitType: { array: false, nullable: false, optional: true, type: 'string' },
        quantity: { array: false, nullable: false, optional: false, type: 'boolean' },
        roleType: { array: false, nullable: false, optional: false, type: 'string' },
        territory2Model: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ForecastingTypeSourceSchema = {
    name: 'ForecastingTypeSource',
    extends: 'Metadata',
    fields: {
        forecastingSourceDefinition: { array: false, nullable: false, optional: false, type: 'string' },
        forecastingType: { array: false, nullable: false, optional: false, type: 'string' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        parentSourceDefinition: { array: false, nullable: false, optional: true, type: 'string' },
        relationField: { array: false, nullable: false, optional: true, type: 'string' },
        sourceGroup: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const FormulaSettingsSchema = {
    name: 'FormulaSettings',
    extends: 'Metadata',
    fields: {
        enableDSTAwareDatevalue: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const GatewayProviderPaymentMethodTypeSchema = {
    name: 'GatewayProviderPaymentMethodType',
    extends: 'Metadata',
    fields: {
        comments: { array: false, nullable: false, optional: true, type: 'string' },
        gtwyProviderPaymentMethodType: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        paymentGatewayProvider: { array: false, nullable: false, optional: true, type: 'string' },
        paymentMethodType: { array: false, nullable: false, optional: true, type: 'string' },
        recordType: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const GlobalValueSetSchema = {
    name: 'GlobalValueSet',
    extends: 'Metadata',
    fields: {
        customValue: { array: true, nullable: false, optional: true, type: 'CustomValue' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        sorted: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const GlobalValueSetTranslationSchema = {
    name: 'GlobalValueSetTranslation',
    extends: 'Metadata',
    fields: {
        valueTranslation: { array: true, nullable: false, optional: true, type: 'ValueTranslation' },
    }
}

const ValueTranslationSchema = {
    name: 'ValueTranslation',
    fields: {
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        translation: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const GoogleAppsSettingsSchema = {
    name: 'GoogleAppsSettings',
    extends: 'Metadata',
    fields: {
        enableGmailButtons: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableGmailButtonsAndLinks: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableGmailLinks: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableGoogleDocs: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableGoogleDocsTab: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableGoogleTalk: { array: false, nullable: false, optional: true, type: 'boolean' },
        googleAppsDomain: { array: false, nullable: false, optional: true, type: 'string' },
        googleAppsDomainLinked: { array: false, nullable: false, optional: true, type: 'boolean' },
        googleAppsDomainValidated: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const GroupSchema = {
    name: 'Group',
    extends: 'Metadata',
    fields: {
        doesIncludeBosses: { array: false, nullable: false, optional: true, type: 'boolean' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const HighVelocitySalesSettingsSchema = {
    name: 'HighVelocitySalesSettings',
    extends: 'Metadata',
    fields: {
        enableACAutoSendEmail: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableACChangeTargetAssignee: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableACSkipWeekends: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCadenceVariantTestingPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableChgTgtAssigneeUsrPermPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDispositionCategory: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEngagementWaveAnalyticsPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHighVelocitySales: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHighVelocitySalesSetup: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableInvoiceAttributionPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLogACallForCTIPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLogTasksForLinkedInPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMultipleCadencesPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOpportunityAttributionPermPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableQuickCadenceAutoSendEmail: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTaskLoggingPref: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const HomePageComponentSchema = {
    name: 'HomePageComponent',
    extends: 'Metadata',
    fields: {
        body: { array: false, nullable: false, optional: true, type: 'string' },
        height: { array: false, nullable: false, optional: true, type: 'number' },
        links: { array: true, nullable: false, optional: true, type: 'string' },
        page: { array: false, nullable: false, optional: true, type: 'string' },
        pageComponentType: { array: false, nullable: false, optional: false, type: 'string' },
        showLabel: { array: false, nullable: false, optional: true, type: 'boolean' },
        showScrollbars: { array: false, nullable: false, optional: true, type: 'boolean' },
        width: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const HomePageLayoutSchema = {
    name: 'HomePageLayout',
    extends: 'Metadata',
    fields: {
        narrowComponents: { array: true, nullable: false, optional: true, type: 'string' },
        wideComponents: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const IPAddressRangeSchema = {
    name: 'IPAddressRange',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        endIpAddress: { array: false, nullable: false, optional: false, type: 'string' },
        ipAddressFeature: { array: false, nullable: false, optional: false, type: 'string' },
        ipAddressUsageScope: { array: false, nullable: false, optional: false, type: 'string' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        startIpAddress: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const IdeasSettingsSchema = {
    name: 'IdeasSettings',
    extends: 'Metadata',
    fields: {
        enableChatterProfile: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHtmlIdea: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIdeaMultipleCategory: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIdeaThemes: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIdeas: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIdeasControllerExtensions: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIdeasReputation: { array: false, nullable: false, optional: true, type: 'boolean' },
        halfLife: { array: false, nullable: false, optional: true, type: 'number' },
        ideasProfilePage: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const IdentityProviderSettingsSchema = {
    name: 'IdentityProviderSettings',
    extends: 'Metadata',
    fields: {
        certificateName: { array: false, nullable: false, optional: false, type: 'string' },
        enableIdentityProvider: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const IdentityVerificationProcDefSchema = {
    name: 'IdentityVerificationProcDef',
    extends: 'Metadata',
    fields: {
        identityVerificationProcDtls: { array: true, nullable: false, optional: true, type: 'IdentityVerificationProcDtl' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        searchLayoutType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const IdentityVerificationProcDtlSchema = {
    name: 'IdentityVerificationProcDtl',
    extends: 'Metadata',
    fields: {
        apexClass: { array: false, nullable: false, optional: true, type: 'string' },
        dataSourceType: { array: false, nullable: false, optional: false, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        identityVerificationProcFlds: { array: true, nullable: false, optional: true, type: 'IdentityVerificationProcFld' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        isRetryAllowedAfterLimit: { array: false, nullable: false, optional: true, type: 'boolean' },
        linkedIdVerfProcessDet: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        objectName: { array: false, nullable: false, optional: true, type: 'string' },
        optionalVerifiersMinVerfCount: { array: false, nullable: false, optional: true, type: 'number' },
        retryLimit: { array: false, nullable: false, optional: true, type: 'number' },
        searchFilter: { array: false, nullable: false, optional: true, type: 'string' },
        searchRecordUniqueIdField: { array: false, nullable: false, optional: true, type: 'string' },
        searchResultSortBy: { array: false, nullable: false, optional: true, type: 'string' },
        searchSequenceNumber: { array: false, nullable: false, optional: false, type: 'number' },
        searchType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const IdentityVerificationProcFldSchema = {
    name: 'IdentityVerificationProcFld',
    extends: 'Metadata',
    fields: {
        customFieldLabel: { array: false, nullable: false, optional: true, type: 'string' },
        dataSourceType: { array: false, nullable: false, optional: false, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        fieldDataType: { array: false, nullable: false, optional: true, type: 'string' },
        fieldName: { array: false, nullable: false, optional: false, type: 'string' },
        fieldType: { array: false, nullable: false, optional: false, type: 'string' },
        fieldValueFormula: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        isManualInput: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        sequenceNumber: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const IframeWhiteListUrlSettingsSchema = {
    name: 'IframeWhiteListUrlSettings',
    extends: 'Metadata',
    fields: {
        iframeWhiteListUrls: { array: true, nullable: false, optional: true, type: 'IframeWhiteListUrl' },
    }
}

const IframeWhiteListUrlSchema = {
    name: 'IframeWhiteListUrl',
    fields: {
        context: { array: false, nullable: false, optional: false, type: 'string' },
        url: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const InboundNetworkConnectionSchema = {
    name: 'InboundNetworkConnection',
    extends: 'Metadata',
    fields: {
        connectionType: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: false, type: 'string' },
        inboundNetworkConnProperties: { array: true, nullable: false, optional: true, type: 'InboundNetworkConnProperty' },
        isActive: { array: false, nullable: false, optional: false, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        status: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const InboundNetworkConnPropertySchema = {
    name: 'InboundNetworkConnProperty',
    fields: {
        propertyName: { array: false, nullable: false, optional: false, type: 'string' },
        propertyValue: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const IncidentMgmtSettingsSchema = {
    name: 'IncidentMgmtSettings',
    extends: 'Metadata',
    fields: {
        enableAlertBroadcastType: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEmailBroadcastType: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIncidentMgmt: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSiteBannerBroadcastType: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSlackBroadcastType: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const IndustriesAutomotiveSettingsSchema = {
    name: 'IndustriesAutomotiveSettings',
    extends: 'Metadata',
    fields: {
        enableAutomotiveCloud: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAutomotiveServiceExcellence: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const IndustriesEinsteinFeatureSettingsSchema = {
    name: 'IndustriesEinsteinFeatureSettings',
    extends: 'Metadata',
    fields: {
        documentReaderConfidenceOrgValue: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const IndustriesManufacturingSettingsSchema = {
    name: 'IndustriesManufacturingSettings',
    extends: 'Metadata',
    fields: {
        enableIndManufacturing: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIndustriesMfgAccountForecast: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIndustriesMfgAdvForecast: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIndustriesMfgIAS: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIndustriesMfgProgram: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIndustriesMfgTargets: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePartnerLeadManagement: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePartnerPerformanceManagement: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePartnerVisitManagement: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const IndustriesSettingsSchema = {
    name: 'IndustriesSettings',
    extends: 'Metadata',
    fields: {
        allowMultipleProducersToWorkOnSamePolicy: { array: false, nullable: false, optional: true, type: 'boolean' },
        appointmentDistributionOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        captureResourceUtilizationOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        createCustomerPropertyFromLAProperty: { array: false, nullable: false, optional: true, type: 'boolean' },
        createFSCAssetFromLAAsset: { array: false, nullable: false, optional: true, type: 'boolean' },
        createFSCAssetFromLAProperty: { array: false, nullable: false, optional: true, type: 'boolean' },
        createFSCLiabilityFromLAFinancial: { array: false, nullable: false, optional: true, type: 'boolean' },
        createFSCLiabilityFromLALiability: { array: false, nullable: false, optional: true, type: 'boolean' },
        createFinancialAccountFromLAAsset: { array: false, nullable: false, optional: true, type: 'boolean' },
        createFinancialAccountFromLALiability: { array: false, nullable: false, optional: true, type: 'boolean' },
        createFinancialAccountsFromLAFinancials: { array: false, nullable: false, optional: true, type: 'boolean' },
        createFinancialAccountsFromLAProperty: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAIAccelerator: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAWSTextractAnalyzeIDPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAccessToMasterListOfCoverageTypes: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAccountScoreEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableActionableList: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAnyResourceTypeOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAppFrmAnywhereOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAppInviteOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableBlockResourceAvailabilityOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableBusinessMessenger: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCalculationUsingParentPolicyOnly: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCallReportAdminContextPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCareMgmtSlackAccess: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableChurnPredictionRT: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableClaimMgmt: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableClinicalDataModel: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCompliantDataSharingForAccount: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCompliantDataSharingForCustomObjects: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCompliantDataSharingForFinancialDeal: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCompliantDataSharingForInteraction: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCompliantDataSharingForInteractionSummary: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCompliantDataSharingForOpportunity: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableComprehendMedical: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableContactCenterAccess: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCreateMultiAttendeeEventOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCrisisCenterAccess: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCustomFlowsOnCycleCount: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCustomFlowsOnExpiryPage: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDealManagement: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDisclsReprtFeatureOff: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDiscoveryFrameworkMetadata: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDpeProviderSearchSettingsOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEducationCloud: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEinsteinDocReader: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEinsteinVisits: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEnhancedQuestionCreation: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEventManagementOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEventWriteOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableExistingHealthCloudOrg: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFSCInsuranceReport: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFinancialDealCallReportCmpPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFinancialDealCallReportPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFinancialDealRoleHierarchy: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableGnrcDisclsFrmwrk: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHCReferralScoring: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIESentimentAnalysis: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIndustriesAssessment: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIndustriesAssessmentGuestOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIndustriesKYC: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIndustriesRebates: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIntegratedCareManagementSetting: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableInteractionCstmSharingPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableInteractionRoleHierarchy: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableInteractionSummaryPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableInteractionSummaryRoleHierarchy: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableManyToManyRelationships: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMedRecSetting: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMedicalDeviceEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMedicationManagementEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMortgageRlaTotalsOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMulesoftFhirR4Apis: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMultiResourceOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMultipleCareProgramEnrolleeOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMultipleTopicsForShiftsOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableObjectDetection: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOverbookingOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePatientAppointmentSchedulingOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePatientServicesOrchestration: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePolicyAdministration: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableProviderSearchSyncOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRBLUsingCalcService: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRecordRollup: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableReferralScoring: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSCAssignFootprint: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSCBEIEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSCCarbonAccounting: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSCCarbonCreditAlloc: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSCCreateFootprint: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSCDGF: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSCEmssnsForecasting: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSCExpansionUseCase: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSCExternalEngMgmt: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSCGenrateCnsmpRcd: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSCSNGManagement: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSCScope3HubEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSCSplitCnsmpRcd: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSCTargetSetting: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSCWasteManagement: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSCWaterManagement: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSentimentAnalysis: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableShareSaWithArOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSlackForCib: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSmartTags: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSustainabilityCloud: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSyncInteractionsPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTearSheetPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTextExtract: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTimelinePref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTopicOrTemplate: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTopicTimeSlot: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableUMPayerAppAccessOrgPreference: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableVideoVisitsOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableVisitCalendarSync: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableVisitInventoryEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        loanApplicantAddressAutoCreation: { array: false, nullable: false, optional: true, type: 'boolean' },
        loanApplicantAutoCreation: { array: false, nullable: false, optional: true, type: 'boolean' },
        rlaEditIfAccHasEdit: { array: false, nullable: false, optional: true, type: 'boolean' },
        transformRBLtoDPE: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const InstalledPackageSchema = {
    name: 'InstalledPackage',
    extends: 'Metadata',
    fields: {
        activateRSS: { array: false, nullable: false, optional: false, type: 'boolean' },
        password: { array: false, nullable: false, optional: true, type: 'string' },
        securityType: { array: false, nullable: false, optional: true, type: 'string' },
        versionNumber: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const InventorySettingsSchema = {
    name: 'InventorySettings',
    extends: 'Metadata',
    fields: {
        enableOCIB2CIntegration: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOmniChannelInventory: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const InvocableActionSettingsSchema = {
    name: 'InvocableActionSettings',
    extends: 'Metadata',
    fields: {
        isPartialSaveAllowed: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const IoTSettingsSchema = {
    name: 'IoTSettings',
    extends: 'Metadata',
    fields: {
        enableIoT: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIoTInsightsPilot: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIoTUsageEmail: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const KeywordListSchema = {
    name: 'KeywordList',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        keywords: { array: true, nullable: false, optional: true, type: 'Keyword' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const KeywordSchema = {
    name: 'Keyword',
    fields: {
        keyword: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const KnowledgeSettingsSchema = {
    name: 'KnowledgeSettings',
    extends: 'Metadata',
    fields: {
        answers: { array: false, nullable: false, optional: true, type: 'KnowledgeAnswerSettings' },
        cases: { array: false, nullable: false, optional: true, type: 'KnowledgeCaseSettings' },
        defaultLanguage: { array: false, nullable: false, optional: true, type: 'string' },
        enableChatterQuestionKBDeflection: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCreateEditOnArticlesTab: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableExternalMediaContent: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableKbStandardSharing: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableKnowledge: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableKnowledgeAgentContribution: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableKnowledgeAnswersPromotion: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableKnowledgeArticleTextHighlights: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableKnowledgeCaseRL: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableKnowledgeKeywordAutoComplete: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableKnowledgeTitleAutoComplete: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLightningKbAutoLoadRichTextField: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLightningKnowledge: { array: false, nullable: false, optional: true, type: 'boolean' },
        languages: { array: false, nullable: false, optional: true, type: 'KnowledgeLanguageSettings' },
        showArticleSummariesCustomerPortal: { array: false, nullable: false, optional: true, type: 'boolean' },
        showArticleSummariesInternalApp: { array: false, nullable: false, optional: true, type: 'boolean' },
        showArticleSummariesPartnerPortal: { array: false, nullable: false, optional: true, type: 'boolean' },
        showValidationStatusField: { array: false, nullable: false, optional: true, type: 'boolean' },
        suggestedArticles: { array: false, nullable: false, optional: true, type: 'KnowledgeSuggestedArticlesSettings' },
        votingEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const KnowledgeAnswerSettingsSchema = {
    name: 'KnowledgeAnswerSettings',
    fields: {
        assignTo: { array: false, nullable: false, optional: true, type: 'string' },
        defaultArticleType: { array: false, nullable: false, optional: true, type: 'string' },
        enableArticleCreation: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const KnowledgeCaseSettingsSchema = {
    name: 'KnowledgeCaseSettings',
    fields: {
        articlePDFCreationProfile: { array: false, nullable: false, optional: true, type: 'string' },
        articlePublicSharingCommunities: { array: false, nullable: false, optional: true, type: 'KnowledgeCommunitiesSettings' },
        articlePublicSharingSites: { array: false, nullable: false, optional: true, type: 'KnowledgeSitesSettings' },
        articlePublicSharingSitesChatterAnswers: { array: false, nullable: false, optional: true, type: 'KnowledgeSitesSettings' },
        assignTo: { array: false, nullable: false, optional: true, type: 'string' },
        customizationClass: { array: false, nullable: false, optional: true, type: 'string' },
        defaultContributionArticleType: { array: false, nullable: false, optional: true, type: 'string' },
        editor: { array: false, nullable: false, optional: true, type: 'string' },
        enableArticleCreation: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableArticlePublicSharingSites: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCaseDataCategoryMapping: { array: false, nullable: false, optional: true, type: 'boolean' },
        useProfileForPDFCreation: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const KnowledgeCommunitiesSettingsSchema = {
    name: 'KnowledgeCommunitiesSettings',
    fields: {
        community: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const KnowledgeSitesSettingsSchema = {
    name: 'KnowledgeSitesSettings',
    fields: {
        site: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const KnowledgeLanguageSettingsSchema = {
    name: 'KnowledgeLanguageSettings',
    fields: {
        language: { array: true, nullable: false, optional: true, type: 'KnowledgeLanguage' },
    }
}

const KnowledgeLanguageSchema = {
    name: 'KnowledgeLanguage',
    fields: {
        active: { array: false, nullable: false, optional: true, type: 'boolean' },
        defaultAssignee: { array: false, nullable: false, optional: true, type: 'string' },
        defaultAssigneeType: { array: false, nullable: false, optional: true, type: 'string' },
        defaultReviewer: { array: false, nullable: false, optional: true, type: 'string' },
        defaultReviewerType: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const KnowledgeSuggestedArticlesSettingsSchema = {
    name: 'KnowledgeSuggestedArticlesSettings',
    fields: {
        caseFields: { array: false, nullable: false, optional: true, type: 'KnowledgeCaseFieldsSettings' },
        useSuggestedArticlesForCase: { array: false, nullable: false, optional: true, type: 'boolean' },
        workOrderFields: { array: false, nullable: false, optional: true, type: 'KnowledgeWorkOrderFieldsSettings' },
        workOrderLineItemFields: { array: false, nullable: false, optional: true, type: 'KnowledgeWorkOrderLineItemFieldsSettings' },
    }
}

const KnowledgeCaseFieldsSettingsSchema = {
    name: 'KnowledgeCaseFieldsSettings',
    fields: {
        field: { array: true, nullable: false, optional: true, type: 'KnowledgeCaseField' },
    }
}

const KnowledgeCaseFieldSchema = {
    name: 'KnowledgeCaseField',
    fields: {
        name: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const KnowledgeWorkOrderFieldsSettingsSchema = {
    name: 'KnowledgeWorkOrderFieldsSettings',
    fields: {
        field: { array: true, nullable: false, optional: true, type: 'KnowledgeWorkOrderField' },
    }
}

const KnowledgeWorkOrderFieldSchema = {
    name: 'KnowledgeWorkOrderField',
    fields: {
        name: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const KnowledgeWorkOrderLineItemFieldsSettingsSchema = {
    name: 'KnowledgeWorkOrderLineItemFieldsSettings',
    fields: {
        field: { array: true, nullable: false, optional: true, type: 'KnowledgeWorkOrderLineItemField' },
    }
}

const KnowledgeWorkOrderLineItemFieldSchema = {
    name: 'KnowledgeWorkOrderLineItemField',
    fields: {
        name: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const LanguageSettingsSchema = {
    name: 'LanguageSettings',
    extends: 'Metadata',
    fields: {
        enableCanadaIcuFormat: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDataTranslation: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEndUserLanguages: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableICULocaleDateFormat: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLocalNamesForStdObjects: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLocaleInsensitiveFiltering: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePlatformLanguages: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTranslationWorkbench: { array: false, nullable: false, optional: true, type: 'boolean' },
        useLanguageFallback: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const LayoutSchema = {
    name: 'Layout',
    extends: 'Metadata',
    fields: {
        customButtons: { array: true, nullable: false, optional: true, type: 'string' },
        customConsoleComponents: { array: false, nullable: false, optional: true, type: 'CustomConsoleComponents' },
        emailDefault: { array: false, nullable: false, optional: true, type: 'boolean' },
        excludeButtons: { array: true, nullable: false, optional: true, type: 'string' },
        feedLayout: { array: false, nullable: false, optional: true, type: 'FeedLayout' },
        headers: { array: true, nullable: false, optional: true, type: 'string' },
        layoutSections: { array: true, nullable: false, optional: true, type: 'LayoutSection' },
        miniLayout: { array: false, nullable: false, optional: true, type: 'MiniLayout' },
        multilineLayoutFields: { array: true, nullable: false, optional: true, type: 'string' },
        platformActionList: { array: false, nullable: false, optional: true, type: 'PlatformActionList' },
        quickActionList: { array: false, nullable: false, optional: true, type: 'QuickActionList' },
        relatedContent: { array: false, nullable: false, optional: true, type: 'RelatedContent' },
        relatedLists: { array: true, nullable: false, optional: true, type: 'RelatedListItem' },
        relatedObjects: { array: true, nullable: false, optional: true, type: 'string' },
        runAssignmentRulesDefault: { array: false, nullable: false, optional: true, type: 'boolean' },
        showEmailCheckbox: { array: false, nullable: false, optional: true, type: 'boolean' },
        showHighlightsPanel: { array: false, nullable: false, optional: true, type: 'boolean' },
        showInteractionLogPanel: { array: false, nullable: false, optional: true, type: 'boolean' },
        showKnowledgeComponent: { array: false, nullable: false, optional: true, type: 'boolean' },
        showRunAssignmentRulesCheckbox: { array: false, nullable: false, optional: true, type: 'boolean' },
        showSolutionSection: { array: false, nullable: false, optional: true, type: 'boolean' },
        showSubmitAndAttachButton: { array: false, nullable: false, optional: true, type: 'boolean' },
        summaryLayout: { array: false, nullable: false, optional: true, type: 'SummaryLayout' },
    }
}

const CustomConsoleComponentsSchema = {
    name: 'CustomConsoleComponents',
    fields: {
        primaryTabComponents: { array: false, nullable: false, optional: true, type: 'PrimaryTabComponents' },
        subtabComponents: { array: false, nullable: false, optional: true, type: 'SubtabComponents' },
    }
}

const PrimaryTabComponentsSchema = {
    name: 'PrimaryTabComponents',
    fields: {
        containers: { array: true, nullable: false, optional: true, type: 'Container' },
    }
}

const ContainerSchema = {
    name: 'Container',
    fields: {
        height: { array: false, nullable: false, optional: true, type: 'number' },
        isContainerAutoSizeEnabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        region: { array: false, nullable: false, optional: false, type: 'string' },
        sidebarComponents: { array: true, nullable: false, optional: true, type: 'SidebarComponent' },
        style: { array: false, nullable: false, optional: false, type: 'string' },
        unit: { array: false, nullable: false, optional: false, type: 'string' },
        width: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const SidebarComponentSchema = {
    name: 'SidebarComponent',
    fields: {
        componentType: { array: false, nullable: false, optional: false, type: 'string' },
        createAction: { array: false, nullable: false, optional: true, type: 'string' },
        enableLinking: { array: false, nullable: false, optional: true, type: 'boolean' },
        height: { array: false, nullable: false, optional: true, type: 'number' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        lookup: { array: false, nullable: false, optional: true, type: 'string' },
        page: { array: false, nullable: false, optional: true, type: 'string' },
        relatedLists: { array: true, nullable: false, optional: true, type: 'RelatedList' },
        unit: { array: false, nullable: false, optional: true, type: 'string' },
        updateAction: { array: false, nullable: false, optional: true, type: 'string' },
        width: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const RelatedListSchema = {
    name: 'RelatedList',
    fields: {
        hideOnDetail: { array: false, nullable: false, optional: false, type: 'boolean' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const SubtabComponentsSchema = {
    name: 'SubtabComponents',
    fields: {
        containers: { array: true, nullable: false, optional: true, type: 'Container' },
    }
}

const FeedLayoutSchema = {
    name: 'FeedLayout',
    fields: {
        autocollapsePublisher: { array: false, nullable: false, optional: true, type: 'boolean' },
        compactFeed: { array: false, nullable: false, optional: true, type: 'boolean' },
        feedFilterPosition: { array: false, nullable: false, optional: true, type: 'string' },
        feedFilters: { array: true, nullable: false, optional: true, type: 'FeedLayoutFilter' },
        fullWidthFeed: { array: false, nullable: false, optional: true, type: 'boolean' },
        hideSidebar: { array: false, nullable: false, optional: true, type: 'boolean' },
        highlightExternalFeedItems: { array: false, nullable: false, optional: true, type: 'boolean' },
        leftComponents: { array: true, nullable: false, optional: true, type: 'FeedLayoutComponent' },
        rightComponents: { array: true, nullable: false, optional: true, type: 'FeedLayoutComponent' },
        useInlineFiltersInConsole: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const FeedLayoutFilterSchema = {
    name: 'FeedLayoutFilter',
    fields: {
        feedFilterName: { array: false, nullable: false, optional: true, type: 'string' },
        feedFilterType: { array: false, nullable: false, optional: false, type: 'string' },
        feedItemType: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FeedLayoutComponentSchema = {
    name: 'FeedLayoutComponent',
    fields: {
        componentType: { array: false, nullable: false, optional: false, type: 'string' },
        height: { array: false, nullable: false, optional: true, type: 'number' },
        page: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const LayoutSectionSchema = {
    name: 'LayoutSection',
    fields: {
        customLabel: { array: false, nullable: false, optional: true, type: 'boolean' },
        detailHeading: { array: false, nullable: false, optional: true, type: 'boolean' },
        editHeading: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        layoutColumns: { array: true, nullable: false, optional: true, type: 'LayoutColumn' },
        style: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const LayoutColumnSchema = {
    name: 'LayoutColumn',
    fields: {
        layoutItems: { array: true, nullable: false, optional: true, type: 'LayoutItem' },
        reserved: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const LayoutItemSchema = {
    name: 'LayoutItem',
    fields: {
        analyticsCloudComponent: { array: false, nullable: false, optional: true, type: 'AnalyticsCloudComponentLayoutItem' },
        behavior: { array: false, nullable: false, optional: true, type: 'string' },
        canvas: { array: false, nullable: false, optional: true, type: 'string' },
        component: { array: false, nullable: false, optional: true, type: 'string' },
        customLink: { array: false, nullable: false, optional: true, type: 'string' },
        emptySpace: { array: false, nullable: false, optional: true, type: 'boolean' },
        field: { array: false, nullable: false, optional: true, type: 'string' },
        height: { array: false, nullable: false, optional: true, type: 'number' },
        page: { array: false, nullable: false, optional: true, type: 'string' },
        reportChartComponent: { array: false, nullable: false, optional: true, type: 'ReportChartComponentLayoutItem' },
        scontrol: { array: false, nullable: false, optional: true, type: 'string' },
        showLabel: { array: false, nullable: false, optional: true, type: 'boolean' },
        showScrollbars: { array: false, nullable: false, optional: true, type: 'boolean' },
        width: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const AnalyticsCloudComponentLayoutItemSchema = {
    name: 'AnalyticsCloudComponentLayoutItem',
    fields: {
        assetType: { array: false, nullable: false, optional: false, type: 'string' },
        devName: { array: false, nullable: false, optional: false, type: 'string' },
        error: { array: false, nullable: false, optional: true, type: 'string' },
        filter: { array: false, nullable: false, optional: true, type: 'string' },
        height: { array: false, nullable: false, optional: true, type: 'number' },
        hideOnError: { array: false, nullable: false, optional: true, type: 'boolean' },
        showHeader: { array: false, nullable: false, optional: true, type: 'boolean' },
        showSharing: { array: false, nullable: false, optional: true, type: 'boolean' },
        showTitle: { array: false, nullable: false, optional: true, type: 'boolean' },
        width: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ReportChartComponentLayoutItemSchema = {
    name: 'ReportChartComponentLayoutItem',
    fields: {
        cacheData: { array: false, nullable: false, optional: true, type: 'boolean' },
        contextFilterableField: { array: false, nullable: false, optional: true, type: 'string' },
        error: { array: false, nullable: false, optional: true, type: 'string' },
        hideOnError: { array: false, nullable: false, optional: true, type: 'boolean' },
        includeContext: { array: false, nullable: false, optional: true, type: 'boolean' },
        reportName: { array: false, nullable: false, optional: false, type: 'string' },
        showTitle: { array: false, nullable: false, optional: true, type: 'boolean' },
        size: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const MiniLayoutSchema = {
    name: 'MiniLayout',
    fields: {
        fields: { array: true, nullable: false, optional: true, type: 'string' },
        relatedLists: { array: true, nullable: false, optional: true, type: 'RelatedListItem' },
    }
}

const RelatedListItemSchema = {
    name: 'RelatedListItem',
    fields: {
        customButtons: { array: true, nullable: false, optional: true, type: 'string' },
        excludeButtons: { array: true, nullable: false, optional: true, type: 'string' },
        fields: { array: true, nullable: false, optional: true, type: 'string' },
        relatedList: { array: false, nullable: false, optional: false, type: 'string' },
        sortField: { array: false, nullable: false, optional: true, type: 'string' },
        sortOrder: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const RelatedContentSchema = {
    name: 'RelatedContent',
    fields: {
        relatedContentItems: { array: true, nullable: false, optional: true, type: 'RelatedContentItem' },
    }
}

const RelatedContentItemSchema = {
    name: 'RelatedContentItem',
    fields: {
        layoutItem: { array: false, nullable: false, optional: false, type: 'LayoutItem' },
    }
}

const SummaryLayoutSchema = {
    name: 'SummaryLayout',
    fields: {
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        sizeX: { array: false, nullable: false, optional: false, type: 'number' },
        sizeY: { array: false, nullable: false, optional: true, type: 'number' },
        sizeZ: { array: false, nullable: false, optional: true, type: 'number' },
        summaryLayoutItems: { array: true, nullable: false, optional: true, type: 'SummaryLayoutItem' },
        summaryLayoutStyle: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const SummaryLayoutItemSchema = {
    name: 'SummaryLayoutItem',
    fields: {
        customLink: { array: false, nullable: false, optional: true, type: 'string' },
        field: { array: false, nullable: false, optional: true, type: 'string' },
        posX: { array: false, nullable: false, optional: false, type: 'number' },
        posY: { array: false, nullable: false, optional: true, type: 'number' },
        posZ: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const LeadConfigSettingsSchema = {
    name: 'LeadConfigSettings',
    extends: 'Metadata',
    fields: {
        doesEnableLeadConvertDefaultSubjectBlankTaskCreation: { array: false, nullable: false, optional: true, type: 'boolean' },
        doesHideOpportunityInConvertLeadWindow: { array: false, nullable: false, optional: true, type: 'boolean' },
        doesPreserveLeadStatus: { array: false, nullable: false, optional: true, type: 'boolean' },
        doesSelectNoOpportunityOnConvertLead: { array: false, nullable: false, optional: true, type: 'boolean' },
        doesTrackHistory: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableConversionsOnMobile: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOrgWideMergeAndDelete: { array: false, nullable: false, optional: true, type: 'boolean' },
        shouldLeadConvertRequireValidation: { array: false, nullable: false, optional: true, type: 'boolean' },
        shouldSendNotificationEmailWhenLeadOwnerUpdatesViaApexInLEX: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const LeadConvertSettingsSchema = {
    name: 'LeadConvertSettings',
    extends: 'Metadata',
    fields: {
        allowOwnerChange: { array: false, nullable: false, optional: true, type: 'boolean' },
        objectMapping: { array: true, nullable: false, optional: true, type: 'ObjectMapping' },
        opportunityCreationOptions: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const LetterheadSchema = {
    name: 'Letterhead',
    extends: 'Metadata',
    fields: {
        available: { array: false, nullable: false, optional: false, type: 'boolean' },
        backgroundColor: { array: false, nullable: false, optional: false, type: 'string' },
        bodyColor: { array: false, nullable: false, optional: false, type: 'string' },
        bottomLine: { array: false, nullable: false, optional: false, type: 'LetterheadLine' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        footer: { array: false, nullable: false, optional: false, type: 'LetterheadHeaderFooter' },
        header: { array: false, nullable: false, optional: false, type: 'LetterheadHeaderFooter' },
        middleLine: { array: false, nullable: false, optional: false, type: 'LetterheadLine' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        topLine: { array: false, nullable: false, optional: false, type: 'LetterheadLine' },
    }
}

const LetterheadLineSchema = {
    name: 'LetterheadLine',
    fields: {
        color: { array: false, nullable: false, optional: false, type: 'string' },
        height: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const LetterheadHeaderFooterSchema = {
    name: 'LetterheadHeaderFooter',
    fields: {
        backgroundColor: { array: false, nullable: false, optional: false, type: 'string' },
        height: { array: false, nullable: false, optional: false, type: 'number' },
        horizontalAlignment: { array: false, nullable: false, optional: true, type: 'string' },
        logo: { array: false, nullable: false, optional: true, type: 'string' },
        verticalAlignment: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const LicenseDefinitionSchema = {
    name: 'LicenseDefinition',
    extends: 'Metadata',
    fields: {
        aggregationGroup: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        isPublished: { array: false, nullable: false, optional: false, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        licensedCustomPermissions: { array: true, nullable: false, optional: true, type: 'LicensedCustomPermissions' },
        licensingAuthority: { array: false, nullable: false, optional: false, type: 'string' },
        licensingAuthorityProvider: { array: false, nullable: false, optional: false, type: 'string' },
        minPlatformVersion: { array: false, nullable: false, optional: false, type: 'number' },
        origin: { array: false, nullable: false, optional: false, type: 'string' },
        revision: { array: false, nullable: false, optional: false, type: 'number' },
        trialLicenseDuration: { array: false, nullable: false, optional: false, type: 'number' },
        trialLicenseQuantity: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const LicensedCustomPermissionsSchema = {
    name: 'LicensedCustomPermissions',
    fields: {
        customPermission: { array: false, nullable: false, optional: false, type: 'string' },
        licenseDefinition: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const LightningBoltSchema = {
    name: 'LightningBolt',
    extends: 'Metadata',
    fields: {
        category: { array: false, nullable: false, optional: false, type: 'string' },
        lightningBoltFeatures: { array: true, nullable: false, optional: true, type: 'LightningBoltFeatures' },
        lightningBoltImages: { array: true, nullable: false, optional: true, type: 'LightningBoltImages' },
        lightningBoltItems: { array: true, nullable: false, optional: true, type: 'LightningBoltItems' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        publisher: { array: false, nullable: false, optional: false, type: 'string' },
        summary: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const LightningBoltFeaturesSchema = {
    name: 'LightningBoltFeatures',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        order: { array: false, nullable: false, optional: false, type: 'number' },
        title: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const LightningBoltImagesSchema = {
    name: 'LightningBoltImages',
    fields: {
        image: { array: false, nullable: false, optional: false, type: 'string' },
        order: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const LightningBoltItemsSchema = {
    name: 'LightningBoltItems',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const LightningComponentBundleSchema = {
    name: 'LightningComponentBundle',
    extends: 'Metadata',
    fields: {
        apiVersion: { array: false, nullable: false, optional: true, type: 'number' },
        capabilities: { array: false, nullable: false, optional: true, type: 'Capabilities' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        isExplicitImport: { array: false, nullable: false, optional: true, type: 'boolean' },
        isExposed: { array: false, nullable: false, optional: true, type: 'boolean' },
        lwcResources: { array: false, nullable: false, optional: true, type: 'LwcResources' },
        masterLabel: { array: false, nullable: false, optional: true, type: 'string' },
        runtimeNamespace: { array: false, nullable: false, optional: true, type: 'string' },
        targetConfigs: { array: false, nullable: false, optional: true, type: 'string' },
        targets: { array: false, nullable: false, optional: true, type: 'Targets' },
    }
}

const CapabilitiesSchema = {
    name: 'Capabilities',
    fields: {
        capability: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const LwcResourcesSchema = {
    name: 'LwcResources',
    fields: {
        lwcResource: { array: true, nullable: false, optional: true, type: 'LwcResource' },
    }
}

const LwcResourceSchema = {
    name: 'LwcResource',
    fields: {
        filePath: { array: false, nullable: false, optional: false, type: 'string' },
        source: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const TargetsSchema = {
    name: 'Targets',
    fields: {
        target: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const LightningExperienceSettingsSchema = {
    name: 'LightningExperienceSettings',
    extends: 'Metadata',
    fields: {
        activeThemeName: { array: false, nullable: false, optional: true, type: 'string' },
        enableAccessCheckCrucPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableApiUserLtngOutAccessPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAuraCDNPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAuraSecStaticResCRUCPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableErrorExperienceEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFeedbackInMobile: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableGoogleSheetsForSfdcEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHideOpenInQuip: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIE11DeprecationMsgHidden: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIE11LEXCrucPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableInAppLearning: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableInAppTooltips: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLEXExtensionComponentCustomization: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLEXExtensionDarkMode: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLEXExtensionInlineEditModifier: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLEXExtensionLinkGrabber: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLEXExtensionRelatedLists: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLEXExtensionRequiredFields: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLEXExtensionTrailhead: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLEXOnIpadEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLWCDynamicComponents: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLexEndUsersNoSwitching: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableNavPersonalizationOptOut: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableNoBackgroundNavigations: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableQuip: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRemoveThemeBrandBanner: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableS1BannerPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableS1BrowserEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableS1DesktopEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableS1UiLoggingEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSalesforceNext: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSidToken3rdPartyAuraApp: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSkypeChatEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSparkAllUsers: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSparkConversationEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTryLightningOptOut: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableUseS1AlohaDesktop: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableUsersAreLightningOnly: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWebExEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWebexAllUsers: { array: false, nullable: false, optional: true, type: 'boolean' },
        isLEXExtensionComponentCustomizationOff: { array: false, nullable: false, optional: true, type: 'boolean' },
        isLEXExtensionDarkModeOff: { array: false, nullable: false, optional: true, type: 'boolean' },
        isLEXExtensionLinkGrabberOff: { array: false, nullable: false, optional: true, type: 'boolean' },
        isLEXExtensionOff: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const LightningExperienceThemeSchema = {
    name: 'LightningExperienceTheme',
    extends: 'Metadata',
    fields: {
        defaultBrandingSet: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        shouldOverrideLoadingImage: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const LightningMessageChannelSchema = {
    name: 'LightningMessageChannel',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        isExposed: { array: false, nullable: false, optional: true, type: 'boolean' },
        lightningMessageFields: { array: true, nullable: false, optional: true, type: 'LightningMessageField' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const LightningMessageFieldSchema = {
    name: 'LightningMessageField',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        fieldName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const LightningOnboardingConfigSchema = {
    name: 'LightningOnboardingConfig',
    extends: 'Metadata',
    fields: {
        collaborationGroup: { array: false, nullable: true, optional: true, type: 'string' },
        customQuestion: { array: false, nullable: false, optional: true, type: 'string' },
        feedbackFormDaysFrequency: { array: false, nullable: true, optional: true, type: 'number' },
        isCustom: { array: false, nullable: false, optional: false, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        promptDelayTime: { array: false, nullable: true, optional: true, type: 'number' },
        sendFeedbackToSalesforce: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const LiveAgentSettingsSchema = {
    name: 'LiveAgentSettings',
    extends: 'Metadata',
    fields: {
        enableChatFindOrCreateEnable: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLiveAgent: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableQuickTextEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const LiveChatAgentConfigSchema = {
    name: 'LiveChatAgentConfig',
    extends: 'Metadata',
    fields: {
        assignments: { array: false, nullable: false, optional: true, type: 'AgentConfigAssignments' },
        autoGreeting: { array: false, nullable: false, optional: true, type: 'string' },
        capacity: { array: false, nullable: false, optional: true, type: 'number' },
        criticalWaitTime: { array: false, nullable: false, optional: true, type: 'number' },
        customAgentName: { array: false, nullable: false, optional: true, type: 'string' },
        disableTransferConferenceGreeting: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAgentFileTransfer: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAgentSneakPeek: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAssistanceFlag: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAutoAwayOnDecline: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAutoAwayOnPushTimeout: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableChatConferencing: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableChatMonitoring: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableChatTransferToAgent: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableChatTransferToButton: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableChatTransferToSkill: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLogoutSound: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableNotifications: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRequestSound: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSneakPeek: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableVisitorBlocking: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWhisperMessage: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        supervisorDefaultAgentStatusFilter: { array: false, nullable: false, optional: true, type: 'string' },
        supervisorDefaultButtonFilter: { array: false, nullable: false, optional: true, type: 'string' },
        supervisorDefaultSkillFilter: { array: false, nullable: false, optional: true, type: 'string' },
        supervisorSkills: { array: false, nullable: false, optional: true, type: 'SupervisorAgentConfigSkills' },
        transferableButtons: { array: false, nullable: false, optional: true, type: 'AgentConfigButtons' },
        transferableSkills: { array: false, nullable: false, optional: true, type: 'AgentConfigSkills' },
    }
}

const AgentConfigAssignmentsSchema = {
    name: 'AgentConfigAssignments',
    fields: {
        profiles: { array: false, nullable: false, optional: true, type: 'AgentConfigProfileAssignments' },
        users: { array: false, nullable: false, optional: true, type: 'AgentConfigUserAssignments' },
    }
}

const AgentConfigProfileAssignmentsSchema = {
    name: 'AgentConfigProfileAssignments',
    fields: {
        profile: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const AgentConfigUserAssignmentsSchema = {
    name: 'AgentConfigUserAssignments',
    fields: {
        user: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const SupervisorAgentConfigSkillsSchema = {
    name: 'SupervisorAgentConfigSkills',
    fields: {
        skill: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const AgentConfigButtonsSchema = {
    name: 'AgentConfigButtons',
    fields: {
        button: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const AgentConfigSkillsSchema = {
    name: 'AgentConfigSkills',
    fields: {
        skill: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const LiveChatButtonSchema = {
    name: 'LiveChatButton',
    extends: 'Metadata',
    fields: {
        animation: { array: false, nullable: false, optional: true, type: 'string' },
        autoGreeting: { array: false, nullable: false, optional: true, type: 'string' },
        chasitorIdleTimeout: { array: false, nullable: false, optional: true, type: 'number' },
        chasitorIdleTimeoutWarning: { array: false, nullable: false, optional: true, type: 'number' },
        chatPage: { array: false, nullable: false, optional: true, type: 'string' },
        customAgentName: { array: false, nullable: false, optional: true, type: 'string' },
        deployments: { array: false, nullable: false, optional: true, type: 'LiveChatButtonDeployments' },
        enableQueue: { array: false, nullable: false, optional: true, type: 'boolean' },
        inviteEndPosition: { array: false, nullable: false, optional: true, type: 'string' },
        inviteImage: { array: false, nullable: false, optional: true, type: 'string' },
        inviteStartPosition: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        numberOfReroutingAttempts: { array: false, nullable: false, optional: true, type: 'number' },
        offlineImage: { array: false, nullable: false, optional: true, type: 'string' },
        onlineImage: { array: false, nullable: false, optional: true, type: 'string' },
        optionsCustomRoutingIsEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        optionsHasChasitorIdleTimeout: { array: false, nullable: false, optional: false, type: 'boolean' },
        optionsHasInviteAfterAccept: { array: false, nullable: false, optional: true, type: 'boolean' },
        optionsHasInviteAfterReject: { array: false, nullable: false, optional: true, type: 'boolean' },
        optionsHasRerouteDeclinedRequest: { array: false, nullable: false, optional: true, type: 'boolean' },
        optionsIsAutoAccept: { array: false, nullable: false, optional: true, type: 'boolean' },
        optionsIsInviteAutoRemove: { array: false, nullable: false, optional: true, type: 'boolean' },
        overallQueueLength: { array: false, nullable: false, optional: true, type: 'number' },
        perAgentQueueLength: { array: false, nullable: false, optional: true, type: 'number' },
        postChatPage: { array: false, nullable: false, optional: true, type: 'string' },
        postChatUrl: { array: false, nullable: false, optional: true, type: 'string' },
        preChatFormPage: { array: false, nullable: false, optional: true, type: 'string' },
        preChatFormUrl: { array: false, nullable: false, optional: true, type: 'string' },
        pushTimeOut: { array: false, nullable: false, optional: true, type: 'number' },
        routingType: { array: false, nullable: false, optional: false, type: 'string' },
        site: { array: false, nullable: false, optional: true, type: 'string' },
        skills: { array: false, nullable: false, optional: true, type: 'LiveChatButtonSkills' },
        timeToRemoveInvite: { array: false, nullable: false, optional: true, type: 'number' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
        windowLanguage: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const LiveChatButtonDeploymentsSchema = {
    name: 'LiveChatButtonDeployments',
    fields: {
        deployment: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const LiveChatButtonSkillsSchema = {
    name: 'LiveChatButtonSkills',
    fields: {
        skill: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const LiveChatDeploymentSchema = {
    name: 'LiveChatDeployment',
    extends: 'Metadata',
    fields: {
        brandingImage: { array: false, nullable: false, optional: true, type: 'string' },
        connectionTimeoutDuration: { array: false, nullable: false, optional: true, type: 'number' },
        connectionWarningDuration: { array: false, nullable: false, optional: true, type: 'number' },
        displayQueuePosition: { array: false, nullable: false, optional: true, type: 'boolean' },
        domainWhiteList: { array: false, nullable: false, optional: true, type: 'LiveChatDeploymentDomainWhitelist' },
        enablePrechatApi: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTranscriptSave: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        mobileBrandingImage: { array: false, nullable: false, optional: true, type: 'string' },
        site: { array: false, nullable: false, optional: true, type: 'string' },
        windowTitle: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const LiveChatDeploymentDomainWhitelistSchema = {
    name: 'LiveChatDeploymentDomainWhitelist',
    fields: {
        domain: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const LiveChatSensitiveDataRuleSchema = {
    name: 'LiveChatSensitiveDataRule',
    extends: 'Metadata',
    fields: {
        actionType: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        enforceOn: { array: false, nullable: false, optional: false, type: 'number' },
        isEnabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        pattern: { array: false, nullable: false, optional: false, type: 'string' },
        priority: { array: false, nullable: false, optional: false, type: 'number' },
        replacement: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const LiveMessageSettingsSchema = {
    name: 'LiveMessageSettings',
    extends: 'Metadata',
    fields: {
        enableCheckCEUserPerm: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLiveMessage: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const MLDataDefinitionSchema = {
    name: 'MLDataDefinition',
    extends: 'Metadata',
    fields: {
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        entityDeveloperName: { array: false, nullable: false, optional: false, type: 'string' },
        excludedFields: { array: true, nullable: false, optional: true, type: 'string' },
        includedFields: { array: true, nullable: false, optional: true, type: 'string' },
        joinFields: { array: true, nullable: false, optional: true, type: 'MLField' },
        parentDefinitionDevName: { array: false, nullable: false, optional: false, type: 'string' },
        scoringFilter: { array: false, nullable: false, optional: true, type: 'MLFilter' },
        segmentFilter: { array: false, nullable: false, optional: true, type: 'MLFilter' },
        trainingFilter: { array: false, nullable: false, optional: true, type: 'MLFilter' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const MLFieldSchema = {
    name: 'MLField',
    fields: {
        entity: { array: false, nullable: false, optional: true, type: 'string' },
        entityName: { array: false, nullable: false, optional: true, type: 'string' },
        field: { array: false, nullable: false, optional: true, type: 'string' },
        fieldName: { array: false, nullable: false, optional: true, type: 'string' },
        relatedField: { array: false, nullable: false, optional: true, type: 'MLField' },
        relationType: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const MLFilterSchema = {
    name: 'MLFilter',
    fields: {
        filterName: { array: false, nullable: false, optional: false, type: 'string' },
        lhFilter: { array: false, nullable: false, optional: true, type: 'MLFilter' },
        lhPredictionField: { array: false, nullable: false, optional: true, type: 'string' },
        lhType: { array: false, nullable: false, optional: true, type: 'string' },
        lhUnit: { array: false, nullable: false, optional: true, type: 'string' },
        lhValue: { array: false, nullable: false, optional: true, type: 'string' },
        operation: { array: false, nullable: false, optional: false, type: 'string' },
        rhFilter: { array: false, nullable: false, optional: true, type: 'MLFilter' },
        rhPredictionField: { array: false, nullable: false, optional: true, type: 'string' },
        rhType: { array: false, nullable: false, optional: true, type: 'string' },
        rhUnit: { array: false, nullable: false, optional: true, type: 'string' },
        rhValue: { array: false, nullable: false, optional: true, type: 'string' },
        sortOrder: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const MLPredictionDefinitionSchema = {
    name: 'MLPredictionDefinition',
    extends: 'Metadata',
    fields: {
        aiApplicationDeveloperName: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: true, type: 'string' },
        negativeExpression: { array: false, nullable: false, optional: true, type: 'MLFilter' },
        positiveExpression: { array: false, nullable: false, optional: true, type: 'MLFilter' },
        predictionField: { array: false, nullable: false, optional: true, type: 'string' },
        priority: { array: false, nullable: true, optional: true, type: 'number' },
        pushbackField: { array: false, nullable: false, optional: true, type: 'string' },
        status: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const MLRecommendationDefinitionSchema = {
    name: 'MLRecommendationDefinition',
    extends: 'Metadata',
    fields: {
        aiApplicationDeveloperName: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        externalId: { array: false, nullable: false, optional: true, type: 'string' },
        interactionDateTimeField: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        negativeExpression: { array: false, nullable: false, optional: true, type: 'MLFilter' },
        positiveExpression: { array: false, nullable: false, optional: true, type: 'MLFilter' },
        status: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const MacroSettingsSchema = {
    name: 'MacroSettings',
    extends: 'Metadata',
    fields: {
        contextualMacroFiltering: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAdvancedSearch: { array: false, nullable: false, optional: true, type: 'boolean' },
        macrosInFolders: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ManagedContentTypeSchema = {
    name: 'ManagedContentType',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        managedContentNodeTypes: { array: true, nullable: false, optional: true, type: 'ManagedContentNodeType' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ManagedContentNodeTypeSchema = {
    name: 'ManagedContentNodeType',
    fields: {
        helpText: { array: false, nullable: false, optional: true, type: 'string' },
        isLocalizable: { array: false, nullable: false, optional: true, type: 'boolean' },
        isRequired: { array: false, nullable: false, optional: true, type: 'boolean' },
        nodeLabel: { array: false, nullable: false, optional: false, type: 'string' },
        nodeName: { array: false, nullable: false, optional: false, type: 'string' },
        nodeType: { array: false, nullable: false, optional: false, type: 'string' },
        placeholderText: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ManagedTopicSchema = {
    name: 'ManagedTopic',
    extends: 'Metadata',
    fields: {
        managedTopicType: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        parentName: { array: false, nullable: false, optional: false, type: 'string' },
        position: { array: false, nullable: false, optional: false, type: 'number' },
        topicDescription: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ManagedTopicsSchema = {
    name: 'ManagedTopics',
    extends: 'Metadata',
    fields: {
        managedTopic: { array: true, nullable: false, optional: true, type: 'ManagedTopic' },
    }
}

const MarketingAppExtActivitySchema = {
    name: 'MarketingAppExtActivity',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        endpointUrl: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        marketingAppExtension: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const MarketingAppExtensionSchema = {
    name: 'MarketingAppExtension',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        marketingAppExtActions: { array: true, nullable: false, optional: true, type: 'MarketingAppExtAction' },
        marketingAppExtActivities: { array: true, nullable: false, optional: true, type: 'MarketingAppExtActivity' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const MarketingAppExtActionSchema = {
    name: 'MarketingAppExtAction',
    fields: {
        actionName: { array: false, nullable: false, optional: false, type: 'string' },
        actionParams: { array: false, nullable: false, optional: true, type: 'string' },
        actionSchema: { array: false, nullable: false, optional: true, type: 'string' },
        actionSelector: { array: false, nullable: false, optional: false, type: 'string' },
        apiName: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        marketingAppExtension: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const MatchingRuleSchema = {
    name: 'MatchingRule',
    extends: 'Metadata',
    fields: {
        booleanFilter: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        matchingRuleItems: { array: true, nullable: false, optional: true, type: 'MatchingRuleItem' },
        ruleStatus: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const MatchingRuleItemSchema = {
    name: 'MatchingRuleItem',
    fields: {
        blankValueBehavior: { array: false, nullable: false, optional: true, type: 'string' },
        fieldName: { array: false, nullable: false, optional: false, type: 'string' },
        matchingMethod: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const MatchingRulesSchema = {
    name: 'MatchingRules',
    extends: 'Metadata',
    fields: {
        matchingRules: { array: true, nullable: false, optional: true, type: 'MatchingRule' },
    }
}

const MeetingsSettingsSchema = {
    name: 'MeetingsSettings',
    extends: 'Metadata',
    fields: {
        enableSalesforceMeetings: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSalesforceMeetingsSyncCheck: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableZoomVideoConference: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const MessagingChannelSchema = {
    name: 'MessagingChannel',
    extends: 'Metadata',
    fields: {
        automatedResponses: { array: true, nullable: false, optional: true, type: 'MessagingAutoResponse' },
        customParameters: { array: true, nullable: false, optional: true, type: 'MessagingChannelCustomParameter' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        messagingChannelType: { array: false, nullable: false, optional: false, type: 'string' },
        sessionHandlerFlow: { array: false, nullable: false, optional: true, type: 'string' },
        sessionHandlerQueue: { array: false, nullable: false, optional: false, type: 'string' },
        sessionHandlerType: { array: false, nullable: false, optional: false, type: 'string' },
        standardParameters: { array: true, nullable: false, optional: true, type: 'MessagingChannelStandardParameter' },
    }
}

const MessagingAutoResponseSchema = {
    name: 'MessagingAutoResponse',
    fields: {
        response: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const MessagingChannelCustomParameterSchema = {
    name: 'MessagingChannelCustomParameter',
    fields: {
        actionParameterMappings: { array: true, nullable: false, optional: true, type: 'MessagingChannelActionParameterMapping' },
        externalParameterName: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        maxLength: { array: false, nullable: false, optional: true, type: 'number' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        parameterDataType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const MessagingChannelActionParameterMappingSchema = {
    name: 'MessagingChannelActionParameterMapping',
    fields: {
        actionParameterName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const MessagingChannelStandardParameterSchema = {
    name: 'MessagingChannelStandardParameter',
    fields: {
        actionParameterMappings: { array: true, nullable: false, optional: true, type: 'MessagingChannelActionParameterMapping' },
        parameterType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const MfgServiceConsoleSettingsSchema = {
    name: 'MfgServiceConsoleSettings',
    extends: 'Metadata',
    fields: {
        enableMfgServiceConsole: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const MilestoneTypeSchema = {
    name: 'MilestoneType',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        recurrenceType: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const MlDomainSchema = {
    name: 'MlDomain',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        mlIntents: { array: true, nullable: false, optional: true, type: 'MlIntent' },
        mlSlotClasses: { array: true, nullable: false, optional: true, type: 'MlSlotClass' },
    }
}

const MobileApplicationDetailSchema = {
    name: 'MobileApplicationDetail',
    extends: 'Metadata',
    fields: {
        applicationBinaryFile: { array: false, nullable: false, optional: true, type: 'string' },
        applicationBinaryFileName: { array: false, nullable: false, optional: true, type: 'string' },
        applicationBundleIdentifier: { array: false, nullable: false, optional: true, type: 'string' },
        applicationFileLength: { array: false, nullable: false, optional: true, type: 'number' },
        applicationIconFile: { array: false, nullable: false, optional: true, type: 'string' },
        applicationIconFileName: { array: false, nullable: false, optional: true, type: 'string' },
        applicationInstallUrl: { array: false, nullable: false, optional: true, type: 'string' },
        devicePlatform: { array: false, nullable: false, optional: false, type: 'string' },
        deviceType: { array: false, nullable: false, optional: true, type: 'string' },
        minimumOsVersion: { array: false, nullable: false, optional: true, type: 'string' },
        privateApp: { array: false, nullable: false, optional: true, type: 'boolean' },
        version: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const MobileSettingsSchema = {
    name: 'MobileSettings',
    extends: 'Metadata',
    fields: {
        dashboardMobile: { array: false, nullable: false, optional: true, type: 'DashboardMobileSettings' },
        enableImportContactFromDevice: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOfflineDraftsEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePopulateNameManuallyInToday: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableS1EncryptedStoragePref2: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableS1OfflinePref: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const DashboardMobileSettingsSchema = {
    name: 'DashboardMobileSettings',
    fields: {
        enableDashboardIPadApp: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ModerationRuleSchema = {
    name: 'ModerationRule',
    extends: 'Metadata',
    fields: {
        action: { array: false, nullable: false, optional: false, type: 'string' },
        actionLimit: { array: false, nullable: false, optional: true, type: 'number' },
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        entitiesAndFields: { array: true, nullable: false, optional: true, type: 'ModeratedEntityField' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        notifyLimit: { array: false, nullable: false, optional: true, type: 'number' },
        timePeriod: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: true, type: 'string' },
        userCriteria: { array: true, nullable: false, optional: true, type: 'string' },
        userMessage: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ModeratedEntityFieldSchema = {
    name: 'ModeratedEntityField',
    fields: {
        entityName: { array: false, nullable: false, optional: false, type: 'string' },
        fieldName: { array: false, nullable: false, optional: true, type: 'string' },
        keywordList: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const MyDomainDiscoverableLoginSchema = {
    name: 'MyDomainDiscoverableLogin',
    extends: 'Metadata',
    fields: {
        apexHandler: { array: false, nullable: false, optional: false, type: 'string' },
        executeApexHandlerAs: { array: false, nullable: false, optional: true, type: 'string' },
        usernameLabel: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const MyDomainSettingsSchema = {
    name: 'MyDomainSettings',
    extends: 'Metadata',
    fields: {
        canOnlyLoginWithMyDomainUrl: { array: false, nullable: false, optional: true, type: 'boolean' },
        doesApiLoginRequireOrgDomain: { array: false, nullable: false, optional: true, type: 'boolean' },
        domainPartition: { array: false, nullable: false, optional: true, type: 'string' },
        enableNativeBrowserForAuthOnAndroid: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableNativeBrowserForAuthOnIos: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableShareBrowserSessionAndroidForAuth: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableShareBrowserSessionIOSForAuth: { array: false, nullable: false, optional: true, type: 'boolean' },
        logRedirections: { array: false, nullable: false, optional: true, type: 'boolean' },
        myDomainName: { array: false, nullable: false, optional: true, type: 'string' },
        myDomainSuffix: { array: false, nullable: false, optional: true, type: 'string' },
        redirectForceComSiteUrls: { array: false, nullable: false, optional: true, type: 'boolean' },
        redirectPriorMyDomain: { array: false, nullable: false, optional: true, type: 'boolean' },
        use3rdPartyCookieBlockingCompatibleHostnames: { array: false, nullable: false, optional: true, type: 'boolean' },
        useEdge: { array: false, nullable: false, optional: true, type: 'boolean' },
        useEnhancedDomainsInSandbox: { array: false, nullable: false, optional: true, type: 'boolean' },
        useStabilizedMyDomainHostnames: { array: false, nullable: false, optional: true, type: 'boolean' },
        useStabilizedSandboxMyDomainHostnames: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const NameSettingsSchema = {
    name: 'NameSettings',
    extends: 'Metadata',
    fields: {
        enableInformalName: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMiddleName: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableNameSuffix: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const NamedCredentialSchema = {
    name: 'NamedCredential',
    extends: 'Metadata',
    fields: {
        allowMergeFieldsInBody: { array: false, nullable: false, optional: true, type: 'boolean' },
        allowMergeFieldsInHeader: { array: false, nullable: false, optional: true, type: 'boolean' },
        authProvider: { array: false, nullable: false, optional: true, type: 'string' },
        authTokenEndpointUrl: { array: false, nullable: false, optional: true, type: 'string' },
        awsAccessKey: { array: false, nullable: false, optional: true, type: 'string' },
        awsAccessSecret: { array: false, nullable: false, optional: true, type: 'string' },
        awsRegion: { array: false, nullable: false, optional: true, type: 'string' },
        awsService: { array: false, nullable: false, optional: true, type: 'string' },
        certificate: { array: false, nullable: false, optional: true, type: 'string' },
        endpoint: { array: false, nullable: false, optional: true, type: 'string' },
        generateAuthorizationHeader: { array: false, nullable: false, optional: true, type: 'boolean' },
        jwtAudience: { array: false, nullable: false, optional: true, type: 'string' },
        jwtFormulaSubject: { array: false, nullable: false, optional: true, type: 'string' },
        jwtIssuer: { array: false, nullable: false, optional: true, type: 'string' },
        jwtSigningCertificate: { array: false, nullable: false, optional: true, type: 'string' },
        jwtTextSubject: { array: false, nullable: false, optional: true, type: 'string' },
        jwtValidityPeriodSeconds: { array: false, nullable: false, optional: true, type: 'number' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        namedCredentialParameters: { array: true, nullable: false, optional: true, type: 'NamedCredentialParameter' },
        namedCredentialType: { array: false, nullable: false, optional: true, type: 'string' },
        oauthRefreshToken: { array: false, nullable: false, optional: true, type: 'string' },
        oauthScope: { array: false, nullable: false, optional: true, type: 'string' },
        oauthToken: { array: false, nullable: false, optional: true, type: 'string' },
        outboundNetworkConnection: { array: false, nullable: false, optional: true, type: 'string' },
        password: { array: false, nullable: false, optional: true, type: 'string' },
        principalType: { array: false, nullable: false, optional: true, type: 'string' },
        protocol: { array: false, nullable: false, optional: true, type: 'string' },
        username: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const NamedCredentialParameterSchema = {
    name: 'NamedCredentialParameter',
    fields: {
        certificate: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        externalCredential: { array: false, nullable: false, optional: true, type: 'string' },
        outboundNetworkConnection: { array: false, nullable: false, optional: true, type: 'string' },
        parameterName: { array: false, nullable: false, optional: false, type: 'string' },
        parameterType: { array: false, nullable: false, optional: false, type: 'string' },
        parameterValue: { array: false, nullable: false, optional: true, type: 'string' },
        sequenceNumber: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const NavigationMenuSchema = {
    name: 'NavigationMenu',
    extends: 'Metadata',
    fields: {
        container: { array: false, nullable: false, optional: false, type: 'string' },
        containerType: { array: false, nullable: false, optional: false, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        navigationMenuItem: { array: true, nullable: false, optional: true, type: 'NavigationMenuItem' },
    }
}

const NetworkSchema = {
    name: 'Network',
    extends: 'Metadata',
    fields: {
        allowInternalUserLogin: { array: false, nullable: false, optional: true, type: 'boolean' },
        allowMembersToFlag: { array: false, nullable: false, optional: true, type: 'boolean' },
        allowedExtensions: { array: false, nullable: false, optional: true, type: 'string' },
        caseCommentEmailTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        changePasswordTemplate: { array: false, nullable: false, optional: false, type: 'string' },
        chgEmailVerNewTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        chgEmailVerOldTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        communityRoles: { array: false, nullable: false, optional: true, type: 'CommunityRoles' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        deviceActEmailTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        disableReputationRecordConversations: { array: false, nullable: false, optional: true, type: 'boolean' },
        emailFooterLogo: { array: false, nullable: false, optional: true, type: 'string' },
        emailFooterText: { array: false, nullable: false, optional: true, type: 'string' },
        emailSenderAddress: { array: false, nullable: false, optional: false, type: 'string' },
        emailSenderName: { array: false, nullable: false, optional: false, type: 'string' },
        enableApexCDNCaching: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCustomVFErrorPageOverrides: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDirectMessages: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableExperienceBundleBasedSnaOverrideEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableGuestChatter: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableGuestFileAccess: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableGuestMemberVisibility: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableImageOptimizationCDN: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableInvitation: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableKnowledgeable: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMemberVisibility: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableNicknameDisplay: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePrivateMessages: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableReputation: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableShowAllNetworkSettings: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSiteAsContainer: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTalkingAboutStats: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTopicAssignmentRules: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTopicSuggestions: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableUpDownVote: { array: false, nullable: false, optional: true, type: 'boolean' },
        feedChannel: { array: false, nullable: false, optional: true, type: 'string' },
        forgotPasswordTemplate: { array: false, nullable: false, optional: false, type: 'string' },
        gatherCustomerSentimentData: { array: false, nullable: false, optional: true, type: 'boolean' },
        headlessForgotPasswordTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        lockoutTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        logoutUrl: { array: false, nullable: false, optional: true, type: 'string' },
        maxFileSizeKb: { array: false, nullable: false, optional: true, type: 'number' },
        navigationLinkSet: { array: false, nullable: false, optional: true, type: 'NavigationLinkSet' },
        networkMemberGroups: { array: false, nullable: false, optional: true, type: 'NetworkMemberGroup' },
        networkPageOverrides: { array: false, nullable: false, optional: true, type: 'NetworkPageOverride' },
        newSenderAddress: { array: false, nullable: false, optional: true, type: 'string' },
        picassoSite: { array: false, nullable: false, optional: true, type: 'string' },
        recommendationAudience: { array: false, nullable: false, optional: true, type: 'RecommendationAudience' },
        recommendationDefinition: { array: false, nullable: false, optional: true, type: 'RecommendationDefinition' },
        reputationLevels: { array: false, nullable: false, optional: true, type: 'ReputationLevelDefinitions' },
        reputationPointsRules: { array: false, nullable: false, optional: true, type: 'ReputationPointsRules' },
        selfRegMicroBatchSubErrorEmailTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        selfRegProfile: { array: false, nullable: false, optional: true, type: 'string' },
        selfRegistration: { array: false, nullable: false, optional: true, type: 'boolean' },
        sendWelcomeEmail: { array: false, nullable: false, optional: true, type: 'boolean' },
        site: { array: false, nullable: false, optional: false, type: 'string' },
        siteArchiveStatus: { array: false, nullable: false, optional: true, type: 'string' },
        status: { array: false, nullable: false, optional: false, type: 'string' },
        tabs: { array: false, nullable: false, optional: false, type: 'NetworkTabSet' },
        urlPathPrefix: { array: false, nullable: false, optional: true, type: 'string' },
        verificationTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        welcomeTemplate: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CommunityRolesSchema = {
    name: 'CommunityRoles',
    fields: {
        customerUserRole: { array: false, nullable: false, optional: true, type: 'string' },
        employeeUserRole: { array: false, nullable: false, optional: true, type: 'string' },
        partnerUserRole: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const NetworkMemberGroupSchema = {
    name: 'NetworkMemberGroup',
    fields: {
        permissionSet: { array: true, nullable: false, optional: true, type: 'string' },
        profile: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const NetworkPageOverrideSchema = {
    name: 'NetworkPageOverride',
    fields: {
        changePasswordPageOverrideSetting: { array: false, nullable: false, optional: true, type: 'string' },
        forgotPasswordPageOverrideSetting: { array: false, nullable: false, optional: true, type: 'string' },
        homePageOverrideSetting: { array: false, nullable: false, optional: true, type: 'string' },
        loginPageOverrideSetting: { array: false, nullable: false, optional: true, type: 'string' },
        selfRegProfilePageOverrideSetting: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const RecommendationAudienceSchema = {
    name: 'RecommendationAudience',
    fields: {
        recommendationAudienceDetails: { array: true, nullable: false, optional: true, type: 'RecommendationAudienceDetail' },
    }
}

const RecommendationAudienceDetailSchema = {
    name: 'RecommendationAudienceDetail',
    fields: {
        audienceCriteriaType: { array: false, nullable: false, optional: true, type: 'string' },
        audienceCriteriaValue: { array: false, nullable: false, optional: true, type: 'string' },
        setupName: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const RecommendationDefinitionSchema = {
    name: 'RecommendationDefinition',
    fields: {
        recommendationDefinitionDetails: { array: true, nullable: false, optional: true, type: 'RecommendationDefinitionDetail' },
    }
}

const RecommendationDefinitionDetailSchema = {
    name: 'RecommendationDefinitionDetail',
    fields: {
        actionUrl: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        linkText: { array: false, nullable: false, optional: true, type: 'string' },
        scheduledRecommendations: { array: false, nullable: false, optional: true, type: 'ScheduledRecommendation' },
        setupName: { array: false, nullable: false, optional: true, type: 'string' },
        title: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ScheduledRecommendationSchema = {
    name: 'ScheduledRecommendation',
    fields: {
        scheduledRecommendationDetails: { array: true, nullable: false, optional: true, type: 'ScheduledRecommendationDetail' },
    }
}

const ScheduledRecommendationDetailSchema = {
    name: 'ScheduledRecommendationDetail',
    fields: {
        channel: { array: false, nullable: false, optional: true, type: 'string' },
        enabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        rank: { array: false, nullable: false, optional: true, type: 'number' },
        recommendationAudience: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ReputationLevelDefinitionsSchema = {
    name: 'ReputationLevelDefinitions',
    fields: {
        level: { array: true, nullable: false, optional: true, type: 'ReputationLevel' },
    }
}

const ReputationLevelSchema = {
    name: 'ReputationLevel',
    fields: {
        branding: { array: false, nullable: false, optional: true, type: 'ReputationBranding' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        lowerThreshold: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const ReputationBrandingSchema = {
    name: 'ReputationBranding',
    fields: {
        smallImage: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ReputationPointsRulesSchema = {
    name: 'ReputationPointsRules',
    fields: {
        pointsRule: { array: true, nullable: false, optional: true, type: 'ReputationPointsRule' },
    }
}

const ReputationPointsRuleSchema = {
    name: 'ReputationPointsRule',
    fields: {
        eventType: { array: false, nullable: false, optional: false, type: 'string' },
        points: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const NetworkTabSetSchema = {
    name: 'NetworkTabSet',
    fields: {
        customTab: { array: true, nullable: false, optional: true, type: 'string' },
        defaultTab: { array: false, nullable: false, optional: false, type: 'string' },
        standardTab: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const NotificationTypeConfigSchema = {
    name: 'NotificationTypeConfig',
    extends: 'Metadata',
    fields: {
        notificationTypeSettings: { array: true, nullable: false, optional: true, type: 'NotificationTypeSettings' },
    }
}

const NotificationTypeSettingsSchema = {
    name: 'NotificationTypeSettings',
    fields: {
        appSettings: { array: true, nullable: false, optional: true, type: 'AppSettings' },
        notificationChannels: { array: false, nullable: false, optional: true, type: 'NotificationChannels' },
        notificationType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const AppSettingsSchema = {
    name: 'AppSettings',
    fields: {
        connectedAppName: { array: false, nullable: false, optional: false, type: 'string' },
        enabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const NotificationChannelsSchema = {
    name: 'NotificationChannels',
    fields: {
        desktopEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        mobileEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        slackEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const NotificationsSettingsSchema = {
    name: 'NotificationsSettings',
    extends: 'Metadata',
    fields: {
        enableActvityReminderBrowserNotifs: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMobileAppPushNotifications: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableNotifications: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const OauthCustomScopeSchema = {
    name: 'OauthCustomScope',
    extends: 'Metadata',
    fields: {
        assignedTo: { array: true, nullable: false, optional: true, type: 'OauthCustomScopeApp' },
        description: { array: false, nullable: false, optional: false, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        isPublic: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const OauthCustomScopeAppSchema = {
    name: 'OauthCustomScopeApp',
    fields: {
        connectedApp: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const OauthOidcSettingsSchema = {
    name: 'OauthOidcSettings',
    extends: 'Metadata',
    fields: {
        blockOAuthUnPwFlow: { array: false, nullable: false, optional: true, type: 'boolean' },
        blockOAuthUsrAgtFlow: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHdlessFgtPswFlow: { array: false, nullable: false, optional: true, type: 'boolean' },
        oAuthCdCrdtFlowEnable: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ObjectLinkingSettingsSchema = {
    name: 'ObjectLinkingSettings',
    extends: 'Metadata',
    fields: {
        enableObjectLinking: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const OmniChannelSettingsSchema = {
    name: 'OmniChannelSettings',
    extends: 'Metadata',
    fields: {
        enableOmniAutoLoginPrompt: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOmniChannel: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOmniSecondaryRoutingPriority: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOmniSkillsRouting: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const OmniDataTransformSchema = {
    name: 'OmniDataTransform',
    extends: 'Metadata',
    fields: {
        active: { array: false, nullable: false, optional: true, type: 'boolean' },
        assignmentRulesUsed: { array: false, nullable: false, optional: true, type: 'boolean' },
        deletedOnSuccess: { array: false, nullable: false, optional: true, type: 'boolean' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        errorIgnored: { array: false, nullable: false, optional: true, type: 'boolean' },
        expectedInputJson: { array: false, nullable: false, optional: true, type: 'string' },
        expectedInputOtherData: { array: false, nullable: false, optional: true, type: 'string' },
        expectedInputXml: { array: false, nullable: false, optional: true, type: 'string' },
        expectedOutputJson: { array: false, nullable: false, optional: true, type: 'string' },
        expectedOutputOtherData: { array: false, nullable: false, optional: true, type: 'string' },
        expectedOutputXml: { array: false, nullable: false, optional: true, type: 'string' },
        fieldLevelSecurityEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        inputParsingClass: { array: false, nullable: false, optional: true, type: 'string' },
        inputType: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        namespace: { array: false, nullable: false, optional: true, type: 'string' },
        nullInputsIncludedInOutput: { array: false, nullable: false, optional: true, type: 'boolean' },
        omniDataTransformItem: { array: true, nullable: false, optional: true, type: 'OmniDataTransformItem' },
        outputParsingClass: { array: false, nullable: false, optional: true, type: 'string' },
        outputType: { array: false, nullable: false, optional: true, type: 'string' },
        overrideKey: { array: false, nullable: false, optional: true, type: 'string' },
        preprocessorClassName: { array: false, nullable: false, optional: true, type: 'string' },
        previewJsonData: { array: false, nullable: false, optional: true, type: 'string' },
        previewOtherData: { array: false, nullable: false, optional: true, type: 'string' },
        previewSourceObjectData: { array: false, nullable: false, optional: true, type: 'string' },
        previewXmlData: { array: false, nullable: false, optional: true, type: 'string' },
        processSuperBulk: { array: false, nullable: false, optional: true, type: 'boolean' },
        requiredPermission: { array: false, nullable: false, optional: true, type: 'string' },
        responseCacheTtlMinutes: { array: false, nullable: false, optional: true, type: 'number' },
        responseCacheType: { array: false, nullable: false, optional: true, type: 'string' },
        rollbackOnError: { array: false, nullable: false, optional: true, type: 'boolean' },
        sourceObject: { array: false, nullable: false, optional: true, type: 'string' },
        sourceObjectDefault: { array: false, nullable: false, optional: true, type: 'boolean' },
        synchronousProcessThreshold: { array: false, nullable: false, optional: true, type: 'number' },
        targetOutputDocumentIdentifier: { array: false, nullable: false, optional: true, type: 'string' },
        targetOutputFileName: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
        uniqueName: { array: false, nullable: false, optional: true, type: 'string' },
        versionNumber: { array: false, nullable: false, optional: true, type: 'number' },
        xmlDeclarationRemoved: { array: false, nullable: false, optional: true, type: 'boolean' },
        xmlOutputTagsOrder: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const OmniDataTransformItemSchema = {
    name: 'OmniDataTransformItem',
    fields: {
        defaultValue: { array: false, nullable: false, optional: true, type: 'string' },
        disabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        filterDataType: { array: false, nullable: false, optional: true, type: 'string' },
        filterGroup: { array: false, nullable: false, optional: true, type: 'number' },
        filterOperator: { array: false, nullable: false, optional: true, type: 'string' },
        filterValue: { array: false, nullable: false, optional: true, type: 'string' },
        formulaConverted: { array: false, nullable: false, optional: true, type: 'string' },
        formulaExpression: { array: false, nullable: false, optional: true, type: 'string' },
        formulaResultPath: { array: false, nullable: false, optional: true, type: 'string' },
        formulaSequence: { array: false, nullable: false, optional: true, type: 'number' },
        globalKey: { array: false, nullable: false, optional: true, type: 'string' },
        inputFieldName: { array: false, nullable: false, optional: true, type: 'string' },
        inputObjectName: { array: false, nullable: false, optional: true, type: 'string' },
        inputObjectQuerySequence: { array: false, nullable: false, optional: true, type: 'number' },
        linkedFieldName: { array: false, nullable: false, optional: true, type: 'string' },
        linkedObjectSequence: { array: false, nullable: false, optional: true, type: 'number' },
        lookupByFieldName: { array: false, nullable: false, optional: true, type: 'string' },
        lookupObjectName: { array: false, nullable: false, optional: true, type: 'string' },
        lookupReturnedFieldName: { array: false, nullable: false, optional: true, type: 'string' },
        migrationAttribute: { array: false, nullable: false, optional: true, type: 'string' },
        migrationCategory: { array: false, nullable: false, optional: true, type: 'string' },
        migrationGroup: { array: false, nullable: false, optional: true, type: 'string' },
        migrationKey: { array: false, nullable: false, optional: true, type: 'string' },
        migrationPattern: { array: false, nullable: false, optional: true, type: 'string' },
        migrationProcess: { array: false, nullable: false, optional: true, type: 'string' },
        migrationType: { array: false, nullable: false, optional: true, type: 'string' },
        migrationValue: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        omniDataTransformation: { array: false, nullable: false, optional: true, type: 'string' },
        omniDataTransformationId: { array: false, nullable: false, optional: true, type: 'string' },
        outputCreationSequence: { array: false, nullable: false, optional: true, type: 'number' },
        outputFieldFormat: { array: false, nullable: false, optional: true, type: 'string' },
        outputFieldName: { array: false, nullable: false, optional: true, type: 'string' },
        outputObjectName: { array: false, nullable: false, optional: true, type: 'string' },
        requiredForUpsert: { array: false, nullable: false, optional: true, type: 'boolean' },
        transformValuesMappings: { array: false, nullable: false, optional: true, type: 'string' },
        upsertKey: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const OmniIntegrationProcedureSchema = {
    name: 'OmniIntegrationProcedure',
    extends: 'Metadata',
    fields: {
        customHtmlTemplates: { array: false, nullable: false, optional: true, type: 'string' },
        customJavaScript: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        designerCustomizationType: { array: false, nullable: false, optional: true, type: 'string' },
        elementTypeComponentMapping: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        isIntegrationProcedure: { array: false, nullable: false, optional: true, type: 'boolean' },
        isMetadataCacheDisabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isOmniScriptEmbeddable: { array: false, nullable: false, optional: true, type: 'boolean' },
        isTestProcedure: { array: false, nullable: false, optional: true, type: 'boolean' },
        isWebCompEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        language: { array: false, nullable: false, optional: false, type: 'string' },
        lastPreviewPage: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        nameSpace: { array: false, nullable: false, optional: true, type: 'string' },
        omniProcessElements: { array: true, nullable: false, optional: true, type: 'OmniProcessElement' },
        omniProcessKey: { array: false, nullable: false, optional: true, type: 'string' },
        omniProcessType: { array: false, nullable: false, optional: false, type: 'string' },
        overrideKey: { array: false, nullable: false, optional: true, type: 'string' },
        propertySetConfig: { array: false, nullable: false, optional: true, type: 'string' },
        requiredPermission: { array: false, nullable: false, optional: true, type: 'string' },
        responseCacheType: { array: false, nullable: false, optional: true, type: 'string' },
        subType: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
        uniqueName: { array: false, nullable: false, optional: false, type: 'string' },
        versionNumber: { array: false, nullable: false, optional: false, type: 'number' },
        webComponentKey: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const OmniProcessElementSchema = {
    name: 'OmniProcessElement',
    fields: {
        childElements: { array: true, nullable: false, optional: true, type: 'OmniProcessElement' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        designerCustomizationType: { array: false, nullable: false, optional: true, type: 'string' },
        embeddedOmniScriptKey: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        isOmniScriptEmbeddable: { array: false, nullable: false, optional: true, type: 'boolean' },
        level: { array: false, nullable: false, optional: true, type: 'number' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        omniProcessVersionNumber: { array: false, nullable: false, optional: true, type: 'number' },
        parentElementName: { array: false, nullable: false, optional: true, type: 'string' },
        parentElementType: { array: false, nullable: false, optional: true, type: 'string' },
        propertySetConfig: { array: false, nullable: false, optional: true, type: 'string' },
        questionDevName: { array: false, nullable: false, optional: true, type: 'string' },
        sequenceNumber: { array: false, nullable: false, optional: true, type: 'number' },
        type: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const OmniScriptSchema = {
    name: 'OmniScript',
    extends: 'Metadata',
    fields: {
        customHtmlTemplates: { array: false, nullable: false, optional: true, type: 'string' },
        customJavaScript: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        designerCustomizationType: { array: false, nullable: false, optional: true, type: 'string' },
        elementTypeComponentMapping: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        isIntegrationProcedure: { array: false, nullable: false, optional: true, type: 'boolean' },
        isMetadataCacheDisabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isOmniScriptEmbeddable: { array: false, nullable: false, optional: true, type: 'boolean' },
        isTestProcedure: { array: false, nullable: false, optional: true, type: 'boolean' },
        isWebCompEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        language: { array: false, nullable: false, optional: false, type: 'string' },
        lastPreviewPage: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        nameSpace: { array: false, nullable: false, optional: true, type: 'string' },
        omniProcessElements: { array: true, nullable: false, optional: true, type: 'OmniProcessElement' },
        omniProcessKey: { array: false, nullable: false, optional: true, type: 'string' },
        omniProcessType: { array: false, nullable: false, optional: false, type: 'string' },
        overrideKey: { array: false, nullable: false, optional: true, type: 'string' },
        propertySetConfig: { array: false, nullable: false, optional: true, type: 'string' },
        requiredPermission: { array: false, nullable: false, optional: true, type: 'string' },
        responseCacheType: { array: false, nullable: false, optional: true, type: 'string' },
        subType: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
        uniqueName: { array: false, nullable: false, optional: false, type: 'string' },
        versionNumber: { array: false, nullable: false, optional: false, type: 'number' },
        webComponentKey: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const OmniSupervisorConfigSchema = {
    name: 'OmniSupervisorConfig',
    extends: 'Metadata',
    fields: {
        isTimelineHidden: { array: false, nullable: false, optional: false, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        omniSupervisorConfigAction: { array: true, nullable: false, optional: true, type: 'OmniSupervisorConfigAction' },
        omniSupervisorConfigGroup: { array: true, nullable: false, optional: true, type: 'OmniSupervisorConfigGroup' },
        omniSupervisorConfigProfile: { array: true, nullable: false, optional: true, type: 'OmniSupervisorConfigProfile' },
        omniSupervisorConfigQueue: { array: true, nullable: false, optional: true, type: 'OmniSupervisorConfigQueue' },
        omniSupervisorConfigSkill: { array: true, nullable: false, optional: true, type: 'OmniSupervisorConfigSkill' },
        skillVisibility: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const OmniSupervisorConfigActionSchema = {
    name: 'OmniSupervisorConfigAction',
    fields: {
        actionName: { array: false, nullable: false, optional: false, type: 'string' },
        actionTab: { array: false, nullable: false, optional: false, type: 'string' },
        customActionFlow: { array: false, nullable: false, optional: true, type: 'string' },
        displayOrder: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const OmniSupervisorConfigGroupSchema = {
    name: 'OmniSupervisorConfigGroup',
    fields: {
        group: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const OmniSupervisorConfigProfileSchema = {
    name: 'OmniSupervisorConfigProfile',
    fields: {
        profile: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const OmniSupervisorConfigQueueSchema = {
    name: 'OmniSupervisorConfigQueue',
    fields: {
        queue: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const OmniSupervisorConfigSkillSchema = {
    name: 'OmniSupervisorConfigSkill',
    fields: {
        skill: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const OmniUiCardSchema = {
    name: 'OmniUiCard',
    extends: 'Metadata',
    fields: {
        authorName: { array: false, nullable: false, optional: false, type: 'string' },
        clonedFromOmniUiCardKey: { array: false, nullable: false, optional: true, type: 'string' },
        dataSourceConfig: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: false, type: 'boolean' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        omniUiCardType: { array: false, nullable: false, optional: false, type: 'string' },
        overrideKey: { array: false, nullable: false, optional: true, type: 'string' },
        propertySetConfig: { array: false, nullable: false, optional: false, type: 'string' },
        sampleDataSourceResponse: { array: false, nullable: false, optional: true, type: 'string' },
        stylingConfiguration: { array: false, nullable: false, optional: true, type: 'string' },
        versionNumber: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const OpportunityInsightsSettingsSchema = {
    name: 'OpportunityInsightsSettings',
    extends: 'Metadata',
    fields: {
        enableOpportunityInsights: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const OpportunityScoreSettingsSchema = {
    name: 'OpportunityScoreSettings',
    extends: 'Metadata',
    fields: {
        enableOpportunityScoring: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const OpportunitySettingsSchema = {
    name: 'OpportunitySettings',
    extends: 'Metadata',
    fields: {
        autoActivateNewReminders: { array: false, nullable: false, optional: true, type: 'boolean' },
        customizableProductSchedulesEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        doesEnforceStandardOpportunitySaveLogic: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableExpandedPipelineInspectionSetup: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFindSimilarOpportunities: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableForecastCategoryMetrics: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOpportunityFieldHistoryTracking: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOpportunityInsightsInMobile: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOpportunityTeam: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePipelineChangesMetrics: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePipelineInspection: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePipelineInspectionFlow: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePipelineInspectionSingleCategoryRollup: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRevenueInsights: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableServiceCaseInsights: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableUpdateReminders: { array: false, nullable: false, optional: true, type: 'boolean' },
        findSimilarOppFilter: { array: false, nullable: false, optional: true, type: 'FindSimilarOppFilter' },
        oppAmountDealMotionEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        oppCloseDateDealMotionEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        promptToAddProducts: { array: false, nullable: false, optional: true, type: 'boolean' },
        pushCountEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        simpleOppCreateFromContact: { array: false, nullable: false, optional: true, type: 'boolean' },
        simpleOppCreateFromEvent: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const FindSimilarOppFilterSchema = {
    name: 'FindSimilarOppFilter',
    fields: {
        similarOpportunitiesDisplayColumns: { array: true, nullable: false, optional: true, type: 'string' },
        similarOpportunitiesMatchFields: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const OrchestrationContextSchema = {
    name: 'OrchestrationContext',
    extends: 'Metadata',
    fields: {
        datasets: { array: true, nullable: false, optional: true, type: 'OrchestrationContextDataset' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        events: { array: true, nullable: false, optional: true, type: 'OrchestrationContextEvent' },
        imageFile: { array: false, nullable: false, optional: false, type: 'string' },
        imageScale: { array: false, nullable: false, optional: false, type: 'number' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        runtimeType: { array: false, nullable: false, optional: false, type: 'string' },
        salesforceObject: { array: false, nullable: false, optional: true, type: 'string' },
        salesforceObjectPrimaryKey: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const OrchestrationContextDatasetSchema = {
    name: 'OrchestrationContextDataset',
    fields: {
        datasetType: { array: false, nullable: false, optional: false, type: 'string' },
        orchestrationDataset: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const OrchestrationContextEventSchema = {
    name: 'OrchestrationContextEvent',
    fields: {
        eventType: { array: false, nullable: false, optional: false, type: 'string' },
        orchestrationEvent: { array: false, nullable: false, optional: false, type: 'string' },
        platformEvent: { array: false, nullable: false, optional: false, type: 'string' },
        platformEventPrimaryKey: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const OrderManagementSettingsSchema = {
    name: 'OrderManagementSettings',
    extends: 'Metadata',
    fields: {
        enableB2CIntegration: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableB2CSelfService: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDuplicateManagement: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHighScaleOrders: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIndividualOrderItemTaxAdjustments: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOMAutomation: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOrderManagement: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePersonAccountsForShoppers: { array: false, nullable: false, optional: true, type: 'boolean' },
        initOMAutomation: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const OrderSettingsSchema = {
    name: 'OrderSettings',
    extends: 'Metadata',
    fields: {
        enableEnhancedCommerceOrders: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableNegativeQuantity: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOptionalPricebook: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOrderEvents: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOrders: { array: false, nullable: false, optional: false, type: 'boolean' },
        enableReductionOrders: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableZeroQuantity: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const OutboundNetworkConnectionSchema = {
    name: 'OutboundNetworkConnection',
    extends: 'Metadata',
    fields: {
        connectionType: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: false, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        outboundNetworkConnProperties: { array: true, nullable: false, optional: true, type: 'OutboundNetworkConnProperty' },
        status: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const OutboundNetworkConnPropertySchema = {
    name: 'OutboundNetworkConnProperty',
    fields: {
        propertyName: { array: false, nullable: false, optional: false, type: 'string' },
        propertyValue: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PackageSchema = {
    name: 'Package',
    extends: 'Metadata',
    fields: {
        apiAccessLevel: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        namespacePrefix: { array: false, nullable: false, optional: true, type: 'string' },
        objectPermissions: { array: true, nullable: false, optional: true, type: 'ProfileObjectPermissions' },
        packageType: { array: false, nullable: false, optional: true, type: 'string' },
        postInstallClass: { array: false, nullable: false, optional: true, type: 'string' },
        setupWeblink: { array: false, nullable: false, optional: true, type: 'string' },
        types: { array: true, nullable: false, optional: true, type: 'PackageTypeMembers' },
        uninstallClass: { array: false, nullable: false, optional: true, type: 'string' },
        version: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ProfileObjectPermissionsSchema = {
    name: 'ProfileObjectPermissions',
    fields: {
        allowCreate: { array: false, nullable: false, optional: true, type: 'boolean' },
        allowDelete: { array: false, nullable: false, optional: true, type: 'boolean' },
        allowEdit: { array: false, nullable: false, optional: true, type: 'boolean' },
        allowRead: { array: false, nullable: false, optional: true, type: 'boolean' },
        modifyAllRecords: { array: false, nullable: false, optional: true, type: 'boolean' },
        object: { array: false, nullable: false, optional: false, type: 'string' },
        viewAllRecords: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const PackageTypeMembersSchema = {
    name: 'PackageTypeMembers',
    fields: {
        members: { array: true, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PardotEinsteinSettingsSchema = {
    name: 'PardotEinsteinSettings',
    extends: 'Metadata',
    fields: {
        enableCampaignInsight: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEngagementScore: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const PardotSettingsSchema = {
    name: 'PardotSettings',
    extends: 'Metadata',
    fields: {
        enableAIEinsteinEngageFreq: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAIOptimizedSendTime: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableB2bmaAppEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEngagementHistoryDashboards: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEnhancedProspectCustomFieldsSync: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePardotAppV1Enabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePardotEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePardotObjectSync: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableProspectActivityDataset: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ParticipantRoleSchema = {
    name: 'ParticipantRole',
    extends: 'Metadata',
    fields: {
        defaultAccessLevel: { array: false, nullable: false, optional: false, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        parentObject: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PartyDataModelSettingsSchema = {
    name: 'PartyDataModelSettings',
    extends: 'Metadata',
    fields: {
        enableAutoSelectIndividualOnMerge: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableConsentManagement: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIndividualAutoCreate: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const PathAssistantSchema = {
    name: 'PathAssistant',
    extends: 'Metadata',
    fields: {
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        entityName: { array: false, nullable: false, optional: false, type: 'string' },
        fieldName: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        pathAssistantSteps: { array: true, nullable: false, optional: true, type: 'PathAssistantStep' },
        recordTypeName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PathAssistantStepSchema = {
    name: 'PathAssistantStep',
    fields: {
        fieldNames: { array: true, nullable: false, optional: true, type: 'string' },
        info: { array: false, nullable: false, optional: true, type: 'string' },
        picklistValueName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PathAssistantSettingsSchema = {
    name: 'PathAssistantSettings',
    extends: 'Metadata',
    fields: {
        canOverrideAutoPathCollapseWithUserPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        pathAssistantEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const PaymentGatewayProviderSchema = {
    name: 'PaymentGatewayProvider',
    extends: 'Metadata',
    fields: {
        apexAdapter: { array: false, nullable: false, optional: true, type: 'string' },
        comments: { array: false, nullable: false, optional: true, type: 'string' },
        idempotencySupported: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PaymentsSettingsSchema = {
    name: 'PaymentsSettings',
    extends: 'Metadata',
    fields: {
        enablePayments: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const PermissionSetSchema = {
    name: 'PermissionSet',
    extends: 'Metadata',
    fields: {
        applicationVisibilities: { array: true, nullable: false, optional: true, type: 'PermissionSetApplicationVisibility' },
        classAccesses: { array: true, nullable: false, optional: true, type: 'PermissionSetApexClassAccess' },
        customMetadataTypeAccesses: { array: true, nullable: false, optional: true, type: 'PermissionSetCustomMetadataTypeAccess' },
        customPermissions: { array: true, nullable: false, optional: true, type: 'PermissionSetCustomPermissions' },
        customSettingAccesses: { array: true, nullable: false, optional: true, type: 'PermissionSetCustomSettingAccess' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        externalDataSourceAccesses: { array: true, nullable: false, optional: true, type: 'PermissionSetExternalDataSourceAccess' },
        fieldPermissions: { array: true, nullable: false, optional: true, type: 'PermissionSetFieldPermissions' },
        flowAccesses: { array: true, nullable: false, optional: true, type: 'PermissionSetFlowAccess' },
        hasActivationRequired: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        license: { array: false, nullable: false, optional: true, type: 'string' },
        objectPermissions: { array: true, nullable: false, optional: true, type: 'PermissionSetObjectPermissions' },
        pageAccesses: { array: true, nullable: false, optional: true, type: 'PermissionSetApexPageAccess' },
        recordTypeVisibilities: { array: true, nullable: false, optional: true, type: 'PermissionSetRecordTypeVisibility' },
        tabSettings: { array: true, nullable: false, optional: true, type: 'PermissionSetTabSetting' },
        userPermissions: { array: true, nullable: false, optional: true, type: 'PermissionSetUserPermission' },
    }
}

const PermissionSetApplicationVisibilitySchema = {
    name: 'PermissionSetApplicationVisibility',
    fields: {
        application: { array: false, nullable: false, optional: false, type: 'string' },
        visible: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const PermissionSetApexClassAccessSchema = {
    name: 'PermissionSetApexClassAccess',
    fields: {
        apexClass: { array: false, nullable: false, optional: false, type: 'string' },
        enabled: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const PermissionSetCustomMetadataTypeAccessSchema = {
    name: 'PermissionSetCustomMetadataTypeAccess',
    fields: {
        enabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PermissionSetCustomPermissionsSchema = {
    name: 'PermissionSetCustomPermissions',
    fields: {
        enabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PermissionSetCustomSettingAccessSchema = {
    name: 'PermissionSetCustomSettingAccess',
    fields: {
        enabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PermissionSetExternalDataSourceAccessSchema = {
    name: 'PermissionSetExternalDataSourceAccess',
    fields: {
        enabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        externalDataSource: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PermissionSetFieldPermissionsSchema = {
    name: 'PermissionSetFieldPermissions',
    fields: {
        editable: { array: false, nullable: false, optional: false, type: 'boolean' },
        field: { array: false, nullable: false, optional: false, type: 'string' },
        readable: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const PermissionSetFlowAccessSchema = {
    name: 'PermissionSetFlowAccess',
    fields: {
        enabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        flow: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PermissionSetObjectPermissionsSchema = {
    name: 'PermissionSetObjectPermissions',
    fields: {
        allowCreate: { array: false, nullable: false, optional: false, type: 'boolean' },
        allowDelete: { array: false, nullable: false, optional: false, type: 'boolean' },
        allowEdit: { array: false, nullable: false, optional: false, type: 'boolean' },
        allowRead: { array: false, nullable: false, optional: false, type: 'boolean' },
        modifyAllRecords: { array: false, nullable: false, optional: false, type: 'boolean' },
        object: { array: false, nullable: false, optional: false, type: 'string' },
        viewAllRecords: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const PermissionSetApexPageAccessSchema = {
    name: 'PermissionSetApexPageAccess',
    fields: {
        apexPage: { array: false, nullable: false, optional: false, type: 'string' },
        enabled: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const PermissionSetRecordTypeVisibilitySchema = {
    name: 'PermissionSetRecordTypeVisibility',
    fields: {
        recordType: { array: false, nullable: false, optional: false, type: 'string' },
        visible: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const PermissionSetTabSettingSchema = {
    name: 'PermissionSetTabSetting',
    fields: {
        tab: { array: false, nullable: false, optional: false, type: 'string' },
        visibility: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PermissionSetUserPermissionSchema = {
    name: 'PermissionSetUserPermission',
    fields: {
        enabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const MutingPermissionSetSchema = {
    name: 'MutingPermissionSet',
    extends: 'PermissionSet',
    fields: {
        label: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PermissionSetGroupSchema = {
    name: 'PermissionSetGroup',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        hasActivationRequired: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        mutingPermissionSets: { array: true, nullable: false, optional: true, type: 'string' },
        permissionSets: { array: true, nullable: false, optional: true, type: 'string' },
        status: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const PermissionSetLicenseDefinitionSchema = {
    name: 'PermissionSetLicenseDefinition',
    extends: 'Metadata',
    fields: {
        customPermissions: { array: true, nullable: false, optional: true, type: 'PermissionSetLicenseDefinitionCustomPermission' },
        isSupplementLicense: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        licenseExpirationPolicy: { array: false, nullable: false, optional: false, type: 'string' },
        userLicenseRestrictions: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const PermissionSetLicenseDefinitionCustomPermissionSchema = {
    name: 'PermissionSetLicenseDefinitionCustomPermission',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PersonAccountOwnerPowerUserSchema = {
    name: 'PersonAccountOwnerPowerUser',
    extends: 'Metadata',
    fields: {
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        portalType: { array: false, nullable: false, optional: false, type: 'string' },
        user: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PicklistSettingsSchema = {
    name: 'PicklistSettings',
    extends: 'Metadata',
    fields: {
        isPicklistApiNameEditDisabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const PlatformCachePartitionSchema = {
    name: 'PlatformCachePartition',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        isDefaultPartition: { array: false, nullable: false, optional: false, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        platformCachePartitionTypes: { array: true, nullable: false, optional: true, type: 'PlatformCachePartitionType' },
    }
}

const PlatformCachePartitionTypeSchema = {
    name: 'PlatformCachePartitionType',
    fields: {
        allocatedCapacity: { array: false, nullable: false, optional: false, type: 'number' },
        allocatedPartnerCapacity: { array: false, nullable: false, optional: false, type: 'number' },
        allocatedPurchasedCapacity: { array: false, nullable: false, optional: false, type: 'number' },
        allocatedTrialCapacity: { array: false, nullable: false, optional: false, type: 'number' },
        cacheType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PlatformEncryptionSettingsSchema = {
    name: 'PlatformEncryptionSettings',
    extends: 'Metadata',
    fields: {
        canEncryptManagedPackageFields: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDeterministicEncryption: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEncryptFieldHistory: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEncryptionSearchEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEventBusEncryption: { array: false, nullable: false, optional: true, type: 'boolean' },
        isMEKForEncryptionRequired: { array: false, nullable: false, optional: true, type: 'boolean' },
        isUseHighAssuranceKeysRequired: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const PlatformEventChannelSchema = {
    name: 'PlatformEventChannel',
    extends: 'Metadata',
    fields: {
        channelType: { array: false, nullable: false, optional: false, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PlatformEventChannelMemberSchema = {
    name: 'PlatformEventChannelMember',
    extends: 'Metadata',
    fields: {
        enrichedFields: { array: true, nullable: false, optional: true, type: 'EnrichedField' },
        eventChannel: { array: false, nullable: false, optional: false, type: 'string' },
        filterExpression: { array: false, nullable: false, optional: true, type: 'string' },
        selectedEntity: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const EnrichedFieldSchema = {
    name: 'EnrichedField',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PortalSchema = {
    name: 'Portal',
    extends: 'Metadata',
    fields: {
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        admin: { array: false, nullable: false, optional: true, type: 'string' },
        defaultLanguage: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        emailSenderAddress: { array: false, nullable: false, optional: false, type: 'string' },
        emailSenderName: { array: false, nullable: false, optional: false, type: 'string' },
        enableSelfCloseCase: { array: false, nullable: false, optional: true, type: 'boolean' },
        footerDocument: { array: false, nullable: false, optional: true, type: 'string' },
        forgotPassTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        headerDocument: { array: false, nullable: false, optional: true, type: 'string' },
        isSelfRegistrationActivated: { array: false, nullable: false, optional: true, type: 'boolean' },
        loginHeaderDocument: { array: false, nullable: false, optional: true, type: 'string' },
        logoDocument: { array: false, nullable: false, optional: true, type: 'string' },
        logoutUrl: { array: false, nullable: false, optional: true, type: 'string' },
        newCommentTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        newPassTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        newUserTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        ownerNotifyTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        selfRegNewUserUrl: { array: false, nullable: false, optional: true, type: 'string' },
        selfRegUserDefaultProfile: { array: false, nullable: false, optional: true, type: 'string' },
        selfRegUserDefaultRole: { array: false, nullable: false, optional: true, type: 'string' },
        selfRegUserTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        showActionConfirmation: { array: false, nullable: false, optional: true, type: 'boolean' },
        stylesheetDocument: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PortalsSettingsSchema = {
    name: 'PortalsSettings',
    extends: 'Metadata',
    fields: {
        clickjackSSPLoginPage: { array: false, nullable: false, optional: true, type: 'boolean' },
        redirectPortalLoginToHttps: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const PostTemplateSchema = {
    name: 'PostTemplate',
    extends: 'Metadata',
    fields: {
        default: { array: false, nullable: false, optional: true, type: 'boolean' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        fields: { array: true, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PredictionBuilderSettingsSchema = {
    name: 'PredictionBuilderSettings',
    extends: 'Metadata',
    fields: {
        enablePredictionBuilder: { array: false, nullable: false, optional: true, type: 'boolean' },
        isPredictionBuilderStarted: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const PresenceDeclineReasonSchema = {
    name: 'PresenceDeclineReason',
    extends: 'Metadata',
    fields: {
        label: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PresenceUserConfigSchema = {
    name: 'PresenceUserConfig',
    extends: 'Metadata',
    fields: {
        assignments: { array: false, nullable: false, optional: true, type: 'PresenceConfigAssignments' },
        capacity: { array: false, nullable: false, optional: false, type: 'number' },
        declineReasons: { array: true, nullable: false, optional: true, type: 'string' },
        enableAutoAccept: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDecline: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDeclineReason: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDisconnectSound: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRequestSound: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        presenceStatusOnDecline: { array: false, nullable: false, optional: true, type: 'string' },
        presenceStatusOnPushTimeout: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const PresenceConfigAssignmentsSchema = {
    name: 'PresenceConfigAssignments',
    fields: {
        profiles: { array: false, nullable: false, optional: true, type: 'PresenceConfigProfileAssignments' },
        users: { array: false, nullable: false, optional: true, type: 'PresenceConfigUserAssignments' },
    }
}

const PresenceConfigProfileAssignmentsSchema = {
    name: 'PresenceConfigProfileAssignments',
    fields: {
        profile: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const PresenceConfigUserAssignmentsSchema = {
    name: 'PresenceConfigUserAssignments',
    fields: {
        user: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const PrivacySettingsSchema = {
    name: 'PrivacySettings',
    extends: 'Metadata',
    fields: {
        authorizationCaptureBrowser: { array: false, nullable: false, optional: true, type: 'boolean' },
        authorizationCaptureEmail: { array: false, nullable: false, optional: true, type: 'boolean' },
        authorizationCaptureIp: { array: false, nullable: false, optional: true, type: 'boolean' },
        authorizationCaptureLocation: { array: false, nullable: false, optional: true, type: 'boolean' },
        authorizationCustomSharing: { array: false, nullable: false, optional: true, type: 'boolean' },
        authorizationLockingAndVersioning: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableConfigurableUserPIIActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableConsentAuditTrail: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableConsentEventStream: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDefaultMetadataValues: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ProductAttributeSetSchema = {
    name: 'ProductAttributeSet',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        productAttributeSetItems: { array: true, nullable: false, optional: true, type: 'ProductAttributeSetItem' },
    }
}

const ProductAttributeSetItemSchema = {
    name: 'ProductAttributeSetItem',
    fields: {
        field: { array: false, nullable: false, optional: false, type: 'string' },
        sequence: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const ProductSettingsSchema = {
    name: 'ProductSettings',
    extends: 'Metadata',
    fields: {
        enableCascadeActivateToRelatedPrices: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMySettings: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableQuantitySchedule: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRevenueSchedule: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ProductSpecificationTypeDefinitionSchema = {
    name: 'ProductSpecificationTypeDefinition',
    extends: 'Metadata',
    fields: {
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        recordType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ProfileSchema = {
    name: 'Profile',
    extends: 'Metadata',
    fields: {
        applicationVisibilities: { array: true, nullable: false, optional: true, type: 'ProfileApplicationVisibility' },
        categoryGroupVisibilities: { array: true, nullable: false, optional: true, type: 'ProfileCategoryGroupVisibility' },
        classAccesses: { array: true, nullable: false, optional: true, type: 'ProfileApexClassAccess' },
        custom: { array: false, nullable: false, optional: true, type: 'boolean' },
        customMetadataTypeAccesses: { array: true, nullable: false, optional: true, type: 'ProfileCustomMetadataTypeAccess' },
        customPermissions: { array: true, nullable: false, optional: true, type: 'ProfileCustomPermissions' },
        customSettingAccesses: { array: true, nullable: false, optional: true, type: 'ProfileCustomSettingAccess' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        externalDataSourceAccesses: { array: true, nullable: false, optional: true, type: 'ProfileExternalDataSourceAccess' },
        fieldPermissions: { array: true, nullable: false, optional: true, type: 'ProfileFieldLevelSecurity' },
        flowAccesses: { array: true, nullable: false, optional: true, type: 'ProfileFlowAccess' },
        layoutAssignments: { array: true, nullable: false, optional: true, type: 'ProfileLayoutAssignment' },
        loginFlows: { array: true, nullable: false, optional: true, type: 'LoginFlow' },
        loginHours: { array: false, nullable: false, optional: true, type: 'ProfileLoginHours' },
        loginIpRanges: { array: true, nullable: false, optional: true, type: 'ProfileLoginIpRange' },
        objectPermissions: { array: true, nullable: false, optional: true, type: 'ProfileObjectPermissions' },
        pageAccesses: { array: true, nullable: false, optional: true, type: 'ProfileApexPageAccess' },
        profileActionOverrides: { array: true, nullable: false, optional: true, type: 'ProfileActionOverride' },
        recordTypeVisibilities: { array: true, nullable: false, optional: true, type: 'ProfileRecordTypeVisibility' },
        tabVisibilities: { array: true, nullable: false, optional: true, type: 'ProfileTabVisibility' },
        userLicense: { array: false, nullable: false, optional: true, type: 'string' },
        userPermissions: { array: true, nullable: false, optional: true, type: 'ProfileUserPermission' },
    }
}

const ProfileApplicationVisibilitySchema = {
    name: 'ProfileApplicationVisibility',
    fields: {
        application: { array: false, nullable: false, optional: false, type: 'string' },
        default: { array: false, nullable: false, optional: false, type: 'boolean' },
        visible: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const ProfileCategoryGroupVisibilitySchema = {
    name: 'ProfileCategoryGroupVisibility',
    fields: {
        dataCategories: { array: true, nullable: false, optional: true, type: 'string' },
        dataCategoryGroup: { array: false, nullable: false, optional: false, type: 'string' },
        visibility: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ProfileApexClassAccessSchema = {
    name: 'ProfileApexClassAccess',
    fields: {
        apexClass: { array: false, nullable: false, optional: false, type: 'string' },
        enabled: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const ProfileCustomMetadataTypeAccessSchema = {
    name: 'ProfileCustomMetadataTypeAccess',
    fields: {
        enabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ProfileCustomPermissionsSchema = {
    name: 'ProfileCustomPermissions',
    fields: {
        enabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ProfileCustomSettingAccessSchema = {
    name: 'ProfileCustomSettingAccess',
    fields: {
        enabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ProfileExternalDataSourceAccessSchema = {
    name: 'ProfileExternalDataSourceAccess',
    fields: {
        enabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        externalDataSource: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ProfileFieldLevelSecuritySchema = {
    name: 'ProfileFieldLevelSecurity',
    fields: {
        editable: { array: false, nullable: false, optional: false, type: 'boolean' },
        field: { array: false, nullable: false, optional: false, type: 'string' },
        readable: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ProfileFlowAccessSchema = {
    name: 'ProfileFlowAccess',
    fields: {
        enabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        flow: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ProfileLayoutAssignmentSchema = {
    name: 'ProfileLayoutAssignment',
    fields: {
        layout: { array: false, nullable: false, optional: false, type: 'string' },
        recordType: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const LoginFlowSchema = {
    name: 'LoginFlow',
    fields: {
        flow: { array: false, nullable: false, optional: true, type: 'string' },
        flowType: { array: false, nullable: false, optional: false, type: 'string' },
        friendlyName: { array: false, nullable: false, optional: false, type: 'string' },
        uiLoginFlowType: { array: false, nullable: false, optional: false, type: 'string' },
        useLightningRuntime: { array: false, nullable: false, optional: true, type: 'boolean' },
        vfFlowPage: { array: false, nullable: false, optional: true, type: 'string' },
        vfFlowPageTitle: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ProfileLoginHoursSchema = {
    name: 'ProfileLoginHours',
    fields: {
        fridayEnd: { array: false, nullable: false, optional: true, type: 'string' },
        fridayStart: { array: false, nullable: false, optional: true, type: 'string' },
        mondayEnd: { array: false, nullable: false, optional: true, type: 'string' },
        mondayStart: { array: false, nullable: false, optional: true, type: 'string' },
        saturdayEnd: { array: false, nullable: false, optional: true, type: 'string' },
        saturdayStart: { array: false, nullable: false, optional: true, type: 'string' },
        sundayEnd: { array: false, nullable: false, optional: true, type: 'string' },
        sundayStart: { array: false, nullable: false, optional: true, type: 'string' },
        thursdayEnd: { array: false, nullable: false, optional: true, type: 'string' },
        thursdayStart: { array: false, nullable: false, optional: true, type: 'string' },
        tuesdayEnd: { array: false, nullable: false, optional: true, type: 'string' },
        tuesdayStart: { array: false, nullable: false, optional: true, type: 'string' },
        wednesdayEnd: { array: false, nullable: false, optional: true, type: 'string' },
        wednesdayStart: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ProfileLoginIpRangeSchema = {
    name: 'ProfileLoginIpRange',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        endAddress: { array: false, nullable: false, optional: false, type: 'string' },
        startAddress: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ProfileApexPageAccessSchema = {
    name: 'ProfileApexPageAccess',
    fields: {
        apexPage: { array: false, nullable: false, optional: false, type: 'string' },
        enabled: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const ProfileRecordTypeVisibilitySchema = {
    name: 'ProfileRecordTypeVisibility',
    fields: {
        default: { array: false, nullable: false, optional: false, type: 'boolean' },
        personAccountDefault: { array: false, nullable: false, optional: true, type: 'boolean' },
        recordType: { array: false, nullable: false, optional: false, type: 'string' },
        visible: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const ProfileTabVisibilitySchema = {
    name: 'ProfileTabVisibility',
    fields: {
        tab: { array: false, nullable: false, optional: false, type: 'string' },
        visibility: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ProfileUserPermissionSchema = {
    name: 'ProfileUserPermission',
    fields: {
        enabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ProfilePasswordPolicySchema = {
    name: 'ProfilePasswordPolicy',
    extends: 'Metadata',
    fields: {
        forgotPasswordRedirect: { array: false, nullable: false, optional: true, type: 'boolean' },
        lockoutInterval: { array: false, nullable: false, optional: false, type: 'number' },
        maxLoginAttempts: { array: false, nullable: false, optional: false, type: 'number' },
        minimumPasswordLength: { array: false, nullable: false, optional: false, type: 'number' },
        minimumPasswordLifetime: { array: false, nullable: false, optional: true, type: 'boolean' },
        obscure: { array: false, nullable: false, optional: true, type: 'boolean' },
        passwordComplexity: { array: false, nullable: false, optional: false, type: 'number' },
        passwordExpiration: { array: false, nullable: false, optional: false, type: 'number' },
        passwordHistory: { array: false, nullable: false, optional: false, type: 'number' },
        passwordQuestion: { array: false, nullable: false, optional: false, type: 'number' },
        profile: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ProfileSessionSettingSchema = {
    name: 'ProfileSessionSetting',
    extends: 'Metadata',
    fields: {
        externalCommunityUserIdentityVerif: { array: false, nullable: false, optional: false, type: 'boolean' },
        forceLogout: { array: false, nullable: false, optional: false, type: 'boolean' },
        profile: { array: false, nullable: false, optional: false, type: 'string' },
        requiredSessionLevel: { array: false, nullable: false, optional: true, type: 'string' },
        sessionPersistence: { array: false, nullable: false, optional: false, type: 'boolean' },
        sessionTimeout: { array: false, nullable: false, optional: false, type: 'number' },
        sessionTimeoutWarning: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const PromptSchema = {
    name: 'Prompt',
    extends: 'Metadata',
    fields: {
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        promptVersions: { array: true, nullable: false, optional: true, type: 'PromptVersion' },
    }
}

const PromptVersionSchema = {
    name: 'PromptVersion',
    fields: {
        actionButtonLabel: { array: false, nullable: false, optional: true, type: 'string' },
        actionButtonLink: { array: false, nullable: false, optional: true, type: 'string' },
        body: { array: false, nullable: false, optional: false, type: 'string' },
        customApplication: { array: false, nullable: false, optional: true, type: 'string' },
        delayDays: { array: false, nullable: false, optional: true, type: 'number' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        dismissButtonLabel: { array: false, nullable: false, optional: true, type: 'string' },
        displayPosition: { array: false, nullable: false, optional: true, type: 'string' },
        displayType: { array: false, nullable: false, optional: false, type: 'string' },
        elementRelativePosition: { array: false, nullable: false, optional: true, type: 'string' },
        endDate: { array: false, nullable: false, optional: true, type: 'string' },
        header: { array: false, nullable: false, optional: true, type: 'string' },
        icon: { array: false, nullable: false, optional: true, type: 'string' },
        image: { array: false, nullable: false, optional: true, type: 'string' },
        imageAltText: { array: false, nullable: false, optional: true, type: 'string' },
        imageLink: { array: false, nullable: false, optional: true, type: 'string' },
        imageLocation: { array: false, nullable: false, optional: true, type: 'string' },
        indexWithIsPublished: { array: false, nullable: false, optional: true, type: 'string' },
        indexWithoutIsPublished: { array: false, nullable: false, optional: true, type: 'string' },
        isPublished: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        publishedByUser: { array: false, nullable: false, optional: true, type: 'string' },
        publishedDate: { array: false, nullable: false, optional: true, type: 'string' },
        referenceElementContext: { array: false, nullable: false, optional: true, type: 'string' },
        shouldDisplayActionButton: { array: false, nullable: false, optional: true, type: 'boolean' },
        shouldIgnoreGlobalDelay: { array: false, nullable: false, optional: true, type: 'boolean' },
        startDate: { array: false, nullable: false, optional: true, type: 'string' },
        stepNumber: { array: false, nullable: false, optional: true, type: 'number' },
        targetAppDeveloperName: { array: false, nullable: false, optional: true, type: 'string' },
        targetAppNamespacePrefix: { array: false, nullable: false, optional: true, type: 'string' },
        targetPageKey1: { array: false, nullable: false, optional: true, type: 'string' },
        targetPageKey2: { array: false, nullable: false, optional: true, type: 'string' },
        targetPageKey3: { array: false, nullable: false, optional: true, type: 'string' },
        targetPageKey4: { array: false, nullable: false, optional: true, type: 'string' },
        targetPageType: { array: false, nullable: false, optional: true, type: 'string' },
        targetRecordType: { array: false, nullable: false, optional: true, type: 'string' },
        themeColor: { array: false, nullable: false, optional: true, type: 'string' },
        themeSaturation: { array: false, nullable: false, optional: true, type: 'string' },
        timesToDisplay: { array: false, nullable: false, optional: true, type: 'number' },
        title: { array: false, nullable: false, optional: false, type: 'string' },
        uiFormulaRule: { array: false, nullable: false, optional: true, type: 'UiFormulaRule' },
        userAccess: { array: false, nullable: false, optional: true, type: 'string' },
        userProfileAccess: { array: false, nullable: false, optional: true, type: 'string' },
        versionNumber: { array: false, nullable: false, optional: false, type: 'number' },
        videoLink: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const QueueSchema = {
    name: 'Queue',
    extends: 'Metadata',
    fields: {
        doesSendEmailToMembers: { array: false, nullable: false, optional: true, type: 'boolean' },
        email: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        queueMembers: { array: false, nullable: false, optional: true, type: 'QueueMembers' },
        queueRoutingConfig: { array: false, nullable: false, optional: true, type: 'string' },
        queueSobject: { array: true, nullable: false, optional: true, type: 'QueueSobject' },
    }
}

const QueueMembersSchema = {
    name: 'QueueMembers',
    fields: {
        publicGroups: { array: false, nullable: false, optional: true, type: 'PublicGroups' },
        roleAndSubordinates: { array: false, nullable: false, optional: true, type: 'RoleAndSubordinates' },
        roleAndSubordinatesInternal: { array: false, nullable: false, optional: true, type: 'RoleAndSubordinatesInternal' },
        roles: { array: false, nullable: false, optional: true, type: 'Roles' },
        users: { array: false, nullable: false, optional: true, type: 'Users' },
    }
}

const PublicGroupsSchema = {
    name: 'PublicGroups',
    fields: {
        publicGroup: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const RoleAndSubordinatesSchema = {
    name: 'RoleAndSubordinates',
    fields: {
        roleAndSubordinate: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const RoleAndSubordinatesInternalSchema = {
    name: 'RoleAndSubordinatesInternal',
    fields: {
        roleAndSubordinateInternal: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const RolesSchema = {
    name: 'Roles',
    fields: {
        role: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const UsersSchema = {
    name: 'Users',
    fields: {
        user: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const QueueSobjectSchema = {
    name: 'QueueSobject',
    fields: {
        sobjectType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const QueueRoutingConfigSchema = {
    name: 'QueueRoutingConfig',
    extends: 'Metadata',
    fields: {
        capacityPercentage: { array: false, nullable: false, optional: true, type: 'number' },
        capacityWeight: { array: false, nullable: false, optional: true, type: 'number' },
        dropAdditionalSkillsTimeout: { array: false, nullable: false, optional: true, type: 'number' },
        isAttributeBased: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        pushTimeout: { array: false, nullable: false, optional: true, type: 'number' },
        queueOverflowAssignee: { array: false, nullable: false, optional: true, type: 'string' },
        routingModel: { array: false, nullable: false, optional: false, type: 'string' },
        routingPriority: { array: false, nullable: false, optional: false, type: 'number' },
        skills: { array: true, nullable: false, optional: true, type: 'QueueRoutingConfigSkill' },
        userOverflowAssignee: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const QueueRoutingConfigSkillSchema = {
    name: 'QueueRoutingConfigSkill',
    fields: {
        skill: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const QuickActionSchema = {
    name: 'QuickAction',
    extends: 'Metadata',
    fields: {
        actionSubtype: { array: false, nullable: false, optional: true, type: 'string' },
        canvas: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        fieldOverrides: { array: true, nullable: false, optional: true, type: 'FieldOverride' },
        flowDefinition: { array: false, nullable: false, optional: true, type: 'string' },
        height: { array: false, nullable: false, optional: true, type: 'number' },
        icon: { array: false, nullable: false, optional: true, type: 'string' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        lightningComponent: { array: false, nullable: false, optional: true, type: 'string' },
        lightningWebComponent: { array: false, nullable: false, optional: true, type: 'string' },
        optionsCreateFeedItem: { array: false, nullable: false, optional: false, type: 'boolean' },
        page: { array: false, nullable: false, optional: true, type: 'string' },
        quickActionLayout: { array: false, nullable: false, optional: true, type: 'QuickActionLayout' },
        quickActionSendEmailOptions: { array: false, nullable: false, optional: true, type: 'QuickActionSendEmailOptions' },
        standardLabel: { array: false, nullable: false, optional: true, type: 'string' },
        successMessage: { array: false, nullable: false, optional: true, type: 'string' },
        targetObject: { array: false, nullable: false, optional: true, type: 'string' },
        targetParentField: { array: false, nullable: false, optional: true, type: 'string' },
        targetRecordType: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
        width: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const FieldOverrideSchema = {
    name: 'FieldOverride',
    fields: {
        field: { array: false, nullable: false, optional: false, type: 'string' },
        formula: { array: false, nullable: false, optional: true, type: 'string' },
        literalValue: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const QuickActionLayoutSchema = {
    name: 'QuickActionLayout',
    fields: {
        layoutSectionStyle: { array: false, nullable: false, optional: false, type: 'string' },
        quickActionLayoutColumns: { array: true, nullable: false, optional: true, type: 'QuickActionLayoutColumn' },
    }
}

const QuickActionLayoutColumnSchema = {
    name: 'QuickActionLayoutColumn',
    fields: {
        quickActionLayoutItems: { array: true, nullable: false, optional: true, type: 'QuickActionLayoutItem' },
    }
}

const QuickActionLayoutItemSchema = {
    name: 'QuickActionLayoutItem',
    fields: {
        emptySpace: { array: false, nullable: false, optional: true, type: 'boolean' },
        field: { array: false, nullable: false, optional: true, type: 'string' },
        uiBehavior: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const QuickActionSendEmailOptionsSchema = {
    name: 'QuickActionSendEmailOptions',
    fields: {
        defaultEmailTemplateName: { array: false, nullable: false, optional: true, type: 'string' },
        ignoreDefaultEmailTemplateSubject: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const QuickTextSettingsSchema = {
    name: 'QuickTextSettings',
    extends: 'Metadata',
    fields: {
        hideQuickTextUiInLtng: { array: false, nullable: false, optional: true, type: 'boolean' },
        lightningQuickTextEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        quickTextsInFolders: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const QuoteSettingsSchema = {
    name: 'QuoteSettings',
    extends: 'Metadata',
    fields: {
        enableQuote: { array: false, nullable: false, optional: false, type: 'boolean' },
        enableQuotesWithoutOppEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const RealTimeEventSettingsSchema = {
    name: 'RealTimeEventSettings',
    extends: 'Metadata',
    fields: {
        realTimeEvents: { array: true, nullable: false, optional: true, type: 'RealTimeEvent' },
    }
}

const RealTimeEventSchema = {
    name: 'RealTimeEvent',
    fields: {
        entityName: { array: false, nullable: false, optional: false, type: 'string' },
        isEnabled: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const RecommendationBuilderSettingsSchema = {
    name: 'RecommendationBuilderSettings',
    extends: 'Metadata',
    fields: {
        enableErbEnabledPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableErbStartedPref: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const RecommendationStrategySchema = {
    name: 'RecommendationStrategy',
    extends: 'Metadata',
    fields: {
        actionContext: { array: true, nullable: false, optional: true, type: 'StrategyAction' },
        contextRecordType: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        filter: { array: true, nullable: false, optional: true, type: 'StrategyNodeFilter' },
        if: { array: true, nullable: false, optional: true, type: 'StrategyNodeIf' },
        invocableAction: { array: true, nullable: false, optional: true, type: 'StrategyNodeInvocableAction' },
        isTemplate: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        map: { array: true, nullable: false, optional: true, type: 'StrategyNodeMap' },
        mutuallyExclusive: { array: true, nullable: false, optional: true, type: 'StrategyNodeExclusive' },
        onBehalfOfExpression: { array: false, nullable: false, optional: true, type: 'string' },
        recommendationLimit: { array: true, nullable: false, optional: true, type: 'StrategyNodeRecommendationLimit' },
        recommendationLoad: { array: true, nullable: false, optional: true, type: 'StrategyNodeRecommendationLoad' },
        sort: { array: true, nullable: false, optional: true, type: 'StrategyNodeSort' },
        union: { array: true, nullable: false, optional: true, type: 'StrategyNodeUnion' },
    }
}

const StrategyActionSchema = {
    name: 'StrategyAction',
    fields: {
        action: { array: false, nullable: false, optional: false, type: 'string' },
        argument: { array: true, nullable: false, optional: true, type: 'StrategyActionArg' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const StrategyActionArgSchema = {
    name: 'StrategyActionArg',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const StrategyNodeFilterSchema = {
    name: 'StrategyNodeFilter',
    extends: 'StrategyNodeUnionBase',
    fields: {
        expression: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const StrategyNodeUnionBaseSchema = {
    name: 'StrategyNodeUnionBase',
    extends: 'StrategyNodeBase',
    fields: {
        limit: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const StrategyNodeBaseSchema = {
    name: 'StrategyNodeBase',
    fields: {
        childNode: { array: true, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const StrategyNodeAiLoadSchema = {
    name: 'StrategyNodeAiLoad',
    extends: 'StrategyNodeUnionBase',
    fields: {
        acceptanceLabel: { array: false, nullable: false, optional: false, type: 'string' },
        actionReference: { array: false, nullable: false, optional: false, type: 'string' },
        descriptionField: { array: false, nullable: false, optional: false, type: 'string' },
        recommendationDefinitionDevName: { array: false, nullable: false, optional: false, type: 'string' },
        rejectionLabel: { array: false, nullable: false, optional: true, type: 'string' },
        titleField: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const StrategyNodeAiSortSchema = {
    name: 'StrategyNodeAiSort',
    extends: 'StrategyNodeUnionBase',
    fields: {
        
    }
}

const StrategyNodeExclusiveSchema = {
    name: 'StrategyNodeExclusive',
    extends: 'StrategyNodeUnionBase',
    fields: {
        
    }
}

const StrategyNodeIfSchema = {
    name: 'StrategyNodeIf',
    extends: 'StrategyNodeUnionBase',
    fields: {
        childNodeExpression: { array: true, nullable: false, optional: true, type: 'IfExpression' },
        onlyFirstMatch: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const IfExpressionSchema = {
    name: 'IfExpression',
    fields: {
        childName: { array: false, nullable: false, optional: false, type: 'string' },
        expression: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const StrategyNodeInvocableActionSchema = {
    name: 'StrategyNodeInvocableAction',
    extends: 'StrategyNodeUnionBase',
    fields: {
        action: { array: false, nullable: false, optional: false, type: 'string' },
        argument: { array: true, nullable: false, optional: true, type: 'StrategyNodeInvocableActionArg' },
        isGenerator: { array: false, nullable: false, optional: false, type: 'boolean' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const StrategyNodeInvocableActionArgSchema = {
    name: 'StrategyNodeInvocableActionArg',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const StrategyNodeMapSchema = {
    name: 'StrategyNodeMap',
    extends: 'StrategyNodeUnionBase',
    fields: {
        mapExpression: { array: true, nullable: false, optional: true, type: 'MapExpression' },
    }
}

const MapExpressionSchema = {
    name: 'MapExpression',
    fields: {
        expression: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const StrategyNodeRecommendationLimitSchema = {
    name: 'StrategyNodeRecommendationLimit',
    extends: 'StrategyNodeUnionBase',
    fields: {
        filterMode: { array: true, nullable: false, optional: true, type: 'string' },
        lookbackDuration: { array: false, nullable: false, optional: true, type: 'number' },
        maxRecommendationCount: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const StrategyNodeRecommendationLoadSchema = {
    name: 'StrategyNodeRecommendationLoad',
    extends: 'StrategyNodeUnionBase',
    fields: {
        condition: { array: true, nullable: false, optional: true, type: 'RecommendationLoadCondition' },
        conditionLogic: { array: false, nullable: false, optional: true, type: 'string' },
        object: { array: false, nullable: false, optional: false, type: 'string' },
        sortField: { array: true, nullable: false, optional: true, type: 'StrategyNodeSortField' },
    }
}

const RecommendationLoadConditionSchema = {
    name: 'RecommendationLoadCondition',
    fields: {
        field: { array: false, nullable: false, optional: false, type: 'string' },
        operator: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: false, type: 'RecommendationConditionValue' },
    }
}

const RecommendationConditionValueSchema = {
    name: 'RecommendationConditionValue',
    fields: {
        type: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const StrategyNodeSortFieldSchema = {
    name: 'StrategyNodeSortField',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        nullsFirst: { array: false, nullable: false, optional: true, type: 'boolean' },
        order: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const StrategyNodeSortSchema = {
    name: 'StrategyNodeSort',
    extends: 'StrategyNodeUnionBase',
    fields: {
        field: { array: true, nullable: false, optional: true, type: 'StrategyNodeSortField' },
    }
}

const StrategyNodeUnionSchema = {
    name: 'StrategyNodeUnion',
    extends: 'StrategyNodeUnionBase',
    fields: {
        
    }
}

const RecordActionDeploymentSchema = {
    name: 'RecordActionDeployment',
    extends: 'Metadata',
    fields: {
        channelConfigurations: { array: true, nullable: false, optional: true, type: 'RecordActionDeploymentChannel' },
        componentName: { array: false, nullable: false, optional: true, type: 'string' },
        deploymentContexts: { array: true, nullable: false, optional: true, type: 'RecordActionDeploymentContext' },
        hasGuidedActions: { array: false, nullable: false, optional: true, type: 'boolean' },
        hasOmniscripts: { array: false, nullable: false, optional: true, type: 'boolean' },
        hasRecommendations: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        recommendation: { array: false, nullable: false, optional: true, type: 'RecordActionRecommendation' },
        selectableItems: { array: true, nullable: false, optional: true, type: 'RecordActionSelectableItem' },
    }
}

const RecordActionDeploymentChannelSchema = {
    name: 'RecordActionDeploymentChannel',
    fields: {
        channel: { array: false, nullable: false, optional: false, type: 'string' },
        channelItems: { array: true, nullable: false, optional: true, type: 'RecordActionDefaultItem' },
        isAutopopEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const RecordActionDefaultItemSchema = {
    name: 'RecordActionDefaultItem',
    fields: {
        action: { array: false, nullable: false, optional: false, type: 'string' },
        isMandatory: { array: false, nullable: false, optional: true, type: 'boolean' },
        isUiRemoveHidden: { array: false, nullable: false, optional: true, type: 'boolean' },
        pinned: { array: false, nullable: false, optional: false, type: 'string' },
        position: { array: false, nullable: false, optional: false, type: 'number' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const RecordActionDeploymentContextSchema = {
    name: 'RecordActionDeploymentContext',
    fields: {
        entityName: { array: false, nullable: false, optional: false, type: 'string' },
        recommendationStrategy: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const RecordActionRecommendationSchema = {
    name: 'RecordActionRecommendation',
    fields: {
        defaultStrategy: { array: false, nullable: false, optional: true, type: 'string' },
        hasDescription: { array: false, nullable: false, optional: false, type: 'boolean' },
        hasImage: { array: false, nullable: false, optional: false, type: 'boolean' },
        hasRejectAction: { array: false, nullable: false, optional: false, type: 'boolean' },
        hasTitle: { array: false, nullable: false, optional: false, type: 'boolean' },
        maxDisplayRecommendations: { array: false, nullable: false, optional: false, type: 'number' },
        shouldLaunchActionOnReject: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const RecordActionSelectableItemSchema = {
    name: 'RecordActionSelectableItem',
    fields: {
        action: { array: false, nullable: false, optional: false, type: 'string' },
        frequentActionSequenceNbr: { array: false, nullable: false, optional: true, type: 'number' },
        isFrequentAction: { array: false, nullable: false, optional: true, type: 'boolean' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const RecordAlertCategorySchema = {
    name: 'RecordAlertCategory',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        severity: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const RecordPageSettingsSchema = {
    name: 'RecordPageSettings',
    extends: 'Metadata',
    fields: {
        enableActivityRelatedList: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableFullRecordView: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const RedirectWhitelistUrlSchema = {
    name: 'RedirectWhitelistUrl',
    extends: 'Metadata',
    fields: {
        url: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ReferencedDashboardSchema = {
    name: 'ReferencedDashboard',
    extends: 'Metadata',
    fields: {
        application: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        embedUrl: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        templateAssetSourceName: { array: false, nullable: false, optional: true, type: 'string' },
        visibility: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const RelationshipGraphDefinitionSchema = {
    name: 'RelationshipGraphDefinition',
    extends: 'Metadata',
    fields: {
        isActive: { array: false, nullable: false, optional: false, type: 'boolean' },
        isTemplate: { array: false, nullable: false, optional: false, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        relationshipGraphDefVersions: { array: true, nullable: false, optional: true, type: 'RelationshipGraphDefVersion' },
    }
}

const RelationshipGraphDefVersionSchema = {
    name: 'RelationshipGraphDefVersion',
    fields: {
        graphDefinition: { array: false, nullable: false, optional: false, type: 'string' },
        graphType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const RemoteSiteSettingSchema = {
    name: 'RemoteSiteSetting',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        disableProtocolSecurity: { array: false, nullable: false, optional: false, type: 'boolean' },
        isActive: { array: false, nullable: false, optional: false, type: 'boolean' },
        url: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ReportSchema = {
    name: 'Report',
    extends: 'Metadata',
    fields: {
        aggregates: { array: true, nullable: false, optional: true, type: 'ReportAggregate' },
        block: { array: true, nullable: false, optional: true, type: 'Report' },
        blockInfo: { array: false, nullable: false, optional: true, type: 'ReportBlockInfo' },
        buckets: { array: true, nullable: false, optional: true, type: 'ReportBucketField' },
        chart: { array: false, nullable: false, optional: true, type: 'ReportChart' },
        colorRanges: { array: true, nullable: false, optional: true, type: 'ReportColorRange' },
        columns: { array: true, nullable: false, optional: true, type: 'ReportColumn' },
        crossFilters: { array: true, nullable: false, optional: true, type: 'ReportCrossFilter' },
        currency: { array: false, nullable: false, optional: true, type: 'string' },
        customDetailFormulas: { array: true, nullable: false, optional: true, type: 'ReportCustomDetailFormula' },
        dataCategoryFilters: { array: true, nullable: false, optional: true, type: 'ReportDataCategoryFilter' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        division: { array: false, nullable: false, optional: true, type: 'string' },
        filter: { array: false, nullable: false, optional: true, type: 'ReportFilter' },
        folderName: { array: false, nullable: false, optional: true, type: 'string' },
        format: { array: false, nullable: false, optional: false, type: 'string' },
        formattingRules: { array: true, nullable: false, optional: true, type: 'ReportFormattingRule' },
        groupingsAcross: { array: true, nullable: false, optional: true, type: 'ReportGrouping' },
        groupingsDown: { array: true, nullable: false, optional: true, type: 'ReportGrouping' },
        historicalSelector: { array: false, nullable: false, optional: true, type: 'ReportHistoricalSelector' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        numSubscriptions: { array: false, nullable: false, optional: true, type: 'number' },
        params: { array: true, nullable: false, optional: true, type: 'ReportParam' },
        reportType: { array: false, nullable: false, optional: false, type: 'string' },
        reportTypeApiName: { array: false, nullable: false, optional: true, type: 'string' },
        roleHierarchyFilter: { array: false, nullable: false, optional: true, type: 'string' },
        rowLimit: { array: false, nullable: false, optional: true, type: 'number' },
        scope: { array: false, nullable: false, optional: true, type: 'string' },
        showCurrentDate: { array: false, nullable: false, optional: true, type: 'boolean' },
        showDetails: { array: false, nullable: false, optional: true, type: 'boolean' },
        showGrandTotal: { array: false, nullable: false, optional: true, type: 'boolean' },
        showSubTotals: { array: false, nullable: false, optional: true, type: 'boolean' },
        sortColumn: { array: false, nullable: false, optional: true, type: 'string' },
        sortOrder: { array: false, nullable: false, optional: true, type: 'string' },
        territoryHierarchyFilter: { array: false, nullable: false, optional: true, type: 'string' },
        timeFrameFilter: { array: false, nullable: false, optional: true, type: 'ReportTimeFrameFilter' },
        userFilter: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ReportAggregateSchema = {
    name: 'ReportAggregate',
    fields: {
        acrossGroupingContext: { array: false, nullable: false, optional: true, type: 'string' },
        calculatedFormula: { array: false, nullable: false, optional: false, type: 'string' },
        datatype: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        downGroupingContext: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: false, type: 'boolean' },
        isCrossBlock: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        reportType: { array: false, nullable: false, optional: true, type: 'string' },
        scale: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const ReportBlockInfoSchema = {
    name: 'ReportBlockInfo',
    fields: {
        aggregateReferences: { array: true, nullable: false, optional: true, type: 'ReportAggregateReference' },
        blockId: { array: false, nullable: false, optional: false, type: 'string' },
        joinTable: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ReportAggregateReferenceSchema = {
    name: 'ReportAggregateReference',
    fields: {
        aggregate: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ReportBucketFieldSchema = {
    name: 'ReportBucketField',
    fields: {
        bucketType: { array: false, nullable: false, optional: false, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        nullTreatment: { array: false, nullable: false, optional: true, type: 'string' },
        otherBucketLabel: { array: false, nullable: false, optional: true, type: 'string' },
        sourceColumnName: { array: false, nullable: false, optional: false, type: 'string' },
        useOther: { array: false, nullable: false, optional: true, type: 'boolean' },
        values: { array: true, nullable: false, optional: true, type: 'ReportBucketFieldValue' },
    }
}

const ReportBucketFieldValueSchema = {
    name: 'ReportBucketFieldValue',
    fields: {
        sourceValues: { array: true, nullable: false, optional: true, type: 'ReportBucketFieldSourceValue' },
        value: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ReportBucketFieldSourceValueSchema = {
    name: 'ReportBucketFieldSourceValue',
    fields: {
        from: { array: false, nullable: false, optional: true, type: 'string' },
        sourceValue: { array: false, nullable: false, optional: true, type: 'string' },
        to: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ReportChartSchema = {
    name: 'ReportChart',
    fields: {
        backgroundColor1: { array: false, nullable: false, optional: true, type: 'string' },
        backgroundColor2: { array: false, nullable: false, optional: true, type: 'string' },
        backgroundFadeDir: { array: false, nullable: false, optional: true, type: 'string' },
        chartSummaries: { array: true, nullable: false, optional: true, type: 'ChartSummary' },
        chartType: { array: false, nullable: false, optional: false, type: 'string' },
        enableHoverLabels: { array: false, nullable: false, optional: true, type: 'boolean' },
        expandOthers: { array: false, nullable: false, optional: true, type: 'boolean' },
        groupingColumn: { array: false, nullable: false, optional: true, type: 'string' },
        legendPosition: { array: false, nullable: false, optional: true, type: 'string' },
        location: { array: false, nullable: false, optional: true, type: 'string' },
        secondaryGroupingColumn: { array: false, nullable: false, optional: true, type: 'string' },
        showAxisLabels: { array: false, nullable: false, optional: true, type: 'boolean' },
        showPercentage: { array: false, nullable: false, optional: true, type: 'boolean' },
        showTotal: { array: false, nullable: false, optional: true, type: 'boolean' },
        showValues: { array: false, nullable: false, optional: true, type: 'boolean' },
        size: { array: false, nullable: false, optional: true, type: 'string' },
        summaryAxisManualRangeEnd: { array: false, nullable: false, optional: true, type: 'number' },
        summaryAxisManualRangeStart: { array: false, nullable: false, optional: true, type: 'number' },
        summaryAxisRange: { array: false, nullable: false, optional: true, type: 'string' },
        textColor: { array: false, nullable: false, optional: true, type: 'string' },
        textSize: { array: false, nullable: false, optional: true, type: 'number' },
        title: { array: false, nullable: false, optional: true, type: 'string' },
        titleColor: { array: false, nullable: false, optional: true, type: 'string' },
        titleSize: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const ReportColorRangeSchema = {
    name: 'ReportColorRange',
    fields: {
        aggregate: { array: false, nullable: false, optional: true, type: 'string' },
        columnName: { array: false, nullable: false, optional: false, type: 'string' },
        highBreakpoint: { array: false, nullable: false, optional: true, type: 'number' },
        highColor: { array: false, nullable: false, optional: false, type: 'string' },
        lowBreakpoint: { array: false, nullable: false, optional: true, type: 'number' },
        lowColor: { array: false, nullable: false, optional: false, type: 'string' },
        midColor: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ReportColumnSchema = {
    name: 'ReportColumn',
    fields: {
        aggregateTypes: { array: true, nullable: false, optional: true, type: 'string' },
        field: { array: false, nullable: false, optional: false, type: 'string' },
        reverseColors: { array: false, nullable: false, optional: true, type: 'boolean' },
        showChanges: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ReportCrossFilterSchema = {
    name: 'ReportCrossFilter',
    fields: {
        criteriaItems: { array: true, nullable: false, optional: true, type: 'ReportFilterItem' },
        operation: { array: false, nullable: false, optional: false, type: 'string' },
        primaryTableColumn: { array: false, nullable: false, optional: false, type: 'string' },
        relatedTable: { array: false, nullable: false, optional: false, type: 'string' },
        relatedTableJoinColumn: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ReportFilterItemSchema = {
    name: 'ReportFilterItem',
    fields: {
        column: { array: false, nullable: false, optional: false, type: 'string' },
        columnToColumn: { array: false, nullable: false, optional: true, type: 'boolean' },
        isUnlocked: { array: false, nullable: false, optional: true, type: 'boolean' },
        operator: { array: false, nullable: false, optional: false, type: 'string' },
        snapshot: { array: false, nullable: false, optional: true, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ReportCustomDetailFormulaSchema = {
    name: 'ReportCustomDetailFormula',
    fields: {
        calculatedFormula: { array: false, nullable: false, optional: false, type: 'string' },
        dataType: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        scale: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const ReportDataCategoryFilterSchema = {
    name: 'ReportDataCategoryFilter',
    fields: {
        dataCategory: { array: false, nullable: false, optional: false, type: 'string' },
        dataCategoryGroup: { array: false, nullable: false, optional: false, type: 'string' },
        operator: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ReportFilterSchema = {
    name: 'ReportFilter',
    fields: {
        booleanFilter: { array: false, nullable: false, optional: true, type: 'string' },
        criteriaItems: { array: true, nullable: false, optional: true, type: 'ReportFilterItem' },
        language: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ReportFormattingRuleSchema = {
    name: 'ReportFormattingRule',
    fields: {
        aggregate: { array: false, nullable: false, optional: true, type: 'string' },
        columnName: { array: false, nullable: false, optional: false, type: 'string' },
        values: { array: true, nullable: false, optional: true, type: 'ReportFormattingRuleValue' },
    }
}

const ReportFormattingRuleValueSchema = {
    name: 'ReportFormattingRuleValue',
    fields: {
        backgroundColor: { array: false, nullable: false, optional: true, type: 'string' },
        rangeUpperBound: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const ReportGroupingSchema = {
    name: 'ReportGrouping',
    fields: {
        aggregateType: { array: false, nullable: false, optional: true, type: 'string' },
        dateGranularity: { array: false, nullable: false, optional: true, type: 'string' },
        field: { array: false, nullable: false, optional: false, type: 'string' },
        sortByName: { array: false, nullable: false, optional: true, type: 'string' },
        sortOrder: { array: false, nullable: false, optional: false, type: 'string' },
        sortType: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ReportHistoricalSelectorSchema = {
    name: 'ReportHistoricalSelector',
    fields: {
        snapshot: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const ReportParamSchema = {
    name: 'ReportParam',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ReportTimeFrameFilterSchema = {
    name: 'ReportTimeFrameFilter',
    fields: {
        dateColumn: { array: false, nullable: false, optional: false, type: 'string' },
        endDate: { array: false, nullable: false, optional: true, type: 'string' },
        interval: { array: false, nullable: false, optional: false, type: 'string' },
        startDate: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ReportTypeSchema = {
    name: 'ReportType',
    extends: 'Metadata',
    fields: {
        autogenerated: { array: false, nullable: false, optional: true, type: 'boolean' },
        baseObject: { array: false, nullable: false, optional: false, type: 'string' },
        category: { array: false, nullable: false, optional: false, type: 'string' },
        deployed: { array: false, nullable: false, optional: false, type: 'boolean' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        join: { array: false, nullable: false, optional: true, type: 'ObjectRelationship' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        sections: { array: true, nullable: false, optional: true, type: 'ReportLayoutSection' },
    }
}

const ObjectRelationshipSchema = {
    name: 'ObjectRelationship',
    fields: {
        join: { array: false, nullable: false, optional: true, type: 'ObjectRelationship' },
        outerJoin: { array: false, nullable: false, optional: false, type: 'boolean' },
        relationship: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ReportLayoutSectionSchema = {
    name: 'ReportLayoutSection',
    fields: {
        columns: { array: true, nullable: false, optional: true, type: 'ReportTypeColumn' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ReportTypeColumnSchema = {
    name: 'ReportTypeColumn',
    fields: {
        checkedByDefault: { array: false, nullable: false, optional: false, type: 'boolean' },
        displayNameOverride: { array: false, nullable: false, optional: true, type: 'string' },
        field: { array: false, nullable: false, optional: false, type: 'string' },
        table: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const RestrictionRuleSchema = {
    name: 'RestrictionRule',
    extends: 'Metadata',
    fields: {
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        enforcementType: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        recordFilter: { array: false, nullable: false, optional: false, type: 'string' },
        targetEntity: { array: false, nullable: false, optional: false, type: 'string' },
        userCriteria: { array: false, nullable: false, optional: false, type: 'string' },
        version: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const RetailExecutionSettingsSchema = {
    name: 'RetailExecutionSettings',
    extends: 'Metadata',
    fields: {
        enableProductHierarchy: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRetailExecution: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableVisitSharing: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const RoleOrTerritorySchema = {
    name: 'RoleOrTerritory',
    extends: 'Metadata',
    fields: {
        caseAccessLevel: { array: false, nullable: false, optional: true, type: 'string' },
        contactAccessLevel: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        mayForecastManagerShare: { array: false, nullable: false, optional: true, type: 'boolean' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        opportunityAccessLevel: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const RoleSchema = {
    name: 'Role',
    extends: 'RoleOrTerritory',
    fields: {
        parentRole: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const TerritorySchema = {
    name: 'Territory',
    extends: 'RoleOrTerritory',
    fields: {
        accountAccessLevel: { array: false, nullable: false, optional: true, type: 'string' },
        parentTerritory: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const SalesWorkQueueSettingsSchema = {
    name: 'SalesWorkQueueSettings',
    extends: 'Metadata',
    fields: {
        featureName: { array: false, nullable: false, optional: false, type: 'string' },
        targetEntity: { array: false, nullable: false, optional: false, type: 'string' },
        targetField: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const SamlSsoConfigSchema = {
    name: 'SamlSsoConfig',
    extends: 'Metadata',
    fields: {
        attributeName: { array: false, nullable: false, optional: true, type: 'string' },
        attributeNameIdFormat: { array: false, nullable: false, optional: true, type: 'string' },
        decryptionCertificate: { array: false, nullable: false, optional: true, type: 'string' },
        errorUrl: { array: false, nullable: false, optional: true, type: 'string' },
        executionUserId: { array: false, nullable: false, optional: true, type: 'string' },
        identityLocation: { array: false, nullable: false, optional: false, type: 'string' },
        identityMapping: { array: false, nullable: false, optional: false, type: 'string' },
        issuer: { array: false, nullable: false, optional: false, type: 'string' },
        loginUrl: { array: false, nullable: false, optional: true, type: 'string' },
        logoutUrl: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        oauthTokenEndpoint: { array: false, nullable: false, optional: true, type: 'string' },
        redirectBinding: { array: false, nullable: false, optional: true, type: 'boolean' },
        requestSignatureMethod: { array: false, nullable: false, optional: true, type: 'string' },
        requestSigningCertId: { array: false, nullable: false, optional: true, type: 'string' },
        salesforceLoginUrl: { array: false, nullable: false, optional: true, type: 'string' },
        samlEntityId: { array: false, nullable: false, optional: false, type: 'string' },
        samlJitHandlerId: { array: false, nullable: false, optional: true, type: 'string' },
        samlVersion: { array: false, nullable: false, optional: false, type: 'string' },
        singleLogoutBinding: { array: false, nullable: false, optional: true, type: 'string' },
        singleLogoutUrl: { array: false, nullable: false, optional: true, type: 'string' },
        useConfigRequestMethod: { array: false, nullable: false, optional: true, type: 'boolean' },
        useSameDigestAlgoForSigning: { array: false, nullable: false, optional: true, type: 'boolean' },
        userProvisioning: { array: false, nullable: false, optional: true, type: 'boolean' },
        validationCert: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const SchemaSettingsSchema = {
    name: 'SchemaSettings',
    extends: 'Metadata',
    fields: {
        enableAdvancedCMTSecurity: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAdvancedCSSecurity: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableListCustomSettingCreation: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSOSLOnCustomSettings: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const SearchCustomizationSchema = {
    name: 'SearchCustomization',
    extends: 'Metadata',
    fields: {
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const SearchSettingsSchema = {
    name: 'SearchSettings',
    extends: 'Metadata',
    fields: {
        documentContentSearchEnabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        enableAdvancedSearchInAlohaSidebar: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEinsteinSearchAssistantDialog: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEinsteinSearchEs4kPilot: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEinsteinSearchNLSFilters: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEinsteinSearchNaturalLanguage: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEinsteinSearchPersonalization: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEinsteinSearchQA: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePersonalTagging: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePublicTagging: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableQuerySuggestionPigOn: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSalesforceGeneratedSynonyms: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSearchTermHistory: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSetupSearch: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSuggestArticlesLinksOnly: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableUseDefaultSearchEntity: { array: false, nullable: false, optional: true, type: 'boolean' },
        optimizeSearchForCJKEnabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        recentlyViewedUsersForBlankLookupEnabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        searchSettingsByObject: { array: false, nullable: false, optional: false, type: 'SearchSettingsByObject' },
        sidebarAutoCompleteEnabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        sidebarDropDownListEnabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        sidebarLimitToItemsIOwnCheckboxEnabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        singleSearchResultShortcutEnabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        spellCorrectKnowledgeSearchEnabled: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const SearchSettingsByObjectSchema = {
    name: 'SearchSettingsByObject',
    fields: {
        searchSettingsByObject: { array: true, nullable: false, optional: true, type: 'ObjectSearchSetting' },
    }
}

const ObjectSearchSettingSchema = {
    name: 'ObjectSearchSetting',
    fields: {
        enhancedLookupEnabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        lookupAutoCompleteEnabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        resultsPerPageCount: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const SecuritySettingsSchema = {
    name: 'SecuritySettings',
    extends: 'Metadata',
    fields: {
        canUsersGrantLoginAccess: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAdminLoginAsAnyUser: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAuditFieldsInactiveOwner: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAuraSecureEvalPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCoepHeader: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCoopHeader: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRequireHttpsConnection: { array: false, nullable: false, optional: true, type: 'boolean' },
        networkAccess: { array: false, nullable: false, optional: true, type: 'NetworkAccess' },
        passwordPolicies: { array: false, nullable: false, optional: true, type: 'PasswordPolicies' },
        redirectBlockModeEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        sessionSettings: { array: false, nullable: false, optional: true, type: 'SessionSettings' },
        singleSignOnSettings: { array: false, nullable: false, optional: true, type: 'SingleSignOnSettings' },
    }
}

const NetworkAccessSchema = {
    name: 'NetworkAccess',
    fields: {
        ipRanges: { array: true, nullable: false, optional: true, type: 'IpRange' },
    }
}

const IpRangeSchema = {
    name: 'IpRange',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        end: { array: false, nullable: false, optional: true, type: 'string' },
        start: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const PasswordPoliciesSchema = {
    name: 'PasswordPolicies',
    fields: {
        apiOnlyUserHomePageURL: { array: false, nullable: false, optional: true, type: 'string' },
        complexity: { array: false, nullable: false, optional: true, type: 'string' },
        expiration: { array: false, nullable: false, optional: true, type: 'string' },
        historyRestriction: { array: false, nullable: false, optional: true, type: 'string' },
        lockoutInterval: { array: false, nullable: false, optional: true, type: 'string' },
        maxLoginAttempts: { array: false, nullable: false, optional: true, type: 'string' },
        minimumPasswordLength: { array: false, nullable: false, optional: true, type: 'string' },
        minimumPasswordLifetime: { array: false, nullable: false, optional: true, type: 'boolean' },
        obscureSecretAnswer: { array: false, nullable: false, optional: true, type: 'boolean' },
        passwordAssistanceMessage: { array: false, nullable: false, optional: true, type: 'string' },
        passwordAssistanceURL: { array: false, nullable: false, optional: true, type: 'string' },
        questionRestriction: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const SessionSettingsSchema = {
    name: 'SessionSettings',
    fields: {
        allowUserAuthenticationByCertificate: { array: false, nullable: false, optional: true, type: 'boolean' },
        allowUserCertBasedAuthenticationWithOcspValidation: { array: false, nullable: false, optional: true, type: 'boolean' },
        canConfirmEmailChangeInLightningCommunities: { array: false, nullable: false, optional: true, type: 'boolean' },
        canConfirmIdentityBySmsOnly: { array: false, nullable: false, optional: true, type: 'boolean' },
        disableTimeoutWarning: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableBuiltInAuthenticator: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCSPOnEmail: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCSRFOnGet: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCSRFOnPost: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCacheAndAutocomplete: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableClickjackNonsetupSFDC: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableClickjackNonsetupUser: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableClickjackNonsetupUserHeaderless: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableClickjackSetup: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCoepHeader: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableContentSniffingProtection: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCoopHeader: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLightningLogin: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLightningLoginOnlyWithUserPerm: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMFADirectUILoginOptIn: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOauthCorsPolicy: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePostForSessions: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSMSIdentity: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableU2F: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableUpgradeInsecureRequests: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableXssProtection: { array: false, nullable: false, optional: true, type: 'boolean' },
        enforceIpRangesEveryRequest: { array: false, nullable: false, optional: true, type: 'boolean' },
        enforceUserDeviceRevoked: { array: false, nullable: false, optional: true, type: 'boolean' },
        forceLogoutOnSessionTimeout: { array: false, nullable: false, optional: true, type: 'boolean' },
        forceRelogin: { array: false, nullable: false, optional: true, type: 'boolean' },
        hasRetainedLoginHints: { array: false, nullable: false, optional: true, type: 'boolean' },
        hasUserSwitching: { array: false, nullable: false, optional: true, type: 'boolean' },
        hstsOnForcecomSites: { array: false, nullable: false, optional: true, type: 'boolean' },
        identityConfirmationOnEmailChange: { array: false, nullable: false, optional: true, type: 'boolean' },
        identityConfirmationOnTwoFactorRegistrationEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        lockSessionsToDomain: { array: false, nullable: false, optional: true, type: 'boolean' },
        lockSessionsToIp: { array: false, nullable: false, optional: true, type: 'boolean' },
        lockerServiceAPIVersion: { array: false, nullable: false, optional: true, type: 'string' },
        lockerServiceCSP: { array: false, nullable: false, optional: true, type: 'boolean' },
        lockerServiceNext: { array: false, nullable: false, optional: true, type: 'boolean' },
        lockerServiceNextControl: { array: false, nullable: false, optional: true, type: 'boolean' },
        logoutURL: { array: false, nullable: false, optional: true, type: 'string' },
        redirectBlockModeEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        redirectionWarning: { array: false, nullable: false, optional: true, type: 'boolean' },
        referrerPolicy: { array: false, nullable: false, optional: true, type: 'boolean' },
        requireHttpOnly: { array: false, nullable: false, optional: true, type: 'boolean' },
        requireHttps: { array: false, nullable: false, optional: true, type: 'boolean' },
        sessionTimeout: { array: false, nullable: false, optional: true, type: 'string' },
        sidToken3rdPartyAuraApp: { array: false, nullable: false, optional: true, type: 'boolean' },
        useLocalStorageForLogoutUrl: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const SingleSignOnSettingsSchema = {
    name: 'SingleSignOnSettings',
    fields: {
        enableCaseInsensitiveFederationID: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableForceDelegatedCallout: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMultipleSamlConfigs: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSamlJitProvisioning: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSamlLogin: { array: false, nullable: false, optional: true, type: 'boolean' },
        isLoginWithSalesforceCredentialsDisabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ServiceAISetupDefinitionSchema = {
    name: 'ServiceAISetupDefinition',
    extends: 'Metadata',
    fields: {
        appSourceType: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        setupStatus: { array: false, nullable: false, optional: false, type: 'string' },
        supportedLanguages: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const ServiceAISetupFieldSchema = {
    name: 'ServiceAISetupField',
    extends: 'Metadata',
    fields: {
        entity: { array: false, nullable: false, optional: false, type: 'string' },
        field: { array: false, nullable: false, optional: false, type: 'string' },
        fieldMappingType: { array: false, nullable: false, optional: false, type: 'string' },
        fieldPosition: { array: false, nullable: false, optional: false, type: 'number' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        setupDefinition: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ServiceChannelSchema = {
    name: 'ServiceChannel',
    extends: 'Metadata',
    fields: {
        doesMinimizeWidgetOnAccept: { array: false, nullable: false, optional: true, type: 'boolean' },
        hasAutoAcceptEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        interactionComponent: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        relatedEntityType: { array: false, nullable: false, optional: false, type: 'string' },
        secondaryRoutingPriorityField: { array: false, nullable: false, optional: true, type: 'string' },
        serviceChannelFieldPriorities: { array: true, nullable: false, optional: true, type: 'ServiceChannelFieldPriority' },
    }
}

const ServiceChannelFieldPrioritySchema = {
    name: 'ServiceChannelFieldPriority',
    fields: {
        priority: { array: false, nullable: false, optional: false, type: 'number' },
        value: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ServiceCloudVoiceSettingsSchema = {
    name: 'ServiceCloudVoiceSettings',
    extends: 'Metadata',
    fields: {
        enableAmazonQueueManagement: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDefaultChannelForSCV: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEndUserForSCV: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOmniCapacityForSCV: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePTQueueManagement: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSCVBYOT: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSCVExternalTelephony: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableServiceCloudVoice: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableVoiceInGovCloudOptIn: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const ServicePresenceStatusSchema = {
    name: 'ServicePresenceStatus',
    extends: 'Metadata',
    fields: {
        channels: { array: false, nullable: false, optional: true, type: 'ServiceChannelStatus' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ServiceChannelStatusSchema = {
    name: 'ServiceChannelStatus',
    fields: {
        channel: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const ServiceSetupAssistantSettingsSchema = {
    name: 'ServiceSetupAssistantSettings',
    extends: 'Metadata',
    fields: {
        enableServiceSetupAssistant: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const SharingBaseRuleSchema = {
    name: 'SharingBaseRule',
    extends: 'Metadata',
    fields: {
        accessLevel: { array: false, nullable: false, optional: false, type: 'string' },
        accountSettings: { array: false, nullable: false, optional: true, type: 'AccountSharingRuleSettings' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        sharedTo: { array: false, nullable: false, optional: false, type: 'SharedTo' },
    }
}

const AccountSharingRuleSettingsSchema = {
    name: 'AccountSharingRuleSettings',
    fields: {
        caseAccessLevel: { array: false, nullable: false, optional: false, type: 'string' },
        contactAccessLevel: { array: false, nullable: false, optional: false, type: 'string' },
        opportunityAccessLevel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const SharingCriteriaRuleSchema = {
    name: 'SharingCriteriaRule',
    extends: 'SharingBaseRule',
    fields: {
        booleanFilter: { array: false, nullable: false, optional: true, type: 'string' },
        criteriaItems: { array: true, nullable: false, optional: true, type: 'FilterItem' },
        includeRecordsOwnedByAll: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const SharingGuestRuleSchema = {
    name: 'SharingGuestRule',
    extends: 'SharingBaseRule',
    fields: {
        booleanFilter: { array: false, nullable: false, optional: true, type: 'string' },
        criteriaItems: { array: true, nullable: false, optional: true, type: 'FilterItem' },
        includeHVUOwnedRecords: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const SharingOwnerRuleSchema = {
    name: 'SharingOwnerRule',
    extends: 'SharingBaseRule',
    fields: {
        sharedFrom: { array: false, nullable: false, optional: false, type: 'SharedTo' },
    }
}

const SharingTerritoryRuleSchema = {
    name: 'SharingTerritoryRule',
    extends: 'SharingOwnerRule',
    fields: {
        
    }
}

const SharingRulesSchema = {
    name: 'SharingRules',
    extends: 'Metadata',
    fields: {
        sharingCriteriaRules: { array: true, nullable: false, optional: true, type: 'SharingCriteriaRule' },
        sharingGuestRules: { array: true, nullable: false, optional: true, type: 'SharingGuestRule' },
        sharingOwnerRules: { array: true, nullable: false, optional: true, type: 'SharingOwnerRule' },
        sharingTerritoryRules: { array: true, nullable: false, optional: true, type: 'SharingTerritoryRule' },
    }
}

const SharingSetSchema = {
    name: 'SharingSet',
    extends: 'Metadata',
    fields: {
        accessMappings: { array: true, nullable: false, optional: true, type: 'AccessMapping' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        profiles: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const AccessMappingSchema = {
    name: 'AccessMapping',
    fields: {
        accessLevel: { array: false, nullable: false, optional: false, type: 'string' },
        object: { array: false, nullable: false, optional: false, type: 'string' },
        objectField: { array: false, nullable: false, optional: false, type: 'string' },
        userField: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const SharingSettingsSchema = {
    name: 'SharingSettings',
    extends: 'Metadata',
    fields: {
        deferGroupMembership: { array: false, nullable: false, optional: true, type: 'boolean' },
        deferSharingRules: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAccountRoleOptimization: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAssetSharing: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCommunityUserVisibility: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableExternalSharingModel: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableManagerGroups: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableManualUserRecordSharing: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePartnerSuperUserAccess: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePortalUserCaseSharing: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePortalUserVisibility: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRemoveTMGroupMembership: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRestrictAccessLookupRecords: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSecureGuestAccess: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableShareObjectReportTypes: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableStandardReportVisibility: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTerritoryForecastManager: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const SiteSettingsSchema = {
    name: 'SiteSettings',
    extends: 'Metadata',
    fields: {
        enableEnhancedSitesAndContentPlatform: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableProxyLoginICHeader: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSitesRecordReassignOrgPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTopicsInSites: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const SkillSchema = {
    name: 'Skill',
    extends: 'Metadata',
    fields: {
        assignments: { array: false, nullable: false, optional: true, type: 'SkillAssignments' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const SkillAssignmentsSchema = {
    name: 'SkillAssignments',
    fields: {
        profiles: { array: false, nullable: false, optional: true, type: 'SkillProfileAssignments' },
        users: { array: false, nullable: false, optional: true, type: 'SkillUserAssignments' },
    }
}

const SkillProfileAssignmentsSchema = {
    name: 'SkillProfileAssignments',
    fields: {
        profile: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const SkillUserAssignmentsSchema = {
    name: 'SkillUserAssignments',
    fields: {
        user: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const SocialCustomerServiceSettingsSchema = {
    name: 'SocialCustomerServiceSettings',
    extends: 'Metadata',
    fields: {
        caseSubjectOption: { array: false, nullable: false, optional: false, type: 'string' },
        enableAllFBResponseAccounts: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableInboundProcessingConcurrency: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSocialApprovals: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSocialCaseAssignmentRules: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSocialCustomerService: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSocialPersonaHistoryTracking: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSocialPostHistoryTracking: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSocialReceiveParentPost: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const SocialProfileSettingsSchema = {
    name: 'SocialProfileSettings',
    extends: 'Metadata',
    fields: {
        enableSocialProfiles: { array: false, nullable: false, optional: true, type: 'boolean' },
        isFacebookSocialProfilesDisabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isLinkedInSocialProfilesDisabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isTwitterSocialProfilesDisabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isYouTubeSocialProfilesDisabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const StandardValueSetSchema = {
    name: 'StandardValueSet',
    extends: 'Metadata',
    fields: {
        groupingStringEnum: { array: false, nullable: false, optional: true, type: 'string' },
        sorted: { array: false, nullable: false, optional: false, type: 'boolean' },
        standardValue: { array: true, nullable: false, optional: true, type: 'StandardValue' },
    }
}

const StandardValueSetTranslationSchema = {
    name: 'StandardValueSetTranslation',
    extends: 'Metadata',
    fields: {
        valueTranslation: { array: true, nullable: false, optional: true, type: 'ValueTranslation' },
    }
}

const SubscriptionManagementSettingsSchema = {
    name: 'SubscriptionManagementSettings',
    extends: 'Metadata',
    fields: {
        enableConvertNegativeInvoiceLinesToCreditMemoAndApply: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePaymentScheduleAutomation: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRefundAutomation: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSubscriptionManagement: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const SurveySettingsSchema = {
    name: 'SurveySettings',
    extends: 'Metadata',
    fields: {
        enableIndustriesCxmEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSurvey: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSurveyOwnerCanManageResponse: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const SvcCatalogCategorySchema = {
    name: 'SvcCatalogCategory',
    extends: 'Metadata',
    fields: {
        image: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        parentCategory: { array: false, nullable: false, optional: true, type: 'string' },
        sortOrder: { array: false, nullable: false, optional: true, type: 'number' },
    }
}

const SvcCatalogFulfillmentFlowSchema = {
    name: 'SvcCatalogFulfillmentFlow',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: false, type: 'string' },
        flow: { array: false, nullable: false, optional: false, type: 'string' },
        icon: { array: false, nullable: false, optional: true, type: 'string' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        items: { array: true, nullable: false, optional: true, type: 'SvcCatalogFulfillFlowItem' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const SvcCatalogFulfillFlowItemSchema = {
    name: 'SvcCatalogFulfillFlowItem',
    fields: {
        catalogInputVariable: { array: false, nullable: false, optional: false, type: 'string' },
        displayType: { array: false, nullable: false, optional: true, type: 'string' },
        fieldDefinition: { array: false, nullable: false, optional: true, type: 'string' },
        fieldLookupDomain: { array: false, nullable: false, optional: true, type: 'string' },
        isAdditionalQuestionsInputVariable: { array: false, nullable: false, optional: true, type: 'boolean' },
        isRequired: { array: false, nullable: false, optional: true, type: 'boolean' },
        lookupDomainFieldType: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        objectLookupDomain: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const SynonymDictionarySchema = {
    name: 'SynonymDictionary',
    extends: 'Metadata',
    fields: {
        groups: { array: true, nullable: false, optional: true, type: 'SynonymGroup' },
        isProtected: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const SystemNotificationSettingsSchema = {
    name: 'SystemNotificationSettings',
    extends: 'Metadata',
    fields: {
        disableDowntimeNotifications: { array: false, nullable: false, optional: true, type: 'boolean' },
        disableMaintenanceNotifications: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const Territory2Schema = {
    name: 'Territory2',
    extends: 'Metadata',
    fields: {
        accountAccessLevel: { array: false, nullable: false, optional: true, type: 'string' },
        caseAccessLevel: { array: false, nullable: false, optional: true, type: 'string' },
        contactAccessLevel: { array: false, nullable: false, optional: true, type: 'string' },
        customFields: { array: true, nullable: false, optional: true, type: 'FieldValue' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        objectAccessLevels: { array: true, nullable: false, optional: true, type: 'Territory2AccessLevel' },
        opportunityAccessLevel: { array: false, nullable: false, optional: true, type: 'string' },
        parentTerritory: { array: false, nullable: false, optional: true, type: 'string' },
        ruleAssociations: { array: true, nullable: false, optional: true, type: 'Territory2RuleAssociation' },
        territory2Type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FieldValueSchema = {
    name: 'FieldValue',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: true, optional: true, type: undefined },
    }
}

const Territory2AccessLevelSchema = {
    name: 'Territory2AccessLevel',
    fields: {
        accessLevel: { array: false, nullable: false, optional: false, type: 'string' },
        objectType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const Territory2RuleAssociationSchema = {
    name: 'Territory2RuleAssociation',
    fields: {
        inherited: { array: false, nullable: false, optional: false, type: 'boolean' },
        ruleName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const Territory2ModelSchema = {
    name: 'Territory2Model',
    extends: 'Metadata',
    fields: {
        customFields: { array: true, nullable: false, optional: true, type: 'FieldValue' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const Territory2RuleSchema = {
    name: 'Territory2Rule',
    extends: 'Metadata',
    fields: {
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        booleanFilter: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        objectType: { array: false, nullable: false, optional: false, type: 'string' },
        ruleItems: { array: true, nullable: false, optional: true, type: 'Territory2RuleItem' },
    }
}

const Territory2RuleItemSchema = {
    name: 'Territory2RuleItem',
    fields: {
        field: { array: false, nullable: false, optional: false, type: 'string' },
        operation: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const Territory2SettingsSchema = {
    name: 'Territory2Settings',
    extends: 'Metadata',
    fields: {
        defaultAccountAccessLevel: { array: false, nullable: false, optional: true, type: 'string' },
        defaultCaseAccessLevel: { array: false, nullable: false, optional: true, type: 'string' },
        defaultContactAccessLevel: { array: false, nullable: false, optional: true, type: 'string' },
        defaultOpportunityAccessLevel: { array: false, nullable: false, optional: true, type: 'string' },
        enableTerritoryManagement2: { array: false, nullable: false, optional: true, type: 'boolean' },
        opportunityFilterSettings: { array: false, nullable: false, optional: true, type: 'Territory2SettingsOpportunityFilter' },
        showTM2EnabledBanner: { array: false, nullable: false, optional: true, type: 'boolean' },
        supportedObjects: { array: true, nullable: false, optional: true, type: 'Territory2SupportedObject' },
        t2ForecastAccessLevel: { array: false, nullable: false, optional: true, type: 'string' },
        tm2BypassRealignAccInsert: { array: false, nullable: false, optional: true, type: 'boolean' },
        tm2EnableUserAssignmentLog: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const Territory2SettingsOpportunityFilterSchema = {
    name: 'Territory2SettingsOpportunityFilter',
    fields: {
        apexClassName: { array: false, nullable: true, optional: true, type: 'string' },
        enableFilter: { array: false, nullable: false, optional: false, type: 'boolean' },
        runOnCreate: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const Territory2SupportedObjectSchema = {
    name: 'Territory2SupportedObject',
    fields: {
        defaultAccessLevel: { array: false, nullable: false, optional: false, type: 'string' },
        objectType: { array: false, nullable: false, optional: false, type: 'string' },
        state: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const Territory2TypeSchema = {
    name: 'Territory2Type',
    extends: 'Metadata',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        priority: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const TimeSheetTemplateSchema = {
    name: 'TimeSheetTemplate',
    extends: 'Metadata',
    fields: {
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        frequency: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        startDate: { array: false, nullable: false, optional: false, type: 'string' },
        timeSheetTemplateAssignments: { array: true, nullable: false, optional: true, type: 'TimeSheetTemplateAssignment' },
        workWeekEndDay: { array: false, nullable: false, optional: false, type: 'string' },
        workWeekStartDay: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const TimeSheetTemplateAssignmentSchema = {
    name: 'TimeSheetTemplateAssignment',
    fields: {
        assignedTo: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const TimelineObjectDefinitionSchema = {
    name: 'TimelineObjectDefinition',
    extends: 'Metadata',
    fields: {
        baseObject: { array: false, nullable: false, optional: false, type: 'string' },
        definition: { array: false, nullable: false, optional: false, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const TopicsForObjectsSchema = {
    name: 'TopicsForObjects',
    extends: 'Metadata',
    fields: {
        enableTopics: { array: false, nullable: false, optional: false, type: 'boolean' },
        entityApiName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const TrailheadSettingsSchema = {
    name: 'TrailheadSettings',
    extends: 'Metadata',
    fields: {
        enableConfettiEffect: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableMyTrailheadPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTrailheadInLexTerms: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const TransactionSecurityPolicySchema = {
    name: 'TransactionSecurityPolicy',
    extends: 'Metadata',
    fields: {
        action: { array: false, nullable: false, optional: false, type: 'TransactionSecurityAction' },
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        apexClass: { array: false, nullable: false, optional: true, type: 'string' },
        blockMessage: { array: false, nullable: false, optional: true, type: 'string' },
        customEmailContent: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        developerName: { array: false, nullable: false, optional: true, type: 'string' },
        eventName: { array: false, nullable: false, optional: true, type: 'string' },
        eventType: { array: false, nullable: false, optional: true, type: 'string' },
        executionUser: { array: false, nullable: false, optional: true, type: 'string' },
        flow: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: true, type: 'string' },
        resourceName: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const TransactionSecurityActionSchema = {
    name: 'TransactionSecurityAction',
    fields: {
        block: { array: false, nullable: false, optional: false, type: 'boolean' },
        endSession: { array: false, nullable: false, optional: false, type: 'boolean' },
        freezeUser: { array: false, nullable: false, optional: false, type: 'boolean' },
        notifications: { array: true, nullable: false, optional: true, type: 'TransactionSecurityNotification' },
        twoFactorAuthentication: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const TransactionSecurityNotificationSchema = {
    name: 'TransactionSecurityNotification',
    fields: {
        inApp: { array: false, nullable: false, optional: false, type: 'boolean' },
        sendEmail: { array: false, nullable: false, optional: false, type: 'boolean' },
        user: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const TranslationsSchema = {
    name: 'Translations',
    extends: 'Metadata',
    fields: {
        bots: { array: true, nullable: false, optional: true, type: 'BotTranslation' },
        customApplications: { array: true, nullable: false, optional: true, type: 'CustomApplicationTranslation' },
        customLabels: { array: true, nullable: false, optional: true, type: 'CustomLabelTranslation' },
        customPageWebLinks: { array: true, nullable: false, optional: true, type: 'CustomPageWebLinkTranslation' },
        customTabs: { array: true, nullable: false, optional: true, type: 'CustomTabTranslation' },
        desFieldTemplateMessages: { array: true, nullable: false, optional: true, type: 'ExplainabilityMsgTemplateFieldTranslation' },
        flowDefinitions: { array: true, nullable: false, optional: true, type: 'FlowDefinitionTranslation' },
        identityVerificationCustomFieldLabels: { array: true, nullable: false, optional: true, type: 'IdentityVerificationFieldTranslation' },
        pipelineInspMetricConfigs: { array: true, nullable: false, optional: true, type: 'PipelineInspMetricConfigTranslation' },
        prompts: { array: true, nullable: false, optional: true, type: 'PromptTranslation' },
        quickActions: { array: true, nullable: false, optional: true, type: 'GlobalQuickActionTranslation' },
        reportTypes: { array: true, nullable: false, optional: true, type: 'ReportTypeTranslation' },
        scontrols: { array: true, nullable: false, optional: true, type: 'ScontrolTranslation' },
    }
}

const BotTranslationSchema = {
    name: 'BotTranslation',
    fields: {
        botVersions: { array: true, nullable: false, optional: true, type: 'BotVersionTranslation' },
        fullName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const BotVersionTranslationSchema = {
    name: 'BotVersionTranslation',
    fields: {
        botDialogs: { array: true, nullable: false, optional: true, type: 'BotDialogTranslation' },
        fullName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const BotDialogTranslationSchema = {
    name: 'BotDialogTranslation',
    fields: {
        botSteps: { array: true, nullable: false, optional: true, type: 'BotStepTranslation' },
        developerName: { array: false, nullable: false, optional: false, type: 'string' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const BotStepTranslationSchema = {
    name: 'BotStepTranslation',
    fields: {
        botMessages: { array: true, nullable: false, optional: true, type: 'BotMessageTranslation' },
        botSteps: { array: true, nullable: false, optional: true, type: 'BotStepTranslation' },
        botVariableOperation: { array: false, nullable: false, optional: true, type: 'BotVariableOperationTranslation' },
        stepIdentifier: { array: false, nullable: false, optional: false, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const BotMessageTranslationSchema = {
    name: 'BotMessageTranslation',
    fields: {
        message: { array: false, nullable: false, optional: true, type: 'string' },
        messageIdentifier: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const BotVariableOperationTranslationSchema = {
    name: 'BotVariableOperationTranslation',
    fields: {
        botMessages: { array: true, nullable: false, optional: true, type: 'BotMessageTranslation' },
        botQuickReplyOptions: { array: true, nullable: false, optional: true, type: 'BotQuickReplyOptionTranslation' },
        quickReplyOptionTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        retryMessages: { array: true, nullable: false, optional: true, type: 'BotMessageTranslation' },
        successMessages: { array: true, nullable: false, optional: true, type: 'BotMessageTranslation' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
        variableOperationIdentifier: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const BotQuickReplyOptionTranslationSchema = {
    name: 'BotQuickReplyOptionTranslation',
    fields: {
        literalValue: { array: false, nullable: false, optional: true, type: 'string' },
        quickReplyOptionIdentifier: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CustomApplicationTranslationSchema = {
    name: 'CustomApplicationTranslation',
    fields: {
        label: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CustomLabelTranslationSchema = {
    name: 'CustomLabelTranslation',
    fields: {
        label: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CustomPageWebLinkTranslationSchema = {
    name: 'CustomPageWebLinkTranslation',
    fields: {
        label: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CustomTabTranslationSchema = {
    name: 'CustomTabTranslation',
    fields: {
        label: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ExplainabilityMsgTemplateFieldTranslationSchema = {
    name: 'ExplainabilityMsgTemplateFieldTranslation',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        templateMessage: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FlowDefinitionTranslationSchema = {
    name: 'FlowDefinitionTranslation',
    fields: {
        flows: { array: true, nullable: false, optional: true, type: 'FlowTranslation' },
        fullName: { array: false, nullable: false, optional: false, type: 'string' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FlowTranslationSchema = {
    name: 'FlowTranslation',
    fields: {
        choices: { array: true, nullable: false, optional: true, type: 'FlowChoiceTranslation' },
        fullName: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        screens: { array: true, nullable: false, optional: true, type: 'FlowScreenTranslation' },
        stages: { array: true, nullable: false, optional: true, type: 'FlowStageTranslation' },
        textTemplates: { array: true, nullable: false, optional: true, type: 'FlowTextTemplateTranslation' },
    }
}

const FlowChoiceTranslationSchema = {
    name: 'FlowChoiceTranslation',
    fields: {
        choiceText: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        userInput: { array: false, nullable: false, optional: true, type: 'FlowChoiceUserInputTranslation' },
    }
}

const FlowChoiceUserInputTranslationSchema = {
    name: 'FlowChoiceUserInputTranslation',
    fields: {
        promptText: { array: false, nullable: false, optional: true, type: 'string' },
        validationRule: { array: false, nullable: false, optional: true, type: 'FlowInputValidationRuleTranslation' },
    }
}

const FlowInputValidationRuleTranslationSchema = {
    name: 'FlowInputValidationRuleTranslation',
    fields: {
        errorMessage: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FlowScreenTranslationSchema = {
    name: 'FlowScreenTranslation',
    fields: {
        backButtonLabel: { array: false, nullable: false, optional: true, type: 'string' },
        fields: { array: true, nullable: false, optional: true, type: 'FlowScreenFieldTranslation' },
        helpText: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        nextOrFinishButtonLabel: { array: false, nullable: false, optional: true, type: 'string' },
        pauseButtonLabel: { array: false, nullable: false, optional: true, type: 'string' },
        pausedText: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FlowScreenFieldTranslationSchema = {
    name: 'FlowScreenFieldTranslation',
    fields: {
        fieldText: { array: false, nullable: false, optional: true, type: 'string' },
        helpText: { array: false, nullable: false, optional: true, type: 'string' },
        inputParameters: { array: true, nullable: false, optional: true, type: 'FlowInputParameterTranslation' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        validationRule: { array: false, nullable: false, optional: true, type: 'FlowInputValidationRuleTranslation' },
    }
}

const FlowInputParameterTranslationSchema = {
    name: 'FlowInputParameterTranslation',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: false, type: 'FlowFerovTranslation' },
    }
}

const FlowFerovTranslationSchema = {
    name: 'FlowFerovTranslation',
    fields: {
        complexValues: { array: true, nullable: false, optional: true, type: 'FlowComplexLiteralTranslation' },
        stringValue: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FlowComplexLiteralTranslationSchema = {
    name: 'FlowComplexLiteralTranslation',
    fields: {
        customAspectKey: { array: false, nullable: false, optional: true, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const FlowStageTranslationSchema = {
    name: 'FlowStageTranslation',
    fields: {
        label: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const FlowTextTemplateTranslationSchema = {
    name: 'FlowTextTemplateTranslation',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        text: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const IdentityVerificationFieldTranslationSchema = {
    name: 'IdentityVerificationFieldTranslation',
    fields: {
        customFieldLabel: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PipelineInspMetricConfigTranslationSchema = {
    name: 'PipelineInspMetricConfigTranslation',
    fields: {
        label: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const PromptTranslationSchema = {
    name: 'PromptTranslation',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        promptVersions: { array: true, nullable: false, optional: true, type: 'PromptVersionTranslation' },
    }
}

const PromptVersionTranslationSchema = {
    name: 'PromptVersionTranslation',
    fields: {
        actionButtonLabel: { array: false, nullable: false, optional: true, type: 'string' },
        actionButtonLink: { array: false, nullable: false, optional: true, type: 'string' },
        body: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        dismissButtonLabel: { array: false, nullable: false, optional: true, type: 'string' },
        header: { array: false, nullable: false, optional: true, type: 'string' },
        imageAltText: { array: false, nullable: false, optional: true, type: 'string' },
        imageLink: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        stepNumber: { array: false, nullable: false, optional: true, type: 'number' },
        title: { array: false, nullable: false, optional: true, type: 'string' },
        videoLink: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const GlobalQuickActionTranslationSchema = {
    name: 'GlobalQuickActionTranslation',
    fields: {
        aspect: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ReportTypeTranslationSchema = {
    name: 'ReportTypeTranslation',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        sections: { array: true, nullable: false, optional: true, type: 'ReportTypeSectionTranslation' },
    }
}

const ReportTypeSectionTranslationSchema = {
    name: 'ReportTypeSectionTranslation',
    fields: {
        columns: { array: true, nullable: false, optional: true, type: 'ReportTypeColumnTranslation' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ReportTypeColumnTranslationSchema = {
    name: 'ReportTypeColumnTranslation',
    fields: {
        label: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ScontrolTranslationSchema = {
    name: 'ScontrolTranslation',
    fields: {
        label: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const TrialOrgSettingsSchema = {
    name: 'TrialOrgSettings',
    extends: 'Metadata',
    fields: {
        enableSampleDataDeleted: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const UIObjectRelationConfigSchema = {
    name: 'UIObjectRelationConfig',
    extends: 'Metadata',
    fields: {
        UIObjectRelationFieldConfigs: { array: true, nullable: false, optional: true, type: 'UIObjectRelationFieldConfig' },
        contextObject: { array: false, nullable: false, optional: false, type: 'string' },
        contextObjectRecordType: { array: false, nullable: false, optional: true, type: 'string' },
        directRelationshipField: { array: false, nullable: false, optional: true, type: 'string' },
        indirectObjectContextField: { array: false, nullable: false, optional: true, type: 'string' },
        indirectObjectRelatedField: { array: false, nullable: false, optional: true, type: 'string' },
        indirectRelationshipObject: { array: false, nullable: false, optional: true, type: 'string' },
        isActive: { array: false, nullable: false, optional: true, type: 'boolean' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        relatedObject: { array: false, nullable: false, optional: false, type: 'string' },
        relatedObjectRecordType: { array: false, nullable: false, optional: true, type: 'string' },
        relationshipType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const UIObjectRelationFieldConfigSchema = {
    name: 'UIObjectRelationFieldConfig',
    fields: {
        displayLabel: { array: false, nullable: false, optional: false, type: 'string' },
        queryText: { array: false, nullable: false, optional: false, type: 'string' },
        rowOrder: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const UserCriteriaSchema = {
    name: 'UserCriteria',
    extends: 'Metadata',
    fields: {
        creationAgeInSeconds: { array: false, nullable: false, optional: true, type: 'number' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        lastChatterActivityAgeInSeconds: { array: false, nullable: false, optional: true, type: 'number' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        profiles: { array: true, nullable: false, optional: true, type: 'string' },
        userTypes: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const UserEngagementSettingsSchema = {
    name: 'UserEngagementSettings',
    extends: 'Metadata',
    fields: {
        canGovCloudUseAdoptionApps: { array: false, nullable: false, optional: true, type: 'boolean' },
        doesScheduledSwitcherRunDaily: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCustomHelpGlobalSection: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHelpMenuShowFeedback: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHelpMenuShowHelp: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHelpMenuShowNewUser: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHelpMenuShowSearch: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHelpMenuShowSfdcContent: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHelpMenuShowShortcut: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHelpMenuShowSupport: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHelpMenuShowTrailhead: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIBILOptOutDashboards: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIBILOptOutEvents: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIBILOptOutReports: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableIBILOptOutTasks: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableLexToClassicFeedbackEnable: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOrchestrationInSandbox: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableOrgUserAssistEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableScheduledSwitcher: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableSfdcProductFeedbackSurvey: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableShowSalesforceUserAssist: { array: false, nullable: false, optional: true, type: 'boolean' },
        isAutoTransitionDelayed: { array: false, nullable: false, optional: true, type: 'boolean' },
        isCrucNotificationDisabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isCustomProfileAutoTransitionDelayed: { array: false, nullable: false, optional: true, type: 'boolean' },
        isLEXWelcomeMatDisabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        isMeetTheAssistantDisabledInClassic: { array: false, nullable: false, optional: true, type: 'boolean' },
        isMeetTheAssistantDisabledInLightning: { array: false, nullable: false, optional: true, type: 'boolean' },
        isSmartNudgesDisabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        optimizerAppEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const UserInterfaceSettingsSchema = {
    name: 'UserInterfaceSettings',
    extends: 'Metadata',
    fields: {
        alternateAlohaListView: { array: false, nullable: false, optional: true, type: 'boolean' },
        dynamicMruActionsOff: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableAsyncRelatedLists: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableClickjackUserPageHeaderless: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCollapsibleSections: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCollapsibleSideBar: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCustomObjectTruncate: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableCustomeSideBarOnAllPages: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDeleteFieldHistory: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableExternalObjectAsyncRelatedLists: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableHoverDetails: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableInlineEdit: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableNewPageLayoutEditor: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePersonalCanvas: { array: false, nullable: false, optional: true, type: 'boolean' },
        enablePrintableListViews: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableProfileCustomTabsets: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableQuickCreate: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRelatedListHovers: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableTabOrganizer: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const UserManagementSettingsSchema = {
    name: 'UserManagementSettings',
    extends: 'Metadata',
    fields: {
        enableCanAnswerContainUsername: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableConcealPersonalInfo: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableContactlessExternalIdentityUsers: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEnhancedConcealPersonalInfo: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEnhancedPermsetMgmt: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableEnhancedProfileMgmt: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableNewProfileUI: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableProfileFiltering: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableRestrictEmailDomains: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableScrambleUserData: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableUserSelfDeactivate: { array: false, nullable: false, optional: true, type: 'boolean' },
        permsetsInFieldCreation: { array: false, nullable: false, optional: true, type: 'boolean' },
        psaExpirationUIEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        restrictedProfileCloning: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const UserProfileSearchScopeSchema = {
    name: 'UserProfileSearchScope',
    extends: 'Metadata',
    fields: {
        entityApiNames: { array: true, nullable: false, optional: true, type: 'string' },
        profile: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const UserProvisioningConfigSchema = {
    name: 'UserProvisioningConfig',
    extends: 'Metadata',
    fields: {
        approvalRequired: { array: false, nullable: false, optional: true, type: 'string' },
        connectedApp: { array: false, nullable: false, optional: false, type: 'string' },
        enabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        enabledOperations: { array: false, nullable: false, optional: true, type: 'string' },
        flow: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        namedCredential: { array: false, nullable: false, optional: true, type: 'string' },
        notes: { array: false, nullable: false, optional: true, type: 'string' },
        onUpdateAttributes: { array: false, nullable: false, optional: true, type: 'string' },
        reconFilter: { array: false, nullable: false, optional: true, type: 'string' },
        userAccountMapping: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const VoiceSettingsSchema = {
    name: 'VoiceSettings',
    extends: 'Metadata',
    fields: {
        enableCallDisposition: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableConsentReminder: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableDefaultRecording: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableVoiceCallList: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableVoiceCallRecording: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableVoiceCoaching: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableVoiceConferencing: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableVoiceLocalPresence: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableVoiceMail: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableVoiceMailDrop: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const WarrantyLifecycleMgmtSettingsSchema = {
    name: 'WarrantyLifecycleMgmtSettings',
    extends: 'Metadata',
    fields: {
        enableWarrantyLCMgmt: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const WaveApplicationSchema = {
    name: 'WaveApplication',
    extends: 'Metadata',
    fields: {
        assetIcon: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        folder: { array: false, nullable: false, optional: false, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        shares: { array: true, nullable: false, optional: true, type: 'FolderShare' },
        templateOrigin: { array: false, nullable: false, optional: true, type: 'string' },
        templateVersion: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const WaveDatasetSchema = {
    name: 'WaveDataset',
    extends: 'Metadata',
    fields: {
        application: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        templateAssetSourceName: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const WaveTemplateBundleSchema = {
    name: 'WaveTemplateBundle',
    extends: 'Metadata',
    fields: {
        assetIcon: { array: false, nullable: false, optional: true, type: 'string' },
        assetVersion: { array: false, nullable: false, optional: true, type: 'number' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        templateType: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const WaveXmdSchema = {
    name: 'WaveXmd',
    extends: 'Metadata',
    fields: {
        application: { array: false, nullable: false, optional: true, type: 'string' },
        dataset: { array: false, nullable: false, optional: false, type: 'string' },
        datasetConnector: { array: false, nullable: false, optional: true, type: 'string' },
        datasetFullyQualifiedName: { array: false, nullable: false, optional: true, type: 'string' },
        dates: { array: true, nullable: false, optional: true, type: 'WaveXmdDate' },
        dimensions: { array: true, nullable: false, optional: true, type: 'WaveXmdDimension' },
        measures: { array: true, nullable: false, optional: true, type: 'WaveXmdMeasure' },
        organizations: { array: true, nullable: false, optional: true, type: 'WaveXmdOrganization' },
        origin: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: true, type: 'string' },
        waveVisualization: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const WaveXmdDateSchema = {
    name: 'WaveXmdDate',
    fields: {
        alias: { array: false, nullable: false, optional: false, type: 'string' },
        compact: { array: false, nullable: false, optional: true, type: 'boolean' },
        dateFieldDay: { array: false, nullable: false, optional: true, type: 'string' },
        dateFieldEpochDay: { array: false, nullable: false, optional: true, type: 'string' },
        dateFieldEpochSecond: { array: false, nullable: false, optional: true, type: 'string' },
        dateFieldFiscalMonth: { array: false, nullable: false, optional: true, type: 'string' },
        dateFieldFiscalQuarter: { array: false, nullable: false, optional: true, type: 'string' },
        dateFieldFiscalWeek: { array: false, nullable: false, optional: true, type: 'string' },
        dateFieldFiscalYear: { array: false, nullable: false, optional: true, type: 'string' },
        dateFieldFullYear: { array: false, nullable: false, optional: true, type: 'string' },
        dateFieldHour: { array: false, nullable: false, optional: true, type: 'string' },
        dateFieldMinute: { array: false, nullable: false, optional: true, type: 'string' },
        dateFieldMonth: { array: false, nullable: false, optional: true, type: 'string' },
        dateFieldQuarter: { array: false, nullable: false, optional: true, type: 'string' },
        dateFieldSecond: { array: false, nullable: false, optional: true, type: 'string' },
        dateFieldWeek: { array: false, nullable: false, optional: true, type: 'string' },
        dateFieldYear: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        firstDayOfWeek: { array: false, nullable: false, optional: false, type: 'number' },
        fiscalMonthOffset: { array: false, nullable: false, optional: false, type: 'number' },
        isYearEndFiscalYear: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        showInExplorer: { array: false, nullable: false, optional: true, type: 'boolean' },
        sortIndex: { array: false, nullable: false, optional: false, type: 'number' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const WaveXmdDimensionSchema = {
    name: 'WaveXmdDimension',
    fields: {
        conditionalFormatting: { array: true, nullable: false, optional: true, type: 'WaveXmdFormattingProperty' },
        customActions: { array: true, nullable: false, optional: true, type: 'WaveXmdDimensionCustomAction' },
        customActionsEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        dateFormat: { array: false, nullable: false, optional: true, type: 'string' },
        defaultAction: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        field: { array: false, nullable: false, optional: false, type: 'string' },
        fullyQualifiedName: { array: false, nullable: false, optional: true, type: 'string' },
        imageTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        isDerived: { array: false, nullable: false, optional: false, type: 'boolean' },
        isMultiValue: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        linkTemplate: { array: false, nullable: false, optional: true, type: 'string' },
        linkTemplateEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        linkTooltip: { array: false, nullable: false, optional: true, type: 'string' },
        members: { array: true, nullable: false, optional: true, type: 'WaveXmdDimensionMember' },
        origin: { array: false, nullable: false, optional: true, type: 'string' },
        recordDisplayFields: { array: true, nullable: false, optional: true, type: 'WaveXmdRecordDisplayLookup' },
        recordIdField: { array: false, nullable: false, optional: true, type: 'string' },
        recordOrganizationIdField: { array: false, nullable: false, optional: true, type: 'string' },
        salesforceActions: { array: true, nullable: false, optional: true, type: 'WaveXmdDimensionSalesforceAction' },
        salesforceActionsEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        showDetailsDefaultFieldIndex: { array: false, nullable: false, optional: true, type: 'number' },
        showInExplorer: { array: false, nullable: false, optional: true, type: 'boolean' },
        sortIndex: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const WaveXmdFormattingPropertySchema = {
    name: 'WaveXmdFormattingProperty',
    fields: {
        formattingBins: { array: true, nullable: false, optional: true, type: 'WaveXmdFormattingBin' },
        formattingPredicates: { array: true, nullable: false, optional: true, type: 'WaveXmdFormattingPredicate' },
        property: { array: false, nullable: false, optional: false, type: 'string' },
        referenceField: { array: false, nullable: false, optional: false, type: 'string' },
        sortIndex: { array: false, nullable: false, optional: false, type: 'number' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const WaveXmdFormattingBinSchema = {
    name: 'WaveXmdFormattingBin',
    fields: {
        bin: { array: false, nullable: false, optional: false, type: 'string' },
        formatValue: { array: false, nullable: false, optional: false, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        sortIndex: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const WaveXmdFormattingPredicateSchema = {
    name: 'WaveXmdFormattingPredicate',
    fields: {
        formatValue: { array: false, nullable: false, optional: false, type: 'string' },
        operator: { array: false, nullable: false, optional: false, type: 'string' },
        sortIndex: { array: false, nullable: false, optional: false, type: 'number' },
        value: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const WaveXmdDimensionCustomActionSchema = {
    name: 'WaveXmdDimensionCustomAction',
    fields: {
        customActionName: { array: false, nullable: false, optional: false, type: 'string' },
        enabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        icon: { array: false, nullable: false, optional: true, type: 'string' },
        method: { array: false, nullable: false, optional: true, type: 'string' },
        sortIndex: { array: false, nullable: false, optional: false, type: 'number' },
        target: { array: false, nullable: false, optional: true, type: 'string' },
        tooltip: { array: false, nullable: false, optional: true, type: 'string' },
        url: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const WaveXmdDimensionMemberSchema = {
    name: 'WaveXmdDimensionMember',
    fields: {
        color: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        member: { array: false, nullable: false, optional: false, type: 'string' },
        sortIndex: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const WaveXmdRecordDisplayLookupSchema = {
    name: 'WaveXmdRecordDisplayLookup',
    fields: {
        recordDisplayField: { array: false, nullable: false, optional: false, type: 'string' },
        sortIndex: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const WaveXmdDimensionSalesforceActionSchema = {
    name: 'WaveXmdDimensionSalesforceAction',
    fields: {
        enabled: { array: false, nullable: false, optional: false, type: 'boolean' },
        salesforceActionName: { array: false, nullable: false, optional: false, type: 'string' },
        sortIndex: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const WaveXmdMeasureSchema = {
    name: 'WaveXmdMeasure',
    fields: {
        conditionalFormatting: { array: true, nullable: false, optional: true, type: 'WaveXmdFormattingProperty' },
        currencies: { array: true, nullable: false, optional: true, type: 'WaveXmdMeasure' },
        currencyCode: { array: false, nullable: false, optional: true, type: 'string' },
        dateFormat: { array: false, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        field: { array: false, nullable: false, optional: false, type: 'string' },
        formatCustomFormat: { array: false, nullable: false, optional: true, type: 'string' },
        formatDecimalDigits: { array: false, nullable: false, optional: true, type: 'number' },
        formatDecimalSeparator: { array: false, nullable: false, optional: true, type: 'string' },
        formatIsNegativeParens: { array: false, nullable: false, optional: true, type: 'boolean' },
        formatPrefix: { array: false, nullable: false, optional: true, type: 'string' },
        formatSuffix: { array: false, nullable: false, optional: true, type: 'string' },
        formatThousandsSeparator: { array: false, nullable: false, optional: true, type: 'string' },
        formatUnit: { array: false, nullable: false, optional: true, type: 'string' },
        formatUnitMultiplier: { array: false, nullable: false, optional: true, type: 'number' },
        fullyQualifiedName: { array: false, nullable: false, optional: true, type: 'string' },
        isDerived: { array: false, nullable: false, optional: false, type: 'boolean' },
        isMultiCurrency: { array: false, nullable: false, optional: true, type: 'boolean' },
        label: { array: false, nullable: false, optional: true, type: 'string' },
        origin: { array: false, nullable: false, optional: true, type: 'string' },
        showDetailsDefaultFieldIndex: { array: false, nullable: false, optional: true, type: 'number' },
        showInExplorer: { array: false, nullable: false, optional: true, type: 'boolean' },
        sortIndex: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const WaveXmdOrganizationSchema = {
    name: 'WaveXmdOrganization',
    fields: {
        instanceUrl: { array: false, nullable: false, optional: false, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        organizationIdentifier: { array: false, nullable: false, optional: false, type: 'string' },
        sortIndex: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const WebStoreTemplateSchema = {
    name: 'WebStoreTemplate',
    extends: 'Metadata',
    fields: {
        autoFacetingEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        cartToOrderAutoCustomFieldMapping: { array: false, nullable: false, optional: true, type: 'boolean' },
        checkoutTimeToLive: { array: false, nullable: false, optional: true, type: 'number' },
        checkoutValidAfterDate: { array: false, nullable: false, optional: true, type: 'string' },
        commerceEinsteinActivitiesTracked: { array: false, nullable: false, optional: true, type: 'boolean' },
        commerceEinsteinDeployed: { array: false, nullable: false, optional: true, type: 'boolean' },
        country: { array: false, nullable: false, optional: true, type: 'string' },
        defaultCurrency: { array: false, nullable: false, optional: true, type: 'string' },
        defaultLanguage: { array: false, nullable: false, optional: false, type: 'string' },
        defaultTaxLocaleType: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        guestBrowsingEnabled: { array: false, nullable: false, optional: true, type: 'boolean' },
        guestCartTimeToLive: { array: false, nullable: false, optional: true, type: 'number' },
        masterLabel: { array: false, nullable: false, optional: false, type: 'string' },
        maxValuesPerFacet: { array: false, nullable: false, optional: true, type: 'number' },
        orderActivationStatus: { array: false, nullable: false, optional: true, type: 'string' },
        orderLifeCycleType: { array: false, nullable: false, optional: true, type: 'string' },
        paginationSize: { array: false, nullable: false, optional: true, type: 'number' },
        pricingStrategy: { array: false, nullable: false, optional: false, type: 'string' },
        productGrouping: { array: false, nullable: false, optional: true, type: 'string' },
        skipAdditionalEntitlementCheckForSearch: { array: false, nullable: false, optional: true, type: 'boolean' },
        supportedCurrencies: { array: false, nullable: false, optional: true, type: 'string' },
        supportedLanguages: { array: false, nullable: false, optional: false, type: 'string' },
        supportedShipToCountries: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const WebToXSettingsSchema = {
    name: 'WebToXSettings',
    extends: 'Metadata',
    fields: {
        shouldHideRecordInfoInEmail: { array: false, nullable: false, optional: true, type: 'boolean' },
        webToCaseSpamFilter: { array: false, nullable: false, optional: true, type: 'boolean' },
        webToLeadSpamFilter: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const WorkDotComSettingsSchema = {
    name: 'WorkDotComSettings',
    extends: 'Metadata',
    fields: {
        enableCoachingManagerGroupAccess: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableGoalManagerGroupAccess: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableProfileSkills: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableProfileSkillsAddFeedPost: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableProfileSkillsAutoSuggest: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableProfileSkillsUsePlatform: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWorkBadgeDefRestrictPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWorkCalibration: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWorkCanvasPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWorkCertification: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWorkCertificationNotification: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWorkRewardsPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWorkThanksPref: { array: false, nullable: false, optional: true, type: 'boolean' },
        enableWorkUseObjectivesForGoals: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const WorkflowSchema = {
    name: 'Workflow',
    extends: 'Metadata',
    fields: {
        alerts: { array: true, nullable: false, optional: true, type: 'WorkflowAlert' },
        fieldUpdates: { array: true, nullable: false, optional: true, type: 'WorkflowFieldUpdate' },
        flowActions: { array: true, nullable: false, optional: true, type: 'WorkflowFlowAction' },
        knowledgePublishes: { array: true, nullable: false, optional: true, type: 'WorkflowKnowledgePublish' },
        outboundMessages: { array: true, nullable: false, optional: true, type: 'WorkflowOutboundMessage' },
        rules: { array: true, nullable: false, optional: true, type: 'WorkflowRule' },
        send: { array: true, nullable: false, optional: true, type: 'WorkflowSend' },
        tasks: { array: true, nullable: false, optional: true, type: 'WorkflowTask' },
    }
}

const WorkflowAlertSchema = {
    name: 'WorkflowAlert',
    extends: 'WorkflowAction',
    fields: {
        ccEmails: { array: true, nullable: false, optional: true, type: 'string' },
        description: { array: false, nullable: false, optional: false, type: 'string' },
        protected: { array: false, nullable: false, optional: false, type: 'boolean' },
        recipients: { array: true, nullable: false, optional: true, type: 'WorkflowEmailRecipient' },
        senderAddress: { array: false, nullable: false, optional: true, type: 'string' },
        senderType: { array: false, nullable: false, optional: true, type: 'string' },
        template: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const WorkflowActionSchema = {
    name: 'WorkflowAction',
    extends: 'Metadata',
    fields: {
        
    }
}

const WorkflowFieldUpdateSchema = {
    name: 'WorkflowFieldUpdate',
    extends: 'WorkflowAction',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        field: { array: false, nullable: false, optional: false, type: 'string' },
        formula: { array: false, nullable: false, optional: true, type: 'string' },
        literalValue: { array: false, nullable: false, optional: true, type: 'string' },
        lookupValue: { array: false, nullable: false, optional: true, type: 'string' },
        lookupValueType: { array: false, nullable: false, optional: true, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        notifyAssignee: { array: false, nullable: false, optional: false, type: 'boolean' },
        operation: { array: false, nullable: false, optional: false, type: 'string' },
        protected: { array: false, nullable: false, optional: false, type: 'boolean' },
        reevaluateOnChange: { array: false, nullable: false, optional: true, type: 'boolean' },
        targetObject: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const WorkflowFlowActionSchema = {
    name: 'WorkflowFlowAction',
    extends: 'WorkflowAction',
    fields: {
        description: { array: false, nullable: false, optional: true, type: 'string' },
        flow: { array: false, nullable: false, optional: false, type: 'string' },
        flowInputs: { array: true, nullable: false, optional: true, type: 'WorkflowFlowActionParameter' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        language: { array: false, nullable: false, optional: true, type: 'string' },
        protected: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const WorkflowFlowActionParameterSchema = {
    name: 'WorkflowFlowActionParameter',
    fields: {
        name: { array: false, nullable: false, optional: false, type: 'string' },
        value: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const WorkflowKnowledgePublishSchema = {
    name: 'WorkflowKnowledgePublish',
    extends: 'WorkflowAction',
    fields: {
        action: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        language: { array: false, nullable: false, optional: true, type: 'string' },
        protected: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const WorkflowOutboundMessageSchema = {
    name: 'WorkflowOutboundMessage',
    extends: 'WorkflowAction',
    fields: {
        apiVersion: { array: false, nullable: false, optional: false, type: 'number' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        endpointUrl: { array: false, nullable: false, optional: false, type: 'string' },
        fields: { array: true, nullable: false, optional: true, type: 'string' },
        includeSessionId: { array: false, nullable: false, optional: false, type: 'boolean' },
        integrationUser: { array: false, nullable: false, optional: false, type: 'string' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        protected: { array: false, nullable: false, optional: false, type: 'boolean' },
        useDeadLetterQueue: { array: false, nullable: false, optional: true, type: 'boolean' },
    }
}

const WorkflowSendSchema = {
    name: 'WorkflowSend',
    extends: 'WorkflowAction',
    fields: {
        action: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        language: { array: false, nullable: false, optional: true, type: 'string' },
        protected: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const WorkflowTaskSchema = {
    name: 'WorkflowTask',
    extends: 'WorkflowAction',
    fields: {
        assignedTo: { array: false, nullable: false, optional: true, type: 'string' },
        assignedToType: { array: false, nullable: false, optional: false, type: 'string' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        dueDateOffset: { array: false, nullable: false, optional: false, type: 'number' },
        notifyAssignee: { array: false, nullable: false, optional: false, type: 'boolean' },
        offsetFromField: { array: false, nullable: false, optional: true, type: 'string' },
        priority: { array: false, nullable: false, optional: false, type: 'string' },
        protected: { array: false, nullable: false, optional: false, type: 'boolean' },
        status: { array: false, nullable: false, optional: false, type: 'string' },
        subject: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const WorkflowEmailRecipientSchema = {
    name: 'WorkflowEmailRecipient',
    fields: {
        field: { array: false, nullable: false, optional: true, type: 'string' },
        recipient: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const WorkflowRuleSchema = {
    name: 'WorkflowRule',
    extends: 'Metadata',
    fields: {
        actions: { array: true, nullable: false, optional: true, type: 'WorkflowActionReference' },
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        booleanFilter: { array: false, nullable: false, optional: true, type: 'string' },
        criteriaItems: { array: true, nullable: false, optional: true, type: 'FilterItem' },
        description: { array: false, nullable: false, optional: true, type: 'string' },
        failedMigrationToolVersion: { array: false, nullable: false, optional: true, type: 'string' },
        formula: { array: false, nullable: false, optional: true, type: 'string' },
        triggerType: { array: false, nullable: false, optional: false, type: 'string' },
        workflowTimeTriggers: { array: true, nullable: false, optional: true, type: 'WorkflowTimeTrigger' },
    }
}

const WorkflowTimeTriggerSchema = {
    name: 'WorkflowTimeTrigger',
    fields: {
        actions: { array: true, nullable: false, optional: true, type: 'WorkflowActionReference' },
        offsetFromField: { array: false, nullable: false, optional: true, type: 'string' },
        timeLength: { array: false, nullable: false, optional: true, type: 'string' },
        workflowTimeTriggerUnit: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const SaveResultSchema = {
    name: 'SaveResult',
    fields: {
        errors: { array: true, nullable: false, optional: true, type: 'Error' },
        fullName: { array: false, nullable: false, optional: false, type: 'string' },
        success: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const ErrorSchema = {
    name: 'Error',
    fields: {
        extendedErrorDetails: { array: true, nullable: false, optional: true, type: 'ExtendedErrorDetails' },
        fields: { array: true, nullable: false, optional: true, type: 'string' },
        message: { array: false, nullable: false, optional: false, type: 'string' },
        statusCode: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ExtendedErrorDetailsSchema = {
    name: 'ExtendedErrorDetails',
    fields: {
        extendedErrorCode: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const DeleteResultSchema = {
    name: 'DeleteResult',
    fields: {
        errors: { array: true, nullable: false, optional: true, type: 'Error' },
        fullName: { array: false, nullable: false, optional: false, type: 'string' },
        success: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const DeployOptionsSchema = {
    name: 'DeployOptions',
    fields: {
        allowMissingFiles: { array: false, nullable: false, optional: false, type: 'boolean' },
        autoUpdatePackage: { array: false, nullable: false, optional: false, type: 'boolean' },
        checkOnly: { array: false, nullable: false, optional: false, type: 'boolean' },
        ignoreWarnings: { array: false, nullable: false, optional: false, type: 'boolean' },
        performRetrieve: { array: false, nullable: false, optional: false, type: 'boolean' },
        purgeOnDelete: { array: false, nullable: false, optional: false, type: 'boolean' },
        rollbackOnError: { array: false, nullable: false, optional: false, type: 'boolean' },
        runTests: { array: true, nullable: false, optional: true, type: 'string' },
        singlePackage: { array: false, nullable: false, optional: false, type: 'boolean' },
        testLevel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const AsyncResultSchema = {
    name: 'AsyncResult',
    fields: {
        done: { array: false, nullable: false, optional: false, type: 'boolean' },
        id: { array: false, nullable: false, optional: false, type: 'string' },
        message: { array: false, nullable: false, optional: true, type: 'string' },
        state: { array: false, nullable: false, optional: false, type: 'string' },
        statusCode: { array: false, nullable: false, optional: true, type: 'string' },
    }
}

const DescribeMetadataResultSchema = {
    name: 'DescribeMetadataResult',
    fields: {
        metadataObjects: { array: true, nullable: false, optional: true, type: 'DescribeMetadataObject' },
        organizationNamespace: { array: false, nullable: false, optional: false, type: 'string' },
        partialSaveAllowed: { array: false, nullable: false, optional: false, type: 'boolean' },
        testRequired: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const DescribeMetadataObjectSchema = {
    name: 'DescribeMetadataObject',
    fields: {
        childXmlNames: { array: true, nullable: false, optional: true, type: 'string' },
        directoryName: { array: false, nullable: false, optional: false, type: 'string' },
        inFolder: { array: false, nullable: false, optional: false, type: 'boolean' },
        metaFile: { array: false, nullable: false, optional: false, type: 'boolean' },
        suffix: { array: false, nullable: false, optional: true, type: 'string' },
        xmlName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const DescribeValueTypeResultSchema = {
    name: 'DescribeValueTypeResult',
    fields: {
        apiCreatable: { array: false, nullable: false, optional: false, type: 'boolean' },
        apiDeletable: { array: false, nullable: false, optional: false, type: 'boolean' },
        apiReadable: { array: false, nullable: false, optional: false, type: 'boolean' },
        apiUpdatable: { array: false, nullable: false, optional: false, type: 'boolean' },
        parentField: { array: false, nullable: false, optional: true, type: 'ValueTypeField' },
        valueTypeFields: { array: true, nullable: false, optional: true, type: 'ValueTypeField' },
    }
}

const ValueTypeFieldSchema = {
    name: 'ValueTypeField',
    fields: {
        fields: { array: true, nullable: false, optional: true, type: 'ValueTypeField' },
        foreignKeyDomain: { array: true, nullable: false, optional: true, type: 'string' },
        isForeignKey: { array: false, nullable: false, optional: false, type: 'boolean' },
        isNameField: { array: false, nullable: false, optional: false, type: 'boolean' },
        minOccurs: { array: false, nullable: false, optional: false, type: 'number' },
        name: { array: false, nullable: false, optional: false, type: 'string' },
        picklistValues: { array: true, nullable: false, optional: true, type: 'PicklistEntry' },
        soapType: { array: false, nullable: false, optional: false, type: 'string' },
        valueRequired: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const PicklistEntrySchema = {
    name: 'PicklistEntry',
    fields: {
        active: { array: false, nullable: false, optional: false, type: 'boolean' },
        defaultValue: { array: false, nullable: false, optional: false, type: 'boolean' },
        label: { array: false, nullable: false, optional: false, type: 'string' },
        validFor: { array: false, nullable: false, optional: true, type: 'string' },
        value: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ListMetadataQuerySchema = {
    name: 'ListMetadataQuery',
    fields: {
        folder: { array: false, nullable: false, optional: true, type: 'string' },
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const ReadResultSchema = {
    name: 'ReadResult',
    fields: {
        records: { array: true, nullable: false, optional: true, type: 'Metadata' },
    }
}

const RetrieveRequestSchema = {
    name: 'RetrieveRequest',
    fields: {
        apiVersion: { array: false, nullable: false, optional: false, type: 'number' },
        packageNames: { array: true, nullable: false, optional: true, type: 'string' },
        singlePackage: { array: false, nullable: false, optional: false, type: 'boolean' },
        specificFiles: { array: true, nullable: false, optional: true, type: 'string' },
        unpackaged: { array: false, nullable: false, optional: true, type: 'Package' },
    }
}

const UpsertResultSchema = {
    name: 'UpsertResult',
    fields: {
        created: { array: false, nullable: false, optional: false, type: 'boolean' },
        errors: { array: true, nullable: false, optional: true, type: 'Error' },
        fullName: { array: false, nullable: false, optional: false, type: 'string' },
        success: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const LogInfoSchema = {
    name: 'LogInfo',
    fields: {
        category: { array: false, nullable: false, optional: false, type: 'string' },
        level: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const AllOrNoneHeaderSchema = {
    name: 'AllOrNoneHeader',
    fields: {
        allOrNone: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const CallOptionsSchema = {
    name: 'CallOptions',
    fields: {
        client: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const DebuggingHeaderSchema = {
    name: 'DebuggingHeader',
    fields: {
        categories: { array: true, nullable: false, optional: true, type: LogInfoSchema },
        debugLevel: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const DebuggingInfoSchema = {
    name: 'DebuggingInfo',
    fields: {
        debugLog: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const SessionHeaderSchema = {
    name: 'SessionHeader',
    fields: {
        sessionId: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CancelDeploySchema = {
    name: 'cancelDeploy',
    fields: {
        String: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const CancelDeployResponseSchema = {
    name: 'cancelDeployResponse',
    fields: {
        result: { array: false, nullable: false, optional: false, type: CancelDeployResultSchema },
    }
}

const CheckDeployStatusSchema = {
    name: 'checkDeployStatus',
    fields: {
        asyncProcessId: { array: false, nullable: false, optional: false, type: 'string' },
        includeDetails: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const CheckDeployStatusResponseSchema = {
    name: 'checkDeployStatusResponse',
    fields: {
        result: { array: false, nullable: false, optional: false, type: DeployResultSchema },
    }
}

const CheckRetrieveStatusSchema = {
    name: 'checkRetrieveStatus',
    fields: {
        asyncProcessId: { array: false, nullable: false, optional: false, type: 'string' },
        includeZip: { array: false, nullable: false, optional: false, type: 'boolean' },
    }
}

const CheckRetrieveStatusResponseSchema = {
    name: 'checkRetrieveStatusResponse',
    fields: {
        result: { array: false, nullable: false, optional: false, type: RetrieveResultSchema },
    }
}

const CreateMetadataSchema = {
    name: 'createMetadata',
    fields: {
        metadata: { array: true, nullable: false, optional: true, type: MetadataSchema },
    }
}

const CreateMetadataResponseSchema = {
    name: 'createMetadataResponse',
    fields: {
        result: { array: true, nullable: false, optional: true, type: SaveResultSchema },
    }
}

const DeleteMetadataSchema = {
    name: 'deleteMetadata',
    fields: {
        type: { array: false, nullable: false, optional: false, type: 'string' },
        fullNames: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const DeleteMetadataResponseSchema = {
    name: 'deleteMetadataResponse',
    fields: {
        result: { array: true, nullable: false, optional: true, type: DeleteResultSchema },
    }
}

const DeploySchema = {
    name: 'deploy',
    fields: {
        ZipFile: { array: false, nullable: false, optional: false, type: 'string' },
        DeployOptions: { array: false, nullable: false, optional: false, type: DeployOptionsSchema },
    }
}

const DeployResponseSchema = {
    name: 'deployResponse',
    fields: {
        result: { array: false, nullable: false, optional: false, type: AsyncResultSchema },
    }
}

const DeployRecentValidationSchema = {
    name: 'deployRecentValidation',
    fields: {
        validationId: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const DeployRecentValidationResponseSchema = {
    name: 'deployRecentValidationResponse',
    fields: {
        result: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const DescribeMetadataSchema = {
    name: 'describeMetadata',
    fields: {
        asOfVersion: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const DescribeMetadataResponseSchema = {
    name: 'describeMetadataResponse',
    fields: {
        result: { array: false, nullable: false, optional: false, type: DescribeMetadataResultSchema },
    }
}

const DescribeValueTypeSchema = {
    name: 'describeValueType',
    fields: {
        type: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const DescribeValueTypeResponseSchema = {
    name: 'describeValueTypeResponse',
    fields: {
        result: { array: false, nullable: false, optional: false, type: DescribeValueTypeResultSchema },
    }
}

const ListMetadataSchema = {
    name: 'listMetadata',
    fields: {
        queries: { array: true, nullable: false, optional: true, type: ListMetadataQuerySchema },
        asOfVersion: { array: false, nullable: false, optional: false, type: 'number' },
    }
}

const ListMetadataResponseSchema = {
    name: 'listMetadataResponse',
    fields: {
        result: { array: true, nullable: false, optional: true, type: FilePropertiesSchema },
    }
}

const ReadMetadataSchema = {
    name: 'readMetadata',
    fields: {
        type: { array: false, nullable: false, optional: false, type: 'string' },
        fullNames: { array: true, nullable: false, optional: true, type: 'string' },
    }
}

const ReadMetadataResponseSchema = {
    name: 'readMetadataResponse',
    fields: {
        result: { array: false, nullable: false, optional: false, type: ReadResultSchema },
    }
}

const RenameMetadataSchema = {
    name: 'renameMetadata',
    fields: {
        type: { array: false, nullable: false, optional: false, type: 'string' },
        oldFullName: { array: false, nullable: false, optional: false, type: 'string' },
        newFullName: { array: false, nullable: false, optional: false, type: 'string' },
    }
}

const RenameMetadataResponseSchema = {
    name: 'renameMetadataResponse',
    fields: {
        result: { array: false, nullable: false, optional: false, type: SaveResultSchema },
    }
}

const RetrieveSchema = {
    name: 'retrieve',
    fields: {
        retrieveRequest: { array: false, nullable: false, optional: false, type: RetrieveRequestSchema },
    }
}

const RetrieveResponseSchema = {
    name: 'retrieveResponse',
    fields: {
        result: { array: false, nullable: false, optional: false, type: AsyncResultSchema },
    }
}

const UpdateMetadataSchema = {
    name: 'updateMetadata',
    fields: {
        metadata: { array: true, nullable: false, optional: true, type: MetadataSchema },
    }
}

const UpdateMetadataResponseSchema = {
    name: 'updateMetadataResponse',
    fields: {
        result: { array: true, nullable: false, optional: true, type: SaveResultSchema },
    }
}

const UpsertMetadataSchema = {
    name: 'upsertMetadata',
    fields: {
        metadata: { array: true, nullable: false, optional: true, type: MetadataSchema },
    }
}

const UpsertMetadataResponseSchema = {
    name: 'upsertMetadataResponse',
    fields: {
        result: { array: true, nullable: false, optional: true, type: UpsertResultSchema },
    }
}

export const Schemas: Record<string, Schema> = {
    'CancelDeployResult': CancelDeployResultSchema,
    'DeployResult': DeployResultSchema,
    'DeployDetails': DeployDetailsSchema,
    'DeployMessage': DeployMessageSchema,
    'RetrieveResult': RetrieveResultSchema,
    'FileProperties': FilePropertiesSchema,
    'RetrieveMessage': RetrieveMessageSchema,
    'RunTestsResult': RunTestsResultSchema,
    'CodeCoverageResult': CodeCoverageResultSchema,
    'CodeLocation': CodeLocationSchema,
    'CodeCoverageWarning': CodeCoverageWarningSchema,
    'RunTestFailure': RunTestFailureSchema,
    'FlowCoverageResult': FlowCoverageResultSchema,
    'FlowCoverageWarning': FlowCoverageWarningSchema,
    'RunTestSuccess': RunTestSuccessSchema,
    'Metadata': MetadataSchema,
    'AIApplication': AIApplicationSchema,
    'AIApplicationConfig': AIApplicationConfigSchema,
    'AIReplyRecommendationsSettings': AIReplyRecommendationsSettingsSchema,
    'AccountInsightsSettings': AccountInsightsSettingsSchema,
    'AccountIntelligenceSettings': AccountIntelligenceSettingsSchema,
    'AccountRelationshipShareRule': AccountRelationshipShareRuleSchema,
    'AccountSettings': AccountSettingsSchema,
    'ActionLauncherItemDef': ActionLauncherItemDefSchema,
    'ActionLinkGroupTemplate': ActionLinkGroupTemplateSchema,
    'ActionLinkTemplate': ActionLinkTemplateSchema,
    'ActionPlanTemplate': ActionPlanTemplateSchema,
    'ActionPlanTemplateItem': ActionPlanTemplateItemSchema,
    'ActionPlanTemplateItemValue': ActionPlanTemplateItemValueSchema,
    'ActionPlanTemplateItemDependency': ActionPlanTemplateItemDependencySchema,
    'ActionsSettings': ActionsSettingsSchema,
    'ActivitiesSettings': ActivitiesSettingsSchema,
    'AddressSettings': AddressSettingsSchema,
    'CountriesAndStates': CountriesAndStatesSchema,
    'Country': CountrySchema,
    'State': StateSchema,
    'AnalyticSnapshot': AnalyticSnapshotSchema,
    'AnalyticSnapshotMapping': AnalyticSnapshotMappingSchema,
    'AnalyticsSettings': AnalyticsSettingsSchema,
    'AnimationRule': AnimationRuleSchema,
    'ApexEmailNotifications': ApexEmailNotificationsSchema,
    'ApexEmailNotification': ApexEmailNotificationSchema,
    'ApexSettings': ApexSettingsSchema,
    'ApexTestSuite': ApexTestSuiteSchema,
    'AppExperienceSettings': AppExperienceSettingsSchema,
    'AppMenu': AppMenuSchema,
    'AppMenuItem': AppMenuItemSchema,
    'ApplicationSubtypeDefinition': ApplicationSubtypeDefinitionSchema,
    'AppointmentAssignmentPolicy': AppointmentAssignmentPolicySchema,
    'AppointmentSchedulingPolicy': AppointmentSchedulingPolicySchema,
    'ApprovalProcess': ApprovalProcessSchema,
    'ApprovalSubmitter': ApprovalSubmitterSchema,
    'ApprovalPageField': ApprovalPageFieldSchema,
    'ApprovalStep': ApprovalStepSchema,
    'ApprovalAction': ApprovalActionSchema,
    'WorkflowActionReference': WorkflowActionReferenceSchema,
    'ApprovalStepApprover': ApprovalStepApproverSchema,
    'Approver': ApproverSchema,
    'ApprovalEntryCriteria': ApprovalEntryCriteriaSchema,
    'FilterItem': FilterItemSchema,
    'DuplicateRuleFilterItem': DuplicateRuleFilterItemSchema,
    'ApprovalStepRejectBehavior': ApprovalStepRejectBehaviorSchema,
    'NextAutomatedApprover': NextAutomatedApproverSchema,
    'ArchiveSettings': ArchiveSettingsSchema,
    'AssignmentRule': AssignmentRuleSchema,
    'RuleEntry': RuleEntrySchema,
    'EscalationAction': EscalationActionSchema,
    'AssignmentRules': AssignmentRulesSchema,
    'Audience': AudienceSchema,
    'AudienceCriteria': AudienceCriteriaSchema,
    'AudienceCriterion': AudienceCriterionSchema,
    'AudienceCriteriaValue': AudienceCriteriaValueSchema,
    'PersonalizationTargetInfos': PersonalizationTargetInfosSchema,
    'PersonalizationTargetInfo': PersonalizationTargetInfoSchema,
    'AuraDefinitionBundle': AuraDefinitionBundleSchema,
    'AuraDefinitions': AuraDefinitionsSchema,
    'AuraDefinition': AuraDefinitionSchema,
    'PackageVersion': PackageVersionSchema,
    'AuthProvider': AuthProviderSchema,
    'AutoResponseRule': AutoResponseRuleSchema,
    'AutoResponseRules': AutoResponseRulesSchema,
    'AutomatedContactsSettings': AutomatedContactsSettingsSchema,
    'BatchProcessJobDefinition': BatchProcessJobDefinitionSchema,
    'BatchDataSource': BatchDataSourceSchema,
    'BatchDataSrcFilterCriteria': BatchDataSrcFilterCriteriaSchema,
    'BlacklistedConsumer': BlacklistedConsumerSchema,
    'BlockchainSettings': BlockchainSettingsSchema,
    'Bot': BotSchema,
    'LocalMlDomain': LocalMlDomainSchema,
    'MlIntent': MlIntentSchema,
    'MlIntentUtterance': MlIntentUtteranceSchema,
    'MlRelatedIntent': MlRelatedIntentSchema,
    'MlSlotClass': MlSlotClassSchema,
    'MlSlotClassValue': MlSlotClassValueSchema,
    'SynonymGroup': SynonymGroupSchema,
    'BotVersion': BotVersionSchema,
    'BotDialogGroup': BotDialogGroupSchema,
    'BotDialog': BotDialogSchema,
    'BotStep': BotStepSchema,
    'BotInvocation': BotInvocationSchema,
    'BotInvocationMapping': BotInvocationMappingSchema,
    'BotMessage': BotMessageSchema,
    'BotNavigation': BotNavigationSchema,
    'BotNavigationLink': BotNavigationLinkSchema,
    'BotStepCondition': BotStepConditionSchema,
    'BotVariableOperation': BotVariableOperationSchema,
    'BotQuickReplyOption': BotQuickReplyOptionSchema,
    'BotVariableOperand': BotVariableOperandSchema,
    'ConversationRecordLookup': ConversationRecordLookupSchema,
    'ConversationRecordLookupCondition': ConversationRecordLookupConditionSchema,
    'ConversationRecordLookupField': ConversationRecordLookupFieldSchema,
    'ConversationDefinitionStepGoalMapping': ConversationDefinitionStepGoalMappingSchema,
    'ConversationSystemMessage': ConversationSystemMessageSchema,
    'ConversationSystemMessageMapping': ConversationSystemMessageMappingSchema,
    'ConversationDefinitionRichMessage': ConversationDefinitionRichMessageSchema,
    'ConversationDefinitionGoal': ConversationDefinitionGoalSchema,
    'ConversationSystemDialog': ConversationSystemDialogSchema,
    'ConversationVariable': ConversationVariableSchema,
    'ConversationDefinitionNlpProvider': ConversationDefinitionNlpProviderSchema,
    'ConversationContextVariable': ConversationContextVariableSchema,
    'ConversationContextVariableMapping': ConversationContextVariableMappingSchema,
    'ConversationDefinitionChannelProvider': ConversationDefinitionChannelProviderSchema,
    'BotBlock': BotBlockSchema,
    'BotBlockVersion': BotBlockVersionSchema,
    'BotSettings': BotSettingsSchema,
    'BotTemplate': BotTemplateSchema,
    'BrandingSet': BrandingSetSchema,
    'BrandingSetProperty': BrandingSetPropertySchema,
    'BriefcaseDefinition': BriefcaseDefinitionSchema,
    'BriefcaseRule': BriefcaseRuleSchema,
    'BriefcaseRuleFilter': BriefcaseRuleFilterSchema,
    'BusinessHoursEntry': BusinessHoursEntrySchema,
    'BusinessHoursSettings': BusinessHoursSettingsSchema,
    'Holiday': HolidaySchema,
    'BusinessProcess': BusinessProcessSchema,
    'PicklistValue': PicklistValueSchema,
    'BusinessProcessGroup': BusinessProcessGroupSchema,
    'BusinessProcessDefinition': BusinessProcessDefinitionSchema,
    'BusinessProcessFeedback': BusinessProcessFeedbackSchema,
    'BusinessProcessTypeDefinition': BusinessProcessTypeDefinitionSchema,
    'CMSConnectSource': CMSConnectSourceSchema,
    'CMSConnectAsset': CMSConnectAssetSchema,
    'CMSConnectLanguage': CMSConnectLanguageSchema,
    'CMSConnectPersonalization': CMSConnectPersonalizationSchema,
    'CMSConnectResourceType': CMSConnectResourceTypeSchema,
    'CMSConnectResourceDefinition': CMSConnectResourceDefinitionSchema,
    'CallCenter': CallCenterSchema,
    'ContactCenterChannel': ContactCenterChannelSchema,
    'CallCenterSection': CallCenterSectionSchema,
    'CallCenterItem': CallCenterItemSchema,
    'VendorCallCenterStatusMap': VendorCallCenterStatusMapSchema,
    'CallCenterRoutingMap': CallCenterRoutingMapSchema,
    'CallCoachingMediaProvider': CallCoachingMediaProviderSchema,
    'CallCtrAgentFavTrfrDest': CallCtrAgentFavTrfrDestSchema,
    'CampaignInfluenceModel': CampaignInfluenceModelSchema,
    'CampaignSettings': CampaignSettingsSchema,
    'CanvasMetadata': CanvasMetadataSchema,
    'CareBenefitVerifySettings': CareBenefitVerifySettingsSchema,
    'CareRequestConfiguration': CareRequestConfigurationSchema,
    'CareRequestRecords': CareRequestRecordsSchema,
    'CaseSettings': CaseSettingsSchema,
    'FeedItemSettings': FeedItemSettingsSchema,
    'EmailToCaseSettings': EmailToCaseSettingsSchema,
    'EmailToCaseRoutingAddress': EmailToCaseRoutingAddressSchema,
    'WebToCaseSettings': WebToCaseSettingsSchema,
    'CaseSubjectParticle': CaseSubjectParticleSchema,
    'ChannelLayout': ChannelLayoutSchema,
    'ChannelLayoutItem': ChannelLayoutItemSchema,
    'ChannelObjectLinkingRule': ChannelObjectLinkingRuleSchema,
    'ChatterAnswersSettings': ChatterAnswersSettingsSchema,
    'ChatterEmailsMDSettings': ChatterEmailsMDSettingsSchema,
    'ChatterExtension': ChatterExtensionSchema,
    'ChatterSettings': ChatterSettingsSchema,
    'CleanDataService': CleanDataServiceSchema,
    'CleanRule': CleanRuleSchema,
    'FieldMapping': FieldMappingSchema,
    'FieldMappingRow': FieldMappingRowSchema,
    'FieldMappingField': FieldMappingFieldSchema,
    'CommandAction': CommandActionSchema,
    'CommandActionIntent': CommandActionIntentSchema,
    'CommandActionResponse': CommandActionResponseSchema,
    'CommandActionParam': CommandActionParamSchema,
    'CommerceSettings': CommerceSettingsSchema,
    'CommunitiesSettings': CommunitiesSettingsSchema,
    'Community': CommunitySchema,
    'ReputationLevels': ReputationLevelsSchema,
    'ChatterAnswersReputationLevel': ChatterAnswersReputationLevelSchema,
    'IdeaReputationLevel': IdeaReputationLevelSchema,
    'CommunityTemplateDefinition': CommunityTemplateDefinitionSchema,
    'CommunityTemplateBundleInfo': CommunityTemplateBundleInfoSchema,
    'CommunityThemeBundleInfo': CommunityThemeBundleInfoSchema,
    'NavigationLinkSet': NavigationLinkSetSchema,
    'NavigationMenuItem': NavigationMenuItemSchema,
    'NavigationMenuItemBranding': NavigationMenuItemBrandingSchema,
    'NavigationSubMenu': NavigationSubMenuSchema,
    'CommunityTemplatePageSetting': CommunityTemplatePageSettingSchema,
    'CommunityThemeDefinition': CommunityThemeDefinitionSchema,
    'CommunityCustomThemeLayoutType': CommunityCustomThemeLayoutTypeSchema,
    'CommunityThemeRouteOverride': CommunityThemeRouteOverrideSchema,
    'CommunityThemeSetting': CommunityThemeSettingSchema,
    'CompactLayout': CompactLayoutSchema,
    'CompanySettings': CompanySettingsSchema,
    'FiscalYearSettings': FiscalYearSettingsSchema,
    'ConnectedApp': ConnectedAppSchema,
    'ConnectedAppAttribute': ConnectedAppAttributeSchema,
    'ConnectedAppCanvasConfig': ConnectedAppCanvasConfigSchema,
    'ConnectedAppIpRange': ConnectedAppIpRangeSchema,
    'ConnectedAppMobileDetailConfig': ConnectedAppMobileDetailConfigSchema,
    'ConnectedAppOauthConfig': ConnectedAppOauthConfigSchema,
    'ConnectedAppOauthAssetToken': ConnectedAppOauthAssetTokenSchema,
    'ConnectedAppOauthIdToken': ConnectedAppOauthIdTokenSchema,
    'ConnectedAppOauthPolicy': ConnectedAppOauthPolicySchema,
    'ConnectedAppSamlConfig': ConnectedAppSamlConfigSchema,
    'ConnectedAppSessionPolicy': ConnectedAppSessionPolicySchema,
    'ConnectedAppSettings': ConnectedAppSettingsSchema,
    'ContentSettings': ContentSettingsSchema,
    'ContractSettings': ContractSettingsSchema,
    'ConversationVendorInfo': ConversationVendorInfoSchema,
    'ConversationalIntelligenceSettings': ConversationalIntelligenceSettingsSchema,
    'CorsWhitelistOrigin': CorsWhitelistOriginSchema,
    'CspTrustedSite': CspTrustedSiteSchema,
    'CurrencySettings': CurrencySettingsSchema,
    'CustomAddressFieldSettings': CustomAddressFieldSettingsSchema,
    'CustomApplication': CustomApplicationSchema,
    'AppActionOverride': AppActionOverrideSchema,
    'ActionOverride': ActionOverrideSchema,
    'AppBrand': AppBrandSchema,
    'ServiceCloudConsoleConfig': ServiceCloudConsoleConfigSchema,
    'AppComponentList': AppComponentListSchema,
    'KeyboardShortcuts': KeyboardShortcutsSchema,
    'CustomShortcut': CustomShortcutSchema,
    'DefaultShortcut': DefaultShortcutSchema,
    'ListPlacement': ListPlacementSchema,
    'LiveAgentConfig': LiveAgentConfigSchema,
    'PushNotification': PushNotificationSchema,
    'TabLimitConfig': TabLimitConfigSchema,
    'AppPreferences': AppPreferencesSchema,
    'AppProfileActionOverride': AppProfileActionOverrideSchema,
    'ProfileActionOverride': ProfileActionOverrideSchema,
    'AppWorkspaceConfig': AppWorkspaceConfigSchema,
    'WorkspaceMapping': WorkspaceMappingSchema,
    'CustomApplicationComponent': CustomApplicationComponentSchema,
    'CustomFeedFilter': CustomFeedFilterSchema,
    'FeedFilterCriterion': FeedFilterCriterionSchema,
    'CustomField': CustomFieldSchema,
    'LookupFilter': LookupFilterSchema,
    'MktDataLakeFieldAttributes': MktDataLakeFieldAttributesSchema,
    'MktDataModelFieldAttributes': MktDataModelFieldAttributesSchema,
    'ValueSet': ValueSetSchema,
    'ValueSetValuesDefinition': ValueSetValuesDefinitionSchema,
    'CustomValue': CustomValueSchema,
    'StandardValue': StandardValueSchema,
    'ValueSettings': ValueSettingsSchema,
    'CustomHelpMenuSection': CustomHelpMenuSectionSchema,
    'CustomHelpMenuItem': CustomHelpMenuItemSchema,
    'CustomIndex': CustomIndexSchema,
    'CustomLabel': CustomLabelSchema,
    'CustomLabels': CustomLabelsSchema,
    'CustomMetadata': CustomMetadataSchema,
    'CustomMetadataValue': CustomMetadataValueSchema,
    'CustomNotificationType': CustomNotificationTypeSchema,
    'CustomObject': CustomObjectSchema,
    'ArticleTypeChannelDisplay': ArticleTypeChannelDisplaySchema,
    'ArticleTypeTemplate': ArticleTypeTemplateSchema,
    'FieldSet': FieldSetSchema,
    'FieldSetItem': FieldSetItemSchema,
    'HistoryRetentionPolicy': HistoryRetentionPolicySchema,
    'Index': IndexSchema,
    'IndexField': IndexFieldSchema,
    'ListView': ListViewSchema,
    'ListViewFilter': ListViewFilterSchema,
    'SharedTo': SharedToSchema,
    'MktDataLakeAttributes': MktDataLakeAttributesSchema,
    'MktDataModelAttributes': MktDataModelAttributesSchema,
    'ProfileSearchLayouts': ProfileSearchLayoutsSchema,
    'RecordType': RecordTypeSchema,
    'RecordTypePicklistValue': RecordTypePicklistValueSchema,
    'SearchLayouts': SearchLayoutsSchema,
    'SharingReason': SharingReasonSchema,
    'SharingRecalculation': SharingRecalculationSchema,
    'ValidationRule': ValidationRuleSchema,
    'WebLink': WebLinkSchema,
    'CustomObjectTranslation': CustomObjectTranslationSchema,
    'ObjectNameCaseValue': ObjectNameCaseValueSchema,
    'FieldSetTranslation': FieldSetTranslationSchema,
    'CustomFieldTranslation': CustomFieldTranslationSchema,
    'LookupFilterTranslation': LookupFilterTranslationSchema,
    'PicklistValueTranslation': PicklistValueTranslationSchema,
    'LayoutTranslation': LayoutTranslationSchema,
    'LayoutSectionTranslation': LayoutSectionTranslationSchema,
    'QuickActionTranslation': QuickActionTranslationSchema,
    'RecordTypeTranslation': RecordTypeTranslationSchema,
    'SharingReasonTranslation': SharingReasonTranslationSchema,
    'StandardFieldTranslation': StandardFieldTranslationSchema,
    'ValidationRuleTranslation': ValidationRuleTranslationSchema,
    'WebLinkTranslation': WebLinkTranslationSchema,
    'WorkflowTaskTranslation': WorkflowTaskTranslationSchema,
    'CustomPageWebLink': CustomPageWebLinkSchema,
    'CustomPermission': CustomPermissionSchema,
    'CustomPermissionDependencyRequired': CustomPermissionDependencyRequiredSchema,
    'CustomSite': CustomSiteSchema,
    'SiteWebAddress': SiteWebAddressSchema,
    'SiteIframeWhiteListUrl': SiteIframeWhiteListUrlSchema,
    'SiteRedirectMapping': SiteRedirectMappingSchema,
    'CustomTab': CustomTabSchema,
    'CustomerDataPlatformSettings': CustomerDataPlatformSettingsSchema,
    'CustomizablePropensityScoringSettings': CustomizablePropensityScoringSettingsSchema,
    'Dashboard': DashboardSchema,
    'DashboardFilter': DashboardFilterSchema,
    'DashboardFilterOption': DashboardFilterOptionSchema,
    'DashboardGridLayout': DashboardGridLayoutSchema,
    'DashboardGridComponent': DashboardGridComponentSchema,
    'DashboardComponent': DashboardComponentSchema,
    'ChartSummary': ChartSummarySchema,
    'DashboardDynamicValue': DashboardDynamicValueSchema,
    'DashboardFilterColumn': DashboardFilterColumnSchema,
    'DashboardTableColumn': DashboardTableColumnSchema,
    'DashboardFlexTableComponentProperties': DashboardFlexTableComponentPropertiesSchema,
    'DashboardComponentColumn': DashboardComponentColumnSchema,
    'DashboardComponentSortInfo': DashboardComponentSortInfoSchema,
    'DashboardComponentGroupingSortProperties': DashboardComponentGroupingSortPropertiesSchema,
    'DashboardComponentGroupingSort': DashboardComponentGroupingSortSchema,
    'DashboardComponentSection': DashboardComponentSectionSchema,
    'DataCategoryGroup': DataCategoryGroupSchema,
    'DataCategory': DataCategorySchema,
    'ObjectUsage': ObjectUsageSchema,
    'DataDotComSettings': DataDotComSettingsSchema,
    'PlatformEventSubscriberConfig': PlatformEventSubscriberConfigSchema,
    'SchedulingObjective': SchedulingObjectiveSchema,
    'SchedulingObjectiveParameter': SchedulingObjectiveParameterSchema,
    'PipelineInspMetricConfig': PipelineInspMetricConfigSchema,
    'VirtualVisitConfig': VirtualVisitConfigSchema,
    'MobileSecurityAssignment': MobileSecurityAssignmentSchema,
    'MobileSecurityPolicy': MobileSecurityPolicySchema,
    'RecordAlertDataSource': RecordAlertDataSourceSchema,
    'AppExplorationDataConsent': AppExplorationDataConsentSchema,
    'EmployeeDataSyncProfile': EmployeeDataSyncProfileSchema,
    'EmployeeDataSyncField': EmployeeDataSyncFieldSchema,
    'RegisteredExternalService': RegisteredExternalServiceSchema,
    'AccountingFieldMapping': AccountingFieldMappingSchema,
    'MobSecurityCertPinConfig': MobSecurityCertPinConfigSchema,
    'ActionableListDefinition': ActionableListDefinitionSchema,
    'ActionableListDatasetColumn': ActionableListDatasetColumnSchema,
    'ActionableListMemberStatus': ActionableListMemberStatusSchema,
    'CareProviderSearchConfig': CareProviderSearchConfigSchema,
    'CareSystemFieldMapping': CareSystemFieldMappingSchema,
    'CareLimitType': CareLimitTypeSchema,
    'SchedulingRule': SchedulingRuleSchema,
    'SchedulingRuleParameter': SchedulingRuleParameterSchema,
    'PortalDelegablePermissionSet': PortalDelegablePermissionSetSchema,
    'RelatedRecordAssocCriteria': RelatedRecordAssocCriteriaSchema,
    'PlatformSlackSettings': PlatformSlackSettingsSchema,
    'DataImportManagementSettings': DataImportManagementSettingsSchema,
    'WorkforceEngagementSettings': WorkforceEngagementSettingsSchema,
    'MailMergeSettings': MailMergeSettingsSchema,
    'AccountingSettings': AccountingSettingsSchema,
    'CollectionsDashboardSettings': CollectionsDashboardSettingsSchema,
    'InvLatePymntRiskCalcSettings': InvLatePymntRiskCalcSettingsSchema,
    'MediaAdSalesSettings': MediaAdSalesSettingsSchema,
    'BranchManagementSettings': BranchManagementSettingsSchema,
    'SandboxSettings': SandboxSettingsSchema,
    'InterestTaggingSettings': InterestTaggingSettingsSchema,
    'AssociationEngineSettings': AssociationEngineSettingsSchema,
    'PaymentsIngestEnabledSettings': PaymentsIngestEnabledSettingsSchema,
    'SourceTrackingSettings': SourceTrackingSettingsSchema,
    'OrgSettings': OrgSettingsSchema,
    'DevHubSettings': DevHubSettingsSchema,
    'IncludeEstTaxInQuoteSettings': IncludeEstTaxInQuoteSettingsSchema,
    'IndustriesLoyaltySettings': IndustriesLoyaltySettingsSchema,
    'PaymentsManagementEnabledSettings': PaymentsManagementEnabledSettingsSchema,
    'AppAnalyticsSettings': AppAnalyticsSettingsSchema,
    'MapsAndLocationSettings': MapsAndLocationSettingsSchema,
    'OnlineSalesSettings': OnlineSalesSettingsSchema,
    'DelegateGroup': DelegateGroupSchema,
    'DeploymentSettings': DeploymentSettingsSchema,
    'DigitalExperienceBundle': DigitalExperienceBundleSchema,
    'DigitalExperience': DigitalExperienceSchema,
    'MetadataWithContent': MetadataWithContentSchema,
    'ApexClass': ApexClassSchema,
    'ApexComponent': ApexComponentSchema,
    'ApexPage': ApexPageSchema,
    'ApexTrigger': ApexTriggerSchema,
    'Certificate': CertificateSchema,
    'ContentAsset': ContentAssetSchema,
    'ContentAssetRelationships': ContentAssetRelationshipsSchema,
    'ContentAssetLink': ContentAssetLinkSchema,
    'ContentAssetVersions': ContentAssetVersionsSchema,
    'ContentAssetVersion': ContentAssetVersionSchema,
    'DataWeaveResource': DataWeaveResourceSchema,
    'DiscoveryAIModel': DiscoveryAIModelSchema,
    'DiscoveryModelField': DiscoveryModelFieldSchema,
    'DiscoveryModelTransform': DiscoveryModelTransformSchema,
    'DiscoveryStory': DiscoveryStorySchema,
    'DiscoveryStoryOutcome': DiscoveryStoryOutcomeSchema,
    'Document': DocumentSchema,
    'EclairGeoData': EclairGeoDataSchema,
    'EclairMap': EclairMapSchema,
    'EmailTemplate': EmailTemplateSchema,
    'Attachment': AttachmentSchema,
    'FieldServiceMobileExtension': FieldServiceMobileExtensionSchema,
    'InboundCertificate': InboundCertificateSchema,
    'NetworkBranding': NetworkBrandingSchema,
    'Orchestration': OrchestrationSchema,
    'Scontrol': ScontrolSchema,
    'SiteDotCom': SiteDotComSchema,
    'StaticResource': StaticResourceSchema,
    'UiPlugin': UiPluginSchema,
    'UserAuthCertificate': UserAuthCertificateSchema,
    'WaveDashboard': WaveDashboardSchema,
    'WaveComponent': WaveComponentSchema,
    'WaveDataflow': WaveDataflowSchema,
    'WaveLens': WaveLensSchema,
    'WaveRecipe': WaveRecipeSchema,
    'DigitalExperienceConfig': DigitalExperienceConfigSchema,
    'Site': SiteSchema,
    'DiscoveryGoal': DiscoveryGoalSchema,
    'DiscoveryDeployedModel': DiscoveryDeployedModelSchema,
    'DiscoveryFieldMap': DiscoveryFieldMapSchema,
    'DiscoveryFilter': DiscoveryFilterSchema,
    'DiscoveryFilterValue': DiscoveryFilterValueSchema,
    'DiscoveryPrescribableField': DiscoveryPrescribableFieldSchema,
    'DiscoveryCustomPrescribableFieldDefinition': DiscoveryCustomPrescribableFieldDefinitionSchema,
    'DiscoveryModelCard': DiscoveryModelCardSchema,
    'DiscoveryGoalOutcome': DiscoveryGoalOutcomeSchema,
    'DiscoverySettings': DiscoverySettingsSchema,
    'DocumentChecklistSettings': DocumentChecklistSettingsSchema,
    'DocumentType': DocumentTypeSchema,
    'DuplicateRule': DuplicateRuleSchema,
    'DuplicateRuleFilter': DuplicateRuleFilterSchema,
    'DuplicateRuleMatchRule': DuplicateRuleMatchRuleSchema,
    'ObjectMapping': ObjectMappingSchema,
    'ObjectMappingField': ObjectMappingFieldSchema,
    'EACSettings': EACSettingsSchema,
    'EinsteinAgentSettings': EinsteinAgentSettingsSchema,
    'EinsteinAssistantSettings': EinsteinAssistantSettingsSchema,
    'EinsteinDealInsightsSettings': EinsteinDealInsightsSettingsSchema,
    'EinsteinDocumentCaptureSettings': EinsteinDocumentCaptureSettingsSchema,
    'EmailAdministrationSettings': EmailAdministrationSettingsSchema,
    'EmailIntegrationSettings': EmailIntegrationSettingsSchema,
    'EmailServicesFunction': EmailServicesFunctionSchema,
    'EmailServicesAddress': EmailServicesAddressSchema,
    'EmailTemplateSettings': EmailTemplateSettingsSchema,
    'EmbeddedServiceBranding': EmbeddedServiceBrandingSchema,
    'EmbeddedServiceConfig': EmbeddedServiceConfigSchema,
    'EmbeddedServiceAppointmentSettings': EmbeddedServiceAppointmentSettingsSchema,
    'EmbeddedServiceCustomComponent': EmbeddedServiceCustomComponentSchema,
    'EmbeddedServiceCustomLabel': EmbeddedServiceCustomLabelSchema,
    'EmbeddedServiceCustomization': EmbeddedServiceCustomizationSchema,
    'EmbeddedServiceResource': EmbeddedServiceResourceSchema,
    'EmbeddedServiceFlowConfig': EmbeddedServiceFlowConfigSchema,
    'EmbeddedServiceFlow': EmbeddedServiceFlowSchema,
    'EmbeddedServiceLayout': EmbeddedServiceLayoutSchema,
    'EmbeddedServiceLayoutRule': EmbeddedServiceLayoutRuleSchema,
    'EmbeddedServiceLiveAgent': EmbeddedServiceLiveAgentSchema,
    'EmbeddedServiceQuickAction': EmbeddedServiceQuickActionSchema,
    'EmbeddedServiceMenuSettings': EmbeddedServiceMenuSettingsSchema,
    'EmbeddedServiceMenuItem': EmbeddedServiceMenuItemSchema,
    'EmployeeFieldAccessSettings': EmployeeFieldAccessSettingsSchema,
    'EmployeeUserSettings': EmployeeUserSettingsSchema,
    'EncryptionKeySettings': EncryptionKeySettingsSchema,
    'EngagementMessagingSettings': EngagementMessagingSettingsSchema,
    'EnhancedNotesSettings': EnhancedNotesSettingsSchema,
    'EntitlementProcess': EntitlementProcessSchema,
    'EntitlementProcessMilestoneItem': EntitlementProcessMilestoneItemSchema,
    'EntitlementProcessMilestoneTimeTrigger': EntitlementProcessMilestoneTimeTriggerSchema,
    'EntitlementSettings': EntitlementSettingsSchema,
    'EntitlementTemplate': EntitlementTemplateSchema,
    'EntityImplements': EntityImplementsSchema,
    'FieldImplements': FieldImplementsSchema,
    'EscalationRule': EscalationRuleSchema,
    'EscalationRules': EscalationRulesSchema,
    'EssentialsSettings': EssentialsSettingsSchema,
    'EventRelayConfig': EventRelayConfigSchema,
    'EventSettings': EventSettingsSchema,
    'ExperienceBundle': ExperienceBundleSchema,
    'ExperienceResources': ExperienceResourcesSchema,
    'ExperienceResource': ExperienceResourceSchema,
    'ExperienceBundleSettings': ExperienceBundleSettingsSchema,
    'ExperiencePropertyKeyBundle': ExperiencePropertyKeyBundleSchema,
    'ExplainabilityActionDefinition': ExplainabilityActionDefinitionSchema,
    'ExplainabilityActionVersion': ExplainabilityActionVersionSchema,
    'ExternalClientAppSettings': ExternalClientAppSettingsSchema,
    'ExternalCredential': ExternalCredentialSchema,
    'ExternalCredentialParameter': ExternalCredentialParameterSchema,
    'ExternalDataSource': ExternalDataSourceSchema,
    'CustomHttpHeader': CustomHttpHeaderSchema,
    'ExternalDataSrcDescriptor': ExternalDataSrcDescriptorSchema,
    'ExternalServiceRegistration': ExternalServiceRegistrationSchema,
    'ExternalServiceOperation': ExternalServiceOperationSchema,
    'FieldRestrictionRule': FieldRestrictionRuleSchema,
    'FieldServiceSettings': FieldServiceSettingsSchema,
    'ObjectMappingItem': ObjectMappingItemSchema,
    'FileUploadAndDownloadSecuritySettings': FileUploadAndDownloadSecuritySettingsSchema,
    'FileTypeDispositionAssignmentBean': FileTypeDispositionAssignmentBeanSchema,
    'FilesConnectSettings': FilesConnectSettingsSchema,
    'FlexiPage': FlexiPageSchema,
    'FlexiPageEvent': FlexiPageEventSchema,
    'FlexiPageEventSourceProperty': FlexiPageEventSourcePropertySchema,
    'FlexiPageEventTarget': FlexiPageEventTargetSchema,
    'FlexiPageEventPropertyMapping': FlexiPageEventPropertyMappingSchema,
    'FlexiPageEventTargetProperty': FlexiPageEventTargetPropertySchema,
    'FlexiPageRegion': FlexiPageRegionSchema,
    'ItemInstance': ItemInstanceSchema,
    'ComponentInstance': ComponentInstanceSchema,
    'ComponentInstanceProperty': ComponentInstancePropertySchema,
    'ComponentInstancePropertyList': ComponentInstancePropertyListSchema,
    'ComponentInstancePropertyListItem': ComponentInstancePropertyListItemSchema,
    'UiFormulaRule': UiFormulaRuleSchema,
    'UiFormulaCriterion': UiFormulaCriterionSchema,
    'FieldInstance': FieldInstanceSchema,
    'FieldInstanceProperty': FieldInstancePropertySchema,
    'PlatformActionList': PlatformActionListSchema,
    'PlatformActionListItem': PlatformActionListItemSchema,
    'QuickActionList': QuickActionListSchema,
    'QuickActionListItem': QuickActionListItemSchema,
    'FlexiPageTemplateInstance': FlexiPageTemplateInstanceSchema,
    'Flow': FlowSchema,
    'FlowActionCall': FlowActionCallSchema,
    'FlowNode': FlowNodeSchema,
    'FlowElement': FlowElementSchema,
    'FlowBaseElement': FlowBaseElementSchema,
    'FlowMetadataValue': FlowMetadataValueSchema,
    'FlowElementReferenceOrValue': FlowElementReferenceOrValueSchema,
    'FlowActionCallInputParameter': FlowActionCallInputParameterSchema,
    'FlowActionCallOutputParameter': FlowActionCallOutputParameterSchema,
    'FlowApexPluginCallInputParameter': FlowApexPluginCallInputParameterSchema,
    'FlowApexPluginCallOutputParameter': FlowApexPluginCallOutputParameterSchema,
    'FlowAssignmentItem': FlowAssignmentItemSchema,
    'FlowChoiceUserInput': FlowChoiceUserInputSchema,
    'FlowInputValidationRule': FlowInputValidationRuleSchema,
    'FlowCollectionMapItem': FlowCollectionMapItemSchema,
    'FlowCollectionSortOption': FlowCollectionSortOptionSchema,
    'FlowCondition': FlowConditionSchema,
    'FlowConnector': FlowConnectorSchema,
    'FlowDataTypeMapping': FlowDataTypeMappingSchema,
    'FlowInputFieldAssignment': FlowInputFieldAssignmentSchema,
    'FlowOutputFieldAssignment': FlowOutputFieldAssignmentSchema,
    'FlowRecordFilter': FlowRecordFilterSchema,
    'FlowScreenFieldInputParameter': FlowScreenFieldInputParameterSchema,
    'FlowScreenFieldOutputParameter': FlowScreenFieldOutputParameterSchema,
    'FlowScreenRule': FlowScreenRuleSchema,
    'FlowScreenRuleAction': FlowScreenRuleActionSchema,
    'FlowStageStepAssignee': FlowStageStepAssigneeSchema,
    'FlowStageStepEntryActionInputParameter': FlowStageStepEntryActionInputParameterSchema,
    'FlowStageStepEntryActionOutputParameter': FlowStageStepEntryActionOutputParameterSchema,
    'FlowStageStepExitActionInputParameter': FlowStageStepExitActionInputParameterSchema,
    'FlowStageStepExitActionOutputParameter': FlowStageStepExitActionOutputParameterSchema,
    'FlowStageStepInputParameter': FlowStageStepInputParameterSchema,
    'FlowStageStepOutputParameter': FlowStageStepOutputParameterSchema,
    'FlowSubflowInputAssignment': FlowSubflowInputAssignmentSchema,
    'FlowSubflowOutputAssignment': FlowSubflowOutputAssignmentSchema,
    'FlowTransformValue': FlowTransformValueSchema,
    'FlowTransformValueAction': FlowTransformValueActionSchema,
    'FlowVisibilityRule': FlowVisibilityRuleSchema,
    'FlowWaitEventInputParameter': FlowWaitEventInputParameterSchema,
    'FlowWaitEventOutputParameter': FlowWaitEventOutputParameterSchema,
    'FlowChoice': FlowChoiceSchema,
    'FlowConstant': FlowConstantSchema,
    'FlowDynamicChoiceSet': FlowDynamicChoiceSetSchema,
    'FlowFormula': FlowFormulaSchema,
    'FlowRule': FlowRuleSchema,
    'FlowScheduledPath': FlowScheduledPathSchema,
    'FlowScreenField': FlowScreenFieldSchema,
    'FlowStage': FlowStageSchema,
    'FlowStageStep': FlowStageStepSchema,
    'FlowTextTemplate': FlowTextTemplateSchema,
    'FlowVariable': FlowVariableSchema,
    'FlowWaitEvent': FlowWaitEventSchema,
    'FlowApexPluginCall': FlowApexPluginCallSchema,
    'FlowAssignment': FlowAssignmentSchema,
    'FlowCollectionProcessor': FlowCollectionProcessorSchema,
    'FlowDecision': FlowDecisionSchema,
    'FlowLoop': FlowLoopSchema,
    'FlowOrchestratedStage': FlowOrchestratedStageSchema,
    'FlowRecordCreate': FlowRecordCreateSchema,
    'FlowRecordDelete': FlowRecordDeleteSchema,
    'FlowRecordLookup': FlowRecordLookupSchema,
    'FlowRecordRollback': FlowRecordRollbackSchema,
    'FlowRecordUpdate': FlowRecordUpdateSchema,
    'FlowScreen': FlowScreenSchema,
    'FlowStart': FlowStartSchema,
    'FlowSchedule': FlowScheduleSchema,
    'FlowStep': FlowStepSchema,
    'FlowSubflow': FlowSubflowSchema,
    'FlowTransform': FlowTransformSchema,
    'FlowWait': FlowWaitSchema,
    'FlowCategory': FlowCategorySchema,
    'FlowCategoryItems': FlowCategoryItemsSchema,
    'FlowDefinition': FlowDefinitionSchema,
    'FlowSettings': FlowSettingsSchema,
    'FlowTest': FlowTestSchema,
    'FlowTestPoint': FlowTestPointSchema,
    'FlowTestAssertion': FlowTestAssertionSchema,
    'FlowTestCondition': FlowTestConditionSchema,
    'FlowTestReferenceOrValue': FlowTestReferenceOrValueSchema,
    'FlowTestParameter': FlowTestParameterSchema,
    'Folder': FolderSchema,
    'FolderShare': FolderShareSchema,
    'DashboardFolder': DashboardFolderSchema,
    'DocumentFolder': DocumentFolderSchema,
    'EmailFolder': EmailFolderSchema,
    'EmailTemplateFolder': EmailTemplateFolderSchema,
    'ReportFolder': ReportFolderSchema,
    'ForecastingFilter': ForecastingFilterSchema,
    'ForecastingFilterCondition': ForecastingFilterConditionSchema,
    'ForecastingObjectListSettings': ForecastingObjectListSettingsSchema,
    'ForecastingTypeObjectListSettings': ForecastingTypeObjectListSettingsSchema,
    'ForecastingObjectListLabelMapping': ForecastingObjectListLabelMappingSchema,
    'ForecastingObjectListSelectedSettings': ForecastingObjectListSelectedSettingsSchema,
    'ForecastingObjectListUnselectedSettings': ForecastingObjectListUnselectedSettingsSchema,
    'ForecastingSettings': ForecastingSettingsSchema,
    'ForecastingCategoryMapping': ForecastingCategoryMappingSchema,
    'WeightedSourceCategory': WeightedSourceCategorySchema,
    'ForecastingDisplayedFamilySettings': ForecastingDisplayedFamilySettingsSchema,
    'ForecastingTypeSettings': ForecastingTypeSettingsSchema,
    'OpportunityListFieldsLabelMapping': OpportunityListFieldsLabelMappingSchema,
    'OpportunityListFieldsSelectedSettings': OpportunityListFieldsSelectedSettingsSchema,
    'OpportunityListFieldsUnselectedSettings': OpportunityListFieldsUnselectedSettingsSchema,
    'AdjustmentsSettings': AdjustmentsSettingsSchema,
    'ForecastRangeSettings': ForecastRangeSettingsSchema,
    'QuotasSettings': QuotasSettingsSchema,
    'ForecastingSourceDefinition': ForecastingSourceDefinitionSchema,
    'ForecastingType': ForecastingTypeSchema,
    'ForecastingTypeSource': ForecastingTypeSourceSchema,
    'FormulaSettings': FormulaSettingsSchema,
    'GatewayProviderPaymentMethodType': GatewayProviderPaymentMethodTypeSchema,
    'GlobalValueSet': GlobalValueSetSchema,
    'GlobalValueSetTranslation': GlobalValueSetTranslationSchema,
    'ValueTranslation': ValueTranslationSchema,
    'GoogleAppsSettings': GoogleAppsSettingsSchema,
    'Group': GroupSchema,
    'HighVelocitySalesSettings': HighVelocitySalesSettingsSchema,
    'HomePageComponent': HomePageComponentSchema,
    'HomePageLayout': HomePageLayoutSchema,
    'IPAddressRange': IPAddressRangeSchema,
    'IdeasSettings': IdeasSettingsSchema,
    'IdentityProviderSettings': IdentityProviderSettingsSchema,
    'IdentityVerificationProcDef': IdentityVerificationProcDefSchema,
    'IdentityVerificationProcDtl': IdentityVerificationProcDtlSchema,
    'IdentityVerificationProcFld': IdentityVerificationProcFldSchema,
    'IframeWhiteListUrlSettings': IframeWhiteListUrlSettingsSchema,
    'IframeWhiteListUrl': IframeWhiteListUrlSchema,
    'InboundNetworkConnection': InboundNetworkConnectionSchema,
    'InboundNetworkConnProperty': InboundNetworkConnPropertySchema,
    'IncidentMgmtSettings': IncidentMgmtSettingsSchema,
    'IndustriesAutomotiveSettings': IndustriesAutomotiveSettingsSchema,
    'IndustriesEinsteinFeatureSettings': IndustriesEinsteinFeatureSettingsSchema,
    'IndustriesManufacturingSettings': IndustriesManufacturingSettingsSchema,
    'IndustriesSettings': IndustriesSettingsSchema,
    'InstalledPackage': InstalledPackageSchema,
    'InventorySettings': InventorySettingsSchema,
    'InvocableActionSettings': InvocableActionSettingsSchema,
    'IoTSettings': IoTSettingsSchema,
    'KeywordList': KeywordListSchema,
    'Keyword': KeywordSchema,
    'KnowledgeSettings': KnowledgeSettingsSchema,
    'KnowledgeAnswerSettings': KnowledgeAnswerSettingsSchema,
    'KnowledgeCaseSettings': KnowledgeCaseSettingsSchema,
    'KnowledgeCommunitiesSettings': KnowledgeCommunitiesSettingsSchema,
    'KnowledgeSitesSettings': KnowledgeSitesSettingsSchema,
    'KnowledgeLanguageSettings': KnowledgeLanguageSettingsSchema,
    'KnowledgeLanguage': KnowledgeLanguageSchema,
    'KnowledgeSuggestedArticlesSettings': KnowledgeSuggestedArticlesSettingsSchema,
    'KnowledgeCaseFieldsSettings': KnowledgeCaseFieldsSettingsSchema,
    'KnowledgeCaseField': KnowledgeCaseFieldSchema,
    'KnowledgeWorkOrderFieldsSettings': KnowledgeWorkOrderFieldsSettingsSchema,
    'KnowledgeWorkOrderField': KnowledgeWorkOrderFieldSchema,
    'KnowledgeWorkOrderLineItemFieldsSettings': KnowledgeWorkOrderLineItemFieldsSettingsSchema,
    'KnowledgeWorkOrderLineItemField': KnowledgeWorkOrderLineItemFieldSchema,
    'LanguageSettings': LanguageSettingsSchema,
    'Layout': LayoutSchema,
    'CustomConsoleComponents': CustomConsoleComponentsSchema,
    'PrimaryTabComponents': PrimaryTabComponentsSchema,
    'Container': ContainerSchema,
    'SidebarComponent': SidebarComponentSchema,
    'RelatedList': RelatedListSchema,
    'SubtabComponents': SubtabComponentsSchema,
    'FeedLayout': FeedLayoutSchema,
    'FeedLayoutFilter': FeedLayoutFilterSchema,
    'FeedLayoutComponent': FeedLayoutComponentSchema,
    'LayoutSection': LayoutSectionSchema,
    'LayoutColumn': LayoutColumnSchema,
    'LayoutItem': LayoutItemSchema,
    'AnalyticsCloudComponentLayoutItem': AnalyticsCloudComponentLayoutItemSchema,
    'ReportChartComponentLayoutItem': ReportChartComponentLayoutItemSchema,
    'MiniLayout': MiniLayoutSchema,
    'RelatedListItem': RelatedListItemSchema,
    'RelatedContent': RelatedContentSchema,
    'RelatedContentItem': RelatedContentItemSchema,
    'SummaryLayout': SummaryLayoutSchema,
    'SummaryLayoutItem': SummaryLayoutItemSchema,
    'LeadConfigSettings': LeadConfigSettingsSchema,
    'LeadConvertSettings': LeadConvertSettingsSchema,
    'Letterhead': LetterheadSchema,
    'LetterheadLine': LetterheadLineSchema,
    'LetterheadHeaderFooter': LetterheadHeaderFooterSchema,
    'LicenseDefinition': LicenseDefinitionSchema,
    'LicensedCustomPermissions': LicensedCustomPermissionsSchema,
    'LightningBolt': LightningBoltSchema,
    'LightningBoltFeatures': LightningBoltFeaturesSchema,
    'LightningBoltImages': LightningBoltImagesSchema,
    'LightningBoltItems': LightningBoltItemsSchema,
    'LightningComponentBundle': LightningComponentBundleSchema,
    'Capabilities': CapabilitiesSchema,
    'LwcResources': LwcResourcesSchema,
    'LwcResource': LwcResourceSchema,
    'Targets': TargetsSchema,
    'LightningExperienceSettings': LightningExperienceSettingsSchema,
    'LightningExperienceTheme': LightningExperienceThemeSchema,
    'LightningMessageChannel': LightningMessageChannelSchema,
    'LightningMessageField': LightningMessageFieldSchema,
    'LightningOnboardingConfig': LightningOnboardingConfigSchema,
    'LiveAgentSettings': LiveAgentSettingsSchema,
    'LiveChatAgentConfig': LiveChatAgentConfigSchema,
    'AgentConfigAssignments': AgentConfigAssignmentsSchema,
    'AgentConfigProfileAssignments': AgentConfigProfileAssignmentsSchema,
    'AgentConfigUserAssignments': AgentConfigUserAssignmentsSchema,
    'SupervisorAgentConfigSkills': SupervisorAgentConfigSkillsSchema,
    'AgentConfigButtons': AgentConfigButtonsSchema,
    'AgentConfigSkills': AgentConfigSkillsSchema,
    'LiveChatButton': LiveChatButtonSchema,
    'LiveChatButtonDeployments': LiveChatButtonDeploymentsSchema,
    'LiveChatButtonSkills': LiveChatButtonSkillsSchema,
    'LiveChatDeployment': LiveChatDeploymentSchema,
    'LiveChatDeploymentDomainWhitelist': LiveChatDeploymentDomainWhitelistSchema,
    'LiveChatSensitiveDataRule': LiveChatSensitiveDataRuleSchema,
    'LiveMessageSettings': LiveMessageSettingsSchema,
    'MLDataDefinition': MLDataDefinitionSchema,
    'MLField': MLFieldSchema,
    'MLFilter': MLFilterSchema,
    'MLPredictionDefinition': MLPredictionDefinitionSchema,
    'MLRecommendationDefinition': MLRecommendationDefinitionSchema,
    'MacroSettings': MacroSettingsSchema,
    'ManagedContentType': ManagedContentTypeSchema,
    'ManagedContentNodeType': ManagedContentNodeTypeSchema,
    'ManagedTopic': ManagedTopicSchema,
    'ManagedTopics': ManagedTopicsSchema,
    'MarketingAppExtActivity': MarketingAppExtActivitySchema,
    'MarketingAppExtension': MarketingAppExtensionSchema,
    'MarketingAppExtAction': MarketingAppExtActionSchema,
    'MatchingRule': MatchingRuleSchema,
    'MatchingRuleItem': MatchingRuleItemSchema,
    'MatchingRules': MatchingRulesSchema,
    'MeetingsSettings': MeetingsSettingsSchema,
    'MessagingChannel': MessagingChannelSchema,
    'MessagingAutoResponse': MessagingAutoResponseSchema,
    'MessagingChannelCustomParameter': MessagingChannelCustomParameterSchema,
    'MessagingChannelActionParameterMapping': MessagingChannelActionParameterMappingSchema,
    'MessagingChannelStandardParameter': MessagingChannelStandardParameterSchema,
    'MfgServiceConsoleSettings': MfgServiceConsoleSettingsSchema,
    'MilestoneType': MilestoneTypeSchema,
    'MlDomain': MlDomainSchema,
    'MobileApplicationDetail': MobileApplicationDetailSchema,
    'MobileSettings': MobileSettingsSchema,
    'DashboardMobileSettings': DashboardMobileSettingsSchema,
    'ModerationRule': ModerationRuleSchema,
    'ModeratedEntityField': ModeratedEntityFieldSchema,
    'MyDomainDiscoverableLogin': MyDomainDiscoverableLoginSchema,
    'MyDomainSettings': MyDomainSettingsSchema,
    'NameSettings': NameSettingsSchema,
    'NamedCredential': NamedCredentialSchema,
    'NamedCredentialParameter': NamedCredentialParameterSchema,
    'NavigationMenu': NavigationMenuSchema,
    'Network': NetworkSchema,
    'CommunityRoles': CommunityRolesSchema,
    'NetworkMemberGroup': NetworkMemberGroupSchema,
    'NetworkPageOverride': NetworkPageOverrideSchema,
    'RecommendationAudience': RecommendationAudienceSchema,
    'RecommendationAudienceDetail': RecommendationAudienceDetailSchema,
    'RecommendationDefinition': RecommendationDefinitionSchema,
    'RecommendationDefinitionDetail': RecommendationDefinitionDetailSchema,
    'ScheduledRecommendation': ScheduledRecommendationSchema,
    'ScheduledRecommendationDetail': ScheduledRecommendationDetailSchema,
    'ReputationLevelDefinitions': ReputationLevelDefinitionsSchema,
    'ReputationLevel': ReputationLevelSchema,
    'ReputationBranding': ReputationBrandingSchema,
    'ReputationPointsRules': ReputationPointsRulesSchema,
    'ReputationPointsRule': ReputationPointsRuleSchema,
    'NetworkTabSet': NetworkTabSetSchema,
    'NotificationTypeConfig': NotificationTypeConfigSchema,
    'NotificationTypeSettings': NotificationTypeSettingsSchema,
    'AppSettings': AppSettingsSchema,
    'NotificationChannels': NotificationChannelsSchema,
    'NotificationsSettings': NotificationsSettingsSchema,
    'OauthCustomScope': OauthCustomScopeSchema,
    'OauthCustomScopeApp': OauthCustomScopeAppSchema,
    'OauthOidcSettings': OauthOidcSettingsSchema,
    'ObjectLinkingSettings': ObjectLinkingSettingsSchema,
    'OmniChannelSettings': OmniChannelSettingsSchema,
    'OmniDataTransform': OmniDataTransformSchema,
    'OmniDataTransformItem': OmniDataTransformItemSchema,
    'OmniIntegrationProcedure': OmniIntegrationProcedureSchema,
    'OmniProcessElement': OmniProcessElementSchema,
    'OmniScript': OmniScriptSchema,
    'OmniSupervisorConfig': OmniSupervisorConfigSchema,
    'OmniSupervisorConfigAction': OmniSupervisorConfigActionSchema,
    'OmniSupervisorConfigGroup': OmniSupervisorConfigGroupSchema,
    'OmniSupervisorConfigProfile': OmniSupervisorConfigProfileSchema,
    'OmniSupervisorConfigQueue': OmniSupervisorConfigQueueSchema,
    'OmniSupervisorConfigSkill': OmniSupervisorConfigSkillSchema,
    'OmniUiCard': OmniUiCardSchema,
    'OpportunityInsightsSettings': OpportunityInsightsSettingsSchema,
    'OpportunityScoreSettings': OpportunityScoreSettingsSchema,
    'OpportunitySettings': OpportunitySettingsSchema,
    'FindSimilarOppFilter': FindSimilarOppFilterSchema,
    'OrchestrationContext': OrchestrationContextSchema,
    'OrchestrationContextDataset': OrchestrationContextDatasetSchema,
    'OrchestrationContextEvent': OrchestrationContextEventSchema,
    'OrderManagementSettings': OrderManagementSettingsSchema,
    'OrderSettings': OrderSettingsSchema,
    'OutboundNetworkConnection': OutboundNetworkConnectionSchema,
    'OutboundNetworkConnProperty': OutboundNetworkConnPropertySchema,
    'Package': PackageSchema,
    'ProfileObjectPermissions': ProfileObjectPermissionsSchema,
    'PackageTypeMembers': PackageTypeMembersSchema,
    'PardotEinsteinSettings': PardotEinsteinSettingsSchema,
    'PardotSettings': PardotSettingsSchema,
    'ParticipantRole': ParticipantRoleSchema,
    'PartyDataModelSettings': PartyDataModelSettingsSchema,
    'PathAssistant': PathAssistantSchema,
    'PathAssistantStep': PathAssistantStepSchema,
    'PathAssistantSettings': PathAssistantSettingsSchema,
    'PaymentGatewayProvider': PaymentGatewayProviderSchema,
    'PaymentsSettings': PaymentsSettingsSchema,
    'PermissionSet': PermissionSetSchema,
    'PermissionSetApplicationVisibility': PermissionSetApplicationVisibilitySchema,
    'PermissionSetApexClassAccess': PermissionSetApexClassAccessSchema,
    'PermissionSetCustomMetadataTypeAccess': PermissionSetCustomMetadataTypeAccessSchema,
    'PermissionSetCustomPermissions': PermissionSetCustomPermissionsSchema,
    'PermissionSetCustomSettingAccess': PermissionSetCustomSettingAccessSchema,
    'PermissionSetExternalDataSourceAccess': PermissionSetExternalDataSourceAccessSchema,
    'PermissionSetFieldPermissions': PermissionSetFieldPermissionsSchema,
    'PermissionSetFlowAccess': PermissionSetFlowAccessSchema,
    'PermissionSetObjectPermissions': PermissionSetObjectPermissionsSchema,
    'PermissionSetApexPageAccess': PermissionSetApexPageAccessSchema,
    'PermissionSetRecordTypeVisibility': PermissionSetRecordTypeVisibilitySchema,
    'PermissionSetTabSetting': PermissionSetTabSettingSchema,
    'PermissionSetUserPermission': PermissionSetUserPermissionSchema,
    'MutingPermissionSet': MutingPermissionSetSchema,
    'PermissionSetGroup': PermissionSetGroupSchema,
    'PermissionSetLicenseDefinition': PermissionSetLicenseDefinitionSchema,
    'PermissionSetLicenseDefinitionCustomPermission': PermissionSetLicenseDefinitionCustomPermissionSchema,
    'PersonAccountOwnerPowerUser': PersonAccountOwnerPowerUserSchema,
    'PicklistSettings': PicklistSettingsSchema,
    'PlatformCachePartition': PlatformCachePartitionSchema,
    'PlatformCachePartitionType': PlatformCachePartitionTypeSchema,
    'PlatformEncryptionSettings': PlatformEncryptionSettingsSchema,
    'PlatformEventChannel': PlatformEventChannelSchema,
    'PlatformEventChannelMember': PlatformEventChannelMemberSchema,
    'EnrichedField': EnrichedFieldSchema,
    'Portal': PortalSchema,
    'PortalsSettings': PortalsSettingsSchema,
    'PostTemplate': PostTemplateSchema,
    'PredictionBuilderSettings': PredictionBuilderSettingsSchema,
    'PresenceDeclineReason': PresenceDeclineReasonSchema,
    'PresenceUserConfig': PresenceUserConfigSchema,
    'PresenceConfigAssignments': PresenceConfigAssignmentsSchema,
    'PresenceConfigProfileAssignments': PresenceConfigProfileAssignmentsSchema,
    'PresenceConfigUserAssignments': PresenceConfigUserAssignmentsSchema,
    'PrivacySettings': PrivacySettingsSchema,
    'ProductAttributeSet': ProductAttributeSetSchema,
    'ProductAttributeSetItem': ProductAttributeSetItemSchema,
    'ProductSettings': ProductSettingsSchema,
    'ProductSpecificationTypeDefinition': ProductSpecificationTypeDefinitionSchema,
    'Profile': ProfileSchema,
    'ProfileApplicationVisibility': ProfileApplicationVisibilitySchema,
    'ProfileCategoryGroupVisibility': ProfileCategoryGroupVisibilitySchema,
    'ProfileApexClassAccess': ProfileApexClassAccessSchema,
    'ProfileCustomMetadataTypeAccess': ProfileCustomMetadataTypeAccessSchema,
    'ProfileCustomPermissions': ProfileCustomPermissionsSchema,
    'ProfileCustomSettingAccess': ProfileCustomSettingAccessSchema,
    'ProfileExternalDataSourceAccess': ProfileExternalDataSourceAccessSchema,
    'ProfileFieldLevelSecurity': ProfileFieldLevelSecuritySchema,
    'ProfileFlowAccess': ProfileFlowAccessSchema,
    'ProfileLayoutAssignment': ProfileLayoutAssignmentSchema,
    'LoginFlow': LoginFlowSchema,
    'ProfileLoginHours': ProfileLoginHoursSchema,
    'ProfileLoginIpRange': ProfileLoginIpRangeSchema,
    'ProfileApexPageAccess': ProfileApexPageAccessSchema,
    'ProfileRecordTypeVisibility': ProfileRecordTypeVisibilitySchema,
    'ProfileTabVisibility': ProfileTabVisibilitySchema,
    'ProfileUserPermission': ProfileUserPermissionSchema,
    'ProfilePasswordPolicy': ProfilePasswordPolicySchema,
    'ProfileSessionSetting': ProfileSessionSettingSchema,
    'Prompt': PromptSchema,
    'PromptVersion': PromptVersionSchema,
    'Queue': QueueSchema,
    'QueueMembers': QueueMembersSchema,
    'PublicGroups': PublicGroupsSchema,
    'RoleAndSubordinates': RoleAndSubordinatesSchema,
    'RoleAndSubordinatesInternal': RoleAndSubordinatesInternalSchema,
    'Roles': RolesSchema,
    'Users': UsersSchema,
    'QueueSobject': QueueSobjectSchema,
    'QueueRoutingConfig': QueueRoutingConfigSchema,
    'QueueRoutingConfigSkill': QueueRoutingConfigSkillSchema,
    'QuickAction': QuickActionSchema,
    'FieldOverride': FieldOverrideSchema,
    'QuickActionLayout': QuickActionLayoutSchema,
    'QuickActionLayoutColumn': QuickActionLayoutColumnSchema,
    'QuickActionLayoutItem': QuickActionLayoutItemSchema,
    'QuickActionSendEmailOptions': QuickActionSendEmailOptionsSchema,
    'QuickTextSettings': QuickTextSettingsSchema,
    'QuoteSettings': QuoteSettingsSchema,
    'RealTimeEventSettings': RealTimeEventSettingsSchema,
    'RealTimeEvent': RealTimeEventSchema,
    'RecommendationBuilderSettings': RecommendationBuilderSettingsSchema,
    'RecommendationStrategy': RecommendationStrategySchema,
    'StrategyAction': StrategyActionSchema,
    'StrategyActionArg': StrategyActionArgSchema,
    'StrategyNodeFilter': StrategyNodeFilterSchema,
    'StrategyNodeUnionBase': StrategyNodeUnionBaseSchema,
    'StrategyNodeBase': StrategyNodeBaseSchema,
    'StrategyNodeAiLoad': StrategyNodeAiLoadSchema,
    'StrategyNodeAiSort': StrategyNodeAiSortSchema,
    'StrategyNodeExclusive': StrategyNodeExclusiveSchema,
    'StrategyNodeIf': StrategyNodeIfSchema,
    'IfExpression': IfExpressionSchema,
    'StrategyNodeInvocableAction': StrategyNodeInvocableActionSchema,
    'StrategyNodeInvocableActionArg': StrategyNodeInvocableActionArgSchema,
    'StrategyNodeMap': StrategyNodeMapSchema,
    'MapExpression': MapExpressionSchema,
    'StrategyNodeRecommendationLimit': StrategyNodeRecommendationLimitSchema,
    'StrategyNodeRecommendationLoad': StrategyNodeRecommendationLoadSchema,
    'RecommendationLoadCondition': RecommendationLoadConditionSchema,
    'RecommendationConditionValue': RecommendationConditionValueSchema,
    'StrategyNodeSortField': StrategyNodeSortFieldSchema,
    'StrategyNodeSort': StrategyNodeSortSchema,
    'StrategyNodeUnion': StrategyNodeUnionSchema,
    'RecordActionDeployment': RecordActionDeploymentSchema,
    'RecordActionDeploymentChannel': RecordActionDeploymentChannelSchema,
    'RecordActionDefaultItem': RecordActionDefaultItemSchema,
    'RecordActionDeploymentContext': RecordActionDeploymentContextSchema,
    'RecordActionRecommendation': RecordActionRecommendationSchema,
    'RecordActionSelectableItem': RecordActionSelectableItemSchema,
    'RecordAlertCategory': RecordAlertCategorySchema,
    'RecordPageSettings': RecordPageSettingsSchema,
    'RedirectWhitelistUrl': RedirectWhitelistUrlSchema,
    'ReferencedDashboard': ReferencedDashboardSchema,
    'RelationshipGraphDefinition': RelationshipGraphDefinitionSchema,
    'RelationshipGraphDefVersion': RelationshipGraphDefVersionSchema,
    'RemoteSiteSetting': RemoteSiteSettingSchema,
    'Report': ReportSchema,
    'ReportAggregate': ReportAggregateSchema,
    'ReportBlockInfo': ReportBlockInfoSchema,
    'ReportAggregateReference': ReportAggregateReferenceSchema,
    'ReportBucketField': ReportBucketFieldSchema,
    'ReportBucketFieldValue': ReportBucketFieldValueSchema,
    'ReportBucketFieldSourceValue': ReportBucketFieldSourceValueSchema,
    'ReportChart': ReportChartSchema,
    'ReportColorRange': ReportColorRangeSchema,
    'ReportColumn': ReportColumnSchema,
    'ReportCrossFilter': ReportCrossFilterSchema,
    'ReportFilterItem': ReportFilterItemSchema,
    'ReportCustomDetailFormula': ReportCustomDetailFormulaSchema,
    'ReportDataCategoryFilter': ReportDataCategoryFilterSchema,
    'ReportFilter': ReportFilterSchema,
    'ReportFormattingRule': ReportFormattingRuleSchema,
    'ReportFormattingRuleValue': ReportFormattingRuleValueSchema,
    'ReportGrouping': ReportGroupingSchema,
    'ReportHistoricalSelector': ReportHistoricalSelectorSchema,
    'ReportParam': ReportParamSchema,
    'ReportTimeFrameFilter': ReportTimeFrameFilterSchema,
    'ReportType': ReportTypeSchema,
    'ObjectRelationship': ObjectRelationshipSchema,
    'ReportLayoutSection': ReportLayoutSectionSchema,
    'ReportTypeColumn': ReportTypeColumnSchema,
    'RestrictionRule': RestrictionRuleSchema,
    'RetailExecutionSettings': RetailExecutionSettingsSchema,
    'RoleOrTerritory': RoleOrTerritorySchema,
    'Role': RoleSchema,
    'Territory': TerritorySchema,
    'SalesWorkQueueSettings': SalesWorkQueueSettingsSchema,
    'SamlSsoConfig': SamlSsoConfigSchema,
    'SchemaSettings': SchemaSettingsSchema,
    'SearchCustomization': SearchCustomizationSchema,
    'SearchSettings': SearchSettingsSchema,
    'SearchSettingsByObject': SearchSettingsByObjectSchema,
    'ObjectSearchSetting': ObjectSearchSettingSchema,
    'SecuritySettings': SecuritySettingsSchema,
    'NetworkAccess': NetworkAccessSchema,
    'IpRange': IpRangeSchema,
    'PasswordPolicies': PasswordPoliciesSchema,
    'SessionSettings': SessionSettingsSchema,
    'SingleSignOnSettings': SingleSignOnSettingsSchema,
    'ServiceAISetupDefinition': ServiceAISetupDefinitionSchema,
    'ServiceAISetupField': ServiceAISetupFieldSchema,
    'ServiceChannel': ServiceChannelSchema,
    'ServiceChannelFieldPriority': ServiceChannelFieldPrioritySchema,
    'ServiceCloudVoiceSettings': ServiceCloudVoiceSettingsSchema,
    'ServicePresenceStatus': ServicePresenceStatusSchema,
    'ServiceChannelStatus': ServiceChannelStatusSchema,
    'ServiceSetupAssistantSettings': ServiceSetupAssistantSettingsSchema,
    'SharingBaseRule': SharingBaseRuleSchema,
    'AccountSharingRuleSettings': AccountSharingRuleSettingsSchema,
    'SharingCriteriaRule': SharingCriteriaRuleSchema,
    'SharingGuestRule': SharingGuestRuleSchema,
    'SharingOwnerRule': SharingOwnerRuleSchema,
    'SharingTerritoryRule': SharingTerritoryRuleSchema,
    'SharingRules': SharingRulesSchema,
    'SharingSet': SharingSetSchema,
    'AccessMapping': AccessMappingSchema,
    'SharingSettings': SharingSettingsSchema,
    'SiteSettings': SiteSettingsSchema,
    'Skill': SkillSchema,
    'SkillAssignments': SkillAssignmentsSchema,
    'SkillProfileAssignments': SkillProfileAssignmentsSchema,
    'SkillUserAssignments': SkillUserAssignmentsSchema,
    'SocialCustomerServiceSettings': SocialCustomerServiceSettingsSchema,
    'SocialProfileSettings': SocialProfileSettingsSchema,
    'StandardValueSet': StandardValueSetSchema,
    'StandardValueSetTranslation': StandardValueSetTranslationSchema,
    'SubscriptionManagementSettings': SubscriptionManagementSettingsSchema,
    'SurveySettings': SurveySettingsSchema,
    'SvcCatalogCategory': SvcCatalogCategorySchema,
    'SvcCatalogFulfillmentFlow': SvcCatalogFulfillmentFlowSchema,
    'SvcCatalogFulfillFlowItem': SvcCatalogFulfillFlowItemSchema,
    'SynonymDictionary': SynonymDictionarySchema,
    'SystemNotificationSettings': SystemNotificationSettingsSchema,
    'Territory2': Territory2Schema,
    'FieldValue': FieldValueSchema,
    'Territory2AccessLevel': Territory2AccessLevelSchema,
    'Territory2RuleAssociation': Territory2RuleAssociationSchema,
    'Territory2Model': Territory2ModelSchema,
    'Territory2Rule': Territory2RuleSchema,
    'Territory2RuleItem': Territory2RuleItemSchema,
    'Territory2Settings': Territory2SettingsSchema,
    'Territory2SettingsOpportunityFilter': Territory2SettingsOpportunityFilterSchema,
    'Territory2SupportedObject': Territory2SupportedObjectSchema,
    'Territory2Type': Territory2TypeSchema,
    'TimeSheetTemplate': TimeSheetTemplateSchema,
    'TimeSheetTemplateAssignment': TimeSheetTemplateAssignmentSchema,
    'TimelineObjectDefinition': TimelineObjectDefinitionSchema,
    'TopicsForObjects': TopicsForObjectsSchema,
    'TrailheadSettings': TrailheadSettingsSchema,
    'TransactionSecurityPolicy': TransactionSecurityPolicySchema,
    'TransactionSecurityAction': TransactionSecurityActionSchema,
    'TransactionSecurityNotification': TransactionSecurityNotificationSchema,
    'Translations': TranslationsSchema,
    'BotTranslation': BotTranslationSchema,
    'BotVersionTranslation': BotVersionTranslationSchema,
    'BotDialogTranslation': BotDialogTranslationSchema,
    'BotStepTranslation': BotStepTranslationSchema,
    'BotMessageTranslation': BotMessageTranslationSchema,
    'BotVariableOperationTranslation': BotVariableOperationTranslationSchema,
    'BotQuickReplyOptionTranslation': BotQuickReplyOptionTranslationSchema,
    'CustomApplicationTranslation': CustomApplicationTranslationSchema,
    'CustomLabelTranslation': CustomLabelTranslationSchema,
    'CustomPageWebLinkTranslation': CustomPageWebLinkTranslationSchema,
    'CustomTabTranslation': CustomTabTranslationSchema,
    'ExplainabilityMsgTemplateFieldTranslation': ExplainabilityMsgTemplateFieldTranslationSchema,
    'FlowDefinitionTranslation': FlowDefinitionTranslationSchema,
    'FlowTranslation': FlowTranslationSchema,
    'FlowChoiceTranslation': FlowChoiceTranslationSchema,
    'FlowChoiceUserInputTranslation': FlowChoiceUserInputTranslationSchema,
    'FlowInputValidationRuleTranslation': FlowInputValidationRuleTranslationSchema,
    'FlowScreenTranslation': FlowScreenTranslationSchema,
    'FlowScreenFieldTranslation': FlowScreenFieldTranslationSchema,
    'FlowInputParameterTranslation': FlowInputParameterTranslationSchema,
    'FlowFerovTranslation': FlowFerovTranslationSchema,
    'FlowComplexLiteralTranslation': FlowComplexLiteralTranslationSchema,
    'FlowStageTranslation': FlowStageTranslationSchema,
    'FlowTextTemplateTranslation': FlowTextTemplateTranslationSchema,
    'IdentityVerificationFieldTranslation': IdentityVerificationFieldTranslationSchema,
    'PipelineInspMetricConfigTranslation': PipelineInspMetricConfigTranslationSchema,
    'PromptTranslation': PromptTranslationSchema,
    'PromptVersionTranslation': PromptVersionTranslationSchema,
    'GlobalQuickActionTranslation': GlobalQuickActionTranslationSchema,
    'ReportTypeTranslation': ReportTypeTranslationSchema,
    'ReportTypeSectionTranslation': ReportTypeSectionTranslationSchema,
    'ReportTypeColumnTranslation': ReportTypeColumnTranslationSchema,
    'ScontrolTranslation': ScontrolTranslationSchema,
    'TrialOrgSettings': TrialOrgSettingsSchema,
    'UIObjectRelationConfig': UIObjectRelationConfigSchema,
    'UIObjectRelationFieldConfig': UIObjectRelationFieldConfigSchema,
    'UserCriteria': UserCriteriaSchema,
    'UserEngagementSettings': UserEngagementSettingsSchema,
    'UserInterfaceSettings': UserInterfaceSettingsSchema,
    'UserManagementSettings': UserManagementSettingsSchema,
    'UserProfileSearchScope': UserProfileSearchScopeSchema,
    'UserProvisioningConfig': UserProvisioningConfigSchema,
    'VoiceSettings': VoiceSettingsSchema,
    'WarrantyLifecycleMgmtSettings': WarrantyLifecycleMgmtSettingsSchema,
    'WaveApplication': WaveApplicationSchema,
    'WaveDataset': WaveDatasetSchema,
    'WaveTemplateBundle': WaveTemplateBundleSchema,
    'WaveXmd': WaveXmdSchema,
    'WaveXmdDate': WaveXmdDateSchema,
    'WaveXmdDimension': WaveXmdDimensionSchema,
    'WaveXmdFormattingProperty': WaveXmdFormattingPropertySchema,
    'WaveXmdFormattingBin': WaveXmdFormattingBinSchema,
    'WaveXmdFormattingPredicate': WaveXmdFormattingPredicateSchema,
    'WaveXmdDimensionCustomAction': WaveXmdDimensionCustomActionSchema,
    'WaveXmdDimensionMember': WaveXmdDimensionMemberSchema,
    'WaveXmdRecordDisplayLookup': WaveXmdRecordDisplayLookupSchema,
    'WaveXmdDimensionSalesforceAction': WaveXmdDimensionSalesforceActionSchema,
    'WaveXmdMeasure': WaveXmdMeasureSchema,
    'WaveXmdOrganization': WaveXmdOrganizationSchema,
    'WebStoreTemplate': WebStoreTemplateSchema,
    'WebToXSettings': WebToXSettingsSchema,
    'WorkDotComSettings': WorkDotComSettingsSchema,
    'Workflow': WorkflowSchema,
    'WorkflowAlert': WorkflowAlertSchema,
    'WorkflowAction': WorkflowActionSchema,
    'WorkflowFieldUpdate': WorkflowFieldUpdateSchema,
    'WorkflowFlowAction': WorkflowFlowActionSchema,
    'WorkflowFlowActionParameter': WorkflowFlowActionParameterSchema,
    'WorkflowKnowledgePublish': WorkflowKnowledgePublishSchema,
    'WorkflowOutboundMessage': WorkflowOutboundMessageSchema,
    'WorkflowSend': WorkflowSendSchema,
    'WorkflowTask': WorkflowTaskSchema,
    'WorkflowEmailRecipient': WorkflowEmailRecipientSchema,
    'WorkflowRule': WorkflowRuleSchema,
    'WorkflowTimeTrigger': WorkflowTimeTriggerSchema,
    'SaveResult': SaveResultSchema,
    'Error': ErrorSchema,
    'ExtendedErrorDetails': ExtendedErrorDetailsSchema,
    'DeleteResult': DeleteResultSchema,
    'DeployOptions': DeployOptionsSchema,
    'AsyncResult': AsyncResultSchema,
    'DescribeMetadataResult': DescribeMetadataResultSchema,
    'DescribeMetadataObject': DescribeMetadataObjectSchema,
    'DescribeValueTypeResult': DescribeValueTypeResultSchema,
    'ValueTypeField': ValueTypeFieldSchema,
    'PicklistEntry': PicklistEntrySchema,
    'ListMetadataQuery': ListMetadataQuerySchema,
    'ReadResult': ReadResultSchema,
    'RetrieveRequest': RetrieveRequestSchema,
    'UpsertResult': UpsertResultSchema,
    'LogInfo': LogInfoSchema,
} as any;

export const Operations: Record<string, Operation | undefined> = {
    'cancelDeploy': {		
        name: 'cancelDeploy', 
        description: 'Cancels a metadata deploy.', 
        request: CancelDeploySchema, 
        response: CancelDeployResponseSchema, 
    },
    'checkDeployStatus': {		
        name: 'checkDeployStatus', 
        description: 'Check the current status of an asyncronous deploy call.', 
        request: CheckDeployStatusSchema, 
        response: CheckDeployStatusResponseSchema, 
    },
    'checkRetrieveStatus': {		
        name: 'checkRetrieveStatus', 
        description: 'Check the current status of an asyncronous deploy call.', 
        request: CheckRetrieveStatusSchema, 
        response: CheckRetrieveStatusResponseSchema, 
    },
    'createMetadata': {		
        name: 'createMetadata', 
        description: 'Creates metadata entries synchronously.', 
        request: CreateMetadataSchema, 
        response: CreateMetadataResponseSchema, 
    },
    'deleteMetadata': {		
        name: 'deleteMetadata', 
        description: 'Deletes metadata entries synchronously.', 
        request: DeleteMetadataSchema, 
        response: DeleteMetadataResponseSchema, 
    },
    'deploy': {		
        name: 'deploy', 
        description: 'Deploys a zipfile full of metadata entries asynchronously.', 
        request: DeploySchema, 
        response: DeployResponseSchema, 
    },
    'deployRecentValidation': {		
        name: 'deployRecentValidation', 
        description: 'Deploys a previously validated payload without running tests.', 
        request: DeployRecentValidationSchema, 
        response: DeployRecentValidationResponseSchema, 
    },
    'describeMetadata': {		
        name: 'describeMetadata', 
        description: 'Describes features of the metadata API.', 
        request: DescribeMetadataSchema, 
        response: DescribeMetadataResponseSchema, 
    },
    'describeValueType': {		
        name: 'describeValueType', 
        description: 'Describe a complex value type', 
        request: DescribeValueTypeSchema, 
        response: DescribeValueTypeResponseSchema, 
    },
    'listMetadata': {		
        name: 'listMetadata', 
        description: 'Lists the available metadata components.', 
        request: ListMetadataSchema, 
        response: ListMetadataResponseSchema, 
    },
    'readMetadata': {		
        name: 'readMetadata', 
        description: 'Reads metadata entries synchronously.', 
        request: ReadMetadataSchema, 
        response: ReadMetadataResponseSchema, 
    },
    'renameMetadata': {		
        name: 'renameMetadata', 
        description: 'Renames a metadata entry synchronously.', 
        request: RenameMetadataSchema, 
        response: RenameMetadataResponseSchema, 
    },
    'retrieve': {		
        name: 'retrieve', 
        description: 'Retrieves a set of individually specified metadata entries.', 
        request: RetrieveSchema, 
        response: RetrieveResponseSchema, 
    },
    'updateMetadata': {		
        name: 'updateMetadata', 
        description: 'Updates metadata entries synchronously.', 
        request: UpdateMetadataSchema, 
        response: UpdateMetadataResponseSchema, 
    },
    'upsertMetadata': {		
        name: 'upsertMetadata', 
        description: 'Upserts metadata entries synchronously.', 
        request: UpsertMetadataSchema, 
        response: UpsertMetadataResponseSchema, 
    },
} as any;

// Link schemas
for(const schema of Object.values(Schemas) as any[]) {
    if (typeof schema.extends === 'string') {
        schema.extends = Schemas[schema.extends];
    }
    for (const field of Object.values(schema.fields) as any[]) {
        if (typeof field.type === 'string' && Schemas[field.type]) {
            field.type = Schemas[field.type];
        }
    }
}
