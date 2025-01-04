#!/usr/bin/env python3
import pandas as pd
import argparse
import sys
from pathlib import Path
import numpy as np

def calculate_cagr(current_value, base_value, years=3):
    """Calculate Compound Annual Growth Rate"""
    if base_value == 0 or pd.isna(base_value) or pd.isna(current_value):
        return None
    return (pow(current_value / base_value, 1/years) - 1) * 100

def calculate_yoy_growth(current_value, previous_value):
    """Calculate year-over-year growth rate"""
    if previous_value == 0 or pd.isna(previous_value) or pd.isna(current_value):
        return None
    return ((current_value - previous_value) / previous_value) * 100

def create_historical_data(input_file, cik_file, output_file):
    try:
        # Read the financial data
        if not Path(input_file).exists():
            raise FileNotFoundError(f"Input file '{input_file}' not found")
        
        if not Path(cik_file).exists():
            raise FileNotFoundError(f"CIK file '{cik_file}' not found")
            
        # Read the main financial data
        df = pd.read_csv(input_file)
        
        # Read CIK data with segments and subsegments
        cik_df = pd.read_csv(cik_file)
        
        # Get 2024 data first (base data)
        df_2024 = df[df['year'] == 2024].copy()
        
        # Initialize lists to store historical revenue data
        historical_cols = []
        
        # Get historical revenue data for 2023, 2022, 2021
        for year in [2023, 2022, 2021]:
            # Filter data for the specific year
            year_data = df[df['year'] == year][['company_name', 'Net Revenue']]
            # Rename the column to include the year
            year_data = year_data.rename(columns={'Net Revenue': f'Net Revenue {year}'})
            historical_cols.append(f'Net Revenue {year}')
            # Merge with main dataframe
            df_2024 = pd.merge(df_2024, year_data, on='company_name', how='left')
        
        # Calculate CAGR (2024 vs 2021)
        df_2024['3-Year CAGR %'] = df_2024.apply(
            lambda row: calculate_cagr(row['Net Revenue'], row['Net Revenue 2021']),
            axis=1
        )
        
        # Calculate YoY Growth (2024 vs 2023)
        df_2024['YoY Growth %'] = df_2024.apply(
            lambda row: calculate_yoy_growth(row['Net Revenue'], row['Net Revenue 2023']),
            axis=1
        )
        
        # Merge with CIK data including segments and subsegments
        df_final = pd.merge(df_2024, cik_df, on='company_name', how='left')
        
        # Create the desired column order with year before CIK and new segment columns after
        cols = [
            'company_name',
            'year',
            'cik',
            'segment',
            'subsegment',
            'Net Revenue',
            'Net Revenue 2023',
            'Net Revenue 2022',
            'Net Revenue 2021',
            'Cost of Goods',
            'SG&A',
            'Operating Profit',
            'Net Profit',
            'Inventory',
            'Current Assets',
            'Total Assets',
            'Current Liabilities',
            'Total Shareholder Equity',
            'Total Liabilities and Shareholder Equity',
            'Gross Margin',
            'Liabilities',
            '3-Year CAGR %',
            'YoY Growth %',
            'Cost of Goods Percentage'
        ]
        
        # Add remaining columns in their original order
        remaining_cols = [col for col in df_final.columns if col not in cols]
        cols.extend(remaining_cols)
        
        # Reorder the DataFrame columns
        df_final = df_final[cols]
        
        # Round CAGR and YoY Growth to 1 decimal place
        df_final['3-Year CAGR %'] = df_final['3-Year CAGR %'].round(1)
        df_final['YoY Growth %'] = df_final['YoY Growth %'].round(1)
        
        # Fill NaN values in subsegment with empty string to match source data format
        df_final['subsegment'] = df_final['subsegment'].fillna('')
        
        # Save to CSV
        df_final.to_csv(output_file, index=False)
        
        print(f"Successfully created historical data file with {len(df_final)} companies")
        print(f"Output saved to: {output_file}")
        print("\nColumn order (first few columns):")
        print("1. company_name")
        print("2. year")
        print("3. cik")
        print("4. segment")
        print("5. subsegment")
        print("6. Net Revenue (2024)")
        print("7. Net Revenue 2023")
        print("8. Net Revenue 2022")
        print("9. Net Revenue 2021")
        print("...")
            
    except pd.errors.EmptyDataError:
        print("Error: One of the input files is empty")
        sys.exit(1)
    except pd.errors.ParserError:
        print("Error: Unable to parse one of the CSV files. Please check the file format")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(
        description='Create benchmarks file with growth metrics, segments, and subsegments',
        formatter_class=argparse.RawTextHelpFormatter
    )
    
    parser.add_argument(
        '-i', '--input',
        required=True,
        help='Path to financial data CSV file (default: financial_data.csv)'
    )
    
    parser.add_argument(
        '-c', '--cik',
        required=True,
        help='Path to CIK CSV file (CIK.csv)'
    )
    
    parser.add_argument(
        '-o', '--output',
        default='benchmarks.csv',
        help='Path to output CSV file (default: benchmarks.csv)'
    )

    args = parser.parse_args()
    
    create_historical_data(args.input, args.cik, args.output)

if __name__ == "__main__":
    main()
