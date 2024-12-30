import json
import csv
import sys
import os
import requests
from pprint import pprint
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

def detect_monetary_units(text):
    # Convert text to lowercase for case-insensitive matching
    text = text.lower()
    
    # Look for specific phrases
    if "$ in millions" in text:
        return "Millions"
    elif "$ in thousands" in text:
        return "Thousands"
    else:
        return "Dollars"

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

def classify_concepts(prompt):
    print("OpenAI client")
    client = OpenAI(
      base_url="https://openrouter.ai/api/v1",
      api_key=os.getenv("OPENROUTER_API_KEY"),
    )

    print("Calling LLM")
    try:
        response = client.chat.completions.create(
            # model="openai/gpt-4o-mini",
            # model="google/openai/gpt-4o-mini",
            model="google/gemini-flash-1.5",
            #model = "deepseek/deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a financial document expert assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.0  # Using 0 temperature for more consistent responses
        )
        
        # Extract the response json 
        print("got response")
        response_json = response.choices[0].message.content
        # print("Original response")
        # print(response_json)

        json_str = remove_json_code_block(response_json)
        
        return json.loads(json_str)  # Parse the JSON string into a Python object
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return []  # Return empty list in case of error

def classify_income_facts(income_html):

    print(income_html)

    # Open the HTML file and read it as text
    with open(income_html, 'r', encoding='utf-8') as file:
        html_content = file.read()

    units = detect_monetary_units(html_content)
    print("units are ", units)

    income_label_example = """<td class="pl " style="border-bottom: 0px;" valign="top"><a class="a" href="javascript:void(0);" onclick="top.Show.showAR( this, 'defref_us-gaap_ProfitLoss', window );">Net income (loss)</a></td>"""


    #print(html_content[:100])

    # Construct the prompt
    prompt = f"""Below is a list of financial concepts related to the income statement part of a 10-K report. Can you find the following concepts and values for the latest year (marked as "12 Months Ended" usually)

<concepts>
Net Revenue
Cost of Goods
SG&A
Operating Profit
Net Profit
</concepts>

<incomedocument>
{html_content}
</incomedocument>

Here is an example of how the label is found in the html text:
<example>
{income_label_example}
</example>

Here the label is "Net income(loss)"

The units for this report are in:
{units}

So you need to adjust all numbers to be in units of Thousands.

- If the numbers are giving in Thousands you can use as is. 
- If the numbers are given in Millions, then multiply by 1000. 
- If the units are in dollars, then divide by 1000. 

Your response will only include the json list of concepts that you identify. Nothing more.

Response:
```json
[
   {{
       'label': 'Total Revenue',
       'concept': 'Net Revenue',
       'value':  a number,
       'name': 'us-gaap_RevenueFromContractWithCustomerExcludingAssessedTax'
   }},
   ... other concepts and values...
]
```
"""
    # print("Income Prompt:")
    # print(prompt)
    response = classify_concepts(prompt) 
    #print("Income LLM response")
    # print(json.dumps(response, indent=2))
    return response


def classify_balance_facts(balance_html):

    # Open the HTML file and read it as text
    with open(balance_html, 'r', encoding='utf-8') as file:
        html_content = file.read()

    units = detect_monetary_units(html_content)
    print("units are ", units)

    balance_label_example = """<td class="pl " style="border-bottom: 0px;" valign="top"><a class="a" href="javascript:void(0);" onclick="top.Show.showAR( this, 'defref_us-gaap_LiabilitiesCurrent', window );">Total current liabilities</a></td>"""

    prompt = f"""Below is a list of financial concepts related to the balance sheet part of a 10-K report. Can you find the following concepts and values for the latest year (marked as "12 Months Ended" usually)

CONCEPTS:
Inventory
Current Assets
Total Assets
Current Liabilities
Total Shareholder Equity
Total Liabilities and Shareholder Equity

THE HTML FOR THE BALANCE STATEMENT:
```html
{html_content}
```
Here is an example of how the label is found in the html text:
{balance_label_example}

Here the label is "Total current liabilities"

The units for this report are in:
{units}

So you need to adjust all numbers to be in units of Thousands.

- If the numbers are giving in Thousands you can use as is. 
- If the numbers are given in Millions, then multiply by 1000. 
- If the units are in dollars, then divide by 1000. 

Your response will only include the json list of concepts that you identify.

Response:
```json
[
   {{
       'label': 'Merchandise inventories',
       'concept': 'Inventory',
       'value':  a number,
       'name': "us-gaap_InventoryNet"
   }}
   ... other concepts and values...
]
```
"""

    #print("Balance Prompt:")
    #print(prompt)
    response = classify_concepts(prompt) 
    # print("Balance LLM response")
    # print(json.dumps(response, indent=2))
    return response

