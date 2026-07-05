const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const BM_TOKEN = process.env.BM_TOKEN;
const PROXY_SECRET = process.env.PROXY_SECRET;

app.get('/', async (req, res) => {
  // --- Shared secret check ---
  const clientSecret = req.headers['x-proxy-secret'];
  if (clientSecret !== PROXY_SECRET) {
    return res.status(403).send('Forbidden');
  }

  const serverId = req.query.serverId;
  if (!serverId) {
    return res.status(400).send('Missing serverId parameter');
  }

  try {
    const bmUrl = `https://api.battlemetrics.com/servers/${serverId}?include=player`;
    const bmResponse = await fetch(bmUrl, {
      headers: {
        Authorization: `Bearer ${BM_TOKEN}`,
        Accept: 'application/json'
      }
    });

    const body = await bmResponse.text();
    res.status(bmResponse.status).set('Content-Type', 'application/json').send(body);
  } catch (err) {
    res.status(500).send(`Proxy error: ${err.message}`);
  }
});

app.listen(PORT, () => console.log(`Proxy listening on port ${PORT}`));
