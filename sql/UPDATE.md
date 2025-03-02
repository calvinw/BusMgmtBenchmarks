
# Make Sure the data is in new_data.csv 

# with these fields (no Gross Margin and Liabilities yet)

# company_name,year,reportDate,Net Revenue,Cost of Goods,SGA,Operating Profit,Net Profit,Inventory,Current Assets,Total Assets,Current Liabilities,Total Shareholder Equity,Total Liabilities and Shareholder Equity
# Louis Vuitton,2024,2024-12-31,84683000,27918000,37222000,18907000,12550000,23669000,47471000,149190000,33696000,67517000,149190000

# Then run the generate_inserts.py

python3 generate_inserts.py


# This creates insert_new_data.sql which looks like this:

# INSERT INTO financials (`company_name`, `year`, `reportDate`, `Net Revenue`, `Cost of Goods`, `Gross Margin`, `SGA`, `Operating Profit`, `Net Profit`, `Inventory`, `Current Assets`, `Total Assets`, `Current Liabilities`, `Liabilities`, `Total Shareholder Equity`, `Total Liabilities and Shareholder Equity`)
# VALUES
# ('Louis Vuitton', 2024, '2024-12-31', 84683000, 27918000, 56765000, 37222000, 18907000, 12550000, 23669000, 47471000, 149190000, 33696000, 81673000, 67517000, 149190000),


# This inserts the data
dolt sql < insert_new_data.sql 

# This updates all the metrics

dolt sql < update_financial_metrics.sql 
dolt sql < update_segment_metrics.sql 
dolt sql < update_subsegment_metrics.sql 

# Dont need to redo the views at this point
# dolt sql < complete_views.sql 
