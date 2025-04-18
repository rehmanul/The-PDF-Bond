
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
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Ensure necessary directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

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

@app.route('/')
def index():
    return render_template('index.html')

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
    
    results = []
    for filename in os.listdir(directory):
        if filename.lower().endswith('.pdf'):
            file_path = os.path.join(directory, filename)
            try:
                pdf_results = process_pdf(file_path)
                
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

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
