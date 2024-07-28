import xml.etree.ElementTree as ET
import requests
import json
import os
from pprint import pprint
from datetime import datetime

def is_valid_context(context, filing_year):
    # Check for non-null segment
    entity = context.find('.//{http://www.xbrl.org/2003/instance}entity')
    if entity is not None:
        segment = entity.find('.//{http://www.xbrl.org/2003/instance}segment')
        if segment is not None and len(segment) > 0:
            return False  # Exclude contexts with non-null segments

    period = context.find('.//{http://www.xbrl.org/2003/instance}period')

    if period is not None:
        start_date = period.find('.//{http://www.xbrl.org/2003/instance}startDate')
        end_date = period.find('.//{http://www.xbrl.org/2003/instance}endDate')
        instant = period.find('.//{http://www.xbrl.org/2003/instance}instant')

        if start_date is not None and end_date is not None:
            start_date = datetime.strptime(start_date.text, "%Y-%m-%d")
            end_date = datetime.strptime(end_date.text, "%Y-%m-%d")

            # Check if the period spans approximately a year (allow for leap years)
            days_difference = (end_date - start_date).days
            if not (360 <= days_difference <= 370):
                return False

            # Check if the context covers the most recent full year
            is_right_year = (start_date.year == filing_year - 1) and (end_date.year == filing_year)

            return is_right_year
        elif instant is not None:
            instant_year = int(instant.text.split('-')[0])

            # Check if the instant is in the filing year
            return instant_year == filing_year

    return False

def extract_value(fact, root, filing_year):
    if fact is not None:
        context_ref = fact.get('contextRef')
        if context_ref:
            context = root.find(f".//*[@id='{context_ref}']")
            if context is not None and is_valid_context(context, filing_year):
                return fact.text
    return None

def parse_xbrl(file_path, concept_mappings, filing_year):
    # Parse the XBRL file
    tree = ET.parse(file_path)
    root = tree.getroot()

    # Extract the namespaces
    namespaces = dict([node for _, node in ET.iterparse(file_path, events=['start-ns'])])

    # Dictionary to store the results
    results = {}

    # Iterate through the concept mappings
    for field, concepts in concept_mappings.items():
        # Ensure concepts is a list
        if isinstance(concepts, str):
            concepts = [concepts]

        for concept in concepts:
            # Search for the concept in different namespaces
            for prefix, uri in namespaces.items():
                xpath = f".//{{{uri}}}{concept}"
                facts = root.findall(xpath)
                for fact in facts:
                    val = extract_value(fact, root, filing_year)
                    if val is not None:
                        try:
                            results[field] = round(float(val)/1000000, 2)  # Convert to millions and round to 2 decimal places
                            break
                        except ValueError:
                            print(f"Warning: Could not convert value '{val}' to float for field '{field}'")
                            results[field] = val  # Store the original value if conversion fails
                if field in results:
                    break
            if field in results:
                break
        if field not in results:
            results[field] = None

    return results

def download_xbrl(url, file_path):
    headers = {
        "User-Agent": "FIT calvin_williamson@fitnyc.edu"
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        with open(file_path, 'wb') as f:
            f.write(response.content)
        return True
    except requests.RequestException as e:
        print(f"Error downloading file from {url}: {e}")
        return False
def parse_10ks():
    # Load the 10ks.json file
    try:
        with open('10ks.json', 'r') as f:
            companies_data = json.load(f)
    except FileNotFoundError:
        print("Error: 10ks.json file not found.")
        return
    except json.JSONDecodeError:
        print("Error: Invalid JSON in 10ks.json file.")
        return

    # Load the generic concept mappings
    try:
        with open("concept_mappings.json", 'r') as f:
            concept_mappings = json.load(f)
    except FileNotFoundError:
        print(f"Mapping file concept_mapping.json not found")
        return None
    except json.JSONDecodeError:
        print(f"Error decoding JSON from mapping file: concept_mappings.json")
        return None

    # Dictionary to store all extracted data
    all_data = {}

    # Process each company
    for company_name, years_data in companies_data.items():
        print(f"Processing company: {company_name}")
        company_data = {}
        for year, filings in years_data.items():
            print(f"  Processing year: {year}")
            for filing in filings:
                xbrl_url = filing['xbrlUrl']
                filing_year = int(filing['filingDate'][:4])

                # Download the XBRL file
                file_path = f"temp_{company_name}_{year}.xml"
                if download_xbrl(xbrl_url, file_path):
                    try:
                        # Parse the XBRL file
                        extracted_data = parse_xbrl(file_path, concept_mappings, filing_year)
                        if extracted_data:
                            company_data[year] = extracted_data
                            print(f"    Successfully extracted data for {year}")
                        else:
                            print(f"    No data extracted for {year}")
                    except Exception as e:
                        print(f"    Error parsing XBRL file for {company_name} ({year}): {e}")
                    finally:
                        # Remove the temporary file
                        os.remove(file_path)
                else:
                    print(f"    Failed to download XBRL file for {company_name} ({year})")

        if company_data:
            all_data[company_name] = company_data
        print(f"Finished processing {company_name}")
        print("-------------------------")

    # Write all data to data.json
    with open('financial_data.json', 'w') as f:
        json.dump(all_data, f, indent=4)

    print("All data has been written to data.json")


# Example usage
if __name__ == "__main__":
    parse_10ks()
