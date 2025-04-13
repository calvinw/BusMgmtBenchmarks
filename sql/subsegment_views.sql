-- Drop existing subsegment views
DROP VIEW IF EXISTS `subsegment benchmarks 2024`;
DROP VIEW IF EXISTS `subsegment benchmarks 2023`;
DROP VIEW IF EXISTS `subsegment benchmarks 2022`;
DROP VIEW IF EXISTS `subsegment benchmarks 2021`;
DROP VIEW IF EXISTS `subsegment benchmarks 2020`;
DROP VIEW IF EXISTS `subsegment benchmarks 2019`;
DROP VIEW IF EXISTS `subsegment benchmarks 2018`;

-- Create subsegment benchmark views with 1 decimal place
CREATE VIEW `subsegment benchmarks 2018` AS 
SELECT 
    subsegment,
    year,
    Cost_of_Goods_Percentage AS Cost_of_Goods_Percentage,
    SGA_Percentage AS SGA_Percentage,
    Gross_Margin_Percentage AS Gross_Margin_Percentage,
    Operating_Profit_Margin_Percentage AS Operating_Profit_Margin_Percentage,
    Net_Profit_Margin_Percentage AS Net_Profit_Margin_Percentage,
    Inventory_Turnover AS Inventory_Turnover,
    Asset_Turnover AS Asset_Turnover,
    Return_on_Assets AS Return_on_Assets,
    Three_Year_Revenue_CAGR AS Three_Year_Revenue_CAGR,
    Sales_Current_Year_vs_LY AS Sales_Current_Year_vs_LY,
    Current_Ratio AS Current_Ratio,
    Quick_Ratio AS Quick_Ratio,
    Debt_to_Equity AS Debt_to_Equity
FROM 
    subsegment_metrics 
WHERE 
    year = 2018;

CREATE VIEW `subsegment benchmarks 2019` AS 
SELECT 
    subsegment,
    year,
    Cost_of_Goods_Percentage AS Cost_of_Goods_Percentage,
    SGA_Percentage AS SGA_Percentage,
    Gross_Margin_Percentage AS Gross_Margin_Percentage,
    Operating_Profit_Margin_Percentage AS Operating_Profit_Margin_Percentage,
    Net_Profit_Margin_Percentage AS Net_Profit_Margin_Percentage,
    Inventory_Turnover AS Inventory_Turnover,
    Asset_Turnover AS Asset_Turnover,
    Return_on_Assets AS Return_on_Assets,
    Three_Year_Revenue_CAGR AS Three_Year_Revenue_CAGR,
    Sales_Current_Year_vs_LY AS Sales_Current_Year_vs_LY,
    Current_Ratio AS Current_Ratio,
    Quick_Ratio AS Quick_Ratio,
    Debt_to_Equity AS Debt_to_Equity
FROM 
    subsegment_metrics 
WHERE 
    year = 2019;

CREATE VIEW `subsegment benchmarks 2020` AS 
SELECT 
    subsegment,
    year,
    Cost_of_Goods_Percentage AS Cost_of_Goods_Percentage,
    SGA_Percentage AS SGA_Percentage,
    Gross_Margin_Percentage AS Gross_Margin_Percentage,
    Operating_Profit_Margin_Percentage AS Operating_Profit_Margin_Percentage,
    Net_Profit_Margin_Percentage AS Net_Profit_Margin_Percentage,
    Inventory_Turnover AS Inventory_Turnover,
    Asset_Turnover AS Asset_Turnover,
    Return_on_Assets AS Return_on_Assets,
    Three_Year_Revenue_CAGR AS Three_Year_Revenue_CAGR,
    Sales_Current_Year_vs_LY AS Sales_Current_Year_vs_LY,
    Current_Ratio AS Current_Ratio,
    Quick_Ratio AS Quick_Ratio,
    Debt_to_Equity AS Debt_to_Equity
FROM 
    subsegment_metrics 
WHERE 
    year = 2020;

