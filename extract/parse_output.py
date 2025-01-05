import re
from typing import Dict, List, Union

def parse_number_pairs(text: str) -> List[Dict[str, Union[str, float]]]:
    """
    Parses key:value pairs from text where values are numbers.
    Handles formats like:
    Key: 123.45
    Another Key: -42
    Some Metric: 3.14159
    
    Returns list of dicts with 'key' and 'value' fields.
    """
    # Clean the input text
    lines = text.split('\n')
    lines = [line.strip() for line in lines if line.strip()]
    
    # Pattern matches "key: number" with flexible whitespace
    pattern = r'^(.*?):\s*([-+]?\d*\.?\d+)\s*$'
    
    results = []
    
    for line in lines:
        match = re.match(pattern, line)
        if match:
            key = match.group(1).strip()
            try:
                value = float(match.group(2))
                results.append({
                    'key': key,
                    'value': value
                })
            except ValueError:
                continue
    
    return results

def format_prompt_for_numbers() -> str:
    """
    Returns a prompt template that encourages LLMs to output numbers in a simple key:value format.
    """
    return """Please provide the results in a key:value format like this:
Key: number
Another Key: number

For example:
Temperature: 98.6
Pressure: 14.7"""

# Example usage and testing
if __name__ == "__main__":
    # Test various formats
    test_input = """
Revenue: 1234.56

Growth Rate: 7.8
 Customer Count: 9012
 Negative Value: -42
Decimal: 3.14159
    """
    
    results = parse_number_pairs(test_input)
    
    # Print structured results
    for item in results:
        print(f"Key: {item['key']}, Value: {item['value']}")
