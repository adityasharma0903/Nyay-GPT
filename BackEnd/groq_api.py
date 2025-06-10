from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
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

# Root endpoint for testing
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

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is working fine!"}

@app.post("/legal_advice")
async def legal_advice(request: Request):
    try:
        data = await request.json()
        question = data.get("question")
        language = data.get("language", "hi")
        
        print(f"Received question: {question}")
        print(f"Language: {language}")
        
        if not question:
            return {"advice": "No question provided."}
        
        # Enhanced prompt for better legal advice
        system_prompt = """You are an expert legal assistant for Indian law. 
        Provide helpful, accurate legal advice while being clear that this is general guidance 
        and users should consult with a qualified lawyer for specific legal matters.
        Be empathetic and provide practical steps when possible."""
        
        user_prompt = f"Please answer this legal question in {language.upper()} language: {question}"
        
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=1024
        )
        
        answer = response.choices[0].message.content
        print(f"Generated answer: {answer[:100]}...")
        
        return {"advice": answer}
        
    except Exception as e:
        error_message = f"Server error: {str(e)}"
        print(f"Error: {error_message}")
        return {"advice": error_message}

# Test endpoint for debugging
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
