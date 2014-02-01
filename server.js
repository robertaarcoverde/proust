var net = require('net');

//var processor = new CommandProcessor();
var Clients = (function(){
	
	var clients = [];
	var self = this;
	
	function addClient(client) {
		if(clients.indexOf(client) >= 0) return;					
		
		clients.push(client);
		
		client.setEncoding("utf8");
		client.write("\nwho art thou?\n\t");		
	}

	function broadcast(from, message) {
		var msg = from.name + '> ' + message;
		for(var i = 0; i < clients.length; i++) {
			if(clients[i] == from) continue;
			clients[i].write(msg);
		}
	}

	function privateMessage(from, to, message) {
		//send message to user in pvt
		for(var i = 0; i < clients.length; i++) {
			if(clients[i].name == to) {
				from.write("*** Sent private msg to " + to);
				clients[i].write('*' + from.name + '* ' + message);
			}					
		}
	}

	function login(client, name) {
		client.name = name.match(/\S+/); //ignoring line breaks (\n) from our tcp client
		client.write('***' + client.name + " has joined proust. sounds fun. for now, this is a single-channel IRC server");
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
				var tokens = message.split(' ');
				var user = tokens[1];				
				var pvtMessage = tokens[2];
				privateMessage(client, user, pvtMessage);				
			} else if(message.indexOf("/quit") == 0) {
				logout(client);
			} else if (message.indexOf("/me") == 0) {
				broadcast(client, '* '+ client.name + ' ' + message.substr(4));
			} else {
				//broadcasting
				broadcast(client, message);
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