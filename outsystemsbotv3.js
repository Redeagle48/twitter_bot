var Bot = require("./botv3"),
    config1 = require("./config1");

var bot = new Bot(config1);

//get date string for today's date (e.g. 2011-01-01)
function datestring() {
    var d = new Date(Date.now() - 5 * 60 * 60 * 1000); //est timezone
    return d.getUTCFullYear() + "-" +
        (d.getUTCMonth() + 1) + "-" +
        d.getDate() ;
};

// queries
    var query_developer = "outsystems developer",
        query_programmer = "outsystems programmer",
        query_consultant = "outsystems consultant",
        query_consultor = "outsystems consultor";

setInterval(function () {

    executeTweet(query_consultor);
    //executeTweet(query_programmer);
    //executeTweet(query_consultant);
    //executeTweet(query_consultor);

}, 7000/*miliseconds*/);

function executeTweet(query) {
    var params = {
            q: query,
            since: datestring(),
            result_type: "mixed"
        };

        //console.log(params);
        
        bot.retweet(params, function(err, reply) {
            if(err) return handleError(err);

        });
}

//
// When there is an error with the request
//
function handleError(err) {
    console.error("response status:", err.statusCode);
    console.error("data:", err.data);
}