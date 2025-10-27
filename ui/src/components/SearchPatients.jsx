import { useState } from 'react'
import axios from 'axios'

export default function SearchPatients(){
  const [query, setQuery] = useState('')
  const [patients, setPatients] = useState([])
  const [error, setError] = useState(null)

  const search = async (by) => {
    setError(null)
    setPatients([])
    if(!query){
      setError('Enter a value to search')
      return
    }
    try{
      const param = by === 'name' ? `name=${encodeURIComponent(query)}` : `contact=${encodeURIComponent(query)}`
      const res = await axios.get(`/search?${param}`)
      setPatients(res.data || [])
    }catch(err){
      setError(err.response?.data?.error || err.message)
    }
  }

  return (
    <div>
      <h2>Search Patients</h2>
      <div className="actions">
        <input placeholder="Enter name or contact" value={query} onChange={(e)=>setQuery(e.target.value)} />
        <button onClick={()=>search('name')}>Search by Name</button>
        <button onClick={()=>search('contact')}>Search by Contact</button>
      </div>

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


