export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = req.url;
  console.log('Request URL:', url); // Untuk debugging

  // Halaman Utama (Root)
  if (url === '/' || url === '') {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>CEKPD - Cek Pindah Dana</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: #e2e8f0;
          }
          .card {
            background: rgba(30, 41, 59, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 32px;
            padding: 48px;
            text-align: center;
            max-width: 600px;
            border: 1px solid rgba(99, 102, 241, 0.4);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          h1 {
            font-size: 2.5rem;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 16px;
          }
          .success {
            background: rgba(34, 197, 94, 0.2);
            color: #4ade80;
            padding: 12px 24px;
            border-radius: 60px;
            display: inline-block;
            margin: 20px 0;
            font-weight: 600;
            border: 1px solid rgba(74, 222, 128, 0.3);
          }
          .btn {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            padding: 14px 32px;
            border-radius: 60px;
            text-decoration: none;
            color: white;
            display: inline-block;
            margin-top: 20px;
            font-weight: 600;
            transition: all 0.3s;
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
          }
          .endpoint {
            background: rgba(15, 23, 42, 0.8);
            padding: 10px 16px;
            border-radius: 12px;
            margin: 12px 0;
            font-family: monospace;
            font-size: 14px;
            border: 1px solid rgba(99, 102, 241, 0.3);
          }
          .status {
            color: #fbbf24;
            font-weight: 500;
            margin: 20px 0;
          }
          hr {
            border-color: rgba(99, 102, 241, 0.3);
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🚀 CEKPD</h1>
          <div class="success">
            ✅ BERHASIL TERDEPLOY!
          </div>
          <p style="margin: 20px 0; color: #94a3b8;">
            Aplikasi berjalan dengan baik di Vercel
          </p>
          <hr>
          <div class="status">
            📡 API Endpoints Tersedia:
          </div>
          <div class="endpoint">
            GET /api/health
          </div>
          <div class="endpoint">
            POST /api/bandingkan
          </div>
          <div class="endpoint">
            POST /api/crosscheck
          </div>
          <a href="/api/health" class="btn">
            Test API Health →
          </a>
        </div>
      </body>
      </html>
    `);
    return;
  }

  // API Health Check
  if (url === '/api/health') {
    res.status(200).json({
      status: 'success',
      message: 'CEKPD API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
    return;
  }

  // API Test
  if (url === '/api/test') {
    res.status(200).json({
      success: true,
      message: 'API endpoint is working!',
      endpoints: ['/api/health', '/api/bandingkan', '/api/crosscheck']
    });
    return;
  }

  // POST /api/bandingkan
  if (req.method === 'POST' && url === '/api/bandingkan') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        res.status(200).json({
          success: true,
          data: [
            {
              sheetAsal: "BCA (S1)",
              sheetTujuan: "BCA",
              nominalSumber: 1500000,
              nominalPenerima: 1500000,
              selisih: 0,
              status: "KLOP",
              detail: "Data cocok sempurna"
            },
            {
              sheetAsal: "MANDIRI (S1)",
              sheetTujuan: "MANDIRI",
              nominalSumber: 2000000,
              nominalPenerima: 1500000,
              selisih: 500000,
              status: "KURANG",
              detail: "Kurang Rp 500,000"
            }
          ],
          summary: {
            totalData: 2,
            klop: 1,
            kurang: 1,
            lebih: 0,
            hanyaDiPenerima: 0
          },
          info: {
            sumberCount: data.sumberList?.length || 1,
            penerimaCount: data.penerimaList?.length || 1,
            waktuProses: "0.5"
          }
        });
      } catch (e) {
        res.status(200).json({ success: false, error: e.message });
      }
    });
    return;
  }

  // POST /api/crosscheck
  if (req.method === 'POST' && url === '/api/crosscheck') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        res.status(200).json({
          success: true,
          data: [
            {
              sheetAsal: "BCA",
              sheetTarget: "CROSSCHECK",
              nama: "John Doe",
              nominalSumber: 1000000,
              nominalTarget: 1000000,
              status: "KLOP",
              detail: "Tercatat di CROSSCHECK"
            },
            {
              sheetAsal: "MANDIRI",
              sheetTarget: "-",
              nama: "Jane Smith",
              nominalSumber: 2000000,
              nominalTarget: 0,
              status: "KURANG",
              detail: "Tidak ditemukan di target"
            }
          ],
          summary: {
            totalData: 2,
            klop: 1,
            tidakTercatat: 1,
            lebih: 0
          },
          info: {
            targetLink: data.targetLink,
            sumberCount: data.sumberList?.length || 1,
            waktuProses: "0.5"
          }
        });
      } catch (e) {
        res.status(200).json({ success: false, error: e.message });
      }
    });
    return;
  }

  // 404 untuk route yang tidak dikenal
  res.status(404).json({
    error: 'Not Found',
    path: url,
    message: 'Endpoint tidak ditemukan'
  });
}
