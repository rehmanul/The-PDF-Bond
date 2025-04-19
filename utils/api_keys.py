import os
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# File to store API keys
API_KEYS_FILE = 'api_keys.json'

def load_api_keys():
    """
    Load API keys from the JSON file.
    
    Returns:
        dict: API keys and their values
    """
    if os.path.exists(API_KEYS_FILE):
        try:
            with open(API_KEYS_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading API keys: {str(e)}")
            return {}
    return {}

def save_api_key(name, value):
    """
    Save an API key to the JSON file.
    
    Args:
        name (str): API key name
        value (str): API key value
        
    Returns:
        bool: Success status
    """
    try:
        # Load existing keys
        api_keys = load_api_keys()
        
        # Add or update the key
        api_keys[name] = value
        api_keys['updated_at'] = datetime.now().isoformat()
        
        # Save to file
        with open(API_KEYS_FILE, 'w') as f:
            json.dump(api_keys, f)
        
        return True
    except Exception as e:
        logger.error(f"Error saving API key: {str(e)}")
        return False

def delete_api_key(name):
    """
    Delete an API key from the JSON file.
    
    Args:
        name (str): API key name to delete
        
    Returns:
        bool: Success status
    """
    try:
        # Load existing keys
        api_keys = load_api_keys()
        
        # Remove the key if it exists
        if name in api_keys:
            del api_keys[name]
            api_keys['updated_at'] = datetime.now().isoformat()
            
            # Save to file
            with open(API_KEYS_FILE, 'w') as f:
                json.dump(api_keys, f)
            
            return True
        
        return False
    except Exception as e:
        logger.error(f"Error deleting API key: {str(e)}")
        return False
