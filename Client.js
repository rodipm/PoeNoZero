'use strict';

class Client {
	constructor (clientID) {
		this.clientID = clientID;
		this.clientReady = false;
		this.inRoom = false;
		this.inRoomID = '';
	}

	getClientID (){
		return this.clientID;
	}

	getClientReady () {
		return this.clientReady;
	}

	getInRoom () {
		return this.inRoom;
	}

	getInRoomID () {
		return this.inRoomID;
	}

	setClientReady (ready) {
		this.clientReady = ready;
	}

	setInRoom (inRoom) {
		this.inRoom = inRoom;
	}

	setInRoomID (inRoomID) {
		this.inRoomID = inRoomID;
	}
}

module.exports = Client;