"""
PDF Processor Module - Unified interface for all PDF processing operations
"""
import os
import io
import logging
import tempfile
from typing import Dict, List, Any, Optional, Tuple
import pandas as pd

from utils.pdf_extractor import extract_pdf_text, extract_pdf_tables, extract_pdf_metadata
from utils.perplexity_api import analyze_text_with_perplexity

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class PDFProcessor:
    """
    Unified class for all PDF processing functionality
    """
    def __init__(self, file_path: str):
        """
        Initialize the PDF processor
        
        Args:
            file_path (str): Path to the PDF file
        """
        self.file_path = file_path
        self.text_pypdf = None
        self.text_pdfplumber = None
        self.tables = None
        self.metadata = None
        self.perplexity_analysis = None
        
    def extract_all(self) -> Dict[str, Any]:
        """
        Extract all available information from the PDF
        
        Returns:
            dict: Dictionary containing all extracted information
        """
        self.extract_text()
        self.extract_tables()
        self.extract_metadata()
        
        return {
            'text_pypdf': self.text_pypdf,
            'text_pdfplumber': self.text_pdfplumber,
            'tables': self.tables,
            'metadata': self.metadata,
            'perplexity_analysis': self.perplexity_analysis
        }
    
    def extract_text(self) -> Tuple[str, str]:
        """
        Extract text content using both PyPDF2 and pdfplumber
        
        Returns:
            tuple: (PyPDF2 text, pdfplumber text)
        """
        try:
            self.text_pypdf, self.text_pdfplumber = extract_pdf_text(self.file_path)
            return self.text_pypdf, self.text_pdfplumber
        except Exception as e:
            logger.error(f"Error extracting text: {str(e)}")
            self.text_pypdf = f"Error: {str(e)}"
            self.text_pdfplumber = f"Error: {str(e)}"
            return self.text_pypdf, self.text_pdfplumber
    
    def extract_tables(self) -> List[Dict[str, Any]]:
        """
        Extract tables from the PDF
        
        Returns:
            list: List of extracted tables
        """
        try:
            self.tables = extract_pdf_tables(self.file_path)
            return self.tables
        except Exception as e:
            logger.error(f"Error extracting tables: {str(e)}")
            self.tables = []
            return self.tables
    
    def extract_metadata(self) -> Dict[str, Any]:
        """
        Extract metadata from the PDF
        
        Returns:
            dict: Extracted metadata
        """
        try:
            self.metadata = extract_pdf_metadata(self.file_path)
            return self.metadata
        except Exception as e:
            logger.error(f"Error extracting metadata: {str(e)}")
            self.metadata = {'error': str(e)}
            return self.metadata
    
    def analyze_with_perplexity(self, api_key: str) -> Dict[str, Any]:
        """
        Analyze PDF content using Perplexity API
        
        Args:
            api_key (str): Perplexity API key
            
        Returns:
            dict: Analysis results
        """
        try:
            if not self.text_pdfplumber:
                self.extract_text()
                
            self.perplexity_analysis = analyze_text_with_perplexity(
                self.text_pdfplumber, 
                api_key
            )
            return self.perplexity_analysis
        except Exception as e:
            logger.error(f"Error analyzing with Perplexity: {str(e)}")
            self.perplexity_analysis = {
                'error': f"Error in Perplexity analysis: {str(e)}",
                'summary': None
            }
            return self.perplexity_analysis
    
    def extract_benefits(self) -> Dict[str, Any]:
        """
        Extract insurance benefit information
        
        Returns:
            dict: Extracted benefit information
        """
        try:
            from utils.benefit_extractor import BenefitExtractor
            
            if not os.path.exists(self.file_path):
                raise FileNotFoundError(f"PDF file not found at {self.file_path}")
                
            extractor = BenefitExtractor(self.file_path)
            benefits = extractor.extract_all()
            
            return benefits
        except Exception as e:
            logger.error(f"Error extracting benefits: {str(e)}")
            # Fallback to simple extraction method
            if not self.text_pdfplumber:
                self.extract_text()
                
            from main import simple_extract_benefit_information
            return simple_extract_benefit_information(self.text_pdfplumber)
    
    def save_text_to_file(self, output_path: str) -> str:
        """
        Save extracted text to a file
        
        Args:
            output_path (str): Path to save the text file
            
        Returns:
            str: Path to the saved file
        """
        try:
            if not self.text_pdfplumber:
                self.extract_text()
                
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(self.text_pdfplumber)
                
            return output_path
        except Exception as e:
            logger.error(f"Error saving text to file: {str(e)}")
            return None
    
    def save_tables_to_excel(self, output_path: str) -> str:
        """
        Save extracted tables to an Excel file
        
        Args:
            output_path (str): Path to save the Excel file
            
        Returns:
            str: Path to the saved file
        """
        try:
            if not self.tables:
                self.extract_tables()
                
            if not self.tables:
                return None
                
            with pd.ExcelWriter(output_path) as writer:
                for i, table_data in enumerate(self.tables):
                    df = pd.DataFrame(table_data['data'], columns=table_data['columns'])
                    df.to_excel(writer, sheet_name=f'Table {i+1}', index=False)
                    
            return output_path
        except Exception as e:
            logger.error(f"Error saving tables to Excel: {str(e)}")
            return None
    
    def to_json(self) -> Dict[str, Any]:
        """
        Convert all extracted data to a JSON-serializable dictionary
        
        Returns:
            dict: JSON-serializable dictionary
        """
        # Make sure we have extracted all data
        if not self.text_pypdf or not self.text_pdfplumber:
            self.extract_text()
            
        if not self.tables:
            self.extract_tables()
            
        if not self.metadata:
            self.extract_metadata()
            
        # Format tables for JSON serialization
        formatted_tables = []
        if self.tables:
            for table in self.tables:
                formatted_tables.append({
                    'columns': table['columns'],
                    'data': table['data'],
                    'page': table.get('page', 1),
                    'table_number': table.get('table_number', 1)
                })
                
        return {
            'filename': os.path.basename(self.file_path),
            'text_pypdf': self.text_pypdf,
            'text_pdfplumber': self.text_pdfplumber,
            'tables': formatted_tables,
            'metadata': self.metadata,
            'perplexity_analysis': self.perplexity_analysis,
            'page_count': self.metadata.get('Pages', 'Unknown') if self.metadata else 'Unknown',
            'table_count': len(formatted_tables)
        }


