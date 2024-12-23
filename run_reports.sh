#!/bin/bash

echo "Creating 10k csv data..."
python create_10k_csv_data.py CIK.csv 10ks.csv

# 1st arg is SEC 10k links data,
# 2nd arg is extracted csv data
echo "Extracting data from 10k filings..."
python create_xbrl_extracted_csv_data.py 10ks.csv extracted_financial_data.csv

# 1st arg is extracted csv data,
# 2nd arg is full financial csv data
echo "Adding calculated financial data..."
python add_calculated_financial_data.py extracted_financial_data.csv financial_data.csv

# 1st arg is full financial csv data,
# 2nd arg is SEC 10k links data
# 3rd arg is name of html file,
echo "Generating financial data html..."
python generate_html.py financial_data.csv 10ks.csv financial_data.html
cp financial_data.html index.html
