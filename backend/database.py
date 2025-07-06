"""
MongoDB database configuration and connection
"""

import os
from pymongo import MongoClient
from flask_pymongo import PyMongo
from dotenv import load_dotenv

load_dotenv()

mongo = PyMongo()


def init_db(app):
    """Initialize MongoDB connection"""
    app.config["MONGO_URI"] = os.getenv(
        'MONGODB_URI')
    mongo.init_app(app)
    return mongo


def get_db():
    """Get database instance"""
    return mongo.db
