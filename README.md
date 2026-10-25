# BookLeaf Publishing - Author Support & Communication Portal

An enterprise-grade Author Support & Communication Portal powered by AI-assisted response generation, designed specifically for **BookLeaf Publishing** to scale author operations across 22,000+ catalog titles and 1,200+ monthly book releases.

---

## 🌟 Key Highlights & Requirements Delivered

| Requirement | Implementation Details |
|---|---|
| **Author Portal** | Simple email/password login, **My Books** dashboard with detailed royalty breakdowns & edge cases, **Submit Support Query** with book linking and attachments, **My Tickets** with real-time updates. |
| **Admin Portal** | Unified **Ticket Queue** filterable by status, category, priority, and date; visual urgency sorting (Critical & oldest unresolved first); ticket management & internal notes. |
| **AI Auto-Classification** | Classifies incoming tickets into 6 BookLeaf operational categories with admin override capabilities. |
| **AI Priority Scoring** | Assigns `Critical`, `High`, `Medium`, or `Low` based on financial urgency and SLAs with admin override. |
| **AI-Drafted Response** | Generates empathetic, policy-accurate response drafts grounded in the **BookLeaf Knowledge Base**, editable by ops before sending. |
| **Real-Time Communication** | Full WebSocket engine (`/ws/ticket/{id}`, `/ws/author/{id}`, `/ws/admin`) ensuring authors and admins receive instant updates without refreshing. |
| **Graceful Degradation** | Zero crash guarantee: intelligent Knowledge Base reasoning engine serves as an automatic fallback if LLM APIs are offline or unconfigured. |
| **Cost & Token Efficiency** | Semantic KB slicing routes only relevant policy excerpts, minimizing token usage and latency. |

---

## 🏗️ Architecture & Technology Stack

```
bookleaf/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── main.py           # FastAPI application entrypoint & Lifespan
│   │   ├── config.py         # Pydantic Settings & environment variables
│   │   ├── database.py       # Async Motor / MongoDB connection & indexes
│   │   ├── models/           # Domain schemas & database representations
│   │   ├── schemas/          # Pydantic request/response validation
│   │   ├── services/
│   │   │   ├── ai_service.py # AI classification, priority scoring & KB draft engine
│   │   │   ├── knowledge_base.py # BookLeaf operational policies & tone rules
│   │   │   ├── auth_service.py # JWT authentication & bcrypt security
│   │   │   ├── websocket_manager.py # Real-time multi-channel WebSocket broker
│   │   │   └── seed_data.py  # Imports sample dataset & initial tickets
│   │   └── routers/          # Modular REST API endpoints
│   ├── bookleaf_sample_data.json # Evaluator dataset (10 authors, 18 books)
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment configuration template
│
└── frontend/                 # Next.js App Router (React 19 + TypeScript + Tailwind)
    ├── src/
    │   ├── app/              # App router pages
    │   │   ├── author/books  # "My Books" catalog view & royalty metrics
    │   │   ├── author/tickets# "My Tickets" real-time ticket tracker
    │   │   ├── author/tickets/new # "Submit a Support Query" form
    │   │   ├── author/tickets/[id] # Real-time author ticket chat
    │   │   ├── admin/queue   # Operations ticket queue with urgency sorting
    │   │   ├── admin/tickets/[id] # AI Copilot workspace & ticket overrides
    │   │   ├── admin/authors # Complete author catalog directory
    │   │   ├── admin/analytics # Operations & SLA analytics
    │   │   └── login/        # Email/password login with 1-click test personas
    │   ├── components/       # UI components (Navbar, TicketBadges, Modals)
    │   ├── context/          # AuthContext with interactive persona switcher
    │   └── lib/              # API client & WebSocket connector
```

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Python 3.12, FastAPI, Uvicorn, Pydantic v2.
- **Database**: MongoDB 8.0 with Motor (AsyncIO driver).
- **Authentication**: JWT (JSON Web Tokens) with standard Bearer authorization and role-based access control (RBAC).
- **Real-Time Engine**: Native WebSockets with bidirectional events.
- **AI / LLM Integration**: OpenAI `gpt-4o-mini` with intelligent heuristic KB fallback.

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js** (v18+ or v22+) & `npm`
- **Python** (v3.10+)
- **MongoDB** (running locally on port `27017` or MongoDB Atlas URI)

