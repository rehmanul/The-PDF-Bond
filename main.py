<<<<<<< HEAD
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
=======

import os
import PyPDF2
import pdfplumber
import pandas as pd
import requests
from typing import Dict, List, Any
from flask import Flask, render_template, request, jsonify, send_file, redirect, url_for
import json
import shutil
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['OUTPUT_FOLDER'] = 'outputs'
app.config['API_KEYS_FILE'] = 'api_keys.json'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Ensure necessary directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

# Load saved API keys
def load_api_keys():
    if os.path.exists(app.config['API_KEYS_FILE']):
        try:
            with open(app.config['API_KEYS_FILE'], 'r') as f:
                return json.load(f)
        except:
            return {}
    return {}

# Save API key
def save_api_key(key_name, key_value):
    api_keys = load_api_keys()
    api_keys[key_name] = key_value
    with open(app.config['API_KEYS_FILE'], 'w') as f:
        json.dump(api_keys, f)

class PDFScraper:
    def __init__(self, pdf_path: str, use_perplexity=False, api_key=None):
        self.pdf_path = pdf_path
        self.use_perplexity = use_perplexity
        self.perplexity_api_key = api_key
        
    def extract_text_pypdf(self) -> str:
        """Extract text using PyPDF2"""
        try:
            with open(self.pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ''
                for page in reader.pages:
                    try:
                        text += page.extract_text() + '\n'
                    except Exception as e:
                        text += f"[Error extracting page: {str(e)}]\n"
            return text
        except Exception as e:
            return f"Error with PyPDF2 extraction: {str(e)}"

    def extract_text_pdfplumber(self) -> str:
        """Extract text using pdfplumber (better for complex layouts)"""
        try:
            with pdfplumber.open(self.pdf_path) as pdf:
                text = ''
                for page in pdf.pages:
                    try:
                        extracted = page.extract_text()
                        if extracted:
                            text += extracted + '\n'
                        else:
                            text += "[No text found on page]\n"
                    except Exception as e:
                        text += f"[Error extracting page: {str(e)}]\n"
            return text
        except Exception as e:
            return f"Error with pdfplumber extraction: {str(e)}"

    def extract_tables(self) -> List[pd.DataFrame]:
        """Extract tables from PDF"""
        tables = []
        try:
            with pdfplumber.open(self.pdf_path) as pdf:
                for i, page in enumerate(pdf.pages):
                    try:
                        page_tables = page.extract_tables()
                        if page_tables:
                            for table in page_tables:
                                if table:  # Ensure table is not empty
                                    tables.append(pd.DataFrame(table))
                    except Exception as e:
                        print(f"Error extracting tables from page {i}: {str(e)}")
        except Exception as e:
            print(f"Error with table extraction: {str(e)}")
        return tables

    def extract_metadata(self) -> Dict[str, Any]:
        """Extract PDF metadata"""
        try:
            with open(self.pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                return reader.metadata
        except Exception as e:
            return {"error": str(e)}

    def get_page_count(self) -> int:
        """Get the number of pages in the PDF"""
        try:
            with open(self.pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                return len(reader.pages)
        except Exception as e:
            return 0

def analyze_text_with_perplexity(text, api_key):
    """Use Perplexity API to analyze and summarize text"""
    if not api_key:
        return {"error": "No Perplexity API key provided"}
    
    try:
        api_url = "https://api.perplexity.ai/chat/completions"
        
        payload = {
            "model": "llama-3-sonar-large-32k-online",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an AI that specializes in extracting key information from documents. Analyze the given text and provide a clear summary, key points, and any important data."
                },
                {
                    "role": "user",
                    "content": f"Please analyze and summarize the following text from a PDF document: {text[:4000]}"
                }
            ],
            "max_tokens": 1000
        }
        
        headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": f"Bearer {api_key}"
        }
        
        response = requests.post(api_url, json=payload, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            return {
                "summary": result.get("choices", [{}])[0].get("message", {}).get("content", "No summary generated"),
                "model": result.get("model", ""),
                "tokens": result.get("usage", {})
            }
        else:
            return {"error": f"API request failed with status code: {response.status_code}", "details": response.text}
    
    except Exception as e:
        return {"error": f"Error in API request: {str(e)}"}

def process_pdf(file_path: str, use_perplexity=False, perplexity_api_key=None) -> Dict[str, Any]:
    """Process a single PDF and return the results"""
    filename = os.path.basename(file_path)
    scraper = PDFScraper(file_path, use_perplexity, perplexity_api_key)
    
    # Get text using both methods
    text_pypdf = scraper.extract_text_pypdf()
    text_pdfplumber = scraper.extract_text_pdfplumber()
    
    # Extract tables
    tables = scraper.extract_tables()
    tables_data = []
    for i, table in enumerate(tables):
        tables_data.append({
            "id": i + 1,
            "columns": table.columns.tolist(),
            "data": table.values.tolist()
        })
    
    # Get metadata and page count
    metadata = scraper.extract_metadata()
    page_count = scraper.get_page_count()
    
    # Analyze with Perplexity API if requested
    perplexity_analysis = None
    if scraper.use_perplexity and scraper.perplexity_api_key:
        perplexity_analysis = analyze_text_with_perplexity(text_pdfplumber, scraper.perplexity_api_key)
    
    return {
        "filename": filename,
        "page_count": page_count,
        "metadata": metadata,
        "text_pypdf": text_pypdf,
        "text_pdfplumber": text_pdfplumber,
        "tables": tables_data,
        "table_count": len(tables),
        "perplexity_analysis": perplexity_analysis
    }
>>>>>>> d52d5154cd7a505dd585cba6a48684013ba230a6

@app.route('/')
def index():
    return render_template('index.html')

<<<<<<< HEAD
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
    
    try:
        with pd.ExcelWriter(buffer) as writer:
            # Create a DataFrame for each PDF
            for i, result in enumerate(results):
                try:
                    benefits = result["benefits"]
                    
                    # Sanitize benefits data to ensure it's compatible with DataFrame
                    cleaned_benefits = {}
                    for key, value in benefits.items():
                        if value is None:
                            cleaned_benefits[key] = "Not Found"
                        else:
                            cleaned_benefits[key] = str(value)
                    
                    df = pd.DataFrame([cleaned_benefits])
                    
                    # Add filename as first column
                    df.insert(0, 'Filename', result["filename"])
                    
                    sheet_name = f'PDF {i+1}'
                    if len(sheet_name) > 31:  # Excel has a 31 character limit for sheet names
                        sheet_name = sheet_name[:31]
                        
                    df.to_excel(writer, sheet_name=sheet_name, index=False)
                except Exception as e:
                    logger.error(f"Error adding sheet for {result['filename']}: {str(e)}")
                    # Create a simple error sheet instead
                    error_df = pd.DataFrame([{'Error': str(e)}])
                    error_df.insert(0, 'Filename', result["filename"])
                    error_df.to_excel(writer, sheet_name=f'Error {i+1}'[:31], index=False)
            
            # Create a summary sheet
            try:
                summary_data = []
                for result in results:
                    row = {'Filename': result["filename"]}
                    
                    # Sanitize benefits data before adding to summary
                    benefits = result["benefits"]
                    for key, value in benefits.items():
                        if value is None:
                            row[key] = "Not Found"
                        else:
                            row[key] = str(value)
                            
                    summary_data.append(row)
                
                if summary_data:
                    summary_df = pd.DataFrame(summary_data)
                    summary_df.to_excel(writer, sheet_name='Summary', index=False)
            except Exception as e:
                logger.error(f"Error creating summary sheet: {str(e)}")
                # Create a simple error summary instead
                error_summary = pd.DataFrame([{'Error': f"Could not create summary: {str(e)}"}])
                error_summary.to_excel(writer, sheet_name='Summary Error', index=False)
    except Exception as e:
        logger.error(f"Error creating Excel file: {str(e)}")
        # Create a fallback Excel file with just error information
        with pd.ExcelWriter(buffer) as writer:
            error_df = pd.DataFrame([{'Error': f"Error creating Excel file: {str(e)}"}])
            error_df.to_excel(writer, sheet_name='Error', index=False)
    
    buffer.seek(0)
    return buffer

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
=======
@app.route('/api-keys', methods=['GET'])
def get_api_keys():
    return jsonify(load_api_keys())

@app.route('/api-keys', methods=['POST'])
def save_api_keys():
    key_name = request.json.get('name')
    key_value = request.json.get('value')
    if key_name and key_value:
        save_api_key(key_name, key_value)
        return jsonify({"success": True, "message": f"{key_name} saved successfully"})
    return jsonify({"error": "Missing key name or value"}), 400

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Only PDF files are allowed"}), 400
    
    # Check for Perplexity API usage
    use_perplexity = request.form.get('use_perplexity') == 'true'
    perplexity_api_key = request.form.get('perplexity_api_key', '')
    
    # If no API key provided but save_key is true, try to get from saved keys
    if use_perplexity and not perplexity_api_key and request.form.get('use_saved_key') == 'true':
        api_keys = load_api_keys()
        perplexity_api_key = api_keys.get('perplexity', '')
    
    # If save_key is true, save the provided API key
    if use_perplexity and perplexity_api_key and request.form.get('save_key') == 'true':
        save_api_key('perplexity', perplexity_api_key)
    
    # Save the uploaded file
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    
    # Process the PDF
    try:
        results = process_pdf(file_path, use_perplexity, perplexity_api_key)
        
        # Save results as JSON
        base_name = os.path.splitext(filename)[0]
        results_path = os.path.join(app.config['OUTPUT_FOLDER'], f"{base_name}_results.json")
        with open(results_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, default=str)
        
        # Save extracted text to files
        text_path = os.path.join(app.config['OUTPUT_FOLDER'], f"{base_name}_extracted.txt")
        with open(text_path, 'w', encoding='utf-8') as f:
            f.write(results['text_pdfplumber'])
        
        # Save tables to Excel if any found
        if results['tables']:
            excel_path = os.path.join(app.config['OUTPUT_FOLDER'], f"{base_name}_tables.xlsx")
            with pd.ExcelWriter(excel_path) as writer:
                for i, table_data in enumerate(results['tables']):
                    pd.DataFrame(table_data['data'], columns=table_data['columns']).to_excel(
                        writer, sheet_name=f'Table_{i+1}', index=False
                    )
        
        return jsonify({
            "success": True,
            "filename": filename,
            "results_json": f"{base_name}_results.json",
            "text_file": f"{base_name}_extracted.txt",
            "excel_file": f"{base_name}_tables.xlsx" if results['tables'] else None,
            "summary": {
                "page_count": results['page_count'],
                "table_count": results['table_count']
            }
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/process-directory', methods=['POST'])
def process_directory_endpoint():
    directory = request.json.get('directory', 'attached_assets')
    
    if not os.path.exists(directory):
        return jsonify({"error": f"Directory '{directory}' not found"}), 404
    
    # Check for Perplexity API usage
    use_perplexity = request.json.get('use_perplexity', False)
    perplexity_api_key = request.json.get('perplexity_api_key', '')
    
    # Try to get API key from saved keys if not provided
    if use_perplexity and not perplexity_api_key:
        api_keys = load_api_keys()
        perplexity_api_key = api_keys.get('perplexity', '')
    
    results = []
    for filename in os.listdir(directory):
        if filename.lower().endswith('.pdf'):
            file_path = os.path.join(directory, filename)
            try:
                pdf_results = process_pdf(file_path, use_perplexity, perplexity_api_key)
                
                # Save results
                base_name = os.path.splitext(filename)[0]
                
                # Save extracted text to file
                text_path = os.path.join(app.config['OUTPUT_FOLDER'], f"{base_name}_extracted.txt")
                with open(text_path, 'w', encoding='utf-8') as f:
                    f.write(pdf_results['text_pdfplumber'])
                
                # Save results as JSON
                results_path = os.path.join(app.config['OUTPUT_FOLDER'], f"{base_name}_results.json")
                with open(results_path, 'w', encoding='utf-8') as f:
                    json.dump(pdf_results, f, default=str)
                
                # Save tables to Excel if any found
                excel_path = None
                if pdf_results['tables']:
                    excel_path = os.path.join(app.config['OUTPUT_FOLDER'], f"{base_name}_tables.xlsx")
                    with pd.ExcelWriter(excel_path) as writer:
                        for i, table_data in enumerate(pdf_results['tables']):
                            pd.DataFrame(table_data['data'], columns=table_data['columns']).to_excel(
                                writer, sheet_name=f'Table_{i+1}', index=False
                            )
                
                results.append({
                    "filename": filename,
                    "success": True,
                    "page_count": pdf_results['page_count'],
                    "table_count": pdf_results['table_count'],
                    "text_file": f"{base_name}_extracted.txt",
                    "results_json": f"{base_name}_results.json",
                    "excel_file": f"{base_name}_tables.xlsx" if pdf_results['tables'] else None
                })
                
            except Exception as e:
                results.append({
                    "filename": filename,
                    "success": False,
                    "error": str(e)
                })
    
    return jsonify({"results": results})

@app.route('/download/<filename>')
def download_file(filename):
    return send_file(os.path.join(app.config['OUTPUT_FOLDER'], filename), as_attachment=True)

@app.route('/view-results/<filename>')
def view_results(filename):
    try:
        with open(os.path.join(app.config['OUTPUT_FOLDER'], filename), 'r', encoding='utf-8') as f:
            results = json.load(f)
        return render_template('results.html', results=results)
    except Exception as e:
        return f"Error: {str(e)}"

@app.route('/list-files')
def list_files():
    upload_files = [f for f in os.listdir(app.config['UPLOAD_FOLDER']) if f.lower().endswith('.pdf')]
    output_files = os.listdir(app.config['OUTPUT_FOLDER'])
    
    return jsonify({
        "uploads": upload_files,
        "outputs": output_files
    })

@app.route('/clear-data', methods=['POST'])
def clear_data():
    try:
        # Clear uploads folder
        for filename in os.listdir(app.config['UPLOAD_FOLDER']):
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            if os.path.isfile(file_path):
                os.unlink(file_path)
        
        # Clear outputs folder
        for filename in os.listdir(app.config['OUTPUT_FOLDER']):
            file_path = os.path.join(app.config['OUTPUT_FOLDER'], filename)
            if os.path.isfile(file_path):
                os.unlink(file_path)
                
        return jsonify({"success": True, "message": "All data cleared successfully"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/create-zip', methods=['POST'])
def create_zip():
    import zipfile
    from io import BytesIO
    from datetime import datetime
    
    try:
        # Get list of files to include in the zip
        file_types = request.json.get('file_types', [])
        
        if not file_types:
            return jsonify({"error": "No file types selected"}), 400
            
        # Create a BytesIO object to store the zip file
        memory_file = BytesIO()
        
        # Create a zip file in memory
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
            # Add files to the zip based on selected types
            for filename in os.listdir(app.config['OUTPUT_FOLDER']):
                include_file = False
                
                if 'text' in file_types and filename.endswith('_extracted.txt'):
                    include_file = True
                elif 'json' in file_types and filename.endswith('_results.json'):
                    include_file = True
                elif 'excel' in file_types and filename.endswith('.xlsx'):
                    include_file = True
                
                if include_file:
                    file_path = os.path.join(app.config['OUTPUT_FOLDER'], filename)
                    zf.write(file_path, arcname=filename)
        
        # Seek to the beginning of the BytesIO object
        memory_file.seek(0)
        
        # Generate a timestamp for the filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Return the zip file as a response
        return send_file(
            memory_file,
            as_attachment=True,
            download_name=f'pdf_extraction_{timestamp}.zip',
            mimetype='application/zip'
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/download-project')
def download_project():
    """Download the entire project as a zip file"""
    import zipfile
    from io import BytesIO
    from datetime import datetime
    import os
    
    try:
        # Create a BytesIO object to store the zip file
        memory_file = BytesIO()
        
        # Define directories and files to exclude
        exclude_dirs = ['.git', '__pycache__', 'venv', 'env']
        exclude_files = ['.DS_Store']
        
        # Generate a timestamp for the filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Create a zip file in memory
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk('.'):
                # Skip excluded directories
                dirs[:] = [d for d in dirs if d not in exclude_dirs]
                
                for file in files:
                    if file not in exclude_files:
                        file_path = os.path.join(root, file)
                        # Add file to zip with relative path
                        zipf.write(file_path, file_path)
        
        # Seek to the beginning of the BytesIO object
        memory_file.seek(0)
        
        # Return the zip file as a response
        return send_file(
            memory_file,
            as_attachment=True,
            download_name=f'pdf_scraper_project_{timestamp}.zip',
            mimetype='application/zip'
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)


@app.route('/generate-default-logo')
def generate_default_logo():
    """Generate a simple PDF logo if none exists"""
    from PIL import Image, ImageDraw, ImageFont
    import os
    
    logo_path = os.path.join('static', 'images', 'pdf-logo.png')
    
    # Check if logo already exists
    if os.path.exists(logo_path):
        return "Logo already exists"
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(logo_path), exist_ok=True)
    
    # Create a 100x100 image with a blue background
    img = Image.new('RGBA', (200, 200), (67, 97, 238, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw a white rounded rectangle for the PDF icon
    draw.rounded_rectangle([(50, 40), (150, 160)], 10, fill=(255, 255, 255, 255))
    
    # Draw PDF text
    draw.text((75, 80), "PDF", fill=(67, 97, 238, 255), font=None, align="center")
    
    # Add a folded corner
    draw.polygon([(120, 40), (150, 70), (120, 70)], fill=(200, 200, 200, 255))
    
    # Save the image
    img.save(logo_path)
    
    return "Default logo created at " + logo_path
>>>>>>> d52d5154cd7a505dd585cba6a48684013ba230a6
