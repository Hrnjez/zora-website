let cache = null;
let lastFetch = 0;
const REVALIDATE_INTERVAL = 60 * 1000; // 1 minute

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const ZORA_API_KEY = process.env.ZORA_API_KEY;
    if (!ZORA_API_KEY) throw new Error("ZORA_API_KEY is not defined");

    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ error: "Missing ?address=0x..." });
    }

    const now = Date.now();
    const isFresh = cache && (now - lastFetch < REVALIDATE_INTERVAL);

    if (isFresh) {
      console.log("⚡ Serving from memory cache");
      return res.status(200).json(cache);
    }

    setApiKey(ZORA_API_KEY);

    const profileResponse = await getProfile({ identifier: address });
    const balancesResponse = await getProfileBalances({ identifier: address, count: 99 });

    const responseData = {
      profile: profileResponse?.data?.profile || null,
      balances: balancesResponse?.data?.profile?.coinBalances || null,
    };

    // Cache result
    cache = responseData;
    lastFetch = now;

    console.log("✅ Fetched fresh data");
    return res.status(200).json(responseData);
  } catch (err) {
    console.error("Zora API error:", err);
    return res.status(500).json({ error: "Server error", message: err.message });
  }
}
