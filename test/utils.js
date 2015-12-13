var utils = require('../src/utils.js');
var test = require('tape');

test('Should return 6000 miliseconds', function (t) {
    t.equal(60000, utils.minutesToMiliseconds(1));
    t.end();
});

test('Should return 0 miliseconds', function (t) {
    t.equal(0, utils.minutesToMiliseconds(0));
    t.end();
});