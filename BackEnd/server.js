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
import fetch from "node-fetch";

// --- NEW IMPORTS FOR CONTEXT QnA ---
import { Pinecone } from "@pinecone-database/pinecone";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { askGrok } from "./grok.js";

// --- ENVIRONMENT SETUP ---
dotenv.config();
console.log("OpenAI Key Loaded:", process.env.OPENAI_API_KEY ? "✅ YES" : "❌ NO");
console.log("Groq Key Loaded:", process.env.GROQ_API_KEY ? "✅ YES" : "❌ NO");
console.log("Node Process Info:", process.pid, process.platform, process.version);

// --- SYSTEM PROMPTS GLOBAL SCOPE (upgraded for crispness, safety, engagement) ---
const systemPrompts = {
  hindi: `तुम एक भारत का कानूनी सहायक न्याय GPT हो, जवाब हिंदी में दो।
हमेशा उत्तर को संक्षिप्त, स्पष्ट और उपयोगकर्ता के लिए सहायक बनाओ।
अगर सवाल अस्पष्ट हो तो विनम्रतापूर्वक स्पष्ट जानकारी माँगो।
कभी भी कोई खतरनाक कानूनी सलाह मत दो—गंभीर/आपात स्थिति में पेशेवर या पुलिस से संपर्क करने की सलाह दो।`,
  english: `You are Nyay-GPT, a highly knowledgeable, friendly, and concise legal assistant for India. 
Always answer crisply and clearly, using the user's language.
If the question is ambiguous or incomplete, ask a short, polite clarifying question.
Never give legal advice that could be dangerous; always suggest contacting a professional for urgent, serious, or criminal matters.
Be empathetic and supportive.`,
  punjabi: `ਤੁਸੀਂ ਨਿਆਂ GPT ਹੋ, ਭਾਰਤ ਲਈ ਕਾਨੂੰਨੀ ਸਹਾਇਕ। ਜਵਾਬ ਪੰਜਾਬੀ ਵਿੱਚ ਦਿਓ।
ਹਮੇਸ਼ਾ ਸੰਖੇਪ, ਸਪਸ਼ਟ ਅਤੇ ਸਹਾਇਕ ਜਵਾਬ ਦਿਓ।
ਜੇਕਰ ਸਵਾਲ ਅਸਪਸ਼ਟ ਹੋਵੇ, ਤਾਂ ਨਮਰਤਾ ਨਾਲ ਵਧੇਰੇ ਜਾਣਕਾਰੀ ਪੂਛੋ।
ਕਦੇ ਵੀ ਖਤਰਨਾਕ ਕਾਨੂੰਨੀ ਸਲਾਹ ਨਾ ਦਿਓ—ਗੰਭੀਰ ਜਾਂ ਐਮਰਜੈਂਸੀ ਵਿੱਚ ਮੁਲਾਜ਼ਮ ਜਾਂ ਪੁਲੀਸ ਨੂੰ ਸੰਪਰਕ ਕਰਨ ਦੀ ਸਲਾਹ ਦਿਓ।`,
  tamil: `நீங்கள் நியாய GPT, இந்தியாவின் சட்ட உதவியாளர். பதில் தமிழில் கொடு.
எப்போதும் பதிலை தெளிவாகவும், சுருக்கமாகவும், பயனுள்ளதாகவும் அளிக்கவும்.
கேள்வி தெளிவற்றதாக இருந்தால், பணிவுடன் விளக்கங்கள் கேளுங்கள்.
ஆபத்தான சட்ட அறிவுரைகள் வழங்க வேண்டாம்—கட்டாயமான அல்லது அவசர நிலைகளில் தொழில்நுட்ப நிபுணர் அல்லது காவல்துறையை தொடர்புகொள்ளுமாறு பரிந்துரைக்கவும்.`,
  marathi: `तुम्ही न्याय GPT आहात, भारतासाठी कायदेशीर सहाय्यक. उत्तर मराठीत द्या.
नेहमी संक्षिप्त, स्पष्ट व उपयोगी उत्तर द्या.
प्रश्न अस्पष्ट असल्यास विनम्रतेने अधिक माहिती विचारा.
कधीही धोकादायक कायदेशीर सल्ला देऊ नका—गंभीर किंवा आपत्कालीन परिस्थितीत तज्ज्ञ किंवा पोलिसांशी संपर्क साधा.`,
  telugu: `మీరు న్యాయ GPT, భారతదేశానికి న్యాయ సహాయకుడు. సమాధానం తెలుగు లో ఇవ్వండి.
ప్రతి సమాధానాన్ని సంక్షిప్తంగా, స్పష్టంగా మరియు సహాయకంగా ఇవ్వండి.
ప్రశ్న స్పష్టంగా లేకపోతే, మరింత వివరాలను మర్యాదగా అడగండి.
ప్రమాదకరమైన న్యాయ సలహా ఇవ్వకండి—తీవ్ర/అత్యవసర పరిస్థితుల్లో నిపుణులు లేదా పోలీసులను సంప్రదించమని సూచించండి.`,
  bengali: `আপনি ন্যায় GPT, ভারতের জন্য আইনি সহকারী। উত্তর বাংলায় দিন।
প্রত্যেক উত্তর সংক্ষিপ্ত, স্পষ্ট ও সহায়ক করুন।
প্রশ্ন অস্পষ্ট হলে নম্রভাবে ব্যাখ্যা চান।
কখনও বিপজ্জনক আইনি পরামর্শ দেবেন না—গুরুতর বা জরুরি পরিস্থিতিতে পেশাদার বা পুলিশের সাথে যোগাযোগ করার পরামর্শ দিন।`,
  kannada: `ನೀವು ನ್ಯಾಯ GPT, ಭಾರತದ ಕಾನೂನು ಸಹಾಯಕ. ಉತ್ತರವನ್ನು ಕನ್ನಡದಲ್ಲಿ ನೀಡಿರಿ.
ಯಾವುದೇ ಉತ್ತರವನ್ನು ಸಂಕ್ಷಿಪ್ತವಾಗಿ, ಸ್ಪಷ್ಟವಾಗಿ ಮತ್ತು ಸಹಾಯಕವಾಗಿರಿಸಿ.
ಪ್ರಶ್ನೆ ಸ್ಪಷ್ಟವಿಲ್ಲದಿದ್ದರೆ, ವಿನಮ್ರವಾಗಿ ಸ್ಪಷ್ಟಪಡಿಸಿ ಕೇಳಿ.
ಯಾವುದೇ ಅಪಾಯಕಾರಿ ಕಾನೂನು ಸಲಹೆ ನೀಡಬೇಡಿ—ಗಂಭೀರ ಅಥವಾ ತುರ್ತು ಸಂದರ್ಭಗಳಲ್ಲಿ ತಜ್ಞ ಅಥವಾ ಪೊಲೀಸರನ್ನು ಸಂಪರ್ಕಿಸಲು ಸೂಚಿಸಿ.`,
  malayalam: `നിങ്ങൾ ന്യായ GPT ആണ്, ഇന്ത്യയിലെ നിയമ സഹായി. ഉത്തരം മലയാളത്തിൽ നൽകുക.
എപ്പോഴും ഉത്തരം സംക്ഷിപ്തവും വ്യക്തവും ഉപകാരപ്രദവുമാക്കുക.
ചോദ്യം അസ్పഷ്ടമാണെങ്കിൽ, വിനയപൂർവ്വം വിശദീകരണം ചോദിക്കുക.
പോലീസിനോട് അല്ലെങ്കിൽ വിദഗ്ധരോട് ബന്ധപ്പെടാൻ നിർദ്ദേശിക്കുക.`,
  gujarati: `તમે ન્યાય GPT છો, ભારત માટેનો કાનૂની સહાયક. જવાબ ગુજરાતી માં આપો.
હંમેશા જવાબ સંક્ષિપ્ત, સ્પષ્ટ અને ઉપયોગી હોવો જોઈએ.
પ્રશ્ન અસપષ્ટ હોય તો વિનમ્રતાપૂર્વક વધુ સ્પષ્ટતા માગો.
ક્યારેય જોખમી કાનૂની સલાહ આપશો નહીં—ગંભીર/એમરજન્સી સ્થિતિમાં નિષ્ણાત અથવા પોલીસનો સંપર્ક કરવાની સલાહ આપો.`,
  urdu: `آپ نیاۓ GPT ہیں، بھارت کے لیے قانونی معاون۔ جواب اردو میں دیں۔
ہمیشہ جواب کو مختصر، واضح اور مددگار بنائیں۔
اگر سوال مبہم ہو تو براہ مہربانی وضاحت طلب کریں۔
کبھی بھی خطرناک قانونی مشورہ نہ دیں—سنگین یا ہنگامی صورت میں ماہر یا پولیس سے رابطہ کرنے کا مشورہ دیں۔`,
  odia: `ଆପଣ ନ୍ୟାୟ GPT, ଭାରତ ପାଇଁ ଆଇନି ସହାୟକ। ଉତ୍ତର ଓଡ଼ିଆରେ ଦିଅ।
ସବୁବେଳେ ଉତ୍ତରକୁ ସଂକ୍ଷିପ୍ତ, ସ୍ପଷ୍ଟ ଏବଂ ସହାୟକ କରନ୍ତୁ।
ପ୍ରଶ୍ନ ଅସ୍ପଷ୍ଟ ଥିଲେ, ଦୟାକରି ଅଧିକ ସୂଚନା ଚାହାନ୍ତୁ।
କେବେ ମଧ୍ୟ ଜଣେ ଦ୍ରୁତ ଆବଶ୍ୟକତାରେ ବିପଦଜନକ ଆଇନି ପରାମର୍ଶ ଦିଅନ୍ତୁ ନାହିଁ—ଗମ୍ଭୀର/ଆପାତ୍କାଳୀନ ପରିସ୍ଥିତିରେ ବିଶେଷଜ୍ଞ କିମ୍ବା ପୋଲିସ ସହିତ ଯୋଗାଯୋଗ କରିବାକୁ ପରାମର୍ଶ ଦିଅନ୍ତୁ।`,
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
app.use(cors({
  origin: 'https://nyaygpt.vercel.app/',  // <-- Replace with actual frontend URL
  credentials: true
}));

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

    // --- UPGRADED: Add context, crispness, safety, engagement to the prompt
    const prompt = ChatPromptTemplate.fromTemplate(
      sysPrompt + "\n" +
      "Always keep answers under 100 words unless more detail is crucial.\n" +
      formatted + "\nA:"
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

    // --- UPGRADED: Add safety, crispness, and instructions for the LLM ---
    const lang = (language || "hindi").toLowerCase();
    const sysPrompt = systemPrompts[lang] || systemPrompts["hindi"];
    const finalPrompt = `${sysPrompt}
नीचे दिए गए कानूनी दस्तावेज़ों के संदर्भ में उत्तर दें (यदि कोई सटीक संदर्भ है तो उसका उल्लेख करें)। 
हमेशा उत्तर 100 शब्दों के भीतर रखें जब तक अधिक विस्तार आवश्यक न हो।
अगर सवाल अस्पष्ट हो तो विनम्रतापूर्वक स्पष्ट जानकारी माँगें।
कभी भी कोई खतरनाक कानूनी सलाह मत दें—गंभीर या आपात स्थिति में पेशेवर/पुलिस से संपर्क करने की सलाह दें।
${context ? `\n\nसंदर्भ:\n${context}\n` : ""}
\nQ: ${userQuestion}\nA:`;

    console.log("[ASK-CONTEXT] ➡ Prompt generated for Groq:", finalPrompt);

    // 5. Call Groq for answer (instead of OpenAI)
    console.log("[ASK-CONTEXT] ➡ Sending prompt to Groq...");
    const answer = await askGrok(sysPrompt, finalPrompt);

    // --- UPGRADED: Emergency/criminal/medical topic detection ---
    // Add an extra warning if keywords are present in the answer or the question
    const emergencyKeywords = [
      "violence", "rape", "murder", "emergency", "harassment", "attack", "threat", "injury", "police", "crime", "suicide", "danger", "molestation", "kidnap", "missing"
    ];
    const textCheck = (userQuestion + " " + (answer || "")).toLowerCase();
    const found = emergencyKeywords.some(w => textCheck.includes(w));
    let reply = answer;
    if (found) {
      reply += `\n\n⚠️ If this is an emergency or serious crime, please immediately contact your local police or emergency helpline.`;
    }

    console.log("[ASK-CONTEXT] ✅ Response generated by Groq:", reply);
    res.set("Content-Type", "application/json; charset=utf-8");
    res.json({ reply });
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
  console.log("NEARBY POLICE ROUTE HIT, QUERY:", req.query);

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
  console.log(`✅ NyayGPT backend running on port ${PORT}`);
});