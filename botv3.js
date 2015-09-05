var later = require('later');
var md5 = require('blueimp-md5');
var storage = require('node-persist');
var autolinker = require('autolinker');
var request = require('request');
var cheerio = require('cheerio');

var Twit = require('twit/lib/twitter');

var Bot = module.exports = function(config) {
  this.twit = new Twit(config);
};

var sched = later.parse.recur().every(20).second();

// Array with the tweets to process
var tweetsBuffer = [];

//you must first call storage.init or storage.initSync
storage.initSync();

var self;

//
// retweet
//
Bot.prototype.retweet = function(params, callback) {
  self = this;

  self.twit.get('search/tweets', params, function(err, reply) {

    // Get the hour when the operation is happening
    var currentHour = getDateTime();
    console.log('=> Actual date time: ' + currentHour);
    console.log('======================================');

    console.log('Search tweet with query: \"" + params.q + "\".');
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

    // Add tweets fetched into the buffer to be posted
    tweets.forEach(function(element) {
      tweetsBuffer.push(element);
    }, this);

    // Number of tweets in the buffer to be posted
    console.log('After adding new tweets Buffer has length: ' +
     tweetsBuffer.length);

    // Execute 'processTweet' function after 'sched' time
    if (tweetsBuffer.length >= 1) {

      processTweet();

    }
  });
};

function processTweet() {

  console.log('\n================= PROCESS TWEET =================');

  // Extract the first tweet from the array
  var tweet = tweetsBuffer.shift();

  console.log('Original tweet -> ' + tweet.text);

  // Get the tweet text
  var tweetText = tweet.text;

  // Generate md5 from the tweet text
  var tweetTextMd5 = md5.md5(tweetText);

  //console.log("Processing tweet: " + tweetText);
  console.log('Hash of the original Tweet -> ' + tweetTextMd5);

  if (storage.getItem(tweetTextMd5) === undefined) {
    // To post tweet
    console.log('[ GOOD ] This tweet ** WAS NOT ** processed before');

    ////
    // Only accepts a tweet in english or portuguese
    if (tweet.metadata.iso_language_code === "en" ||
      tweet.metadata.iso_language_code === "pt" ||
      tweet.metadata.iso_language_code === "und") {

      console.log(
        '[ GOOD ] Tweet to be processed since language is \"en\" or \"pt\"');
      console.log('======================================');

      //console.log("Tweet Text: " + tweetText);

      // get url
      var url = autolinker.link(tweetText)
        .split('<a href=\"')[1]
        .split('\"')[0];

      // Compose the Tweet and post it
      postTweet(tweetText, url);

    } else {
      console.log("[ BAD ] Rejected Tweet since language isn't \"en\" or \"pt\"");
    }

    // Save tweet in the persistent storage in pair {tweet.text md5 -> tweet.text}
    storage.setItem(tweetTextMd5, tweetText);

  } else {
    // Tweet already posted, to ignore
    console.log('[ BAD ] This tweet ** WAS ** processed before');
  }

  console.log('================= END PROCESS TWEET =================\n');

  // Until there are tweets to post
  if (tweetsBuffer.length > 0) {
    processTweet();
    //later.setTimeout(processTweet, sched);
  }
};

