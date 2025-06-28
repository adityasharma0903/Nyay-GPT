"use client"

import { useEffect, useRef, useState } from "react"
import { FaMicrophone, FaMicrophoneSlash, FaMapMarkerAlt, FaPhone, FaTimes, FaVolumeUp } from "react-icons/fa"
import FileUpload from "./FileUpload"; // <-- add this at the top ( for file uplaod folder )
import { Link } from "react-router-dom";


const backendBaseUrl =
  window.location.hostname === "localhost" ? "http://localhost:3000" : "https://nyay-gpt.onrender.com"

// Supported Languages & Greetings
const languages = {
  english: {
    code: "en-IN",
    greeting: "Hello! I'm Nyay GPT — your AI legal assistant. Feel free to ask me any legal question.",
  },
  hindi: {
    code: "hi-IN",
    greeting: "नमस्ते! मैं न्याय GPT हूँ। आप मुझसे कोई भी कानूनी सवाल पूछ सकते हैं।",
  },
  bhojpuri: {
    code: "hi-IN",
    greeting: "नमस्कार! हम न्याय GPT बानी। रउआ मुझसे कवनो कानून से जुड़ल सवाल पूछ सकत बानी।",
  },
  awadhi: {
    code: "hi-IN",
    greeting: "नमस्कार! हम न्याय GPT हई। तोहसे कउनो कानून संबंधी सवाल पूछ सकत हउ।",
  },
  maithili: {
    code: "hi-IN",
    greeting: "नमस्कार! हम न्याय GPT छी। अहाँ हमरा सँ कोनो कानूनी प्रश्न पुछि सकै छी।",
  },
  marwari: {
    code: "hi-IN",
    greeting: "राम राम! म्हूं न्याय GPT हूं। थां मने काई भी कानून री बात पूछ सको हो।",
  },
  chhattisgarhi: {
    code: "hi-IN",
    greeting: "जुहार! में न्याय GPT अंव। तंय मोला कऊनो कानूनी बात पूछ सके हस।",
  },
  haryanvi: {
    code: "hi-IN",
    greeting: "राम राम! मैं न्याय GPT सूं। तू मन्ने कोई भी कानून का सवाल पूछ सके है।",
  },
  bundeli: {
    code: "hi-IN",
    greeting: "नमस्ते! हम न्याय GPT हौं। तुम हमसे कोई भी कानूनी सवाल पूछ सकत हौ।",
  },
  varhadi: {
    code: "mr-IN",
    greeting: "नमस्कार! मी न्याय GPT आहे. तुम्ही मला कुठलाही कायद्याचा प्रश्न विचारू शकता.",
  },
  tulu: {
    code: "kn-IN",
    greeting: "ನಮಸ್ಕಾರ! ನಾನು ನ್ಯಾಯ GPT. ನೀವು ನನಗೆ ಯಾವುದೇ ಕಾನೂನು ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು.",
  },
  konkani: {
    code: "hi-IN",
    greeting: "नमस्कार! हांव न्याय GPT. तुमका कितेही कायद्यातले प्रश्न असां विचारू येता.",
  },
  santali: {
    code: "hi-IN",
    greeting: "Johar! Ena justice GPT ache. On law r related question puthe paraye.",
  },
  sindhi: {
    code: "hi-IN",
    greeting: "سلام! مان نياي GPT آھيان. اوھان مونکان ڪوبه قانوني سوال پڇي سگھو ٿا.",
  },
  punjabi: {
    code: "pa-IN",
    greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਨਿਆਂ GPT ਹਾਂ। ਤੁਸੀਂ ਮੈਨੂੰ ਕੋਈ ਵੀ ਕਾਨੂੰਨੀ ਸਵਾਲ ਪੁੱਛ ਸਕਦੇ ਹੋ।",
  },
  tamil: {
    code: "ta-IN",
    greeting: "வணக்கம்! நான் நியாய GPT. நீங்கள் என்னிடம் எந்தவொரு சட்டக் கேள்வியையும் கேட்கலாம்.",
  },
  marathi: {
    code: "mr-IN",
    greeting: "नमस्कार! मी न्याय GPT आहे. तुम्ही मला कोणताही कायदेशीर प्रश्न विचारू शकता.",
  },
  telugu: {
    code: "te-IN",
    greeting: "నమస్తే! నేను న్యాయ GPT. మీరు నన్ను ఎలాంటి చట్ట సంబంధిత ప్రశ్నలు అడగవచ్చు.",
  },
  bengali: {
    code: "bn-IN",
    greeting: "নমস্কার! আমি ন্যায় GPT। আপনি আমাকে যেকোনো আইনি প্রশ্ন করতে পারেন।",
  },
  kannada: {
    code: "kn-IN",
    greeting: "ನಮಸ್ಕಾರ! ನಾನು ನ್ಯಾಯ GPT. ನೀವು ನನಗೆ ಯಾವುದೇ ಕಾನೂನು ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು.",
  },
  malayalam: {
    code: "ml-IN",
    greeting: "നമസ്കാരം! ഞാൻ ന്യായ GPT. നിങ്ങൾക്ക് എനിക്ക് നിയമപരമായ ചോദ്യങ്ങൾ ചോദിക്കാം.",
  },
  gujarati: {
    code: "gu-IN",
    greeting: "નમસ્તે! હું ન્યાય GPT છું. તમે મને કોઈ પણ કાનૂની પ્રશ્ન પૂછો.",
  },
  urdu: {
    code: "ur-IN",
    greeting: "السلام علیکم! میں نیاۓ GPT ہوں، آپ مجھ سے کوئی بھی قانونی سوال پوچھ سکتے ہیں۔",
  },
  odia: {
    code: "or-IN",
    greeting: "ନମସ୍କାର! ମୁଁ ନ୍ୟାୟ GPT। ଆପଣ ମୋତେ କୌଣସି ଆଇନିକ ପ୍ରଶ୍ନ ପଚାରିପାରିବେ।",
  },
  dogri: {
    code: "hi-IN",
    greeting: "नमस्ते! मै न्याय GPT हां। तुसीं मैनूं कोई वी कानूनी सवाल पुछ सकदे हो।",
  },
  manipuri: {
    code: "hi-IN",
    greeting: "ꯊꯥꯔꯦꯝ! ꯑꯃ ꯅꯌꯥꯌ GPT ꯑꯃꯁꯤ. ꯑꯃꯅꯤ ꯁꯦꯠꯇꯨ ꯀꯥꯅꯨꯟ ꯄ꯭ꯔꯦꯁꯟ ꯁꯪꯗꯦꯜ ꯀꯨꯠ ꯇꯨꯡ.",
  },
  nepali: {
    code: "hi-IN",
    greeting: "नमस्कार! म न्याय GPT हुँ। तपाईं मलाई कुनै पनि कानुनी प्रश्न सोध्न सक्नुहुन्छ।",
  },
  assamese: {
    code: "hi-IN",
    greeting: "নমস্কাৰ! মই ন্যায় GPT। আপুনি মোক যিকোনো আইনী প্ৰশ্ন কৰিব পাৰে।",
  },
  santhali: {
    code: "hi-IN",
    greeting: "Johar! Ena justice GPT ache. On law r related question puthe paraye.",
  },
  bodo: {
    code: "hi-IN",
    greeting: "नमस्कार! मैं नव्या, चाणक्य एआई से आपकी कानूनी सहायिका। कृपया बताएं, आपको कैसी मदद चाहिए?",
  },
  kashmiri: {
    code: "ur-IN",
    greeting: "السلام علیکم! میں نویا، چانکیہ اے آئی سے آپ کی قانونی ایجنٹ۔ بتائیں آپ کو کس قسم کی مدد چاہیے؟",
  },
  ladakhi: {
    code: "hi-IN",
    greeting: "नमस्ते! मैं नव्या, चाणक्य एआई से आपकी लीगल सहायिका। कृपया बताएं, क्या आपको इमरजेंसी है या सामान्य सहायता?",
  },
  lepcha: {
    code: "hi-IN",
    greeting: "Hello, I am Navya, your legal agent from Chanakya AI. Please tell me your query or legal help needed.",
  },
  mizo: {
    code: "bn-IN",
    greeting: "Hello! I am Navya from Chanakya AI. Can you tell me what legal help you need or if it's an emergency?",
  },
  mundari: {
    code: "hi-IN",
    greeting: "Johar! Main Navya, Chanakya AI se aapki legal assistant hoon. Batayen aapko kis prakaar ki madad chahiye?",
  },
  bhili: {
    code: "hi-IN",
    greeting: "Ram Ram! Main Navya, Chanakya AI se aapki legal assistant hoon. Aapko kya madad chahiye?",
  },
  garo: {
    code: "bn-IN",
    greeting: "Hi! I'm Navya from Chanakya AI. Please tell me how I can help you legally.",
  },
  khasi: {
    code: "bn-IN",
    greeting: "Khublei! Nga dei Navya na Chanakya AI. Sngewbha aiu, phang aiu kano ka jingiarap hukum?",
  },
  nagamese: {
    code: "hi-IN",
    greeting: "Namaskar! Moi Navya Chanakya AI pora ahise. Aapuni ki dhoronor legal help lage?",
  },
  kokborok: {
    code: "bn-IN",
    greeting: "Kwlwrwi! Ang Navya, Chanakya AI borok. Ang boi borok kobor dokai?",
  },

};


