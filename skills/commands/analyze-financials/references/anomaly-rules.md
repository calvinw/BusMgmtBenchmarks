# Anomaly Detection Rules

Apply all rules in Step 4 of analyze-financials. Flag issues as [WARNING] or [ERROR].

---

## SGA Composite Rules

SGA is the most error-prone field. Companies report selling, general & administrative costs differently. These four rules cover the most common patterns.

### Rule 1 — SGA + Marketing (traditional retailers)

**Trigger:** SEC filing has both `us-gaap_SellingGeneralAndAdministrativeExpense` AND `us-gaap_MarketingExpense` as separate line items.

**Action:** Recommended SGA = SGA line + Marketing line.

**Rationale:** Traditional retailers split these for segment reporting but the DB tracks combined SGA. Omitting marketing understates SGA.

### Rule 2 — Exclude platform/ops-tech costs (marketplace companies)

**Trigger:** SEC filing has a company-specific operations/technology line (e.g. `real_OperationsAndTechnologyExpense`, or a line labelled "Operations and Technology", "Platform Costs", "Technology and Infrastructure").

**Action:** Exclude this line from SGA. Do NOT add it to the SGA total.

**Rationale:** For marketplace/consignment companies this is a platform infrastructure cost analogous to COGS at a traditional retailer. Including it inflates SGA and destroys comparability.

**Prototype case — TheRealReal FY2024:**
- `us-gaap_SellingGeneralAndAdministrativeExpense`: $187,737K
- `us-gaap_MarketingExpense`: $55,256K
- `real_OperationsAndTechnologyExpense`: $260,827K ← EXCLUDE
- **Correct DB value: $243,000K** (SGA + Marketing only)
- Wrong value if Ops & Tech included: $503,564K

### Rule 3 — Don't trust Yahoo SGA when it equals Total Operating Expenses

**Trigger:** Yahoo SGA ≈ Total Operating Expenses from the SEC filing (within 2%).

**Action:** Flag `[WARNING]`. Do not use Yahoo for SGA for this company. Use SEC directly.

**Rationale:** Yahoo sometimes sums all operating line items and reports the total as "SGA". This inflates SGA to include COGS, D&A, restructuring, etc.

### Rule 4 — Sum G&A + Selling when no combined tag exists

**Trigger:** No `us-gaap_SellingGeneralAndAdministrativeExpense` tag; instead, separate `us-gaap_GeneralAndAdministrativeExpense` and `us-gaap_SellingExpense` lines.

**Action:** Recommended SGA = G&A + Selling.

---

## Never Include in SGA

- `us-gaap_RestructuringCharges` — one-time; exclude always
- `us-gaap_DepreciationAndAmortization` if reported separately — already in operating expenses elsewhere
- Impairment charges, goodwill write-downs, legal settlements
- Any line labelled "Other operating expenses" unless it is the only remaining SGA-type line

---

## Balance Sheet Rules

### Identity check [ERROR if fails]

`Total Assets` must equal `Total Liabilities and Shareholder Equity` (within rounding, i.e. ≤ $1K difference).

If they don't match, the filing data was extracted incorrectly. Do not insert until resolved.

### Derived fields

- `Gross Margin` = Net Revenue − Cost of Goods (calculate; do not trust source directly)
- `Liabilities` = Total Assets − Total Shareholder Equity (calculate)
- Verify: `Liabilities` + `Total Shareholder Equity` = `Total Liabilities and Shareholder Equity`

### Negative equity [WARNING]

Flag negative `Total Shareholder Equity` explicitly. It is valid (e.g. TheRealReal, heavily leveraged retailers) but should be confirmed before inserting.

---

## Gross Margin Sanity Check

Use these benchmarks by retail segment. Flag `[WARNING]` if outside range.

| Segment | Expected Gross Margin % |
|---------|------------------------|
| Discount (Walmart, Target, Dollar stores) | 10–30% |
| Warehouse Clubs (Costco, BJ's) | 10–15% |
| Off Price (TJ Maxx, Ross) | 28–32% |
| Department Stores (Macy's, Nordstrom) | 35–45% |
| Grocery | 22–28% |
| Health & Pharmacy | 18–25% |
| Home Improvement | 30–35% |
| Specialty (apparel, beauty, etc.) | 35–55% |
| Online/Marketplace (Wayfair, Chewy) | 25–35% |
| Consignment/Marketplace (TheRealReal) | 60–80% |

---

## Restatement Rule

Later filings restate prior-year numbers (e.g. a 2024 10-K contains restated 2023 figures).

**Always use the most recent filing version** for any given year. If the 2024 SEC filing contains FY2023 comparatives that differ from what is in the Dolt DB, flag `[WARNING]` and note the restated values.

---

## Inventory Rule

Set `Inventory = NULL` for pure marketplace/consignment companies that hold no physical inventory (e.g. TheRealReal, ASOS marketplace segment).

For traditional retailers, a NULL or zero inventory is `[ERROR]` — investigate.

---

## Revenue Recognition

Some companies (e.g. consignment retailers) report Net Revenue net of consignor payouts; others report Gross Revenue. Flag `[WARNING]` if gross margin % is unusually high (>60%) for a non-marketplace company — may indicate revenue recognition difference vs. peers.
