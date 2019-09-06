var currentRoomId = undefined;

var socket = io();
var url = location.href;
url = url.substring(url.indexOf("?")+1);

socket.on("roomRequest", ()=>{
    socket.emit("joinRoom", url)
});

socket.on("disconnect", (msg)=>{
    window.location =("/");
});
