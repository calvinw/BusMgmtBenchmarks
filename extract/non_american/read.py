import pandas as pd

# Define the column names
columns = ['2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023']

# Initialize an empty list to store the data
data = []

# Read the file
with open('data.txt', 'r') as file:
    lines = file.readlines()

# Process the lines
i = 0
while i < len(lines):
    # Get the index (first line)
    index = lines[i].strip()
    i += 1

    # Get the next 10 lines as values
    values = []
    for _ in range(10):
        value = lines[i].strip()
        # Replace '-' with NaN
        if value == '-':
            value = float('nan')
        else:
            value = float(value.replace(',', ''))
        values.append(value)
        i += 1

    # Append the index and values to the data list
    data.append([index] + values)

# Create the DataFrame
df = pd.DataFrame(data, columns=['index'] + columns)

# Set the index column as the DataFrame index
df.set_index('index', inplace=True)

# Display the DataFrame
print(df)
