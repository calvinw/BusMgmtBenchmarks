#!/usr/bin/env python3
"""
Get financial statements (Income Statement and Balance Sheet) from SEC EDGAR for a specific ticker and year

Usage:
    python get_financials_html.py TICKER YEAR
    
Example:
    python get_financials_html.py WMT 2024
"""

import sys
import requests
import argparse
import pandas as pd
import re
import xml.etree.ElementTree as ET
from edgar import Company, set_identity

# Set identity for SEC API access
set_identity("calvin_williamson@fitnyc.edu")

def filter_original_10k_filings(filings):
    """Filter to get only original 10-K filings, excluding amendments (10-K/A)"""
    return [filing for filing in filings if filing.form == "10-K"]

def get_company_name_from_csv(ticker):
    """Get company name from american_companies.csv"""
    try:
        df = pd.read_csv('american_companies.csv')
        matching_row = df[df['Ticker'].str.strip().str.upper() == ticker.upper()]
        if not matching_row.empty:
            return matching_row.iloc[0]['Company Name'].strip()
        else:
            return None
    except Exception:
        return None

def find_financial_statements_from_filing_summary(cik, accession_no_dashes, headers):
    """Find income statement and balance sheet files using FilingSummary.xml"""
    try:
        # Download FilingSummary.xml
        filing_summary_url = f"https://www.sec.gov/Archives/edgar/data/{cik}/{accession_no_dashes}/FilingSummary.xml"
        print(f"Downloading FilingSummary.xml: {filing_summary_url}", file=sys.stderr)
        
        response = requests.get(filing_summary_url, headers=headers)
        if response.status_code != 200:
            print(f"❌ Failed to download FilingSummary.xml: HTTP {response.status_code}", file=sys.stderr)
            return None, None
        
        # Parse XML
        root = ET.fromstring(response.text)
        
        income_file = None
        balance_file = None
        
        print("Searching FilingSummary.xml for financial statements:", file=sys.stderr)
        
        # Look through all reports in the filing summary
        for report in root.findall('.//Report'):
            long_name_elem = report.find('LongName')
            short_name_elem = report.find('ShortName')
            html_file_elem = report.find('HtmlFileName')
            
            if long_name_elem is not None and html_file_elem is not None:
                long_name = long_name_elem.text.lower()
                short_name = short_name_elem.text.lower() if short_name_elem is not None else ""
                html_file = html_file_elem.text
                
                print(f"  Found: {long_name} → {html_file}", file=sys.stderr)
                
                # Look for income statement patterns
                income_patterns = [
                    'income', 'operations', 'earnings', 'comprehensive income',
                    'statement of income', 'statement of operations', 
                    'statement of earnings', 'consolidated statements of operations',
                    'consolidated statements of income', 'consolidated statements of comprehensive income'
                ]
                
                if any(pattern in long_name for pattern in income_patterns):
                    if income_file is None:  # Take first match
                        income_file = html_file
                        print(f"    ✅ Selected as Income Statement: {html_file}", file=sys.stderr)
                
                # Look for balance sheet patterns
                balance_patterns = [
                    'balance sheet', 'financial position', 'position',
                    'consolidated balance sheet', 'consolidated statements of financial position',
                    'consolidated balance sheets'
                ]
                
                if any(pattern in long_name for pattern in balance_patterns):
                    if balance_file is None:  # Take first match
                        balance_file = html_file
                        print(f"    ✅ Selected as Balance Sheet: {html_file}", file=sys.stderr)
        
        print(f"FilingSummary.xml results: Income={income_file}, Balance={balance_file}", file=sys.stderr)
        return income_file, balance_file
        
    except Exception as e:
        print(f"❌ Error parsing FilingSummary.xml: {e}", file=sys.stderr)
        return None, None

def extract_table_content(html_content):
    """Extract just the table content from SGML wrapper"""
    # Remove SGML wrapper tags and content
    # Look for content between <HTML> and </HTML> tags
    html_match = re.search(r'<HTML[^>]*>(.*?)</HTML>', html_content, re.DOTALL | re.IGNORECASE)
    
    if html_match:
        return html_match.group(1)
    else:
        # If no HTML wrapper found, use the content as is
        return html_content

