var later = require('later');
var md5 = require('blueimp-md5');
var storage = require('node-persist');
var autolinker = require('autolinker');
var request = require('request');
var utils = require('./src/utils');

var Twit = require('twit/lib/twitter');

var Bot = module.exports = function (config) {
    this.twit = new Twit(config);
};

// Array with the tweets to process
var tweetsBuffer = [];

//you must first call storage.init or storage.initSync
storage.initSync();

var self;

// retweet
Bot.prototype.retweet = function (params, callback) {
    self = this;

    self.twit.get('search/tweets', params, function (err, reply) {

        // Get the hour when the operation is happening
        var currentHour = utils.getDateTime();
        console.log('=> Actual date time: ' + currentHour);
        console.log('======================================');

        console.log('Search tweet with query: \"' + params.q + '\".');
        console.log('======================================');

        // When there is an error with the request
        if (err) {
            return callback(err);
        };

        // When there is no tweet returned in the search
        if (typeof reply === 'undefined' || reply.statuses.length === 0) {
            console.log('=> There **is no** tweet returned in the search.');
            var consoleLog = '\n=================================================' +
                '====================== END ======================' +
                '=================================================\n';
            return consoleLog;
        }

        // Number of tweets in the buffer to be posted
        console.log('Before adding new tweets Buffer has length: ' +
            tweetsBuffer.length);

        // Dump returned tweets
        var tweets = reply.statuses;
        console.log('=> Returned tweets from search: ' +
            JSON.stringify(tweets.length));
        console.log('======================================');

        // Add fetched tweets to the buffer
        tweets.forEach(function (element) {
            tweetsBuffer.push(element);
        }, this);

        // Number of tweets in the buffer to be posted
        console.log('After adding new tweets Buffer has length: ' +
            tweetsBuffer.length);

        if (tweetsBuffer.length >= 1) {

            processTweet();

        }
    });
};

var processTweetID = 0;
function printID(myTweetObject) {
    return "[id:" + myTweetObject.id + "]";
}

function processTweet() {

    console.log('\n================= START PROCESS TWEET =================');

    // Extract the first originalTweet from the array
    var originalTweet = tweetsBuffer.shift();

    //console.log('Tweet object -> ' + JSON.stringify(originalTweet));

    var myTweetObject = {
        id: processTweetID++,
        text: originalTweet.text,
        user: originalTweet.user.screen_name,
        hashtags: originalTweet.entities.user_mentions,
        textToPost: ''
    };

    //console.log(printID(myTweetObject) + "Original tweet: " + JSON.stringify(originalTweet));
    console.log(printID(myTweetObject) + 'Text -> ' + myTweetObject.text);
    console.log(printID(myTweetObject) + 'User -> ' + myTweetObject.user);

    // Generate md5 from the originalTweet text
    var tweetTextMd5 = md5.md5(myTweetObject.text);

    if (storage.getItem(tweetTextMd5) === undefined) {

        // Save originalTweet in the persistent storage {originalTweet.text md5 -> originalTweet.text}
        //storage.setItem(tweetTextMd5, myTweetObject.text);

        // To post originalTweet
        console.log(printID(myTweetObject) + '[ GOOD ] Tweet not processed before');

        // Only accepts a originalTweet in english or portuguese or undefined
        if ((originalTweet.metadata.iso_language_code === "en" ||
            originalTweet.metadata.iso_language_code === "pt" ||
            originalTweet.metadata.iso_language_code === "und") &&
            myTweetObject.user !== 'OutSystems_Jobs') {

            console.log(
                printID(myTweetObject) + '[ GOOD ] Language and User allowed');
            console.log('======================================');

            // get url
            var url;
            try {
                url = autolinker.link(myTweetObject.text)
                    .split('<a href=\"')[1].split('\"')[0];

                // Compose the Tweet and post it
                postTweet(myTweetObject, url);
            }
            catch (e) {
                console.log(printID(myTweetObject) + "Couldn't parse URL: " + e);
                url = '';
            }

        } else {
            console.log(printID(myTweetObject) + "[ BAD ] Language(" + originalTweet.metadata.iso_language_code
                    + ") and/or User(" + myTweetObject.user + ") rejected");
            console.log('======================================');
        }

    } else {
        // Tweet already posted, to ignore
        console.log(printID(myTweetObject) + '[ BAD ] Tweet processed before');
    }

    console.log('================= END PROCESS TWEET =================\n');

    // Until there are tweets to post
    if (tweetsBuffer.length > 0) {
        processTweet();
    }
}

function postTweet(myTweetObject, url) {

    if (url != '') {
        console.log('=> URL detected: ' + url);
        console.log('======================================');
        request(url, function (error, response, body) {

            if (error) {
                console.log('Couldn’ t get page because of error: ' + error);
                return;
            }

            myTweetObject.textToPost = "RT @" + myTweetObject.user + ' \"' + myTweetObject.text + '\"';
            myTweetObject.textToPost += " @OutSystems";

            TweetPost(myTweetObject);

        });
    }
    // No url in the tweet text
    else {
        console.log('URL not detected');
        console.log('======================================');
    }

};

/**
 * Just to post
 */
function TweetPost(myTweetObject) {
    console.log(printID(myTweetObject) + 'Tweet to Post: ' + myTweetObject.textToPost);
    // Post
    //self.twit.post('statuses/update', {
    //    status: textToPost
    //}, tweetcallback);
}

function tweetcallback() {
    console.log('POSTED!!!');
}
