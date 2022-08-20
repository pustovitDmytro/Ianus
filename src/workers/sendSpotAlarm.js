/* eslint-disable unicorn/filename-case */
import config from '../etc/config';
import Cache from '../Cache';
import Base from './Base/sendAlarm';

const cache = new Cache({
    prefix : config.cache.spot.prefix,
    ttl    : config.cache.spot.ttl,
    redis  : config.redis
});

export default async function (job) {
    return Base(job, {
        cache,
        template : 'BinanceSpotAlarm',
        getHash  : (r, user) => `${user.tgChat}_${r.asset}`
    });
}
