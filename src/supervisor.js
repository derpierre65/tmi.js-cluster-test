import {RedisChannelDistributor, Supervisor} from 'tmi.js-cluster';
import {database, redisClient} from './db.js';

redisClient
	.connect()
	.then(() => {
		const manager = new Supervisor({
			database,
			redisClient,
			channelDistributor: RedisChannelDistributor,
		}, {
			file: __dirname + '/bot.js',
			autoScale: {
				processes: {
					min: 1,
					max: 5,
				},
				thresholds: {
					channels: 50,
					scaleUp: 75,
					scaleDown: 50,
				},
			},
		});

		manager.on('supervisor.terminate', (id) => {
			console.log('[supervisor] terminate', id);
		});

		manager.on('process.create', (id) => {
			console.log('[supervisor] new process created, id:', id);
		});

		manager.on('tmi.join_error', (...args) => {
			console.log('[supervisor] can\'t join channel:', ...args);
		});

		manager.spawn();
	})
	.catch((error) => {
		console.error('Can\'t connect to redis.', error);
	});