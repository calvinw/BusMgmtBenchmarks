-- Drop existing segment and company views
DROP VIEW IF EXISTS `segment and company benchmarks 2024`;
DROP VIEW IF EXISTS `segment and company benchmarks 2023`;
DROP VIEW IF EXISTS `segment and company benchmarks 2022`;
DROP VIEW IF EXISTS `segment and company benchmarks 2021`;
DROP VIEW IF EXISTS `segment and company benchmarks 2020`;
DROP VIEW IF EXISTS `segment and company benchmarks 2019`;
DROP VIEW IF EXISTS `segment and company benchmarks 2018`;

-- Create combined segment and company benchmark views for each year with 1 decimal place
CREATE VIEW `segment and company benchmarks 2018` AS 
SELECT 
    CASE 
        WHEN type = 'Segment' THEN name 
        ELSE '' 
    END AS segment,
    CASE 
        WHEN type = 'Company' THEN name 
        ELSE '' 
    END AS company,
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
FROM (
    SELECT 
        sm.segment AS name,
        sm.Cost_of_Goods_Percentage,
        sm.SGA_Percentage,
        sm.Gross_Margin_Percentage,
        sm.Operating_Profit_Margin_Percentage,
        sm.Net_Profit_Margin_Percentage,
        sm.Inventory_Turnover,
        sm.Asset_Turnover,
        sm.Return_on_Assets,
        sm.Three_Year_Revenue_CAGR,
        sm.Current_Ratio,
        sm.Quick_Ratio,
        sm.Sales_Current_Year_vs_LY,
        sm.Debt_to_Equity,
        'Segment' AS type,
        sm.segment AS segment_name
    FROM 
        segment_metrics sm
    WHERE 
        sm.year = 2018

    UNION ALL

    SELECT 
        ci.display_name AS name,
        nfm.Cost_of_Goods_Percentage,
        nfm.SGA_Percentage,
        nfm.Gross_Margin_Percentage,
        nfm.Operating_Profit_Margin_Percentage,
        nfm.Net_Profit_Margin_Percentage,
        nfm.Inventory_Turnover,
        nfm.Asset_Turnover,
        nfm.Return_on_Assets,
        nfm.Three_Year_Revenue_CAGR,
        nfm.Current_Ratio,
        nfm.Quick_Ratio,
        nfm.Sales_Current_Year_vs_LY,
        nfm.Debt_to_Equity,
        'Company' AS type,
        ci.segment AS segment_name
    FROM 
        new_financial_metrics nfm
    JOIN 
        new_company_info ci ON nfm.company_name = ci.company
    WHERE 
        nfm.year = 2018
) AS combined_data
ORDER BY 
    segment_name, type DESC, name;

CREATE VIEW `segment and company benchmarks 2019` AS 
SELECT 
    CASE 
        WHEN type = 'Segment' THEN name 
        ELSE '' 
    END AS segment,
    CASE 
        WHEN type = 'Company' THEN name 
        ELSE '' 
    END AS company,
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
FROM (
    SELECT 
        sm.segment AS name,
        sm.Cost_of_Goods_Percentage,
        sm.SGA_Percentage,
        sm.Gross_Margin_Percentage,
        sm.Operating_Profit_Margin_Percentage,
        sm.Net_Profit_Margin_Percentage,
        sm.Inventory_Turnover,
        sm.Asset_Turnover,
        sm.Return_on_Assets,
        sm.Three_Year_Revenue_CAGR,
        sm.Current_Ratio,
        sm.Quick_Ratio,
        sm.Sales_Current_Year_vs_LY,
        sm.Debt_to_Equity,
        'Segment' AS type,
        sm.segment AS segment_name
    FROM 
        segment_metrics sm
    WHERE 
        sm.year = 2019

    UNION ALL

    SELECT 
        ci.display_name AS name,
        nfm.Cost_of_Goods_Percentage,
        nfm.SGA_Percentage,
        nfm.Gross_Margin_Percentage,
        nfm.Operating_Profit_Margin_Percentage,
        nfm.Net_Profit_Margin_Percentage,
        nfm.Inventory_Turnover,
        nfm.Asset_Turnover,
        nfm.Return_on_Assets,
        nfm.Three_Year_Revenue_CAGR,
        nfm.Current_Ratio,
        nfm.Quick_Ratio,
        nfm.Sales_Current_Year_vs_LY,
        nfm.Debt_to_Equity,
        'Company' AS type,
        ci.segment AS segment_name
    FROM 
        new_financial_metrics nfm
    JOIN 
        new_company_info ci ON nfm.company_name = ci.company
    WHERE 
        nfm.year = 2019
) AS combined_data
ORDER BY 
    segment_name, type DESC, name;

