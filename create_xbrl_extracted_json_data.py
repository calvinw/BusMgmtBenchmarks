import xml.etree.ElementTree as ET
import requests
import json
import os
import sys
from pprint import pprint
from datetime import datetime

def is_valid_context(context, report_date):
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

        report_date = datetime.strptime(report_date, "%Y-%m-%d")

        if start_date is not None and end_date is not None:
            start_date = datetime.strptime(start_date.text, "%Y-%m-%d")
            end_date = datetime.strptime(end_date.text, "%Y-%m-%d")

            # Check if the period spans approximately a year (allow for leap years)
            days_difference = (end_date - start_date).days
            is_annual_period = 360 <= days_difference <= 370

            # Check if the end date exactly matches the report date
            is_matching_end_date = end_date == report_date

            return is_annual_period and is_matching_end_date

        elif instant is not None:
            instant_date = datetime.strptime(instant.text, "%Y-%m-%d")

            # Check if the instant date exactly matches the report date
            return instant_date == report_date

    return False

def extract_value(fact, root, report_date):
    if fact is not None:
        context_ref = fact.get('contextRef')
        if context_ref:
            context = root.find(f".//*[@id='{context_ref}']")
            if context is not None and is_valid_context(context, report_date):
                return fact.text
    return None

def parse_xbrl(file_path, concept_mappings, report_date):
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
                    val = extract_value(fact, root, report_date)
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

def parse_10ks(input_file, output_file):
    # Load the input 10ks JSON file
    try:
        with open(input_file, 'r') as f:
            companies_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: {input_file} not found.")
        return
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {input_file}.")
        return

    # Load the generic concept mappings
    try:
        with open("extracted_concept_mappings.json", 'r') as f:
            concept_mappings = json.load(f)
    except FileNotFoundError:
        print("Mapping file extracted_concept_mappings.json not found")
        return
    except json.JSONDecodeError:
        print("Error decoding JSON from mapping file: extracted_concept_mappings.json")
        return

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
                report_date = filing['reportDate']

                # Download the XBRL file
                file_path = f"temp_{company_name}_{year}.xml"
                if download_xbrl(xbrl_url, file_path):
                    try:
                        # Parse the XBRL file
                        extracted_data = parse_xbrl(file_path, concept_mappings, report_date)
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

    # Write all data to the output file
    with open(output_file, 'w') as f:
        json.dump(all_data, f, indent=4)

    print(f"All data has been written to {output_file}")

# Main execution
if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script_name.py <input_10ks_file> <output_extracted_data_file>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    parse_10ks(input_file, output_file)
