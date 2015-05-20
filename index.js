var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
 
app.use(express.static('public'));
 
app.ws('/websocket', function(ws, req) {
  ws.on('message', function(msg) {
    var data;
    try {
      data = JSON.parse(msg);
    } catch (e) {
      req.close();
    }
    console.log('Received message: ' + msg);
  });
});
 
app.listen(3000);
