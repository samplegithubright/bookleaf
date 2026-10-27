# BookLeaf Publishing - Backend API

Production-ready FastAPI backend for the BookLeaf Author Support Portal. Grounded in BookLeaf's Knowledge Base, featuring AI-powered auto-classification, dynamic priority scoring, real-time WebSocket communication, and catalog tracking.

---

## 🚀 Deploying to Render

This backend is pre-configured for **Render Web Service** deployment:

### Method 1: Using Render Blueprint (`render.yaml`)
1. Push your repository to GitHub.
2. In Render Dashboard, click **New +** > **Blueprint**.
3. Connect your repository. Render will automatically detect [`render.yaml`](./render.yaml) and configure:
   - **Runtime**: Python 3.11
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check**: `/health`
4. Set your `MONGODB_URI` environment variable (e.g. your MongoDB Atlas connection string).
5. (Optional) Set `OPENAI_API_KEY` for live GPT-4o-mini generation.
6. Click **Apply**.

### Method 2: Manual Web Service Setup on Render
1. Click **New +** > **Web Service**.
2. Select your repository.
3. Configure the service settings:
   - **Name**: `bookleaf-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `MONGODB_URI`: `mongodb+srv://...`
   - `DATABASE_NAME`: `bookleaf_db`
   - `JWT_SECRET`: (Generate a secure random string)
   - `OPENAI_API_KEY`: (Your OpenAI API key)
   - `OPENAI_MODEL`: `gpt-4o-mini`
5. Click **Create Web Service**.

---

## 🛠 Local Development

```bash
# 1. Navigate to backend
cd backend

# 2. Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure .env
cp .env.example .env

# 5. Start development server
uvicorn app.main:app --reload --port 8000
```

- API Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`
