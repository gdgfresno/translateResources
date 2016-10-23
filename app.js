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

app.get('/translate', function(req, res) {
  var fs = require('fs');
  var contentText = fs.readFileSync('resources.json', 'utf8');

  var sourceLang = 'en';
  var targetLang = req.query.lang;  // 'es', 'hmn'
  var urlPrefix = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" 
      + sourceLang + "&tl=" + targetLang + "&dt=t&q=";

  var translated = {};
  var contentJson = JSON.parse(contentText);

  async.eachSeries(Object.keys(contentJson),
      function (key, done) {  // iterator
        var options = {};
        request.get(urlPrefix + encodeURI(contentJson[key]), options, function(error, response, body) { 
          if (error) {
            res.send(error);
            return;
          };
          var responseJson = JSON.parse(response.body.replace(/\,{2,}/gi, ','));
          var translation = '';
          responseJson[0].forEach(sentence_tuple => {
            translation += sentence_tuple[0];
          });
          translated[key] = translation;
          done(null);
        });
      },
      function (err) {
        // global callback for async.eachSeries
        if (err) {
          res.send(err);
        } else {
          var targetFileName = 'resources.' + targetLang + '.json';
          fs.writeFile(targetFileName, JSON.stringify(translated, null, 2), function (err) {
            if (err) {
              res.send(err);
            } else {
              res.send(targetLang + ' translation: ' + targetFileName);
            }
          });
        }
      });
});

// Start server on the specified port and binding host
app.listen(4001, '0.0.0.0', function() {
  // Print a message when the server starts listening
  console.log('server starting on 4001');
});
