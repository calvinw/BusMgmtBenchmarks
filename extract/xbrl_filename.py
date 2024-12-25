from datetime import datetime

def generate_xbrl_filename(ticker: str, report_date: str) -> str:
    """
    Generate XBRL filename based on ticker and report date.
    
    Args:
        ticker: Company ticker symbol in uppercase (e.g., 'BURL')
        report_date: Report date in YYYY-MM-DD format
        
    Returns:
        str: Generated filename according to year-specific patterns
    """
    # Convert ticker to lowercase for filename
    ticker_lower = ticker.lower()
    
    # Parse the date
    date_obj = datetime.strptime(report_date, '%Y-%m-%d')
    year = date_obj.year
    
    if year >= 2022:
        # Format: burl-20240203_htm.xml
        return f"{ticker_lower}-{date_obj.strftime('%Y%m%d')}_htm.xml"
    elif 2020 <= year <= 2021:
        # Format: burl-10k_20210130_htm.xml
        return f"{ticker_lower}-10k_{date_obj.strftime('%Y%m%d')}_htm.xml"
    else:
        # Format: burl-20190202.xml (2019 and earlier)
        return f"{ticker_lower}-{date_obj.strftime('%Y%m%d')}.xml"

# Example usage
def test_filename_generator():
    test_cases = [
        ("BURL", "2024-02-03"),  # Recent format
        ("BURL", "2023-01-28"),
        ("BURL", "2022-01-29"),
        ("BURL", "2021-01-30"),  # 2020-2021 format
        ("BURL", "2020-02-01"),
        ("BURL", "2019-02-02"),  # 2019 and earlier format
    ]
    
    for ticker, date in test_cases:
        filename = generate_xbrl_filename(ticker, date)
        print(f"Date: {date} -> {filename}")

if __name__ == "__main__":
    test_filename_generator()
