import json
import os
import sys
from pprint import pprint

from download_filing_summary import download_filing_summary
from download_income_and_balance_html import download_income_and_balance_html
from extract_income_and_balance import parse_from_files
from map_html import classify_income_facts
from map_html import classify_balance_facts

def all_files_exist(company_name, year):
    required_files = [
        f"html/income-{company_name}-{year}.html",
        f"html/balance-{company_name}-{year}.html"
    ]
    return all(os.path.exists(file) for file in required_files)

def process_filing(company_name, 
                   cik, 
                   year, 
                   accession_number):

    income_json = f"facts/income-{company_name}-{year}.json"
    balance_json = f"facts/balance-{company_name}-{year}.json"
    if all_files_exist(company_name, year) == False:
        print("Downloading FileSummary.xml for: ", company_name, " ", year)
        download_filing_summary(company_name, cik, year, accession_number)

        print("Downloading income and balance html files")
        download_income_and_balance_html(company_name, cik, year, accession_number)

        # print("Extracting Income Facts: ", income_json)
        # parse_from_files("income.html", income_json)
        #
        # print("Extracting Balance Facts: ", balance_json)
        # parse_from_files("balance.html", balance_json)
    else:
        print("Skipping html and fact files, since exist already")

    income_html_file=f"html/income-{company_name}-{year}.html"
    income_concepts = classify_income_facts(income_html_file)
    balance_html_file=f"html/balance-{company_name}-{year}.html"
    balance_concepts = classify_balance_facts(balance_html_file)
    concepts = income_concepts + balance_concepts

    concepts_json = f"concepts/concepts-{company_name}-{year}.json"
    print("Writing concepts to:", concepts_json)
    print(json.dumps(concepts, indent=2))
    with open(concepts_json, 'w', encoding='utf-8') as f:
        json.dump(concepts, f, indent=2, ensure_ascii=False)
