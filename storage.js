// /api/storage.js
// Serverless key-value API backing the FitBeat site, using Upstash Redis
// (installed on Vercel via: Dashboard -> Storage -> Marketplace -> Upstash Redis).
// That integration auto-injects KV_REST_API_URL and KV_REST_API_TOKEN.

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const PREFIX = 'fitbeat:';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { key, list, prefix } = req.query;

      if (list === 'true') {
        const pattern = PREFIX + (prefix || '') + '*';
        const keys = await redis.keys(pattern);
        return res.status(200).json({ keys: keys.map(k => k.slice(PREFIX.length)) });
      }

      if (!key) return res.status(400).json({ error: 'key is required' });
      const value = await redis.get(PREFIX + key);
      if (value === null || value === undefined) return res.status(404).json({ error: 'not found' });
      return res.status(200).json({ key, value });
    }

    if (req.method === 'POST') {
      const { key, value } = req.body || {};
      if (!key) return res.status(400).json({ error: 'key is required' });
      await redis.set(PREFIX + key, value);
      return res.status(200).json({ key, value });
    }

    if (req.method === 'DELETE') {
      const { key } = req.query;
      if (!key) return res.status(400).json({ error: 'key is required' });
      await redis.del(PREFIX + key);
      return res.status(200).json({ key, deleted: true });
    }

    return res.status(405).json({ error: 'method not allowed' });
  } catch (err) {
    console.error('storage api error', err);
    return res.status(500).json({ error: 'internal error' });
  }
}
