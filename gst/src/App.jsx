import { useState } from 'react'
import './App.css'

// Sample CSV data as string
const sample2B = `Invoice ID,Supplier GSTIN,2B Amount\nINV123,29ABCDE1234F1Z5,10000\nINV124,29ABCDE1234F1Z5,8500`
const sample3B = `Invoice ID,Supplier GSTIN,3B Amount\nINV123,29ABCDE1234F1Z5,8500\nINV124,29ABCDE1234F1Z5,8500`

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    file1: null,
    file2: null
  })
  const [errors, setErrors] = useState({})
  const [results, setResults] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    const file = files[0]
    
    if (file) {
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          [name]: 'Please upload a CSV or XLSX file'
        }))
        return
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: file
      }))
      
      // Clear error
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }))
      }
    }
  }

  const parseCSV = (text) => {
    const lines = text.split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    const data = []
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim())
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        data.push(row)
      }
    }
    
    return data
  }

  const parseAmount = (amountStr) => {
    if (!amountStr) return 0
    // Remove ₹ symbol and commas, then convert to number
    return parseFloat(amountStr.replace(/[₹,]/g, '')) || 0
  }

  const detectMismatches = (file2BData, file3BData) => {
    const results = []
    const processedInvoices = new Set()

    // Process each row in 2B file
    file2BData.forEach(row2B => {
      const invoiceId = row2B['Invoice ID']
      if (!invoiceId) return

      // Find matching row in 3B file
      const matchingRow3B = file3BData.find(row3B => row3B['Invoice ID'] === invoiceId)
      
      if (matchingRow3B) {
        const amount2B = parseAmount(row2B['2B Amount'])
        const amount3B = parseAmount(matchingRow3B['3B Amount'])
        const difference = amount2B - amount3B
        const absDifference = Math.abs(difference)
        
        const status = absDifference > 100 ? 'Mismatch' : 'Match'
        
        results.push({
          'Invoice ID': invoiceId,
          'Supplier GSTIN': row2B['Supplier GSTIN'] || matchingRow3B['Supplier GSTIN'],
          '2B Amount': row2B['2B Amount'],
          '3B Amount': matchingRow3B['3B Amount'],
          'Diff': `₹${difference.toLocaleString()}`,
          'Status': status
        })
        
        processedInvoices.add(invoiceId)
      } else {
        // Invoice found in 2B but not in 3B
        results.push({
          'Invoice ID': invoiceId,
          'Supplier GSTIN': row2B['Supplier GSTIN'],
          '2B Amount': row2B['2B Amount'],
          '3B Amount': 'Not Found',
          'Diff': 'N/A',
          'Status': 'Missing in 3B'
        })
      }
    })

    // Find invoices in 3B but not in 2B
    file3BData.forEach(row3B => {
      const invoiceId = row3B['Invoice ID']
      if (!invoiceId || processedInvoices.has(invoiceId)) return
      
      results.push({
        'Invoice ID': invoiceId,
        'Supplier GSTIN': row3B['Supplier GSTIN'],
        '2B Amount': 'Not Found',
        '3B Amount': row3B['3B Amount'],
        'Diff': 'N/A',
        'Status': 'Missing in 2B'
      })
    })

    return results
  }

  const processFiles = async () => {
    setIsProcessing(true)
    
    try {
      let file2BText, file3BText
      if (formData.file1 && formData.file2) {
        file2BText = await formData.file1.text()
        file3BText = await formData.file2.text()
      } else {
        file2BText = sample2B
        file3BText = sample3B
      }
      
      const file2BData = parseCSV(file2BText)
      const file3BData = parseCSV(file3BText)
      
      const mismatchResults = detectMismatches(file2BData, file3BData)
      
      setResults({
        totalRecords: mismatchResults.length,
        matches: mismatchResults.filter(r => r.Status === 'Match').length,
        mismatches: mismatchResults.filter(r => r.Status === 'Mismatch').length,
        missingIn2B: mismatchResults.filter(r => r.Status === 'Missing in 2B').length,
        missingIn3B: mismatchResults.filter(r => r.Status === 'Missing in 3B').length,
        data: mismatchResults
      })
      
    } catch (error) {
      console.error('Error processing files:', error)
      alert('Error processing files. Please ensure they are valid CSV files.')
    } finally {
      setIsProcessing(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    // File fields are not required if using default data
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      processFiles()
    }
  }

  const downloadResults = () => {
    if (!results) return
    
    const csvContent = [
      'Invoice ID,Supplier GSTIN,2B Amount,3B Amount,Diff,Status',
      ...results.data.map(row => 
        `${row['Invoice ID']},${row['Supplier GSTIN']},${row['2B Amount']},${row['3B Amount']},${row['Diff']},${row['Status']}`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gst_mismatch_results.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            GST Mismatch Detection Tool
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* 2B File Upload */}
            <div>
              <label htmlFor="file1" className="block text-sm font-medium text-gray-700 mb-1">
                2B File (CSV/XLSX) *
              </label>
              <input
                type="file"
                id="file1"
                name="file1"
                onChange={handleFileChange}
                accept=".csv,.xlsx,.xls"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.file1 ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.file1 && (
                <p className="text-red-500 text-sm mt-1">{errors.file1}</p>
              )}
              {formData.file1 && (
                <p className="text-green-600 text-sm mt-1">
                  Selected: {formData.file1.name}
                </p>
              )}
            </div>

            {/* 3B File Upload */}
            <div>
              <label htmlFor="file2" className="block text-sm font-medium text-gray-700 mb-1">
                3B File (CSV/XLSX) *
              </label>
              <input
                type="file"
                id="file2"
                name="file2"
                onChange={handleFileChange}
                accept=".csv,.xlsx,.xls"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.file2 ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.file2 && (
                <p className="text-red-500 text-sm mt-1">{errors.file2}</p>
              )}
              {formData.file2 && (
                <p className="text-green-600 text-sm mt-1">
                  Selected: {formData.file2.name}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Detect Mismatches'}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {results && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Analysis Results</h2>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Records</p>
                <p className="text-2xl font-bold text-blue-900">{results.totalRecords}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Matches</p>
                <p className="text-2xl font-bold text-green-900">{results.matches}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Mismatches</p>
                <p className="text-2xl font-bold text-red-900">{results.mismatches}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600 font-medium">Missing in 2B</p>
                <p className="text-2xl font-bold text-yellow-900">{results.missingIn2B}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Missing in 3B</p>
                <p className="text-2xl font-bold text-orange-900">{results.missingIn3B}</p>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={downloadResults}
              className="mb-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Download Results (CSV)
            </button>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Invoice ID</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Supplier GSTIN</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">2B Amount</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">3B Amount</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Diff</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.data.map((row, index) => (
                    <tr key={index} className={row.Status === 'Mismatch' ? 'bg-red-50' : row.Status === 'Match' ? 'bg-green-50' : 'bg-yellow-50'}>
                      <td className="border border-gray-300 px-4 py-2">{row['Invoice ID']}</td>
                      <td className="border border-gray-300 px-4 py-2">{row['Supplier GSTIN']}</td>
                      <td className="border border-gray-300 px-4 py-2">{row['2B Amount']}</td>
                      <td className="border border-gray-300 px-4 py-2">{row['3B Amount']}</td>
                      <td className="border border-gray-300 px-4 py-2">{row['Diff']}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          row.Status === 'Match' ? 'bg-green-100 text-green-800' :
                          row.Status === 'Mismatch' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {row.Status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
