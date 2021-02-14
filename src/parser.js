
const { getTickers } = require('./helpers');

exports.parse = ({ selftext, id, title, body, score, created_utc, link_flair_text }, url) => ({
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
