import { getProfile, getProfileBalances, setApiKey } from "@zoralabs/coins-sdk";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const ZORA_API_KEY = process.env.ZORA_API_KEY;
    if (!ZORA_API_KEY) throw new Error("ZORA_API_KEY is not defined");

    setApiKey(ZORA_API_KEY);

    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ error: "Missing `?address=0x...` query param" });
    }

    // Fetch profile
    const profileResponse = await getProfile({ identifier: address });

    // Fetch balances (first page only)
    const balancesResponse = await getProfileBalances({
      identifier: address,
      count: 99,
    });

    res.status(200).json({
      profile: profileResponse?.data?.profile || null,
      balances: balancesResponse?.data?.profile?.coinBalances || null,
    });
  } catch (err) {
    console.error("Zora profile fetch error:", err);
    res.status(500).json({
      error: "Server error",
      message: err.message,
      stack: err.stack,
    });
  }
}
