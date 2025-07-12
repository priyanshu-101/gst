import React, { useRef } from 'react';

export default function FileUpload({ onUpload }) {
  const file3BRef = useRef();
  const emailRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
    const file3B = file3BRef.current.files[0];
    const email = emailRef.current.value;
    console.log('Form data:', { file3B, email });
    onUpload({ file3B, email });
  };

  return (
    <form className="bg-card rounded-lg shadow p-6 flex flex-col gap-4 max-w-lg mx-auto" onSubmit={handleSubmit} id="upload">
      <h2 className="text-xl font-bold text-primary mb-2">Upload GSTR-3B File</h2>
      <p className="text-sm text-slate-600 mb-4">GSTR-2B data will be automatically fetched from the provided Google Sheets</p>
      <input ref={emailRef} type="email" placeholder="Your Email" className="border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-primary" required />
      <div>
        <label className="block mb-1 font-medium">GSTR-3B File (.csv or .xlsx)</label>
        <input ref={file3BRef} type="file" accept=".csv,.xlsx" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-indigo-800" required />
      </div>
      <button type="submit" className="bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-800 transition">Analyze</button>
    </form>
  );
} 