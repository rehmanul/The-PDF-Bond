import os
import re
import logging
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
import PyPDF2
import pdfplumber

logging.basicConfig(level=logging.DEBUG)

class BenefitExtractor:
    """Class to extract benefits from insurance PDFs and format for template loading"""
    
    def __init__(self, pdf_path: str):
        """Initialize the extractor with a PDF path"""
        self.pdf_path = pdf_path
        self.carrier_name = ""
        self.plan_name = ""
        self.text = ""
        self.tables = []
        self.benefits = {}
        
    def extract_all(self) -> Dict[str, Any]:
        """Extract all data from the PDF"""
        self._extract_text()
        self._extract_tables()
        self._identify_carrier_and_plan()
        self._extract_benefits()
        return self.get_formatted_benefits()
    
    def _extract_text(self) -> None:
        """Extract text from the PDF"""
        try:
            with pdfplumber.open(self.pdf_path) as pdf:
                self.text = ""
                for page in pdf.pages:
                    page_text = page.extract_text() or ""
                    self.text += page_text + "\n"
            logging.debug(f"Extracted {len(self.text)} characters of text")
        except Exception as e:
            logging.error(f"Error extracting text: {str(e)}")
            self.text = ""
    
    def _extract_tables(self) -> None:
        """Extract tables from the PDF"""
        try:
            with pdfplumber.open(self.pdf_path) as pdf:
                for i, page in enumerate(pdf.pages):
                    try:
                        page_tables = page.extract_tables()
                        if page_tables:
                            for table in page_tables:
                                if table and len(table) > 0:  # Ensure table is not empty
                                    # Convert to DataFrame
                                    df = pd.DataFrame(table)
                                    # Replace None with empty string
                                    df = df.fillna("")
                                    self.tables.append(df)
                    except Exception as e:
                        logging.error(f"Error extracting tables from page {i}: {str(e)}")
            logging.debug(f"Extracted {len(self.tables)} tables")
        except Exception as e:
            logging.error(f"Error with table extraction: {str(e)}")
    
    def _identify_carrier_and_plan(self) -> None:
        """Identify carrier name and plan name from the PDF"""
        # Default values
        self.carrier_name = "Unknown Carrier"
        self.plan_name = "Unknown Plan"
        
        # Look for Aetna
        if "Aetna" in self.text:
            self.carrier_name = "Aetna"
            
            # Try to find plan name
            aetna_plan_patterns = [
                r"AFA CPOSII (\d+) [\d-]+ [^\n]+",
                r"Aetna Choice® POS II",
                r"Choice Plus"
            ]
            
            for pattern in aetna_plan_patterns:
                match = re.search(pattern, self.text)
                if match:
                    self.plan_name = match.group(0)
                    break
        
        # Look for UnitedHealthcare
        elif "UnitedHealthcare" in self.text:
            self.carrier_name = "UnitedHealthcare"
            
            # Try to find plan name
            uhc_plan_patterns = [
                r"Choice Plus ([^\n]+)",
                r"UnitedHealthcare ([^|]+)"
            ]
            
            for pattern in uhc_plan_patterns:
                match = re.search(pattern, self.text)
                if match:
                    self.plan_name = match.group(0)
                    break
        
        logging.debug(f"Identified carrier: {self.carrier_name}, plan: {self.plan_name}")
    
    def _find_deductible_info(self) -> Tuple[Dict[str, Any], bool]:
        """Find deductible information"""
        deductible_info = {
            "individual_in_network": None,
            "individual_out_of_network": None,
            "family_in_network": None,
            "family_out_of_network": None,
            "deductible_type": None
        }
        
        # Look for deductible information in text
        deductible_pattern = r"Deductible\s*(?:\(\s*per\s*[^)]+\))?\s*\$\s*(\d+(?:,\d+)?)\s*Individual.*?\$\s*(\d+(?:,\d+)?)\s*Family.*?Out-of-Network[^$]*\$\s*(\d+(?:,\d+)?)\s*Individual.*?\$\s*(\d+(?:,\d+)?)\s*Family"
        
        # Simplified pattern just looking for dollar amounts near "deductible"
        indiv_deductible_pattern = r"deductible.*?individual.*?\$(\d+(?:,\d+)?)"
        family_deductible_pattern = r"deductible.*?family.*?\$(\d+(?:,\d+)?)"
        out_indiv_pattern = r"out-of-network.*?individual.*?\$(\d+(?:,\d+)?)"
        out_family_pattern = r"out-of-network.*?family.*?\$(\d+(?:,\d+)?)"
        
        # First try with the comprehensive pattern
        match = re.search(deductible_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if match:
            deductible_info["individual_in_network"] = match.group(1).replace(",", "")
            deductible_info["family_in_network"] = match.group(2).replace(",", "")
            deductible_info["individual_out_of_network"] = match.group(3).replace(",", "")
            deductible_info["family_out_of_network"] = match.group(4).replace(",", "")
            return deductible_info, True
        
        # Try with simplified patterns if comprehensive search fails
        in_indiv_match = re.search(indiv_deductible_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if in_indiv_match:
            deductible_info["individual_in_network"] = in_indiv_match.group(1).replace(",", "")
            
        in_family_match = re.search(family_deductible_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if in_family_match:
            deductible_info["family_in_network"] = in_family_match.group(1).replace(",", "")
            
        out_indiv_match = re.search(out_indiv_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if out_indiv_match:
            deductible_info["individual_out_of_network"] = out_indiv_match.group(1).replace(",", "")
            
        out_family_match = re.search(out_family_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if out_family_match:
            deductible_info["family_out_of_network"] = out_family_match.group(1).replace(",", "")
        
        # Check if we successfully extracted at least some info
        if any(deductible_info.values()):
            # Try to determine deductible type
            if "non-embedded" in self.text.lower() or "aggregate" in self.text.lower():
                deductible_info["deductible_type"] = "Aggregate"
            else:
                deductible_info["deductible_type"] = "Embedded"
            
            return deductible_info, True
        
        # If we still don't have info, try searching tables
        for table in self.tables:
            for index, row in table.iterrows():
                row_str = ' '.join(str(cell) for cell in row if cell)
                if "deductible" in row_str.lower() and "individual" in row_str.lower():
                    # Try to find numeric values
                    amount_pattern = r"\$\s*(\d+(?:,\d+)?)"
                    amounts = re.findall(amount_pattern, row_str)
                    if len(amounts) >= 2:
                        deductible_info["individual_in_network"] = amounts[0].replace(",", "")
                        deductible_info["individual_out_of_network"] = amounts[1].replace(",", "")
                        
                if "deductible" in row_str.lower() and "family" in row_str.lower():
                    # Try to find numeric values
                    amount_pattern = r"\$\s*(\d+(?:,\d+)?)"
                    amounts = re.findall(amount_pattern, row_str)
                    if len(amounts) >= 2:
                        deductible_info["family_in_network"] = amounts[0].replace(",", "")
                        deductible_info["family_out_of_network"] = amounts[1].replace(",", "")
        
        return deductible_info, any(deductible_info.values())

    def _find_out_of_pocket_info(self) -> Tuple[Dict[str, Any], bool]:
        """Find out-of-pocket information"""
        oop_info = {
            "individual_in_network": None,
            "individual_out_of_network": None,
            "family_in_network": None,
            "family_out_of_network": None
        }
        
        # Look for out-of-pocket information in text
        oop_pattern = r"Out-of-Pocket\s*(?:Limit|Maximum).*?\$\s*(\d+(?:,\d+)?)\s*Individual.*?\$\s*(\d+(?:,\d+)?)\s*Family.*?Out-of-Network[^$]*\$\s*(\d+(?:,\d+)?)\s*Individual.*?\$\s*(\d+(?:,\d+)?)\s*Family"
        
        # Simplified patterns
        in_indiv_oop_pattern = r"out-of-pocket.*?individual.*?\$(\d+(?:,\d+)?)"
        in_family_oop_pattern = r"out-of-pocket.*?family.*?\$(\d+(?:,\d+)?)"
        
        # First try comprehensive pattern
        match = re.search(oop_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if match:
            oop_info["individual_in_network"] = match.group(1).replace(",", "")
            oop_info["family_in_network"] = match.group(2).replace(",", "")
            oop_info["individual_out_of_network"] = match.group(3).replace(",", "")
            oop_info["family_out_of_network"] = match.group(4).replace(",", "")
            return oop_info, True
        
        # Try with simplified patterns
        in_indiv_match = re.search(in_indiv_oop_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if in_indiv_match:
            oop_info["individual_in_network"] = in_indiv_match.group(1).replace(",", "")
            
        in_family_match = re.search(in_family_oop_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if in_family_match:
            oop_info["family_in_network"] = in_family_match.group(1).replace(",", "")
        
        # Check tables for OOP info
        for table in self.tables:
            for index, row in table.iterrows():
                row_str = ' '.join(str(cell) for cell in row if cell)
                if any(term in row_str.lower() for term in ["out-of-pocket", "maximum", "limit"]) and "individual" in row_str.lower():
                    # Try to find numeric values
                    amount_pattern = r"\$\s*(\d+(?:,\d+)?)"
                    amounts = re.findall(amount_pattern, row_str)
                    if len(amounts) >= 2:
                        oop_info["individual_in_network"] = amounts[0].replace(",", "")
                        oop_info["individual_out_of_network"] = amounts[1].replace(",", "")
                
                if any(term in row_str.lower() for term in ["out-of-pocket", "maximum", "limit"]) and "family" in row_str.lower():
                    # Try to find numeric values
                    amount_pattern = r"\$\s*(\d+(?:,\d+)?)"
                    amounts = re.findall(amount_pattern, row_str)
                    if len(amounts) >= 2:
                        oop_info["family_in_network"] = amounts[0].replace(",", "")
                        oop_info["family_out_of_network"] = amounts[1].replace(",", "")
        
        return oop_info, any(oop_info.values())

    def _find_coinsurance_info(self) -> Tuple[Dict[str, Any], bool]:
        """Find coinsurance information"""
        coinsurance_info = {
            "in_network": None,
            "out_of_network": None
        }
        
        # Look for coinsurance in text
        coinsurance_pattern = r"Member\s*Coinsurance.*?(\d+)%.*?Out-of-Network.*?(\d+)%"
        
        # Look for inpatient hospital pattern as fallback
        inpatient_pattern = r"inpatient\s*(?:hospital|stay|care).*?(\d+)%.*?(?:out-of-network|out.*?network).*?(\d+)%"
        
        # Try the main pattern
        match = re.search(coinsurance_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if match:
            coinsurance_info["in_network"] = match.group(1)
            coinsurance_info["out_of_network"] = match.group(2)
            return coinsurance_info, True
        
        # Try the fallback pattern
        match = re.search(inpatient_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if match:
            coinsurance_info["in_network"] = match.group(1)
            coinsurance_info["out_of_network"] = match.group(2)
            return coinsurance_info, True
        
        # Check tables
        for table in self.tables:
            for index, row in table.iterrows():
                row_str = ' '.join(str(cell) for cell in row if cell)
                if "coinsurance" in row_str.lower():
                    # Try to find percentage values
                    percent_pattern = r"(\d+)%"
                    percentages = re.findall(percent_pattern, row_str)
                    if len(percentages) >= 2:
                        coinsurance_info["in_network"] = percentages[0]
                        coinsurance_info["out_of_network"] = percentages[1]
        
        return coinsurance_info, any(coinsurance_info.values())

    def _find_office_visit_info(self) -> Dict[str, Any]:
        """Find office visit information (PCP and Specialist)"""
        office_visit_info = {
            "pcp_in_network": None,
            "pcp_out_of_network": None,
            "specialist_in_network": None,
            "specialist_out_of_network": None
        }
        
        # Look for PCP visits
        pcp_pattern = r"(?:primary\s*care\s*(?:physician|provider|doctor)|pcp).*?(?:visits?|office\s*visits?).*?(?:\$\s*(\d+)|(\d+)%)"
        pcp_oon_pattern = r"(?:primary\s*care\s*(?:physician|provider|doctor)|pcp).*?(?:out.*?network).*?(?:\$\s*(\d+)|(\d+)%)"
        
        # Look for Specialist visits
        specialist_pattern = r"(?:specialist|specialty).*?(?:visits?|office\s*visits?).*?(?:\$\s*(\d+)|(\d+)%)"
        specialist_oon_pattern = r"(?:specialist|specialty).*?(?:out.*?network).*?(?:\$\s*(\d+)|(\d+)%)"
        
        # Try PCP patterns
        pcp_match = re.search(pcp_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if pcp_match:
            if pcp_match.group(1):  # Dollar amount
                office_visit_info["pcp_in_network"] = f"${pcp_match.group(1)}"
            elif pcp_match.group(2):  # Percentage
                office_visit_info["pcp_in_network"] = f"{pcp_match.group(2)}% after deductible"
                
        pcp_oon_match = re.search(pcp_oon_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if pcp_oon_match:
            if pcp_oon_match.group(1):  # Dollar amount
                office_visit_info["pcp_out_of_network"] = f"${pcp_oon_match.group(1)}"
            elif pcp_oon_match.group(2):  # Percentage
                office_visit_info["pcp_out_of_network"] = f"{pcp_oon_match.group(2)}% after deductible"
        
        # Try Specialist patterns
        specialist_match = re.search(specialist_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if specialist_match:
            if specialist_match.group(1):  # Dollar amount
                office_visit_info["specialist_in_network"] = f"${specialist_match.group(1)}"
            elif specialist_match.group(2):  # Percentage
                office_visit_info["specialist_in_network"] = f"{specialist_match.group(2)}% after deductible"
                
        specialist_oon_match = re.search(specialist_oon_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if specialist_oon_match:
            if specialist_oon_match.group(1):  # Dollar amount
                office_visit_info["specialist_out_of_network"] = f"${specialist_oon_match.group(1)}"
            elif specialist_oon_match.group(2):  # Percentage
                office_visit_info["specialist_out_of_network"] = f"{specialist_oon_match.group(2)}% after deductible"
        
        # Check tables
        for table in self.tables:
            for index, row in table.iterrows():
                row_str = ' '.join(str(cell) for cell in row if cell)
                if any(term in row_str.lower() for term in ["primary care", "physician", "pcp"]):
                    # Try to find copay or coinsurance
                    copay_pattern = r"\$\s*(\d+)"
                    coinsurance_pattern = r"(\d+)%"
                    
                    copays = re.findall(copay_pattern, row_str)
                    coinsurances = re.findall(coinsurance_pattern, row_str)
                    
                    if copays and not office_visit_info["pcp_in_network"]:
                        office_visit_info["pcp_in_network"] = f"${copays[0]}"
                    elif coinsurances and not office_visit_info["pcp_in_network"]:
                        office_visit_info["pcp_in_network"] = f"{coinsurances[0]}% after deductible"
                        
                if any(term in row_str.lower() for term in ["specialist", "specialty"]):
                    # Try to find copay or coinsurance
                    copay_pattern = r"\$\s*(\d+)"
                    coinsurance_pattern = r"(\d+)%"
                    
                    copays = re.findall(copay_pattern, row_str)
                    coinsurances = re.findall(coinsurance_pattern, row_str)
                    
                    if copays and not office_visit_info["specialist_in_network"]:
                        office_visit_info["specialist_in_network"] = f"${copays[0]}"
                    elif coinsurances and not office_visit_info["specialist_in_network"]:
                        office_visit_info["specialist_in_network"] = f"{coinsurances[0]}% after deductible"
        
        # If we have in-network but not out-of-network, try to estimate out-of-network
        if office_visit_info["pcp_in_network"] and not office_visit_info["pcp_out_of_network"]:
            if "% after deductible" in office_visit_info["pcp_in_network"]:
                # If in-network is percentage-based, OON is likely also percentage-based but higher
                in_network_percent = int(office_visit_info["pcp_in_network"].split("%")[0])
                office_visit_info["pcp_out_of_network"] = f"{min(in_network_percent + 20, 50)}% after deductible"
        
        if office_visit_info["specialist_in_network"] and not office_visit_info["specialist_out_of_network"]:
            if "% after deductible" in office_visit_info["specialist_in_network"]:
                # If in-network is percentage-based, OON is likely also percentage-based but higher
                in_network_percent = int(office_visit_info["specialist_in_network"].split("%")[0])
                office_visit_info["specialist_out_of_network"] = f"{min(in_network_percent + 20, 50)}% after deductible"
        
        return office_visit_info

    def _find_urgent_and_emergency_info(self) -> Dict[str, Any]:
        """Find urgent care and emergency room information"""
        result = {
            "urgent_care_in_network": None,
            "urgent_care_out_of_network": None,
            "emergency_room_in_network": None
        }
        
        # Look for urgent care
        urgent_care_pattern = r"(?:urgent\s*care|walk-in\s*clinic).*?(?:\$\s*(\d+)|(\d+)%)"
        
        # Look for emergency room
        er_pattern = r"(?:emergency\s*(?:room|care|department)|er).*?(?:\$\s*(\d+)|(\d+)%)"
        
        # Try urgent care pattern
        urgent_match = re.search(urgent_care_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if urgent_match:
            if urgent_match.group(1):  # Dollar amount
                result["urgent_care_in_network"] = f"${urgent_match.group(1)}"
            elif urgent_match.group(2):  # Percentage
                result["urgent_care_in_network"] = f"{urgent_match.group(2)}% after deductible"
        
        # Try emergency room pattern
        er_match = re.search(er_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if er_match:
            if er_match.group(1):  # Dollar amount
                result["emergency_room_in_network"] = f"${er_match.group(1)}"
            elif er_match.group(2):  # Percentage
                result["emergency_room_in_network"] = f"{er_match.group(2)}% after deductible"
        
        # Check tables
        for table in self.tables:
            for index, row in table.iterrows():
                row_str = ' '.join(str(cell) for cell in row if cell)
                if "urgent care" in row_str.lower():
                    # Try to find copay or coinsurance
                    copay_pattern = r"\$\s*(\d+)"
                    coinsurance_pattern = r"(\d+)%"
                    
                    copays = re.findall(copay_pattern, row_str)
                    coinsurances = re.findall(coinsurance_pattern, row_str)
                    
                    if copays and not result["urgent_care_in_network"]:
                        result["urgent_care_in_network"] = f"${copays[0]}"
                    elif coinsurances and not result["urgent_care_in_network"]:
                        result["urgent_care_in_network"] = f"{coinsurances[0]}% after deductible"
                
                if any(term in row_str.lower() for term in ["emergency room", "emergency care", "er"]):
                    # Try to find copay or coinsurance
                    copay_pattern = r"\$\s*(\d+)"
                    coinsurance_pattern = r"(\d+)%"
                    
                    copays = re.findall(copay_pattern, row_str)
                    coinsurances = re.findall(coinsurance_pattern, row_str)
                    
                    if copays and not result["emergency_room_in_network"]:
                        result["emergency_room_in_network"] = f"${copays[0]}"
                    elif coinsurances and not result["emergency_room_in_network"]:
                        result["emergency_room_in_network"] = f"{coinsurances[0]}% after deductible"
        
        # If we have in-network urgent care, set out-of-network
        if result["urgent_care_in_network"] and not result["urgent_care_out_of_network"]:
            if "% after deductible" in result["urgent_care_in_network"]:
                # If in-network is percentage-based, OON is likely also percentage-based but higher
                in_network_percent = int(result["urgent_care_in_network"].split("%")[0])
                result["urgent_care_out_of_network"] = f"{min(in_network_percent + 20, 50)}% after deductible"
            else:
                # If in-network is copay, OON is likely percentage-based
                result["urgent_care_out_of_network"] = "50% after deductible"
        
        return result

    def _find_other_service_info(self) -> Dict[str, Any]:
        """Find information about other services (preventive, outpatient, inpatient, diagnostic)"""
        result = {
            "preventive_in_network": "0%",  # Always 0% in-network per requirements
            "preventive_out_of_network": None,
            "outpatient_surgery_in_network": None,
            "outpatient_surgery_out_of_network": None,
            "inpatient_hospital_in_network": None,
            "inpatient_hospital_out_of_network": None,
            "diagnostic_imaging_in_network": None,
            "diagnostic_imaging_out_of_network": None
        }
        
        # Look for outpatient services
        outpatient_pattern = r"(?:outpatient\s*(?:surgery|procedures|services)).*?(?:\$\s*(\d+)|(\d+)%)"
        outpatient_oon_pattern = r"(?:outpatient\s*(?:surgery|procedures|services)).*?(?:out.*?network).*?(?:\$\s*(\d+)|(\d+)%)"
        
        # Look for inpatient services
        inpatient_pattern = r"(?:inpatient\s*(?:hospital|stay|services)).*?(?:\$\s*(\d+)|(\d+)%)"
        inpatient_oon_pattern = r"(?:inpatient\s*(?:hospital|stay|services)).*?(?:out.*?network).*?(?:\$\s*(\d+)|(\d+)%)"
        
        # Look for diagnostic imaging
        imaging_pattern = r"(?:diagnostic\s*(?:test|x-ray)|ct\s*scan|mri).*?(?:\$\s*(\d+)|(\d+)%)"
        imaging_oon_pattern = r"(?:diagnostic\s*(?:test|x-ray)|ct\s*scan|mri).*?(?:out.*?network).*?(?:\$\s*(\d+)|(\d+)%)"
        
        # Look for preventive services out-of-network
        preventive_oon_pattern = r"(?:preventive\s*(?:care|services)).*?(?:out.*?network).*?(?:\$\s*(\d+)|(\d+)%)"
        
        # Try outpatient pattern
        outpatient_match = re.search(outpatient_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if outpatient_match:
            if outpatient_match.group(1):  # Dollar amount
                result["outpatient_surgery_in_network"] = f"${outpatient_match.group(1)}, then 20% after deductible"
            elif outpatient_match.group(2):  # Percentage
                result["outpatient_surgery_in_network"] = f"{outpatient_match.group(2)}% after deductible"
        
        outpatient_oon_match = re.search(outpatient_oon_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if outpatient_oon_match:
            if outpatient_oon_match.group(1):  # Dollar amount
                result["outpatient_surgery_out_of_network"] = f"${outpatient_oon_match.group(1)}, then 50% after deductible"
            elif outpatient_oon_match.group(2):  # Percentage
                result["outpatient_surgery_out_of_network"] = f"{outpatient_oon_match.group(2)}% after deductible"
        
        # Try inpatient pattern
        inpatient_match = re.search(inpatient_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if inpatient_match:
            if inpatient_match.group(1):  # Dollar amount
                result["inpatient_hospital_in_network"] = f"${inpatient_match.group(1)}, then 20% after deductible"
            elif inpatient_match.group(2):  # Percentage
                result["inpatient_hospital_in_network"] = f"{inpatient_match.group(2)}% after deductible"
        
        inpatient_oon_match = re.search(inpatient_oon_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if inpatient_oon_match:
            if inpatient_oon_match.group(1):  # Dollar amount
                result["inpatient_hospital_out_of_network"] = f"${inpatient_oon_match.group(1)}, then 50% after deductible"
            elif inpatient_oon_match.group(2):  # Percentage
                result["inpatient_hospital_out_of_network"] = f"{inpatient_oon_match.group(2)}% after deductible"
        
        # Try imaging pattern
        imaging_match = re.search(imaging_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if imaging_match:
            if imaging_match.group(1):  # Dollar amount
                result["diagnostic_imaging_in_network"] = f"${imaging_match.group(1)}"
            elif imaging_match.group(2):  # Percentage
                result["diagnostic_imaging_in_network"] = f"{imaging_match.group(2)}% after deductible"
        
        imaging_oon_match = re.search(imaging_oon_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if imaging_oon_match:
            if imaging_oon_match.group(1):  # Dollar amount
                result["diagnostic_imaging_out_of_network"] = f"${imaging_oon_match.group(1)}"
            elif imaging_oon_match.group(2):  # Percentage
                result["diagnostic_imaging_out_of_network"] = f"{imaging_oon_match.group(2)}% after deductible"
        
        # Try preventive OON pattern
        preventive_oon_match = re.search(preventive_oon_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if preventive_oon_match:
            if preventive_oon_match.group(1):  # Dollar amount
                result["preventive_out_of_network"] = f"${preventive_oon_match.group(1)}"
            elif preventive_oon_match.group(2):  # Percentage
                result["preventive_out_of_network"] = f"{preventive_oon_match.group(2)}% after deductible"
        
        # Check tables
        for table in self.tables:
            for index, row in table.iterrows():
                row_str = ' '.join(str(cell) for cell in row if cell)
                
                # Check for outpatient surgery
                if any(term in row_str.lower() for term in ["outpatient surgery", "outpatient services", "outpatient procedures"]):
                    self._process_service_row(row_str, result, "outpatient_surgery_in_network", "outpatient_surgery_out_of_network")
                
                # Check for inpatient hospital
                if any(term in row_str.lower() for term in ["inpatient hospital", "inpatient stay", "inpatient services"]):
                    self._process_service_row(row_str, result, "inpatient_hospital_in_network", "inpatient_hospital_out_of_network")
                
                # Check for diagnostic imaging
                if any(term in row_str.lower() for term in ["diagnostic test", "x-ray", "ct scan", "mri"]):
                    self._process_service_row(row_str, result, "diagnostic_imaging_in_network", "diagnostic_imaging_out_of_network")
                
                # Check for preventive services
                if any(term in row_str.lower() for term in ["preventive care", "preventive services"]):
                    # We only need to look for out-of-network
                    if "out-of-network" in row_str.lower() and not result["preventive_out_of_network"]:
                        percent_match = re.search(r"(\d+)%", row_str)
                        if percent_match:
                            result["preventive_out_of_network"] = f"{percent_match.group(1)}% after deductible"
        
        return result

    def _process_service_row(self, row_str: str, result: Dict[str, Any], in_network_key: str, out_network_key: str) -> None:
        """Helper method to process service information from a table row"""
        # Try to find copay or coinsurance
        copay_pattern = r"\$\s*(\d+)"
        coinsurance_pattern = r"(\d+)%"
        
        copays = re.findall(copay_pattern, row_str)
        coinsurances = re.findall(coinsurance_pattern, row_str)
        
        # Check for freestanding vs hospital
        if "freestanding" in row_str.lower() and "hospital" in row_str.lower():
            # This might have different costs for different settings
            freestanding_value = None
            hospital_value = None
            
            # Find freestanding amount
            freestanding_match = re.search(r"freestanding.*?\$\s*(\d+)", row_str, re.IGNORECASE)
            if freestanding_match:
                freestanding_value = f"${freestanding_match.group(1)}"
            else:
                freestanding_match = re.search(r"freestanding.*?(\d+)%", row_str, re.IGNORECASE)
                if freestanding_match:
                    freestanding_value = f"{freestanding_match.group(1)}% after deductible"
            
            # Find hospital amount
            hospital_match = re.search(r"hospital.*?\$\s*(\d+)", row_str, re.IGNORECASE)
            if hospital_match:
                hospital_value = f"${hospital_match.group(1)}"
            else:
                hospital_match = re.search(r"hospital.*?(\d+)%", row_str, re.IGNORECASE)
                if hospital_match:
                    hospital_value = f"{hospital_match.group(1)}% after deductible"
            
            if freestanding_value and hospital_value and not result[in_network_key]:
                result[in_network_key] = f"Freestanding: {freestanding_value} / Hospital: {hospital_value}"
        else:
            # Standard format
            if copays and not result[in_network_key]:
                if "after deductible" in row_str.lower():
                    result[in_network_key] = f"${copays[0]} after deductible"
                else:
                    result[in_network_key] = f"${copays[0]}"
            elif coinsurances and not result[in_network_key]:
                if len(coinsurances) >= 2:
                    in_pct, out_pct = coinsurances[0], coinsurances[1]
                    result[in_network_key] = f"{in_pct}% after deductible"
                    result[out_network_key] = f"{out_pct}% after deductible"
                else:
                    result[in_network_key] = f"{coinsurances[0]}% after deductible"

    def _find_rx_info(self) -> Dict[str, Any]:
        """Find prescription drug information"""
        result = {
            "rx_deductible_in_network": None,
            "rx_deductible_out_of_network": None,
            "rx_tier1_in_network": None,
            "rx_tier1_out_of_network": None,
            "rx_tier2_in_network": None,
            "rx_tier2_out_of_network": None,
            "rx_tier3_in_network": None,
            "rx_tier3_out_of_network": None,
            "rx_tier4_in_network": None,
            "rx_tier4_out_of_network": None,
            "rx_tier5_in_network": None,
            "rx_tier5_out_of_network": None,
            "rx_mail_order_in_network": None,
            "rx_mail_order_out_of_network": None
        }
        
        # Check if plan has a separate Rx deductible
        rx_deductible_pattern = r"prescription\s*(?:drug)?\s*deductible.*?\$\s*(\d+(?:,\d+)?)"
        
        # Look for generic (Tier 1)
        tier1_pattern = r"(?:generic|tier\s*1).*?(?:\$\s*(\d+)|(\d+)%)"
        
        # Look for preferred brand (Tier 2)
        tier2_pattern = r"(?:preferred\s*brand|tier\s*2).*?(?:\$\s*(\d+)|(\d+)%)"
        
        # Look for non-preferred (Tier 3)
        tier3_pattern = r"(?:non-preferred|tier\s*3).*?(?:\$\s*(\d+)|(\d+)%)"
        
        # Look for specialty (Tier 4)
        tier4_pattern = r"(?:specialty|tier\s*4).*?(?:\$\s*(\d+)|(\d+)%)"
        
        # Look for mail order
        mail_pattern = r"(?:mail\s*order|mail-order).*?(?:\$\s*(\d+)|(\d+)%)"
        
        # Try Rx deductible pattern
        rx_ded_match = re.search(rx_deductible_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if rx_ded_match:
            result["rx_deductible_in_network"] = f"${rx_ded_match.group(1).replace(',', '')}"
        
        # Try tier patterns
        tier1_match = re.search(tier1_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if tier1_match:
            if tier1_match.group(1):  # Dollar amount
                result["rx_tier1_in_network"] = f"${tier1_match.group(1)}"
            elif tier1_match.group(2):  # Percentage
                result["rx_tier1_in_network"] = f"{tier1_match.group(2)}% after deductible"
        
        tier2_match = re.search(tier2_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if tier2_match:
            if tier2_match.group(1):  # Dollar amount
                result["rx_tier2_in_network"] = f"${tier2_match.group(1)}"
            elif tier2_match.group(2):  # Percentage
                result["rx_tier2_in_network"] = f"{tier2_match.group(2)}% after deductible"
        
        tier3_match = re.search(tier3_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if tier3_match:
            if tier3_match.group(1):  # Dollar amount
                result["rx_tier3_in_network"] = f"${tier3_match.group(1)}"
            elif tier3_match.group(2):  # Percentage
                result["rx_tier3_in_network"] = f"{tier3_match.group(2)}% after deductible"
        
        tier4_match = re.search(tier4_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if tier4_match:
            if tier4_match.group(1):  # Dollar amount
                result["rx_tier4_in_network"] = f"${tier4_match.group(1)}"
            elif tier4_match.group(2):  # Percentage
                result["rx_tier4_in_network"] = f"{tier4_match.group(2)}% after deductible"
        
        mail_match = re.search(mail_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if mail_match:
            if mail_match.group(1):  # Dollar amount
                result["rx_mail_order_in_network"] = f"${mail_match.group(1)}"
            elif mail_match.group(2):  # Percentage
                result["rx_mail_order_in_network"] = f"{mail_match.group(2)}% after deductible"
        
        # Check tables for prescription information
        for table in self.tables:
            for index, row in table.iterrows():
                row_str = ' '.join(str(cell) for cell in row if cell)
                
                # Check for Rx deductible
                if ("prescription" in row_str.lower() or "rx" in row_str.lower()) and "deductible" in row_str.lower():
                    deductible_match = re.search(r"\$\s*(\d+(?:,\d+)?)", row_str)
                    if deductible_match and not result["rx_deductible_in_network"]:
                        result["rx_deductible_in_network"] = f"${deductible_match.group(1).replace(',', '')}"
                
                # Check for tiers
                if any(term in row_str.lower() for term in ["generic", "tier 1", "tier1"]):
                    copay_match = re.search(r"\$\s*(\d+)", row_str)
                    if copay_match and not result["rx_tier1_in_network"]:
                        result["rx_tier1_in_network"] = f"${copay_match.group(1)}"
                
                if any(term in row_str.lower() for term in ["preferred brand", "tier 2", "tier2"]):
                    copay_match = re.search(r"\$\s*(\d+)", row_str)
                    if copay_match and not result["rx_tier2_in_network"]:
                        result["rx_tier2_in_network"] = f"${copay_match.group(1)}"
                
                if any(term in row_str.lower() for term in ["non-preferred", "tier 3", "tier3"]):
                    copay_match = re.search(r"\$\s*(\d+)", row_str)
                    if copay_match and not result["rx_tier3_in_network"]:
                        result["rx_tier3_in_network"] = f"${copay_match.group(1)}"
                
                if any(term in row_str.lower() for term in ["specialty", "tier 4", "tier4"]):
                    copay_match = re.search(r"\$\s*(\d+)", row_str)
                    coinsurance_match = re.search(r"(\d+)%", row_str)
                    if copay_match and not result["rx_tier4_in_network"]:
                        result["rx_tier4_in_network"] = f"${copay_match.group(1)}"
                    elif coinsurance_match and not result["rx_tier4_in_network"]:
                        result["rx_tier4_in_network"] = f"{coinsurance_match.group(1)}% after deductible"
                
                if "mail order" in row_str.lower() or "mail-order" in row_str.lower():
                    # Mail order typically lists multiple tiers
                    copays = re.findall(r"\$\s*(\d+)", row_str)
                    if len(copays) >= 3 and not result["rx_mail_order_in_network"]:
                        result["rx_mail_order_in_network"] = f"${copays[0]} / ${copays[1]} / ${copays[2]}"
        
        # If we have tier info but no mail order, try to generate mail order
        if not result["rx_mail_order_in_network"] and result["rx_tier1_in_network"] and result["rx_tier2_in_network"]:
            # Mail order is typically 2-3x the retail cost for a 90-day supply
            mail_values = []
            
            # Process tier 1
            if "$" in result["rx_tier1_in_network"]:
                tier1_value = int(result["rx_tier1_in_network"].replace("$", ""))
                mail_values.append(f"${tier1_value * 2}")
            else:
                mail_values.append(result["rx_tier1_in_network"])
            
            # Process tier 2
            if "$" in result["rx_tier2_in_network"]:
                tier2_value = int(result["rx_tier2_in_network"].replace("$", ""))
                mail_values.append(f"${tier2_value * 2}")
            else:
                mail_values.append(result["rx_tier2_in_network"])
            
            # Process tier 3 if available
            if result["rx_tier3_in_network"]:
                if "$" in result["rx_tier3_in_network"]:
                    tier3_value = int(result["rx_tier3_in_network"].replace("$", ""))
                    mail_values.append(f"${tier3_value * 2}")
                else:
                    mail_values.append(result["rx_tier3_in_network"])
            
            # Combine values
            result["rx_mail_order_in_network"] = " / ".join(mail_values)
        
        return result

    def _find_network_info(self) -> Dict[str, Any]:
        """Find network type and other metadata"""
        result = {
            "network_type": None,
            "network_name": None,
            "member_website": None,
            "customer_service_phone": None,
            "is_hsa_plan": False
        }
        
        # Check for network type
        if "PPO" in self.text:
            result["network_type"] = "PPO"
        elif "POS" in self.text:
            result["network_type"] = "POS"
        elif "HMO" in self.text:
            result["network_type"] = "HMO"
        elif "EPO" in self.text:
            result["network_type"] = "EPO"
        
        # Check for network name
        if "Choice Plus" in self.text:
            result["network_name"] = "Choice Plus"
        elif "Choice" in self.text and "POS" in self.text:
            result["network_name"] = "Choice POS II"
        
        # Check for HSA plan
        if "HSA" in self.text or "Health Savings Account" in self.text:
            result["is_hsa_plan"] = True
        
        # Look for customer service phone
        phone_pattern = r"(?:Customer\s*Service|Call|Phone).*?(\d{3}[-\.\s]?\d{3}[-\.\s]?\d{4})"
        phone_match = re.search(phone_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if phone_match:
            result["customer_service_phone"] = phone_match.group(1)
        
        # Lookup carrier website based on carrier name
        if self.carrier_name == "Aetna":
            result["member_website"] = "https://www.aetna.com/member"
        elif self.carrier_name == "UnitedHealthcare":
            result["member_website"] = "https://www.myuhc.com"
        
        return result

    def _extract_benefits(self) -> None:
        """Extract all benefits from the PDF"""
        
        # Step 1: Get deductible information
        deductible_info, found_deductible = self._find_deductible_info()
        
        # Step 2: Get out-of-pocket information
        oop_info, found_oop = self._find_out_of_pocket_info()
        
        # Step 3: Get coinsurance information
        coinsurance_info, found_coinsurance = self._find_coinsurance_info()
        
        # Step 4: Get office visit information
        office_visit_info = self._find_office_visit_info()
        
        # Step 5: Get urgent care and emergency room information
        urgent_emergency_info = self._find_urgent_and_emergency_info()
        
        # Step 6: Get other services information
        other_services_info = self._find_other_service_info()
        
        # Step 7: Get prescription drug information
        rx_info = self._find_rx_info()
        
        # Step 8: Get network information
        network_info = self._find_network_info()
        
        # Combine all the information
        self.benefits = {
            # Plan information
            "carrier_name": self.carrier_name,
            "plan_name": self.plan_name,
            "is_hsa_plan": network_info["is_hsa_plan"],
            
            # Deductible information
            "individual_deductible_in_network": deductible_info["individual_in_network"],
            "individual_deductible_out_of_network": deductible_info["individual_out_of_network"],
            "family_deductible_in_network": deductible_info["family_in_network"],
            "family_deductible_out_of_network": deductible_info["family_out_of_network"],
            "deductible_type": deductible_info["deductible_type"],
            
            # Coinsurance information
            "coinsurance_in_network": coinsurance_info["in_network"],
            "coinsurance_out_of_network": coinsurance_info["out_of_network"],
            
            # Out-of-pocket information
            "individual_oop_in_network": oop_info["individual_in_network"],
            "individual_oop_out_of_network": oop_info["individual_out_of_network"],
            "family_oop_in_network": oop_info["family_in_network"],
            "family_oop_out_of_network": oop_info["family_out_of_network"],
            
            # Office visits
            "pcp_in_network": office_visit_info["pcp_in_network"],
            "pcp_out_of_network": office_visit_info["pcp_out_of_network"],
            "specialist_in_network": office_visit_info["specialist_in_network"],
            "specialist_out_of_network": office_visit_info["specialist_out_of_network"],
            
            # Urgent care and emergency room
            "urgent_care_in_network": urgent_emergency_info["urgent_care_in_network"],
            "urgent_care_out_of_network": urgent_emergency_info["urgent_care_out_of_network"],
            "emergency_room_in_network": urgent_emergency_info["emergency_room_in_network"],
            "emergency_room_out_of_network": urgent_emergency_info["emergency_room_in_network"],  # Same as in-network
            
            # Other services
            "preventive_in_network": other_services_info["preventive_in_network"],
            "preventive_out_of_network": other_services_info["preventive_out_of_network"],
            "outpatient_surgery_in_network": other_services_info["outpatient_surgery_in_network"],
            "outpatient_surgery_out_of_network": other_services_info["outpatient_surgery_out_of_network"],
            "inpatient_hospital_in_network": other_services_info["inpatient_hospital_in_network"],
            "inpatient_hospital_out_of_network": other_services_info["inpatient_hospital_out_of_network"],
            "diagnostic_imaging_in_network": other_services_info["diagnostic_imaging_in_network"],
            "diagnostic_imaging_out_of_network": other_services_info["diagnostic_imaging_out_of_network"],
            
            # Prescription drugs
            "rx_deductible_in_network": rx_info["rx_deductible_in_network"],
            "rx_deductible_out_of_network": rx_info["rx_deductible_out_of_network"],
            "rx_tier1_in_network": rx_info["rx_tier1_in_network"],
            "rx_tier1_out_of_network": rx_info["rx_tier1_out_of_network"],
            "rx_tier2_in_network": rx_info["rx_tier2_in_network"],
            "rx_tier2_out_of_network": rx_info["rx_tier2_out_of_network"],
            "rx_tier3_in_network": rx_info["rx_tier3_in_network"],
            "rx_tier3_out_of_network": rx_info["rx_tier3_out_of_network"],
            "rx_tier4_in_network": rx_info["rx_tier4_in_network"],
            "rx_tier4_out_of_network": rx_info["rx_tier4_out_of_network"],
            "rx_tier5_in_network": rx_info["rx_tier5_in_network"],
            "rx_tier5_out_of_network": rx_info["rx_tier5_out_of_network"],
            "rx_mail_order_in_network": rx_info["rx_mail_order_in_network"],
            "rx_mail_order_out_of_network": rx_info["rx_mail_order_out_of_network"],
            
            # Network information
            "network_type": network_info["network_type"],
            "network_name": network_info["network_name"],
            "member_website": network_info["member_website"],
            "customer_service_phone": network_info["customer_service_phone"]
        }

    def get_formatted_benefits(self) -> Dict[str, Any]:
        """Format benefits according to template requirements"""
        benefits = self.benefits.copy() if hasattr(self, 'benefits') and self.benefits else {}
        
        # Add HSA suffix to copays if needed
        if benefits.get("is_hsa_plan"):
            for key in benefits:
                if isinstance(benefits[key], str) and "$" in benefits[key]:
                    if "after deductible" not in benefits[key]:
                        benefits[key] = f"{benefits[key]} after deductible"
        
        # Use current year for plan year
        from datetime import datetime
        benefits["plan_year"] = str(datetime.now().year)
        
        # Set deductible period to calendar year
        benefits["deductible_period"] = "Calendar Year: January 1st – December 31st"
        
        # Plan explanation - generic health insurance explanation
        benefits["plan_explanation"] = "Health insurance provides financial coverage for medical expenses, protecting individuals from high healthcare costs. It ensures access to essential healthcare services and promotes overall wellbeing through preventive care."
        
        # Format page name
        benefits["page_name"] = "Health Insurance"
        
        return benefits


def extract_benefits_to_excel(pdf_paths: List[str], output_path: str) -> str:
    """Extract benefits from multiple PDFs and create an Excel template file"""
    all_plans = []
    
    # Process each PDF
    for pdf_path in pdf_paths:
        logging.info(f"Processing PDF: {pdf_path}")
        extractor = BenefitExtractor(pdf_path)
        plan_benefits = extractor.extract_all()
        all_plans.append(plan_benefits)
    
    # Create Excel template
    wb = pd.ExcelWriter(output_path, engine='openpyxl')
    
    # Create dataframe
    health_df = pd.DataFrame()
    
    # Define the fixed row labels
    row_labels = [
        "Carrier Name", "Plan Name", "Page Name", "Plan Explanation",
        "Individual Deductible", "Family Deductible", "", "Coinsurance", "",
        "Individual Out-of-Pocket Max", "Family Out-of-Pocket Max", "", "",
        "Primary Care Physician", "Specialist", "Urgent Care", "Emergency Room", "",
        "Preventive Services", "", "Outpatient Surgery", "Inpatient Hospitalization / Surgery",
        "CT Scan, PT Scan, MRI", "Hospital Newborn Delivery", "",
        "Prescription Deductible", "", "Generic (Tier 1)", "Brand Name (Tier 2)",
        "Non-Preferred (Tier 3)", "Specialty (Tier 4)", "Specialty (Tier 5)",
        "Mail Order - 90 day supply", "", "Plan Year", "Deductible Period",
        "Deductible Explanation", "Network Type", "Network Name", "Member Website",
        "Customer Service Phone Number"
    ]
    
    health_df['A'] = row_labels
    
    # Define column headers (will be populated with plan data)
    headers = ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R"]
    
    for i, plan in enumerate(all_plans):
        col_in = headers[i*3 + 1]  # Column for in-network
        col_out = headers[i*3 + 2]  # Column for out-of-network
        col_label = headers[i*3]    # Column for labels/titles
        
        # Set carrier and plan name
        health_df.at[0, col_label] = plan.get("carrier_name", "")
        health_df.at[1, col_label] = plan.get("plan_name", "")
        health_df.at[2, col_label] = plan.get("page_name", "Health Insurance")
        health_df.at[3, col_label] = plan.get("plan_explanation", "")
        
        # Deductibles
        health_df.at[4, col_in] = plan.get("individual_deductible_in_network", "")
        health_df.at[4, col_out] = plan.get("individual_deductible_out_of_network", "")
        health_df.at[5, col_in] = plan.get("family_deductible_in_network", "")
        health_df.at[5, col_out] = plan.get("family_deductible_out_of_network", "")
        
        # Coinsurance
        health_df.at[7, col_in] = plan.get("coinsurance_in_network", "")
        health_df.at[7, col_out] = plan.get("coinsurance_out_of_network", "")
        
        # Out-of-pocket
        health_df.at[9, col_in] = plan.get("individual_oop_in_network", "")
        health_df.at[9, col_out] = plan.get("individual_oop_out_of_network", "")
        health_df.at[10, col_in] = plan.get("family_oop_in_network", "")
        health_df.at[10, col_out] = plan.get("family_oop_out_of_network", "")
        
        # Office visits
        health_df.at[13, col_in] = plan.get("pcp_in_network", "")
        health_df.at[13, col_out] = plan.get("pcp_out_of_network", "")
        health_df.at[14, col_in] = plan.get("specialist_in_network", "")
        health_df.at[14, col_out] = plan.get("specialist_out_of_network", "")
        health_df.at[15, col_in] = plan.get("urgent_care_in_network", "")
        health_df.at[15, col_out] = plan.get("urgent_care_out_of_network", "")
        health_df.at[16, col_in] = plan.get("emergency_room_in_network", "")
        health_df.at[16, col_out] = plan.get("emergency_room_out_of_network", "")
        
        # Other services
        health_df.at[18, col_in] = plan.get("preventive_in_network", "0%")
        health_df.at[18, col_out] = plan.get("preventive_out_of_network", "")
        health_df.at[20, col_in] = plan.get("outpatient_surgery_in_network", "")
        health_df.at[20, col_out] = plan.get("outpatient_surgery_out_of_network", "")
        health_df.at[21, col_in] = plan.get("inpatient_hospital_in_network", "")
        health_df.at[21, col_out] = plan.get("inpatient_hospital_out_of_network", "")
        health_df.at[22, col_in] = plan.get("diagnostic_imaging_in_network", "")
        health_df.at[22, col_out] = plan.get("diagnostic_imaging_out_of_network", "")
        health_df.at[23, col_in] = plan.get("inpatient_hospital_in_network", "")  # Hospital Newborn
        health_df.at[23, col_out] = plan.get("inpatient_hospital_out_of_network", "")  # Hospital Newborn
        
        # Prescription drugs
        health_df.at[25, col_in] = plan.get("rx_deductible_in_network", "")
        health_df.at[25, col_out] = plan.get("rx_deductible_out_of_network", "")
        health_df.at[27, col_in] = plan.get("rx_tier1_in_network", "")
        health_df.at[27, col_out] = plan.get("rx_tier1_out_of_network", "")
        health_df.at[28, col_in] = plan.get("rx_tier2_in_network", "")
        health_df.at[28, col_out] = plan.get("rx_tier2_out_of_network", "")
        health_df.at[29, col_in] = plan.get("rx_tier3_in_network", "")
        health_df.at[29, col_out] = plan.get("rx_tier3_out_of_network", "")
        health_df.at[30, col_in] = plan.get("rx_tier4_in_network", "")
        health_df.at[30, col_out] = plan.get("rx_tier4_out_of_network", "")
        health_df.at[31, col_in] = plan.get("rx_tier5_in_network", "")
        health_df.at[31, col_out] = plan.get("rx_tier5_out_of_network", "")
        health_df.at[32, col_in] = plan.get("rx_mail_order_in_network", "")
        health_df.at[32, col_out] = plan.get("rx_mail_order_out_of_network", "")
        
        # Plan year and network info
        health_df.at[34, col_in] = plan.get("plan_year", "2025")
        health_df.at[35, col_in] = plan.get("deductible_period", "Calendar Year: January 1st – December 31st")
        health_df.at[36, col_in] = plan.get("deductible_type", "Embedded")
        health_df.at[37, col_in] = plan.get("network_type", "")
        health_df.at[38, col_in] = plan.get("network_name", "")
        health_df.at[39, col_in] = plan.get("member_website", "")
        health_df.at[40, col_in] = plan.get("customer_service_phone", "")
    
    # Write to Excel
    health_df.to_excel(wb, sheet_name='HEALTH', index=False, header=False)
    wb.close()
    
    return output_path


if __name__ == "__main__":
    # Test the extractor
    pdf_path = "your_pdf_path.pdf"
    output_path = "benefit_template.xlsx"
    
    extract_benefits_to_excel([pdf_path], output_path)