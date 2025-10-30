import { Handler } from '@netlify/functions';
import { verifyToken, corsHeaders } from './utils/verify-token';
import { octokit, githubConfig } from './utils/github';

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
    const slug = event.queryStringParameters?.slug;

    if (!slug) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Slug del libro es requerido' }),
      };
    }

    const bookPath = `public/content/books/${slug}`;

    // Obtener contenido del directorio del libro
    const { data } = await octokit.repos.getContent({
      owner: githubConfig.owner,
      repo: githubConfig.repo,
      path: bookPath,
      ref: githubConfig.branch,
    });

    if (!Array.isArray(data)) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Error al leer directorio' }),
      };
    }

    // Filtrar solo archivos .md que sean capítulos
    const chapters = data
      .filter((file) => file.type === 'file' && file.name.endsWith('.md'))
      .map((file) => ({
        name: file.name,
        path: file.path,
        sha: file.sha,
        size: file.size,
      }));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ chapters }),
    };
  } catch (error: any) {
    console.error('Error obteniendo capítulos:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Error al obtener capítulos' }),
    };
  }
};
