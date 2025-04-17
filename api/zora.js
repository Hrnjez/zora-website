export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const query = `
      query UserTokens($user: String!) {
        user(address: $user) {
          tokens(limit: 10) {
            token {
              tokenId
              name
              image { url }
              zoraV3Market {
                marketSummary {
                  floorAskPrice { eth }
                  volume { totalVolume { eth } }
                  creatorEarnings { eth }
                }
              }
            }
          }
        }
      }`;

    const variables = {
      user: '0x647be1c9e1dc79f68c8c9eec126b8407d1f5e3f5'
    };

    const zoraRes = await fetch('https://api.zora.co/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    });

    const body = await zoraRes.text(); // not .json yet
    console.log('ZORA RESPONSE:', body);

    res.status(200).json(JSON.parse(body));
  } catch (err) {
    console.error('ERROR:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
