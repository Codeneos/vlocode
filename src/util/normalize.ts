/**
 * Normalizes a Salesforce field or class name by removing the namespace prefix, dropping the __c postfix and replacing
 * any underscores in the middle of the name.
 */
export function normalizeSalesforceName(name: string) : string {
    let strippedName = name.replace(/(^.*?__)?(.*?)(__(c|r)$)/gi, '$2');
    strippedName = strippedName.substring(0,1).toLowerCase() + strippedName.substring(1);
    // Some salesforce names as already in lower camel case; only convert the ones that use underscores
    if (/[\W_]+/.test(strippedName)) {
        strippedName = normalizeName(strippedName);
    }
    // ensure we keep the __r for relationship fields
    // or whne the relationship field has an id postfix
    if (name.toLowerCase().endsWith('id__r')) {
        return strippedName.replace(/id$/i, '');
    } else if (name.toLowerCase().endsWith('__r')) {
        strippedName += '__r';
    }
    return strippedName;
}

/**
 * Normalizes a name to a valid js property by replacing any special characters and changing the name to lower camel case:
 * For example: OM_Rule -> omRule, Xml-parser -> xmlParser, my named prop -> myNamedProp
 * @param name name ot normalize
 */
export function normalizeName(name: string) : string {
    let normalized = '';
    let nextUpper = false;
    for (const char of Array.from(name.trim())) {
        if (' _-'.includes(char) && normalized.length > 0) {
            nextUpper = true;
        } else if (/\W+/.test(char)) {
            // Skip any other special character
            continue;
        } else if(nextUpper) {
            normalized += char.toUpperCase();
            nextUpper = false;
        } else {
            normalized += char.toLowerCase();
        } 
    }
    return normalized;
}