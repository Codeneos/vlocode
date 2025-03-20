/**
 * This file contains definitions for Tooling API objects
 */
import type { ManageableState } from "../connection";

export interface LightningComponentBundle {
    ApiVersion: number;
    Description?: string;
    DeveloperName: string;
    FullName?: string;
    Id: string;
    Language: string;
    IsExposed?: boolean;
    IsExplicitImport?: boolean;
    MasterLabel: string;
    NamespacePrefix?: string;
    ManageableState: ManageableState
    RuntimeNamespace?: string;
    TargetConfigs?: string;
}