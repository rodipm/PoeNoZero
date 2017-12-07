//setup
var express = require ('express');
var app = express();
var server = app.listen(3000, "0.0.0.0");
app.use(express.static('public'));
console.log("Server ON");
var socket = require('socket.io');
var io = socket(server);

class Client {
	constructor (clientID) {
		this.clientID = clientID;
		this.currentRoom = '';
		this.isReady = false;
	}

	getClientID () {
		return this.clientID;
	}

	getCurrentRoom () {
		return this.currentRoom;
	}

	getIsReady () {
		return this.isReady;
	}

	setCurrentRoom (currentRoom) {
		this.currentRoom = currentRoom;
	}

	setIsReady (isReady) {
		this.isReady = isReady;
	}
}

class Room {
	constructor (roomID, videoURL) {
		this.roomID = roomID;
		this.numberOfClients = 0;
		this.videoURL = videoURL;
		this.numberOfClientsReady = 0;
		this.clientsInRoom = new Array();
	}

	getRoomID () {
		return this.roomID;
	}

	getNumberOfClients () {
		return this.numberOfClients;
	}

	getVideoURL () {
		return this.videoURL;
	}

	getNumberOfClientsReady () {
		var clientsReady = 0;
		for (var i = 0; i < this.clientsInRoom.length; i++) {
			if (clientsInRoom[i].getIsReady)
				clientsReady++;
		}
	}

	getClientsInRoom () {
		return this.getClientsInRoom;
	}

	addClient (client, socket) {
		if (!this.hasClient(Client)) {
			console.log("adicionando cliente a sala");
			this.clientsInRoom.push(Client);
			this.numberOfClients = this.clientsInRoom.length;
			socket.join(this.roomID);
			client.setIsReady(false);
		}
	}

	removeClient (client, socket) {
		for (var i = 0; i < this.clientsInRoom.length; i++)
			if (this.clientsInRoom[i] == client) {
				socket.leave(this.roomID);
				this.clientsInRoom.splice(i, 1);
				this.numberOfClients = this.clientsInRoom.length;
			}
	}

	hasClient (thisClient) {
		console.log("hasClient? " + thisClient.getClientID());
		console.log(this.clientsInRoom.length);
		for (var i = 0; i < this.clientsInRoom.length; i++)
			if (this.clientsInRoom[i].getClientID() == thisClient.getClientID())
				return true;
		return false;
	}
}

//server
var clients = new Array();
var rooms = new Array();

io.sockets.on('connection', newConnection);

function newConnection (socket) {
	
	//dealing with a new connection
	var newClient = new Client (socket.id);
	clients.push(newClient);
	console.log(newClient.getClientID());
	socket.emit ('greetings', {ClientID: newClient.getClientID(), Rooms: rooms});

	//event listeners
	socket.on('disconnect', clientDisconnection);
	socket.on('createRoom', createRoom);
	socket.on('enterRoom', enterRoom);
	socket.on('ready', ready)

	//dealing with client disconnection
	function clientDisconnection () {
		for (var i = 0; i < rooms.length; i++) {
			if (rooms[i].hasClient(newClient)) {
				rooms[i].removeClient(newClient, socket);
				if (rooms[i].getNumberOfClients() == 0) {
					delete rooms.splice(i, 1);
					socket.broadcast.emit('updateRooms', rooms);
					socket.emit('updateRooms', rooms);
				}

			}
		}
		for (var i = 0; i < clients.length; i++) {
			if (clients[i].getClientID() == newClient.getClientID())
				delete clients.splice(i, 1);
		}
	}


	//event handlers
	function createRoom (videoURL) {
		for (var i = 0; i < rooms.length; i++) {
			if (rooms[i].getRoomID() == newClient.getClientID())
				return;
		}
		var newRoom = new Room(newClient.getClientID(), videoURL);
		rooms.push(newRoom);
		socket.emit('createRoomSucces', rooms);
		socket.broadcast.emit('updateRooms', rooms);
	}
	
	function enterRoom (roomID) {
		console.log("tentando entrar na sala");
		for (var i = 0; i < rooms.length; i++) {
			console.log("no for, " + rooms.length + ", " + roomID);
			console.log(rooms[i].getRoomID());
			if (rooms[i].getRoomID() == roomID) {
				console.log("achou");
				if (!rooms[i].hasClient(newClient)) {
					rooms[i].addClient(newClient, socket);
					socket.emit('loadVideo', rooms[i].videoURL);
				}
			}
		}
	}

	function ready () {
		console.log("server Ready" + rooms.length);
		newClient.setIsReady(true);

		for (var i = 0; i < rooms.length; i++) {
			if (rooms[i].hasClient(newClient)) {
				console.log("esta na sala");
				console.log(clientRoom.getNumberOfClientsReady());
				io.to(rooms[i].getRoomID()).emit('updateCounter', {Clients: clientRoom.getNumberOfClients(), ReadyCounter: clientRoom.getNumberOfClientsReady()});
				socket.emit('disableReady', {Clients: rooms[i].getNumberOfClients(), ReadyCounter: rooms[i].getNumberOfClientsReady()});

				if (rooms[i].getNumberOfClientsReady() >= rooms[i].getNumberOfClients()) {
					socket.broadcast.emit('playVideo');
					socket.emit('playVideo');
				}
			}
		}
	}
}