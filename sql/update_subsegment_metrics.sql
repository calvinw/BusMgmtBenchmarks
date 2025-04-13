UPDATE subsegment_metrics ssm 
JOIN (
    SELECT 
        ci.subsegment,
        f.year,
        -- Cost of Goods Percentage
        ROUND(SUM(f.`Cost of Goods`) / NULLIF(SUM(f.`Net Revenue`), 0) * 100, 4) AS Cost_of_Goods_Percentage,

        -- SGA Percentage 
        ROUND(SUM(f.SGA) / NULLIF(SUM(f.`Net Revenue`), 0) * 100, 4) AS SGA_Percentage,
        
        -- Gross Margin Percentage
        ROUND(100 - (SUM(f.`Cost of Goods`) / NULLIF(SUM(f.`Net Revenue`), 0) * 100), 4) AS Gross_Margin_Percentage,
        
        -- Operating Profit Margin Percentage
        ROUND(SUM(f.`Operating Profit`) / NULLIF(SUM(f.`Net Revenue`), 0) * 100, 4) AS Operating_Profit_Margin_Percentage,
        
        -- Net Profit Margin Percentage
        ROUND(SUM(f.`Net Profit`) / NULLIF(SUM(f.`Net Revenue`), 0) * 100, 4) AS Net_Profit_Margin_Percentage,
        
        -- Inventory Turnover
        ROUND(SUM(f.`Cost of Goods`) / NULLIF(SUM(f.Inventory), 0), 4) AS Inventory_Turnover,
        
        -- Asset Turnover
        ROUND(SUM(f.`Net Revenue`) / NULLIF(SUM(f.`Total Assets`), 0), 4) AS Asset_Turnover,
        
        -- Return on Assets
        ROUND(SUM(f.`Net Profit`) / NULLIF(SUM(f.`Total Assets`), 0) * 100, 4) AS Return_on_Assets,
        
        -- Three-Year Revenue CAGR
        ROUND(
            POWER(
                SUM(f.`Net Revenue`) / NULLIF(SUM(CASE 
                    WHEN f_three_years_ago.year = f.year - 3 
                    THEN f_three_years_ago.`Net Revenue` 
                END), 0),
                1/3
            ) - 1,
            4
        ) * 100 AS Three_Year_Revenue_CAGR,
        
        -- Current Ratio
        ROUND(SUM(f.`Current Assets`) / NULLIF(SUM(f.`Current Liabilities`), 0), 4) AS Current_Ratio,
        
        -- Quick Ratio
        ROUND(SUM(f.`Current Assets` - f.`Inventory`) / NULLIF(SUM(f.`Current Liabilities`), 0), 4) AS Quick_Ratio,
        
        -- Sales Current Year vs Last Year
        ROUND((SUM(f.`Net Revenue`) - SUM(CASE 
            WHEN f_prev_year.year = f.year - 1 
            THEN f_prev_year.`Net Revenue` 
        END)) / NULLIF(SUM(CASE 
            WHEN f_prev_year.year = f.year - 1 
            THEN f_prev_year.`Net Revenue` 
        END), 0) * 100, 4) AS Sales_Current_Year_vs_LY,
        
        -- Debt to Equity
        ROUND(SUM(f.`Total Liabilities and Shareholder Equity` - f.`Total Shareholder Equity`) / 
            NULLIF(SUM(f.`Total Shareholder Equity`), 0), 4) AS Debt_to_Equity

    FROM financials f
    JOIN new_company_info ci ON f.company_name = ci.company
    LEFT JOIN financials f_three_years_ago 
        ON f.company_name = f_three_years_ago.company_name 
        AND f.year = f_three_years_ago.year + 3
    LEFT JOIN financials f_prev_year 
        ON f.company_name = f_prev_year.company_name 
        AND f.year = f_prev_year.year + 1
    GROUP BY ci.subsegment, f.year
) AS calculated_metrics 
ON ssm.subsegment = calculated_metrics.subsegment 
AND ssm.year = calculated_metrics.year
SET 
    ssm.Cost_of_Goods_Percentage = calculated_metrics.Cost_of_Goods_Percentage,
    ssm.SGA_Percentage = calculated_metrics.SGA_Percentage,
    ssm.Gross_Margin_Percentage = calculated_metrics.Gross_Margin_Percentage,
    ssm.Operating_Profit_Margin_Percentage = calculated_metrics.Operating_Profit_Margin_Percentage,
    ssm.Net_Profit_Margin_Percentage = calculated_metrics.Net_Profit_Margin_Percentage,
    ssm.Inventory_Turnover = calculated_metrics.Inventory_Turnover,
    ssm.Asset_Turnover = calculated_metrics.Asset_Turnover,
    ssm.Return_on_Assets = calculated_metrics.Return_on_Assets,
    ssm.Three_Year_Revenue_CAGR = calculated_metrics.Three_Year_Revenue_CAGR,
    ssm.Current_Ratio = calculated_metrics.Current_Ratio,
    ssm.Quick_Ratio = calculated_metrics.Quick_Ratio,
    ssm.Sales_Current_Year_vs_LY = calculated_metrics.Sales_Current_Year_vs_LY,
    ssm.Debt_to_Equity = calculated_metrics.Debt_to_Equity;
