var later = require('later'),
    md5 = require('blueimp-md5'),
    storage = require('node-persist');

var Twit = require('twit/lib/twitter');

var Bot = module.exports = function (config) {
    this.twit = new Twit(config);
  };

var sched = later.parse.recur().every(2).second();

// Array with the tweets to process
var tweets_buffer = [];

//you must first call storage.init or storage.initSync
storage.initSync();

//
// retweet
//
Bot.prototype.retweet = function (params, callback) {
    var self = this;

    self.twit.get('search/tweets', params, function (err, reply) {

        console.log("Search tweet with query: \"" + params.q + "\".");
        console.log("======================================");

        // Dump returned tweets
        var tweets = reply.statuses;
        
        tweets.forEach(function(element) {
            tweets_buffer.push(element);
        }, this);
        
        console.log("Tweets Buffer has length: " + tweets_buffer.length);
     
        // Execute 'processTweet' function after 'sched' time    
        if(tweets_buffer.length >= 1) {
            processTweet();
        }
        
    });
};

function processTweet(){
    
    // Extract the first tweet from the array
    var tweet = tweets_buffer.shift();
    
    // Get the tweet text
    var tweet_text = tweet.text;
    
    // Generate md5 from the tweet text           
    var tweet_text_md5 = md5.md5(tweet_text);
    
    console.log("Processing tweet: " + tweet_text);
    console.log("Hash Tweet: " + tweet_text_md5);
    
    storage.setItem(tweet_text_md5, tweet_text);
    console.log(storage.getItem(tweet_text_md5));
                
    // Until there are tweets to post
    if(tweets_buffer.length > 0){
        later.setTimeout(processTweet, sched);
    }
};