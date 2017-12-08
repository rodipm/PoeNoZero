var player, fazAContagem, ready = false, carregando = false;
var myID;
var rooms = new Array();

var socket;
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
			console.log("adding client to room");
		if (!hasClient(Client)) {
			this.clientsInRoom.push(Client);
			this.numberOfClients = this.clientsInRoom.length;
			socket.join(this.getRoomID);
			client.setIsReady(false);
		}
	}

	removeClient (client, socket) {
		for (var i = 0; i < this.clientsInRoom.length; i++)
			if (this.clientsInRoom[i] = client) {
				socket.leave(this.getRoomID);
				this.clientsInRoom.splice(i, 1);
				this.numberOfClients = this.clientsInRoom.length;
			}
	}

	hasClient (client) {
		console.log("hasClient");
		console.log(this.clientsInRoom.length);
		for (var i = 0; i < this.clientsInRoom.length; i++)
			if (this.clientsInRoom[i].getClientID == client.getClientID)
				return true;
		return false;
	}
}

function onYouTubeIframeAPIReady() {
	//socket setup
	socket = io.connect('http://177.32.120.55:3000');                      //RODRIGO
	//socket = io.connect('http://189.62.21.220:3000');                      //ARTHUR
	//socket = io.connect('http://localhost:3000');                          //LOCAL

	//emit handlers
	socket.on('playVideo', playVideo);
	socket.on('updateCounter', updateCounter);
	socket.on('disableReady', disableRady);
	//handlers
	socket.on('greetings', greetings);
	socket.on('createRoomSucces', createRoomSucces);
	socket.on('updateRooms', updateRooms);
	socket.on('loadVideo', loadVideo);


	//seta os botoes de carregamento de video
	document.getElementById('control').innerHTML = '<form id="videoURLInputForm">' +
													  	'<div class="form-group">' +
			            									'<label for="videoURLLabel" style="font-size:25px;">Coloque o ID do video</label>' + '<hr>' +
			            									'<input type="text" style="width: 50%;margin: auto" class="form-control input-lg text-center" id="videoURLInput" placeholder="https://www.youtube.com/watch?v=...">' +
		          										'</div>' + '<hr>' +
														'<a href="#" class="btn btn-primary btn-lg" onclick="readID()">Carregar Video</a>' +
														'<p></p>' +
													'</form>'
	//some com o player vazio
	document.getElementById('video-placeholder').style.display = "none";

	//seta o player do YT pela framwork
	player = new YT.Player('video-placeholder', {
		//width: 600,
		//height: 400,
		playerVars: { 
			color: 'white'
		},
		events: {
			onStateChange: onPlayerStateChange
		}
	});
}

//le o texto do input
function readID () {
	var videoURL = document.getElementById('videoURLInput').value;
	if (videoURL.length != 11){
		alert("Por favor, o ID \""+ videoURL + "\" está incorreto.\nPor favor digite conforme o exemplo:\nUTfTd4yHAlg");
		document.getElementById('videoURLInput').style.borderColor = "red";
	} else
		socket.emit('createRoom', videoURL);
}

//funcao chamada pelo servidor para dar play em todos os videos ao mesmo tempo
function playVideo () {
	var tempoRestante = 3;

	clearInterval(fazAContagem);
	document.getElementById('control').innerHTML = '';
	fazAContagem = setInterval(function(){
			document.getElementById('contagem').innerHTML = '<div class="alert alert-success text-center">' + 'O video inicia em: ' + tempoRestante-- + '</div>';
			console.log(tempoRestante);
			if (tempoRestante == -1) {
				clearInterval(fazAContagem);
				document.getElementById('contagem').innerHTML = ''; 
				player.playVideo();
			}
		}, 1000);
}

//carrega o video no player
function loadVideo (videoURLInput) {
	ready = false;
	carregando = true;
	player.loadVideoById(videoURLInput);
	player.playVideo();
	document.getElementById('video-placeholder').style.display = "inline";
	prepareButttons();
}

//altera a div controls para reveber os botoes de ready
function prepareButttons() {
	document.getElementById('control').innerHTML = '<form id="controls">' +
														'<a href="#" class="btn btn-primary" onclick="clientReady()">Ready</a>' +
														'<p></p>' +
													'</form>';

}

//envia mensagem de ready do clinete para o servidor
function clientReady () {
	socket.emit('ready');
	ready = true;
}

//funcao chamada pelo servidor para cada vez que alguem da ready ter controle sobre o contador de 
function updateCounter (data) {
	console.log(data.Clients);
	console.log(data.ReadyCounter);
	if (ready)
		document.getElementById('control').innerHTML =  '<div>' +
															'<form id="controls">' +
	                                                        	'<a href="#" class="btn btn-primary" disabled>' + data.ReadyCounter + '/' + data.Clients + '</a>' +
	                                                        	'<p></p>' +
	                                                    	'</form>' +
	                                                    '</div>';
}

function disableRady (data) {
	document.getElementById('control').innerHTML =  '<div>' +
															'<form id="controls">' +
	                                                        	'<a href="#" class="btn btn-primary" disabled>' + data.ReadyCounter + '/' + data.Clients + '</a>' +
	                                                        	'<p></p>' +
	                                                		'</form>' +
	                                                '</div>';
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && carregando) {
    	player.seekTo(0);
		player.pauseVideo();
		carregando = false;
    }
}

function greetings (data) {
	myID = data.ClientID;
	rooms = data.Rooms;
	console.log ("geetings: " + myID + ', ' + rooms);
	updateRooms(data.Rooms);
}

function createRoomSucces (newRooms) {
	socket.emit('enterRoom', myID);
	updateRooms(newRooms);
}

function updateRooms (newRooms) {
	console.log(newRooms);
	rooms = newRooms;
	console.log(rooms[0]);

	document.getElementById('rooms').innerHTML = '';

	for (var i = 0; i < rooms.length; i++) {
		var rid = rooms[i].roomID;
		document.getElementById('rooms').innerHTML = '<a href="#" class="btn btn-primary" onclick="enterRoom(' + rid + ')">Sala 1</a>';
	}
}

function enterRoom (roomID) {
	socket.emit('enterRoom', roomID);
}

function clientReady() {
	console.log("client Ready");
	socket.emit('ready');
}