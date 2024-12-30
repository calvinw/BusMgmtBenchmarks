from bs4 import BeautifulSoup
import json
import re

def parse_data(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    rows = soup.find('table', {'class': 'report'}).find_all('tr')
    definitions = {}
    
    auth_ref_tables = soup.find_all('table', {'class': 'authRefData'})
    for table in auth_ref_tables:
        id = table.get('id').replace('defref_', '')
        definition_div = table.find('a', string='- Definition')
        if definition_div and definition_div.find_next('div'):
            definition = definition_div.find_next('div').find('p').text.strip()
            definitions[id] = definition
    
    results = []
    seen_labels = set()
    
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
            id = onclick.split('defref_')[1].split("'")[0]
            if label not in seen_labels:
                results.append({
                    "label": label,
                    "id": id,
                    "definition": definitions.get(id, "Definition not found")
                })
                seen_labels.add(label)
    
    return results

def parse_from_files(input_file, output_file):

    with open(input_file, 'r', encoding='utf-8') as f:
        html = f.read()

    data = parse_data(html)

    if data:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return data
    return None

if __name__ == "__main__":

    parse_from_files("html/income-amazon-2024.html", "income-amazon-2024.json")
