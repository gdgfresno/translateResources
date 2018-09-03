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

var options = {};
var sourceLang = 'en';
var targetLang = '';
var urlPrefix = ''
var translated = {};

var delay = function(milliseconds) {
  if (!milliseconds)
    milliseconds = Math.floor(Math.random() * 2000);
  setTimeout(function() {}, milliseconds);
}

var translatePart = function(contentPart, keyOuter) {
  async.eachSeries(Object.keys(contentPart),
    function (keyInner, doneInner) {  // iterator
      delay();
      request.get(urlPrefix + encodeURI(contentPart[keyInner]), options, function(error, response, body) { 
          if (error) {
            res.send(error);
            return;
          };
          console.log(response.body);
          let responseJson = JSON.parse(response.body.replace(/\,{2,}/gi, ','));
          let translation = '';
          responseJson[0].forEach(sentence_tuple => {
            translation += sentence_tuple[0];
          });
          translated[keyOuter][keyInner] = translation;
          delay();
          doneInner(null);
        });
    },
    function (err) {
      // global callback for async.eachSeries
      if (err) {
        res.send(err);
      }
    });
}

app.get('/translate', function(req, res) {
  let fs = require('fs');
  let sourceFileName = 'locale-' + sourceLang + '.json';
  let contentText = fs.readFileSync(sourceFileName, 'utf8');

  targetLang = req.query.lang;  // 'es', 'hmn'
  urlPrefix = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" 
    + sourceLang + "&tl=" + targetLang + "&dt=t&q=";

  let contentJson = JSON.parse(contentText);

  for (let key in contentJson) {
    if (contentJson.hasOwnProperty(key)) {
      translated[key] = {};
      translatePart(contentJson[key], key);
    }
    delay();
  }

  let targetFileName = 'locale-' + targetLang + '.json';
  fs.writeFile(targetFileName, JSON.stringify(translated, null, 2), function (err) {
    if (err) {
      res.send(err);
    } else {
      res.send(targetLang + ' translation: ' + targetFileName);
    }
  });
});

// Start server on the specified port and binding host
app.listen(4001, '0.0.0.0', function() {
  // Print a message when the server starts listening
  console.log('server starting on 4001');
});
