import { Handler } from '@netlify/functions';
import { corsHeaders } from './utils/verify-token';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
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

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        environment: environmentStatus,
        github_api_status: githubStatus,
        current_github_config: {
          owner: process.env.GITHUB_OWNER || '(vacío)',
          repo: (process.env.GITHUB_REPO || 'paokelsheavens-repo'),
          branch: (process.env.GITHUB_BRANCH || 'main-branch')
        }
      }, null, 2)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};