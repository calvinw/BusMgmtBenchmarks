#!/bin/bash

# Output file
output_file="nonamerican_extracted_financial_data.csv"

# Check if the output file already exists and remove it if it does
if [ -f "$output_file" ]; then
    rm "$output_file"
fi

# Loop through all CSV files in the current directory
for file in *.csv; do
    # If it's the first file, copy the header and all data
    if [ ! -f "$output_file" ]; then
        cat "$file" > "$output_file"
    else
        # For subsequent files, skip the header and append the data
        tail -n +2 "$file" >> "$output_file"
    fi
done

echo "CSV files have been concatenated into $output_file"
