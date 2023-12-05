import { cacheKeyMapper } from "$services/keys";
import { client } from "$services/redis";
import type { ItemHandler } from "./items";

export class LikesHandler {
  constructor(private itemHandler: ItemHandler) {}

  async likeItem(itemId: string, userId: string) {
    const inserted = await client.sAdd(cacheKeyMapper.mapUserLikes(userId), itemId);

    if (inserted) {
      return await client.hIncrBy(cacheKeyMapper.mapItem(itemId), 'likes', 1);
    }
  }

  async unlikeItem(itemId: string, userId: string) {
    const removed = await client.sRem(cacheKeyMapper.mapUserLikes(userId), itemId);

    if (removed) {
      return await client.hIncrBy(cacheKeyMapper.mapItem(itemId), 'likes', -1);
    }
  }

  async userLikesItem(itemId: string, userId: string) {
    await client.sIsMember(cacheKeyMapper.mapUserLikes(userId), itemId);
  }

  async likedItems(userId: string) {
    const ids = await client.sMembers(cacheKeyMapper.mapUserLikes(userId));

    return await this.itemHandler.getItems(ids);
  }

  async commonLikedItems(...userIds: string[]) {
    const ids = await client.sInter(userIds.map((userId) => cacheKeyMapper.mapUserLikes(userId)));

    return await this.itemHandler.getItems(ids);
  }
}
