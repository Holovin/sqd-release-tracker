import 'dotenv/config';

export interface Config {
    TG_BOT_TOKEN: string;
    TG_BOT_ADMIN: number;
    TG_BOT_CHAT: number;
    PORT: number;
}

export const config: Config = prepareConfig();

function prepareConfig(): Config {
    return {
        TG_BOT_TOKEN: process.env.TG_BOT_TOKEN,
        TG_BOT_ADMIN: Number(process.env.TG_BOT_ADMIN),
        TG_BOT_CHAT: Number(process.env.TG_BOT_CHAT),
        PORT: Number(process.env.PORT),
    };
}