const languageKeywords = {
  english: ["english", "इंग्लिश", "अंग्रेजी"],
  hindi: ["hindi", "हिंदी", "हिन्दी"],
  punjabi: ["punjabi", "ਪੰਜਾਬੀ", "पंजाबी"],
  tamil: ["tamil", "तमिल", "தமிழ்"],
  marathi: ["marathi", "मराठी"],
  telugu: ["telugu", "तेलुगू", "తెలుగు"],
  bengali: ["bengali", "বেঙ্গলি", "বাঙালি", "बंगाली"],
  kannada: ["kannada", "ಕನ್ನಡ", "कन्नड़"],
  malayalam: ["malayalam", "മലയാളം", "मलयालम"],
  gujarati: ["gujarati", "ગુજરાતી", "गुजराती"],
  urdu: ["urdu", "اردو", "उर्दू"],
  odia: ["odia", "odiya", "ଓଡ଼ିଆ", "ओड़िया"],

  bhojpuri: ["bhojpuri", "भोजपुरी", "भोजपुरिया"],
  maithili: ["maithili", "मैथिली"],
  awadhi: ["awadhi", "अवधी"],
  bundeli: ["bundeli", "बुंदेली"],
  haryanvi: ["haryanvi", "हरियाणवी"],
  chhattisgarhi: ["chhattisgarhi", "छत्तीसगढ़ी"],
  marwari: ["marwari", "मारवाड़ी"],
  varhadi: ["varhadi", "वऱ्हाडी"],
  tulu: ["tulu", "ತುಳು", "तुलु"],
  konkani: ["konkani", "कोंकणी"],
  dogri: ["dogri", "डोगरी"],
  manipuri: ["manipuri", "মণিপুরী", "মণিপুরি", "মণিপুর", "মনিপুরি", "মণিপুরি ভাষা"],
  nepali: ["nepali", "नेपाली"],
  kashmiri: ["kashmiri", "कश्मीरी", "کشمیری"],
  assamese: ["assamese", "অসমীয়া", "असमिया"],
  santali: ["santali", "संथाली", "ᱥᱟᱱᱛᱟᱞᱤ"],
  sindhi: ["sindhi", "सिंधी", "سنڌي", "sindi"],
  bodo: ["bodo", "बोडो", "बर'"],
  // kashmiri: ["kashmiri", "कश्मीरी", "کشمیری"],
  ladakhi: ["ladakhi", "लद्दाखी"],
  lepcha: ["lepcha", "लेपचा"],
  mizo: ["mizo", "मिज़ो", "Mizo ṭawng"],
  mundari: ["mundari", "मुंडारी", "ᱢᱩᱱᱫᱟᱹᱨᱤ"],
  bhili: ["bhili", "भीली"],
  garo: ["garo", "गारो"],
  khasi: ["khasi", "खासी"],
  nagamese: ["nagamese", "नगामीज़", "নাগামীজ"],
  kokborok: ["kokborok", "कोकबोरोक", "কোকবোরোক"]

};


const initialGreeting =
  "आप कानूनी सहायता तक पहुँच चुके हैं। आपकी बेहतर मदद के लिए कृपया बताएं आपकी पसंदीदा भाषा क्या है? For example: Hindi, English, Gujrati.       You have accessed legal aid , for your better help , please tell us your preferred language for example english , hindi , gujrati"

