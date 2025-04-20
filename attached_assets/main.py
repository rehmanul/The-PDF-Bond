import os
import json
import tempfile
import logging
import uuid
import io
import requests
import shutil
from datetime import datetime
from typing import Dict, List, Any, Tuple
from flask import Flask, render_template, request, jsonify, send_file, send_from_directory, session, redirect, url_for
from werkzeug.utils import secure_filename

# Import utility modules
from utils.api_keys import load_api_keys, save_api_key, delete_api_key
from utils.perplexity_api import analyze_text_with_perplexity
from utils.pdf_processor import PDFProcessor

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

            # Create processor and extract PDF content
            processor = PDFProcessor(file_path)
            text_content = processor.extract_text()[1]  # Use pdfplumber text (index 1)
            tables = processor.extract_tables()

            # Extract benefit information
            try:
                benefit_info = extract_benefit_information(text_content, tables)
            except Exception as e:
                logger.error(f"Error in primary benefit extraction: {str(e)}")
                # Try simplified extraction
                benefit_info = simple_extract_benefit_information(text_content)

            # Create an Excel file with the extracted data
            try:
                excel_filename = f"benefits_{uuid.uuid4().hex[:8]}.xlsx"
                excel_path = os.path.join(app.config['DOWNLOAD_FOLDER'], excel_filename)
                create_benefit_excel({"results": [benefit_info]}, excel_path)

                return jsonify({
                    "success": True,
                    "result": benefit_info,
                    "excel_file": excel_filename
                })
            except Exception as e:
                logger.error(f"Error creating Excel file: {str(e)}")
                return jsonify({
                    "success": True,
                    "result": benefit_info,
                    "error": f"Could not create Excel file: {str(e)}"
                })

        return jsonify({"success": False, "error": "Invalid file format"})

    except Exception as e:
        logger.error(f"Benefit extraction error: {str(e)}")
        return jsonify({"success": False, "error": f"Benefit extraction error: {str(e)}"})

def extract_benefit_information(text_content, tables):
    """
    Extract insurance benefit information from PDF text and tables.
    Uses a temporary file to leverage the full BenefitExtractor class.
    """
    try:
        # Import here to avoid circular imports
        from utils.benefit_extractor import BenefitExtractor

        # Create a temporary file to pass to the BenefitExtractor
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_path = temp_file.name

        # Since we don't actually have the PDF content, we'll create a stub
        # and the BenefitExtractor will use our text and tables directly
        with open(temp_path, 'wb') as f:
            f.write(b'PDF stub for benefit extraction')

        # Initialize the extractor with our temporary file
        extractor = BenefitExtractor(temp_path)

        # Override the extracted text and tables with our data
        extractor.text = text_content
        if tables:
            extractor.tables = tables

        # Extract benefits
        extractor._extract_benefits()

        # Get formatted results
        benefits = extractor.get_formatted_benefits()

        # Clean up the temporary file
        try:
            os.unlink(temp_path)
        except:
            pass

        return benefits
    except Exception as e:
        logger.error(f"Error in benefit extraction: {str(e)}")
        raise

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
            "primary_care_in_network": find_benefit(text_content, ["primary care", "pcp"]),
            "specialist_in_network": find_benefit(text_content, ["specialist"]),
            "primary_care_out_network": "Not found",
            "specialist_out_network": "Not found"
        },
        "urgent_emergency": {
            "urgent_care_in_network": find_benefit(text_content, ["urgent care"]),
            "emergency_room_in_network": find_benefit(text_content, ["emergency room", "er visit"]),
            "urgent_care_out_network": "Not found",
            "emergency_room_out_network": "Not found"
        },
        "rx": {
            "tier1": find_benefit(text_content, ["tier 1", "generic"]),
            "tier2": find_benefit(text_content, ["tier 2", "preferred brand"]),
            "tier3": find_benefit(text_content, ["tier 3", "non-preferred brand"]),
            "tier4": find_benefit(text_content, ["tier 4", "specialty"])
        },
        "plan_metadata": {
            "plan_type": "PPO" if "PPO" in text_content else "HMO" if "HMO" in text_content else "Unknown",
            "hsa_eligible": "Yes" if "HSA" in text_content else "No"
        }
    }

    return benefits

