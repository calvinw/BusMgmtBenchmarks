-- Drop all existing views
DROP VIEW IF EXISTS `segment benchmarks 2024`;
DROP VIEW IF EXISTS `segment benchmarks 2023`;
DROP VIEW IF EXISTS `segment benchmarks 2022`;
DROP VIEW IF EXISTS `segment benchmarks 2021`;
DROP VIEW IF EXISTS `segment benchmarks 2020`;
DROP VIEW IF EXISTS `segment benchmarks 2019`;
DROP VIEW IF EXISTS `segment benchmarks 2018`;
DROP VIEW IF EXISTS `subsegment benchmarks 2024`;
DROP VIEW IF EXISTS `subsegment benchmarks 2023`;
DROP VIEW IF EXISTS `subsegment benchmarks 2022`;
DROP VIEW IF EXISTS `subsegment benchmarks 2021`;
DROP VIEW IF EXISTS `subsegment benchmarks 2020`;
DROP VIEW IF EXISTS `subsegment benchmarks 2019`;
DROP VIEW IF EXISTS `subsegment benchmarks 2018`;
DROP VIEW IF EXISTS `segment and company benchmarks 2024`;
DROP VIEW IF EXISTS `segment and company benchmarks 2023`;
DROP VIEW IF EXISTS `segment and company benchmarks 2022`;
DROP VIEW IF EXISTS `segment and company benchmarks 2021`;
DROP VIEW IF EXISTS `segment and company benchmarks 2020`;
DROP VIEW IF EXISTS `segment and company benchmarks 2019`;
DROP VIEW IF EXISTS `segment and company benchmarks 2018`;
DROP VIEW IF EXISTS `benchmarks 2024 view`;
DROP VIEW IF EXISTS `benchmarks 2024 View`;
DROP VIEW IF EXISTS `benchmarks 2023 view`;
DROP VIEW IF EXISTS `benchmarks 2022 view`;
DROP VIEW IF EXISTS `benchmarks 2021 view`;
DROP VIEW IF EXISTS `benchmarks 2020 view`;
DROP VIEW IF EXISTS `benchmarks 2019 view`;
DROP VIEW IF EXISTS `benchmarks 2018 view`;

CREATE VIEW `benchmarks 2018 view` AS 
SELECT 
    subquery.company_name AS company,
    subquery.year AS year,
    subquery.reportDate,
    subquery.segment,
    subquery.subsegment,
    subquery.`Net Revenue`,
    subquery.`Cost of Goods`,
    subquery.`SGA`,
    subquery.`Operating Profit`,
    subquery.`Net Profit`,
    subquery.`Inventory`,
    subquery.`Current Assets`,
    subquery.`Total Assets`,
    subquery.`Current Liabilities`,
    subquery.`Total Shareholder Equity`,
    subquery.`Total Liabilities and Shareholder Equity`,
    fm.`Cost_of_Goods_Percentage` AS `Cost of Goods %`,
    fm.`SGA_Percentage` AS `SGA %`,
    fm.`Gross_Margin_Percentage` AS `Gross Margin %`,
    fm.`Operating_Profit_Margin_Percentage` AS `Operating Profit Margin %`,
    fm.`Net_Profit_Margin_Percentage` AS `Net Profit Margin %`,
    fm.`Inventory_Turnover` AS `Inventory Turnover`,
    fm.`Asset_Turnover` AS `Asset Turnover`,
    fm.`Return_on_Assets` AS `Return on Assets`,
    fm.`Three_Year_Revenue_CAGR` AS `Three Year Revenue CAGR`,
    fm.`Current_Ratio` AS `Current Ratio`,
    fm.`Quick_Ratio` AS `Quick Ratio`,
    fm.`Sales_Current_Year_vs_LY` AS `Sales vs LY`,
    fm.`Debt_to_Equity` AS `Debt to Equity`
FROM (
    SELECT 
        f.*,
        c.segment,
        c.subsegment
    FROM 
        financials f
    JOIN 
        new_company_info c ON f.company_name = c.company
    WHERE 
        f.year = 2018
) AS subquery
JOIN 
    new_financial_metrics fm ON subquery.company_name = fm.company_name AND subquery.year = fm.year;


