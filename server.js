
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
const fs = require('fs');
const xmlFolder = './tiffs';

function file_names_as_json_object(file_names, base_url) {
   var json_obj = {};
   for (var i = 0, len = file_names.length; i < len; i++) {
		    json_obj[file_names[i]] = base_url + file_names[i];
	  };
   return json_obj;
}

function tiffs(url_base) {
		file_names = fs.readdirSync(xmlFolder);

	return file_names_as_json_object(file_names, url_base);

}
app.get('/tiffs', function (req, res) {
    res.set('Content-Type', 'application/json');
    var url_base = 'http://' + req.hostname + '/tiffs/';
    console.log(tiffs(url_base));
    res.set('Link', '<' + url_base + '>; rel="http://schema.org/EntryPoint", <http://www.metadados.geo.ibge.gov.br/geonetwork_ibge/srv/por/main.home>; rel="metadata"')

    console.log("path: "+ req.hostname);
    res.send(tiffs(url_base));
});

app.get('/tiffs/:tiff_name', function (req, res) {
    res.set('Content-Type', 'image/tiff');
    var link = '<http://' + req.hostname + '/tiffs/>; rel="http://schema.org/EntryPoint"'; 
    link += ', <http://www.metadados.geo.ibge.gov.br/geonetwork_ibge/srv/por/main.home>; rel="metadata"';
    var root_name = req.params.tiff_name.split('.')[0];
    link += ', <http://' + req.hostname + '/contexts/'+ root_name +'.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"';
    var json_name = root_name + '.json';
    var json_file = __dirname + '/jsons/' + json_name;
    if(fs.existsSync(json_file)){
        link += ', <http://' + req.hostname + '/descriptions/'+ json_name +'>; rel="describeby"; type="text/json"';
    }
    res.set('Link', link);
    console.log(req.params.tif_name);
    file_name_with_path = __dirname + '/tiffs/' + req.params.tiff_name;
    console.log(file_name_with_path);
    res.sendFile(file_name_with_path);
});

app.get('/contexts/:file_name', function (req, res) {
    res.set('Content-Type', 'application/ld+json');
    file_name = __dirname + '/tiffs/' + req.params.file_name.split('.')[0] + '.tif';
    if(fs.existsSync(file_name)){
        var json_res = {"@context": {}};
        json_res["@context"][req.params.file_name] = {
            "@id": "http://schema.org/ImageObject",
            "@type": "@id"
        };
        res.status('200');
        res.send(json_res);
    }
    else{
        res.status('404');
        res.send({
           "error": http.STATUS_CODES['404']
        });
    }
});

app.get('/descriptions/:json_name', function (req, res) {
    res.set('Content-Type', 'text/json');
    var jsonld_name = req.params.json_name + 'ld';
    res.set('Link', '<http://'+ req.hostname +'/contexts/' + jsonld_name + '>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"');
    file_name = __dirname + '/jsons/' + req.params.json_name;
    res.sendFile(file_name);
});

server.listen(5096, function () {
  console.log('Example app listening on port 5096!');
});

