import { useState } from 'react'
import { Dropdown } from './components/Dropdown'
import './App.css'

function App() {
  const [company, setCompany] = useState("Macy's")
  const [year, setYear] = useState('2024')

  const companyOptions = ["Macy's", "Nordstorm", "Dillard's", "Costco"]
  const yearOptions = ['2024', '2023', '2022', '2021']

  return (
    <div className="min-h-screen bg-white">
      {/* Exact Figma layout: 116px top padding, 63px horizontal padding, 40px gap */}
      <div className="pt-[116px] px-[63px]">
        <div className="flex flex-wrap gap-10">
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
      </div>
    </div>
  )
}

export default App