const languageGreetings = {
  english: "Hello! I am Navya, your legal agent from Chanakya AI. For better assistance, can you tell me what help you need or if you are in an emergency?",

  hindi: "नमस्ते जी, मैं नव्या, चाणक्य एआई से आपकी लीगल एजेंट। आपकी बेहतर सहायता के लिए, क्या आप बता सकते हैं आपको किस प्रकार की कानूनी सहायता चाहिए या क्या आप इमरजेंसी में हैं?",

  punjabi: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਜੀ, ਮੈਂ ਨਵਿਆ, ਚਾਣਕਯ ਏਆਈ ਤੋਂ ਤੁਹਾਡੀ ਲੀਗਲ ਏਜੰਟ ਹਾਂ। ਤੁਹਾਡੀ ਬਿਹਤਰ ਮਦਦ ਲਈ, ਕੀ ਤੁਸੀਂ ਦੱਸ ਸਕਦੇ ਹੋ ਕਿ ਤੁਹਾਨੂੰ ਕਿਸ ਕਿਸਮ ਦੀ ਕਾਨੂੰਨੀ ਮਦਦ ਚਾਹੀਦੀ ਹੈ ਜਾਂ ਤੁਸੀਂ ਐਮਰਜੈਂਸੀ ਵਿੱਚ ਹੋ?",

  tamil: "வணக்கம், நான் நவ்யா, சாணக்யா ஏஐயில் இருந்து உங்கள் சட்ட உதவியாளர். சிறந்த உதவிக்காக, நீங்கள் என்ன உதவி தேவை என்று அல்லது அவசர நிலைமையில் உள்ளீர்களா என்று சொல்ல முடியுமா?",

  marathi: "नमस्कार, मी नव्या, चाणक्य एआयमधून तुमची लीगल एजंट. तुमच्या उत्तम मदतीसाठी, कृपया सांगा तुम्हाला कोणत्या प्रकारची कायदेशीर मदत हवी आहे किंवा तुम्ही आणीबाणी स्थितीत आहात का?",

  telugu: "నమస్తే, నేను నవ్యా, చాణక్య ఎఐ నుండి మీ లీగల్ ఏజెంట్. మీకు మెరుగైన సహాయం అందించేందుకు, మీరు ఏ విధమైన చట్ట సహాయం కావాలో లేదా మీరు ఎమర్జెన్సీలో ఉన్నారా అని చెప్పగలరా?",

  bengali: "নমস্কার, আমি নব্যা, চাণক্য এআই থেকে আপনার লিগ্যাল এজেন্ট। আপনার আরও ভাল সহায়তার জন্য, দয়া করে বলুন আপনি কী ধরনের আইনি সহায়তা চান বা আপনি জরুরি অবস্থায় রয়েছেন কিনা।",

  kannada: "ನಮಸ್ಕಾರ, ನಾನು ನವ್ಯಾ, ಚಾಣಕ್ಯ ಎಐ ಯಿಂದ ನಿಮ್ಮ ಲೀಗಲ್ ಏಜೆಂಟ್. ಉತ್ತಮ ಸಹಾಯಕ್ಕಾಗಿ, ನಿಮಗೆ ಯಾವ ರೀತಿಯ ಕಾನೂನು ಸಹಾಯ ಬೇಕು ಅಥವಾ ನೀವು ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ಇದ್ದೀರಾ ಎಂಬುದನ್ನು ಹೇಳಿ.",

  malayalam: "നമസ്കാരം, ഞാൻ നവ്യ, ചാണക്യ എഐയിൽ നിന്നുള്ള നിങ്ങളുടെ ലീഗൽ ഏജന്റ്. മികച്ച സഹായത്തിനായി, നിങ്ങൾക്ക് എന്ത് തരത്തിലുള്ള നിയമ സഹായം വേണമെന്ന് അല്ലെങ്കിൽ നിങ്ങൾ അടിയന്തരാവസ്ഥയിലാണോ എന്ന് പറയാമോ?",

  gujarati: "નમસ્તે, હું નવ્યા, ચાણક્ય એઆઈ તરફથી તમારી લીગલ એજન્ટ છું. તમારી વધુ સારી મદદ માટે, કૃપા કરીને કહો તમને કઈ પ્રકારની કાનૂની મદદ જોઈએ છે અથવા તમે ઇમરજન્સી માં છો?",

  urdu: "السلام علیکم، میں نویا، چانکیہ اے آئی سے آپ کی قانونی ایجنٹ ہوں۔ آپ کی بہتر مدد کے لیے، کیا آپ بتا سکتے ہیں آپ کو کس چیز کی قانونی مدد چاہیے یا آپ ایمرجینسی میں ہیں؟",

  odia: "ନମସ୍କାର, ମୁଁ ନବ୍ୟା, ଚାଣକ୍ୟ ଏଆଇ ରୁ ଆପଣଙ୍କର ଲିଗାଲ୍ ଏଜେଣ୍ଟ। ଆପଣଙ୍କୁ ଭଲ ସହଯୋଗ ଦେବା ପାଇଁ, ଦୟାକରି କହନ୍ତୁ ଆପଣ କେଉଁ ପ୍ରକାରର ଆଇନିକ ସହଯୋଗ ଚାହାଁନ୍ତି କିମ୍ବା ଆପଣ ଆପାତ୍କାଳୀନ ସ୍ଥିତିରେ ଅଛନ୍ତି କି?",

  bhojpuri: "नमस्कार, हम नव्या हईं, चाणक्य एआई से आपके लीगल एजेंट. कृपया बताईं आपको किस तरह के कानूनी सहायता के ज़रूरत बा या आप इमरजेंसी में बानी?",

  maithili: "नमस्कार, हम नव्या छी, चाणक्य एआई से अपने लीगल एजेंट. बेहतर सहायता हेतु, कृपया बताउ की अहाँ के कत्तिक कानूनी सहायता के आवश्यकता छै?",

  awadhi: "नमस्ते, हम नव्या हई, चाणक्य एआई से आपके लीगल एजेंट. कृपया बताईं कि आपको कइसन कानूनी मदद चाही?",

  bundeli: "राम राम, हम नव्या, चाणक्य एआई से आपकी लीगल एजेंट. बताइए, कैसी मदद चाही या आप संकट में हैं?",

  haryanvi: "राम राम जी, मैं नव्या, चाणक्य एआई से आपकी लीगल एजेंट. बता दो जी, कसम की मदद चाही या कोई अर्जेंसी है?",

  chhattisgarhi: "नमस्कार, मैं नव्या, चाणक्य एआई ले आए हवंव. बतावव, कइसन मदद चाही?",

  marwari: "राम राम सा, हूं नव्या, चाणक्य एआई सूं थारी लीगल एजेंट. के बतावो थांने काईंसी मदद जोईए?",

  varhadi: "नमस्कार, मी नव्या, चाणक्य एआय मधून तुमचं लीगल एजंट आहे. सांगा, तुमचं काय सहाय्य हवं आहे का?",

  tulu: "ನಮಸ್ಕಾರ, ನಾನ್ ನವ್ಯಾ, ಚಾಣಕ್ಯ ಎಐ ಇಂದ ಬಾಂಡಿಗಾ ಲೀಗಲ್ ಏಜೆಂಟ್. ಸಹಾಯ ಬಯಸುತ್ತೀರಾ ಎ೦ದು ತಿಳಿಸಿ.",

  konkani: "नमस्कार, हांव नव्या, चाणक्य एआय खातीर तुजो कायदेचो सहाय्यकार. कितें तुमका मदत जाय, सांग?",

  dogri: "नमस्कार, मैं नव्या, चाणक्य एआई तोहाडे लीगल एजेंट। कृपया दसो, तुहानूं किहड़ी लीगल मदद चाहीदी ऐ?",

  manipuri: "ꯊꯧꯔꯤ ꯂꯥꯟꯅꯥꯔꯤ, ꯑꯃ ꯅꯥꯚꯌꯥ, ꯆꯥꯅꯛꯌ ꯑꯩ ꯍꯥꯛꯂꯣꯟꯅꯥ ꯑꯁꯤ ꯑꯅꯣꯏꯔꯤ ꯋꯥꯡ. ꯑꯃ ꯍꯥꯛꯂꯣꯟꯅꯥ ꯈꯪꯂꯦꯡ ꯍꯧꯕꯥ ꯊꯣꯛꯂꯤꯡ ꯍꯧꯅꯥ ꯅꯍꯥꯡ?",

  nepali: "नमस्कार, म नव्या, चाणक्य एआईबाट तपाईंको कानूनी सहायक। तपाईंलाई कस्तो सहायता चाहिएको हो वा तपाईं आपतकालीन स्थितिमा हुनुहुन्छ?",

  assamese: "নমস্কাৰ, মই নব্যা, চাণক্য AI ৰ পৰা আপোনাৰ লিগেল এজেন্ট। আপোনাক ভালকৈ সহায় কৰিবলৈ, অনুগ্ৰহ কৰি ক'ব পাৰিবনে আপোনাৰ কিদৰে সহায়ৰ প্ৰয়োজন?",

  santali: "Johar! Ing navya kana chaanakya AI re legal agent do. Enge eda kana menak' sagaw kana kanaen do?",

  sindhi: "سلام، مان ناويا آهيان، چانڪيا اي آءِ مان توهانجي قانوني ايجنٽ. مهرباني ڪري ٻڌايو ته توهان کي ڪهڙي قانوني مدد گهرجي يا توهان ايمرجنسي ۾ آهيو؟",

  bodo: "नमस्कार, हाउ नव्या, चाणक्य एआई ब्रा बोरो लिगाल हेल्पर। हांखो किफां कानूनी मदद जरुर आसे?",

  kashmiri: "السلام علیکم، میں نویا، چانکیہ اے آئی سے آپ کی قانونی ایجنٹ ہوں۔ کیا آپ بتا سکتے ہیں آپ کو کس طرح کی قانونی مدد چاہیے یا کیا آپ ایمرجنسی میں ہیں؟",

  ladakhi: "जूलय! में नव्या यिन, चाणक्य एआई ले थुगे लीगल एजेंट यिन। थुगे हेनान कानूनी मदद हक्पा यिन ना?",

  lepcha: "Namaste, I am Navya from Chanakya AI. I'm your legal assistant. Could you tell me if you need legal help or if it's an emergency?",

  mizo: "Chibai! Ka hming Navya, Chanakya AI atangin. Lawmin chhiar ang che, eng kinda tihchhiar ngai ang che?",

  mundari: "Johar! Ang Navya kana, Chanakya AI se legal madad deta. Tum do kana kanoon ro sahay lagena?",

  bhili: "राम राम! में नव्या, चाणक्य एआई से आपरी लीगल सहायिका हूं। आप काईसी मदद चावो?",

  garo: "Khublei! Nga la Navya, Chanakya AI na legal agent. Nangno dakani aidokani ma?",

  khasi: "Khublei, nga dei Navya na Chanakya AI. Sngewbha ong kumno nga lah iarap ha ka bynta jong ka ain?",

  nagamese: "Namaskar! Moi Navya ase Chanakya AI pora. Aapuni ki dhoronar legal help lage nai?",

  kokborok: "Kwlwrwi! Ang Navya, Chanakya AI borok a. Ang baijani nai: borok kobor dokai nai?"

};



