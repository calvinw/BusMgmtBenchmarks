import csv
import json
import requests
from download_filings_list import download_filings_list

def get_submissions_data(cik, company_name=None):
    cik = cik.zfill(10)
    url = f"https://data.sec.gov/submissions/CIK{cik}.json"

    print(f"Fetching filing info for CIK {cik} from: {url}")
    headers = {
        "User-Agent": "FIT calvin_williamson@fitnyc.edu"
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        data = json.loads(response.text)

    return data

def create_filings_json():
    filings = {}

    begin = 2019
    end = 2024
    print("Creating Filing info for ", begin, " to ", end) 

    print("Using companies in the CIK.csv file ") 
    with open('CIK.csv', 'r') as csvfile:
        csv_reader = csv.DictReader(csvfile)
        for row in csv_reader:
            company_name = row['company_name']
            cik = row['cik']

            submissions = get_submissions_data(cik)

            name = submissions["name"]

            print("company_name:")
            print(company_name)
            filings_list = download_filings_list(submissions, begin, end)
            
            filings[company_name] = {
                "cik": cik,
                "name": name,
                "segment": row['segment'],
                "subsegment": row['subsegment'],
                "filings": filings_list 
            }

    print("Writing json file: filings/filings.json")
    with open('filings/filings.json', 'w') as jsonfile:
        json.dump(filings, jsonfile, indent=2)

if __name__ == "__main__":
    create_filings_json()
