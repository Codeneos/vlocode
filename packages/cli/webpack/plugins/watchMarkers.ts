import { WebpackPluginInstance, Compiler } from 'webpack';

console.info('WatchMarkersPlugin');
export default class WatchMarkersPlugin implements WebpackPluginInstance {
    private buildCounter = 0;

    public apply(compiler: Compiler) {
        
        console.info('WatchMarkersPlugin->apply');
        compiler.hooks.infrastructureLog.tap('WatchMarkersPlugin', (arg0, arg1, arg2) => {
            const messages = arg2.filter(m => typeof m === 'string');
            const isCompileStart = messages.some(msg => /Compiler '[\w\d\-_]+' starting... /i.test(msg));
            const isCompileEnd = messages.some(msg => msg.endsWith('watching files for updates...'));

            if (isCompileStart && this.buildCounter++ == 0 ) {
                console.info('Build starting...');
            } else if (isCompileEnd && --this.buildCounter == 0 ) {
                console.info('Build completed!');
            }

            return true;
        });
    }
}
