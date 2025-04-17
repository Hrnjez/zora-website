// pages/api/get-coin-data.js (or .ts if you're using TypeScript)

import { getCoin, setApiKey } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";

export default async function handler(req, res) {
  // Set CORS headers for client-side access
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight request handling
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const ZORA_API_KEY = process.env.ZORA_API_KEY;
    if (!ZORA_API_KEY) {
      throw new Error("ZORA_API_KEY is not defined in environment variables.");
    }

    // Apply the API key
    setApiKey(ZORA_API_KEY);

    // Fetch the full coin data
    const coinData = await getCoin({
      address: "0x6aa5cbbb9cd38960d5b633b7f1a1ff7fbb53f2f2", // Replace with desired token address
      chain: base.id, // Chain ID for Base (you can change this to other supported chains)
    });

    // Return the full response
    res.status(200).json(coinData);
  } catch (err) {
    console.error("Zora fetch error:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
}
