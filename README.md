# Business Management Benchmarks (BusMgmtBenchmarks)

This project is for collecting retail data and analyzing it for a number of
companies and segments. In particular the goal is to allow companies to be
compared side-by-side with each other for common financial metrics as well as
to allow companies to be aggregated and compared to an aggregate segment to
which they belong.

The goal is to provide an easy to use set of data and some simple web
applications displaying that data for use in educational settings.  

Data is collected and updated yearly (once a year) and benchmark results files
(as downloadable csv data files) are created each year that summarize how
companies are doing for the year as well as how segments (aggregated company
data) are doing.

### Segments and Subsegments

#### US Companies with 10-K data

The segment choices for our purposes are shown below but these could be
customized by anyone wishing to make the effort of redoing the data collection
process with a different set of company and segment choices. 

Currently companies belong to one category only.

- **Discount** 
    - Walmart, Target, Dollar General, Dollar Tree, Five Below
- **Warehouse Clubs** 
    - Costco, BJs
- **Off Price**
    - TJ Maxx, Ross, Burlington
- **Department Stores** 
    - Macys, Nordstrom, Dillards, Kohls
- **Online**
    - Amazon, Wayfair, Chewy
- **Grocery** 
    - Kroger, Albertsons
- **Health and Pharmacy**
    - Walgreens, CVS, Rite Aid
- **Home Improvement** 
    - Home Depot, Lowes, Tractor Supply
- **Specialty**
    - *Beauty* 
        - Ulta Beauty, BBB (Bed, Bath and Beyond)
    - *Accessories and Shoes* 
        - Signet, Jewelers, Tapestry, Capri Holdings, Boot Barn, Footlocker, Nike
    - *Category Killer*  
        - Dick's, Academy Sports, Best Buy
    - *Apparel*
        - A&F (Abercrombie & Fitch), American Eagle, Urban Outfitters, Gap, LuLuLemon, Levi, Victorias Secret
    - *Home* 
        - Yeti, Sherwin Williams, RH, William Sonoma

#### Additional Companies without 10-Ks
    
- Ahold Delhaize (Grocery)
- ASOS (Online) 
- Inditex (Zara EUR)
- H&M (SEK)
- Aritzia (CAD)
- LVMH
- Addidas (EUROS)

### Important Topics and Files 

#### `CIK.csv`

This is a csv file that contains the names of the companies we use and the CIK
identifiers for the companies. The CIK is a unique official identifier that
comes from the SEC and under which it files 10-Ks and other financial reports.
You can look these up at the SEC website.

Also included are choices for segments and (optional) subsegments designations
for each company. Currently only the Specialty segment has subsegments. 

#### Extracted Financial Data (`extracted_financial_data.csv`) 

This is the complete raw list of extracted financial data. Each line in the
data is the following data for a `company_name` and a particular `year`. (2019
to 2024 currently)

- Net Revenue
- Cost of Goods
- SG&A
- Operating Profit
- Net Profit
- Inventory
- Current Assets
- Total Assets
- Current Liabilities
- Total Shareholder Equity
- Total Liabilities and Shareholder Equity

Data is collected from company 10-K reports to create this file. The process is
described in the extract folders readme called `extract/README.md`

#### Financial Data (`financial_data.csv`) 

This file (created by a python script as described below) adds  the following
calculated fields to the extracted data above. Same as the extracted data this
file contains lines which each represent the above collected metrics together
with the following calculated fields. Each line represents the data for a
particular company and year.

- Gross Margin
- Liabilities
- Cost of Goods Percentage
- Gross Margin Percentage
- SG&A Expense Percentage
- Operating Profit Margin Percentage
- Net Profit Margin Percentage
- Inventory Turnover
- Asset Turnover
- Return on Assets Percentage
- Current Ratio
- Quick Ratio
- Debt to Equity Ratio
- 3-Year CAGR

## Webpages for Display of Retail data

There are two main data displays for the current 

### Side By Side Company 

This web page shows the data for two companies side by side. You can pick two companies and the year to display side by side:

[Company Side By Side Analysis](https://calvinw.github.io/BusMgmtBenchmarks/company-side-by-side-analysis.html)

### Side By Side Company and Segment

This web page shows the data for companies against the segment or subsegment they belong to. The purpose of this page is to compare a company to a segment to see how it is doing: 

[Company vs Segment Analysis](https://calvinw.github.io/BusMgmtBenchmarks/category-preformance.html)

### SEC Filings Display

[ Need Details for this ]

## Downloadable Files

There are a number of downloadable data files created each year

[ Need Details for this ]

## Steps for Data Collection and Benchmark Creation

### Collect Data from Companies (Primarily 10Ks for years 2019-2024) 

This is where the file `extracted_financial_data.csv` is created. See the
folder `extract` for details of this process. The details of the reports are
from SEC provided info, and some python scripts collate the data and use large
language model calls to assist in identifying the approprate fields from the
10-K data.

### Add Calculated Fields

Next the script `add_calculated_fields.py`, adds the ratios, CAGR, and all the
calculated fields.

>python3 add_calculated_financial_data.py extracted_financial_data.csv financial_data.csv

The output of this is the `financial_data.csv`

### Yearly Benchmark Report  

To create the yearly benchmark file pass in the `financial_data.csv` and the `CIK.csv` files
to the `create_benchmarks_earnings.py` script.

>python3 create_benchmark_earnings.py -i financial_data.csv -c CIK.csv -o benchmarks_structured.csv 

This creates the `benchmarks_structured.csv` file.

### Retail Index Report - Segments (Yearly)

To create the retial index report for the segments, run this:

>python3 segment_aggregation.py benchmarks_structured.csv segment_analysis_output.csv

This creates the `segment_analysis_output.csv` file.

### Retail Index Report - Subsegments (Yearly) 

To create the retail index report for the subsegments, run this:

>python3 subsegment_aggregation.py benchmarks_structured.csv segment_analysis_output.csv

This creates the `subsegment_analysis_output.csv` file.


