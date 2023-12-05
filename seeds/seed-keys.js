// // Sessions
// export const sessionKey = (sessionId) => `sessions#${sessionId}`;

// // Cache
// export const pageCacheKey = (route) => `pagecache#${route}`;

// // Users
// export const usersKey = (userId) => `users#${userId}`;
// export const usernamesKey = () => 'usernames';
// export const usernamesUniqueKey = () => 'usernames:unique';
// export const usersItemsKey = (userId) => `users:items#${userId}`;
// export const usersBidsKey = (userId) => `users:bids#${userId}`;
// export const usersLikesKey = (userId) => `users:likes#${userId}`;

// // Items
// export const itemsKey = (itemId) => `items#${itemId}`;
// export const bidHistoryKey = (itemId) => `history#${itemId}`;
// export const itemsByBidsKey = () => 'items:bids';
// export const itemsByViewsKey = () => 'items:views';
// export const itemsByPriceKey = () => 'items:price';
// export const itemsByEndingAtKey = () => 'items:endingAt';
// export const itemsViewsKey = (itemId) => `items:views#${itemId}`;
// export const itemsIndexKey = () => 'idx:items';

import { cacheKeyMapper } from './keys.js';

// Sessions
export const sessionKey = (sessionId) => cacheKeyMapper.mapSession(sessionId);

// Cache
export const pageCacheKey = (route) => cacheKeyMapper.mapPage(route);

// Users
export const usersKey = (userId) => cacheKeyMapper.mapUser(userId);
export const usernamesKey = () => cacheKeyMapper.mapUsernamesWithId();
export const usernamesUniqueKey = () => cacheKeyMapper.mapUsernames();
export const usersItemsKey = (userId) => cacheKeyMapper.mapUserItems(userId);
export const usersBidsKey = (userId) => cacheKeyMapper.mapUserBids(userId);
export const usersLikesKey = (userId) => cacheKeyMapper.mapUserLikes(userId);

// Items
export const itemsKey = (itemId) => cacheKeyMapper.mapItem(itemId);
export const bidHistoryKey = (itemId) => cacheKeyMapper.mapItemBids(itemId);
export const itemsByBidsKey = () => cacheKeyMapper.mapItemsBids();
export const itemsByViewsKey = () => cacheKeyMapper.mapItemsViews();
export const itemsByPriceKey = () => cacheKeyMapper.mapItemsPrice();
export const itemsByEndingAtKey = () => cacheKeyMapper.mapItemsEndingAt();
export const itemsViewsKey = (itemId) => cacheKeyMapper.mapItemViews(itemId);
export const itemsIndexKey = () => cacheKeyMapper.mapItemsIndex();
