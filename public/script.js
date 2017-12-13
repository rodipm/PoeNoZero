/********** VARS **********/
//socket do client
var socket;
//array de salas disponiveis
var rooms;
//player de video (iframeAPI)
var player;
//controles de video e cliente
var carregando, ready, inRoom, inRoomID, link ,myID, videoPlaying;

//var url = 'http://177.32.120.55:3000';
var url = 'http://localhost:3000';

//entrada do script (carregado pelo iframeAPI)
function onYouTubeIframeAPIReady() {
	socket = io.connect(url);

	socket.on('playVideo', playVideo);
	socket.on('pauseVideo', pauseVideo);
	socket.on('loadVideo', loadVideo);
	socket.on('updateRooms', updateRooms);
	socket.on('getVideoTime', getVideoTime);
	socket.on('updateCounter', updateCounter);
	socket.on('disableReady', disableReady);
	socket.on('updateClient', updateClient);
	socket.on('reloadPage', reloadPage);
	socket.on('playStartedVideo', playStartedVideo);
	//seta os botoes de carregamento de video
	document.getElementById('control').innerHTML = '<form id="videoURLInputForm" action="#">' +
													  	'<div class="form-group">' +
			            									'<label for="videoURLLabel" style="font-size:25px;">Coloque o link ou ID do video</label>' + '<hr>' +
			            									'<input type="text" style="width: 50%;margin: auto" class="form-control input-lg text-center" id="videoURLInput" placeholder="https://www.youtube.com/watch?v=...">' +
		          										'</div>' + 
		          										'<hr>' +
														'<input type="button" class="btn btn-primary btn-lg" onclick="createRoom()" value="Carregar Video">' +
														'<hr>' + 
													'</form>'
	//some com o player vazio
	document.getElementById('video-placeholder').style.display = "none";

	player = new YT.Player('video-placeholder', {
		playerVars: { 
			color: 'white',
			controls: '0'
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
	myID = data.myID;
	link = url + "#?" + inRoomID;
}

/********** ROOMS **********/

//le o texto do input
function createRoom () {
	var pos;
	var videoURL = document.getElementById('videoURLInput').value;
	if(videoURL.substring(0,4)=="http" || videoURL.substring(0,4)=="www." || videoURL.substring(0,4)=="yout"){
		pos = videoURL.indexOf("=",0);
		videoURL = videoURL.substring(pos+1,pos+12);
	}
	

	if (videoURL.length != 11){
		document.getElementById('alerts2').innerHTML =   '<hr>' + 
	                                                '<div class="alert alert-success" role="alert">' + 
	                                                	'<strong>' +
	                                                		'Erro!' +
	                                                	'</strong>' +
	                                                	' O link ' + '<strong>' + videoURL + '</strong>' +' está incorreto. Por favor digite o ID ou o link do video correctamente.' +
 	                                                '</div>';
		window.setTimeout(function() {
	  	  $(".alert").fadeTo(500, 0).slideUp(500, function(){
	        $(this).remove(); 
	  	  });
		}, 6000);

		document.getElementById('videoURLInput').style.borderColor = "red";

	} else
		socket.emit('createRoom', videoURL);
}

function enterRoom (roomID) {
	socket.emit('enterRoom', roomID);
}

function leaveRoom () {
	socket.emit ('leaveRoom');
}

/********** VIDEO **********/

//handler de mudanca de estado do player
function onPlayerStateChange (event) {
    if ((event.data == YT.PlayerState.PLAYING && carregando) || (event.data == YT.PlayerState.PLAYING && !videoPlaying)) {
    	player.seekTo(0);
		player.pauseVideo();
		carregando = false;
    } else if (event.data == YT.PlayerState.PAUSED && (!carregando && videoPlaying)) {
    	player.playVideo();
    }
}

//handler do player chamado quando pronto
function onPlayerReady (event) {
	var hash = window.location.hash;
	var roomID = hash.substr(2, hash.length);
	enterRoom(roomID);
}

//carrega o video no player
function loadVideo (data) {
	videoPlaying = false;
	carregando = true;
	player.loadVideoById(data.videoID);
	player.playVideo();
	document.getElementById('video-placeholder').style.display = "inline";
	if (!data.videoPlaying)
		prepareButttons();
	else 
		cleanControls();
	prepareVideoControls();
}

//funcao chamada pelo servidor para dar pause em todos os videos ao mesmo tempo
function pauseVideo () {
	videoPlaying = false;
	player.pauseVideo();

	if (myID == inRoomID)
		prepareVideoControlsOwner();
}

//funcao chamada pelo servidor para dar play em todos os videos ao mesmo tempo
function playVideo () {
	videoPlaying = true;
	var tempoRestante = 1;
	var fazAContagem;
	clearInterval(fazAContagem);
	document.getElementById('control').innerHTML = '';
	fazAContagem = setInterval(function(){
			document.getElementById('contagem').innerHTML = '<div class="alert alert-success text-center">' + 'O video inicia em: ' + tempoRestante-- + '</div>';
			if (tempoRestante == -1) {
				clearInterval(fazAContagem);
				document.getElementById('contagem').innerHTML = ''; 
				player.playVideo();
				if (myID == inRoomID) {
					prepareVideoControlsOwner();
				}
			}
		}, 1000);

}

//resposta para a chamada do servidor para lidar com quem entra em uma sala com video playing
function getVideoTime (requestID) {
	var time = player.getCurrentTime();
	console.log (player.getCurrentTime());
	socket.emit('playStartedVideo', {requestID: requestID, time: time});
}

function playStartedVideo (time) {
	console.log(time);
	videoPlaying = true;
	//player.playVideo();
	//player.seekTo(time+1);
}

/********** HTML **********/

//altera a div controls para reveber os botoes de ready
function prepareButttons () {
	document.getElementById('control').innerHTML = '<form id="controls">' +
														'<a href="#" class="btn btn-primary" onclick="clientReady()">Ready</a>' +
														'<p></p>' +
													'</form>';
	document.getElementById('rooms').innerHTML = '';

}

function cleanControls () {
	document.getElementById('control').innerHTML = '';
	document.getElementById('rooms').innerHTML = '';
}

//desabilita o botao de ready
function disableReady (data) {
	document.getElementById('control').innerHTML =  '<div>' +
															'<form id="controls">' +
	                                                        	'<a href="#" class="btn btn-primary" disabled>' + data.readyCounter + '/' + data.clients + '</a>' +
	                                                        	'<p></p>' +
	                                                		'</form>' +
	                                                '</div>';
}

//avisa o servidor que o cliente esta Ready
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

//update e recarrega a lista de salas disponiveis para todos
function updateRooms (newRooms) {
	if (inRoom)
		return;
	rooms = newRooms;
	document.getElementById('rooms').innerHTML = '';
	for (var i = 0; i < rooms.length; i++) {
		document.getElementById('rooms').innerHTML += '<div class="well">'+
						                              '<h6>Room ID: ' + rooms[i].roomID + '</h6>'+
						                              //'<p><span class="label label-info">' + status + '</span></p>'+
						                              '<h3>' + rooms[i].roomID + '</h3>'+
						                              //'<p><span class="glyphicon glyphicon-time"></span> ' + severity + ' '+
						                              //'<span class="glyphicon glyphicon-user"></span> ' + assignedTo + '</p>'+
						                              '<a href="#" class="btn btn-primary btn-lg" onclick="enterRoom(\'' + rooms[i].roomID + '\')">Entrar' + '</a>' +
						                              '</div>';
	}
}

//recarrega a pagina (volta para a inicial)
function reloadPage () {
	location.replace(url);
}

//funcao auxiliar para obter copiar a url da sala 
function copy () {
	var linkCopy = document.getElementById('roomURL');
	linkCopy.select();
	document.execCommand("Copy");
	document.getElementById('alerts').innerHTML =   '<hr>' + 
	                                                '<div class="alert alert-success" role="alert">' + 
	                                                	'<strong>' +
	                                                		'Sucesso!' +
	                                                	'</strong>' +
	                                                	' O link foi copiado!' +
 	                                                '</div>';
		window.setTimeout(function() {
	    $(".alert").fadeTo(500, 0).slideUp(500, function(){
	        $(this).remove(); 
	    });
	}, 2000);
}

//prepara os botoes da sala de video
function prepareVideoControls () {
	document.getElementById('videoControls').innerHTML =	'<hr>' +
															'<div style="margin:0">' + 
																'<input type="text" style="width: 50%;margin: auto" class="form-control input-lg text-center" id="roomURL" value=\"' + link + '\" onclick="copy()" readonly>' + 
														    '</div>' +
														    '<hr>';

	document.getElementById('videoControls').innerHTML +=  '<a href="#" class="btn btn-primary" onclick="leaveRoom()">Sair</a>';
}

//botoes exclusivos de controle da sala de video para o owner
function prepareVideoControlsOwner () {
	var statusPlay;
	statusPlay = videoPlaying ? 'disabled' : 'enabled';
	document.getElementById('videoControlsOwner').innerHTML =   '<div style="display:inline; padding: 2px 8px">' +
																	'<hr>' +
																	'<input type="button" class="btn btn-secundary btn-lg" onclick="ownerPlay()" value= "Play" ' + statusPlay + '>';

	var statusPause;
	statusPause = !videoPlaying ? 'disabled' : 'enabled';
	document.getElementById('videoControlsOwner').innerHTML +=  '<input type="button" class="btn btn-secundary btn-lg" onclick="ownerPause()" value= "Pause" ' + statusPause + '>' +
																'</div>'
															

}

//********** OWNER CONTROLS **********/

//p;ay control para o owner da sala
function ownerPlay () {
	if (!videoPlaying) {
		socket.emit('ownerPlay', inRoomID);
	}
}

//pause control pra o owner da sala
function ownerPause () {
	if (videoPlaying) {
		socket.emit('ownerPause', inRoomID);
	}
}