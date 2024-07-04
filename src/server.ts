import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { readFileSync } from 'fs';
import { isDev } from './helpers.js';
import { logger } from './logger';


export const server = Fastify({
    https: isDev() ? {
        key: readFileSync('./certificates/key'),
        cert: readFileSync('./certificates/cert'),
    } : null,
    disableRequestLogging: !isDev(),
    logger: logger,
});


server.register(fastifyCors, {
    origin: true,
});

server.get('/ping', async function handler(request, reply) {
    return {
        hello: 'pong!',
        date: new Date().getTime(),
    };
});

server.setNotFoundHandler(async function notFound(request, reply) {
    return reply
        .status(200)
        .send({});
});
