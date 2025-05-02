import { setApiKey, getProfile } from "@zoralabs/coins-sdk";

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

    // Get profile using the @handle (e.g. "boysclub")
    const profileResponse = await getProfile({ identifier: handle });
    const profile = profileResponse?.data?.profile;

    if (!profile?.id) {
      return res.status(404).json({ error: "Profile not found for handle: " + handle });
    }

    const allTokens = [];
    let cursor = null;
    let hasNextPage = true;

    // Pagination loop for created tokens
    while (hasNextPage) {
      const result = await profile.createdTokens({
        limit: 50,
        cursor: cursor,
        sort: "CREATED_AT_DESC"
      });

      const tokens = result?.data?.profile?.createdTokens?.nodes || [];
      const pageInfo = result?.data?.profile?.createdTokens?.pageInfo;

      allTokens.push(...tokens);
      hasNextPage = pageInfo?.hasNextPage;
      cursor = pageInfo?.endCursor;
    }

    res.status(200).json({ created: allTokens });
  } catch (err) {
    console.error("Zora SDK error:", err);
    res.status(500).json({
      error: "Server error",
      message: err.message,
      stack: err.stack,
    });
  }
}
