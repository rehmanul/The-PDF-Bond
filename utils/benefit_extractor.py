import os
import re
import PyPDF2
import pdfplumber
import pandas as pd
import logging
from typing import Dict, List, Any, Optional, Tuple, Union
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill

logger = logging.getLogger(__name__)

def find_benefit(text: str, keywords: List[str], context_chars: int = 200) -> str:
    """
    Find a benefit value in the text based on keywords.
    Returns the first match, surrounded by context.
    """
    text = text.lower()
    for keyword in keywords:
        pattern = r'(?i)(?:.*?)\b' + re.escape(keyword.lower()) + r'\b(.*?)(?:\$[\d,]+(?:\.\d+)?|(?:\d+)%|not covered|covered 100%)'
        match = re.search(pattern, text, re.DOTALL)
        if match:
            start_pos = max(0, match.start() - context_chars)
            end_pos = min(len(text), match.end() + context_chars)
            context = text[start_pos:end_pos]
            
            # Find the dollar amount or percentage in the context
            amount_match = re.search(r'\$[\d,]+(?:\.\d+)?|\d+%|covered 100%|not covered', context, re.IGNORECASE)
            if amount_match:
                return amount_match.group(0)
    
    return "Not found"

def find_percentage(text: str, keywords: List[str]) -> str:
    """
    Find a percentage value in the text based on keywords.
    """
    text = text.lower()
    for keyword in keywords:
        pattern = r'(?i)(?:.*?)\b' + re.escape(keyword.lower()) + r'\b.*?(\d+(?:\.\d+)?%)'
        match = re.search(pattern, text, re.DOTALL)
        if match:
            return match.group(1)
    
    return "Not found"

