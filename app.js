var socket = io();
var url = location.href;
url = url.substring(url.indexOf("?")+1);

socket.on("roomRequest", ()=>{
    socket.emit("joinRoom", url)
});

socket.on("roomCreated", (msg)=>{
    console.log(msg);
});
socket.on("joinedUser", (msg)=>{
    console.log(msg);
});

socket.on("disconnect", (msg)=>{
    window.location =("/");
});

socket.on("leftUser", (msg)=>{
    console.log(msg);
});

socket.on("disconnect", (msg)=>{
    console.log(msg);
});
