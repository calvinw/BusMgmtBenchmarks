import subprocess
import csv

# Read company names from CIK.csv
companies = []
with open('CIK.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        companies.append(row['company_name'])

# Process each company
for company in companies:
    command = f"python process_filings.py {company} 2019:2024"
    print(f"Executing: {command}")
    subprocess.run(command, shell=True)
