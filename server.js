var express  = require('express');
var session = require('express-session');
var redis   = require("redis");
var redisStore = require('connect-redis')(session);
var app      = express();
var port     = process.env.PORT || 8000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var client = redis.createClient();

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var sessionStore = new redisStore({ host: 'localhost', port: 6379, client: client });

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration
var morgan = require('morgan')
var session = require('express-session')
var env = process.env.NODE_ENV || 'development';
var sessionMiddleWare = session({
	 	key : 'express.sid',
		store : sessionStore,
		secret: 'itsallthesameitsallthesameitsallthesame' })
if ('development' == env) {


	// set up our express application
	app.use(morgan('combined')); // log every request to the console
	app.use(cookieParser()); // read cookies (needed for auth)
	app.use(bodyParser()); // get information from html forms

	app.set('view engine', 'ejs'); // set up ejs for templating

	// required for passport
	app.use(sessionMiddleWare); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session

}

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
var http = require('http').Server(app);
http.listen(port, function(){
	console.log('The magic happens on port ' + port);
});
require('./socket')(http, sessionMiddleWare);
