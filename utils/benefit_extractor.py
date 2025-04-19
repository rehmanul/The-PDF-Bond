import os
import re
import json
import logging
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
import PyPDF2
import pdfplumber

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

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
            logger.debug(f"Extracted {len(self.text)} characters of text")
        except Exception as e:
            logger.error(f"Error extracting text: {str(e)}")
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
                        logger.error(f"Error extracting tables from page {i}: {str(e)}")
            logger.debug(f"Extracted {len(self.tables)} tables")
        except Exception as e:
            logger.error(f"Error with table extraction: {str(e)}")
    
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
        
        # Look for other common carriers
        elif "Cigna" in self.text:
            self.carrier_name = "Cigna"
        elif "Blue Cross" in self.text or "BCBS" in self.text:
            self.carrier_name = "Blue Cross Blue Shield"
        elif "Humana" in self.text:
            self.carrier_name = "Humana"
        elif "Kaiser" in self.text:
            self.carrier_name = "Kaiser Permanente"
            
        logger.debug(f"Identified carrier: {self.carrier_name}, plan: {self.plan_name}")
    
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
        in_indiv_match = re.search(indiv_deductible_pattern, self.text, re.IGNORECASE)
        if in_indiv_match:
            deductible_info["individual_in_network"] = in_indiv_match.group(1).replace(",", "")
        
        in_family_match = re.search(family_deductible_pattern, self.text, re.IGNORECASE)
        if in_family_match:
            deductible_info["family_in_network"] = in_family_match.group(1).replace(",", "")
        
        out_indiv_match = re.search(out_indiv_pattern, self.text, re.IGNORECASE)
        if out_indiv_match:
            deductible_info["individual_out_of_network"] = out_indiv_match.group(1).replace(",", "")
        
        out_family_match = re.search(out_family_pattern, self.text, re.IGNORECASE)
        if out_family_match:
            deductible_info["family_out_of_network"] = out_family_match.group(1).replace(",", "")
        
        # Check if this is an HSA-eligible plan
        is_hsa = "HSA" in self.text.upper() or "HEALTH SAVINGS ACCOUNT" in self.text.upper()
        
        if is_hsa:
            deductible_info["deductible_type"] = "HSA"
        elif any(deductible_info.values()):
            deductible_info["deductible_type"] = "Standard"
        
        # Check if we found any deductible info
        found_info = any(value is not None for key, value in deductible_info.items() if key != "deductible_type")
        
        return deductible_info, found_info
    
    def _find_out_of_pocket_info(self) -> Tuple[Dict[str, Any], bool]:
        """Find out-of-pocket information"""
        oop_info = {
            "individual_in_network": None,
            "individual_out_of_network": None,
            "family_in_network": None,
            "family_out_of_network": None
        }
        
        # Pattern to find OOP values
        oop_pattern = r"Out-of-pocket\s*limit.*?\$\s*(\d+(?:,\d+)?)\s*Individual.*?\$\s*(\d+(?:,\d+)?)\s*Family.*?Out-of-Network[^$]*\$\s*(\d+(?:,\d+)?)\s*Individual.*?\$\s*(\d+(?:,\d+)?)\s*Family"
        
        # Simplified patterns
        indiv_oop_pattern = r"(?:out-of-pocket|maximum).*?individual.*?\$(\d+(?:,\d+)?)"
        family_oop_pattern = r"(?:out-of-pocket|maximum).*?family.*?\$(\d+(?:,\d+)?)"
        out_indiv_oop_pattern = r"out-of-network.*?(?:out-of-pocket|maximum).*?individual.*?\$(\d+(?:,\d+)?)"
        out_family_oop_pattern = r"out-of-network.*?(?:out-of-pocket|maximum).*?family.*?\$(\d+(?:,\d+)?)"
        
        # Try with the comprehensive pattern first
        match = re.search(oop_pattern, self.text, re.IGNORECASE | re.DOTALL)
        if match:
            oop_info["individual_in_network"] = match.group(1).replace(",", "")
            oop_info["family_in_network"] = match.group(2).replace(",", "")
            oop_info["individual_out_of_network"] = match.group(3).replace(",", "")
            oop_info["family_out_of_network"] = match.group(4).replace(",", "")
            return oop_info, True
        
        # Try with simplified patterns
        in_indiv_match = re.search(indiv_oop_pattern, self.text, re.IGNORECASE)
        if in_indiv_match:
            oop_info["individual_in_network"] = in_indiv_match.group(1).replace(",", "")
        
        in_family_match = re.search(family_oop_pattern, self.text, re.IGNORECASE)
        if in_family_match:
            oop_info["family_in_network"] = in_family_match.group(1).replace(",", "")
        
        out_indiv_match = re.search(out_indiv_oop_pattern, self.text, re.IGNORECASE)
        if out_indiv_match:
            oop_info["individual_out_of_network"] = out_indiv_match.group(1).replace(",", "")
        
        out_family_match = re.search(out_family_oop_pattern, self.text, re.IGNORECASE)
        if out_family_match:
            oop_info["family_out_of_network"] = out_family_match.group(1).replace(",", "")
        
        # Check if we found any OOP info
        found_info = any(value is not None for value in oop_info.values())
        
        return oop_info, found_info
    
    def _find_coinsurance_info(self) -> Tuple[Dict[str, Any], bool]:
        """Find coinsurance information"""
        coinsurance_info = {
            "in_network": None,
            "out_of_network": None
        }
        
        # Patterns to find coinsurance values
        in_network_pattern = r"coinsurance.*?in-network.*?(\d+)%"
        out_network_pattern = r"coinsurance.*?out-of-network.*?(\d+)%"
        general_pattern = r"coinsurance.*?(\d+)%"
        
        # Look for in-network coinsurance
        in_match = re.search(in_network_pattern, self.text, re.IGNORECASE)
        if in_match:
            coinsurance_info["in_network"] = in_match.group(1) + "%"
        
        # Look for out-of-network coinsurance
        out_match = re.search(out_network_pattern, self.text, re.IGNORECASE)
        if out_match:
            coinsurance_info["out_of_network"] = out_match.group(1) + "%"
        
        # If we didn't find specific in-network, try general pattern
        if not coinsurance_info["in_network"]:
            general_match = re.search(general_pattern, self.text, re.IGNORECASE)
            if general_match:
                coinsurance_info["in_network"] = general_match.group(1) + "%"
        
        # Check if we found any coinsurance info
        found_info = any(value is not None for value in coinsurance_info.values())
        
        return coinsurance_info, found_info
    
    def _find_office_visit_info(self) -> Dict[str, Any]:
        """Find office visit information (PCP and Specialist)"""
        office_visit_info = {
            "pcp_copay": None,
            "specialist_copay": None
        }
        
        # Patterns for office visits
        pcp_pattern = r"primary care (?:physician|provider|doctor|visit).*?\$(\d+)(?:,\d+)?"
        specialist_pattern = r"specialist.*?(?:visit|care).*?\$(\d+)(?:,\d+)?"
        
        # Look for PCP copay
        pcp_match = re.search(pcp_pattern, self.text, re.IGNORECASE)
        if pcp_match:
            office_visit_info["pcp_copay"] = "$" + pcp_match.group(1)
        
        # Look for specialist copay
        specialist_match = re.search(specialist_pattern, self.text, re.IGNORECASE)
        if specialist_match:
            office_visit_info["specialist_copay"] = "$" + specialist_match.group(1)
            
        return office_visit_info
    
    def _find_urgent_and_emergency_info(self) -> Dict[str, Any]:
        """Find urgent care and emergency room information"""
        urgent_er_info = {
            "urgent_care": None,
            "emergency_room": None
        }
        
        # Patterns for urgent care and ER
        urgent_pattern = r"urgent care.*?\$(\d+)(?:,\d+)?"
        er_pattern = r"emergency (?:room|department|care|services).*?\$(\d+)(?:,\d+)?"
        er_coinsurance_pattern = r"emergency (?:room|department|care|services).*?(\d+)%"
        
        # Look for urgent care copay
        urgent_match = re.search(urgent_pattern, self.text, re.IGNORECASE)
        if urgent_match:
            urgent_er_info["urgent_care"] = "$" + urgent_match.group(1)
        
        # Look for emergency room copay
        er_match = re.search(er_pattern, self.text, re.IGNORECASE)
        if er_match:
            urgent_er_info["emergency_room"] = "$" + er_match.group(1)
        else:
            # Try coinsurance pattern
            er_coinsurance_match = re.search(er_coinsurance_pattern, self.text, re.IGNORECASE)
            if er_coinsurance_match:
                urgent_er_info["emergency_room"] = er_coinsurance_match.group(1) + "%"
                
        return urgent_er_info
    
    def _find_other_service_info(self) -> Dict[str, Any]:
        """Find information about other services (preventive, outpatient, inpatient, diagnostic)"""
        services_info = {
            "preventive_care_in": "0%",  # Default value per formatting rules
            "preventive_care_out": None,
            "inpatient_hospital": None,
            "outpatient_surgery": None,
            "diagnostic_xray": None,
            "diagnostic_lab": None,
        }
        
        # Patterns for other services
        preventive_out_pattern = r"preventive care.*?out-of-network.*?(\d+)%"
        inpatient_pattern = r"inpatient.*?(?:hospital|stay|care).*?(\d+)%"
        inpatient_dollar_pattern = r"inpatient.*?(?:hospital|stay|care).*?\$(\d+)(?:,\d+)?"
        outpatient_pattern = r"outpatient.*?(?:surgery|procedures|hospital).*?(\d+)%"
        outpatient_dollar_pattern = r"outpatient.*?(?:surgery|procedures|hospital).*?\$(\d+)(?:,\d+)?"
        xray_pattern = r"(?:x-ray|imaging).*?(\d+)%"
        xray_dollar_pattern = r"(?:x-ray|imaging).*?\$(\d+)(?:,\d+)?"
        lab_pattern = r"(?:lab|laboratory|diagnostic test).*?(\d+)%"
        lab_dollar_pattern = r"(?:lab|laboratory|diagnostic test).*?\$(\d+)(?:,\d+)?"
        
        # Look for out-of-network preventive care
        preventive_out_match = re.search(preventive_out_pattern, self.text, re.IGNORECASE)
        if preventive_out_match:
            services_info["preventive_care_out"] = preventive_out_match.group(1) + "%"
        
        # Look for inpatient hospital
        inpatient_match = re.search(inpatient_pattern, self.text, re.IGNORECASE)
        if inpatient_match:
            services_info["inpatient_hospital"] = inpatient_match.group(1) + "%"
        else:
            inpatient_dollar_match = re.search(inpatient_dollar_pattern, self.text, re.IGNORECASE)
            if inpatient_dollar_match:
                services_info["inpatient_hospital"] = "$" + inpatient_dollar_match.group(1)
        
        # Look for outpatient surgery
        outpatient_match = re.search(outpatient_pattern, self.text, re.IGNORECASE)
        if outpatient_match:
            services_info["outpatient_surgery"] = outpatient_match.group(1) + "%"
        else:
            outpatient_dollar_match = re.search(outpatient_dollar_pattern, self.text, re.IGNORECASE)
            if outpatient_dollar_match:
                services_info["outpatient_surgery"] = "$" + outpatient_dollar_match.group(1)
        
        # Look for diagnostic x-ray
        xray_match = re.search(xray_pattern, self.text, re.IGNORECASE)
        if xray_match:
            services_info["diagnostic_xray"] = xray_match.group(1) + "%"
        else:
            xray_dollar_match = re.search(xray_dollar_pattern, self.text, re.IGNORECASE)
            if xray_dollar_match:
                services_info["diagnostic_xray"] = "$" + xray_dollar_match.group(1)
        
        # Look for diagnostic lab
        lab_match = re.search(lab_pattern, self.text, re.IGNORECASE)
        if lab_match:
            services_info["diagnostic_lab"] = lab_match.group(1) + "%"
        else:
            lab_dollar_match = re.search(lab_dollar_pattern, self.text, re.IGNORECASE)
            if lab_dollar_match:
                services_info["diagnostic_lab"] = "$" + lab_dollar_match.group(1)
                
        # Process table data if available
        for table in self.tables:
            self._process_service_row(str(table), services_info, "inpatient_hospital", "inpatient_hospital_out")
            self._process_service_row(str(table), services_info, "outpatient_surgery", "outpatient_surgery_out")
            self._process_service_row(str(table), services_info, "diagnostic_xray", "diagnostic_xray_out")
            self._process_service_row(str(table), services_info, "diagnostic_lab", "diagnostic_lab_out")
                
        return services_info
    
    def _process_service_row(self, row_str: str, result: Dict[str, Any], in_network_key: str, out_network_key: str) -> None:
        """Helper method to process service information from a table row"""
        if in_network_key == "inpatient_hospital" and "inpatient" in row_str.lower() and "hospital" in row_str.lower():
            # Extract in-network
            in_dollar_match = re.search(r"inpatient.*?in-network.*?\$(\d+)", row_str, re.IGNORECASE)
            in_percent_match = re.search(r"inpatient.*?in-network.*?(\d+)%", row_str, re.IGNORECASE)
            
            if in_dollar_match:
                result[in_network_key] = "$" + in_dollar_match.group(1)
            elif in_percent_match:
                result[in_network_key] = in_percent_match.group(1) + "%"
                
            # Extract out-of-network
            out_dollar_match = re.search(r"inpatient.*?out-of-network.*?\$(\d+)", row_str, re.IGNORECASE)
            out_percent_match = re.search(r"inpatient.*?out-of-network.*?(\d+)%", row_str, re.IGNORECASE)
            
            if out_dollar_match:
                result[out_network_key] = "$" + out_dollar_match.group(1)
            elif out_percent_match:
                result[out_network_key] = out_percent_match.group(1) + "%"
                
        # Similar processing for other service types
        elif in_network_key == "outpatient_surgery" and "outpatient" in row_str.lower() and ("surgery" in row_str.lower() or "procedure" in row_str.lower()):
            # Processing logic similar to inpatient but for outpatient surgery
            pass
            
        elif in_network_key == "diagnostic_xray" and ("x-ray" in row_str.lower() or "imaging" in row_str.lower() or "diagnostic" in row_str.lower()):
            # Processing logic similar to inpatient but for diagnostic x-ray
            pass
            
        elif in_network_key == "diagnostic_lab" and ("lab" in row_str.lower() or "laboratory" in row_str.lower() or "test" in row_str.lower()):
            # Processing logic similar to inpatient but for diagnostic lab
            pass
    
    def _find_rx_info(self) -> Dict[str, Any]:
        """Find prescription drug information"""
        rx_info = {
            "rx_tier1": None,
            "rx_tier2": None,
            "rx_tier3": None,
            "rx_tier4": None,
            "rx_mail_order": None
        }
        
        # Patterns for prescription drugs
        tier1_pattern = r"(?:tier\s*1|generic drugs).*?\$(\d+)(?:,\d+)?"
        tier2_pattern = r"(?:tier\s*2|preferred brand).*?\$(\d+)(?:,\d+)?"
        tier3_pattern = r"(?:tier\s*3|non-preferred brand).*?\$(\d+)(?:,\d+)?"
        tier4_pattern = r"(?:tier\s*4|specialty).*?\$(\d+)(?:,\d+)?"
        mail_pattern = r"mail order.*?\$(\d+)(?:,\d+)?"
        
        # Look for tier 1 drugs
        tier1_match = re.search(tier1_pattern, self.text, re.IGNORECASE)
        if tier1_match:
            rx_info["rx_tier1"] = "$" + tier1_match.group(1)
        
        # Look for tier 2 drugs
        tier2_match = re.search(tier2_pattern, self.text, re.IGNORECASE)
        if tier2_match:
            rx_info["rx_tier2"] = "$" + tier2_match.group(1)
        
        # Look for tier 3 drugs
        tier3_match = re.search(tier3_pattern, self.text, re.IGNORECASE)
        if tier3_match:
            rx_info["rx_tier3"] = "$" + tier3_match.group(1)
        
        # Look for tier 4 drugs (specialty)
        tier4_match = re.search(tier4_pattern, self.text, re.IGNORECASE)
        if tier4_match:
            rx_info["rx_tier4"] = "$" + tier4_match.group(1)
        
        # Look for mail order
        mail_match = re.search(mail_pattern, self.text, re.IGNORECASE)
        if mail_match:
            rx_info["rx_mail_order"] = "$" + mail_match.group(1)
            
        return rx_info
    
    def _find_network_info(self) -> Dict[str, Any]:
        """Find network type and other metadata"""
        network_info = {
            "network_type": "Unknown",
            "effective_date": None,
            "plan_year": None
        }
        
        # Patterns for network information
        ppo_pattern = r"\bPPO\b|\bPreferred\s+Provider\s+Organization\b"
        hmo_pattern = r"\bHMO\b|\bHealth\s+Maintenance\s+Organization\b"
        epo_pattern = r"\bEPO\b|\bExclusive\s+Provider\s+Organization\b"
        pos_pattern = r"\bPOS\b|\bPoint\s+of\s+Service\b"
        effective_pattern = r"effective (?:date|as of|on)[: ]*([a-zA-Z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}/\d{1,2}/\d{2,4})"
        plan_year_pattern = r"(?:plan|coverage|benefit) year[: ]*(\d{4})"
        
        # Determine network type
        if re.search(ppo_pattern, self.text, re.IGNORECASE):
            network_info["network_type"] = "PPO"
        elif re.search(hmo_pattern, self.text, re.IGNORECASE):
            network_info["network_type"] = "HMO"
        elif re.search(epo_pattern, self.text, re.IGNORECASE):
            network_info["network_type"] = "EPO"
        elif re.search(pos_pattern, self.text, re.IGNORECASE):
            network_info["network_type"] = "POS"
        
        # Find effective date
        effective_match = re.search(effective_pattern, self.text, re.IGNORECASE)
        if effective_match:
            network_info["effective_date"] = effective_match.group(1)
        
        # Find plan year
        plan_year_match = re.search(plan_year_pattern, self.text, re.IGNORECASE)
        if plan_year_match:
            network_info["plan_year"] = plan_year_match.group(1)
            
        return network_info
    
    def _extract_benefits(self) -> None:
        """Extract all benefits from the PDF"""
        try:
            # Get various benefit information
            deductible_info, _ = self._find_deductible_info()
            oop_info, _ = self._find_out_of_pocket_info()
            coinsurance_info, _ = self._find_coinsurance_info()
            office_visit_info = self._find_office_visit_info()
            urgent_er_info = self._find_urgent_and_emergency_info()
            services_info = self._find_other_service_info()
            rx_info = self._find_rx_info()
            network_info = self._find_network_info()
            
            # Combine all info into the benefits dictionary
            self.benefits = {
                "carrier_name": self.carrier_name,
                "plan_name": self.plan_name,
                "deductible_individual_in": deductible_info["individual_in_network"],
                "deductible_family_in": deductible_info["family_in_network"],
                "deductible_individual_out": deductible_info["individual_out_of_network"],
                "deductible_family_out": deductible_info["family_out_of_network"],
                "deductible_type": deductible_info["deductible_type"],
                "oop_individual_in": oop_info["individual_in_network"],
                "oop_family_in": oop_info["family_in_network"],
                "oop_individual_out": oop_info["individual_out_of_network"],
                "oop_family_out": oop_info["family_out_of_network"],
                "coinsurance_in": coinsurance_info["in_network"],
                "coinsurance_out": coinsurance_info["out_of_network"],
                "pcp_copay": office_visit_info["pcp_copay"],
                "specialist_copay": office_visit_info["specialist_copay"],
                "urgent_care": urgent_er_info["urgent_care"],
                "emergency_room": urgent_er_info["emergency_room"],
                "preventive_care_in": services_info["preventive_care_in"],
                "preventive_care_out": services_info["preventive_care_out"],
                "inpatient_hospital": services_info["inpatient_hospital"],
                "outpatient_surgery": services_info["outpatient_surgery"],
                "diagnostic_xray": services_info["diagnostic_xray"],
                "diagnostic_lab": services_info["diagnostic_lab"],
                "rx_tier1": rx_info["rx_tier1"],
                "rx_tier2": rx_info["rx_tier2"],
                "rx_tier3": rx_info["rx_tier3"],
                "rx_tier4": rx_info["rx_tier4"],
                "rx_mail_order": rx_info["rx_mail_order"],
                "network_type": network_info["network_type"],
                "effective_date": network_info["effective_date"],
                "plan_year": network_info["plan_year"]
            }
            
            logger.debug(f"Extracted {len(self.benefits)} benefit fields")
            
        except Exception as e:
            logger.error(f"Error extracting benefits: {str(e)}")
            self.benefits = {
                "carrier_name": self.carrier_name,
                "plan_name": self.plan_name,
                "error": str(e)
            }
    
    def get_formatted_benefits(self) -> Dict[str, Any]:
        """Format benefits according to template requirements"""
        formatted = {}
        
        # Check if we have benefits
        if not self.benefits:
            self._extract_benefits()
        
        # Format all values based on formatting rules
        for key, value in self.benefits.items():
            if value is None:
                formatted[key] = "Not Found"
            else:
                # Handle HSA plan formatting
                is_hsa = self.benefits.get("deductible_type") == "HSA"
                
                if is_hsa and "$" in str(value) and not key.startswith("rx_") and key not in ["carrier_name", "plan_name", "network_type", "effective_date", "plan_year"]:
                    formatted[key] = f"{value} after deductible"
                elif "%" in str(value) and "deductible" not in str(value).lower() and key not in ["preventive_care_in", "carrier_name", "plan_name", "network_type", "effective_date", "plan_year"]:
                    formatted[key] = f"{value} after deductible"
                else:
                    # Ensure value is serializable (convert to string if needed)
                    try:
                        json.dumps({key: value})
                        formatted[key] = value
                    except (TypeError, ValueError):
                        formatted[key] = str(value)
        
        # Set emergency room out-of-network to match in-network (per formatting rules)
        if "emergency_room" in formatted and formatted.get("emergency_room") != "Not Found":
            formatted["emergency_room_out"] = formatted["emergency_room"]
        
        # Make sure the entire object is serializable 
        try:
            json.dumps(formatted)
        except (TypeError, ValueError) as e:
            logger.error(f"Error serializing benefits: {str(e)}")
            # Make a clean serializable copy with strings only
            formatted = {k: str(v) if v is not None else "Not Found" for k, v in formatted.items()}
        
        return formatted

