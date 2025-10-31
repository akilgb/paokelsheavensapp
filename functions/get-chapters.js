const { octokit, githubConfig } = require('./utils/github');
const { verifyToken, corsHeaders } = require('./utils/verify-token');

async function getChaptersHandler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(204).set(corsHeaders).send('');
  }

  if (req.method !== 'GET') {
    return res.status(405).set(corsHeaders).json({ error: 'Método no permitido' });
  }

  // Verificar autenticación
  if (!verifyToken(req.headers.authorization)) {
    return res.status(401).set(corsHeaders).json({ error: 'No autorizado' });
  }

  try {
    const slug = req.query.slug;

    if (!slug) {
      return res.status(400).set(corsHeaders).json({ error: 'Slug del libro es requerido' });
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
      return res.status(500).set(corsHeaders).json({ error: 'Error al leer directorio' });
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

    return res.status(200).set(corsHeaders).json({ chapters });
  } catch (error) {
    console.error('Error obteniendo capítulos:', error);
    return res.status(500).set(corsHeaders).json({ error: error.message || 'Error al obtener capítulos' });
  }
}

module.exports = { getChaptersHandler };