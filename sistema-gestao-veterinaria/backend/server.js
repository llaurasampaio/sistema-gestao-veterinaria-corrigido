require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database/db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', projeto: 'Sistema de Gestão Veterinária' });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'disconnected', mensagem: 'API iniciou, mas a conexão MySQL falhou. Confira o .env e se o banco foi criado.' });
  }
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tutores', require('./routes/tutoresRoutes'));
app.use('/api/animais', require('./routes/animaisRoutes'));
app.use('/api/veterinarios', require('./routes/veterinariosRoutes'));
app.use('/api/consultas', require('./routes/consultasRoutes'));

app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API disponível em http://localhost:${PORT}`));
