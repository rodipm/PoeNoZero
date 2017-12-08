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
			if (this.clientsInRoom[i].getIsReady)
				clientsReady++;
		}
	}

	getClientsInRoom () {
		return this.clientsInRoom;
	}

	addClient (clientID, socket) {
		var thisClient = new Client(clientID);
		if (!this.hasClient(clientID)) {
			console.log("adicionando cliente a sala");
			this.clientsInRoom.push(thisClient);
			this.numberOfClients = this.clientsInRoom.length;
			socket.join(this.roomID);
			thisClient.setIsReady(false);
			console.log(this.clientsInRoom[0]);
		}
	}

	removeClient (clientID, socket) {
		var thisClient = new Client(clientID);
		for (var i = 0; i < this.clientsInRoom.length; i++)
			if (this.clientsInRoom[i] == thisClient) {
				socket.leave(this.roomID);
				this.clientsInRoom.splice(i, 1);
				this.numberOfClients = this.clientsInRoom.length;
			}
	}

	hasClient (clientID) {
		var thisClient = new Client(clientID);
		console.log("hasClient? ");
		console.log(this.clientsInRoom.length);
		for (var i = 0; i < this.clientsInRoom.length; i++) {
			if (this.clientsInRoom[i].getClientID() == thisClient.getClientID()){
				console.log("encontrou!");
				return true;
			}
		}
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
			if (rooms[i].hasClient(newClient.getClientID())) {
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
				if (!rooms[i].hasClient(newClient.getClientID())) {
					rooms[i].addClient(newClient.getClientID(), socket);
					socket.emit('loadVideo', rooms[i].videoURL);
				}
			}
		}
	}

	function ready () {
		console.log("server Ready" + rooms.length);
		newClient.setIsReady(true);

		for (var i = 0; i < rooms.length; i++) {
			if (rooms[i].hasClient(newClient.getClientID())) {
				console.log("esta na sala");
				console.log(rooms[i].getNumberOfClientsReady());
				io.to(rooms[i].getRoomID()).emit('updateCounter', {Clients: rooms[i].getNumberOfClients(), ReadyCounter: rooms[i].getNumberOfClientsReady()});
				socket.emit('disableReady', {Clients: rooms[i].getNumberOfClients(), ReadyCounter: rooms[i].getNumberOfClientsReady()});

				if (rooms[i].getNumberOfClientsReady() >= rooms[i].getNumberOfClients()) {
					socket.broadcast.emit('playVideo');
					socket.emit('playVideo');
				}
			}
		}
	}
}