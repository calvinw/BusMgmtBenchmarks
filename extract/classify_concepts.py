import json
import csv
import sys
import os
import requests
from pprint import pprint
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

def parse_financial_value(value_str):
    """
    Convert a financial string value to a float, handling parentheses for negative numbers.
    
    Args:
        value_str (str): The financial value as a string, e.g., "1,234" or "(1,234)"
        
    Returns:
        float: The converted value as a float, with parentheses values converted to negative numbers
        
    Examples:
        >>> parse_financial_value("1,234")
        1234.0
        >>> parse_financial_value("(1,234)")
        -1234.0
    """
    # Remove any whitespace
    value_str = value_str.strip()
    
    # Check if the value is in parentheses
    is_negative = value_str.startswith('(') and value_str.endswith(')')
    
    # Remove parentheses if they exist
    if is_negative:
        value_str = value_str[1:-1]
    
    # Remove any commas
    value_str = value_str.replace(',', '')
    
    # Convert to float
    value = float(value_str)
    
    # Make negative if it was in parentheses
    if is_negative:
        value = -value
        
    return value

def convert_to_thousands(financial_data, input_unit='dollars'):
    if input_unit not in ['dollars', 'thousands', 'millions']:
        raise ValueError("input_unit must be 'dollars', 'thousands', or 'millions'")
        
    conversion_factors = {
        'dollars': 1/1000,    # Divide by 1000 to convert dollars to thousands
        'thousands': 1,       # No conversion needed
        'millions': 1000      # Multiply by 1000 to convert millions to thousands
    }
    
    conversion_factor = conversion_factors[input_unit]
    converted_data = []
    
    for item in financial_data:
        # Create a copy of the item to avoid modifying the original
        new_item = item.copy()
        
        try:
            # Use the new parse_financial_value function
            original_value = parse_financial_value(item['value'])
            value_in_thousands = original_value * conversion_factor
            
            # Format with parentheses for negative values
            # if value_in_thousands < 0:
            #     new_item['value'] = f"({abs(value_in_thousands):,.0f})"
            # else:
            new_item['value'] = f"{value_in_thousands:,.0f}"
                
        except (KeyError, ValueError) as e:
            print(f"Error processing item {item}: {e}")
            continue
            
        converted_data.append(new_item)
    
    return converted_data

def transform_financial_data(data):
    result = {}
    
    for item in data:
        # Create new dict without the concept key
        value_dict = {
            "label": item["label"],
            "value": item["value"],
            "gaap_id": item["gaap_id"]
        }
        
        # Use the concept as the key
        result[item["concept"]] = value_dict
    
    return result

def remove_json_code_block(text):
    if text.startswith('```json'):
        text = text[7:]  # Remove the '```json' part from the start
    if text.endswith('```'):
        text = text[:-3]  # Remove the '```' part from the end
    return text.strip()  # Strip any extra whitespace that may have been left behind

def classify_facts(prompt):
    #print("Prompt:")
    #print(prompt)

    client = OpenAI(
      base_url="https://openrouter.ai/api/v1",
      api_key=os.getenv("OPENROUTER_API_KEY"),
    )

    try:
        response = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a financial document expert assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.0  # Using 0 temperature for more consistent responses
        )
        
        # Extract the response json 
        response_json = response.choices[0].message.content
        #print(response_json)
        json = remove_json_code_block(response_json)
        
        return json 
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")


def classify_income_facts(income_facts_json):

    # Construct the prompt
    prompt = f"""Below is a list of financial concept names that we wish to identify in the passed json object. Find the closest match to the concepts by looking at the "label", "definition" and "gaap_id" fields. Keep in mind that Net Revenue (also called Net Sales sometimes) is usually not associated with a Total Revenues

<concepts>
Net Revenue
Cost of Goods
SG&A
Operating Profit
Net Profit
</concepts>

<json>
{income_facts_json}
</json>

Can you add a field to the json of the corresponding object called "concept" with the value as the name of the concept above. The returned json should exclude any objects that you do not add a "concept" field to. Also the returned object need can exclude the "description" filed. So the returned json will just have 5 objects corresponding to the 5 concepts we are trying to find, and each of these objects will have "label", "value", "gaap_id" and "concept" fields only.

Your response will be like this:
[
   The json of the five objects that you identify
]
"""
    response = classify_facts(prompt) 

    return response 

def classify_balance_facts(balance_facts_json):

    # Construct the prompt
    prompt = f"""Below is a list of financial concept names that we wish to identify in the passed json object.  

<concepts>
Inventory
Current Assets
Total Assets
Current Liabilities
Total Shareholder Equity
Total Liabilities and Shareholder Equity
</concepts>

<json>
{balance_facts_json}
</json>

Can you add a field to the json of the corresponding object called "concept" with the value as the name of the concept above. The returned json should exclude any objects that you do not add a "concept" field to. Also the returned object need can exclude the "description" filed. So the returned json will just have 6 objects corresponding to the 6 concepts we are trying to find, and each of these objects will have "label", "units", "value", "gaap_id" and "concept" fields only.

Your response will be like this:
[
   The json of the five objects that you identify
]
"""
    response = classify_facts(prompt) 

    return response 

def create_concepts(company, year, income_file, balance_file):
   
    # read the income_file as a json file and call 
    with open(income_file, 'r') as f:
        income_facts_json = f.read()

    income_facts_dict = json.loads(income_facts_json)

    print("Classifying income concepts from ", income_file)
    income_str = classify_income_facts(income_facts_json)

    # read the balance_file as a json file and call 
    with open(balance_file, 'r') as f:
        balance_facts_json = f.read()

    balance_facts_dict = json.loads(balance_facts_json)

    print("Classifying balance concepts from ", balance_file)
    balance_str = classify_balance_facts(balance_facts_json)

    python_income_list = json.loads(income_str)
    python_balance_list = json.loads(balance_str) 

    print("Income facts title :")
    print(income_facts_dict["title"])
    print("Income facts headers :")
    print(income_facts_dict["headers"])
    units_text = income_facts_dict["title"]
    units = "dollars" # default to dollars
    if "$ in Millions" in units_text:
       units = "millions"
    elif "$ in Thousands" in units_text:
       units = "thousands"
    print("python_income_list")
    print("units: ", units)
    converted_income_list = convert_to_thousands(python_income_list, units)
    print(json.dumps(converted_income_list, indent=2))

    print("Balance facts title:")
    print(balance_facts_dict["title"])
    print("Balance facts headers :")
    print(balance_facts_dict["headers"])
    units_text = balance_facts_dict["title"]
    units = "dollars" # default to dollars
    if "$ in Millions" in units_text:
       units = "millions"
    elif "$ in Thousands" in units_text:
       units = "thousands"
    print("python_balance_list")
    print("units: ", units)
    converted_balance_list = convert_to_thousands(python_balance_list, units)
    print(json.dumps(converted_balance_list, indent=2))

    concepts_list = converted_income_list + converted_balance_list 

    data = transform_financial_data(concepts_list)
    #print(json.dumps(data, indent=2))

    # print("Example of net revenue value")
    # print(data["Net Revenue"]["value"])

    # Save the concepts to a json file
    output_file = f"concepts/concepts-{company}-{year}.json"
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)


if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python create_concepts.py <company> <year> <income facts json> <balance facts json>")
        sys.exit(1)
    income_file = sys.argv[3]
    balance_file = sys.argv[4]
    company = sys.argv[1]
    year = sys.argv[2]
    create_concepts(company, year, income_file, balance_file)
