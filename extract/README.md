
Please refer to the document below for an overview: 

[Using an Large Language Model to Identify Financial Concepts from 10-K Reports](https://github.com/calvinw/BusMgmtBenchmarks/extract/llm_for_10K_financial_data.html)

[To be Completed description of the scripts that run to extract the data]

Rough first version of these docs:

```bash
python edgar_extract_all_filings.py
```

Once this is finished it creates a file called mock_extracted_financial_data.csv

When you are ready to move collected data to use by the webapps, you move this
file to replace the extracted_financial_data.csv file in the main directory
(above this one) and you run the scripts there to create the calculated fields
and the benchmarks and segment analyisis data files. Will provide more details
of this soon
