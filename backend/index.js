import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const PORT = process.env.PORT || 4000;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if(!SUPABASE_URL || !SERVICE_ROLE){
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in env');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('products').select('*').order('id', { ascending: true });
    if(error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer_id, items, total } = req.body;
    if(!customer_id || !items) return res.status(400).json({ error: 'customer_id and items required' });
    const { data: order, error: orderErr } = await supabaseAdmin.from('orders').insert([{ customer_id, items, total, status: 'Pending' }]).select().single();
    if(orderErr) return res.status(500).json({ error: orderErr.message });
    res.json({ order });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/orders', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false });
    if(error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/orders/:id/verify', async (req, res) => {
  try {
    const id = req.params.id;
    const { payment_verified, status } = req.body;
    const { data, error } = await supabaseAdmin.from('orders').update({ payment_verified, status }).eq('id', id).select().single();
    if(error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, ()=> console.log('Backend listening on', PORT));
