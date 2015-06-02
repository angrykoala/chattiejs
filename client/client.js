var serviceURL = document.URL;
var socket = io.connect(serviceURL);
var name;
function send() {
	var input = document.getElementById("userInput").value;
	document.getElementById("userInput").value="";
	socket.emit('msg',name,input);
}
function showMessage(msg){
 	var chatobj=document.getElementById("chat");
	chatobj.innerHTML=chatobj.innerHTML+'</br>'+msg.name+':'+msg.message;
	chatobj.scrollTop = chatobj.scrollHeight;
}

function login(){
	name=document.getElementById("nameInput").value;
	if(name.length>0){
	document.getElementById("loginButton").disabled=true;
	socket.emit('login',name);
	socket.on('logged',function(logged){
		if(logged==true) startChat();
		else document.getElementById("loginButton").disabled=false;
	});
	
	}
}
function startChat(username){
	document.getElementById('light').style.display='none';
	document.getElementById('fade').style.display='none';
}





socket.on('connect', function(){
		});
socket.on('receive', function(msg) {
	showMessage(msg);
});
socket.on('all-connections', function(data) {
	//actualizarLista(data);
});
socket.on('disconnect', function() {
	mostrar_mensaje('El servicio ha dejado de funcionar!!');
});
