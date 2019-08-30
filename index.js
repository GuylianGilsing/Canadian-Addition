// Create the express app.
var app = require('express')();
var http = require('http').createServer(app);

// Routing, listening for the / route.
app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});

// Serving the connection.
http.listen(8080, function(){
  console.log('Server running on 127.0.0.1:8080');
});