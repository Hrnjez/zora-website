import { getProfile, getProfileCoins, setApiKey } from "@zoralabs/coins-sdk";

export default async function handler(req, res) {
  // CORS for your public frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  // short CDN cache for 30s; adjust as you like
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");

  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const ZORA_API_KEY = process.env.ZORA_API_KEY;
    if (!ZORA_API_KEY) {
      return res.status(500).json({ error: "Server misconfig: ZORA_API_KEY is not defined" });
    }
    setApiKey(ZORA_API_KEY);

    const { handles } = req.query;
    if (!handles) {
      return res.status(400).json({ error: "Missing ?handles=user1,user2,user3 query param" });
    }

    const handlesList = handles.split(",").map(h => h.trim()).filter(Boolean);

    const withTimeout = (p, ms = 8000) =>
      Promise.race([
        p,
        new Promise((_, rej) => setTimeout(() => rej(new Error("Timeout")), ms)),
      ]);

    const results = await Promise.all(
      handlesList.map(async (handle) => {
        try {
          const [profileResp, coinsResp] = await Promise.all([
            withTimeout(getProfile({ identifier: handle })),
            withTimeout(getProfileCoins({ identifier: handle, count: 3 })),
          ]);

          const profile = profileResp?.data?.profile ?? null;
          const posts = coinsResp?.data?.profile?.createdCoins?.edges ?? [];

          return { handle, profile, posts, ok: true };
        } catch (e) {
          return {
            handle,
            profile: null,
            posts: [],
            ok: false,
            error: e?.message || "Unknown error",
          };
        }
      })
    );

    return res.status(200).json({ profiles: results });
  } catch (err) {
    console.error("Zora profiles fetch error:", err);
    return res.status(500).json({
      error: "Server error",
      message: err?.message || String(err),
    });
  }
}
