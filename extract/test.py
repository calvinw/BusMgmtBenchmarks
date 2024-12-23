import pandas as pd
import xmlschema
from xml.etree import ElementTree
import requests

headers = {
    "User-Agent": "FIT calvin_williamson@fitnyc.edu"
}

xml_url = "https://www.sec.gov/Archives/edgar/data/320193/000032019321000065/aapl-20210626_lab.xml"
xsd_url = "https://www.sec.gov/Archives/edgar/data/320193/000032019321000065/aapl-20210626.xsd"

print("Downloading and parsing files...")
xsd_response = requests.get(xsd_url, headers=headers)
xml_response = requests.get(xml_url, headers=headers)

with open('temp.xsd', 'w') as f:
    f.write(xsd_response.text)
with open('temp.xml', 'w') as f:
    f.write(xml_response.text)

try:
    xs = xmlschema.XMLSchema11('temp.xsd')
    xmlTmp_xbrl = xs.to_dict('temp.xml')
    
    # Create a dictionary to store GAAP tags and their labels
    gaap_labels = {}
    
    if 'link:labelLink' in xmlTmp_xbrl:
        label_links = xmlTmp_xbrl['link:labelLink']
        if isinstance(label_links, list):
            for link in label_links:
                # Get the labels
                labels = {}
                if 'link:label' in link:
                    for label in link['link:label']:
                        label_id = label.get('@id', '')
                        label_text = label.get('$', '')
                        if label_id.startswith('lab_us-gaap_'):
                            labels[label_id] = label_text
                
                # Match labels to concepts
                if 'link:loc' in link:
                    for loc in link['link:loc']:
                        label = loc.get('@xlink:label', '')
                        if label.startswith('loc_us-gaap_'):
                            concept = label.replace('loc_us-gaap_', '')
                            # Find corresponding label text
                            label_id = f"lab_us-gaap_{concept}"
                            if label_id in labels:
                                gaap_labels[concept] = labels[label_id]

    print("\nGAAP Concepts and Their Labels:")
    print("=" * 80)
    for concept, label in sorted(gaap_labels.items()):
        print(f"us-gaap:{concept}")
        print(f"Label: {label}")
        print("-" * 80)
    
    print(f"\nTotal number of GAAP concepts found: {len(gaap_labels)}")

except Exception as e:
    print(f"Error occurred: {e}")
