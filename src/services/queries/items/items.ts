import { cacheKeyMapper } from '$services/keys';
import { client, RetrievedDataValidator, type IDataSerializer } from '$services/redis';
import type { CreateItemAttrs, Item } from '$services/types';
import { genId } from '$services/utils';
import { DateTime } from 'luxon';


const retrievedDataValidator = new RetrievedDataValidator();


export class ItemDataSerializer implements IDataSerializer<CreateItemAttrs, Item> {
  serialize(itemData: CreateItemAttrs): Record<string, string> {
    return {
      ...itemData,
      createdAt: itemData.createdAt.toMillis().toString(),
      endingAt: itemData.endingAt.toMillis().toString(),
      price: itemData.price.toString(),
      views: itemData.views.toString(),
      likes: itemData.likes.toString(),
      bids: itemData.bids.toString(),
    };
  };

  deserialize(id: string, itemData: Record<string, string>): Item {
    return {
      id,
      name: itemData.name,
      ownerId: itemData.ownerId,
      imageUrl: itemData.imageUrl,
      description: itemData.description,
      createdAt: DateTime.fromMillis(parseInt(itemData.createdAt)),
      endingAt: DateTime.fromMillis(parseInt(itemData.endingAt)),
      price: parseInt(itemData.price),
      views: parseInt(itemData.views),
      likes: parseInt(itemData.likes),
      bids: parseFloat(itemData.bids),
      highestBidUserId: itemData.highestBidUserId,
    };
  };
}

const itemDataSerializer = new ItemDataSerializer();


class ItemByView {
  public id: string;
  public name: string;
  public views: string;
  public endingAt: string;
  public imageUrl: string;
  public price: string;

  constructor(args: string[]) {
    this.id = args[0];
    this.name = args[1];
    this.views = args[2];
    this.endingAt = args[3];
    this.imageUrl = args[4];
    this.price = args[5];
  }
}


interface QueryOpts {
	page: number;
	perPage: number;
	sortBy: string;
	direction: string;
}


export class ItemHandler {
  async createItem(attrs: CreateItemAttrs) {
    const itemId = genId();
  
    await Promise.all([
      client.hSet(cacheKeyMapper.mapItem(itemId), itemDataSerializer.serialize(attrs)),
      client.zAdd(cacheKeyMapper.mapItemsViews(), { value: itemId, score: 0 }),
      client.zAdd(cacheKeyMapper.mapItemsPrice(), { value: itemId, score: 0 }),
      client.zAdd(cacheKeyMapper.mapItemsEndingAt(), { value: itemId, score: attrs.endingAt.toMillis() }),
    ]);
  
    return itemId;
  }


  async getItem(id: string) {
    const itemData = await client.hGetAll(cacheKeyMapper.mapItem(id));
  
    console.log('>>> getItem > itemData:', itemData);
  
    return retrievedDataValidator.isValid(itemData)
      ? itemDataSerializer.deserialize(id, itemData)
      : null;
  }


  async getItems(ids: string[]) {  
    return Promise.all(ids.map((id) => this.getItem(id)));
  }


  async sortItemsByEndingTime(order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) {
    const itemsIds = await client.zRange(
      cacheKeyMapper.mapItemsEndingAt(),
      Date.now(),
      '+inf',
      { BY: 'SCORE', LIMIT: { offset, count } }
    );

    const result = await Promise.all(
      itemsIds.map((itemId) => client.hGetAll(cacheKeyMapper.mapItem(itemId)))
    );
  
    return result.map((item, index) => itemDataSerializer.deserialize(itemsIds[index], item));
  }


  async sortItemsByViews(order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) {
    const getOptions = [
      '#',
      `${cacheKeyMapper.mapItem('*')}->name`,
      `${cacheKeyMapper.mapItem('*')}->views`,
      `${cacheKeyMapper.mapItem('*')}->endingAt`,
      `${cacheKeyMapper.mapItem('*')}->imageUrl`,
      `${cacheKeyMapper.mapItem('*')}->price`,
    ];

    const results = await client.sort(
      cacheKeyMapper.mapItemsViews(),
      {
        GET: getOptions,
        BY: 'score',
        DIRECTION: order,
        LIMIT: { count, offset }
      },
    ) as unknown as string[];

    const items = [];
    const iterationStep = getOptions.length;

    for (let i = 0; i < results.length; i += iterationStep) {
      const args = Array.from({ length: iterationStep }, (_, index) => results[i + index]);

      const { id, ...restData } = new ItemByView(args);

      items.push(itemDataSerializer.deserialize(id, restData));
    }

    return items;
  }

  async sortItemsByPrice(order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) {
    const getOptions = [
      '#',
      `${cacheKeyMapper.mapItem('*')}->name`,
      `${cacheKeyMapper.mapItem('*')}->views`,
      `${cacheKeyMapper.mapItem('*')}->endingAt`,
      `${cacheKeyMapper.mapItem('*')}->imageUrl`,
      `${cacheKeyMapper.mapItem('*')}->price`,
    ];

    const results = await client.sort(
      cacheKeyMapper.mapItemsPrice(),
      {
        GET: getOptions,
        BY: 'score',
        DIRECTION: order,
        LIMIT: { count, offset }
      },
    ) as unknown as string[];

    const items = [];
    const iterationStep = getOptions.length;

    for (let i = 0; i < results.length; i += iterationStep) {
      const args = Array.from({ length: iterationStep }, (_, index) => results[i + index]);

      const { id, ...restData } = new ItemByView(args);

      items.push(itemDataSerializer.deserialize(id, restData));
    }

    return items;
  }

  async searchItems(term: string, size: number = 5) {
    const searchString = term
      .replaceAll(/[^a-zA-Z0-9 ]/g, '')
      .trim()
      .split(' ')
      .filter((word) => !!word)
      .map((word) => `%${word}%`)
      .join(' ');

    console.log('>>> searchString:', searchString);

    // Look at cleaned and define if it is valid
    if (searchString === '') {
      return [];
    }

    const queryString = `(@name: (${searchString}) => { $weight: 5.0 }) | (@description: (${searchString}))`; // | 

    // Use a redis client to do a real search
    const result = await client.ft.search(
      cacheKeyMapper.mapItemsIndex(),
      queryString,
      {
        LIMIT: { from: 0, size }
      },
    );

    // return deserialized search results
    return result.documents.map((doc) => itemDataSerializer.deserialize(doc.id, doc.value as any));
  }

  async itemsByUser(userId: string, opts: QueryOpts) {
    const queryString = `@ownerId: {${userId}}`;

    const sortCriteria = opts.sortBy && opts.direction && {
      BY: opts.sortBy,
      DIRECTIONS: opts.direction,
    };

    const result = await client.ft.search(
      cacheKeyMapper.mapItemsIndex(),
      queryString,
      {
        ON: 'HASH',
        SORTBY: sortCriteria,
        LIMIT: { from: opts.page * opts.perPage, size: opts.perPage }
      } as any,
    );

    console.log('>>> result.total:', result.total);
    console.log('>>> result.documents:', result.documents);
    console.log('>>> result.document.id:', result.documents[0].id.split('#')[1]);
    console.log('>>> result.document.value:', result.documents[0].value);

    return {
      totalPages: Math.ceil(result.total / opts.perPage),
      items: result.documents.map((doc) => itemDataSerializer.deserialize(doc.id.split('#')[1], doc.value as any)),
    };
  }
}
