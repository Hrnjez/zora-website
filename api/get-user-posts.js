import { getCoinsByCreators, setApiKey } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const ZORA_API_KEY = process.env.ZORA_API_KEY;
    if (!ZORA_API_KEY) throw new Error("Missing ZORA_API_KEY");

    const creator = req.query.creator;
    if (!creator) {
      return res.status(400).json({ error: "Missing creator address" });
    }

    setApiKey(ZORA_API_KEY);

    const response = await getCoinsByCreators({
      creators: [creator],
      chain: base.id,
    });

    const tokens = response.data?.zora20Tokens || [];

    const posts = tokens.flatMap((token) => {
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
    console.error("Fetch user posts error:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
}
