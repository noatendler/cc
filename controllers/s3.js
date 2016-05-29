//var Promise = require('bluebird');
var fs = require('fs')
    , util = require('util')
    , path = require('path')
    , knox = require('knox')
    , formidable = require('formidable')
    , S3 = require('../models/S3');
var mongoose = require('mongoose');
var ImageResize = require('node-image-resize');
var AWS = require('aws-sdk');
//var restify = require('restify');
//var moment = require('moment');
//var redis = require('redis');

/*
var redisClient = redis.createClient({
    host:"52.91.196.219",
    port:6739
})
*/




/*!
  image url hasher
 */
function hasher(){
  var AUID = [],
      CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  for (var i = 0; i < 6; i++) {
    AUID.push(CHARS[Math.floor(Math.random()*62)]);
  }
  return AUID.join('');
};
/*!
  AWS Client
 */
AWS.config.update({ accessKeyId: '', secretAccessKey: '' });

var client = knox.createClient({
  key: ''
  , secret: ''
  , bucket: 'adinoauploadefile1'
});


module.exports = function(app) {
  app.get('/', function(request, response) {
      S3.find({}, { url:1 }).exec(function(err,user){
    if(err) throw err;
  //  console.log(user);
  response.render('index',{data: user});

  app.on('connect', function() {
    console.log('connected');
});
    });
  });
  app.post('/upload', function(request, response) {
    var ext
      , hash
      , form = new formidable.IncomingForm()
      , files = []
      , fields = [];
    form.keepExtensions = true;
    form.uploadDir = 'tmp';
    form.on('fileBegin', function(name, file) {
      ext = file.path.split('.')[1];
      hash = hasher();
      file.path = form.uploadDir + '/' + hash;
    });
    form.on('field', function(field, value) {
      fields.push([field, value]);
    }).on('file', function(field, file) {
      files.push([field, file]);
    }).on('end', function() {
      fs.readFile(__dirname + '/../tmp/' + hash, function(error, buf) {
        var req = client.put('/images/' + hash + '.png', {
          'x-amz-acl': 'private',
          'Content-Length': buf.length,
          'Content-Type': 'image/png'
        });
  



      fs.writeFile(__dirname +'/../downloads/'+hash+'.png', buf, function(err) {
          if(err){
            return console.log(err);
          }
      });

      var image = new ImageResize(__dirname +'/../downloads/'+ hash + '.png');
      image.smartResizeDown({
        width: 200,
        height: 200
      }).then(function () {
        image.stream(function (err, stdout, stderr) {
            var writeStream = fs.createWriteStream(__dirname +'/../resized/'+ hash + 'resize.png');
            stdout.pipe(writeStream);
        });
    });
      var image2 = new ImageResize(__dirname +'/../downloads/'+ hash + '.png');
      image2.smartResizeDown({
        width: 100,
        height: 100
      }).then(function () {
        image2.stream(function (err, stdout, stderr) {
            var writeStream = fs.createWriteStream(__dirname +'/../resizedSmall/'+ hash + 'resizeSmall.png');
            stdout.pipe(writeStream);
        });
    });

        req.on('response', function(res){
          var image = new S3({
            hash : hash,
            url : req.url
          });
          image.save(function(error, result) {
            if (error) {
              console.error(error);
            } else {
              response.redirect('http://' + request.headers.host + '/' + hash);
            };
          })
          //redisClient.set("img" + hash, req.url)
        });
        req.end(buf);
      });
    });
    form.parse(request);
  });


app.get('/getMongo', function(req, res) { 
         S3.find({}, function(err, img){
            if(err) throw err;
            res.json(img);
         });
});

app.get('/resize/:img', function(req, res){
      fs.readFile(__dirname +'/../resized/'+ req.params.img + 'resize.png', function(error, buf2){
          var s3 = new AWS.S3();
        s3.putObject({
              Bucket: 'adinoauploadefile1',
              Key: 'resized/'+ req.params.img + 'resize.png',
              Body: buf2
            }, function (err) {
             if (err) { throw err; }
            });
       });
      fs.readFile(__dirname +'/../resizedSmall/'+ req.params.img + 'resizeSmall.png', function(error, buf3){
          s3 = new AWS.S3();
        s3.putObject({
              Bucket: 'adinoauploadefile1',
              Key: 'resized/'+ req.params.img + 'resizeSmall.png',
              Body: buf3
            }, function (err) {
             if (err) { throw err; }
            });
       });
});


app.get('/update/:name/:newName', function(req,res){

    S3.update(
    { "hash" : req.params.name },
      {
        $set: { "hash": req.params.newName },

      }, function(err, res){
          if(err)
            console.log(err);
          else
            console.log(req.params.name+' was changed to '+req.params.newName);
      })

 });


app.get('/delete/:imageHash',function(req,res){
  var del = '/images/'+req.params.imageHash+'.png';
client.deleteFile(del, function(err, res){
  if(err){
    console.error(err);
  }
  else{
    console.log(req.params.imageHash+' image was deleted');
  
   var query =  S3.findOne({ hash : req.params.imageHash }, function(error, result) {
      if (error) {
        console.error(error);
      } else {
    query.exec(function(err, doc){
        var query = doc.remove(function(err, deleteDoc){
            if(err)
              console.log('cant delete rom DB');
            else
              console.log('was deleted from DB');
          });
        });
      }
        });
        
    }
    
  });
});
  app.get('/:hash', function(request, response) {
    S3.findOne({ hash : request.params.hash }, function(error, result) {
      if (error) {
        console.error(error);
      } else {
        client.get('/images/' + request.params.hash + '.png').on('response', function(_response){
          if (_response.statusCode === 200) {
            util.pump(_response, response);
          } else {
            response.redirect('/', 404);
          }
        }).end();
      }
    });
  });
};
/* EOF */