-- SQL script to insert placeholder records for each subsegment for the year 2018
-- Assumes a table named 'subsegment_metrics' with a similar structure to 'segment_metrics'.
-- You will need to update the metric values manually after running this script.

INSERT INTO subsegment_metrics (
    subsegment, year, Cost_of_Goods_Percentage, SGA_Percentage, Gross_Margin_Percentage,
    Operating_Profit_Margin_Percentage, Net_Profit_Margin_Percentage, Inventory_Turnover,
    Asset_Turnover, Return_on_Assets, Three_Year_Revenue_CAGR, Current_Ratio,
    Quick_Ratio, Sales_Current_Year_vs_LY, Debt_to_Equity
) VALUES
('Accessories and Shoes', 2018, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
('Apparel', 2018, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
('Beauty', 2018, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
('Category Killer', 2018, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
('Home', 2018, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00);

-- End of script