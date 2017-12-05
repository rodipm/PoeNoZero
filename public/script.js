var player, fazAContagem, ready = false, carregando = false;

var socket;

function onYouTubeIframeAPIReady() {
	//socket setup
	socket = io.connect('http://177.32.120.55:3000');                      //RODRIGO
	//socket = io.connect('http://189.62.21.220:3000');                      //ARTHUR
	//socket = io.connect('http://localhost:3000');                          //LOCAL
	socket.on('message', handleMessage);
	socket.on('playVideo', playVideo);
	socket.on('updateCounter', updateCounter);
	socket.on('disableReady', disableRady);


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
			color: 'white',
			'controls': 0, 
	        'autohide': 1,
	        'showinfo' : 0
		},
		events: {
			onReady: initialize,
			onStateChange: onPlayerStateChange
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
	console.log("aaaa");
	var videoURL = document.getElementById('videoURLInput').value;
	socket.emit('message', videoURL);
	if (videoURL.length != 11){
		alert("Por favor, o ID \""+ videoURL + "\" está incorreto.\nPor favor digite conforme o exemplo:\nUTfTd4yHAlg");
		document.getElementById('videoURLInput').style.borderColor = "red";

	}else
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
    	//player.seekTo(0);
		player.pauseVideo();
		carregando = false;
    }
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