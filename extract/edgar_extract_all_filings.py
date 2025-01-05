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

# Define column types explicitly
COLUMN_TYPES = {
    "company_name": str,
    "year": int,
    "Net Revenue": int,
    "Cost of Goods": int,
    "SG&A": int,
    "Operating Profit": int,
    "Net Profit": int,
    "Inventory": int,
    "Current Assets": int,
    "Total Assets": int,
    "Current Liabilities": int,
    "Total Shareholder Equity": int,
    "Total Liabilities and Shareholder Equity": int
}

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
                    data[field] = int(data[field]) / 1000
                    
            results.append(data)
        
        return results
        
    except ValueError as e:
        print(f"Value error for {company_name}: {str(e)}")
        return None
    except Exception as e:
        print(f"Unexpected error for {company_name}: {str(e)}")
        return None

class EdgarDataLoader:
    """Class to handle data loading and saving operations."""
    
    def __init__(self, filepath: str):
        self.filepath = filepath
    
    def load(self) -> pd.DataFrame:
        try:
            df = pd.read_csv(self.filepath, dtype=COLUMN_TYPES)
            return df
        except FileNotFoundError:
            return pd.DataFrame(columns=COLUMNS).astype(COLUMN_TYPES)
    
    def save(self, df: pd.DataFrame) -> None:
        # Ensure all columns have correct types before saving
        for col, dtype in COLUMN_TYPES.items():
            if col in df.columns:
                if dtype == int:
                    df[col] = df[col].fillna(0).astype(int)
                else:
                    df[col] = df[col].astype(dtype)
        
        df.to_csv(self.filepath, index=False)
    
    def append_and_save(self, new_data: pd.DataFrame) -> None:
        """Append new data to existing file and save, removing duplicates."""
        if new_data.empty:
            return
            
        existing_df = self.load()
        
        # Ensure both DataFrames have the same dtypes before concatenation
        for col, dtype in COLUMN_TYPES.items():
            if col in existing_df.columns:
                existing_df[col] = existing_df[col].astype(dtype)
            if col in new_data.columns:
                new_data[col] = new_data[col].astype(dtype)
        
        # Concatenate and remove duplicates
        final_df = pd.concat([existing_df, new_data], sort=False).drop_duplicates()
        
        # Ensure final DataFrame has correct dtypes
        for col, dtype in COLUMN_TYPES.items():
            if col in final_df.columns:
                final_df[col] = final_df[col].astype(dtype)
        
        self.save(final_df)

def process_companies(companies: List[Tuple[str, str]], data_loader: EdgarDataLoader) -> None:
    """Process multiple companies and save data after each company is processed.
    
    Args:
        companies: List of (company_name, cik) tuples
        data_loader: EdgarDataLoader instance for handling data operations
    """
    existing_df = data_loader.load()
    
    for company_name, cik in companies:
        try:
            print(f"Processing {company_name}...")
            company_data = add_company_filing_if_needed(company_name, cik, existing_df)
            
            if company_data:
                # Convert company data to DataFrame with explicit dtypes
                company_df = pd.DataFrame(company_data, columns=COLUMNS)
                for col, dtype in COLUMN_TYPES.items():
                    if col in company_df.columns:
                        company_df[col] = company_df[col].astype(dtype)
                
                data_loader.append_and_save(company_df)
                print(f"Successfully processed and saved data for {company_name}")
            else:
                print(f"No new data to save for {company_name}")
                
        except Exception as e:
            print(f"Error processing {company_name}: {str(e)}")
            continue

if __name__ == "__main__":
    data_file = "mock_extracted_financial_data.csv"
    loader = EdgarDataLoader(data_file)
    
    # Read companies from CIK.csv
    companies = []
    with open('CIK.csv', 'r') as csvfile:
        csv_reader = csv.DictReader(csvfile)
        for row in csv_reader:
            companies.append((row['company_name'], row['cik']))
            
    print(f"Processing {len(companies)} companies from CIK.csv")
    
    process_companies(companies, loader)
    print("\nProcessing complete - data has been saved to mock_extracted_data.csv")
