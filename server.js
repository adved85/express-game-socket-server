/* /usr/home/u1491/test/
URL: http://194.135.81.127:55263/ */

// fs and https are built in modules //
const fs =  require('fs');
const https = require("https");
const express = require("express");
const app = express();

const options = {
	key: fs.readFileSync('/opt/new/www_omegacoding_com.key'),
	cert: fs.readFileSync('/opt/crt/certificate.crt'),
	ca: [fs.readFileSync('/opt/crt/ca.crt')]

	// key: fs.readFileSync('/opt/crt/cloudflare/key.pem'),
	// cert: fs.readFileSync('/opt/crt/cloudflare/origin.pem'),
	// ca: [fs.readFileSync('/opt/crt/cloudflare/chain.pem')]
  };

// const server = https.createServer(options, app).listen(55265, function () {
const server = https.createServer(options, app).listen(8443, function () {
    console.log('Magic happens on port ' + 8443); 
 });

app.use(express.static(__dirname + "/public"));

var socket = require('socket.io');
var socio = socket(server);

const uuidv1 = require('uuid/v1');
var Room = require('./room.js');
var User = require('./user.js');


var rooms = [];
var users = [];
var openRooms = [];
var openRoomKeys = [];
var count = 0;
var game_id = 0;
var partners = {};
var roomWin={}; // Mario

var choiceRooms = [];

