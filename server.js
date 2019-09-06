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
    database: "canadees_vermeningvuldigen"
});

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
//routes
app.get('/', (request, response) => {
    response.sendFile(__dirname + '/index.html');
});

app.get('/room', (request, response) => {
    response.sendFile(__dirname + '/room.html');
    //get parameters from url
    currentroomid = request.query.room;
});

app.get('/app.js', (request, response) => {
    response.sendFile(__dirname + '/app.js');
});
app.get('/index.js', (request, response) => {
    response.sendFile(__dirname + '/index.js');
});
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
});