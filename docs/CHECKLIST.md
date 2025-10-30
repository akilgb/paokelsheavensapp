# Checklist de Configuración - Marestria Admin

Este checklist te guiará paso a paso para configurar y desplegar la plataforma.

## Pre-requisitos

- [ ] Cuenta de GitHub activa
- [ ] Acceso al repositorio `paokelsheavens-main`
- [ ] Cuenta de Netlify (gratuita está bien)
- [ ] Node.js 18+ instalado localmente (para testing)

## Paso 1: Obtener GitHub Personal Access Token

- [ ] Ir a https://github.com/settings/tokens
- [ ] Click "Generate new token (classic)"
- [ ] Nombre: "Marestria Admin Access"
- [ ] Marcar scope: `repo` (Full control of private repositories)
- [ ] Click "Generate token"
- [ ] Copiar token (se muestra solo una vez)
- [ ] Guardar token en lugar seguro

**Token copiado**: `ghp_________________________________`

## Paso 2: Generar JWT Secret

Ejecutar en terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- [ ] Ejecutado comando
- [ ] Copiado resultado

**JWT Secret**: `__________________________________________`

## Paso 3: Definir Password Admin

Elegir password seguro para acceder a la plataforma:

- [ ] Password definido (mínimo 12 caracteres, combinar letras, números, símbolos)

**Admin Password**: `__________________________________________`

## Paso 4: Subir Código a GitHub (Opción A) o Deploy Manual (Opción B)

### Opción A: Deploy desde GitHub (Recomendado)

- [ ] Crear repositorio en GitHub llamado `marestria-admin`
- [ ] Subir código al repositorio:
  ```bash
  cd marestria-admin
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin https://github.com/TU_USUARIO/marestria-admin.git
  git push -u origin main
  ```

### Opción B: Deploy con Netlify CLI

- [ ] Instalar Netlify CLI: `pnpm add -g netlify-cli`
- [ ] Login: `netlify login`
- [ ] Ir al directorio del proyecto

## Paso 5: Conectar con Netlify

### Si elegiste Opción A (GitHub):

- [ ] Ir a https://app.netlify.com
- [ ] Click "Add new site" > "Import an existing project"
- [ ] Seleccionar GitHub
- [ ] Autorizar acceso a GitHub
- [ ] Seleccionar repositorio `marestria-admin`
- [ ] Configurar build:
  - Build command: `pnpm install && pnpm run build`
  - Publish directory: `dist`
  - Functions directory: `netlify/functions`
- [ ] Click "Deploy site"

### Si elegiste Opción B (CLI):

- [ ] Ejecutar: `netlify init`
- [ ] Seguir wizard de configuración
- [ ] Nombre del sitio: `marestria-admin`

## Paso 6: Configurar Variables de Entorno en Netlify

En Netlify Dashboard: **Site settings > Environment variables > Add a variable**

Agregar las siguientes (una por una):

- [ ] `GITHUB_TOKEN` = (tu GitHub Personal Access Token del Paso 1)
- [ ] `GITHUB_OWNER` = (tu usuario de GitHub, ej: "juanperez")
- [ ] `GITHUB_REPO` = `paokelsheavens-main`
- [ ] `GITHUB_BRANCH` = `main`
- [ ] `ADMIN_PASSWORD` = (tu password del Paso 3)
- [ ] `JWT_SECRET` = (tu JWT secret del Paso 2)

- [ ] Click "Save" después de agregar todas las variables

## Paso 7: Re-deploy con Variables

- [ ] En Netlify Dashboard: **Deploys > Trigger deploy > Deploy site**
- [ ] Esperar a que el deploy termine (1-3 minutos)
- [ ] Ver que el deploy sea exitoso (icono verde)

## Paso 8: Verificar Funciones

- [ ] En Netlify Dashboard: **Functions**
- [ ] Verificar que aparecen 7 funciones:
  - auth
  - create-book
  - edit-book
  - get-books
  - get-chapters
  - upload-chapter
  - delete-chapters

## Paso 9: Probar la Plataforma

- [ ] Abrir URL de Netlify (ej: https://marestria-admin.netlify.app)
- [ ] Ver pantalla de login
- [ ] Ingresar Admin Password del Paso 3
- [ ] Click "Iniciar Sesión"
- [ ] Ver Dashboard con 3 pestañas

## Paso 10: Crear Libro de Prueba

- [ ] En pestaña "Crear Libro":
  - Título: "Libro de Prueba"
  - Autor: "Admin Test"
  - Tags: "prueba, test"
  - Rating: 5
  - Sinopsis: "Este es un libro de prueba"
- [ ] Click "Crear Libro"
- [ ] Ver mensaje de éxito
- [ ] Cambiar a pestaña "Editar Libros"
- [ ] Ver libro creado en la lista

## Paso 11: Verificar en GitHub

- [ ] Ir a https://github.com/TU_USUARIO/paokelsheavens-main
- [ ] Ver commits recientes
- [ ] Debe haber commits con mensajes:
  - "Crear libro: Libro de Prueba"
  - "Agregar Libro de Prueba a books-manager"
- [ ] Ver carpeta `public/content/books/libro-de-prueba/`
- [ ] Verificar archivos:
  - metadata.json
  - capitulo-1.md

## Paso 12: Probar Gestión de Capítulos

- [ ] En Dashboard, ir a pestaña "Gestionar Capítulos"
- [ ] Seleccionar "Libro de Prueba" del dropdown
- [ ] Ver capítulo existente "capitulo-1.md"
- [ ] Click "Subir Capítulo"
- [ ] Título: "Capítulo 2 - Continuación"
- [ ] Contenido: "# Capítulo 2\n\nEste es el segundo capítulo de prueba."
- [ ] Click "Subir Capítulo"
- [ ] Ver nuevo capítulo en la lista

## Paso 13: Verificar Segundo Commit

- [ ] Ir a GitHub repo
- [ ] Ver nuevo commit: "Agregar capítulo: Capítulo 2..."
- [ ] Ver archivo `capitulo-2-continuacion.md` creado

## Paso 14: Configurar Dominio (Opcional)

- [ ] En Netlify Dashboard: **Site settings > Domain management**
- [ ] Click "Add custom domain"
- [ ] Usar dominio personalizado o renombrar sitio a `marestria-admin`
- [ ] Netlify configurará SSL automáticamente

## Finalización

- [ ] Todas las pruebas pasaron
- [ ] La plataforma está funcionando correctamente
- [ ] Los commits aparecen en GitHub
- [ ] Guardar credenciales en lugar seguro
- [ ] Compartir URL con equipo (si aplica)

## URLs Importantes

- **Plataforma Admin**: https://_____________________.netlify.app
- **Netlify Dashboard**: https://app.netlify.com/sites/_____________________
- **GitHub Repo Target**: https://github.com/_________/paokelsheavens-main

## Credenciales (Guardar en Lugar Seguro)

```
Admin Password: __________________________________________
GitHub Token: ghp_________________________________
JWT Secret: __________________________________________
```

## Soporte

Si algo falla, consultar:
1. `docs/CONFIGURACION.md` - Guía completa
2. `docs/DEPLOY-NETLIFY.md` - Troubleshooting
3. Netlify Functions logs
4. GitHub commits

## Próximos Pasos

Ahora puedes:
- Crear libros reales
- Subir capítulos desde el panel
- Editar metadatos de libros existentes
- Gestionar todo tu contenido de forma visual

La plataforma está lista para uso en producción!
