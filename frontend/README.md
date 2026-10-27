# BookLeaf Publishing - Frontend Application

Next.js 16 (App Router, React 19, Tailwind CSS) frontend for the BookLeaf Author Support Portal. Features separated Customer/Author Dashboard and Super Admin Operations Hub, full responsive design, live WebSockets, and AI Copilot workspace.

---

## 🚀 Deploying to Vercel

This frontend is production-ready for **Vercel**:

### Step 1: Import Project into Vercel
1. Go to [vercel.com](https://vercel.com) and click **Add New...** > **Project**.
2. Connect your GitHub repository.
3. In the project configuration:
   - **Framework Preset**: Next.js
   - **Root Directory**: Click *Edit* and select **`frontend`**.

### Step 2: Configure Environment Variables
Under the **Environment Variables** section, add:
- `NEXT_PUBLIC_API_URL`: Your deployed Render backend URL, e.g.:
  ```
  https://bookleaf-backend.onrender.com/api/v1
  ```
- *(Optional)* `NEXT_PUBLIC_WS_URL`:
  ```
  wss://bookleaf-backend.onrender.com/api/v1
  ```
  *(If omitted, WebSockets automatically use `wss://` on the backend host).*

### Step 3: Deploy
Click **Deploy**. Vercel will build and assign your production domain (`https://your-project.vercel.app`).

---

## 🛠 Local Development

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.
