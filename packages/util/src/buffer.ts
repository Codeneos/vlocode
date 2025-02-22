/**
 * Checks if a given Buffer contains a specified string in a case-insensitive manner.
 *
 * @param data - The Buffer to search within.
 * @param search - The string to search for within the Buffer.
 * @returns `true` if the Buffer contains the specified string (case-insensitive), otherwise `false`.
 */
export function bufferIndexOfCaseInsensitive(data: Buffer, search: string): number {
    const searchLower = search.toLowerCase();
    const searchLength = searchLower.length;
    const dataLength = data.length;

    if (dataLength < searchLength) {
        return -1;
    }

    // Iterate through each possible starting position.
    for (let i = 0; i <= dataLength - searchLength; i++) {
        let found = true;
        for (let j = 0; j < searchLength; j++) {
            let charCode = data[i + j];
            // Convert uppercase ASCII (A-Z) to lowercase.
            if (charCode >= 65 && charCode <= 90) {
                charCode += 32;
            }
            if (charCode !== searchLower.charCodeAt(j)) {
                found = false;
                break;
            }
        }
        if (found) {
            return i;
        }
    }
    return -1;
}