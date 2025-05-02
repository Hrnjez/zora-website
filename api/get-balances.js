import { setApiKey, getProfile, getCreatedTokens } from "@zoralabs/coins-sdk";

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

    const profileRes = await getProfile({ identifier: handle });
    const profileId = profileRes?.data?.profile?.id;

    if (!profileId) {
      return res.status(404).json({ error: "Profile not found for handle: " + handle });
    }

    const allTokens = [];
    let cursor = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const tokensRes = await getCreatedTokens({
        profileId: profileId,
        sort: "CREATED_AT_DESC",
        cursor,
        limit: 50,
      });

      const tokens = tokensRes?.data?.profile?.createdTokens?.nodes || [];
      allTokens.push(...tokens);

      const pageInfo = tokensRes?.data?.profile?.createdTokens?.pageInfo;
      hasNextPage = pageInfo?.hasNextPage;
      cursor = pageInfo?.endCursor;
    }

    res.status(200).json({ tokens: allTokens });
  } catch (err) {
    console.error("Zora profile fetch error:", err);
    res.status(500).json({
      error: "Server error",
      message: err.message,
      stack: err.stack,
    });
  }
}
