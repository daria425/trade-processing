import firebase_admin
from firebase_admin import credentials
import os
import json
from dotenv import load_dotenv  
from app.utils.logger import logger
load_dotenv()
FIREBASE_CERT=os.getenv("FIREBASE_CERT")
class FirebaseConfig:
    _instance=None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance=FirebaseConfig()
        return cls._instance
    
    def __init__(self):
        if FirebaseConfig._instance is not None:
            raise Exception(" 🙅‍♀️ The FirebaseConfig class is a singleton 🙅‍♀️ Use get_instance() instead ✅")
        self.app=None
    
    def initialize_firebase_app(self):
        """Initialize Firebase Admin SDK"""
        if not self.app:
            try:
                firebase_credentials=json.loads(FIREBASE_CERT)
                cred = credentials.Certificate(firebase_credentials)
                self.app = firebase_admin.initialize_app(cred)
                logger.info("🔥 Firebase Admin SDK initialized 🔥")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Firebase: {e} ❌")


