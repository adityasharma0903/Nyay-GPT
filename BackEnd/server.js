// --- IMPORTS ---
import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import fs from "fs"
import multer from "multer"
import { ChatGroq } from "@langchain/groq"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { TextToSpeechClient } from "@google-cloud/text-to-speech"
import OpenAI from "openai"
import fetch from "node-fetch"

// --- NEW IMPORTS FOR CONTEXT QnA ---
import { Pinecone } from "@pinecone-database/pinecone"
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers"
import { askGrok } from "./grok.js"

// --- ENVIRONMENT SETUP ---
dotenv.config()
console.log("OpenAI Key Loaded:", process.env.OPENAI_API_KEY ? "✅ YES" : "❌ NO")
console.log("Groq Key Loaded:", process.env.GROQ_API_KEY ? "✅ YES" : "❌ NO")
console.log("OmniDim Key Loaded:", process.env.OMNIDIM_API_KEY ? "✅ YES" : "❌ NO")
console.log("Node Process Info:", process.pid, process.platform, process.version)

// --- SYSTEM PROMPTS GLOBAL SCOPE ---
export const systemPrompts = {
  english: `You are Nyay-GPT, a highly knowledgeable, friendly, and concise legal assistant for India. 
Always answer crisply and clearly, using the user's language.
If the question is ambiguous or incomplete, ask a short, polite clarifying question.
Never give legal advice that could be dangerous; always suggest contacting a professional for urgent, serious, or criminal matters.
Be empathetic and supportive.`,

  hindi: `तुम एक भारत का कानूनी सहायक न्याय GPT हो, जवाब हिंदी में दो।
हमेशा उत्तर को संक्षिप्त, स्पष्ट और उपयोगकर्ता के लिए सहायक बनाओ।
अगर सवाल अस्पष्ट हो तो विनम्रतापूर्वक स्पष्ट जानकारी माँगो।
कभी भी कोई खतरनाक कानूनी सलाह मत दो—गंभीर/आपात स्थिति में पेशेवर/पुलिस से संपर्क करने की सलाह दो।`,

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
ചോദ്യം അസ്പഷ്ടമാണെങ്കിൽ, വിനയപൂർവ്വം വിശദീകരണം ചോദിക്കുക.
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
  
  bhojpuri: `रउआ न्याय GPT बानी, भारत खातिर कानूनी सहायिका। जवाब भोजपुरी में दीं।
सवाल अगर अधूरा या अस्पष्ट हो त विनम्रता से पुछीं।
खतरनाक सलाह मत दीं — अगर स्थिति गम्भीर बा त पुलिस भा वकील से संपर्क के सलाह दीं।`,

  maithili: `अहाँ न्याय GPT छी, भारतक लेल कानूनी सहायिका। उत्तर मैथिली में देल जाउ।
सवाल स्पष्ट नै होइ तँ विनम्रतासँ पुछू।
कखनहुँ खतरनाक सलाह नै दिअ—आपत स्थिति में विशेषज्ञ वा पुलिस सँ संपर्क करबाक सलाह दिअ।`,

  awadhi: `तू न्याय GPT अहा, भारत क कानूनी सहायक। जवाब हमेशा अवधी म देइओ।
जवाब साफ, छोट अउर मददगार होइ चाही।
अगर सवाल सही से ना बूझात होइ, त विनम्रता से फिर से पूछ।
कबहूँ खतरनाक कानूनी सलाह मत देइओ — संकट म पुलिस या वकील से सलाह करई के कहो।`,

  bundeli: `तू न्याय GPT है, भारत खातिर कानूनी सहायक। जवाब बुंदेली म दे।
हमेशा साफ-साफ, छोटे अउर मददगार जवाब दओ।
अगर सवाल पूरा ना हो तो विनम्रता से पूछ लओ।
खतरनाक कानूनी सलाह कब्बै न दओ — अगर बात गंभीर हो, त पुलिस या वकील से संपर्क की सलाह दओ।`,

  haryanvi: `तू न्याय GPT सै, भारत का कानूनी मददगार। जवाब हरियाणवी म दे।
साफ, छोटे और ढंग सै जवाब दे।
अगर सवाल अधूरा हो, तो तमीज सै और पूछ ले।
ज्यादा गम्भीर बात हो तो पुलिस या वकील सै संपर्क करन की सलाह दे।`,

  chhattisgarhi: `तंय न्याय GPT हस, भारत खातिर कानूनी सहाय। जवाब छत्तीसगढ़ी म दे।
हमेसा छोट, सपाट अउ मददगार जवाब दे।
अगर सवाल अधूरा लगय, त विनम्रता ले पूछ।
कभू खतरनाक सलाह झन दे — गंभीर स्थिति म पुलिस या वकील ले संपर्क करइ के कह।`,

  marwari: `थूं न्याय GPT हो, भारत रा कानूनी सहायक। जवाब मारवाड़ी म देजो।
हमेशा छोटो, साफ-सुथरो जवाब देवो।
अगर सवाल घणो अस्पष्ट हो, त विनम्रतासूं फेर पूछजो।
खतरनाक कानूनी राय कदी मत देवो — जो बात गम्भीर हो तो पुलिस या वकील ने मिलण की सलाह देवो।`,

  varhadi: `तू न्याय GPT आहेस, भारतासाठी कायदेशीर सहाय्यक. उत्तर वर्‍हाडीमध्ये दे।
नेहमी संक्षिप्त, स्पष्ट आणि उपयोगी उत्तर द्यावं।
प्रश्न अस्पष्ट वाटल्यास विनम्रतेनं विचारावं।
धोकादायक कायदेशीर सल्ला देऊ नको — गंभीर परिस्थितीत पोलिस किंवा तज्ञांशी संपर्क साधायला सांगावं।`,

  tulu: `ನೀನು ನ್ಯಾಯ GPT, ಭಾರತದ ಕಾನೂನು ಸಹಾಯಕ. ಉತ್ತರ ತುಳುವಿನಲ್ಲಿ ಕೊಡ್ಲೆ.
ಸಾಧಾರಣ, ಸ್ಪಷ್ಟ ಮತ್ತು ಸಹಾಯಕ ಉತ್ತರ ಕೊಡು.
ಪ್ರಶ್ನೆ ಸ್ಪಷ್ಟವಿಲ್ಲದರೆ, ವಿನಯಪೂರ್ವಕವಾಗಿ ಪ್ರಶ್ನೆ ಮಾಡಿ.
ಅಪಾಯಕಾರಿಯಾದ ಕಾನೂನು ಸಲಹೆಗಳನ್ನು ನೀಡಬೇಡ — ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ಪೊಲೀಸರು ಅಥವಾ ನಿಪುಣರನ್ನು ಸಂಪರ್ಕಿಸೋದು ಒಳ್ಳೆಯದು.`,

  konkani: `तूं न्याय GPT आसा, भारताचो कायदेचो सहाय्यकार. उत्तर कोकणींत दे.
उत्तर सदैव थोडको, स्पष्ट आनी उपयोगी आसो.
जेंव्हां प्रश्न अस्पष्ट आसो, तेव्हां नम्रत्यान सांग.
कदापी धोकादायक कायदेशीर सल्लो दिओ नाका — गंभीर परिस्थितीत पोलिस वा वकीलाशी संपर्क करात म्हण।`,

  dogri: `तूं न्याय GPT ऐं, भारत दा लीगल सहाय्यक। जवाब डोगरी च दे।
हमेशा जवाब छोटा, साफ ते मददगार होणा चाहिए।
अगर सवाल साफ न होवे, त विनम्रता नाल दुबारा पूछ।
खतरनाक सलाह कदी न दे — संकटकाल च पुलिस या वकील नाल संपर्क करन दी सलाह दे।`,

  manipuri: `ꯑꯃ ꯅꯥꯚꯌꯥ ꯃꯌꯥꯊꯨꯡ ꯃꯇꯝ ꯍꯥꯛꯂꯣꯟꯅꯥ ꯈꯨꯝꯖꯤ ꯐꯥꯏꯇꯦꯡ ꯑꯁꯤ ꯑꯅꯣꯏꯔꯤ ꯋꯥꯡ। ꯑꯃꯇ ꯑꯃ ꯂꯩꯕꯥ ꯊꯧꯕꯥ ꯆꯨꯡꯒꯤꯡ ꯍꯧꯅꯥ ꯅꯍꯥꯡ। 
ꯈꯪꯗꯤ ꯍꯧꯁꯤꯡ ꯊꯣꯛꯇꯔꯥ ꯊꯣꯛꯅꯤ ꯑꯃ ꯂꯩꯕꯥ ꯍꯥꯛꯅꯕ ꯍꯧꯕꯥ ꯊꯣꯛꯄꯨ। 
ꯇꯧꯕꯤ ꯃꯊꯥꯏꯄ ꯇꯧꯔꯤꯛ ꯁꯤꯇꯤ ꯆꯤꯄ ꯄꯥꯔꯤꯕꯒꯤ ꯄꯨꯂꯤꯁ ꯍꯥꯏꯂꯥ ꯂꯩꯔꯤ।`,

  nepali: `तपाईं न्याय GPT हुनुहुन्छ, भारतका लागि कानुनी सहायक। जवाफ नेपालीमा दिनुहोस्।
सधैं उत्तर छोटो, स्पष्ट र सहयोगी बनाउनुहोस्।
यदि प्रश्न अस्पष्ट छ भने, विनम्रतापूर्वक सोध्नुहोस्।
कहिल्यै पनि खतरनाक कानुनी सल्लाह नदिनुहोस् — आपतकालीन अवस्थामा पेशेवर वा प्रहरीसँग सम्पर्क गर्न सल्लाह दिनुहोस्।`,

  assamese: `আপুনি ন্যায় GPT, ভাৰতৰ বাবে আইনী সহায়ক। উত্তৰ অসমীয়াত দিয়ক।
উত্তৰ সৰু, সঠিক আৰু সহায়ক হ'ব লাগিব।
যদি প্ৰশ্ন অস্পষ্ট হয়, তেন্তে নম্ৰভাৱে বুজিবলৈ চেষ্টা কৰক।
কেতিয়াও বিপজ্জনক আইনী পৰামৰ্শ নিদিব — জটিল অৱস্থাত প্ৰফেছনেল বা আৰক্ষীৰ সৈতে যোগাযোগ কৰিবলৈ পৰামৰ্শ দিয়ক।`,

  santali: `Inge Nyay GPT kana do, India re legal agent. Jawaab Santali re dana.
Ote ora clear, short do helpful jawaab dana.
Jodi onol akena menak’ sagaw, polite re furana.
Kanaen do risk wala legal advice do nena — emergency men police kana professional kana contact doa.`,

  sindhi: `توهان نياۓ GPT آهيو، ڀارت لاءِ قانوني مددگار. جواب سنڌي ۾ ڏيو.
هميشه مختصر، واضح ۽ مددگار جواب ڏيو.
جيڪڏهن سوال واضح نه هجي ته نرميءَ سان وضاحت لاءِ پڇو.
ڪڏهن به خطري واري قانوني صلاح نه ڏيو — سنجيده يا ايمرجنسي صورتحال ۾ ماهر يا پوليس سان رابطو ڪرڻ جي صلاح ڏيو۔`,

  kashmiri: `تُسیں نیاۓ GPT ہو، بھارت کی قانونی مدد گار۔ ہمیشہ مختصر، صاف اور محفوظ جواب دو۔
اگر سوال واضح نہ ہو، تہہ ادب نال پُچھو۔
خطرناک قانونی مشورہ نہ دو — ایمرجنسی وچ پروفیشنل یا پولیس نال رابطہ کرو۔`,

  ladakhi: `You are Nyay GPT, India's legal assistant. Always answer clearly, briefly and helpfully, and reply in Ladakhi.
If unclear, ask politely. Never give risky legal advice — recommend contacting a professional or police in emergencies.`,

  lepcha: `You are Nyay GPT, India’s legal assistant. Answer all queries in a clear, concise and supportive manner, and reply in Lepcha.
Ask politely if the question is vague. Never provide risky legal advice — suggest police/legal expert in emergency.`,

  mizo: `You are Nyay GPT, a legal assistant of India. Respond shortly and clearly in Mizo to help users.
Ask politely if unclear. Never give dangerous advice — refer to police/lawyer in emergencies.`,

  mundari: `तुम एक भारत का कानूनी सहायक न्याय GPT हो, जवाब हिंदी में दो।
हमेशा उत्तर को संक्षिप्त, स्पष्ट और उपयोगकर्ता के लिए सहायक बनाओ।
अगर सवाल अस्पष्ट हो तो विनम्रतापूर्वक स्पष्ट जानकारी माँगो।
कभी भी कोई खतरनाक कानूनी सलाह मत दो—गंभीर/आपात स्थिति में पेशेवर/पुलिस से संपर्क करने की सलाह दो।`,

  bhili: `तुम एक भारत का कानूनी सहायक न्याय GPT हो, जवाब हिंदी में दो।
हमेशा उत्तर को संक्षिप्त, स्पष्ट और उपयोगकर्ता के लिए सहायक बनाओ।
अगर सवाल अस्पष्ट हो तो विनम्रतापूर्वक स्पष्ट जानकारी माँगो।
कभी भी कोई खतरनाक कानूनी सलाह मत दो—गंभीर/आपात स्थिति में पेशेवर/पुलिस से संपर्क करने की सलाह दो।`,

  garo: `You are Nyay GPT, India’s legal assistant. Provide short, clear and helpful responses in Garo.
If the question is unclear, ask kindly. Never give dangerous advice—refer to a professional or police in emergency.`,

  khasi: `You are Nyay GPT, India’s legal helper. Always provide helpful, short, and respectful legal guidance in Khasi.
Ask gently if question unclear. Never give dangerous legal suggestions—refer to police/expert during emergencies.`,

  nagamese: `You are Nyay GPT, legal guide of India. Always reply in Nagamese in a clear, safe and useful manner.
Ask softly if confused. Avoid dangerous legal advice—refer to police/expert when emergency comes.`,

  kokborok: `You are Nyay GPT for India. Always give short, clear and helpful responses in Kokborok.
Politely ask for clarification if the query is vague. Never provide risky legal suggestions—suggest expert or police when needed.`
};


