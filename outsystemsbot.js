var Bot = require('./src/bot');
var config1 = require('./config1');
var utils = require('./src/utils');

var bot = new Bot(config1);

// queries
var queryDeveloper = 'outsystems developer';
var queryProgrammer = 'outsystems programmer';
var queryConsultant = 'outsystems consultant';
var queryConsultor = 'outsystems consultor';

console.log('Twitter bot running.....');

setInterval(function () {

    console.log('\n=================================================');
    console.log('====================== START ======================');
    console.log('=================================================');

    // Generate random number
    var rand = Math.random();

    switch (true) {
        case rand <= 0.25:
            executeTweet(queryDeveloper);
            break;
        case rand <= 0.50:
            executeTweet(queryProgrammer);
            break;
        case rand <= 0.75:
            executeTweet(queryConsultant);
            break;
        case rand <= 1:
            executeTweet(queryConsultor);
            break;
        default:
            console.log('Random value outside boundaries (rand = " + rand + ").');
            break;
    }

}, utils.minutesToMiliseconds(30));

function executeTweet(query) {
    var params = {
        q: query,
        since: utils.dateString(),
        result_type: 'mixed'
    };

    bot.retweet(params, function (err, reply) {
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
