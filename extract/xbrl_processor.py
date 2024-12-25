from bs4 import BeautifulSoup
import json
import os

class XBRLParser:
    def __init__(self):
        """Initialize the XBRL parser"""
        self.namespaces = {
            'us-gaap': 'http://fasb.org/us-gaap/',
            'dei': 'http://xbrl.sec.gov/dei/',
            'xbrli': 'http://www.xbrl.org/2003/instance'
        }

    def parse_file(self, xbrl_file, concepts_file):
        """
        Parse XBRL file using concepts from JSON file
        
        Args:
            xbrl_file: Path to XBRL file
            concepts_file: Path to concepts JSON file
        """
        try:
            # Read concepts file
            with open(concepts_file, 'r') as f:
                concepts = json.load(f)

            # Read XBRL file
            with open(xbrl_file, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f, 'xml')

            # Extract values for each concept
            updated_concepts = self._extract_values(soup, concepts)

            # Write updated concepts back to file
            with open(concepts_file, 'w') as f:
                json.dump(updated_concepts, f, indent=2)

            return updated_concepts

        except Exception as e:
            print(f"Error processing files: {str(e)}")
            return None

    def _extract_values(self, soup, concepts):
        """Extract values for each concept from XBRL"""
        context_periods = self._get_context_periods(soup)
        
        # Process each concept
        for concept in concepts:
            gaap_id = concept['gaap_id']
            
            # Remove 'us-gaap_' prefix if present in the file
            clean_gaap_id = gaap_id.replace('us-gaap_', '')
            
            # Try both with and without us-gaap prefix
            elements = (soup.find_all(gaap_id) or 
                      soup.find_all(f"us-gaap:{clean_gaap_id}") or 
                      soup.find_all(clean_gaap_id))

            max_value = 0
            # Find the highest value (usually the consolidated figure)
            for element in elements:
                if element and element.text.strip():
                    context_ref = element.get('contextRef')
                    if context_ref and context_ref in context_periods:
                        try:
                            value = float(element.text)
                            max_value = max(max_value, value)
                        except (ValueError, TypeError):
                            continue

            # Add the value to the concept
            concept['value'] = max_value

        return concepts

    def _get_context_periods(self, soup):
        """Extract period information from contexts"""
        contexts = {}
        for context in soup.find_all('context'):
            context_id = context.get('id')
            if context_id:
                period = context.find('period')
                if period:
                    instant = period.find('instant')
                    if instant and instant.text:
                        contexts[context_id] = instant.text
                    else:
                        end_date = period.find('endDate')
                        if end_date and end_date.text:
                            contexts[context_id] = end_date.text
        return contexts

def main():
    parser = XBRLParser()
    xbrl_file = 'burlington.xml'  # Your XBRL file
    concepts_file = 'concepts-burlington-2021.json'  # Your concepts JSON file
    
    if os.path.exists(xbrl_file) and os.path.exists(concepts_file):
        print(f"Processing XBRL file: {xbrl_file}")
        print(f"Using concepts from: {concepts_file}")
        
        results = parser.parse_file(xbrl_file, concepts_file)
        if results:
            print("\nProcessing complete. Values have been written to concepts.json")
    else:
        print("One or more input files not found")

if __name__ == "__main__":
    main()
