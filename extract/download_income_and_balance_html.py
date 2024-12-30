import csv
import sys
import requests
from openai import OpenAI
import os
import re
import pandas as pd
from dotenv import load_dotenv
import xml.etree.ElementTree as ET
from typing import List, Tuple
from typing import List, Optional
from pathlib import Path
import json
import argparse
from typing import Union
import copy

g_filing_summary = "FilingSummary.xml"
g_income_statement = "income.html"
g_balance_statement = "balance.html"

def extract_html_content(text):
    import re
    
    # Pattern to match everything between and including <html> and </html> tags
    pattern = r'(<html>.*?</html>)'
    # re.DOTALL flag makes . match newlines as well
    match = re.search(pattern, text, re.DOTALL)
    
    if match:
        return match.group(1)
    return ""

# Utility function to read XML file
def read_xml_file(filename: str) -> str:
    """Read XML file from disk"""
    with open(filename, 'r', encoding='utf-8') as file:
        return file.read()

# Utility function to write XML file
def write_xml_file(filename: str, content: str) -> None:
    """Write XML content to disk"""
    with open(filename, 'w', encoding='utf-8') as file:
        file.write(content)


load_dotenv()

def find_statement_reports(filing_summary_xml):

    # Construct the prompt
    prompt = f"""You are a financial document expert. Below is Filing Summary XML file containing the names of the different reports in a financial 10-K. You are to identify the name of the file that contains the report that corresponds to the standard income statement and also the name of the file that corresponds to the main balance sheet. 

The XML file is contained in <FilingSummary> tags: 

<FilingSummary>
{filing_summary_xml}
</FilingSummary>

By looking at the LongName of each Report, identify the HtmlFileName that represents the typical income statement and the typical balance sheet as well.

Provide only the filename from inside the HtmlFileName tags for each. 

Return just the names of the files on two lines like this:
<income section name>.htm
<balance section name>.htm
"""

    try:
        client = OpenAI(
          base_url="https://openrouter.ai/api/v1",
          api_key=os.getenv("OPENROUTER_API_KEY"),
        )
        # client = OpenAI(
        #     api_key=os.getenv("GOOGLE_API_KEY"),
        #     base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        # )
        # client = OpenAI(
        #   base_url="https://api.deepseek.com",
        #   api_key="sk-dedd43a0f726463c9c0b27bbb1b47516",
        # )


        response = client.chat.completions.create(
            #model="openai/gpt-4o-mini",
            # model= "gemini-2.0-flash-exp",
            #model= "google/gemini-flash-1.5-8b",
            model = "deepseek/deepseek-chat",
            # model = "deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a financial document expert assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.0  # Using 0 temperature for more consistent responses
        )

        # Extract the response text
        response_text = response.choices[0].message.content

        result = [] 
        for line in response_text.split('\n'):
            result.append(line.strip())
        return result 
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")

    return  response_text


def download(url, name):
    headers = {
        "User-Agent": "FIT calvin_williamson@fitnyc.edu"
    }

    try:
        response = requests.get(url, headers=headers, stream=True)
        response.raise_for_status()

        with open(name, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        print("Downloaded ", name)
    except requests.exceptions.RequestException as e:
        print(f"Error downloading file: {e}")

def download_and_extract(filename, base_url, report_name):
    statement_url = f"{base_url}/{report_name}" 
    print(statement_url)
    download(statement_url, filename)
    xml = read_xml_file(filename)
    html = extract_html_content(xml)
    write_xml_file(filename, html)

def download_income_and_balance_html(company_name, cik, year, accession_number):
    accession_number_without_dashes = accession_number.replace("-","");
    base_url = f"https://www.sec.gov/Archives/edgar/data/{cik}/{accession_number_without_dashes}"

    xml_string = read_xml_file(g_filing_summary)
    result = find_statement_reports(xml_string)
    print(result)

    download_and_extract(g_income_statement, 
                         base_url,
                         result[0])
    download_and_extract(g_balance_statement, 
                         base_url,
                         result[1])
    
    import shutil
    
    income_file_name = f"html/income-{company_name}-{year}.html"
    balance_file_name = f"html/balance-{company_name}-{year}.html"
   
    shutil.copyfile(g_income_statement, income_file_name)
    shutil.copyfile(g_balance_statement, balance_file_name)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python download_income_and_balance_html.py <cik> <year>")
        sys.exit(1)
    cik = sys.argv[1]
    year = sys.argv[2]
    download_income_and_balance_html(cik, year)
