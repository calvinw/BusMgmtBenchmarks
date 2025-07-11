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

There is an sql database (hosted at DoltHub) that accompanies the work here. 

It is located here: 

[BusMgmtBenchmarks at DoltHub](https://www.dolthub.com/repositories/calvinw/BusMgmtBenchmarks)

and has its own github repo here:

[BusMgmtDoltDatabase at GitHub](https://github.com/calvinw/BusMgmtDoltDatabase.git)


It is a publicly accessible database with the data used in the project. There
are various SQL scripts for updating and maintaining the data there as well.

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

#### Company Names, Tickers, Segments, Subsegments

| Company Name | Ticker | CIK | Segment | Subsegment |
|------------|---------|-----|---------|------------|
| Walmart | WMT | 104169 | Discount | |
| Target | TGT | 27419 | Discount | |
| Dollar General | DG | 29534 | Discount | |
| Dollar Tree | DLTR | 935703 | Discount | |
| Five Below | FIVE | 1177609 | Discount | |
| Costco | COST | 909832 | Warehouse Clubs | |
| BJ's | BJ | 1531152 | Warehouse Clubs | |
| TJ Maxx | TJX | 109198 | Off Price | |
| Ross | ROST | 745732 | Off Price | |
| Burlington | BURL | 1579298 | Off Price | |
| Macy's | M | 794367 | Department Store | |
| Nordstrom | JWN | 72333 | Department Store | |
| Dillard's | DDS | 28917 | Department Store | |
| Kohl's | KSS | 885639 | Department Store | |
| Amazon | AMZN | 1018724 | Online | |
| Wayfair | W | 1616707 | Online | |
| Chewy | CHWY | 1766502 | Online | |
| Ulta Beauty | ULTA | 1403568 | Specialty | Beauty |
| Bath & Body Works | BBWI | 886158 | Specialty | Beauty |
| Victoria's Secret | VSCO | 1856437 | Specialty | Apparel |
| Signet Jewelers | SIG | 832988 | Specialty | Accessories and Shoes |
| Tapestry | TPR | 1116132 | Specialty | Accessories and Shoes |
| Capri Holdings | CPRI | 1530721 | Specialty | Accessories and Shoes |
| Lululemon | LULU | 1397187 | Specialty | Apparel |
| Boot Barn | BOOT | 1610250 | Specialty | Accessories and Shoes |
| Foot Locker | FL | 850209 | Specialty | Accessories and Shoes |
| Nike | NKE | 320187 | Specialty | Accessories and Shoes |
| Abercrombie & Fitch | ANF | 1018840 | Specialty | Apparel |
| American Eagle | AEO | 919012 | Specialty | Apparel |
| Urban Outfitters | URBN | 912615 | Specialty | Apparel |
| Gap | GAP | 39911 | Specialty | Apparel |
| Levi Strauss | LEVI | 94845 | Specialty | Apparel |
| Dick's Sporting Goods | DKS | 1089063 | Specialty | Category Killer |
| Academy Sports | ASO | 1817358 | Specialty | Category Killer |
| Best Buy | BBY | 764478 | Specialty | Category Killer |
| YETI | YETI | 1670592 | Specialty | Home |
| Sherwin-Williams | SHW | 89800 | Specialty | Home |
| RH | RH | 1528849 | Specialty | Home |
| Williams-Sonoma | WSM | 719955 | Specialty | Home |
| Home Depot | HD | 354950 | Home Improvement | |
| Lowe's | LOW | 60667 | Home Improvement | |
| Tractor Supply | TSCO | 916365 | Home Improvement | |
| Kroger | KR | 56873 | Grocery | |
| Albertsons | ACI | 1646972 | Grocery | |
| Walgreens | WBA | 1618921 | Health & Pharmacy | |
| CVS | CVS | 64803 | Health & Pharmacy | |
| Rite Aid | RAD | 84129 | Health & Pharmacy | |
| Louis Vuitton | MC.PA | | Specialty | Category Killer |
| Inditex/Zara | ITX.MC | | Specialty | Fast Fashion |
| H&M | HM-B.ST | | Specialty | Fast Fashion |
| Adidas | ADS.DE | | Specialty | Accessories and Shoes |
| Aritzia | ATZ.TO | | Specialty | Apparel |
| Ahold Delhaize | AD.AS | | Grocery | |
| ASOS | ASOMF | | Online | |

Also included are choices for segments and (optional) subsegments designations
for each company. Currently only the Specialty segment has subsegments. 

This is the complete raw list of extracted financial data. Each line in the
data is the following data for a `company_name` and a particular `year`. (2018
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

There are two main web page displays for the data and analyses.

### Side By Side Company 

This web page shows the data for two companies side by side. You can pick two
companies and the year to display side by side:

[Company Side By Side Analysis](https://calvinw.github.io/BusMgmtBenchmarks/company_to_company.html)

### Side By Side Company and Segment

This web page shows the data for companies against the segment or subsegment
they belong to. The purpose of this page is to compare a company to a segment
to see how it is doing: 

[Company vs Segment Analysis](https://calvinw.github.io/BusMgmtBenchmarks/company_to_segment.html)

### SEC Filings Display

At the bottom of the [Company Side By Side
Analysis](https://calvinw.github.io/BusMgmtBenchmarks/company_to_company.html)
page are links to copies of the official SEC webpage for the income and balance
statements for the companies and years indicated. These may be of interest to
see more details about the company or to further check the data. 

Here is an example of those displays:

- [Costco 2024 Income and Balance](https://calvinw.github.io/BusMgmtBenchmarks/extract/html/Costco-2024.html)

- [Target 2022 Income and Balance](https://calvinw.github.io/BusMgmtBenchmarks/extract/html/Target-2022.html)

These webpages are pulled directly from the submitted html pages of the public
10-k filings of the companies with the SEC and are not changed in any way from
that filing. They are just provided here for convenience and further reference. 

## Reports

There are a number of downloadable data files created each year

[Reports](https://calvinw.github.io/BusMgmtBenchmarks/reports.html)

## Visualizations based on database 

It is possible to build visualizations and other webapps by vibe coding
against the Dolt database. 

Here is an example of a webapp that was produced with Sonnet 3.5 in one prompt: 

[Financial Dashbord ](https://calvinw.github.io/BusMgmtBenchmarks/financial-dashboard.html)

We will be building an additional set of these as part of a SUNY IITG award. 

## Data Collection (Extraction) Techniques

The technique for extracting the data for each company is described below: 

[Using a Large Language Model to Identify Financial Concepts from 10K Reports](https://medium.com/@calvin.e.williamson/using-a-large-language-model-to-identify-financial-concepts-from-10k-reports-d551a7fb5554)

