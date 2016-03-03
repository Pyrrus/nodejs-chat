//Import all our dependencies

var express = require('express');
var mongo = require('mongodb').MongoClient;
var client = require('socket.io').listen(8080).sockets;
var app = express();

app.use(express.static(__dirname + '/public'));


mongo.connect('mongodb://localhost:27017/chat', function(err, db) {
	if(err)
		throw err;

	client.on('connection', function(socket) {
		var col = db.collection('messages');

		var sendStatus = function(s) {
			socket.emit('status', s);
		};

		// all messages
		col.find().limit(20).sort({_id: 1}).toArray(function(err, res){
			if (err)
				throw err;
			socket.emit('output', res)
		});

		// input
		socket.on('input', function(data) {
			var whitespace = /^\s*$/;

			if (whitespace.test(data.name) || whitespace.test(data.message)) {
				sendStatus('Name and message is required.');
			} else {
				col.insert({name: data.name, message: data.message}, function(){
					console.log("PASS");

					// latest massage to all 
					client.emit('output', [data]);

					sendStatus({
						message: "message sent",
						clear: true
					})
				});
			}
			
		});
	})

});



app.listen(3000);
console.log("Server running on port 3000");