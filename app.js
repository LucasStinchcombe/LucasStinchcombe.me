var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Sessions
var sessions = require('client-sessions');

// Database
// var mongo = require('mongoskin');
// var db = mongo.db('mongodb://localhost:27017/Lucas', {native_parser:true});

// Mongolab
var mongo = require('mongodb');
var mongoUri = process.env.MONGOLAB_URI;
mongo.Db.connect(mongoUri, function (err, db) {
  db.collection('mydocs', function(er, collection) {
    collection.insert({'mykey': 'myvalue'}, {safe: true}, function(er,rs) {
    });
  });
});

var routes = require('./routes/index');
var admin = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configure Sessions
app.use(sessions({
  cookieName: 'session',
  secret: 'whatdoesthefoxsayjvifwiwhvpijs',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  cookie: {
    path: '/admin',
    ephemeral: true
  }
}));

// Logout Admin
app.get('/logout', function(req, res){
  req.session.reset();
  console.log(req.session);
  res.redirect('/admin');
});

// Make db accessible to app
app.use( function(req, res, next) {
  req.db = mongo.Db;
  next();
});

app.use('/', routes);
app.use('/admin', admin);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
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


module.exports = app;
