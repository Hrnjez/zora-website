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
    const profile = profileResponse?.data?.profile;

    if (!profile) {
      return res.status(404).json({ error: "Profile not found." });
    }

    // Paginate through balances
    let allBalances = [];
    let cursor = undefined;
    const count = 20;

    do {
      const balancesResponse = await getProfileBalances({
        identifier: address,
        count,
        after: cursor,
      });

      const balanceEdges = balancesResponse?.data?.profile?.coinBalances?.edges || [];
      const pageInfo = balancesResponse?.data?.profile?.coinBalances?.pageInfo;

      const balances = balanceEdges.map((edge) => edge.node);
      allBalances.push(...balances);

      cursor = pageInfo?.endCursor;

      if (!cursor || balanceEdges.length === 0) break;
    } while (true);

    // Return both profile and coin balances
    res.status(200).json({
      profile: {
        handle: profile.handle,
        displayName: profile.displayName,
        bio: profile.bio,
        joinedAt: profile.joinedAt,
        image: profile.avatar?.medium || null,
        followers: profile.followerCount,
        following: profile.followingCount,
      },
      balances: allBalances.map((balance) => ({
        coin: {
          name: balance.token?.name,
          symbol: balance.token?.symbol,
          address: balance.token?.address,
          chainId: balance.token?.chainId,
          marketCap: balance.token?.marketCap,
          volume24h: balance.token?.volume24h,
          createdAt: balance.token?.createdAt,
          uniqueHolders: balance.token?.uniqueHolders,
          image: balance.token?.media?.previewImage || null,
        },
        amount: balance.amount?.amountDecimal,
        valueUsd: balance.valueUsd,
        lastUpdated: balance.timestamp,
      })),
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
