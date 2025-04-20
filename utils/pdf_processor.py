import os
import re
import PyPDF2
import pdfplumber
import pandas as pd
from typing import List, Dict, Any, Tuple, Optional
import logging
from .perplexity_api import analyze_text_with_perplexity

logger = logging.getLogger(__name__)

class PDFProcessor:
    def __init__(self, pdf_path):
        self.pdf_path = pdf_path
        self.pypdf_text = ""
        self.pdfplumber_text = ""
        self.tables = []
        self.metadata = {}
        self.page_count = 0
    
    def extract_all(self):
        """Extract all data from the PDF: text, tables, and metadata."""
        self.extract_text()
        self.extract_tables()
        self.extract_metadata()
        return {
            "text": self.pdfplumber_text if self.pdfplumber_text else self.pypdf_text,
            "tables": self.tables,
            "metadata": self.metadata,
            "page_count": self.page_count
        }
    
    def extract_text(self) -> Tuple[str, str]:
        """
        Extract text from PDF using both PyPDF2 and pdfplumber.
        Returns a tuple of (pypdf_text, pdfplumber_text).
        """
        # Extract text using PyPDF2
        try:
            with open(self.pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                self.page_count = len(reader.pages)
                pypdf_text = ""
                for page in reader.pages:
                    pypdf_text += page.extract_text() + "\n\n"
                self.pypdf_text = pypdf_text
        except Exception as e:
            logger.error(f"PyPDF2 extraction error: {str(e)}")
            self.pypdf_text = ""
        
        # Extract text using pdfplumber
        try:
            with pdfplumber.open(self.pdf_path) as pdf:
                self.page_count = len(pdf.pages)
                pdfplumber_text = ""
                for page in pdf.pages:
                    text = page.extract_text() or ""
                    pdfplumber_text += text + "\n\n"
                self.pdfplumber_text = pdfplumber_text
        except Exception as e:
            logger.error(f"pdfplumber extraction error: {str(e)}")
            self.pdfplumber_text = ""
        
        return (self.pypdf_text, self.pdfplumber_text)
    
    def extract_tables(self) -> List[Dict[str, Any]]:
        """
        Extract tables from PDF using pdfplumber.
        Returns a list of tables, where each table is a dict with 'page', 'data', and 'dataframe'.
        """
        try:
            with pdfplumber.open(self.pdf_path) as pdf:
                tables = []
                for i, page in enumerate(pdf.pages):
                    page_tables = page.extract_tables()
                    for j, table_data in enumerate(page_tables):
                        if table_data and len(table_data) > 0:
                            # Convert to dataframe for easier manipulation
                            df = pd.DataFrame(table_data)
                            
                            # Use first row as header if it looks like a header
                            if df.shape[0] > 1:
                                df.columns = df.iloc[0]
                                df = df.iloc[1:]
                            
                            # Reset index
                            df = df.reset_index(drop=True)
                            
                            # Save as dict for JSON serialization
                            tables.append({
                                'page': i + 1,
                                'table_number': j + 1,
                                'data': table_data,
                                'dataframe': df  # This won't be JSON serialized, but useful for Excel export
                            })
                self.tables = tables
                return tables
        except Exception as e:
            logger.error(f"Table extraction error: {str(e)}")
            self.tables = []
            return []
    
    def extract_metadata(self) -> Dict[str, Any]:
        """Extract metadata from the PDF using PyPDF2."""
        try:
            with open(self.pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                if reader.metadata:
                    self.metadata = {
                        'author': reader.metadata.author or "Not specified",
                        'creator': reader.metadata.creator or "Not specified",
                        'producer': reader.metadata.producer or "Not specified",
                        'subject': reader.metadata.subject or "Not specified",
                        'title': reader.metadata.title or "Not specified",
                        'creation_date': str(reader.metadata.creation_date) if reader.metadata.creation_date else "Not specified",
                        'modification_date': str(reader.metadata.modification_date) if reader.metadata.modification_date else "Not specified"
                    }
                else:
                    self.metadata = {
                        'author': "Not specified",
                        'creator': "Not specified",
                        'producer': "Not specified",
                        'subject': "Not specified",
                        'title': "Not specified",
                        'creation_date': "Not specified",
                        'modification_date': "Not specified"
                    }
                return self.metadata
        except Exception as e:
            logger.error(f"Metadata extraction error: {str(e)}")
            self.metadata = {
                'error': f"Failed to extract metadata: {str(e)}"
            }
            return self.metadata
    
    def save_text_to_file(self, output_path: str) -> bool:
        """Save extracted text to a file."""
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                # Use pdfplumber text if available, otherwise fall back to PyPDF2
                text = self.pdfplumber_text if self.pdfplumber_text else self.pypdf_text
                f.write(text)
            return True
        except Exception as e:
            logger.error(f"Error saving text file: {str(e)}")
            return False
    
    def save_tables_to_excel(self, output_path: str) -> bool:
        """Save extracted tables to an Excel file."""
        try:
            if not self.tables:
                return False
            
            with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
                for i, table in enumerate(self.tables):
                    # Convert to dataframe if needed
                    if 'dataframe' in table:
                        df = table['dataframe']
                    else:
                        df = pd.DataFrame(table['data'])
                    
                    # Create a sheet name
                    sheet_name = f"Table_{i+1}_Page_{table['page']}"
                    if len(sheet_name) > 31:  # Excel sheet name length limitation
                        sheet_name = f"Table_{i+1}"
                    
                    # Write to Excel
                    df.to_excel(writer, sheet_name=sheet_name, index=False)
            
            return True
        except Exception as e:
            logger.error(f"Error saving Excel file: {str(e)}")
            return False
    
    def analyze_with_perplexity(self, api_key: str, custom_query: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyze the PDF text using Perplexity API.
        """
        # Make sure we have text
        if not self.pdfplumber_text and not self.pypdf_text:
            self.extract_text()
        
        # Use the better text source
        text = self.pdfplumber_text if self.pdfplumber_text else self.pypdf_text
        
        if not text:
            return {"error": "No text could be extracted from the PDF"}
        
        try:
            return analyze_text_with_perplexity(api_key, text, custom_query)
        except Exception as e:
            logger.error(f"Perplexity analysis error: {str(e)}")
            return {"error": f"Analysis error: {str(e)}"}
    
    def to_json(self) -> Dict[str, Any]:
        """Convert the processor's data to a JSON-serializable dictionary."""
        # Convert tables to a serializable format
        serializable_tables = []
        for table in self.tables:
            serializable_table = {
                'page': table['page'],
                'table_number': table['table_number'],
                'data': table['data']
            }
            serializable_tables.append(serializable_table)
        
        return {
            'text': self.pdfplumber_text if self.pdfplumber_text else self.pypdf_text,
            'tables': serializable_tables,
            'metadata': self.metadata,
            'page_count': self.page_count,
            'filename': os.path.basename(self.pdf_path)
        }
