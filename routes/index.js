var express = require('express');
var marked = require('marked');
var moment = require('moment');
var router = express.Router();

/* GET home page. */
router.get('/', function(req,res,next) {
  res.render('index', {
    title: 'Lucas Shigeru Stinchcombe'
  });
});

router.get('/blog', function(req, res, next) {
  var db = req.db;
  db.collection('blogpost').find({ publish: true }).toArray(function(err,result){
    if (err) throw err;
    res.render('blog', {
      title: 'Blog | Lucas Shigeru Stinchcombe',
      blogposts: result,
      meta: { date : moment(result.date).format('MMM Do YYYY'),
              relDate: moment(result.date).fromNow() },
    });
  });
});

router.get('/blog/:id', function(req, res, next){
  var db = req.db;
  var id = req.params.id;
  db.collection('blogpost').findOne({ _id:id }, function(err,result){
    res.render('blogpost', {
      title: result.title + '|' + 'LucasStinchcombe.me',
      blogpost: result,
      meta: { date : moment(result.date).format('MMM Do YYYY'),
              relDate: moment(result.date).fromNow() },
      body: marked(result.body)
    });
    console.log(marked(result.body));
  });
});

module.exports = router;
