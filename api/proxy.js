export default async function handler(req, res) {
  // Set common CORS headers for all responses
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).send("Only POST requests allowed");
  }

  try {
    const zoraRes = await fetch("https://api.zora.co/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await zoraRes.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Proxy error", details: error.message });
  }
}
