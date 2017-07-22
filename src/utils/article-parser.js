var htmlparser = require("htmlparser2");
var Speech = require('ssml-builder');

function internalParse(html, openParaReplace, closeParaReplace, callback) {
  var result = '';

  var parser = new htmlparser.Parser({
    ontext: function(text) {
      var textToAdd = text;
      if (text && text.trim().length !== 0) {
        result += textToAdd;
      }
    }, 
    onopentag: function(name) {
      if (name === "p"){
        result += openParaReplace;
      }
    },
    onclosetag: function(name) {
      if (name === "p"){
        result += closeParaReplace;
      }
    },
    onend: function() { 
      callback(result.trim());
    }
  }, {decodeEntities: true});

  parser.write(html);
  parser.end();
}

function internalSSML(html, callback) {
  var speech = new Speech(); 
  var inParagraph = false;
  var paragraph = '';

  var parser = new htmlparser.Parser({
    ontext: function(text) {
      var textToAdd = text;
      if (text && text.trim().length !== 0) {
        if (inParagraph){
          paragraph += textToAdd;
        } else {
          speech.say(textToAdd);
        }
      }
    }, 
    onopentag: function(name) {
      if (name === "p"){
        inParagraph = true;
      }
    },
    onclosetag: function(name) {
      if (name === "p"){
        speech.paragraph(paragraph);
        inParagraph = false; 
        paragraph = '';
      }
    },
    onend: function() { 
      callback(speech.ssml(true));
    }
  }, {decodeEntities: true});

  parser.write(html);
  parser.end();
}

module.exports = {
  getArticleSSML: function(html, callback) {
    internalSSML(html, callback);
  },
  getArticleText: function(html, callback) {
    internalParse(html, '\n', '\n', callback);
  }
}
