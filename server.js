var net = require('net');

var Clients = (function(){	
	var clients = [];	
	
	function addClient(client) {
		if(clients.indexOf(client) >= 0) return;					
		
		clients.push(client);
		
		client.setEncoding("utf8");
		client.write("\n*** who art thou?\n>");
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
				from.write("*** Sent private msg to " + to + '\n');
				clients[i].write('*' + from.name + '* ' + message);
			}					
		}
	}

	function changeNickname(client, newNickname){
		broadcast('*** ' + client.name + ' is now known as ' + newNickname + '\n');
		client.name = newNickname;		
	}

	function listUsers(client){
		client.write('\n');
		for(var i = 0; i < clients.length; i++) {						
			client.write('- ' + clients[i].name + '\n');
		}	
	}

	function login(client, name) {
		client.name = name.match(/\S+/); //ignoring line breaks (\n) from our tcp client
		var loginMessage = '*** ' + client.name + " has just joined proust.\n";
		broadcast(loginMessage);
	}

	function logout(client) {
		var i = clients.indexOf(client);
		clients.splice(i,1);
		broadcast('*** ' + client.name + ' has left\n');
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
				logout(client);
				client.end();
			} else if (message.indexOf("/me") == 0) {
				broadcast('* '+ client.name + ' ' + message.substr(4));
			} else if (message.indexOf("/nick") == 0) {
				var newNickname = message.substring(6).match(/\S+/);
				changeNickname(client, newNickname);
			} else if(message.indexOf("/names") == 0) {
				listUsers(client);
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