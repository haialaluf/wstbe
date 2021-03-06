const elasticsearch = require('elasticsearch');

const db = (host, index) => {
  const client = new elasticsearch.Client({
    host,
    apiVersion: '_default',
  });

  return {
    push: async (id, body) => {
      try {
        await client.index({
          index: index,
          type: '_doc',
          id,
          body
        });
      } catch (err) {
        console.log('Indexing error:', err);
      }
    }
  }
}

exports.db = db;
