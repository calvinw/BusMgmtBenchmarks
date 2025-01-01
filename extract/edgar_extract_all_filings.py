from edgar import set_identity, Company, Filing
import pandas as pd
from datetime import datetime
import json
import os
from typing import List, Tuple, Dict, Optional
from edgar_extract_one_filing import process_filing 
import csv

os.environ['EDGAR_IDENTITY'] = "Calvin Williamson calvin_williamson@fitnyc.edu"

COLUMNS = [
    "company_name", 
    "year", 
    "Net Revenue", 
    "Cost of Goods", 
    "SG&A",
    "Operating Profit", 
    "Net Profit", 
    "Inventory", 
    "Current Assets",
    "Total Assets", 
    "Current Liabilities", 
    "Total Shareholder Equity",
    "Total Liabilities and Shareholder Equity"
]

def get_recent_filings(company: Company):
    """Get all 10-K filings from 2019 onwards."""
    try:
        filings = company.get_filings(form="10-K")
        if not filings:
            raise ValueError("No 10-K filings found")
        return [f for f in filings if f.filing_date.year >= 2019]
    except Exception as e:
        print(f"Error getting filing: {str(e)}")
        return None

def add_company_filing_if_needed(
    company_name: str, 
    cik: str,
    existing_data: Optional[pd.DataFrame] = None
) -> List[Dict[str, str]]:
    """Process company filings from 2019 onwards with basic error handling."""
    try:
        # set_identity("Calvin Williamson calvin_williamson@fitnyc.edu")
        # os.environ[edgar_identity] = "Calvin Williamson calvin_williamson@fitnyc.edu"
        company = Company(cik)
        filings = get_recent_filings(company)
        
        if not filings:
            print(f"No valid filings found for {company_name}")
            return []
            
        results = []
        for filing in filings:
            filing_year = filing.filing_date.year
            
            if existing_data is not None and not existing_data.empty:
                if ((existing_data['company_name'] == company_name) & 
                    (existing_data['year'] == filing_year)).any():
                    print(f"Skipping {company_name} year {filing_year} - already exists")
                    continue
            
            data = process_filing(company_name, filing)
            if not data:
                print(f"Failed to process filing for {company_name} year {filing_year}")
                continue
                
            data['company_name'] = company_name
            data['year'] = filing_year
            
            # Rescale all numerical fields except company_name and year by dividing by 1000
            for field in data.keys():
                if field not in ['company_name', 'year']:
                    data[field] = data[field] / 1000
                    
            results.append(data)
        
        return results
        
    except ValueError as e:
        print(f"Value error for {company_name}: {str(e)}")
        return None
    except Exception as e:
        print(f"Unexpected error for {company_name}: {str(e)}")
        return None

def process_companies(companies: List[Tuple[str, str]], existing_data: Optional[pd.DataFrame] = None) -> pd.DataFrame:
    """Process multiple companies and return combined DataFrame.
    
    Args:
        companies: List of (company_name, cik) tuples
        existing_data: Optional DataFrame with existing data
    
    Returns:
        DataFrame with processed company data
    """
    rows = []
    for company_name, cik in companies:
        try:
            company_data = add_company_filing_if_needed(company_name, cik, existing_data)
            if company_data:
                rows.extend(company_data)
        except Exception as e:
            print(f"Error processing {company_name}: {str(e)}")
            continue
    
    return pd.DataFrame(rows, columns=COLUMNS)

class EdgarDataLoader:
    """Class to handle data loading and saving operations."""
    
    def __init__(self, filepath: str):
        self.filepath = filepath
    
    def load(self) -> pd.DataFrame:
        try:
            return pd.read_csv(self.filepath)
        except FileNotFoundError:
            return pd.DataFrame(columns=COLUMNS)
    
    def save(self, df: pd.DataFrame) -> None:
        df.to_csv(self.filepath, index=False)

if __name__ == "__main__":
    data_file = "mock_extracted_data.csv"
    loader = EdgarDataLoader(data_file)
    existing_df = loader.load()
    
    # Read companies from CIK.csv
    companies = []
    with open('../CIK.csv', 'r') as csvfile:
        csv_reader = csv.DictReader(csvfile)
        for row in csv_reader:
            companies.append((row['company_name'], row['cik']))
            
    print(f"Processing {len(companies)} companies from CIK.csv")
    
    new_data = process_companies(companies, existing_df)
    
    # Combine old and new data, dropping duplicates
    final_df = pd.concat([existing_df, new_data]).drop_duplicates(
        subset=['company_name', 'year']
    )
    
    loader.save(final_df)
    print("\nData written to mock_extracted_data.csv")
