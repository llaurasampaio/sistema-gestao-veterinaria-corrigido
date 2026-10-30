const db = require('../database/db');

async function listar(req, res) {
  try {
    const [rows] = await db.execute(
      `SELECT a.id, a.tutor_id, a.nome, a.especie, a.raca, a.sexo, a.data_nascimento, a.peso_kg, a.observacoes,
              t.nome AS tutor_nome
       FROM animais a JOIN tutores t ON t.id = a.tutor_id ORDER BY a.nome`
    );
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ erro: 'Erro ao listar animais.' }); }
}
async function obter(req, res) {
  try {
    const [rows] = await db.execute(
      `SELECT a.*, t.nome AS tutor_nome FROM animais a JOIN tutores t ON t.id=a.tutor_id WHERE a.id=?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ erro: 'Animal não encontrado.' });
    res.json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ erro: 'Erro ao consultar animal.' }); }
}
async function criar(req, res) {
  const { tutor_id, nome, especie, raca = null, sexo = 'nao_informado', data_nascimento = null, peso_kg = null, observacoes = null } = req.body;
  if (!tutor_id || !nome || !especie) return res.status(400).json({ erro: 'Tutor, nome e espécie são obrigatórios.' });
  if (!['macho', 'femea', 'nao_informado'].includes(sexo)) return res.status(400).json({ erro: 'Sexo inválido.' });
  if (peso_kg !== null && (!Number.isFinite(Number(peso_kg)) || Number(peso_kg) <= 0)) return res.status(400).json({ erro: 'Peso deve ser um número positivo.' });
  try {
    const [r] = await db.execute(
      `INSERT INTO animais (tutor_id,nome,especie,raca,sexo,data_nascimento,peso_kg,observacoes)
       VALUES (?,?,?,?,?,?,?,?)`,
      [Number(tutor_id), String(nome).trim(), String(especie).trim(), raca, sexo, data_nascimento || null, peso_kg || null, observacoes]
    );
    res.status(201).json({ id: r.insertId, mensagem: 'Animal cadastrado.' });
  } catch (e) {
    if (e.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ erro: 'Tutor informado não existe.' });
    console.error(e); res.status(500).json({ erro: 'Erro ao cadastrar animal.' });
  }
}
async function atualizar(req, res) {
  const { tutor_id, nome, especie, raca = null, sexo = 'nao_informado', data_nascimento = null, peso_kg = null, observacoes = null } = req.body;
  if (!tutor_id || !nome || !especie) return res.status(400).json({ erro: 'Tutor, nome e espécie são obrigatórios.' });
  if (!['macho', 'femea', 'nao_informado'].includes(sexo)) return res.status(400).json({ erro: 'Sexo inválido.' });
  try {
    const [r] = await db.execute(
      `UPDATE animais SET tutor_id=?,nome=?,especie=?,raca=?,sexo=?,data_nascimento=?,peso_kg=?,observacoes=? WHERE id=?`,
      [Number(tutor_id), String(nome).trim(), String(especie).trim(), raca, sexo, data_nascimento || null, peso_kg || null, observacoes, req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ erro: 'Animal não encontrado.' });
    res.json({ mensagem: 'Animal atualizado.' });
  } catch (e) {
    if (e.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ erro: 'Tutor informado não existe.' });
    console.error(e); res.status(500).json({ erro: 'Erro ao atualizar animal.' });
  }
}
async function excluir(req, res) {
  try {
    const [r] = await db.execute('DELETE FROM animais WHERE id=?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ erro: 'Animal não encontrado.' });
    res.json({ mensagem: 'Animal excluído.' });
  } catch (e) {
    if (e.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ erro: 'Não é possível excluir animal que possui consultas registradas.' });
    console.error(e); res.status(500).json({ erro: 'Erro ao excluir animal.' });
  }
}
module.exports = { listar, obter, criar, atualizar, excluir };
