import { createClient, defineScript } from 'redis';

import { cacheKeyMapper } from '$services/keys';

const client = createClient({
	socket: {
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT)
	},
	password: process.env.REDIS_PW,
	scripts: {
		incrementOneAndStore: defineScript({
			NUMBER_OF_KEYS: 1,
			SCRIPT: `
				local incrementedCount = 1 + tonumber(ARGV[1])
				local incrementedCountKey = KEYS[1]
				return redis.call('SET', incrementedCountKey, incrementedCount)
			`,
			transformArguments(key: string, value: number) {
				return [key, value.toString()];
				// ['books:count', '4']
				// EVALSHA <ID> 'books:views' '4'
			},
			transformReply(reply, preserved) {
				console.log('>>> client > transformReply > reply:', reply);
				console.log('>>> client > transformReply > preserved:', preserved);
				return reply === 'OK' ? 'test is super' : 'bad';
			},
		}),
		incrementView: defineScript({
			NUMBER_OF_KEYS: 3,
			SCRIPT: `
				local itemViewsKey = KEYS[1]
				local itemKey = KEYS[2]
				local itemsViewsKey = KEYS[3]

				local itemId = ARGV[1]
				local userId = ARGV[2]

				local inserted = redis.call('PFADD', itemViewsKey, userId)
				if inserted == 1 then
					redis.call('HINCRBY', itemKey, 'views', 1)
					redis.call('ZINCRBY', itemsViewsKey, 1, itemId)
				end
			`,
			transformArguments(itemId: string, userId: string) {
				return [
					cacheKeyMapper.mapItemViews(itemId),
					cacheKeyMapper.mapItem(itemId),
					cacheKeyMapper.mapItemsViews(),
					itemId,
					userId,
				];
			},
			transformReply(reply, preserved) {},
		}),
	},
});

client.on('connect', async () => {
	const reply = await client.incrementOneAndStore('books:count', 4);
	console.log('>>> client > on connect > reply:', reply);

	const result = await client.get('books:count');
	console.log('>>> client > on connect > books:count result:', result);
});
client.on('error', (err) => console.error(err));
client.connect();

export { client };