// --- EXPRESS APP SETUP ---
const app = express()
const PORT = process.env.PORT || 3000

const upload = multer({ dest: "uploads/" })
const ttsClient = new TextToSpeechClient()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// --- PINECONE & EMBEDDINGS SETUP ---
const pinecone = new Pinecone()
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME)
const embeddings = new HuggingFaceTransformersEmbeddings({
  modelName: "Xenova/all-MiniLM-L6-v2",
})

// --- MIDDLEWARE ---
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000", "https://nyaygpt.vercel.app"]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("CORS error: Not allowed by CORS"))
      }
    },
    credentials: true,
  }),
)

app.use(bodyParser.json({ limit: "10mb" }))
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }))

// --- ERROR HANDLING MIDDLEWARE ---
app.use((err, req, res, next) => {
  console.error("Server Error:", err)
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  })
})

// --- HEALTH CHECK ---
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// --- ROUTE: /ask ---
app.post("/ask", async (req, res) => {
  const { history, language } = req.body

  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ reply: "Invalid input." })
  }

  try {
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama3-70b-8192",
    })

    const formatted = history.map((msg) => `${msg.role === "user" ? "Q" : "A"}: ${msg.content}`).join("\n")
    const lang = (language || "hindi").toLowerCase()
    const sysPrompt = systemPrompts[lang] || systemPrompts["hindi"]

    const prompt = ChatPromptTemplate.fromTemplate(
      sysPrompt + "\n" + "Always keep answers under 100 words unless more detail is crucial.\n" + formatted + "\nA:",
    )

    const chain = prompt.pipe(model)
    const result = await chain.invoke({})

    res.json({ reply: result.content })
  } catch (err) {
    console.error("Error in /ask:", err.message)
    res.status(500).json({ reply: "सर्वर में कोई त्रुटि हुई है।" })
  }
})

