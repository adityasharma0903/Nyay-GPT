import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import fs from "fs";
import util from "util";
import multer from "multer";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import OpenAI from "openai";

dotenv.config();
console.log("OpenAI Key Loaded:", process.env.OPENAI_API_KEY ? "✅ YES" : "❌ NO");

const app = express();
const PORT = 3000;

const upload = multer({ dest: "uploads/" });
const ttsClient = new TextToSpeechClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(bodyParser.json());

// Route: Ask NyayGPT
app.post("/ask", async (req, res) => {
  const { history } = req.body;

  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ reply: "Invalid input." });
  }

  try {
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama3-70b-8192"
    });

    // Combine conversation history
    const formatted = history.map((msg) => `${msg.role === "user" ? "Q" : "A"}: ${msg.content}`).join("\n");

    const prompt = ChatPromptTemplate.fromTemplate(
      "तुम एक भारत का कानूनी सहायक न्याय GPT हो, जवाब हिंदी में दो।\n" + formatted + "\nA:"
    );

    const chain = prompt.pipe(model);
    const result = await chain.invoke({});

    res.json({ reply: result.content });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ reply: "सर्वर में कोई त्रुटि हुई है।" });
  }
});

// Route: Text to Speech
// Route: Text to Speech with WaveNet and SSML support
app.post("/speak", async (req, res) => {
  const { text, language } = req.body;

  // Voice selection map
  const voiceMap = {
    hindi:     { code: "hi-IN", name: "hi-IN-Wavenet-A" },
    punjabi:   { code: "pa-IN", name: "pa-IN-Wavenet-A" },
    tamil:     { code: "ta-IN", name: "ta-IN-Wavenet-A" },
    marathi:   { code: "mr-IN", name: "mr-IN-Wavenet-A" },
    telugu:    { code: "te-IN", name: "te-IN-Wavenet-A" },
    bengali:   { code: "bn-IN", name: "bn-IN-Wavenet-A" },
    kannada:   { code: "kn-IN", name: "kn-IN-Wavenet-A" },
    malayalam: { code: "ml-IN", name: "ml-IN-Wavenet-A" },
    gujarati:  { code: "gu-IN", name: "gu-IN-Wavenet-A" },
    urdu:      { code: "ur-IN", name: "ur-IN-Wavenet-A" },
    odia:      { code: "or-IN", name: "or-IN-Standard-A" } // fallback
  };

  const selected = voiceMap[language] || voiceMap.hindi;

  // SSML for natural voice: pause, emphasis, and slight pitch
  const ssml = `
    <speak>
      <prosody rate="medium" pitch="+0st">
        ${text}
      </prosody>
      <break time="300ms"/>
    </speak>
  `;

  const request = {
    input: { ssml },
    voice: {
      languageCode: selected.code,
      name: selected.name
    },
    audioConfig: { audioEncoding: "MP3" },
  };

  try {
    const [response] = await ttsClient.synthesizeSpeech(request);
    res.set("Content-Type", "audio/mpeg");
    res.send(response.audioContent);
  } catch (error) {
    console.error("TTS error:", error);
    res.status(500).send("Speech synthesis failed.");
  }
});


// Optional: Whisper STT
app.post("/stt", upload.single("audio"), async (req, res) => {
  const audioFile = fs.createReadStream(req.file.path);

  try {
    const transcription = await openai.createTranscription(audioFile, "whisper-1");
    fs.unlinkSync(req.file.path);
    res.json({ text: transcription.data.text });
  } catch (err) {
    console.error("STT error:", err.message);
    res.status(500).json({ error: "Speech recognition failed." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ NyayGPT backend running on http://localhost:${PORT}`);
});