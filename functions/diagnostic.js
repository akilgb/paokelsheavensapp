const { corsHeaders } = require('./utils/verify-token');

async function diagnosticHandler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(204).set(corsHeaders).send('');
  }

  try {
    // Diagnosticar variables de entorno
    const environmentStatus = {
      GITHUB_TOKEN: process.env.GITHUB_TOKEN ? `✓ Configurado (${process.env.GITHUB_TOKEN.length} caracteres)` : '❌ Vacío',
      GITHUB_OWNER: process.env.GITHUB_OWNER || '❌ Vacío',
      GITHUB_REPO: process.env.GITHUB_REPO || '❌ Vacío', 
      GITHUB_BRANCH: process.env.GITHUB_BRANCH || '❌ Vacío',
      JWT_SECRET: process.env.JWT_SECRET ? `✓ Configurado (${process.env.JWT_SECRET.length} caracteres)` : '❌ Vacío',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? '✓ Configurado' : '❌ Vacío',
    };

    // Verificar conexión a GitHub API si tenemos token
    let githubStatus = 'No disponible';
    if (process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER) {
      try {
        const response = await fetch(`https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO || 'paokelsheavens-repo'}`, {
          headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Paokels-Heavens-Diagnostic/1.0'
          }
        });
        
        if (response.ok) {
          githubStatus = '✅ Conexión exitosa';
        } else {
          githubStatus = `❌ Error ${response.status}: ${response.statusText}`;
        }
      } catch (error) {
        githubStatus = `❌ Error de conexión: ${error.message}`;
      }
    }

    return res.status(200).set(corsHeaders).json({
      timestamp: new Date().toISOString(),
      environment: environmentStatus,
      github_api_status: githubStatus,
      current_github_config: {
        owner: process.env.GITHUB_OWNER || '(vacío)',
        repo: (process.env.GITHUB_REPO || 'paokelsheavens-repo'),
        branch: (process.env.GITHUB_BRANCH || 'main-branch')
      }
    });
  } catch (error) {
    return res.status(500).set(corsHeaders).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = { diagnosticHandler };