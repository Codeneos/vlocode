import * as fs from 'fs-extra';
import * as path from 'path';
import { resolveRef as gitResolveRef, currentBranch, TREE, walk } from 'isomorphic-git';

export namespace git {
    type GitFileChange = 'add' | 'remove' | 'modify';
    type PathLookup = {
        filePaths: Set<string>;
        directoryPrefixes: string[];
    };

    /**
     * Determines whether the specified directory is a Git repository by checking for the existence
     * of the `.git/index` file within the directory.
     *
     * @param dir - The path to the directory to check.
     * @returns `true` if the directory contains a `.git/index` file, indicating it is a Git repository; otherwise, `false`.
     */
    export function isGitRepository(dir: string): boolean {
        const gitIndexFile = path.join(dir, '.git', 'index');
        return fs.existsSync(gitIndexFile);
    }   

    /**
     * Returns the root directory of the Git repository containing the specified file.
     *
     * @param files - The path to a file or directory within the Git repository.
     * @returns The absolute path to the root of the Git repository.
     */
    export function gitRoot(files: string | string[]): string;
    export function gitRoot(files: string | string[], singleRoot: true): string;
    export function gitRoot(files: string | string[], singleRoot: false): string[];
    export function gitRoot(files: string | string[], singleRoot?: boolean): string | string[] {
        if (typeof files === 'string') {
            files = [ files ];
        }
        const gitRoots = new Set(files.map(e => resolveRootFolder(e)).filter(f => f)) as Set<string>;
        if (singleRoot !== false && gitRoots.size !== 1) {
            throw new Error('Multiple git roots found, please specify a single root');
        } else if (gitRoots.size === 0) {
            throw new Error('None of the specified folders are part of a git repository: ' + files.join(', '));
        }
        return singleRoot !== false ? [...gitRoots][0] : [...gitRoots];
    }
    
    /**
     * Tries to resolve the root repository folder containing the .git folder and index file
     * @param dir staring folder
     * @returns root folder
     */
    function resolveRootFolder(dir: string): string | undefined {
        dir = path.resolve(dir);
        while (true) {
            const gitIndexFile = path.join(dir, '.git', 'index');
            if (fs.existsSync(gitIndexFile)) {
                return dir;
            }
            const parentDir = path.resolve(dir, '..');
            if (parentDir === dir) {
                return;
            }
            dir = parentDir;
        }
    }

    /**
     * Get the HEAD revision reference as SHA-1 hash.
     * @param dir Folder for which to get the ref.
     * @returns SHA-1 hash
     */
    export function headRevision(dir: string | string[]) {
        return resolveRef(dir, 'HEAD');
    }

    /**
     * Resolves a Git reference to its commit hash.
     *
     * @param dir - The directory path where the Git repository is located.
     * @param ref - The Git reference to resolve.
     * @returns The commit hash of the resolved Git reference.
     */
    export function resolveRef(dir: string | string[], ref: string): Promise<string> {
        return gitResolveRef({ fs, dir: gitRoot(dir), ref });
    }

    /**
     * Get current branch name
     * @param dir Folder for which to get the branch name.
     * @returns branch name
     */
    export function branchName(dir: string | string[]) {
        return currentBranch({ fs, dir: gitRoot(dir), test: true });
    }

    /**
     * Get current branch name
     * @param dir Folder for which to get the branch name.
     * @returns branch name
     */
    export async function info(dir: string | string[]) {
        try {
            const rootFolder = gitRoot(dir);
            return {
                branch: await currentBranch({ fs, dir: rootFolder, test: true }) as (string | undefined),
                ref: await gitResolveRef({ fs, dir: gitRoot(dir), ref: 'HEAD' }) as string,
            };
        } catch {
            return;
        }
    }

    /**
     * Get all changes in the specified folder
     * @param dir folder
     * @param fromRef from hash
     * @param toRef optional to hash, defaults to the current hash if not specified
     * @returns list of changes and the type of change.
     */
    export async function diff(files: string[], fromRef: string, toRef = 'HEAD'): Promise<Array<{ path: string; type: GitFileChange }>> {
        const dir = gitRoot(files);
        const pathLookup = createPathLookup(files);
        const diff = await walk({
            fs,
            dir,
            trees: [TREE({ ref: toRef }), TREE({ ref: fromRef })],
            map: async function (filepath, [a, b]) {
                // ignore directories
                if (filepath === '.') {
                    return;
                }

                const resolvedFilepath = path.join(dir, filepath);

                if ((await a?.type()) === 'tree' || (await b?.type()) === 'tree') {
                    return;
                }                
                
                // generate ids
                const oidA = await a?.oid(); // toRef (newer commit)
                const oidB = await b?.oid(); // fromRef (older commit)

                // determine modification type
                if (oidA === oidB) {
                    return;
                }
                
                if (!isFileInPaths(resolvedFilepath, pathLookup)) {
                    // file is not in the list of files to check, skip it
                    return;
                }
                
                if (oidA !== undefined && oidB !== undefined) {
                    // file was modified
                    return { path: filepath, type: 'modify' };
                }                
                // file was added or removed depending on the order of the trees
                return { path: filepath, type: oidA !== undefined ? 'add' : 'remove' };
            },
        });

        return diff;
    }

    /**
     * Checks if a given file path is included in an array of paths,
     * where the array can contain paths to files or folders.
     * If an item in the array is a folder, the function checks if the file
     * is contained within that folder or any of its subfolders.
     *
     * @param filePathToVerify - The absolute or relative path to the file to check.
     * @param pathLookup - Precomputed exact path and directory prefix lookups.
     * @returns `true` if the file path is found or contained within one of the referencePaths, `false` otherwise.
     */
    function isFileInPaths(filePathToVerify: string, pathLookup: PathLookup): boolean {
        const normalizedFileToVerify = normalizePath(filePathToVerify);

        if (pathLookup.filePaths.has(normalizedFileToVerify)) {
            return true;
        }

        for (const directoryPrefix of pathLookup.directoryPrefixes) {
            // 2. Containment check: The file to verify is within a reference path (if that path is treated as a folder).
            //    The file path must start with the reference path followed by a path separator.
            if (normalizedFileToVerify.startsWith(directoryPrefix)) {
                return true;
            }
        }
        return false;
    }

    function createPathLookup(files: string[]): PathLookup {
        const normalizedFiles = files.map(normalizePath);
        const filePaths = new Set<string>();
        const directoryPrefixes: string[] = [];

        for (const filePath of normalizedFiles) {
            let stat: fs.Stats | undefined;

            try {
                stat = fs.statSync(filePath);
            } catch (error) {
                if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                    throw error;
                }
            }

            if (stat?.isDirectory()) {
                directoryPrefixes.push(filePath + '/');
                continue;
            }

            filePaths.add(filePath);
        }

        return {
            filePaths,
            directoryPrefixes,
        };
    }

    function normalizePath(filePath: string): string {
        if (!path.isAbsolute(filePath)) {
            filePath = path.resolve(filePath);
        }
        return filePath.replace(/[/\\]+/ig, '/'); // Normalize to forward slashes
    }
}
