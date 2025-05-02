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
    where: {
      creator: ["0xd8fbc75dfc8562e4807cb5e08ac1abdbe723be9e"],
    },
    chain: base.id,
    limit: 20,
  });


    console.log("Zora raw response:", JSON.stringify(response, null, 2));

    const tokens = response?.data?.zora20Tokens;

    if (!tokens || !Array.isArray(tokens.edges)) {
      throw new Error("Token list is missing or malformed in response");
    }

    res.status(200).json(tokens);
 } catch (err) {
  console.error("🔥 FULL ERROR OBJECT:");
  console.error(err);
  res.status(500).json({
    error: "Server error",
    raw: err,
    message: err?.message || "Unknown error",
    stack: err?.stack || null
  });
}

}
