
var net = require('net');
var socks = require('./socks5.js');

var config = {
	bindaddr: {
		family: 'IPv4',
		port: 8000
	},
	accounts: [
		{
			user: 'admin',
			pass: '12345'
		},
		{
			user: 'hacker',
			pass: '123456'
		}
	]
}

var server = net.createServer((socket) => {
	var client = new net.Socket({ readable: true, writable: true });
	var socks5 = socks.socks5(socket, client, config.accounts);
	
	// socket
	socket.on('error', (err) => {
		console.log('socket error:' + err);
	});
	
	socket.on('data', (data) => {
		socks5.data(data);
	});
	
	//socket.on('end' (err) => {
	//	client.destroy();
	//});
	
	// client
	client.on('error', (err) => {
		console.log('client error:' + err);
	});
	
	client.on('data', (data) => {
		socket.write(data);
	});
	
	//client.on('end' (err) => {
	//	socket.destroy();
	//});
	
	// socks5
	socks5.on('error', (err) => {
		console.log('socks5 error:' + err);
	});
	
	var address = socket.address();
	console.log('proxy connected: %j', address);
});

server.on('error', (err) => {
	console.log('server error:' + err);
});

server.listen(config.bindaddr, () => {
	var address = server.address();
	console.log('socks proxy server on: %j', address);
});
