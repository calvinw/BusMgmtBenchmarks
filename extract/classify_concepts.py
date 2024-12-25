import json
import csv
import sys
import os
import requests
from pprint import pprint
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

def transform_financial_data(data):
    result = {}
    
    for item in data:
        # Create new dict without the concept key
        value_dict = {
            "label": item["label"],
            "gaap_id": item["gaap_id"]
        }
        
        # Use the concept as the key
        result[item["concept"]] = value_dict
    
    return result

def remove_json_code_block(text):
    # Handle None or empty input
    if not text:
        return ""
    
    # Convert to string in case we get a different type
    text = str(text).strip()
    
    # Remove starting markers (handle variations)
    start_markers = ['```json', '```JSON', '``` json', '```\njson', '``` JSON']
    for marker in start_markers:
        if text.startswith(marker):
            text = text[len(marker):]
            break
    
    # Remove ending markers (handle variations)
    end_markers = ['```', '``` ', '\n```', '\n``` ']
    for marker in end_markers:
        if text.endswith(marker):
            text = text[:-len(marker)]
            break
    
    # Clean up any leftover whitespace and newlines at start/end
    text = text.strip()
    
    return text

def classify_facts(prompt):
    #print("Prompt:")
    #print(prompt)

    client = OpenAI(
      base_url="https://openrouter.ai/api/v1",
      api_key=os.getenv("OPENROUTER_API_KEY"),
    )

    try:
        response = client.chat.completions.create(
            #model="openai/gpt-4o-mini",
            model="google/gemini-flash-1.5",
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
    #print(prompt)
    response = classify_facts(prompt) 
    #print(response)

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

def create_concepts(company, year):

    income_file = f"facts/income-{company}-{year}.json"
    # read the income_file as a json file and call 
    with open(income_file, 'r') as f:
        income_facts_json = f.read()

    income_facts_dict = json.loads(income_facts_json)

    print("Classifying income concepts from ", income_file)
    income_str = classify_income_facts(income_facts_json)

    # read the balance_file as a json file and call 
    balance_file = f"facts/balance-{company}-{year}.json"
    with open(balance_file, 'r') as f:
        balance_facts_json = f.read()

    balance_facts_dict = json.loads(balance_facts_json)

    print("Classifying balance concepts from ", balance_file)
    balance_str = classify_balance_facts(balance_facts_json)

    python_income_list = json.loads(income_str)
    for item in python_income_list:
        item["location"] = "income"

    python_balance_list = json.loads(balance_str)
    for item in python_balance_list:
        item["location"] = "balance"

    concepts_list = python_income_list + python_balance_list

    output_file = f"concepts/concepts-{company}-{year}.json"
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w') as f:
        json.dump(concepts_list, f, indent=2)


if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python create_concepts.py <company> <year> <income facts json> <balance facts json>")
        sys.exit(1)
    income_file = sys.argv[3]
    balance_file = sys.argv[4]
    company = sys.argv[1]
    year = sys.argv[2]
    create_concepts(company, year, income_file, balance_file)