// --- ROUTE: /ask-context ---
app.post("/ask-context", async (req, res) => {
  const { history, language } = req.body
  console.log("[ASK-CONTEXT] New request received:", { history, language })

  if (!history || !Array.isArray(history)) {
    console.log("[ASK-CONTEXT] ❌ Invalid input")
    return res.status(400).json({ reply: "Invalid input." })
  }

  try {
    const userQuestion = history[history.length - 1].content
    console.log(`[ASK-CONTEXT] User question: "${userQuestion}"`)

    // Generate embedding for user question
    console.log("[ASK-CONTEXT] ➡ Generating embedding for question...")
    const questionEmbedding = await embeddings.embedQuery(userQuestion)

    // Pinecone vector search
    console.log("[ASK-CONTEXT] ➡ Querying Pinecone for relevant context...")
    const searchResult = await pineconeIndex.query({
      vector: questionEmbedding,
      topK: 5,
      includeMetadata: true,
    })

    // Prepare context for LLM
    const context = searchResult.matches?.map((m) => m.metadata.text).join("\n\n") || ""
    if (searchResult.matches?.length) {
      console.log(`[ASK-CONTEXT] ✅ Legal documents found: ${searchResult.matches.length} segment(s)`)
    } else {
      console.log("[ASK-CONTEXT] ⚠️ No relevant legal documents found in Pinecone.")
    }

    const lang = (language || "hindi").toLowerCase()
    const sysPrompt = systemPrompts[lang] || systemPrompts["hindi"]
    const finalPrompt = `${sysPrompt}
नीचे दिए गए कानूनी दस्तावेज़ों के संदर्भ में उत्तर दें (यदि कोई सटीक संदर्भ है तो उसका उल्लेख करें)। 
हमेशा उत्तर 100 शब्दों के भीतर रखें जब तक अधिक विस्तार आवश्यक न हो।
अगर सवाल अस्पष्ट हो तो विनम्रतापूर्वक स्पष्ट जानकारी माँगें।
कभी भी कोई खतरनाक कानूनी सलाह मत दें—गंभीर या आपात स्थिति में पेशेवर/पुलिस से संपर्क करने की सलाह दें।
${context ? `\n\nसंदर्भ:\n${context}\n` : ""}
\nQ: ${userQuestion}\nA:`

    console.log("[ASK-CONTEXT] ➡ Sending prompt to Groq...")
    const answer = await askGrok(sysPrompt, finalPrompt)

    // Emergency keyword detection
    const emergencyKeywords = [
      "violence",
      "rape",
      "murder",
      "emergency",
      "harassment",
      "attack",
      "threat",
      "injury",
      "police",
      "crime",
      "suicide",
      "danger",
      "molestation",
      "kidnap",
      "missing",
    ]
    const textCheck = (userQuestion + " " + (answer || "")).toLowerCase()
    const found = emergencyKeywords.some((w) => textCheck.includes(w))
    let reply = answer
    if (found) {
      reply += `\n\n⚠️ If this is an emergency or serious crime, please immediately contact your local police or emergency helpline.`
    }

    console.log("[ASK-CONTEXT] ✅ Response generated:", reply)
    res.set("Content-Type", "application/json; charset=utf-8")
    res.json({ reply })
  } catch (err) {
    console.error("[ASK-CONTEXT] ERROR:", err)
    res.set("Content-Type", "application/json; charset=utf-8")
    res.status(500).json({ reply: "सर्वर में कोई त्रुटि हुई है।" })
  }
})

