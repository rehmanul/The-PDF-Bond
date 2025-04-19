import os
import json
import tempfile
import logging
import uuid
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_from_directory, session, redirect, url_for
from werkzeug.utils import secure_filename
import pandas as pd
import io

# Import utility modules
from utils.pdf_extractor import extract_pdf_text, extract_pdf_tables, extract_pdf_metadata
from utils.perplexity_api import analyze_text_with_perplexity
from utils.api_keys import load_api_keys, save_api_key, delete_api_key

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "pdf-scraper-secret-key")

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
DOWNLOAD_FOLDER = 'downloads'
ALLOWED_EXTENSIONS = {'pdf'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(DOWNLOAD_FOLDER):
    os.makedirs(DOWNLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['DOWNLOAD_FOLDER'] = DOWNLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

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
        
        success = save_api_key(name, value)
        if success:
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "error": "Failed to save API key"})
    
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
                from utils.pdf_processor import PDFProcessor
                
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
                
                # Check if we should analyze with Perplexity
                use_perplexity = request.form.get('use_perplexity', 'false').lower() == 'true'
                
                if use_perplexity:
                    api_keys = load_api_keys()
                    perplexity_key = api_keys.get('perplexity')
                    
                    if perplexity_key:
                        try:
                            processor.analyze_with_perplexity(perplexity_key)
                        except Exception as e:
                            logger.error(f"Perplexity API error: {str(e)}")
                            processor.perplexity_analysis = {
                                "error": "Failed to analyze with Perplexity API", 
                                "details": str(e)
                            }
                    else:
                        processor.perplexity_analysis = {
                            "error": "Perplexity API key not found", 
                            "details": "Please add your Perplexity API key in the API Keys section"
                        }
                
                # Get JSON-serializable results
                results = processor.to_json()
                
                # Save results to a JSON file
                json_filename = filename.replace('.pdf', '_results.json')
                with open(os.path.join(app.config['DOWNLOAD_FOLDER'], json_filename), 'w', encoding='utf-8') as f:
                    json.dump(results, f, indent=2, default=str)
                
                # Store in session for redirect
                session['results'] = results
                
                return jsonify({
                    "success": True,
                    "redirect": url_for('show_results')
                })
                
            except Exception as e:
                logger.exception("Error processing PDF")
                return jsonify({"success": False, "error": str(e)})
        
        return jsonify({"success": False, "error": "Invalid file type. Please upload a PDF file."})
    
    except Exception as e:
        logger.exception("Exception in upload handler")
        return jsonify({"success": False, "error": str(e)})

@app.route('/results')
def show_results():
    results = session.get('results')
    if not results:
        return redirect(url_for('index'))
    
    return render_template('results.html', results=results)

@app.route('/download/<filename>')
def download_file(filename):
    return send_from_directory(app.config['DOWNLOAD_FOLDER'], filename, as_attachment=True)

@app.route('/benefit-extraction')
def benefit_extraction():
    return render_template('benefit_extraction.html')

