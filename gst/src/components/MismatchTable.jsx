import React from 'react';

export default function MismatchTable({ results = [], onExport }) {
  console.log('MismatchTable received results:', results);
  // Show all results (both matches and mismatches)
  if (!results.length) {
    console.log('No results to display');
    return (
      <div className="bg-card rounded-lg shadow p-6 mt-8">
        <h2 className="text-xl font-bold text-primary">Analysis Results</h2>
        <p className="text-slate-600 mt-2">No data to display. Please upload files and click Analyze.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow p-6 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-primary">2B vs 3B Comparison</h2>
        <button onClick={onExport} className="bg-success text-white font-semibold py-2 px-4 rounded hover:bg-lime-700 transition">Download as CSV</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-slate-200">
          <thead>
            <tr className="bg-background">
              <th className="border px-4 py-2">Invoice ID</th>
              <th className="border px-4 py-2">2B Amount</th>
              <th className="border px-4 py-2">3B Amount</th>
              <th className="border px-4 py-2">Difference</th>
              <th className="border px-4 py-2">Match/Mismatch</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row, idx) => (
              <tr key={idx} className={row.Status === 'Yes' ? 'bg-success/10' : 'bg-error/10'}>
                <td className="border px-4 py-2">{row['Invoice ID']}</td>
                <td className="border px-4 py-2">{row['2B Amount']}</td>
                <td className="border px-4 py-2">{row['3B Amount']}</td>
                <td className="border px-4 py-2">{row['Diff']}</td>
                <td className={`border px-4 py-2 font-semibold ${row.Status === 'Yes' ? 'text-success' : 'text-error'}`}>
                  {row.Status === 'Yes' ? 'Match' : 'Mismatch'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 