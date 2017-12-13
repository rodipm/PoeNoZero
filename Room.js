'use strict';

const Client = require('./Client.js');

class Room {
	constructor (roomID, videoID) {
		this.roomID = roomID;
		this.clientsConnected = new Array();
		this.videoID = videoID;
		this.videoPlaying = false;
	}

	getRoomID () {
		return this.roomID;
	}


	getVideoID () {
		return this.videoID;
	}

	getVideoPlaying () {
		return this.videoPlaying;
	}

	setVideoPlaying (state) {
		this.videoPlaying = state;
	}

	addClient (client) {
		this.clientsConnected.push(client);
	}

	removeClient (client) {
		for (var i = 0; i < this.clientsConnected.length; i++) {
			if (this.clientsConnected[i].getClientID() == client.getClientID()) {
				delete this.clientsConnected.splice(i, 1);
			}
		}
	}

	hasClient (client) {
		for (var i = 0; i < this.clientsConnected.length; i++) {
			if (this.clientsConnected[i].getClientID() == client.getClientID())
				return true;
		}
		return false;
	}

	clientsReady () {
		var number = 0;
		for (var i = 0; i < this.clientsConnected.length; i++) {
			if (this.clientsConnected[i].getClientReady()) {
				number++;
			}
		}
		return number;
	}

	numberOfClients () {
		var number = 0;
		for (var i = 0; i < this.clientsConnected.length; i++) {
			number++;
		}
		return number;
	}
}

module.exports = Room;