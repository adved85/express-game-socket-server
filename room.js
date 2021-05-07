function Room( name, socket_id, gameID, realyName, level, image) {

	this.game_id = gameID;
	this.level = level;
	this.name = name;
	this.players = [];
	this.status = 'available'; // full // closed
	this.id = socket_id;
	this.owner = this.name;
	this.realyName = realyName;
	this.image = image;
	this.changeRoomStatus = function(stat) { this.status = stat; }
}

/* new prototype method */
Room.prototype.addPlayer = function(player_id) {
	if(this.players.length < 2 && this.status == 'available') {
		this.players.push(player_id);
	}
}


Room.prototype.getRoomStatus = function() {
  return this.status;
}

/* simple function */
function takeRoomStatus(socket_id) {
	return rooms[socket_id].status;
}


module.exports = Room;
