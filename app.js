// To start run this commands in terminal. You need to have node js in your computer
// npm i
// (if there is no app.js file in the project) tsc ./app.ts
// (if tsc throwing an error you need to install typescript)
// node app.js -or- npm start
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var natural = require('natural');
var tokenizer = new natural.WordTokenizer();
var NGrams = natural.NGrams;
var classifier = new natural.BayesClassifier();
var data = require('./data.json');
var start = function () {
    console.log('Started at', new Date().getHours() + ':' + new Date().getMinutes());
    console.time('t');
    var messages = data.map(function (message) { return (__assign(__assign({}, message), { user: (message === null || message === void 0 ? void 0 : message.from) || 'Unknown user', text: String((message === null || message === void 0 ? void 0 : message.text) || '').replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, '') })); });
    var users = messages.map(function (m) { return m.user; });
    var usersObj = users.reduce(function (obj, user) {
        var _a;
        return (__assign(__assign({}, obj), (_a = {}, _a[user] = [], _a)));
    }, {});
    users.map(function (user) { return messages
        .filter(function (m) { return m.user === user; })
        .forEach(function (message) {
        usersObj[message.user].push(message.text);
    }); });
    var _loop_1 = function (user, messages_1) {
        var _c;
        console.log((_c = {},
            _c[user] = messages_1,
            _c));
        messages_1.forEach(function (message) {
            var tokens = tokenizer.tokenize(message);
            var bigrams = NGrams.bigrams(tokens);
            var flattenBigrams = bigrams.reduce(function (acc, val) { return acc.concat(val); }, []);
            classifier.addDocument(flattenBigrams, user);
        });
    };
    for (var _i = 0, _a = Object.entries(usersObj); _i < _a.length; _i++) {
        var _b = _a[_i], user = _b[0], messages_1 = _b[1];
        _loop_1(user, messages_1);
    }
    console.log('Users length', Object.keys(usersObj).length);
    console.log('Train started');
    classifier.train();
    classifier.save("result-".concat(new Date().getHours(), ":").concat(new Date().getMinutes(), ".json"), function (err) {
        if (err) {
            console.log(err);
        }
        console.log('Saved train as a file result.json!');
    });
    var newMessage = 'хотя, правильнее было бы вместо канвы использовать svg, тогда не было бы потерь при зуме';
    var newTokens = tokenizer.tokenize(newMessage);
    var newBigrams = NGrams.bigrams(newTokens);
    var flattenBigrams = newBigrams.reduce(function (acc, val) { return acc.concat(val); }, []);
    var predictedUser = classifier.classify(flattenBigrams);
    console.timeEnd('t');
    return predictedUser;
};
console.log('Пользователь:', start());
