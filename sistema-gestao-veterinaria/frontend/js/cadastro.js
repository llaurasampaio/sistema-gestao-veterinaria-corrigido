document.querySelector('#register-form').addEventListener('submit',async e=>{
 e.preventDefault();const msg=document.querySelector('#message');msg.classList.remove('error');msg.textContent='Cadastrando...';
 const body={nome:document.querySelector('#nome').value,email:document.querySelector('#email').value,senha:document.querySelector('#senha').value,perfil:'administrador'};
 try{const r=await fetch('http://localhost:3000/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw new Error(d.erro||'Falha no cadastro');msg.textContent='Conta criada. Você já pode entrar.';e.currentTarget.reset();}
 catch(err){msg.textContent=err.message;msg.classList.add('error');}
});
