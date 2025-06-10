from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
from dotenv import load_dotenv 
import openai

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY not set in .env file!")

app = FastAPI(title="Legal Assistant API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = openai.OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

MODEL_NAME = "llama3-70b-8192"

@app.get("/")
async def root():
    return {
        "message": "Legal Assistant API is running!",
        "status": "healthy",
        "endpoints": {
            "legal_advice": "POST /legal_advice",
            "docs": "GET /docs",
            "health": "GET /health"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is working fine!"}

@app.post("/legal_advice")
async def legal_advice(request: Request):
    try:
        data = await request.json()
        question = data.get("question")
        language = data.get("language", "hi")
        # Always ensure session_id is non-null and unique per user
        session_id = data.get("session_id") or str(uuid.uuid4())
        history = data.get("history", [])

        print(f"Received question: {question}")
        print(f"Language: {language}")
        print(f"Session ID: {session_id}")
        print(f"History length: {len(history)}")

        # If no question (blank or None), send greeting and session_id
        if not question or question.strip() == "":
            greeting = (
                "नमस्ते! मैं एक फ्रेंडली लीगल असिस्टेंट हूँ। "
                "क्या मैं आपकी किसी मदद कर सकता हूँ?\n"
                "Which language do you want to use? हिंदी या English?"
            )
            return {"advice": greeting, "session_id": session_id}

        # Context-aware system prompt!
        system_prompt = (
            "You are an expert legal assistant for Indian law. "
            "Your job is to help users with their legal queries in a friendly, empathetic, and context-aware manner. "
            "Always use the conversation history to understand the user's problem and answer in a contextual, continuous way. "
            "If the user asks things like 'do you know my problem', 'what did I say earlier', or refers to 'my issue', "
            "refer to what the user said previously in this session and summarize it if needed. "
            "Be empathetic and provide practical steps when possible. "
            "Always reply in the user-selected language."
        )

        # Prepare messages for multi-turn (history)
        messages = [{"role": "system", "content": system_prompt}]
        if history and isinstance(history, list):
            messages += history
        messages.append({"role": "user", "content": question})

        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=0.7,
            max_tokens=1024
        )

        answer = response.choices[0].message.content
        print(f"Generated answer: {answer[:100]}...")

        return {"advice": answer, "session_id": session_id}

    except Exception as e:
        error_message = f"Server error: {str(e)}"
        print(f"Error: {error_message}")
        # Make sure session_id is still returned, even on error
        session_id = locals().get("session_id", str(uuid.uuid4()))
        return {"advice": error_message, "session_id": session_id}

@app.post("/test")
async def test_endpoint(request: Request):
    try:
        data = await request.json()
        return {
            "received_data": data,
            "status": "success",
            "message": "Test endpoint working!"
        }
    except Exception as e:
        return {"error": str(e)}
    

    # ... (keep everything else above the same)

@app.post("/legal_advice")
async def legal_advice(request: Request):
    try:
        data = await request.json()
        question = data.get("question")
        language = data.get("language", "hi")
        session_id = data.get("session_id") or str(uuid.uuid4())
        history = data.get("history", [])

        print(f"Received question: {question}")
        print(f"Language: {language}")
        print(f"Session ID: {session_id}")
        print(f"History length: {len(history)}")

        if not question or question.strip() == "":
            greeting = (
                "नमस्ते! मैं एक फ्रेंडली लीगल असिस्टेंट हूँ। "
                "क्या मैं आपकी किसी मदद कर सकता हूँ?\n"
                "Which language do you want to use? हिंदी या English?"
            )
            return {"advice": greeting, "session_id": session_id}

        # ---- STRONGER CONTEXT-FORCING PROMPT ----
        system_prompt = (
            "You are an expert legal assistant for Indian law. "
            "Your job is to help users with their legal queries in a friendly, empathetic, and context-aware manner. "
            "ALWAYS carefully use the conversation history to understand the user's problem. "
            "If the user asks questions like 'क्या आप मेरी समस्या जानते हैं', 'Do you know my problem', 'मुझे क्या बताया था', 'What did I tell you', etc., "
            "then refer back to what the user said earlier in this session and repeat or summarize their main problem or question as needed. "
            "If the user’s latest message is unclear, infer their situation from the conversation so far and politely ask for more details if required. "
            "NEVER say you don't know the user's problem if they have already described it earlier in this conversation. "
            "Always reply in the user-selected language (Hindi or English). "
            "Be empathetic, helpful, and provide practical steps or follow-up questions."
        )

        messages = [{"role": "system", "content": system_prompt}]
        if history and isinstance(history, list):
            messages += history
        messages.append({"role": "user", "content": question})

        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=0.7,
            max_tokens=1024
        )

        answer = response.choices[0].message.content
        print(f"Generated answer: {answer[:100]}...")

        return {"advice": answer, "session_id": session_id}

    except Exception as e:
        error_message = f"Server error: {str(e)}"
        print(f"Error: {error_message}")
        session_id = locals().get("session_id", str(uuid.uuid4()))
        return {"advice": error_message, "session_id": session_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


