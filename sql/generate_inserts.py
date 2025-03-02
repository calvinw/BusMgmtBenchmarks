
import pandas as pd

COLUMNS = [
    "company_name",
    "year",
    "reportDate",
    "Net Revenue",
    "Cost of Goods",
    "Gross Margin",
    "SGA",
    "Operating Profit",
    "Net Profit",
    "Inventory",
    "Current Assets",
    "Total Assets",
    "Current Liabilities",
    "Liabilities",
    "Total Shareholder Equity",
    "Total Liabilities and Shareholder Equity"
]

fields_str = ", ".join([f"`{c}`" for c in COLUMNS])
update_str = ", ".join([f"`{c}` = VALUES(`{c}`)" for c in COLUMNS if c not in ["company_name", "year"]])

df = pd.read_csv("new_data.csv")
rows_sql = []

for _, row in df.iterrows():
    gross_margin = row["Net Revenue"] - row["Cost of Goods"] if pd.notnull(row["Net Revenue"]) and pd.notnull(row["Cost of Goods"]) else None
    liabilities = row["Total Liabilities and Shareholder Equity"] - row["Total Shareholder Equity"] if pd.notnull(row["Total Liabilities and Shareholder Equity"]) and pd.notnull(row["Total Shareholder Equity"]) else None
    
    data = row.to_dict()
    data["Gross Margin"] = gross_margin
    data["Liabilities"] = liabilities
    
    values_list = []
    for c in COLUMNS:
        val = data.get(c, None)
        if pd.isnull(val):
            values_list.append("NULL")
        elif isinstance(val, str):
            values_list.append("'" + val.replace("'", "''") + "'")
        else:
            values_list.append(str(val))
    row_str = f"({', '.join(values_list)})"
    rows_sql.append(row_str)

sql_statement = """INSERT INTO financials ({})\nVALUES\n{}\nON DUPLICATE KEY UPDATE\n{};""".format(fields_str, ',\n'.join(rows_sql), update_str)

with open("insert_new_data.sql", "w") as f:
    f.write(sql_statement)
