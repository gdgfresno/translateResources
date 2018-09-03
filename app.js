/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// This application uses request to submit translation requests
var request = require('request');

// This application uses async to wait for all requests
var async = require('async');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

var options = {
  json : true,
  headers: {
    // 'Host': 'valleydevfest.com',
    'Connection': 'keep-alive',
    'Content-Length': '0',
    'Cache-Control': 'max-age=0',
    'Origin': 'https://translate.googleapis.com',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
    'Accept': 'application/json',
    'Referer': 'https://translate.google.com',
    'Accept-Language': 'en-US,en;q=0.8,ru;q=0.6',
  }
};
var sourceLang = 'en';
var targetLang = '';
var urlPrefix = ''
var translated = {};

var delay = function(fn, milliseconds) {
  console.log(milliseconds);
  setTimeout(fn, milliseconds);
}

var translatePart = function(contentPart, keyOuter, timerThreshold) {
  for (let keyInner in contentPart) {
    if (contentPart.hasOwnProperty(keyInner)) {
      delayMs = Math.floor(Math.random() * timerThreshold);
      delay(function() {
        console.log(contentPart[keyInner]);
        request.get(urlPrefix + encodeURI(contentPart[keyInner]), options, function(error, response, body) {
          if (error) {
            console.log(error);
          } else {
            let translation = '';
            let translated_sentences = response.body[0];
            for (let i = 0; i < translated_sentences.length; i++) {
              translation += translated_sentences[i][0];
            }
            translated[keyOuter][keyInner] = translation;
          }
        });
      }, delayMs);
    }
  }
}

app.get('/translate', function(req, res) {
  let fs = require('fs');
  let sourceFileName = 'locale-' + sourceLang + '.json';
  let contentText = fs.readFileSync(sourceFileName, 'utf8');

  targetLang = req.query.lang;  // 'es', 'hmn'
  urlPrefix = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" 
    + sourceLang + "&tl=" + targetLang + "&dt=t&q=";

  let contentJson = JSON.parse(contentText);

  let timerThreshold = 0;
  for (let key in contentJson) {
    if (contentJson.hasOwnProperty(key)) {
      timerThreshold += Object.keys(contentJson[key]).length;
    }
  }
  timerThreshold *= 1000;

  for (let key in contentJson) {
    if (contentJson.hasOwnProperty(key)) {
      translated[key] = {};
      translatePart(contentJson[key], key, timerThreshold);
    }
  }

  delay(function() {
    let targetFileName = 'locale-' + targetLang + '.json';
    fs.writeFile(targetFileName, JSON.stringify(translated, null, 2), function (err) {
      if (err) {
        res.send(err);
      } else {
        res.send(targetLang + ' translation: ' + targetFileName);
      }
    });
  }, timerThreshold);
});

// Start server on the specified port and binding host
app.listen(4001, '0.0.0.0', function() {
  // Print a message when the server starts listening
  console.log('server starting on 4001');
});
