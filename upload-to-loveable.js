// upload-to-loveable.js
// -------------------------------------------------
// Prereqs:   npm i axios archiver
// Usage:     node upload-to-loveable.js

const fs = require('fs');
const path = require('path');
const axios = require('axios').default;
const archiver = require('archiver');

const API_URL  = 'https://api.loveable.dev/v1/repos/upload'; // <-- replace with real endpoint
const API_KEY  = 'LOV-API-KEY-HERE';                        // <-- replace with your key/token
const ZIP_NAME = 'ai-vibe-project.zip';

// Step 1: zip the whole project ---------------------------------------------
function zipProject() {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(ZIP_NAME);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    archive.on('warning', err => (err.code === 'ENOENT' ? console.warn(err) : reject(err)));
    archive.on('error', reject);

    archive.pipe(output);

    // add everything except common junk
    archive.glob('**/*', {
      ignore: [
        '*.zip',
        'node_modules/**',
        '.git/**',
        '*.log'
      ]
    });

    archive.finalize();
  });
}

// Step 2: upload the zip to Loveable -----------------------------------------
async function uploadZip() {
  console.log('Zipping project…');
  await zipProject();
  console.log('Zip ready, uploading to Loveable…');

  const resp = await axios.post(
    API_URL,
    fs.createReadStream(path.resolve(ZIP_NAME)),
    {
      headers: {
        'Content-Type'  : 'application/zip',
        'Authorization' : `Bearer ${API_KEY}` // or use the header key Loveable expects
      },
      maxBodyLength: Infinity, // allow large uploads
    }
  );

  console.log('Upload complete:', resp.status, resp.statusText);
  console.log('Loveable response:', resp.data);
}

// Run ------------------------------------------------------------------------
uploadZip().catch(err => {
  console.error('Upload failed:', err.message || err);
  process.exit(1);
}); 