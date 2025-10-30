import { Handler } from '@netlify/functions';
import { verifyToken, corsHeaders } from './utils/verify-token';
import { deleteFile } from './utils/github';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'DELETE') {
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
    const { chapters } = JSON.parse(event.body || '{}');

    if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Lista de capítulos es requerida' }),
      };
    }

    // Eliminar cada capítulo
    const results = [];
    for (const chapter of chapters) {
      try {
        await deleteFile(
          chapter.path,
          chapter.sha,
          `Eliminar capítulo: ${chapter.name}`
        );
        results.push({ path: chapter.path, success: true });
      } catch (error: any) {
        results.push({ path: chapter.path, success: false, error: error.message });
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        results,
      }),
    };
  } catch (error: any) {
    console.error('Error eliminando capítulos:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Error al eliminar capítulos' }),
    };
  }
};
