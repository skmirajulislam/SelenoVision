"""
MongoDB database configuration and connection
"""

import os
import ssl
import certifi
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

    # Use the URI as-is, without modification for flask-pymongo
    # The database will be accessed via the get_db() function
    app.config["MONGO_URI"] = mongodb_uri

    try:
        # Skip flask-pymongo initialization and use direct connection instead
        print("✅ MongoDB connection configuration set successfully")
        return True
    except Exception as e:
        print(f"❌ MongoDB initialization failed: {e}")
        raise

    return True


def get_db():
    """Get database instance"""
    mongodb_uri = os.getenv('MONGODB_URI')
    mongodb_database = os.getenv('MONGODB_DATABASE', 'luna_photoclinometry')

    if not mongodb_uri:
        raise ValueError("MONGODB_URI environment variable is required")

    try:
        # Configure SSL for MongoDB Atlas with proper certificate handling
        if 'mongodb.net' in mongodb_uri:
            print("🔐 Connecting to MongoDB Atlas with SSL...")
            client = MongoClient(mongodb_uri,
                                 tlsCAFile=certifi.where(),
                                 tlsAllowInvalidCertificates=False)
        else:
            client = MongoClient(mongodb_uri)

        # Test the connection
        client.admin.command('ping')
        print("✅ MongoDB connection successful!")

        return client[mongodb_database]

    except Exception as e:
        print(f"❌ Primary connection failed: {e}")
        # Fallback to SSL bypass for development
        try:
            if 'mongodb.net' in mongodb_uri:
                print(
                    "⚠️  Warning: Using SSL bypass for MongoDB connection (development only)")
                client = MongoClient(mongodb_uri,
                                     tlsAllowInvalidCertificates=True,
                                     ssl_cert_reqs=ssl.CERT_NONE)
                # Test the connection
                client.admin.command('ping')
                print("✅ MongoDB fallback connection successful!")
                return client[mongodb_database]
            else:
                client = MongoClient(mongodb_uri)
                return client[mongodb_database]
        except Exception as fallback_error:
            print(f"❌ All connection attempts failed: {fallback_error}")
            raise fallback_error
