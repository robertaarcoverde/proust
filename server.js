var net = require('net');
var clients = [];

net.createServer(function (client) {
  clients.push(client);  
  
  client.write("à la recherche du temps perdu...");	
  
}).listen(1337);
console.log('Proust running (on TCP) at port 1337');