/* File not used */

var md5 = require('blueimp-md5');
var storage = require('node-persist');

module.exports =
    (function () {

        //you must first call storage.init or storage.initSync
        storage.initSync();

        return {

            'testAccess': function() {
                return "I can read this!";
            },

            'add': function (data) {
                var tweetTextMd5 = md5.md5(data);
                storage.setItem(tweetTextMd5, "test");
            }
        }
    })();