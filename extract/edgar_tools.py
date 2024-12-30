from edgar import *
import os
import pandas

os.environ["EDGAR_IDENTITY"] = "Calvin Williamson calvin_williamson@fitnyc.edu"

cost = Company("JWN")
filings = cost.get_filings(form='10-K')

xbrl = filings[0].xbrl()
statements = xbrl.statements

# #statement = xbrl.statements['CONSOLIDATEDBALANCESHEETS']
# statement = xbrl.statements['CONSOLIDATEDSTATEMENTOFOPERATIONS']
# statement = xbrl.get_statement("CONSOLIDATEDSTATEMENTOFOPERATIONS")
# #print(cost.financials.get_income_statement())
# statement = xbrl.get_statement("CONSOLIDATEDSTATEMENTSOFEARNINGS")
# df = statement.to_dataframe()

statement = cost.financials.get_income_statement()
df = statement.get_dataframe()

print(df)

statement = cost.financials.get_balance_sheet()
df = statement.to_dataframe()

print(df)

df=cost.get_facts().to_pandas()
print(df)
