import { Handler } from '@netlify/functions';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-this';

export const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' }),
    };
  }

  try {
    const { password } = JSON.parse(event.body || '{}');

    if (!password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Password requerido' }),
      };
    }

    // Verificar password
    if (password !== ADMIN_PASSWORD) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Credenciales inválidas' }),
      };
    }

    // Generar token JWT
    const token = jwt.sign(
      { role: 'admin', timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        token,
        expiresIn: '24h',
      }),
    };
  } catch (error) {
    console.error('Error en autenticación:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error del servidor' }),
    };
  }
};