-- Create detailed benchmark views for each year
CREATE VIEW `benchmarks 2019 view` AS 
SELECT 
    subquery.company_name AS company,
    subquery.year AS year,
    subquery.reportDate,
    subquery.segment,
    subquery.subsegment,
    subquery.`Net Revenue`,
    subquery.`Net Revenue 2018`,
    subquery.`Cost of Goods`,
    subquery.`SGA`,
    subquery.`Operating Profit`,
    subquery.`Net Profit`,
    subquery.`Inventory`,
    subquery.`Current Assets`,
    subquery.`Total Assets`,
    subquery.`Current Liabilities`,
    subquery.`Total Shareholder Equity`,
    subquery.`Total Liabilities and Shareholder Equity`,
    fm.`Cost_of_Goods_Percentage` AS `Cost of Goods %`,
    fm.`SGA_Percentage` AS `SGA %`,
    fm.`Gross_Margin_Percentage` AS `Gross Margin %`,
    fm.`Operating_Profit_Margin_Percentage` AS `Operating Profit Margin %`,
    fm.`Net_Profit_Margin_Percentage` AS `Net Profit Margin %`,
    fm.`Inventory_Turnover` AS `Inventory Turnover`,
    fm.`Asset_Turnover` AS `Asset Turnover`,
    fm.`Return_on_Assets` AS `Return on Assets`,
    fm.`Three_Year_Revenue_CAGR` AS `Three Year Revenue CAGR`,
    fm.`Current_Ratio` AS `Current Ratio`,
    fm.`Quick_Ratio` AS `Quick Ratio`,
    fm.`Sales_Current_Year_vs_LY` AS `Sales vs LY`,
    fm.`Debt_to_Equity` AS `Debt to Equity`
FROM (
    SELECT 
        f.*,
        (SELECT `Net Revenue` FROM financials WHERE company_name = f.company_name AND year = 2018) AS `Net Revenue 2018`,
        c.segment,
        c.subsegment
    FROM 
        financials f
    JOIN 
        new_company_info c ON f.company_name = c.company
    WHERE 
        f.year = 2019
) AS subquery
JOIN 
    new_financial_metrics fm ON subquery.company_name = fm.company_name AND subquery.year = fm.year;

CREATE VIEW `benchmarks 2020 view` AS 
SELECT 
    subquery.company_name AS company,
    subquery.year AS year,
    subquery.reportDate,
    subquery.segment,
    subquery.subsegment,
    subquery.`Net Revenue`,
    subquery.`Net Revenue 2019`,
    subquery.`Net Revenue 2018`,
    subquery.`Cost of Goods`,
    subquery.`SGA`,
    subquery.`Operating Profit`,
    subquery.`Net Profit`,
    subquery.`Inventory`,
    subquery.`Current Assets`,
    subquery.`Total Assets`,
    subquery.`Current Liabilities`,
    subquery.`Total Shareholder Equity`,
    subquery.`Total Liabilities and Shareholder Equity`,
    fm.`Cost_of_Goods_Percentage` AS `Cost of Goods %`,
    fm.`SGA_Percentage` AS `SGA %`,
    fm.`Gross_Margin_Percentage` AS `Gross Margin %`,
    fm.`Operating_Profit_Margin_Percentage` AS `Operating Profit Margin %`,
    fm.`Net_Profit_Margin_Percentage` AS `Net Profit Margin %`,
    fm.`Inventory_Turnover` AS `Inventory Turnover`,
    fm.`Asset_Turnover` AS `Asset Turnover`,
    fm.`Return_on_Assets` AS `Return on Assets`,
    fm.`Three_Year_Revenue_CAGR` AS `Three Year Revenue CAGR`,
    fm.`Current_Ratio` AS `Current Ratio`,
    fm.`Quick_Ratio` AS `Quick Ratio`,
    fm.`Sales_Current_Year_vs_LY` AS `Sales vs LY`,
    fm.`Debt_to_Equity` AS `Debt to Equity`
