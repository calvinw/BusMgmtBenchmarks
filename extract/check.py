import pandas as pd
import argparse

def check_missing_data(df):
    # Get all columns except 'company_name' and 'year'
    numeric_cols = [col for col in df.columns if col not in ['company_name', 'year']]
    
    # Find rows with missing numerical data
    missing_data = df[df[numeric_cols].isnull().any(axis=1)]
    
    if not missing_data.empty:
        print("Rows with missing numerical data:")
        for _, row in missing_data.iterrows():
            # Get list of missing columns for this row
            missing_cols = [col for col in numeric_cols if pd.isnull(row[col])]
            print(f"Company: {row['company_name']}, Year: {row['year']}")
            print(f"Missing fields: {', '.join(missing_cols)}")
            print()  # Add blank line between entries
    else:
        print("All rows have complete numerical data.")

def check_numeric_fields(df):
    # Get all columns except 'company_name' and 'year'
    numeric_cols = [col for col in df.columns if col not in ['company_name', 'year']]
    
    all_valid = True
    for col in numeric_cols:
        try:
            # Try to convert column to float
            df[col].astype(float)
        except ValueError as e:
            all_valid = False
            # Find problematic rows
            for idx, val in df[col].items():
                try:
                    float(val)
                except (ValueError, TypeError):
                    print(f"Invalid numeric value in column '{col}':")
                    print(f"Company: {df.loc[idx, 'company_name']}, Year: {df.loc[idx, 'year']}")
                    print(f"Value: {val}")
                    print()

    if all_valid:
        print("All numeric fields are valid floating point numbers.")
    return all_valid

def clean_numeric_values(df):
    # Get all columns except 'company_name' and 'year'
    numeric_cols = [col for col in df.columns if col not in ['company_name', 'year']]
    
    # Replace special minus sign with standard minus
    for col in numeric_cols:
        df[col] = df[col].astype(str).str.replace('−', '-')
    
    return df

def check_file(file_path):
    # Read the CSV file
    df = pd.read_csv(file_path)
    
    # Check for missing data
    check_missing_data(df)
    print("\nChecking numeric field validity...")
    check_numeric_fields(df)

def clean_and_write_file(input_file, output_file):
    # Read the CSV file
    df = pd.read_csv(input_file)
    
    # Clean the data
    df = clean_numeric_values(df)
    
    # Write cleaned data to new file
    df.to_csv(output_file, index=False)
    print(f"Cleaned data written to {output_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Check and clean CSV file.')
    parser.add_argument('file_path', help='Path to the input CSV file')
    parser.add_argument('--output', help='Path to output cleaned CSV file')
    args = parser.parse_args()
    
    # Clean and write if output specified
    if args.output:
        clean_and_write_file(args.file_path, args.output)
    
    # Always run checks
    check_file(args.file_path)
