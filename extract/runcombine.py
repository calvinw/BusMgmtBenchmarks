import pandas as pd
import subprocess
import os
from pathlib import Path

def process_companies(csv_file):
    """Process all companies in the CSV file and combine their financial statements."""
    
    # Read the CSV file
    df = pd.read_csv(csv_file)
    
    # Create output directory if it doesn't exist
    output_dir = Path('combined')
    output_dir.mkdir(exist_ok=True)
    
    # Process each company
    for _, row in df.iterrows():
        company = row['company_name']
        
        # Construct filenames
        income_file = f"{company}-target-2020.html"
        balance_file = f"{company}-balance-2020.html"
        output_file = output_dir / f"{company}-2020.html"
        
        # Check if input files exist
        if not os.path.exists(income_file) or not os.path.exists(balance_file):
            print(f"Skipping {company}: Missing input files")
            continue
        
        try:
            # Call the combine script
            cmd = ['python', 'combine.py', income_file, balance_file, str(output_file)]
            subprocess.run(cmd, check=True)
            print(f"Successfully processed {company}")
            
        except subprocess.CalledProcessError as e:
            print(f"Error processing {company}: {e}")
        
        except Exception as e:
            print(f"Unexpected error processing {company}: {e}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Process financial statements for multiple companies')
    parser.add_argument('csv_file', help='CSV file containing company information')
    
    args = parser.parse_args()
    
    process_companies(args.csv_file)
