var nodeJs = typeof process != 'undefined';

var fs = nodeJs ? require('fs') : null;

var BA_EXISTS    = 0x01;
var BA_REGULAR   = 0x02;
var BA_DIRECTORY = 0x04;
var BA_HIDDEN    = 0x08;
var ACCESS_EXECUTE = 0x01;
var ACCESS_WRITE   = 0x02;
var ACCESS_READ    = 0x04;
var O_RDONLY = 1;
var O_RDWR = 2;
var O_SYNC = 4;
var O_DSYNC = 8;

var IO = function() {
};

IO.getCwd = function() { return (nodeJs) ? process.cwd() : '/assets'; };

IO.getLength = function(path) {
	var stat = fs.lstatSync(path);
	return stat.size;
};

IO.getBooleanAttributes = function(path) {
	var out = 0;
	try {
		var stat = fs.lstatSync(path);
		out |= BA_EXISTS;
		if (stat.isFile()) out |= BA_REGULAR;
		if (stat.isDirectory()) out |= BA_DIRECTORY;
	} catch (e) {
	}
	return out;
};

IO.checkAccess = function(path, flags) {
	try {
		var mode = 0;
		if ((flags & ACCESS_EXECUTE) != 0) mode |= fs.X_OK;
		if ((flags & ACCESS_WRITE) != 0) mode |= fs.W_OK;
		if ((flags & ACCESS_READ) != 0) mode |= fs.R_OK;
		fs.accessSync(path, mode);
		return true;
	} catch (e) {
	}
	return false;
};

IO.Stream = function() {
	this.position = 0;
	this.length = 0;
};

IO.Stream.prototype.open = function(path, flags) {
	var flagsStr = '';
	if ((flags & O_RDONLY) != 0) flagsStr += 'r';
	if ((flags & O_RDWR) != 0) flagsStr += 'w';
	this.fd = fs.openSync(path, flagsStr); // @TODO: convert flags!!!
	var stat = fs.fstatSync(this.fd);
	this.position = 0;
	this.length = stat.size;
};

IO.Stream.prototype.close = function() {
	fs.closeSync(this.fd);
};

IO.Stream.prototype.read = function(data, offset, length) {
	var buffer = new Buffer(length);
	var readed = fs.readSync(this.fd, buffer, offset, length, this.position);
	if (readed > 0) this.position += readed;
	for (var n = 0; n < readed; n++) data[n] = buffer[n];
	return readed;
};

IO.Stream.prototype.write = function(data, offset, length) {
	var written = fs.writeSync(this.fd, new Buffer(data), offset, length, this.position);
	if (written > 0) this.position += written;
	return written;
};

IO.Stream.prototype.getPosition = function() {
	return this.position;
};

IO.Stream.prototype.setPosition = function(v) {
	this.position = v;
};

IO.Stream.prototype.getLength = function() {
	return this.length;
};

IO.Stream.prototype.setLength = function(v) {
	this.length = v;
	this.fd.setLength(v);
};