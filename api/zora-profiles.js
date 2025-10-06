// /api/zora-profiles.js (or .ts)
import { setApiKey, getProfile, getProfileCoins } from "@zoralabs/coins-sdk";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  try {
    setCors(res);
    if (req.method === "OPTIONS") return res.status(204).end();

    const ZORA_API_KEY = process.env.ZORA_API_KEY;
    if (!ZORA_API_KEY) {
      return res.status(500).json({ error: "Missing ZORA_API_KEY" });
    }
    setApiKey(ZORA_API_KEY);

    const identifiersParam = req.query.identifiers;
    if (!identifiersParam) {
      return res.status(400).json({ error: "Missing `?identifiers=...`" });
    }
    const identifiers = identifiersParam.split(",").map(s => s.trim()).filter(Boolean);

    const results = await Promise.all(
      identifiers.map(async (identifier) => {
        try {
          const profResp = await getProfile({ identifier });
          const p = profResp?.data?.profile;
          if (!p) return { identifier, notFound: true };

          let createdCoinsMcap = null;
          try {
            const createdResp = await getProfileCoins({ identifier, count: 50 });
            const edges = createdResp?.data?.profile?.createdCoins?.edges || [];
            createdCoinsMcap = edges.reduce((sum, e) => {
              const mc = parseFloat(e?.node?.marketCap ?? "0");
              return sum + (isNaN(mc) ? 0 : mc);
            }, 0);
          } catch { /* leave null */ }

          return {
            identifier: p.handle || identifier,
            displayName: p.displayName || null,
            avatar: p.avatar?.medium || null,
            creatorCoin: p.creatorCoin
              ? {
                  address: p.creatorCoin.address || null,
                  marketCap: p.creatorCoin.marketCap || null,
                  marketCapDelta24h: p.creatorCoin.marketCapDelta24h || null,
                }
              : null,
            createdCoinsMcap,
          };
        } catch (e) {
          return { identifier, error: "Profile query failed" };
        }
      })
    );

    return res.status(200).json({ results });
  } catch (err) {
    // If something unexpected happens (bundle/runtime), still send CORS:
    try { setCors(res); } catch {}
    console.error("zora-profiles error:", err);
    return res.status(500).json({ error: "Server error", message: String(err?.message || err) });
  }
}
