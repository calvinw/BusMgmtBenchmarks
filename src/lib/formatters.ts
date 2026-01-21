import { CURRENCY_MAP, CURRENCY_FIELDS, PERCENTAGE_FIELDS, RATIO_FIELDS } from './constants';

/**
 * Determines the format type for a field based on its name.
 * Works with both snake_case (from database) and display names.
 */
function getFieldType(fieldName: string): 'percentage' | 'currency' | 'ratio' | 'number' {
  // Check for percentage indicators
  if (
    fieldName.includes('%') ||
    fieldName.includes('_Percentage') ||
    fieldName.includes('CAGR') ||
    fieldName.includes('Return_on_Assets') ||
    fieldName.includes('Return on Assets') ||
    PERCENTAGE_FIELDS.has(fieldName)
  ) {
    return 'percentage';
  }

  // Check for ratio/turnover indicators
  if (
    fieldName.includes('Turnover') ||
    fieldName.includes('Ratio') ||
    fieldName.includes('_Ratio') ||
    fieldName.includes('Debt_to_Equity') ||
    fieldName.includes('Debt to Equity') ||
    RATIO_FIELDS.has(fieldName)
  ) {
    return 'ratio';
  }

  // Check for currency fields
  if (CURRENCY_FIELDS.has(fieldName)) {
    return 'currency';
  }

  return 'number';
}

/**
 * Gets the currency symbol for a company.
 * Returns '$' for US companies, or the appropriate symbol for international companies.
 */
export function getCurrencySymbol(company?: string): string {
  if (!company) return '$';
  return CURRENCY_MAP[company] || '$';
}

/**
 * Formats a numeric value based on its field name and optional company context.
 *
 * @param value - The value to format (can be number, string, null, or undefined)
 * @param fieldName - The name of the field (used to determine format type)
 * @param company - Optional company name (for currency symbol lookup)
 * @returns Formatted string representation of the value
 *
 * @example
 * formatValue(45.5, 'Gross Margin %') // "45.5%"
 * formatValue(1000000, 'Net Revenue', 'Walmart') // "$1,000,000"
 * formatValue(2.5, 'Current Ratio') // "2.5"
 * formatValue(null, 'Net Revenue') // "N/A"
 */
export function formatValue(
  value: number | string | null | undefined,
  fieldName: string,
  company?: string
): string {
  // Handle null/undefined/empty
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }

  const num = Number(value);
  if (isNaN(num)) {
    return String(value);
  }

  const fieldType = getFieldType(fieldName);

  switch (fieldType) {
    case 'percentage':
      return num.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }) + '%';

    case 'currency': {
      const symbol = getCurrencySymbol(company);
      return symbol + num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    }

    case 'ratio':
      return num.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      });

    default:
      return num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
  }
}

/**
 * Formats a value for display, returning a dash if no data is available.
 * Useful for comparison tables where missing data should show "-" instead of "N/A".
 */
export function formatValueOrDash(
  value: number | string | null | undefined,
  fieldName: string,
  company?: string
): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  return formatValue(value, fieldName, company);
}

/**
 * Formats a column header from snake_case to Title Case.
 *
 * @example
 * formatColumnHeader('net_revenue') // "Net Revenue"
 * formatColumnHeader('gross_margin_%') // "Gross Margin %"
 */
export function formatColumnHeader(header: string): string {
  return header
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Rounds a number to one decimal place.
 */
export function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}
