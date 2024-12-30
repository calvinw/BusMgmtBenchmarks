import json
import sys

from process_filing import process_filing

def call_process_filing(company_name, cik, filing):
    filing_date = filing['filingDate']
    filing_year = int(filing_date[:4])
    accession_number = filing['accessionNumber'] 
    process_filing(company_name, 
                   cik, 
                   filing_year, 
                   accession_number)

def process_filings(company_name, years):
    try:
        with open(f"filings/{company_name}.json", 'r') as jsonfile:
            data = json.load(jsonfile)
            cik = data['cik']
            if data and "filings" in data:
                # Sort filings by date in ascending order
                sorted_filings = sorted(data["filings"], key=lambda x: x['filingDate'])
                for filing in sorted_filings:
                    filing_year = int(filing['filingDate'][:4])
                    if filing_year in years:
                        call_process_filing(company_name, cik, filing)
            return data
    except FileNotFoundError:
        print(f"Error: File not found for company: {company_name}")
        return None
    return None

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python process_filings.py <company_name> <start_year>:<end_year>")
        sys.exit(1)
    company_name = sys.argv[1]
    year_arg = sys.argv[2]
    
    if ":" not in year_arg:
        print("Error: Must specify a year range in format <start_year>:<end_year>")
        sys.exit(1)
        
    try:
        start_year, end_year = map(int, year_arg.split(":"))
        if start_year > end_year:
            print("Error: Start year must be less than or equal to end year")
            sys.exit(1)
        years = range(start_year, end_year + 1)
    except ValueError:
        print("Invalid year range format. Use <start_year>:<end_year>")
        sys.exit(1)
        
    process_filings(company_name, years)
