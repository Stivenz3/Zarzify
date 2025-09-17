# Configuración de CORS para Firebase Storage

## Problema
Las imágenes no se cargan porque Firebase Storage no tiene configurado CORS para tu dominio.

## Solución 1: Usando Google Cloud Console (Recomendado)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto `zarzify`
3. Ve a **Cloud Storage** > **Browser**
4. Haz clic en tu bucket `zarzify.appspot.com`
5. Ve a la pestaña **Permissions**
6. Haz clic en **Add Principal**
7. Agrega estos permisos:
   - **New principals**: `allUsers`
   - **Role**: `Storage Object Viewer`

## Solución 2: Usando gsutil (Línea de comandos)

1. Instala Google Cloud SDK
2. Ejecuta:
   ```bash
   gcloud auth login
   gsutil cors set cors.json gs://zarzify.appspot.com
   ```

## Solución 3: Configurar Storage Rules

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `zarzify`
3. Ve a **Storage** > **Rules**
4. Reemplaza las reglas con:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

## Verificación

Después de configurar, las imágenes deberían cargar correctamente en:
- Empleados
- Productos  
- Categorías
