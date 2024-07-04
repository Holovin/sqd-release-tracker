import { isDev } from './helpers.js';
import { DestinationStream, pino, StreamEntry } from 'pino';
import PinoPretty from 'pino-pretty';

const loggerSharedConfig = {
    levelFirst: false,
    translateTime: 'yyyy/mm/dd HH:MM:ss',
    ignore: 'pid,hostname',
}

export const logger = createLoggerWrap();
function createLoggerWrap() {
    const streams: (DestinationStream | StreamEntry)[] = [
        {
            stream: PinoPretty({
                ...loggerSharedConfig,
                colorize: true,
                minimumLevel: isDev() ? 'debug' : 'info',
                ignore: 'pid,hostname',
            }),
            level: isDev() ? 'debug' : 'info',
        }
    ];

    if (isDev()) {
        streams.push({
            stream: PinoPretty({
                ...loggerSharedConfig,
                colorize: false,
                minimumLevel: 'debug',
                destination: './debug.log',
            }),
            level: 'debug',
        });
    }

    const logger = pino(
        {
            level: 'debug',
            timestamp: pino.stdTimeFunctions.isoTime,
        },
        pino.multistream(streams)
    );

    logger.info(`[logger] log ready, mode: ${isDev() ? 'DEV' : 'PROD'}`);
    return logger;
}
