import dotenv from 'dotenv';
import { Assembler } from 'cottus';
import cottus from './utils/cottus';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.defaults' });

const e = process.env;

const queueSchema = prefix => ({
    name        : { $source: `{${prefix}_NAME}`, $validate: [ 'required', 'string' ] },
    ttl         : { $source: `{${prefix}_TTL}`, $validate: [ 'required', 'time_unit' ] },
    attempts    : { $source: `{${prefix}_ATTEMPTS}`, $validate: [ 'required', 'integer', { 'min': 1 } ] },
    concurrency : { $source: `{${prefix}_CONCURRENCY}`, $validate: [ 'required', 'integer', { 'min': 1 } ] },
    logLevel    : {
        $source   : `{${prefix}_LOG_LEVEL}`,
        $validate : [ 'required', { 'enum': [ 'error', 'warn', 'info', 'notice', 'verbose', 'debug' ] } ]
    },
    repeat     : !!e[`${prefix}_REPEAT`] ? { $source: `{${prefix}_REPEAT}`, $validate: [ 'cron' ] } : null,
    canProcess : { $source: `{${prefix}_PROCESS}`, $validate: [ 'required', 'boolean' ] },
    backoff    : !!e[`${prefix}_BACKOFF_TYPE`] ? {
        type  : { $source: `{${prefix}_BACKOFF_TYPE}`, $validate: [ { 'enum': [ 'exponential' ] } ] },
        delay : { $source: `{${prefix}_BACKOFF_DELAY}`, $validate: [ 'string' ] }
    } : null
});

const schema = {
    queue : {
        redis : {
            port     : { $source: '{REDIS_PORT}', $validate: [ 'required', 'port' ] },
            host     : { $source: '{REDIS_HOST}', $validate: [ 'required', 'hostname' ] },
            db       : { $source: '{REDIS_DB}', $validate: [ 'integer' ] },
            password : { $source: '{REDIS_PASSWORD}', $validate: [ 'string' ] },
            username : { $source: '{REDIS_USER}', $validate: [ 'string' ] }
        },
        binanceP2P     : queueSchema('BINANCE_P2P_QUEUE'),
        binanceRequest : queueSchema('BINANCE_REQUEST_QUEUE')
    },
    binanceP2PList : {
        $source   : { type: 'complex_array', prefix: 'BINANCE_P2P_LIST_' },
        $validate : {
            'user' : {
                'tgChat' : { $source: '{_USER_TG_CHAT}', $validate: [ 'required', 'integer' ] },
                'limit'  : { $source: '{_LIMIT}', $validate: [ 'required', 'number' ] }
            },
            'asset'    : { $source: '{_ASSET}', $validate: [ 'required', 'string' ] },
            'fiat'     : { $source: '{_FIAT}', $validate: [ 'required', 'string' ] },
            'payTypes' : {
                $source : '{_PAY_TYPES}', $validate : [ 'required', { 'split': ' ' }, { every: 'string' } ]
            }
        }
    },
    web : {
        port  : { $source: '{PORT}', $validate: [ 'required', 'port' ] },
        start : { $source: '{WEB_START}', $validate: [ 'required', 'boolean' ] },
        admin : {
            password : { $source: '{BASIC_ADMIN_PASSWORD}', $validate: [ 'required', 'string' ] }
        }
    },
    telegram : {
        botId    : { $source: '{TELEGRAM_BOT_ID}', $validate: [ 'required', 'integer' ] },
        botToken : { $source: '{TELEGRAM_BOT_TOKEN}', $validate: [ 'required', 'string', { min: 35 }, { max: 35 } ] }
    }
};

const assembler = new Assembler(cottus, schema);

// eslint-disable-next-line import/no-mutable-exports
let config;

try {
    assembler.parse();
    config = assembler.run(e);
} catch (error) {
    throw new Error(error.message);
}


export default config;