import type { RequestHandler } from '@sveltejs/kit';
import { ItemHandler } from '$services/queries/items/items';
import { LikesHandler } from '$services/queries/likes';


const itemHandler = new ItemHandler();
const likesHandler = new LikesHandler(itemHandler);


export const post: RequestHandler<any, any> = async ({ params, locals }) => {
	if (!locals.session.userId) {
		return {
			status: 401,
			body: { message: 'You must login to do that' }
		};
	}

	await likesHandler.likeItem(params.id, locals.session.userId);
	const item = await itemHandler.getItem(params.id);

	return {
		status: 201,
		body: {
			item: {
				...item,
				endingAt: item.endingAt.toMillis(),
				createdAt: item.createdAt.toMillis()
			}
		}
	};
};


export const del: RequestHandler<any, any> = async ({ params, locals }) => {
	if (!locals.session.userId) {
		return {
			status: 401,
			body: { message: 'You must login to do that' }
		};
	}

	await likesHandler.unlikeItem(params.id, locals.session.userId);
	const item = await itemHandler.getItem(params.id);

	return {
		status: 201,
		body: {
			item: {
				...item,
				endingAt: item.endingAt.toMillis(),
				createdAt: item.createdAt.toMillis()
			}
		}
	};
};
