import type { RequestHandler } from '@sveltejs/kit';
import { ItemHandler } from '$services/queries/items';

const itemHandler = new ItemHandler();

export const get: RequestHandler<any, any> = async () => {
	const [endingSoonest, mostViews, highestPrice] = await Promise.all([
		itemHandler.sortItemsByEndingTime('ASC', 0, 10),
		itemHandler.sortItemsByViews('DESC', 0, 10),
		itemHandler.sortItemsByPrice('DESC', 0, 10),
	]);

	return {
		body: { endingSoonest, mostViews, highestPrice }
	};
};
