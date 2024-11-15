import pandas as pd
import numpy as np
import argparse
import sys

def parse_arguments():
    parser = argparse.ArgumentParser(description='Process retail benchmarks data and create subsegment analysis.')
    parser.add_argument('input_file', 
                      help='Input CSV file containing benchmark data')
    parser.add_argument('output_file', 
                      help='Output CSV file for subsegment analysis results')
    parser.add_argument('--debug', action='store_true',
                      help='Print detailed calculations for verification')
    args = parser.parse_args()
    return args

def print_subsegment_calcs(df, subsegment):
    """Print detailed calculations for a subsegment for verification"""
    subsegment_data = df[df['subsegment'] == subsegment]
    
    print(f"\nDetailed calculations for {subsegment} subsegment:")
    print("Raw Totals:")
    print(f"Total Net Revenue: ${subsegment_data['Net Revenue'].sum():,.1f}M")
    print(f"Total SG&A: ${subsegment_data['SG&A'].sum():,.1f}M")
    print(f"SG&A Percentage: {(subsegment_data['SG&A'].sum() / subsegment_data['Net Revenue'].sum() * 100):.1f}%")
    
    print("\nCompanies in subsegment:")
    for _, row in subsegment_data.iterrows():
        print(f"{row['company_name']}:")
        print(f"  Revenue: ${row['Net Revenue']:,.1f}M")
        print(f"  SG&A: ${row['SG&A']:,.1f}M")

def calculate_subsegment_metrics(df, debug=False):
    # Create a copy to avoid modifying the original dataframe
    df = df.copy()
    
    # Filter out rows where subsegment is null or empty
    df = df[df['subsegment'].notna() & (df['subsegment'] != '')]
    
    # First calculate subsegment totals
    subsegment_sums = df.groupby('subsegment').agg({
        'Net Revenue': 'sum',
        'Net Revenue 2023': 'sum',
        'Net Revenue 2022': 'sum',
        'Net Revenue 2021': 'sum',
        'Cost of Goods': 'sum',
        'SG&A': 'sum',
        'Operating Profit': 'sum',
        'Net Profit': 'sum',
        'Current Assets': 'sum',
        'Current Liabilities': 'sum',
        'Total Assets': 'sum',
        'Inventory': 'sum'
    })
    
    if debug:
        # Print calculations for verification
        for subsegment in df['subsegment'].unique():
            print_subsegment_calcs(df, subsegment)
    
    # Initialize results DataFrame
    subsegment_metrics = pd.DataFrame(index=subsegment_sums.index)
    
    # Calculate metrics
    subsegment_metrics['Sales Var vs LY'] = ((subsegment_sums['Net Revenue'] - subsegment_sums['Net Revenue 2023']) / 
                                           subsegment_sums['Net Revenue 2023'] * 100)
    
    subsegment_metrics['3 Year Sales Growth CAGR'] = (
        (((subsegment_sums['Net Revenue'] / subsegment_sums['Net Revenue 2021']) ** (1/3)) - 1) * 100
    )
    
    subsegment_metrics['Annual Sales Var vs 2019'] = ((subsegment_sums['Net Revenue'] - subsegment_sums['Net Revenue 2021']) / 
                                                    subsegment_sums['Net Revenue 2021'] * 100)
    
    subsegment_metrics['Gross Margin  %'] = ((subsegment_sums['Net Revenue'] - subsegment_sums['Cost of Goods']) / 
                                           subsegment_sums['Net Revenue'] * 100)
    
    subsegment_metrics['SG&A  %'] = (subsegment_sums['SG&A'] / subsegment_sums['Net Revenue'] * 100)
    
    subsegment_metrics['Net Profit %'] = (subsegment_sums['Net Profit'] / subsegment_sums['Net Revenue'] * 100)
    
    subsegment_metrics['Inventory Turn'] = (subsegment_sums['Cost of Goods'] / subsegment_sums['Inventory'])
    
    subsegment_metrics['Current Ratio'] = (subsegment_sums['Current Assets'] / subsegment_sums['Current Liabilities'])
    
    subsegment_metrics['ROA'] = (subsegment_sums['Net Profit'] / subsegment_sums['Total Assets'] * 100)
    
    # For Debt to Equity, we need individual company calculations first
    subsegment_metrics['Total Debt to Equity Ratio'] = df.groupby('subsegment')['Debt to Equity Ratio'].mean()
    
    # Round all numeric values
    subsegment_metrics = subsegment_metrics.round(1)
    
    # Convert percentage columns to string format with % symbol
    percent_columns = [
        'Sales Var vs LY',
        '3 Year Sales Growth CAGR',
        'Annual Sales Var vs 2019',
        'Gross Margin  %',
        'SG&A  %',
        'Net Profit %',
        'ROA'
    ]
    
    for col in percent_columns:
        subsegment_metrics[col] = subsegment_metrics[col].astype(str) + '%'
    
    return subsegment_metrics

def main():
    try:
        args = parse_arguments()
        
        print(f"Reading data from: {args.input_file}")
        df = pd.read_csv(args.input_file)
        
        # Calculate metrics with debug option if specified
        subsegment_metrics = calculate_subsegment_metrics(df, args.debug)
        
        print(f"\nSaving analysis to: {args.output_file}")
        subsegment_metrics.to_csv(args.output_file)
        
        print("\nSubsegment Metrics Summary:")
        print(subsegment_metrics)
        
        print("\nAnalysis completed successfully!")
        
    except FileNotFoundError as e:
        print(f"Error: Could not find the input file. {str(e)}")
        sys.exit(1)
    except pd.errors.EmptyDataError:
        print("Error: The input file is empty.")
        sys.exit(1)
    except Exception as e:
        print(f"Error: An unexpected error occurred: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
