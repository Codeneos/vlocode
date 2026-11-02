import ExportDatapackCommand from '../commands/datapacks/exportDatapackCommand';
import { DatapackResultCollection, type ObjectEntry } from '../lib/vlocity/vlocityDatapackService';

class TestCommand extends ExportDatapackCommand {
    public readonly direct = jest.fn(async () => new DatapackResultCollection());
    public readonly classic = jest.fn(async () => new DatapackResultCollection());
    protected override readonly vlocode = {
        config: { exportMode: 'auto' }, isVlocityAvailable: true,
        services: { get: () => ({ export: this.direct }) }
    } as any;
    protected override get datapackService(): any { return { export: this.classic }; }
    public runExport(mode: string, managed: boolean, entries: ObjectEntry[]) {
        this.vlocode.config.exportMode = mode;
        this.vlocode.isVlocityAvailable = managed;
        return this.exportDatapacks(entries, '/datapacks', 0);
    }
}

const entries: ObjectEntry[] = [
    { id: '001A', datapackType: 'OmniScript', sobjectType: 'OmniScript__c', exportMode: 'direct' },
    { id: '001B', datapackType: 'Product2', sobjectType: 'Product2', exportMode: 'tools' }
];

describe('DataPack export mode', () => {
    it('preserves each definition mode in Auto', async () => {
        const command = new TestCommand();
        await command.runExport('auto', true, entries);
        expect(command.direct).toHaveBeenCalledWith([entries[0]], '/datapacks', 0, undefined, undefined);
        expect(command.classic).toHaveBeenCalledWith([entries[1]], '/datapacks', 0, undefined);
    });
    it('can override direct definitions with Classic', async () => {
        const command = new TestCommand();
        await command.runExport('classic', true, entries);
        expect(command.classic).toHaveBeenCalledWith(entries, '/datapacks', 0, undefined);
        expect(command.direct).not.toHaveBeenCalled();
    });
    it('can override classic definitions with Direct', async () => {
        const command = new TestCommand();
        await command.runExport('direct', true, entries);
        expect(command.direct).toHaveBeenCalledWith(entries, '/datapacks', 0, undefined, undefined);
        expect(command.classic).not.toHaveBeenCalled();
    });
    it('uses Direct automatically for an org without the managed package', async () => {
        const command = new TestCommand();
        await command.runExport('auto', false, entries);
        expect(command.direct).toHaveBeenCalledWith(entries, '/datapacks', 0, undefined, undefined);
        expect(command.classic).not.toHaveBeenCalled();
    });
    it('explains why Classic cannot run without the managed package', async () => {
        const command = new TestCommand();
        await expect(command.runExport('classic', false, entries)).rejects.toThrow('Classic export requires');
        expect(command.direct).not.toHaveBeenCalled();
        expect(command.classic).not.toHaveBeenCalled();
    });
});
