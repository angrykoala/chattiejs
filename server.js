var express=require('express');
var app = express(); //starts express framework
var server=require('http').Server(app); //create server attached to express
var io = require("socket.io")(server); //socket io listening to server

app.engine('ejs',require('ejs').renderFile);

app.use(express.static(__dirname + '/public'));

var index_info={
	title: "CHattieJS"
};



app.get('/',function(req,res){
res.render('index.ejs',index_info);
});


var clients=[];

function cleanString(oldstring){
var newstring=oldstring.trim();
return newstring;
}
function addClient(username){
	clients.push(username);
}
function remove(username){
	var index=clients.indexOf(username);
	if(index>-1) clients.splice(index,1);
}
function isValid(username){
	if(username.length<3) return false;
	if(username.indexOf("\<")!=-1 || username.indexOf("\>")!=-1 || username.indexOf("\"")!=-1 || username.indexOf("\'")!=-1 || username.indexOf("\&")!=-1) return false;
	if(username.toLowerCase().indexOf("server")!=-1) return false;
	if(username.indexOf(" ")!=-1 || username.indexOf("\n")!=-1) return false;
	else if(clients.indexOf(username)!=-1) return false;
	else return true;
}
function serverMessage(mess){
	sendMessage("Server",mess);
}
function sendMessage(username,mess){
	var msg={name:cleanString(username),message:cleanString(mess)}
	if(msg.message.length>0 && msg.name.length>0)
	io.sockets.emit('receive', msg);
}

var loggedUsers=0
function logConnectedUsers(){
	console.log("users logged: "+ loggedUsers);
}





io.sockets.on('connection',function(client) {
		var clientName="";
		console.log('New user conected');
		client.on('login',function(name){
			if(isValid(name)){
				clientName=name;
				clients.push(name);
				console.log('User '+name+' logged');

				serverMessage(name+" logged in");
				client.emit('logged',true);
				loggedUsers++;
				logConnectedUsers();
			}
			else client.emit('logged',false);
		});
		client.on('msg', function (data) {
		if(clientName.length>0){
			data=data.trim();
			sendMessage(clientName,data);
		}
		});
		client.on('disconnect', function() {
			if(clientName.length>0){
				 console.log("Client "+clientName+" logged out");
				 loggedUsers--;
				 logConnectedUsers();
				 serverMessage(clientName+" logged out");
				index = clients.indexOf(clientName);
				if (index != -1) clients.splice(index, 1);
				else console.log('Error disconnecting '+clientName);
			}
		else console.log('User disconnect');
		});
	}
);

server.listen(80,function(){
console.log("ChattieJS running on port 80");
});
/*httpServer.listen(port,function() {
console.log("ChattieJS running on port "+port);
});*/