import json
from collections import OrderedDict
import sys

def format_value(value, is_percentage=False):
    if is_percentage:
        return f"{value:.1f}%"
    else:
        return f"{value:.1f}"

def calculate_financial_metrics(data):
    net_revenue = float(data['Net Revenue'])
    cogs = float(data['Cost of Goods'])
    gross_margin = net_revenue - cogs
    sga = float(data['SG&A'])
    operating_profit = float(data['Operating Profit'])
    net_profit = float(data['Net Profit'])
    inventory = float(data['Inventory'])
    total_assets = float(data['Total Assets'])
    current_assets = float(data['Current Assets'])
    current_liabilities = float(data['Current Liabilities'])
    total_shareholder_equity = float(data['Total Shareholder Equity'])
    total_liabilities_and_equity = float(data['Total Liabilities and Shareholder Equity'])
    liabilities = total_liabilities_and_equity - total_shareholder_equity

    metrics = {
        'Gross Margin': format_value(gross_margin),
        'Liabilities': format_value(liabilities),
        'Cost of Goods Percentage': format_value((cogs / net_revenue) * 100, True),
        'Gross Margin Percentage': format_value((gross_margin / net_revenue) * 100, True),
        'SG&A Expense Percentage': format_value((sga / net_revenue) * 100, True),
        'Operating Profit Margin Percentage': format_value((operating_profit / net_revenue) * 100, True),
        'Net Profit Margin Percentage': format_value((net_profit / net_revenue) * 100, True),
        'Inventory Turnover': format_value(cogs / inventory),
        'Asset Turnover': format_value(net_revenue / total_assets),
        'Return on Assets Percentage': format_value(((net_profit / net_revenue) * (net_revenue / total_assets)) * 100, True),
        'Current Ratio': format_value(current_assets / current_liabilities),
        'Quick Ratio': format_value((current_assets - inventory) / current_liabilities),
        'Debt to Equity Ratio': format_value(liabilities / total_shareholder_equity)
    }

    return metrics

def process_financial_data(input_file, output_file):
    # Read the input JSON file
    try:
        with open(input_file, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Input file '{input_file}' not found.")
        return
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in input file '{input_file}'.")
        return

    # Process the data for each company
    for company in data:
        for year in data[company]:
            # Create a new ordered dictionary with the updated fields
            updated_year_data = OrderedDict()
            metrics = calculate_financial_metrics(data[company][year])

            for key, value in data[company][year].items():
                updated_year_data[key] = format_value(float(value))
                if key == 'Cost of Goods':
                    updated_year_data['Gross Margin'] = metrics['Gross Margin']
                elif key == 'Current Liabilities':
                    updated_year_data['Liabilities'] = metrics['Liabilities']

            # Add the remaining new metrics to the updated data
            for key, value in metrics.items():
                if key not in updated_year_data:
                    updated_year_data[key] = value

            # Update the data with the new ordered dictionary
            data[company][year] = updated_year_data

    # Write the updated data to the output JSON file
    try:
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=4)
        print(f"Processing complete. Updated data written to {output_file}")
    except IOError:
        print(f"Error: Unable to write to output file '{output_file}'.")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python add_calculated_financial_data.py <input_file> <output_file>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    print(f"Reading {input_file}...Adding calculated metrics.")
    process_financial_data(input_file, output_file)
