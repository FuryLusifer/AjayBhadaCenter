export async function fetchProducts(){ 
  const res = await fetch('/api/products'); 
  if(!res.ok) throw new Error('failed to fetch products'); 
  return await res.json();
}
export async function placeOrder(payload){
  const res = await fetch('/api/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  if(!res.ok){ const t = await res.text(); throw new Error(t); }
  return await res.json();
}
export async function adminListOrders(){
  const res = await fetch('/api/admin/orders');
  if(!res.ok) throw new Error('failed'); return await res.json();
}
export async function adminVerifyOrder(id, body){
  const res = await fetch('/api/admin/orders/' + id + '/verify', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if(!res.ok) throw new Error('failed'); return await res.json();
}
