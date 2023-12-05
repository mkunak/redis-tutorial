import { DateTime } from 'luxon';

import { cacheKeyMapper } from '$services/keys';
import { client, withLock, type IDataSerializer } from '$services/redis';
import type { CreateBidAttrs, Bid } from '$services/types';
import { ItemHandler } from './items';


const itemHandler = new ItemHandler();


class BidDataSerializer implements IDataSerializer<Bid, Bid> {
	private separator = ':';

  serialize(data: Bid) {
    return `${data.amount}${this.separator}${data.createdAt.toMillis()}`;
  };

  deserialize(data: string): Bid {
		const [amount, createdAt] = data.split(this.separator);

    return {
      amount: parseFloat(amount),
      createdAt: DateTime.fromMillis(parseInt(createdAt)),
    };
  };
}

const bidDataSerializer = new BidDataSerializer();


export const createBid = async (attrs: CreateBidAttrs) => {
	return withLock(attrs.itemId, async (signal: any) => {
		const item = await itemHandler.getItem(attrs.itemId);

		if (!item) {
			throw new Error(`Item with id ${attrs.itemId} does not exist`);
		}
		if (item.price >= attrs.amount) {
			throw new Error(`Item's bid is too low. Last bid is ${item.price}`);
		}
		if (item.endingAt.diff(DateTime.now()).toMillis() < 0) {
			throw new Error('Item closed to bidding');
		}

		const serialized = bidDataSerializer.serialize({
			amount: attrs.amount,
			createdAt: attrs.createdAt,
		});

		if (signal.expired) {
			throw new Error('Lock expired. Can not write any more data');
		}

		return Promise.all([
			client.rPush(cacheKeyMapper.mapItemBids(attrs.itemId), serialized),
			client.hSet(cacheKeyMapper.mapItem(attrs.itemId), {
				bids: item.bids + 1,
				price: attrs.amount,
				highestBidUserId: attrs.userId,
			}),
			client.zAdd(cacheKeyMapper.mapItemsPrice(), {
				value: attrs.itemId,
				score: attrs.amount,
			}),
		])
	});
};

export const createBidWithWatcher = async (attrs: CreateBidAttrs) => {
  return client.executeIsolated(async (isolatedClient) => {
		await isolatedClient.watch(cacheKeyMapper.mapItem(attrs.itemId));

		const item = await itemHandler.getItem(attrs.itemId);

		if (!item) {
			throw new Error(`Item with id ${attrs.itemId} does not exist`);
		}
		if (item.price >= attrs.amount) {
			throw new Error(`Item's bid is too low. Last bid is ${item.price}`);
		}
		if (item.endingAt.diff(DateTime.now()).toMillis() < 0) {
			throw new Error('Item closed to bidding');
		}

		const serialized = bidDataSerializer.serialize({
			amount: attrs.amount,
			createdAt: attrs.createdAt,
		});

		return isolatedClient
      .multi()
			.rPush(cacheKeyMapper.mapItemBids(attrs.itemId), serialized)
			.hSet(cacheKeyMapper.mapItem(attrs.itemId), {
				bids: item.bids + 1,
				price: attrs.amount,
				highestBidUserId: attrs.userId,
			})
      .zAdd(cacheKeyMapper.mapItemsPrice(), {
				value: attrs.itemId,
				score: attrs.amount,
			})
			.exec();
	});
};

export const getBidHistory = async (itemId: string, offset = 0, count = 10): Promise<Bid[]> => {
	const startIndex = -1 * offset - count;
	const stopIndex = -1 - offset;
	const range = await client.lRange(cacheKeyMapper.mapItemBids(itemId), startIndex, stopIndex);

	return range.map((bidItem) => bidDataSerializer.deserialize(bidItem));
};
