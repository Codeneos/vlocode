import { DatapackFields } from "@vlocode/vlocity";

export const NAMESPACE_PLACEHOLDER = '%vlocity_namespace%';
export const NAMESPACE_PLACEHOLDER_PATTERN = /vlocity_namespace|%vlocity_namespace%|{vlocity_namespace}/gi;

export const DATAPACK_RESERVED_FIELDS = Object.values<string>(DatapackFields);