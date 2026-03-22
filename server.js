const express=require("express")
const cors=require("cors")
const axios=require("axios")
require("dotenv").config()

const Chat=require("./models/model")

const mongoose=require("mongoose")
const PORT=process.env.PORT || 5000

mongoose.connect("mongodb+srv://Sai_chandu:Atlas%401234567890@cluster0.8glnt.mongodb.net/Chat_Bot")
  .then(() => console.log("MongoDB Connected"));

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/ask-ai', async (req, res) => {
  try {
    const { prompt } = req.body;
    // console.log("BODY:", req.body);

    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
      
        model: "openai/gpt-oss-120b:free",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          "Content-Type": "application/json" 
        }
      }
    );

    res.json({
      result: response.data.choices[0].message.content
    });

  } catch (err) {
   
    console.log("ERROR:", err.response?.data || err.message);

    res.status(500).json({
      error: "Failed to fetch AI response"
    });
  }
});


app.post("/api/save", async (req, res) => {
  const { prompt, response } = req.body;

  const newFlow = new Chat({ prompt, response });
  await newFlow.save();

  res.json({ message: "Saved successfully" });
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));