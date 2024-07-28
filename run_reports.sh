#!/bin/bash

python3 create_10k_urls.py
python3 parse_xbrl.py
python3 generate_html.py
