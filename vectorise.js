import pg from 'pg'
const { Client } = pg
import config from './config.js';

async function getEmbedding(text) {
    const { pipeline } = await import('@xenova/transformers')
    const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    const res = await pipe(text, { pooling: 'mean', normalize: true })    
    console.log(res)
    return `[${res['data'].join(',')}]`
}

async function vectorSearch(query) {
    const client = new Client(config);
    
    try {
        await client.connect();

        const queryEmbedding = await getEmbedding(query);
        console.log('Query Embedding:', queryEmbedding);

        const res = await client.query(`
            SELECT id, text, wiki_name, l1, l2, l3, embedding,
                   embedding <-> $1::vector AS distance
            FROM wiki
            ORDER BY distance
            LIMIT 15;
        `, [queryEmbedding]);

        console.log('Search Results:', res.rows);
        return res.rows
    } catch (err) {
        console.error('Error performing vector search:', err);
    } finally {
        await client.end();
    }
}

export default vectorSearch