def find_benefit(text, keywords):
    """Find benefit value by searching for keywords"""
    for keyword in keywords:
        # Try to find the keyword in the text
        idx = text.lower().find(keyword.lower())
        if idx >= 0:
            # Extract a context around the keyword
            start = max(0, idx - 10)
            end = min(len(text), idx + len(keyword) + 50)
            context = text[start:end]

            # Look for dollar amounts
            import re
            dollar_matches = re.findall(r'\$\s*[\d,]+(?:\.\d{2})?', context)
            if dollar_matches:
                return dollar_matches[0]

            # Try to find numeric values
            numeric_matches = re.findall(r'\b\d+(?:\.\d{2})?\b', context)
            if numeric_matches:
                return f"${numeric_matches[0]}"

    return "Not found"

def find_percentage(text, keywords):
    """Find percentage values"""
    for keyword in keywords:
        idx = text.lower().find(keyword.lower())
        if idx >= 0:
            # Extract a context around the keyword
            start = max(0, idx - 10)
            end = min(len(text), idx + len(keyword) + 30)
            context = text[start:end]

            # Look for percentage values
            import re
            percentage_matches = re.findall(r'\d+\s*%', context)
            if percentage_matches:
                return percentage_matches[0]

    return "Not found"

def create_benefit_excel(results, output_path):
    """Create an Excel file with extracted benefit information"""
    try:
        import pandas as pd

        # Create a writer for Excel
        writer = pd.ExcelWriter(output_path, engine='xlsxwriter')

        # Create sheets for each section
        sheet_data = {
            "Plan Information": [],
            "Deductible & OOP": [],
            "Office Visits": [],
            "Urgent & Emergency": [],
            "Prescription Drugs": []
        }

        # Process each result
        for i, result in enumerate(results["results"]):
            carrier = result.get("carrier_name", "Unknown")
            plan = result.get("plan_name", "Unknown")
            plan_label = f"{carrier} - {plan}"

            # Plan Information
            sheet_data["Plan Information"].append({
                "Plan": plan_label,
                "Carrier": carrier,
                "Plan Name": plan,
                "Plan Type": result.get("plan_metadata", {}).get("plan_type", "Unknown"),
                "HSA Eligible": result.get("plan_metadata", {}).get("hsa_eligible", "Unknown")
            })

            # Deductible & OOP
            sheet_data["Deductible & OOP"].append({
                "Plan": plan_label,
                "Individual Deductible (In-Network)": result.get("deductible", {}).get("individual_in_network", "Unknown"),
                "Family Deductible (In-Network)": result.get("deductible", {}).get("family_in_network", "Unknown"),
                "Individual Deductible (Out-of-Network)": result.get("deductible", {}).get("individual_out_network", "Unknown"),
                "Family Deductible (Out-of-Network)": result.get("deductible", {}).get("family_out_network", "Unknown"),
                "Individual OOP (In-Network)": result.get("out_of_pocket", {}).get("individual_in_network", "Unknown"),
                "Family OOP (In-Network)": result.get("out_of_pocket", {}).get("family_in_network", "Unknown"),
                "Individual OOP (Out-of-Network)": result.get("out_of_pocket", {}).get("individual_out_network", "Unknown"),
                "Family OOP (Out-of-Network)": result.get("out_of_pocket", {}).get("family_out_network", "Unknown"),
                "Coinsurance (In-Network)": result.get("coinsurance", {}).get("in_network", "Unknown"),
                "Coinsurance (Out-of-Network)": result.get("coinsurance", {}).get("out_network", "Unknown")
            })

            # Office Visits
            sheet_data["Office Visits"].append({
                "Plan": plan_label,
                "Primary Care (In-Network)": result.get("office_visits", {}).get("primary_care_in_network", "Unknown"),
                "Specialist (In-Network)": result.get("office_visits", {}).get("specialist_in_network", "Unknown"),
                "Primary Care (Out-of-Network)": result.get("office_visits", {}).get("primary_care_out_network", "Unknown"),
                "Specialist (Out-of-Network)": result.get("office_visits", {}).get("specialist_out_network", "Unknown")
            })

            # Urgent & Emergency
            sheet_data["Urgent & Emergency"].append({
                "Plan": plan_label,
                "Urgent Care (In-Network)": result.get("urgent_emergency", {}).get("urgent_care_in_network", "Unknown"),
                "Emergency Room (In-Network)": result.get("urgent_emergency", {}).get("emergency_room_in_network", "Unknown"),
                "Urgent Care (Out-of-Network)": result.get("urgent_emergency", {}).get("urgent_care_out_network", "Unknown"),
                "Emergency Room (Out-of-Network)": result.get("urgent_emergency", {}).get("emergency_room_out_network", "Unknown")
            })

            # Prescription Drugs
            sheet_data["Prescription Drugs"].append({
                "Plan": plan_label,
                "Tier 1": result.get("rx", {}).get("tier1", "Unknown"),
                "Tier 2": result.get("rx", {}).get("tier2", "Unknown"),
                "Tier 3": result.get("rx", {}).get("tier3", "Unknown"),
                "Tier 4": result.get("rx", {}).get("tier4", "Unknown")
            })

        # Write each sheet
        for sheet_name, data in sheet_data.items():
            df = pd.DataFrame(data)
            df.to_excel(writer, sheet_name=sheet_name, index=False)

            # Auto-adjust column width
            worksheet = writer.sheets[sheet_name]
            for i, col in enumerate(df.columns):
                column_width = max(df[col].astype(str).map(len).max(), len(col)) + 2
                worksheet.set_column(i, i, column_width)

        # Save the Excel file
        writer.close()
        return output_path
    except Exception as e:
        logger.error(f"Error creating Excel file: {str(e)}")
        raise

