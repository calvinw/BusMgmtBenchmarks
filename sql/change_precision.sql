ALTER TABLE new_financial_metrics
MODIFY COLUMN Cost_of_Goods_Percentage decimal(10,4),
MODIFY COLUMN SGA_Percentage decimal(10,4),
MODIFY COLUMN Gross_Margin_Percentage decimal(10,4),
MODIFY COLUMN Operating_Profit_Margin_Percentage decimal(10,4),
MODIFY COLUMN Net_Profit_Margin_Percentage decimal(10,4),
MODIFY COLUMN Inventory_Turnover decimal(10,4),
MODIFY COLUMN Asset_Turnover decimal(10,4),
MODIFY COLUMN Return_on_Assets decimal(10,4),
MODIFY COLUMN Three_Year_Revenue_CAGR decimal(10,4),
MODIFY COLUMN Current_Ratio decimal(10,4),
MODIFY COLUMN Quick_Ratio decimal(10,4),
MODIFY COLUMN Sales_Current_Year_vs_LY decimal(10,4),
MODIFY COLUMN Debt_to_Equity decimal(10,4);

-- For segment_metrics table
ALTER TABLE segment_metrics
MODIFY COLUMN Cost_of_Goods_Percentage decimal(10,4),
MODIFY COLUMN SGA_Percentage decimal(10,4),
MODIFY COLUMN Gross_Margin_Percentage decimal(10,4),
MODIFY COLUMN Operating_Profit_Margin_Percentage decimal(10,4),
MODIFY COLUMN Net_Profit_Margin_Percentage decimal(10,4),
MODIFY COLUMN Inventory_Turnover decimal(10,4),
MODIFY COLUMN Asset_Turnover decimal(10,4),
MODIFY COLUMN Return_on_Assets decimal(10,4),
MODIFY COLUMN Three_Year_Revenue_CAGR decimal(10,4),
MODIFY COLUMN Current_Ratio decimal(10,4),
MODIFY COLUMN Quick_Ratio decimal(10,4),
MODIFY COLUMN Sales_Current_Year_vs_LY decimal(10,4),
MODIFY COLUMN Debt_to_Equity decimal(10,4);

-- For subsegment_metrics table
ALTER TABLE subsegment_metrics
MODIFY COLUMN Cost_of_Goods_Percentage decimal(10,4),
MODIFY COLUMN SGA_Percentage decimal(10,4),
MODIFY COLUMN Gross_Margin_Percentage decimal(10,4),
MODIFY COLUMN Operating_Profit_Margin_Percentage decimal(10,4),
MODIFY COLUMN Net_Profit_Margin_Percentage decimal(10,4),
MODIFY COLUMN Inventory_Turnover decimal(10,4),
MODIFY COLUMN Asset_Turnover decimal(10,4),
MODIFY COLUMN Return_on_Assets decimal(10,4),
MODIFY COLUMN Three_Year_Revenue_CAGR decimal(10,4),
MODIFY COLUMN Current_Ratio decimal(10,4),
MODIFY COLUMN Quick_Ratio decimal(10,4),
MODIFY COLUMN Sales_Current_Year_vs_LY decimal(10,4),
MODIFY COLUMN Debt_to_Equity decimal(10,4);
