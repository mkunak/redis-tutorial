import { client } from "$services/redis";
import { cacheKeyMapper } from "$services/keys";

const appRoutesToCache = [
  '/about',
  '/privacy',
  '/auth/signin',
  '/auth/signup',
];

export const getCachedPage = (route: string) => {
  if (appRoutesToCache.includes(route)) {
    return client.get(cacheKeyMapper.mapPage(route));
  }

  return null;
};

export const setCachedPage = (route: string, page: string) => {
  if (appRoutesToCache.includes(route)) {
    return client.set(cacheKeyMapper.mapPage(route), page, { EX: 2 });
  }
};
