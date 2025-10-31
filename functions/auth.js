const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'Rqt8XEpKx8Xt5kaM0yzaiwXv5sgBugtW';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function authHandler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(204).headers(corsHeaders).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).headers(corsHeaders).json({ error: 'Método no permitido' });
  }

  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).headers(corsHeaders).json({ error: 'Password requerido' });
    }

    // Verificar password
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).headers(corsHeaders).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { role: 'admin', timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).headers(corsHeaders).json({
      success: true,
      token,
      expiresIn: '24h',
    });
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(500).headers(corsHeaders).json({ error: 'Error del servidor' });
  }
}

module.exports = { authHandler, corsHeaders };