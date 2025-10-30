import { Handler } from '@netlify/functions';
import { verifyToken, corsHeaders } from './utils/verify-token';
import { getFileContent } from './utils/github';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Método no permitido' }),
    };
  }

  // Verificar autenticación
  if (!verifyToken(event.headers.authorization)) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'No autorizado' }),
    };
  }

  try {
    // Obtener books-manager.json
    const booksData = await getFileContent('public/content/books-manager.json');

    if (!booksData) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ books: [] }),
      };
    }

    const books = JSON.parse(booksData.content);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ books }),
    };
  } catch (error) {
    console.error('Error obteniendo libros:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Error al obtener libros' }),
    };
  }
};
