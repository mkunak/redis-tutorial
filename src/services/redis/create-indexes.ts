import { cacheKeyMapper } from "$services/keys";
import { SchemaFieldTypes } from "redis";
import { client } from "./client";

export const createIndexes = async () => {
  const itemsIndex = cacheKeyMapper.mapItemsIndex();
  console.log('>>> itemsIndex:', itemsIndex);

  const indexes = await client.ft._list();
  console.log('>>> indexes:', indexes);

  const indexExisted = indexes.find((index) => index === itemsIndex);

  if (indexExisted) {
    return;
  };

  return client.ft.create(
    itemsIndex,
    {
      name: { type: SchemaFieldTypes.TEXT, sortable: true },
      description: { type: SchemaFieldTypes.TEXT, sortable: false },
      ownerId: { type: SchemaFieldTypes.TAG, sortable: false },
      endingAt: { type: SchemaFieldTypes.NUMERIC, sortable: true },
      bids: { type: SchemaFieldTypes.NUMERIC, sortable: true },
      views: { type: SchemaFieldTypes.NUMERIC, sortable: true },
      price: { type: SchemaFieldTypes.NUMERIC, sortable: true },
      likes: { type: SchemaFieldTypes.NUMERIC, sortable: true },
    } as any,
    {
      ON: 'HASH',
      PREFIX: cacheKeyMapper.mapItem(),
    }
  );
};
