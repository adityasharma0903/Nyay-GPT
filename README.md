# Nyay-GPT

Nyay-GPT is an AI-powered legal chatbot platform designed to provide intelligent legal assistance, case law retrieval, and conversational analysis using state-of-the-art LLMs (Large Language Models). Built with React and Vite for a fast, modern web experience.

---

## Features

- **Legal Chatbot:** Get answers to legal queries in conversational language.
- **Case Law Retrieval:** Search and fetch relevant Indian case laws and legal documents.
- **User Authentication:** Secure login/signup with support for Google and email/password (Firebase Auth).
- **Chat History:** Save and review your previous legal conversations.
- **Modern UI:** Sleek, responsive interface built with React, Tailwind CSS, and glassmorphism themes.
- **AI Integration:** Uses OpenAI/Groq/Omni-DIM APIs for legal reasoning and document analysis.
- **Admin & Analytics:** (Optional) Role-based access and usage analytics.
- **Extensible:** Easily add new features or plug in other LLM providers.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/adityasharma0903/Nyay-GPT.git
cd Nyay-GPT
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your own API keys, Firebase config, etc.

```bash
cp .env.example .env
```

**Required environment variables:**
- Firebase config (see Firebase Console)
- MongoDB URI (for backend user/profile storage, optional)
- OpenAI/Groq API key
- Session secret

### 4. Start the App

For local development:

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

---

## Folder Structure

```
.
├── public/         # Static assets
├── src/            # React source code
│   ├── components/ # Reusable components (Chat, AuthForm, Sidebar, etc.)
│   ├── pages/      # Main page components
│   ├── lib/        # Firebase and utility libraries
│   └── ...
├── server/         # (Optional) Express/Firebase backend
├── .env.example    # Example environment variables
└── README.md
```

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend (optional):** Node.js, Express, Firebase Admin, MongoDB
- **Authentication:** Firebase Auth (email/password & Google)
- **AI Providers:** OpenAI, Groq, Omni-DIM (configurable)
- **Database:** Firestore, MongoDB (for chat history, user profiles)

---

## Contributing

Contributions are welcome! Please open issues and PRs.

1. Fork the repo.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request.

---

## License

MIT License.

---

## Credits

- Built by [Aditya Sharma , Lakshya Chauhan , Vaibhav Katyal , Vaibhav Pandey](https://github.com/adityasharma0903) and contributors.
- Powered by OpenAI, Google Cloud, and Firebase.
---

## Disclaimer

Nyay-GPT is for informational purposes only and does not constitute legal advice.
