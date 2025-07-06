# database.py
import os
from flask_pymongo import PyMongo
from dotenv import load_dotenv

load_dotenv()

mongo = PyMongo()


def init_db(app):
    """Initialize MongoDB connection"""
    app.config["MONGO_URI"] = os.getenv("MONGODB_URI")
    mongo.init_app(app)


def get_db():
    """Get the database instance"""
    if mongo.db is None :
        raise RuntimeError("MongoDB is not initialized properly.")
    return mongo.db
