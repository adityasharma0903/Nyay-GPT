// --- IMPORTS ---
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
import fetch from "node-fetch"; // npm install node-fetch

// --- NEW IMPORTS FOR CONTEXT QnA ---
import { Pinecone } from "@pinecone-database/pinecone";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { askGrok } from "./grok.js";

// --- ENVIRONMENT SETUP ---
dotenv.config();
console.log("OpenAI Key Loaded:", process.env.OPENAI_API_KEY ? "✅ YES" : "❌ NO");
console.log("Groq Key Loaded:", process.env.GROQ_API_KEY ? "✅ YES" : "❌ NO");
console.log("Node Process Info:", process.pid, process.platform, process.version);

// --- SYSTEM PROMPTS GLOBAL SCOPE ---
const systemPrompts = {
  hindi: "तुम एक भारत का कानूनी सहायक न्याय GPT हो, जवाब हिंदी में दो।",
  english: "You are Nyay GPT, a legal assistant for India. Reply in English.",
  punjabi: "ਤੁਸੀਂ ਨਿਆਂ GPT ਹੋ, ਭਾਰਤ ਲਈ ਕਾਨੂੰਨੀ ਸਹਾਇਕ। ਜਵਾਬ ਪੰਜਾਬੀ ਵਿੱਚ ਦਿਓ।",
  tamil: "நீங்கள் நியாய GPT, இந்தியாவின் சட்ட உதவியாளர். பதில் தமிழில் கொடு.",
  marathi: "तुम्ही न्याय GPT आहात, भारतासाठी कायदेशीर सहाय्यक. उत्तर मराठीत द्या.",
  telugu: "మీరు న్యాయ GPT, భారతదేశానికి న్యాయ సహాయకుడు. సమాధానం తెలుగు లో ఇవ్వండి.",
  bengali: "আপনি ন্যায় GPT, ভারতের জন্য আইনি সহকারী। উত্তর বাংলায় দিন।",
  kannada: "ನೀವು ನ್ಯಾಯ GPT, ಭಾರತದ ಕಾನೂನು ಸಹಾಯಕ. ಉತ್ತರವನ್ನು ಕನ್ನಡದಲ್ಲಿ ನೀಡಿರಿ.",
  malayalam: "നിങ്ങൾ ന്യായ GPT ആണ്, ഇന്ത്യയിലെ നിയമ സഹായി. ഉത്തരം മലയാളത്തിൽ നൽകുക.",
  gujarati: "તમે ન્યાય GPT છો, ભારત માટેનો કાનૂની સહાયક. જવાબ ગુજરાતી માં આપો.",
  urdu: "آپ نیاۓ GPT ہیں، بھارت کے لیے قانونی معاون۔ جواب اردو میں دیں۔",
  odia: "ଆପଣ ନ୍ୟାୟ GPT, ଭାରତ ପାଇଁ ଆଇନି ସହାୟକ। ଉତ୍ତର ଓଡ଼ିଆରେ ଦିଅ।",
};

// --- EXPRESS APP SETUP ---
const app = express();
const PORT = 3000;

const upload = multer({ dest: "uploads/" });
const ttsClient = new TextToSpeechClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- NEW PINECONE & EMBEDDINGS SETUP ---
const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
const embeddings = new HuggingFaceTransformersEmbeddings({
  modelName: "Xenova/all-MiniLM-L6-v2",
});

// --- MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json());

// --- ROUTE: /ask ---
app.post("/ask", async (req, res) => {
  const { history, language } = req.body;

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

    // Default to Hindi if not provided or invalid
    const lang = (language || "hindi").toLowerCase();
    const sysPrompt = systemPrompts[lang] || systemPrompts["hindi"];

    const prompt = ChatPromptTemplate.fromTemplate(
      sysPrompt + "\n" + formatted + "\nA:"
    );

    const chain = prompt.pipe(model);
    const result = await chain.invoke({});

    res.json({ reply: result.content });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ reply: "सर्वर में कोई त्रुटि हुई है।" });
  }
});

