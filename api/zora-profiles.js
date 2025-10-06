import { getProfile, getProfileCoins, setApiKey } from "@zoralabs/coins-sdk";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
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

    const profilePromises = handlesList.map(async (handle) => {
      try {
        const [profileResp, coinsResp] = await Promise.all([
          withTimeout(getProfile({ identifier: handle })),
          withTimeout(getProfileCoins({ identifier: handle, count: 3 })),
        ]);

        const profile = profileResp?.data?.profile ?? null;
        const posts =
          coinsResp?.data?.profile?.createdCoins?.edges ?? [];

        return {
          handle,
          profile,
          posts, // edges array
          ok: true,
        };
      } catch (e) {
        return {
          handle,
          profile: null,
          posts: [],
          ok: false,
          error: e?.message || "Unknown error",
        };
      }
    });

    const results = await Promise.all(profilePromises);
    return res.status(200).json({ profiles: results });
  } catch (err) {
    console.error("Zora profiles fetch error:", err);
    // Always return JSON, never raw error/HTML
    return res.status(500).json({
      error: "Server error",
      message: err?.message || String(err),
    });
  }
}
