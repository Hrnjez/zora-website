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

    const response = await getCoins({
      creator: "0x029405220dd920dd19fcdee7d23b88465514cbb3",
      chain: base.id,
      limit: 50,
    });

    console.log("Zora raw response:", JSON.stringify(response, null, 2));

    const tokens = response?.data?.zora20Tokens;

    if (!tokens || !Array.isArray(tokens.edges)) {
      throw new Error("Token list is missing or malformed in response");
    }

    res.status(200).json(tokens);
  } catch (err) {
    console.error("Zora fetch error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
}
