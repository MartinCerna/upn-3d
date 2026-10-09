import { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminPanel() {
   const [solicitudes, setSolicitudes] = useState([])
   const [loading, setLoading] = useState(true)

   const fetchSolicitudes = async () => {
      try {
         const res = await axios.get('http://localhost:4000/api/admin/solicitudes')
         setSolicitudes(res.data)
      } catch (err) {
         console.error(err)
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      fetchSolicitudes()
   }, [])

   const handleCambiarEstado = async (id, nuevoEstado) => {
      try {
         await axios.patch(`http://localhost:4000/api/admin/solicitudes/${id}/estado`, {
            nuevoEstado,
            comentario: `Estado actualizado a ${nuevoEstado} desde el panel de control.`,
            cambiadoPor: 'Operador Admin'
         })
         fetchSolicitudes()
      } catch (err) {
         alert('Error al actualizar estado')
      }
   }

   if (loading) return <div style={{ padding: '20px' }}>Cargando solicitudes...</div>

   return (
      <div style={{ padding: '20px' }}>
         <h2>⚙️ Panel de Administración de Impresiones 3D</h2>
         <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
               <tr>
                  <th>Ticket</th>
                  <th>Estudiante</th>
                  <th>Curso / Docente</th>
                  <th>Archivos STL</th>
                  <th>Estado Actual</th>
                  <th>Acciones</th>
               </tr>
            </thead>
            <tbody>
               {solicitudes.map((s) => {
                  const ultimoEstado = s.historial[0]?.estado || 'RECIBIDO'
                  return (
                     <tr key={s.id}>
                        <td><strong>{s.numeroTicket}</strong></td>
                        <td>{s.nombresApellidos}<br /><small>{s.codigoUpn}</small></td>
                        <td>{s.curso}<br /><small>Docente: {s.docente}</small></td>
                        <td>
                           {s.archivos.map((a) => (
                              <div key={a.id}>
                                 <a href={a.urlWebView} target="_blank" rel="noreferrer">📥 {a.nombreOriginal}</a>
                              </div>
                           ))}
                        </td>
                        <td><strong>{ultimoEstado}</strong></td>
                        <td>
                           <select
                              value={ultimoEstado}
                              onChange={(e) => handleCambiarEstado(s.id, e.target.value)}
                           >
                              <option value="RECIBIDO">RECIBIDO</option>
                              <option value="OBSERVADO">OBSERVADO</option>
                              <option value="EN_COLA">EN_COLA</option>
                              <option value="EN_IMPRESION">EN_IMPRESION</option>
                              <option value="TERMINADO">TERMINADO</option>
                           </select>
                        </td>
                     </tr>
                  )
               })}
            </tbody>
         </table>
      </div>
   )
}