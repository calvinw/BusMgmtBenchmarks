import re
from collections import defaultdict

def parse_filenames(filenames):
    companies = defaultdict(lambda: defaultdict(dict))
    pattern = r'(balance|income)-(.+)-(\d{4})\.html'
    
    for filename in filenames:
        match = re.match(pattern, filename)
        if match:
            statement_type, company, year = match.groups()
            companies[company][year][statement_type] = filename
    
    return companies

def generate_html(companies):
    base_url = "https://calvinw.github.io/BusMgmtBenchmarks/extract/html/"
    html = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Retail Financial Benchmarks</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
        }
        .company-section {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h2 {
            color: #34495e;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
            margin-top: 0;
        }
        .year-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .year-row {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .year-label {
            width: 60px;
            font-weight: bold;
            color: #000;
        }
        .statement-links {
            display: flex;
            gap: 10px;
            flex: 1;
        }
        .income-link {
            background-color: #2980b9;
        }
        .balance-link {
            background-color: #3498db;
        }
        a {
            display: block;
            padding: 8px 12px;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 14px;
            transition: background-color 0.2s;
            flex: 1;
            text-align: center;
        }
        .income-link:hover {
            background-color: #1f6898;
        }
        .balance-link:hover {
            background-color: #2980b9;
        }
    </style>
</head>
<body>
    <h1>Retail Company Financial Benchmarks</h1>
    
    <div id="companies">
    """

    for company, years in companies.items():
        company_name = company.replace('_', ' ').title()
        html += f"""
        <div class="company-section">
            <h2>{company_name}</h2>
            <div class="year-container">
        """
        
        for year in sorted(years.keys(), reverse=True):
            html += f"""
                <div class="year-row">
                    <div class="year-label">{year}</div>
                    <div class="statement-links">
            """
            
            if 'income' in years[year]:
                html += f'<a href="{base_url}{years[year]["income"]}" class="income-link">Income Statement</a>'
            
            if 'balance' in years[year]:
                html += f'<a href="{base_url}{years[year]["balance"]}" class="balance-link">Balance Sheet</a>'
            
            html += """
                    </div>
                </div>
            """
        
        html += """
            </div>
        </div>
        """

    html += """
    </div>
</body>
</html>
    """
    
    return html

# Sample usage
filenames = [ "balance-academy_sports-2021.html", "income-academy_sports-2021.html",
    "balance-academy_sports-2022.html", "income-academy_sports-2022.html",
    "balance-academy_sports-2023.html", "income-academy_sports-2023.html",
    "balance-academy_sports-2024.html", "income-academy_sports-2024.html",
    "balance-af-2019.html", "income-af-2019.html",
    "balance-af-2020.html", "income-af-2020.html",
    "balance-af-2021.html", "income-af-2021.html",
    "balance-af-2022.html", "income-af-2022.html",
    "balance-af-2023.html", "income-af-2023.html",
    "balance-af-2024.html", "income-af-2024.html",
    "balance-albertsons-2019.html", "income-albertsons-2019.html",
    "balance-albertsons-2020.html", "income-albertsons-2020.html",
    "balance-albertsons-2021.html", "income-albertsons-2021.html",
    "balance-albertsons-2022.html", "income-albertsons-2022.html",
    "balance-albertsons-2023.html", "income-albertsons-2023.html",
    "balance-albertsons-2024.html", "income-albertsons-2024.html",
    "balance-amazon-2019.html", "income-amazon-2019.html",
    "balance-amazon-2020.html", "income-amazon-2020.html",
    "balance-amazon-2021.html", "income-amazon-2021.html",
    "balance-amazon-2022.html", "income-amazon-2022.html",
    "balance-amazon-2023.html", "income-amazon-2023.html",
    "balance-amazon-2024.html", "income-amazon-2024.html",
    "balance-american_eagle-2019.html", "income-american_eagle-2019.html",
    "balance-american_eagle-2020.html", "income-american_eagle-2020.html",
    "balance-american_eagle-2021.html", "income-american_eagle-2021.html",
    "balance-american_eagle-2022.html", "income-american_eagle-2022.html",
    "balance-american_eagle-2023.html", "income-american_eagle-2023.html",
    "balance-american_eagle-2024.html", "income-american_eagle-2024.html",
    "balance-bbb-2019.html", "income-bbb-2019.html",
    "balance-bbb-2020.html", "income-bbb-2020.html",
    "balance-bbb-2021.html", "income-bbb-2021.html",
    "balance-bbb-2022.html", "income-bbb-2022.html",
    "balance-bbb-2023.html", "income-bbb-2023.html",
    "balance-best_buy-2019.html", "income-best_buy-2019.html",
    "balance-best_buy-2020.html", "income-best_buy-2020.html",
    "balance-best_buy-2021.html", "income-best_buy-2021.html",
    "balance-best_buy-2022.html", "income-best_buy-2022.html",
    "balance-best_buy-2023.html", "income-best_buy-2023.html",
    "balance-best_buy-2024.html", "income-best_buy-2024.html",
    "balance-bjs-2019.html", "income-bjs-2019.html",
    "balance-bjs-2020.html", "income-bjs-2020.html",
    "balance-bjs-2021.html", "income-bjs-2021.html",
    "balance-bjs-2022.html", "income-bjs-2022.html",
    "balance-bjs-2023.html", "income-bjs-2023.html",
    "balance-bjs-2024.html", "income-bjs-2024.html",
    "balance-boot_barn-2019.html", "income-boot_barn-2019.html",
    "balance-boot_barn-2020.html", "income-boot_barn-2020.html",
    "balance-boot_barn-2021.html", "income-boot_barn-2021.html",
    "balance-boot_barn-2022.html", "income-boot_barn-2022.html",
    "balance-boot_barn-2023.html", "income-boot_barn-2023.html",
    "balance-boot_barn-2024.html", "income-boot_barn-2024.html",
    "balance-burlington-2019.html", "income-burlington-2019.html",
    "balance-burlington-2020.html", "income-burlington-2020.html",
    "balance-burlington-2021.html", "income-burlington-2021.html",
    "balance-burlington-2022.html", "income-burlington-2022.html",
    "balance-burlington-2023.html", "income-burlington-2023.html",
    "balance-burlington-2024.html", "income-burlington-2024.html",
    "balance-capri_holdings-2019.html", "income-capri_holdings-2019.html",
    "balance-capri_holdings-2020.html", "income-capri_holdings-2020.html",
    "balance-capri_holdings-2021.html", "income-capri_holdings-2021.html",
    "balance-capri_holdings-2022.html", "income-capri_holdings-2022.html",
    "balance-capri_holdings-2023.html", "income-capri_holdings-2023.html",
    "balance-capri_holdings-2024.html", "income-capri_holdings-2024.html",
    "balance-chewy-2020.html", "income-chewy-2020.html",
    "balance-chewy-2021.html", "income-chewy-2021.html",
    "balance-chewy-2022.html", "income-chewy-2022.html",
    "balance-chewy-2023.html", "income-chewy-2023.html",
    "balance-chewy-2024.html", "income-chewy-2024.html",
    "balance-costco-2019.html", "income-costco-2019.html",
    "balance-costco-2020.html", "income-costco-2020.html",
    "balance-costco-2021.html", "income-costco-2021.html",
    "balance-costco-2022.html", "income-costco-2022.html",
    "balance-costco-2023.html", "income-costco-2023.html",
    "balance-costco-2024.html", "income-costco-2024.html",
    "balance-cvs-2019.html", "income-cvs-2019.html",
    "balance-cvs-2020.html", "income-cvs-2020.html",
    "balance-cvs-2021.html", "income-cvs-2021.html",
    "balance-cvs-2022.html", "income-cvs-2022.html",
    "balance-cvs-2023.html", "income-cvs-2023.html",
    "balance-cvs-2024.html", "income-cvs-2024.html",
    "balance-dicks-2019.html", "income-dicks-2019.html",
    "balance-dicks-2020.html", "income-dicks-2020.html",
    "balance-dicks-2021.html", "income-dicks-2021.html",
    "balance-dicks-2022.html", "income-dicks-2022.html",
    "balance-dicks-2023.html", "income-dicks-2023.html",
    "balance-dicks-2024.html", "income-dicks-2024.html",
    "balance-dillards-2019.html", "income-dillards-2019.html",
    "balance-dillards-2020.html", "income-dillards-2020.html",
    "balance-dillards-2021.html", "income-dillards-2021.html",
    "balance-dillards-2022.html", "income-dillards-2022.html",
    "balance-dillards-2023.html", "income-dillards-2023.html",
    "balance-dillards-2024.html", "income-dillards-2024.html",
    "balance-dollar_general-2019.html", "income-dollar_general-2019.html",
    "balance-dollar_general-2020.html", "income-dollar_general-2020.html",
    "balance-dollar_general-2021.html", "income-dollar_general-2021.html",
    "balance-dollar_general-2022.html", "income-dollar_general-2022.html",
    "balance-dollar_general-2023.html", "income-dollar_general-2023.html",
    "balance-dollar_general-2024.html", "income-dollar_general-2024.html",
    "balance-dollar_tree-2019.html", "income-dollar_tree-2019.html",
    "balance-dollar_tree-2020.html", "income-dollar_tree-2020.html",
    "balance-dollar_tree-2021.html", "income-dollar_tree-2021.html",
    "balance-dollar_tree-2022.html", "income-dollar_tree-2022.html",
    "balance-dollar_tree-2023.html", "income-dollar_tree-2023.html",
    "balance-dollar_tree-2024.html", "income-dollar_tree-2024.html",
    "balance-five_below-2019.html", "income-five_below-2019.html",
    "balance-five_below-2020.html", "income-five_below-2020.html",
    "balance-five_below-2021.html", "income-five_below-2021.html",
    "balance-five_below-2022.html", "income-five_below-2022.html",
    "balance-five_below-2023.html", "income-five_below-2023.html",
    "balance-five_below-2024.html", "income-five_below-2024.html",
    "balance-footlocker-2019.html", "income-footlocker-2019.html",
    "balance-footlocker-2020.html", "income-footlocker-2020.html",
    "balance-footlocker-2021.html", "income-footlocker-2021.html",
    "balance-footlocker-2022.html", "income-footlocker-2022.html",
    "balance-footlocker-2023.html", "income-footlocker-2023.html",
    "balance-footlocker-2024.html", "income-footlocker-2024.html",
    "balance-gap-2019.html", "income-gap-2019.html",
    "balance-gap-2020.html", "income-gap-2020.html",
    "balance-gap-2021.html", "income-gap-2021.html",
    "balance-gap-2022.html", "income-gap-2022.html",
    "balance-gap-2023.html", "income-gap-2023.html",
    "balance-gap-2024.html", "income-gap-2024.html",
    "balance-home_depot-2019.html", "income-home_depot-2019.html",
    "balance-home_depot-2020.html", "income-home_depot-2020.html",
    "balance-home_depot-2021.html", "income-home_depot-2021.html",
    "balance-home_depot-2022.html", "income-home_depot-2022.html",
    "balance-home_depot-2023.html", "income-home_depot-2023.html",
    "balance-home_depot-2024.html", "income-home_depot-2024.html",
    "balance-kohls-2019.html", "income-kohls-2019.html",
    "balance-kohls-2020.html", "income-kohls-2020.html",
    "balance-kohls-2021.html", "income-kohls-2021.html",
    "balance-kohls-2022.html", "income-kohls-2022.html",
    "balance-kohls-2023.html", "income-kohls-2023.html",
    "balance-kohls-2024.html", "income-kohls-2024.html",
    "balance-kroger-2019.html", "income-kroger-2019.html",
    "balance-kroger-2020.html", "income-kroger-2020.html",
    "balance-kroger-2021.html", "income-kroger-2021.html",
    "balance-kroger-2022.html", "income-kroger-2022.html",
    "balance-kroger-2023.html", "income-kroger-2023.html",
    "balance-kroger-2024.html", "income-kroger-2024.html",
    "balance-levi-2019.html", "income-levi-2019.html",
    "balance-levi-2020.html", "income-levi-2020.html",
    "balance-levi-2021.html", "income-levi-2021.html",
    "balance-levi-2022.html", "income-levi-2022.html",
    "balance-levi-2023.html", "income-levi-2023.html",
    "balance-levi-2024.html", "income-levi-2024.html",
    "balance-lowes-2019.html", "income-lowes-2019.html",
    "balance-lowes-2020.html", "income-lowes-2020.html",
    "balance-lowes-2021.html", "income-lowes-2021.html",
    "balance-lowes-2022.html", "income-lowes-2022.html",
    "balance-lowes-2023.html", "income-lowes-2023.html",
    "balance-lowes-2024.html", "income-lowes-2024.html",
    "balance-lululemon-2019.html", "income-lululemon-2019.html",
    "balance-lululemon-2020.html", "income-lululemon-2020.html",
    "balance-lululemon-2021.html", "income-lululemon-2021.html",
    "balance-lululemon-2022.html", "income-lululemon-2022.html",
    "balance-lululemon-2023.html", "income-lululemon-2023.html",
    "balance-lululemon-2024.html", "income-lululemon-2024.html",
    "balance-macys-2019.html", "income-macys-2019.html",
    "balance-macys-2020.html", "income-macys-2020.html",
    "balance-macys-2021.html", "income-macys-2021.html",
    "balance-macys-2022.html", "income-macys-2022.html",
    "balance-macys-2023.html", "income-macys-2023.html",
    "balance-macys-2024.html", "income-macys-2024.html",
    "balance-nike-2019.html", "income-nike-2019.html",
    "balance-nike-2020.html", "income-nike-2020.html",
    "balance-nike-2021.html", "income-nike-2021.html",
    "balance-nike-2022.html", "income-nike-2022.html",
    "balance-nike-2023.html", "income-nike-2023.html",
    "balance-nike-2024.html", "income-nike-2024.html",
    "balance-nordstrom-2019.html", "income-nordstrom-2019.html",
    "balance-nordstrom-2020.html", "income-nordstrom-2020.html",
    "balance-nordstrom-2021.html", "income-nordstrom-2021.html",
    "balance-nordstrom-2022.html", "income-nordstrom-2022.html",
    "balance-nordstrom-2023.html", "income-nordstrom-2023.html",
    "balance-nordstrom-2024.html", "income-nordstrom-2024.html",
    "balance-rh-2019.html", "income-rh-2019.html",
    "balance-rh-2020.html", "income-rh-2020.html",
    "balance-rh-2021.html", "income-rh-2021.html",
    "balance-rh-2022.html", "income-rh-2022.html",
    "balance-rh-2023.html", "income-rh-2023.html",
    "balance-rh-2024.html", "income-rh-2024.html",
    "balance-rite_aid-2019.html", "income-rite_aid-2019.html",
    "balance-rite_aid-2020.html", "income-rite_aid-2020.html",
    "balance-rite_aid-2021.html", "income-rite_aid-2021.html",
    "balance-rite_aid-2022.html", "income-rite_aid-2022.html",
    "balance-rite_aid-2023.html", "income-rite_aid-2023.html",
    "balance-ross-2019.html", "income-ross-2019.html",
    "balance-ross-2020.html", "income-ross-2020.html",
    "balance-ross-2021.html", "income-ross-2021.html",
    "balance-ross-2022.html", "income-ross-2022.html",
    "balance-ross-2023.html", "income-ross-2023.html",
    "balance-ross-2024.html", "income-ross-2024.html",
    "balance-sherwin_williams-2019.html", "income-sherwin_williams-2019.html",
    "balance-sherwin_williams-2020.html", "income-sherwin_williams-2020.html",
    "balance-sherwin_williams-2021.html", "income-sherwin_williams-2021.html",
    "balance-sherwin_williams-2022.html", "income-sherwin_williams-2022.html",
    "balance-sherwin_williams-2023.html", "income-sherwin_williams-2023.html",
    "balance-sherwin_williams-2024.html", "income-sherwin_williams-2024.html",
    "balance-signet_jewelers-2019.html", "income-signet_jewelers-2019.html",
    "balance-signet_jewelers-2020.html", "income-signet_jewelers-2020.html",
    "balance-signet_jewelers-2021.html", "income-signet_jewelers-2021.html",
    "balance-signet_jewelers-2022.html", "income-signet_jewelers-2022.html",
    "balance-signet_jewelers-2023.html", "income-signet_jewelers-2023.html",
    "balance-signet_jewelers-2024.html", "income-signet_jewelers-2024.html",
    "balance-tapestry-2019.html", "income-tapestry-2019.html",
    "balance-tapestry-2020.html", "income-tapestry-2020.html",
    "balance-tapestry-2021.html", "income-tapestry-2021.html",
    "balance-tapestry-2022.html", "income-tapestry-2022.html",
    "balance-tapestry-2023.html", "income-tapestry-2023.html",
    "balance-tapestry-2024.html", "income-tapestry-2024.html",
    "balance-target-2019.html", "income-target-2019.html",
    "balance-target-2020.html", "income-target-2020.html",
    "balance-target-2021.html", "income-target-2021.html",
    "balance-target-2022.html", "income-target-2022.html",
    "balance-target-2023.html", "income-target-2023.html",
    "balance-target-2024.html", "income-target-2024.html",
    "balance-tj_maxx-2019.html", "income-tj_maxx-2019.html",
    "balance-tj_maxx-2020.html", "income-tj_maxx-2020.html",
    "balance-tj_maxx-2021.html", "income-tj_maxx-2021.html",
    "balance-tj_maxx-2022.html", "income-tj_maxx-2022.html",
    "balance-tj_maxx-2023.html", "income-tj_maxx-2023.html",
    "balance-tj_maxx-2024.html", "income-tj_maxx-2024.html",
    "balance-tractor_supply-2019.html", "income-tractor_supply-2019.html",
    "balance-tractor_supply-2020.html", "income-tractor_supply-2020.html",
    "balance-tractor_supply-2021.html", "income-tractor_supply-2021.html",
    "balance-tractor_supply-2022.html", "income-tractor_supply-2022.html",
    "balance-tractor_supply-2023.html", "income-tractor_supply-2023.html",
    "balance-tractor_supply-2024.html", "income-tractor_supply-2024.html",
    "balance-ulta_beauty-2019.html", "income-ulta_beauty-2019.html",
    "balance-ulta_beauty-2020.html", "income-ulta_beauty-2020.html",
    "balance-ulta_beauty-2021.html", "income-ulta_beauty-2021.html",
    "balance-ulta_beauty-2022.html", "income-ulta_beauty-2022.html",
    "balance-ulta_beauty-2023.html", "income-ulta_beauty-2023.html",
    "balance-ulta_beauty-2024.html", "income-ulta_beauty-2024.html",
    "balance-urban_outfitters-2019.html", "income-urban_outfitters-2019.html",
    "balance-urban_outfitters-2020.html", "income-urban_outfitters-2020.html",
    "balance-urban_outfitters-2021.html", "income-urban_outfitters-2021.html",
    "balance-urban_outfitters-2022.html", "income-urban_outfitters-2022.html",
    "balance-urban_outfitters-2023.html", "income-urban_outfitters-2023.html",
    "balance-urban_outfitters-2024.html", "income-urban_outfitters-2024.html",
    "balance-victorias_secret-2022.html", "income-victorias_secret-2022.html",
    "balance-victorias_secret-2023.html", "income-victorias_secret-2023.html",
    "balance-victorias_secret-2024.html", "income-victorias_secret-2024.html",
    "balance-walgreens-2019.html", "income-walgreens-2019.html",
    "balance-walgreens-2020.html", "income-walgreens-2020.html",
    "balance-walgreens-2021.html", "income-walgreens-2021.html",
    "balance-walgreens-2022.html", "income-walgreens-2022.html",
    "balance-walgreens-2023.html", "income-walgreens-2023.html",
    "balance-walgreens-2024.html", "income-walgreens-2024.html",
    "balance-walmart-2019.html", "income-walmart-2019.html",
    "balance-walmart-2020.html", "income-walmart-2020.html",
    "balance-walmart-2021.html", "income-walmart-2021.html",
    "balance-walmart-2022.html", "income-walmart-2022.html",
    "balance-walmart-2023.html", "income-walmart-2023.html",
    "balance-walmart-2024.html", "income-walmart-2024.html",
    "balance-wayfair-2019.html", "income-wayfair-2019.html",
    "balance-wayfair-2020.html", "income-wayfair-2020.html",
    "balance-wayfair-2021.html", "income-wayfair-2021.html",
    "balance-wayfair-2022.html", "income-wayfair-2022.html",
    "balance-wayfair-2023.html", "income-wayfair-2023.html",
    "balance-wayfair-2024.html", "income-wayfair-2024.html",
    "balance-william_sonoma-2019.html", "income-william_sonoma-2019.html",
    "balance-william_sonoma-2020.html", "income-william_sonoma-2020.html",
    "balance-william_sonoma-2021.html", "income-william_sonoma-2021.html",
    "balance-william_sonoma-2022.html", "income-william_sonoma-2022.html",
    "balance-william_sonoma-2023.html", "income-william_sonoma-2023.html",
    "balance-william_sonoma-2024.html", "income-william_sonoma-2024.html",
    "balance-yeti-2019.html", "income-yeti-2019.html",
    "balance-yeti-2020.html", "income-yeti-2020.html",
    "balance-yeti-2021.html", "income-yeti-2021.html",
    "balance-yeti-2022.html", "income-yeti-2022.html",
    "balance-yeti-2023.html", "income-yeti-2023.html",
    "balance-yeti-2024.html", "income-yeti-2024.html"
]

companies = parse_filenames(filenames)
generated_html = generate_html(companies)

# Write the generated HTML to a file
with open('retail_statements.html', 'w') as f:
    f.write(generated_html)

print("HTML file generated successfully.")
