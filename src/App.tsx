import { useState, useEffect } from 'react'
import { Dropdown } from './components/Dropdown'
import { Sidebar } from './components/Sidebar'
import './App.css'

interface FinancialData {
  company_name: string
  year: number
  reportDate: string
  'Net Revenue': number
  'Cost of Goods': number
  'Gross Margin': number
  'SGA': number
  'Operating Profit': number
  'Net Profit': number
  'Inventory': number
  'Current Assets': number
  'Total Assets': number
  'Current Liabilities': number
  'Liabilities': number
  'Total Shareholder Equity': number
  'Total Liabilities and Shareholder Equity': number
}

interface CompanyInfo {
  company: string
  currency: string
  units: string
}

const DOLT_API_BASE = 'https://www.dolthub.com/api/v1alpha1/calvinw/BusMgmtBenchmarks'

function App() {
  const [currentPage, setCurrentPage] = useState('Company vs Company')
  const [company, setCompany] = useState("Macy's")
  const [year, setYear] = useState('2024')
  const [companyOptions, setCompanyOptions] = useState<string[]>(["Macy's", "Nordstorm", "Dillard's", "Costco"])
  const [companyInfoMap, setCompanyInfoMap] = useState<Map<string, CompanyInfo>>(new Map())
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const yearOptions = ['2024', '2023', '2022', '2021', '2020', '2019']

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const query = 'SELECT company, currency, units FROM company_info ORDER BY company'
        const response = await fetch(`${DOLT_API_BASE}?q=${encodeURIComponent(query)}`)
        const data = await response.json()

        if (data.rows) {
          const companies = data.rows.map((row: any) => row.company)
          const infoMap = new Map<string, CompanyInfo>()

          data.rows.forEach((row: any) => {
            infoMap.set(row.company, {
              company: row.company,
              currency: row.currency || 'USD',
              units: row.units || 'thousands'
            })
          })

          setCompanyOptions(companies)
          setCompanyInfoMap(infoMap)
          if (companies.length > 0) {
            setCompany(companies[0])
          }
        }
      } catch (err) {
        console.error('Error fetching companies:', err)
        setError('Failed to fetch companies')
      }
    }

    fetchCompanies()
  }, [])

  // Fetch financial data when company or year changes
  useEffect(() => {
    if (!company || !year) return

    const fetchFinancialData = async () => {
      setLoading(true)
      setError(null)

      try {
        const financialsQuery = `SELECT * FROM financials WHERE company_name = '${company}' AND year = ${year}`
        const financialsResponse = await fetch(`${DOLT_API_BASE}?q=${encodeURIComponent(financialsQuery)}`)
        const financialsData = await financialsResponse.json()

        if (financialsData.rows && financialsData.rows.length > 0) {
          setFinancialData(financialsData.rows[0])
        } else {
          setFinancialData(null)
          setError('No financial data found for this company and year')
        }
      } catch (err) {
        console.error('Error fetching financial data:', err)
        setError('Failed to fetch financial data')
        setFinancialData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchFinancialData()
  }, [company, year])

  const formatCurrency = (value: number, currencyCode: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const currentCompanyInfo = companyInfoMap.get(company)
  const currentCurrency = currentCompanyInfo?.currency || 'USD'

  const renderPageContent = () => {
    switch (currentPage) {
      case 'Company vs Company':
        return (
          <div className="p-8">
            <h1 className="text-[24px] font-semibold mb-6 text-[#0A0A0A]">
              Company vs Company
            </h1>
            
            <div className="flex flex-wrap gap-10 mb-8">
              <Dropdown
                label="Company"
                options={companyOptions}
                value={company}
                onChange={setCompany}
              />
              <Dropdown
                label="Year"
                options={yearOptions}
                value={year}
                onChange={setYear}
              />
            </div>

            {/* Financial Data Table */}
            {loading && (
              <div className="text-[14px] text-[#737373]">Loading financial data...</div>
            )}

            {error && (
              <div className="text-[14px] text-red-600">{error}</div>
            )}

            {financialData && !loading && (
              <div className="mt-8">
                <h2 className="text-[20px] font-semibold mb-4 text-[#0A0A0A]">
                  Financial Data - {financialData.company_name} ({financialData.year})
                </h2>
                <table className="w-full border-collapse border border-[#E5E5E5]">
                  <thead>
                    <tr className="bg-[#F5F5F5]">
                      <th className="border border-[#E5E5E5] px-4 py-2 text-left text-[14px] font-semibold text-[#0A0A0A]">
                        Metric
                      </th>
                      <th className="border border-[#E5E5E5] px-4 py-2 text-right text-[14px] font-semibold text-[#0A0A0A]">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-[14px] text-[#0A0A0A]">Net Revenue</td>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-right text-[14px] text-[#0A0A0A]">
                        {formatCurrency(financialData['Net Revenue'], currentCurrency)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-[14px] text-[#0A0A0A]">Cost of Goods</td>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-right text-[14px] text-[#0A0A0A]">
                        {formatCurrency(financialData['Cost of Goods'], currentCurrency)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-[14px] text-[#0A0A0A]">Gross Margin</td>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-right text-[14px] text-[#0A0A0A]">
                        {formatCurrency(financialData['Gross Margin'], currentCurrency)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-[14px] text-[#0A0A0A]">SG&A</td>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-right text-[14px] text-[#0A0A0A]">
                        {formatCurrency(financialData['SGA'], currentCurrency)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-[14px] text-[#0A0A0A]">Operating Profit</td>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-right text-[14px] text-[#0A0A0A]">
                        {formatCurrency(financialData['Operating Profit'], currentCurrency)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-[14px] text-[#0A0A0A]">Net Profit</td>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-right text-[14px] text-[#0A0A0A]">
                        {formatCurrency(financialData['Net Profit'], currentCurrency)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-[14px] text-[#0A0A0A]">Inventory</td>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-right text-[14px] text-[#0A0A0A]">
                        {formatCurrency(financialData['Inventory'], currentCurrency)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-[14px] text-[#0A0A0A]">Current Assets</td>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-right text-[14px] text-[#0A0A0A]">
                        {formatCurrency(financialData['Current Assets'], currentCurrency)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-[14px] text-[#0A0A0A]">Total Assets</td>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-right text-[14px] text-[#0A0A0A]">
                        {formatCurrency(financialData['Total Assets'], currentCurrency)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-[14px] text-[#0A0A0A]">Current Liabilities</td>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-right text-[14px] text-[#0A0A0A]">
                        {formatCurrency(financialData['Current Liabilities'], currentCurrency)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-[14px] text-[#0A0A0A]">Total Liabilities</td>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-right text-[14px] text-[#0A0A0A]">
                        {formatCurrency(financialData['Liabilities'], currentCurrency)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-[14px] text-[#0A0A0A]">Total Shareholder Equity</td>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-right text-[14px] text-[#0A0A0A]">
                        {formatCurrency(financialData['Total Shareholder Equity'], currentCurrency)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-[14px] text-[#0A0A0A]">
                        Total Liabilities and Shareholder Equity
                      </td>
                      <td className="border border-[#E5E5E5] px-4 py-2 text-right text-[14px] text-[#0A0A0A]">
                        {formatCurrency(financialData['Total Liabilities and Shareholder Equity'], currentCurrency)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      
      case 'Company vs Segment':
        return (
          <div className="p-8">
            <h1 className="text-[24px] font-semibold mb-6 text-[#0A0A0A]">
              Company vs Segment
            </h1>
            <div className="text-[14px] text-[#737373]">
              Company vs Segment comparison view - Coming soon
            </div>
          </div>
        );
      
      case 'Reports':
        return (
          <div className="p-8">
            <h1 className="text-[24px] font-semibold mb-6 text-[#0A0A0A]">
              Reports
            </h1>
            <div className="text-[14px] text-[#737373]">
              Reports dashboard - Coming soon
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
      />
      <div className="flex-1 overflow-auto">
        {renderPageContent()}
      </div>
    </div>
  )
}

export default App
