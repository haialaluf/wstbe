const { crawler } = require('./crawler');
const { db } = require('./db');
const tickersMap = require('./tickersMap.json');

const q = ['https://www.reddit.com/r/wallstreetbets/new', 'https://www.reddit.com/r/wallstreetbets/hot'];

const getTickers = (title, text, body) => {
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

const parse = ({ selftext, id, title, body, score, created_utc, link_flair_text }, url) => ({
  id, payload: (body || selftext) ? {
    body: selftext || body,
    created: created_utc * 1000,
    title,
    score: Number(score),
    url,
    tickers: getTickers(title, selftext, body),
    flair: link_flair_text
  } : null
});

const main = () => {
  const { push } = db();
  const { run } = crawler(push, q, parse);
  let acc = 1;
  try {
    run(({ counter, urls }) => {
      const newQ = q.filter((val, i) => !urls.includes(val) && q.lastIndexOf(val) === i);
      if (q.length !== newQ.length) {
        q.splice(0, q.length, ...newQ);
      }
      if (counter > acc * 1000) {
        acc ++;
        q.push('https://www.reddit.com/r/wallstreetbets/new');
      }
    });
  } catch (err) {
    console.log('unexpected error occurred', err);
  }
}

main();