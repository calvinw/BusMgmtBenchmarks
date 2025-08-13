#!/usr/bin/env python3
"""
Batch generate financial HTML files for all companies and years

Usage:
    python batch_generate_financials.py
"""

import pandas as pd
import subprocess
import time
import sys
from pathlib import Path

def main():
    # Read companies from CSV
    try:
        companies_df = pd.read_csv('american_companies.csv')
        companies = list(zip(companies_df['Company Name'].str.strip(), companies_df['Ticker'].str.strip()))
        print(f"Found {len(companies)} companies in american_companies.csv")
    except FileNotFoundError:
        print("❌ american_companies.csv not found!")
        return
    
    # Years to process
    years = list(range(2018, 2025))  # 2018 to 2024
    print(f"Processing years: {years}")
    
    total_combinations = len(companies) * len(years)
    print(f"Total combinations to process: {total_combinations}")
    print()
    
    success_count = 0
    failure_count = 0
    
    for year in years:
        print(f"\n=== Processing Year {year} ===")
        
        for i, (company_name, ticker) in enumerate(companies):
            print(f"  [{i+1}/{len(companies)}] {ticker} ({company_name}) - {year}")
            
            try:
                # Run the get_financials_html.py script
                result = subprocess.run([
                    'python', 'get_financials_html.py', ticker, str(year)
                ], capture_output=True, text=True, timeout=60)
                
                if result.returncode == 0:
                    print(f"    ✅ Success")
                    success_count += 1
                else:
                    print(f"    ❌ Failed: {result.stderr.strip()}")
                    failure_count += 1
                    
            except subprocess.TimeoutExpired:
                print(f"    ⏰ Timeout after 60 seconds")
                failure_count += 1
            except Exception as e:
                print(f"    ❌ Error: {str(e)}")
                failure_count += 1
            
            # Be respectful to SEC API - 2 second delay
            time.sleep(2)
        
        print(f"Year {year} completed. Success: {success_count}, Failures: {failure_count}")
    
    print(f"\n=== FINAL SUMMARY ===")
    print(f"Total processed: {success_count + failure_count}")
    print(f"Successful: {success_count}")
    print(f"Failed: {failure_count}")
    print(f"Success rate: {success_count/(success_count + failure_count)*100:.1f}%")
    
    # List generated files
    html_files = list(Path('.').glob('*-financials.html'))
    print(f"\nGenerated {len(html_files)} HTML files:")
    for file in sorted(html_files):
        print(f"  {file}")

if __name__ == "__main__":
    main()