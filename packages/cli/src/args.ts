import { statSync } from 'fs';

export async function parseExistingPath(value: string) {
    try {
        statSync(value);
        return value;
    } catch {
        throw new Error(`No such file or directory exists: ${value}`);
    }
}

export async function parseExistingDirectory(value: string) {
    let stats;

    try {
        stats = statSync(value);
    } catch {
        throw new Error(`No such folder exists: ${value}`);
    }

    if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${value}`);
    }

    return value;
}
