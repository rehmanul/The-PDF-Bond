
import os
import PyPDF2
import pdfplumber
import pandas as pd
from typing import Dict, List, Any

class PDFScraper:
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        
    def extract_text_pypdf(self) -> str:
        """Extract text using PyPDF2"""
        with open(self.pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ''
            for page in reader.pages:
                text += page.extract_text() + '\n'
        return text

    def extract_text_pdfplumber(self) -> str:
        """Extract text using pdfplumber (better for complex layouts)"""
        with pdfplumber.open(self.pdf_path) as pdf:
            text = ''
            for page in pdf.pages:
                text += page.extract_text() + '\n'
        return text

    def extract_tables(self) -> List[pd.DataFrame]:
        """Extract tables from PDF"""
        tables = []
        with pdfplumber.open(self.pdf_path) as pdf:
            for page in pdf.pages:
                tables.extend(page.extract_tables())
        return [pd.DataFrame(table) for table in tables if table]

    def extract_metadata(self) -> Dict[str, Any]:
        """Extract PDF metadata"""
        with open(self.pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            return reader.metadata

def process_directory(directory: str) -> Dict[str, Dict]:
    """Process all PDFs in a directory"""
    results = {}
    
    for filename in os.listdir(directory):
        if filename.lower().endswith('.pdf'):
            file_path = os.path.join(directory, filename)
            scraper = PDFScraper(file_path)
            
            results[filename] = {
                'text_pypdf': scraper.extract_text_pypdf(),
                'text_pdfplumber': scraper.extract_text_pdfplumber(),
                'tables': scraper.extract_tables(),
                'metadata': scraper.extract_metadata()
            }
    
    return results

def main():
    # Process PDFs in the attached_assets directory
    directory = 'attached_assets'
    results = process_directory(directory)
    
    # Print results for each PDF
    for filename, data in results.items():
        print(f"\nProcessing: {filename}")
        print("Metadata:", data['metadata'])
        print("\nExtracted Text (PyPDF2):", data['text_pypdf'][:500])
        print("\nExtracted Text (pdfplumber):", data['text_pdfplumber'][:500])
        print("\nNumber of tables found:", len(data['tables']))
        
        # Save extracted text to files
        base_name = os.path.splitext(filename)[0]
        
        # Save as text file
        with open(f"{base_name}_extracted.txt", 'w', encoding='utf-8') as f:
            f.write(data['text_pdfplumber'])
        
        # Save tables to Excel if any found
        if data['tables']:
            with pd.ExcelWriter(f"{base_name}_tables.xlsx") as writer:
                for i, table in enumerate(data['tables']):
                    table.to_excel(writer, sheet_name=f'Table_{i+1}', index=False)

if __name__ == "__main__":
    main()
