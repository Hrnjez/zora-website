import { getCoinsByProfile, setApiKey } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const ZORA_API_KEY = process.env.ZORA_API_KEY;
    if (!ZORA_API_KEY) throw new Error("ZORA_API_KEY is not defined");

    setApiKey(ZORA_API_KEY);

    // Replace with the address you want to query
    const creatorAddress = "0x029405220dd920dd19fcdee7d23b88465514cbb3";

    const result = await getCoinsByProfile({
      address: creatorAddress,
      chain: base.id,
      limit: 100, // optional, default is 20
    });

    const tokens = result?.data?.profile?.zora20Tokens?.edges || [];

    // Optional: simplify the structure
    const simplifiedTokens = tokens.map(({ node }) => ({
      name: node.name,
      symbol: node.symbol,
      marketCap: node.marketCap,
      totalVolume: node.totalVolume,
      tokenAddress: node.address,
      holders: node.uniqueHolders,
      createdAt: node.createdAt,
    }));

    res.status(200).json({ tokens: simplifiedTokens });
  } catch (err) {
    console.error("Zora fetch error:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
}
