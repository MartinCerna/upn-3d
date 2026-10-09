import { useState } from 'react'
import axios from 'axios'

export default function ConsultaTicket() {
   const [ticket, setTicket] = useState('')
   const [data, setData] = useState(null)
   const [error, setError] = useState('')
   const [loading, setLoading] = useState(false)

   const handleBuscar = async (e) => {
      e.preventDefault()
      setLoading(true)
      setError('')
      setData(null)

      try {
         const response = await axios.get(`http://localhost:4000/api/solicitudes/${ticket}`)
         setData(response.data)
      } catch (err) {
         setError(err.response?.data?.error || 'No se encontró el ticket ingresado')
      } finally {
         setLoading(false)
      }
   }

   return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
         <h2>Consultar Estado de Ticket</h2>
         <form onSubmit={handleBuscar} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <input
               type="text"
               placeholder="Ejemplo: TKN-8432"
               value={ticket}
               onChange={(e) => setTicket(e.target.value)}
               required
               style={{ flex: 1, padding: '8px' }}
            />
            <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
               {loading ? 'Buscando...' : 'Consultar'}
            </button>
         </form>

         {error && <div style={{ color: 'red' }}>{error}</div>}

         {data && (
            <div>
               <h3>Ticket: {data.numeroTicket}</h3>
               <p><strong>Estudiante:</strong> {data.nombresApellidos} ({data.codigoUpn})</p>
               <p><strong>Curso:</strong> {data.curso}</p>

               <h4>📁 Archivos Adjuntos:</h4>
               <ul>
                  {data.archivos.map((a) => (
                     <li key={a.id}>
                        <a href={a.urlWebView} target="_blank" rel="noreferrer">{a.nombreOriginal}</a>
                     </li>
                  ))}
               </ul>

               <h4>📜 Historial de Estados:</h4>
               <ul>
                  {data.historial.map((h) => (
                     <li key={h.id}>
                        <strong>[{h.estado}]</strong> - {h.comentario} <em>({new Date(h.fechaCambio).toLocaleString()})</em>
                     </li>
                  ))}
               </ul>
            </div>
         )}
      </div>
   )
}