const db = require('../database/db');

async function listar(req, res) {
  try {
    const [rows] = await db.execute(
      `SELECT v.id, u.nome
       FROM veterinarios v
       JOIN usuarios u ON u.id = v.usuario_id
       WHERE u.ativo = TRUE
       ORDER BY u.nome`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao listar veterinários.' });
  }
}

module.exports = { listar };
