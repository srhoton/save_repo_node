const express    = require ('express');
const app        = express();   
const bodyParser = require('body-parser');
const moment = require('moment');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

//const router = express.Router();     


app.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

app.post('/AccntInq/:id', function(req,res) {
   var acctNumber = req.params.id;
   var message = req.body;
   console.log("Got account number:" + acctNumber);  
   console.log("Got message:" + JSON.stringify(message));  
    res.json({ message: 'log saved' });   
});

app.listen(port);
console.log('Magic happens on port ' + port);
