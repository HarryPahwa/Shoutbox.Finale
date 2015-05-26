var express           =     require('express'),
	passport          =     require('passport'),
	util              =     require('util'),
	TwitterStrategy   =     require('passport-twitter').Strategy,
	session           =     require('express-session'),
	cookieParser      =     require('cookie-parser'),
	bodyParser        =     require('body-parser'),
	config            =     require('./config'),
	mysql             =     require('mysql'),
	twitterAPI        =     require('node-twitter-api'),
	app               =     express();

//Define MySQL parameter in Config.js file.
var connection = mysql.createConnection({
	host     : config.host,
	user     : config.username,
	password : config.password,
	database : config.database
});


//Connect to Database only if Config.js parameter is set.
if(config.use_database==='true') {
	connection.connect();
}


// Passport session setup.
passport.serializeUser(function(user, done) {
	done(null, user);	
});
passport.deserializeUser(function(obj, done) {
	done(null, obj);
});


// Use the TwitterStrategy within Passport.
passport.use(new TwitterStrategy({
	consumerKey: config.twitter_api_key,
	consumerSecret:config.twitter_api_secret ,
	callbackURL: config.callback_url
	},
	function(token, tokenSecret, profile, done) {
		session.token = token;
		session.tokenSecret = tokenSecret;
		process.nextTick(function () {

			//Check whether the User exists or not using profile.id
			if(config.use_database==='true') {
				connection.query("SELECT * from user_info where user_id="+profile.id,function(err,rows,fields){
					// if (err) throw err;
					if(rows.length===0) {
						console.log("There is no such user, adding now");
						connection.query("INSERT into user_info(user_id,user_name) VALUES('"+profile.id+"','"+profile.username+"')");
					}
					else {
						console.log("User already exists in database");
					}
				});
			}
			return done(null, profile);
		});
	}
));


// Template rendering, etc.
app.set('views', __dirname + '/templates');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'keyboard cat',
					saveUninitialized: true,
					resave: true,
					key: 'sid'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/img'));

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
	console.log("Hey"); 
	res.render('account', { user: req.user });
});

app.get('/auth/twitter', passport.authenticate('twitter'));


app.get('/auth/twitter/callback',
	passport.authenticate('twitter', { successRedirect : '/', failureRedirect: '/login' }),
	function(req, res) {
		res.redirect('/');
	}
);

app.get('/logout', function(req, res){
	req.logout();
	delete session.token;
	delete session.tokenSecret;
	res.redirect('/');
});

/***************************POST*TO*TWITTER********************************************/
app.get('/post-status', function (req, res) {
	// console.log(req.query.message);
	twitter.statuses("update", {
			status: req.query.message
		},
		session.token, 
		session.tokenSecret,
		function(error, data, response) {
			if (error) {
				// something went wrong 
				// 500 error code with express
				console.log("error"); 
				console.log(error); 
			} else {
				// data contains the data sent by twitter 
				res.send(req.query.message)
			}
		}
	);
})
var twitter = new twitterAPI({
	consumerKey: config.twitter_api_key,
	consumerSecret:config.twitter_api_secret ,
	callbackURL: config.callback_url
});
/**************************************************************************************/


function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	res.redirect('/login')
}

app.listen(process.env.PORT || 3000);