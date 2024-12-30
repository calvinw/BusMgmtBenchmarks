
Run the script to make the filings json data

>python create_filings_json.py

This reads the ../CIK.csv file and creates a filings info file for each company it finds from 2019-2024. The CIK, name, segment, subsegment (if the company has subsegment) and the filings from each "year". Usually "year" means the "filingDate", not the "reportDate". Filing date is after the "reportDate". So the report from 

walmart 2024 

means the annual 10-k filing from Walmart with "filingDate" of "2024-03-015"

{
  "cik": "104169",
  "name": "Walmart Inc.",
  "segment": "Discount",
  "subsegment": "",
  "filings": [
    {
      "reportDate": "2024-01-31",
      "filingDate": "2024-03-15",
      "form": "10-K",
      "primaryDocument": ....
      "accessionNumber": "0000104169-24-000056",
      "completeSubmissionUrl": ...,
      "xbrlFile": ... 
    },
    ...
  ]
}

Each company gets file like this:
"filings/{company_name}.json"

Example (Filings info for walmart):
"filings/walmart.json"

This is the information for filings from walmart for 2019-2024

Once that is done then something like the below will create the html
pages for the income and the balance sheets, as well as 
run the code that loads these

Example (income and balance sheets html pages):
"html/income-walmart-2019.html"
"html/balance-walmart-2019.html"

```bash
# Hardcoded list of company names
companies=(
    "walmart"
    "target" 
    "dollar_general"
    "dollar_tree"
    "five_below"
    "costco"
    "bjs"
    "tj_maxx"
    "ross"
    "burlington"
    "macys"
    "nordstrom"
    "dillards"
    "kohls"
    "amazon"
    "wayfair"
    "chewy"
    "ulta_beauty"
    "bbb"
    "victorias_secret"
    "signet_jewelers"
    "tapestry"
    "capri_holdings"
    "lululemon"
    "boot_barn"
    "footlocker"
    "nike"
    "af"
    "american_eagle"
    "urban_outfitters"
    "gap"
    "levi"
    "dicks"
    "academy_sports"
    "best_buy"
    "yeti"
    "sherwin_williams"
    "rh"
    "william_sonoma"
    "home_depot"
    "lowes"
    "tractor_supply"
    "kroger"
    "albertsons"
    "walgreens"
    "cvs"
    "rite_aid"
)

# Process each company
for company in "${companies[@]}"; do
    period="2019:2024"
    echo "Executing: python process_filings.py $company $period"
    python process_filings.py "$company" "$period" 
done
```

`process_filings.py` reads all the filing info for the company and
processes each company from 2029 to 2024, creating html pages
for the companys income and balance reports, then passing 
those pages to the LLM to extract the concepts:

Net Revenue
Cost of Goods
SG&A
Operating Profit
Net Profit
Inventory
Current Assets
Total Assets
Current Liabilities
Total Shareholder Equity
Total Liabilities and Shareholder Equity

We call this the "extracted data" and everything else (financial ratios, CAGR, etc comes from this extracted data.

One you have done this for a set of years, each year, you just have to recreate the filings json files, then run this last part with that current year.

