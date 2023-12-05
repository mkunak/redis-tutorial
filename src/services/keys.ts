export enum ECacheKeyMainPrefix {
  HTML = 'html',
  DATA = 'data',
  LOCK = 'lock',
  IDX = 'idx',
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
  ID = 'id',
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
  buildLock: (key: string) => string;
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

  buildLock(key: string) {
    this.prefixes = key.split(this.prefixSeparator);
    this.prefixes[0] = ECacheKeyMainPrefix.LOCK;

    return this.build();
  }
}


interface ICacheKeyMapper {
  mapPage: (id: string) => string;
  mapUser: (id: string) => string;
  mapUsernames: () => string;
  mapUsernamesWithId: () => string;
  mapSession: (id: string) => string;
  mapItem: (id: string) => string;
  mapItemsIndex: (id: string) => string;
  mapItemsViews: (id: string) => string;
  mapItemViews: (id: string) => string;
  mapItemsEndingAt: (id: string) => string;
  mapItemsPrice: () => string;
  mapItemsBids: () => string;
  mapUserLikes: (id: string) => string;
  mapItemBids: (id: string) => string;
  mapLock: (key: string) => string;
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

  mapUsernamesWithId = () => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.SORTED_SET)
      .addKeyPrefix(EDatabaseModel.USERNAMES)
      .addKeyPrefix(EDatabaseModelKey.ID)
      .build();
  }

  mapSession = (id: string) => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.HASH)
      .addKeyId(id, EDatabaseModel.SESSIONS)
      .build();
  }

  mapItem = (id: string = '') => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.HASH)
      .addKeyId(id, EDatabaseModel.ITEMS)
      .build();
  }

  mapItemsIndex = () => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.IDX)
      .addKeyPrefix(ECacheKeyDatabaseDataType.HASH)
      .addKeyPrefix(EDatabaseModel.ITEMS)
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

  mapItemsBids = () => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.SORTED_SET)
      .addKeyPrefix(EDatabaseModel.ITEMS)
      .addKeyPrefix(EDatabaseModel.BIDS)
      .build();
  }

  mapUserLikes = (id: string) => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.SET)
      .addKeyId(id, EDatabaseModel.USERS)
      .addKeyPrefix(EDatabaseModel.LIKES)
      .build();
  }

  mapUserItems = (id: string) => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.SET)
      .addKeyId(id, EDatabaseModel.USERS)
      .addKeyPrefix(EDatabaseModel.ITEMS)
      .build();
  }

  mapUserBids = (id: string) => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.SET)
      .addKeyId(id, EDatabaseModel.USERS)
      .addKeyPrefix(EDatabaseModel.BIDS)
      .build();
  }

  mapItemBids = (id: string) => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.LIST)
      .addKeyId(id, EDatabaseModel.ITEMS)
      .addKeyPrefix(EDatabaseModel.BIDS)
      .build();
  }

  mapLock = (key: string) => {
    return this.cacheKeyBuilder.buildLock(key);
  }
}

const cacheKeyMapper = new CacheKeyMapper(new CacheKeyBuilder());

export { cacheKeyMapper };
