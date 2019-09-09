//init
const express = require("express");
const app = require('express')();
const port = 3000;
const http = require('http').Server(app);
const io = require("socket.io")(http);
var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "canadian_addition"
});

app.use(express.static('assets'));
app.use(express.static('js'));

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

app.on('listening', function () {
    console.log("test");
    con.query("DELETE * FROM rooms ", function (err, result) {
        console.log("test");
    });
});
app.get('/', (request, response) => {response.sendFile(__dirname + '/index.html');});
app.get('/local', (request, response) => {response.sendFile(__dirname + '/local/index.html');});
app.get('/room', (request, response) => {response.sendFile(__dirname + '/room.html');currentroomid = request.query.room;});

// Serve static files.
app.get('/game.js', (request, response) => {response.sendFile(__dirname + '/assets/js/game.js');});
app.get('/game-local.js', (request, response) => {response.sendFile(__dirname + '/local/js/game.js');});
app.get('/style.css', (request, response) => {response.sendFile(__dirname + '/assets/css/style.css');});
app.get('/style-local.css', (request, response) => {response.sendFile(__dirname + '/local/css/style.css');});
app.get('/index.css', (request, response) => {response.sendFile(__dirname + '/assets/css/index.css');});
app.get('/logo.png', (request, response) => {response.sendFile(__dirname + '/assets/img/logo.png');});
app.get('/app.js', (request, response) => {response.sendFile(__dirname + '/app.js');});
app.get('/index.js', (request, response) => {response.sendFile(__dirname + '/index.js');});

//listen to port 3000
http.listen(port, () => {
    con.query("DELETE  FROM rooms ", function (err, result) {
        console.log("Room database emptied")
    });
    console.log("server is listening on localhost:" + port)
});
//connect to namespace /
io.of("/").on("connection", (socket) => {
    var currentroomid = "";

    let activePlayerNumber = 1;
    let totalTurns = 0;

    //send request to join the room
    socket.emit("roomRequest");
    //join room
    socket.on("joinRoom", (room) => {
        currentroomid = room;
        //Select user amount, check if room exist
        con.query("SELECT user_amount, (SELECT Count(*) FROM rooms WHERE room_id = '" + currentroomid + "') AS roomCount FROM rooms WHERE room_id = '" + currentroomid + "'", function (err, result) {
            if (err) throw err;
            //if room exists
            if (result.length > 0) {
                if (result[0].user_amount === 1) {
                    //update room client amount, join room
                    con.query("UPDATE rooms SET user_amount = '2' WHERE room_id = '" + currentroomid + "'", function (err, result) {
                        socket.join(currentroomid);

                        io.of("/").in(currentroomid).emit("playerTwo");
                        io.of("/").in(currentroomid).emit("allPlayersJoined");
                        
                        console.log("client joined room:" + currentroomid);
                    });
                } else {
                    //room full update room, disconnect from socket
                    con.query("UPDATE rooms SET user_amount = '3' WHERE room_id = '" + currentroomid + "'", function (err, result) {
                        console.log("client tried to join full room:" + currentroomid +", redirected");
                        socket.emit("disconnect");
                        socket.disconnect();
                    });
                }
            } else {
                //create room
                con.query("INSERT INTO rooms (room_id, user_amount) VALUES ('" + currentroomid + "', '1')", function (err, result) {
                    if (err) throw err;
                    socket.join(currentroomid);
                    io.of("/").in(currentroomid).emit("playerOne");
                    console.log("room created:" + currentroomid);
                });
            }
        });
    });
    //on client disconnect
    socket.on("disconnecting", () => {
        //Select user amount, check if room exist
        con.query("SELECT user_amount, (SELECT Count(*) FROM rooms WHERE room_id = '" + currentroomid + "') AS roomCount FROM rooms WHERE room_id = '" + currentroomid + "'", function (err, result) {
            //if room exists
            if (result.length > 0) {
                if (result[0].roomCount) {
                    if (result[0].user_amount === 1) {
                        //delete room after last client left
                        con.query("DELETE FROM rooms WHERE room_id = '" + currentroomid + "'", function (err, result) {
                            console.log("room deleted:" + currentroomid);
                        });
                    } else {
                        var counter;
                        if (result[0].user_amount === 2) {
                            console.log("client has left room:" + currentroomid);
                            counter = 1;
                        } else {
                            counter = 2;
                        }
                        //when 2 people in room and 1 leaves set amount to 1
                        con.query("UPDATE rooms SET user_amount = '" + counter + "' WHERE room_id = '" + currentroomid + "'", function (err, result) {
                            console.log("room updated:" + currentroomid);
                        });
                    }
                    // io.of("/").in(currentroomid).emit("leftUser", "User has left");
                }
            }
        });
    });

    socket.on('endTurn', (columns) => {
        io.of('/').in(currentroomid).emit('endTurn', columns);
    });

    // Player turn is over.
    socket.on('startNewTurn', (gameData) => {

        console.log(gameData);
        
        if(gameData.player == "player-one")
            activePlayerNumber = 2;
        else
            activePlayerNumber = 1;

        totalTurns = gameData.turns;
        gameData.turns = (totalTurns + 1);
        
        gameData['activePlayer'] = activePlayerNumber;

        // Send the data to start a new turn.
        io.of("/").in(currentroomid).emit("startNewTurn", gameData);
    });

    socket.on('winGame', (player) => {
        io.of("/").in(currentroomid).emit("winGame", player);
    })
});