from firebase_admin import auth

from app.utils.logger import logger
def decode_token(id_token:str):
    try:
        decoded_token = auth.verify_id_token(id_token=id_token)
        logger.info("👋 Token verified 👋")
        return decoded_token
    except auth.InvalidIdTokenError:
        logger.error("🫷 Invalid ID token 🫷")
        return None

def get_token_data(id_token:str):
    decoded_token=decode_token(id_token)
    if decoded_token:
        user_data = {
        "uid": decoded_token["uid"],
        "email": decoded_token.get("email"),
        "auth_time": decoded_token["auth_time"],
        "created_at": decoded_token["iat"]
    }
        print(user_data)
        return user_data
    else:
        return None
    