const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar funciones de manejo
const { authHandler } = require('./functions/auth');
const { getBooksHandler } = require('./functions/get-books');
const { createBookHandler } = require('./functions/create-book');
const { editBookHandler } = require('./functions/edit-book');
const { getChaptersHandler } = require('./functions/get-chapters');
const { uploadChapterHandler } = require('./functions/upload-chapter');
const { deleteChaptersHandler } = require('./functions/delete-chapters');
const { contentIndexHandler } = require('./functions/content-index');
const { diagnosticHandler } = require('./functions/diagnostic');

// Rutas de la API
app.post('/api/auth', authHandler);
app.get('/api/get-books', getBooksHandler);
app.post('/api/create-book', createBookHandler);
app.put('/api/edit-book', editBookHandler);
app.get('/api/get-chapters', getChaptersHandler);
app.post('/api/upload-chapter', uploadChapterHandler);
app.delete('/api/delete-chapters', deleteChaptersHandler);
app.get('/api/content-index', contentIndexHandler);
app.get('/api/diagnostic', diagnosticHandler);
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Backend Express funcionando correctamente'
  });
});

// Servir archivos estáticos (frontend)
app.use(express.static('dist'));
app.use(express.static('public'));

// Ruta catch-all para React Router
app.get('*', (req, res) => {
  // Verificar si existe index.html en dist
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Si no hay build del frontend, servir una página simple
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Paokels Heavens - Backend API</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .status { color: #27ae60; font-weight: bold; }
          .api-endpoints { background: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .endpoint { margin: 10px 0; font-family: monospace; }
          .error { color: #e74c3c; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Paokels Heavens Backend</h1>
          <p class="status">✅ Servidor Express funcionando correctamente</p>
          <p>El backend está listo para recibir solicitudes.</p>
          
          <div class="api-endpoints">
            <h3>📡 Endpoints disponibles:</h3>
            <div class="endpoint"><strong>GET</strong> /api/health - Estado del servidor</div>
            <div class="endpoint"><strong>GET</strong> /api/diagnostic - Diagnóstico completo</div>
            <div class="endpoint"><strong>POST</strong> /api/auth - Autenticación</div>
            <div class="endpoint"><strong>GET</strong> /api/get-books - Listar libros</div>
            <div class="endpoint"><strong>POST</strong> /api/create-book - Crear libro</div>
            <div class="endpoint"><strong>PUT</strong> /api/edit-book - Editar libro</div>
            <div class="endpoint"><strong>GET</strong> /api/get-chapters - Listar capítulos</div>
            <div class="endpoint"><strong>POST</strong> /api/upload-chapter - Subir capítulo</div>
            <div class="endpoint"><strong>DELETE</strong> /api/delete-chapters - Eliminar capítulos</div>
            <div class="endpoint"><strong>GET</strong> /api/content-index - Índice público</div>
          </div>
          
          <p><em>Para el panel de administración, asegúrate de que el directorio 'dist' contiene el build del frontend.</em></p>
        </div>
      </body>
      </html>
    `);
  }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Express corriendo en puerto ${PORT}`);
  console.log(`📡 API disponible en: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend disponible en: http://localhost:${PORT}`);
});

module.exports = app;