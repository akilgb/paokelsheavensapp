const { getFileContent, createOrUpdateFile, slugify } = require('./utils/github');
const { verifyToken, corsHeaders } = require('./utils/verify-token');

async function createBookHandler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(204).set(corsHeaders).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).set(corsHeaders).json({ error: 'Método no permitido' });
  }

  // Verificar autenticación
  if (!verifyToken(req.headers.authorization)) {
    return res.status(401).set(corsHeaders).json({ error: 'No autorizado' });
  }

  try {
    const { title, author, tags, rating, synopsis, coverImage } = req.body;

    if (!title || !author) {
      return res.status(400).set(corsHeaders).json({ error: 'Título y autor son requeridos' });
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
    if (books.some((b) => b.slug === bookSlug)) {
      return res.status(400).set(corsHeaders).json({ error: 'Ya existe un libro con ese título' });
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
    const exampleChapter = `# Capítulo 1\n\nEste es un capítulo de ejemplo para "${title}".\n\nPuedes editarlo o eliminarlo desde el panel de administración.\n`;

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

    return res.status(201).set(corsHeaders).json({
      success: true,
      book: {
        slug: bookSlug,
        ...metadata,
      },
    });
  } catch (error) {
    console.error('Error creando libro:', error);
    return res.status(500).set(corsHeaders).json({ error: error.message || 'Error al crear libro' });
  }
}

module.exports = { createBookHandler };