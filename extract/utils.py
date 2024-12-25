import os
import json
from datetime import datetime

# This year is the filing year, being passed.
# We are returning the reportDate for the filing year
def get_report_date(company_name, year):
    filings_file='filings/filings.json'
    try:
        # Read the JSON file
        with open(filings_file, 'r') as f:
            data = json.load(f)
            
        # Check if company exists
        if company_name not in data:
            return None
            
        company_data = data[company_name]
        
        # Look through the filings
        for filing in company_data['filings']:
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
    filings_file='filings/filings.json'
    try:
        # Read the JSON file
        with open(filings_file, 'r') as f:
            data = json.load(f)
            
        # Check if company exists
        if company_name not in data:
            return None
            
        company_data = data[company_name]
        
        # Look through the filings
        for filing in company_data['filings']:
            # Get the year from the filing date
            filing_year = datetime.strptime(filing['filingDate'], '%Y-%m-%d').year
            
            # If we find a match for the year
            if filing_year == year:
                return filing['xbrlFile']
                
        return None
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

def get_company_name(cik):
    with open('filings/filings.json', 'r') as f:
        filings = json.load(f)
    for company, data in filings.items():
        if data['cik'] == cik:
            return company
    return None

def get_accession_number(cik, year):
    with open('filings/filings.json', 'r') as f:
        filings = json.load(f)
    
    for company, data in filings.items():
        if data['cik'] == cik:
            for filing in data['filings']:
                if filing['filingDate'].startswith(str(year)):
                    return filing['accessionNumber']
    return None


def check_filing_exists(company_name, year):
    """Check if filing exists for company and year
    
    Args:
        company_name (str): Name of company
        year (str or int): Year to check
        
    Returns:
        bool: True if filing exists, False otherwise
    """
    try:
        with open('filings/filings.json', 'r') as f:
            filings = json.load(f)
            
        return (company_name in filings and 
                str(year) in [filing['reportDate'][:4] for filing in filings[company_name]['filings']])
    except FileNotFoundError:
        print("filings.json not found in filings directory")
        return False
    except Exception as e:
        print(f"Error checking filings: {e}")
        return False

def remove_company_year_files(company_name, year):
    """Remove all data files for a specific company and year
    
    Args:
        company_name (str): Name of company (e.g. 'walmart')
        year (str or int): Year to remove (e.g. '2023' or 2023)
    """
    if not check_filing_exists(company_name, year):
        print(f"No data found for {company_name} and {year}")
        return
        
    files_to_remove = [
        f"html/income-{company_name}-{year}.html",
        f"html/balance-{company_name}-{year}.html",
        f"facts/income-{company_name}-{year}.json",
        f"facts/balance-{company_name}-{year}.json",
        f"concepts/concepts-{company_name}-{year}.json"
    ]
    
    for file in files_to_remove:
        try:
            if os.path.exists(file):
                os.remove(file)
                print(f"Removed: {file}")
        except Exception as e:
            print(f"Error removing {file}: {e}")

def remove_company_files(company_name):
    """Remove all years of data files for a company
    
    Args:
        company_name (str): Name of company (e.g. 'walmart')
    """
    for year in range(2019, 2025):
        remove_company_year_files(company_name, year)

def remove_year_files(year):
    """Remove all companies' data files for a specific year
    
    Args:
        year (str or int): Year to remove (e.g. '2023' or 2023)
    """
    try:
        with open('filings/filings.json', 'r') as f:
            filings = json.load(f)
            
        for company_name in filings.keys():
            remove_company_year_files(company_name, year)
            
    except FileNotFoundError:
        print("filings/filings.json not found")
    except json.JSONDecodeError:
        print("Error reading filings.json")
    except Exception as e:
        print(f"Unexpected error: {e}")
