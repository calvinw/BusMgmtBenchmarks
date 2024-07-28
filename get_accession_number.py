import requests
import json

def get_10k_accession(cik, year):
    # Ensure CIK is 10 digits
    cik = cik.zfill(10)

    # Construct the API URL
    url = f"https://data.sec.gov/submissions/CIK{cik}.json"

    # Set up headers (SEC requires a user agent)
    headers = {
        "User-Agent": "FIT calvin_williamson@fitnyc.edu"
    }

    # Send GET request
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        data = json.loads(response.text)

        # Get the list of filings
        filings = data['filings']['recent']

        # Search for 10-K filing in the specified year
        for i in range(len(filings['accessionNumber'])):
            is_right_year = filings['filingDate'][i].startswith(str(year))
            if filings['form'][i] == '10-K' and is_right_year:
                return filings['accessionNumber'][i]

        print(f"No 10-K filing found for {year}")
        return None
    else:
        print(f"Error: {response.status_code}")
        return None

# Example usage of the script
if __name__ == "__main__":

  macy_cik = "0000794367"
  year = 2024

  accession_number = get_10k_accession(macy_cik, year)
  if accession_number:
      print(f"Accession number for {year} 10-K: {accession_number}")
