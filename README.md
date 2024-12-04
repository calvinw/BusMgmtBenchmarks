# BusMgmtBenchmarks

The scripts and content here create financial data for companies for the last few years.   

The CIK file contains the companies you want to create financial data for. 

For each company in the CIK.csv file, specify 

- companys CIK (from the SEC)
- segment 
- subsegment (if possible) 

Make sure that CIK.csv has the companies and CIKs you want to use.

Run run_scripts.sh, it is a bash file.

Check there for what is happening.

# 1st arg is CIK numbers and companies
# 2nd arg is SEC 10k links data
python3 create_10k_csv_data.py CIK.csv 10ks.csv

# 1st arg is SEC 10k links data,
# 2nd arg is extracted csv data
python3 create_xbrl_extracted_csv_data.py 10ks.csv extracted_financial_data.csv

# 1st arg is extracted csv data,
# 2nd arg is full financial csv data
python3 add_calculated_financial_data.py extracted_financial_data.csv financial_data.csv

# 1st arg is full financial csv data,
# 2nd arg is SEC 10k links data
# 3rd arg is name of html file,
python3 generate_html.py financial_data.csv 10ks.csv financial_data.html
cp financial_data.html index.html

