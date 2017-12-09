var socket, rooms, player, carregando, ready, inRoom, fazAContagem, inRoomID, link;

var url = 'http://177.32.120.55:3000';

function onYouTubeIframeAPIReady() {
	socket = io.connect(url);

	socket.on('updateRooms', updateRooms);
	socket.on('playVideo', playVideo);
	socket.on('loadVideo', loadVideo);
	socket.on('updateCounter', updateCounter);
	socket.on('disableReady', disableReady);
	socket.on('updateClient', updateClient);
	socket.on('reloadPage', reloadPage);

	//seta os botoes de carregamento de video
	document.getElementById('control').innerHTML = '<form id="videoURLInputForm">' +
													  	'<div class="form-group">' +
			            									'<label for="videoURLLabel" style="font-size:25px;">Coloque o ID do video</label>' + '<hr>' +
			            									'<input type="text" style="width: 50%;margin: auto" class="form-control input-lg text-center" id="videoURLInput" placeholder="https://www.youtube.com/watch?v=...">' +
		          										'</div>' + '<hr>' +
														'<a href="#" class="btn btn-primary btn-lg" onclick="createRoom()">Carregar Video</a>' +
														'<p></p>' +
													'</form>'
	//some com o player vazio
	document.getElementById('video-placeholder').style.display = "none";

	player = new YT.Player('video-placeholder', {
		//width: 600,
		//height: 400,
		playerVars: { 
			color: 'white'
		},
		events: {
			onReady: onPlayerReady,
			onStateChange: onPlayerStateChange
		}
	});

}

function updateClient (data) {
	ready = data.ready;
	inRoom = data.inRoom;
	inRoomID = data.inRoomID;
	link = url + "#?" + inRoomID;
}

//le o texto do input
function createRoom () {
	var videoURL = document.getElementById('videoURLInput').value;

	//if (videoURL.length != 11){
		//alert("Por favor, o ID \""+ videoURL + "\" está incorreto.\nPor favor digite conforme o exemplo:\nUTfTd4yHAlg");
		//document.getElementById('videoURLInput').style.borderColor = "red";

	//} else
		socket.emit('createRoom', videoURL);
}

function updateRooms (newRooms) {
	if (inRoom)
		return;
	rooms = newRooms;
	console.log(rooms);
	document.getElementById('rooms').innerHTML = '';
	for (var i = 0; i < rooms.length; i++) {
		document.getElementById('rooms').innerHTML += '<a href="#" class="btn btn-primary btn-lg" onclick="enterRoom(\'' + rooms[i].roomID + '\')">Sala: ' + rooms[i].roomID + '</a>';
	}
}

function enterRoom (roomID) {
	console.log ("Tentando entrar em: " + roomID);
	socket.emit('enterRoom', roomID);
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
	carregando = true;
	player.loadVideoById(videoURLInput);
	player.playVideo();
	document.getElementById('video-placeholder').style.display = "inline";
	prepareButttons();
	prepareVideoControls();
}

//altera a div controls para reveber os botoes de ready
function prepareButttons() {
	document.getElementById('control').innerHTML = '<form id="controls">' +
														'<a href="#" class="btn btn-primary" onclick="clientReady()">Ready</a>' +
														'<p></p>' +
													'</form>';
	document.getElementById('rooms').innerHTML = '';

}

function disableReady (data) {
	document.getElementById('control').innerHTML =  '<div>' +
															'<form id="controls">' +
	                                                        	'<a href="#" class="btn btn-primary" disabled>' + data.readyCounter + '/' + data.clients + '</a>' +
	                                                        	'<p></p>' +
	                                                		'</form>' +
	                                                '</div>';
}

function onPlayerStateChange (event) {
    if (event.data == YT.PlayerState.PLAYING && carregando) {
    	player.seekTo(0);
		player.pauseVideo();
		carregando = false;
    }
}

function clientReady () {
	socket.emit('ready');
	ready = true;
}

//funcao chamada pelo servidor para cada vez que alguem da ready ter controle sobre o contador de 
function updateCounter (data) {
	if (ready)
		document.getElementById('control').innerHTML =  '<div>' +
															'<form id="controls">' +
	                                                        	'<a href="#" class="btn btn-primary" disabled>' + data.readyCounter + '/' + data.clients + '</a>' +
	                                                        	'<p></p>' +
	                                                    	'</form>' +
	                                                    '</div>';
}

function prepareVideoControls () {
	console.log(link);
	document.getElementById('videoControls').innerHTML =	'<hr>' +
															'<div style="margin:0">' + 
																'<input type="text" style="width: 50%;margin: auto" class="form-control input-lg text-center" id="roomURL" value=\"' + link + '\" onclick="copy()" readonly>' + 
														    '</div>' +
														    '<hr>';

	document.getElementById('videoControls').innerHTML +=  '<a href="#" class="btn btn-primary" onclick="leaveRoom()">Sair</a>';
}

function leaveRoom () {
	socket.emit ('leaveRoom');
}

function reloadPage () {
	location.replace(url);
}

function onPlayerReady (event) {
	var hash = window.location.hash;
	var roomID = hash.substr(2, hash.length);
	enterRoom(roomID);
}

function copy () {
	var linkCopy = document.getElementById('roomURL');
	linkCopy.select();
	document.execCommand("Copy");
	document.getElementById('alerts').innerHTML =   '<hr>' + '<div class="alert alert-success fade in">' + '<p>' + 'Link copiado com sucesso' + '<p>' + '</div>';
}