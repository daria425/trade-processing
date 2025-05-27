import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

load_dotenv()
SUPABASE_CONNECTION_STRING=os.getenv("SUPABASE_CONNECTION_STRING")
engine = create_async_engine(url=SUPABASE_CONNECTION_STRING, connect_args={"statement_cache_size": 0 }, echo=True)
AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

