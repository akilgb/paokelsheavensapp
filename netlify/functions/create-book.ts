import { Handler } from '@netlify/functions';
import { verifyToken, corsHeaders } from './utils/verify-token';
import { getFileContent, createOrUpdateFile, slugify } from './utils/github';

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
    const { title, author, tags, rating, synopsis, coverImage } = JSON.parse(event.body || '{}');

    if (!title || !author) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Título y autor son requeridos' }),
      };
    }

    const bookSlug = slugify(title);
    const bookPath = `public/content/books/${bookSlug}`;

    // 1. Obtener o crear books-manager.json
    const booksData = await getFileContent('public/content/books-manager.json');
    let books = [];
    let booksSha = undefined;

    if (booksData) {
      books = JSON.parse(booksData.content);
      booksSha = booksData.sha;
    }

    // Verificar si el libro ya existe
    if (books.some((b: any) => b.slug === bookSlug)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Ya existe un libro con ese título' }),
      };
    }

    // 2. Crear portada si se proporciona
    if (coverImage) {
      const coverPath = `${bookPath}/cover.jpg`;
      // coverImage debe estar en base64
      await createOrUpdateFile(
        coverPath,
        coverImage,
        `Agregar portada para ${title}`
      );
    }

    // 3. Crear metadata.json
    const metadata = {
      title,
      author,
      tags: tags || [],
      rating: rating || 5,
      synopsis: synopsis || '',
      slug: bookSlug,
      chapters: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await createOrUpdateFile(
      `${bookPath}/metadata.json`,
      JSON.stringify(metadata, null, 2),
      `Crear libro: ${title}`
    );

    // 4. Crear capítulo de ejemplo
    const exampleChapter = `# Capítulo 1

Este es un capítulo de ejemplo para "${title}".

Puedes editarlo o eliminarlo desde el panel de administración.
`;

    await createOrUpdateFile(
      `${bookPath}/capitulo-1.md`,
      exampleChapter,
      `Crear capítulo de ejemplo para ${title}`
    );

    // 5. Actualizar books-manager.json
    books.push({
      title,
      author,
      slug: bookSlug,
      rating: rating || 5,
      tags: tags || [],
      coverImage: coverImage ? `${bookPath}/cover.jpg` : null,
    });

    await createOrUpdateFile(
      'public/content/books-manager.json',
      JSON.stringify(books, null, 2),
      `Agregar ${title} a books-manager`,
      booksSha
    );

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        book: {
          slug: bookSlug,
          ...metadata,
        },
      }),
    };
  } catch (error: any) {
    console.error('Error creando libro:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Error al crear libro' }),
    };
  }
};
