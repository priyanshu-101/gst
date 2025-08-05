import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download, Copy, Mail, MessageCircle, Users, ArrowRight } from 'lucide-react';
import * as XLSX from 'xlsx';

const GSTCopilot = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [files, setFiles] = useState({ gstr2b: null, gstr3b: null });
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [firmName, setFirmName] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // File upload handler
  const handleFileUpload = (type, file) => {
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.csv'))) {
      setFiles(prev => ({ ...prev, [type]: file }));
    } else {
      alert('Please upload only Excel (.xlsx) or CSV files');
    }
  };

  // Parse Excel/CSV file
  const parseFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          let workbook;
          
          if (file.name.endsWith('.csv')) {
            workbook = XLSX.read(data, { type: 'string' });
          } else {
            workbook = XLSX.read(data, { type: 'array' });
          }
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  // Process files and detect mismatches
  const processFiles = async () => {
    if (!files.gstr2b || !files.gstr3b || !clientEmail || !clientName || !firmName) {
      alert('Please fill all fields and upload both files');
      return;
    }

    setLoading(true);
    
    try {
      const data2b = await parseFile(files.gstr2b);
      const data3b = await parseFile(files.gstr3b);
      
      // Simple mismatch detection logic
      const mismatches = [];
      
      // Assuming first row is headers, start from index 1
      for (let i = 1; i < Math.min(data2b.length, data3b.length); i++) {
        const row2b = data2b[i];
        const row3b = data3b[i];
        
        if (row2b && row3b && row2b.length > 2 && row3b.length > 2) {
          const invoiceId = row2b[0] || `INV${i}`;
          const gstin = row2b[1] || `GSTIN${i}`;
          const amount2b = parseFloat(row2b[2]) || 0;
          const amount3b = parseFloat(row3b[2]) || 0;
          const diff = amount2b - amount3b;
          
          if (Math.abs(diff) > 100) {
            mismatches.push({
              invoiceId,
              gstin,
              amount2b,
              amount3b,
              diff,
              status: 'Mismatch'
            });
          }
        }
      }
      
      setResults({
        mismatches,
        totalProcessed: Math.min(data2b.length - 1, data3b.length - 1),
        mismatchCount: mismatches.length
      });
      
      setCurrentPage('results');
    } catch (error) {
      alert('Error processing files: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate email template
  const generateEmail = () => {
    const mismatchList = results.mismatches.map(m => 
      `- ${m?.invoiceId || 'N/A'}: ₹${(m?.amount2b || 0).toLocaleString()} vs ₹${(m?.amount3b || 0).toLocaleString()} → ₹${Math.abs(m?.diff || 0).toLocaleString()} mismatch`
    ).join('\n');
    
    return `Subject: GST Invoice Mismatch – Action Needed

Hi ${clientName},

We found ${results.mismatchCount} mismatch(es) between your GSTR-2B and 3B filings. Kindly review and re-upload the corrected invoices:

${mismatchList}

Please update the records at the earliest.

Regards,
${firmName}`;
  };

  // Generate WhatsApp message
  const generateWhatsApp = () => {
    const firstMismatch = results.mismatches[0];
    const moreText = results.mismatchCount > 1 ? ` and ${results.mismatchCount - 1} more` : '';
    
    if (firstMismatch) {
      return `Hi ${clientName}! Found ${results.mismatchCount} mismatch(es) in your GST returns (${firstMismatch.invoiceId} = ₹${Math.abs(firstMismatch.diff).toLocaleString()} diff${moreText}). Please re-upload and let me know once done.`;
    } else {
      return `Hi ${clientName}! Found ${results.mismatchCount} mismatch(es) in your GST returns. Please review and re-upload the corrected invoices.`;
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // Export to PDF (simplified - just downloads the content)
  const exportToPDF = () => {
    const content = `GST Mismatch Report
    
Client: ${clientName}
Date: ${new Date().toLocaleDateString()}
    
Mismatches Found: ${results.mismatchCount}
Total Processed: ${results.totalProcessed}

${results.mismatches.map(m => 
  `${m?.invoiceId || 'N/A'}: ₹${(m?.amount2b || 0).toLocaleString()} vs ₹${(m?.amount3b || 0).toLocaleString()} (Diff: ₹${Math.abs(m?.diff || 0).toLocaleString()})`
).join('\n')}

Email Draft:
${generateEmail()}

WhatsApp Message:
${generateWhatsApp()}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GST_Mismatch_Report_${clientName}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (currentPage === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-teal-500">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="text-white text-xl font-bold">GSTCopilot</div>
            <div className="flex gap-4">
              <button className="text-white/80 hover:text-white transition-colors">How it works</button>
              <button className="text-white/80 hover:text-white transition-colors">Pricing</button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            GST follow-ups done in <span className="text-yellow-300">60 seconds</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Upload GSTR-2B and 3B — we handle the rest. No manual mismatch checks. No client email writing. 
            GSTCopilot auto-detects mismatches & drafts follow-ups.
          </p>
          <button 
            onClick={() => setCurrentPage('upload')}
            className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-xl flex items-center gap-2 mx-auto"
          >
            <Upload className="w-5 h-5" />
            Upload Files Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* How it works */}
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">1. Upload Files</h3>
              <p className="text-white/80">Upload your GSTR-2B and 3B Excel/CSV files</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">2. Auto-Detect</h3>
              <p className="text-white/80">Our algorithm finds mismatches automatically</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">3. Get Messages</h3>
              <p className="text-white/80">Ready-to-send email and WhatsApp messages</p>
            </div>
          </div>
        </div>

        {/* Who it's for */}
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Perfect for</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <Users className="w-8 h-8 text-teal-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Solo CAs</h3>
              <p className="text-white/80">Save hours on GST compliance checks and client communication</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <FileText className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Small Firms</h3>
              <p className="text-white/80">Streamline your GST workflow and improve client satisfaction</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to save hours every week?</h2>
            <p className="text-white/80 mb-8">Join 500+ CAs who've automated their GST follow-ups</p>
            <button 
              onClick={() => setCurrentPage('upload')}
              className="bg-teal-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-teal-600 transition-colors shadow-xl"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'upload') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="text-indigo-600 text-xl font-bold">GSTCopilot</div>
            <button 
              onClick={() => setCurrentPage('landing')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your GST Files</h1>
            <p className="text-gray-600">Upload GSTR-2B and 3B files to detect mismatches automatically</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Client Information */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Email</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="client@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Firm Name</label>
                  <input
                    type="text"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Your firm name"
                  />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GSTR-2B File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload GSTR-2B file</p>
                  <input
                    type="file"
                    accept=".xlsx,.csv"
                    onChange={(e) => handleFileUpload('gstr2b', e.target.files[0])}
                    className="hidden"
                    id="gstr2b-upload"
                  />
                  <label htmlFor="gstr2b-upload" className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors">
                    Choose File
                  </label>
                  {files.gstr2b && (
                    <p className="text-sm text-green-600 mt-2 flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      {files.gstr2b.name}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GSTR-3B File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload GSTR-3B file</p>
                  <input
                    type="file"
                    accept=".xlsx,.csv"
                    onChange={(e) => handleFileUpload('gstr3b', e.target.files[0])}
                    className="hidden"
                    id="gstr3b-upload"
                  />
                  <label htmlFor="gstr3b-upload" className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors">
                    Choose File
                  </label>
                  {files.gstr3b && (
                    <p className="text-sm text-green-600 mt-2 flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      {files.gstr3b.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Process Button */}
            <div className="text-center">
              <button
                onClick={processFiles}
                disabled={loading}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    Detect Mismatches
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'results' && results) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="text-indigo-600 text-xl font-bold">GSTCopilot</div>
            <button 
              onClick={() => setCurrentPage('upload')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Upload New Files
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mismatch Detection Results</h1>
            <p className="text-gray-600">Found {results.mismatchCount} mismatch(es) out of {results.totalProcessed} records processed</p>
          </div>

          {/* Results Summary */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Processed</p>
                  <p className="text-2xl font-bold text-gray-900">{results.totalProcessed}</p>
                </div>
                <FileText className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mismatches Found</p>
                  <p className="text-2xl font-bold text-red-600">{results.mismatchCount}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Matches</p>
                  <p className="text-2xl font-bold text-green-600">{results.totalProcessed - results.mismatchCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Mismatches Table */}
          {results.mismatchCount > 0 && (
            <div className="bg-white rounded-lg shadow-lg mb-8 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Mismatch Details</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GSTIN</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">2B Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">3B Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difference</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.mismatches.map((mismatch, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mismatch?.invoiceId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mismatch.gstin}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{mismatch.amount2b.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{mismatch.amount3b.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">₹{Math.abs(mismatch.diff).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            {mismatch.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Communication Templates */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Draft
                </h3>
                <button
                  onClick={() => copyToClipboard(generateEmail())}
                  className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{generateEmail()}</pre>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp Message
                </h3>
                <button
                  onClick={() => copyToClipboard(generateWhatsApp())}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">{generateWhatsApp()}</p>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Results</h3>
            <div className="flex gap-4">
              <button
                onClick={exportToPDF}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button
                onClick={() => copyToClipboard(generateEmail())}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Email
              </button>
              <button
                onClick={() => copyToClipboard(generateWhatsApp())}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GSTCopilot;