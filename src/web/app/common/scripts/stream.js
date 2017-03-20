const ReconnectingWebSocket = require('reconnecting-websocket');
import * as riot from 'riot';
import CONFIG from './config';

class Connection {
	constructor(me) {
		// BIND -----------------------------------
		this.onOpen =    this.onOpen.bind(this);
		this.onClose =   this.onClose.bind(this);
		this.onMessage = this.onMessage.bind(this);
		this.close =     this.close.bind(this);
		// ----------------------------------------

		this.state = 'initializing';
		this.stateEv = riot.observable();
		this.event = riot.observable();
		this.me = me;

		const host = CONFIG.apiUrl.replace('http', 'ws');
		this.socket = new ReconnectingWebSocket(`${host}?i=${me.token}`);
		this.socket.addEventListener('open', this.onOpen);
		this.socket.addEventListener('close', this.onClose);
		this.socket.addEventListener('message', this.onMessage);

		this.event.on('i_updated', me.update);
	}

	onOpen() {
		this.state = 'connected';
		this.stateEv.trigger('connected');
	}

	onClose() {
		this.state = 'reconnecting';
		this.stateEv.trigger('closed');
	}

	onMessage(message) {
		try {
			const msg = JSON.parse(message.data);
			if (msg.type) this.event.trigger(msg.type, msg.body);
		} catch(e) {
			// noop
		}
	}

	send(message) {
		// TODO: バッファリングしてつぎ接続した時に送信する
		if (this.state != 'connected') return;
		this.socket.send(JSON.stringify(message));
	}

	close() {
		this.socket.removeEventListener('open', this.onOpen);
		this.socket.removeEventListener('message', this.onMessage);
	}
}

export default Connection;
