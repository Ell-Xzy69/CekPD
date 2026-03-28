// ============================================
// CEK PINDAH DANA (CEKPD) - VERCEL API
// Version 1.0
// ============================================

const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// FUNGSI UTILITY (SAMA PERSIS DENGAN LOGIKA ASLI)
// ============================================

function extractSpreadsheetId(url) {
  if (!url || url.trim() === '') return null;
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

function kolomHurufKeIndex(huruf) {
  if (!huruf) return 1;
  const hurufUpper = huruf.toUpperCase();
  let index = 0;
  for (let i = 0; i < hurufUpper.length; i++) {
    index = index * 26 + (hurufUpper.charCodeAt(i) - 64);
  }
  return index;
}

function normalisasiNama(nama) {
  if (!nama) return '';
  return nama.toString()
    .toUpperCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s*\(\s*/g, '(')
    .replace(/\s*\)\s*/g, ')')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s*,\s*/g, ',')
    .replace(/\s*\.\s*/g, '.');
}

function formatRupiah(angka) {
  if (!angka || angka === 0) return 'Rp 0';
  return 'Rp ' + Math.round(angka).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// ============================================
// FUNGSI SIMULASI DATA (UNTUK TESTING)
// NANTI BISA DIGANTI DENGAN INTEGRASI GOOGLE SHEETS API
// ============================================

function generateMockData(sumberList, penerimaList, sheetTidakDicek) {
  const hasil = [];
  const statusList = ['KLOP', 'KURANG', 'LEBIH'];
  
  for (let i = 0; i < sumberList.length; i++) {
    for (let j = 0; j < penerimaList.length; j++) {
      const nominalSumber = 1000000 * (i + 1);
      const nominalPenerima = 1000000 * (j + 1);
      const selisih = nominalSumber - nominalPenerima;
      
      let status = '';
      if (Math.abs(selisih) < 1) status = 'KLOP';
      else if (selisih > 0) status = 'KURANG';
      else status = 'LEBIH';
      
      hasil.push({
        sheetAsal: `Sumber ${i+1} (${sumberList[i].link?.substring(0, 30) || 'link'}...)`,
        sheetTujuan: `Penerima ${j+1}`,
        nominalSumber: nominalSumber,
        nominalPenerima: nominalPenerima,
        selisih: Math.abs(selisih),
        status: status,
        detail: `${formatRupiah(nominalSumber)} vs ${formatRupiah(nominalPenerima)}`
      });
    }
  }
  
  return hasil;
}

function generateMockCrosscheck(targetLink, sumberList) {
  const hasil = [];
  
  for (let i = 0; i < sumberList.length; i++) {
    const isMatch = i === 0;
    hasil.push({
      sheetAsal: `Sumber ${i+1}`,
      sheetTarget: isMatch ? 'CROSSCHECK' : '-',
      nama: `Transaksi ${i+1}`,
      nominalSumber: 500000 * (i + 1),
      nominalTarget: isMatch ? 500000 : 0,
      status: isMatch ? 'KLOP' : 'KURANG',
      barisSumber: i + 2,
      detail: isMatch ? 'Tercatat di target' : 'Tidak ditemukan di target'
    });
  }
  
  return hasil;
}

// ============================================
// API ENDPOINTS
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'CEKPD API is running',
    timestamp: new Date().toISOString(),
    version: '1.0'
  });
});

// Endpoint untuk mode SUMBER KE PENERIMA
app.post('/api/bandingkan', async (req, res) => {
  try {
    console.log('📊 [bandingkan] Request received:', {
      sumberCount: req.body.sumberList?.length,
      penerimaCount: req.body.penerimaList?.length,
      akumulasi: req.body.akumulasi,
      tampilkanSemua: req.body.tampilkanSemua
    });
    
    const { 
      sumberList = [], 
      penerimaList = [], 
      sheetTidakDicek = '',
      akumulasi = true,
      tampilkanSemua = false 
    } = req.body;
    
    // Validasi
    if (sumberList.length === 0) {
      throw new Error('Minimal 1 spreadsheet sumber harus diisi');
    }
    if (penerimaList.length === 0) {
      throw new Error('Minimal 1 spreadsheet penerima harus diisi');
    }
    
    // Generate data (simulasi - nanti ganti dengan real data dari Google Sheets)
    const data = generateMockData(sumberList, penerimaList, sheetTidakDicek);
    
    // Filter data jika tidak tampilkan semua
    let filteredData = data;
    if (!tampilkanSemua) {
      filteredData = data.filter(item => item.status !== 'KLOP');
    }
    
    // Hitung summary
    const summary = {
      totalData: data.length,
      klop: data.filter(item => item.status === 'KLOP').length,
      kurang: data.filter(item => item.status === 'KURANG').length,
      lebih: data.filter(item => item.status === 'LEBIH').length,
      hanyaDiPenerima: 0
    };
    
    res.json({
      success: true,
      data: filteredData,
      summary: summary,
      info: {
        sumberCount: sumberList.length,
        penerimaCount: penerimaList.length,
        waktuProses: '0.5',
        akumulasi: akumulasi,
        mode: 'sumber_ke_penerima'
      }
    });
    
  } catch (error) {
    console.error('❌ [bandingkan] Error:', error);
    res.json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Endpoint untuk mode CROSSCHECK WD
app.post('/api/crosscheck', async (req, res) => {
  try {
    console.log('🔍 [crosscheck] Request received:', {
      targetLink: req.body.targetLink?.substring(0, 50),
      sumberCount: req.body.sumberList?.length,
      tampilkanSemua: req.body.tampilkanSemua
    });
    
    const { 
      targetLink = '', 
      sumberList = [], 
      sheetTidakDicek = '',
      tampilkanSemua = false 
    } = req.body;
    
    // Validasi
    if (!targetLink) {
      throw new Error('Link spreadsheet target harus diisi');
    }
    if (sumberList.length === 0) {
      throw new Error('Minimal 1 spreadsheet sumber harus diisi');
    }
    
    // Generate data (simulasi - nanti ganti dengan real data)
    const data = generateMockCrosscheck(targetLink, sumberList);
    
    // Filter data jika tidak tampilkan semua
    let filteredData = data;
    if (!tampilkanSemua) {
      filteredData = data.filter(item => item.status !== 'KLOP');
    }
    
    // Hitung summary
    const summary = {
      totalData: data.length,
      klop: data.filter(item => item.status === 'KLOP').length,
      tidakTercatat: data.filter(item => item.status === 'KURANG').length,
      lebih: data.filter(item => item.status === 'LEBIH').length
    };
    
    res.json({
      success: true,
      data: filteredData,
      summary: summary,
      info: {
        targetLink: targetLink,
        sumberCount: sumberList.length,
        waktuProses: '0.5',
        mode: 'crosscheck'
      }
    });
    
  } catch (error) {
    console.error('❌ [crosscheck] Error:', error);
    res.json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Endpoint untuk test API
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API endpoint is working!',
    endpoints: {
      health: 'GET /api/health',
      bandingkan: 'POST /api/bandingkan',
      crosscheck: 'POST /api/crosscheck',
      test: 'GET /api/test'
    }
  });
});

// Export untuk Vercel
module.exports = app;