@app.route('/extract-benefits', methods=['POST'])
def extract_benefits():
    try:
        files = request.files.getlist('files[]')
        
        if not files or files[0].filename == '':
            return jsonify({
                "success": False,
                "error": "No files provided"
            })
        
        # Process each PDF for benefit extraction
        results = []
        pdf_paths = []
        
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                
                # Save to temp file
                with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp:
                    temp_path = temp.name
                    file.save(temp_path)
                    pdf_paths.append(temp_path)
                
                try:
                    # Use PDFProcessor for a more robust extraction
                    from utils.pdf_processor import PDFProcessor
                    processor = PDFProcessor(temp_path)
                    
                    # Extract benefits using the dedicated extractor
                    benefit_data = processor.extract_benefits()
                    
                    # Ensure benefit_data is JSON serializable
                    try:
                        # Test if it's serializable
                        json.dumps(benefit_data)
                    except (TypeError, ValueError):
                        # Convert non-serializable values to strings
                        fixed_data = {}
                        for k, v in benefit_data.items():
                            if v is None:
                                fixed_data[k] = "Not Found"
                            else:
                                try:
                                    # Test each value
                                    json.dumps({k: v})
                                    fixed_data[k] = v
                                except (TypeError, ValueError):
                                    fixed_data[k] = str(v)
                        benefit_data = fixed_data
                    
                    results.append({
                        "filename": filename,
                        "benefits": benefit_data
                    })
                    
                except Exception as pdf_e:
                    logger.error(f"Error processing {filename}: {str(pdf_e)}")
                    # Still add to results, but with error information
                    results.append({
                        "filename": filename,
                        "benefits": {"error": str(pdf_e)}
                    })
        
        # Create an Excel file with multiple sheets for each PDF and a summary
        try:
            # Use the multi-PDF processor if it's available
            from utils.pdf_processor import process_multiple_pdfs_for_benefits
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            excel_filename = f"benefits_extraction_{timestamp}.xlsx"
            excel_path = os.path.join(app.config['DOWNLOAD_FOLDER'], excel_filename)
            
            process_multiple_pdfs_for_benefits(pdf_paths, excel_path)
            
        except Exception as excel_e:
            logger.error(f"Error creating Excel with multi-PDF processor: {str(excel_e)}")
            # Fallback to our original method
            excel_buffer = create_benefit_excel(results)
            
            # Save the Excel file for download
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            excel_filename = f"benefits_extraction_{timestamp}.xlsx"
            excel_path = os.path.join(app.config['DOWNLOAD_FOLDER'], excel_filename)
            
            with open(excel_path, 'wb') as f:
                f.write(excel_buffer.getvalue())
        
        # Clean up temp files
        for path in pdf_paths:
            try:
                if os.path.exists(path):
                    os.unlink(path)
            except Exception as e:
                logger.error(f"Error removing temp file {path}: {str(e)}")
        
        # Final check to ensure the entire response is serializable
        try:
            response_data = {
                "success": True,
                "message": f"Successfully processed {len(results)} PDF file(s)",
                "download_url": url_for('download_file', filename=excel_filename)
            }
            # Test if it's serializable
            json.dumps(response_data)
            return jsonify(response_data)
        except (TypeError, ValueError) as e:
            logger.error(f"Error serializing response: {str(e)}")
            return jsonify({
                "success": True,
                "message": f"Successfully processed {len(results)} PDF file(s), but some results may be incomplete",
                "download_url": url_for('download_file', filename=excel_filename)
            })
    
    except Exception as e:
        logger.exception("Error processing benefits")
        return jsonify({
            "success": False,
            "error": f"Error processing benefits: {str(e)}"
        })

def extract_benefit_information(text_content, tables):
    """
    Extract insurance benefit information from PDF text and tables.
    Uses a temporary file to leverage the full BenefitExtractor class.
    """
    try:
        from utils.benefit_extractor import BenefitExtractor
        import tempfile
        
        # Create a temporary PDF file with the extracted text
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_pdf:
            temp_path = temp_pdf.name
        
        # Use the BenefitExtractor class for comprehensive extraction
        extractor = BenefitExtractor(temp_path)
        
        # Manually set the text since we're using a temp file
        extractor.text = text_content
        
        # Format tables to be compatible with BenefitExtractor
        formatted_tables = []
        for table_data in tables:
            if 'data' in table_data and 'columns' in table_data:
                df = pd.DataFrame(table_data['data'], columns=table_data['columns'])
                formatted_tables.append(df)
        
        extractor.tables = formatted_tables
        
        # Extract benefits
        extractor._identify_carrier_and_plan()
        extractor._extract_benefits()
        benefits = extractor.get_formatted_benefits()
        
        # Clean up temp file
        import os
        if os.path.exists(temp_path):
            os.unlink(temp_path)
        
        return benefits
    
    except Exception as e:
        logger.error(f"Error in advanced benefit extraction: {str(e)}. Falling back to simple extraction.")
        # Fallback to simple extraction in case of errors
        return simple_extract_benefit_information(text_content)

