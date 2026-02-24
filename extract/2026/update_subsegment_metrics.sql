-- Step 1: Delete existing data
DELETE FROM subsegment_metrics;

-- Step 2: Insert recalculated data with proper NULL handling
INSERT INTO subsegment_metrics (
    subsegment,
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
SELECT 
    ci.subsegment,
    f.year,
    
    -- Cost of Goods Percentage - only include companies with both Net Revenue and Cost of Goods
    ROUND(
        SUM(CASE WHEN f.`Cost of Goods` IS NOT NULL AND f.`Net Revenue` IS NOT NULL 
            THEN f.`Cost of Goods` END) / 
        NULLIF(SUM(CASE WHEN f.`Cost of Goods` IS NOT NULL AND f.`Net Revenue` IS NOT NULL 
            THEN f.`Net Revenue` END), 0) * 100, 4
    ) AS Cost_of_Goods_Percentage,

    -- SGA Percentage - only include companies with both Net Revenue and SGA
    ROUND(
        SUM(CASE WHEN f.`SGA` IS NOT NULL AND f.`Net Revenue` IS NOT NULL 
            THEN f.`SGA` END) / 
        NULLIF(SUM(CASE WHEN f.`SGA` IS NOT NULL AND f.`Net Revenue` IS NOT NULL 
            THEN f.`Net Revenue` END), 0) * 100, 4
    ) AS SGA_Percentage,
    
    -- Gross Margin Percentage - only include companies with both Net Revenue and Cost of Goods
    ROUND(
        100 - (SUM(CASE WHEN f.`Cost of Goods` IS NOT NULL AND f.`Net Revenue` IS NOT NULL 
                THEN f.`Cost of Goods` END) / 
               NULLIF(SUM(CASE WHEN f.`Cost of Goods` IS NOT NULL AND f.`Net Revenue` IS NOT NULL 
                THEN f.`Net Revenue` END), 0) * 100), 4
    ) AS Gross_Margin_Percentage,
    
    -- Operating Profit Margin Percentage - only include companies with both Net Revenue and Operating Profit
    ROUND(
        SUM(CASE WHEN f.`Operating Profit` IS NOT NULL AND f.`Net Revenue` IS NOT NULL 
            THEN f.`Operating Profit` END) / 
        NULLIF(SUM(CASE WHEN f.`Operating Profit` IS NOT NULL AND f.`Net Revenue` IS NOT NULL 
            THEN f.`Net Revenue` END), 0) * 100, 4
    ) AS Operating_Profit_Margin_Percentage,
    
    -- Net Profit Margin Percentage - only include companies with both Net Revenue and Net Profit
    ROUND(
        SUM(CASE WHEN f.`Net Profit` IS NOT NULL AND f.`Net Revenue` IS NOT NULL 
            THEN f.`Net Profit` END) / 
        NULLIF(SUM(CASE WHEN f.`Net Profit` IS NOT NULL AND f.`Net Revenue` IS NOT NULL 
            THEN f.`Net Revenue` END), 0) * 100, 4
    ) AS Net_Profit_Margin_Percentage,
    
    -- Inventory Turnover - only include companies with both Cost of Goods and Inventory
    ROUND(
        SUM(CASE WHEN f.`Cost of Goods` IS NOT NULL AND f.`Inventory` IS NOT NULL 
            THEN f.`Cost of Goods` END) / 
        NULLIF(SUM(CASE WHEN f.`Cost of Goods` IS NOT NULL AND f.`Inventory` IS NOT NULL 
            THEN f.`Inventory` END), 0), 4
    ) AS Inventory_Turnover,
    
    -- Asset Turnover - only include companies with both Net Revenue and Total Assets
    ROUND(
        SUM(CASE WHEN f.`Net Revenue` IS NOT NULL AND f.`Total Assets` IS NOT NULL 
            THEN f.`Net Revenue` END) / 
        NULLIF(SUM(CASE WHEN f.`Net Revenue` IS NOT NULL AND f.`Total Assets` IS NOT NULL 
            THEN f.`Total Assets` END), 0), 4
    ) AS Asset_Turnover,
    
    -- Return on Assets - only include companies with both Net Profit and Total Assets
    ROUND(
        SUM(CASE WHEN f.`Net Profit` IS NOT NULL AND f.`Total Assets` IS NOT NULL 
            THEN f.`Net Profit` END) / 
        NULLIF(SUM(CASE WHEN f.`Net Profit` IS NOT NULL AND f.`Total Assets` IS NOT NULL 
            THEN f.`Total Assets` END), 0) * 100, 4
    ) AS Return_on_Assets,
    
    -- Three-Year Revenue CAGR - only include companies with complete 3-year data
    ROUND(
        POWER(
            SUM(CASE WHEN f.`Net Revenue` IS NOT NULL AND f_three_years_ago.`Net Revenue` IS NOT NULL
                THEN f.`Net Revenue` END) / 
            NULLIF(SUM(CASE WHEN f.`Net Revenue` IS NOT NULL AND f_three_years_ago.`Net Revenue` IS NOT NULL
                THEN f_three_years_ago.`Net Revenue` END), 0),
            1/3
        ) - 1,
        4
    ) * 100 AS Three_Year_Revenue_CAGR,
    
    -- Current Ratio - only include companies with both Current Assets and Current Liabilities
    ROUND(
        SUM(CASE WHEN f.`Current Assets` IS NOT NULL AND f.`Current Liabilities` IS NOT NULL 
            THEN f.`Current Assets` END) / 
        NULLIF(SUM(CASE WHEN f.`Current Assets` IS NOT NULL AND f.`Current Liabilities` IS NOT NULL 
            THEN f.`Current Liabilities` END), 0), 4
    ) AS Current_Ratio,
    
    -- Quick Ratio - only include companies with Current Assets, Inventory, and Current Liabilities
    ROUND(
        SUM(CASE WHEN f.`Current Assets` IS NOT NULL AND f.`Inventory` IS NOT NULL AND f.`Current Liabilities` IS NOT NULL 
            THEN f.`Current Assets` - f.`Inventory` END) / 
        NULLIF(SUM(CASE WHEN f.`Current Assets` IS NOT NULL AND f.`Inventory` IS NOT NULL AND f.`Current Liabilities` IS NOT NULL 
            THEN f.`Current Liabilities` END), 0), 4
    ) AS Quick_Ratio,
    
    -- Sales Current Year vs Last Year - only include companies with complete year-over-year data
    ROUND(
        (SUM(CASE WHEN f.`Net Revenue` IS NOT NULL AND f_prev_year.`Net Revenue` IS NOT NULL
            THEN f.`Net Revenue` END) - 
         SUM(CASE WHEN f.`Net Revenue` IS NOT NULL AND f_prev_year.`Net Revenue` IS NOT NULL
            THEN f_prev_year.`Net Revenue` END)) / 
        NULLIF(SUM(CASE WHEN f.`Net Revenue` IS NOT NULL AND f_prev_year.`Net Revenue` IS NOT NULL
            THEN f_prev_year.`Net Revenue` END), 0) * 100, 4
    ) AS Sales_Current_Year_vs_LY,
    
    -- Debt to Equity - only include companies with complete equity and liability data
    ROUND(
        SUM(CASE WHEN f.`Total Liabilities and Shareholder Equity` IS NOT NULL AND f.`Total Shareholder Equity` IS NOT NULL AND f.`Total Shareholder Equity` != 0
            THEN f.`Total Liabilities and Shareholder Equity` - f.`Total Shareholder Equity` END) / 
        NULLIF(SUM(CASE WHEN f.`Total Liabilities and Shareholder Equity` IS NOT NULL AND f.`Total Shareholder Equity` IS NOT NULL AND f.`Total Shareholder Equity` != 0
            THEN f.`Total Shareholder Equity` END), 0), 4
    ) AS Debt_to_Equity

FROM financials f
JOIN company_info ci ON f.company_name = ci.company
LEFT JOIN financials f_three_years_ago 
    ON f.company_name = f_three_years_ago.company_name 
    AND f.year = f_three_years_ago.year + 3
LEFT JOIN financials f_prev_year 
    ON f.company_name = f_prev_year.company_name 
    AND f.year = f_prev_year.year + 1
WHERE ci.subsegment IS NOT NULL
GROUP BY ci.subsegment, f.year
ORDER BY ci.subsegment, f.year;
