import { Volume } from 'memfs';
import { NodeFileSystem } from './nodeFileSystem';

/**
 * Basic class that can wrap any API implementation the NodeJS FS API into a more reduced FileSystem interface.
 */
export class MemoryFileSystem extends NodeFileSystem {
    constructor(files: { [fileName: string] : string } = {}) {
        super(Volume.fromJSON(files) as any);
    }
}
