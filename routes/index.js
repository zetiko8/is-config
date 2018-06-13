var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/ui', function(req, res, next) {
  res.render('config');
});
router.get('/index', function(req, res, next) {
  res.render('index');
});


module.exports = router;
