
import os
import json
import base64
from urllib.parse import parse_qs

def lambda_handler(event, context):
    """
    Netlify function handler to process API requests
    """
    path = event['path']
    http_method = event['httpMethod']
    
    # Map path to the appropriate function
    if path == '/api-keys' and http_method == 'GET':
        return get_api_keys()
    elif path == '/api-keys' and http_method == 'POST':
        return save_api_key(event)
    elif path.startswith('/api-keys/') and http_method == 'DELETE':
        key_name = path.split('/')[-1]
        return delete_api_key(key_name)
    elif path == '/upload' and http_method == 'POST':
        return process_upload(event)
    elif path.startswith('/download/') and http_method == 'GET':
        filename = path.split('/')[-1]
        return download_file(filename)
    elif path == '/extract-benefits' and http_method == 'POST':
        return extract_benefits(event)
    else:
        # Default response
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'PDF Scraper API',
                'status': 'online',
                'endpoints': [
                    '/api-keys',
                    '/upload',
                    '/extract-benefits',
                    '/download/{filename}'
                ]
            }),
            'headers': {
                'Content-Type': 'application/json'
            }
        }

def get_api_keys():
    """Get all API keys"""
    api_keys = load_api_keys()
    return {
        'statusCode': 200,
        'body': json.dumps(api_keys),
        'headers': {'Content-Type': 'application/json'}
    }

def save_api_key(event):
    """Save an API key"""
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

def delete_api_key(key_name):
    """Delete an API key"""
    try:
        api_keys = load_api_keys()
        
        if key_name in api_keys:
            del api_keys[key_name]
            
            # Save updated keys
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

def process_upload(event):
    """Process PDF upload"""
    # This is a placeholder - in a real implementation, you would:
    # 1. Parse the multipart form data
    # 2. Save the PDF file
    # 3. Process it with the PDF processor
    # 4. Return the results
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'success': True,
            'result': {
                'filename': 'example.pdf',
                'pages': 5,
                'text_length': 1234,
                'text_file': 'example_text.txt'
            }
        }),
        'headers': {'Content-Type': 'application/json'}
    }

def download_file(filename):
    """Download a file"""
    # This is a placeholder - in a real implementation, you would:
    # 1. Validate the filename
    # 2. Read the file from a storage location
    # 3. Return it as a base64-encoded response
    
    return {
        'statusCode': 200,
        'body': 'This is example file content',
        'headers': {
            'Content-Type': 'text/plain',
            'Content-Disposition': f'attachment; filename="{filename}"'
        }
    }

def extract_benefits(event):
    """Extract benefits from a PDF"""
    # This is a placeholder - in a real implementation, you would:
    # 1. Parse the multipart form data
    # 2. Save the PDF file
    # 3. Process it with the benefit extractor
    # 4. Return the results
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'success': True,
            'result': {
                'carrier_name': 'Example Insurance',
                'plan_name': 'Standard PPO',
                'deductible': {
                    'individual_in_network': '$1,000',
                    'family_in_network': '$2,000',
                    'individual_out_network': '$2,000',
                    'family_out_network': '$4,000'
                },
                'out_of_pocket': {
                    'individual_in_network': '$3,000',
                    'family_in_network': '$6,000',
                    'individual_out_network': '$6,000',
                    'family_out_network': '$12,000'
                },
                'coinsurance': {
                    'in_network': '20%',
                    'out_network': '40%'
                },
                'office_visits': {
                    'primary_care_in_network': '$25',
                    'specialist_in_network': '$50',
                    'primary_care_out_network': '$50',
                    'specialist_out_network': '$100'
                },
                'urgent_emergency': {
                    'urgent_care_in_network': '$50',
                    'emergency_room_in_network': '$250',
                    'urgent_care_out_network': '$100',
                    'emergency_room_out_network': '$250'
                },
                'rx': {
                    'tier1': '$10',
                    'tier2': '$30',
                    'tier3': '$50',
                    'tier4': '$100'
                },
                'plan_metadata': {
                    'plan_type': 'PPO',
                    'hsa_eligible': 'No'
                }
            },
            'excel_file': 'benefits_example.xlsx'
        }),
        'headers': {'Content-Type': 'application/json'}
    }

def load_api_keys():
    """Load API keys from file"""
    if os.path.exists('api_keys.json'):
        try:
            with open('api_keys.json', 'r') as f:
                return json.load(f)
        except:
            return {}
    return {}

# Make handler compatible with different serverless platforms
def handler(event, context):
    return lambda_handler(event, context)
