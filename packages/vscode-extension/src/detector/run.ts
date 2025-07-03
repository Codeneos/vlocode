import { LogManager, ConsoleWriter } from '@vlocode/core';
import { DetectionProcess } from './detectionProcess';

// Initialize and run the detection process
try {
    LogManager.registerWriter(new ConsoleWriter());
    new DetectionProcess().run();
} catch (error) {
    console.error('Unhandled error during detection process initialization:', error);
    if (process.send) {
        process.send({ type: 'error', message: 'Critical error initializing detection process.', stack: (error as Error).stack });
    }
    process.exit(1);
}
