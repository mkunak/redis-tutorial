const ECacheKeyMainPrefix = {
  HTML: 'html',
  DATA: 'data',
  LOCK: 'lock',
  IDX: 'idx',
}

const ECacheKeyDatabaseDataType = {
  HASH: 'hash',
  STRING: 'string',
  PUBSUB: 'pubsub',
  STREAM: 'stream',
  SET: 'set',
  SORTED_SET: 'sortedSet',
  HYPER_LOG_LOG: 'hyperLogLog',
  LIST: 'list',
}

const EDatabaseModel = {
  PAGES: 'pages',
  COMPONENTS: 'components',
  VIEWS: 'views',
  LIKES: 'likes',
  USERS: 'users',
  SESSIONS: 'sessions',
  BIDS: 'bids',
  ITEMS: 'items',
  USERNAMES: 'usernames',
}

const EDatabaseModelKey = {
  ID: 'id',
  ENDING_AT: 'endingAt',
  PRICE: 'price',
}

class CacheKeyBuilder {
  prefixSeparator = ':';
  idSeparator = '#';

  prefixes = [];

  addKeyPrefix(prefix) {
    this.prefixes.push(prefix);
    return this;
  }

  addKeyId(id, model) {
    this.prefixes.push(`${model}${this.idSeparator}${id}`);
    return this;
  };

  build() {
    const cacheKey = `${this.prefixes.join(this.prefixSeparator)}`;

    this.prefixes = [];

    return cacheKey;
  }

  buildLock(key) {
    this.prefixes = key.split(this.prefixSeparator);
    this.prefixes[0] = ECacheKeyMainPrefix.LOCK;

    return this.build();
  }
}

export class CacheKeyMapper {
  cacheKeyBuilder;

  constructor(cacheKeyBuilder) {
    this.cacheKeyBuilder = cacheKeyBuilder;
  }

  mapPage = (pageRoute) => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.HTML)
      .addKeyPrefix(ECacheKeyDatabaseDataType.STRING)
      .addKeyId(pageRoute, EDatabaseModel.PAGES)
      .build();
  }

  mapUser = (id) => {
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

  mapSession = (id) => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.HASH)
      .addKeyId(id, EDatabaseModel.SESSIONS)
      .build();
  }

  mapItem = (id = '') => {
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

  mapItemViews = (id) => {
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

  mapUserLikes = (id) => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.SET)
      .addKeyId(id, EDatabaseModel.USERS)
      .addKeyPrefix(EDatabaseModel.LIKES)
      .build();
  }

  mapUserItems = (id) => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.SET)
      .addKeyId(id, EDatabaseModel.USERS)
      .addKeyPrefix(EDatabaseModel.ITEMS)
      .build();
  }

  mapUserBids = (id) => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.SET)
      .addKeyId(id, EDatabaseModel.USERS)
      .addKeyPrefix(EDatabaseModel.BIDS)
      .build();
  }

  mapItemBids = (id) => {
    return this.cacheKeyBuilder
      .addKeyPrefix(ECacheKeyMainPrefix.DATA)
      .addKeyPrefix(ECacheKeyDatabaseDataType.LIST)
      .addKeyId(id, EDatabaseModel.ITEMS)
      .addKeyPrefix(EDatabaseModel.BIDS)
      .build();
  }

  mapLock = (key) => {
    return this.cacheKeyBuilder.buildLock(key);
  }
}

const cacheKeyMapper = new CacheKeyMapper(new CacheKeyBuilder());

export { cacheKeyMapper };
