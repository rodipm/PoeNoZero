'use strict';

class Client {
	constructor (clientID) {
		this.clientID = clientID;
	}

	getClientID (){
		return this.clientID;
	}
}

module.exports = Client;
exports.Client = Client;