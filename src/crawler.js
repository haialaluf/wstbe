const { fetchData, sleepOneMinuit } = require('./helpers');

exports.crawler = (dbPush, q, parse) => {

  const indexData = ({body, url}) => {
    body.forEach(({ data }) => {
      if (data.children.length > 24) {
        const lastChildId = data.children[data.children.length - 1].data.id;
        const nextPagesRequests = q.filter(url => url.includes('json?after'));
        const hasNextRequestOnQ = nextPagesRequests.find(val => data.children.find(
          ({data}) => val.includes(data.id)));
        if (!hasNextRequestOnQ){
          if (url.includes('.json')) {
            q.push(`${url.substring(0, url.lastIndexOf('=') + 1)}${lastChildId}`);
          } else {
            q.push(`${url}.json?after=${lastChildId}`);
          }  
        }
      }
      data.children.forEach(({ data }) => {
        const newUrl = `https://www.reddit.com${data.permalink}`
        if (newUrl) {
          q.push(newUrl);
        }
        const { id, payload } = parse(data, newUrl);
        if (id && payload) {
          dbPush(id, payload);
        }
      });
    });
  }

  return {
    run: async (onIteration) => {
      let counter = 0;
      while (q.length) {
        const urls = q.splice(0, Math.min(q.length, Math.ceil(Math.random() * 10)));
        counter += urls.length;
        try {
          const bodies = await Promise.all(urls.map(fetchData));
          bodies.map(indexData)
          onIteration({urls, bodies, counter});
        } catch (err) {
          console.log('Crawler Error: ', err, urls, counter);
          await sleepOneMinuit();
        }
      }
    }
  }
}
