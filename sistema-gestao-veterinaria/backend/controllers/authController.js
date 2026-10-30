const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const perfisPermitidos = ['administrador', 'recepcionista', 'veterinario'];

async function inserirUsuario({ nome, email, senha, perfil }) {
  if (!nome || !email || !senha || !perfil) {
    const error = new Error('Informe nome, e-mail, senha e perfil.'); error.status = 400; throw error;
  }
  if (String(senha).length < 8) {
    const error = new Error('A senha deve ter pelo menos 8 caracteres.'); error.status = 400; throw error;
  }
  if (!perfisPermitidos.includes(perfil) || perfil === 'administrador') {
    const error = new Error('Perfil inválido para este cadastro.'); error.status = 400; throw error;
  }
  const hash = await bcrypt.hash(String(senha), 12);
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [resultado] = await connection.execute(
      'INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)',
      [String(nome).trim(), String(email).trim().toLowerCase(), hash, perfil]
    );
    if (perfil === 'veterinario') {
      await connection.execute('INSERT INTO veterinarios (usuario_id, crmv) VALUES (?, NULL)', [resultado.insertId]);
    }
    await connection.commit();
    return resultado.insertId;
  } catch (error) {
    await connection.rollback(); throw error;
  } finally { connection.release(); }
}

async function register(req, res) {
  try {
    const [existentes] = await db.execute('SELECT id FROM usuarios LIMIT 1');
    if (existentes.length) return res.status(403).json({ erro: 'O cadastro inicial já foi realizado. Peça ao administrador para criar novas contas.' });
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha || String(senha).length < 8) {
      return res.status(400).json({ erro: 'Informe nome, e-mail e senha com pelo menos 8 caracteres.' });
    }
    const hash = await bcrypt.hash(String(senha), 12);
    const [resultado] = await db.execute(
      'INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)',
      [String(nome).trim(), String(email).trim().toLowerCase(), hash, 'administrador']
    );
    return res.status(201).json({ mensagem: 'Administrador inicial cadastrado.', id: resultado.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    console.error(error);
    return res.status(500).json({ erro: 'Não foi possível cadastrar o usuário.' });
  }
}

async function criarUsuario(req, res) {
  try {
    const id = await inserirUsuario(req.body);
    return res.status(201).json({ mensagem: 'Usuário cadastrado.', id });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    return res.status(error.status || 500).json({ erro: error.status ? error.message : 'Não foi possível cadastrar o usuário.' });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: 'Informe e-mail e senha.' });

    const [rows] = await db.execute(
      'SELECT id, nome, email, senha_hash, perfil, ativo FROM usuarios WHERE email = ? LIMIT 1',
      [String(email).trim().toLowerCase()]
    );
    const usuario = rows[0];
    if (!usuario || !usuario.ativo || !(await bcrypt.compare(String(senha), usuario.senha_hash))) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 24) {
      return res.status(500).json({ erro: 'Configure JWT_SECRET no arquivo .env com uma chave longa.' });
    }

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
    );
    return res.json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Não foi possível realizar o login.' });
  }
}

async function me(req, res) {
  try {
    const [rows] = await db.execute(
      'SELECT id, nome, email, perfil, ativo FROM usuarios WHERE id = ? LIMIT 1',
      [req.usuario.id]
    );
    if (!rows[0] || !rows[0].ativo) return res.status(401).json({ erro: 'Usuário não encontrado ou inativo.' });
    res.json({ usuario: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Não foi possível consultar o usuário.' });
  }
}

module.exports = { register, criarUsuario, login, me };