def extract_benefits_to_excel(pdf_paths: List[str], output_path: str) -> str:
    """Extract benefits from multiple PDFs and create an Excel template file"""
    results = []
    
    for pdf_path in pdf_paths:
        try:
            extractor = BenefitExtractor(pdf_path)
            benefits = extractor.extract_all()
            
            # Add filename to results
            benefits["filename"] = os.path.basename(pdf_path)
            results.append(benefits)
            
            logger.info(f"Successfully extracted benefits from {os.path.basename(pdf_path)}")
        except Exception as e:
            logger.error(f"Error processing {os.path.basename(pdf_path)}: {str(e)}")
            results.append({
                "filename": os.path.basename(pdf_path),
                "error": str(e)
            })
    
    # Create Excel file with results
    try:
        with pd.ExcelWriter(output_path) as writer:
            # Create a summary sheet
            summary_data = []
            for result in results:
                summary_data.append(result)
            
            if summary_data:
                summary_df = pd.DataFrame(summary_data)
                summary_df.to_excel(writer, sheet_name='Summary', index=False)
            
            # Create individual sheets for each PDF
            for i, result in enumerate(results):
                df = pd.DataFrame([result])
                df.to_excel(writer, sheet_name=f'PDF {i+1}', index=False)
        
        return output_path
    except Exception as e:
        logger.error(f"Error creating Excel file: {str(e)}")
        raise