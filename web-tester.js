var request = require('request');
var cheerio = require('cheerio');
var promise = require('bluebird');
var fs = require('fs');
var webshot = require('webshot');
var path = require('path');
var phantomjs = require('phantomjs2');
var resemble = require('node-resemble-js');
var args = require("minimist")(process.argv.slice(2), { string: "localUrl", string: "publicUrl" });
var localHost = require("./local-host.js");

if(args.help || !args.localUrl || !args.publicUrl) {
	showHelp();
	process.exit(1);
}

var localUrl = args.localUrl;
var publicUrl = args.publicUrl;

var specialCharacters = /([*+?^=!:${}()|\[\]\/\\])/g;
var viewLinkSpecialCharacters = /([*+?^=!:${}()|\[\]\/\\.])/g;
var startCharacters = /^https?:\/\//;
var date = new Date();
var topDirectoryName = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();

var allRelativeLinks = [];
var localRelativeLinks = [];
var publicRelativeLinks = [];
var screenshots = [];
var imageResults = "image-results";
var called = 0;
var resData = [];
var relativeUrls = [];

var time = date.getTime();

createFileDirectory(topDirectoryName);
crawlPage();

function showHelp() {
	console.log("");
	console.log("Visualization of automated WEB testing (c) Elina Lenova");
	console.log("usage:");
	console.log("--help			| show help information");
	console.log("--localUrl --publicUrl	| write local url e.g. --localUrl=http://... --publicUrl:http://...");
	console.log("");
}

function uniqueLinks(array) {
	array.sort();
	var unique = [];
	for(var i = 0; i < array.length; i++) {
		var current = array[i];
		if (unique.indexOf(current) < 0) {
			unique.push(current);
		}
	}
	return unique;
}

function getRelativeLinks($) {
	createFileDirectory(topDirectoryName + "/" + getSubDirectoryName(localUrl));
	
	var relativeLinks = $("a[href^='/']");
	relativeLinks.each(function() {
		allRelativeLinks.push($(this).attr('href'));
		localRelativeLinks.push(localUrl + $(this).attr('href'));
	});
	
	addPublicRelativeLinks();
}

function addPublicRelativeLinks() {
	createFileDirectory(topDirectoryName + "/" + getSubDirectoryName(publicUrl));
	
	//publicRelativeLinks.push(publicUrl);
	allRelativeLinks.forEach(function(i){
		publicRelativeLinks.push(publicUrl + i);
	});
}

function promiseAll(screenshots, called){
	promise.all(screenshots)
	.then(function(){
		if(called == 2) {
			createImageDifference()
			.then(function(){
				console.log("");
				console.log("All screenshots created!");
				localHost.createLocalServer(resData, 
					relativeUrls, 
					topDirectoryName, 
					createFileDirectory, 
					viewLinkSpecialCharacters, 
					getSubDirectoryName, 
					localUrl, 
					publicUrl, 
					imageResults, 
					specialCharacters
				);
			});
		}
	});
}

function createAllFiles() {
	createFileDirectory(topDirectoryName + "/" + imageResults);
	createFiles(localUrl, localRelativeLinks, localUrl);
	createFiles(publicUrl, publicRelativeLinks, publicUrl);
}

function createFiles(pageUrl, array, pageUrl) {
	return writeFile(getFilePath(pageUrl), uniqueLinks(array), pageUrl)
	.then(function(){
		var imageDirectory = getSubDirectoryName(pageUrl) + "/images/";
		readJsonFile(getFilePath(pageUrl), pageUrl, imageDirectory);
	})
	.catch(function(error){
		console.log("File write rejected: " + error.message + " !");
	});
}

function crawlPage() {
	request(localUrl, function(error, response, body) {
		if(response.statusCode === 200) {
			var $ = cheerio.load(body);
			getRelativeLinks($);
			createAllFiles();
		} else {
			console.log("You've got " + localUrl + " response error: " + error.message + " !");
		}
	});
}

