var net = require('net');
var Clients = (function(){
	
	var clients = [];
	
	function addClient(client) {
		if(clients.indexOf(client) >= 0) return;					
		
		clients.push(client);
		
		client.setEncoding("utf8");
		client.write("à la recherche du temps perdu... oh, mon ami, who art thou?\n\t");
	}
	
	return {
		add : addClient,
		login : function(client) {
			client.name = data.match(/\S+/); //ignoring line breaks (\n) from our tcp client :)
			client.write(client.name + " has joined proust. sounds fun.");
		},
		logout : function (client) {
			var i = clients.indexOf(client);
			clients.splice(i,1);
		}
	};
})();

net.createServer(function (client) {
	Clients.add(client)
  
	client.on('data', function(data){
		if(!client.name) {
			Clients.login(client);
		} else {
			client.broadcast(data);
		}
	});  
  
	client.on('end', function(){
		Clients.logout(client);
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