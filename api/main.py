from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app=FastAPI()


origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def main():
    return {"Hello":"World"}

@app.post("/trades/send")
async def make_trade_order():
    pass