def process_multiple_pdfs_for_benefits(pdf_paths: List[str], output_path: str) -> str:
    """
    Process multiple PDFs for benefit extraction and create an Excel file
    
    Args:
        pdf_paths (list): List of paths to PDF files
        output_path (str): Path to save the Excel file
        
    Returns:
        str: Path to the saved Excel file
    """
    try:
        from utils.benefit_extractor import extract_benefits_to_excel
        return extract_benefits_to_excel(pdf_paths, output_path)
    except Exception as e:
        logger.error(f"Error processing multiple PDFs for benefits: {str(e)}")
        
        # Fallback method
        results = []
        for pdf_path in pdf_paths:
            try:
                processor = PDFProcessor(pdf_path)
                benefits = processor.extract_benefits()
                results.append({
                    "filename": os.path.basename(pdf_path),
                    "benefits": benefits
                })
            except Exception as pdf_e:
                logger.error(f"Error processing {os.path.basename(pdf_path)}: {str(pdf_e)}")
                results.append({
                    "filename": os.path.basename(pdf_path),
                    "benefits": {"error": str(pdf_e)}
                })
        
        # Create Excel file with results
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer) as writer:
            # Create a summary sheet
            summary_data = []
            for result in results:
                row = {'Filename': result["filename"]}
                row.update(result["benefits"])
                summary_data.append(row)
            
            if summary_data:
                summary_df = pd.DataFrame(summary_data)
                summary_df.to_excel(writer, sheet_name='Summary', index=False)
            
            # Create individual sheets for each PDF
            for i, result in enumerate(results):
                df = pd.DataFrame([result["benefits"]])
                df.insert(0, 'Filename', result["filename"])
                df.to_excel(writer, sheet_name=f'PDF {i+1}', index=False)
        
        buffer.seek(0)
        with open(output_path, 'wb') as f:
            f.write(buffer.getvalue())
        
        return output_path