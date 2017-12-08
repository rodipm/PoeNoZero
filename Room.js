'use strict';

const Client = require('./Client.js');

class Room {
	constructor (roomID, roomName) {
		this.roomID = roomID;
		this.roomName = roomName;
		this.clientsConnected = new Array();
	}

	getRoomID () {
		return this.roomID;
	}

	getRoomName () {
		return this.roomName;
	}

	addClient(client) {
		this.clientsConnected.push(client);
		console.log(this.clientsConnected);
	}

}

module.exports = Room;