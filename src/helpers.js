const request = require('request');
const tickersMap = require('../assets/tickersMap.json');

exports.getTickers = (title, text, body) => {
  const words = `${title}\n${text}\n${body}`.split(/[\s|\t|\n|\r]/);
  const tickers = words.filter(word => {
    if (word[0] === '$') {
      return tickersMap[word.substring(1, word.length)] || tickersMap[word];
    }
    return tickersMap[word];
  });
  return tickers.filter((val, i) => tickers.lastIndexOf(val) === i)
    .map(word => word[0] === '$' ? word.substring(1, word.length) : word);
}

exports.fetchData = (url) => new Promise(((resolve, reject) => {
  request({
    json: true,
    url: `${url}.json`,
  }, (error, _, body) => {
    if (error) {
      return reject({ error, body });
    }
    !Array.isArray(body) ?
      resolve({ body: [body], url }) :
      resolve({ body, url });
  });
}));

exports.sleepOneMinuit = () => {
  return new Promise(resolve => setTimeout(resolve, 60000));
} 