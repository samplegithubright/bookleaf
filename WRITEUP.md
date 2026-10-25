# Architectural Approach & Technical Write-Up

**Candidate Position:** Full-Stack Developer  
**System:** BookLeaf Author Support & Communication Portal  

---

### 1. What I Prioritised
In aligning with BookLeaf's real-world operational challenges (managing 22,000+ titles with high seasonal ticket surges), I prioritised three core pillars:

1. **Production-Grade AI Grounding & Empathy**: Rather than treating AI as a novelty chat gimmick, the AI copilot was deeply coupled to BookLeaf’s actual business rules—namely the 80/20 net profit split formula, quarterly 45-day payment cycles, ₹1,000 rollover thresholds, and Delhi print facility SLAs. Most importantly, I enforced BookLeaf’s tone philosophy: *"Authors are creative partners, not support tickets."* AI drafts take ownership of errors (such as Amazon ISBN sync delays) and commit to concrete 48-hour resolution timelines.
2. **True Real-Time Workflow**: Support backlogs worsen when authors and ops reps constantly refresh tabs. By embedding a native WebSocket broker into FastAPI and Next.js, replies, status changes, and new incoming tickets stream instantaneously between author and ops screens.
3. **Resilience & Graceful Degradation**: External LLM APIs can face rate-limits, credit exhaustion, or outages. I implemented a robust fallback system where tickets are never dropped, auto-classification and priority calculations remain active, and policy-accurate response drafts are generated deterministically even with zero internet/external API access.

---

### 2. Trade-offs Made
- **MongoDB vs Relational (PostgreSQL)**: MongoDB was selected for its rapid schema flexibility with semi-structured chat message threads, internal team notes, and nested author book arrays. The trade-off is the absence of native relational foreign-key cascades, which I mitigated through application-level validation and compound MongoDB indexes.
- **WebSocket Broker vs Redis Pub/Sub**: For local single-node execution and straightforward evaluation, I implemented an in-memory asynchronous `WebSocketManager`. In a multi-instance production cluster behind a load balancer, this would require a Redis Pub/Sub backplane.
- **UI File Attachment**: Per the assignment guidance (*"UI only—actual upload is bonus"*), I implemented a dual-mode upload dropzone that validates file types/sizes on the frontend and connects to an asynchronous backend multipart upload endpoint.

---

### 3. Evolving this into a Large-Scale Production System
If deployed across BookLeaf’s entire ecosystem of 22,000+ titles and thousands of active authors:

1. **Retrieval-Augmented Generation (RAG) with Historical Embeddings**:
   Index BookLeaf's past 50,000+ resolved tickets into a vector database (e.g., Pinecone or pgvector). When an author reports an issue (e.g. print binding error on a 300-page hardback), the model can retrieve the exact resolution steps taken by senior ops managers in similar cases.
2. **Automated ERP & Banking Webhooks**:
   Integrate direct webhooks with BookLeaf’s corporate banking provider (e.g. RazorpayX / HDFC) and distributor APIs (Amazon Seller Central / Repro India). When an author asks *"Where is my Q3 royalty?"*, the system can automatically query the banking ledger and fetch the exact UTR transaction number before the admin even opens the ticket.
3. **Omnichannel Author Sync (WhatsApp & Email)**:
   Many Indian authors prefer WhatsApp for urgent queries. Using an omnichannel integration (Twilio / Gupshup), incoming WhatsApp messages would automatically convert into BookLeaf tickets, and admin responses would dispatch back via WhatsApp.
4. **Agentic Automation for Standard Workflows**:
   For straightforward requests (e.g., "re-sync Amazon listing", "update author biography"), the AI can be given controlled tool-calling permissions to trigger catalog re-sync jobs directly after ops approval.
