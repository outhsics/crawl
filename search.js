let elasticsearch = require('elasticsearch');
let client = new elasticsearch.Client({
    host: 'localhost:9200'
});

async function create(article) {
    await client.create({
        index: 'juejin',
        type: 'article',
        id: article.id,
        body: article
    });
}
async function search(keyword) {
    return await client.search({
        index: 'juejin',
        body: {
            query: {
                match: {
                    title: keyword
                }
            }
        }
    });
}
module.exports = {
    create,
    search
}