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

# CORS Middleware - Production-Ready for Vercel & Localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from pymongo.errors import ServerSelectionTimeoutError, PyMongoError

# Specific Exception Handler for MongoDB connection timeouts / DNS failures
@app.exception_handler(ServerSelectionTimeoutError)
async def mongo_timeout_handler(request: Request, exc: ServerSelectionTimeoutError):
    logger.error(f"MongoDB connection timeout/unreachable on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "error": "DatabaseUnavailable",
            "message": "Cannot reach the MongoDB database cluster. Please check your internet connection, DNS resolution, or verify your IP is whitelisted in MongoDB Atlas.",
            "detail": str(exc),
            "path": request.url.path
        }
    )

@app.exception_handler(PyMongoError)
async def pymongo_error_handler(request: Request, exc: PyMongoError):
    logger.error(f"Database error on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "DatabaseError",
            "message": "A database operation failed. Please try again.",
            "detail": str(exc),
            "path": request.url.path
        }
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
    db_status = "connected"
    try:
        from app.database import get_database
        db = get_database()
        if db is not None:
            await db.command("ping")
        else:
            db_status = "uninitialized"
    except Exception as e:
        db_status = f"warning: {str(e)}"

    return {
        "status": "healthy",
        "database": db_status,
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
