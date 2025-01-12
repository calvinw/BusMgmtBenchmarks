import pandas as pd
import yfinance as yf

# Read the companies CSV file
companies_df = pd.read_csv("companies.csv")

# Iterate over each company in the companies DataFrame
for index, row in companies_df.iterrows():
    company_name = row["company_name"]
    ticker = row["ticker"]

    try:
        # Fetch company data using yfinance
        company = yf.Ticker(ticker)

        # Get income statement and balance sheet
        income_statement = company.income_stmt
        balance_sheet = company.balance_sheet

        # Print company name and ticker
        print(f"\nCompany: {company_name} ({ticker})")

        # Print the raw income statement DataFrame
        print("\nIncome Statement:")
        print(income_statement)

        # Print the raw balance sheet DataFrame
        print("\nBalance Sheet:")
        print(balance_sheet)

        # Print the row indices (financial metrics) of income_statement and balance_sheet
        print("\nIncome Statement Metrics:")
        print(income_statement.index.tolist())

        print("\nBalance Sheet Metrics:")
        print(balance_sheet.index.tolist())

        # Print the shape of income_statement and balance_sheet
        print("\nIncome Statement Shape (rows, columns):", income_statement.shape)
        print("Balance Sheet Shape (rows, columns):", balance_sheet.shape)

    except Exception as e:
        print(f"Failed to process data for {company_name} ({ticker}): {e}")
