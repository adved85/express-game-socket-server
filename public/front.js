/* !IMPORTANT: for production-app we need to SET transports */
/* https://stackoverflow.com/questions/23962047/socket-io-v1-0-x-unknown-transport-polling */
//var socket = io.connect('http://localhost:61312');
var socket = io({
  transports: [
    'websocket', 
    'flashsocket', 
    'htmlfile', 
    'xhr-polling', 
    'jsonp-polling',
    'polling'
  ],

}).connect('https://omegacoding.com:8443');
// }).connect('https://omegacoding.com:55263');
// }).connect('http://localhost:55263');
// }).connect('http://localhost:61312');

// https://socketcluster.io/#!/docs/api-socketcluster-client

var loginCL = document.getElementsByClassName("login")[0];
var convsCL = document.getElementsByClassName("conversation")[0];
var nameNM = document.getElementsByName("username")[0];
let nameGid = document.getElementsByName("gameid")[0];
var sendName = document.getElementsByName("sendname")[0];
var messNM = document.getElementsByName("msg")[0];
var sendMsg = document.getElementsByName("sendmsg")[0];

var form = document.getElementsByTagName('form');
var roomsCL = document.getElementsByClassName('rooms')[0];
var searchBtn = document.getElementsByClassName('search-btn')[0];
var joinBtn = document.getElementsByClassName('join-btn')[0];

var disconnectBtn = document.getElementsByClassName('disconnector')[0];


/* adding user */
sendName.addEventListener("click", function() {  
	if(nameNM.value == '' || nameGid.value == '') {
		alert('input your e-mail and game-id');
	} else {
		socket.emit("adduser", nameNM.value, nameGid.value);
	}
});

/* show-chat */
socket.on("receiveChat", function(data) {
	console.log(data);
    convsCL.insertAdjacentHTML('beforeend', '<div>'+data+'</div>');
});

/* adduser-&-join into console */
socket.on("console", function(hello_message) {
    console.log(hello_message);
});


/* disable-enable search-btn */
searchBtn.disabled = true;
searchBtn.innerHTML = "SEACH IS DISABLED";
socket.on("showSearchBtn", (show)=> {
    if(show === "true") {
        searchBtn.disabled = false;
        searchBtn.innerHTML = "SEACH OPEN ROOMS";
        searchBtn.style.color = "black";
    }
});

/* Search-Available-Rooms */
searchBtn.addEventListener('click', function() {
    socket.emit("searchRoomEvent", socket.id);
    socket.on("prepareToJoin", (prepare) => {
        
        if(prepare === 1) {
            console.log(prepare);
            socket.emit("attemptToJoin", socket.id);
        } 
    });
    /*
	function join(socket_id) {
		socket.emit("attemptToJoin", socket_id);
	}
	setTimeout(join(socket.id),20);
    /* serch & join together */
    //alert('switchRoom');
    
});

/* Join-to-Room :button switch-off */
joinBtn.disabled = true;
joinBtn.addEventListener('click', function() {
        socket.emit("attemptToJoin", socket.id);
});

/* Send-Messages */
sendMsg.addEventListener('click', function() {
    var msgVal = messNM.value;
    if(msgVal =='') {
        alert('input something before send');
    }else{
        socket.emit("sendChat",msgVal);
    }
    
});

/* Show-Available-Rooms */
socket.on("showOpenRooms", function(opk) {
    console.log(opk);
    for(let k=0; k<opk.length; k++) {
        roomsCL.insertAdjacentHTML('beforeend', '<div>' + opk[k] + '</div>');
    }
});

socket.emit("disconnect", socket.id);
socket.on("connection_lost", (whoWent)=> {
	console.log("whoWent ---> ", whoWent);
});

disconnectBtn.addEventListener('click', function() {
	socket.disconnect();
});


