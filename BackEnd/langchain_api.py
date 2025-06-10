from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI  # CHANGE HERE

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY not set in .env file!")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# USE OpenAI MODEL (e.g., "gpt-3.5-turbo" or "gpt-4o")
llm = ChatOpenAI(model_name="gpt-3.5-turbo", openai_api_key=OPENAI_API_KEY)

@app.post("/legal_advice")
async def legal_advice(request: Request):
    data = await request.json()
    question = data.get("question")
    language = data.get("language", "hi")
    if not question:
        return {"advice": "No question provided."}
    try:
        prompt = f"Answer in {language.upper()} language: {question}"
        response = llm.invoke(prompt)
        return {"advice": str(response)}
    except Exception as e:
        return {"advice": f"Server error: {e}"}