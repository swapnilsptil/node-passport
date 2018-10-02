var express = require('express');
var app = express();
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');

var constants = require('./constant/contant');
var configDB = require('./config/database');

mongoose.connect(configDB.url, {useNewUrlParser: true});

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(session({secret: constants.sessionKey, saveUninitialized : true, resave: true}));
require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash());

app.set('view engine', 'ejs')
// App routes 

require('./routes/routes.js')(app,passport);



module.exports = app;
