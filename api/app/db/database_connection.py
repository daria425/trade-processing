import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()
SUPABASE_CONNECTION_STRING=os.getenv("SUPABASE_CONNECTION_STRING")

engine = create_async_engine(SUPABASE_CONNECTION_STRING, echo=True)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()