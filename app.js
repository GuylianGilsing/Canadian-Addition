var currentRoomId = undefined;

var socket = io();
var url = location.href;
url = url.substring(url.indexOf("?")+1);

socket.on("roomRequest", ()=>{
    socket.emit("joinRoom", url)
});

socket.on("chatMessageReceived", (player, msg)=>{
    var node = document.createElement("p");
    var element = document.querySelector("#message-container");

    if (player == currentPlayer)
        node.className = "chat-message self";   
    else 
        node.className = "chat-message";

    var textnode = document.createTextNode(msg);
    node.appendChild(textnode);
    element.appendChild(node);

    ScrollChatToBottom();
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

function ScrollChatToBottom()
{
    var element = document.querySelector("#message-container");
    element.scrollTop = element.scrollHeight - element.clientHeight;
}