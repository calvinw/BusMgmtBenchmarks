import pandas as pd
import numpy as np
import argparse
import sys

def parse_arguments():
    parser = argparse.ArgumentParser(description='Process retail benchmarks data and create segment analysis.')
    parser.add_argument('input_file', 
                      help='Input CSV file containing benchmark data')
    parser.add_argument('output_file', 
                      help='Output CSV file for segment analysis results')
    parser.add_argument('--debug', action='store_true',
                      help='Print detailed calculations for verification')
    args = parser.parse_args()
    return args

def print_segment_calcs(df, segment):
    """Print detailed calculations for a segment for verification"""
    segment_data = df[df['segment'] == segment]
    
    print(f"\nDetailed calculations for {segment} segment:")
    print("Raw Totals:")
    print(f"Total Net Revenue: ${segment_data['Net Revenue'].sum():,.1f}M")
    print(f"Total SG&A: ${segment_data['SG&A'].sum():,.1f}M")
    print(f"SG&A Percentage: {(segment_data['SG&A'].sum() / segment_data['Net Revenue'].sum() * 100):.1f}%")
    
    print("\nCompanies in segment:")
    for _, row in segment_data.iterrows():
        print(f"{row['company_name']}:")
        print(f"  Revenue: ${row['Net Revenue']:,.1f}M")
        print(f"  SG&A: ${row['SG&A']:,.1f}M")

def calculate_segment_metrics(df, debug=False):
    # Create a copy to avoid modifying the original dataframe
    df = df.copy()
    
    # First calculate segment totals
    segment_sums = df.groupby('segment').agg({
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
        for segment in df['segment'].unique():
            print_segment_calcs(df, segment)
    
    # Initialize results DataFrame
    segment_metrics = pd.DataFrame(index=segment_sums.index)
    
    # Calculate metrics
    segment_metrics['Sales Var vs LY'] = ((segment_sums['Net Revenue'] - segment_sums['Net Revenue 2023']) / 
                                        segment_sums['Net Revenue 2023'] * 100)
    
    # For 3-year CAGR, calculate at segment level using 3-year data
    segment_metrics['3 Year Sales Growth CAGR'] = (
        (((segment_sums['Net Revenue'] / segment_sums['Net Revenue 2021']) ** (1/3)) - 1) * 100
    )
    
    segment_metrics['Annual Sales Var vs 2019'] = ((segment_sums['Net Revenue'] - segment_sums['Net Revenue 2021']) / 
                                                 segment_sums['Net Revenue 2021'] * 100)
    
    segment_metrics['Gross Margin  %'] = ((segment_sums['Net Revenue'] - segment_sums['Cost of Goods']) / 
                                        segment_sums['Net Revenue'] * 100)
    
    segment_metrics['SG&A  %'] = (segment_sums['SG&A'] / segment_sums['Net Revenue'] * 100)
    
    segment_metrics['Net Profit %'] = (segment_sums['Net Profit'] / segment_sums['Net Revenue'] * 100)
    
    segment_metrics['Inventory Turn'] = (segment_sums['Cost of Goods'] / segment_sums['Inventory'])
    
    segment_metrics['Current Ratio'] = (segment_sums['Current Assets'] / segment_sums['Current Liabilities'])
    
    segment_metrics['Quick Ratio'] = ((segment_sums['Current Assets'] - segment_sums['Inventory']) / 
                                    segment_sums['Current Liabilities'])
    
    segment_metrics['ROA'] = (segment_sums['Net Profit'] / segment_sums['Total Assets'] * 100)
    
    # For Debt to Equity, we need individual company calculations first
    segment_metrics['Total Debt to Equity Ratio'] = df.groupby('segment')['Debt to Equity Ratio'].mean()
    
    # Round all numeric values
    segment_metrics = segment_metrics.round(1)
    
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
        segment_metrics[col] = segment_metrics[col].astype(str) + '%'
    
    return segment_metrics

def main():
    try:
        args = parse_arguments()
        
        print(f"Reading data from: {args.input_file}")
        df = pd.read_csv(args.input_file)
        
        # Calculate metrics with debug option if specified
        segment_metrics = calculate_segment_metrics(df, args.debug)
        
        print(f"\nSaving analysis to: {args.output_file}")
        segment_metrics.to_csv(args.output_file)
        
        print("\nSegment Metrics Summary:")
        print(segment_metrics)
        
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
