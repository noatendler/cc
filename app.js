var express = require('express')
  var mongoose = require('mongoose')
  var app = express();
/*!
  connect to mongo
 */
mongoose.connect('user:pass@ds025762.mlab.com:25762/cc' || process.env.MONGO_DB);
mongoose.connection.on('error', function(error) {
  throw new Error(error);  
});
/*!
  Setup ExpressJS
 */
  app.use(express.static(__dirname+'/public'));
  app.set('view engine', 'ejs');
  app.set('views', __dirname + '/views');
/*!
  routes
 */
require('./controllers/s3')(app);
/*!
  ExpressJS, Listen on <port>
 */

app.listen(8000, function() {
  console.log('server running on port 8000');
});
/* EOF */