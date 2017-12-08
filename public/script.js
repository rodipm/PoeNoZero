var socket;
var rooms;

function onYouTubeIframeAPIReady() {
	socket = io.connect('http://177.32.120.55:3000');

	socket.on('message', handleMessage);
	socket.on('updateRooms', updateRooms);

	//seta os botoes de carregamento de video
	document.getElementById('control').innerHTML = '<form id="videoURLInputForm">' +
													  	'<div class="form-group">' +
			            									'<label for="videoURLLabel" style="font-size:25px;">Insira o nome da sala</label>' + '<hr>' +
			            									'<input type="text" style="width: 50%;margin: auto" class="form-control input-lg text-center" id="videoURLInput" placeholder="Nome Da Sala">' +
		          										'</div>' + '<hr>' +
														'<a href="#" class="btn btn-primary btn-lg" onclick="createRoom()">Criar Sala</a>' +
														'<p></p>' +
													'</form>'
	//some com o player vazio
	document.getElementById('video-placeholder').style.display = "none";
}

//lida com as mensagens recebidas pelo servidor
function handleMessage (data) {
	console.log("Input: " + data);
	loadVideo(data);
}

//le o texto do input
function createRoom () {
	var roomName = document.getElementById('videoURLInput').value;
	console.log(roomName);
	socket.emit('createRoom', roomName);
}

function updateRooms (newRooms) {
	console.log("updating...");
	rooms = newRooms;
	console.log(rooms);
	document.getElementById('rooms').innerHTML = '';
	for (var i = 0; i < rooms.length; i++) {
		document.getElementById('rooms').innerHTML += '<a href="#" class="btn btn-primary btn-lg" onclick="enterRoom(\'' + rooms[i].roomID + '\')">Sala: ' + rooms[i].roomName + '</a>';
	}
}

function enterRoom (roomID) {
	console.log ("Tentando entrar em: " + roomID);
	socket.emit('enterRoom', roomID);
}