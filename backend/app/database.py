import logging
import re
import urllib.parse
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

logger = logging.getLogger("bookleaf.database")

def format_mongo_uri(uri: str) -> str:
    """Ensure username and password in MongoDB URI are RFC 3986 escaped."""
    if not uri or "://" not in uri:
        return uri
    prefix, rest = uri.split("://", 1)
    if "@" not in rest:
        return uri
    userinfo, host_and_beyond = rest.rsplit("@", 1)
    if ":" in userinfo:
        username, password = userinfo.split(":", 1)
        username = urllib.parse.quote_plus(urllib.parse.unquote_plus(username))
        password = urllib.parse.quote_plus(urllib.parse.unquote_plus(password))
        return f"{prefix}://{username}:{password}@{host_and_beyond}"
    return uri

def mask_mongo_uri(uri: str) -> str:
    """Mask credentials in MongoDB URI for safe logging."""
    return re.sub(r":([^@/]+)@", r":****@", uri)

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db_instance = Database()

async def connect_to_mongo():
    uri = format_mongo_uri(settings.MONGODB_URI)
    logger.info(f"Connecting to MongoDB at {mask_mongo_uri(uri)}")
    # Set serverSelectionTimeoutMS to 5000ms (5s) to avoid 30s connection hangs
    db_instance.client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
    db_instance.db = db_instance.client[settings.DATABASE_NAME]
    
    # Test connection and create indexes
    try:
        await db_instance.client.admin.command("ping")
        logger.info("MongoDB connection ping successful.")

        await db_instance.db.users.create_index("email", unique=True)
        await db_instance.db.authors.create_index("author_id", unique=True)
        await db_instance.db.books.create_index("book_id", unique=True)
        await db_instance.db.books.create_index("author_id")
        await db_instance.db.tickets.create_index("ticket_number", unique=True)
        await db_instance.db.tickets.create_index("author_id")
        await db_instance.db.tickets.create_index("status")
        await db_instance.db.tickets.create_index("priority")
        await db_instance.db.tickets.create_index("category")
        await db_instance.db.tickets.create_index("created_at")
        logger.info("MongoDB indexes verified.")
    except Exception as e:
        logger.warning(f"MongoDB connection/index note: {e}")

async def close_mongo_connection():
    if db_instance.client:
        logger.info("Closing MongoDB connection...")
        db_instance.client.close()
        logger.info("MongoDB connection closed.")

def get_database() -> AsyncIOMotorDatabase:
    return db_instance.db
