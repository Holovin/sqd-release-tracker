import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { readFileSync } from 'fs';
import { formatDate, isDev } from './helpers.js';
import { logger } from './logger';
import { bot } from './telegramBot';
import * as crypto from 'crypto';


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
    const data = request.body as any;
    const appName = data.data?.app?.name ?? '(app)'
    const userName = data.data?.user?.email ?? '(user)';
    const status = data.data?.status ?? '[status]';
    const date = formatDate(data.data?.created_at ?? '0');
    const description = data.data?.description ?? '-';

    await bot.send('Heroku', `${date}\n> ${appName}: ${status}\n\nExtra: ${description}`);

    return reply.status(200).send({ 'status': 'OK' });
});

server.post('/vercel', async function handler(request, reply) {
    if (request.headers['x-vercel-signature']) {
        const signature = crypto
            .createHmac('sha1', process.env.VERCEL_HOOK_SECRET)
            .update(JSON.stringify(request.body))
            .digest('hex');

        if (signature !== request.headers['x-vercel-signature']) {
            return reply.status(200);
        }
    }

    const data = request.body as any;
    const date = formatDate(data.createdAt ?? '0');
    const type = data.type;
    let extra = '';

    if ([
        'deployment.created',
        'deployment.succeeded',
        'deployment.ready',
        'deployment.promoted',
        'deployment.canceled',
        'deployment.error',
    ].includes(type)) {
        extra += `Project: ${data.payload.deployment?.name} (${data.payload.deployment?.url ?? 'no url'})` +
                 `\nTarget: ${data.payload.target ?? 'empty'}`;
    }


    await bot.send('Vercel', `${date}\n> ${type}\n\n${extra}`);

    return reply.status(200).send({ 'status': 'OK' });
});


server.setNotFoundHandler(async function notFound(request, reply) {
    return reply
        .status(200)
        .send({});
});
