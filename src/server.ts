import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { readFileSync } from 'fs';
import { isDev } from './helpers.js';
import { logger } from './logger';
import { bot } from './telegramBot';


export const server = Fastify({
    https: isDev() ? {
        key: readFileSync('./certificates/key'),
        cert: readFileSync('./certificates/cert'),
    } : null,
    disableRequestLogging: !isDev(),
    // TODO: resolve types?
    logger: (logger as any),
});


server.register(fastifyCors, {
    origin: true,
});

server.post('/heroku', async function handler(request, reply) {
    const resp = request.body as any;
    const appName = resp.data?.app?.name ?? '(app)'
    const userName = resp.data?.user?.email ?? '(user)';
    const status = resp.data?.status ?? '[status]';
    const time = new Date(resp.data?.created_at ?? '0');
    const description = resp.data?.description ?? '[info]';

    await bot.send('Heroku', `[${appName}] ${userName} -- ${status} -- ${time}\n${description}`);

    return reply.status(200).send({ 'status': 'OK '});
});

server.setNotFoundHandler(async function notFound(request, reply) {
    return reply
        .status(200)
        .send({});
});
