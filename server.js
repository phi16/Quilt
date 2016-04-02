var http = require("http");
var express = require("express");
var path = require("path");
var filed = require("filed");

var app = express();
app.get('/',function(req,res){
  res.sendFile('/cygwin64/home/16/Quilt/files/main.html');
});
app.use(express.static('files'));
http.createServer(app).listen(3000);
console.log(":)");