function postTweet(tweetText, url) {

  var textToPost = tweetText;

  if (url != '') {
    console.log('=> URL detected: ' + url);
    console.log('======================================');
    request(url, function(error, response, body) {

      if (error) {
        console.log('Couldn’ t get page because of error: ' + error);
        return;
      }

      var $ = cheerio.load(body);

      // to be used when processing tweets to compose the tweet to post
      var company = '';
      var job = '';
      var location = '';

      // Is ITJobs
      if ($('meta[name=application-name]').attr('content') === 'ITJobs') {
        console.log('Tweet from IT Jobs');

        company = $('div[class="company"] a').attr('title');
        job = $('div[class="section"] h1').text();
        job = job.split('(')[0].split(')')[0];

        //console.log("Job: " + job + "; Company: " + company);
        textToPost = 'Job: ' + job + '; Company: ' + company + ' ' + url;

        // THIS FOLLOWING CODE WAS NOT BEING PROCESSED RIGHT WHEN IN THE END OF THE IF

        // Add hashtag to the tweet to post
        textToPost += ' #outsystems';
        // Post tweet
        //console.log("Tweet to post: " + textToPost);
        TweetPost(textToPost);

        // Save the hash of the tweet done to avoid repetition
        var tweetTextMd5 = md5.md5(textToPost);
        storage.setItem(tweetTextMd5, textToPost);

      }
      // Is Expresso Emprego?
      else if ($('meta[name=Author]').attr('content') === 'Expresso Emprego') {
        console.log('Tweet from Expresso Jobs');

        company = $('h2[class="xslTitulo"]').text().split('Empresa:')[1].trim();

        job = $('h1[class="back h xslTitulo"]');
        job = job.text().split('\t')[0].split('(')[0];

        location = $('h1[class="back h xslTitulo"]').children().text();

        //console.log("Job: " + job + "; Company: " + company + "; Location: " + location);
        textToPost = 'Job: ' + job + '; Company: ' + company + '; Location: ' +
         location + ' ' + url;

        // THIS FOLLOWING CODE WAS NOT BEING PROCESSED RIGHT WHEN IN THE END OF THE IF

        // Add hashtag to the tweet to post
        textToPost += ' #outsystems';
        // Post tweet
        //console.log("Tweet to post: " + textToPost);
        TweetPost(textToPost);

        // Save the hash of the tweet done to avoid repetition
        var tweetTextMd5 = md5.md5(textToPost);
        storage.setItem(tweetTextMd5, textToPost);

      }
      // Is Sapo Emprego?
      else if ($('meta[name=author]').attr('content') === 'Sapoemprego') {
        console.log('Tweet from Sapo Emprego');

        company = $('div[class=resumo] div[class=offerbox] dl dd a')
                                                  .closest().text();

        job = $('div[id=boxAnuncio] h2[style="float: left;"]').text();

        //location = $('div[class=resumo] div[class=offerbox] dl dd a')[2].text() + " - "
        //    + $('div[class=resumo] div[class=offerbox] dl dd a')[1].text();

      }
      // Any other source
      else {
        // no additional process happening
      }

      // When the tweet was processed, compose the tweet to post
      if (company != '') {
        // TODO:
        // 1) What to do when bigger than 140 charecters
        textToPost = tweetText;
        /*
        "DUMMY"+//job.trim() +
        ((company != "") ? " (" + company + ")" : "") +
        " -" +
        ((location.trim() != "") ? location.trim() : "") +
        " " + url;
        */

        // THIS FOLLOWING CODE WAS NOT BEING PROCESSED RIGHT WHEN IN THE END OF THE IF

        // Add hashtag to the tweet to post
        textToPost += ' @OutSystems #ITJobs';
        // Post tweet
        //console.log("Tweet to post: " + textToPost);
        TweetPost(textToPost);

        // Save the hash of the tweet done to avoid repetition
        var tweetTextMd5 = md5.md5(textToPost);
        storage.setItem(tweetTextMd5, textToPost);

      }
    });
  }
  // No url in the tweet text
  else {
    console.log('URL not detected');
    console.log('======================================');
  }

  // Post
  //self.twit.post('statuses/update', {
  //    status: textToPost
  //}, tweetcallback);

};

/**
 * Just to post
 */
function TweetPost(textToPost) {
  console.log('Tweet to Post: ' + textToPost);
  // Post
  self.twit.post('statuses/update', {
    status: textToPost
  }, tweetcallback);
}

function tweetcallback() {
  console.log('POSTADO!!!');
}

//
// Get todays date
//
function getDateTime() {

  var date = new Date();
  var monthNames = ["Initial", "Jan", "Feb", "Mar", "April", "May", "June",
    "July", "Aug", "Sept", "Oct", "Nov", "Dec"
  ];

  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;

  var min = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;

  var sec = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;

  var year = date.getFullYear();

  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;

  var day = date.getDate();
  day = (day < 10 ? "0" : "") + day;

  //return year + "/" + monthNames[parseInt(month)] + "/" + day + " at " + hour + ":" + min + ":" + sec;
  return hour + ":" + min + ":" + sec + " on " + year + "/" + monthNames[parseInt(month)] + "/" + day;

}
