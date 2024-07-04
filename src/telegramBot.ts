import { Bot, Context, NextFunction, SessionFlavor } from 'grammy';
import { ParseMode } from 'grammy/types';
import { config } from './config.js';
import { logger } from './logger.js';
import { isDev } from './helpers.js';


const TG_CMD = {
    START: 'start',
    START_LOCAL: 'start_localhost',
}

const resourceTokens = {
    START: 'start',
}

const tgBaseOptions: { parse_mode: ParseMode, disable_web_page_preview: boolean } = {
    parse_mode: 'MarkdownV2',
    disable_web_page_preview: true,
};


export class TelegramBot {
    private bot: Bot<Context & SessionFlavor<{}>>;

    constructor(token: string) {
        this.bot = new Bot(token);

        logger.info(`[bot] token = [...${token.slice(-5)}]`);
    }

    public async start() {
        logger.info(`[bot] started...`);

        // Drop old updates
        await this.bot.api.deleteWebhook();

        const botInfo = await this.bot.api.getMe();
        logger.info(`[bot] running as ${botInfo.username} (id: ${botInfo.id})`);

        return this.bot.start({
            allowed_updates: ['message', 'my_chat_member'],
        })
    }

    public async initBot() {
        if (isDev()) {
            this.bot.use(this.botLogger.bind(this));
            this.bot.use(this.checkAccess.bind(this));
            logger.info(`[bot] dev logger attached`);
        }

        this.bot.on('my_chat_member', async ctx => {
            if (ctx.update.my_chat_member.new_chat_member.status === 'kicked') {
                logger.info(`[bot] chat_member ${ctx.from.id} banned bot!`);
                return;
            }

            if (ctx.update.my_chat_member.old_chat_member.status === 'kicked') {
                logger.info(`[bot] chat_member ${ctx.from.id} unbanned bot!`);
                return;
            }
        });

        this.bot.command(TG_CMD.START, async ctx => {
        });

        this.bot.catch((error) => {
            logger.error(`[bot] error: ${JSON.stringify(error)}`);
        });

    }

    private async checkAccess(ctx: Context, next: NextFunction): Promise<void> {
        if (ctx.update.message?.chat.type !== 'private') {
            logger.debug(`[bot] skip message from non-chat ${JSON.stringify(ctx.update)}`);
            return;
        }

        return next();
    }

    private async botLogger(ctx: Context, next: NextFunction): Promise<void> {
        // LOG ANYTHING HERE //
        logger.info(`[bot] ctx: ${JSON.stringify(ctx)}`);

        return next();
    }

    private static escMd(message: string): string {
        return message
            .replace(/_/g, '\\_')
            .replace(/\*/g, '\\*')
            .replace(/\[/g, '\\[')
            .replace(/]/g, '\\]')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
            .replace(/~/g, '\\~')
            .replace(/`/g, '\\`')
            .replace(/>/g, '\\>')
            .replace(/#/g, '\\#')
            .replace(/\+/g, '\\+')
            .replace(/-/g, '\\-')
            .replace(/=/g, '\\=')
            .replace(/\|/g, '\\|')
            .replace(/\{/g, '\\{')
            .replace(/}/g, '\\}')
            .replace(/\./g, '\\.')
            .replace(/!/g, '\\!');
    }
}

