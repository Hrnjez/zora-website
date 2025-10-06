// /api/get-profiles
import { setApiKey, getProfile, getProfileCoins } from "@zoralabs/coins-sdk";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const ZORA_API_KEY = process.env.ZORA_API_KEY;
    if (!ZORA_API_KEY) throw new Error("ZORA_API_KEY is not defined");
    setApiKey(ZORA_API_KEY);

    const identifiersParam = req.query.identifiers; // comma-separated handles or addresses
    if (!identifiersParam) {
      return res.status(400).json({ error: "Missing `?identifiers=handle1,0x...,handle2`" });
    }

    const identifiers = identifiersParam.split(",").map(s => s.trim()).filter(Boolean);

    const results = await Promise.all(
      identifiers.map(async (identifier) => {
        // 1) Creator coin market cap (per profile)
        const profResp = await getProfile({ identifier }); // wallet OR handle is supported
        const p = profResp?.data?.profile;

        if (!p) return { identifier, notFound: true };

        const creatorCoin = p.creatorCoin || null; // may be null if they haven't enabled it

        // 2) Sum of market caps of coins created by this profile (optional)
        let createdCoinsMcap = null;
        try {
          const createdResp = await getProfileCoins({ identifier, count: 50 });
          const edges = createdResp?.data?.profile?.createdCoins?.edges || [];
          createdCoinsMcap = edges.reduce((sum, e) => {
            const mc = parseFloat(e?.node?.marketCap ?? "0");
            return sum + (isNaN(mc) ? 0 : mc);
          }, 0);
        } catch (e) {
          // leave createdCoinsMcap as null if query fails
        }

        return {
          identifier: p.handle || identifier,
          displayName: p.displayName || null,
          avatar: p.avatar?.medium || null,
          creatorCoin: creatorCoin
            ? {
                address: creatorCoin.address || null,
                // NOTE: marketCap is returned as a string in the SDK; parse on the frontend if needed
                marketCap: creatorCoin.marketCap || null,
                marketCapDelta24h: creatorCoin.marketCapDelta24h || null,
              }
            : null,
          createdCoinsMcap,
        };
      })
    );

    res.status(200).json({ results });
  } catch (err) {
    console.error("get-profiles error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
}
