import argparse
import json
import requests
import os
from typing import List
from datetime import datetime
import re
import requests

def retrieve_file(url):
    print(f"Fetching ")
    headers = {
        "User-Agent": "FIT calvin_williamson@fitnyc.edu"
    }
    response = requests.get(url, headers=headers)
    return response.text

def find_xrbl_files(submission_url):

    content = retrieve_file(submission_url)

    # Excluded suffixes
    excluded_suffixes = ['_def.xml', '_pre.xml', '_lab.xml', '_cal.xml']
    
    # Pattern to match <FILENAME>*.xml
    pattern = r'<FILENAME>(.*?\.xml)'
    
    matching_files = []
    
    try:
        # Find all matches
        matches = re.findall(pattern, content)
        
        for match in matches:
            # Skip FileSummary.xml
            if match == 'FilingSummary.xml':
                continue
                
            # Check if the file ends with any excluded suffix
            if not any(match.lower().endswith(suffix.lower()) for suffix in excluded_suffixes):
                matching_files.append(match)
    
    except FileNotFoundError:
        print(f"Error: File '{input_file}' not found")
    except Exception as e:
        print(f"Error reading file: {str(e)}")

    
    return matching_files

def make_complete_submission_url(cik, accession_number):
    print("accession_number:", accession_number)
    accession_without_dashes = accession_number.replace("-","") 
    base_url = f"https://www.sec.gov/Archives/edgar/data/{cik}/{accession_without_dashes}"
    filing_url = f"{base_url}/{accession_number}.txt"

    return filing_url 

def download_filings_list(submissions, first_year: str = "2024", last_year: str = None) -> List[str]:
    if last_year is None:
        last_year = first_year
    if int(first_year) < 2014:
        print("Warning: The minimum first year is 2014. Setting first_year to 2014.")
        first_year = "2014"
    filings_info = []

    cik = submissions["cik"]

    # Process filings
    def process_filings(cik, filings_data):
        for i in range(len(filings_data["accessionNumber"])):
            form = filings_data["form"][i]
            if form == "10-K":
                filing_date = filings_data["filingDate"][i]
                filing_date_year = int(filing_date[:4])
                if int(first_year) <= filing_date_year <= int(last_year):
                    report_date = filings_data["reportDate"][i]
                    primary_document = filings_data["primaryDocument"][i] 
                    accession_number = filings_data["accessionNumber"][i]
                    complete_submission_url = make_complete_submission_url(cik, accession_number)  
                    print("text submission file")
                    print(complete_submission_url)

                    accession_without_dashes = accession_number.replace("-","") 
                    matches = find_xrbl_files(complete_submission_url)
                    base_url = f"https://www.sec.gov/Archives/edgar/data"
                    xbrl_url = f"{base_url}/{cik}/{accession_without_dashes}/{matches[0]}"

                    filings_info.append({
                        "reportDate": report_date,
                        "filingDate": filing_date,
                        "form": form,
                        "primaryDocument": primary_document,
                        "accessionNumber": accession_number,
                        "completeSubmissionUrl": complete_submission_url,
                        "xbrlFile": xbrl_url
                    })

    if "filings" in submissions and "recent" in submissions["filings"]:
        recent_filings = submissions["filings"]["recent"]
        process_filings(cik, recent_filings)

    # Process older filings from additional files
    if "filings" in submissions and "files" in submissions["filings"]:
        for file_info in submissions["filings"]["files"]:
            base_url = "https://data.sec.gov/submissions/"
            file_url = f"{base_url}{file_info['name']}"
            headers = {
                'User-Agent': 'Calvin Williamson (calvin_williamson@fitnyc.edu)',
            }
            try:
                response = requests.get(file_url, headers=headers)
                response.raise_for_status()
                file_submissions = response.json()
                if "accessionNumber" in file_submissions:
                    process_filings(cik, file_submissions)
            except requests.exceptions.RequestException as e:
                print(f"Error fetching additional submissions file {file_info['name']} for CIK {cik}: {e}")

    return filings_info
