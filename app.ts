// To start run this commands in terminal. You need to have node js in your computer
// npm i
// (if there is no app.js file in the project) tsc ./app.ts
// (if tsc throwing an error you need to install typescript)
// node app.js -or- npm start

const natural = require('natural')

const tokenizer = new natural.WordTokenizer();
const NGrams = natural.NGrams;
const classifier = new natural.BayesClassifier();

type Message = {
    id: number
    type: 'message' | 'plain'
    date: Date,
    from?: string,
    'from_id': string,
    text?: string
}

const data: Message[] = require('./data.json')

const start = () => {
    console.log('Started at', new Date().getHours() + ':' + new Date().getMinutes())
    console.time('t')

    const messages = data.map(message => ({
        ...message,
        user: message?.from || 'Unknown user',
        text: String(message?.text || '').replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, ''),
    }))

    const users = messages.map(m => m.user)
    const usersObj: Record<string, string[]> = users.reduce((obj, user) => ({ ...obj, [user]: [] }), {})

    users.map(user => messages
        .filter(m => m.user === user)
        .forEach(message => {
            usersObj[message.user].push(message.text)
        }),
    )

    for (const [user, messages] of Object.entries(usersObj)) {
        console.log({
            [user]: messages,
        })
        messages.forEach((message) => {
            const tokens = tokenizer.tokenize(message);
            const bigrams = NGrams.bigrams(tokens);
            const flattenBigrams = bigrams.reduce((acc, val) => acc.concat(val), [])
            classifier.addDocument(flattenBigrams, user);
        });
    }

    console.log('Users length', Object.keys(usersObj).length)
    console.log('Train started')
    classifier.train();
    classifier.save(`result-${new Date().getHours()}:${new Date().getMinutes()}.json`, (err) => {
        if (err) {
            console.log(err)
        }
        console.log('Saved train as a file result.json!')
    })

    const newMessage = 'хотя, правильнее было бы вместо канвы использовать svg, тогда не было бы потерь при зуме';

    const newTokens = tokenizer.tokenize(newMessage);
    const newBigrams = NGrams.bigrams(newTokens);
    const flattenBigrams = newBigrams.reduce((acc, val) => acc.concat(val), [])

    const predictedUser = classifier.classify(flattenBigrams);
    console.timeEnd('t')

    return predictedUser
}

console.log('Пользователь:', start());
