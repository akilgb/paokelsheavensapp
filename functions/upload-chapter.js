const { createOrUpdateFile, slugify } = require('./utils/github');
const { verifyToken, corsHeaders } = require('./utils/verify-token');

async function uploadChapterHandler(req, res) {
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
    const { slug, chapterTitle, content } = req.body;

    if (!slug || !chapterTitle || !content) {
      return res.status(400).set(corsHeaders).json({ error: 'Slug, título y contenido son requeridos' });
    }

    const chapterSlug = slugify(chapterTitle);
    const chapterPath = `public/content/books/${slug}/${chapterSlug}.md`;

    // Crear o actualizar capítulo
    await createOrUpdateFile(
      chapterPath,
      content,
      `Agregar capítulo: ${chapterTitle} a ${slug}`
    );

    return res.status(201).set(corsHeaders).json({
      success: true,
      chapter: {
        title: chapterTitle,
        slug: chapterSlug,
        path: chapterPath,
      },
    });
  } catch (error) {
    console.error('Error subiendo capítulo:', error);
    return res.status(500).set(corsHeaders).json({ error: error.message || 'Error al subir capítulo' });
  }
}

module.exports = { uploadChapterHandler };