def create_tabbed_html(company_name, fiscal_year, income_content, balance_content):
    """Create HTML with tabbed interface for financial statements"""
    html_template = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{company_name} - {fiscal_year} Financial Statements</title>
    <style>
        body {{ 
            font-family: Helvetica, Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background-color: white; 
        }}

        .banner {{ 
            background-color: #acf; 
            color: black; 
            padding: 15px; 
            text-align: center; 
            margin-bottom: 20px; 
            border: 2px solid #acf; 
        }}

        .banner h1 {{ 
            margin: 0; 
            font-size: 14pt; 
            font-weight: bold; 
        }}

        .banner h2 {{ 
            margin: 5px 0 0 0; 
            font-size: 12pt; 
        }}

        .tabs {{ 
            display: flex; 
            margin-bottom: 0; 
            border-bottom: 2px solid #acf; 
        }}

        .tab {{ 
            padding: 8px 16px; 
            cursor: pointer; 
            background-color: white; 
            border: 2px solid #acf; 
            border-bottom: none; 
            margin-right: 5px; 
            font-size: 10pt; 
        }}

        .tab:hover {{ 
            background-color: #def; 
        }}

        .tab.active {{ 
            background-color: #acf; 
            border-color: #acf; 
            font-weight: bold; 
        }}

        .tab-content {{ 
            display: none; 
            padding: 20px 0; 
        }}

        .tab-content.active {{ 
            display: block; 
        }}
    </style>
</head>
<body>
    <div class="banner">
        <h1>{company_name} - Fiscal Year {fiscal_year}</h1>
    </div>
    
    <div class="tabs">
        <span class="tab active" onclick="openTab(event, 'income-statement')">Income Statement</span>
        <span class="tab" onclick="openTab(event, 'balance-sheet')">Balance Sheet</span>
    </div>
    
    <div id="income-statement" class="tab-content active">
        {income_content}
    </div>
    
    <div id="balance-sheet" class="tab-content">
        {balance_content}
    </div>

    <script>
        function openTab(evt, tabName) {{
            var i, tabcontent, tabs;
            
            // Hide all tab contents
            tabcontent = document.getElementsByClassName("tab-content");
            for (i = 0; i < tabcontent.length; i++) {{
                tabcontent[i].classList.remove("active");
            }}
            
            // Remove active class from all tabs
            tabs = document.getElementsByClassName("tab");
            for (i = 0; i < tabs.length; i++) {{
                tabs[i].classList.remove("active");
            }}
            
            // Show the selected tab content and mark tab as active
            document.getElementById(tabName).classList.add("active");
            evt.currentTarget.classList.add("active");
        }}
    </script>
