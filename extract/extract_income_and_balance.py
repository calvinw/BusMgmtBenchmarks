from bs4 import BeautifulSoup
import json
import re

def parse_gaap_data(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    rows = soup.find('table', {'class': 'report'}).find_all('tr')
    definitions = {}
    
    auth_ref_tables = soup.find_all('table', {'class': 'authRefData'})
    for table in auth_ref_tables:
        gaap_id = table.get('id').replace('defref_', '')
        definition_div = table.find('a', string='- Definition')
        if definition_div and definition_div.find_next('div'):
            definition = definition_div.find_next('div').find('p').text.strip()
            definitions[gaap_id] = definition
    
    results = []
    
    for row in rows:
        anchor = row.find('a', {'class': 'a'})
        if not anchor:
            continue
            
        value_cell = row.find(['td'], class_=['num', 'nump'])
        if not value_cell:
            continue
            
        label = anchor.text.strip()
        onclick = anchor.get('onclick', '')
        
        if 'Abstract' in onclick:
            continue
                
        if 'defref_' in onclick:
            gaap_id = onclick.split('defref_')[1].split("'")[0]
            
            results.append({
                "label": label,
                "gaap_id": gaap_id,
                "definition": definitions.get(gaap_id, "Definition not found")
            })
    
    return results

# def parse_gaap_data(html_content):
#     soup = BeautifulSoup(html_content, 'html.parser')
#     
#     # Find all rows in the main table
#     rows = soup.find('table', {'class': 'report'}).find_all('tr')
#     
#     # Dictionary to store GAAP definitions
#     definitions = {}
#     
#     # First, collect all definitions from the authRefData tables
#     auth_ref_tables = soup.find_all('table', {'class': 'authRefData'})
#     for table in auth_ref_tables:
#         gaap_id = table.get('id').replace('defref_', '')
#         # Find definition section
#         definition_div = table.find('a', string='- Definition')
#         if definition_div and definition_div.find_next('div'):
#             definition = definition_div.find_next('div').find('p').text.strip()
#             definitions[gaap_id] = definition
#     
#     # List to store the final results
#     results = []
#     
#     # Process each row in the main table
#     for row in rows:
#         # Find the anchor tag that contains the GAAP reference
#         anchor = row.find('a', {'class': 'a'})
#         if anchor:
#             # Get the text content (label)
#             label = anchor.text.strip()
#             
#             # Skip section headers (they typically start with ":")
#             if label.endswith(':'):
#                 continue
#                 
#             # Get the GAAP ID from the onclick attribute
#             onclick = anchor.get('onclick', '')
#             if 'defref_' in onclick:
#                 gaap_id = onclick.split('defref_')[1].split("'")[0]
#                 
#                 # Create result dictionary
#                 result = {
#                     "label": label,
#                     "gaap_id": gaap_id,
#                     "definition": definitions.get(gaap_id, "Definition not found")
#                 }
#                 results.append(result)
#     
#     return results
#
def parse_gaap_from_files(input_file, output_file):

    with open(input_file, 'r', encoding='utf-8') as f:
        html = f.read()

    data = parse_gaap_data(html)

    if data:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return data
    return None

if __name__ == "__main__":

    parse_gaap_from_files("html/income-costco-2023.html", "blah.json")