CREATE VIEW `subsegment benchmarks 2021` AS 
SELECT 
    subsegment,
    year,
    Cost_of_Goods_Percentage AS Cost_of_Goods_Percentage,
    SGA_Percentage AS SGA_Percentage,
    Gross_Margin_Percentage AS Gross_Margin_Percentage,
    Operating_Profit_Margin_Percentage AS Operating_Profit_Margin_Percentage,
    Net_Profit_Margin_Percentage AS Net_Profit_Margin_Percentage,
    Inventory_Turnover AS Inventory_Turnover,
    Asset_Turnover AS Asset_Turnover,
    Return_on_Assets AS Return_on_Assets,
    Three_Year_Revenue_CAGR AS Three_Year_Revenue_CAGR,
    Sales_Current_Year_vs_LY AS Sales_Current_Year_vs_LY,
    Current_Ratio AS Current_Ratio,
    Quick_Ratio AS Quick_Ratio,
    Debt_to_Equity AS Debt_to_Equity
FROM 
    subsegment_metrics 
WHERE 
    year = 2021;

CREATE VIEW `subsegment benchmarks 2022` AS 
SELECT 
    subsegment,
    year,
    Cost_of_Goods_Percentage AS Cost_of_Goods_Percentage,
    SGA_Percentage AS SGA_Percentage,
    Gross_Margin_Percentage AS Gross_Margin_Percentage,
    Operating_Profit_Margin_Percentage AS Operating_Profit_Margin_Percentage,
    Net_Profit_Margin_Percentage AS Net_Profit_Margin_Percentage,
    Inventory_Turnover AS Inventory_Turnover,
    Asset_Turnover AS Asset_Turnover,
    Return_on_Assets AS Return_on_Assets,
    Three_Year_Revenue_CAGR AS Three_Year_Revenue_CAGR,
    Sales_Current_Year_vs_LY AS Sales_Current_Year_vs_LY,
    Current_Ratio AS Current_Ratio,
    Quick_Ratio AS Quick_Ratio,
    Debt_to_Equity AS Debt_to_Equity
FROM 
    subsegment_metrics 
WHERE 
    year = 2022;

CREATE VIEW `subsegment benchmarks 2023` AS 
SELECT 
    subsegment,
    year,
    Cost_of_Goods_Percentage AS Cost_of_Goods_Percentage,
    SGA_Percentage AS SGA_Percentage,
    Gross_Margin_Percentage AS Gross_Margin_Percentage,
    Operating_Profit_Margin_Percentage AS Operating_Profit_Margin_Percentage,
    Net_Profit_Margin_Percentage AS Net_Profit_Margin_Percentage,
    Inventory_Turnover AS Inventory_Turnover,
    Asset_Turnover AS Asset_Turnover,
    Return_on_Assets AS Return_on_Assets,
    Three_Year_Revenue_CAGR AS Three_Year_Revenue_CAGR,
    Sales_Current_Year_vs_LY AS Sales_Current_Year_vs_LY,
    Current_Ratio AS Current_Ratio,
    Quick_Ratio AS Quick_Ratio,
    Debt_to_Equity AS Debt_to_Equity
FROM 
    subsegment_metrics 
WHERE 
    year = 2023;

CREATE VIEW `subsegment benchmarks 2024` AS 
SELECT 
    subsegment,
    year,
    Cost_of_Goods_Percentage AS Cost_of_Goods_Percentage,
    SGA_Percentage AS SGA_Percentage,
    Gross_Margin_Percentage AS Gross_Margin_Percentage,
    Operating_Profit_Margin_Percentage AS Operating_Profit_Margin_Percentage,
    Net_Profit_Margin_Percentage AS Net_Profit_Margin_Percentage,
    Inventory_Turnover AS Inventory_Turnover,
    Asset_Turnover AS Asset_Turnover,
    Return_on_Assets AS Return_on_Assets,
    Three_Year_Revenue_CAGR AS Three_Year_Revenue_CAGR,
    Sales_Current_Year_vs_LY AS Sales_Current_Year_vs_LY,
    Current_Ratio AS Current_Ratio,
    Quick_Ratio AS Quick_Ratio,
    Debt_to_Equity AS Debt_to_Equity
FROM 
    subsegment_metrics 
WHERE 
    year = 2024;
