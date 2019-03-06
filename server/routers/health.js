var express = require('express');
var router = express.Router();
module.exports = function() {
  router.get('/', function (req, res, next) {
    res.json({status: 'UP'});
  });
  router.use("/health", router);
  return router
}
