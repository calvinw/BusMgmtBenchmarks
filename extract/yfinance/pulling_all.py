import time  # Import the time module
import pandas as pd
import yfinance as yf

start_time = time.time()

# Read the companies CSV file
companies_df = pd.read_csv("companies.csv")

# Define the mapping dictionary for renaming
mapping = {
    "Total Revenue": "Net Revenue",
    "Cost Of Revenue": "Cost of Goods",
    "Selling General And Administration": "SGA",
#    "Other Gand A": "SGA",
#   "Operating Expense": "SGA",
    "Total Operating Income As Reported": "Operating Profit",
    "Net Income": "Net Profit",
    "Inventory": "Inventory",
    "Current Assets": "Current Assets",
    "Total Assets": "Total Assets",
    "Current Liabilities": "Current Liabilities",
    "Stockholders Equity": "Total Shareholder Equity"
}

# Iterate over each company in the companies DataFrame
for index, row in companies_df.iterrows():
    company_name = row["company_name"]
    ticker = row["ticker"]
    #currency = row["currency"]
    #units = row["units"]

    try:
        # Fetch company data using yfinance
        company = yf.Ticker(ticker)

        # Get income statement and balance sheet
        income_statement = company.income_stmt
        balance_sheet = company.balance_sheet

        # Transpose the DataFrames so that financial metrics become column names
        income_statement = income_statement.transpose()
        balance_sheet = balance_sheet.transpose()

        print(income_statement)
        print(balance_sheet)

        # Remove the 5th row if there are 5 rows in either DataFrame
        if len(income_statement) == 5:
            income_statement = income_statement.iloc[:4]
        if len(balance_sheet) == 5:
            balance_sheet = balance_sheet.iloc[:4]

        # Combine the two DataFrames into one
        financial_df = pd.concat([income_statement, balance_sheet], axis=1)

        # Filter the mapping dictionary to include only metrics present in the DataFrame
        available_metrics = financial_df.columns.tolist()
        filtered_mapping = {k: v for k, v in mapping.items() if k in available_metrics}

        # Rename the columns using the filtered mapping dictionary
        financial_df.rename(columns=filtered_mapping, inplace=True)

        # Keep only the columns you want
        desired_columns = list(filtered_mapping.values())
        financial_df = financial_df[desired_columns]

        # Reset the index to make the dates a column
        financial_df = financial_df.reset_index().rename(columns={"index": "reportDate"})

        # Add a new column called "company_name" with the company name
        financial_df["company_name"] = company_name

        # Add a new column for the years (2024, 2023, 2022, 2021)
        financial_df["year"] = [2024, 2023, 2022, 2021][:len(financial_df)]

        # Reorder columns to make "company_name" and "year" the first columns
        column_order = ["company_name", "year", "reportDate"] + desired_columns
        financial_df = financial_df[column_order]

        # Convert financial data to thousands
        financial_df[desired_columns] = financial_df[desired_columns] / 1000

        # Convert all numeric columns to strings
        for col in desired_columns:
            financial_df[col] = financial_df[col].apply(lambda x: f"{x}")

        # Write the DataFrame to a CSV file in append mode
        # If the file doesn't exist, write the header; otherwise, skip the header
        header = not pd.io.common.file_exists("financial_data.csv")
        financial_df.to_csv("financial_data.csv", mode="a", index=False, header=header)

        print(f"Successfully processed data for {company_name} ({ticker})")

    except Exception as e:
        print(f"Failed to process data for {company_name} ({ticker}): {e}")

# Confirm CSV file creation
print("\nData has been written to financial_data.csv")

# Stop the timer
end_time = time.time()

# Calculate and print the total execution time
total_time = end_time - start_time
print(f"\nTotal execution time: {total_time:.2f} seconds")
