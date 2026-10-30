document.querySelector('#login-form').addEventListener('submit',async e=>{
 e.preventDefault(); const form=new FormData(e.currentTarget);
 const msg=document.querySelector('#message'); msg.classList.remove('error');msg.textContent='Entrando...';
 try{
  const data=await fetch('http://localhost:3000/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:form.get('email'),senha:form.get('senha')})}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.erro||'Falha no login');return d;});
  localStorage.setItem('sgv_token',data.token);localStorage.setItem('sgv_user',JSON.stringify(data.usuario));location.href='dashboard.html';
 }catch(err){msg.textContent=err.message;msg.classList.add('error');}
});
