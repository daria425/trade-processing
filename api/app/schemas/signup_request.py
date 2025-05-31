from pydantic import BaseModel

class SignupRequest(BaseModel):
    name:str