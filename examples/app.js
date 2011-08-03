var $ = require("../lib/jqNode").$;

$("/").get(function(request, response) { 
	$.writeFile("index.html");
});

$(new RegExp("/test")).post(function(request, response, querystring, data) {
	console.log(data);
	$.write(data.sample);
});

$.start({debug: true});
