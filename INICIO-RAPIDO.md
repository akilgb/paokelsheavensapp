# INICIO RAPIDO - Marestria Admin

## Tu plataforma está lista!

La plataforma de administración de libros Marestria Admin está completamente desarrollada y lista para ser desplegada.

## Lo que tienes

Una aplicación web completa que te permite:
- Crear libros con portadas y metadatos
- Editar libros existentes
- Subir y gestionar capítulos en Markdown
- Todo se sincroniza automáticamente con GitHub

## Lo que necesitas hacer ahora

Para activar tu plataforma, sigue estos 3 pasos simples:

### PASO 1: Obtén tu GitHub Token (5 minutos)

1. Ve a: https://github.com/settings/tokens
2. Click en "Generate new token (classic)"
3. Dale un nombre: "Marestria Admin"
4. Marca el checkbox: `repo` (Full control)
5. Click "Generate token"
6. COPIA el token que aparece (solo se muestra una vez)

### PASO 2: Genera tu JWT Secret (1 minuto)

Abre tu terminal y ejecuta:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia el resultado que aparece.

### PASO 3: Deploy a Netlify (10 minutos)

Opción más fácil - Deploy desde GitHub:

1. Sube este proyecto a GitHub
2. Ve a https://app.netlify.com
3. Click "Add new site" > "Import project"
4. Conecta tu repositorio GitHub
5. Configura:
   - Build command: `pnpm install && pnpm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

6. En **Environment variables**, agrega:
   ```
   GITHUB_TOKEN = (tu token del Paso 1)
   GITHUB_OWNER = (tu usuario de GitHub)
   GITHUB_REPO = paokelsheavens-main
   GITHUB_BRANCH = main
   ADMIN_PASSWORD = (tu password elegido)
   JWT_SECRET = (tu secret del Paso 2)
   ```

7. Click "Deploy"

Listo! En 2-3 minutos tu plataforma estará online.

## URLs Útiles

Después del deploy, tendrás:
- **Tu plataforma**: https://tu-sitio.netlify.app
- **Panel de Netlify**: https://app.netlify.com

## Primer Uso

1. Abre tu URL de Netlify
2. Ingresa tu ADMIN_PASSWORD
3. Crea tu primer libro
4. Ve a GitHub y verás el commit automático!

## Documentación Completa

Si necesitas más detalles:
- `README.md` - Visión general
- `docs/CONFIGURACION.md` - Guía completa paso a paso
- `docs/DEPLOY-NETLIFY.md` - Troubleshooting deploy
- `docs/CHECKLIST.md` - Checklist interactivo
- `docs/RESUMEN-PROYECTO.md` - Detalles técnicos

## Estructura del Proyecto

```
marestria-admin/
├── netlify/functions/    → Tu backend (7 funciones serverless)
├── src/                  → Tu frontend (React + TypeScript)
├── docs/                 → Documentación completa
├── dist/                 → Build de producción (generado)
└── netlify.toml         → Configuración de deploy
```

## Necesitas Ayuda?

1. Lee `docs/CONFIGURACION.md` para guía detallada
2. Usa `docs/CHECKLIST.md` para seguir paso a paso
3. Revisa `docs/DEPLOY-NETLIFY.md` si tienes problemas

## Qué hace la plataforma?

Cuando creas un libro, automáticamente:
1. Genera carpeta en tu repositorio: `public/content/books/nombre-del-libro/`
2. Guarda la portada como imagen
3. Crea archivo de metadatos JSON
4. Actualiza el índice general de libros
5. Hace commit a GitHub con mensaje descriptivo

Cuando subes un capítulo:
1. Crea archivo Markdown en la carpeta del libro
2. Hace commit automático

Todo sin que tengas que tocar código o Git!

## Seguridad

- Tu password admin protege el acceso
- El GitHub token solo lo usa el servidor (Netlify Functions)
- Todas las comunicaciones son por HTTPS
- JWT tokens expiran en 24 horas

## Costo

- Netlify Free Tier incluye:
  - 100GB bandwidth/mes
  - 300 minutos build/mes
  - Funciones serverless ilimitadas
  - SSL gratis

Más que suficiente para uso personal o de equipo pequeño.

## Todo Listo!

Tu plataforma está 100% funcional. Solo configura las credenciales y despliega.

Tiempo estimado total: 15-20 minutos

Feliz gestión de libros! 📚
