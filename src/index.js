const { crawler } = require('./crawler');
const { db } = require('./db');
const { parse } = require('./parser');

const q = ['https://www.reddit.com/r/wallstreetbets/new', 'https://www.reddit.com/r/wallstreetbets/hot'];

const main = (host = 'localhost:9200', index = 'posts-v2') => {
  const { push } = db(host, index);
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