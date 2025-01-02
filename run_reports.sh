#!/bin/bash

# Add Calculated Fields (creates financial_data.csv)

python3 add_calculated_financial_data.py extracted_financial_data.csv financial_data.csv

# Yearly Benchmark Report (creates benchmarks_structured.csv) 

python3 create_benchmark_earnings.py -i financial_data.csv -c CIK.csv -o benchmarks_structured.csv 

# Retail Index Report - Segments (Yearly) (creates segment_analysis_output.csv)

python3 segment_aggregation.py benchmarks_structured.csv segment_analysis_output.csv

# Retail Index Report - Subsegments (Yearly) (creates subsegment_analysis_output.csv) 

python3 subsegment_aggregation.py benchmarks_structured.csv subsegment_analysis_output.csv
