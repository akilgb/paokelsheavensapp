# Guía Rápida de Deploy a Netlify

## Opción 1: Deploy desde GitHub (Recomendado)

### Paso 1: Subir código a GitHub

```bash
cd /workspace/marestria-admin

# Inicializar repositorio Git
git init
git add .
git commit -m "Initial commit: Marestria Admin Platform"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/TU_USUARIO/marestria-admin.git
git branch -M main
git push -u origin main
```

### Paso 2: Conectar con Netlify

1. Ir a https://app.netlify.com
2. Click en "Add new site" > "Import an existing project"
3. Seleccionar "GitHub" y autorizar
4. Buscar y seleccionar el repositorio `marestria-admin`
5. Configurar build settings:
   - **Build command**: `pnpm install && pnpm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
6. Click en "Deploy site"

### Paso 3: Configurar Variables de Entorno

1. En Netlify Dashboard, ir a: **Site settings > Environment variables**
2. Click en **"Add a variable"**
3. Agregar las siguientes variables una por una:

```
GITHUB_TOKEN=ghp_tu_token_personal_de_github_aqui
GITHUB_OWNER=tu_usuario_de_github
GITHUB_REPO=paokelsheavens-main
GITHUB_BRANCH=main
ADMIN_PASSWORD=TuPasswordSuperSeguro123
JWT_SECRET=clave_aleatoria_de_32_caracteres_minimo
```

**IMPORTANTE**: Para generar JWT_SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. Click en **"Save"**
5. Ir a **Deploys** y click en **"Trigger deploy"** > **"Deploy site"**

### Paso 4: Configurar Dominio (Opcional)

1. En Netlify Dashboard, ir a: **Site settings > Domain management**
2. En "Custom domains" click en **"Add custom domain"**
3. Ingresar: `marestria-admin` (Netlify agregará `.netlify.app` automáticamente)
4. Confirmar y esperar propagación DNS

## Opción 2: Deploy Manual con Netlify CLI

### Paso 1: Instalar Netlify CLI

```bash
pnpm add -g netlify-cli
```

### Paso 2: Login a Netlify

```bash
netlify login
```

### Paso 3: Inicializar Proyecto

```bash
cd /workspace/marestria-admin
netlify init
```

Seleccionar:
- "Create & configure a new site"
- Equipo/Team
- Nombre del sitio: `marestria-admin`
- Build command: `pnpm install && pnpm run build`
- Directory to deploy: `dist`
- Functions directory: `netlify/functions`

### Paso 4: Configurar Variables de Entorno

```bash
netlify env:set GITHUB_TOKEN "tu_token_aqui"
netlify env:set GITHUB_OWNER "tu_usuario"
netlify env:set GITHUB_REPO "paokelsheavens-main"
netlify env:set GITHUB_BRANCH "main"
netlify env:set ADMIN_PASSWORD "TuPasswordSeguro123"
netlify env:set JWT_SECRET "tu_jwt_secret_aleatorio"
```

### Paso 5: Deploy

```bash
# Deploy de prueba
netlify deploy

# Deploy a producción
netlify deploy --prod
```

## Cómo Obtener GitHub Personal Access Token

1. Ir a https://github.com/settings/tokens
2. Click en **"Generate new token"** > **"Generate new token (classic)"**
3. Configurar:
   - **Note**: Marestria Admin Access
   - **Expiration**: No expiration (o según preferencia)
   - **Select scopes**: Marcar `repo` (Full control of private repositories)
4. Click en **"Generate token"**
5. **IMPORTANTE**: Copiar el token inmediatamente (solo se muestra una vez)
6. Guardar en lugar seguro

## Verificación Post-Deploy

Después del deploy, verificar:

1. **Site está activo**: Visitar URL de Netlify
2. **Functions deployed**: En Dashboard > Functions, ver 7 funciones listadas
3. **Variables configuradas**: En Site settings > Environment variables, ver todas las variables
4. **Login funciona**: Intentar login con ADMIN_PASSWORD
5. **GitHub integration**: Crear un libro de prueba y verificar commit en GitHub

## Troubleshooting

### Error: Functions no aparecen

- Verificar que `netlify.toml` existe en la raíz
- Verificar que `functions` directory es `netlify/functions`
- Re-deploy el sitio

### Error: "No autorizado" al login

- Verificar que `ADMIN_PASSWORD` está configurado en variables de entorno
- Verificar que `JWT_SECRET` está configurado
- Hacer un nuevo deploy después de agregar variables

### Error al crear libro

- Verificar que `GITHUB_TOKEN` tiene permisos `repo`
- Verificar que `GITHUB_OWNER` y `GITHUB_REPO` son correctos
- Verificar que el token no ha expirado
- Revisar logs en Netlify Dashboard > Functions > create-book

### Build falla

- Verificar versión de Node.js (debe ser 18+)
- Verificar que todas las dependencias están en `package.json`
- Limpiar cache: Site settings > Build & deploy > Build settings > Clear cache and deploy

## Estructura de URLs

Después del deploy:

- **Login**: `https://marestria-admin.netlify.app/`
- **API Auth**: `https://marestria-admin.netlify.app/.netlify/functions/auth`
- **API Books**: `https://marestria-admin.netlify.app/.netlify/functions/get-books`
- etc.

## Próximos Pasos

1. Hacer login en la plataforma
2. Crear un libro de prueba
3. Verificar que aparece en el repositorio GitHub
4. Subir un capítulo
5. Editar metadatos del libro
6. Eliminar capítulo de prueba

## Contacto y Soporte

Para problemas:
1. Revisar logs en Netlify Dashboard
2. Verificar variables de entorno
3. Consultar documentación en `docs/CONFIGURACION.md`
