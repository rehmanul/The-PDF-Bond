import json
import os
import base64
from urllib.parse import parse_qs
import tempfile
import sys
import traceback
from datetime import datetime

def load_api_keys():
    """Load API keys from the JSON file."""
    if os.path.exists('api_keys.json'):
        try:
            with open('api_keys.json', 'r') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_api_keys(keys):
    """Save API keys to the JSON file."""
    keys['updated_at'] = datetime.now().isoformat()
    with open('api_keys.json', 'w') as f:
        json.dump(keys, f)
    return True

def handler(event, context):
    try:
        # Parse path to determine which function to call
        path = event['path']
        path_parts = path.split('/')
        function_name = path_parts[-1] if len(path_parts) > 0 else ''

        # Set CORS headers
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        }

        # Handle OPTIONS request (CORS preflight)
        if event['httpMethod'] == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': ''
            }

        # Route to appropriate function
        if function_name == 'extract-benefits':
            return extract_benefits(event, headers)
        elif function_name == 'save-api-key':
            return save_api_key(event, headers)
        elif function_name == 'get-api-keys':
            return get_api_keys(event, headers)
        elif function_name == 'delete-api-key':
            return delete_api_key(event, headers)
        elif function_name == 'upload':
            return process_upload(event, headers)
        elif function_name == 'download':
            filename = path_parts[-2] if len(path_parts) > 1 else ''
            return download_file(filename, headers)

        elif path == '' or path == '/':
            response = {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'PDF Bond API',
                    'status': 'online',
                    'endpoints': [
                        '/save-api-key',
                        '/get-api-keys',
                        '/delete-api-key',
                        '/upload',
                        '/extract-benefits',
                        '/download/{filename}'
                    ]
                }),
                'headers': {
                    'Content-Type': 'application/json'
                }
            }
            return response

        else:
            # Default response for unhandled routes
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({
                    'success': False,
                    'error': f'Route not found: {path}'
                })
            }

    except Exception as e:
        # Log the full error for debugging
        print(f"Error in API handler: {str(e)}")
        print(traceback.format_exc())

        # Return a formatted error response
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': False,
                'error': f'Server error: {str(e)}'
            })
        }

def extract_benefits(event, headers):
    """Extract benefits from uploaded insurance document"""
    try:
        # Parse multipart form data
        content_type = event.get('headers', {}).get('content-type', '')

        if not content_type.startswith('multipart/form-data'):
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'success': False,
                    'error': 'Invalid content type. Expected multipart/form-data.'
                })
            }

        # This is a simplified approach - in a real implementation, you'd need to parse multipart/form-data properly
        # For demo purposes, we'll return sample benefit data

        sample_benefits = [
            {
                "type": "Medical",
                "deductible": "$500",
                "out_of_pocket_max": "$3,000",
                "copay": "$25",
                "coinsurance": "20%"
            },
            {
                "type": "Dental",
                "deductible": "$50",
                "annual_maximum": "$1,500",
                "preventive_coverage": "100%",
                "basic_services": "80%",
                "major_services": "50%"
            },
            {
                "type": "Vision",
                "exam_copay": "$10",
                "frame_allowance": "$150",
                "lens_copay": "$25",
                "contact_allowance": "$150"
            }
        ]

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'benefits': sample_benefits
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'success': False,
                'error': f'Error processing benefits: {str(e)}'
            })
        }

def save_api_key(event, headers):
    """Save API key to server"""
    try:
        # Parse form data from multipart/form-data request
        if event.get('isBase64Encoded', False):
            decoded_body = base64.b64decode(event['body']).decode('utf-8')
        else:
            decoded_body = event['body']
            
        # Check if it's a form submission or JSON
        content_type = event.get('headers', {}).get('content-type', '')
        
        if 'application/json' in content_type:
            body = json.loads(decoded_body)
            name = body.get('name')
            key = body.get('key')
        else:
            # Simple form parsing (this is a simplified approach)
            form_data = parse_qs(decoded_body)
            name = form_data.get('name', [''])[0]
            key = form_data.get('key', [''])[0]

        if not name or not key:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': 'API name and key are required'})
            }
            
        api_keys = load_api_keys()
        # Convert to list format expected by the frontend
        if 'keys' not in api_keys:
            api_keys['keys'] = []
            
        # Check if key already exists and update it
        key_exists = False
        for existing_key in api_keys.get('keys', []):
            if existing_key.get('name') == name:
                existing_key['key'] = key
                key_exists = True
                break
                
        # If key doesn't exist, add it
        if not key_exists:
            api_keys['keys'].append({'name': name, 'key': key})
            
        save_api_keys(api_keys)
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'message': 'API key saved successfully'
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'success': False,
                'error': f'Error saving API key: {str(e)}'
            })
        }

def get_api_keys(event, headers):
    """Get saved API keys"""
    try:
        api_keys = load_api_keys()
        # Ensure we have the right structure for the frontend
        if 'keys' not in api_keys:
            keys_list = []
            # Convert old format to new format if needed
            for name, key in api_keys.items():
                if name != 'updated_at':
                    keys_list.append({'name': name, 'key': key})
            response_keys = keys_list
        else:
            response_keys = api_keys.get('keys', [])
            
        # Add Content-Type header for JSON response
        response_headers = headers.copy()
        response_headers['Content-Type'] = 'application/json'
            
        return {
            'statusCode': 200,
            'headers': response_headers,
            'body': json.dumps({
                'success': True,
                'keys': response_keys
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'success': False,
                'error': f'Error retrieving API keys: {str(e)}'
            })
        }

def delete_api_key(event, headers):
    """Delete an API key"""
    try:
        # Parse form data from multipart/form-data request
        if event.get('isBase64Encoded', False):
            decoded_body = base64.b64decode(event['body']).decode('utf-8')
        else:
            decoded_body = event['body']
        
        # Check if it's a form submission or JSON
        content_type = event.get('headers', {}).get('content-type', '')
        
        if 'application/json' in content_type:
            body = json.loads(decoded_body)
            name = body.get('name')
        else:
            # Simple form parsing
            form_data = parse_qs(decoded_body)
            name = form_data.get('name', [''])[0]
        
        if not name:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'success': False,
                    'error': 'API key name is required'
                })
            }

        api_keys = load_api_keys()
        
        # Handle the different possible structures
        if 'keys' in api_keys:
            # New format
            key_found = False
            new_keys = []
            for key in api_keys['keys']:
                if key.get('name') != name:
                    new_keys.append(key)
                else:
                    key_found = True
            
            if key_found:
                api_keys['keys'] = new_keys
                save_api_keys(api_keys)
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'success': True,
                        'message': 'API key deleted successfully'
                    })
                }
        else:
            # Old format
            if name in api_keys:
                del api_keys[name]
                save_api_keys(api_keys)
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'success': True,
                        'message': 'API key deleted successfully'
                    })
                }
                
        # Key not found
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({
                'success': False,
                'error': 'API key not found'
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'success': False,
                'error': f'Error deleting API key: {str(e)}'
            })
        }

def process_upload(event, headers):
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
        'headers': headers
    }

def download_file(filename, headers):
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