// --- ROUTE: /speak for TTS ---
app.post("/speak", async (req, res) => {
  const { text, language } = req.body

  if (!text) {
    return res.status(400).json({ error: "Text is required" })
  }

  // Voice selection map
  const voiceMap = {
    hindi: { code: "hi-IN", name: "hi-IN-Standard-E" },
    punjabi: { code: "pa-IN", name: "pa-IN-Wavenet-A" },
    tamil: { code: "ta-IN", name: "ta-IN-Wavenet-A" },
    marathi: { code: "mr-IN", name: "mr-IN-Wavenet-A" },
    telugu: { code: "te-IN", name: "te-IN-Wavenet-A" },
    bengali: { code: "bn-IN", name: "bn-IN-Wavenet-A" },
    kannada: { code: "kn-IN", name: "kn-IN-Wavenet-A" },
    malayalam: { code: "ml-IN", name: "ml-IN-Wavenet-A" },
    gujarati: { code: "gu-IN", name: "gu-IN-Wavenet-A" },
    urdu: { code: "ur-IN", name: "ur-IN-Wavenet-A" },
    odia: { code: "or-IN", name: "or-IN-Standard-A" },
    english: { code: "en-IN", name: "en-IN-Standard-E" },
    awadhi: { code: "hi-IN", name: "hi-IN-Standard-E" },
  bhojpuri: { code: "hi-IN", name: "hi-IN-Standard-E" },
  maithili: { code: "hi-IN", name: "hi-IN-Standard-E" },
  bundeli: { code: "hi-IN", name: "hi-IN-Standard-E" },
  haryanvi: { code: "hi-IN", name: "hi-IN-Standard-E" },
  marwari: { code: "hi-IN", name: "hi-IN-Standard-E" },
  chhattisgarhi: { code: "hi-IN", name: "hi-IN-Standard-E" },
  dogri: { code: "hi-IN", name: "hi-IN-Standard-E" },
  varhadi: { code: "mr-IN", name: "mr-IN-Wavenet-A" }, // Close to Marathi
  tulu: { code: "kn-IN", name: "kn-IN-Wavenet-A" },    // Closest to Kannada
  konkani: { code: "mr-IN", name: "mr-IN-Wavenet-A" }, // Closest to Marathi
  manipuri: { code: "bn-IN", name: "bn-IN-Wavenet-A" }, // Approx fallback
  nepali: { code: "hi-IN", name: "hi-IN-Standard-E" },
  assamese: { code: "bn-IN", name: "bn-IN-Wavenet-A" },
  santali: { code: "hi-IN", name: "hi-IN-Standard-E" },
  sindhi: { code: "ur-IN", name: "ur-IN-Wavenet-A" },
  bodo: { code: "hi-IN", name: "hi-IN-Standard-E" },
  kashmiri: { code: "ur-IN", name: "ur-IN-Wavenet-A" },
  ladakhi: { code: "hi-IN", name: "hi-IN-Standard-E" },
  lepcha: { code: "hi-IN", name: "hi-IN-Standard-E" },
  mizo: { code: "bn-IN", name: "bn-IN-Wavenet-A" },
  mundari: { code: "hi-IN", name: "hi-IN-Standard-E" },
  bhili: { code: "hi-IN", name: "hi-IN-Standard-E" },
  garo: { code: "bn-IN", name: "bn-IN-Wavenet-A" },
  khasi: { code: "bn-IN", name: "bn-IN-Wavenet-A" },
  nagamese: { code: "hi-IN", name: "hi-IN-Standard-E" },
  kokborok: { code: "bn-IN", name: "bn-IN-Wavenet-A" },
  }

  const selected = voiceMap[language] || voiceMap.hindi

  const ssml = `
    <speak>
      <prosody rate="medium" pitch="+0st">
        ${text}
      </prosody>
      <break time="300ms"/>
    </speak>
  `

  const request = {
    input: { ssml },
    voice: {
      languageCode: selected.code,
      name: selected.name,
    },
    audioConfig: { audioEncoding: "MP3" },
  }

  try {
    const [response] = await ttsClient.synthesizeSpeech(request)
    res.set("Content-Type", "audio/mpeg")
    res.send(response.audioContent)
  } catch (error) {
    console.error("TTS error:", error)
    res.status(500).json({ error: "Speech synthesis failed." })
  }
})

