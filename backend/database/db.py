from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
mongo_url = os.getenv("MONGO_DB_URL")


async def mongo_connection():
    client = AsyncIOMotorClient(mongo_url, connect=True)

    db = client["DentAI-Pred-Images"]
    collection = db["predictions"]

    await collection.create_index("createdAt", expireAfterSeconds=60 * 60 * 24)
    return collection
