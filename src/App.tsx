import './App.css'
import { ModernNavBar } from './components/ModernNavBar'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import GasForm from './pages/GasForm'
import DaniellForm from './pages/DaniellForm'
import ImportData from './pages/ImportData'
import Analysis from './pages/Analysis'
import Prediction from './pages/Prediction'
import ModernHistory from './pages/ModernHistory'
import HowTo from './pages/HowTo'
import DataManagement from './pages/DataManagement'
import UserManagement from './pages/UserManagement'
import DOE from './pages/DOE'
import { useAuth } from './lib/auth'

function Protected({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: 24 }}>Yükleniyor...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminOnly({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: 24 }}>Yükleniyor...</div>
  if (!user?.isAdmin) return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <ModernNavBar />
      <div style={{ flex: 1, width: '100%' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/gas" element={<Protected><GasForm /></Protected>} />
          <Route path="/daniell" element={<Protected><DaniellForm /></Protected>} />
          <Route path="/import" element={<Protected><ImportData /></Protected>} />
          <Route path="/analysis" element={<Protected><AdminOnly><Analysis /></AdminOnly></Protected>} />
          <Route path="/doe" element={<Protected><DOE /></Protected>} />
          <Route path="/prediction" element={<Protected><Prediction /></Protected>} />
          <Route path="/history" element={<Protected><ModernHistory /></Protected>} />
          <Route path="/data-management" element={<Protected><DataManagement /></Protected>} />
          <Route path="/user-management" element={<Protected><UserManagement /></Protected>} />
          <Route path="/howto" element={<Protected><HowTo /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
