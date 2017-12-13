//setup
var express = require ('express');
var app = express();
var server = app.listen(3000, "0.0.0.0");
app.use(express.static('public'));
var socket = require('socket.io');
var io = socket(server);
console.log("Server ON");

//require das classes
const Client = require('./Client.js');
const Room = require('./Room.js');

var clients = new Array();
var rooms = new Array();

//server
io.sockets.on('connection', newConnection);

function newConnection (socket) {
	var newClient = new Client(socket.id);
	clients.push(newClient);
	var newRooms = new Array();
	for (var i = 0; i < rooms.length; i++) {
		newRooms.push({roomID: rooms[i].getRoomID()});
	}
	socket.emit('updateRooms', newRooms);
	
	//event listeners
	socket.on('disconnect', clientDisconnection);
	socket.on('createRoom', createRoom);
	socket.on('enterRoom', enterRoom);
	socket.on('leaveRoom', leaveRoom);
	socket.on('ready', ready);
	socket.on('ownerPlay', ownerPlay);
	socket.on('ownerPause', ownerPause);
	socket.on('playStartedVideo', playStartedVideo);
	
	function clientDisconnection () {
		for (var i = 0; i < clients.length; i++) {
			if (clients[i].getClientID() == newClient.getClientID()) {
				leaveRoom();
				delete clients.splice(i, 1);
			}
		}
	}

	function createRoom (videoID) {
		for (var i = 0; i < rooms.length; i++) {
			if (rooms[i].getRoomID() == newClient.getClientID()) {
				return;
			}
		}

		var newRoom = new Room(newClient.getClientID(), videoID);
		rooms.push(newRoom);

		var newRooms = new Array();
		for (var i = 0; i < rooms.length; i++) {
			newRooms.push({roomID: rooms[i].getRoomID()});
		}

		socket.broadcast.emit('updateRooms', newRooms);
		enterRoom (newClient.getClientID());
	}

	function enterRoom (roomID) {
		for (var i = 0; i < rooms.length; i++) {
			if (rooms[i].getRoomID() == roomID && !rooms[i].hasClient(newClient)){
				rooms[i].addClient(newClient);
				newClient.setClientReady(false);
				newClient.setInRoom(true);
				newClient.setInRoomID(roomID);
				socket.join(rooms[i].getRoomID());
				updateClient();
				socket.emit('loadVideo', {videoID: rooms[i].getVideoID(), videoPlaying: rooms[i].getVideoPlaying()});

				if (rooms[i].getVideoPlaying())
					socket.to(rooms[i].getRoomID()).emit('getVideoTime', newClient.getClientID());
				return;
			}
		}
	}

	function leaveRoom () {
		for (var i = 0; i < rooms.length; i++) {
			if (rooms[i].hasClient(newClient)) {
				socket.leave(rooms[i].getRoomID());
				rooms[i].removeClient(newClient);
				newClient.setClientReady(false);
				newClient.setInRoom(false);
				newClient.setInRoomID('');
				socket.emit('reloadPage');
				updateClient();

				var updateCounters = {
					readyCounter: rooms[i].clientsReady(), 
					clients: rooms[i].numberOfClients()
				};
				socket.to(rooms[i].getRoomID()).emit('updateCounter', updateCounters);

				if (rooms[i].numberOfClients() <= 0) {
					delete rooms.splice(i, 1);
					var newRooms = new Array();
					for (var i = 0; i < rooms.length; i++) {
						newRooms.push({roomID: rooms[i].getRoomID()});
					}

					socket.broadcast.emit('updateRooms', newRooms);
				}

				else if (rooms[i].clientsReady() == rooms[i].numberOfClients() && !rooms[i].getVideoPlaying()) {
					io.in(rooms[i].getRoomID()).emit('playVideo');
				}
			}
		}
	}

	function ready () {
		newClient.setClientReady(true);
		updateClient();
		for (var i = 0; i < rooms.length; i++) {
			if (rooms[i].hasClient(newClient)) {
				var updateCounters = {
					readyCounter: rooms[i].clientsReady(), 
					clients: rooms[i].numberOfClients()
				};
				socket.emit('disableReady', updateCounters);
				socket.to(rooms[i].getRoomID()).emit('updateCounter', updateCounters);
			}
			if (rooms[i].clientsReady() == rooms[i].numberOfClients()) {
				io.in(rooms[i].getRoomID()).emit('playVideo');
				rooms[i].setVideoPlaying(true);
			}
		}
	}

	function updateClient () {
		socket.emit('updateClient', {ready: newClient.getClientReady(), inRoom: newClient.getInRoom(), inRoomID: newClient.getInRoomID(), myID: newClient.getClientID()});
	}

	function ownerPlay (roomID) {
		io.in(roomID).emit('playVideo');

		for (var i = 0; i < rooms.length; i++) {
			if (rooms[i].getRoomID() == roomID) {
				rooms[i].setVideoPlaying(true);
			}
		}
	}

	function ownerPause (roomID) {
		io.in(roomID).emit('pauseVideo');


		for (var i = 0; i < rooms.length; i++) {
			if (rooms[i].getRoomID() == roomID) {
				rooms[i].setVideoPlaying(false);
			}
		}
	}

	function playStartedVideo (data) {
		socket.to(data.requestID).emit('playStartedVideo', data.time);
	}
}