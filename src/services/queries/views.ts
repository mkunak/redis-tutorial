import { cacheKeyMapper } from "$services/keys";
import { client } from "$services/redis";

export const incrementView = async (itemId: string, userId: string) => {
  // const inserted = await client.pfAdd(cacheKeyMapper.mapItemViews(itemId), userId);

  // if (inserted) {
  //   return Promise.all([
  //     client.hIncrBy(cacheKeyMapper.mapItem(itemId), 'views', 1),
  //     client.zIncrBy(cacheKeyMapper.mapItemsViews(), 1, itemId),
  //   ]);
  // }
  // ^^v^^
  client.incrementView(itemId, userId);
};
