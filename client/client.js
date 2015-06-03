var serviceURL = document.URL;
var socket = io.connect(serviceURL);
var name="";
var serverOn=false;
function send() {
	var input = document.getElementById("userInput").value;
	document.getElementById("userInput").value="";
	if(input.trim().length>0)	socket.emit('msg',input.trim());
}
function showMessage(msg){
 	var chatobj=document.getElementById("chat");
	chatobj.innerHTML=chatobj.innerHTML+'</br>'+'['+msg.name+']:'+msg.message;
	chatobj.scrollTop = chatobj.scrollHeight;
}

function login(){
if(serverOn){
	document.getElementById("warning_text").innerHTML="";
	name=document.getElementById("nameInput").value;
	if(name.length>0){
	document.getElementById("loginButton").disabled=true;
	socket.emit('login',name);
	socket.on('logged',function(logged){
		if(logged==true) startChat();
		else{
			document.getElementById("loginButton").disabled=false;
			document.getElementById("warning_text").innerHTML="Name not valid";
		}
	});
	}
	}
}
function startChat(){
	document.getElementById('light').style.display='none';
	document.getElementById('fade').style.display='none';
}
function closeChat(){
	document.getElementById('light').style.display='block';
	document.getElementById('fade').style.display='block';
	document.getElementById("loginButton").disabled=false;
}

socket.on('connect', function(){
	serverOn=true;
	document.getElementById("warning_text").innerHTML="";
	if(name.length>0) login();
		});
socket.on('receive', function(msg) {
	showMessage(msg);
});
socket.on('all-connections', function(data) {
	//actualizarLista(data);
});
socket.on('disconnect', function() {
	serverOn=false;
	document.getElementById("warning_text").innerHTML="Server Offline";
	closeChat();
});
socket.on('error',function(message){
		alert("error"+message);
});
