import { useState } from 'react'
import RegistrationForm from './components/RegistrationForm'
import PatientList from './components/PatientList'
import SearchPatients from './components/SearchPatients'

export default function App() {
  const [view, setView] = useState('register')

  return (
    <div className="container">
      <h1>Patient Registration System</h1>
      <div className="nav">
        <button onClick={() => setView('register')}>Registration</button>
        <button onClick={() => setView('list')}>Patient List</button>
        <button onClick={() => setView('search')}>Search Patients</button>
      </div>

      {view === 'register' && <RegistrationForm />}
      {view === 'list' && <PatientList />}
      {view === 'search' && <SearchPatients />}
    </div>
  )
}


