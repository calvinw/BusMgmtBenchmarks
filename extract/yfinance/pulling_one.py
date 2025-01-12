import pandas as pd
import yfinance as yf

# Fetch LVMH data
lvmh = yf.Ticker("MC.PA")

# Get income statement and balance sheet
income_statement = lvmh.income_stmt
balance_sheet = lvmh.balance_sheet

# Print company name
print(lvmh.info["longName"])
print(lvmh.info["shortName"])

# Debugging: Print the row indices (financial metrics) of income_statement and balance_sheet
print("\nIncome Statement Metrics:")
print(income_statement.index.tolist())

print("\nBalance Sheet Metrics:")
print(balance_sheet.index.tolist())

# Step 1: Transpose the DataFrames so that financial metrics become column names
income_statement = income_statement.transpose()
balance_sheet = balance_sheet.transpose()

# Step 2: Combine the two DataFrames into one
financial_df = pd.concat([income_statement, balance_sheet], axis=1)

# Step 3: Define the mapping dictionary for renaming
# Update this dictionary based on the actual metric names printed above
mapping = {
    "Total Revenue": "Net Revenue",
    "Cost Of Revenue": "Cost of Goods",  # Updated to match the actual metric name
    "Selling General And Administration": "SG&A",
    "Operating Income": "Operating Profit",
    "Net Income": "Net Profit",
    "Inventory": "Inventory",
    "Current Assets": "Current Assets",
    "Total Assets": "Total Assets",
    "Current Liabilities": "Current Liabilities",
    "Stockholders Equity": "Total Shareholder Equity",
    "Total Liabilities Net Minority Interest": "Total Liabilities and Shareholder Equity"
}

# Step 4: Rename the columns using the mapping dictionary
financial_df.rename(columns=mapping, inplace=True)

# Step 5: Keep only the columns you want
desired_columns = list(mapping.values())  # Get the list of desired column names
financial_df = financial_df[desired_columns]  # Filter the DataFrame to keep only the desired columns

# Step 6: Convert the row names (dates) into a column called "filingDate"
financial_df = financial_df.reset_index().rename(columns={"index": "filingDate"})

# Step 7: Add a new column called "company_name" with the value "Louis Vuitton"
financial_df["company_name"] = "Louis Vuitton"

# Step 8: Add a new column called "year" with values 2024, 2023, 2022, 2021
financial_df["year"] = [2024, 2023, 2022, 2021]

# Step 9: Reorder columns to make "company_name" the first column
column_order = ["company_name", "year", "filingDate"] + desired_columns
financial_df = financial_df[column_order]

# Step 10: Convert financial data to thousands
financial_df[desired_columns] = financial_df[desired_columns] / 1000

# Convert all numeric columns to strings
for col in desired_columns:
    financial_df[col] = financial_df[col].apply(lambda x: f"{x}")

# Step 14: Write the DataFrame to a CSV file
output_file = "financial_data.csv"
financial_df.to_csv(output_file, index=False)

# Display the final DataFrame
print("\nFinal Financial DataFrame:")
print(financial_df)

# Confirm CSV file creation
print(f"\nData has been written to {output_file}")
