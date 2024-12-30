import os
import json
from datetime import datetime
import requests

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

# This year is the filing year, being passed.
# We are returning the reportDate for the filing year
def get_report_date(company_name, year):

    filings_file=f"filings/{company_name}.json"
    try:
        # Read the JSON file
        with open(filings_file, 'r') as f:
            data = json.load(f)
            
        # Look through the filings
        for filing in data['filings']:
            # Get the filing year for this report 
            filing_year = datetime.strptime(filing['filingDate'], '%Y-%m-%d').year
            
            # If the filing year for the report is equal to passed year return report date
            if filing_year == year:
                return filing['reportDate']
                
        return None
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

def get_xbrl_url(company_name, year):
    filings_file=f"filings/{company_name}.json"
    try:
        # Read the JSON file
        with open(filings_file, 'r') as f:
            data = json.load(f)
            
        # Look through the filings
        for filing in data['filings']:
            # Get the year from the filing date
            filing_year = datetime.strptime(filing['filingDate'], '%Y-%m-%d').year
            
            # If we find a match for the year
            if filing_year == year:
                return filing['xbrlFile']
                
        return None
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return None