export default function MainLanding(props) {
  const recognitionRef = useRef(null)
  const audioRef = useRef(null)
  const apiCallInProgressRef = useRef(false)
  const timerRef = useRef(null)
  const utteranceIdRef = useRef(0)

  // File upload states
  const [filePreview, setFilePreview] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [awaitingVoiceContext, setAwaitingVoiceContext] = useState(false);

  const [connected, setConnected] = useState(false)
  const [muted, setMuted] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [userSpeaking, setUserSpeaking] = useState(false)
  const [readyToSpeak, setReadyToSpeak] = useState(false)
  const [timer, setTimer] = useState(0)
  const [currentLang, setCurrentLang] = useState("")
  const [langSelected, setLangSelected] = useState(false)
  const [recognitionKey, setRecognitionKey] = useState(0)
  const [history, setHistory] = useState([])
  const [policeStations, setPoliceStations] = useState([])
  const [userPos, setUserPos] = useState(null)
  const [showStations, setShowStations] = useState(false)
  const [selectedStation, setSelectedStation] = useState(null)
  const [phase, setPhase] = useState("init")
  const [callRequestLoading, setCallRequestLoading] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [advocates, setAdvocates] = useState([]);
  const [showAdvocates, setShowAdvocates] = useState(false);
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);
  const MAPS_EMBED_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  // Audio unlock for mobile devices
  useEffect(() => {
    const unlockAudio = () => {
      try {
        const buffer = new AudioContext().createBuffer(1, 1, 22050)
        const source = new AudioContext().createBufferSource()
        source.buffer = buffer
        source.connect(new AudioContext().destination)
        source.start(0)
      } catch (e) {
        console.log("Audio unlock failed:", e)
      }
      document.removeEventListener("touchend", unlockAudio, true)
      document.removeEventListener("click", unlockAudio, true)
    }
    document.addEventListener("touchend", unlockAudio, true)
    document.addEventListener("click", unlockAudio, true)
    return () => {
      document.removeEventListener("touchend", unlockAudio, true)
      document.removeEventListener("click", unlockAudio, true)
    }
  }, [])

  // Speech recognition setup
  useEffect(() => {
    if (!connected) return
    if (muted || speaking) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser. Use the latest Chrome.")
      return
    }
    const langToUse = currentLang && languages[currentLang] ? languages[currentLang].code : "hi-IN"
    const recognition = new SpeechRecognition()
    recognition.lang = langToUse
    recognition.continuous = true
    recognition.interimResults = false

    let stoppedByApp = false

    recognition.onresult = async (event) => {
      if (muted || speaking || apiCallInProgressRef.current) return

      setUserSpeaking(true)
      setReadyToSpeak(false)
      setTimeout(() => setUserSpeaking(false), 1200)
      recognition.stop()

      utteranceIdRef.current += 1
      const thisUtterance = utteranceIdRef.current
      const userSpeech = event.results[event.results.length - 1][0].transcript.toLowerCase().trim()

      // Handle voice context for file upload
      if (awaitingVoiceContext) {
        console.log("Voice context received:", userSpeech);
        setAwaitingVoiceContext(false);
        await handleFileAnalysis(userSpeech);
        return;
      }

      if (phase === "askLang") {
        let detectedLang = null
        Object.keys(languageKeywords).forEach((lang) => {
          languageKeywords[lang].forEach((keyword) => {
            if (userSpeech.includes(keyword)) {
              detectedLang = lang
            }
          })
        })
        if (detectedLang) {
          setCurrentLang(detectedLang)
          setLangSelected(true)
          setRecognitionKey((k) => k + 1)
          setHistory([])
          setPhase("normal")
          await speakText(languageGreetings[detectedLang], detectedLang)
          return
        } else {
          await speakText("कृपया अपनी पसंदीदा भाषा का नाम दोबारा बताएं। For example: Hindi, English, Tamil, etc.", "hindi")
          setRecognitionKey((k) => k + 1)
          return
        }
      }

      if (phase === "normal" && !apiCallInProgressRef.current) {
        apiCallInProgressRef.current = true
        setSpeaking(true)
        const newHistory = [...history, { role: "user", content: userSpeech }]
        setHistory(newHistory)
        try {
          const res = await fetch(`${backendBaseUrl}/ask-context`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              history: newHistory,
              language: currentLang,
            }),
          })
          if (!res.ok) throw new Error(`Server responded with ${res.status}`)
          const data = await res.json()
          if (utteranceIdRef.current === thisUtterance && apiCallInProgressRef.current) {
            setHistory((h) => [...h, { role: "assistant", content: data.reply }])
            await speakText(data.reply, currentLang)
            setRecognitionKey((k) => k + 1)
          }
        } catch (err) {
          console.error("API Error:", err)
          setSpeaking(false)
          setRecognitionKey((k) => k + 1)
        } finally {
          apiCallInProgressRef.current = false
        }
      }
    }

    recognition.onend = () => {
      if (connected && !muted && !stoppedByApp && !speaking) {
        try {
          recognition.start()
        } catch (e) {
          console.log("Recognition restart failed:", e)
        }
      }
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch (e) {
      console.log("Recognition start failed:", e)
    }

    return () => {
      stoppedByApp = true
      recognition.stop()
    }
  }, [connected, muted, recognitionKey, speaking, phase, currentLang, history, awaitingVoiceContext])

  // Timer setup
  useEffect(() => {
    if (connected) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000)
    } else {
      setTimer(0)
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [connected])

  // File upload handlers
  const handleFileSelected = (file) => {
    console.log("File selected:", file.name);
    setUploadedFile(file);
    
    // For images, show a preview; for PDFs, just show file name
    if (file.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(file.name);
    }
    
    setAwaitingVoiceContext(true);
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setFilePreview("");
    setAwaitingVoiceContext(false);
    setLoading(false);
  };

  // FIXED: This function now properly triggers voice recognition
  const handleStartVoiceContext = () => {
    console.log("Starting voice context collection...");
    
    // If not connected, connect first
    if (!connected) {
      setConnected(true);
      setMuted(false);
      setLangSelected(true); // Skip language selection for file context
      setCurrentLang("hindi"); // Default to Hindi
      setPhase("normal");
      setRecognitionKey((k) => k + 1);
    }
    
    // Ensure we're ready to listen
    setAwaitingVoiceContext(true);
    setMuted(false);
    setSpeaking(false);
    setReadyToSpeak(true);
    
    // Restart recognition to ensure it's listening
    setRecognitionKey((k) => k + 1);
    
    // Provide audio feedback
    const contextPrompt = currentLang === "hindi" 
      ? "कृपया अपनी दस्तावेज़ के बारे में चिंता बताएं"
      : "Please tell me your concern about this document";
    
    speakText(contextPrompt, currentLang || "hindi");
  };

  const handleFileAnalysis = async (contextText) => {
    console.log("Analyzing file with context:", contextText);
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("context", contextText);
      formData.append("language", currentLang || "hindi");

      const res = await fetch(`${backendBaseUrl}/upload-legal-file`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("File analysis response:", data);

      if (data.reply) {
        // Add to history
        setHistory((h) => [...h, 
          { role: "user", content: `Document uploaded: ${uploadedFile.name}. Context: ${contextText}` },
          { role: "assistant", content: data.reply }
        ]);
        
        // Speak the reply automatically
        await speakText(data.reply, currentLang || "hindi");
      }

      // Clear file after analysis
      handleClearFile();
      
    } catch (error) {
      console.error("File analysis error:", error);
      const errorMessage = currentLang === "hindi" 
        ? "दस्तावेज़ प्रोसेसिंग में त्रुटि हुई। कृपया दोबारा कोशिश करें।"
        : "Error processing document. Please try again.";
      
      await speakText(errorMessage, currentLang || "hindi");
      handleClearFile();
    } finally {
      setLoading(false);
    }
  };

  const handleMute = () => {
    setMuted((m) => !m)
    if (!muted) {
      recognitionRef.current?.stop()
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
      setSpeaking(false)
      setReadyToSpeak(false)
    } else {
      setRecognitionKey((k) => k + 1)
    }
  }

  const handleEnd = () => {
    setConnected(false)
    setMuted(false)
    setLangSelected(false)
    setCurrentLang("")
    setHistory([])
    setPoliceStations([])
    setUserPos(null)
    setShowStations(false)
    setSelectedStation(null)
    setPhase("init")
    setCallRequestLoading(false)
    setReadyToSpeak(false)
    // Clear file upload states
    handleClearFile()
    recognitionRef.current?.stop()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
    }
    setSpeaking(false)
    apiCallInProgressRef.current = false
  }

  const speakText = async (text, langKey = currentLang || "hindi") => {
    console.log("🎤 Starting speech:", text.substring(0, 50) + "...")

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
    }

    try {
      const res = await fetch(`${backendBaseUrl}/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: langKey }),
      })

      if (!res.ok) {
        throw new Error(`TTS request failed: ${res.status}`)
      }

      const blob = await res.blob()
      const audioUrl = URL.createObjectURL(blob)
      const audio = new window.Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setSpeaking(false)
        setReadyToSpeak(true)
      }
      audio.onerror = (e) => {
        console.error("Audio playback error:", e)
        setSpeaking(false)
        setReadyToSpeak(true)
      }

      setSpeaking(true)
      setReadyToSpeak(false)
      try {
        await audio.play()
      } catch (err) {
        console.error("Audio play failed:", err)
        alert("Please tap anywhere on the screen to enable audio, then try again.")
        setSpeaking(false)
        setReadyToSpeak(false)
      }
    } catch (error) {
      console.error("TTS error:", error)
      setSpeaking(false)
      setReadyToSpeak(false)
    }
  }

  const handleConnect = async () => {
    setConnected(true)
    setMuted(false)
    setLangSelected(false)
    setCurrentLang("")
    setRecognitionKey((k) => k + 1)
    setHistory([])
    setPoliceStations([])
    setUserPos(null)
    setSelectedStation(null)
    setPhase("askLang")
    await speakText(initialGreeting, "hindi")
    setRecognitionKey((k) => k + 1)
  }

  const handleNearbyPolice = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setUserPos({ lat: latitude, lng: longitude })
        try {
          const res = await fetch(`${backendBaseUrl}/nearby-police?lat=${latitude}&lng=${longitude}`)
          if (!res.ok) {
            throw new Error(`Failed to fetch police stations: ${res.status}`)
          }
          const data = await res.json()
          setPoliceStations(data.stations || [])
          setShowStations(true)
          setSelectedStation(null)
        } catch (e) {
          console.error("Police stations fetch error:", e)
          alert("Failed to fetch police stations. Please try again.")
        }
      },
      (err) => {
        console.error("Geolocation error:", err)
        alert("Location permission denied or unavailable")
      },
    )
  }


  const handleNearbyAdvocate = () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser")
    return
  }
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords
      try {
        const res = await fetch(`${backendBaseUrl}/nearby-advocate?lat=${latitude}&lng=${longitude}`)
        if (!res.ok) {
          throw new Error(`Failed to fetch advocates: ${res.status}`)
        }
        const data = await res.json()
        setAdvocates(data.advocates || [])
        setShowAdvocates(true)
        setSelectedAdvocate(null)
      } catch (e) {
        console.error("Advocates fetch error:", e)
        alert("Failed to fetch advocates. Please try again.")
      }
    },
    (err) => {
      console.error("Geolocation error:", err)
      alert("Location permission denied or unavailable")
    },
  )
}

  const handleRequestCall = () => {
    const savedPhone = localStorage.getItem("nyaygpt_user_phone")
    if (savedPhone) {
      setPhoneNumber(savedPhone)
    }
    setShowPhoneModal(true)
  }

  const submitCallRequest = async () => {
    if (callRequestLoading) return

    if (!phoneNumber.trim()) {
      alert("Please enter your phone number")
      return
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ""))) {
      alert("Please enter a valid phone number with country code")
      return
    }

    setCallRequestLoading(true)

    try {
      localStorage.setItem("nyaygpt_user_phone", phoneNumber)

      const requestBody = {
        phone: phoneNumber.replace(/\s+/g, ""),
        topic: "Legal Help",
        language: currentLang || "hindi",
      }

      const res = await fetch(`${backendBaseUrl}/request-call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const responseText = await res.text()

      if (res.ok) {
        alert("✅ Call request sent successfully. You should receive a call shortly.")
        setShowPhoneModal(false)
      } else {
        console.error("Call request failed:", res.status, responseText)
        alert(`❌ Call request failed: ${responseText || "Unknown error"}. Please try again.`)
      }
    } catch (error) {
      console.error("Call request error:", error)
      alert("❌ Network error. Please check your connection and try again.")
    } finally {
      setCallRequestLoading(false)
    }
  }

  const formatTime = (sec) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`



  


  const [user, setUser] = useState(null);
  // const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };
    const [menuOpen, setMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

const styles = {
    nav: {
      background: "rgba(17, 24, 39, 0.85)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      padding: "1.2rem 2rem",
      boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
      position: "relative",
      zIndex: 10,
      width: "100%",
    },
    container: {
      maxWidth: "64rem",
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: "3.5rem",
    },
    logoWrapper: {
      display: "flex",
      alignItems: "center",
      gap: "0.85rem",
      height: "3rem",
    },
    logoImg: {
      width: "3rem",
      height: "3rem",
      borderRadius: "0.5rem",
      objectFit: "contain",
      backgroundColor: "#000",
    },
    logoText: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      letterSpacing: "0.01em",
      color: "#fff",
      margin: 0,
    },
    right: {
      display: "flex",
      alignItems: "center",
      gap: "1.2rem",
    },
    hamburger: {
      display: isMobile ? "flex" : "none",
      flexDirection: "column",
      cursor: "pointer",
      gap: "5px",
      marginLeft: "auto",
    },
    bar: {
      width: "25px",
      height: "3px",
      backgroundColor: "#fff",
      borderRadius: "2px",
    },
    desktopMenu: {
      display: isMobile ? "none" : "flex",
      alignItems: "center",
      gap: "1rem",
    },
    mobileMenu: {
      display: menuOpen ? "flex" : "none",
      flexDirection: "column",
      position: "absolute",
      top: "100%",
      right: "2rem",
      background: "rgba(17,24,39,0.97)",
      borderRadius: "1rem",
      padding: "0.75rem 1.5rem",
      zIndex: 25,
      marginTop: "0.5rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
      minWidth: "180px",
    },
    authButtons: {
      display: "flex",
      gap: "1rem",
      flexDirection: isMobile ? "column" : "row",
    },
    loginBtn: {
      background: "rgba(99,102,241,0.18)",
      color: "#fff",
      border: "1.5px solid rgba(99,102,241,0.25)",
      borderRadius: "1rem",
      padding: "0.6rem 1.5rem",
      fontWeight: 700,
      fontSize: "1rem",
      backdropFilter: "blur(12px)",
      cursor: "pointer",
    },
    signupBtn: {
      background: "rgba(16,185,129,0.18)",
      color: "#fff",
      border: "1.5px solid rgba(16,185,129,0.25)",
      borderRadius: "1rem",
      padding: "0.6rem 1.5rem",
      fontWeight: 700,
      fontSize: "1rem",
      backdropFilter: "blur(12px)",
      cursor: "pointer",
    },
    statusBox: {
      fontSize: "0.95rem",
      color: "rgba(255,255,255,0.88)",
      background: "rgba(255,255,255,0.10)",
      padding: "0.5rem 1.25rem",
      borderRadius: "1rem",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.10)",
      fontWeight: 500,
      marginBottom: "0.75rem",
      marginTop: isMobile ? "1rem" : "0",
      width: isMobile ? "90%" : "auto",
      marginLeft: isMobile ? "auto" : 0,
      marginRight: isMobile ? "auto" : 0,
      textAlign: "center",
      display: "block",
    },
    userDropdownTrigger: {
      color: "#fff",
      fontWeight: "bold",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    dropdown: {
      position: "absolute",
      top: "100%",
      right: 0,
      background: "rgba(255,255,255,0.1)",
      borderRadius: "0.5rem",
      marginTop: "0.5rem",
      padding: "0.5rem 1rem",
      zIndex: 20,
    },
    logoutBtn: {
      background: "rgba(239,68,68,0.18)",
      color: "#fff",
      border: "1.5px solid rgba(239,68,68,0.28)",
      borderRadius: "0.5rem",
      padding: "0.5rem 1rem",
      fontWeight: 600,
      cursor: "pointer",
      backdropFilter: "blur(10px)",
    },
    menu: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  menuOpen: {
    flexDirection: "column",
    width: "100%",
    paddingTop: "1rem",
    display: "flex",
  },
  };

// 🔁 Media query styles for mobile hamburger menu
if (typeof window !== "undefined") {
  const mediaQuery = window.matchMedia("(max-width: 768px)");
  if (mediaQuery.matches) {
    styles.menu.display = "none";
    styles.hamburger.display = "flex";
    styles.menuOpen.display = "flex";
  }
}

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)`,
          pointerEvents: "none",
        }}
      />

      {/* Glassmorphism Navbar */}
