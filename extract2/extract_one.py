from secfsdstools.c_index.companyindexreading import CompanyIndexReader
from secfsdstools.e_collector.reportcollecting import SingleReportCollector
from secfsdstools.e_filter.rawfiltering import ReportPeriodRawFilter
from secfsdstools.e_presenter.presenting import StandardStatementPresenter
import pandas as pd 

import pandas as pd
# ensure that all columns are shown and that colum content is not cut
pd.set_option('display.max_columns', None)
pd.set_option('display.max_colwidth', None)
pd.set_option('display.width',1000)
pd.set_option('display.max_rows', 500) # ensure that all rows are shown
pd.set_option('display.float_format', '{:.2f}'.format)

def get_asdh_list(cik): 
    index_reader = CompanyIndexReader.get_company_index_reader(cik=cik)

    df = index_reader.get_all_company_reports_df(forms=["10-K"])

    adsh_list = df["adsh"].tolist()

    return adsh_list

def get_numeric_columns(df, statement_str):
    if(statement_str == "IS"):
        numeric_columns = [col for col in df.columns if col.startswith('qrtrs_4')]
    elif(statement_str == "BS"):        
        numeric_columns = [col for col in df.columns if col.startswith('qrtrs_0')]
    return numeric_columns

def trim_statement_df(df, statement_str):

    # Assuming df is your DataFrame

    numeric_columns = get_numeric_columns(df, statement_str)

    # Restrict the DataFrame to only the 'tag' column and the numeric columns
    restricted_df = df[['tag'] + numeric_columns]

    # # Convert numeric columns to integers
    # restricted_df[numeric_columns] = restricted_df[numeric_columns].applymap(lambda x: int(x) if pd.notna(x) else x)
    #
    return restricted_df

def get_statement(adsh, statement_str):

    # Collect and filter balance sheet data
    collector = SingleReportCollector.get_report_by_adsh(adsh=adsh, stmt_filter=[statement_str])
    rawdatabag = collector.collect()

    # Apply the filter and standardize the presentation
    df = (rawdatabag
         .filter(ReportPeriodRawFilter())
         .join()
         .present(StandardStatementPresenter()))

    return df

def extract_financials(income_df, balance_df):
    # Define the mapping of the tags to the desired field names
    field_mapping = {
        'RevenueFromContractWithCustomerExcludingAssessedTax': 'Net Revenue',
        'CostOfRevenue': 'Cost of Goods',
        'SellingGeneralAndAdministrativeExpense': 'SG&A',
        'OperatingIncomeLoss': 'Operating Profit',
        'NetIncomeLoss': 'Net Profit',
        'InventoryNet': 'Inventory',
        'AssetsCurrent': 'Current Assets',
        'Assets': 'Total Assets',
        'LiabilitiesCurrent': 'Current Liabilities',
        'StockholdersEquity': 'Total Shareholder Equity',
        'LiabilitiesAndStockholdersEquity': 'Total Liabilities and Shareholder Equity'
    }

    # Function to extract the correct column name based on the prefix
    def get_column_with_prefix(df, prefix):
        for col in df.columns:
            if col.startswith(prefix):
                return col
        raise ValueError(f"No column starts with '{prefix}' in the dataframe.")

    # Get the correct column names for income and balance dataframes
    income_column = get_column_with_prefix(income_df, "qrtrs_4")
    balance_column = get_column_with_prefix(balance_df, "qrtrs_0")

    # Filter and rename the columns from the income_df
    income_fields = income_df[income_df['tag'].isin(field_mapping.keys())].copy()
    income_fields['Field'] = income_fields['tag'].map(field_mapping)
    income_fields['Value'] = income_fields[income_column]  # Use the correct column for values
    income_fields = income_fields[['Field', 'Value']]

    # Filter and rename the columns from the balance_df
    balance_fields = balance_df[balance_df['tag'].isin(field_mapping.keys())].copy()
    balance_fields['Field'] = balance_fields['tag'].map(field_mapping)
    balance_fields['Value'] = balance_fields[balance_column]  # Use the correct column for values
    balance_fields = balance_fields[['Field', 'Value']]

    # Combine the filtered dataframes
    financials_df = pd.concat([income_fields, balance_fields], ignore_index=True)

    return financials_df

def make_financials(adsh):
    income_df = get_statement(adsh, "IS")
    print(income_df)
    income_df = trim_statement_df(income_df, "IS")


    balance_df = get_statement(adsh, "BS")
    balance_df = trim_statement_df(balance_df, "BS")

    return extract_financials(income_df, balance_df)
my_list= get_asdh_list("935703") 
adsh = my_list[6]
financials_df = make_financials(adsh)
print(financials_df)
