var Speech = require('ssml-builder'); 
var responses = require('../responses');

var _ = require('lodash');

function basicSSML(say) {
  var speech = new Speech(); 
  speech.say(say);
  return speech.ssml(true);
}

module.exports = {
  getSSML: function(speech) {
    return basicSSML(speech);
  },
  getHelpSpeech: function() {
    return basicSSML(responses.help);
  },
  getStopSpeech: function() {
    return basicSSML(responses.stop);
  },
  getErrorPrompt: function() {
    return basicSSML(responses.error);
  },
  getGenericReprompt: function() { 
    return basicSSML(responses.genericReprompt);
  }, 
  getElicitSource: function() {
    return basicSSML(responses.newsSourceSlotElicit);
  }, 
  getUnknownSourcePrompt: function() {
    return basicSSML(responses.sourceDoesntExist);
  }, 
  getHeadlinesSpeech: function(articles) {
    var speech = new Speech();
    var headlinesResponse = _.forEach(articles, function(el) {
      speech.say(el.title);
      speech.pause('2s');
    });

    speech.say(responses.getHeadlinesEnd);
    return speech.ssml(true);
  }, 
  getArticleSpeech: function(title, author, content) {
    var speech = new Speech(); 
    speech.say('Title: ' + title);
    speech.pause('1s'); 
    speech.say('By: ' + author); 
    speech.pause('1s'); 
    
    var paragraphs = _.split(content, '\n'); 
    _.forEach(paragraphs, function(el) {
      if (el) {
        speech.paragraph(el); 
      }
    });

    return speech.ssml(true);
  },
  getProblemReadingArticleSpeech: function() {
    return basicSSML(responses.problemReadingArticle);
  }
}