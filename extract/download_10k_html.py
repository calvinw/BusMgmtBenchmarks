from edgar import *

set_identity('calvin_williamson@fitnyc.edu')

target = Company("27419")
target_facts = target.get_facts()

df = target_facts.to_pandas()

print(df.head(30))
