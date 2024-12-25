import json
import os
from download_filing_summary import download_filing_summary
from download_income_and_balance_html import download_income_and_balance_html 
from extract_income_and_balance import parse_gaap_from_files 
from download_filings_list import download_filings_list
from classify_concepts import create_concepts
from lookup_concept_values import lookup_concept_values 
import csv

def all_files_exist(company_name, year):
    required_files = [
        f"html/income-{company_name}-{year}.html",
        f"html/balance-{company_name}-{year}.html",
        f"facts/income-{company_name}-{year}.json",
        f"facts/balance-{company_name}-{year}.json",
        f"concepts/concepts-{company_name}-{year}.json"
    ]
    return all(os.path.exists(file) for file in required_files)

def html_files_exist(company_name, year):
    required_files = [
        f"html/income-{company_name}-{year}.html",
        f"html/balance-{company_name}-{year}.html"
    ]
    return all(os.path.exists(file) for file in required_files)

def fact_files_exist(company_name, year):
    required_files = [
        f"facts/income-{company_name}-{year}.json",
        f"facts/balance-{company_name}-{year}.json",
    ]
    return all(os.path.exists(file) for file in required_files)

def concept_files_exist(company_name, year):
    required_files = [
        f"concepts/concepts-{company_name}-{year}.json"
    ]
    return all(os.path.exists(file) for file in required_files)

# company name with iterate through companies, 
# company data will be the data for that company 

def download_all():
    with open('filings/filings.json', 'r') as f:
        filings = json.load(f)
    
    for company_name, company_data in filings.items():

        cik = company_data['cik']
        name = company_data['name']

        print("company_name: ", company_name," cik: ",cik)
        print("----------------------------------------------")

        for filing in company_data['filings']:

            filing_date = filing['filingDate']
            # getting just the year from the filing date
            year = filing_date[:4]
            accession_number = filing['accessionNumber'] 

            if all_files_exist(company_name, year):
                print(f"Skipping {company_name} {year} - files already exist")
                continue

            print("year:", year)
            print("accession_number:", accession_number)

            if html_files_exist(company_name, year) == False:
                print("Downloading FileSummary.xml for: ", company_name," ", year)
                download_filing_summary(company_name, cik, year, accession_number)

                print("Downloading income and balance html files")
                download_income_and_balance_html(company_name, cik, year, accession_number)
            else:
                print(f"html/income-{company_name}-{year}.html", " already exists")
                print(f"html/balance-{company_name}-{year}.html", " already exists")

            if fact_files_exist(company_name, year) == False:
                income_json = f"facts/income-{company_name}-{year}.json"
                print("Extracting Facts: ", income_json)
                parse_gaap_from_files("income.html", income_json) 

                balance_json = f"facts/balance-{company_name}-{year}.json"
                print("Extracting Facts: ", balance_json)
                parse_gaap_from_files("balance.html", balance_json) 
            else:
                print(f"facts/income-{company_name}-{year}.json", " already exists")
                print(f"facts/balance-{company_name}-{year}.json", " already exists")

            if concept_files_exist(company_name, year) == False:
                print("Mapping Concepts: ")
                create_concepts(company_name, year)
                lookup_concept_values(company_name, int(year))
            else:
                print(f"concepts/concepts-{company_name}-{year}.json", " already exist")


if __name__ == "__main__":
    download_all()
