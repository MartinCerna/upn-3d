import { useState } from 'react'
import axios from 'axios'

export default function FormularioSolicitud() {
   const [formData, setFormData] = useState({
      codigoUpn: '',
      nombresApellidos: '',
      curso: '',
      docente: ''
   })
   const [archivos, setArchivos] = useState([])
   const [loading, setLoading] = useState(false)
   const [ticketGenerado, setTicketGenerado] = useState(null)
   const [error, setError] = useState('')

   const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value })
   }

   const handleFileChange = (e) => {
      setArchivos(e.target.files)
   }

   const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)
      setError('')

      const data = new FormData()
      data.append('codigoUpn', formData.codigoUpn)
      data.append('nombresApellidos', formData.nombresApellidos)
      data.append('curso', formData.curso)
      data.append('docente', formData.docente)

      for (let i = 0; i < archivos.length; i++) {
         data.append('archivos', archivos[i])
      }

      try {
         const response = await axios.post('http://localhost:4000/api/solicitudes', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
         })
         setTicketGenerado(response.data.ticket)
      } catch (err) {
         setError(err.response?.data?.error || 'Error al enviar la solicitud')
      } finally {
         setLoading(false)
      }
   }

   if (ticketGenerado) {
      return (
         <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>🎉 ¡Solicitud Registrada Exitosamente!</h2>
            <p>Tu número de ticket de seguimiento es:</p>
            <h1 style={{ color: '#2563eb', fontSize: '2.5rem' }}>{ticketGenerado}</h1>
            <p>Guarda este código para consultar el estado de tu impresión 3D.</p>
            <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', cursor: 'pointer' }}>
               Enviar otra solicitud
            </button>
         </div>
      )
   }

   return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
         <h2> Solicitud de Impresión 3D - UPN</h2>
         {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
         <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '12px' }}>
               <label>Código UPN:</label><br />
               <input type="text" name="codigoUpn" required onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
               <label>Nombres y Apellidos:</label><br />
               <input type="text" name="nombresApellidos" required onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
               <label>Curso:</label><br />
               <input type="text" name="curso" required onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
               <label>Docente del Curso:</label><br />
               <input type="text" name="docente" required onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
               <label>Archivos STL:</label><br />
               <input type="file" multiple accept=".stl" required onChange={handleFileChange} />
            </div>
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', width: '100%', cursor: 'pointer' }}>
               {loading ? 'Subiendo archivos a Google Drive...' : 'Enviar Solicitud'}
            </button>
         </form>
      </div>
   )
}