FROM (
    SELECT 
        f.*,
        (SELECT `Net Revenue` FROM financials WHERE company_name = f.company_name AND year = 2019) AS `Net Revenue 2019`,
        (SELECT `Net Revenue` FROM financials WHERE company_name = f.company_name AND year = 2018) AS `Net Revenue 2018`,
        c.segment,
        c.subsegment
    FROM 
        financials f
    JOIN 
        new_company_info c ON f.company_name = c.company
    WHERE 
        f.year = 2020
) AS subquery
JOIN 
    new_financial_metrics fm ON subquery.company_name = fm.company_name AND subquery.year = fm.year;

CREATE VIEW `benchmarks 2021 view` AS 
SELECT 
    subquery.company_name AS company,
    subquery.year AS year,
    subquery.reportDate,
    subquery.segment,
    subquery.subsegment,
    subquery.`Net Revenue`,
    subquery.`Net Revenue 2020`,
    subquery.`Net Revenue 2019`,
    subquery.`Net Revenue 2018`,
    subquery.`Cost of Goods`,
    subquery.`SGA`,
    subquery.`Operating Profit`,
    subquery.`Net Profit`,
    subquery.`Inventory`,
    subquery.`Current Assets`,
    subquery.`Total Assets`,
    subquery.`Current Liabilities`,
    subquery.`Total Shareholder Equity`,
    subquery.`Total Liabilities and Shareholder Equity`,
    fm.`Cost_of_Goods_Percentage` AS `Cost of Goods %`,
    fm.`SGA_Percentage` AS `SGA %`,
    fm.`Gross_Margin_Percentage` AS `Gross Margin %`,
    fm.`Operating_Profit_Margin_Percentage` AS `Operating Profit Margin %`,
    fm.`Net_Profit_Margin_Percentage` AS `Net Profit Margin %`,
    fm.`Inventory_Turnover` AS `Inventory Turnover`,
    fm.`Asset_Turnover` AS `Asset Turnover`,
    fm.`Return_on_Assets` AS `Return on Assets`,
    fm.`Three_Year_Revenue_CAGR` AS `Three Year Revenue CAGR`,
    fm.`Current_Ratio` AS `Current Ratio`,
    fm.`Quick_Ratio` AS `Quick Ratio`,
    fm.`Sales_Current_Year_vs_LY` AS `Sales vs LY`,
    fm.`Debt_to_Equity` AS `Debt to Equity`
FROM (
    SELECT 
        f.*,
        (SELECT `Net Revenue` FROM financials WHERE company_name = f.company_name AND year = 2020) AS `Net Revenue 2020`,
        (SELECT `Net Revenue` FROM financials WHERE company_name = f.company_name AND year = 2019) AS `Net Revenue 2019`,
        (SELECT `Net Revenue` FROM financials WHERE company_name = f.company_name AND year = 2018) AS `Net Revenue 2018`,
        c.segment,
        c.subsegment
    FROM 
        financials f
    JOIN 
        new_company_info c ON f.company_name = c.company
    WHERE 
        f.year = 2021
) AS subquery
JOIN 
    new_financial_metrics fm ON subquery.company_name = fm.company_name AND subquery.year = fm.year;

CREATE VIEW `benchmarks 2022 view` AS 
SELECT 
    subquery.company_name AS company,
    subquery.year AS year,
    subquery.reportDate,
    subquery.segment,
    subquery.subsegment,
    subquery.`Net Revenue`,
    subquery.`Net Revenue 2021`,
    subquery.`Net Revenue 2020`,
    subquery.`Net Revenue 2019`,
    subquery.`Cost of Goods`,
    subquery.`SGA`,
    subquery.`Operating Profit`,
    subquery.`Net Profit`,
    subquery.`Inventory`,
    subquery.`Current Assets`,
    subquery.`Total Assets`,
    subquery.`Current Liabilities`,
    subquery.`Total Shareholder Equity`,
    subquery.`Total Liabilities and Shareholder Equity`,
    fm.`Cost_of_Goods_Percentage` AS `Cost of Goods %`,
    fm.`SGA_Percentage` AS `SGA %`,
    fm.`Gross_Margin_Percentage` AS `Gross Margin %`,
    fm.`Operating_Profit_Margin_Percentage` AS `Operating Profit Margin %`,
    fm.`Net_Profit_Margin_Percentage` AS `Net Profit Margin %`,
    fm.`Inventory_Turnover` AS `Inventory Turnover`,
    fm.`Asset_Turnover` AS `Asset Turnover`,
    fm.`Return_on_Assets` AS `Return on Assets`,
    fm.`Three_Year_Revenue_CAGR` AS `Three Year Revenue CAGR`,
    fm.`Current_Ratio` AS `Current Ratio`,
    fm.`Quick_Ratio` AS `Quick Ratio`,
    fm.`Sales_Current_Year_vs_LY` AS `Sales vs LY`,
    fm.`Debt_to_Equity` AS `Debt to Equity`
