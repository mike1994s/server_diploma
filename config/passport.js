var localStrategy    = require('passport-local').Strategy;
var VkontakteStrategy = require('passport-vkontakte').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var FacebookTokenStrategy = require('passport-facebook-token');

// load up the user model
var User  = require('../app/models/user');

// load the auth variables
var configAuth = require('./auth');

module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
    
    // code for login (use('local-login', new LocalStategy))
    // code for signup (use('local-signup', new LocalStategy))

     passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
	profileFields:  ['emails']
    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
  
                if (user) {

		    user.access_token = token;
		    user.source = "fb";    
		user.facebook.token = token; // we will save the token that facebook provides to the user                    
		    user.save(function(err){
			if (err)
			  throw err;
			return done(null, user);	
		   });
              } else {
                    // if there is no user found with that facebook id, create them
                    var newUser            = new User();
		    console.dir(profile);	
                    // set all of the facebook information in our user model
                    newUser.facebook.id    = profile.id; // set the users facebook id                   
                 newUser.access_token = token;
		newUser.source = "fb";    
		newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
                    newUser.facebook.name  = profile.displayName; //profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                    newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
        });

    }));
    // =========================================================================

passport.use(
    new BearerStrategy(
        function(token, done) {
	    console.dir(arguments);
            User.findOne({ 'access_token': token },
                function(err, user) {
                    if(err) {
                        return done(err)
                    }
                    if(!user) {
                        return done(null, false)
                    }

                    return done(null, user, { scope: 'all' })
                }
            );
        }
    )
);

    // =========================================================================
    passport.use(new VkontakteStrategy ({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.vkAuth.clientID,
        clientSecret    : configAuth.vkAuth.clientSecret,
        callbackURL     : configAuth.vkAuth.callbackURL,
	
    	apiVersion : "5.32"
    },

    // facebook will send back the token and profile
    function(token, refreshToken,params, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            User.findOne({ 'vk.id' : profile.id }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
		   user.access_token = token;
		  user.source = "vk";
		  user.vk.token = token; // we will save the token that facebook provides to the user                    
  		  user.save(function(err){
                        if (err)
                          throw err;
                        return done(null, user);
                   });

                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser            = new User();
			console.dir(params);
			console.dir(profile);
		//	return;
                    // set all of the facebook information in our user model
                     newUser.vk.id    = profile.id; // set the users facebook id                   
                    newUser.access_token = token;
		   newUser.source = "vk";
		  newUser.vk.token = token; // we will save the token that facebook provides to the user                    
                    newUser.vk.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                    newUser.vk.email = params.email; // facebook can return multiple emails so we'll take the first

                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
        });

    }));

};

