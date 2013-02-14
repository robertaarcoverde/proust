var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain; charset="UTF-8"'});
  res.end('à la recherche du temps perdu...\n');
}).listen(1337, '127.0.0.1');
console.log('Proust running at http://127.0.0.1:1337/');