// api/zora.js
export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.zora.co/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
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
          }`,
        variables: {
          user: '0x647be1c9e1dc79f68c8c9eec126b8407d1f5e3f5' // walletconnect
        }
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
