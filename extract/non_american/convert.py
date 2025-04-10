import pandas as pd
import sys

# Function to read the text file and convert it to a DataFrame
def text_to_dataframe(file_path):
    with open(file_path, 'r') as file:
        lines = file.readlines()

    # Initialize variables
    data = {}
    current_column = None

    # Process each line
    for line in lines:
        line = line.strip()
        if line:  # Skip empty lines
            if line == '-' or line.replace(',', '').replace('.', '').replace('-', '').isdigit() or line.endswith('%') or line == 'NM':
                # This line is a data row (including dashes)
                data[current_column].append(line)
            else:
                # This line is a column header
                current_column = line
                data[current_column] = []

    # Convert the dictionary to a DataFrame
    df = pd.DataFrame(data)
    return df

# Function to save the DataFrame to a CSV file
def save_to_csv(df, output_path):
    df.to_csv(output_path, index=False)

# Main function to handle command-line arguments
def main():
    if len(sys.argv) != 6:
        print("Usage: python script.py <company_name> <ticker_symbol> <currency> <input_file> <output_csv>")
        sys.exit(1)

    company_name = sys.argv[1]  # First argument: company name
    ticker_symbol = sys.argv[2]  # Second argument: ticker symbol
    currency = sys.argv[3]  # Third argument: currency (3-character abbreviation)
    input_file_path = sys.argv[4]  # Fourth argument: input file path
    output_file_path = sys.argv[5]  # Fifth argument: output CSV file path

    # Read the data and convert to DataFrame
    df = text_to_dataframe(input_file_path)

    # Rename the 'Dates' column to 'reportDate'
    df.rename(columns={'Dates': 'reportDate'}, inplace=True)

    # Add a new 'year' column starting from 2015 to 2024
    df['year'] = range(2015, 2015 + len(df))

    # Add additional columns in the desired order
    df.insert(0, 'Company', company_name)  # Add company name as the first column
    df.insert(1, 'year', df.pop('year'))  # Move 'year' to the second column
    df.insert(2, 'Ticker', ticker_symbol)  # Add ticker symbol as the third column
    df.insert(3, 'Currency', currency)  # Add currency as the fourth column
    df.insert(4, 'Units', 'thousands')  # Add units as the fifth column

    # Define the columns to keep and their new names
    columns_to_keep = [
        "Company", "year", "Ticker", "Currency", "Units", "reportDate",
        "Revenue", "Cost of Revenues", "General & Admin Expenses", "Operating Income",
        "Net Income to Company", "Inventory", "Total Current Assets", "Total Assets",
        "Total Current Liabilities", "Total Equity", "Total Liabilities And Equity"
    ]

    # Define the new column names
    newNames = {
        "Revenue": "Net Revenue",
        "Cost of Revenues": "Cost of Goods",
        "General & Admin Expenses": "SG&A",
        "Operating Income": "Operating Profit",
        "Net Income to Company": "Net Profit",
        "Inventory": "Inventory",
        "Total Current Assets": "Current Assets",
        "Total Assets": "Total Assets",
        "Total Current Liabilities": "Current Liabilities",
        "Total Equity": "Total Shareholder Equity",
        "Total Liabilities And Equity": "Total Liabilities and Shareholder Equity"
    }

    # Filter the DataFrame to keep only the specified columns
    df = df[columns_to_keep]

    # Rename the columns using the newNames mapping
    df.rename(columns=newNames, inplace=True)

    # Save the DataFrame to a CSV file
    save_to_csv(df, output_file_path)

    print(f"Data has been successfully saved to {output_file_path}")

if __name__ == "__main__":
    main()
