import { getCoin, setApiKey } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";

export default async function handler(req, res) {
  // ✅ CORS preflight support
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).end();
    return;
  }

  try {
    const ZORA_API_KEY = 'zorasdk_eFql2RXc9H9trDB6wE8g8oYeKky0vuvvE-zJu-baYNI';
    setApiKey(ZORA_API_KEY);

    const coinData = await getCoin({
      address: "0xb5330c936723d19954035e23a20570b511f47636", // WalletConnect coin
      chain: base.id,
    });

    const comments = coinData?.data?.zora20Token?.zoraComments?.edges || [];

    const simplifiedPosts = comments.map(({ node }) => ({
      user: node.userProfile?.handle || node.userAddress,
      content: node.comment,
      timestamp: node.timestamp,
    }));

    res.setHeader("Access-Control-Allow-Origin", "*"); // allow Webflow
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    res.status(200).json({ posts: simplifiedPosts });
  } catch (err) {
    console.error("Zora fetch error:", err);
    res.status(500).json
