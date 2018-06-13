var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/ui', function(req, res, next) {
  res.render('config');
});
router.get('/', function(req, res, next) {
  res.render('production');
});


module.exports = router;
