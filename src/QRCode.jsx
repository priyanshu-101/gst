import React, { useRef } from 'react';
import QRCode from 'react-qr-code';

const WEBSITE_URL = 'https://gst-ryh8.vercel.app/';

const QRCodeDisplay = () => {
  const svgRef = useRef(null);

  const handleDownload = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const canvas = document.createElement('canvas');
    const img = new window.Image();
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    img.onload = function () {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngFile;
      downloadLink.download = 'qr-code.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgString)));
  };

  return (
    <div style={{ textAlign: 'center', margin: '2rem 0' }}>
      <h2>Scan to visit our website</h2>
      <div style={{ display: 'inline-block' }}>
        <QRCode ref={svgRef} value={WEBSITE_URL} size={200} />
      </div>
      <p>{WEBSITE_URL}</p>
      <button onClick={handleDownload} style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '1rem' }}>
        Download QR Code
      </button>
    </div>
  );
};

export default QRCodeDisplay;
