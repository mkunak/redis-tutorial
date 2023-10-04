import type { RequestHandler } from '@sveltejs/kit';
import { ItemHandler, getSimilarItems } from '$services/queries/items';
import { incrementView } from '$services/queries/views';
import { LikesHandler } from '$services/queries/likes';
import { getBidHistory } from '$services/queries/bids';

interface Params {
	id: string;
}

const itemHandler = new ItemHandler();
const likesHandler = new LikesHandler(itemHandler);

export const get: RequestHandler<Params, any> = async ({ params, locals }) => {
	const item = await itemHandler.getItem(params.id);

	if (!item) {
		return {
			status: 404,
			body: {
				message: 'Item not found'
			}
		};
	}

	await incrementView(item.id, locals.session.userId);
	const userLikes = await likesHandler.userLikesItem(item.id, locals.session.userId);
	const history = await getBidHistory(item.id);
	const similarItems = ((await getSimilarItems(item.id)) as any) || [];

	const userHasHighBid = item.highestBidUserId === locals.session.userId;

	return {
		body: {
			item: {
				...item,
				endingAt: item.endingAt.toMillis(),
				createdAt: item.createdAt.toMillis()
			},
			userLikes,
			userHasHighBid,
			history,
			similarItems
		}
	};
};
