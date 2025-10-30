import { Handler } from '@netlify/functions';
import { verifyToken, corsHeaders } from './utils/verify-token';
import { getFileContent, createOrUpdateFile } from './utils/github';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'PUT') {
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
    const { slug, title, author, tags, rating, synopsis } = JSON.parse(event.body || '{}');

    if (!slug) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Slug es requerido' }),
      };
    }

    const bookPath = `public/content/books/${slug}`;

    // 1. Obtener metadata actual
    const metadataData = await getFileContent(`${bookPath}/metadata.json`);

    if (!metadataData) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Libro no encontrado' }),
      };
    }

    const metadata = JSON.parse(metadataData.content);

    // 2. Actualizar metadata
    if (title) metadata.title = title;
    if (author) metadata.author = author;
    if (tags) metadata.tags = tags;
    if (rating !== undefined) metadata.rating = rating;
    if (synopsis !== undefined) metadata.synopsis = synopsis;
    metadata.updatedAt = new Date().toISOString();

    await createOrUpdateFile(
      `${bookPath}/metadata.json`,
      JSON.stringify(metadata, null, 2),
      `Actualizar metadata de ${metadata.title}`,
      metadataData.sha
    );

    // 3. Actualizar books-manager.json
    const booksData = await getFileContent('public/content/books-manager.json');
    
    if (booksData) {
      const books = JSON.parse(booksData.content);
      const bookIndex = books.findIndex((b: any) => b.slug === slug);

      if (bookIndex !== -1) {
        books[bookIndex] = {
          ...books[bookIndex],
          title: metadata.title,
          author: metadata.author,
          tags: metadata.tags,
          rating: metadata.rating,
        };

        await createOrUpdateFile(
          'public/content/books-manager.json',
          JSON.stringify(books, null, 2),
          `Actualizar ${metadata.title} en books-manager`,
          booksData.sha
        );
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        book: metadata,
      }),
    };
  } catch (error: any) {
    console.error('Error editando libro:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Error al editar libro' }),
    };
  }
};
