const minimatch = require('minimatch');
const fs = require('fs-extra');
const path = require('path');

/**
 * Remove any file or folder that matches the specified glob pattern.
 * @param {string} folder 
 * @param {string[]} globPatterns 
 * @param {boolean} dryrun 
 * @returns {string[]} Files removed
 */
async function removeFiles(folder, globPatterns, dryrun) {
    const files = fs.readdirSync(folder);
    let removedFiles = [];
    await Promise.all(files.map(file => path.join(folder, file)).map(async file => {
        const matches = globPatterns.some(pattern => minimatch(file, pattern));
        const fstat = await fs.stat(file);

        if (!matches) {            
            if(fstat.isDirectory()) {   
                removedFiles.push(...(await removeFiles(file, globPatterns, dryrun)));
            }
            return;
        }
        
        removedFiles.push(file);
        if (dryrun) {            
            return;
        }         
        await fs.remove(file);
    }));
    return removedFiles;
}

async function main(folder, ignoreFile) {
    if (!folder || !ignoreFile) {
        console.log('Remove files or folders mathcing supplied glob patterns');
        console.log('Usage: removeFiles [<folder>] [<patternFile>]');
    }
    console.log(`Loading ignore patterns from ${ignoreFile}`);
    const ignorePatterns = fs.readFileSync(ignoreFile).toString().split(/\r?\n/);
    console.log(`Scan starting from: ${folder}`);
    removedFiles = await removeFiles('.', ignorePatterns.filter(p => p.startsWith('node_modules')), false);
    console.log(`Done! Removed ${removedFiles.length} files`);
}

main(...process.argv.slice(2));