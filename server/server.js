// Uncomment following to enable zipkin tracing, tailor to fit your network configuration:
// var appzip = require('appmetrics-zipkin')({
//     host: 'localhost',
//     port: 9411,
//     serviceName:'frontend'
// });

require('appmetrics-dash').attach();
require('appmetrics-prometheus').attach();
const appName = require('./../package').name;
const http = require('http');
const express = require('express');
const path = require('path');
const app = express();

const serviceManager = require('./services/service-manager');
require('./services/index')(app);

const IBMCloudEnv = require('ibm-cloud-env');
IBMCloudEnv.init();
console.log(IBMCloudEnv.getString('w3id_app_host'))
const environment = IBMCloudEnv.getString('node_env') || 'development';
const log4js = require('log4js');
const logger = log4js.getLogger(appName);
logger.level = IBMCloudEnv.getString('node_log_level') || 'info'
app.use(log4js.connectLogger(logger, { level: logger.level }));


// Add your code here
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// view engine setup
const event_idx = parseInt(IBMCloudEnv.getString('node_checkin_event_idx'));
const config = IBMCloudEnv.getDictionary('tw-ewc-config')
const event = config.node_checkin_events[event_idx]
logger.info(path.join(__dirname, 'views', event))
app.set('views', path.join(__dirname, 'views', event));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, './../public/img/favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

require('./routers/index')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (environment === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


const server = http.createServer(app);
/**
 * Listen on provided port, on all network interfaces.
 */

server.on('error', onError);
const port = IBMCloudEnv.getString('node_port')
server.listen(port, function(){
  logger.info(`twewcenroll listening on http://localhost:${port}/appmetrics-dash`);
  logger.info(`twewcenroll listening on http://localhost:${port}`);
});

/***
 * Enable HTTPS if running locally
 */
const https_port = IBMCloudEnv.getString('node_https_port')
if (https_port){
    var https = require('https');
    var fs = require('fs');
    var sslOptions = {
        key: fs.readFileSync(path.join(__dirname, '/server.key')),
        cert: fs.readFileSync(path.join(__dirname, '/server.cert'))
    };
    const servers = https.createServer(sslOptions, app);
    servers.on('error', onError);
    servers.listen(https_port,
      function() {
        logger.info(`twewcenroll listening on https://localhost:${https_port}/appmetrics-dash`);
        logger.info(`twewcenroll listening on https://localhost:${https_port}`);
      }
    );
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

module.exports = server;
