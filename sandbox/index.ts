import 'dotenv/config';
import { client } from '../src/services/redis';

import { cacheKeyMapper } from '../src/services/keys';

const run = async () => {
  const page = cacheKeyMapper.mapPage('/about');
  const user = cacheKeyMapper.mapUser('wiI-hds36-sdfha');
  const session = cacheKeyMapper.mapSession('ses-h38d6-eiw38');
  const usernames = cacheKeyMapper.mapUsernames();
  const like = cacheKeyMapper.mapUserLikes('jsi0-sje-23sdj');
  const usernamesItems = cacheKeyMapper.mapUsernamesWithId();
  const itemsViews = cacheKeyMapper.mapItemsViews();
  const itemsEndingAt = cacheKeyMapper.mapItemsEndingAt();
  const itemViews = cacheKeyMapper.mapItemViews('jsi0-sje-23sdj');
  const bids = cacheKeyMapper.mapItemBids('jsi0-sje-23sdj');
  const itemsPrice = cacheKeyMapper.mapItemsPrice();

  console.log('>>> page:', page);
  console.log('>>> user:', user);
  console.log('>>> session:', session);
  console.log('>>> usernames:', usernames);
  console.log('>>> like:', like);
  console.log('>>> usernamesItems:', usernamesItems);
  console.log('>>> itemsViews:', itemsViews);
  console.log('>>> itemsEndingAt:', itemsEndingAt);
  console.log('>>> itemViews:', itemViews);
  console.log('>>> bids:', bids);
  console.log('>>> itemsPrice:', itemsPrice);
  console.log('>>> hex -> dec:', parseInt('22ab6c6', 16));

  const redisClientData = await client.sMembers(usernames);
  console.log('>>> redisClientData:', redisClientData);
};

run();
