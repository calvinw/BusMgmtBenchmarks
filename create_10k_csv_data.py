import requests
import json
from collections import defaultdict
import os
import sys
import csv

def get_10k_filings(cik, company_name=None):
    cik = cik.zfill(10)
    url = f"https://data.sec.gov/submissions/CIK{cik}.json"
    print(f"Fetching filing info for CIK {cik} from: {url}")
    headers = {
        "User-Agent": "FIT calvin_williamson@fitnyc.edu"
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        data = json.loads(response.text)
        filings = data['filings']['recent']

        # Get the company ticker and use it as the prefix
        if 'tickers' in data and data['tickers']:
            ticker = data['tickers'][0]
            company_prefix = ticker.lower() + '-'
        else:
            # Fallback to using the company name if no ticker is available
            ticker = None
            company_prefix = data['name'].split()[0].lower() + '-'

        if company_name is None:
            company_name = data.get('tickers', [data['name']])[0]  # Use ticker if available, else full name

        filings_by_year = defaultdict(list)

        for i in range(len(filings['accessionNumber'])):
            filing_year = int(filings['filingDate'][i][:4])
            if filings['form'][i] == '10-K' and filing_year >= 2019:
                accession_number = filings['accessionNumber'][i]
                accession_number_no_dashes = accession_number.replace('-', '')
                primary_document = filings['primaryDocument'][i]
                report_date = filings['reportDate'][i]

                sec_index_url = f"https://www.sec.gov/Archives/edgar/data/{cik}/{accession_number_no_dashes}/{accession_number}-index.html"
                interactive_data_url = f"https://www.sec.gov/cgi-bin/viewer?action=view&cik={cik.lstrip('0')}&accession_number={accession_number}&xbrl_type=v"

                # Special case for TPR (CIK 1116132) in 2019
                if cik == '0001116132' and filing_year == 2019:
                    primary_document_base = primary_document.rsplit('.', 1)[0]  # Remove file extension
                    xbrl_url = f"https://www.sec.gov/Archives/edgar/data/{cik.lstrip('0')}/{accession_number_no_dashes}/{primary_document_base}_htm.xml"
                # Adjust XBRL URL based on filing year
                elif filing_year >= 2020:
                    primary_document_base = primary_document.rsplit('.', 1)[0]  # Remove file extension
                    xbrl_url = f"https://www.sec.gov/Archives/edgar/data/{cik.lstrip('0')}/{accession_number_no_dashes}/{primary_document_base}_htm.xml"
                else:
                    # Format for 2019 and earlier (except for TPR in 2019)
                    report_date_no_dashes = report_date.replace('-', '')
                    xbrl_url = f"https://www.sec.gov/Archives/edgar/data/{cik.lstrip('0')}/{accession_number_no_dashes}/{company_prefix}{report_date_no_dashes}.xml"

                filing_info = {
                    'cik': data['cik'],
                    'name': data['name'],
                    'ticker': ticker,
                    'filingDate': filings['filingDate'][i],
                    'reportDate': report_date,
                    'form': filings['form'][i],
                    'accessionNumber': accession_number,
                    'primaryDocument': primary_document,
                    'secIndexUrl': sec_index_url,
                    'interactiveDataUrl': interactive_data_url,
                    'xbrlUrl': xbrl_url
                }
                filings_by_year[str(filing_year)].append(filing_info)

        return {company_name: dict(filings_by_year)}
    else:
        print(f"Error fetching data for CIK {cik}: {response.status_code}")
        return None

def get_multiple_10k_filings(companies_dict):
    all_company_filings = {}
    for company_name, cik in companies_dict.items():
        company_filing = get_10k_filings(cik, company_name)
        if company_filing:
            all_company_filings.update(company_filing)
    return all_company_filings

def create_csv_file(all_company_filings, filename='10ks.csv'):
    with open(filename, 'w', newline='') as csvfile:
        fieldnames = ['company_name', 'year', 'cik', 'name', 'ticker', 'filingDate', 'reportDate', 'form',
                      'accessionNumber', 'primaryDocument', 'secIndexUrl', 'interactiveDataUrl', 'xbrlUrl']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()
        for company_name, company_filings in all_company_filings.items():
            for year, filings in company_filings.items():
                for filing in filings:
                    row = {
                        'company_name': company_name,
                        'year': year,
                        **filing
                    }
                    writer.writerow(row)  # Changed from writeheader() to writerow(row)

    print(f"CSV file '{filename}' has been created.")

def read_cik_csv(filename):
    companies_dict = {}
    with open(filename, 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            companies_dict[row['company_name']] = row['cik']
    return companies_dict

def main():
    # Check if correct number of arguments are provided
    if len(sys.argv) != 3:
        print("Usage: python script_name.py <input_cik_file> <output_csv_file>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    # Read CIK data from input CSV file
    try:
        companies_dict = read_cik_csv(input_file)
    except FileNotFoundError:
        print(f"Error: {input_file} not found. Please ensure the file exists in the current directory.")
        return
    except csv.Error as e:
        print(f"Error reading {input_file}: {e}")
        return

    # Fetch 10-K filings for all companies
    all_company_filings = get_multiple_10k_filings(companies_dict)

    if all_company_filings:
        # Write CSV file
        create_csv_file(all_company_filings, output_file)
    else:
        print("Failed to retrieve filings for all companies.")

if __name__ == "__main__":
    main()
