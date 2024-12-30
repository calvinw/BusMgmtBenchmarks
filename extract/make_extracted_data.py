import os
import json
import csv
from collections import defaultdict

def extract_financial_data():
    concepts_dir = 'concepts'
    output_file = 'extracted_financial_data.csv'
    columns = [
        "company_name", "year", "Net Revenue", "Cost of Goods", "SG&A", 
        "Operating Profit", "Net Profit", "Inventory", "Current Assets", 
        "Total Assets", "Current Liabilities", "Total Shareholder Equity", 
        "Total Liabilities and Shareholder Equity"
    ]

    # Dictionary to store data by company
    company_data = defaultdict(list)

    # First collect all data grouped by company
    for filename in os.listdir(concepts_dir):
        if filename.endswith('.json'):
            company_name, year = filename.replace('concepts-', '').replace('.json', '').rsplit('-', 1)
            file_path = os.path.join(concepts_dir, filename)

            with open(file_path, 'r') as jsonfile:
                data = json.load(jsonfile)
                row = {"company_name": company_name, "year": year}

                for item in data:
                    concept = item.get("concept")
                    value = item.get("value")
                    if concept in columns:
                        row[concept] = value

                company_data[company_name].append(row)

    # Sort companies alphabetically
    sorted_companies = sorted(company_data.keys())

    with open(output_file, mode='w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=columns)
        writer.writeheader()

        # Write data for each company (sorted by year)
        for company in sorted_companies:
            # Sort company data by year
            sorted_rows = sorted(company_data[company], key=lambda x: x['year'])
            for row in sorted_rows:
                writer.writerow(row)

if __name__ == "__main__":
    extract_financial_data()
