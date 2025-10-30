# Marestria Admin - Documentación de Configuración

## Descripción

Plataforma de administración web para gestionar libros y capítulos con integración directa a GitHub. Permite crear, editar libros y gestionar capítulos del repositorio "paokelsheavens-main" de forma visual y automatizada.

## Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Backend**: Netlify Functions (Serverless)
- **Integración**: GitHub API via Octokit
- **Autenticación**: JWT simple

## Requisitos Previos

1. **GitHub Personal Access Token**
   - Ir a GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
   - Generar nuevo token con permisos: `repo` (Full control of private repositories)
   - Guardar el token de forma segura

2. **Cuenta de Netlify**
   - Crear cuenta en https://netlify.com si no tienes una
   - Tener acceso para configurar variables de entorno

## Configuración Paso a Paso

### 1. Variables de Entorno en Netlify

Después de desplegar el sitio en Netlify, configura las siguientes variables de entorno:

**Site Configuration > Environment Variables > Add a variable**

```
GITHUB_TOKEN=tu_github_personal_access_token
GITHUB_OWNER=tu_usuario_de_github
GITHUB_REPO=paokelsheavens-main
GITHUB_BRANCH=main
ADMIN_PASSWORD=tu_contraseña_admin_segura
JWT_SECRET=tu_clave_secreta_jwt_aleatoria
```

#### Descripción de Variables:

- **GITHUB_TOKEN**: Token de acceso personal de GitHub con permisos `repo`
- **GITHUB_OWNER**: Usuario o organización dueña del repositorio
- **GITHUB_REPO**: Nombre del repositorio (paokelsheavens-main)
- **GITHUB_BRANCH**: Rama a modificar (main por defecto)
- **ADMIN_PASSWORD**: Contraseña para acceder al panel de administración
- **JWT_SECRET**: Clave secreta para firmar tokens JWT (generar aleatoriamente)

### 2. Generar JWT_SECRET Seguro

Puedes generar una clave aleatoria con:

```bash
# En Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# En terminal Linux/Mac
openssl rand -hex 32
```

### 3. Deploy a Netlify

#### Opción A: Deploy desde GitHub

1. Conectar repositorio a Netlify
2. Configurar build settings:
   - **Build command**: `pnpm install && pnpm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
3. Agregar variables de entorno (ver paso 1)
4. Deploy

#### Opción B: Deploy Manual

```bash
# Instalar Netlify CLI
pnpm add -g netlify-cli

# Login a Netlify
netlify login

# Desde el directorio del proyecto
cd marestria-admin

# Deploy
netlify deploy --prod
```

### 4. Configurar Dominio Personalizado (Opcional)

1. En Netlify: Site settings > Domain management
2. Agregar dominio personalizado: `marestria-admin.netlify.app`
3. Netlify configurará automáticamente el SSL

## Uso de la Plataforma

### Iniciar Sesión

1. Acceder a la URL de la plataforma
2. Ingresar la contraseña configurada en `ADMIN_PASSWORD`
3. Click en "Iniciar Sesión"

### Crear Libro

1. Ir a la pestaña "Crear Libro"
2. Completar formulario:
   - Título del libro
   - Autor
   - Tags (separados por comas)
   - Rating (1-5 estrellas)
   - Sinopsis
   - Portada (drag & drop o seleccionar)
3. Click en "Crear Libro"

**Resultado**: 
- Se crea carpeta `public/content/books/{slug-del-libro}/`
- Se guarda portada como `cover.jpg`
- Se crea `metadata.json` con toda la información
- Se crea capítulo de ejemplo
- Se actualiza `books-manager.json`
- Commit automático al repositorio

### Editar Libro

1. Ir a la pestaña "Editar Libros"
2. Click en ícono de lápiz del libro a editar
3. Modificar campos deseados
4. Click en "Guardar Cambios"

**Resultado**:
- Actualiza `metadata.json` del libro
- Actualiza `books-manager.json`
- Commit automático

### Gestionar Capítulos

1. Ir a la pestaña "Gestionar Capítulos"
2. Seleccionar libro del dropdown
3. Ver lista de capítulos existentes

#### Subir Nuevo Capítulo

1. Click en "Subir Capítulo"
2. Ingresar título del capítulo
3. Escribir contenido en formato Markdown
4. Click en "Subir Capítulo"

**Resultado**:
- Crea archivo `{slug-del-capitulo}.md` en la carpeta del libro
- Commit automático

#### Eliminar Capítulos

1. Seleccionar capítulos con checkbox
2. Click en "Eliminar Seleccionados"
3. Confirmar eliminación

**Resultado**:
- Elimina archivos del repositorio
- Commit automático por cada archivo

## Estructura del Repositorio Target

```
paokelsheavens-main/
└── public/
    └── content/
        ├── books-manager.json
        └── books/
            └── {slug-del-libro}/
                ├── cover.jpg
                ├── metadata.json
                ├── capitulo-1.md
                ├── capitulo-2.md
                └── ...
