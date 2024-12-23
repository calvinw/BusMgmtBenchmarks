import json
import csv

def clean_number(value_str):
    """Convert string numbers with commas to float"""
    try:
        # Remove commas and convert to float
        return float(value_str.replace(',', ''))
    except (ValueError, AttributeError):
        return 0.0

def write_financial_data_to_csv(output_file='new_extracted_financial_data.csv'):
    # Define CSV headers
    headers = [
        'company_name', 'year', 'Net Revenue', 'Cost of Goods', 'SG&A',
        'Operating Profit', 'Net Profit', 'Inventory', 'Current Assets',
        'Total Assets', 'Current Liabilities', 'Total Shareholder Equity',
        'Total Liabilities and Shareholder Equity'
    ]
    
    # Create/open CSV file
    with open(output_file, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=headers)
        writer.writeheader()
        
        try:
            # Load the filings data
            with open('extract/filings/filings.json', 'r') as file:
                filings_data = json.load(file)
                
            # Process each company
            for company_name, company_data in filings_data.items():
                # Access the filings list for this company
                filings = company_data.get('filings', [])
                
                # Process each filing
                for filing in filings:
                    year = filing['filingDate'][:4]  # Extract year from filingDate
                    print(f"Processing {company_name} for {year}")
                    
                    # Load concepts file
                    concepts_file = f"extract/concepts/concepts-{company_name}-{year}.json"
                    try:
                        with open(concepts_file, 'r') as file:
                            concepts_data = json.load(file)
                            
                            # Create row dictionary with default values
                            row = {
                                'company_name': company_name,
                                'year': year,
                                'Net Revenue': clean_number(concepts_data.get('Net Revenue', {}).get('value', '0')),
                                'Cost of Goods': clean_number(concepts_data.get('Cost of Goods', {}).get('value', '0')),
                                'SG&A': clean_number(concepts_data.get('SG&A', {}).get('value', '0')),
                                'Operating Profit': clean_number(concepts_data.get('Operating Profit', {}).get('value', '0')),
                                'Net Profit': clean_number(concepts_data.get('Net Profit', {}).get('value', '0')),
                                'Inventory': clean_number(concepts_data.get('Inventory', {}).get('value', '0')),
                                'Current Assets': clean_number(concepts_data.get('Current Assets', {}).get('value', '0')),
                                'Total Assets': clean_number(concepts_data.get('Total Assets', {}).get('value', '0')),
                                'Current Liabilities': clean_number(concepts_data.get('Current Liabilities', {}).get('value', '0')),
                                'Total Shareholder Equity': clean_number(concepts_data.get('Total Shareholder Equity', {}).get('value', '0')),
                                'Total Liabilities and Shareholder Equity': clean_number(concepts_data.get('Total Liabilities and Shareholder Equity', {}).get('value', '0'))
                            }
                            
                            # Write row to CSV
                            writer.writerow(row)
                            
                    except FileNotFoundError:
                        print(f"Warning: Concepts file not found for {company_name} - {year}")
                    except json.JSONDecodeError:
                        print(f"Warning: Invalid JSON in concepts file for {company_name} - {year}")
                        
        except FileNotFoundError:
            print("Error: filings.json file not found")
        except json.JSONDecodeError:
            print("Error: Invalid JSON format in filings.json")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    write_financial_data_to_csv()
