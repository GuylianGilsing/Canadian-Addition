console.log("12")

var express = require('express');
var router = express.Router();

/* GET game page. */
router.get('/game', function(req, res, next) {
  res.render('game', { title: 'Game' });
});

module.exports = router;
