import csv
import sys
import requests
from openai import OpenAI
import os
import re
import pandas as pd
from dotenv import load_dotenv
import xml.etree.ElementTree as ET
from typing import List, Tuple
from typing import List, Optional
from pathlib import Path
import json
import argparse
from typing import Union
import copy

g_filing_summary = "FilingSummary.xml"

def trim_filing_summary_reports_xml(xml_content: Union[str, bytes], max_reports: int = 10) -> str:
    try:
        # Parse the XML content
        root = ET.fromstring(xml_content)
        
        # Find the MyReports section
        my_reports = root.find('.//MyReports')
        if my_reports is None:
            raise ValueError("Could not find MyReports section in XML")
            
        # Get all reports
        reports = my_reports.findall('Report')
        
        # If there are more reports than max_reports, remove the excess
        if len(reports) > max_reports:
            # Remove excess reports
            for report in reports[max_reports:]:
                my_reports.remove(report)
        
        # Convert back to string while preserving XML declaration
        xml_str = '<?xml version=\'1.0\' encoding=\'utf-8\'?>\n'
        xml_str += ET.tostring(root, encoding='unicode', method='xml')
        
        return xml_str
        
    except ET.ParseError as e:
        raise ET.ParseError(f"Failed to parse XML content: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error processing XML content: {str(e)}")


def download(url, name):
    headers = {
        "User-Agent": "FIT calvin_williamson@fitnyc.edu"
    }

    try:
        response = requests.get(url, headers=headers, stream=True)
        response.raise_for_status()

        with open(name, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print("Downloaded ", name)
    except requests.exceptions.RequestException as e:
        print(f"Error downloading file: {e}")

# Utility function to read XML file
def read_xml_file(filename: str) -> str:
    """Read XML file from disk"""
    with open(filename, 'r', encoding='utf-8') as file:
        return file.read()

# Utility function to write XML file
def write_xml_file(filename: str, content: str) -> None:
    """Write XML content to disk"""
    with open(filename, 'w', encoding='utf-8') as file:
        file.write(content)

    print("Wrote xml file ", filename)

def print_30_lines(text):
    lines = text.split('\n')
    first_30 = '\n'.join(lines[:30])
    print(first_30)

def download_filing_summary(company_name, cik, year, accession_number):
    accession_number_no_dashes = accession_number.replace("-","")
    base_url = f"https://www.sec.gov/Archives/edgar/data/{cik}/{accession_number_no_dashes}"
    filing_summary_url = f"{base_url}/{g_filing_summary}" 
    print(filing_summary_url)
    download(filing_summary_url, g_filing_summary) 
    xml_string = read_xml_file(g_filing_summary)
    short_xml = trim_filing_summary_reports_xml(xml_string)
    #print_30_lines(short_xml)
    write_xml_file(g_filing_summary, short_xml)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python download_filing_summary.py <cik> <year>")
        sys.exit(1)
    cik = sys.argv[1]
    year = sys.argv[2]
    download_filing_summary(cik, year)
