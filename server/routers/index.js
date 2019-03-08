// The content of this file was generated by IBM Cloud
// Do not modify it as it might get overridden
var express = require('express');
const path = require('path');
var router = express.Router();
var passport = require("passport");
var samlConfig = require('../config/saml')[process.env.SSO_PROFILE || 'dev']; // Select configuration based on profile
var session = require("express-session")
var MemoryStore = require('session-memory-store')(session);
module.exports = function (app) {
  /*
   * =====================================================================
   * Session framework setup
   *
   */
  //VCAP_APPLICATION contains useful information about a deployed application.
  var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");

  // Set up session framework
  /*
   * =====================================================================
   *  Mount API handlers before session to improve performance
   */
  app.use('/api', require('./api')(samlConfig));
  /*
   * =====================================================================
   *  Setup session support
   */
  var enroll = express()
  enroll.use(session({
    secret: samlConfig.passport.sessionSecret || 'SAML support for BlueMix',
    cookie: { path: '/enroll', httpOnly: true, secure: !!samlConfig.passport.saml, maxAge: null },
    resave: true,
    proxy: true,
    saveUninitialized: true,
    store: new MemoryStore()
  }));
  /*
   * =====================================================================
   *  Passport framework setup
   */
  enroll.use(passport.initialize());
  enroll.use(passport.session());

  // Configure passport SAML strategy parameters
  require('../lib/passport')(passport, samlConfig);

  /*
   * =====================================================================
   *  Configure secure routers
   */

  enroll.use('/', require('./secure')(samlConfig, passport));
  enroll.set('views', app.get('views'));
  enroll.set('view engine', app.get('view engine'));
  enroll.use(express.static(process.cwd() + '/public'));
  app.use('/enroll', enroll);

  var health = express.Router();
  health.get('/', function (req, res, next) {
    res.json({status: 'UP'});
  });
  app.use('/health', health);

  var news = express.Router();
  news.get("/", function(req, res) {
      res.render('index', { title: 'Express' });
  });
  app.use('/', news);
};