</body>
</html>"""
    
    return html_template

def download_financial_statements(ticker, target_year=2024):
    """Download both income statement (R3.htm) and balance sheet (R5.htm) for a specific ticker and year"""
    try:
        company = Company(ticker)
        cik = company.cik
        
        # Get company name from CSV, fallback to SEC name
        csv_company_name = get_company_name_from_csv(ticker)
        company_name = csv_company_name if csv_company_name else company.name
        
        # Get original 10-K filings only (no amendments)
        all_filings = company.get_filings(form="10-K").head(30)
        original_filings = filter_original_10k_filings(all_filings)
        
        # Find filing for target year
        target_filing = None
        for filing in original_filings:
            filing_year = filing.filing_date.year
            
            # Most companies file in Q1 of following year or late in same year
            if (filing_year == target_year + 1 and filing.filing_date.month <= 6) or \
               (filing_year == target_year and filing.filing_date.month >= 10) or \
               (filing_year == target_year):
                target_filing = filing
                break
        
        if not target_filing:
            print(f"❌ No valid 10-K filing found for {ticker} {target_year}", file=sys.stderr)
            return None
        
        # Get accession number and remove dashes
        accession_number = target_filing.accession_number
        accession_no_dashes = accession_number.replace('-', '')
        
        # Print info to stderr so it doesn't interfere with HTML output
        print(f"Company: {company_name} ({ticker})", file=sys.stderr)
        print(f"CIK: {cik}", file=sys.stderr)
        print(f"Filing Date: {target_filing.filing_date.strftime('%Y-%m-%d')}", file=sys.stderr)
        print(f"Accession Number: {accession_number}", file=sys.stderr)
        print(f"Accession (no dashes): {accession_no_dashes}", file=sys.stderr)
        
        # Download headers
        headers = {
            'User-Agent': 'calvin_williamson@fitnyc.edu'
        }
        
        # Try to find financial statements using FilingSummary.xml (most reliable method)
        income_file, balance_file = find_financial_statements_from_filing_summary(cik, accession_no_dashes, headers)
        
        income_content = None
        balance_content = None
        
        # Download files found in FilingSummary.xml
        if income_file:
            income_url = f"https://www.sec.gov/Archives/edgar/data/{cik}/{accession_no_dashes}/{income_file}"
            print(f"Downloading income statement: {income_url}", file=sys.stderr)
            income_response = requests.get(income_url, headers=headers)
            if income_response.status_code == 200:
                income_content = extract_table_content(income_response.text)
                print(f"✅ Downloaded income statement from {income_file}", file=sys.stderr)
            else:
                print(f"❌ Failed to download {income_file}: HTTP {income_response.status_code}", file=sys.stderr)
        
        if balance_file:
            balance_url = f"https://www.sec.gov/Archives/edgar/data/{cik}/{accession_no_dashes}/{balance_file}"
            print(f"Downloading balance sheet: {balance_url}", file=sys.stderr)
            balance_response = requests.get(balance_url, headers=headers)
            if balance_response.status_code == 200:
                balance_content = extract_table_content(balance_response.text)
                print(f"✅ Downloaded balance sheet from {balance_file}", file=sys.stderr)
            else:
                print(f"❌ Failed to download {balance_file}: HTTP {balance_response.status_code}", file=sys.stderr)
        
        # Fallback to R3/R5 if FilingSummary.xml approach didn't work
        if income_content is None:
            print(f"Falling back to R3.htm for income statement", file=sys.stderr)
            income_url = f"https://www.sec.gov/Archives/edgar/data/{cik}/{accession_no_dashes}/R3.htm"
            income_response = requests.get(income_url, headers=headers)
            if income_response.status_code == 200:
                income_content = extract_table_content(income_response.text)
                print(f"✅ Downloaded R3.htm fallback", file=sys.stderr)
            else:
                print(f"❌ R3.htm fallback failed: HTTP {income_response.status_code}", file=sys.stderr)
                return None
        
        if balance_content is None:
            print(f"Falling back to R5.htm for balance sheet", file=sys.stderr)
            balance_url = f"https://www.sec.gov/Archives/edgar/data/{cik}/{accession_no_dashes}/R5.htm"
            balance_response = requests.get(balance_url, headers=headers)
            if balance_response.status_code == 200:
                balance_content = extract_table_content(balance_response.text)
                print(f"✅ Downloaded R5.htm fallback", file=sys.stderr)
            else:
                print(f"❌ R5.htm fallback failed: HTTP {balance_response.status_code}", file=sys.stderr)
                return None
        
        # Create tabbed HTML
        tabbed_html = create_tabbed_html(company_name, target_year, income_content, balance_content)
        
        # Create filename in format TICKER-YEAR-financials.html
        filename = f"{ticker}-{target_year}-financials.html"
        
        # Save tabbed HTML to file
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(tabbed_html)
        
        print(f"✅ Saved to: {filename}", file=sys.stderr)
        print(f"Title: {company_name} - Fiscal Year {target_year}", file=sys.stderr)
        return tabbed_html
        
    except Exception as e:
        print(f"❌ Error processing {ticker}: {str(e)}", file=sys.stderr)
        return None

def main():
    parser = argparse.ArgumentParser(description='Download financial statements from SEC EDGAR')
    parser.add_argument('ticker', help='Stock ticker symbol (e.g., WMT)')
    parser.add_argument('year', type=int, help='Target fiscal year (e.g., 2024)')
    
    args = parser.parse_args()
    
    download_financial_statements(args.ticker.upper(), args.year)

if __name__ == "__main__":
    main()