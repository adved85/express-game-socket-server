function User(name, socket_id, gameID, realyName, level, image) {
	this.game_id = gameID;
	this.level = level;
	this.name = name;
	this.id = socket_id;
	this.status = 'free'; // hasGuest (owner) // isGuest (who join);
	this.realyName = realyName;
	this.image = image;
	this.changeUserStatus =function(uStat) { this.status = uStat; }
}

User.prototype.getUserStatus = function() {
    return this.status;
}


User.prototype.getUserId = function() {
    return this.id;
}

module.exports = User;
