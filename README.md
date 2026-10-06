# 🌍 Traveloop AI

**Intelligent AI-powered travel planning agent**

Traveloop AI is a conversational travel assistant that helps users plan trips using natural language. It combines agentic AI (LangGraph), real-time flight data, web search, and persistent memory to deliver personalized itineraries, flight information, and travel recommendations.

---

## ✨ Features

- **Conversational Trip Planning** – Chat naturally to plan destinations, itineraries, and travel details
- **Live Flight Search** – Real-time flight status and route information via AviationStack API
- **Smart Location Resolution** – Automatically maps cities/countries to IATA airport codes
- **Web Research** – Powered by Tavily for up-to-date travel info, hotels, attractions, etc.
- **Persistent Memory** – Conversation history saved with PostgreSQL (LangGraph checkpointing)
- **Modern Frontend** – Clean UI with **Antigravity** integration for a smooth user experience
- **FastAPI Backend** – Lightweight and production-ready API + Jinja2 templates

---

## 🛠️ Tech Stack

| Layer          | Technologies                                      |
|----------------|---------------------------------------------------|
| AI / Agents    | LangGraph, LangChain, Groq                        |
| Tools          | Tavily, AviationStack, airportsdata, pycountry    |
| Backend        | FastAPI, Uvicorn, Jinja2                          |
| Database       | PostgreSQL + LangGraph Checkpoint                 |
| Frontend       | HTML/CSS/JS + Antigravity                         |
| Others         | python-dotenv, requests                           |

---

## 📁 Project Structure

traveloop-ai/
├── tools/
│   ├── flight_tool.py      # Flight search & location resolution
│   └── tavily_tool.py      # Web search tool
├── templates/
│   └── index.html          # Frontend template
├── static/
│   ├── style.css
│   └── script.js
├── app.py                  # FastAPI application
├── backend.py              # Agent & LangGraph logic
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md


---

## 🚀 Getting Started (Local)

### 1. Clone the repository

```bash
git clone https://github.com/tarun372/traveloop-ai.git
cd traveloop-ai

2. Create virtual environmentbash

python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate


3. Install dependenciesbash

pip install -r requirements.txt


4. Set up environment variablesCreate a .env file in the root directory:env

GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
AVIATIONSTACK_API_KEY=your_aviationstack_api_key
DATABASE_URL=postgresql://user:password@host:port/dbname
DEFAULT_ORIGIN_IATA=DAC


5. Run the applicationbash

uvicorn app:app --reload

Open your browser at: http://127.0.0.1:8000