@app.route('/get-api-keys')
def get_api_keys():
    api_keys = load_api_keys()
    return jsonify(api_keys)

@app.route('/save-api-keys', methods=['POST'])
def save_api_keys():
    data = request.get_json()
    name = data.get('name')
    value = data.get('value')

    if not name or not value:
        return jsonify({"success": False, "error": "API name and value are required"})

    save_api_key(name, value)
    return jsonify({"success": True})

@app.route('/list-files')
@app.route('/.netlify/functions/api/list-files')
def list_files():
    """List all uploaded PDF files and output files"""
    uploads = []
    outputs = []

    # Get uploaded PDF files
    if os.path.exists(app.config['UPLOAD_FOLDER']):
        for filename in os.listdir(app.config['UPLOAD_FOLDER']):
            if filename.lower().endswith('.pdf'):
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                size = os.path.getsize(file_path)
                modified = datetime.fromtimestamp(os.path.getmtime(file_path))
                uploads.append(filename)

    # Get output files
    if os.path.exists(app.config['DOWNLOAD_FOLDER']):
        for filename in os.listdir(app.config['DOWNLOAD_FOLDER']):
            if filename.lower().endswith(('.txt', '.xlsx', '.json')):
                outputs.append(filename)
    
    # Create directories if they don't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['DOWNLOAD_FOLDER'], exist_ok=True)

    return jsonify({
        'uploads': uploads,
        'outputs': outputs
    })

