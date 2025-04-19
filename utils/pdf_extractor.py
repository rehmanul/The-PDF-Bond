import io
import logging
import PyPDF2
import pdfplumber
import pandas as pd

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def extract_pdf_text(pdf_path):
    """
    Extract text from a PDF file using both PyPDF2 and pdfplumber.
    
    Args:
        pdf_path (str): Path to the PDF file
        
    Returns:
        tuple: (PyPDF2 extracted text, pdfplumber extracted text)
    """
    # PyPDF2 extraction
    pypdf_text = ""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page_num in range(len(reader.pages)):
                page = reader.pages[page_num]
                pypdf_text += page.extract_text() + "\n\n"
    except Exception as e:
        logger.error(f"Error extracting text with PyPDF2: {str(e)}")
        pypdf_text = f"Error extracting text with PyPDF2: {str(e)}"
    
    # pdfplumber extraction
    pdfplumber_text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pdfplumber_text += text + "\n\n"
    except Exception as e:
        logger.error(f"Error extracting text with pdfplumber: {str(e)}")
        pdfplumber_text = f"Error extracting text with pdfplumber: {str(e)}"
    
    return pypdf_text, pdfplumber_text

def extract_pdf_tables(pdf_path):
    """
    Extract tables from a PDF file using pdfplumber.
    
    Args:
        pdf_path (str): Path to the PDF file
        
    Returns:
        list: List of dictionaries with table data and columns
    """
    tables = []
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_number, page in enumerate(pdf.pages):
                extracted_tables = page.extract_tables()
                
                for table_number, table in enumerate(extracted_tables):
                    if not table:
                        continue
                    
                    # Process the table data
                    header_row = table[0]
                    data_rows = table[1:]
                    
                    # Clean header row (replace None with empty string)
                    header_row = [col if col is not None else f"Column {i+1}" for i, col in enumerate(header_row)]
                    
                    # Clean data rows (replace None with empty string)
                    cleaned_data = []
                    for row in data_rows:
                        cleaned_row = [cell if cell is not None else "" for cell in row]
                        cleaned_data.append(cleaned_row)
                    
                    tables.append({
                        'page': page_number + 1,
                        'table_number': table_number + 1,
                        'columns': header_row,
                        'data': cleaned_data
                    })
    except Exception as e:
        logger.error(f"Error extracting tables: {str(e)}")
    
    return tables

def extract_pdf_metadata(pdf_path):
    """
    Extract metadata from a PDF file.
    
    Args:
        pdf_path (str): Path to the PDF file
        
    Returns:
        dict: PDF metadata
    """
    metadata = {}
    
    try:
        # Extract with PyPDF2
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            info = reader.metadata
            
            if info:
                for key, value in info.items():
                    # Remove the leading slash in keys
                    clean_key = key
                    if clean_key.startswith('/'):
                        clean_key = clean_key[1:]
                    
                    metadata[clean_key] = str(value)
            
            # Add page count
            metadata['Pages'] = len(reader.pages)
    except Exception as e:
        logger.error(f"Error extracting metadata: {str(e)}")
        metadata['Error'] = str(e)
    
    return metadata
