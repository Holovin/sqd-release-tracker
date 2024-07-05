import { config } from './config';
import { bot } from './telegramBot';
import { logger } from './logger';
import { isDev } from './helpers';
import { server } from './server';

(async () => {
    await bot.initBot();
    bot.start()
        .then() // Never happen
        .catch(e => {
            logger.fatal(`[bot] something wrong with bot ${JSON.stringify(e)}`);
            return;
        })

    // API Server
    try {
        await server.listen({
            host: isDev() ? '127.0.0.1' : '0.0.0.0',
            port: config.PORT,
        });

    } catch (err) {
        logger.fatal('[server] something bad happen');
        logger.fatal(err);
        return;
    }

})();
