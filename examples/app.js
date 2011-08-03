var $ = require("../lib/jqNode").$;

$("/").get(function(request, response) { 
	$.writeFile("index.html");
});

$("/test").post(function(request, response, querystring, data) {
	console.log(data);
	$.write(data.sample);
});

$.start(8888, true);