CREATE VIEW `segment and company benchmarks 2020` AS 
SELECT 
    CASE 
        WHEN type = 'Segment' THEN name 
        ELSE '' 
    END AS segment,
    CASE 
        WHEN type = 'Company' THEN name 
        ELSE '' 
    END AS company,
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
FROM (
    SELECT 
        sm.segment AS name,
        sm.Cost_of_Goods_Percentage,
        sm.SGA_Percentage,
        sm.Gross_Margin_Percentage,
        sm.Operating_Profit_Margin_Percentage,
        sm.Net_Profit_Margin_Percentage,
        sm.Inventory_Turnover,
        sm.Asset_Turnover,
        sm.Return_on_Assets,
        sm.Three_Year_Revenue_CAGR,
        sm.Current_Ratio,
        sm.Quick_Ratio,
        sm.Sales_Current_Year_vs_LY,
        sm.Debt_to_Equity,
        'Segment' AS type,
        sm.segment AS segment_name
    FROM 
        segment_metrics sm
    WHERE 
        sm.year = 2020

    UNION ALL

    SELECT 
        ci.display_name AS name,
        nfm.Cost_of_Goods_Percentage,
        nfm.SGA_Percentage,
        nfm.Gross_Margin_Percentage,
        nfm.Operating_Profit_Margin_Percentage,
        nfm.Net_Profit_Margin_Percentage,
        nfm.Inventory_Turnover,
        nfm.Asset_Turnover,
        nfm.Return_on_Assets,
        nfm.Three_Year_Revenue_CAGR,
        nfm.Current_Ratio,
        nfm.Quick_Ratio,
        nfm.Sales_Current_Year_vs_LY,
        nfm.Debt_to_Equity,
        'Company' AS type,
        ci.segment AS segment_name
    FROM 
        new_financial_metrics nfm
    JOIN 
        new_company_info ci ON nfm.company_name = ci.company
    WHERE 
        nfm.year = 2020
) AS combined_data
ORDER BY 
    segment_name, type DESC, name;

CREATE VIEW `segment and company benchmarks 2021` AS 
SELECT 
    CASE 
        WHEN type = 'Segment' THEN name 
        ELSE '' 
    END AS segment,
    CASE 
        WHEN type = 'Company' THEN name 
        ELSE '' 
    END AS company,
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
FROM (
    SELECT 
        sm.segment AS name,
        sm.Cost_of_Goods_Percentage,
        sm.SGA_Percentage,
        sm.Gross_Margin_Percentage,
        sm.Operating_Profit_Margin_Percentage,
        sm.Net_Profit_Margin_Percentage,
        sm.Inventory_Turnover,
        sm.Asset_Turnover,
        sm.Return_on_Assets,
        sm.Three_Year_Revenue_CAGR,
        sm.Current_Ratio,
        sm.Quick_Ratio,
        sm.Sales_Current_Year_vs_LY,
        sm.Debt_to_Equity,
        'Segment' AS type,
        sm.segment AS segment_name
    FROM 
        segment_metrics sm
    WHERE 
        sm.year = 2021

    UNION ALL

    SELECT 
        ci.display_name AS name,
        nfm.Cost_of_Goods_Percentage,
        nfm.SGA_Percentage,
        nfm.Gross_Margin_Percentage,
        nfm.Operating_Profit_Margin_Percentage,
        nfm.Net_Profit_Margin_Percentage,
        nfm.Inventory_Turnover,
        nfm.Asset_Turnover,
        nfm.Return_on_Assets,
        nfm.Three_Year_Revenue_CAGR,
        nfm.Current_Ratio,
        nfm.Quick_Ratio,
        nfm.Sales_Current_Year_vs_LY,
        nfm.Debt_to_Equity,
        'Company' AS type,
        ci.segment AS segment_name
    FROM 
        new_financial_metrics nfm
    JOIN 
        new_company_info ci ON nfm.company_name = ci.company
    WHERE 
        nfm.year = 2021
) AS combined_data
ORDER BY 
    segment_name, type DESC, name;

CREATE VIEW `segment and company benchmarks 2022` AS 
SELECT 
    CASE 
        WHEN type = 'Segment' THEN name 
        ELSE '' 
    END AS segment,
    CASE 
        WHEN type = 'Company' THEN name 
        ELSE '' 
    END AS company,
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
FROM (
    SELECT 
        sm.segment AS name,
        sm.Cost_of_Goods_Percentage,
        sm.SGA_Percentage,
        sm.Gross_Margin_Percentage,
        sm.Operating_Profit_Margin_Percentage,
        sm.Net_Profit_Margin_Percentage,
        sm.Inventory_Turnover,
        sm.Asset_Turnover,
        sm.Return_on_Assets,
        sm.Three_Year_Revenue_CAGR,
        sm.Current_Ratio,
        sm.Quick_Ratio,
        sm.Sales_Current_Year_vs_LY,
        sm.Debt_to_Equity,
        'Segment' AS type,
        sm.segment AS segment_name
    FROM 
        segment_metrics sm
    WHERE 
        sm.year = 2022

    UNION ALL

    SELECT 
        ci.display_name AS name,
        nfm.Cost_of_Goods_Percentage,
        nfm.SGA_Percentage,
        nfm.Gross_Margin_Percentage,
        nfm.Operating_Profit_Margin_Percentage,
        nfm.Net_Profit_Margin_Percentage,
        nfm.Inventory_Turnover,
        nfm.Asset_Turnover,
        nfm.Return_on_Assets,
        nfm.Three_Year_Revenue_CAGR,
        nfm.Current_Ratio,
        nfm.Quick_Ratio,
        nfm.Sales_Current_Year_vs_LY,
        nfm.Debt_to_Equity,
        'Company' AS type,
        ci.segment AS segment_name
    FROM 
        new_financial_metrics nfm
    JOIN 
        new_company_info ci ON nfm.company_name = ci.company
    WHERE 
        nfm.year = 2022
) AS combined_data
ORDER BY 
    segment_name, type DESC, name;

