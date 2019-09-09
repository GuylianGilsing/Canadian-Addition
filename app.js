var currentRoomId = undefined;

var socket = io();
var url = location.href;
url = url.substring(url.indexOf("?")+1);

socket.on("roomRequest", ()=>{
    socket.emit("joinRoom", url)
});
socket.on("chatMessageReceived", (player, msg)=>{
    var node = document.createElement("p");
    console.log(player);
    if (player == currentPlayer)
    {node.className = "chat-message self"; console.log("test2");}
    else {node.className = "chat-message"; console.log("test3")}

    var textnode = document.createTextNode(msg);
    node.appendChild(textnode);
    document.getElementById("message-container").appendChild(node);
});
socket.on("disconnect", (msg)=>{
    window.location =("/");
});

function sendMessage() {
    socket.emit("chatMessage", currentPlayer, document.getElementById("chat-bar").value);
    document.getElementById("chat-bar").value = "";
}
function onTextChange() {
    var key = window.event.keyCode;
    if (key === 13) {
        sendMessage();
    }
}