import csv
import sys
from collections import OrderedDict
import math

def format_value(value, is_percentage=False):
    if isinstance(value, str):
        return value
    if is_percentage:
        return f"{value:.1f}%"
    else:
        return f"{value:.1f}"

def calculate_cagr(start_value, end_value, num_years):
    """
    Calculate the Compound Annual Growth Rate.
    
    Parameters:
    start_value (float): Initial value
    end_value (float): Final value
    num_years (float): Number of years between start and end value
    
    Returns:
    float: CAGR as a percentage, or None if calculation is not possible
    """
    if start_value <= 0 or end_value <= 0 or num_years < 1:
        return None
    try:
        cagr = (math.pow(end_value / start_value, 1.0 / num_years) - 1) * 100
        return cagr
    except:
        return None

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

def get_rolling_cagr(company_data, target_year):
    """
    Calculate rolling 3-year CAGR for a specific year.
    Returns None if insufficient data available.
    """
    # Get data for target year and two years prior
    years_needed = [str(target_year - 2), str(target_year - 1), str(target_year)]
    relevant_data = {}
    
    for row in company_data:
        if row['year'] in years_needed:
            relevant_data[row['year']] = float(row['Net Revenue'])
    
    # Only calculate if we have all three years
    if len(relevant_data) == 3:
        start_revenue = relevant_data[str(target_year - 2)]
        end_revenue = relevant_data[str(target_year)]
        return calculate_cagr(start_revenue, end_revenue, 2)  # 2 years between start and end
    
    return None

def process_financial_data(input_file, output_file):
    try:
        with open(input_file, 'r') as f:
            reader = csv.DictReader(f)
            data = list(reader)
    except FileNotFoundError:
        print(f"Error: Input file '{input_file}' not found.")
        return
    except csv.Error as e:
        print(f"Error reading CSV file: {e}")
        return

    # Group data by company
    companies = {}
    for row in data:
        company = row['company_name']
        if company not in companies:
            companies[company] = []
        companies[company].append(row)

    # Calculate rolling CAGR for each row
    output_data = []
    fieldnames = list(data[0].keys()) + [
        'Gross Margin', 'Liabilities', 'Cost of Goods Percentage', 'Gross Margin Percentage',
        'SG&A Expense Percentage', 'Operating Profit Margin Percentage', 'Net Profit Margin Percentage',
        'Inventory Turnover', 'Asset Turnover', 'Return on Assets Percentage', 'Current Ratio',
        'Quick Ratio', 'Debt to Equity Ratio', '3-Year Revenue CAGR'
    ]

    for row in data:
        metrics = calculate_financial_metrics(row)
        updated_row = OrderedDict()
        
        for key in fieldnames:
            if key == '3-Year Revenue CAGR':
                company_data = companies[row['company_name']]
                cagr = get_rolling_cagr(company_data, int(row['year']))
                updated_row[key] = format_value(cagr, True) if cagr is not None else ''
            elif key in row:
                if key in ['company_name', 'year']:
                    updated_row[key] = row[key]
                else:
                    try:
                        updated_row[key] = format_value(float(row[key]))
                    except ValueError:
                        updated_row[key] = row[key]
            elif key in metrics:
                updated_row[key] = metrics[key]
            else:
                updated_row[key] = ''
        
        output_data.append(updated_row)

    try:
        with open(output_file, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(output_data)
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
