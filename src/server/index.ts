/**
 * Core Server
 */

import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as express from 'express';
import * as morgan from 'morgan';
import Accesses from 'accesses';

import log from './log-request';
import config from '../conf';

/**
 * Init app
 */
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 'loopback');

// Log
if (config.accesses && config.accesses.enable) {
	const accesses = new Accesses({
		appName: 'Misskey',
		port: config.accesses.port
	});

	app.use(accesses.express);
}

app.use(morgan(process.env.NODE_ENV == 'production' ? 'combined' : 'dev', {
	// create a write stream (in append mode)
	stream: config.accesslog ? fs.createWriteStream(config.accesslog) : null
}));

app.use((req, res, next) => {
	log(req);
	next();
});

// Drop request when without 'Host' header
app.use((req, res, next) => {
	if (!req.headers['host']) {
		res.sendStatus(400);
	} else {
		next();
	}
});

/**
 * Register modules
 */
app.use('/api', require('./api'));
app.use('/files', require('./file'));
app.use(require('./web'));

function createServer() {
	if (config.https) {
		const certs = {};
		Object.keys(config.https).forEach(k => {
			certs[k] = fs.readFileSync(config.https[k]);
		});
		return https.createServer(certs, app);
	} else {
		return http.createServer(app);
	}
}

export default () => new Promise(resolve => {
	const server = createServer();

	/**
	 * Steaming
	 */
	require('./api/streaming')(server);

	/**
	 * Server listen
	 */
	server.listen(config.port, resolve);
});
