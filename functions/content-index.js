const { octokit, githubConfig } = require('./utils/github');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

async function contentIndexHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).set({ ...corsHeaders, 'Content-Type': 'application/json' }).json({ error: 'Method Not Allowed' });
  }

  try {
    // Obtener el archivo books-manager.json
    const booksManager = await octokit.repos.getContent({
      owner: githubConfig.owner,
      repo: githubConfig.repo,
      path: 'public/content/books-manager.json',
      ref: githubConfig.branch,
    });

    if (!booksManager.data || !booksManager.data.content) {
      return res.status(404).set({ ...corsHeaders, 'Content-Type': 'application/json' }).json({ error: 'Books manager not found' });
    }

    const booksManagerContent = Buffer.from(booksManager.data.content, 'base64').toString('utf-8');
    const booksList = JSON.parse(booksManagerContent);

    const novels = [];

    // Para cada libro, obtener sus metadatos y capítulos
    for (const book of booksList) {
      try {
        // Obtener metadata.json del libro
        const metadataResponse = await octokit.repos.getContent({
          owner: githubConfig.owner,
          repo: githubConfig.repo,
          path: `public/content/books/${book.slug}/metadata.json`,
          ref: githubConfig.branch,
        });

        if (!metadataResponse.data || !metadataResponse.data.content) {
          continue; // Saltar libro si no se puede obtener metadata
        }

        const metadataContent = Buffer.from(metadataResponse.data.content, 'base64').toString('utf-8');
        const metadata = JSON.parse(metadataContent);

        // Obtener lista de capítulos
        const chaptersResponse = await octokit.repos.getContent({
          owner: githubConfig.owner,
          repo: githubConfig.repo,
          path: `public/content/books/${book.slug}`,
          ref: githubConfig.branch,
        });

        if (!chaptersResponse.data || !Array.isArray(chaptersResponse.data)) {
          continue; // Saltar libro si no se puede obtener lista de capítulos
        }

        const chapters = chaptersResponse.data.filter((item) => 
          item.type === 'file' && item.name.endsWith('.md') && item.name !== 'metadata.json'
        );

        // Formatear capítulos
        const formattedChapters = chapters.map((chapter, index) => ({
          id: `ch-${index + 1}`,
          title: chapter.name.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          url: `/${book.slug}/${chapter.name.replace('.md', '')}`
        }));

        // Construir novela para la librería pública
        const novel = {
          id: book.slug,
          title: metadata.title,
          slug: metadata.slug,
          author: metadata.author,
          tags: metadata.tags || [],
          rating: metadata.rating || 5,
          cover: book.coverImage ? `https://raw.githubusercontent.com/${githubConfig.owner}/${githubConfig.repo}/${githubConfig.branch}/${book.coverImage}` : 'https://via.placeholder.com/200x300/1a202c/ffffff?text=Cover',
          synopsis: metadata.synopsis || 'Sin sinopsis disponible.',
          chapters: formattedChapters
        };

        novels.push(novel);
      } catch (bookError) {
        console.error(`Error processing book ${book.slug}:`, bookError);
        continue; // Continuar con el siguiente libro
      }
    }

    // Respuesta con estructura compatible con la librería pública
    const response = {
      novels,
      total: novels.length,
      lastUpdated: new Date().toISOString()
    };

    return res.status(200).set({ 
      ...corsHeaders, 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache' // Evitar caché para datos actualizados
    }).json(response);

  } catch (error) {
    console.error('Error generating content index:', error);
    
    // En caso de error, retornar estructura mínima
    const fallbackResponse = {
      novels: [],
      total: 0,
      lastUpdated: new Date().toISOString(),
      error: 'Unable to load novels from repository'
    };

    return res.status(500).set({ ...corsHeaders, 'Content-Type': 'application/json' }).json(fallbackResponse);
  }
}

module.exports = { contentIndexHandler };