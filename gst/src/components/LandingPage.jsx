import React from 'react';

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center">
      {/* Hero Section */}
      <header className="w-full py-12 px-4 bg-gradient-to-r from-primary to-accent text-white text-center rounded-b-3xl shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">GST follow-ups done in 60 seconds.</h1>
        <p className="text-lg md:text-xl mb-6">Upload GSTR-2B and 3B — we handle the rest.</p>
        <p className="text-md md:text-lg mb-8">No manual mismatch checks. No client email writing.<br/>GSTCopilot auto-detects mismatches & drafts follow-ups.</p>
        <a href="#upload" className="inline-block bg-primary hover:bg-indigo-800 text-white font-semibold py-3 px-8 rounded-lg shadow transition">Upload Files</a>
      </header>

      {/* How it works */}
      <section className="w-full max-w-3xl mt-12 mb-8 px-4">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">How it works</h2>
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="flex-1 bg-card rounded-lg p-6 shadow text-center">
            <div className="text-4xl mb-2">📤</div>
            <h3 className="font-semibold mb-2">1. Upload Files</h3>
            <p className="text-text-secondary">Upload your GSTR-2B and 3B Excel/CSV files.</p>
          </div>
          <div className="flex-1 bg-card rounded-lg p-6 shadow text-center">
            <div className="text-4xl mb-2">⚙️</div>
            <h3 className="font-semibold mb-2">2. Auto-Detect Mismatches</h3>
            <p className="text-text-secondary">We instantly compare and flag mismatches for you.</p>
          </div>
          <div className="flex-1 bg-card rounded-lg p-6 shadow text-center">
            <div className="text-4xl mb-2">✉️</div>
            <h3 className="font-semibold mb-2">3. Get Drafted Follow-ups</h3>
            <p className="text-text-secondary">Auto-generated email & WhatsApp drafts for your clients.</p>
          </div>
        </div>
      </section>

      {/* Who it's for & Referral CTA */}
      <section className="w-full max-w-3xl mb-12 px-4 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 bg-card rounded-lg p-6 shadow text-center">
          <h3 className="font-semibold text-lg mb-2">Who it's for</h3>
          <p className="text-text-secondary mb-2">Solo CAs, small firms, and anyone who wants to save time on GST follow-ups.</p>
        </div>
        <div className="flex-1 bg-card rounded-lg p-6 shadow text-center">
          <h3 className="font-semibold text-lg mb-2">Refer a CA, get 1 month free</h3>
          <form className="flex flex-col gap-2 items-center">
            <input type="text" placeholder="Your Name" className="border border-slate-300 rounded px-3 py-2 w-full max-w-xs focus:outline-none focus:border-primary" />
            <input type="email" placeholder="Your Email" className="border border-slate-300 rounded px-3 py-2 w-full max-w-xs focus:outline-none focus:border-primary" />
            <input type="email" placeholder="Friend's Email" className="border border-slate-300 rounded px-3 py-2 w-full max-w-xs focus:outline-none focus:border-primary" />
            <button type="submit" className="bg-accent text-white font-semibold py-2 px-6 rounded-lg mt-2 hover:bg-teal-700 transition">Refer Now</button>
          </form>
        </div>
      </section>
    </div>
  );
} 