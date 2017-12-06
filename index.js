//setup
var express = require ('express');
var app = express();
var server = app.listen(3000, "0.0.0.0");

app.use(express.static('public'));

console.log("Server ON");

var socket = require('socket.io');

var io = socket(server);


//server
var clients = [];
var rooms = [];
var readyCounter = 0;
var videoReady = false;

io.sockets.on('connection', newConnection);

function newConnection (socket) {

	socket.emit('yourID', socket.id);
	var client = {
		id: socket.id,
		currentRoom: '',
		isReady: false
	};

	clients.push(client);
	
	//event listeners
	socket.on('loadVideo', loadVideo);
	socket.on('disconnect', clientDisconnection);
	socket.on('ready', clientReady);
	socket.on('enterRoom', enterRoom);
	socket.on('leaveRoom', leaveRoom);
	socket.on('createRoom', createRoom);
	socket.on('mensagemParaSala', mensagemParaSala)

	//event handlers
	function loadVideo (video) {
		console.log("Input console" + video);
		socket.broadcast.emit('loadVideoToAll', video);
		videoReady = false;
		readyCounter = 0;
	}
		
	function clientDisconnection () {
		for (var i = 0; i < clients.length; i++) {
			if (clients[i].id == socket.id)
				clients.splice(i,1);
		}
	}

	function clientReady () {
		readyCounter++;
		if (!videoReady)
			videoReady = true;

		socket.broadcast.emit('updateCounter', {Clients: clients, ReadyCounter: readyCounter});
		socket.emit('updateCounter', {Clients: clients, ReadyCounter: readyCounter});
		socket.emit('disableReady', {Clients: clients, ReadyCounter: readyCounter});

		if (readyCounter >= clients && videoReady) {
			socket.broadcast.emit('playVideo');
			socket.emit('playVideo');
			readyCounter = 0;
		}
	}

	function createRoom (videoURL) {
		room = {
			id: socket.id,
			videoReady: false,
			readyCounter: 0,
			numberOfClients: 0,
			videoURL: videoURL
		};

		//neeed to handle it?
		for (var i = 0; i < rooms.length; i++) {
			if (rooms[i].id == socket.id)
				console.log("sala ja existente");
			return 0;
		}

		rooms.push(room);
		var data = {
			room: room,
			rooms: rooms
		};
		socket.emit('createRoomSuccess', data);
		socket.broadcast.emit('showRooms', data);
		console.log(rooms);
	}

	function enterRoom (id) {
		for (var i = 0; i < rooms.length; i++) {
			if (rooms[i].id == id) {
				socket.join(id);
				rooms[i].numberOfClients++;
				console.log(rooms);
				socket.emit('loadVideo', rooms[i].videoURL);
			}
		}
		for (var i = 0; i < clients.length; i++) {
			if (clients[i].id == socket.id) {
				client.currentRoom = id;
			}
		}
	}

	function leaveRoom () {
		for (var i = 0; i < clients.length; i++) {
			if (clients[i].id == socket.id) {
				if (clients[i].currentRoom != '') {
					for (var j = 0; j < rooms.length; j++) {
						if (rooms[j].id == clients[i].currentRoom) {
							clients[i].currentRoom = '';
							rooms[j].numberOfClients--;
							if (clients[i].isReady)
								room[j].readyCounter--;
							clients[i].isReady = false;
							socket.leave(rooms[j].id);
						}
					}
				}
			}
		}
	}

	function mensagemParaSala() {
		io.to("123").emit('roomMessage', "mensagem!!!!");
	}
}