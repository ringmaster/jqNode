var fs = require("fs"),
	http = require("http"),
	url = require("url");

var routes = {},
regexroutes = [],
	server = http.createServer();

var	_response, _data;

function route(request, response) {
	var parsedUrl = url.parse(request.url, true),
		pathName = parsedUrl.pathname,
		method = request.method;

	_response = response;
	_querystring = parsedUrl.query;
	
	$.debug("Received " + method + " request at " + pathName);
	$.debug(request.headers);

	var handler = false;
	
	if(routes[pathName] && (handler = routes[pathName][method])){
		handler = routes[pathName][method];
	} else {
		for(routeindex in regexroutes) {
			route = regexroutes[routeindex];
			if(pathName.match(route.regex) && method == route.method) {
				handler = route.callback;
				break;
			}
		}
	}
	if(!handler && $.config.docroot) {
		filename = $.config.docroot + pathName.replace(/\.\./, '.');
		handler = function(){$.writeFile(filename, $.mimetype(filename));}
	}
	if(handler) {
		_data = "";
		request.addListener("data", function(chunk) {
			_data += chunk;
		});
		request.addListener("end", function() {
			handler(request, response, _querystring, require('querystring').parse(_data));
		});
	}
	else {
		response.writeHead(404, {'Content-Type' : 'text/html'});
		response.end("<h1>404. Not found.</h1>");
	}
}

function addRoute(url, method, callback) {
	finder = /function (.+?)\(/;
	url.constructor.toString().match(finder);
	switch(RegExp.$1) {
		case "RegExp":
			regexroutes.push({'regex': url, 'method': method, 'callback': callback});
			break;
		default:

			if(!routes[url]) {
				routes[url] = {};
			}
			routes[url][method] = callback;
			break;
	}
}

var $ = function(url) {
	return $.fn.init(url);
}

$.fn = $.prototype;

$.fn.init = function(url) {
	this.url = url;
	return this;
}

$.fn.get = function(callback) {
	addRoute(this.url, "GET", callback);
	return this;
}

$.fn.post = function(callback) {
	addRoute(this.url, "POST", callback);
	return this;
}

$.fn.head = function(callback) {
	addRoute(this.url, "HEAD", callback);
	return this;
}

$.fn.put = function(callback) {
	addRoute(this.url, "PUT", callback);
	return this;
}

$.fn['delete'] = function(callback) {
	addRoute(this.url, "DELETE", callback);
}

$.mimetypes = {
	html: 'text/html',
	htm: 'text/html',
	png: 'image/png',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	gif: 'image/gif',
	css: 'text/css',
	js: 'text/javascript'
};

$.mimetype = function(filename) {
	filename.match(/\.([^.]+)$/);
	if($.mimetypes[RegExp.$1] != undefined) {
		return $.mimetypes[RegExp.$1];
	}
	return 'application/octet-stream';
}

$.debug = function() {
	if($.config.debug) {
		console.log.apply($, arguments);
	}
}

$.start = function(config) {
	$.config = {
		port: 8888,
		debug: false,
		docroot: false,
	}
	for (attrname in config) { $.config[attrname] = config[attrname]; }
	if($.config.debug) {
		console.log('Config Options:');
		for (attrname in $.config) { console.log('  ' + attrname + ': ' + $.config[attrname]); }
	}
	server.on('request', route);
	server.listen($.config.port);
	$.debug("Listening at port " + $.config.port);
	return server;
}

$.write = function(data, contentType) {
	if(!contentType) {
		contentType = "text/html";
	}
	_response.writeHead(200, {'Content-Type' : contentType});
	_response.end(data);
}

$.writeFile = function(fileName, contentType) {
	if(!contentType) {
		contentType = "text/html";
	}
	fs.readFile(fileName, function(error, data) {
		if(error) {
			_response.writeHead(404, {'Content-Type' : 'text/html'});
			_response.end("<h1>404. Not found</h1>");
			$.debug(fileName + " not found");
		} else {
			_response.writeHead(200, {'Content-Type' : contentType});
			_response.end(data);
		}
	});
}

exports.$ = $;