def create_benefit_excel(data: Dict[str, Any], output_path: str) -> bool:
    """Create an Excel file with the extracted benefits."""
    try:
        workbook = openpyxl.Workbook()
        sheet = workbook.active
        sheet.title = "Benefits Summary"
        
        # Add headers
        headers = ["Carrier", "Plan", "Category", "Benefit Type", "In Network", "Out of Network"]
        for col, header in enumerate(headers, 1):
            cell = sheet.cell(row=1, column=col)
            cell.value = header
            cell.font = Font(bold=True)
            cell.fill = PatternFill(start_color="E0E0E0", end_color="E0E0E0", fill_type="solid")
        
        # Add data
        row = 2
        for result in data.get("results", []):
            # Add deductible info
            sheet.cell(row=row, column=1).value = result.get("carrier_name", "Unknown")
            sheet.cell(row=row, column=2).value = result.get("plan_name", "Unknown")
            sheet.cell(row=row, column=3).value = "Deductible"
            sheet.cell(row=row, column=4).value = "Individual"
            sheet.cell(row=row, column=5).value = result.get("deductible", {}).get("individual_in_network", "Not found")
            sheet.cell(row=row, column=6).value = result.get("deductible", {}).get("individual_out_network", "Not found")
            row += 1
            
            # Family deductible
            sheet.cell(row=row, column=3).value = "Deductible"
            sheet.cell(row=row, column=4).value = "Family"
            sheet.cell(row=row, column=5).value = result.get("deductible", {}).get("family_in_network", "Not found")
            sheet.cell(row=row, column=6).value = result.get("deductible", {}).get("family_out_network", "Not found")
            row += 1
            
            # Out of pocket
            sheet.cell(row=row, column=3).value = "Out of Pocket"
            sheet.cell(row=row, column=4).value = "Individual"
            sheet.cell(row=row, column=5).value = result.get("out_of_pocket", {}).get("individual_in_network", "Not found")
            sheet.cell(row=row, column=6).value = result.get("out_of_pocket", {}).get("individual_out_network", "Not found")
            row += 1
            
            # Family out of pocket
            sheet.cell(row=row, column=3).value = "Out of Pocket"
            sheet.cell(row=row, column=4).value = "Family"
            sheet.cell(row=row, column=5).value = result.get("out_of_pocket", {}).get("family_in_network", "Not found")
            sheet.cell(row=row, column=6).value = result.get("out_of_pocket", {}).get("family_out_network", "Not found")
            row += 1
            
            # Coinsurance
            sheet.cell(row=row, column=3).value = "Coinsurance"
            sheet.cell(row=row, column=4).value = "Standard"
            sheet.cell(row=row, column=5).value = result.get("coinsurance", {}).get("in_network", "Not found")
            sheet.cell(row=row, column=6).value = result.get("coinsurance", {}).get("out_network", "Not found")
            row += 1
            
            # Office visits
            sheet.cell(row=row, column=3).value = "Office Visit"
            sheet.cell(row=row, column=4).value = "Primary Care"
            sheet.cell(row=row, column=5).value = result.get("office_visits", {}).get("primary_care", "Not found")
            sheet.cell(row=row, column=6).value = "Not found"
            row += 1
            
            # Specialist
            sheet.cell(row=row, column=3).value = "Office Visit"
            sheet.cell(row=row, column=4).value = "Specialist"
            sheet.cell(row=row, column=5).value = result.get("office_visits", {}).get("specialist", "Not found")
            sheet.cell(row=row, column=6).value = "Not found"
            row += 1
            
            # Urgent care
            sheet.cell(row=row, column=3).value = "Office Visit"
            sheet.cell(row=row, column=4).value = "Urgent Care"
            sheet.cell(row=row, column=5).value = result.get("office_visits", {}).get("urgent_care", "Not found")
            sheet.cell(row=row, column=6).value = "Not found"
            row += 1
            
            # Emergency room
            sheet.cell(row=row, column=3).value = "Hospital Services"
            sheet.cell(row=row, column=4).value = "Emergency Room"
            sheet.cell(row=row, column=5).value = result.get("emergency_room", "Not found")
            sheet.cell(row=row, column=6).value = "Not found"
            row += 1
            
            # Hospitalization
            sheet.cell(row=row, column=3).value = "Hospital Services"
            sheet.cell(row=row, column=4).value = "Hospitalization"
            sheet.cell(row=row, column=5).value = result.get("hospitalization", "Not found")
            sheet.cell(row=row, column=6).value = "Not found"
            row += 1
        
        # Adjust column widths
        for i in range(1, 7):
            sheet.column_dimensions[openpyxl.utils.get_column_letter(i)].width = 20
        
        # Save workbook
        workbook.save(output_path)
        return True
    
    except Exception as e:
        logger.error(f"Error creating Excel file: {str(e)}")
        return False