```

### Formato de books-manager.json

```json
[
  {
    "title": "El Señor de los Anillos",
    "author": "J.R.R. Tolkien",
    "slug": "el-senor-de-los-anillos",
    "rating": 5,
    "tags": ["fantasia", "aventura", "epico"],
    "coverImage": "public/content/books/el-senor-de-los-anillos/cover.jpg"
  }
]
```

### Formato de metadata.json

```json
{
  "title": "El Señor de los Anillos",
  "author": "J.R.R. Tolkien",
  "tags": ["fantasia", "aventura", "epico"],
  "rating": 5,
  "synopsis": "Una épica historia de aventuras...",
  "slug": "el-senor-de-los-anillos",
  "chapters": [],
  "createdAt": "2025-10-31T01:27:16.000Z",
  "updatedAt": "2025-10-31T01:27:16.000Z"
}
```

## Seguridad

### Autenticación

- Autenticación basada en password simple
- Tokens JWT con expiración de 24 horas
- Token almacenado en localStorage del navegador
- Verificación en cada request al backend

### Mejores Prácticas

1. **Contraseña Admin**: Usar contraseña fuerte y única
2. **JWT Secret**: Generar clave aleatoria de al menos 32 caracteres
3. **GitHub Token**: Limitar permisos solo al repositorio necesario
4. **Variables de Entorno**: Nunca commitear credenciales al código
5. **HTTPS**: Netlify proporciona SSL automático

## Troubleshooting

### Error: "No autorizado"

- Verificar que las variables de entorno estén configuradas en Netlify
- Re-iniciar sesión en la plataforma
- Verificar que el token JWT no haya expirado

### Error: "Error al crear libro"

- Verificar que GITHUB_TOKEN tenga permisos `repo`
- Verificar que GITHUB_OWNER y GITHUB_REPO sean correctos
- Verificar que el repositorio existe y tienes acceso

### Error: "Libro ya existe"

- El slug generado del título ya existe
- Cambiar el título ligeramente o editar el libro existente

### Netlify Functions no responden

- Verificar que las variables de entorno estén configuradas
- Revisar logs en Netlify Dashboard > Functions
- Verificar que las dependencias estén instaladas correctamente

## Mantenimiento

### Actualizar Dependencias

```bash
pnpm update
```

### Ver Logs de Netlify Functions

1. Netlify Dashboard > Functions
2. Seleccionar función específica
3. Ver logs en tiempo real

### Regenerar Deploy

1. Netlify Dashboard > Deploys
2. Click en "Trigger deploy" > "Deploy site"

## Soporte

Para problemas o preguntas:
1. Revisar logs de Netlify Functions
2. Verificar configuración de variables de entorno
3. Comprobar permisos del GitHub Token
4. Revisar estructura del repositorio target

## Licencia

Este proyecto es privado y propietario.
