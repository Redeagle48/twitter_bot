var storage = require('node-persist');
var md5 = require('blueimp-md5');

module.exports =
    (function () {

        var dbFileName;

        var _getDB = function() {
            return storage.getItem(dbFileName);
        };

        return {

            'init': function (dbFileNameInput) {
                storage.initSync();
                dbFileName = dbFileNameInput;
                storage.setItem(dbFileName, {});
            },

            'addTweet': function (tweetText) {
                var tweetTextMd5 = md5.md5(tweetText);

                var db = _getDB();
                db[tweetTextMd5] = tweetText;

                storage.setItem(dbFileName, db);
            },

            'wasAlreadyProcessed': function(tweetText) {
                var db = _getDB();
                var tweetTextMd5 = md5.md5(tweetText);

                var toReturn = false;
                if (tweetTextMd5 in db) {
                    toReturn = true;
                }

                return toReturn;
            }
        }
    })();