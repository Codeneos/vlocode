import { Volume } from 'memfs';
import { NodeFileSystem } from './nodeFileSystem';

/** Serialized memory file system: file contents as base64, `null` for empty directories */
interface SerializedFileSystem {
    encoding: 'base64';
    files: Record<string, string | null>;
}

/**
 * Memory file system that instead of writing to disk writes to memory and stores them in a JSON object.
 */
export class MemoryFileSystem extends NodeFileSystem {

    protected get memFs(): Volume {
        return this.innerFs as unknown as Volume
    }

    constructor(files: { [fileName: string] : string | Buffer | null } = {}) {
        super(Volume.fromJSON(files as Record<string, string | null>) as any);
    }

    /**
     * Get the file system as a buffer and return it; binary file contents are preserved.
     * @returns Serialized file system
     */
    public getBuffer(): Buffer {
        const files = Object.fromEntries(Object.entries(this.memFs.toJSON()).map(([file, content]) => [
            file,
            content === null ? null : (this.memFs.readFileSync(file) as Buffer).toString('base64')
        ]));
        const serialized: SerializedFileSystem = { encoding: 'base64', files };
        return Buffer.from(JSON.stringify(serialized), 'utf-8');
    }

    /**
     * Instantiate a new memory file system from a buffer object containing the file system.
     * @param buffer Buffer to read the file system from previously written by `getBuffer`
     * @returns Memory file system
     */
    public static fromBuffer(buffer: Buffer): MemoryFileSystem {
        const data = JSON.parse(buffer.toString('utf-8'));
        if (data?.encoding !== 'base64') {
            // Format of earlier versions: file name mapped to the file content as text
            return new MemoryFileSystem(data);
        }
        const { files } = data as SerializedFileSystem;
        return new MemoryFileSystem(Object.fromEntries(Object.entries(files).map(([file, content]) => [
            file,
            content === null ? null : Buffer.from(content, 'base64')
        ])));
    }
}
