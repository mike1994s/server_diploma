

module.exports = function(server, middle){
 	var io = require('socket.io')(server);
/*	var User  = require('../app/models/user');
	io.use(function(socket, next){
       	 // Wrap the express middleware
        	middle(socket.request, {}, next);
	}); 
 */
 	io.on('connection', function(socket){
/*		console.log(socket.request);
  		console.dir(socket.request.session.passport)
  		var id = socket.request.session.passport.user;
		User.findById(id, function(err, user) {
			console.dir(user);
			console.dir(err);
			if (err)
				return;
			console.dir(user);
           	  	socket.username =  user.vk.name || user.facebook.email;
        	});*/
		socket.on('chat message', function(msg){
  	 	 	io.emit('chat message', socket.username + ":" + msg);
 	 	});
	});

};
