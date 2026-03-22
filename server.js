const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const Chat = require("./models/model");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err.message));


app.use(cors({
  origin: "https://future-blink-frontend-xi.vercel.app",
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend running ");
});

// AI Route
app.post('/api/ask-ai', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.0-flash-lite-preview-02-05:free",
        messages: [
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      result: response.data?.choices?.[0]?.message?.content || "No response from AI"
    });

  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);

    res.status(500).json({
      error: err.response?.data || "Failed to fetch AI response"
    });
  }
});

// Save Route
app.post("/api/save", async (req, res) => {
  try {
    const { prompt, response } = req.body;

    const newFlow = new Chat({ prompt, response });
    await newFlow.save();

    res.json({ message: "Saved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Save failed" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});