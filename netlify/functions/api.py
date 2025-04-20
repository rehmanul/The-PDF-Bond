#!/usr/bin/env python3
import json
import sys
import os
import base64
import io
import re
from datetime import datetime

# Function to handle API requests
def handle_request(path, method, body):
    """
    Handle API requests for Netlify functions
    """
    response = {
        "success": True,
        "timestamp": datetime.now().isoformat(),
        "path": path,
        "method": method
    }
    
    # Extract the action from the path
    action = path.split("/")[-1] if path else "home"
    
    if action == "extract-text":
        if method != "POST":
            return {"success": False, "error": "Method not allowed"}
        
        # Parse the body
        try:
            data = json.loads(body) if body else {}
            if not data.get("text"):
                return {"success": False, "error": "No text provided"}
                
            # Simple processing
            response["result"] = {
                "text": data.get("text"),
                "word_count": len(data.get("text", "").split()),
                "char_count": len(data.get("text", "")),
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
            
    elif action == "analyze":
        if method != "POST":
            return {"success": False, "error": "Method not allowed"}
            
        try:
            data = json.loads(body) if body else {}
            if not data.get("text"):
                return {"success": False, "error": "No text provided"}
                
            # Simulate analysis
            response["result"] = {
                "analysis": "This is a simulated analysis of the provided text.",
                "sentiment": "neutral"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
            
    elif action == "extract-benefits":
        if method != "POST":
            return {"success": False, "error": "Method not allowed"}
            
        try:
            data = json.loads(body) if body else {}
            if not data.get("text_content"):
                return {"success": False, "error": "No text content provided"}
                
            # Simulated benefit extraction
            # In the actual application, this would use the mass_upload_formatter
            benefits = {
                "carrier_name": "Sample Insurance Co.",
                "plan_name": data.get("plan_name", "Standard PPO Plan"),
                "deductible": {
                    "individual_in_network": "$1,500",
                    "family_in_network": "$3,000",
                    "individual_out_network": "$3,000",
                    "family_out_network": "$6,000"
                },
                "coinsurance": {
                    "in_network": "20%",
                    "out_network": "40%"
                },
                "out_of_pocket": {
                    "individual_in_network": "$5,000",
                    "family_in_network": "$10,000",
                    "individual_out_network": "$10,000",
                    "family_out_network": "$20,000"
                },
                "office_visits": {
                    "primary_care": "$25",
                    "specialist": "$40",
                    "urgent_care": "$50"
                },
                "emergency_room": "$250, then 20% after deductible",
                "hospitalization": "20% after deductible",
                "preventive_services": {
                    "in_network": "0%",
                    "out_network": "Not Covered"
                }
            }
            
            # Check if it's an HSA plan
            if "HSA" in data.get("plan_name", "").upper():
                # Apply HSA formatting
                benefits["office_visits"]["primary_care"] += " after deductible"
                benefits["office_visits"]["specialist"] += " after deductible"
                benefits["office_visits"]["urgent_care"] += " after deductible"
            
            response["result"] = benefits
            
        except Exception as e:
            return {"success": False, "error": str(e)}
            
    elif action == "version":
        response["version"] = "1.0.0"
        response["app_name"] = "The PDF Bond API"
        
    else:
        response["endpoints"] = [
            {
                "path": "/extract-text", 
                "method": "POST", 
                "description": "Extract text information from provided content"
            },
            {
                "path": "/analyze", 
                "method": "POST", 
                "description": "Analyze text content"
            },
            {
                "path": "/extract-benefits", 
                "method": "POST", 
                "description": "Extract insurance benefit information with special formatting"
            },
            {
                "path": "/version", 
                "method": "GET", 
                "description": "Get API version information"
            }
        ]
    
    return response

# Main entry point
if __name__ == "__main__":
    # Parse arguments from the Node.js wrapper
    path = sys.argv[1] if len(sys.argv) > 1 else "/"
    method = sys.argv[2] if len(sys.argv) > 2 else "GET"
    body = sys.argv[3] if len(sys.argv) > 3 else None
    
    result = handle_request(path, method, body)
    print(json.dumps(result))