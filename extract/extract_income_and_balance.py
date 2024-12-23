from bs4 import BeautifulSoup
import json
import re

def parse_statement(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Find the main financial table
    main_table = soup.find('table', {'class': 'report'})
    if not main_table:
        return None
    
    # Find the table header to extract units
    # table_header = main_table.find_next('th', {'class': 'tl'})
    # units_text = table_header.get_text(strip=True) if table_header else ""
    #
    # units = "dollars" # default to dollars
    # if "$ in Millions" in units_text:
    #     units = "millions"
    # elif "$ in Thousands" in units_text:
    #     units = "thousands"
    #
    # print("Units: ", units)
    
    # Get column headers (dates)
    header_rows = main_table.find_all('tr')
    headers = []
    for row in header_rows:
        ths = row.find_all('th', {'class': 'th'})
        if ths:
            headers.append([th.get_text(strip=True) for th in ths])
    
    latest_year_index = 1  # The first numeric column is typically the latest year
    
    # Get all definition tables
    definition_tables = soup.find_all('table', {'class': 'authRefData'})
    definitions = {}
    
    # Extract definitions
    for def_table in definition_tables:
        if def_table.get('id', '').startswith('defref_'):
            gaap_id = def_table['id'].replace('defref_', '')
            definition_div = def_table.find('a', string='- Definition')
            if definition_div and definition_div.find_next('div'):
                definition_p = definition_div.find_next('div').find('p')
                if definition_p:
                    definitions[gaap_id] = definition_p.get_text(strip=True)
    
    # Process main data rows
    data = []
    current_section = None
    rows = main_table.find_all('tr')
    
    for row in rows:
        # Look for data rows with values
        cells = row.find_all(['td', 'th'])
        if not cells:
            continue
            
        label_cell = row.find('td', {'class': 'pl'})
        if not label_cell:
            continue
            
        # Find the GAAP reference
        gaap_link = label_cell.find('a')
        if not gaap_link:
            continue
            
        gaap_ref = gaap_link.get('onclick', '')
        gaap_match = re.search(r"'defref_(.*?)'", gaap_ref)
        if not gaap_match:
            continue
            
        gaap_id = gaap_match.group(1)
        
        # Get the label and check if it's a section header
        label = gaap_link.get_text(strip=True)
        is_section = False
        
        # Check if this is a section header (usually bold and ends with ':')
        strong_tag = label_cell.find('strong')
        if strong_tag and label.endswith(':'):
            current_section = label
            is_section = True
            continue
            
        value_cell = row.find_all('td', {'class': ['num', 'nump']})
        
        if value_cell and len(value_cell) >= latest_year_index:
            value = value_cell[latest_year_index - 1].get_text(strip=True)
            # Clean up the value
            value = value.replace('$', '').replace(',', '').strip()
            
            
            # Create entry
            entry = {
                'label': label,
                'value': value,
                'gaap_id': gaap_id,
                'definition': definitions.get(gaap_id, 'Definition not available'),
                'section': current_section
            }
            
            data.append(entry)
    
    # Reorganize data by sections
    organized_data = {}

    # Extract the title
    table_header = main_table.find_next('th', {'class': 'tl'})
    title_text = table_header.get_text(strip=True) if table_header else ""
    organized_data["title"] = title_text

    organized_data["headers"] = headers
    
    for entry in data:
        section = entry.pop('section', None)  # Remove section from entry and get its value
        if section not in organized_data:
            organized_data[section] = []
        organized_data[section] = organized_data[section] + [entry]
    
    
    return organized_data

def extract_statement_json(input_file, output_file):

    with open(input_file, 'r', encoding='utf-8') as f:
        html = f.read()

    data = parse_statement(html)

    if data:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return data
    return None
