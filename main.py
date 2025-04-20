import os
import json
import tempfile
import logging
import uuid
import io
import requests
import shutil
import pandas as pd
from datetime import datetime
from typing import Dict, List, Any, Tuple
from flask import Flask, render_template, request, jsonify, send_file, send_from_directory, session, redirect, url_for
from werkzeug.utils import secure_filename

# Import utility modules
from utils.api_keys import load_api_keys, save_api_key, delete_api_key
from utils.perplexity_api import analyze_text_with_perplexity
from utils.pdf_processor import PDFProcessor
from utils.benefit_extractor import BenefitExtractor, find_benefit, find_percentage, create_benefit_excel

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "pdf-scraper-secret-key")

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
DOWNLOAD_FOLDER = 'downloads'
ALLOWED_EXTENSIONS = {'pdf'}

# Ensure necessary directories exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(DOWNLOAD_FOLDER):
    os.makedirs(DOWNLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['DOWNLOAD_FOLDER'] = DOWNLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size
app.config['API_KEYS_FILE'] = 'api_keys.json'

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api-keys', methods=['GET', 'POST', 'DELETE'])
def manage_api_keys():
    if request.method == 'GET':
        if request.path == '/api-keys' and 'application/json' in request.headers.get('Accept', ''):
            # Return JSON response for API call
            api_keys = load_api_keys()
            return jsonify(api_keys)
        else:
            # Render HTML template
            return render_template('api_keys.html')

    elif request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        value = data.get('value')

        if not name or not value:
            return jsonify({"success": False, "error": "API name and value are required"})

        save_api_key(name, value)
        return jsonify({"success": True})

    return jsonify({"success": False, "error": "Method not allowed"})

@app.route('/api-keys/<key_name>', methods=['DELETE'])
def delete_api_key_route(key_name):
    success = delete_api_key(key_name)
    if success:
        return jsonify({"success": True})
    else:
        return jsonify({"success": False, "error": "Failed to delete API key"})

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        # Check if the post request has the file part
        if 'pdf_file' not in request.files:
            return jsonify({"success": False, "error": "No file part"})

        file = request.files['pdf_file']

        # If user does not select file, browser also submits an empty part without filename
        if file.filename == '':
            return jsonify({"success": False, "error": "No selected file"})

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

            # Process the PDF file using the unified processor
            try:
                # Create processor instance
                processor = PDFProcessor(file_path)

                # Extract all PDF data
                processor.extract_all()

                # Save extracted text to a file for download
                text_filename = filename.replace('.pdf', '_extracted.txt')
                processor.save_text_to_file(os.path.join(app.config['DOWNLOAD_FOLDER'], text_filename))

                # If tables were found, save to Excel
                if processor.tables:
                    excel_filename = filename.replace('.pdf', '_tables.xlsx')
                    excel_path = os.path.join(app.config['DOWNLOAD_FOLDER'], excel_filename)
                    processor.save_tables_to_excel(excel_path)
                else:
                    excel_filename = None

                # Check if we should analyze with Perplexity
                use_perplexity = request.form.get('use_perplexity', 'false').lower() == 'true'

                if use_perplexity:
                    api_keys = load_api_keys()
                    perplexity_key = api_keys.get('perplexity')

                    if perplexity_key:
                        try:
                            perplexity_analysis = processor.analyze_with_perplexity(perplexity_key)
                        except Exception as e:
                            perplexity_analysis = {"error": f"Perplexity analysis failed: {str(e)}"}
                    else:
                        perplexity_analysis = {"error": "No Perplexity API key found in settings"}
                else:
                    perplexity_analysis = None

                # Return results as JSON
                result = processor.to_json()
                result["perplexity_analysis"] = perplexity_analysis
                result["text_file"] = text_filename

                if processor.tables:
                    result["excel_file"] = excel_filename

                return jsonify({
                    "success": True,
                    "result": result
                })

            except Exception as e:
                logger.error(f"Error processing PDF: {str(e)}")
                return jsonify({
                    "success": False,
                    "error": f"Error processing PDF: {str(e)}"
                })

        return jsonify({"success": False, "error": "Invalid file format"})

    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        return jsonify({"success": False, "error": f"Upload error: {str(e)}"})

@app.route('/results/<filename>')
def view_results(filename):
    try:
        if not filename or not os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], filename)):
            return redirect(url_for('index'))

        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        processor = PDFProcessor(file_path)

        # Extract basic info
        result = processor.extract_all()

        # Check if any Perplexity analysis was performed
        perplexity_analysis = None
        api_keys = load_api_keys()
        perplexity_key = api_keys.get('perplexity')

        # Only show the Perplexity button if there's an API key
        has_perplexity_key = perplexity_key is not None

        # Create download file links
        text_filename = filename.replace('.pdf', '_extracted.txt')
        text_file_path = os.path.join(app.config['DOWNLOAD_FOLDER'], text_filename)

        excel_filename = filename.replace('.pdf', '_tables.xlsx')
        excel_file_path = os.path.join(app.config['DOWNLOAD_FOLDER'], excel_filename)

        has_text_file = os.path.exists(text_file_path)
        has_excel_file = os.path.exists(excel_file_path)

        return render_template(
            'results.html',
            filename=filename,
            result=processor.to_json(),
            perplexity_analysis=perplexity_analysis,
            has_perplexity_key=has_perplexity_key,
            has_text_file=has_text_file,
            text_filename=text_filename if has_text_file else None,
            has_excel_file=has_excel_file,
            excel_filename=excel_filename if has_excel_file else None
        )

    except Exception as e:
        logger.error(f"Error displaying results: {str(e)}")
        return redirect(url_for('index'))

