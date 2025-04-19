import requests
import json
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def analyze_text_with_perplexity(text, api_key):
    """
    Analyze PDF text using Perplexity API.
    
    Args:
        text (str): The PDF text to analyze
        api_key (str): Perplexity API key
        
    Returns:
        dict: Analysis results from Perplexity
    """
    # Truncate text if too long (max 100,000 chars as a safety measure)
    if len(text) > 100000:
        text = text[:100000] + "...[truncated]"
    
    # Set the API endpoint
    url = "https://api.perplexity.ai/chat/completions"
    
    # Format the system prompt
    system_prompt = """
    You are an expert document analyzer. Analyze the provided PDF text and provide:
    1. A concise summary of the key information (up to 5 bullet points)
    2. Main topics and themes
    3. Any important data points, figures, or statistics

    Format your response with clear sections and bullet points.
    """
    
    # Prepare the request
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "llama-3.1-sonar-small-128k-online",
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": f"Please analyze this PDF content: {text}"
            }
        ],
        "temperature": 0.2,
        "top_p": 0.9,
        "max_tokens": 1000,
        "stream": False
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        
        # Extract the important parts
        analysis = {
            "summary": result["choices"][0]["message"]["content"],
            "model": result["model"],
            "citations": result.get("citations", []),
            "tokens": result.get("usage", {})
        }
        
        return analysis
    
    except Exception as e:
        logger.error(f"Error calling Perplexity API: {str(e)}")
        if hasattr(e, 'response') and e.response:
            logger.error(f"Response status: {e.response.status_code}")
            logger.error(f"Response body: {e.response.text}")
        
        raise Exception(f"Perplexity API error: {str(e)}")
