import csv
import json
from download_filings_list import download_filings_list

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

def create_filings_json():
    filings_data = {}

    begin = 2022
    end = 2024
    print("Getting years ", begin, " to ", end) 
    
    with open('CIK.csv', 'r') as csvfile:
        csv_reader = csv.DictReader(csvfile)
        for row in csv_reader:
            company_name = row['company_name']
            cik = row['cik']

            print("Creating filings list for ", company_name)
            filings_list = download_filings_list(cik, begin, end)
            
            filings_data[company_name] = {
                "cik": cik,
                "segment": row['segment'],
                "subsegment": row['subsegment'],
                "filings": filings_list 
            }

    print("Writing json file: filings/filings.json")
    with open('filings/filings.json', 'w') as jsonfile:
        json.dump(filings_data, jsonfile, indent=2)

if __name__ == "__main__":
    create_filings_json()
