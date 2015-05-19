var express = require('express');
var bcrypt = require('bcrypt-nodejs');
var marked = require('marked');
var moment = require('moment');
var router = express.Router();

// Check Session Info
router.use( function(req,res,next) {
  console.log('--> checking session info');
  // Check if session exists
  if(req.session && req.session.user){
    var username = req.session.user.username;
    var password = req.session.user.password;
    var db = req.db;
    // find corresponding admin in database
    db.collection('admin').findOne({ username: username }, function(err, user){
        // Check if admin username and password match
        if (user && user.password === password) {
          console.log('  --> session validated');
          req.user = user;
          req.session.user = user;
          res.locals.user = user;
        }
        next();
    });
  }
  else{
    next();
  }
});

// GET Admin Authentication Page
router.get('/', function(req, res, next) {
  if(req.user){
    res.redirect('/admin/home');
  }
  else {
    res.render('adminAuth', {
      title: 'Admin | Lucas Shigeru Stinchcombe'
    });
  }
});

// POST Admin Athentication Info to Login
router.post('/', function(req, res){
  var db = req.db;
  var username = req.body.username;
  var password = req.body.password;
  db.collection('admin').findOne({ username: username },function(err, user){
    // compare passwords
    bcrypt.compare(password, user.password, function(err, doesMatch){

      if(doesMatch){
        // set cookie with user info
        req.session.user = user;
        res.redirect('/admin/home');
      }
      else{
        res.send(err);
      }
    });
  });
});

// Get admin Home page
router.get('/home', requireLogin, function(req, res){
  res.render('indexAdmin', {
    title: 'Admin | Lucas Shigeru Stinchcombe'
  });
});

// GET admin blog page
router.get('/blog', requireLogin, function(req, res){
  var db = req.db;
  db.collection('blogpost').find().toArray(function(err,result){
    res.render('blogAdmin', {
      title: "Lucas Stinchcombe",
      blogposts: result,
      meta: { date : moment(result.date).format('MMM Do YYYY'),
              relDate: moment(result.date).fromNow() },
    });
  });
});

// GET new blogpost
router.get('/blog/new', function(req, res){
  res.render('adminNewPost',{ title: 'New|LucasStinchcombe.me'});
});

// POST new blogpost
router.post('/blog/new', function(req, res){
  var db = req.db;
  var id = req.body.id;
  var newPost = { _id: req.body.id,
                  title: req.body.title,
                  description: req.body.description,
                  date: new Date(),
                  body: req.body.post,
                  publish: (typeof req.body.publish!='undefined') }
  db.collection('blogpost').insert(newPost, function(err, result){
    if(err) res.send('Error!');
    else res.redirect('/admin/blog/'+id);
  });
});

// GET blogpost with id
router.get('/blog/:id', function(req, res){
  var db = req.db;
  var id = req.params.id;
  db.collection('blogpost').findOne({ _id:id }, function(err,result){
    console.log(result);
    res.render('blogpostAdmin', {
      title: result.title + '|' + 'Lucas Shigeru Stinchcombe',
      blogpost: result,
      meta: { date : moment(result.date).format('MMM Do YYYY'),
              relDate: moment(result.date).fromNow() },
      body: marked(result.body)
    });
  });
});

// POST blogpost edit
router.post('/blog/edit', function(req,res){
  var db = req.db;
  var dbId = req.body.databaseId;
  var id = req.body.id;
  var newPost = { _id: req.body.id,
                  title: req.body.title,
                  description: req.body.description,
                  date: req.body.date,
                  body: req.body.post,
                  publish: (typeof req.body.publish!='undefined') }
  if(dbId===id){
    db.collection('blogpost').update({ _id: dbId }, newPost, function(err, result){
                                         if (err) res.send('Error');
                                         else res.redirect('/admin/blog/'+id);
                                       });
  }
  else{
    db.collection('blogpost').remove({ _id: dbId }, function(err, result){
      if(err) res.send('Error!');
    });
    db.collection('blogpost').insert(newPost, function(err, result){
      if(err) res.send('Error!');
      else res.redirect('/admin/blog/'+id);
    });
  }
});

// Checks whether login is necessary
function requireLogin (req, res, next) {
  if(!req.user) {
    res.redirect('/admin');
  }
  else{
    next();
  }
};

module.exports = router;