@app.route('/download/<filename>')
def download_file(filename):
    return send_from_directory(app.config['DOWNLOAD_FOLDER'], filename, as_attachment=True)

@app.route('/benefit-extraction')
def benefit_extraction():
    return render_template('benefit_extraction.html')

@app.route('/extract-benefits', methods=['POST'])
def extract_benefits():
    try:
        # Check if the post request has the file part
        if 'pdf_file' not in request.files:
            return jsonify({"success": False, "error": "No file part"})

        file = request.files['pdf_file']

        # If user does not select file, browser also submits an empty part without filename
        if file.filename == '':
            return jsonify({"success": False, "error": "No selected file"})

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

            # Process the PDF file
            try:
                # Create extractor
                extractor = BenefitExtractor(file_path)
                
                # Extract benefits
                benefit_info = extractor.extract_benefits()

                # Create an Excel file with the extracted data
                excel_filename = f"benefits_{uuid.uuid4().hex[:8]}.xlsx"
                excel_path = os.path.join(app.config['DOWNLOAD_FOLDER'], excel_filename)
                
                # Create Excel with benefits data
                create_benefit_excel({"results": [benefit_info]}, excel_path)

                return jsonify({
                    "success": True,
                    "result": benefit_info,
                    "excel_file": excel_filename
                })
                
            except Exception as e:
                logger.error(f"Error extracting benefits: {str(e)}")
                # Try simplified extraction as a fallback
                try:
                    processor = PDFProcessor(file_path)
                    text_content = processor.extract_text()[1]  # Use pdfplumber text
                    
                    # Simple benefit extraction
                    benefit_info = simple_extract_benefit_information(text_content)
                    
                    # Create Excel
                    excel_filename = f"benefits_simple_{uuid.uuid4().hex[:8]}.xlsx"
                    excel_path = os.path.join(app.config['DOWNLOAD_FOLDER'], excel_filename)
                    create_benefit_excel({"results": [benefit_info]}, excel_path)
                    
                    return jsonify({
                        "success": True,
                        "result": benefit_info,
                        "excel_file": excel_filename,
                        "warning": "Used simplified extraction due to error in primary extraction."
                    })
                    
                except Exception as inner_e:
                    logger.error(f"Error in simplified extraction: {str(inner_e)}")
                    return jsonify({
                        "success": False,
                        "error": f"Failed to extract benefits: {str(e)}"
                    })

        return jsonify({"success": False, "error": "Invalid file format"})

    except Exception as e:
        logger.error(f"Benefit extraction error: {str(e)}")
        return jsonify({"success": False, "error": f"Benefit extraction error: {str(e)}"})

def simple_extract_benefit_information(text_content):
    """
    Simplified extraction as a fallback method.
    """
    benefits = {
        "carrier_name": "Unknown",
        "plan_name": "Unknown",
        "deductible": {
            "individual_in_network": find_benefit(text_content, ["individual deductible", "deductible individual"]),
            "family_in_network": find_benefit(text_content, ["family deductible", "deductible family"]),
            "individual_out_network": "Not found",
            "family_out_network": "Not found"
        },
        "out_of_pocket": {
            "individual_in_network": find_benefit(text_content, ["individual out-of-pocket", "out-of-pocket individual"]),
            "family_in_network": find_benefit(text_content, ["family out-of-pocket", "out-of-pocket family"]),
            "individual_out_network": "Not found",
            "family_out_network": "Not found"
        },
        "coinsurance": {
            "in_network": find_percentage(text_content, ["coinsurance", "co-insurance"]),
            "out_network": "Not found"
        },
        "office_visits": {
            "primary_care": find_benefit(text_content, ["primary care", "pcp"]),
            "specialist": find_benefit(text_content, ["specialist", "specialty care"]),
            "urgent_care": find_benefit(text_content, ["urgent care"])
        },
        "emergency_room": find_benefit(text_content, ["emergency room", "emergency department", "er visit"]),
        "hospitalization": find_benefit(text_content, ["inpatient", "hospital", "hospitalization"])
    }
    
    return benefits

@app.route('/analyze-with-perplexity', methods=['POST'])
def analyze_with_perplexity():
    try:
        data = request.get_json()
        filename = data.get('filename')
        query = data.get('query', 'Analyze this document and provide key insights')
        
        if not filename:
            return jsonify({"success": False, "error": "No filename provided"})
            
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(file_path):
            return jsonify({"success": False, "error": "File not found"})
            
        processor = PDFProcessor(file_path)
        processor.extract_text()
        
        api_keys = load_api_keys()
        perplexity_key = api_keys.get('perplexity')
        
        if not perplexity_key:
            return jsonify({"success": False, "error": "No Perplexity API key found in settings"})
            
        analysis = processor.analyze_with_perplexity(perplexity_key, custom_query=query)
        
        return jsonify({
            "success": True,
            "analysis": analysis
        })
        
    except Exception as e:
        logger.error(f"Perplexity analysis error: {str(e)}")
        return jsonify({"success": False, "error": f"Analysis error: {str(e)}"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
