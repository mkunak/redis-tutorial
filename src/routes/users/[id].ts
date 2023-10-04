import type { RequestHandler } from '@sveltejs/kit';
import { UsersHandler } from '$services/queries/users';
import { LikesHandler } from '$services/queries/likes';
import { ItemHandler } from '$services/queries/items';

interface Params {
	id: string;
}

const usersHandler = new UsersHandler();
const likesHandler = new LikesHandler(new ItemHandler());

export const get: RequestHandler<Params, any> = async ({ params, locals }) => {
	const { id } = params;

	const user = await usersHandler.getUserById(id);
	const sharedItems = await likesHandler.commonLikedItems(id, locals.session.userId);
	const liked = await likesHandler.likedItems(id);

	return {
		body: {
			username: user.username,
			sharedItems: (sharedItems || []).map((item) => {
				return {
					...item,
					endingAt: item.endingAt.toMillis(),
					createdAt: item.createdAt.toMillis()
				};
			}),
			likedItems: (liked || []).map((item) => {
				return {
					...item,
					endingAt: item.endingAt.toMillis(),
					createdAt: item.createdAt.toMillis()
				};
			})
		}
	};
};
