var request = require('request');
var config = require('../skill.config');

var newsApiUrl = config.newsApiUrl;
var newsApiKey = config.newsApiKey;

var mercuryApiUrl = config.mercuryApiUrl; 
var mercuryApiKey = config.mercuryApiKey;

function buildNewsQueryString(source){
  var qs = { 'source': source, 'apiKey': newsApiKey, 'json': true }; 
  return qs; 
}

function buildReadableRequest(articleUrl){
  var options = {
    url: mercuryApiUrl,
    qs: { url: articleUrl },
    headers: {
      'x-api-key': mercuryApiKey, 
      'Content-Type': 'application/json'
    }
  };
  return options;
}

module.exports = {
  getHeadlines: function(source, callback) {
    request({url: newsApiUrl, qs: buildNewsQueryString(source)}, function(err, response, body){
      if (err) {
        callback(null, null, err); 
      } else {
        callback(response, JSON.parse(body));
      }
    });
  },
  getReadablePage: function(article, callback){
    request(buildReadableRequest(article.url), function(err, response, body){
      if (err) {
        callback(null, null, err); 
      } else {
        callback(response, JSON.parse(body));
      }
    });
  }
}