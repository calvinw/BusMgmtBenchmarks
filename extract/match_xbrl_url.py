import re
import requests

def retrieve_file(url):
    print(f"Fetching ")
    headers = {
        "User-Agent": "FIT calvin_williamson@fitnyc.edu"
    }
    response = requests.get(url, headers=headers)
    return response.text

def find_xml_files(submission_url):

    content = retrieve_file(submission_url)

    # Excluded suffixes
    excluded_suffixes = ['_def.xml', '_pre.xml', '_lab.xml', '_cal.xml']
    
    # Pattern to match <FILENAME>*.xml
    pattern = r'<FILENAME>(.*?\.xml)'
    
    matching_files = []
    
    try:
        # Find all matches
        matches = re.findall(pattern, content)
        
        for match in matches:
            # Skip FileSummary.xml
            if match == 'FilingSummary.xml':
                continue
                
            # Check if the file ends with any excluded suffix
            if not any(match.lower().endswith(suffix.lower()) for suffix in excluded_suffixes):
                matching_files.append(match)
    
    except FileNotFoundError:
        print(f"Error: File '{input_file}' not found")
    except Exception as e:
        print(f"Error reading file: {str(e)}")
    
    return matching_files

base_url = f"https://www.sec.gov/Archives/edgar/data/0000104169/000010416924000056"
accessionNumber = "0000104169-24-000056"

# Full txt submission file...
url = f"{base_url}/{accessionNumber}.txt"
print(f"Fetching ")
matches=find_xml_files(url)

content = """
<DOCUMENT>
<TYPE>EX-101.LAB
<SEQUENCE>17
<FILENAME>wmt-20240131_lab.xml
<DESCRIPTION>XBRL TAXONOMY EXTENSION LABEL LINKBASE DOCUMENT
<TEXT>
<DOCUMENT>
<TYPE>EX-101.LAB
<SEQUENCE>17
<FILENAME>wmt-20240131_pre.xml
<DESCRIPTION>XBRL TAXONOMY EXTENSION LABEL LINKBASE DOCUMENT
<TEXT>
<XBRL>
<DOCUMENT>
<TYPE>XML
<SEQUENCE>110
<FILENAME>wmt-20240131_htm.xml
<DESCRIPTION>IDEA: XBRL DOCUMENT
<TEXT>
<XML>
<DOCUMENT>
<TYPE>JSON
<SEQUENCE>108
<FILENAME>MetaLinks.json
<DESCRIPTION>IDEA: XBRL DOCUMENT
<TEXT>
<DOCUMENT>
<TYPE>EX-101.DEF
<SEQUENCE>16
<FILENAME>wmt-20240131_def.xml
<DESCRIPTION>XBRL TAXONOMY EXTENSION DEFINITION LINKBASE DOCUMENT
<TEXT>
<XBRL>
"""
matches = find_xml_files(response.text)
print(matches)
base_url = f"https://www.sec.gov/Archives/edgar/data/0000104169/000010416924000056/{matches[0]}"
print(base_url)


