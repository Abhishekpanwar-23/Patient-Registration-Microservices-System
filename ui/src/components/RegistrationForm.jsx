import { useState } from 'react'
import axios from 'axios'

export default function RegistrationForm(){
  const [form, setForm] = useState({ name:'', age:'', contact:'', symptoms:'' })
  const [status, setStatus] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus(null)
    try{
      const payload = { ...form, age: Number(form.age) }
      const res = await axios.post('/register', payload)
      setStatus({ type:'success', message:`Registered: ${res.data.patient?.patientId || 'OK'}` })
      setForm({ name:'', age:'', contact:'', symptoms:'' })
    }catch(err){
      setStatus({ type:'error', message: err.response?.data?.error || err.message })
    }
  }

  return (
    <div>
      <h2>Register Patient</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} required />
        <input name="contact" placeholder="Contact" value={form.contact} onChange={handleChange} required />
        <textarea name="symptoms" placeholder="Symptoms" value={form.symptoms} onChange={handleChange} />
        <button type="submit">Submit</button>
      </form>
      {status && (
        <div className="message" style={{ color: status.type==='error' ? 'crimson':'green' }}>
          {status.message}
        </div>
      )}
    </div>
  )
}


