var persistent = require('../src/persistentData.js');
var md5 = require('blueimp-md5');
var test = require('tape');

var fs = require('fs');


function deleteFile(filePath) {
    fs.unlink(filePath, function (err) {});
}

var dataToStore;
var __dirname;

test('Should access the file', function (t) {
    t.equal("I can read this!", persistent.testAccess());
    t.end();
});

test('Should create a file with string \'text\'', function (t) {

    dataToStore = "test";

    persistent.add(dataToStore);

    __dirname = "persist/";

    fs.exists(__dirname + md5.md5(dataToStore), function (exists) {
        t.equal(true,exists);

        deleteFile(__dirname + md5.md5(dataToStore));

        t.end();
    });

});


test('Should create a file with given string', function (t) {

    dataToStore = "This is a string";
    __dirname = "persist/";

    persistent.add(dataToStore);

    fs.readFile(__dirname + md5.md5(dataToStore), function (err, data) {

        if (err) {
            throw err;
        }

        t.equal(dataToStore,data.toString());

        deleteFile(__dirname + md5.md5(dataToStore));

        t.end();
    });

});
