import json
from utils import get_xbrl_url
from utils import get_report_date
from pprint import pprint
import argparse
import requests
from bs4 import BeautifulSoup

from datetime import datetime, timedelta

def find_basic_contexts(soup, report_date):
    """
    Find the basic balance sheet and income statement contextRefs
    
    Args:
        soup: BeautifulSoup parsed XBRL document
        report_date: The report date in YYYY-MM-DD format
    
    Returns:
        tuple: (balance_sheet_context, income_stmt_context)
    """
    contexts = soup.find_all('context')
    
    balance_sheet_context = None
    income_stmt_context = None
    
    # Convert report_date to datetime for comparison
    report_dt = datetime.strptime(report_date, '%Y-%m-%d')
    
    #print("\nExamining contexts:")
    for context in contexts:
        context_id = context.get('id')
        
        # Skip any context that has segments/dimensions
        if context.find('segment'):
            continue
            
        period = context.find('period')
        instant = period.find('instant')
        start_date = period.find('startDate')
        end_date = period.find('endDate')
        
        if instant:
            instant_date = instant.text.strip()
            #print(f"Instant context {context_id}: {instant_date}")
            if instant_date == report_date:
                balance_sheet_context = context_id
                #print(f"Found balance sheet context: {context_id}")
                
        elif start_date and end_date:  # Using elif since a context can't have both instant and start/end
            start = start_date.text.strip()
            end = end_date.text.strip()
            #print(f"Duration context {context_id}: {start} to {end}")
            
            # Check if this is the main fiscal year context:
            # 1. End date matches report date
            # 2. Start date is approximately a year before (no segment check needed since we filtered above)
            if end == report_date:
                start_dt = datetime.strptime(start, '%Y-%m-%d')
                days_diff = abs((report_dt - start_dt).days)
                # Allow for slight variation in fiscal year length (360-370 days)
                if 360 <= days_diff <= 370:
                    income_stmt_context = context_id
                    #print(f"Found income statement context: {context_id}")
    
    return balance_sheet_context, income_stmt_context

def lookup_attribute_value(soup, attribute_name, context_ref):
    element = soup.find(attribute_name, attrs={'contextRef': context_ref})
    
    if element:
        try:
            return float(element.text)
        except (ValueError, TypeError):
            return None
            
    return None

def lookup_concept_values(company_name, year):

    print("company_name", company_name)
    print("year", year)

    xbrl_url = get_xbrl_url(company_name, year)

    print("The xbrl file we need")
    print(xbrl_url)

    headers = { "User-Agent": "FIT calvin_williamson@fitnyc.edu" }

    try:
        response = requests.get(xbrl_url, headers=headers)
        response.raise_for_status()

        report_date = get_report_date(company_name, year)
        print("report date:", report_date)

        soup = BeautifulSoup(response.content, 'xml')
        bal_context_ref, income_context_ref = find_basic_contexts(soup, report_date)



    except requests.exceptions.RequestException as e:
        print(f"Error downloading or reading xbrl file: {e}")

    concept_file = f"concepts/concepts-{company_name}-{year}.json" 
    print("concepts file", concept_file)

    # Read the JSON file
    with open(concept_file, 'r') as f:
        data = json.load(f)

    for item in data:
        gaap_id = item["gaap_id"].replace("_", ":")
        location = item["location"]
        
        if location == "income":
            context_ref = income_context_ref
        elif location == "balance":
            context_ref = bal_context_ref
        else:
            print(f"Unknown location: {location}")
            continue
            
        print("looking for: ", f"{gaap_id}")
        print("context_ref: ", f"{context_ref}")
        value = lookup_attribute_value(soup, gaap_id, context_ref)
        item["value"] = value/1000
        print(f"{gaap_id}:", value)

    print("The data we will update")
    pprint(data)

    with open(concept_file, 'w') as f:
        json.dump(data, f, indent=2)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Lookup concept values for a company and year.")
    parser.add_argument("company", type=str, help="The name of the company.")
    parser.add_argument("year", type=int, help="The year for which to lookup concept values.")

    args = parser.parse_args()
    lookup_concept_values(args.company, args.year)
