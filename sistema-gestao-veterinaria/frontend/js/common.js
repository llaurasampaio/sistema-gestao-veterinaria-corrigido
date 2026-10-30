const API_BASE = 'http://localhost:3000/api';
function getToken(){return localStorage.getItem('sgv_token');}
function getUser(){try{return JSON.parse(localStorage.getItem('sgv_user')||'null');}catch{return null;}}
function logout(){localStorage.removeItem('sgv_token');localStorage.removeItem('sgv_user');location.href='login.html';}
async function api(path, options={}) {
  const headers = {'Content-Type':'application/json', ...(options.headers||{})};
  if(getToken()) headers.Authorization = `Bearer ${getToken()}`;
  const response = await fetch(`${API_BASE}${path}`, {...options, headers});
  let data = {};
  try { data = await response.json(); } catch {}
  if(response.status===401 && !path.startsWith('/auth/login') && !path.startsWith('/auth/register')) logout();
  if(!response.ok) throw new Error(data.erro || 'Falha na requisição.');
  return data;
}
function requireLogin(){
  if(!getToken()){location.href='login.html';return false;}
  const user=getUser();
  const label=document.querySelector('[data-user]');
  if(label && user) label.textContent=`${user.nome} (${user.perfil})`;
  document.querySelectorAll('[data-roles]').forEach(el=>{
    const allowed=el.dataset.roles.split(',').map(s=>s.trim());
    if(!user || !allowed.includes(user.perfil)) el.classList.add('hidden');
  });
  document.querySelectorAll('[data-logout]').forEach(el=>el.addEventListener('click',logout));
  return true;
}
function escapeHtml(value){
  return String(value??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function showMessage(text,isError=false){
  const el=document.querySelector('#message');
  if(el){el.textContent=text;el.classList.toggle('error',isError);}
}
