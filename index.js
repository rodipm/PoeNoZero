//setup
var express = require ('express');
var app = express();
var server = app.listen(3000, "0.0.0.0");
app.use(express.static('public'));
var socket = require('socket.io');
var io = socket(server);
console.log("Server ON");

const Client = require('./Client.js');
const Room = require('./Room.js');

var clients = new Array();
var rooms = new Array();

//server
io.sockets.on('connection', newConnection);

function newConnection (socket) {
	var newClient = new Client(socket.id);
	clients.push(newClient);

	console.log("New client connected: " + newClient.getClientID());
	
	//event listeners
	socket.on('disconnect', clientDisconnection);
	socket.on('createRoom', createRoom);
	socket.on('enterRoom', enterRoom);
	
	function clientDisconnection () {
		for (var i = 0; i < clients.length; i++) {
			if (clients[i].getClientID() == newClient.getClientID()) {
				console.log("Client disconnect: " + newClient.getClientID());
				delete clients.splice(i, 1);
			}
		}
	}

	function createRoom (videoID) {
		console.log("Tentando cirar sala");
		for (var i = 0; i < rooms.length; i++) {
			if (rooms[i].getRoomID() == newClient.getClientID()) {
				return;
			}
		}

		console.log("Criando sala: " + newClient.getClientID());
		var newRoom = new Room(newClient.getClientID(), videoID);
		rooms.push(newRoom);

		var newRooms = new Array();
		for (var i = 0; i < rooms.length; i++) {
			newRooms.push({roomID: rooms[i].getRoomID()});
		}

		socket.emit('updateRooms', newRooms);
		socket.broadcast.emit('updateRooms', newRooms);
	}

	function enterRoom (roomID) {
		for (var i = 0; i < rooms.length; i++) {
			if (rooms[i].getRoomID() == roomID && !rooms[i].hasClient(newClient)){
				rooms[i].addClient(newClient);
				socket.join(rooms[i].getRoomID());
				socket.to(rooms[i].getRoomID()).emit('message', rooms[i].getRoomID());
			}
		}
	}
}