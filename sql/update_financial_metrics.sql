INSERT INTO new_financial_metrics (
    company_name, 
    year, 
    Cost_of_Goods_Percentage, 
    SGA_Percentage, 
    Gross_Margin_Percentage, 
    Operating_Profit_Margin_Percentage, 
    Net_Profit_Margin_Percentage, 
    Inventory_Turnover, 
    Asset_Turnover, 
    Return_on_Assets, 
    Three_Year_Revenue_CAGR, 
    Current_Ratio, 
    Quick_Ratio, 
    Sales_Current_Year_vs_LY, 
    Debt_to_Equity
)
WITH calculated_metrics AS (
    SELECT 
        f.company_name, 
        f.year, 
        (f.`Cost of Goods` / NULLIF(f.`Net Revenue`, 0)) * 100 AS Cost_of_Goods_Percentage,
        ((f.`Net Revenue` - f.`Cost of Goods`) / NULLIF(f.`Net Revenue`, 0)) * 100 AS Gross_Margin_Percentage,
        (f.`Operating Profit` / NULLIF(f.`Net Revenue`, 0)) * 100 AS Operating_Profit_Margin_Percentage,
        (f.`Net Profit` / NULLIF(f.`Net Revenue`, 0)) * 100 AS Net_Profit_Margin_Percentage,
        f.`Cost of Goods` / NULLIF((f.`Inventory` + IFNULL(LAG(f.`Inventory`, 1) OVER (PARTITION BY f.company_name ORDER BY f.year), f.`Inventory`)) / 2, 0) AS Inventory_Turnover,
        (f.`SGA` / NULLIF(f.`Net Revenue`, 0)) * 100 AS SGA_Percentage,
        f.`Net Revenue` / NULLIF((f.`Total Assets` + IFNULL(LAG(f.`Total Assets`, 1) OVER (PARTITION BY f.company_name ORDER BY f.year), f.`Total Assets`)) / 2, 0) AS Asset_Turnover,
        (f.`Net Profit` / NULLIF((f.`Total Assets` + IFNULL(LAG(f.`Total Assets`, 1) OVER (PARTITION BY f.company_name ORDER BY f.year), f.`Total Assets`)) / 2, 0)) * 100 AS Return_on_Assets,
        CASE 
            WHEN LAG(f.`Net Revenue`, 3) OVER (PARTITION BY f.company_name ORDER BY f.year) IS NOT NULL 
            THEN POWER((f.`Net Revenue` / NULLIF(LAG(f.`Net Revenue`, 3) OVER (PARTITION BY f.company_name ORDER BY f.year), 0)), 1/3) - 1 
            ELSE NULL 
        END AS Three_Year_Revenue_CAGR,
        f.`Current Assets` / NULLIF(f.`Current Liabilities`, 0) AS Current_Ratio,
        (f.`Current Assets` - f.`Inventory`) / NULLIF(f.`Current Liabilities`, 0) AS Quick_Ratio,
        CASE 
            WHEN LAG(f.`Net Revenue`, 1) OVER (PARTITION BY f.company_name ORDER BY f.year) IS NOT NULL 
            THEN (f.`Net Revenue` - LAG(f.`Net Revenue`, 1) OVER (PARTITION BY f.company_name ORDER BY f.year)) / NULLIF(LAG(f.`Net Revenue`, 1) OVER (PARTITION BY f.company_name ORDER BY f.year), 0) 
            ELSE NULL 
        END AS Sales_Current_Year_vs_LY,
        CASE 
            WHEN f.`Total Shareholder Equity` = 0 THEN NULL 
            ELSE (f.`Total Liabilities and Shareholder Equity` - f.`Total Shareholder Equity`) / NULLIF(f.`Total Shareholder Equity`, 0) 
        END AS Debt_to_Equity
    FROM financials f
    ORDER BY f.company_name ASC, f.year ASC
)
SELECT * FROM calculated_metrics
ON DUPLICATE KEY UPDATE
    Cost_of_Goods_Percentage = calculated_metrics.Cost_of_Goods_Percentage,
    SGA_Percentage = calculated_metrics.SGA_Percentage,
    Gross_Margin_Percentage = calculated_metrics.Gross_Margin_Percentage,
    Operating_Profit_Margin_Percentage = calculated_metrics.Operating_Profit_Margin_Percentage,
    Net_Profit_Margin_Percentage = calculated_metrics.Net_Profit_Margin_Percentage,
    Inventory_Turnover = calculated_metrics.Inventory_Turnover,
    Asset_Turnover = calculated_metrics.Asset_Turnover,
    Return_on_Assets = calculated_metrics.Return_on_Assets,
    Three_Year_Revenue_CAGR = calculated_metrics.Three_Year_Revenue_CAGR,
    Current_Ratio = calculated_metrics.Current_Ratio,
    Quick_Ratio = calculated_metrics.Quick_Ratio,
    Sales_Current_Year_vs_LY = calculated_metrics.Sales_Current_Year_vs_LY,
    Debt_to_Equity = calculated_metrics.Debt_to_Equity;