FROM (
    SELECT 
        f.*,
        (SELECT `Net Revenue` FROM financials WHERE company_name = f.company_name AND year = 2021) AS `Net Revenue 2021`,
        (SELECT `Net Revenue` FROM financials WHERE company_name = f.company_name AND year = 2020) AS `Net Revenue 2020`,
        (SELECT `Net Revenue` FROM financials WHERE company_name = f.company_name AND year = 2019) AS `Net Revenue 2019`,
        c.segment,
        c.subsegment
    FROM 
        financials f
    JOIN 
        new_company_info c ON f.company_name = c.company
    WHERE 
        f.year = 2022
) AS subquery
JOIN 
    new_financial_metrics fm ON subquery.company_name = fm.company_name AND subquery.year = fm.year;

CREATE VIEW `benchmarks 2023 view` AS 
SELECT 
    subquery.company_name AS company,
    subquery.year AS year,
    subquery.reportDate,
    subquery.segment,
    subquery.subsegment,
    subquery.`Net Revenue`,
    subquery.`Net Revenue 2022`,
    subquery.`Net Revenue 2021`,
    subquery.`Net Revenue 2020`,
    subquery.`Cost of Goods`,
    subquery.`SGA`,
    subquery.`Operating Profit`,
    subquery.`Net Profit`,
    subquery.`Inventory`,
    subquery.`Current Assets`,
    subquery.`Total Assets`,
    subquery.`Current Liabilities`,
    subquery.`Total Shareholder Equity`,
    subquery.`Total Liabilities and Shareholder Equity`,
    fm.`Cost_of_Goods_Percentage` AS `Cost of Goods %`,
    fm.`SGA_Percentage` AS `SGA %`,
    fm.`Gross_Margin_Percentage` AS `Gross Margin %`,
    fm.`Operating_Profit_Margin_Percentage` AS `Operating Profit Margin %`,
    fm.`Net_Profit_Margin_Percentage` AS `Net Profit Margin %`,
    fm.`Inventory_Turnover` AS `Inventory Turnover`,
    fm.`Asset_Turnover` AS `Asset Turnover`,
    fm.`Return_on_Assets` AS `Return on Assets`,
    fm.`Three_Year_Revenue_CAGR` AS `Three Year Revenue CAGR`,
    fm.`Current_Ratio` AS `Current Ratio`,
    fm.`Quick_Ratio` AS `Quick Ratio`,
    fm.`Sales_Current_Year_vs_LY` AS `Sales vs LY`,
    fm.`Debt_to_Equity` AS `Debt to Equity`
FROM (
    SELECT 
        f.*,
        (SELECT `Net Revenue` FROM financials WHERE company_name = f.company_name AND year = 2022) AS `Net Revenue 2022`,
        (SELECT `Net Revenue` FROM financials WHERE company_name = f.company_name AND year = 2021) AS `Net Revenue 2021`,
        (SELECT `Net Revenue` FROM financials WHERE company_name = f.company_name AND year = 2020) AS `Net Revenue 2020`,
        c.segment,
        c.subsegment
    FROM 
        financials f
    JOIN 
        new_company_info c ON f.company_name = c.company
    WHERE 
        f.year = 2023
) AS subquery
JOIN 
    new_financial_metrics fm ON subquery.company_name = fm.company_name AND subquery.year = fm.year;

