'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var globalCount=0;
var cors = require('cors');
var dns = require('dns');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGO_URI,function(err) {
    if (err)
        return console.error(err);
});
app.use(cors());


// inspired by: https://www.kompulsa.com/introduction-mongoose-storing-data-mongodb/
//vielleicht die lösung ???
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
 db.once("open", function(callback) {
    console.log("Connection succeeded.");
   });

//console.log(db)


var Schema = mongoose.Schema;
var urlschema = new Schema({
  long: {type: String, required: true},
  short: {type: String, required: true}
});
var Shorturl = mongoose.model('Shorturl',urlschema);


var createAndSaveShorturl = function(long,short,done) {
  
  var shorturl= new Shorturl({long: long, short: short});
  console.log("shorturl:", shorturl);
  shorturl.save((err,data)=> {
    //console.log("OhhhmyyyyG")
    if(err) {
      console.log(err);
      return done(err);
    }
  console.log("data:",data)
  return done(null , data);
})};
 var findOneByLongUrl= function(reqUrl, done) {
Shorturl.findOne({short: reqUrl}, (err, data) =>{
    if(err) {
      console.log("in funktion err", err)
      return done(err);
    }
    console.log('whaaaaaat',data);
    return done(null, data);
    })};
/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}))

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


app.get('/shorter/', function(req, res){
  res.sendFile(process.cwd() + '/views/shorter.html');
});

app.post("/short-api/", function (req, res) {
  console.log(req.body[1])
  res.json({greeting: 'hello API'});
});

app.post("/api/shorturl/new", function (req, res) {
  var responseUrl;
  console.log(req.body['url']);
  globalCount++;
  console.log(globalCount,Date.now());
  var lookupdns;
  if(req.body['url'][4]=='s'){
  lookupdns= req.body['url'].substring(9);
  }else{
    lookupdns= req.body['url'].substring(8);
  };
  dns.lookup(lookupdns, function (err, addresses, family) {
        if (err){
          console.log(err);
          res.json({"error":"invalid URL"});
        }else{
  createAndSaveShorturl(req.body['url'],Date.now().toString(), (err,data)=>{
    console.log("wowow")
    if(data){
          console.log("success", data);
      res.json({'data': data})
  console.log(addresses);
       }else {{res.json({greeting: 'ERROR'})}
}});
      
   
  }});
});

app.get("/api/shorturl/*", function (req, res){
  console.log(req['url'].substring(14));
  var reqUrl =req['url'].substring(14);
 findOneByLongUrl(reqUrl, (err, data) => {
   if (data){
      console.log("success", data['long']);
     res.redirect(data['long']);
   }else {
     console.error(err);
     console.log(data);
     {res.json({greeting: 'ERROR'})}
 }})


});


app.listen(port, function () {
  console.log('Node.js listening ...');
});