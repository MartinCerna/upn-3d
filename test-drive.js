require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Configuración de cliente OAuth2 con Refresh Token
const oauth2Client = new google.auth.OAuth2(
   process.env.CLIENT_ID,
   process.env.CLIENT_SECRET,
   'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
   refresh_token: process.env.REFRESH_TOKEN
});

const drive = google.drive({ version: 'v3', auth: oauth2Client });

async function probarSubidaDrive() {
   try {
      const nombreArchivoPrueba = 'prueba_conexion.txt';
      const rutaArchivoLocal = path.join(__dirname, nombreArchivoPrueba);

      // Crear archivo temporal de prueba
      fs.writeFileSync(rutaArchivoLocal, 'Hola desde la plataforma de impresion 3D UPN');

      console.log('📤 Subiendo archivo de prueba a Google Drive mediante OAuth2...');

      const response = await drive.files.create({
         requestBody: {
            name: 'Prueba_Conexion_Plataforma.txt',
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
         },
         media: {
            mimeType: 'text/plain',
            body: fs.createReadStream(rutaArchivoLocal),
         },
         fields: 'id, name, webViewLink',
      });

      // Eliminar archivo temporal local
      fs.unlinkSync(rutaArchivoLocal);

      console.log('✅ ¡Archivo subido con éxito!');
      console.log('🆔 ID del archivo en Drive:', response.data.id);
      console.log('🔗 Link de visualización:', response.data.webViewLink);

   } catch (error) {
      console.error('❌ Error al conectar con Google Drive:', error.message);
   }
}

probarSubidaDrive();