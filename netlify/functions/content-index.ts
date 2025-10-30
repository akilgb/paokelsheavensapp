import { Handler } from '@netlify/functions';
import { octokit, githubConfig } from './utils/github';
import { corsHeaders } from './utils/verify-token';

interface Novel {
  id: string;
  title: string;
  slug: string;
  author: string;
  tags: string[];
  rating: number;
  cover: string;
  synopsis: string;
  chapters: Chapter[];
}

interface Chapter {
  id: string;
  title: string;
  url: string;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Obtener el archivo books-manager.json
    const booksManager = await octokit.repos.getContent({
      owner: githubConfig.owner,
      repo: githubConfig.repo,
      path: 'public/content/books-manager.json',
      ref: githubConfig.branch,
    });

    if (!booksManager.data || !('content' in booksManager.data)) {
      return {
        statusCode: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Books manager not found' })
      };
    }

    const booksManagerContent = Buffer.from(booksManager.data.content, 'base64').toString('utf-8');
    const booksList = JSON.parse(booksManagerContent);

    const novels: Novel[] = [];

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

        if (!metadataResponse.data || !('content' in metadataResponse.data)) {
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

        if (!chaptersResponse.data || !('content' in chaptersResponse.data)) {
          continue; // Saltar libro si no se puede obtener lista de capítulos
        }

        const chapters = (chaptersResponse.data as any).filter((item: any) => 
          item.type === 'file' && item.name.endsWith('.md') && item.name !== 'metadata.json'
        );

        // Formatear capítulos
        const formattedChapters: Chapter[] = chapters.map((chapter: any, index: number) => ({
          id: `ch-${index + 1}`,
          title: chapter.name.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          url: `/${book.slug}/${chapter.name.replace('.md', '')}`
        }));

        // Construir novela para la librería pública
        const novel: Novel = {
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

    return {
      statusCode: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache' // Evitar caché para datos actualizados
      },
      body: JSON.stringify(response, null, 2)
    };

  } catch (error: any) {
    console.error('Error generating content index:', error);
    
    // En caso de error, retornar estructura mínima
    const fallbackResponse = {
      novels: [],
      total: 0,
      lastUpdated: new Date().toISOString(),
      error: 'Unable to load novels from repository'
    };

    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(fallbackResponse, null, 2)
    };
  }
};