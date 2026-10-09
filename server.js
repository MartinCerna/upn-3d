require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Importaciones de Prisma v7/v8
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');

const sqlite = new Database('dev.db');
const adapter = new PrismaBetterSqlite3(sqlite);
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 4000;

// Lista de estados permitidos según el flujo del laboratorio
const ESTADOS_VALIDOS = ['RECIBIDO', 'OBSERVADO', 'EN_COLA', 'EN_IMPRESION', 'TERMINADO'];

// Configuración de almacenamiento temporal local para archivos recibidos
const upload = multer({ dest: 'uploads/' });

// Configurar cliente de Google Drive vía OAuth 2.0
const oauth2Client = new google.auth.OAuth2(
   process.env.CLIENT_ID,
   process.env.CLIENT_SECRET,
   'https://developers.google.com/oauthplayground'
);
oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
const drive = google.drive({ version: 'v3', auth: oauth2Client });

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
   res.json({ mensaje: '🚀 API de Impresiones 3D UPN funcionando correctamente' });
});

// Endpoint: Crear un nuevo ticket y subir archivos .stl a Google Drive
app.post('/api/solicitudes', upload.array('archivos'), async (req, res) => {
   try {
      const { codigoUpn, nombresApellidos, curso, docente } = req.body;
      const archivos = req.files;

      if (!archivos || archivos.length === 0) {
         return res.status(400).json({ error: 'Debes adjuntar al menos un archivo .stl' });
      }

      // Generar código único de Ticket (Ej: TKN-8432)
      const numeroTicket = `TKN-${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. Guardar la solicitud base en la base de datos
      const nuevaSolicitud = await prisma.solicitud.create({
         data: {
            numeroTicket,
            codigoUpn,
            nombresApellidos,
            curso,
            docente,
            historial: {
               create: {
                  estado: 'RECIBIDO',
                  comentario: 'Solicitud creada por el estudiante',
                  creadoPor: 'Alumno',
               },
            },
         },
      });

      // 2. Subir cada archivo .stl a Google Drive y asociarlo al ticket
      const archivosSubidos = [];

      for (const archivo of archivos) {
         const driveResponse = await drive.files.create({
            requestBody: {
               name: `${numeroTicket}_${archivo.originalname}`,
               parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
            },
            media: {
               mimeType: archivo.mimetype,
               body: fs.createReadStream(archivo.path),
            },
            fields: 'id, webViewLink',
         });

         // Guardar registro del archivo en la BD
         const archivoGuardado = await prisma.archivoSTL.create({
            data: {
               solicitudId: nuevaSolicitud.id,
               driveFileId: driveResponse.data.id,
               nombreOriginal: archivo.originalname,
               urlWebView: driveResponse.data.webViewLink,
            },
         });

         archivosSubidos.push(archivoGuardado);

         // Eliminar el archivo temporal del disco local
         fs.unlinkSync(archivo.path);
      }

      res.status(201).json({
         mensaje: '✅ Solicitud y archivos procesados exitosamente',
         ticket: numeroTicket,
         solicitud: nuevaSolicitud,
         archivos: archivosSubidos,
      });

   } catch (error) {
      console.error('❌ Error al procesar solicitud:', error);
      res.status(500).json({ error: 'Ocurrió un error al procesar el ticket' });
   }
});

// Endpoint: Consultar el estado de un ticket por su número
app.get('/api/solicitudes/:ticket', async (req, res) => {
   try {
      const solicitud = await prisma.solicitud.findUnique({
         where: { numeroTicket: req.params.ticket },
         include: { archivos: true, historial: true },
      });

      if (!solicitud) {
         return res.status(404).json({ error: 'Ticket no encontrado' });
      }

      res.json(solicitud);
   } catch (error) {
      res.status(500).json({ error: 'Error al consultar la base de datos' });
   }
});

// ==========================================
// ENDPOINTS DE ADMINISTRACIÓN
// ==========================================

// Endpoint Admin: Listar todas las solicitudes
app.get('/api/admin/solicitudes', async (req, res) => {
   try {
      const solicitudes = await prisma.solicitud.findMany({
         include: {
            archivos: true,
            historial: {
               orderBy: { fechaCambio: 'desc' },
            },
         },
         orderBy: { fechaCreacion: 'desc' },
      });
      res.json(solicitudes);
   } catch (error) {
      console.error('❌ Error al obtener solicitudes admin:', error);
      res.status(500).json({ error: 'Error al consultar las solicitudes' });
   }
});

// Endpoint Admin: Actualizar estado con validación estricta
app.patch('/api/admin/solicitudes/:id/estado', async (req, res) => {
   try {
      const { id } = req.params;
      const { nuevoEstado, comentario, cambiadoPor } = req.body;

      if (!nuevoEstado || !ESTADOS_VALIDOS.includes(nuevoEstado)) {
         return res.status(400).json({ 
            error: `Estado no válido. Los estados permitidos son: ${ESTADOS_VALIDOS.join(', ')}` 
         });
      }

      const solicitudActualizada = await prisma.solicitud.update({
         where: { id: parseInt(id) },
         data: {
            historial: {
               create: {
                  estado: nuevoEstado,
                  comentario: comentario || `Estado cambiado a ${nuevoEstado}`,
                  creadoPor: cambiadoPor || 'Operador Lab',
               },
            },
         },
         include: { archivos: true, historial: true },
      });

      res.json({
         mensaje: '✅ Estado actualizado correctamente',
         solicitud: solicitudActualizada,
      });
   } catch (error) {
      console.error('❌ Error al actualizar estado:', error);
      res.status(500).json({ error: 'Error al actualizar el estado de la solicitud' });
   }
});

// Iniciar servidor
app.listen(PORT, () => {
   console.log(`\n=================================`);
   console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
   console.log(`=================================\n`);
});