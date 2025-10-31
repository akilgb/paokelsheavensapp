const { getFileContent } = require('./utils/github');
const { verifyToken, corsHeaders } = require('./utils/verify-token');

async function getBooksHandler(req, res) {
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
    // Obtener books-manager.json
    const booksData = await getFileContent('public/content/books-manager.json');

    if (!booksData) {
      return res.status(200).set(corsHeaders).json({ books: [] });
    }

    const books = JSON.parse(booksData.content);

    return res.status(200).set(corsHeaders).json({ books });
  } catch (error) {
    console.error('Error obteniendo libros:', error);
    return res.status(500).set(corsHeaders).json({ error: 'Error al obtener libros' });
  }
}

module.exports = { getBooksHandler };