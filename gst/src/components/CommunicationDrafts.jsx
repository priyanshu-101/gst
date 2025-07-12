import React from 'react';

function getEmailDraft(mismatches, clientName, month, firmName) {
  const mismatchLines = mismatches.map(m => `- ${m['Invoice ID']}: ${m['2B Amount']} vs ${m['3B Amount']} → ${m['Diff']} mismatch`).join('\n');
  return `Subject: GST Invoice Mismatch – Action Needed\n\nHi ${clientName || '[Client Name]'},\n\nWe found a few mismatches between your GSTR-2B and 3B filings for ${month || '[Month]'}. Kindly review and re-upload the corrected invoices:\n\n${mismatchLines}\n\nPlease update the records at the earliest.\n\nRegards,\n${firmName || '[Your Firm Name]'}`;
}

function getWhatsAppDraft(mismatches) {
  if (!mismatches.length) return '';
  const first = mismatches[0];
  return `Hi! Found mismatch in your GST returns (${first['Invoice ID']} = ${first['Diff']} diff). Please re-upload and let me know once done.`;
}

export default function CommunicationDrafts({ mismatches = [], clientName, month, firmName }) {
  const emailDraft = getEmailDraft(mismatches, clientName, month, firmName);
  const whatsappDraft = getWhatsAppDraft(mismatches);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!mismatches.length) return null;

  return (
    <div className="bg-card rounded-lg shadow p-6 mt-8">
      <h2 className="text-xl font-bold text-primary mb-4">Auto-Drafted Client Communication</h2>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Email Draft</h3>
        <textarea className="w-full border border-slate-300 rounded p-2 mb-2 text-sm" rows={6} value={emailDraft} readOnly />
        <button onClick={() => copyToClipboard(emailDraft)} className="bg-primary text-white py-1 px-4 rounded hover:bg-indigo-800 transition">Copy Email</button>
      </div>
      <div>
        <h3 className="font-semibold mb-2">WhatsApp Message</h3>
        <textarea className="w-full border border-slate-300 rounded p-2 mb-2 text-sm" rows={2} value={whatsappDraft} readOnly />
        <button onClick={() => copyToClipboard(whatsappDraft)} className="bg-accent text-white py-1 px-4 rounded hover:bg-teal-700 transition">Copy WhatsApp</button>
      </div>
    </div>
  );
} 