socio.on("connection", function(socket) {
	console.log("user with %s socket_id is connected", socket.id);
	//console.log("openRooms on connet ---" , openRooms);
	socket.emit("con",socket.id); // Mario
	socket.on("adduser", function(name, gameID=999, realyName='defaultName', level=999, image="avatar.png") {
	if (gameID !== 0) {
		console.log("username -> ", name + " :game_id: -> " + gameID + " : level-> " + level + " : image->" + image);
        count++;
		game_id = gameID;

        var room = new Room(name, socket.id, gameID, realyName, level, image);
            rooms[socket.id] = room;
            room.addPlayer(socket.id);

        var user = new User(name, socket.id, gameID, realyName, level, image);
            users[socket.id] = user;

            socket.user = name;
            socket.room = room.id;
            socket.join(socket.room);

					//console.log("sock-rooms-in-session--> ", socket.rooms);

                   // console.log(" ---- checking socket sessions -- ");
                   // console.log('socket.name: -> ', socket.user);
                   // console.log('socket.room: -> ', socket.room);
                   // console.log(" ----- checking USERS array ----- ");
                   // console.log('users[] -> ', users);
                   // console.log(" ----- checking ROOMS array ----- ");
                   // console.log('rooms[] -> ', rooms);

            socket.emit("showSearchBtn", "true"); // if the user is loged-in //
            socket.emit('console', "PRO-Server : You have connected to your room__"+count+ ", id: "+socket.room); // was updateChat
            socio.sockets.in(socket.room).emit("console", "User is in own room " + socket.room); /*Սա տեսնւմ է միայն room-ի տերը der*/

	}else {
		// Mario
		console.log(name);
		console.log("username & game_id comes: ->", name.name + " : " + name.gameID);
		count++;
		game_id = name.gameID;

		var room = new Room(name.name, socket.id, name.gameID);
				rooms[socket.id] = room;
				room.addPlayer(socket.id);

		var user = new User(name.name, socket.id, name.gameID);
				users[socket.id] = user;
				console.log(user.game_id);
				socket.user = name.name;
				socket.room = room.id;
				socket.join(socket.room);

				socket.emit("showSearchBtn", "true"); // if the user is loged-in //
	}
});


    socket.on("searchRoomEvent", function(client) {
			if(client.id==undefined){
				client_id=client;				
			}else {
				client_id = client.id;
			}

		socket.broadcast.emit('searchSomeone', client_id,'hello friends');
 		
		// ոչ թե նորից հայտարարում ենք, այլ զրոյացնում //
         openRooms = [];
         openRoomKeys = [];
         choiceRooms = [];
         console.log("--------------------------/search event/---------------------------");
         console.log(' ----- come from front---/search/---- client_id --> ', client_id);
         // console.log("--- openRooms ---= before cycling =--- ", openRooms); // must to be empty
        for(r in rooms) {
                console.log('rrrrr ', r);
             if(rooms[r].id !== client_id) {             	
                    console.log('sssss ',rooms[r].status);
                 if(rooms[r].status === 'available') {
                        console.log('superrrrr ', users[rooms[r].id].status);
                    if(users[rooms[r].id].status === 'free') {
						console.log(users)						
                    	if(users[client_id].game_id == rooms[r].game_id) {
							console.log('super-supersssss-superssss-super--> ', r);
							if(users[client_id].level === rooms[r].level) {
								console.log('super-supersssss-superssss-super---level--> ', r);
								let flag = openRooms.push(rooms[r]);
								if(flag === 1) {							
									socket.emit("prepareToJoin", flag);
									//socket.emit("letsTakeFreeRooms", openRooms );
								}
								//openRoomKeys.push(r);
							}else{
								console.log('|DIF --- levels are different --- DIF|');
								console.log('user level-> ', users[client_id].level);
								console.log('room level-> ', rooms[r].level);
								let flag = choiceRooms.push(rooms[r]);								
								//console.log('all rooms');
								//console.log(rooms);
								
								//console.log('choiceRooms');
								//console.log(choiceRooms);							
								
								/* socket.emit('otherLevelFreeRooms', {choiceData: choiceRooms}); */

							}

						} else { console.log(".. GAME_IDs ARE DIFFERENT."); continue; }
                    } 	else { console.log(".. NOT MATHCHES 'free' USER."); continue; }
                }     	else { console.log(".. NOT 'available' openRooms."); continue; }
            }         	else { console.log(".. YOU CAN NOT JOIN TO YOUR ROOM."); continue; }
        }

        //socio.sockets.in(socket.room).emit("showOpenRooms", openRoomKeys);
        console.log("--- openRooms ----= results of search =---- ", openRooms);
        console.log("--- choiceRooms ----= results of search =---- ", choiceRooms);
		if(choiceRooms) {
			socket.emit('otherLevelFreeRooms', {choiceData: choiceRooms});	// choiceRooms
		}
		
    });

	// levels are the same, join is random //
    socket.on("attemptToJoin", function(client) {
		if(client.id==undefined){
			client_id=client;
		}else {
			client_id = client.id; // Mario
		}

        console.log(" ----------------/on join event/------------------- ");

      /* if(users.length === 0) { console.log("users-length is: %s", users.length); } else*/

		if (users[client_id].status !== 'free') {
            console.log(" ================ You are already into room. Leave it, and then try to join.");
            socket.emit('updateChat', "You are already into room. Leave it, and then try to join.");
		} else if (openRooms.length === 0 ) {
            console.log('===========================try later ===========================Please!');
            socket.emit('updateChat', "There is not available room for playing, Please, try later.");
		} else {
            var maximum = openRooms.length;
            var minimum = 0;
            var randomnumber = Math.floor(Math.random() * (maximum - minimum)) + minimum;
            var randomRoom = openRooms[randomnumber];
            console.log(" randomnumber is: ----><<  %s  >>", randomnumber);
            console.log(" randomRoom ---/ready to join/---->", randomRoom);


            randomRoom.addPlayer(client_id);
            randomRoom.changeRoomStatus('full');
            rooms[client_id].changeRoomStatus('closed');

//            logs for testing
//            console.log("randomRoom status is:---> %s .", randomRoom.status);
//            console.log("randomRoom's players ------> ", randomRoom.players);
//            console.log("joined client's room status--------> ", rooms[client_id].status);

			let pair=[];
			pair.push(randomRoom.id);
            for(var j = 0; j < randomRoom.players.length; j++) {
                if (randomRoom.owner === users[randomRoom.players[j]].name) {
                    users[randomRoom.players[j]].status = 'hasGuest';
                } else {
                   users[randomRoom.players[j]].status = 'isGuest';
                }
                pair.push(users[randomRoom.players[j]]);
            }

//          console.log('users---tttttttt--users---> ', users);
//          console.log('rooms---tttttttt--rooms---> ', rooms);
//					console.log(' ----------======pair======----------',pair);

            socket.room = randomRoom.id;
            socket.join(socket.room, ()=>{
				
				console.log('<<= 0000 --- join callback START --- 000=>>');
				console.log(socket.rooms); // [ <socket.id>, 'room 237' ]
				console.log('<<= 0000 --- join callback END --- 000=>>');
			});

            socio.sockets.in(socket.room).emit("console", socket.user + " <- has joined room -> " + socket.room +" : "+ randomRoom.name);
            socio.sockets.in(socket.room).emit("onJoin",{ joining: true , pair: pair, and_room_id: randomRoom.id});
            socket.broadcast.to(socket.room).emit("console", socket.user + " has connected broadcast"); // was updateChat

            console.log(" <---+++=== client with id: "+socket.id + " has joined randomRoom ===+++---> \r\n", randomRoom);
        }
    });
	
	/* INDIVIDUAL choiced-connection: (when levels are different)  */
	socket.on("console", function(client_id, opponent_id) {
		console.log(client_id, opponent_id);
	});
	socket.on('users_choice', function(client_id, opponent_id){

		if(choiceRooms.length === 0) {
			console.log(' choiceRooms is empty.  Try later');
		}else{
			console.log('choiceRooms NOT empty');
			console.log(' client_id ', Object.prototype.toString.call(client_id))
			console.log('opponent_id', Object.prototype.toString.call(client_id))
			if(rooms.hasOwnProperty(opponent_id)) {
				if(rooms[opponent_id].status === "available"){
					let electedRoom = rooms[opponent_id];
					console.log(electedRoom);

					electedRoom.addPlayer(client_id);
					electedRoom.changeRoomStatus('full');
					rooms[client_id].changeRoomStatus('closed');
					
					let pair=[];
					pair.push(electedRoom.id);
					for(var j = 0; j < electedRoom.players.length; j++) {
						if (electedRoom.owner === users[electedRoom.players[j]].name) {
							users[electedRoom.players[j]].status = 'hasGuest';
						} else {
						   users[electedRoom.players[j]].status = 'isGuest';
						}
						pair.push(users[electedRoom.players[j]]);
					}
					
					socket.room = electedRoom.id;
					socket.join(socket.room, ()=>{				
						console.log('<<= 0000 --- join callback START --- 000=>>');
						console.log(socket.rooms); // [ <socket.id>, 'room 237' ]
						console.log('<<= 0000 --- join callback END --- 000=>>');
					});
					
					socio.sockets.in(socket.room).emit("console", socket.user + " <- has joined room -> " + socket.room +" : "+ electedRoom.name);
					socio.sockets.in(socket.room).emit("onJoin",{ joining: true , pair: pair, and_room_id: electedRoom.id});
					socket.broadcast.to(socket.room).emit("console", socket.user + " has connected broadcast"); // was updateChat

					console.log(" <---+++=== client with id: "+socket.id + " has joined electedRoom ===+++---> \r\n", electedRoom);
					
				}else{
					console.log(`room with id ${opponent_id} has STATUS != available`);
					socket.emit('updateChat', `room with ${opponent_id} not available`);
				}		
			
			}else{
				console.log(' there is no room with id: ' + opponent_id);
			}			
		}
	});

    /* հաղորդագրությունների իվենթը */
    socket.on("sendChat", function(msgVal) {
			if (msgVal.type == undefined) {
				console.log("message %s ", msgVal);
				socio.sockets.in(socket.room).emit("updateChat", socket.user + " : " + msgVal);
				socio.sockets.in(socket.room).emit("receiveChat", socket.user + "|" + msgVal);
			}else {
				// Mario
				console.log("message %s ", msgVal);
				socio.sockets.in(socket.room).emit("updateChat", socket.user + " : " + msgVal);
				//  msgVal.time=(rooms[socket.room]).start_time;
				socket.broadcast.to(socket.room).emit("receiveChat",msgVal);
				//
				if(msgVal.type=="5")
				{  console.log("GameOver");
					 // roomWin.push(socket.room);
						roomWin[socket.room]=[];
						roomWin[socket.room].push(msgVal);
				}
			}

    });


/*----------- FOR Mario START ---------*/
socket.on("GameOver", function(msgVal) {
	console.log("GameOver");
		socio.sockets.in(socket.room).emit("updateChat", socket.user + " : " + msgVal);
	//  msgVal.time=(rooms[socket.room]).start_time;
	var points=0;
	roomWin[socket.room].push(msgVal);
		points=roomWin[socket.room][0].points+roomWin[socket.room][1].points;
		var g={};
		if(roomWin[socket.room][0].points>roomWin[socket.room][1].points)
		g.win=roomWin[socket.room][0].id;
		else
		g.win=roomWin[socket.room][1].id;
		if(roomWin[socket.room][0].level>roomWin[socket.room][1].level)
		g.win=roomWin[socket.room][0].id;
		else if(roomWin[socket.room][0].level<roomWin[socket.room][1].level)
		g.win=roomWin[socket.room][1].id;
		g.points=points;
		socio.sockets.in(socket.room).emit("OverTheGame",g);
});



/*----------- FOR Mario END ---------*/

/* ----------Alphabet START --------- */

    
	
	// componentWillUnmount - one of the user //
	socket.on("componentWillUnmount", (unmountedPartner)=> {
		socket.broadcast.to(socket.room).emit("receiveUnmount", unmountedPartner);
	}) 
	
	// send letter-event to oppenent
    // letterInfo (Boolean)	
    socket.on("letterFlag", (letterInfo)=> {
    	socket.broadcast.to(socket.room).emit("receiveChat", letterInfo);
    	//socio.sockets.in(socket.room).emit("receiveChat", letterInfo);
    })
	
	// pair is passive, turn the question
	socket.on("timeIsOver", (data)=> {
		console.log('---------->> timeIsOver <<-------------');
		console.log(data);
    	socket.broadcast.to(socket.room).emit("receiveChat", data);
    	//socio.sockets.in(socket.room).emit("receiveChat", letterInfo);
    })

  	socket.on("thisUserProgress", (thisUser)=>{
  		//partners["room_id"] = thisUser.thisUser.room_id;
  		partners["thisUser"] = thisUser;
		console.log('into on.thisUserProgress ... only thisUser ==================#####=======');
		console.log(partners["thisUser"]);
  		//console.log(partners);
  	})
  	socket.on("thatUserProgress", (thatUser)=> {

			console.log('--------------------<< partners into thatUserProgress >>---------------------');
	  		partners["thatUser"] = thatUser;
	  		console.log('\n\r this->>>>',partners["thisUser"]);
	  		console.log('\n\r that ->>>',partners["thatUser"]);
	  		let thisOne = partners["thisUser"].thisUser;
	  		let thatOne = partners["thatUser"].thatUser;

	  		if(thisOne.room_id == thatOne.room_id) {

		  		//let size = Object.keys(partners).length; console.log('length ->>>',size);
		  		//if(size === 2) {}
		  			let winner_id, looser_id;
		  			let allCoins = thisOne.this_coins + thatOne.that_coins;
		  			let zeroCoins = 0;

						if(thisOne.this_Dots > thatOne.that_Dots) {

							winner_id = thisOne.client_id;
							looser_id = thatOne.client_id;
						}else {

							winner_id = thatOne.client_id;
							looser_id = thisOne.client_id;
						}

						//socio.sockets.in(socket.room).emit("onGameEnd",{winner: winner_id, looser: looser_id, allCoins: allCoins, zeroCoins: zeroCoins})
						socio.sockets.connected[looser_id].emit("onGameEnd", {a_looser:true, client_id: looser_id, allCoins: zeroCoins}); // only for looser
						socio.sockets.connected[winner_id].emit("onGameEnd", {a_winner:true, client_id: winner_id, allCoins: allCoins}); // only for looser
						console.log('winner_id -->> ',winner_id)
						console.log('looser_id -->> ',looser_id)
						console.log(' allCoins -->> ',allCoins)
						console.log('zeroCoins -->> ',zeroCoins)

				}

  	})


  	socket.on("replay", (replayInfo)=> {
  			console.log(' \n\r ------ replay ----- \n\r');
  			console.log(replayInfo);
	  		if(replayInfo.req === 'whould_you_like_to_play_again') {
	  			socket.broadcast.to(socket.room).emit("replay", replayInfo);
			}
			else if(replayInfo.res === 'i_want_too') {
				socio.sockets.in(socket.room).emit("replay", replayInfo);
			}
  	})
  	
  	
/* ----------Alphabet END --------- */


/*================Everithing For Notepad-game ================*/
socket.on("notepadIncrement", function(msgVal) {
	console.log("message %s ", msgVal);
	socket.emit("notepadEnemyIncrement", msgVal +"");
});
/*======================= END Notepad ========================*/


    socket.on("disconnect", function(socket_id) {
        console.log("-------------dissconnected %s user ------------", socket.id);

		if(users[socket.id] === undefined) {
			
			console.log('P.S.: user has only "connection"-event, but not "adduser", now he is dicsonnect.');
		}
		else if (users[socket.id].status === 'free') {
			
			// User does not join to any room, and does not have any guest
			// he just connect and leave the socket ( for example Reloaded page)
			console.log('client is free: <<-- user.status === free -->>');
			socket.leave(socket.room);
			delete users[socket.id];
			delete rooms[socket.id];

			console.log("users after deleting ",users);
			console.log("rooms after deleting ",rooms);
		}
		else if (users[socket.id].status === 'hasGuest') {
			/* socket.id === socket.room */

			/* եթե լքողը տերն է */
			console.log('client is owner: <<--user.status === hasGuest-->>');
			console.log(users[socket.id].name);
			console.log(users[socket.id].id);

			/* 1. ազատում ենք հյուրին, բացում նրա սենյակը */
				let meetRoom = rooms[socket.id];
				console.log(meetRoom.players);

				for(let j = 0; j < meetRoom.players.length; j++) {
					if (meetRoom.owner === users[meetRoom.players[j]].name) {
						//users[meetRoom.players[j]].status = null;
						//meetRoom.changeRoomStatus(null);
						console.log(" -for owner just countinue.......");
						continue;
					} else {
						users[meetRoom.players[j]].status = 'free';                 // was isGuest
						rooms[meetRoom.players[j]].changeRoomStatus('available');   // was closed
					}
				}

			/* 2. հանում ենք տիրոջը ցուցակներից */
				socket.leave(socket.room);
				delete users[socket.id];
				delete rooms[socket.id];

				console.log("users after deleting ",users);
				console.log("rooms after deleting ",rooms);

				// Խաղացողներից մեկը՝ տերը, էջը թարմացրեց
				// socio.sockets.emit("page_reloaded", "Owner_Is_Gone" );
				socket.broadcast.to(socket.room).emit("page_reloaded", "Owner_Is_Gone" );

		}
		else if ( users[socket.id].status == 'isGuest') {
				/* socket.id !== socket.room */

			/* եթե լքողը հյուրն էր */
			console.log('clent is joiner: <<--user.status === isGuest-->>');
			console.log(users[socket.id].name);
			console.log(users[socket.id].id);

			/* 1. ազատում ենք տիրոջը ու սենյակը */
					rooms[socket.room].players.pop([socket.id]);
					rooms[socket.room].status = 'available';    // was full
					users[socket.room].status = 'free';         // was hasGuest
					console.log("meeting room now is ----> ", rooms[socket.room]);
					console.log("now owner is free ---> ", users[socket.room]);

			/* 2. հանում ենք հյուրին ցուցակներից */
					socket.leave(socket.room);
					delete users[socket.id];
					delete rooms[socket.id];

			console.log("users after deleting ",users);
			console.log("rooms after deleting ",rooms);

			// Խաղացողներից մեկը՝ հյուրը, էջը թարմացրեց
			// socio.sockets.in(socket.room).emit("page_reloaded","Joiner_Is_Gone" );
			socket.broadcast.to(socket.room).emit("page_reloaded","Joiner_Is_Gone" );
			
		}
    });

});
