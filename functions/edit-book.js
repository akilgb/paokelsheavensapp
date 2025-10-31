const { getFileContent, createOrUpdateFile } = require('./utils/github');
const { verifyToken, corsHeaders } = require('./utils/verify-token');

async function editBookHandler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(204).set(corsHeaders).send('');
  }

  if (req.method !== 'PUT') {
    return res.status(405).set(corsHeaders).json({ error: 'Método no permitido' });
  }

  // Verificar autenticación
  if (!verifyToken(req.headers.authorization)) {
    return res.status(401).set(corsHeaders).json({ error: 'No autorizado' });
  }

  try {
    const { slug, title, author, tags, rating, synopsis } = req.body;

    if (!slug) {
      return res.status(400).set(corsHeaders).json({ error: 'Slug es requerido' });
    }

    const bookPath = `public/content/books/${slug}`;

    // 1. Obtener metadata actual
    const metadataData = await getFileContent(`${bookPath}/metadata.json`);

    if (!metadataData) {
      return res.status(404).set(corsHeaders).json({ error: 'Libro no encontrado' });
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
      const bookIndex = books.findIndex((b) => b.slug === slug);

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

    return res.status(200).set(corsHeaders).json({
      success: true,
      book: metadata,
    });
  } catch (error) {
    console.error('Error editando libro:', error);
    return res.status(500).set(corsHeaders).json({ error: error.message || 'Error al editar libro' });
  }
}

module.exports = { editBookHandler };