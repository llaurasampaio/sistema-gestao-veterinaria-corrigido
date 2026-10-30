const db = require('../database/db');

async function listar(req, res) {
  try {
    const filtroVeterinario = req.usuario.perfil === 'veterinario' ? 'WHERE u.id = ?' : '';
    const parametros = req.usuario.perfil === 'veterinario' ? [req.usuario.id] : [];
    const [rows] = await db.execute(
      `SELECT c.id, c.animal_id, c.veterinario_id, c.data_hora, c.motivo, c.status,
              a.nome AS animal_nome, u.nome AS veterinario_nome
       FROM consultas c
       JOIN animais a ON a.id=c.animal_id
       JOIN veterinarios v ON v.id=c.veterinario_id
       JOIN usuarios u ON u.id=v.usuario_id
       ${filtroVeterinario}
       ORDER BY c.data_hora DESC`, parametros
    );
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ erro: 'Erro ao listar consultas.' }); }
}

async function criar(req, res) {
  const { animal_id, veterinario_id, data_hora, motivo } = req.body;
  if (!Number.isInteger(Number(animal_id)) || Number(animal_id) <= 0 || !Number.isInteger(Number(veterinario_id)) || Number(veterinario_id) <= 0 || !data_hora || !motivo || !String(motivo).trim()) {
    return res.status(400).json({ erro: 'Informe animal, veterinário, data/hora e motivo válidos.' });
  }
  try {
    const [r] = await db.execute(
      'INSERT INTO consultas (animal_id,veterinario_id,data_hora,motivo) VALUES (?,?,?,?)',
      [Number(animal_id), Number(veterinario_id), data_hora, String(motivo).trim()]
    );
    res.status(201).json({ id: r.insertId, mensagem: 'Consulta agendada.' });
  } catch (e) {
    if (e.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ erro: 'Animal ou veterinário não encontrado.' });
    if (e.code === 'ER_TRUNCATED_WRONG_VALUE') return res.status(400).json({ erro: 'Data e hora inválidas.' });
    console.error(e); res.status(500).json({ erro: 'Erro ao agendar consulta.' });
  }
}

async function atualizar(req, res) {
  const { animal_id, veterinario_id, data_hora, motivo, status } = req.body;
  const statuses = ['agendada','confirmada','realizada','cancelada'];
  if (!Number.isInteger(Number(animal_id)) || Number(animal_id) <= 0 || !Number.isInteger(Number(veterinario_id)) || Number(veterinario_id) <= 0 || !data_hora || !motivo || !String(motivo).trim() || !statuses.includes(status)) {
    return res.status(400).json({ erro: 'Informe os dados da consulta e um status válido.' });
  }
  try {
    const [r] = await db.execute(
      'UPDATE consultas SET animal_id=?,veterinario_id=?,data_hora=?,motivo=?,status=? WHERE id=?',
      [Number(animal_id), Number(veterinario_id), data_hora, String(motivo).trim(), status, req.params.id]
    );
    if (!r.affectedRows) {
      const [exists] = await db.execute('SELECT id FROM consultas WHERE id=?', [req.params.id]);
      if (!exists.length) return res.status(404).json({ erro: 'Consulta não encontrada.' });
    }
    res.json({ mensagem: 'Consulta atualizada.' });
  } catch (e) { console.error(e); res.status(400).json({ erro: 'Não foi possível atualizar. Verifique animal, veterinário e data.' }); }
}

async function excluir(req, res) {
  try {
    const [r] = await db.execute("UPDATE consultas SET status='cancelada' WHERE id=?", [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ erro: 'Consulta não encontrada.' });
    res.json({ mensagem: 'Consulta cancelada.' });
  } catch (e) { console.error(e); res.status(500).json({ erro: 'Erro ao cancelar consulta.' }); }
}

async function verificarAcessoConsulta(req, res) {
  const [rows] = await db.execute(
    `SELECT c.id FROM consultas c JOIN veterinarios v ON v.id=c.veterinario_id
     WHERE c.id=? ${req.usuario.perfil === 'veterinario' ? 'AND v.usuario_id=?' : ''}`,
    req.usuario.perfil === 'veterinario' ? [req.params.id, req.usuario.id] : [req.params.id]
  );
  return rows.length > 0;
}

async function obterRegistro(req, res) {
  try {
    if (!(await verificarAcessoConsulta(req, res))) return res.status(404).json({ erro: 'Consulta não encontrada ou sem permissão.' });
    const [rows] = await db.execute('SELECT * FROM registros_clinicos WHERE consulta_id=?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ erro: 'Registro clínico não encontrado.' });
    res.json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ erro: 'Erro ao consultar registro clínico.' }); }
}

async function salvarRegistro(req, res) {
  const { descricao, diagnostico = null, prescricao = null } = req.body;
  if (!descricao || !String(descricao).trim()) return res.status(400).json({ erro: 'A descrição do atendimento é obrigatória.' });
  try {
    if (!(await verificarAcessoConsulta(req, res))) return res.status(404).json({ erro: 'Consulta não encontrada ou sem permissão.' });
    await db.execute(
      `INSERT INTO registros_clinicos (consulta_id,descricao,diagnostico,prescricao)
       VALUES (?,?,?,?)
       ON DUPLICATE KEY UPDATE descricao=VALUES(descricao),diagnostico=VALUES(diagnostico),prescricao=VALUES(prescricao)`,
      [req.params.id, String(descricao).trim(), diagnostico, prescricao]
    );
    res.status(201).json({ mensagem: 'Registro clínico salvo.' });
  } catch (e) { console.error(e); res.status(500).json({ erro: 'Erro ao salvar registro clínico.' }); }
}
module.exports = { listar, criar, atualizar, excluir, obterRegistro, salvarRegistro };
