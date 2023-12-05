import type { RequestHandler } from '@sveltejs/kit';
import { ItemHandler } from '$services/queries/items';

interface Params {
	id: string;
}

const itemHandler = new ItemHandler();

export const get: RequestHandler<Params, any> = async ({ url }) => {
	const term = url.searchParams.get('term');

	const items = ((await itemHandler.searchItems(term, 5)) || []).map((item) => {
		item.id = item.id.replace('items#', '');
		return item;
	});

	return {
		body: { results: items }
	};
};
