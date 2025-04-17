import { VercelRequest, VercelResponse } from "@vercel/node";
import { getOnchainCoinDetails } from "@zoralabs/coins-sdk";
import { createPublicClient, http } from "viem";
import { zora } from "viem/chains";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { address, user } = req.query;

  if (!address || typeof address !== "string") {
    return res.status(400).json({ error: "Missing or invalid token address." });
  }

  try {
    const publicClient = createPublicClient({
      chain: zora,
      transport: http("https://rpc.zora.energy"),
    });

    const details = await getOnchainCoinDetails({
      coin: address,
      user: typeof user === "string" ? user : undefined,
      publicClient,
    });

    return res.status(200).json({
      address: details.address,
      name: details.name,
      symbol: details.symbol,
      marketCap: details.marketCap?.toString() || null,
      liquidity: details.liquidity?.toString() || null,
      payoutRecipient: details.payoutRecipient,
      owners: details.owners,
      balance: details.balance?.toString() || null,
    });
  } catch (err: any) {
    console.error("Function error:", err);
    return res.status(500).json({
      error: "Function failed",
      message: err.message,
    });
  }
}
