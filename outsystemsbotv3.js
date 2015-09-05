var Bot = require('./botv3');
var config1 = require('./config1');

var bot = new Bot(config1);

//get date string for today's date (e.g. 2011-01-01)
function datestring() {
  var d = new Date(Date.now() - 5 * 60 * 60 * 1000); //est timezone
  return d.getUTCFullYear() + '-' +
    (d.getUTCMonth() + 1) + '-' +
    (d.getDate() - 2); // Looking for tweets in the last 2 days
};

// queries
var queryDeveloper = 'outsystems developer';
var  queryProgrammer = 'outsystems programmer';
var  queryConsultant = 'outsystems consultant';
var  queryConsultor = 'outsystems consultor';

console.log('Twitter bot running.....');

setInterval(function() {

  console.log('\n=================================================');
  console.log('====================== START ======================');
  console.log('=================================================');

  // Generate random number
  var rand = Math.random();

  //executeTweet(query_consultor);

  switch (true) {
    case rand <= .25:
      //console.log(".25"); break;
      executeTweet(queryDeveloper);
      break;
    case rand <= .50:
      //console.log(".5"); break;
      executeTweet(queryProgrammer);
      break;
    case rand <= .75:
      //console.log(".75"); break;
      executeTweet(queryConsultant);
      break;
    case rand <= 1:
      //console.log("1"); break;
      executeTweet(queryConsultor);
      break;
    default:
      console.log('Random value outside boundaries (rand = " + rand + ").');
      break;
  }

}, 1800000/*120000 /*miliseconds*/);

function executeTweet(query) {
  var params = {
    q: query,
    since: datestring(),
    result_type: 'mixed'
  };

  bot.retweet(params, function(err, reply) {
    if (err) {
      return handleError(err);
    }

  });
}

//
// When there is an error with the request
//
function handleError(err) {
  console.error('response status:', err.statusCode);
  console.error('data:', err.data);
}