def simple_extract_benefit_information(text_content):
    """
    Simplified extraction as a fallback method.
    """
    benefits = {
        "deductible_individual_in": find_benefit(text_content, ["individual deductible", "deductible individual", "in-network individual deductible"]),
        "deductible_family_in": find_benefit(text_content, ["family deductible", "deductible family", "in-network family deductible"]),
        "deductible_individual_out": find_benefit(text_content, ["out-of-network individual deductible", "individual deductible out"]),
        "deductible_family_out": find_benefit(text_content, ["out-of-network family deductible", "family deductible out"]),
        "out_of_pocket_individual_in": find_benefit(text_content, ["individual out-of-pocket maximum", "in-network individual out-of-pocket"]),
        "out_of_pocket_family_in": find_benefit(text_content, ["family out-of-pocket maximum", "in-network family out-of-pocket"]),
        "coinsurance_in": find_percentage(text_content, ["coinsurance", "in-network coinsurance"]),
        "pcp_copay": find_benefit(text_content, ["primary care visit", "pcp visit", "primary care physician"]),
        "specialist_copay": find_benefit(text_content, ["specialist visit", "specialist copay"]),
        "emergency_room": find_benefit(text_content, ["emergency room", "er", "emergency department"]),
        "urgent_care": find_benefit(text_content, ["urgent care", "urgentcare"]),
        "rx_tier1": find_benefit(text_content, ["tier 1", "generic drugs", "preferred generic"]),
        "rx_tier2": find_benefit(text_content, ["tier 2", "preferred brand"]),
        "rx_tier3": find_benefit(text_content, ["tier 3", "non-preferred brand"]),
        "rx_tier4": find_benefit(text_content, ["tier 4", "specialty drugs", "specialty tier"])
    }
    
    # Check for HSA plan
    is_hsa = "HSA" in text_content.upper() or "HEALTH SAVINGS ACCOUNT" in text_content.upper()
    
    # Format benefits according to rules
    for key, value in benefits.items():
        if value:
            # Format dollar amounts
            if "$" in value and is_hsa and not key.startswith("rx_"):
                benefits[key] = value + " after deductible"
            elif "%" in value and "deductible" not in value.lower():
                benefits[key] = value + " after deductible"
    
    # Set preventive care to 0%
    benefits["preventive_care_in"] = "0%"
    
    # Emergency room out-of-network matches in-network
    benefits["emergency_room_out"] = benefits["emergency_room"]
    
    return benefits

def find_benefit(text, keywords):
    """Find benefit value by searching for keywords"""
    for keyword in keywords:
        pattern = r'(?i)' + keyword + r'.*?(\$\d+(?:,\d+)?(?:\.\d+)?|(?:\d+)%)'
        import re
        match = re.search(pattern, text)
        if match:
            return match.group(1)
    return None

def find_percentage(text, keywords):
    """Find percentage values"""
    for keyword in keywords:
        pattern = r'(?i)' + keyword + r'.*?(\d+%)'
        import re
        match = re.search(pattern, text)
        if match:
            return match.group(1)
    return None

def create_benefit_excel(results):
    """Create an Excel file with extracted benefit information"""
    buffer = io.BytesIO()
    
    with pd.ExcelWriter(buffer) as writer:
        # Create a DataFrame for each PDF
        for i, result in enumerate(results):
            benefits = result["benefits"]
            df = pd.DataFrame([benefits])
            
            # Add filename as first column
            df.insert(0, 'Filename', result["filename"])
            
            df.to_excel(writer, sheet_name=f'PDF {i+1}', index=False)
        
        # Create a summary sheet
        summary_data = []
        for result in results:
            row = {'Filename': result["filename"]}
            row.update(result["benefits"])
            summary_data.append(row)
        
        if summary_data:
            summary_df = pd.DataFrame(summary_data)
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
    
    buffer.seek(0)
    return buffer

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
