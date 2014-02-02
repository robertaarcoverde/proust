var net = require('net');

var Clients = (function(){	
	var clients = [];
	var self = this;
	
	function addClient(client) {
		if(clients.indexOf(client) >= 0) return;					
		
		clients.push(client);
		
		client.setEncoding("utf8");
		client.write("\n\t*** who art thou?\n\t>");
	}

	function broadcast(message, from) {
		if(from) { 
			message = from.name + '> ' + message; 
		}

		for(var i = 0; i < clients.length; i++) {
			if(from && clients[i] == from) continue;
			clients[i].write(message);
		}
	}

	function privateMessage(from, to, message) {
		//send message to user in pvt
		for(var i = 0; i < clients.length; i++) {
			if(clients[i].name == to) {
				from.write("*** Sent private msg to " + to + '\n\t');
				clients[i].write('*' + from.name + '* ' + message);
			}					
		}
	}

	function login(client, name) {
		client.name = name.match(/\S+/); //ignoring line breaks (\n) from our tcp client
		client.write('*** ' + client.name + " has joined proust. sounds fun. for now, this is a single-channel IRC server\n");
	}

	function logout(client) {
		var i = clients.indexOf(client);
		clients.splice(i,1);			
	}
	
	return {
		add : addClient,
		logout : logout,
		process : function(client, message){
			if(!client.name) {
				login(client,message);
			} else if (message.indexOf("/msg") == 0){
				var tokens = message.match(/\/msg\s(\w+)\s(.*)/);
				var user = tokens[1];
				var pvtMessage = tokens[2];
				privateMessage(client, user, pvtMessage);				
			} else if(message.indexOf("/quit") == 0) {
				broadcast('*** ' + client.name + ' has left');
				client.end();
			} else if (message.indexOf("/me") == 0) {
				broadcast('* '+ client.name + ' ' + message.substr(4));
			} else {				
				broadcast(message, client);
			}
		}
	};
})();

net.createServer(function (client) {
	Clients.add(client)
  
	client.on('data', function(data){		
		Clients.process(client, data);
	});  
  
	client.on('end', function(){
		Clients.logout(client);
	});

}).listen(13237);

console.log('Proust running (on TCP) at port 13237');