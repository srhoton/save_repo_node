const express    = require ('express');
const app        = express();   
const bodyParser = require('body-parser');
const redis = require('redis');
const moment = require('moment');
const request = require('request'); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

//const router = express.Router();     


//Redis config

const redisConfig = {
    "host": "accntinqredis",
    "port": 6379
};

//Logging config

const loggingConfig = {
    "host": "accntinqlog",
    "port": 3000
};

app.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});



app.get('/AccntInq/:id', function(req,res) {
   var acctNumber = req.params.id;
   console.log("Got account number:" + acctNumber);  
   var redisClient = redis.createClient(redisConfig);
   redisClient.get(acctNumber, function(err, reply) {
      console.log('Reply' + reply);
      console.log('Err' + err);
      if (reply === null) {
          console.log("No record found. Going to mainframe.");
          //Mainframe magic happen here
          redisClient.set(acctNumber, moment().format(), function(err, reply) {
              console.log('Reply after cache set: ' + reply); 
              console.log('Sending log message'); 

              var options = {
                  uri: 'http://' + loggingConfig.host + ':' + loggingConfig.port + '/AccntInq/' + acctNumber,
                  method: 'POST',
                  json: {
                      result: 'success',
                      text: 'Redis cache updated for AccntInq ' + acctNumber
                  }               
              };

              request(options, function (error, response, body) {
                  if (!error && response.statusCode == 200) {
                      console.log(body) // Print the shortened url.
                  } else {
                      console.log("ERR " + error);  
                  }
                  res.json({ acct_number: acctNumber });   
              }); 
          }); 
      } else {
          console.log("Record found. returning."); 
          var options = {
	      uri: 'http://' + loggingConfig.host + ':' + loggingConfig.port + '/AccntInq/' + acctNumber,
	      method: 'POST',
	      json: {
	          result: 'success',
	          text: 'Redis cache already current for acct ' + acctNumber
	      }               
          };

          request(options, function (error, response, body) {
	      if (!error && response.statusCode == 200) {
	          console.log(body) // Print the shortened url.
	      } else {
	          console.log("ERR " + error);  
	      }
	      res.json({ acct_number: acctNumber, date_found: reply });   
          }); 
      }
   });
});

app.listen(port);
console.log('Magic happens on port ' + port);
