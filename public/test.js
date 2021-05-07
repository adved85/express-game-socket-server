var users = [];
var rooms = [];
var roomKeys = [];


function Room(name, socket_id) {
	
	this.name = name;
	this.players = ["369"];
	this.status = 'available';
	this.id = socket_id;
	this.owner = this.name;
	this.changeStatus = function(stat) { this.status = stat; }
}
var name = 'saqo@gmail.com';
var socket_id ="id_789";

var room = new Room( name, socket_id);
rooms[socket_id] = room;
console.log("room-->",room.status);
console.log("rooms-->",rooms);


Room.prototype.addPlayer = function(player_id) {
	if(this.players.length < 2 && this.status == 'available') {
		this.players.push(player_id);
	}
}
Room.prototype.statusControl = function() {
	if(this.players.length == 2 && this.status == 'available') {
		this.status = 'full';
	} else if(this.players.length < 2 && this.status == 'full') {
		this.status = 'available';
	}
}

Room.prototype.getRoomStatus = function() {
    return this.status;
}

room.addPlayer("258");
room.statusControl();
console.log(room);
console.log("room-->",room.status);

room.statusControl();
console.log(room.getRoomStatus());




function changeRoomStatus(socket_id) {
	if (rooms[socket_id].status == 'available') {
		rooms[socket_id].changeStatus('full');
	} else {
		rooms[socket_id].changeStatus('available');
	}
	return rooms[socket_id].status;
}

//console.log(changeRoomStatus(socket_id));


function takeRoomStatus(socket_id) {
	return rooms[socket_id].status;
}
//console.log(getRoomStatus("789"));