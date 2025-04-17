import { VercelRequest, VercelResponse } from "@vercel/node";
import { createPublicClient, http, formatEther } from "viem";
import { zora } from "viem/chains";
import { erc20Abi } from 'viem';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { address, user } = req.query;

  if (!address || typeof address !== "string") {
    return res.status(400).json({ error: "Missing token address" });
  }

  const publicClient = createPublicClient({
    chain: zora,
    transport: http("https://rpc.zora.energy"),
  });

  try {
    const [name, symbol, totalSupply, balance] = await Promise.all([
      publicClient.readContract({ address, abi: erc20Abi, functionName: "name" }),
      publicClient.readContract({ address, abi: erc20Abi, functionName: "symbol" }),
      publicClient.readContract({ address, abi: erc20Abi, functionName: "totalSupply" }),
      user && typeof user === 'string'
        ? publicClient.readContract({
            address,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [user],
          })
        : Promise.resolve(null)
    ]);

    return res.status(200).json({
      address,
      name,
      symbol,
      totalSupply: totalSupply?.toString(),
      balance: balance ? balance.toString() : null
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong", details: err.message });
  }
}
