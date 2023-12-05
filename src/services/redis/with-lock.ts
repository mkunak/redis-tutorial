import { randomBytes } from 'crypto';

import { cacheKeyMapper } from '$services/keys';
import { client } from './client';

export const withLock = async (key: string, cb: (signal: any) => any) => {
	// Init few variables to control retry behavior
	const retryDelayMs = 100;
	let retries = 20;

	// Generate a random value to store at the lock key
	const lockToken = randomBytes(6).toString('hex');
	// Create the lock key
	const lockKey = cacheKeyMapper.mapLock(key);

	console.log('>>> key:', key);
	console.log('>>> lockKey:', lockKey);

	// Set up a while loop to implement the retry behavior,
	// trying to do a SET NX operation:
	// IF set was successful, THEN call the cb function
	// ELSE retry after delay
	while (retries >= 0) {
		retries--;

		// do a SET NX operation
		const response = await client.set(lockKey, lockToken, {
			NX: true, // create a new set only, if it does not exist
			PX: 2000, // delete this set value after 2 secs
		});

		// ELSE retry after delay
		if (!response) {
			await pause(retryDelayMs);
			continue;
		}

		// IF set was successful, THEN call the cb function
		try {
			const signal = { expired: false };

			setTimeout(() => {
				signal.expired = true;
			}, 2000);

			const result = await cb(signal);
			return result;
		} finally {
			// Unset the locked set
			// await client.del(lockKey);
			await client.unlock(lockKey, lockToken);
		}
	}
};

const buildClientProxy = () => {};

const pause = (duration: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
};
