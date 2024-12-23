import json
from download_filing_summary import download_filing_summary
from download_income_and_balance_html import download_income_and_balance_html 
from extract_income_and_balance import extract_statement_json
from create_filings_json import get_company_name
from download_filings_list import download_filings_list
import csv

filings = {}

year = 2024
print("Getting year ", year) 

with open('CIK.csv', 'r') as csvfile:
    csv_reader = csv.DictReader(csvfile)
    for row in csv_reader:
        company_name = row['company_name']
        cik = row['cik']

        print("Creating new filings list for ", company_name)
        filings_list = download_filings_list(cik, year, year)
        
        filings[company_name] = {
            "cik": cik,
            "segment": row['segment'],
            "subsegment": row['subsegment'],
            "filings": filings_list 
        }

print("Writing json file: filings/filings.json")
with open('filings/filings.json', 'w') as jsonfile:
    json.dump(filings, jsonfile, indent=2)

# company name with iterate through companies, 
# company data will be the data for that company 

# iterates over the company names
for company_name, company_data in filings.items():
    print("company_name:", company_name)
    cik = company_data['cik']
    print("cik:", cik)
    print(company_name," ",cik, "----------------------------------------------")

    for filing in company_data['filings']:
        filing_date = filing['filingDate']
        # getting just the year from the filing date
        year = filing_date[:4]
        accession_number = filing['accessionNumber'] 
        print("year:", year)
        print("accession_number:", accession_number)

        print("Downloading FileSummary.xml for: ", company_name," ", year)
        download_filing_summary(company_name, cik, year, accession_number)

        print("Downloading income and balance html files")
        download_income_and_balance_html(company_name, cik, year, accession_number)

        income_json = f"facts/income-{company_name}-{year}.json"
        print("Extracting Facts: ", income_json)
        extract_statement_json("income.html", income_json) 

        balance_json = f"facts/balance-{company_name}-{year}.json"
        print("Extracting Facts: ", balance_json)
        extract_statement_json("balance.html", balance_json) 

