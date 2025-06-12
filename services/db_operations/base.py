import os

from dotenv import load_dotenv
from pymongo import  MongoClient

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

# MongoDB Connection
client = MongoClient(MONGO_URI)
db = client["mentor_tree"]
user_collection = db["users"]
db = client['teacher_timeline']
