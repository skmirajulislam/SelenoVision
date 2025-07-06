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
    mongodb_uri = os.getenv('MONGODB_URI')
    mongodb_database = os.getenv('MONGODB_DATABASE', 'luna_photoclinometry')

    if not mongodb_uri:
        raise ValueError("MONGODB_URI environment variable is required")

    # Ensure database name is in URI
    if mongodb_database and not mongodb_uri.endswith('/'):
        if '?' in mongodb_uri:
            mongodb_uri = mongodb_uri.replace('?', f'/{mongodb_database}?')
        else:
            mongodb_uri = f"{mongodb_uri}/{mongodb_database}"

    app.config["MONGO_URI"] = mongodb_uri

    try:
        mongo.init_app(app)
        print("✅ MongoDB connection initialized successfully")
    except Exception as e:
        print(f"❌ MongoDB initialization failed: {e}")
        raise

    return mongo


def get_db():
    """Get database instance"""
    try:
        if mongo.db is None:
            # Fallback to direct connection
            mongodb_uri = os.getenv('MONGODB_URI')
            mongodb_database = os.getenv(
                'MONGODB_DATABASE', 'luna_photoclinometry')

            client = MongoClient(mongodb_uri)
            return client[mongodb_database]
        return mongo.db
    except Exception as e:
        print(f"Error getting database: {e}")
        # Fallback to direct connection
        mongodb_uri = os.getenv('MONGODB_URI')
        mongodb_database = os.getenv(
            'MONGODB_DATABASE', 'luna_photoclinometry')

        client = MongoClient(mongodb_uri)
        return client[mongodb_database]
