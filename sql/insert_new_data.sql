INSERT INTO financials (`company_name`, `year`, `reportDate`, `Net Revenue`, `Cost of Goods`, `Gross Margin`, `SGA`, `Operating Profit`, `Net Profit`, `Inventory`, `Current Assets`, `Total Assets`, `Current Liabilities`, `Liabilities`, `Total Shareholder Equity`, `Total Liabilities and Shareholder Equity`)
VALUES
('BJ''s', 2021, '2021-01-31', 15430017, 12451061, 2978956, 2326755, 652201, 421030, 1205695, 1470581, 5411530, 2031212, 5092203, 319327, 5411530),
('Bath & Body Works', 2024, '2024-01-31', 7429000, 4193000, 3236000, 1951000, 1285000, 878000, 710000, 2115000, 5463000, 1289000, 7090000, -1627000, 5463000),
('CVS', 2020, '2019-12-31', 256776000, 158719000, 98057000, 33541000, 11987000, 6634000, 17516000, 45195000, 222449000, 45762000, 163728000, 58721000, 222449000),
('Signet Jewelers', 2020, '2020-02-01', 6137100, 3904200, 2232900, 1918200, 158300, 105500, 2331700, 3154800, 6299100, 1652600, 5076500, 1222600, 6299100),
('Tractor Supply', 2021, '2020-12-26', 116370, 6858803, -6742433, 2478524, 996928, 748958, 1783270, 3258685, 7049116, 1743798, 5125276, 1923840, 7049116),
('Victoria''s Secret', 2021, '2021-01-31', 5413000, 3842000, 1571000, 1672000, -101000, -72000, 701000, 1239000, 4229000, 1556000, 3338000, 891000, 4229000)
ON DUPLICATE KEY UPDATE
`reportDate` = VALUES(`reportDate`), `Net Revenue` = VALUES(`Net Revenue`), `Cost of Goods` = VALUES(`Cost of Goods`), `Gross Margin` = VALUES(`Gross Margin`), `SGA` = VALUES(`SGA`), `Operating Profit` = VALUES(`Operating Profit`), `Net Profit` = VALUES(`Net Profit`), `Inventory` = VALUES(`Inventory`), `Current Assets` = VALUES(`Current Assets`), `Total Assets` = VALUES(`Total Assets`), `Current Liabilities` = VALUES(`Current Liabilities`), `Liabilities` = VALUES(`Liabilities`), `Total Shareholder Equity` = VALUES(`Total Shareholder Equity`), `Total Liabilities and Shareholder Equity` = VALUES(`Total Liabilities and Shareholder Equity`);
