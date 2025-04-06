
Make Sure the data is in the file `new_data.csv`

with these fields (no Gross Margin and Liabilities yet)

- company_name
- year
- reportDate
- Net Revenue
- Cost of Goods
- SGA
- Operating Profit
- Net Profit
- Inventory
- Current Assets
- Total Assets
- Current Liabilities
- Total Shareholder Equity
- Total Liabilities and Shareholder Equity

For example here is 2024 from Louis Vuitton

```txt 
Louis Vuitton,2024,2024-12-31,84683000,27918000,37222000,18907000,12550000,23669000,47471000,149190000,33696000,67517000,149190000
```

Then run the `generate_inserts.py` python script like this

```bash
python3 generate_inserts.py
```

This creates a file called `insert_new_data.sql` which looks like this:

```sql
INSERT INTO financials (`company_name`, `year`, `reportDate`, `Net Revenue`, `Cost of Goods`, `Gross Margin`, `SGA`, `Operating Profit`, `Net Profit`, `Inventory`, `Current Assets`, `Total Assets`, `Current Liabilities`, `Liabilities`, `Total Shareholder Equity`, `Total Liabilities and Shareholder Equity`)
VALUES
('Louis Vuitton', 2024, '2024-12-31', 84683000, 27918000, 56765000, 37222000, 18907000, 12550000, 23669000, 47471000, 149190000, 33696000, 81673000, 67517000, 149190000),
```

Now we can insert this data into the database like this:

```bash
dolt sql < insert_new_data.sql 
```

Now run these three scripts to update the data

```bash
dolt sql < update_financial_metrics.sql 
dolt sql < update_segment_metrics.sql 
dolt sql < update_subsegment_metrics.sql 
```

Then test everything and once it is good you can commit your changes to dolt and push the changes to the dolthub repo.

