const { deleteFile } = require('./utils/github');
const { verifyToken, corsHeaders } = require('./utils/verify-token');

async function deleteChaptersHandler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(204).set(corsHeaders).send('');
  }

  if (req.method !== 'DELETE') {
    return res.status(405).set(corsHeaders).json({ error: 'Método no permitido' });
  }

  // Verificar autenticación
  if (!verifyToken(req.headers.authorization)) {
    return res.status(401).set(corsHeaders).json({ error: 'No autorizado' });
  }

  try {
    const { chapters } = req.body;

    if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
      return res.status(400).set(corsHeaders).json({ error: 'Lista de capítulos es requerida' });
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
      } catch (error) {
        results.push({ path: chapter.path, success: false, error: error.message });
      }
    }

    return res.status(200).set(corsHeaders).json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Error eliminando capítulos:', error);
    return res.status(500).set(corsHeaders).json({ error: error.message || 'Error al eliminar capítulos' });
  }
}

module.exports = { deleteChaptersHandler };