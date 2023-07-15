import { Volume as MemFs } from 'memfs';
import { Volume } from 'memfs/lib/volume';
import { NodeFileSystem } from './nodeFileSystem';

/**
 * Memory file system that instead of writing to disk writes to memory and stores them in a JSON object.
 */
export class MemoryFileSystem extends NodeFileSystem {

    protected get memFs(): Volume {
        return this.innerFs as unknown as Volume
    }

    constructor(files: { [fileName: string] : string } = {}) {
        super(MemFs.fromJSON(files) as any);
    }

    /**
     * Get the file system as a buffer and return it.
     * @returns Serialized file system
     */
    public getBuffer(): Buffer {
        return Buffer.from(JSON.stringify(this.memFs.toJSON()), 'utf-8');
    }

    /**
     * Instantiate a new memory file system from a buffer object containing the file system.
     * @param buffer Buffer to read the file system from previously written by `getBuffer`
     * @returns Memory file system
     */
    public static fromBuffer(buffer: Buffer): MemoryFileSystem {
        return new MemoryFileSystem(JSON.parse(buffer.toString('utf-8')));
    }
}
