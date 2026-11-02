import { parentPort } from 'node:worker_threads';
import { DatapackWorkspaceLinter } from '../lib/vlocity/lintDatapackWorkspace';
import type { DatapackLintRequest } from '../lib/vlocity/datapackLintProtocol';

const workspaces = new Map<string, DatapackWorkspaceLinter>();
let pending = Promise.resolve();

parentPort!.on('message', (request: DatapackLintRequest) => {
    pending = pending.then(async () => {
        if (request.type === 'release') {
            workspaces.delete(request.cwd);
            return;
        }
        const linter = workspaces.get(request.cwd) ?? new DatapackWorkspaceLinter(request.cwd);
        workspaces.set(request.cwd, linter);
        parentPort!.postMessage(await linter.lint(request.files));
    });
});
