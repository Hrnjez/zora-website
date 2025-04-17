import { getProfile, setApiKey } from "@zoralabs/coins-sdk";

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
      return res.status(400).json({ error: "Missing ?address query param" });
    }

    const profile = await getProfile({ address });

    if (!profile?.data?.profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.status(200).json(profile.data.profile);
  } catch (err) {
    console.error("Zora profile fetch error:", err);
    res.status(500).json({
      error: "Server error",
      message: err.message,
      stack: err.stack,
    });
  }
}
