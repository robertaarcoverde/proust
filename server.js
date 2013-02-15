var net = require('net');
var clients = [];

net.createServer(function (client) {
  clients.push(client);
  client.setEncoding("utf8");
  
  client.write("à la recherche du temps perdu... oh, mon ami, who art thou?\n\t");
  
  client.on('data', function(data){
	if(!client.name) {
		client.name = data.match(/\S+/); //ignoring line breaks (\n) from our tcp client :)
		console.log(client.name + " has joined proust. sounds fun.");
	} else {
		client.broadcast(data);
	}
  });  
  
  client.on('end', function(){
	var i = clients.indexOf(client);
	clients.splice(i,1);
  });
  
  client.broadcast = function(data) {
	var message = this.name + ">" + data;
	for(var i = 0; i < clients.length; i++) {
		if(clients[i] == this) continue;
		clients[i].write(message);
	}
  };
  
}).listen(1337);

console.log('Proust running (on TCP) at port 1337');