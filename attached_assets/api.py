
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
