<<<<<<< HEAD
=======

>>>>>>> d52d5154cd7a505dd585cba6a48684013ba230a6
from flask import Flask, jsonify
import os
import json
from urllib.parse import parse_qs

def load_api_keys():
    if os.path.exists('api_keys.json'):
        try:
            with open('api_keys.json', 'r') as f:
                return json.load(f)
        except:
            return {}
    return {}

def lambda_handler(event, context):
    """
    Netlify function handler to process API requests
    """
    path = event['path']
    http_method = event['httpMethod']
    
    # Handle API keys endpoint
    if path == '/api-keys' and http_method == 'GET':
        api_keys = load_api_keys()
        return {
            'statusCode': 200,
            'body': json.dumps(api_keys),
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    
<<<<<<< HEAD
    # Handle API key creation
    elif path == '/api-keys' and http_method == 'POST':
        try:
            # Parse request body
            body = json.loads(event['body'])
            name = body.get('name')
            value = body.get('value')
            
            if not name or not value:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'success': False, 'error': 'API name and value are required'}),
                    'headers': {'Content-Type': 'application/json'}
                }
            
            # Load existing keys
            api_keys = load_api_keys()
            
            # Add or update the key
            from datetime import datetime
            api_keys[name] = value
            api_keys['updated_at'] = datetime.now().isoformat()
            
            # Save to file
            with open('api_keys.json', 'w') as f:
                json.dump(api_keys, f)
            
            return {
                'statusCode': 200,
                'body': json.dumps({'success': True}),
                'headers': {'Content-Type': 'application/json'}
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'body': json.dumps({'success': False, 'error': str(e)}),
                'headers': {'Content-Type': 'application/json'}
            }
    
    # Handle API key deletion
    elif path.startswith('/api-keys/') and http_method == 'DELETE':
        try:
            key_name = path.split('/api-keys/')[1]
            
            # Load existing keys
            api_keys = load_api_keys()
            
            # Remove the key if it exists
            if key_name in api_keys:
                del api_keys[key_name]
                from datetime import datetime
                api_keys['updated_at'] = datetime.now().isoformat()
                
                # Save to file
                with open('api_keys.json', 'w') as f:
                    json.dump(api_keys, f)
                
                return {
                    'statusCode': 200,
                    'body': json.dumps({'success': True}),
                    'headers': {'Content-Type': 'application/json'}
                }
            else:
                return {
                    'statusCode': 404,
                    'body': json.dumps({'success': False, 'error': 'API key not found'}),
                    'headers': {'Content-Type': 'application/json'}
                }
        except Exception as e:
            return {
                'statusCode': 500,
                'body': json.dumps({'success': False, 'error': str(e)}),
                'headers': {'Content-Type': 'application/json'}
            }
    
=======
>>>>>>> d52d5154cd7a505dd585cba6a48684013ba230a6
    # Default response for main page
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': 'PDF Scraper API',
            'status': 'online',
            'endpoints': [
                '/api-keys',
                '/upload',
                '/process-directory',
                '/download-project'
            ]
        }),
        'headers': {
            'Content-Type': 'application/json'
        }
    }

# Make handler compatible with different serverless platforms
def handler(event, context):
    return lambda_handler(event, context)
