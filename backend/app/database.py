import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

logger = logging.getLogger("bookleaf.database")

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db_instance = Database()

async def connect_to_mongo():
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}")
    db_instance.client = AsyncIOMotorClient(settings.MONGODB_URI)
    db_instance.db = db_instance.client[settings.DATABASE_NAME]
    
    # Create indexes for performance and constraints
    try:
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
        logger.warning(f"Index creation note: {e}")

async def close_mongo_connection():
    if db_instance.client:
        logger.info("Closing MongoDB connection...")
        db_instance.client.close()
        logger.info("MongoDB connection closed.")

def get_database() -> AsyncIOMotorDatabase:
    return db_instance.db
