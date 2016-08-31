
var events = require('events');
var util = require('util');

function tcp_socks5() {
	var self = this;
	
	// 
	self.methods = (data) => {
		if (3 > data.length) {
			self.emit('error', 'error length!');
			return self.destory;
		}
		
		if (5 != data.readInt8(0)) {
			self.emit('error', 'error version!');
			return self.destory;
		}
		
		var length = data.readInt8(1);
		if ((length + 2) > data.length) {
			self.emit('error', 'data to length');
			return self.destory;
		}
		
		for (var i = 2; i < data.length; i++)
		{
			switch (data.readInt8(i))
			{
			case 0:
				self.socket.write(new Buffer([5, 0]));
				return self.request;
			case 1:
				break;
				
			case 2:
				self.socket.write(new Buffer([5, 2]));
				return self.security;
				break;
			
			default:
				break;
			}
		}
		
		self.socket.write(new Buffer([5, 255]));
		return self.destory;
	};
	
	self.security = (data) => {
		if (3 > data.length) {
			self.emit('error', 'error security length!');
			return self.destory;
		}
		
		if (1 != data.readInt8(0)) {
			self.emit('error', 'error security type!');
			return self.destory;
		}
		
		var ulen = data.readUInt8(1);
		var user = data.slice(2, 2 + ulen);
		var plen = data.readUInt8(2 + ulen);
		var pass = data.slice(3 + ulen + plen);
		
		user = user.toString('ascii', 0, user.length);
		pass = pass.toString('ascii', 0, pass.length);
		
		for (var i = 0; i < self.accounts.length; ++i) {
			if (user == self.accounts[i].user && pass == self.accounts[i].pass) {
				self.socket.write(new Buffer([1, 0]));
				return self.request;
			}
		}
	
		self.socket.write(new Buffer([1, 1]));
		return self.destory;
	};
	
	self.request = (data) => {
		if (4 > data.length) {
			self.emit('error', 'error length!');
			return self.destory;
		}
		
		if (5 != data.readInt8(0)) {
			self.emit('error', 'error version!');
			return self.destory;
		}
		
		switch (data.readInt8(1)) {
		case 1:	// connect
			switch (data.readInt8(3)) {
			case 1:	// IPv4
				{
					if (10 > data.length) {
						self.emit('error', 'error IPv4 address length!');
						return self.destory;
					}
					
					var a1 = data.readUInt8(4);
					var a2 = data.readUInt8(5);
					var a3 = data.readUInt8(6);
					var a4 = data.readUInt8(7);
					var port = data.readUInt16BE(8);
					
					var target = {
						host: a1 + '.' + a2 + '.' + a3 + '.' + a4,
						port: port,
						family: 'IPv4'
					};
					
					self.client.connect(target, (err) => {
						if (err) {
							self.socket.write(new Buffer([5, 1, 0, 1, 0, 0, 0, 0, 0, 0]));
						} else {
							var response = new Buffer(10);
							
							self.client.localAddress;
							
							response.writeInt8(5, 0);
							response.writeInt8(0, 1);
							response.writeInt8(0, 2);
							response.writeInt8(1, 3);
							response.writeUInt8(0, 4);
							response.writeUInt8(0, 5);
							response.writeUInt8(0, 6);
							response.writeUInt8(0, 7);
							response.writeUInt16BE(self.client.localPort, 8);
							
							self.socket.write(response);
						}
					});
					
					return self.proxy;
				}
				break;
				
			case 3: // Domain Name
					if (7 > data.length) {
						self.emit('error', 'error Domain Name length!');
						return self.destory;
					}
					
					var length = data.readUInt8(4);
					if (length + 7 > data.length) {
						self.emit('error', 'error Domain Name length!');
						return self.destory;
					}
					
					var domain = data.slice(5, 5 + length);
					var port = data.readUInt16BE(5 + length);
					
					var target = {
						host: domain.toString('ascii', 0, domain.length),
						port: port
					};
					
					self.client.connect(target, (err) => {
						if (err) {
							self.socket.write(new Buffer([5, 1, 0, 1, 0, 0, 0, 0, 0, 0]));
						} else {
							var response = new Buffer(10);
							
							self.client.localAddress;
							
							response.writeInt8(5, 0);
							response.writeInt8(0, 1);
							response.writeInt8(0, 2);
							response.writeInt8(1, 3);
							response.writeUInt8(0, 4);
							response.writeUInt8(0, 5);
							response.writeUInt8(0, 6);
							response.writeUInt8(0, 7);
							response.writeUInt16BE(self.client.localPort, 8);
							
							self.socket.write(response);
						}
					});
					
					return self.proxy;
				break;
				
			case 4:	// IPv6
					if (10 > data.length) {
						self.emit('error', 'error IPv4 address length!');
						return self.destory;
					}
					
					var a1 = data.readUInt16BE(4);
					var a2 = data.readUInt16BE(6);
					var a3 = data.readUInt16BE(8);
					var a4 = data.readUInt16BE(10);
					var a5 = data.readUInt16BE(12);
					var a6 = data.readUInt16BE(14);
					var a7 = data.readUInt16BE(16);
					var a8 = data.readUInt16BE(18);
					var port = data.readUInt16BE(20);
					
					var target = {
						host: a1 + '.' + a2 + '.' + a3 + '.' + a4,
						port: port
					};
					
					self.client.connect(target, (err) => {
						if (err) {
							self.socket.write(new Buffer([5, 1, 0, 1, 0, 0, 0, 0, 0, 0]));
						} else {
							var response = new Buffer(10);
							
							self.client.localAddress;
							
							response.writeInt8(5, 0);
							response.writeInt8(0, 1);
							response.writeInt8(0, 2);
							response.writeInt8(1, 3);
							response.writeUInt8(0, 4);
							response.writeUInt8(0, 5);
							response.writeUInt8(0, 6);
							response.writeUInt8(0, 7);
							response.writeUInt16BE(self.client.localPort, 8);
							
							self.socket.write(response);
						}
					});
					
					return self.proxy;
				break;
				
			default:
				self.emit('error', 'error ATYP type!');
				return self.destory;
				break;
			}
			break;
			
		case 2:	// bind
			break;
			
		case 3:	// udp associate
			break;
			
		default:
			self.emit('error', 'error CMD type!');
			return self.destory;
			break;
		}
	};

	self.proxy = (data) => {
		self.client.write(data);
		
		return self.proxy;
	};

	self.data = (data) => {
		self.proc = self.proc(data);
	};
	
	self.destory = () => {
		console.log('socks5 destory!');
	};
	
	self.proc = self.methods;
}

util.inherits(tcp_socks5, events);

module.exports.socks5 = (socket, client, accounts) => {
	var socks = new tcp_socks5();
	
	socks.client = client;
	socks.socket = socket;
	socks.accounts = accounts;
	
	return socks;
};

