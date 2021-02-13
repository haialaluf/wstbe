const { crawler } = require('./crawler');
const { db } = require('./db');
const tickersMap = require('./tickersMap.json');

const q = ['https://www.reddit.com/r/wallstreetbets/new', 'https://www.reddit.com/r/wallstreetbets/hot'];


const getTickers = (title, text, body) => {
  const words = `${title}\n${text}\n${body}`.split(/[\s|\t|\n|\r]/);
  const tickers = words.filter(words => tickersMap[words]);
  return tickers.filter((val, i) => tickers.lastIndexOf(val) === i);
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
  try {
    run(({ counter, urls }) => {
      const newQ = q.filter((val, i) => !urls.includes(val) && q.lastIndexOf(val) === i);
      if (q.length !== newQ.length) {
        q.splice(0, q.length, ...newQ);
      }
    });
  } catch (err) {
    console.log('unexpected error occurred', err);
  }
}

main();