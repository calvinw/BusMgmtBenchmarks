import csv
import json
import xml.etree.ElementTree as ET
import requests
import os
import sys
from datetime import datetime

def is_valid_context(context, report_date):
    entity = context.find('.//{http://www.xbrl.org/2003/instance}entity')
    if entity is not None:
        segment = entity.find('.//{http://www.xbrl.org/2003/instance}segment')
        if segment is not None and len(segment) > 0:
            return False

    period = context.find('.//{http://www.xbrl.org/2003/instance}period')

    if period is not None:
        start_date = period.find('.//{http://www.xbrl.org/2003/instance}startDate')
        end_date = period.find('.//{http://www.xbrl.org/2003/instance}endDate')
        instant = period.find('.//{http://www.xbrl.org/2003/instance}instant')

        report_date = datetime.strptime(report_date, "%Y-%m-%d")

        if start_date is not None and end_date is not None:
            start_date = datetime.strptime(start_date.text, "%Y-%m-%d")
            end_date = datetime.strptime(end_date.text, "%Y-%m-%d")

            days_difference = (end_date - start_date).days
            is_annual_period = 360 <= days_difference <= 370

            is_matching_end_date = end_date == report_date

            return is_annual_period and is_matching_end_date

        elif instant is not None:
            instant_date = datetime.strptime(instant.text, "%Y-%m-%d")

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
    tree = ET.parse(file_path)
    root = tree.getroot()

    namespaces = dict([node for _, node in ET.iterparse(file_path, events=['start-ns'])])

    results = {}

    for field, concepts in concept_mappings.items():
        if isinstance(concepts, str):
            concepts = [concepts]

        for concept in concepts:
            for prefix, uri in namespaces.items():
                xpath = f".//{{{uri}}}{concept}"
                facts = root.findall(xpath)
                for fact in facts:
                    val = extract_value(fact, root, report_date)
                    if val is not None:
                        try:
                            results[field] = round(float(val)/1000000, 2)
                            break
                        except ValueError:
                            print(f"Warning: Could not convert value '{val}' to float for field '{field}'")
                            results[field] = val
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
    # Load the concept mappings
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

    # Read the input CSV file
    with open(input_file, 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            company_name = row['company_name']
            year = row['year']
            xbrl_url = row['xbrlUrl']
            report_date = row['reportDate']

            print(f"Processing {company_name} for year {year}")

            if company_name not in all_data:
                all_data[company_name] = {}

            # Download the XBRL file
            file_path = f"temp_{company_name}_{year}.xml"
            if download_xbrl(xbrl_url, file_path):
                try:
                    # Parse the XBRL file
                    extracted_data = parse_xbrl(file_path, concept_mappings, report_date)
                    if extracted_data:
                        all_data[company_name][year] = extracted_data
                        print(f"  Successfully extracted data for {year}")
                    else:
                        print(f"  No data extracted for {year}")
                except Exception as e:
                    print(f"  Error parsing XBRL file for {company_name} ({year}): {e}")
                finally:
                    # Remove the temporary file
                    os.remove(file_path)
            else:
                print(f"  Failed to download XBRL file for {company_name} ({year})")

    # Write all data to the output CSV file
    with open(output_file, 'w', newline='') as csvfile:
        fieldnames = ['company_name', 'year'] + list(concept_mappings.keys())
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()
        for company_name, years_data in all_data.items():
            for year, data in years_data.items():
                row = {'company_name': company_name, 'year': year}
                row.update(data)
                writer.writerow(row)

    print(f"All data has been written to {output_file}")

# Main execution
if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script_name.py <input_10ks_file.csv> <output_extracted_data_file.csv>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    parse_10ks(input_file, output_file)
