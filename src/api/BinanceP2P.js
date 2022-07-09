import BaseAPI from 'base-api-client';

const PAGE_LIMIT = 20;

export default class BinanceAPI extends BaseAPI {
    constructor() {
        super('https://p2p.binance.com');
    }

    getHeaders() {
        return { 'Content-Type': 'application/json' };
    }

    async p2p({
        page = 1,
        ...params
    } = {}) {
        const res = await this.post('/bapi/c2c/v2/friendly/c2c/adv/search',  {
            page,
            rows          : PAGE_LIMIT,
            publisherType : null,
            ...params
        });

        if (!res.success) throw new Error(res.message);
        const items = res.data.map(item => dumpP2P(item));

        if (items.length > 0 && res.total > items.length) {
            return [
                ...items,
                ...(await this.p2p({
                    ...params,
                    page : page + 1
                }))
            ];
        }


        return items;
    }
}


function dumpP2P(p) {
    const { adv, advertiser } = p;

    return {
        id        : adv.advNo,
        asset     : adv.asset,
        tradeType : adv.tradeType,
        fiat      : adv.fiatUnit,
        price     : adv.price,
        amount    : {
            max  : adv.maxSingleTransAmount,
            min  : adv.minSingleTransAmount,
            init : adv.initAmount
        },
        advertiser : {
            id    : advertiser.userNo,
            nick  : advertiser.nickName,
            rate  : advertiser.monthFinishRate,
            count : advertiser.monthOrderCount
        },
        tradeMethods : adv.tradeMethods.map(m => m.identifier)
    };
}

