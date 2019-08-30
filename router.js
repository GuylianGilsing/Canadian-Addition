module.exports = function(app){
    // To add a route use this: app.use('ROUTENAME', require('PATH TO ROUTE FILE'));
    // ./ is used to set the starting point from the file itself.
    app.use('/', require('./routes/index'));
    app.use('/game', require('./routes/game'));
}