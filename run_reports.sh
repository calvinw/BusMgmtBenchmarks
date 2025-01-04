#!/bin/bash

# Yearly Benchmark Report (creates benchmarks_2024.csv) 

python3 create_benchmarks.py -i financial_data.csv -c CIK.csv -o benchmarks_2024.csv 

# Retail Index Report - Segments (Yearly) (creates segment_analysis_2024.csv)

python3 create_segment_analysis.py benchmarks_2024.csv segment_analysis_2024.csv

# Retail Index Report - Subsegments (Yearly) (creates subsegment_analysis_2024.csv) 

python3 create_subsegment_analysis.py benchmarks_2024.csv subsegment_analysis_2024.csv
