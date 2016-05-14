var fs = require('fs');
var express = require('express');
var app = express();
var mustacheExpress = require('mustache-express');

function createLocalServer(data, links, topDirectoryName, createFileDirectory, viewLinkSpecialCharacters, getSubDirectoryName, localUrl, publicUrl, imageResults, specialCharacters){
	createFileDirectory(topDirectoryName + "/" + "html");
	var host = "localhost";
	var port = 8082;

	app.engine('html', mustacheExpress());
	app.set('view engine', 'html');
	app.set('views', __dirname + "/" + topDirectoryName + "/" + "html");
	app.use(express.static(__dirname + "/" + topDirectoryName));
	app.use(express.static(__dirname));
	
	var head = 
		'<head>' +
			'<meta charset="utf-8">' +
			'<title>Overview</title>' +
			'<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">' +
			'<style>' +
				'.page-header a:hover { text-decoration: none; }' +
				'.page-header a > h1 { display: inline-block; }' +
				'.equal { display: -webkit-flex; display: flex; flex-wrap: wrap; }' +
				'.equal > div[class*="col-"] { display: flex; }' +
				'.equal div[class*="col-"] > .thumbnail { flex: 1; position: relative; }' +
				'.equal div[class*="col-"] .thumbnail .caption { display: flex; flex-direction: column; }' +
				'.equal div[class*="col-"] .thumbnail .caption p:first-of-type { margin: 0 0 26px; }' +
				'.equal div[class*="col-"] .thumbnail .caption p > a { position: absolute; bottom: 5px; }' +
			'</style>' +
			'<script   src="https://code.jquery.com/jquery-2.2.1.min.js"   integrity="sha256-gvQgAFzTH6trSrAWoH1iPo9Xc96QxSZ3feW6kem+O00="   crossorigin="anonymous"></script>' +
			'<script src="https://cdnjs.cloudflare.com/ajax/libs/flot/0.8.3/jquery.flot.min.js"></script>' +
			' <script language="javascript" type="text/javascript" src="./other_resources/jquery.flot.axislabels.js"></script>' +
		'</head>';
	
	var html = '<!DOCTYPE html>' +
	'<html lang="en">' +
		head +
		'<body style="width: 90%; margin: 0 auto;">' +
			'<div class="page-header">' +
				'<a href="/"><h1>Test results <small>Visualization and overview</small></h1></a>' +
			'</div>' +
			'<div class="row">' +
				'<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">' +
					'<div class="panel panel-default">' +
						'<div class="panel-heading">' +
							'<h3 class="panel-title">Dimension differences (px)</h3>' +
						'</div>' +
						'<div class="panel-body">' +
							'<div id="height-width" style="width:100%;height:300px"></div>' +
							'<div id="controls">' +
								'<label style="display: block;"><input type="checkbox" id="c-height" checked><span style="background-color: #F1C40F; width: 10px; height: 10px; display: inline-block; margin-left: 5px;"></span> Height dimension difference</label>' +
								'<label style="display: block;"><input type="checkbox" id="c-width" checked><span style="background-color: #2ECC71; width: 10px; height: 10px; display: inline-block; margin-left: 5px;"></span> Width dimension difference</label>' +
							'</div>' +
							'<div id="tooltip" style="position: absolute; border: 1px solid rgb(255, 221, 221); padding: 2px; opacity: 0.8; top: 323px; left: 870px; display: none; background-color: rgb(255, 238, 238); z-index: 9999;"></div>' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>' +
			'<div class="row">' +
				'<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">' +
					'<div class="panel panel-default">' +
						'<div class="panel-heading">' +
							'<h3 class="panel-title">Time analysis (ms)</h3>' +
						'</div>' +
						'<div class="panel-body">' +
							'<div id="time-analysis" style="width:100%;height:300px"></div>' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>' +
			'<div class="row">' +
				'<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">' +
					'<div class="panel panel-default">' +
						'<div class="panel-heading">' +
							'<h3 class="panel-title">Difference percentage (%)</h3>' +
						'</div>' +
						'<div class="panel-body">' +
							'<div id="diff-percentage" style="width:100%;height:300px"></div>' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>' +
			'<div class="row equal">' +
				'{{#webpage}}' +
					'<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3" name={{name}}>' +
						'<div class="thumbnail">' +
							'<img src="{{imgSrc}}" alt="" style="max-height: 200px;">' +
							'<div class="caption">' +
								'<h3>{{name}} - {{id}}</h3>' +
								'<p><a href="{{viewLink}}" class="btn btn-primary" role="button">View test details</a></p>' +
							'</div>' +
						'</div>' +
					'</div>' +
				'{{/webpage}}' +
			'</div>' +
		'</body>' +
		'<script>' +
			'var dimensions = ' +
				'[' +
					'{' +
						'data: [{{#dimensionDifferenceWidth}}[{{data.0.x}},{{data.0.y}}],{{/dimensionDifferenceWidth}}], ' +
						'points: { show: true, fillColor: "#2ECC71" },' +
						'lines: { show: true, fillColor: "#2ECC71" },' +
						'label: "Width dimension difference",' +
						'color: "#2ECC71"' +
					'},' +
					'{' +
						'data: [{{#dimensionDifferenceHeight}}[{{data.0.x}},{{data.0.y}}],{{/dimensionDifferenceHeight}}], ' +
						'points: { show: true, fillColor: "#F1C40F" }, ' +
						'lines: { show: true, fillColor: "#F1C40F" }, ' +
						'yaxis: 2, ' +
						'label: "Height dimension difference", ' +
						'color: "#F1C40F"' +
					'}' +
				'];' +
			'$("#height-width").bind("plothover", function (event, pos, item) {' +
				'if (item) {' +
					'var y = item.datapoint[1].toFixed(2);' +

					'$("#tooltip").html(item.series.label + " = " + y + " px").css({top: item.pageY-100, left: item.pageX-40}).fadeIn(200);' +
				'} else {' +
					'$("#tooltip").hide();' +
				'}' +
			'});' +
			'$("#time-analysis").bind("plothover", function (event, pos, item) {' +
				'if (item) {' +
					'var y = item.datapoint[1].toFixed(2);' +

					'$("#tooltip").html(item.series.label + " = " + y + " ms").css({top: item.pageY-100, left: item.pageX-40}).fadeIn(200);' +
				'} else {' +
					'$("#tooltip").hide();' +
				'}' +
			'});' +
			'$("#diff-percentage").bind("plothover", function (event, pos, item) {' +
				'if (item) {' +
					'var y = item.datapoint[1].toFixed(2);' +

					'$("#tooltip").html(item.series.label + " = " + y + " %").css({top: item.pageY-100, left: item.pageX-40}).fadeIn(200);' +
				'} else {' +
					'$("#tooltip").hide();' +
				'}' +
			'});' +
			'function data(){' +
				'if($("input[id=c-height]").is(":checked")) {' +
					'$.plot($("#height-width"), ' +
						'[' +
							'{' +
								'data: [{{#dimensionDifferenceWidth}}[{{data.0.x}},{{data.0.y}}],{{/dimensionDifferenceWidth}}], ' +
								'points: { show: true, fillColor: "#2ECC71" }, ' +
								'lines: { show: true, fillColor: "#2ECC71" }, ' +
								'label: "Width dimension difference", ' +
								'color: "#2ECC71"' +
							'}' +
						'],' +
						'{' +
							'xaxes: [{ axisLabel: "Difference image/link number", tickSize: 1}], ' +
							'grid: { hoverable: true}, ' +
							'yaxes: [{ position: "left", axisLabel: "Pixels"}]' +
						'});' +
				'}' +
				'if($("input[id=c-width]").is(":checked")) {' +
					'$.plot($("#height-width"),' +
					'[' +
						'{' +
							'data: [{{#dimensionDifferenceHeight}}[{{data.0.x}},{{data.0.y}}],{{/dimensionDifferenceHeight}}],' +
							'points: { show: true, fillColor: "#F1C40F" },' +
							'lines: { show: true, fillColor: "#F1C40F" },' +
							'label: "Height dimension difference",' +
							'color: "#F1C40F"' +
						'}' +
					'],' +
					'{' +
						'xaxis: { tickSize: 1},' +
						'grid: { hoverable: true},' +
						'yaxes: [{ position: "left", axisLabel: "Pixels"}]' +
					'});' +
				'}' +
				'if($("input[id=c-height]").is(":checked") && $("input[id=c-width]").is(":checked")) {' +
					'$.plot($("#height-width"),' +
					'dimensions,' +
					'{' +
						'grid: { hoverable: true},' +
						'axisLabels: { show: true },' +
						'xaxes: [{ axisLabel: "Difference image/link number", tickSize: 1}],' +
						'yaxes: [{ position: "left", axisLabel: "Pixels"}, { position: "right", axisLabel: "Pixels"}]' +
					'});' +
				'}' +
				'if($("input[id=c-height]").prop("checked") == false && $("input[id=c-width]").prop("checked") == false) {' +
					'$.plot($("#height-width"), [[]]);' +
				'}' +
			'}' +
			'function timeAndPerc() {' +
				'$.plot($("#time-analysis"),' +
				'[' +
					'{' +
						'data: [{{#analysisTimeData}}[{{data.0.x}},{{data.0.y}}],{{/analysisTimeData}}],' +
						'points: { show: true, fillColor: "#9B59B6" },' +
						'lines: { show: true, fillColor: "#9B59B6" },' +
						'label: "Difference analysis time", color: "#9B59B6"' +
					'}' +
				'],' +
				'{' +
					'xaxes: [{ axisLabel: "Difference image/link number", tickSize: 1}],' +
					'grid: { hoverable: true},' +
					'yaxes: [{ position: "left", axisLabel: "Milliseconds"}]' +
				'});' +
				'$.plot($("#diff-percentage"),' +
				'[' +
					'{' +
						'data: [{{#misMatchPercentageData}}[{{data.0.x}},{{data.0.y}}],{{/misMatchPercentageData}}],' +
						'points: { show: true, fillColor: "#F39C12" },' +
						'lines: { show: true, fillColor: "#F39C12" },' +
						'label: "Difference percentage", color: "#F39C12"' +
					'}' +
				'],' + 
				'{' +
					'xaxes: [{ axisLabel: "Difference image/link number", tickSize: 1}],' +
					'grid: { hoverable: true},' +
					'yaxes: [{ position: "left", axisLabel: "Percents"}]' +
				'});' +
			'}' +
			'$(function(){' +
				'data();' +
				'timeAndPerc();' +
				'$("input[id]").click(function() {' +
					'data();' +	
				'});' +
			'});' +
			'$(window).resize(function(){' +
				'data();' +
				'timeAndPerc();' +
			'});' +
		'</script>' +
	'</html>';
	
	var htmlEach = '<!DOCTYPE html>' +
	'<html lang="en"' +
		head +
		'<body style="width: 90%; margin: 0 auto;">' +
			'<div class="page-header">' +
				'<a href="/"><h1>Test results <small>Visualization and overview</small></h1></a>' +
			'</div>' +
			'<div class="row equal">' +
				'<div class="col-xs-12 col-sm-4 col-md-4 col-lg-4">' +
					'<div class="thumbnail">' +
						'<div class="caption">' +
							'<h3>Local (unpublished)</h3>' +
						'</div>' +
						'<img src="{{localImgSrc}}" alt="">' +
					'</div>' +
				'</div>' +
				'<div class="col-xs-12 col-sm-4 col-md-4 col-lg-4">' +
					'<div class="thumbnail">' +
						'<div class="caption">' +
							'<h3>Public (published)</h3>' +
						'</div>' +
						'<img src="{{publicImgSrc}}" alt="">' +
					'</div>' +
				'</div>' +
				'<div class="col-xs-12 col-sm-4 col-md-4 col-lg-4">' +
					'<div class="thumbnail">' +
						'<div class="caption">' +
							'<h3>Difference</h3>' +
						'</div>' +
						'<img src="{{diffImgSrc}}" alt="">' +
					'</div>' +
				'</div>' +
			'</div>' +
		'</body>' +
	'</html>';
	
	var stream = fs.createWriteStream(topDirectoryName + '/html/' + 'index.html');
	stream.once('open', function(){
		stream.write(html);
		stream.end();
	});
	
	links.forEach(function(i){
		var streamEach = fs.createWriteStream(topDirectoryName + '/html/' + i.replace(viewLinkSpecialCharacters, '_') + '.html');
		streamEach.once('open', function(){
			streamEach.write(htmlEach);
			streamEach.end();
		});
	});
	
	app.get("/", function(req, res) {
		res.status(200);
		
		var pages = {
			"webpage": [],
			"misMatchPercentageData": [],
			"analysisTimeData": [],
			"dimensionDifferenceWidth": [],
			"dimensionDifferenceHeight": []
		};
		
		links.forEach(function(i){
			pages.webpage.push({
				"imgSrc": getSubDirectoryName(localUrl) + "/images/" + localUrl.replace(specialCharacters, '_') + i.replace(specialCharacters, '_') + ".png",
				"viewLink": i.replace(viewLinkSpecialCharacters, '_'),
				"id": links.indexOf(i) + 1,
				"name": function(){
					return i.replace(viewLinkSpecialCharacters, ' ') == " " ? "Index" : i.replace(viewLinkSpecialCharacters, ' ').substr(0, 2).toUpperCase() + i.replace(viewLinkSpecialCharacters, ' ').substr(2).toLowerCase();
				}
			});
			pages.misMatchPercentageData.push({
				"data": [
					{
						"x": links.indexOf(i) + 1,
						"y": data[links.indexOf(i)]["misMatchPercentage"]
					}
				]
			});
			pages.analysisTimeData.push({
				"data": [
					{
						"x": links.indexOf(i) + 1,
						"y": data[links.indexOf(i)]["analysisTime"]
					}
				]
			});
			pages.dimensionDifferenceWidth.push({
				"data": [
					{
						"x": links.indexOf(i) + 1,
						"y": data[links.indexOf(i)]["dimensionDifference"]["width"]
					}
				]
			});
			pages.dimensionDifferenceHeight.push({
				"data": [
					{
						"x": links.indexOf(i) + 1,
						"y": data[links.indexOf(i)]["dimensionDifference"]["height"]
					}
				]
			});
		});
		res.render('index', pages);
	});
	
	links.forEach(function(i){
		app.get("/" + i.replace(viewLinkSpecialCharacters, '_'), function(req, res) {
			res.status(200);
			
			var page = {
				"localImgSrc": getSubDirectoryName(localUrl) + "/images/" + localUrl.replace(specialCharacters, '_') + i.replace(specialCharacters, '_') + ".png",
				"publicImgSrc": getSubDirectoryName(publicUrl) + "/images/" + publicUrl.replace(specialCharacters, '_') + i.replace(specialCharacters, '_') + ".png",
				"diffImgSrc" : imageResults + "/" + i.replace(specialCharacters, '_') + ".png"
			};
			
			res.render(i.replace(viewLinkSpecialCharacters, '_'), page);
		});
	});
		
	app.listen(port, function(){
		console.log("");
		console.log("Listening to localhost");
	});
}

module.exports.createLocalServer = createLocalServer;