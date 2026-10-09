# 🌍 Traveloop AI

### Intelligent AI-Powered Travel Planning Agent

> A conversational, agentic travel assistant that plans personalized trips using natural language — combining real-time flight data, web research, and persistent memory to deliver complete itineraries.

---

# Overview

**Traveloop AI** is an end-to-end AI travel planning system. Users chat naturally about their travel goals, and the agent researches destinations, finds flights, builds day-by-day itineraries, and remembers conversation context across sessions.

It combines:
- **Agentic AI** — LangGraph orchestration with tool calling
- **Real-time Data** — Live flight search via AviationStack
- **Web Intelligence** — Up-to-date travel info via Tavily
- **Persistent Memory** — PostgreSQL-backed conversation history
- **Clean Interface** — FastAPI backend + modern web frontend

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Conversational Trip Planning** | Plan entire trips using natural language |
| **Live Flight Search** | Real-time flight status and routes via AviationStack API |
| **Smart Location Resolution** | Automatically maps cities/countries → IATA airport codes |
| **Web Research** | Powered by Tavily for hotels, attractions, tips, and local info |
| **Persistent Memory** | Full conversation history saved with LangGraph + PostgreSQL |
| **Modern Frontend** | Clean, responsive UI |
| **Production-Ready Backend** | FastAPI + Uvicorn + Jinja2 |



## Component Breakdown

| Layer              | Technology                          | Purpose                              |
|--------------------|-------------------------------------|--------------------------------------|
| AI / Agents        | LangGraph, LangChain, Groq          | Orchestrates tools & conversation    |
| Tools              | AviationStack, Tavily, airportsdata | Flight data + web research           |
| Backend            | FastAPI, Uvicorn, Jinja2            | API + server-side rendering          |
| Database           | PostgreSQL + LangGraph Checkpointer | Persistent conversation memory       |
| Frontend           | HTML, CSS, JavaScript               | Chat interface                       |

---

# Tech Stack

| Category          | Technology                              |
|-------------------|-----------------------------------------|
| **Language**      | Python 3.11+                            |
| **AI Framework**  | LangGraph, LangChain                    |
| **LLM Provider**  | Groq                                    |
| **Tools**         | Tavily, AviationStack, airportsdata, pycountry |
| **Backend**       | FastAPI, Uvicorn, Jinja2                |
| **Database**      | PostgreSQL                              |
| **Frontend**      | HTML5, CSS3, Vanilla JavaScript         |
| **Others**        | python-dotenv, requests                 |

---

# Installation & Setup

### Prerequisites
- Python 3.11+
- PostgreSQL
- Git
- API Keys: Groq, Tavily, AviationStack

### 1. Clone the Repository
```bash
git clone https://github.com/tarun372/traveloop-ai.git
cd traveloop-ai

2. Create Virtual Environmentbash

python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

3. Install Dependenciesbash

pip install -r requirements.txt

4. Set Up Environment VariablesCreate a .env file in the root directory:env

GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
AVIATIONSTACK_API_KEY=your_aviationstack_api_key
DATABASE_URL=postgresql://user:password@host:port/dbname
DEFAULT_ORIGIN_IATA=DAC

5. Run the Applicationbash

uvicorn app:app --reload

Open your browser at: http://127.0.0.1:8000

*Project Structure*

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
├── .env.example
└── README.md

FUTURE WORK

Future WorkMulti-user authentication & trip saving
Hotel & activity booking integration
Map visualization of itineraries
Voice input support
Mobile-responsive redesign
Deploy public Chrome/Edge extension version
Support for multiple LLM providers (OpenAI, Anthropic, etc.)
Budget optimization agent

Live Demo Live Demo: https://traveloop-ai-2.onrender.com

License:-
This project is licensed under the MIT License.




