#!/bin/bash

# 1st arg is CIK json,
# 2nd arg is SEC 10k links data
python3 create_10k_json_data.py CIK-current.json 10ks.json

# 1st arg is SEC 10k data,
# 2nd arg is extracted json data
python3 create_xbrl_extracted_json_data.py 10ks.json extracted_financial_data.json

# 1st arg is extracted json data,
# 2nd arg is full financial json data
python3 add_calculated_financial_data.py extracted_financial_data.json financial_data.json

# 1st arg is full financial json data,
# 2nd arg is name of html file,
# 3rd arg is optional SEC 10k links data
python3 generate_html.py financial_data.json financial_data.html 10ks.json

cp financial_data.html index.html
