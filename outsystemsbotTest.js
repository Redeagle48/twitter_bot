var Bot = require('./botv3');
var config1 = require('./config1');
var utils = require('./src/utils');

var bot = new Bot(config1);

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

executeTweet('outsystems developer');