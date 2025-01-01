from edgar import *
import pandas as pd
from datetime import datetime

# Set identity
set_identity("Calvin Williamson calvin_williamson@fitnyc.edu")

# Use the CIK of the company
cik = "0000794367"

# Get the company object using the CIK
company = Company(cik)

# Define the date range for 10-K filings - use single date string

year_range=range(2019,2024)

try:
    # Fetch the 10-K filings starting from filing_date
    filings = company.get_filings(form="10-K").latest(7)
    

    # Debug: Print the number of filings and their details
    print(f"Number of filings found: {len(filings)}")
    for filing in filings:
        print(f"Filing: {filing.accession_number}, Date: {filing.filing_date}, Form: {filing.form}")

    # Check if filings are available
    # if not filings:
    #     print("No 10-K filings found for the given date range.")
    # else:
    #     # Loop through each 10-K filing
    #     for filing in filings:
    #         try:
    #             # Parse the 10-K filing
    #             tenk = filing.obj()
    #             print(f"\nProcessing filing from {filing.filing_date}")
    #             
    #             # Extract the income statement and convert to DataFrame
    #             income_statement = tenk.income_statement.to_dataframe()
    #             print("\nIncome Statement:")
    #             print(income_statement)
    #             
    #             # Extract the balance sheet and convert to DataFrame
    #             balance_sheet = tenk.balance_sheet.to_dataframe()
    #             print("\nBalance Sheet:")
    #             print(balance_sheet)
    #             
    #         except Exception as e:
    #             print(f"Error processing filing {filing.accession_number}: {str(e)}")

except Exception as e:
    print(f"Error fetching filings: {str(e)}")

