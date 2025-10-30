import { Handler } from '@netlify/functions';
import { verifyToken, corsHeaders } from './utils/verify-token';
import { createOrUpdateFile, slugify } from './utils/github';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
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
    const { slug, chapterTitle, content } = JSON.parse(event.body || '{}');

    if (!slug || !chapterTitle || !content) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Slug, título y contenido son requeridos' }),
      };
    }

    const chapterSlug = slugify(chapterTitle);
    const chapterPath = `public/content/books/${slug}/${chapterSlug}.md`;

    // Crear o actualizar capítulo
    await createOrUpdateFile(
      chapterPath,
      content,
      `Agregar capítulo: ${chapterTitle} a ${slug}`
    );

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        chapter: {
          title: chapterTitle,
          slug: chapterSlug,
          path: chapterPath,
        },
      }),
    };
  } catch (error: any) {
    console.error('Error subiendo capítulo:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Error al subir capítulo' }),
    };
  }
};
