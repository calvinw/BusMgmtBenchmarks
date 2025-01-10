import requests
from bs4 import BeautifulSoup
import pandas as pd

# URL for ASOS financials on MarketWatch
# url = "https://www.marketwatch.com/investing/stock/asc/financials?countrycode=uk"
url = "https://www.marketwatch.com/investing/stock/asc/financials/balance-sheet?countrycode=uk"

# Headers to mimic a real browser
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Referer": "https://www.marketwatch.com/",
    "Upgrade-Insecure-Requests": "1",
}

# Send a GET request to the URL
response = requests.get(url, headers=headers)

# Check if the request was successful
if response.status_code == 200:
    soup = BeautifulSoup(response.text, "html.parser")

    # Find the specific table container
    table_container = soup.find("div", class_="element element--table table--fixed financials")

    if table_container:
        # Find the table within the container
        table = table_container.find("table", class_="table table--overflow align--right")
        if table:
            # Convert the table to a DataFrame
            df = pd.read_html(str(table))[0]
            print(df)
            df.to_csv("asos_financials-balance.csv", index=False)
        else:
            print("No table found inside the container.")
    else:
        print("No table container found.")
else:
    print(f"Failed to retrieve the page. Status code: {response.status_code}")
