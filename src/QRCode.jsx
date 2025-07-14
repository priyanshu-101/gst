import React from 'react';
import QRCode from 'react-qr-code';

const WEBSITE_URL = 'https://gst-ryh8.vercel.app/';

const QRCodeDisplay = () => (
  <div style={{ textAlign: 'center', margin: '2rem 0' }}>
    <h2>Scan to visit our website</h2>
    <QRCode value={WEBSITE_URL} size={200} />
    <p>{WEBSITE_URL}</p>
  </div>
);

export default QRCodeDisplay;
