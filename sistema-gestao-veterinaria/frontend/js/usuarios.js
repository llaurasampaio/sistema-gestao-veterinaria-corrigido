document.addEventListener('DOMContentLoaded',()=>{
 if(!requireLogin())return;
 if(getUser()?.perfil!=='administrador'){showMessage('Apenas administradores podem acessar esta página.',true);document.querySelector('#usuario-form').classList.add('hidden');return;}
 document.querySelector('#usuario-form').addEventListener('submit',async e=>{e.preventDefault();const body={nome:document.querySelector('#nome').value.trim(),email:document.querySelector('#email').value.trim(),senha:document.querySelector('#senha').value,perfil:document.querySelector('#perfil').value};try{await api('/auth/users',{method:'POST',body:JSON.stringify(body)});e.currentTarget.reset();showMessage('Usuário cadastrado com sucesso.');}catch(err){showMessage(err.message,true);}});
});
