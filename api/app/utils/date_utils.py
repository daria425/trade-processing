from datetime import datetime, timezone

def create_timestamp():
    """
    Creates a timestamp in UTC format.
    
    :return: Timestamp string in 'YYYY-MM-DD HH:MM:SS' format
    """
    return datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')