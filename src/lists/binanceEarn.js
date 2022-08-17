import DataLoader from './Loader';

export default class BinanceEarnList extends DataLoader {
    static envPrefix = 'BINANCE_EARN_LIST_';

    static envSchema = {
        'user' : {
            'tgChat' : { $source: '{_USER_TG_CHAT}', $validate: [ 'required', 'integer' ] },
            'limit'  : { $source: '{_LIMIT}', $validate: [ 'required', 'number' ] }
        },
        'asset' : { $source: '{_ASSET}', $validate: [ 'required', 'string' ] }
    };

    static mongoSchema = {
        'user' : {
            'tgChat' : { $source: '{telegram_chat}', $validate: [ 'required', 'integer' ] },
            'limit'  : { $source: '{apy_limit}', $validate: [ 'required', 'number' ] }
        },
        'asset' : { $source: '{asset}', $validate: [ 'required', 'string' ] }
    };

    static collectionName = 'binance_earn_list';
}

