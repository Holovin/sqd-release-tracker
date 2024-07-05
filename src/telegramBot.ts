import { Bot, Context, SessionFlavor } from 'grammy';
import { ParseMode } from 'grammy/types';
import { config } from './config.js';
import { logger } from './logger.js';

const tgBaseOptions: { parse_mode: ParseMode, disable_web_page_preview: boolean } = {
    parse_mode: 'MarkdownV2',
    disable_web_page_preview: true,
};


class TelegramBot {
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
        this.bot.catch((error) => {
            logger.error(`[bot] error: ${JSON.stringify(error)}`);
        });
    }

    public async send(header: string, text: string) {
        const wrapperMsg = TelegramBot.escMd(text).split('\n').map(line => `\`${line}\``).join('\n');

        await this.bot.api.sendMessage(
            config.TG_BOT_CHAT,
            `*${TelegramBot.escMd(header)}*\n\n${wrapperMsg}`,
            tgBaseOptions
        );
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

export const bot = new TelegramBot(config.TG_BOT_TOKEN);
