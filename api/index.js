module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Root URL handler
  if (req.url === '/') {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>CEKPD</title>
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
          h1 { color: #6366f1; font-size: 2rem; }
          .success { color: #4ade80; font-size: 18px; margin: 20px 0; }
          .btn {
            background: #6366f1;
            padding: 12px 24px;
            border-radius: 40px;
            text-decoration: none;
            color: white;
            display: inline-block;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>✅ CEKPD</h1>
          <div class="success">DEPLOY SUCCESSFUL!</div>
          <p>API is running</p>
          <a href="/api/health" class="btn">Test API →</a>
        </div>
      </body>
      </html>
    `);
    return;
  }
  
  // API health check
  if (req.url === '/api/health') {
    res.status(200).json({ 
      status: 'success', 
      message: 'CEKPD API is running',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  // 404 for other routes
  res.status(404).json({ 
    error: 'Not Found',
    path: req.url
  });
};
