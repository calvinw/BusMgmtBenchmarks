#!/bin/bash

# Array of company names
companies=(
    "walmart"
    "target"
    "dollar_general"
    "dollar_tree"
    "five_below"
    "costco"
    "bjs"
    "tj_maxx"
    "ross"
    "burlington"
    "macys"
    "nordstrom"
    "dillards"
    "kohls"
    "amazon"
    "wayfair"
    "chewy"
    "ulta_beauty"
    "bbb"
    "victorias_secret"
    "signet_jewelers"
    "tapestry"
    "capri_holdings"
    "lululemon"
    "boot_barn"
    "footlocker"
    "nike"
    "af"
    "american_eagle"
    "urban_outfitters"
    "gap"
    "levi"
    "dicks"
    "academy_sports"
    "best_buy"
    "yeti"
    "sherwin_williams"
    "rh"
    "william_sonoma"
    "home_depot"
    "lowes"
    "tractor_supply"
    "kroger"
    "albertsons"
    "walgreens"
    "cvs"
    "rite_aid"
)

# Loop through companies
for company in "${companies[@]}"
do
    # Loop through years
    for year in {2019..2024}
    do
        income_file="income-${company}-${year}.html"
        balance_file="balance-${company}-${year}.html"
        output_file="${company}-${year}.html"
        
        # Check if both input files exist
        if [ -f "$income_file" ] && [ -f "$balance_file" ]; then
            echo "Processing ${company} for year ${year}..."
            python combine.py "$income_file" "$balance_file" "$output_file"
        else
            echo "Skipping ${company} for year ${year} - files not found"
        fi
    done
done

echo "Processing complete!"
