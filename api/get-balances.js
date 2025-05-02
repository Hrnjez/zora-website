import { getProfile, getCreatedTokens, setApiKey } from "@zoralabs/coins-sdk";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const ZORA_API_KEY = process.env.ZORA_API_KEY;
    if (!ZORA_API_KEY) throw new Error("ZORA_API_KEY is not defined");

    setApiKey(ZORA_API_KEY);

    const { handle } = req.query;
    if (!handle) {
      return res.status(400).json({ error: "Missing `?handle=boysclub` query param" });
    }

    // Step 1: Get profile to retrieve the internal ID
    const profileResponse = await getProfile({ identifier: handle });
    const profileId = profileResponse?.data?.profile?.id;

    if (!profileId) {
      return res.status(404).json({ error: `Profile not found for handle: ${handle}` });
    }

    // Step 2: Get created tokens (1 page, up to 99)
    const createdResponse = await getCreatedTokens({
      profileId: profileId,
      sort: "CREATED_AT_DESC",
      limit: 99,
    });

    const tokens = createdResponse?.data?.profile?.createdTokens?.nodes || [];

    res.status(200).json({
      profile: profileResponse?.data?.profile || null,
      tokens: tokens,
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
