import re
import sys
import argparse
from bs4 import BeautifulSoup
from pathlib import Path

def format_company_name(filename):
    """Extract and format company name from filename."""
    # Extract name between 'income-' and '-year'
    match = re.search(r'income-([^-]+)-\d{4}', filename)
    if match:
        # Replace underscores with spaces and capitalize words
        company = match.group(1).replace('_', ' ').title()
        return company
    return "Company"  # Default fallback

def extract_year(filename):
    """Extract year from filename."""
    match = re.search(r'-(\d{4})', filename)
    if match:
        return match.group(1)
    return "2020"  # Default fallback

def extract_table_and_refs(html_file):
    """Extract main table and reference data from an HTML file."""
    with open(html_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
        
    # Get the main table
    main_table = soup.find('table', class_='report')
    
    # Get all reference tables
    ref_tables = soup.find_all('table', class_='authRefData')
    
    return main_table, ref_tables

def create_combined_html(income_file, balance_file, output_file):
    """Create a combined HTML file with both statements in tabs."""
    
    # Get company name and year
    company_name = format_company_name(income_file)
    year = extract_year(income_file)
    
    # Extract content from both files
    income_table, income_refs = extract_table_and_refs(income_file)
    balance_table, balance_refs = extract_table_and_refs(balance_file)
    
    # Combine reference tables, removing duplicates by ID
    ref_dict = {}
    for ref in income_refs + balance_refs:
        if ref.get('id'):
            ref_dict[ref['id']] = ref
            
    reference_tables = '\n'.join(str(table) for table in ref_dict.values())

    # Create the combined HTML
    html_content = f'''<!DOCTYPE html>
<html>
<head>
    <title>{company_name} Financial Statements {year}</title>
    <link rel="stylesheet" type="text/css" href="report.css">
    <style>
        body {{
            font-family: Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: white;
        }}
        
        .banner {{
            background-color: #acf;
            color: black;
            padding: 15px;
            text-align: center;
            margin-bottom: 20px;
            border: 2px solid #acf;
        }}
        
        .banner h1 {{
            margin: 0;
            font-size: 14pt;
            font-weight: bold;
        }}
        
        .banner h2 {{
            margin: 5px 0 0 0;
            font-size: 12pt;
        }}
        
        .tabs {{
            display: flex;
            margin-bottom: 0;
            border-bottom: 2px solid #acf;
        }}
        
        .tab {{
            padding: 8px 16px;
            cursor: pointer;
            background-color: white;
            border: 2px solid #acf;
            border-bottom: none;
            margin-right: 5px;
            font-size: 10pt;
        }}
        
        .tab:hover {{
            background-color: #def;
        }}
        
        .tab.active {{
            background-color: #acf;
            border-color: #acf;
            font-weight: bold;
        }}
        
        .tab-content {{
            display: none;
            padding: 20px 0;
        }}
        
        .tab-content.active {{
            display: block;
        }}
    </style>
    <script type="text/javascript" src="Show.js">/* Do Not Remove This Comment */</script>
    <script>
        function showTab(tabName) {{
            var contents = document.getElementsByClassName('tab-content');
            for (var i = 0; i < contents.length; i++) {{
                contents[i].classList.remove('active');
            }}
            
            var tabs = document.getElementsByClassName('tab');
            for (var i = 0; i < tabs.length; i++) {{
                tabs[i].classList.remove('active');
            }}
            
            document.getElementById(tabName).classList.add('active');
            document.getElementById('tab-' + tabName).classList.add('active');
        }}
        
        function toggleNextSibling(e) {{
            if (e.nextSibling.style.display=='none') {{
                e.nextSibling.style.display='block';
            }} else {{
                e.nextSibling.style.display='none';
            }}
        }}
        
        function showAR(element, id, window) {{
            var refTable = document.getElementById(id);
            if (refTable) {{
                var allRefs = document.getElementsByClassName('authRefData');
                for (var i = 0; i < allRefs.length; i++) {{
                    allRefs[i].style.display = 'none';
                }}
                refTable.style.display = 'block';
                
                var rect = element.getBoundingClientRect();
                refTable.style.top = (rect.bottom + window.scrollY + 5) + 'px';
                refTable.style.left = rect.left + 'px';
            }}
        }}
        
        function hideAR() {{
            var allRefs = document.getElementsByClassName('authRefData');
            for (var i = 0; i < allRefs.length; i++) {{
                allRefs[i].style.display = 'none';
            }}
        }}
    </script>
</head>
<body>
    <div class="banner">
        <h1>{company_name}</h1>
        <h2>Financial Statements {year}</h2>
    </div>
    
    <div class="tabs">
        <div id="tab-income" class="tab active" onclick="showTab('income')">Income Statement</div>
        <div id="tab-balance" class="tab" onclick="showTab('balance')">Balance Sheet</div>
    </div>
        
    <div id="income" class="tab-content active">
        {str(income_table)}
    </div>
    
    <div id="balance" class="tab-content">
        {str(balance_table)}
    </div>
    
    <div style="display: none;">
        {reference_tables}
    </div>
</body>
</html>'''
    
    # Write the output file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"Created combined financial statements at: {output_file}")

def main():
    parser = argparse.ArgumentParser(
        description='Combine income statement and balance sheet HTML files into a single tabbed view'
    )
    parser.add_argument('income', help='Input income statement HTML file')
    parser.add_argument('balance', help='Input balance sheet HTML file')
    parser.add_argument('output', help='Output HTML file name')
    
    args = parser.parse_args()
    
    create_combined_html(args.income, args.balance, args.output)

if __name__ == "__main__":
    main()
