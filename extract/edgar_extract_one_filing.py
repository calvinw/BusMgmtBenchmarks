from edgar import Filing
import pandas as pd
from datetime import datetime
import json
from typing import List, Tuple, Dict, Optional
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

import random

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

def setup_prompt(income_statement_markdown, balance_sheet_markdown):

    prompt = f"""Below is a list of financial concepts related to the income sheet
part of a 10-K report. Find the following financial concepts and values for the latest year.

<concepts>
Net Revenue
Cost of Goods
SG&A
Operating Profit
Net Profit
Inventory
Current Assets
Total Assets
Current Liabilities
Total Shareholder Equity
Total Liabilities and Shareholder Equity
</concepts>

Here is the income statement:

<income_statement>
{income_statement_markdown}
</income_statement>

Here is the balance sheet is:

<balance_sheet>
{balance_sheet_markdown}
</balance_sheet>

Response format:
```json
{{
    "Net Revenue": {{ "value": 1250000000, "label": "Total net revenue" }}, 
    "Cost of Goods": {{ "value": 750000000, "label": "Cost of goods sold" }},
    "SG&A": {{ "value": 200000000, "label": "Selling, general and administrative expenses" }},
    "Operating Profit": {{ "value": 300000000, "label": "Operating income" }},
    "Net Profit": {{ "value": 225000000, "label": "Net income" }},
    "Inventory": {{ "value": 180000000, "label": "Inventories, net" }},
    "Current Assets": {{ "value": 850000000, "label": "Total current assets" }},
    "Total Assets": {{ "value": 2100000000, "label": "Total assets" }},
    "Current Liabilities": {{ "value": 450000000, "label": "Total current liabilities" }},
    "Total Shareholder Equity": {{ "value": 1200000000, "label": "Total shareholders' equity" }},
    "Total Liabilities and Shareholder Equity": {{ "value": 2100000000, "label": "Total liabilities and shareholders' equity" }}
}}
```
"""

    return prompt



def call_llm(prompt):

    try:
        client = OpenAI(
          base_url="https://openrouter.ai/api/v1",
          api_key=os.getenv("OPENROUTER_API_KEY")
        )
        response = client.chat.completions.create(
                # model="openai/gpt-4o-mini",
                # model="google/openai/gpt-4o-mini",
                model="google/gemini-flash-1.5",
                # model = "deepseek/deepseek-chat",
                messages=[
                    {"role": "system", "content": "You are a financial document expert assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0  # Using 0 temperature for more consistent responses
            )

        response = response.choices[0].message.content
        # print(f"actual response")
        # print(response)

        json_response = remove_json_code_block(response)

        return json_response 

    except Exception as e:
        print(f"Error occurred: {str(e)}")
              

def process_filing(company_name: str, filing) -> Optional[Dict[str, str]]:
    """Process a single filing and return financial data.
    
    Args:
        company_name: Name of the company
        filing: Filing object from edgar library
    
    Returns:
        Dict containing financial data or None if processing fails
    """
    # Randomly fail 1 out of 5 times
    # if random.randint(1, 5) == 1:
    #     print("Random failure processing {company_name} filing {filing.accession_number}")
    #     return None

    company = filing.obj()

    income_df = company.income_statement.to_dataframe()
    balance_df = company.balance_sheet.to_dataframe()

    income_markdown_table = income_df.to_markdown(index=True, floatfmt=".0f")
    balance_markdown_table = balance_df.to_markdown(index=True, floatfmt=".0f")

    prompt = setup_prompt(income_markdown_table, balance_markdown_table)

    # print("Prompt:")
    # print(prompt)

    llm_response_str = call_llm(prompt)
    
    # Convert JSON string to Python dictionary
    import json
    llm_response = json.loads(llm_response_str)


    # data = {
    #     "Net Revenue": 1000000000,
    #     "Cost of Goods": 600000000,
    #     "SG&A": 200000000,
    #     "Operating Profit": 200000000,
    #     "Net Profit": 150000000,
    #     "Inventory": 300000000,
    #     "Current Assets": 500000000,
    #     "Total Assets": 2000000000,
    #     "Current Liabilities": 400000000,
    #     "Total Shareholder Equity": 1200000000, 
    #     "Total Liabilities and Shareholder Equity": 2000000000
    # }
    # return dummy_data

    data = {
        "Net Revenue": llm_response["Net Revenue"]["value"],
        "Cost of Goods": llm_response["Cost of Goods"]["value"],
        "SG&A": llm_response["SG&A"]["value"],
        "Operating Profit": llm_response["Operating Profit"]["value"],
        "Net Profit": llm_response["Net Profit"]["value"],
        "Inventory": llm_response["Inventory"]["value"],
        "Current Assets": llm_response["Current Assets"]["value"],
        "Total Assets": llm_response["Total Assets"]["value"],
        "Current Liabilities": llm_response["Current Liabilities"]["value"],
        "Total Shareholder Equity": llm_response["Total Shareholder Equity"]["value"],
        "Total Liabilities and Shareholder Equity": llm_response["Total Liabilities and Shareholder Equity"]["value"]
    }

    print(f"company: {company_name}")
    print(f"Filing: {filing.accession_number}, Date: {filing.filing_date}, Form: {filing.form}")
    print("")
    print(f"LLM Response: company: {company_name}, date: {filing.filing_date}")
    print(json.dumps(data, indent=2))
    print("")
    print(f"Income statement: {company_name}, date: {filing.filing_date}")
    print(income_markdown_table)
    print("")
    print(f"Balance sheet: {company_name}, date: {filing.filing_date}")
    print(balance_markdown_table)
    print("")

    return data

