import { WebpackPluginInstance, Compiler } from 'webpack';

export default class WatchMarkersPlugin implements WebpackPluginInstance {
    private buildCounter = 0;

    public apply(compiler: Compiler) {
        compiler.hooks.infrastructureLog.tap('WatchMarkersPlugin', (arg0, arg1, arg2) => {
            const messages = arg2.filter(m => typeof m === 'string');
            const isCompileStart = messages.some(msg => /Compiler '[\w\d]+' starting... /i.test(msg));
            const isCompileEnd = messages.some(msg => msg.endsWith('watching files for updates...'));

            if (isCompileStart && this.buildCounter++ == 0 ) {
                console.debug('Build starting...');
            } else if (isCompileEnd && --this.buildCounter == 0 ) {
                console.debug('Build completed!');
            }

            return true;
        });
    }
}
