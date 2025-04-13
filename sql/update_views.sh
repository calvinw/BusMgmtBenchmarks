#!/bin/bash

dolt sql < benchmark_views.sql 
dolt sql < segment_views.sql 
dolt sql < subsegment_views.sql 
dolt sql < segment_and_company_views.sql 
