 
module.exports = function(app, passport) {

    // route for home page
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // route for login form
    // route for processing the login form
    // route for signup form
    // route for processing the signup form

    // route for showing the profile page
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    app.get('/chat',isLogin,  function(req, res){
	res.render('chat.ejs');	
   });
    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/vk', passport.authenticate('vkontakte', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/vk/callback',
        passport.authenticate('vkontakte', {
         //  successRedirect : '/profile',
            failureRedirect : '/'
        }),
	 function(req, res) {
		console.dir(req);
		return res.json({code: 200,
				word : "ok",
				data : {
					token : req.user.access_token,
				}
		});
});
    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
//            successRedirect : '/profile',
            failureRedirect : '/'
        }),
	 function(req, res) {
		console.dir(req);
		return res.json({code: 200,
				word : "ok",
				data : {
					token : req.user.access_token,
				}
});
   	//	res.redirect("/chat?access_token=" + req.user.access_token);
  	}
);

app.get('/clientchatfb', passport.authenticate('facebook', {scope : 'email'}));


    // route for logging out
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

app.get(
    '/prof',
    passport.authenticate('bearer', { session: false }),
    function(req, res) {
        res.send("LOGGED IN as " + req.user.facebook + " - <a href=\"/logout\">Log out</a>");
    }
);
app.get('/tokenchat',
	passport.authenticate('bearer', { session:false}),
	function(req, res)
	{
		res.render('chat.ejs');
	});
};
		 // newUser.vk.token = token; // we will save the token that facebook provides to the user                    
		 // newUser.vk.token = token; // we will save the token that facebook provides to the user                    
		 // newUser.vk.token = token; // we will save the token that facebook provides to the user                    

var User = require('../app/models/user');
var request = require('request');
function isLogin(req, res, next){
	var source = req.param('source');
	var token  = req.param('token');
	if (source == "vk"){
		var uri = 'https://api.vk.com/method/secure.checkToken?token=' + token;
		request(uri, function (error, response, body) {
			if (error){
				console.dir(error);
			}
			var ans  = JSON.parse(body);
			console.log("was not  error " + !error);
	
			var error_code = ans.error.error_code;
			console.log(error_code + '   = error code ');
			if (!error && error_code != 5) {
    				return next(); 
 			 }
});
}
else if (source == "fb"){
		var uri = 'https://graph.facebook.com/me?access_token=' + token;
		request(uri, function (error, response, body) {
			if (error){
				console.dir(error);
			}
			var ans  = JSON.parse(body);
			console.log("was error not " + !error);
			var error_code = ans.error.code;
			console.log(error_code + '   = error code ');
		console.dir(body);
		if (!error && error_code != 190) {
    			return next(); 
 		 }
	});
		
	}
	res.json({code : 401});
}
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

//	var isToken = passport.authenticate('bearer', {session : false});
 //    console.log("token is = " +  isToken);
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    var ac_token = req.param('access_token');
    User.findOne({ 'access_token' : ac_token}, 
		function(err, user){
		if (err){
		    return res.json({ code: "401",
				   ans : "invalid token",
				 });
		
		}
		if (!user){
		    return res.json({ code: "401",
				   ans : "invalid token",
				 });
			
		}
		return next();	
	});
    // if they aren't redirect them to the home page
    res.redirect('/');
}

