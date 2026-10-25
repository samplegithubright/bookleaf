import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.services.seed_data import seed_database_if_empty
from app.routers import auth, authors, books, tickets, admin, ws

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(levelname)s] - %(name)s: %(message)s"
)
logger = logging.getLogger("bookleaf.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing BookLeaf Author Support Portal Backend...")
    await connect_to_mongo()
    await seed_database_if_empty(force=False)
    logger.info("Application startup complete.")
    yield
    # Shutdown
    logger.info("Shutting down BookLeaf Portal...")
    await close_mongo_connection()

app = FastAPI(
    title="BookLeaf Publishing - Author Support & Communication API",
    description="""
    Comprehensive REST API & Real-Time Engine for BookLeaf Author Support.
    
    Features:
    - Role-based Access Control (Authors & BookLeaf Operations Admins)
    - AI-Powered Support Query Auto-Classification (6 categories)
    - AI-Powered Dynamic Priority Scoring (Critical, High, Medium, Low)
    - Context-Aware AI-Drafted Responses grounded in the BookLeaf Knowledge Base
    - Real-Time WebSocket Updates for instantaneous author-admin communication
    - Full Catalog Management & Royalty Tracking for 22,000+ title scale
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler for meaningful error responses (not generic 500s)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred while processing your request. Please try again or reach out to support.",
            "detail": str(exc),
            "path": request.url.path
        }
    )

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(authors.router, prefix=settings.API_V1_STR)
app.include_router(books.router, prefix=settings.API_V1_STR)
app.include_router(tickets.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(ws.router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "BookLeaf Author Support Portal",
        "version": "1.0.0"
    }

@app.get("/", tags=["System"])
async def root():
    return {
        "message": "Welcome to BookLeaf Author Support & Communication Portal API",
        "docs": "/docs",
        "health": "/health"
    }
