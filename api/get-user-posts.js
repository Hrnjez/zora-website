import { getCoinsByCreators, setApiKey } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";

export default async function handler(req, res) {
  // ✅ Always set CORS headers, even on errors
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const ZORA_API_KEY = process.env.ZORA_API_KEY;
    if (!ZORA_API_KEY) {
      throw new Error("Missing ZORA_API_KEY");
    }

    const creator = req.query.creator;
    if (!creator) {
      return res.status(400).json({ error: "Missing creator address" });
    }

    setApiKey(ZORA_API_KEY);

    const response = await getCoinsByCreators({
      creators: [creator],
      chain: base.id,
    });

    if (!response?.data?.zora20Tokens) {
      return res.status(200).json({ posts: [] });
    }

    const tokens = response.data.zora20Tokens;

  const posts = [];

for (const token of tokens) {
  const tokenName = token.name || token.symbol || "Unnamed Token";
  const comments = token?.zoraComments?.edges || [];

  for (const comment of comments) {
    const node = comment.node;
    if (!node?.comment) continue;

    posts.push({
      token: tokenName,
      comment: node.comment,
      user: node.userProfile?.handle || node.userAddress,
      timestamp: node.timestamp,
    });
  }
}


    res.status(200).json({ posts });
  } catch (err) {
    console.error("Fetch error in /get-user-posts:", err.message);
    // ✅ Ensure CORS headers still apply on error
    res.status(500).json({
      error: "Server error",
      message: err.message || "Unknown error",
    });
  }
}