// --- FIXED ROUTE: /request-call ---
app.post("/request-call", async (req, res) => {
  console.log("[REQUEST-CALL] Received request:", req.body);

  const { phone, topic, language } = req.body;

  if (!phone) {
    console.log("[REQUEST-CALL] ❌ Missing phone number");
    return res.status(400).json({ error: "Phone number is required" });
  }

  if (!process.env.OMNIDIM_API_KEY) {
    console.log("[REQUEST-CALL] ❌ Missing OMNIDIM_API_KEY");
    return res.status(500).json({ error: "OmniDimension API key not configured" });
  }

  try {
    console.log("[REQUEST-CALL] ➡ Making request to OmniDimension API...");

    const requestBody = {
      agent_id: parseInt(process.env.OMNIDIM_AGENT_ID), // Ensure it's a number
      to_number: phone.startsWith("+") ? phone : `+91${phone}`, // Add country code if missing
      call_context: {
        topic: topic || "Legal Help",
        language: language || "hindi",
        source: "NyayGPT Web",
      }
    };

    console.log("[REQUEST-CALL] Request body:", requestBody);

    const response = await fetch("https://backend.omnidim.io/api/v1/calls/dispatch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OMNIDIM_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log("[REQUEST-CALL] OmniDimension response:", response.status, responseText);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Call dispatch failed",
        details: responseText,
        status: response.status,
      });
    }

    res.json({
      success: true,
      message: "Call dispatched successfully",
      data: responseText,
    });
  } catch (err) {
    console.error("[REQUEST-CALL] ❌ Server error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
});


