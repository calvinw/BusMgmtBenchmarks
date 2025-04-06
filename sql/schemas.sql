dolt_query_catalog @ working
CREATE TABLE `dolt_query_catalog` (
  `id` varchar(1023) NOT NULL,
  `display_order` bigint unsigned NOT NULL,
  `name` varchar(1023),
  `query` varchar(1023),
  `description` varchar(1023),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

dolt_schemas @ working
CREATE TABLE `dolt_schemas` (
  `type` varchar(64) COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(64) COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `fragment` longtext,
  `extra` json,
  `sql_mode` varchar(256) COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`type`,`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

financials @ working
CREATE TABLE `financials` (
  `company_name` varchar(255) NOT NULL,
  `year` int NOT NULL,
  `reportDate` date NOT NULL,
  `Net Revenue` bigint,
  `Cost of Goods` bigint,
  `Gross Margin` bigint DEFAULT NULL,
  `SGA` bigint,
  `Operating Profit` bigint,
  `Net Profit` bigint,
  `Inventory` bigint,
  `Current Assets` bigint,
  `Total Assets` bigint,
  `Current Liabilities` bigint,
  `Liabilities` bigint DEFAULT NULL,
  `Total Shareholder Equity` bigint,
  `Total Liabilities and Shareholder Equity` bigint,
  PRIMARY KEY (`company_name`,`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

new_company_info @ working
CREATE TABLE `new_company_info` (
  `company` varchar(255) NOT NULL,
  `CIK` int,
  `display_name` varchar(255) NOT NULL,
  `ticker_symbol` varchar(10) NOT NULL,
  `segment` varchar(255),
  `subsegment` varchar(255),
  `currency` varchar(10),
  `units` varchar(50),
  PRIMARY KEY (`company`),
  CONSTRAINT `fk_company` FOREIGN KEY (`company`) REFERENCES `new_financial_metrics` (`company_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

new_financial_metrics @ working
CREATE TABLE `new_financial_metrics` (
  `company_name` varchar(255) NOT NULL,
  `year` int NOT NULL,
  `Cost_of_Goods_Percentage` decimal(10,2),
  `SGA_Percentage` decimal(10,2),
  `Gross_Margin_Percentage` decimal(10,2),
  `Operating_Profit_Margin_Percentage` decimal(10,2),
  `Net_Profit_Margin_Percentage` decimal(10,2),
  `Inventory_Turnover` decimal(10,2),
  `Asset_Turnover` decimal(10,2),
  `Return_on_Assets` decimal(10,2),
  `Three_Year_Revenue_CAGR` decimal(10,4),
  `Current_Ratio` decimal(10,2),
  `Quick_Ratio` decimal(10,2),
  `Sales_Current_Year_vs_LY` decimal(10,2),
  `Debt_to_Equity` decimal(10,2),
  PRIMARY KEY (`company_name`,`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

segment_metrics @ working
CREATE TABLE `segment_metrics` (
  `segment` varchar(255) NOT NULL,
  `year` int NOT NULL DEFAULT '2024',
  `Cost_of_Goods_Percentage` decimal(10,2),
  `SGA_Percentage` decimal(10,2),
  `Gross_Margin_Percentage` decimal(10,2),
  `Operating_Profit_Margin_Percentage` decimal(10,2),
  `Net_Profit_Margin_Percentage` decimal(10,2),
  `Inventory_Turnover` decimal(10,2),
  `Asset_Turnover` decimal(10,2),
  `Return_on_Assets` decimal(10,2),
  `Three_Year_Revenue_CAGR` decimal(10,2),
  `Current_Ratio` decimal(10,2),
  `Quick_Ratio` decimal(10,2),
  `Sales_Current_Year_vs_LY` decimal(10,2),
  `Debt_to_Equity` decimal(10,2),
  PRIMARY KEY (`segment`,`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

subsegment_metrics @ working
CREATE TABLE `subsegment_metrics` (
  `subsegment` varchar(255) NOT NULL,
  `year` int NOT NULL DEFAULT '2024',
  `Cost_of_Goods_Percentage` decimal(10,2),
  `SGA_Percentage` decimal(10,2),
  `Gross_Margin_Percentage` decimal(10,2),
  `Operating_Profit_Margin_Percentage` decimal(10,2),
  `Net_Profit_Margin_Percentage` decimal(10,2),
  `Inventory_Turnover` decimal(10,2),
  `Asset_Turnover` decimal(10,2),
  `Return_on_Assets` decimal(10,2),
  `Three_Year_Revenue_CAGR` decimal(10,2),
  `Current_Ratio` decimal(10,2),
  `Quick_Ratio` decimal(10,2),
  `Sales_Current_Year_vs_LY` decimal(10,2),
  `Debt_to_Equity` decimal(10,2),
  PRIMARY KEY (`subsegment`,`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

