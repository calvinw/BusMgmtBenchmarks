# Company-Specific Notes

Per-company quirks discovered during validation. Check this file in Step 4 for the company being analyzed.

Add new entries here whenever a new pattern is discovered for a company — this file grows over time.

---

## TheRealReal (TRR)

**Segment:** Specialty → Consignment/Resale marketplace

**SGA construction:**
- Include: `us-gaap_SellingGeneralAndAdministrativeExpense` + `us-gaap_MarketingExpense`
- Exclude: `real_OperationsAndTechnologyExpense` (platform infrastructure cost — see Rule 2 in anomaly-rules.md)
- FY2024 correct SGA = $243,000K (SGA $187,737K + Marketing $55,256K)
- Former incorrect Dolt value: $485,571K (was wrongly including Ops & Tech)

**Inventory:** NULL — pure consignment model, holds no owned inventory.

**Equity:** Negative Total Shareholder Equity is expected and valid.

**Gross margin:** ~70%+ is normal for consignment model (net revenue is net of consignor payouts).

---

## Walmart (WMT)

**Segment:** Discount

**SGA:** Single combined SGA line in SEC filing — no separate marketing or ops split. Use directly.

**Fiscal year:** Ends late January (e.g. FY2024 ends ~Jan 31, 2024). reportDate will be in January, not December.

**Inventory:** Large positive value expected. A missing or small inventory figure is [ERROR].

---

## Macy's (M)

**Segment:** Department Stores

**SGA:** Single combined line. Yahoo and SEC generally agree. Use SEC.

**Fiscal year:** Ends late January/early February.

**Notes:** Multi-year data verified from SEC and Yahoo — values consistent.

---

## Costco (COST)

**Segment:** Warehouse Clubs

**Gross margin:** Unusually low (~13%) is correct for warehouse club model — bulk pricing, low markup.

**Membership fees:** Reported separately as revenue; included in Net Revenue total.

**Fiscal year:** Ends late August.

---

## Amazon (AMZN)

**Segment:** Online

**SGA:** Separate "Technology and content" and "General and administrative" lines. Do NOT add "Technology and content" to SGA — it is a product/platform cost. Use G&A only, or SGA as labeled.

**Inventory:** Amazon carries physical inventory for its retail segment; include.

**Fiscal year:** Calendar year (ends Dec 31).

---

## Non-US Companies

The following companies are in the DB but have no SEC filings. Skip the SEC fetch step; use Yahoo only and flag that SEC data is unavailable.

- Louis Vuitton (LVMUY)
- H&M (HNNMY)
- Adidas (ADDYY)
- Inditex / Zara (IDEXY)
- Aritzia (ATZ.TO)
- Ahold Delhaize (ADRNY)
- ASOS (ASOS.L)

---

*Add new company entries below as patterns are discovered.*