// --- ROUTE: /nearby-police ---
app.get("/nearby-police", async (req, res) => {
  console.log("NEARBY POLICE ROUTE HIT, QUERY:", req.query)

  const { lat, lng } = req.query
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing lat or lng parameter" })
  }
  if (!apiKey) {
    return res.status(500).json({ error: "Google Maps API key not set in .env" })
  }

  try {
    const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=police&key=${apiKey}`
    const response = await fetch(apiUrl)
    const data = await response.json()

    console.log("GOOGLE API RESPONSE:", JSON.stringify(data, null, 2))

    if (!data.results) {
      console.error("GOOGLE API ERROR:", data)
      return res.status(500).json({ error: "Google Places API error", details: data })
    }

    const stations = data.results.map((s) => ({
      name: s.name,
      vicinity: s.vicinity,
      lat: s.geometry.location.lat,
      lng: s.geometry.location.lng,
    }))

    res.json({ stations })
  } catch (error) {
    console.error("Nearby police error:", error)
    res.status(500).json({ error: "Failed to fetch police stations." })
  }
})


// --- ROUTE: /nearby-advocate ---
// --- ROUTE: /nearby-advocate ---
app.get("/nearby-advocate", async (req, res) => {
  const { lat, lng } = req.query;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing lat or lng parameter" });
  }
  if (!apiKey) {
    return res.status(500).json({ error: "Google Maps API key not set in .env" });
  }

  try {
    // 1. Get nearby places
    const nearUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=establishment&keyword=advocate&key=${apiKey}`;
    const response = await fetch(nearUrl);
    const data = await response.json();
    if (!data.results || data.results.length === 0) return res.json({ advocates: [] });

    // 2. For each place, fetch details
    const advocates = await Promise.all(
      data.results.slice(0, 10).map(async (place) => {
        let phone = "Not available";
        let placeUrl = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
        try {
          const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_phone_number,international_phone_number,geometry,vicinity,website&key=${apiKey}`;
          const detailRes = await fetch(detailUrl);
          const detailData = await detailRes.json();
          if (detailData.result) {
            phone = detailData.result.formatted_phone_number ||
                    detailData.result.international_phone_number ||
                    "Not available";
          }
        } catch (err) {
          // ignore
        }
        return {
          name: place.name,
          vicinity: place.vicinity,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          phone,
          placeUrl
          
        };
      })
    );

    res.json({ advocates });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch advocates." });
  }
});


// --- ROUTE: /stt (Speech to Text) ---
app.post("/stt", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Audio file is required" })
  }

  const audioFile = fs.createReadStream(req.file.path)

  try {
    console.log(`[STT] Audio file received: ${req.file.path}`)
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    })

    fs.unlinkSync(req.file.path) // Clean up uploaded file
    console.log(`[STT] Transcription result: ${transcription.text}`)
    res.json({ text: transcription.text })
  } catch (err) {
    console.error("[STT] error:", err.message)
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path) // Clean up on error
    }
    res.status(500).json({ error: "Speech recognition failed." })
  }
})

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`✅ NyayGPT backend running on port ${PORT}`)
  console.log(`🌐 Health check: http://localhost:${PORT}/health`)
})

// --- GRACEFUL SHUTDOWN ---
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  process.exit(0)
})
