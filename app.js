var currentRoomId = undefined;

var socket = io();
var url = location.href;
var urlFull = url;
url = url.substring(url.indexOf("?")+1);
gameType = url.substr(-1);

socket.on("roomRequest", ()=>{
    document.getElementById("hidden-textarea").innerHTML = urlFull;
    socket.emit("joinRoom", url, urlFull)
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

socket.on("gameType", ()=>{
    SetPlayfieldMode(gameType);
});

socket.on("disconnect", (msg)=>{
    window.location = ("/");
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
function showInvite() {
    var node = document.createElement("p");
    var element = document.querySelector("#message-container");
    node.className = "chat-message global";
    var textnode = document.createTextNode(urlFull);
    node.appendChild(textnode);
    element.appendChild(node);
}
function home() {
    window.location = ("/");
}