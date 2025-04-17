import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getCoin, setApiKey } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/api/get-coin", async (req, res) => {
  try {
    const address = req.query.address || "0xb5330c936723d19954035e23a20570b511f47636"; // WalletConnect
    //env 
    const apiKey = process.env.ZORA_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: "Missing ZORA_API_KEY" });
    }

    setApiKey(apiKey);

    const response = await getCoin({
      address,
      chain: base.id,
    });

    res.json(response.data?.zora20Token);
  } catch (err) {
    console.error("Error fetching coin:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
