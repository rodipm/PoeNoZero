'use strict';

const Client = require('./Client.js');

class Room {
	constructor (roomID, videoID) {
		this.roomID = roomID;
		this.clientsConnected = new Array();
		this.videoID = videoID;
	}

	getRoomID () {
		return this.roomID;
	}


	getVideoID () {
		return this.videoID;
	}

	addClient (client) {
		this.clientsConnected.push(client);
		console.log(this.clientsConnected);
	}

	hasClient (client) {
		for (var i = 0; i < this.clientsConnected.length; i++) {
			if (this.clientsConnected[i].getClientID() == client.getClientID())
				return true;
		}
		return false;
	}
}

module.exports = Room;