// --- ROUTE: /ask-context (Legal context via Pinecone + Grok) ---
app.post("/ask-context", async (req, res) => {
  const { history, language } = req.body;
  console.log("[ASK-CONTEXT] New request received:", { history, language });

  if (!history || !Array.isArray(history)) {
    console.log("[ASK-CONTEXT] ❌ Invalid input");
    return res.status(400).json({ reply: "Invalid input." });
  }

  try {
    const userQuestion = history[history.length - 1].content;
    console.log(`[ASK-CONTEXT] User question: "${userQuestion}"`);

    // 1. Generate embedding for user question
    console.log("[ASK-CONTEXT] ➡ Generating embedding for question...");
    const questionEmbedding = await embeddings.embedQuery(userQuestion);

    // 2. Pinecone vector search
    console.log("[ASK-CONTEXT] ➡ Querying Pinecone for relevant context...");
    const searchResult = await pineconeIndex.query({
      vector: questionEmbedding,
      topK: 5,
      includeMetadata: true,
    });

    // 3. Prepare context for LLM
    const context = searchResult.matches?.map(m => m.metadata.text).join("\n\n") || "";
    if (searchResult.matches?.length) {
      console.log(`[ASK-CONTEXT] ✅ Legal documents found: ${searchResult.matches.length} segment(s)`);
    } else {
      console.log("[ASK-CONTEXT] ⚠️ No relevant legal documents found in Pinecone.");
    }

    // 4. Prepare prompt (multilingual)
    const lang = (language || "hindi").toLowerCase();
    const sysPrompt = systemPrompts[lang] || systemPrompts["hindi"];
    const finalPrompt = `${sysPrompt}\nनीचे दिए गए कानूनी दस्तावेज़ों के संदर्भ में उत्तर दें:\n${context}\n\nQ: ${userQuestion}\nA:`;

    console.log("[ASK-CONTEXT] ➡ Prompt generated for Groq:", finalPrompt);

    // 5. Call Groq for answer (instead of OpenAI)
    console.log("[ASK-CONTEXT] ➡ Sending prompt to Groq...");
    const answer = await askGrok(sysPrompt, finalPrompt);

    console.log("[ASK-CONTEXT] ✅ Response generated by Groq:", answer);
    res.set("Content-Type", "application/json; charset=utf-8");
    res.json({ reply: answer });

  } catch (err) {
    console.error("[ASK-CONTEXT] ERROR:", err);
    res.set("Content-Type", "application/json; charset=utf-8");
    res.status(500).json({ reply: "सर्वर में कोई त्रुटि हुई है।" });
  }
});

// --- ROUTE: /speak for TTS ---
app.post("/speak", async (req, res) => {
  const { text, language } = req.body;

  // Voice selection map
  const voiceMap = {
    hindi:     { code: "hi-IN", name: "hi-IN-Standard-E" },
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

// --- ROUTE: /nearby-police ---
app.get("/nearby-police", async (req, res) => {
    console.log("NEARBY POLICE ROUTE HIT, QUERY:", req.query); // << YEH LINE ADD KARO

  const { lat, lng } = req.query;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing lat or lng parameter" });
  }
  if (!apiKey) {
    return res.status(500).json({ error: "Google Maps API key not set in .env" });
  }

  try {
    const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=police&key=${apiKey}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    // --- DEBUG: LOG FULL GOOGLE API RESPONSE ---
    console.log("GOOGLE API RESPONSE:", JSON.stringify(data, null, 2));

    if (!data.results) {
      console.error("GOOGLE API ERROR:", data);
      return res.status(500).json({ error: "Google Places API error", details: data });
    }

    const stations = data.results.map(s => ({
      name: s.name,
      vicinity: s.vicinity,
      lat: s.geometry.location.lat,
      lng: s.geometry.location.lng
    }));

    res.json({ stations });
  } catch (error) {
    console.error("Nearby police error:", error);
    res.status(500).json({ error: "Failed to fetch police stations." });
  }
});

// --- ROUTE: /stt (Speech to Text) ---
app.post("/stt", upload.single("audio"), async (req, res) => {
  const audioFile = fs.createReadStream(req.file.path);

  try {
    console.log(`[STT] Audio file received: ${req.file.path}`);
    const transcription = await openai.createTranscription(audioFile, "whisper-1");
    fs.unlinkSync(req.file.path);
    console.log(`[STT] Transcription result: ${transcription.data.text}`);
    res.json({ text: transcription.data.text });
  } catch (err) {
    console.error("[STT] error:", err.message);
    res.status(500).json({ error: "Speech recognition failed." });
  }
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`✅ NyayGPT backend running on http://localhost:${PORT}`);
});