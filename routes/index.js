var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/ui', function(req, res, next) {
  res.render('config');
});
router.get('/ui3', function(req, res, next) {
  res.render('index3');
});
router.get('/gm', function(req, res, next) {
  res.render('gmailApi');
});

module.exports = router;
