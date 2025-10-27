import { useEffect, useState } from 'react'
import axios from 'axios'

export default function PatientList(){
  const [patients, setPatients] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPatients = async () => {
      try{
        const res = await axios.get('/patients')
        setPatients(res.data || [])
      }catch(err){
        setError(err.response?.data?.error || err.message)
      }
    }
    fetchPatients()
  }, [])

  return (
    <div>
      <h2>All Patients</h2>
      {error && <div className="message" style={{ color:'crimson' }}>{error}</div>}
      <table>
        <thead>
          <tr>
            <th>patientId</th>
            <th>name</th>
            <th>age</th>
            <th>contact</th>
            <th>symptoms</th>
            <th>status</th>
            <th>processedAt</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(p => (
            <tr key={p.patientId}>
              <td>{p.patientId}</td>
              <td>{p.name}</td>
              <td>{p.age}</td>
              <td>{p.contact}</td>
              <td>{p.symptoms}</td>
              <td>{p.status}</td>
              <td>{p.processedAt ? new Date(p.processedAt).toLocaleString() : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


