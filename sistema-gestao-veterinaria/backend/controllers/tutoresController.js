const db = require('../database/db');

async function listar(req, res) {
  try {
    const [rows] = await db.execute('SELECT id, nome, telefone, email, endereco, criado_em FROM tutores ORDER BY nome');
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ erro: 'Erro ao listar tutores.' }); }
}
async function obter(req, res) {
  try {
    const [rows] = await db.execute('SELECT id, nome, telefone, email, endereco, criado_em FROM tutores WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ erro: 'Tutor não encontrado.' });
    res.json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ erro: 'Erro ao consultar tutor.' }); }
}
async function criar(req, res) {
  const { nome, telefone = null, email = null, endereco = null } = req.body;
  if (!nome || !String(nome).trim()) return res.status(400).json({ erro: 'Nome é obrigatório.' });
  try {
    const [r] = await db.execute('INSERT INTO tutores (nome, telefone, email, endereco) VALUES (?, ?, ?, ?)',
      [String(nome).trim(), telefone, email, endereco]);
    res.status(201).json({ id: r.insertId, mensagem: 'Tutor cadastrado.' });
  } catch (e) { console.error(e); res.status(500).json({ erro: 'Erro ao cadastrar tutor.' }); }
}
async function atualizar(req, res) {
  const { nome, telefone = null, email = null, endereco = null } = req.body;
  if (!nome || !String(nome).trim()) return res.status(400).json({ erro: 'Nome é obrigatório.' });
  try {
    const [r] = await db.execute('UPDATE tutores SET nome=?, telefone=?, email=?, endereco=? WHERE id=?',
      [String(nome).trim(), telefone, email, endereco, req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ erro: 'Tutor não encontrado.' });
    res.json({ mensagem: 'Tutor atualizado.' });
  } catch (e) { console.error(e); res.status(500).json({ erro: 'Erro ao atualizar tutor.' }); }
}
async function excluir(req, res) {
  try {
    const [r] = await db.execute('DELETE FROM tutores WHERE id=?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ erro: 'Tutor não encontrado.' });
    res.json({ mensagem: 'Tutor excluído.' });
  } catch (e) {
    if (e.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ erro: 'Não é possível excluir tutor que possui animais cadastrados.' });
    console.error(e); res.status(500).json({ erro: 'Erro ao excluir tutor.' });
  }
}
module.exports = { listar, obter, criar, atualizar, excluir };
