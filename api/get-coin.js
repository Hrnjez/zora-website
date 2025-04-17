import { getCoin, setApiKey } from "@zoralabs/coins-sdk";
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

    const response = await getCoin({
      address: "0x445e9c0a296068dc4257767b5ed354b77cf513de", // <-- Use any Zora20 token address here
      chain: base.id,
    });

    const coin = response.data?.zora20Token;

    if (!coin) {
      return res.status(404).json({ error: "Coin not found or not on this chain." });
    }

    res.status(200).json({
      name: coin.name,
      symbol: coin.symbol,
      description: coin.description,
      totalSupply: coin.totalSupply,
      marketCap: coin.marketCap,
      volume24h: coin.volume24h,
      creator: coin.creatorAddress,
      createdAt: coin.createdAt,
      uniqueHolders: coin.uniqueHolders,
      image: coin.mediaContent?.previewImage?.url || null,
      profile: {
        handle: coin.creatorProfile?.handle || null,
        avatar: coin.creatorProfile?.avatar?.url || null,
      },
    });
  } catch (err) {
    console.error("Zora fetch error:", err);
    res.status(500).json({
      error: "Server error",
      message: err.message,
      stack: err.stack,
    });
  }
}
