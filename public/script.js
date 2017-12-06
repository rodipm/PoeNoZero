var player, fazAContagem, ready = false, carregando = false, myID;

var socket;

function onYouTubeIframeAPIReady() {
	//socket setup
	socket = io.connect('http://177.32.120.55:3000');                      //RODRIGO
	//socket = io.connect('http://189.62.21.220:3000');                      //ARTHUR
	//socket = io.connect('http://localhost:3000');                          //LOCAL

	//socket events
	socket.on('yourID', yourID)
	socket.on('loadVideo', loadVideo);
	socket.on('playVideo', playVideo);
	socket.on('updateCounter', updateCounter);
	socket.on('disableReady', disableRady);
	socket.on('roomMessage', handleRoomMessage);
	socket.on('createRoomSuccess', roomCreated);
	socket.on('showRooms', showRooms);

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

///HTML STUFF
//le o texto do input
function readID () {
	var videoURL = document.getElementById('videoURLInput').value;
	socket.emit('message', videoURL);
	if (videoURL.length != 11){
		alert("Por favor, o ID \""+ videoURL + "\" está incorreto.\nPor favor digite conforme o exemplo:\nUTfTd4yHAlg");
		document.getElementById('videoURLInput').style.borderColor = "red";

	}else {
		createRoom(videoURL);
	}

}

//altera a div controls para reveber os botoes de ready
function prepareButttons() {
	document.getElementById('control').innerHTML = '<form id="controls">' +
														'<a href="#" class="btn btn-primary" onclick="clientReady()">Ready</a>' +
														'<p></p>' +
													'</form>';

}

//funcao chamada pelo servidor para cada vez que alguem da ready atualizar a contagem de pessoas prontas/clientes
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

//desabilita o botao de ready localmente
function disableRady (data) {
	document.getElementById('control').innerHTML =  '<div>' +
															'<form id="controls">' +
	                                                        	'<a href="#" class="btn btn-primary" disabled>' + data.ReadyCounter + '/' + data.Clients + '</a>' +
	                                                        	'<p></p>' +
	                                                		'</form>' +
	                                                '</div>';
}

///VIDEO STUFF

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
	console.log("katiau");
	ready = false;
	carregando = true;
	player.loadVideoById(videoURLInput);
	player.playVideo();
	document.getElementById('video-placeholder').style.display = "inline";
	prepareButttons();
}


//envia mensagem de ready do clinete para o servidor
function clientReady () {
	socket.emit('ready');
	ready = true;
}

//handler do evento de playerStateChange
function onPlayerStateChange (event) {
    if (event.data == YT.PlayerState.PLAYING && carregando) {
    	player.seekTo(0);
		player.pauseVideo();
		carregando = false;
    }
}

function handleMessage (data) {
	console.log("Input: " + data);
	loadVideo(data);
}

//ROOMS STUFF
//recieve my id when connected
function yourID (ID) {
	myID = ID;
}
//caller
function createRoom (videoURL) {
	console.log("createRoom do cliente");
	socket.emit('createRoom', videoURL);
}
//handler
function roomCreated (data) {
	console.log("roomCreatedCliente");
	enterRoom(myID);
}
function showRooms (data) {
	document.getElementById('rooms').innerHTML = '';
	for (var i = 0; i < data.rooms.length; i++) {
		document.getElementById('rooms').innerHTML += '<a href="#" class="btn btn-primary" onclick="enterRoom("' + data.rooms[i].id + '")">Sala' + i + '</a>';
	}
}
//caller
function enterRoom (id) {
	console.log("enterRoomCliente");
	socket.emit('enterRoom', id);
}
//caller
function leaveRoom () {
	socket.emit('leaveRoom');
}
//handler
function handleRoomMessage (message) {
	console.log("mensagem para a sala" + message);
}

function mensagemParaSala () {
	socket.emit('mensagemParaSala');
}