import { getCoin, setApiKey } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";

export default async function handler(req, res) {
  // Always set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const ZORA_API_KEY = process.env.ZORA_API_KEY;
    if (!ZORA_API_KEY) {
      throw new Error("ZORA_API_KEY is not defined");
    }

    setApiKey(ZORA_API_KEY);

    const coinData = await getCoin({
      address: "0xeb52aa8b4bec001e4dbb3f7013f9af6a3f11f631",
      chain: base.id,
    });

    const comments = coinData?.data?.zora20Token?.zoraComments?.edges || [];

    const simplifiedPosts = comments.map(({ node }) => ({
      user: node.userProfile?.handle || node.userAddress,
      content: node.comment,
      timestamp: node.timestamp,
    }));

    res.status(200).json({ posts: simplifiedPosts });
  } catch (err) {
    console.error("Zora fetch error:", err.message);
    // CORS-safe error response
    res.status(500).json({ error: "Server error", message: err.message });
  }
}
