#!/usr/bin/env python3

import os
import csv
import glob

# Read company mapping
ticker_to_company = {}
with open('../companies.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row['company_name'] and row['ticker']:
            ticker_to_company[row['ticker']] = row['company_name']

# Find all ticker-YYYY-financials.html files
pattern = "*-????-financials.html"
files = glob.glob(pattern)

print(f"Found {len(files)} files to rename")

for file in files:
    # Parse filename: TICKER-YYYY-financials.html
    parts = file.split('-')
    if len(parts) >= 3 and parts[-1] == 'financials.html':
        ticker = parts[0]
        year = int(parts[1])
        
        if ticker in ticker_to_company:
            company_name = ticker_to_company[ticker]
            new_year = year + 1
            new_filename = f"{company_name}-{new_year}.html"
            
            print(f"Renaming: {file} -> {new_filename}")
            
            # Check if target file already exists
            if os.path.exists(new_filename):
                print(f"  WARNING: {new_filename} already exists, overwriting...")
                os.remove(new_filename)
            
            os.rename(file, new_filename)
        else:
            print(f"  SKIPPING: No company name found for ticker {ticker}")

print("Renaming complete!")