class BenefitExtractor:
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.text = ""
        self.tables = []
        self.benefits = {}
    
    def extract_benefits(self) -> Dict[str, Any]:
        """Extract all benefits information from the PDF."""
        self._extract_text()
        self._extract_tables()
        self._extract_benefits()
        return self.get_formatted_benefits()
    
    def _extract_text(self) -> str:
        """Extract text from the PDF."""
        try:
            with pdfplumber.open(self.pdf_path) as pdf:
                text = ""
                for page in pdf.pages:
                    page_text = page.extract_text() or ""
                    text += page_text + "\n\n"
                self.text = text
                return text
        except Exception as e:
            logger.error(f"Error extracting text: {str(e)}")
            # Fallback to PyPDF2
            try:
                with open(self.pdf_path, 'rb') as file:
                    reader = PyPDF2.PdfReader(file)
                    text = ""
                    for page in reader.pages:
                        text += page.extract_text() + "\n\n"
                    self.text = text
                    return text
            except Exception as e2:
                logger.error(f"PyPDF2 extraction failed: {str(e2)}")
                raise Exception(f"Failed to extract text from PDF: {str(e)}, {str(e2)}")
    
    def _extract_tables(self) -> List[Dict[str, Any]]:
        """Extract tables from the PDF."""
        try:
            with pdfplumber.open(self.pdf_path) as pdf:
                tables = []
                for i, page in enumerate(pdf.pages):
                    page_tables = page.extract_tables()
                    for j, table_data in enumerate(page_tables):
                        if table_data and len(table_data) > 0:
                            tables.append({
                                'page': i + 1,
                                'table_number': j + 1,
                                'data': table_data
                            })
                self.tables = tables
                return tables
        except Exception as e:
            logger.error(f"Error extracting tables: {str(e)}")
            self.tables = []
            return []
    
    def _extract_benefits(self) -> Dict[str, Any]:
        """Extract specific benefit information from text and tables."""
        # Extract carrier and plan information
        carrier_name = self._extract_carrier_name()
        plan_name = self._extract_plan_name()
        
        # Extract deductible information
        deductible = self._extract_deductible_info()
        
        # Extract out-of-pocket information
        out_of_pocket = self._extract_out_of_pocket_info()
        
        # Extract coinsurance
        coinsurance = self._extract_coinsurance_info()
        
        # Extract office visit information
        office_visits = self._extract_office_visit_info()
        
        # Extract emergency room information
        emergency_room = self._extract_emergency_room_info()
        
        # Extract hospitalization information
        hospitalization = self._extract_hospitalization_info()
        
        # Compile all benefits
        self.benefits = {
            "carrier_name": carrier_name,
            "plan_name": plan_name,
            "deductible": deductible,
            "out_of_pocket": out_of_pocket,
            "coinsurance": coinsurance,
            "office_visits": office_visits,
            "emergency_room": emergency_room,
            "hospitalization": hospitalization
        }
        
        return self.benefits
    
    def _extract_carrier_name(self) -> str:
        """Extract the carrier name from the PDF."""
        carrier_patterns = [
            r'(?i)(United\s*Healthcare|Aetna|Cigna|Blue\s*Cross|Blue\s*Shield|BCBS|Anthem|Humana|Kaiser|Optum)'
        ]
        
        for pattern in carrier_patterns:
            match = re.search(pattern, self.text)
            if match:
                return match.group(1)
        
        # Check the first tables for carrier info
        if self.tables:
            for table in self.tables[:2]:  # Only check first two tables
                for row in table['data']:
                    for cell in row:
                        if cell and isinstance(cell, str):
                            for pattern in carrier_patterns:
                                match = re.search(pattern, cell)
                                if match:
                                    return match.group(1)
        
        return "Unknown"
    
    def _extract_plan_name(self) -> str:
        """Extract the plan name from the PDF."""
        plan_patterns = [
            r'(?i)Plan\s*(?:Name|Type):\s*([A-Za-z0-9\s\-]+)',
            r'(?i)(Choice\s*(?:Plus|Select)|PPO|HMO|EPO|POS|HDHP|HSA)'
        ]
        
        for pattern in plan_patterns:
            match = re.search(pattern, self.text)
            if match:
                return match.group(1).strip()
        
        return "Unknown"
    
    def _extract_deductible_info(self) -> Dict[str, str]:
        """Extract deductible information."""
        # Regular expressions for deductible amounts
        individual_in_pattern = r'(?i)Individual[^\n]*(?:In[\s\-]*Network|Network)[^\n]*?(\$[\d,]+)'
        family_in_pattern = r'(?i)Family[^\n]*(?:In[\s\-]*Network|Network)[^\n]*?(\$[\d,]+)'
        individual_out_pattern = r'(?i)Individual[^\n]*(?:Out[\s\-]*of[\s\-]*Network|Non[\s\-]*Network)[^\n]*?(\$[\d,]+)'
        family_out_pattern = r'(?i)Family[^\n]*(?:Out[\s\-]*of[\s\-]*Network|Non[\s\-]*Network)[^\n]*?(\$[\d,]+)'
        
        # Simple pattern fallbacks
        fallback_individual = r'(?i)Individual\s*(?:Deductible|Annual\s*Deductible)[^\n]*?(\$[\d,]+)'
        fallback_family = r'(?i)Family\s*(?:Deductible|Annual\s*Deductible)[^\n]*?(\$[\d,]+)'
        
        # Try to match patterns
        individual_in = "Not found"
        match = re.search(individual_in_pattern, self.text)
        if match:
            individual_in = match.group(1)
        else:
            match = re.search(fallback_individual, self.text)
            if match:
                individual_in = match.group(1)
        
        family_in = "Not found"
        match = re.search(family_in_pattern, self.text)
        if match:
            family_in = match.group(1)
        else:
            match = re.search(fallback_family, self.text)
            if match:
                family_in = match.group(1)
        
        individual_out = "Not found"
        match = re.search(individual_out_pattern, self.text)
        if match:
            individual_out = match.group(1)
        
        family_out = "Not found"
        match = re.search(family_out_pattern, self.text)
        if match:
            family_out = match.group(1)
        
        # Check tables if text search failed
        if individual_in == "Not found" or family_in == "Not found":
            for table in self.tables:
                for row in table['data']:
                    if not all(row):
                        continue
                    row_text = ' '.join([str(cell) for cell in row if cell])
                    if 'deductible' in row_text.lower() and 'individual' in row_text.lower():
                        for cell in row:
                            if cell and isinstance(cell, str) and '$' in cell:
                                individual_in = cell
                                break
                    if 'deductible' in row_text.lower() and 'family' in row_text.lower():
                        for cell in row:
                            if cell and isinstance(cell, str) and '$' in cell:
                                family_in = cell
                                break
        
        return {
            "individual_in_network": individual_in,
            "family_in_network": family_in,
            "individual_out_network": individual_out,
            "family_out_network": family_out
        }
    
    def _extract_out_of_pocket_info(self) -> Dict[str, str]:
        """Extract out-of-pocket information."""
        # Regular expressions for out-of-pocket amounts
        individual_in_pattern = r'(?i)(?:Individual|Out[\s\-]*of[\s\-]*Pocket\s*(?:Limit|Maximum))[^\n]*(?:In[\s\-]*Network|Network)[^\n]*?(\$[\d,]+)'
        family_in_pattern = r'(?i)(?:Family|Out[\s\-]*of[\s\-]*Pocket\s*(?:Limit|Maximum))[^\n]*(?:In[\s\-]*Network|Network)[^\n]*?(\$[\d,]+)'
        individual_out_pattern = r'(?i)(?:Individual|Out[\s\-]*of[\s\-]*Pocket\s*(?:Limit|Maximum))[^\n]*(?:Out[\s\-]*of[\s\-]*Network|Non[\s\-]*Network)[^\n]*?(\$[\d,]+)'
        family_out_pattern = r'(?i)(?:Family|Out[\s\-]*of[\s\-]*Pocket\s*(?:Limit|Maximum))[^\n]*(?:Out[\s\-]*of[\s\-]*Network|Non[\s\-]*Network)[^\n]*?(\$[\d,]+)'
        
        # Simple pattern fallbacks
        fallback_individual = r'(?i)Individual\s*(?:Out[\s\-]*of[\s\-]*Pocket|OOP)[^\n]*?(\$[\d,]+)'
        fallback_family = r'(?i)Family\s*(?:Out[\s\-]*of[\s\-]*Pocket|OOP)[^\n]*?(\$[\d,]+)'
        
        # Try to match patterns
        individual_in = "Not found"
        match = re.search(individual_in_pattern, self.text)
        if match:
            individual_in = match.group(1)
        else:
            match = re.search(fallback_individual, self.text)
            if match:
                individual_in = match.group(1)
        
        family_in = "Not found"
        match = re.search(family_in_pattern, self.text)
        if match:
            family_in = match.group(1)
        else:
            match = re.search(fallback_family, self.text)
            if match:
                family_in = match.group(1)
        
        individual_out = "Not found"
        match = re.search(individual_out_pattern, self.text)
        if match:
            individual_out = match.group(1)
        
        family_out = "Not found"
        match = re.search(family_out_pattern, self.text)
        if match:
            family_out = match.group(1)
        
        # Check tables
        if individual_in == "Not found" or family_in == "Not found":
            for table in self.tables:
                for row in table['data']:
                    if not all(row):
                        continue
                    row_text = ' '.join([str(cell) for cell in row if cell])
                    if any(phrase in row_text.lower() for phrase in ['out-of-pocket', 'out of pocket', 'oop']) and 'individual' in row_text.lower():
                        for cell in row:
                            if cell and isinstance(cell, str) and '$' in cell:
                                individual_in = cell
                                break
                    if any(phrase in row_text.lower() for phrase in ['out-of-pocket', 'out of pocket', 'oop']) and 'family' in row_text.lower():
                        for cell in row:
                            if cell and isinstance(cell, str) and '$' in cell:
                                family_in = cell
                                break
        
        return {
            "individual_in_network": individual_in,
            "family_in_network": family_in,
            "individual_out_network": individual_out,
            "family_out_network": family_out
        }
    
    def _extract_coinsurance_info(self) -> Dict[str, str]:
        """Extract coinsurance information."""
        in_network_pattern = r'(?i)(?:Co(?:\-|\s)?insurance)[^\n]*(?:In[\s\-]*Network|Network)[^\n]*?(\d+(?:\.\d+)?%)'
        out_network_pattern = r'(?i)(?:Co(?:\-|\s)?insurance)[^\n]*(?:Out[\s\-]*of[\s\-]*Network|Non[\s\-]*Network)[^\n]*?(\d+(?:\.\d+)?%)'
        
        # Fallback pattern
        fallback_pattern = r'(?i)Co(?:\-|\s)?insurance(?:[^\n]*?)(\d+(?:\.\d+)?%)'
        
        # Try to match patterns
        in_network = "Not found"
        match = re.search(in_network_pattern, self.text)
        if match:
            in_network = match.group(1)
        else:
            match = re.search(fallback_pattern, self.text)
            if match:
                in_network = match.group(1)
        
        out_network = "Not found"
        match = re.search(out_network_pattern, self.text)
        if match:
            out_network = match.group(1)
        
        # Check tables
        if in_network == "Not found":
            for table in self.tables:
                for row in table['data']:
                    if not all(row):
                        continue
                    row_text = ' '.join([str(cell) for cell in row if cell])
                    if 'coinsurance' in row_text.lower():
                        for cell in row:
                            if cell and isinstance(cell, str) and '%' in cell:
                                in_network = cell
                                break
        
        return {
            "in_network": in_network,
            "out_network": out_network
        }
    
    def _extract_office_visit_info(self) -> Dict[str, str]:
        """Extract office visit information."""
        primary_care_pattern = r'(?i)(?:Primary\s*Care|PCP)[^\n]*(?:\$[\d,]+(?:\.\d+)?|\d+%|not covered|covered 100%)'
        specialist_pattern = r'(?i)(?:Specialist)[^\n]*(?:\$[\d,]+(?:\.\d+)?|\d+%|not covered|covered 100%)'
        urgent_care_pattern = r'(?i)(?:Urgent\s*Care)[^\n]*(?:\$[\d,]+(?:\.\d+)?|\d+%|not covered|covered 100%)'
        
        # Extract primary care
        primary_care = "Not found"
        match = re.search(primary_care_pattern, self.text)
        if match:
            cost_match = re.search(r'(?:\$[\d,]+(?:\.\d+)?|\d+%|not covered|covered 100%)', match.group(0))
            if cost_match:
                primary_care = cost_match.group(0)
        
        # Extract specialist
        specialist = "Not found"
        match = re.search(specialist_pattern, self.text)
        if match:
            cost_match = re.search(r'(?:\$[\d,]+(?:\.\d+)?|\d+%|not covered|covered 100%)', match.group(0))
            if cost_match:
                specialist = cost_match.group(0)
        
        # Extract urgent care
        urgent_care = "Not found"
        match = re.search(urgent_care_pattern, self.text)
        if match:
            cost_match = re.search(r'(?:\$[\d,]+(?:\.\d+)?|\d+%|not covered|covered 100%)', match.group(0))
            if cost_match:
                urgent_care = cost_match.group(0)
        
        # Check tables
        if primary_care == "Not found" or specialist == "Not found" or urgent_care == "Not found":
            for table in self.tables:
                for row in table['data']:
                    if not all(row):
                        continue
                    row_text = ' '.join([str(cell) for cell in row if cell])
                    
                    if primary_care == "Not found" and any(term in row_text.lower() for term in ['primary care', 'pcp']):
                        for cell in row:
                            if cell and isinstance(cell, str) and re.search(r'(?:\$[\d,]+|\d+%)', cell):
                                primary_care = cell
                                break
                    
                    if specialist == "Not found" and 'specialist' in row_text.lower():
                        for cell in row:
                            if cell and isinstance(cell, str) and re.search(r'(?:\$[\d,]+|\d+%)', cell):
                                specialist = cell
                                break
                                
                    if urgent_care == "Not found" and 'urgent care' in row_text.lower():
                        for cell in row:
                            if cell and isinstance(cell, str) and re.search(r'(?:\$[\d,]+|\d+%)', cell):
                                urgent_care = cell
                                break
        
        return {
            "primary_care": primary_care,
            "specialist": specialist,
            "urgent_care": urgent_care
        }
    
    def _extract_emergency_room_info(self) -> str:
        """Extract emergency room information."""
        er_pattern = r'(?i)(?:Emergency\s*(?:Room|Department|Care|Services)|ER\s*Visit)[^\n]*(?:\$[\d,]+(?:\.\d+)?|\d+%|not covered|covered 100%)'
        
        # Extract emergency room
        er_cost = "Not found"
        match = re.search(er_pattern, self.text)
        if match:
            cost_match = re.search(r'(?:\$[\d,]+(?:\.\d+)?|\d+%|not covered|covered 100%)', match.group(0))
            if cost_match:
                er_cost = cost_match.group(0)
        
        # Check tables
        if er_cost == "Not found":
            for table in self.tables:
                for row in table['data']:
                    if not all(row):
                        continue
                    row_text = ' '.join([str(cell) for cell in row if cell])
                    if any(term in row_text.lower() for term in ['emergency', 'er visit']):
                        for cell in row:
                            if cell and isinstance(cell, str) and re.search(r'(?:\$[\d,]+|\d+%)', cell):
                                er_cost = cell
                                break
        
        return er_cost
    
    def _extract_hospitalization_info(self) -> str:
        """Extract hospitalization information."""
        hospitalization_pattern = r'(?i)(?:Hospital|Inpatient|Hospitalization)[^\n]*(?:\$[\d,]+(?:\.\d+)?|\d+%|not covered|covered 100%)'
        
        # Extract hospitalization
        hospitalization_cost = "Not found"
        match = re.search(hospitalization_pattern, self.text)
        if match:
            cost_match = re.search(r'(?:\$[\d,]+(?:\.\d+)?|\d+%|not covered|covered 100%)', match.group(0))
            if cost_match:
                hospitalization_cost = cost_match.group(0)
        
        # Check tables
        if hospitalization_cost == "Not found":
            for table in self.tables:
                for row in table['data']:
                    if not all(row):
                        continue
                    row_text = ' '.join([str(cell) for cell in row if cell])
                    if any(term in row_text.lower() for term in ['hospital', 'inpatient', 'hospitalization']):
                        for cell in row:
                            if cell and isinstance(cell, str) and re.search(r'(?:\$[\d,]+|\d+%)', cell):
                                hospitalization_cost = cell
                                break
        
        return hospitalization_cost
    
    def get_formatted_benefits(self) -> Dict[str, Any]:
        """Get the formatted benefits for display or export."""
        # If benefits haven't been extracted yet, do it now
        if not self.benefits:
            self._extract_benefits()
        
        return self.benefits