CREATE VIEW `benchmarks 2024 view` AS 
SELECT 
    subquery.company_name AS company,
    subquery.year AS year,
    subquery.reportDate,
    subquery.segment,
    subquery.subsegment,
    subquery.`Net Revenue`,
    subquery.`Net Revenue 2023`,
    subquery.`Net Revenue 2022`,
    subquery.`Net Revenue 2021`,
    subquery.`Cost of Goods`,
    subquery.`SGA`,
    subquery.`Operating Profit`,
    subquery.`Net Profit`,
    subquery.`Inventory`,
    subquery.`Current Assets`,
    subquery.`Total Assets`,
    subquery.`Current Liabilities`,
    subquery.`Total Shareholder Equity`,
    subquery.`Total Liabilities and Shareholder Equity`,
    fm.`Cost_of_Goods_Percentage` AS `Cost of Goods %`,
    fm.`SGA_Percentage` AS `SGA %`,
    fm.`Gross_Margin_Percentage` AS `Gross Margin %`,
    fm.`Operating_Profit_Margin_Percentage` AS `Operating Profit Margin %`,
    fm.`Net_Profit_Margin_Percentage` AS `Net Profit Margin %`,
    fm.`Inventory_Turnover` AS `Inventory Turnover`,
    fm.`Asset_Turnover` AS `Asset Turnover`,
    fm.`Return_on_Assets` AS `Return on Assets`,
    fm.`Three_Year_Revenue_CAGR` AS `Three Year Revenue CAGR`,
    fm.`Current_Ratio` AS `Current Ratio`,
    fm.`Quick_Ratio` AS `Quick Ratio`,
    fm.`Sales_Current_Year_vs_LY` AS `Sales vs LY`,
    fm.`Debt_to_Equity` AS `Debt to Equity`
FROM (
    SELECT 
        f2024.*,
        (SELECT `Net Revenue` FROM financials WHERE company_name = f2024.company_name AND year = 2023) AS `Net Revenue 2023`,
        (SELECT `Net Revenue` FROM financials WHERE company_name = f2024.company_name AND year = 2022) AS `Net Revenue 2022`,
        (SELECT `Net Revenue` FROM financials WHERE company_name = f2024.company_name AND year = 2021) AS `Net Revenue 2021`,
        c.segment,
        c.subsegment
    FROM 
        financials f2024
    JOIN 
        new_company_info c ON f2024.company_name = c.company
    WHERE 
        f2024.year = 2024
) AS subquery
JOIN 
    new_financial_metrics fm ON subquery.company_name = fm.company_name AND subquery.year = fm.year;

-- Create segment benchmark views
CREATE VIEW `segment benchmarks 2018` AS 
SELECT * FROM segment_metrics WHERE year = 2018;

CREATE VIEW `segment benchmarks 2019` AS 
SELECT * FROM segment_metrics WHERE year = 2019;

CREATE VIEW `segment benchmarks 2020` AS 
SELECT * FROM segment_metrics WHERE year = 2020;

CREATE VIEW `segment benchmarks 2021` AS 
SELECT * FROM segment_metrics WHERE year = 2021;

CREATE VIEW `segment benchmarks 2022` AS 
SELECT * FROM segment_metrics WHERE year = 2022;

CREATE VIEW `segment benchmarks 2023` AS 
SELECT * FROM segment_metrics WHERE year = 2023;

CREATE VIEW `segment benchmarks 2024` AS 
SELECT * FROM segment_metrics WHERE year = 2024;

-- Create subsegment benchmark views
CREATE VIEW `subsegment benchmarks 2018` AS 
SELECT * FROM subsegment_metrics WHERE year = 2018;

CREATE VIEW `subsegment benchmarks 2019` AS 
SELECT * FROM subsegment_metrics WHERE year = 2019;

CREATE VIEW `subsegment benchmarks 2020` AS 
SELECT * FROM subsegment_metrics WHERE year = 2020;

CREATE VIEW `subsegment benchmarks 2021` AS 
SELECT * FROM subsegment_metrics WHERE year = 2021;

CREATE VIEW `subsegment benchmarks 2022` AS 
SELECT * FROM subsegment_metrics WHERE year = 2022;

CREATE VIEW `subsegment benchmarks 2023` AS 
SELECT * FROM subsegment_metrics WHERE year = 2023;

CREATE VIEW `subsegment benchmarks 2024` AS 
SELECT * FROM subsegment_metrics WHERE year = 2024;

-- Create combined segment and company benchmark views for each year

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
