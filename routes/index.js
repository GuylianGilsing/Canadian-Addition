var express = require('express');
var router = express.Router();
let app = require('express')();
let http = require('http').Server(app);
// Mount socket.io to the http server.
var io = require('socket.io')(http);
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

http.listen(3000, ()=>{
  console.log("listening on *3000");
})

/*

    --- THIS IS Socket.io!!1!!1!! ---

*/

// Listen when someone is connected to the server.
io.on('connection', (socket)=>{
  console.log('a user connected');
  socket.on('disconnect', ()=>{
    io.emit('disconnect', "User has disconnected.");
    console.log('user disconnected');
  });
});

module.exports = router;
