export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const creator = req.query.creator;
    if (!creator) {
      return res.status(400).json({ error: "Missing creator address" });
    }

    const ZORA_API_KEY = process.env.ZORA_API_KEY;
    if (!ZORA_API_KEY) {
      throw new Error("Missing ZORA_API_KEY");
    }

    const response = await fetch("https://api.zora.co/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": ZORA_API_KEY,
      },
      body: JSON.stringify({
        query: `
          query CoinsByCreator($creator: String!) {
            zora20Tokens(where: { creator: $creator }) {
              name
              symbol
              zoraComments {
                edges {
                  node {
                    comment
                    timestamp
                    userAddress
                    userProfile {
                      handle
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          creator,
        },
      }),
    });

    const json = await response.json();

    const tokens = json.data?.zora20Tokens || [];

    const posts = tokens.flatMap(token => {
      const tokenName = token.name || token.symbol || "Unnamed Token";
      const comments = token.zoraComments?.edges || [];
      return comments.map(({ node }) => ({
        token: tokenName,
        comment: node.comment,
        user: node.userProfile?.handle || node.userAddress,
        timestamp: node.timestamp,
      }));
    });

    res.status(200).json({ posts });
  } catch (err) {
    console.error("Error in get-user-posts:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
}