-- Create segment and company benchmark view for 2023 with 1 decimal place formatting
CREATE VIEW `segment and company benchmarks 2023` AS 
SELECT 
    CASE 
        WHEN type = 'Segment' THEN name 
        ELSE '' 
    END AS segment,
    CASE 
        WHEN type = 'Company' THEN name 
        ELSE '' 
    END AS company,
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
FROM (
    SELECT 
        sm.segment AS name,
        sm.Cost_of_Goods_Percentage,
        sm.SGA_Percentage,
        sm.Gross_Margin_Percentage,
        sm.Operating_Profit_Margin_Percentage,
        sm.Net_Profit_Margin_Percentage,
        sm.Inventory_Turnover,
        sm.Asset_Turnover,
        sm.Return_on_Assets,
        sm.Three_Year_Revenue_CAGR,
        sm.Current_Ratio,
        sm.Quick_Ratio,
        sm.Sales_Current_Year_vs_LY,
        sm.Debt_to_Equity,
        'Segment' AS type,
        sm.segment AS segment_name
    FROM 
        segment_metrics sm
    WHERE 
        sm.year = 2023

    UNION ALL

    SELECT 
        ci.display_name AS name,
        nfm.Cost_of_Goods_Percentage,
        nfm.SGA_Percentage,
        nfm.Gross_Margin_Percentage,
        nfm.Operating_Profit_Margin_Percentage,
        nfm.Net_Profit_Margin_Percentage,
        nfm.Inventory_Turnover,
        nfm.Asset_Turnover,
        nfm.Return_on_Assets,
        nfm.Three_Year_Revenue_CAGR,
        nfm.Current_Ratio,
        nfm.Quick_Ratio,
        nfm.Sales_Current_Year_vs_LY,
        nfm.Debt_to_Equity,
        'Company' AS type,
        ci.segment AS segment_name
    FROM 
        new_financial_metrics nfm
    JOIN 
        new_company_info ci ON nfm.company_name = ci.company
    WHERE 
        nfm.year = 2023
) AS combined_data
ORDER BY 
    segment_name, type DESC, name;

-- Create segment and company benchmark view for 2024 with 1 decimal place formatting
CREATE VIEW `segment and company benchmarks 2024` AS 
SELECT 
    CASE 
        WHEN type = 'Segment' THEN name 
        ELSE '' 
    END AS segment,
    CASE 
        WHEN type = 'Company' THEN name 
        ELSE '' 
    END AS company,
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
FROM (
    SELECT 
        sm.segment AS name,
        sm.Cost_of_Goods_Percentage,
        sm.SGA_Percentage,
        sm.Gross_Margin_Percentage,
        sm.Operating_Profit_Margin_Percentage,
        sm.Net_Profit_Margin_Percentage,
        sm.Inventory_Turnover,
        sm.Asset_Turnover,
        sm.Return_on_Assets,
        sm.Three_Year_Revenue_CAGR,
        sm.Current_Ratio,
        sm.Quick_Ratio,
        sm.Sales_Current_Year_vs_LY,
        sm.Debt_to_Equity,
        'Segment' AS type,
        sm.segment AS segment_name
    FROM 
        segment_metrics sm
    WHERE 
        sm.year = 2024

    UNION ALL

    SELECT 
        ci.display_name AS name,
        nfm.Cost_of_Goods_Percentage,
        nfm.SGA_Percentage,
        nfm.Gross_Margin_Percentage,
        nfm.Operating_Profit_Margin_Percentage,
        nfm.Net_Profit_Margin_Percentage,
        nfm.Inventory_Turnover,
        nfm.Asset_Turnover,
        nfm.Return_on_Assets,
        nfm.Three_Year_Revenue_CAGR,
        nfm.Current_Ratio,
        nfm.Quick_Ratio,
        nfm.Sales_Current_Year_vs_LY,
        nfm.Debt_to_Equity,
        'Company' AS type,
        ci.segment AS segment_name
    FROM 
        new_financial_metrics nfm
    JOIN 
        new_company_info ci ON nfm.company_name = ci.company
    WHERE 
        nfm.year = 2024
) AS combined_data
ORDER BY 
    segment_name, type DESC, name;