<>
      <nav style={styles.nav}>
        <div style={styles.container}>
          {/* Left: Logo + Title */}
          <div style={styles.logoWrapper}>
            <img src="/image.png" alt="Logo" style={styles.logoImg} />
            <h1 style={styles.logoText}>Chanakya AI</h1>
          </div>

          {/* Center: Status (desktop only) */}
          {!isMobile && (
            <div style={styles.statusBox}>
              {connected ? `Connected • ${formatTime(timer)}` : "Ready to Connect"}
            </div>
          )}

          {/* Right: Hamburger (mobile) or Auth menu (desktop) */}
          <div style={styles.right}>
            {/* Hamburger (mobile only) */}
            <div
              className="hamburger"
              onClick={() => setMenuOpen((prev) => !prev)}
              style={styles.hamburger}
              aria-label="Open menu"
            >
              <div style={styles.bar}></div>
              <div style={styles.bar}></div>
              <div style={styles.bar}></div>
            </div>

            {/* Desktop Auth Menu */}
            <div className="authMenu" style={styles.desktopMenu}>
              {user ? (
                <div style={{ position: "relative" }}>
                  <div
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={styles.userDropdownTrigger}
                  >
                    👤 {user.name}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {menuOpen && (
                    <div style={styles.dropdown}>
                      <button onClick={handleLogout} style={styles.logoutBtn}>
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={styles.authButtons}>
                  <Link to="/login" style={{ textDecoration: "none" }}>
                    <button style={styles.loginBtn}>Login</button>
                  </Link>
                  <Link to="/signup" style={{ textDecoration: "none" }}>
                    <button style={styles.signupBtn}>Sign Up</button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Auth Menu */}
            {isMobile && menuOpen && (
  <div style={styles.mobileMenu}>
    {user ? (
      <>
        <div
          style={{
            color: "#fff",
            fontWeight: 600,
            padding: "0.5rem 1rem",
            marginBottom: "0.25rem",
            textAlign: "center",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          👤 {user.name}
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 Logout
        </button>
      </>
    ) : (
      <div style={styles.authButtons}>
        <Link to="/login" style={{ textDecoration: "none" }}>
          <button style={styles.loginBtn}>Login</button>
        </Link>
        <Link to="/signup" style={{ textDecoration: "none" }}>
          <button style={styles.signupBtn}>Sign Up</button>
        </Link>
      </div>
    )}
  </div>
)}
          </div>
        </div>
      </nav>

      {/* Status: mobile below nav */}
      {isMobile && (
        <div style={styles.statusBox}>
          {connected ? `Connected • ${formatTime(timer)}` : "Ready to Connect"}
        </div>
      )}
    </>

      
      {/* Main Content */}
      <div
        style={{
          flex: "1",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1.5rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ width: "100%", maxWidth: "28rem", margin: "0 auto" }}>
          {/* Glassmorphism Status Card */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "4.5rem",
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
              borderRadius: "1.5rem",
              padding: "1.5rem",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div style={{ fontSize: "1.125rem", color: "#ffffff", marginBottom: "0.5rem", fontWeight: "600" }}>
              {connected ? "Connected - Ready to Help" : "Your AI Legal Assistant"}
            </div>
            <div style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.7)" }}>
              {speaking && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <FaVolumeUp style={{ color: "#60a5fa" }} />
                  <span>Chanakya AI is speaking...</span>
                </div>
              )}
              {userSpeaking && "👂 Listening..."}
              {awaitingVoiceContext && "🎤 Tell me about your legal concern with this document"}
              {!speaking && !userSpeaking && !readyToSpeak && !awaitingVoiceContext && connected && "Ready for your question"}
              {!connected && "Tap the microphone to start"}
            </div>
          </div>

          {/* File Upload Component */}
          <FileUpload 
            onFileSelected={handleFileSelected}
            uploadedFile={uploadedFile}
            filePreview={filePreview}
            loading={loading}
            onClearFile={handleClearFile}
            awaitingVoiceContext={awaitingVoiceContext}
            onStartVoiceContext={handleStartVoiceContext}
          />

          {/* Main Microphone */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "3rem" }}>
            <div style={{ position: "relative" }}>
              {/* Microphone Button */}
              <button
                onClick={connected ? handleEnd : handleConnect}
                style={{
                  width: "8rem",
                  height: "8rem",
                  borderRadius: "50%",
                  border: readyToSpeak ? "3px solid rgba(248, 113, 113, 0.8)" : "3px solid rgba(255, 255, 255, 0.2)",
                  background: readyToSpeak
                    ? "linear-gradient(135deg, rgba(220, 38, 38, 0.8) 0%, rgba(239, 68, 68, 0.6) 100%)"
                    : "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: readyToSpeak
                    ? "0 0 40px rgba(248, 113, 113, 0.4), 0 8px 32px rgba(0, 0, 0, 0.3)"
                    : "0 8px 32px rgba(0, 0, 0, 0.3)",
                }}
                onMouseEnter={(e) => {
                  if (!readyToSpeak) {
                    e.target.style.background = "rgba(255, 255, 255, 0.15)"
                    e.target.style.transform = "scale(1.05)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!readyToSpeak) {
                    e.target.style.background = "rgba(255, 255, 255, 0.1)"
                    e.target.style.transform = "scale(1)"
                  }
                }}
              >
                {connected ? (
                  userSpeaking ? (
                    <FaMicrophone
                      style={{
                        width: "3rem",
                        height: "3rem",
                        color: "#ffffff",
                        filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                      }}
                    />
                  ) : (
                    <FaMicrophoneSlash
                      style={{
                        width: "3rem",
                        height: "3rem",
                        color: "#ffffff",
                        filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                      }}
                    />
                  )
                ) : (
                  <FaMicrophone
                    style={{
                      width: "3rem",
                      height: "3rem",
                      color: "#ffffff",
                      filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                    }}
                  />
                )}
              </button>

              {/* Speaking Animation Waves */}
              {speaking && (
                <div
                  style={{
                    position: "absolute",
                    inset: "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        width: "8rem",
                        height: "8rem",
                        border: "2px solid rgba(96, 165, 250, 0.6)",
                        borderRadius: "50%",
                        animation: "ping 2s infinite",
                        animationDelay: `${i * 0.5}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Red Pulse when ready to speak */}
              {readyToSpeak && (
                <div
                  style={{
                    position: "absolute",
                    inset: "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      width: "9rem",
                      height: "9rem",
                      border: "2px solid rgba(248, 113, 113, 0.8)",
                      borderRadius: "50%",
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Text */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            {connected ? (
              userSpeaking ? (
                <p style={{ color: "#f87171", fontWeight: "500", margin: 0 }}>
                  <FaMicrophone style={{ marginRight: "0.5rem" }} />
                  Speak now...
                </p>
              ) : speaking ? (
                <p style={{ color: "#60a5fa", fontWeight: "500", margin: 0 }}>
                  {/* <FaVolumeUp style={{ marginRight: "0.5rem" }} /> */}
                  Chanakya AI is speaking...
                </p>
              ) : readyToSpeak ? (
                <p
                  style={{
                    color: "#f87171",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    margin: 0,
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <FaMicrophone style={{ color: "#f87171" }} />
                  SPEAK NOW
                </p>
              ) : awaitingVoiceContext ? (
                <p style={{ color: "#60a5fa", fontWeight: "500", margin: 0 }}>
                  Tell me about your legal concern with this document
                </p>
              ) : (
                <p style={{ color: "rgba(255, 255, 255, 0.8)", margin: 0 }}>Ask your legal question</p>
              )
            ) : (
              <p style={{ color: "rgba(255, 255, 255, 0.8)", margin: 0 }}>Tell your legal issue</p>
            )}
          </div>

          {/* Glassmorphism Control Buttons */}
          {!connected ? (
            <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem" }}>
              <button
                onClick={handleNearbyPolice}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "1rem",
                  transition: "all 0.3s ease",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.15)"
                  e.target.style.transform = "translateY(-2px)"
                  e.target.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.3)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.1)"
                  e.target.style.transform = "translateY(0)"
                  e.target.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.2)"
                }}
              >
                <FaMapMarkerAlt
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    color: "#60a5fa",
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                  }}
                />
                <span style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.9)", fontWeight: "500" }}>
                  Nearby Police
                </span>
              </button>

              <button
                onClick={handleRequestCall}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "1rem",
                  transition: "all 0.3s ease",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.15)"
                  e.target.style.transform = "translateY(-2px)"
                  e.target.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.3)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.1)"
                  e.target.style.transform = "translateY(0)"
                  e.target.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.2)"
                }}
              >
                <FaPhone
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    color: "#10b981",
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                  }}
                />
                <span style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.9)", fontWeight: "500" }}>
                  Request Call
                </span>
              </button>

              <button
  onClick={handleNearbyAdvocate}
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    padding: "1rem",
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px)",
    borderRadius: "1rem",
    transition: "all 0.3s ease",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    cursor: "pointer",
    outline: "none",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  }}
>
  <FaMapMarkerAlt
    style={{
      width: "1.5rem",
      height: "1.5rem",
      color: "#fbbf24", // use a different color to distinguish
      filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
    }}
  />
  <span style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.9)", fontWeight: "500" }}>
    Nearby Advocate
  </span>
</button>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", gap: "2rem" }}>
              <button
                onClick={handleMute}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem",
                  borderRadius: "1rem",
                  transition: "all 0.3s ease",
                  background: muted
                    ? "linear-gradient(135deg, rgba(220, 38, 38, 0.8) 0%, rgba(239, 68, 68, 0.6) 100%)"
                    : "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px)",
                  border: muted ? "1px solid rgba(248, 113, 113, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)"
                  e.target.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.3)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)"
                  e.target.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.2)"
                }}
              >
                {muted ? (
                  <FaMicrophoneSlash
                    style={{
                      width: "1.5rem",
                      height: "1.5rem",
                      color: "#ffffff",
                      filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                    }}
                  />
                ) : (
                  <FaMicrophone
                    style={{
                      width: "1.5rem",
                      height: "1.5rem",
                      color: "#ffffff",
                      filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                    }}
                  />
                )}
                <span style={{ fontSize: "0.875rem", color: "#ffffff", fontWeight: "500" }}>
                  {muted ? "Unmute" : "Mute"}
                </span>
              </button>

              <button
                onClick={handleNearbyPolice}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "1rem",
                  transition: "all 0.3s ease",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.15)"
                  e.target.style.transform = "translateY(-2px)"
                  e.target.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.3)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.1)"
                  e.target.style.transform = "translateY(0)"
                  e.target.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.2)"
                }}
              >
                <FaMapMarkerAlt
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    color: "#60a5fa",
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                  }}
                />
                <span style={{ fontSize: "0.875rem", color: "#ffffff", fontWeight: "500" }}>Police</span>
              </button>

              <button
                onClick={handleEnd}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem",
                  background: "linear-gradient(135deg, rgba(220, 38, 38, 0.8) 0%, rgba(239, 68, 68, 0.6) 100%)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "1rem",
                  transition: "all 0.3s ease",
                  border: "1px solid rgba(248, 113, 113, 0.3)",
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: "0 8px 32px rgba(220, 38, 38, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background =
                    "linear-gradient(135deg, rgba(185, 28, 28, 0.9) 0%, rgba(220, 38, 38, 0.7) 100%)"
                  e.target.style.transform = "translateY(-2px)"
                  e.target.style.boxShadow = "0 12px 40px rgba(220, 38, 38, 0.4)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.background =
                    "linear-gradient(135deg, rgba(220, 38, 38, 0.8) 0%, rgba(239, 68, 68, 0.6) 100%)"
                  e.target.style.transform = "translateY(0)"
                  e.target.style.boxShadow = "0 8px 32px rgba(220, 38, 38, 0.3)"
                }}
              >
                <FaPhone
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    color: "#ffffff",
                    transform: "rotate(225deg)",
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                  }}
                />
                <span style={{ fontSize: "0.875rem", color: "#ffffff", fontWeight: "500" }}>End</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Glassmorphism Phone Number Modal */}
      {showPhoneModal && (
        <div
          style={{
            position: "fixed",
            inset: "0",
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: "50",
          }}
        >
          <div
            style={{
              background: "rgba(17, 24, 39, 0.9)",
              backdropFilter: "blur(30px)",
              borderRadius: "1.5rem",
              padding: "2rem",
              width: "100%",
              maxWidth: "24rem",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
              }}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#ffffff", margin: 0 }}>Request Call</h3>
              <button
                onClick={() => setShowPhoneModal(false)}
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  outline: "none",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#ffffff"
                  e.target.style.background = "rgba(255, 255, 255, 0.1)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "rgba(255, 255, 255, 0.6)"
                  e.target.style.background = "transparent"
                }}
              >
                <FaTimes style={{ width: "1.25rem", height: "1.25rem" }} />
              </button>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  color: "rgba(255, 255, 255, 0.8)",
                  marginBottom: "0.5rem",
                }}
              >
                Phone Number (with country code)
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "0.75rem",
                  color: "#ffffff",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "all 0.3s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(96, 165, 250, 0.5)"
                  e.target.style.background = "rgba(255, 255, 255, 0.15)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.2)"
                  e.target.style.background = "rgba(255, 255, 255, 0.1)"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => setShowPhoneModal(false)}
                style={{
                  flex: "1",
                  padding: "0.75rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "0.75rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  outline: "none",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.15)"
                  e.target.style.transform = "translateY(-1px)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.1)"
                  e.target.style.transform = "translateY(0)"
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitCallRequest}
                disabled={callRequestLoading}
                style={{
                  flex: "1",
                  padding: "0.75rem",
                  background: callRequestLoading
                    ? "rgba(75, 85, 99, 0.8)"
                    : "linear-gradient(135deg, rgba(16, 185, 129, 0.8) 0%, rgba(5, 150, 105, 0.9) 100%)",
                  backdropFilter: "blur(10px)",
                  color: "#ffffff",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "0.75rem",
                  cursor: callRequestLoading ? "not-allowed" : "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  outline: "none",
                  opacity: callRequestLoading ? 0.6 : 1,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!callRequestLoading) {
                    e.target.style.background =
                      "linear-gradient(135deg, rgba(5, 150, 105, 0.9) 0%, rgba(4, 120, 87, 1) 100%)"
                    e.target.style.transform = "translateY(-1px)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!callRequestLoading) {
                    e.target.style.background =
                      "linear-gradient(135deg, rgba(16, 185, 129, 0.8) 0%, rgba(5, 150, 105, 0.9) 100%)"
                    e.target.style.transform = "translateY(0)"
                  }
                }}
              >
                {callRequestLoading ? "Requesting..." : "Request Call"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Glassmorphism Police Stations Modal */}
      {showStations && (
        <div
          style={{
            position: "fixed",
            inset: "0",
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: "50",
          }}
        >
          <div
            style={{
              background: "rgba(17, 24, 39, 0.9)",
              backdropFilter: "blur(30px)",
              borderRadius: "1.5rem",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "28rem",
              maxHeight: "24rem",
              overflowY: "auto",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#ffffff", margin: 0 }}>
                Nearby Police Stations
              </h3>
              <button
                onClick={() => {
                  setShowStations(false)
                  setSelectedStation(null)
                }}
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  outline: "none",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#ffffff"
                  e.target.style.background = "rgba(255, 255, 255, 0.1)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "rgba(255, 255, 255, 0.6)"
                  e.target.style.background = "transparent"
                }}
              >
                <FaTimes style={{ width: "1.25rem", height: "1.25rem" }} />
              </button>
            </div>

            {policeStations.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {policeStations.map((station, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedStation(station)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "0.75rem",
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      borderRadius: "0.75rem",
                      transition: "all 0.3s ease",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      cursor: "pointer",
                      outline: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(255, 255, 255, 0.1)"
                      e.target.style.transform = "translateY(-1px)"
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(255, 255, 255, 0.05)"
                      e.target.style.transform = "translateY(0)"
                    }}
                  >
                    <div style={{ fontWeight: "500", color: "#ffffff", marginBottom: "0.25rem" }}>{station.name}</div>
                    <div style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.7)" }}>{station.vicinity}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "rgba(255, 255, 255, 0.6)", padding: "2rem 0" }}>
                No nearby police stations found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Glassmorphism Directions Modal */}
      {selectedStation && userPos && (
        <div
          style={{
            position: "fixed",
            inset: "0",
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: "50",
          }}
        >
          <div
            style={{
              background: "rgba(17, 24, 39, 0.9)",
              backdropFilter: "blur(30px)",
              borderRadius: "1.5rem",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "48rem",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#ffffff", margin: 0 }}>
                Directions to <span style={{ color: "#60a5fa" }}>{selectedStation.name}</span>
              </h3>
              <button
                onClick={() => setSelectedStation(null)}
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  outline: "none",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#ffffff"
                  e.target.style.background = "rgba(255, 255, 255, 0.1)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "rgba(255, 255, 255, 0.6)"
                  e.target.style.background = "transparent"
                }}
              >
                <FaTimes style={{ width: "1.25rem", height: "1.25rem" }} />
              </button>
            </div>

            {MAPS_EMBED_API_KEY ? (
              <iframe
                width="100%"
                height="400"
                frameBorder="0"
                style={{ border: 0, borderRadius: "1rem" }}
                allowFullScreen
                loading="lazy"
                src={`https://www.google.com/maps/embed/v1/directions?key=${MAPS_EMBED_API_KEY}&origin=${userPos.lat},${userPos.lng}&destination=${selectedStation.lat},${selectedStation.lng}&mode=driving`}
                title="Directions Map"
              />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: "#f87171",
                  padding: "2rem 0",
                  background: "rgba(248, 113, 113, 0.1)",
                  borderRadius: "1rem",
                  border: "1px solid rgba(248, 113, 113, 0.2)",
                }}
              >
                API Key missing. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables.
              </div>
            )}
          </div>
        </div>
      )}

      <div>


      {/* Glassmorphism Advocates Modal */}
{showAdvocates && (
        <div
          style={{
            position: "fixed",
            inset: "0",
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: "50",
          }}
        >
          <div
            style={{
              background: "rgba(17,24,39,0.9)",
              borderRadius: "1.5rem",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "28rem",
              maxHeight: "24rem",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, color: "#fff" }}>Nearby Advocates</h3>
              <button
                onClick={() => {
                  setShowAdvocates(false);
                  setSelectedAdvocate(null);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  fontSize: "1.25rem",
                }}
              >
                <FaTimes />
              </button>
            </div>
            {advocates.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {advocates.map((advocate, i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "0.75rem",
                      padding: "0.75rem",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (userPos && advocate.lat && advocate.lng) {
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&origin=${userPos.lat},${userPos.lng}&destination=${advocate.lat},${advocate.lng}&travelmode=driving`,
                          "_blank"
                        );
                      }
                    }}
                  >
                    <div style={{ fontWeight: "500", color: "#fff" }}>{advocate.name}</div>
                    <div style={{ fontSize: "0.875rem", color: "#ccc" }}>{advocate.vicinity}</div>
                    <div style={{ fontSize: "0.85rem", color: "#a7f3d0" }}>
                      📞 {advocate.phone && advocate.phone !== "Not available"
                        ? (
                          <a
                            href={`tel:${advocate.phone.replace(/[^0-9+]/g, '')}`}
                            style={{ color: "#34d399", textDecoration: "underline", fontWeight: 600 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {advocate.phone}
                          </a>
                        )
                        : "Not available"}
                    </div>
                    <div style={{ marginTop: "0.5rem" }}>
                      <button
                        style={{
                          background: "#fbbf24",
                          color: "#2d2d2d",
                          borderRadius: "0.5rem",
                          padding: "0.25rem 0.75rem",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          border: "none",
                          cursor: "pointer"
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAdvocate(advocate);
                        }}
                      >
                        Tap for Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "#aaa", padding: "2rem 0" }}>
                No nearby advocates found.
              </div>
            )}
          </div>
        </div>
      )}

      {selectedAdvocate && (
        <div
          style={{
            position: "fixed",
            inset: "0",
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "60",
          }}
          onClick={() => setSelectedAdvocate(null)}
        >
          <div
            style={{
              background: "#1f2937",
              borderRadius: "1rem",
              padding: "1.5rem",
              width: "98%",
              maxWidth: "500px",
              color: "#fff",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h4 style={{ margin: 0 }}>{selectedAdvocate.name}</h4>
              <button
                onClick={() => setSelectedAdvocate(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  fontSize: "1.25rem",
                  paddinf: "0.5rem"
                }}
              >
                <FaTimes />
              </button>
            </div>
            <p style={{ margin: "0 0 0.5rem" }}>
              📍 <strong>Address:</strong> {selectedAdvocate.vicinity}
            </p>
            <p style={{ margin: "0 0 1rem" }}>
  📞 <strong>Phone:</strong>{" "}
  {selectedAdvocate.phone && selectedAdvocate.phone !== "Not available"
    ? (
      <a
        href={`tel:${selectedAdvocate.phone.replace(/[^0-9+]/g, '')}`}
        style={{
          color: "#34d399",
          textDecoration: "underline",
          fontWeight: "600",
          cursor: "pointer",
        }}
        onClick={(e) => {
          e.stopPropagation(); // prevent closing modal
        }}
      >
        {selectedAdvocate.phone}
      </a>
    )
    : "Not available"}
</p>


            {MAPS_EMBED_API_KEY && (
              <img
                src={`https://maps.googleapis.com/maps/api/staticmap?center=${selectedAdvocate.lat},${selectedAdvocate.lng}&zoom=17&size=1000x700&markers=color:red%7C${selectedAdvocate.lat},${selectedAdvocate.lng}&key=${MAPS_EMBED_API_KEY}`}
                alt="Map preview"
                style={{
                  borderRadius: "0.5rem",
                  width: "100%",
                  marginBottom: "1rem",
                  display: "block"
                }}
              />
            )}

            <button
              style={{
                background: "#fbbf24",
                color: "#2d2d2d",
                borderRadius: "0.5rem",
                padding: "0.5rem 1rem",
                fontWeight: 600,
                fontSize: "0.9rem",
                border: "none",
                cursor: "pointer",
                width: "100%",
              }}
              onClick={() => {
                if (selectedAdvocate.lat && selectedAdvocate.lng) {
                  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAdvocate.name + ', ' + selectedAdvocate.vicinity)}`, '_blank');
                }
              }}
            >
              Open Directions in Google Maps
            </button>
          </div>
        </div>
      )}
      {/* Fixed WhatsApp Button */}
      <div
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: "60",
        }}
      >
        <div style={{ position: "relative", display: "inline-block" }}>
          <a
            href="https://wa.me/ais/1435183977724162?s=5"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "3.5rem",
              height: "3.5rem",
              backgroundColor: "#25D366",
              borderRadius: "50%",
              boxShadow: "0 4px 20px rgba(37, 211, 102, 0.4), 0 8px 32px rgba(0, 0, 0, 0.3)",
              transition: "all 0.3s ease",
              textDecoration: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.1)"
              e.target.style.boxShadow = "0 6px 25px rgba(37, 211, 102, 0.6), 0 12px 40px rgba(0, 0, 0, 0.4)"
              // Show tooltip
              const tooltip = e.target.nextElementSibling
              if (tooltip) {
                tooltip.style.opacity = "1"
                tooltip.style.visibility = "visible"
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)"
              e.target.style.boxShadow = "0 4px 20px rgba(37, 211, 102, 0.4), 0 8px 32px rgba(0, 0, 0, 0.3)"
              // Hide tooltip
              const tooltip = e.target.nextElementSibling
              if (tooltip) {
                tooltip.style.opacity = "0"
                tooltip.style.visibility = "hidden"
              }
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.106" />
            </svg>
          </a>

          {/* Tooltip */}
          <div
            style={{
              position: "absolute",
              bottom: "4rem",
              right: "0",
              backgroundColor: "rgba(17, 24, 39, 0.95)",
              backdropFilter: "blur(20px)",
              color: "white",
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              whiteSpace: "nowrap",
              opacity: "0",
              visibility: "hidden",
              transition: "all 0.3s ease",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              zIndex: "70",
            }}
          >
            Ask your legal query on WhatsApp
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: "1rem",
                width: "0",
                height: "0",
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "6px solid rgba(17, 24, 39, 0.95)",
              }}
            />
          </div>
        </div>
      </div>
    </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}