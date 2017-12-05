//setup
var express = require ('express');
var app = express();
var server = app.listen(3000, "0.0.0.0");

app.use(express.static('public'));

console.log("Server ON");

var socket = require('socket.io');

var io = socket(server);


//server
var clients = 0;
var readyCounter = 0;
var videoReady = false;

io.sockets.on('connection', newConnection);

function newConnection (socket) {

	clients++;
	console.log("new connection: " + socket.id);
	console.log(clients);
	
	//event listeners
	socket.on('message', msg);
	socket.on('disconnect', clientDisconnection);
	socket.on('ready', clientReady);

	//event handlers
	function msg (data) {
		console.log("Input console" + data);
		socket.broadcast.emit('message', data);
		videoReady = false;
		readyCounter = 0;
	}
		
	function clientDisconnection () {
		clients--;
		console.log(clients);
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
}