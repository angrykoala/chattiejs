var http = require("http");
var url = require("url");
var fs = require("fs");
var path = require("path");
var socketio = require("socket.io");
var mimeTypes = { "html": "text/html", "jpeg": "image/jpeg", "jpg": "image/jpeg", "png": "image/png", "js": "text/javascript", "css": "text/css", "swf": "application/x-shockwave-flash"};

var httpServer = http.createServer(
	function(request, response) {
		var uri = url.parse(request.url).pathname;
		if (uri=="/") uri = "/client/index.html";
		var pre=uri.split("/");
		if(pre[0]!="" || (pre[1]!="client" && pre[1]!="favicon.ico")){
				response.writeHead(200, {"Content-Type": "text/plain"});
				response.write('404 Not Found\n');
				response.end();
		}
		var fname = path.join(process.cwd(), uri);
		fs.exists(fname, function(exists) {
			if (exists) {
				fs.readFile(fname, function(err, data){
					if (!err) {
						var extension = path.extname(fname).split(".")[1];
						var mimeType = mimeTypes[extension];
						response.writeHead(200, mimeType);
						response.write(data);
						response.end();
					}
					else {
						response.writeHead(200, {"Content-Type": "text/plain"});
						response.write('Error de lectura en el fichero: '+uri);
						response.end();
					}
				});
			}
			else{
				console.log("Peticion invalida: "+uri);
				response.writeHead(200, {"Content-Type": "text/plain"});
				response.write('404 Not Found\n');
				response.end();
			}
		});
	}
);

httpServer.listen(8080);
var io = socketio.listen(httpServer);

var clients=[];
function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }
function cleanString(oldstring){
var newstring=oldstring.trim();

return escapeHtml(newstring);
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

io.sockets.on('connection',function(client) {
		var clientName="";
		console.log(client.handshake.address+' conected');
		client.on('login',function(name){
			if(isValid(name)){
				clientName=name;
				clients.push(name);
				console.log('User '+name+'  '+client.handshake.address+' logged');
				serverMessage(name+" logged in");
				client.emit('logged',true);
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
				 serverMessage(clientName+" logged out");
				index = clients.indexOf(clientName);
				if (index != -1) clients.splice(index, 1);
				else console.log('Error disconnecting '+clientName);
			}
		else console.log('User '+client.handshake.address+' disconnect');
		});
	}
);


console.log("ChattieJS running");
