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

    prompt = f"""Below is a list of financial concepts (given inside the <concepts>
tags) to be found in the income statement and the balance sheet of a companies
10-K report. 

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

Find the concepts and their values in the income statement or the balance
sheet that follow. 

The income statement is enclosed in  <income_statment> tags. 
The balance sheet is enclosed in <balance_sheet> tags.

Here is the income statement:

<income_statement>
{income_statement_markdown}
</income_statement>

Here is the balance sheet:

<balance_sheet>
{balance_sheet_markdown}
</balance_sheet>

Please return the values found as strings in a json format as follows. Make
sure to provide a number for every concept. Respond only with with the
following format, no other commentary or discussion

Response format:
```json
{{
    "Net Revenue": <value>,
    "Cost of Goods": <value>, 
    "SG&A":  <value>,
    "Operating Profit": <value>,
    "Net Profit": <value>,
    "Inventory": <value>,
    "Current Assets": <value>,
    "Total Assets": <value>,
    "Current Liabilities": <value>,
    "Total Shareholder Equity": <value>,
    "Total Liabilities and Shareholder Equity": <value>
}}
```"""

    return prompt



def call_llm(prompt):

    try:
        client = OpenAI(
          base_url="https://openrouter.ai/api/v1",
          api_key=os.getenv("OPENROUTER_API_KEY")
        )
        response = client.chat.completions.create(
                # model="openai/gpt-4o-mini",
                # model="mistralai/ministral-8b",
                # model="google/gemini-flash-1.5",
                # model = "amazon/nova-micro-v1",
                # model ="meta-llama/llama-3.2-1b-instruct",
                model = "deepseek/deepseek-chat",
                messages=[
                    {"role": "system", "content": "You are a financial document expert assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0  # Using 0 temperature for more consistent responses
            )

        llm_response = response.choices[0].message.content

        print("Raw llm response:")
        print(llm_response)
        json_response = remove_json_code_block(llm_response)

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
    company = filing.obj()

    income_df = company.income_statement.to_dataframe()
    balance_df = company.balance_sheet.to_dataframe()

    income_df = income_df.iloc[:, :1]
    balance_df = balance_df.iloc[:, :1]

    income_markdown_table = income_df.to_markdown(index=True, floatfmt=".0f")
    balance_markdown_table = balance_df.to_markdown(index=True, floatfmt=".0f")

    prompt = setup_prompt(income_markdown_table, balance_markdown_table)

    # print("Prompt:")
    # print(prompt)

    llm_response_str = call_llm(prompt)
    
    # Convert JSON string to Python dictionary
    import json

    data= json.loads(llm_response_str)


    print(f"company: {company_name}")
    print(f"Filing: {filing.accession_number}, Date: {filing.filing_date}, Form: {filing.form}")
    print("")
    # print(f"LLM Response: company: {company_name}, date: {filing.filing_date}")
    # print(json.dumps(data, indent=2))
    print("")
    print(f"Income statement: {company_name}, date: {filing.filing_date}")
    print(income_markdown_table)
    print("")
    print(f"Balance sheet: {company_name}, date: {filing.filing_date}")
    print(balance_markdown_table)
    print("")

    return data