@app.route('/clear-data', methods=['POST'])
def clear_data():
    """Clear all uploaded files and results"""
    try:
        for folder in [app.config['UPLOAD_FOLDER'], app.config['DOWNLOAD_FOLDER']]:
            for filename in os.listdir(folder):
                file_path = os.path.join(folder, filename)
                try:
                    if os.path.isfile(file_path) or os.path.islink(file_path):
                        os.unlink(file_path)
                    elif os.path.isdir(file_path):
                        shutil.rmtree(file_path)
                except Exception as e:
                    logger.error(f'Failed to delete {file_path}. Reason: {e}')
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/create-zip')
def create_zip():
    """Create a zip file of all results"""
    try:
        import zipfile

        # Create a zip filename with timestamp
        zip_filename = f"pdf_scraper_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
        zip_path = os.path.join(app.config['DOWNLOAD_FOLDER'], zip_filename)

        # Create the zip file
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            # Add files from upload folder
            for folder, subfolders, files in os.walk(app.config['UPLOAD_FOLDER']):
                for file in files:
                    if file.lower().endswith('.pdf'):
                        file_path = os.path.join(folder, file)
                        zipf.write(file_path, os.path.join('uploads', file))

            # Add files from download folder
            for folder, subfolders, files in os.walk(app.config['DOWNLOAD_FOLDER']):
                for file in files:
                    if file != zip_filename:  # Don't include the zip file itself
                        file_path = os.path.join(folder, file)
                        zipf.write(file_path, os.path.join('downloads', file))

        return jsonify({
            "success": True,
            "filename": zip_filename
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })

@app.route('/download-project')
def download_project():
    """Download the entire project as a zip file"""
    try:
        # Check if the zip file exists
        project_zip = "pdf-bond-export.tar.gz"
        if os.path.exists(project_zip):
            return send_file(project_zip, as_attachment=True)
        else:
            return jsonify({
                "success": False,
                "error": "Project archive not found"
            })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })

def generate_default_logo():
    """Generate a simple PDF logo if none exists"""
    try:
        from PIL import Image, ImageDraw, ImageFont
        import math
        
        # Check if the file already exists
        logo_path = 'static/img/pdf-logo.png'
        if os.path.exists(logo_path):
            return

        # Ensure directory exists
        os.makedirs(os.path.dirname(logo_path), exist_ok=True)

        # Create a blank image with transparent background
        width, height = 200, 200
        img = Image.new('RGBA', (width, height), (255, 255, 255, 0))
        draw = ImageDraw.Draw(img)

        # Draw a red document shape
        margin = 20
        draw.rectangle([margin, margin, width-margin, height-margin], 
                      fill=(220, 50, 50), outline=(180, 30, 30), width=2)
        
        # Add a folded corner
        corner_size = 40
        draw.polygon([
            (width-margin-corner_size, margin),
            (width-margin, margin+corner_size),
            (width-margin, margin),
        ], fill=(180, 30, 30))

        # Add text "PDF"
        try:
            # Try to use default font
            font = ImageFont.load_default()
            font_size = 50
            text = "PDF"
            text_width = draw.textlength(text, font=font)
            text_x = (width - text_width) / 2
            text_y = height / 2 - 25
            draw.text((text_x, text_y), text, fill=(255, 255, 255), font=font)
        except Exception as e:
            logger.error(f"Font error: {e}")
            # Fallback: Draw "PDF" as simple shapes
            x = width / 2 - 40
            y = height / 2 - 20
            for letter in "PDF":
                draw.rectangle([x, y, x+20, y+40], fill=(255, 255, 255))
                x += 30

        # Save the image to multiple locations for redundancy
        try:
            img.save(logo_path)
            img.save('static/images/pdf-logo.png', create_directories=True)
            img.save('generated-icon.png')
            
            # Also create a copy in a directory that might be more accessible
            os.makedirs('static/images', exist_ok=True)
            img.save('static/images/pdf-logo.png')
        except Exception as e:
            logger.error(f"Error saving logo: {e}")
            
    except Exception as e:
        logger.error(f"Failed to generate logo: {e}")
        # Create an empty file as placeholder
        try:
            os.makedirs('static/img', exist_ok=True)
            with open('static/img/pdf-logo.png', 'wb') as f:
                f.write(b'')
        except:
            pass

# Generate the logo if needed
try:
    generate_default_logo()
except Exception as e:
    logger.error(f"Failed to generate logo: {e}")

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)