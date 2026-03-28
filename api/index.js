// Vercel serverless function
module.exports = (req, res) => {
  // Set CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Handle root path
  if (req.url === '/' || req.url === '') {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>CEKPD - Running</title>
        <style>
          body {
            font-family: system-ui;
            background: linear-gradient(135deg, #0f172a, #1e293b);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            color: white;
          }
          .card {
            background: rgba(30,41,59,0.9);
            border-radius: 24px;
            padding: 40px;
            text-align: center;
            border: 1px solid #6366f1;
          }
          h1 { color: #6366f1; }
          .success { color: #4ade80; font-size: 20px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>✅ CEKPD</h1>
          <div class="success">BERHASIL!</div>
          <p>API: <a href="/api/health" style="color:#6366f1">/api/health</a></p>
        </div>
      </body>
      </html>
    `);
    return;
  }
  
  // Health check
  if (req.url === '/api/health') {
    res.status(200).json({ status: 'ok', message: 'API running' });
    return;
  }
  
  // 404
  res.status(404).json({ error: 'Not Found', url: req.url });
};
