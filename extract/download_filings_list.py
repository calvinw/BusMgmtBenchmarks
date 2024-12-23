import argparse
import json
import requests
import os
from typing import List

def download_filings_list(cik: str, first_year: str = "2024", last_year: str = None) -> List[str]:
    if last_year is None:
        last_year = first_year
    if int(first_year) < 2014:
        print("Warning: The minimum first year is 2014. Setting first_year to 2014.")
        first_year = "2014"
    filings_info = []
    base_url = "https://data.sec.gov/submissions/"

    headers = {
        'User-Agent': 'Calvin Williamson (calvin_williamson@fitnyc.edu)',
    }

    # Fetch the main submissions file
    submissions_url = f"{base_url}CIK{cik.zfill(10)}.json"

    try:
        response = requests.get(submissions_url, headers=headers)
        response.raise_for_status()  # Raise an exception for bad status codes
        submissions = response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching submissions data for CIK {cik}: {e}")
        return filings_info

    # Process filings
    def process_filings(filings_data):
        for i in range(len(filings_data["accessionNumber"])):
            if filings_data["form"][i] == "10-K":
                filing_date = filings_data["filingDate"][i]
                if int(first_year) <= int(filing_date[:4]) <= int(last_year):
                    filings_info.append({
                        "reportDate": filings_data["reportDate"][i],
                        "filingDate": filing_date,
                        "accessionNumber": filings_data["accessionNumber"][i].replace("-", "")
                    })

    if "filings" in submissions and "recent" in submissions["filings"]:
        recent_filings = submissions["filings"]["recent"]
        process_filings(recent_filings)

    # Process older filings from additional files
    if "filings" in submissions and "files" in submissions["filings"]:
        for file_info in submissions["filings"]["files"]:
            file_url = f"{base_url}{file_info['name']}"
            try:
                response = requests.get(file_url, headers=headers)
                response.raise_for_status()
                file_submissions = response.json()
                if "accessionNumber" in file_submissions:
                    process_filings(file_submissions)
            except requests.exceptions.RequestException as e:
                print(f"Error fetching additional submissions file {file_info['name']} for CIK {cik}: {e}")

    return filings_info

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download accession numbers for 10-K filings.")
    parser.add_argument("cik", type=str, help="The Central Index Key (CIK) of the company.")
    parser.add_argument("first_year", type=str, nargs="?", default="2024", help="The first year to filter filings by")
    parser.add_argument("last_year", type=str, nargs="?", help="The last year to filter filings by")

    args = parser.parse_args()
    
    if args.last_year is None:
        args.last_year = args.first_year

    filings_info = download_filings_list(args.cik, args.first_year, args.last_year)
    if filings_info:
        print(json.dumps(filings_info, indent=4))
    else:
        print(f"No 10-K filings found for CIK {args.cik} for year(s) specified")
