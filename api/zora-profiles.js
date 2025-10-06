import { getProfile, getCoinsCreatedByProfile, setApiKey } from "@zoralabs/coins-sdk";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const ZORA_API_KEY = process.env.ZORA_API_KEY;
    if (!ZORA_API_KEY) throw new Error("ZORA_API_KEY is not defined");
    setApiKey(ZORA_API_KEY);

    const { handles } = req.query;
    
    if (!handles) {
      return res.status(400).json({ error: "Missing ?handles=user1,user2,user3 query param" });
    }

    const handlesList = handles.split(',');
    
    // Fetch profiles + their created coins in parallel
    const profilePromises = handlesList.map(async (handle) => {
      const trimmedHandle = handle.trim();
      
      // Get profile
      const profileResponse = await getProfile({ identifier: trimmedHandle });
      
      // Get coins created by this profile (their posts)
      const coinsResponse = await getCoinsCreatedByProfile({
        identifier: trimmedHandle,
        count: 3, // Get last 3 posts
      });
      
      return {
        handle: trimmedHandle,
        profile: profileResponse?.data?.profile || null,
        posts: coinsResponse?.data?.profile?.coinsCreated?.edges || []
      };
    });
    
    const results = await Promise.all(profilePromises);

    res.status(200).json({ profiles: results });
    
  } catch (err) {
    console.error("Zora profiles fetch error:", err);
    res.status(500).json({ 
      error: "Server error", 
      message: err.message,
      stack: err.stack
    });
  }
}
