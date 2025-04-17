import { getCoin, setApiKey } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";

export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const ZORA_API_KEY = process.env.ZORA_API_KEY;
    setApiKey(ZORA_API_KEY);

    const coinData = await getCoin({
      address: "0xb5330c936723d19954035e23a20570b511f47636", // WalletConnect
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
    console.error("Zora fetch error:", err);
    res.status(500).json({ error: "Internal server error", message: err.message });
  }
}
