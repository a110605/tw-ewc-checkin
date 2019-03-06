// The content of this file was generated by IBM Cloud
// Do not modify it as it might get overridden
var express = require('express');
var router = express.Router();
var passport = require("passport");
var samlConfig = require('../config/saml')[process.env.SSO_PROFILE || 'dev']; // Select configuration based on profile
  //samlConfig = require('./config/saml')[process.env.SSO_PROFILE || appInfo.space_name || 'dev']; // Select configuration based on profile
var session = require("express-session")
var MemoryStore = require('session-memory-store')(session);
module.exports = function(app){

    app.use(express.static(process.cwd() + '/public'));
    app.use('/health', require('./health'));

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
    app.use('/api', require('./api')(app, samlConfig, passport));
    /*
     * =====================================================================
     *  Setup session support
     */

    app.use(session({secret: samlConfig.passport.sessionSecret || 'SAML support for BlueMix',
        cookie: { path: '/', httpOnly: true, secure: !!samlConfig.passport.saml,  maxAge: null },
        resave: true,
        proxy: true,
        saveUninitialized: true,
        store: new MemoryStore()}));
    /*
     * =====================================================================
     *  Passport framework setup
     */
    app.use(passport.initialize());
    app.use(passport.session());

    // Configure passport SAML strategy parameters
    require('../lib/passport')(passport, samlConfig);

    /*
     * =====================================================================
     *  Configure secure routers
     */

    app.use('/', require('./secure')(app, samlConfig, passport));

    // router.get('/', function(req, res, next) {
    //   res.render('index', { title: 'Express' });
    // });
    // app.use('/', router);
};
