import csv
import json
import sys
from collections import defaultdict

def read_csv(file_path):
    with open(file_path, 'r') as f:
        reader = csv.DictReader(f)
        return list(reader)

def generate_html(financial_data_file, output_html_file, sec_filings_file):
    # Load the financial data
    financial_data = read_csv(financial_data_file)

    # Load the SEC filings data
    sec_filings = read_csv(sec_filings_file)

    # Restructure the financial data
    financial_data_dict = defaultdict(lambda: defaultdict(dict))
    for row in financial_data:
        company = row['company_name']
        year = row['year']
        for key, value in row.items():
            if key not in ['company_name', 'year']:
                financial_data_dict[company][year][key] = value

    # Restructure the SEC filings data
    sec_filings_dict = defaultdict(lambda: defaultdict(list))
    for row in sec_filings:
        company = row['company_name']
        year = row['year']
        sec_filings_dict[company][year].append({
            'filingDate': row['filingDate'],
            'reportDate': row['reportDate'],
            'secIndexUrl': row['secIndexUrl'],
            'interactiveDataUrl': row['interactiveDataUrl'],
            'xbrlUrl': row['xbrlUrl']
        })

    # Create the HTML content
    html_content = f'''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Retail Companies Financial Data and SEC Filings</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
            }}
            h1, h2, h3 {{
                color: #333;
            }}
            table {{
                border-collapse: collapse;
                width: 100%;
                margin-top: 20px;
                margin-bottom: 40px;
                table-layout: fixed;
            }}
            th, td {{
                border: 1px solid #ddd;
                padding: 8px;
                text-align: right;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }}
            th {{
                background-color: #f2f2f2;
                font-weight: bold;
            }}
            tr:nth-child(even) {{
                background-color: #f9f9f9;
            }}
            .metric {{
                font-weight: bold;
                text-align: left;
                font-size: 0.8em;
                width: 200px;
                white-space: normal;
                word-wrap: break-word;
            }}
            .nav {{
                margin-bottom: 20px;
            }}
            .nav a {{
                margin-right: 10px;
            }}
            .sec-filings {{
                margin-top: 20px;
            }}
            .sec-filings th:first-child {{
                text-align: left;
            }}
            .financial-table {{
                table-layout: fixed;
            }}
            .financial-table th:first-child,
            .financial-table td:first-child {{
                width: 200px;
            }}
            .financial-table th:not(:first-child),
            .financial-table td:not(:first-child) {{
                width: calc((100% - 200px) / 6);  /* Adjust the 6 if you have a different number of years */
            }}
        </style>
    </head>
    <body>
        <h1>Retail Companies Financial Data and SEC Filings</h1>

        <h2>Quick Links</h2>
        <ul>
            {''.join(f'<li><a href="#{company}">{company.replace("_", " ").title()}</a></li>' for company in financial_data_dict.keys())}
        </ul>

        <div id="tables"></div>

        <script>
            const financialData = {json.dumps(financial_data_dict)};

            const secFilings = {json.dumps(sec_filings_dict)};

            function createTables() {{
                const tablesElement = document.getElementById('tables');

                for (const [company, yearData] of Object.entries(financialData)) {{
                    const container = document.createElement('div');
                    container.id = company;

                    const header = document.createElement('h2');
                    header.textContent = company.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
                    container.appendChild(header);

                    // Create financial data table
                    const financialTable = createFinancialTable(yearData);
                    container.appendChild(financialTable);

                    // Create SEC filings table if data is available
                    if (Object.keys(secFilings).length > 0) {{
                        const filingsTable = createFilingsTable(company, Object.keys(yearData).length);
                        container.appendChild(filingsTable);
                    }}

                    tablesElement.appendChild(container);
                }}
            }}

            function createFinancialTable(yearData) {{
                const table = document.createElement('table');
                table.className = 'financial-table';
                const header = table.createTHead();
                const headerRow = header.insertRow();

                // Add "Metric" as the first header
                const metricHeader = document.createElement('th');
                metricHeader.textContent = 'Metric';
                headerRow.appendChild(metricHeader);

                // Get all years and sort them in descending order
                const years = Object.keys(yearData).sort((a, b) => b - a);

                // Add year headers
                years.forEach(year => {{
                    const th = document.createElement('th');
                    th.textContent = year;
                    headerRow.appendChild(th);
                }});

                // Add data rows
                const metrics = Object.keys(yearData[years[0]]);
                metrics.forEach(metric => {{
                    const row = table.insertRow();
                    const cell = row.insertCell();
                    cell.textContent = metric.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
                    cell.className = 'metric';

                    years.forEach(year => {{
                        const cell = row.insertCell();
                        const value = yearData[year][metric];
                        if (value === null || value === '') {{
                            cell.textContent = 'N/A';
                        }} else {{
                            cell.textContent = value;
                        }}
                    }});
                }});

                return table;
            }}

            function createFilingsTable(company, columnCount) {{
                const table = document.createElement('table');
                table.className = 'sec-filings';
                const header = table.createTHead();
                const headerRow = header.insertRow();

                // Add "Year" as the first header
                const yearHeader = document.createElement('th');
                yearHeader.textContent = 'Year';
                headerRow.appendChild(yearHeader);

                const companyFilings = secFilings[company];
                if (companyFilings) {{
                    const years = Object.keys(companyFilings).sort((a, b) => b - a);
                    years.forEach(year => {{
                        const th = document.createElement('th');
                        th.textContent = year;
                        headerRow.appendChild(th);
                    }});

                    // Add empty columns to match the financial table
                    for (let i = years.length; i < columnCount; i++) {{
                        const th = document.createElement('th');
                        headerRow.appendChild(th);
                    }}

                    const metrics = ['Filing Date', 'Report Date', 'SEC Index', 'Interactive Data', 'XBRL'];
                    metrics.forEach(metric => {{
                        const row = table.insertRow();
                        const cell = row.insertCell();
                        cell.textContent = metric;
                        cell.className = 'metric';

                        years.forEach(year => {{
                            const cell = row.insertCell();
                            const filing = companyFilings[year][0];  // Assuming only one filing per year
                            if (metric === 'Filing Date') {{
                                cell.textContent = filing.filingDate;
                            }} else if (metric === 'Report Date') {{
                                cell.textContent = filing.reportDate;
                            }} else if (metric === 'SEC Index') {{
                                cell.innerHTML = `<a href="${{filing.secIndexUrl}}" target="_blank">View</a>`;
                            }} else if (metric === 'Interactive Data') {{
                                cell.innerHTML = `<a href="${{filing.interactiveDataUrl}}" target="_blank">View</a>`;
                            }} else if (metric === 'XBRL') {{
                                cell.innerHTML = `<a href="${{filing.xbrlUrl}}" target="_blank">View</a>`;
                            }}
                        }});

                        // Add empty cells to match the financial table
                        for (let i = years.length; i < columnCount; i++) {{
                            row.insertCell();
                        }}
                    }});
                }}

                const container = document.createElement('div');
                const header2 = document.createElement('h3');
                header2.textContent = 'SEC Filings';
                container.appendChild(header2);
                container.appendChild(table);

                return container;
            }}

            // Call the function to create tables when the page loads
            window.onload = createTables;
        </script>
    </body>
    </html>
    '''

    # Write the HTML content to the output file
    with open(output_html_file, 'w') as f:
        f.write(html_content)

    print(f"HTML file has been generated: {output_html_file}")

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python generate_html.py <financial_data_file> <sec_filings_file> <output_html_file>")
        sys.exit(1)

    financial_data_file = sys.argv[1]
    sec_filings_file = sys.argv[2]
    output_html_file = sys.argv[3]

    generate_html(financial_data_file, output_html_file, sec_filings_file)
