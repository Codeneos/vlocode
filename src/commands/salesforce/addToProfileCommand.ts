import UpdateRelatedProfileCommand from './updateProfileCommand';

export default class AddToProfileCommand extends UpdateRelatedProfileCommand {

    public execute(...args: any[]) {
        const affectedFiles = [...(args[1] || [args[0] || this.currentOpenDocument]), ...args.slice(2)];
        return this.updateProfiles(affectedFiles, 'add');
    }
}