let consultas=[];
document.addEventListener('DOMContentLoaded',async()=>{
 if(!requireLogin())return;
 const perfil=getUser()?.perfil;
 const podeGerenciar=['administrador','recepcionista'].includes(perfil);
 const form=document.querySelector('#consulta-form');
 if(!podeGerenciar){form.querySelectorAll('input,select,button').forEach(el=>el.disabled=true);form.classList.add('hidden');}
 form.addEventListener('submit',salvarConsulta);
 document.querySelector('#limpar').addEventListener('click',limparConsulta);
 document.querySelector('#clinico-form')?.addEventListener('submit',salvarClinico);
 document.querySelector('#clinico-consulta')?.addEventListener('change',carregarRegistroExistente);
 await Promise.all([carregar(),carregarOpcoes()]);
});
async function carregar(){try{
 consultas=await api('/consultas');const u=getUser();
 document.querySelector('#rows').innerHTML=consultas.map(c=>`<tr><td>${escapeHtml(c.data_hora)}</td><td>${escapeHtml(c.animal_nome)} (#${c.animal_id})</td><td>${escapeHtml(c.veterinario_nome)}</td><td>${escapeHtml(c.motivo)}</td><td>${escapeHtml(c.status)}</td><td>${['administrador','recepcionista'].includes(u?.perfil)?`<button type="button" onclick="editarConsulta(${c.id})">Editar</button> `:''}${['administrador','recepcionista'].includes(u?.perfil)&&c.status!=='cancelada'?`<button type="button" class="danger" onclick="cancelarConsulta(${c.id})">Cancelar</button>`:''}</td></tr>`).join('')||'<tr><td colspan="6">Nenhuma consulta cadastrada.</td></tr>';
 carregarConsultasClinicas();
 }catch(e){showMessage(e.message,true);}}
function carregarConsultasClinicas(){const select=document.querySelector('#clinico-consulta');if(!select)return;select.innerHTML='<option value="">Selecione uma consulta</option>'+consultas.map(c=>`<option value="${c.id}">${escapeHtml(c.animal_nome)} — ${escapeHtml(c.veterinario_nome)} — ${escapeHtml(String(c.data_hora).replace('T',' ').slice(0,16))}</option>`).join('');if(!consultas.length)select.innerHTML='<option value="">Nenhuma consulta disponível</option>';}
async function carregarOpcoes(){try{const [animais,veterinarios]=await Promise.all([api('/animais'),api('/veterinarios')]);const as=document.querySelector('#animal_id'),vs=document.querySelector('#veterinario_id');if(!as||!vs)return;as.innerHTML='<option value="">Selecione um animal</option>'+animais.map(a=>`<option value="${a.id}">${escapeHtml(a.nome)} — ${escapeHtml(a.especie)}</option>`).join('');vs.innerHTML='<option value="">Selecione um veterinário</option>'+veterinarios.map(v=>`<option value="${v.id}">${escapeHtml(v.nome)}</option>`).join('');}catch(e){showMessage(e.message,true);}}
function limparConsulta(){document.querySelector('#consulta-form').reset();document.querySelector('#consulta-id').value='';}
function editarConsulta(id){const c=consultas.find(x=>x.id===id);if(!c)return;document.querySelector('#consulta-id').value=c.id;document.querySelector('#animal_id').value=c.animal_id;document.querySelector('#veterinario_id').value=c.veterinario_id;document.querySelector('#data_hora').value=String(c.data_hora).replace(' ','T').slice(0,16);document.querySelector('#motivo').value=c.motivo;document.querySelector('#status').value=c.status;window.scrollTo({top:0,behavior:'smooth'});}
async function salvarConsulta(e){e.preventDefault();const id=document.querySelector('#consulta-id').value;const body={animal_id:Number(document.querySelector('#animal_id').value),veterinario_id:Number(document.querySelector('#veterinario_id').value),data_hora:document.querySelector('#data_hora').value.replace('T',' ')+':00',motivo:document.querySelector('#motivo').value,status:document.querySelector('#status').value};try{await api('/consultas'+(id?'/'+id:''),{method:id?'PUT':'POST',body:JSON.stringify(body)});limparConsulta();showMessage('Consulta salva.');await carregar();}catch(e){showMessage(e.message,true);}}
async function cancelarConsulta(id){if(!confirm('Cancelar esta consulta?'))return;try{await api('/consultas/'+id,{method:'DELETE'});showMessage('Consulta cancelada.');await carregar();}catch(e){showMessage(e.message,true);}}
async function carregarRegistroExistente(){const id=document.querySelector('#clinico-consulta').value;const form=document.querySelector('#clinico-form');form.reset();if(!id)return;try{const r=await api('/consultas/'+id+'/registro-clinico');document.querySelector('#descricao').value=r.descricao||'';document.querySelector('#diagnostico').value=r.diagnostico||'';document.querySelector('#prescricao').value=r.prescricao||'';}catch(e){if(!e.message.includes('não encontrado'))showMessage(e.message,true);}}
async function salvarClinico(e){e.preventDefault();const id=document.querySelector('#clinico-consulta').value;if(!id){showMessage('Selecione uma consulta.',true);return;}const body={descricao:document.querySelector('#descricao').value,diagnostico:document.querySelector('#diagnostico').value||null,prescricao:document.querySelector('#prescricao').value||null};try{await api('/consultas/'+id+'/registro-clinico',{method:'POST',body:JSON.stringify(body)});showMessage('Registro clínico salvo.');}catch(e){showMessage(e.message,true);}}