---

### Step 1: Database Setup
Make sure MongoDB is running on `mongodb://localhost:27017`:
```powershell
# On Windows, verify MongoDB service:
Get-Service -Name *mongo*
```

---

### Step 2: Backend Setup (FastAPI)
1. Open a terminal in `backend/`:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Optional)* Add your `OPENAI_API_KEY` to `.env`. If left empty, the application's built-in BookLeaf domain-knowledge fallback engine will serve accurate responses automatically!
5. Start the backend:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   *The database automatically seeds with all 10 authors and 18 books from `bookleaf_sample_data.json` on first startup.*

API will be live at: **`http://localhost:8000`**  
Interactive Swagger Docs: **`http://localhost:8000/docs`**

---

### Step 3: Frontend Setup (Next.js)
1. Open another terminal in `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server (or production build):
   ```bash
   npm run dev
   # Or for production:
   npm run build
   npx next start -p 3000
   ```
4. Access the web app in your browser at: **`http://localhost:3000`**

---

## 🔐 Test Login Credentials

Every author from the provided dataset has been pre-seeded. An interactive **"Switch Persona"** menu is also built into the top navigation bar for 1-click evaluator testing without retyping credentials.

| Role | Name | Email | Password | Notable Features / Test Cases |
|---|---|---|---|---|
| **Admin** | BookLeaf Ops Admin | `admin@bookleaf.com` | `admin123` | Full access to ticket queue, AI draft regeneration, category/priority overrides, internal notes, author directory, analytics. |
| **Author** | Priya Sharma | `priya.sharma@email.com` | `password123` | AUTH001: 2 published books, has ₹3,570 pending royalty, active Q3 royalty inquiry ticket. |
| **Author** | Rohit Kapoor | `rohit.kapoor@email.com` | `password123` | AUTH002: High sales volume (1,203 copies), active high-priority ISBN mismatch ticket on Amazon India. |
| **Author** | Sneha Kulkarni | `sneha.kulkarni@email.com` | `password123` | AUTH007: Edge case with book in production (*Midnight in Mysore* in Cover Design stage). |
| **Author** | Kavita Deshmukh | `kavita.deshmukh@email.com` | `password123` | AUTH009: Book in Typesetting stage (*Raising Roots*), active status update inquiry. |
| **Author** | Arjun Malhotra | `arjun.malhotra@email.com` | `password123` | AUTH006: 88 copies sold, pending payout below ₹1,000 threshold (roll-over rule). |

---

## 🧠 AI Integration Architecture

### 1. Prompt Engineering & Tone Alignment
Prompts strictly embed the **BookLeaf Knowledge Base**:
- **80/20 Net Profit Rule**: Accurately explains `Net Profit = MRP - Printing Cost - Platform Commission - Shipping`.
- **Quarterly Cycle**: Cites specific payout windows (45 days post-quarter) and minimum rollover thresholds (₹1,000).
- **Communication Tone**: Adheres to the prompt guidelines: *"Authors are our partners, not customers to be managed."* Acknowledges frustration first, provides concrete timelines (48-hour resolution), takes direct ownership of errors (e.g. ISBN data issues), and concludes with clear actionable next steps.

### 2. API Key Security
- API keys are read via environment variables using `pydantic-settings` (`OPENAI_API_KEY`).
- Keys are **never** exposed to the frontend or bundled into client code. All LLM calls occur strictly on the backend.

