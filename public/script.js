var player, fazAContagem, ready = false;

var socket;

function onYouTubeIframeAPIReady() {
	//socket setup
	socket = io.connect('http://177.32.120.55:3000');
	socket.on('message', handleMessage);
	socket.on('playVideo', playVideo);
	socket.on('updateCounter', updateCounter);
	socket.on('disableReady', disableRady);


	//seta os botoes de carregamento de video
	document.getElementById('control').innerHTML = '<form id="videoURLInputForm">' +
													  	'<div class="form-group">' +
			            									'<label for="videoURLLabel">Coloque o link do video:</label>' +
			            									'<input type="text" class="form-control" id="videoURLInput" placeholder="https://www.youtube.com/watch?v=...">' +
		          										'</div>' +
														'<a href="#" class="btn btn-primary" onclick="readID()">Load</a>' +
														'<p></p>' +
													'</form>'
	//some com o player vazio
	document.getElementById('video-placeholder').style.display = "none";

	//seta o player do YT pela framwork
	player = new YT.Player('video-placeholder', {
		//width: 600,
		//height: 400,
		playerVars: { 
			color: 'white',
		},
		events: {
			onReady: initialize
		}
	});
}

//lida com as mensagens recebidas pelo servidor
function handleMessage (data) {
	console.log("Input: " + data);
	loadVideo(data);
}

//le o texto do input
function readID () { 
	var videoURL = document.getElementById('videoURLInput').value;
	socket.emit('message', videoURL);
	if (videoURL != '')
		loadVideo(videoURL);
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
	player.loadVideoById(videoURLInput);
	player.stopVideo();
	document.getElementById('video-placeholder').style.display = "block";
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

function initialize() {
	/*updateTimerDisplay();
	//updateProgressBar();

	clearInterval(time_update_interval);

	time_update_interval = setInterval(function() {
		updateTimerDisplay();
		//updateProgressBar();
	}, 1000);*/
}

/*
function updateTimerDisplay(){
	document.getElementById('current-time').innerHTML = formatTime(player.getCurrentTime());
	document.getElementById('duration').innerHTML = formatTime(player.getDuration());
}

function formatTime(time) {
	time = Math.round(time);

	var minutes = Math.floor(time/60);
	seconds = time - minutes*60;

	seconds = seconds < 10 ? '0' + seconds : seconds;

	return minutes + ":" + seconds;
}
*/