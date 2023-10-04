export enum ECacheKeyMainPrefix {
  HTML = 'html',
  DATA = 'data',
}

export enum ECacheKeyDatabaseDataType {
  HASH = 'hash',
  STRING = 'string',
  PUBSUB = 'pubsub',
  STREAM = 'stream',
  SET = 'set',
  SORTED_SET = 'sortedSet',
  HYPER_LOG_LOG = 'hyperLogLog',
  LIST = 'list',
}

export enum EDatabaseModel {
  PAGES = 'pages',
  COMPONENTS = 'components',
  VIEWS = 'views',
  LIKES = 'likes',
  USERS = 'users',
  SESSIONS = 'sessions',
  BIDS = 'bids',
  ITEMS = 'items',
  USERNAMES = 'usernames',
}

export enum EDatabaseModelKey {
  ENDING_AT = 'endingAt',
  PRICE = 'price',
}

export type TCacheKeyPrefix =
  ECacheKeyMainPrefix |
  ECacheKeyDatabaseDataType |
  EDatabaseModel |
  EDatabaseModelKey


interface ICacheKeyBuilder {
  addKeyPrefix: (prefix: TCacheKeyPrefix) => {};
  addKeyId: (id: string, model: EDatabaseModel) => {};
  build: () => string;
}

export class CacheKeyBuilder implements ICacheKeyBuilder {
  private prefixSeparator = ':';
  private idSeparator = '#';

  private prefixes: string[] = [];

  addKeyPrefix(prefix: TCacheKeyPrefix) {
    this.prefixes.push(prefix);
    return this;
  }

  addKeyId(id: string, model: EDatabaseModel) {
    this.prefixes.push(`${model}${this.idSeparator}${id}`);
    return this;
  };

  build() {
    const cacheKey = `${this.prefixes.join(this.prefixSeparator)}`;

    this.prefixes = [];

    return cacheKey;
  }
}


interface ICacheKeyMapper {
  mapPage: (id: string) => string;
  mapUser: (id: string) => string;
  mapUsernames: () => string;
  mapUsernamesItems: () => string;
  mapSession: (id: string) => string;
  mapItem: (id: string) => string;
  mapItemsViews: (id: string) => string;
  mapItemsEndingAt: (id: string) => string;
  mapLike: (id: string) => string;
}

export class CacheKeyMapper implements ICacheKeyMapper {
  constructor(private cacheKeyBuilder: CacheKeyBuilder) {}

  mapPage = (pageRoute: string) => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.HTML)
      .addKeyPrefix(ECacheKeyDatabaseDataType.STRING)
      .addKeyId(pageRoute, EDatabaseModel.PAGES)
      .build();
  }

  mapUser = (id: string) => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.HASH)
      .addKeyId(id, EDatabaseModel.USERS)
      .build();
  }

  mapUsernames = () => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.SET)
      .addKeyPrefix(EDatabaseModel.USERNAMES)
      .build();
  }

  mapUsernamesItems = () => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.SORTED_SET)
      .addKeyPrefix(EDatabaseModel.USERNAMES)
      .addKeyPrefix(EDatabaseModel.ITEMS)
      .build();
  }

  mapSession = (id: string) => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.HASH)
      .addKeyId(id, EDatabaseModel.SESSIONS)
      .build();
  }

  mapItem = (id: string) => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.HASH)
      .addKeyId(id, EDatabaseModel.ITEMS)
      .build();
  }

  mapItemsViews = () => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.SORTED_SET)
      .addKeyPrefix(EDatabaseModel.ITEMS)
      .addKeyPrefix(EDatabaseModel.VIEWS)
      .build();
  }

  mapItemViews = (id: string) => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.HYPER_LOG_LOG)
      .addKeyId(id, EDatabaseModel.ITEMS)
      .addKeyPrefix(EDatabaseModel.VIEWS)
      .build();
  }

  mapItemsEndingAt = () => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.SORTED_SET)
      .addKeyPrefix(EDatabaseModel.ITEMS)
      .addKeyPrefix(EDatabaseModelKey.ENDING_AT)
      .build();
  }

  mapItemsPrice = () => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.SORTED_SET)
      .addKeyPrefix(EDatabaseModel.ITEMS)
      .addKeyPrefix(EDatabaseModelKey.PRICE)
      .build();
  }

  mapLike = (id: string) => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.SET)
      .addKeyId(id, EDatabaseModel.USERS)
      .addKeyPrefix(EDatabaseModel.LIKES)
      .build();
  }

  mapBids = (id: string) => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.LIST)
      .addKeyId(id, EDatabaseModel.ITEMS)
      .addKeyPrefix(EDatabaseModel.BIDS)
      .build();
  }
}

const cacheKeyMapper = new CacheKeyMapper(new CacheKeyBuilder());

export { cacheKeyMapper };
