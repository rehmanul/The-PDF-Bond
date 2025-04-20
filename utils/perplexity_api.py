import requests
import json
import logging
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

def analyze_text_with_perplexity(api_key: str, text: str, query: Optional[str] = None) -> Dict[str, Any]:
    """
    Use the Perplexity API to analyze the provided text.
    
    Args:
        api_key: The Perplexity API key
        text: The text to analyze
        query: Optional custom query to use instead of the default
        
    Returns:
        Dictionary containing the analysis result
    """
    if not api_key:
        raise ValueError("Perplexity API key is required")
    
    if not text or len(text) < 10:
        raise ValueError("Text is too short for analysis")
    
    # Truncate text if it's too long
    max_text_length = 32000  # Reduce to avoid hitting token limits
    if len(text) > max_text_length:
        text = text[:max_text_length] + "...[truncated]"
    
    # Default query if none provided
    if not query:
        query = (
            "Analyze this document and extract key information. "
            "Identify main topics, important facts, and any notable insights. "
            "Format your response in clear sections with bullet points where appropriate."
        )
    
    # Prepare the prompt that includes both the query and the document text
    prompt = f"{query}\n\nDocument text:\n\n{text}"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    payload = {
        "model": "llama-3.1-sonar-small-128k-online",
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant that analyzes documents. Be precise and concise."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.2,
        "top_p": 0.9,
        "max_tokens": 2000,
        "stream": False,
        "presence_penalty": 0,
        "frequency_penalty": 1
    }
    
    try:
        response = requests.post(
            "https://api.perplexity.ai/chat/completions",
            headers=headers,
            json=payload
        )
        
        if response.status_code != 200:
            logger.error(f"Perplexity API error: {response.status_code} - {response.text}")
            return {"error": f"API error: {response.status_code}", "details": response.text}
        
        result = response.json()
        
        # Extract the content from the response
        analysis = {
            "content": result["choices"][0]["message"]["content"],
            "model": result["model"],
            "citations": result.get("citations", [])
        }
        
        return analysis
    
    except Exception as e:
        logger.error(f"Error calling Perplexity API: {str(e)}")
        return {"error": f"Error calling Perplexity API: {str(e)}"}