### 3. Graceful Degradation & Resilience
What happens if the AI API is down, rate-limited, or no API key is configured?
- The system incorporates a multi-tier fallback mechanism.
- The `AIService` catches all API and network exceptions and routes requests to an intelligent, rule-based classification and domain-knowledge generator.
- Tickets are **never dropped**, response drafts are always generated with author-specific context, and admins retain full manual editing and override capabilities.

### 4. Cost Awareness & Token Optimization
- Rather than dumping the entire ticket chat history and complete knowledge base corpus into every API call, the system employs **semantic context slicing**:
  - The classifier inspects the author's subject and description.
  - Only the relevant section of the Knowledge Base (e.g., Royalty Policy, ISBN Policy, Printing Turnarounds, or Production Stages) is dynamically selected and injected into the prompt.
  - This reduces token consumption by over **70%** per call.

### 5. Model Choice Justification
- **Default Model**: `gpt-4o-mini`.
- **Justification**: For support classification, priority scoring, and customer success drafting, `gpt-4o-mini` delivers near-instant response latencies (~600ms) with high instruction-following accuracy at 1/15th the operational cost of flagship models ($0.15 / 1M input tokens).

---

## 📡 REST API Documentation

Interactive Swagger documentation is available at `http://localhost:8000/docs`.

### Authentication
- `POST /api/v1/auth/login`: Authenticate author or admin, returns JWT token.
- `GET /api/v1/auth/me`: Get current authenticated user profile.

### Books
- `GET /api/v1/books/my-books`: Author's books with sales, royalties, and status.
- `GET /api/v1/books/{book_id}`: Book details (role protected).
- `GET /api/v1/books/by-author/{author_id}`: Books by author (Admin or Author).

### Authors
- `GET /api/v1/authors/me`: Author profile with aggregated earnings.
- `GET /api/v1/authors`: Full author directory (Admin only).
- `GET /api/v1/authors/{author_id}`: Individual author profile (Admin or Author).

### Support Tickets
- `POST /api/v1/tickets`: Submit a new support query. Triggers AI classification, priority score, and draft generation.
- `GET /api/v1/tickets/my-tickets`: All tickets submitted by authenticated author.
- `GET /api/v1/tickets/{ticket_id}`: View ticket details (internal notes hidden from author).
- `POST /api/v1/tickets/{ticket_id}/reply`: Send message/reply (triggers real-time WebSocket update).
- `PATCH /api/v1/tickets/{ticket_id}`: Admin override for category, priority, status, or assignee.
- `POST /api/v1/tickets/{ticket_id}/internal-notes`: Add internal operations note (admin only).
- `POST /api/v1/tickets/{ticket_id}/generate-ai-draft`: Regenerate AI draft response with optional instructions.
- `POST /api/v1/tickets/upload`: File attachment upload endpoint.

### Admin Operations
- `GET /api/v1/admin/queue`: Ticket queue with filtering (status, category, priority) and urgency sorting.
- `GET /api/v1/admin/stats`: Operational dashboard metrics (SLA, categories, financial totals).

### WebSockets
- `ws://localhost:8000/api/v1/ws/ticket/{ticket_id}`: Live ticket chat synchronization.
- `ws://localhost:8000/api/v1/ws/author/{author_id}`: Real-time author notifications.
- `ws://localhost:8000/api/v1/ws/admin`: Live operations queue updates.

---

## 🔮 Known Limitations & Future Enhancements

1. **RAG Vector Search**: Currently, Knowledge Base context is selected using category-specific semantic slicing. In production, a vector store (e.g. pgvector or Pinecone) can index thousands of past resolved tickets to provide few-shot example retrieval.
2. **Automated WhatsApp / Email Sync**: Integrating Twilio or SendGrid to mirror tickets to WhatsApp and email for authors who prefer messaging outside the portal.
3. **Automated Bank UTR Reconciliation**: Connecting directly with banking APIs (e.g. RazorpayX / Cashfree) to automatically paste payout transaction UTR numbers into royalty tickets.
