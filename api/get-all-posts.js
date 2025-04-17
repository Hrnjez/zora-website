import { getCoins, setApiKey } from "@zoralabs/coins-sdk";
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

    // ✅ Use getCoins and filter by creator address
    const result = await getCoins({
      creator: "0x029405220dd920dd19fcdee7d23b88465514cbb3", // The address you provided
      chain: base.id,
      limit: 50,
    });

    const tokens = result?.data;

    res.status(200).json(tokens);
  } catch (err) {
    console.error("Zora fetch error:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
}
