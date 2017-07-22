'use strict';

var Alexa = require('alexa-sdk');
var config = require('./skill.config');
var alexaHelper = require('./utils/alexa-helper');
var articleParser = require('./utils/article-parser');
var summarizer = require('./utils/article-summarizer');
var alexaHelper = require('./utils/alexa-helper');
var news = require('./utils/news-api');
var responseHelper = require('./utils/response-helper');

var _ = require('lodash');

var appId = config.appId; 
var numArticlesToRead = 3;

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  //alexa.appId = appId;
  alexa.registerHandlers(defaultHandlers, handlers);
  alexa.execute();
};

var handlers = {
  'GetNewsIntent': function() {
    console.log('GetNewsIntent');

    var sourceSlotName = 'NewsSource';
    var intentObj;

    if (this.event && this.event.request) {
      intentObj = this.event.request.intent;
    }
    
    if (!intentObj || !intentObj.slots.NewsSource.value) {
      var speechOutput = responseHelper.getElicitSource();
      var repromptSpeech = responseHelper.getGenericReprompt();
      this.emit(':elicitSlot', sourceSlotName, speechOutput, repromptSpeech);
    } else {
      var self = this
      var source = alexaHelper.slotValue(intentObj.slots.NewsSource, true);

      news.getHeadlines(source, function(res, body, err) {
        if (res.status === 'error') {
          if (res.code === 'sourceDoesntExist') {
            // TODO: do a try again
            var speechOutput = responseHelper.getElicitSource();
            var repromptSpeech = responseHelper.getGenericReprompt();
            self.emit(':elicitSlot', sourceSlotName, speechOutput, repromptSpeech);
          } else {
            self.emit(':tell', responseHelper.getErrorPrompt());
          }
        }

        var articles = body.articles;
        self.attributes['articles'] = articles;
        console.log("articles: ");
        console.log(articles);

        var articlesToRead = _.take(articles, numArticlesToRead);
        self.attributes['anchor'] = numArticlesToRead - 1;
        console.log('articles to read: ');
        console.log(articlesToRead);

        self.emit(':ask', responseHelper.getHeadlinesSpeech(articlesToRead), responseHelper.getGenericReprompt());
      }); 
    }
  },
  'GetMoreNewsIntent': function() {
    if (this.attributes['articles'].length === 0) {
      this.emit('GetNewsIntent');
    } else {
      var articles = this.attributes['articles']; 
      var anchor = this.attributes['anchor']; 
      var nextArticles =  _.slice(articles, anchor + 1, (anchor + 1) + numArticlesToRead); 
      
      console.log('next articles: '); 
      console.log(nextArticles); 
      
      if(!nextArticles || nextArticles.length < numArticlesToRead) {
        // TODO: handle better
        this.emit(':tell', 'No more headlines available');
      } 
      this.emit(':ask', responseHelper.getHeadlinesSpeech(nextArticles), responseHelper.getGenericReprompt());
    }
  },
  'GetArticleIntent': function() {
    if (this.attributes['articles'].length === 0) {
      this.emit('GetNewsIntent');
    } else {
      var intentObj = this.event.request.intent;

      var articles = this.attributes['articles'];
      var articleIndex = alexaHelper.slotValue(intentObj.slots.Article);
      console.log('articles: ');
      console.log(articles);
      console.log('index: ' + articleIndex)
 
      var anchor = this.attributes['anchor'];
      console.log('anchor: ' + anchor)

      var lastReadArticles = _.slice(articles, anchor - (numArticlesToRead - 1), anchor + 1);
      console.log('last read: ');
      console.log(lastReadArticles);
      var detailArticle = lastReadArticles[articleIndex - 1]; 

      if (!detailArticle) {
        // Todo: handle better
        this.emit(':tell', 'Oops, something went wrong');
      } 

      var self = this; 
      var readableArticle = news.getReadablePage(detailArticle, function(res, body, err){
        if (body.content.trim().length === 0){
          var problemReadingResponse = responseHelper.getProblemReadingArticleSpeech();
          var title = detailArticle.title;
          var description = detailArticle.description + '\n\n' + article.url;
          self.emit(':tellWithCard', problemReadingResponse, title, description, alexaHelper.buildCardImageObject(article));
        } 

        articleParser.getArticleText(body.content, function(textResponse){
          console.log('txt: ' + textResponse);
          summarizer.summarize(detailArticle.title, textResponse, function(summarizedArticle) {
            var speechResponse = responseHelper.getArticleSpeech(detailArticle.title, detailArticle.author, summarizedArticle); 
            self.emit(':tellWithCard', speechResponse, detailArticle.title, textResponse, alexaHelper.buildCardImageObject(detailArticle));
          });
        });
      });
    }
  }
};

var defaultHandlers = {
  'LaunchRequest': function () {
    this.emit(':ask', 'You can ask for headlines from your desired source');
  },
  'Unhandled': function() {
    this.emit(':ask', 'Sorry, I didn\'t get that', 'Try asking for headlines');
  },
  'AMAZON.HelpIntent': function() {
    this.emit(':ask', responseHelper.getHelpSpeech());
  },
  'AMAZON.StopIntent': function() {
    this.emit(':tell', responseHelper.getStopSpeech());  
  },
  'AMAZON.CancelIntent': function() {
    this.emit(':tell', responseHelper.getStopSpeech());  
  }
};