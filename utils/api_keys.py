import os
import json
from datetime import datetime
from typing import Dict, Optional

def load_api_keys() -> Dict[str, str]:
    """
    Load API keys from the JSON file.
    If the file doesn't exist, return an empty dictionary.
    """
    api_keys_file = 'api_keys.json'
    
    # Check if the environment variable exists first
    perplexity_key = os.environ.get('PERPLEXITY_API_KEY')
    if perplexity_key:
        return {"perplexity": perplexity_key, "updated_at": datetime.now().isoformat()}
    
    # Otherwise check the file
    try:
        if os.path.exists(api_keys_file):
            with open(api_keys_file, 'r') as f:
                return json.load(f)
        return {}
    except Exception as e:
        print(f"Error loading API keys: {str(e)}")
        return {}

def save_api_key(name: str, value: str) -> bool:
    """
    Save an API key to the JSON file.
    """
    api_keys_file = 'api_keys.json'
    
    try:
        # Load existing keys
        api_keys = load_api_keys()
        
        # Update with new key
        api_keys[name] = value
        api_keys["updated_at"] = datetime.now().isoformat()
        
        # Save to file
        with open(api_keys_file, 'w') as f:
            json.dump(api_keys, f)
        
        return True
    except Exception as e:
        print(f"Error saving API key: {str(e)}")
        return False

def delete_api_key(name: str) -> bool:
    """
    Delete an API key from the JSON file.
    """
    api_keys_file = 'api_keys.json'
    
    try:
        # Load existing keys
        api_keys = load_api_keys()
        
        # Delete key if it exists
        if name in api_keys:
            del api_keys[name]
            api_keys["updated_at"] = datetime.now().isoformat()
            
            # Save to file
            with open(api_keys_file, 'w') as f:
                json.dump(api_keys, f)
            
            return True
        
        return False
    except Exception as e:
        print(f"Error deleting API key: {str(e)}")
        return False

def get_api_key(name: str) -> Optional[str]:
    """
    Get a specific API key by name.
    Returns None if the key doesn't exist.
    """
    # Check environment variables first
    if name == 'perplexity':
        env_key = os.environ.get('PERPLEXITY_API_KEY')
        if env_key:
            return env_key
    
    # Otherwise check the file
    api_keys = load_api_keys()
    return api_keys.get(name)