function createFileDirectory(pathName) {
	fs.mkdir(pathName, function(error) {
		if(error && error.code == 'EEXIST') {
			var directories = [];
			var dirArray = fs.readdirSync("./");
			dirArray.forEach(function(i){
				var stats = fs.statSync(i);
				if(stats.isDirectory() && path.basename(i).toString().startsWith(topDirectoryName)){
					directories.push(path.basename(i).toString());
				}
			});
			topDirectoryName = topDirectoryName + " (" + (directories.length + 1) + ")";
			fs.mkdirSync(topDirectoryName);
		}
	});
}

function getSubDirectoryName(pageUrl) {
	var subDirectoryName = pageUrl.replace(startCharacters, '').replace(specialCharacters, '_');
	return subDirectoryName;
}

function getFilePath(pageUrl) {
	var fileName =  pageUrl.replace(specialCharacters, '_') + ".json";
	return topDirectoryName + "/" + getSubDirectoryName(pageUrl) + "/" + fileName;
}

function writeFile(fileName, array, pageUrl) {
	return new Promise(function(resolve, reject){
		var stream = fs.createWriteStream(fileName);
		var pages = {};
		var webpage = [];
		var page = [];
		
		stream.once('open', function(){
			array.forEach(function(i){
				webpage.push({
					page: [
						{link: i}
					]
				});
			});
			pages.webpage = webpage;
			pages.webpage.page = page;
			stream.write(JSON.stringify(pages, null, 4));
			stream.end();
		});
		
		stream.on('finish', function(){
			resolve();
		});
	})
	.catch(function(error){
		console.log("Write file rejected: " + error.message + " !");
	});
}

function readJsonFile(filePath, pageUrl, imageDir) {
	var readFs = promise.promisifyAll(fs);
	return readFs.readFileAsync(filePath)
	.then(function(contents){
		console.log('');
		console.log("*** Creating and saving files for " + pageUrl + " ! ***");
		var contentsObject = JSON.parse(contents);
		for(var i = 0; i < contentsObject.webpage.length; i++) {
			var page = contentsObject.webpage[i];
			for(var obj in page) {
				screenshots.push(saveScreenshot(page[obj][0].link, topDirectoryName + "/" + imageDir + page[obj][0].link.replace(specialCharacters, '_') + ".png"));
			}
		}
	})
	.then(function(){
		promise.all(screenshots).then(function(){
			console.log("");
			console.log("Done creating: " + pageUrl + " !");
			var d = new Date();
			var t = d.getTime();
			console.log("Time passed: " + (t - time)/1000 + " s");
		}).then(function(){
			called++;
			promiseAll(screenshots, called);
		});
	})
	.catch(function(error){
		console.log("You've got contents error: " + error.message + " !");
	});
}

function saveScreenshot(contents, fileName) {
	var options = {
		phantomPath: phantomjs.path,
		shotSize: {
			width: 'all',
			height: 'all'
		},
		renderDelay: 100
	};
	
	var shot = promise.promisify(webshot);
	return shot(contents, fileName, options).catch(function(error){
		console.log("You've got screenshot save error on: " + error.message + " !");
	});
}

function createImageDifference() {
	return new Promise(function(resolve, reject) {
		console.log("");
		console.log("Creating difference shots...");
		resemble.outputSettings({
			errorColor: {
				red: 255,
				green: 62,
				blue: 150
			},
			errorType: 'movement',
		});
		//allRelativeLinks.push("");
		var links = uniqueLinks(allRelativeLinks);
		var diffs = [];
		
		links.forEach(function(i){
			resemble(
				topDirectoryName + "/" + getSubDirectoryName(localUrl) + "/images/" + localUrl.replace(specialCharacters, '_') + i.replace(specialCharacters, '_') + ".png"
			)
			.compareTo(
				topDirectoryName + "/" + getSubDirectoryName(publicUrl) + "/images/" + publicUrl.replace(specialCharacters, '_') + i.replace(specialCharacters, '_') + ".png"
			)
			.onComplete(function(data){	
				var diffImage = data.getDiffImage();
					
				diffs.push(diffImage.pack().pipe(fs.createWriteStream(topDirectoryName + "/" + imageResults + "/" + i.replace(specialCharacters, '_') + ".png")));
				
				resData.push(data);
				relativeUrls.push(i);
				
				if(links.length == diffs.length) {
					resolve();
				}
			});
		});
	})
	.catch(function(error) {
		console.log("Write difference rejected: " + error.message + " !");
	});
}
