const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const DATA_DIR = process.env.MALABARE_DATA_DIR || path.join(ROOT, 'data');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon'
};

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 32 * 1024) {
        reject(Object.assign(new Error('Request is too large'), { status: 413 }));
        req.destroy();
      }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { reject(Object.assign(new Error('Please submit valid form data.'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}

async function appendRecord(file, record) {
  await fs.promises.mkdir(DATA_DIR, { recursive: true });
  const filePath = path.join(DATA_DIR, file);
  let records = [];
  try { records = JSON.parse(await fs.promises.readFile(filePath, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (!Array.isArray(records)) records = [];
  records.push(record);
  await fs.promises.writeFile(filePath, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
}

function clean(value, maxLength = 1000) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

const server = http.createServer(async (req, res) => {
  let url;
  try { url = new URL(req.url, `http://${req.headers.host || 'localhost'}`); }
  catch { return sendJson(res, 400, { error: 'Invalid request URL.' }); }

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(res, 200, { ok: true, service: 'malabare-restaurant' });
  }

  if (req.method === 'POST' && url.pathname === '/api/reservations') {
    try {
      const body = await readBody(req);
      const record = {
        ref: `MLB-${Date.now().toString(36).toUpperCase()}`,
        name: clean(body.name, 120), phone: clean(body.phone, 30), email: clean(body.email, 254),
        date: clean(body.date, 10), time: clean(body.time, 40), guests: clean(body.guests, 10),
        seating: clean(body.seating, 80) || 'Main Dining Hall',
        occasion: clean(body.occasion, 80), requests: clean(body.special_requests, 1000),
        createdAt: new Date().toISOString()
      };
      const validDate = /^\d{4}-\d{2}-\d{2}$/.test(record.date) && !Number.isNaN(Date.parse(`${record.date}T00:00:00`));
      if (record.name.length < 2 || !/^\+?[\d\s()-]{8,20}$/.test(record.phone) ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email) || !validDate ||
          record.date < new Date().toISOString().slice(0, 10) || !record.time ||
          !/^(?:[1-8]|10\+)$/.test(record.guests)) {
        return sendJson(res, 400, { error: 'Please check your name, contact details, date, time, and party size.' });
      }
      await appendRecord('reservations.json', record);
      return sendJson(res, 201, { ok: true, reservation: record });
    } catch (error) {
      return sendJson(res, error.status || 500, { error: error.status ? error.message : 'Reservation could not be saved. Please call the restaurant.' });
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/newsletter') {
    try {
      const body = await readBody(req);
      const email = clean(body.email, 254).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendJson(res, 400, { error: 'Enter a valid email address.' });
      await appendRecord('subscribers.json', { email, createdAt: new Date().toISOString() });
      return sendJson(res, 201, { ok: true });
    } catch (error) {
      return sendJson(res, error.status || 500, { error: error.status ? error.message : 'Subscription could not be saved. Please try again.' });
    }
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD, POST' });
    return res.end('Method Not Allowed');
  }

  let pathname;
  try { pathname = decodeURIComponent(url.pathname); }
  catch { res.writeHead(400); return res.end('Bad Request'); }
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.resolve(ROOT, `.${pathname}`);
  if (filePath !== ROOT && !filePath.startsWith(`${ROOT}${path.sep}`)) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end(err.code === 'ENOENT' ? 'Not Found' : 'Server Error');
    }
    res.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(req.method === 'HEAD' ? undefined : content);
  });
});

server.listen(PORT, () => console.log(`MALABARE server running at http://localhost:${PORT}/`));
