import os

from dotenv import load_dotenv
from pymongo import  MongoClient

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

# MongoDB Connection
client = MongoClient(MONGO_URI)
db = client["flashcard_game"]
user_collection = db["users"]
