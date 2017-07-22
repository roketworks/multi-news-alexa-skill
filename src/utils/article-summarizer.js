var summarizer = require('node-summary');

module.exports = {
  summarize: function(title, body, callback) {
    summarizer.summarize(title, body, function(err, summary) {
      if(err) {
        console.log("Something went wrong man!");
      }
      
      console.log("Original Length " + (title.length + body.length));
      console.log("Summary Length " + summary.length);
      console.log("Summary Ratio: " + (100 - (100 * (summary.length / (title.length + body.length)))));

      callback(summary);
    });
  }
}